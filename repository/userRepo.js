const sequelize = require('../model/init');
const getUsersModel = require("../model/usersMode")
const userModel = getUsersModel(sequelize)
const sequelizeUtil = require("../utils/sequelizeUtil")

const getUserDetails = async (userId) => {

    const details = await userModel.findAll({
        where: {userId}
    })

    const data = sequelizeUtil.extractDataValues(details)
    if (data && data.length > 0) {
        return data[0]
    } else {
        throw new Error("用户不存在")
    }
}

module.exports = {getUserDetails}