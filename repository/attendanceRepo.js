const models = require('../model')
const pagingUtil = require("../utils/pagingUtil");

const save = async (model) => {
    const result = await models.attendanceModel.create(model)
    return result
}

const getPagingAttendance = async (pageIndex, pageSize, where = {}) => {
    const result = await models.attendanceModel.findAndCountAll({
        where,
        offset: pageIndex * pageSize,
        limit: pageSize,
        order: [["createTime", "desc"]]
    })
    return pagingUtil.defaultPaging(result, pageSize)
}

module.exports = {
    save,
    getPagingAttendance
}