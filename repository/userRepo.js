const models = require('@/model');
const usersModel = models.usersModel
const usersTagsModel = models.usersTagsModel
const globalGetter = require("@/global/getter")
const UserError = require("@/error/userError")
const NotFoundError = require("@/error/http/notFoundError")
const departmentRepo = require("./departmentRepo")
const sequelizeUtil = require("@/utils/sequelizeUtil")
const innerGroupConst = require("@/const/tmp/innerGroupConst")
const objectConvertUtil = require("@/utils/objectConvertUtil")
const whiteList = require("@/config/whiteList")

usersModel.hasMany(usersTagsModel, {
    sourceKey: "dingdingUserId",
    foreignKey: "userId",
    as: "tags"
})

const getUserDetails = async (where) => {
    const details = await usersModel.findAll({
        where
    })

    const data = sequelizeUtil.extractDataValues(details)
    if (data && data.length > 0) {
        return data[0]
    } else {
        throw new UserError("用户不存在")
    }
}

const getAllUsersWithoutPrivateFields = async (where) => {
    let users = await usersModel.findAll({
        attributes: {exclude: ["password", "dingdingUserId", "userPic"]},
        where
    })
    return users.map(user => user.get({plain: true}))
}

const getAllUsers = async (where) => {
    let users = await usersModel.findAll({
        where
    })
    return users.map(user => user.get({plain: true}))
}

const getEnabledUsers = async () => {
    const users = await getAllUsersWithoutPrivateFields({status: 1})
    return users
}

/**
 * 根据用户的身份获取部门中的人员信息: 管理员-部门主管-管理员-普通员工
 * @param userDDId
 * @param deptId
 * @returns {Promise<*|*[]|void>}
 */
const getDepartmentUsers = async (userDDId, deptId) => {
    // 处理管理员-部门主管-普通人员
    const departmentUsers = await departmentRepo.getDepartmentUsers(deptId)
    objectConvertUtil.map(departmentUsers, {"userid": "userDDId", "name": "userName"})
    if (whiteList.pepArr().includes(userDDId.toString())) {
        return departmentUsers
    }

    const users = await globalGetter.getUsers()
    const tmpUsers = users.filter(user => {
        return user.userid.toString() === userDDId.toString()
    })
    objectConvertUtil.map(tmpUsers, {"userid": "userDDId", "name": "userName"})

    if (tmpUsers.length === 0) {
        throw new NotFoundError(`在Redis(base:users)中未找员工${userDDId}的信息`)
    }
    const user = tmpUsers[0]
    const department = await departmentRepo.getDepartmentDetails(deptId)
    if (!department) {
        throw new NotFoundError(`在Redis(base:departments)中未找部门${deptId}的信息`)
    }

    const tmpUserDepartments = user.leader_in_dept.filter(dept => dept.dept_id.toString() === deptId.toString())
    if (tmpUserDepartments.length === 0) {
        throw new NotFoundError(`用户:${user.userName}不在${department.name}中`)
    }
    // 用户在该部门中是什么角色
    const isLeader = tmpUserDepartments[0].leader
    if (isLeader) {
        return departmentUsers
    }

    let innerGroups = []
    for (const key of Object.keys(innerGroupConst)) {
        if (innerGroupConst[key].deptId === deptId) {
            innerGroups = innerGroupConst[key].group
            break
        }
    }

    // 处理内部组的情况
    for (const innerGroup of innerGroups) {
        const innerGroupUser = innerGroup.members.filter(member => member.userDDId === userDDId)
        if (innerGroupUser.length > 0 && innerGroupUser[0].isLeader) {
            return innerGroup.members
        }
        if (innerGroupUser.length > 0) {
            return innerGroupUser
        }
    }

    return [user]
}

/**
 * 根据在职人员将库中的其他人员设置为离职
 *
 * @param onJobUserIds
 * @returns {Promise<void>}
 */
const updateUserResignByOnJobUserIds = async (onJobUserIds) => {
    await usersModel.update(
        {
            isResign: true,
            updateTime: new Date()
        },
        {
            where: {dingdingUserId: {"$notIn": onJobUserIds}}
        }
    )
}

/**
 * 保存用户信息
 *
 * @param user
 * @returns {Promise<void>}
 */
const saveUser = async (user) => {
    await usersModel.create(user);
}


const updateUserResignInfo = async (user) => {
    const result = await usersModel.update(user,
        {
            where: {dingdingUserId: user.dingdingUserId}
        }
    )
    return result
}

/**
 * 获取全部离职人员信息
 *
 * @returns {Promise<*>}
 */
const getAllResignUsers = async () => {
    const resignUsers = await usersModel.findAll({where: {isResign: true}})
    return resignUsers.map(item => item.get({plain: true}))
}

/**
 * 获取部门下离职人员的详情
 *
 * @param deptId
 * @returns {Promise<<Model[]>>}
 */
const getDeptResignUsers = async (deptId) => {
    const deptUsers = await models.deptsUsersModel.findAll({
        where: {deptId}
    })
    const deptUserIds = deptUsers.map(item => item.userId)
    const deptResignUsers = await usersModel.findAll({
        where: {
            dingdingUserId: {$in: deptUserIds},
            isResign: true
        }
    })
    return sequelizeUtil.extractDataValues(deptResignUsers)
}

const getUsersWithTagsByUsernames = async (usernames) => {
    const result = await usersModel.findAll({
        where: {nickname: {$in: usernames}},
        include: [
            {model: usersTagsModel, as: "tags"}
        ]
    })
    return result
}

module.exports = {
    getUserDetails,
    getAllUsers,
    getAllUsersWithoutPrivateFields,
    getEnabledUsers,
    getDepartmentUsers,
    updateUserResignByOnJobUserIds,
    saveUser,
    updateUserResignInfo,
    getAllResignUsers,
    getDeptResignUsers,
    getUsersWithTagsByUsernames
}