const marketDataTmService = require('../service/marketDataTmService')
const biResponse = require("../utils/biResponse")
const joiUtil = require("../utils/joiUtil")

const getPagingMarketDataTmData = async (req, res, next) => {
    try {
        const {
            pageIndex,
            pageSize,
            startDate,
            endDate
        } = req.query
        joiUtil.validate({pageIndex, pageSize, startDate, endDate})

        const result = await marketDataTmService.getPagingMarketDataTmData(parseInt(pageIndex), parseInt(pageSize), startDate, endDate)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getPagingMarketDataTmData
}
