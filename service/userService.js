const UsersModel = require("../model/users");
const redisService = require("../service/redisService")
const departmentService = require("../service/departmentService")
const userRepo = require("../repository/userRepo")
const whiteList = require("../config/whiteList")
const globalGetter = require("../global/getter")
const NotFoundError = require("../error/http/notFoundError")
const tmpTMInnerGroupingConst = require("../const/tmp/tmInnerGroupingConst")
const visionInnerGroupingConst = require("../const/tmp/visionInnerGroupingConst")

const getDingDingUserId = async (user_id) => {
    const user = await UsersModel.findOne({
        where: {
            user_id: user_id,
        },
    })
    if (user) {
        return user.dataValues.dingding_user_id
    }
    throw new NotFoundError("用户不存在")
};

const getUsersOfDepartment = async (departmentId) => {
    const usersOfDepartments = await redisService.getUsersUnderDepartment()
    let department = null
    for (const usersOfDepartment of usersOfDepartments) {
        department = departmentService.findMatchedDepartmentFromRoot(departmentId, usersOfDepartment)
        if (department){
            break
        }
    }
    if (department) {
        return department.dep_user
    }
    throw new NotFoundError(`未找到部门：${departmentId}的信息`)
}

/**
 * 根据userid判断是返回个人还是部门下的小伙伴(领导角色)
 * @param ddUserId
 * @param deptId
 * @returns {Promise<[{name, userid}]>}
 */
const getUserSelfOrPartnersOfDepartment = async (ddUserId, deptId) => {
    // 判断该用户时候有访问权限： 仅有部门领导和管理员可以查看
    const usersWithDepartment = await globalGetter.getUsers()
    let userWithDepartment = usersWithDepartment.filter((user) => user.userid === ddUserId)

    if (!userWithDepartment || userWithDepartment.length === 0) {
        throw new NotFoundError("没有找到您所在的部门信息")
    }
    userWithDepartment = userWithDepartment[0]
    const isLeaderOfTM = userWithDepartment.leader_in_dept.filter((dept) => {
        return dept.dept_id === deptId && dept.leader
    }).length > 0
    // 默认获取个人
    let users = [{name: userWithDepartment.name, userid: usersWithDepartment.userid}]
    // leader: 获取部门下所有人的统计信息
    if (isLeaderOfTM || whiteList.pepArr().includes(ddUserId)) {
        users = await departmentService.getUsersOfDepartment(deptId)
    }
    return users
}

/**
 * 获取用户详情
 * @param id
 * @returns {Promise<*>}
 */
const getUserDetails = async (id) => {
    const details = await userRepo.getUserDetails(id)
    return details
}

/**
 * 获取用户可以查看基于内部分组的人员信息
 * @param userId
 * @returns {Promise<[{[p: string]: *}]|*[]>}
 */
const getTMInnerGroups = async (userId) => {
    const innerGroup = await getInnerGroups(userId, "903075138", "天猫组", tmpTMInnerGroupingConst.tmInnerGroupVersion2)
    return innerGroup
}

/**
 * 获取视觉部的内部分组信息
 * @param userId
 * @returns {Promise<*[]|[*]|[{[p: string]: *}]|[]>}
 */
const getVisionInnerGroups = async (userId) => {
    const innerGroup = await getInnerGroups(userId, "482162119", "视觉部", visionInnerGroupingConst.visionInnerGroup)
    return innerGroup
}

const getInnerGroups = async (userId, deptId, deptName, innerGroup) => {
    let isLeader = false
    let currentUser = []
    const userDDId = await getDingDingUserId(userId)
    if (whiteList.pepArr().includes(userDDId)) {
        isLeader = true
    } else {
        const departments = await departmentService.getDepartmentOfUser(userDDId)
        if (departments.length === 0) {
            throw NotFoundError(`未找到用户：${userDDId}的部门信息`)
        }
        for (const dept of departments) {
            if (dept.dep_detail.name === deptName && dept.leader) {
                isLeader = true
                break
            }
        }
        const department = await departmentService.getDepartmentWithUsers(deptId)
        if (!isLeader) {
            currentUser = department.dep_user.filter(user => user.userid === userDDId)
            if (currentUser.length === 0) {
                throw NotFoundError(`未找到用户：${userDDId}在${deptName}下的详细信息`)
            }
        }
    }

    const groupingResult = await reGrouping(deptId, innerGroup)

    // 部门主管和管理员返回所有分组信息
    if (isLeader) {
        return groupingResult
    }

    for (const grouping of groupingResult) {
        for (const member of grouping.members) {
            if (currentUser.length > 0 && currentUser[0].name === member.userName) {
                if (member.isLeader) {
                    return [grouping]
                }
                return [{
                    ...grouping,
                    members: grouping.members.filter(member => currentUser[0].name === member.userName)
                }]
            }
        }
    }
    return []
}

const reGrouping = async (deptId, selfDefinedInnerGroup) => {

    const groupingResult = []

    const department = await departmentService.getDepartmentWithUsers(deptId)
    const hasGroupedUsers = []
    const noGroupedUsers = []
    for (const innerGroup of selfDefinedInnerGroup) {
        const currentGroupUsers = []
        for (const member of innerGroup.members) {
            currentGroupUsers.push(member)
            hasGroupedUsers.push(member.userName)
        }
        groupingResult.push({
            groupCode: innerGroup.groupCode,
            groupName: innerGroup.groupName,
            members: currentGroupUsers
        })
    }

    for (const user of department.dep_user) {
        if (hasGroupedUsers.includes(user.name)) {
            continue
        }
        noGroupedUsers.push({userName: user.name})
    }
    groupingResult.push({groupCode: "noGroup", groupName: "未分组", members: noGroupedUsers})

    return groupingResult
}

module.exports = {
    getDingDingUserId,
    getUsersOfDepartment,
    getUserDetails,
    getUserSelfOrPartnersOfDepartment,
    getTMInnerGroups,
    getVisionInnerGroups
}