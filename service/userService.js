const UsersModel = require("../model/users");
const redisService = require("../service/redisService")

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

module.exports = {
    getDingDingUserId,
    getUsersOfDepartment
}