const sequelize = require('../model/init');
const getRoleMenuModel = require("../model/rolesMenusModel")
const roleMenuModel = getRoleMenuModel(sequelize)

const getMenusByRoles = async (roleIds) => {
    roleMenuModel.findAll({
        where: {
            roleId: roleIds
        }
    })
}

module.exports = {
    getMenusByRoles
}