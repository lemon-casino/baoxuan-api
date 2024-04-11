const pagingUtil = require("../utils/pagingUtil")

const getPagingData = async (model, pageIndex, pageSize, where, order) => {
    const satisfiedCount = await model.count({
        where
    })
    let data = await model.findAll({
        offset: pageIndex * pageSize,
        limit: pageSize,
        where,
        order
    })
    const result = pagingUtil.paging(Math.ceil(satisfiedCount / pageSize), satisfiedCount, data)
    return result
}

module.exports = {
    getPagingData
}