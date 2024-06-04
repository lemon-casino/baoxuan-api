const models = require('../model');
const globalGetter = require("../global/getter")
const UserError = require("../error/userError")
const NotFoundError = require("../error/http/notFoundError")
const departmentRepo = require("../repository/departmentRepo")
const sequelizeUtil = require("../utils/sequelizeUtil")
const dingDingReq = require("../core/dingDingReq")
const innerGroupConst = require("../const/tmp/innerGroupConst")
const whiteList = require("../config/whiteList")

const getUserDetails = async (where) => {
    const details = await models.usersModel.findAll({
        where
    })

    const data = sequelizeUtil.extractDataValues(details)
    if (data && data.length > 0) {
        return data[0]
    } else {
        throw new UserError("用户不存在")
    }
}

const getAllUsers = async (where) => {
    const users = await models.usersModel.findAll({
        attributes: {exclude: ["password", "dingdingUserId", "userPic"]},
        where
    })
    return users
}

const getEnabledUsers = async () => {
    const users = await getAllUsers({status: 1})
    return users
}

/**
 * 根据用户的身份获取部门中的人员信息: 管理员-部门主管-管理员-普通员工
 * @param userDDId
 * @param deptId
 * @returns {Promise<*|*[]|void>}
 */
const getDepartmentUsers = async (userDDId, deptId) => {
    // 处理管理员-部门主管-普通组员
    const departmentUsers = await departmentRepo.getDepartmentUsers(deptId)
    if (whiteList.pepArr().includes(userDDId)) {
        return departmentUsers
    }

    const users = await globalGetter.getUsers()
    const tmpUsers = users.filter(user => user.userid === userDDId)
    if (tmpUsers.length === 0) {
        throw new NotFoundError(`在Redis(base:users)中未找员工${userDDId}的信息`)
    }
    const user = tmpUsers[0]
    const department = await departmentRepo.getDepartmentDetails(deptId)
    if (!department) {
        throw new NotFoundError(`在Redis(base:departments)中未找部门${deptId}的信息`)
    }

    const tmpUserDepartments = user.leader_in_dept.filter(dept => dept.dept_id.toString() === deptId)
    if (tmpUserDepartments.length === 0) {
        throw new NotFoundError(`用户:${user.name}不在${department.name}中`)
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
        const innerGroupUser = innerGroup.members.filter(member => member.userId === userDDId)
        if (innerGroupUser.length > 0 && innerGroupUser[0].leader) {
            return innerGroup.members
        }
        if (innerGroupUser.length > 0) {
            return [innerGroupUser]
        }
    }

    // 用户在该部门中是什么角色
    const isLeader = tmpUserDepartments[0].leader
    if (isLeader) {
        return departmentUsers
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
    await models.usersModel.update(
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
    await models.usersModel.create(user);
}

const getResignEmployees = async (token) => {
    // 分页获取所有离职人员id列表
    const getPagingResignEmployees = async (token, nextToken) => {
        let {
            nextToken: dNextToken,
            hasMore,
            userIdList: allResignEmployees
        } = await dingDingReq.getResignEmployees(token, nextToken)

        if (hasMore) {
            const data = await getPagingResignEmployees(token, dNextToken)
            allResignEmployees = allResignEmployees.concat(data)
        }
        return allResignEmployees
    }
    let allResignEmployees = await getPagingResignEmployees(token, 0)

    let allResignEmployeesDetails = []
    while (allResignEmployees.length > 0) {
        // 根据ids获取人员离职详情，单次最大支持50
        const pagingResignEmployees = allResignEmployees.splice(0, 50)
        const usersResignInfo = await dingDingReq.getResignInfo(token, pagingResignEmployees)
        allResignEmployeesDetails = allResignEmployeesDetails.concat(usersResignInfo.result)
    }
    return allResignEmployeesDetails
}

const updateUserResignInfo = async (user) => {
    const result = await models.usersModel.update(user,
        {
            where: {dingdingUserId: user.dingdingUserId}
        }
    )
    return result
}

module.exports = {
    getUserDetails,
    getAllUsers,
    getEnabledUsers,
    getDepartmentUsers,
    updateUserResignByOnJobUserIds,
    saveUser,
    getResignEmployees,
    updateUserResignInfo
}