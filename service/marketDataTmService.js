const marketDataTmRepo = require("../repository/marketDataTmRepo")

/**
 * 获取天猫日常市场数据
 * @param pageIndex
 * @param pageSize
 * @param startTime
 * @param endTime
 * @returns {Promise<{pageCount: *, total: *, data: *}>}
 */
const getPagingMarketDataTmData = async (pageIndex, pageSize, startDate, endDate) => {
    return marketDataTmRepo.getPagingMarketDataTmData(pageIndex, pageSize, startDate, endDate)
}

module.exports = {getPagingMarketDataTmData}