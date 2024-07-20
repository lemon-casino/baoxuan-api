const bcrypt = require("bcryptjs")
const UsersModel = require("@/model/users");
const redisRepo = require("@/repository/redisRepo")
const departmentService = require("@/service/departmentService")
const userRepo = require("@/repository/userRepo")
const tagsRepo = require("@/repository/tagsRepo")
const whiteList = require("@/config/whiteList")
const globalGetter = require("@/global/getter")
const NotFoundError = require("@/error/http/notFoundError")
const innerGroups = require("@/const/tmp/innerGroupConst")
const {errorCodes} = require("@/const/errorConst")
const {isDeptLeaderOfTheUser} = require("@/service/common/userCommonService");

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
    const usersOfDepartments = await redisRepo.getUsersUnderDepartment()
    let department = null
    for (const usersOfDepartment of usersOfDepartments) {
        department = departmentService.findMatchedDepartmentFromRoot(departmentId, usersOfDepartment)
        if (department) {
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
    const isLeader = userWithDepartment.leader_in_dept.filter((dept) => {
        return dept.dept_id === deptId && dept.leader
    }).length > 0
    // 默认获取个人
    let users = [{name: userWithDepartment.name, userid: usersWithDepartment.userid}]
    // leader: 获取部门下所有人的统计信息
    if (isLeader || whiteList.pepArr().includes(ddUserId)) {
        users = await departmentService.getUsersOfDepartment(deptId)
    }
    return users
}

/**
 * 获取用户详情
 * @param id
 * @returns {Promise<*>}
 */
const getUserDetails = async (where) => {
    const details = await userRepo.getUserDetails(where)
    return details
}

/**
 * 获取用户的分页数据
 *
 * @param deptIds
 * @param pageIndex
 * @param pageSize
 * @param nickname
 * @param status
 * @returns {Promise<*>}
 */
const getPagingUsers = async (deptIds, pageIndex, pageSize, nickname, status) => {
    return (await userRepo.getPagingUsers(deptIds, pageIndex, pageSize, nickname, status))
}

const getTaggedInnerGroupUsers = async (userId, deptIds, innerGroupTagPrefix, innerGroupLeaderTagCode) => {
    const result = []
    let innerGroupTags = []
    let onJobUsers = []

    const isLeader = await isDeptLeaderOfTheUser(userId, deptIds)
    if (isLeader) {
        innerGroupTags = await tagsRepo.getTags({tagCode: {$like: `%${innerGroupTagPrefix}%`}})
        onJobUsers = await userRepo.getDeptOnJobUsers(deptIds)

        const hasInnerGroupUserIds = []
        for (const tmInnerGroupTag of innerGroupTags) {
            const tmpGroupResult = {groupCode: tmInnerGroupTag.tagCode, groupName: tmInnerGroupTag.tagName, members: []}
            const currTagUsers = onJobUsers.filter(user => {
                return user.tags.filter(tag => tag.tagCode === tmInnerGroupTag.tagCode).length > 0
            })
            for (const user of currTagUsers) {
                hasInnerGroupUserIds.push(user.dingdingUserId)
                const leaderTag = user.tags.find(tag => tag.tagCode === innerGroupLeaderTagCode)
                tmpGroupResult.members.push({
                    userName: user.nickname,
                    userDDId: user.dingdingUserId,
                    isLeader: !!leaderTag
                })
            }
            result.push(tmpGroupResult)
        }

        // 未分组的用户
        const dontHasInnerGroupUsers = onJobUsers.filter(user => !hasInnerGroupUserIds.includes(user.dingdingUserId))
        const tmpGroupResult = {groupCode: "noGroup", groupName: "未分组", members: []}
        for (const user of dontHasInnerGroupUsers) {
            tmpGroupResult.members.push({userName: user.nickname, userDDId: user.dingdingUserId, isLeader: false})
        }
        result.push(tmpGroupResult)
    }
    // 非部门领导或管理员
    else {
        const user = await userRepo.getUserWithTags(userId)
        const userInnerGroupTag = user.tags.find(tag => tag.tagCode.includes(innerGroupTagPrefix))
        if (userInnerGroupTag) {
            const groupResult = {
                groupCode: userInnerGroupTag.tagCode,
                groupName: userInnerGroupTag.tag.tagName,
                members: []
            }

            // 如果是内部组组长，要获取该组的其他组员
            const innerGroupLeader = !!user.tags.find(tag => tag.tagCode === innerGroupLeaderTagCode)
            if (innerGroupLeader) {
                const relatedTagUsers = await userRepo.getUsersByTagCodes([userInnerGroupTag.tagCode])
                for (const sameTagUser of relatedTagUsers) {
                    groupResult.members.push({
                        userName: sameTagUser.nickname,
                        userDDId: sameTagUser.dingdingUserId,
                        isLeader: sameTagUser.dingdingUserId === userId
                    })
                }
                result.push(groupResult)
            }
            // 普通组员
            else {
                groupResult.members.push({userName: user.nickname, userDDId: user.dingdingUserId, isLeader: false})
                result.push(groupResult)
            }
        }
        // 未分组
        else {
            const tmpGroupResult = {
                groupCode: "noGroup",
                groupName: "未分组",
                members: [
                    {userName: user.nickname, userDDId: user.dingdingUserId, isLeader: false}
                ]
            }
            result.push(tmpGroupResult)
        }
    }
    return result
}

/**
 * 获取用户可以查看基于内部分组的人员信息
 * @param userId
 * @returns {Promise<[{[p: string]: *}]|*[]>}
 */
const getTMInnerGroups = async (userId) => {
    return (await getTaggedInnerGroupUsers(userId, ["903075138"], "tmInnerGroup:", "tmInnerGroupLeader"))
}

/**
 * 获取视觉部的内部分组信息
 *
 * @param userId
 * @returns {Promise<*[]|[*]|[{[p: string]: *}]|[]>}
 */
const getVisionInnerGroups = async (userId) => {
    return (await getTaggedInnerGroupUsers(userId, ["482162119", "933412643"], "hz:vision:", "hz:innerGroupLeader"))
}

const getInnerGroups = async (userId, deptIds) => {
    let isLeader = false
    let currentUser = []
    const userDDId = await getDingDingUserId(userId)
    if (whiteList.pepArr().includes(userDDId)) {
        isLeader = true
    } else {
        const departments = await departmentService.getDepartmentOfUser(userDDId)
        if (departments.length === 0) {
            throw new NotFoundError(`未找到用户：${userDDId}的部门信息`)
        }

        for (const dept of departments) {
            if (deptIds.includes(dept.dep_detail.dept_id.toString()) && dept.leader) {
                isLeader = true
                break
            }
        }

        if (!isLeader) {
            let userInDept = false
            for (const deptId of deptIds) {
                const department = await departmentService.getDepartmentWithUsers(deptId)
                currentUser = department.dep_user.filter(user => user.userid === userDDId)
                if (currentUser.length > 0) {
                    userInDept = true
                    break
                }
            }
            if (!userInDept) {
                throw new NotFoundError(`未找到用户：${userDDId}在${deptIds}下的详细信息`)
            }
        }
    }

    let innerGroup = []
    for (const groupKey of Object.keys(innerGroups)) {
        if (deptIds.includes(innerGroups[groupKey].deptId)) {
            innerGroup = innerGroups[groupKey].group
            break
        }
    }

    let groupingResult = []
    for (const deptId of deptIds) {
        const tmpGroupingResult = await reGrouping(deptId, innerGroup)
        groupingResult = groupingResult.concat(tmpGroupingResult)
    }

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

const getEnabledUsers = async () => {
    const users = await userRepo.getEnabledUsers();
    return users
}

/**
 * 同步用户信息： 保存新用户、离职的职位离职状态
 *
 * @returns {Promise<void>}
 */
const syncUserToDB = async (usersInRedis) => {
    // 新人入库
    for (const user of usersInRedis) {
        const newUser = {
            username: user.mobile,
            dingdingUserId: user.userid,
            password: bcrypt.hashSync("123456", 10),
            nickname: user.name,
            email: "",
            status: 1,
            createTime: new Date(),
            updateTime: new Date(),
            isResign: 0
        }
        try {
            await userRepo.getUserDetails({dingdingUserId: user.userid})
        } catch (e) {
            if (e.code === errorCodes.userError) {
                await userRepo.saveUser(newUser)
            }
        }
    }
}

const getDingDingUserIdAndNickname = async () => {
    try {

        return await UsersModel.findAll({
            attributes: ['dingding_user_id', 'nickname'],
            raw: true,
            logging: false
        });

    } catch (error) {
        throw new Error('查询数据失败');
    }
}


module.exports = {
    getDingDingUserId,
    getUsersOfDepartment,
    getUserDetails,
    getUserSelfOrPartnersOfDepartment,
    getTMInnerGroups,
    getVisionInnerGroups,
    getPagingUsers,
    getEnabledUsers,
    syncUserToDB,
    getDingDingUserIdAndNickname
}