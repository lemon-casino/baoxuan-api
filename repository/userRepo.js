const models = require('@/model');
const usersModel = models.usersModel
const usersTagsModel = models.usersTagsModel
const tagsModel = models.tagsModel
const deptsUsersModel = models.deptsUsersModel
const rolesModel = models.rolesModel
const usersRolesModel = models.usersRolesModel

const globalGetter = require("@/global/getter")
const UserError = require("@/error/userError")
const NotFoundError = require("@/error/http/notFoundError")
const departmentRepo = require("./departmentRepo")
const sequelizeUtil = require("@/utils/sequelizeUtil")
const pagingUtil = require("@/utils/pagingUtil")
const innerGroupConst = require("@/const/tmp/innerGroupConst")
const objectConvertUtil = require("@/utils/objectConvertUtil")
const whiteList = require("@/config/whiteList")
const UsersModel = require("@/model/users")
const { query } = require('../model/dbConn')

usersModel.hasMany(usersTagsModel, {
    sourceKey: "dingdingUserId", foreignKey: "userId", as: "tags"
})

usersModel.belongsToMany(rolesModel, {
        through: {
            model: usersRolesModel
        },
        foreignKey: 'userId',
        otherKey: 'roleId',
        as: "roles"
    }
)

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
        attributes: {exclude: ["password", "dingdingUserId", "userPic"]}, where
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
 * 保存用户信息
 *
 * @param user
 * @returns {Promise<void>}
 */
const saveUser = async (user) => {
    await usersModel.create(user);
}


