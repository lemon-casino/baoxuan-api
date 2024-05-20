const models = require('../model')

const getMenusByRoles = async (roleIds) => {
    await models.rolesMenusModel.findAll({
        where: {
            roleId: roleIds
        }
    })
}

module.exports = {
    getMenusByRoles
}