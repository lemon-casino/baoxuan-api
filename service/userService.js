const UsersModel = require("../model/users");
const redisService = require("../service/redisService")
const departmentService = require("../service/departmentService")
const userRepo = require("../repository/userRepo")
const whiteList = require("../config/whiteList")
const globalGetter = require("../global/getter")

const getDingDingUserId = (user_id) => {
    return new Promise((resolve, reject) => {
        UsersModel.findOne({
            where: {
                user_id: user_id,
            },
        })
            .then((res) => {
                resolve(res.dataValues.dingding_user_id);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

const getUsersOfDepartment = async (departmentId) => {
    const usersOfDepartments = redisService.getUsersWithJoinLaunchDataUnderDepartment()
    for (const usersOfDepartment of usersOfDepartments) {
        if (usersOfDepartment.dept_id === departmentId) {
            return usersOfDepartment
        }
    }
    return null;
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
        throw new Error("没有找到您所在的部门信息")
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

module.exports = {
    getDingDingUserId,
    getUsersOfDepartment,
    getUserDetails,
    getUserSelfOrPartnersOfDepartment
}