const updateUserResignInfo = async (user) => {
    const result = await usersModel.update(user, {
        where: {dingdingUserId: user.dingdingUserId}
    })
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
 * @param deptIds
 * @returns {Promise<<Model[]>>}
 */
const getDeptResignUsers = async (deptIds) => {
    const deptResignedUsers = await getDeptUsers(deptIds, {isResign: true})
    return sequelizeUtil.extractDataValues(deptResignedUsers)
}

/**
 * 获取部门在职人员信息
 *
 * @param deptIds
 * @returns {Promise<*>}
 */
const getDeptOnJobUsers = async (deptIds) => {
    const deptResignedUsers = await getDeptUsers(deptIds, {isResign: false})
    return sequelizeUtil.extractDataValues(deptResignedUsers)
}

/**
 * 获取部门下的用户信息
 *
 * @param deptIds
 * @param where
 * @returns {Promise<*>}
 */
const getDeptUsers = async (deptIds, where) => {
    const deptUsers = await deptsUsersModel.findAll({where: {deptId: {$in: deptIds}}})
    const deptUserIds = deptUsers.map(item => item.userId)
    
    const tmpWhere = {dingdingUserId: {$in: deptUserIds}, ...where}
    const deptResignUsers = await usersModel.findAll({
        attributes: {exclude: ["password"]}, where: tmpWhere, include: [{model: usersTagsModel, as: "tags"}]
    })
    
    return sequelizeUtil.extractDataValues(deptResignUsers)
}

const getUsersWithTagsByUsernames = async (usernames) => {
    const result = await usersModel.findAll({
        attributes: {exclude: ["password"]},
        where: {nickname: {$in: usernames}},
        include: [{model: usersTagsModel, as: "tags"}]
    })
    return sequelizeUtil.extractDataValues(result)
}

const getUserWithTags = async (userId) => {
    const result = await usersModel.findOne({
        attributes: {exclude: ["password"]},
        where: {dingdingUserId: userId},
        include: [{
            model: usersTagsModel, as: "tags",
            include: [
                {model: tagsModel, as: "tag"}
            ]
        }]
    })
    return sequelizeUtil.extractDataValues(result)
}

const getUsersByTagCodes = async (tagCodes) => {
    const result = await usersModel.findAll({
        attributes: {exclude: ["password"]},
        include: [{model: usersTagsModel, as: "tags", where: {tagCode: {$in: tagCodes}}}]
    })
    return sequelizeUtil.extractDataValues(result)
}

const getPagingUsers = async (deptIds, pageIndex, pageSize, nickname, status) => {
    
    const depsUsers = await deptsUsersModel.findAll({
        // where: {deptId: {$in: deptIds}}
    })
    const userIds = depsUsers.map(item => item.userId)
    
    let where = {dingdingUserId: {$in: userIds}}
    if (nickname) where.nickname = {$like: `%${nickname}%`}
    if (status) where.status = {$eq: status}
    
    const result = await usersModel.findAndCountAll({
        attributes: {exclude: ["password"]},
        include: [
            {model: rolesModel, as: "roles"},
            {
                model: usersTagsModel, as: "tags",
                include: [
                    {model: tagsModel, as: "tag"}
                ]
            }
        ],
        distinct: true,
        offset: pageIndex * pageSize,
        limit: pageSize,
        where: where,
        order: [["status", "desc"], ["create_time", "desc"]]
    })
    return pagingUtil.defaultPaging(result, pageSize)
}

const getUsersByIds = async (userIds) => {
    const users = await UsersModel.findAll({
        where: {dingding_user_id: {$in: userIds}}
    })
    return sequelizeUtil.extractDataValues(users)
}

const undoResign = async (userId) => {
    await usersModel.update(
        {
            status: 1,
            isResign: false,
            preStatus: null,
            handoverUserId: null,
            handoverUserName: null,
            resignStatus: null,
            voluntaryReason: null,
            lastWorkDay: null
        },
        {where: {dingdingUserId: userId}}
    )
}

const getUsersByTagCodesAndNickname = async (nicknames, tagCodes, orderById) => {
    let sql = `SELECT u.user_id AS id, ut.user_id, t.tag_code, t.tag_name, u.nickname 
        FROM users u JOIN users_tags ut ON u.dingding_user_id = ut.user_id
        JOIN tags t ON ut.tag_code = t.tag_code
        WHERE u.nickname IN (${nicknames.map(() => '?').join(',')}) 
            AND t.tag_code IN (${tagCodes.map(() => '?').join(',')})
            AND u.status = 1`
    if (orderById) sql = `${sql} ORDER BY u.user_id`
    else sql = `${sql} ORDER BY t.tag_code`
    const result = await query(sql, [...nicknames, ...tagCodes])
    return result
}

const getUsersWithTagsByTagCodes = async (tagCodes) => {
    let sql = `SELECT u.user_id AS id, ut.user_id, t.tag_code, t.tag_name, u.nickname 
        FROM users u JOIN users_tags ut ON u.dingding_user_id = ut.user_id
        JOIN tags t ON ut.tag_code = t.tag_code
        WHERE t.tag_code IN (${tagCodes.map(() => '?').join(',')})
            AND u.status = 1`
    const result = await query(sql, tagCodes)
    return result
}

const getUserByDingdingUserId = async (dingding_user_id) => {
    let sql = `SELECT user_id AS id, nickname FROM users 
        WHERE dingding_user_id = ?
            AND status = 1`
    const result = await query(sql, [dingding_user_id])
    return result
}

const getUserByDeptName = async (dept_name) => {
    const sql = `SELECT u.user_id, u.nickname, u.dingding_user_id FROM users u 
        LEFT JOIN depts_users du ON du.user_id = u.dingding_user_id 
        LEFT JOIN depts d ON d.dept_id = du.dept_id
        WHERE d.dept_name = ? AND u.is_resign = 0 AND u.status = 1`
    const result = await query(sql, [dept_name])
    return result
}

const getMobileByUserId = async (user_id) => {
    const sql = `SELECT username AS mobile FROM users WHERE user_id = ?`
    const result = await query(sql, [user_id])
    return result?.length ? result[0].mobile : null
}

const getUserWithDeptByDingdingUserId = async (user_id) => {
    const sql = `SELECT u.nickname, d.dept_name FROM users u 
        JOIN depts_users du ON du.user_id = u.dingding_user_id 
        JOIN depts d ON d.dept_id = du.dept_id 
        WHERE u.dingding_user_id = ? LIMIT 1`
    const result = await query(sql, [user_id])
    return result?.length ? result[0] : null
}

module.exports = {
    getUsersByTagCodes,
    getUserWithTags,
    getPagingUsers,
    getUserDetails,
    getAllUsers,
    getAllUsersWithoutPrivateFields,
    getEnabledUsers,
    getDepartmentUsers,
    saveUser,
    updateUserResignInfo,
    getAllResignUsers,
    getDeptOnJobUsers,
    getDeptResignUsers,
    getUsersWithTagsByUsernames,
    getUsersByIds,
    undoResign,
    getUsersByTagCodesAndNickname,
    getUsersWithTagsByTagCodes,
    getUserByDingdingUserId,
    getUserByDeptName,
    getMobileByUserId,
    getUserWithDeptByDingdingUserId
}