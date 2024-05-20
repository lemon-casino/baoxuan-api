const models = require('../model')
const commonRepo = require("./commonRepo")

const getPagingMarketDataTmData = async (pageIndex, pageSize, startDate, endDate) => {
    const where = {
        date: {$between: [startDate, endDate]}
    }
    const order = [["date", "asc"]];
    const pagingData = await commonRepo.getPagingData(models.marketDataTmModel, pageIndex, pageSize, where, order)
    return pagingData
}

module.exports = {
    getPagingMarketDataTmData
}
