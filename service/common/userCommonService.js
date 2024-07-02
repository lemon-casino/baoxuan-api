const redisRepo = require("@/repository/redisRepo")
const NotFoundError = require("@/error/http/notFoundError")
const whiteList = require("@/config/whiteList")

const isDeptLeaderOfTheUser = async (userId, deptId) => {
    if (whiteList.pepArr().includes(userId)) {
        return true
    }

    const users = await redisRepo.getAllUsersDetail()
    const user = users.find(item => item.userid === userId)
    if (!user) {
        throw new NotFoundError(`根据userId：${userId}未在Redis中找到用户信息`)
    }
    const userDept = user.leader_in_dept.find(item => item.dept_id === deptId)
    if (!userDept) {
        throw new NotFoundError(`未在userId：${userId}的信息中找到部门：${deptId}，用户可能不属于该部门`)
    }
    return userDept.leader
}

module.exports = {
    isDeptLeaderOfTheUser
}