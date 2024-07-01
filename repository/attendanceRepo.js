const models = require('@/model')
const pagingUtil = require("@/utils/pagingUtil")

models.attendanceModel.belongsTo(
    models.usersModel,
    {
        foreignKey: "userId",
        targetKey: "dingdingUserId",
        as: "user",

    }
)

const save = async (model) => {
    const result = await models.attendanceModel.create(model)
    return result
}

const getPagingAttendance = async (pageIndex, pageSize, where = {}) => {
    pageIndex = parseInt(pageIndex)
    pageSize = parseInt(pageSize)

    const result = await models.attendanceModel.findAndCountAll({
        where,
        offset: pageIndex * pageSize,
        limit: pageSize,
        order: [["userCheckTime", "desc"]],
        include: {
            attributes: ["username", "nickname"],
            model: models.usersModel,
            as: "user"
        }
    })
    return pagingUtil.defaultPaging(result, pageSize)
}

module.exports = {
    save,
    getPagingAttendance
}