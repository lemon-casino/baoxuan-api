const models = require('../model')

const getRoleByUserId = async (userId) => {
    const roles = await models.userRoleModel.findAll({
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