const sequelize = require('../model/init');
const getUserRoleModel = require("../model/usersRolesModel")
const userRoleModel = getUserRoleModel(sequelize)

const getRoleByUserId = async (userId) => {
    const roles = await userRoleModel.findAll({
        where: {userId}
    })
    if (!roles) {
        return null
    }
    let newRoles = []
    for (const role of roles) {
        newRoles = newRoles.concat(role.dataValues);
    }
    return newRoles
}

module.exports = {getRoleByUserId}