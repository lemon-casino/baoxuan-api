const models = require('@/model')
const deptsUsersModel = models.deptsUsersModel
const sequelizeUtil = require("@/utils/sequelizeUtil")

const save = async (deptId, userId) => {
    try {
        return await deptsUsersModel.create({deptId, userId})
    } catch (e) {
        if (e.original.code !== "ER_DUP_ENTRY") {
            throw e
        }
        return true
    }
}

const remove = async (deptId, userId) => {
    try {
        const result = await deptsUsersModel.destroy({
            truncate: true, // 明确指定清空表
            cascade: true
        });
        
        return result > 0;
    } catch (e) {
        throw e;
    }
}

const updateInvalidInfo = async (deptId, userIds) => {
    return await deptsUsersModel.update(
        {isValid: false, invalidDate: new Date()},
        {where: {deptId, userId: {$notIn: userIds}}}
    )
}

const findAll = async (where = {}) => {
    const result = await deptsUsersModel.findAll(where)
    return sequelizeUtil.extractDataValues(result)
}

const getByDeptIds = async (deptIds) => {
    const where = {deptId: {$in: deptIds}}
    return (await findAll(where))
}

module.exports = {
    save,
    updateInvalidInfo,
    getByDeptIds,
    remove
}