const models = require('@/model')
const outUsersModel = models.outUsersModel
const sequelizeUtil = require("@/utils/sequelizeUtil")

const getOutUsers = async (where = {}) => {
    const outUsers = await outUsersModel.findAll({
        where,
        order: [["createTime", "desc"]]
    })
    return sequelizeUtil.extractDataValues(outUsers)
}

const updateOutUsers = async (id, data) => {
    return (await outUsersModel.update(data, {where: {id}}))
}

const saveOutUser = async (data) => {
    return (await outUsersModel.create(data))
}

module.exports = {
    saveOutUser,
    getOutUsers,
    updateOutUsers
}
