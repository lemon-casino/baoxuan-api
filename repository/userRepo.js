const sequelize = require('../model/init');
const getUsersModel = require("../model/usersMode")
const userModel = getUsersModel(sequelize)
const sequelizeUtil = require("../utils/sequelizeUtil")
const UserError = require("../error/userError")

const getUserDetails = async (userId) => {

    const details = await userModel.findAll({
        where: {userId}
    })

    const data = sequelizeUtil.extractDataValues(details)
    if (data && data.length > 0) {
        return data[0]
    } else {
        throw new UserError("用户不存在")
    }
}

const getAllUsers = async () => {
    const users = await userModel.findAll({
        attributes: {exclude: ["password", "dingdingUserId", "userPic", "status"]},
        where: {
            status: 1
        }
    })
    return users
}

module.exports = {
    getUserDetails,
    getAllUsers
}