const models = require('../model');
const commonRepo = require("./commonRepo")

const getPagingPddSingleItems = async (pageIndex, pageSize, startDate, endDate) => {
    const where = {
        date: {$between: [startDate, endDate]}
    }
    const order = [["linkId", "asc"], ["date", "asc"]]
    const pagingData = await commonRepo.getPagingData(models.singleItemPddModel, pageIndex, pageSize, where, order)
    return pagingData
}

module.exports = {
    getPagingPddSingleItems
}
