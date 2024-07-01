const models = require('@/model')

const save = async (deptId, userId) => {
    try {
        return await models.deptsUsersModel.create({deptId, userId})
    } catch (e) {
        if (e.original.code !== "ER_DUP_ENTRY") {
            throw e
        }
        return true
    }
}

const updateInvalidInfo = async (deptId, userIds) => {
    return await models.deptsUsersModel.update(
        {isValid: false, invalidDate: new Date()},
        {where: {deptId, userId: {$notIn: userIds}}}
    )
}

module.exports = {
    save,
    updateInvalidInfo
}