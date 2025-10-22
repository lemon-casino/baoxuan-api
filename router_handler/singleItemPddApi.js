const singleItemPddService = require('../service/singleItemPddService')
const biResponse = require("../utils/biResponse")
const joiUtil = require("../utils/joiUtil")

const getPagingPddSingleItems = async (req, res, next) => {
    try {
        const {
            pageIndex,
            pageSize,
            startDate,
            endDate
        } = req.query
        joiUtil.validate({pageIndex, pageSize, startDate, endDate})

        const result = await singleItemPddService.getPagingPddSingleItems(parseInt(pageIndex), parseInt(pageSize), startDate, endDate)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getPagingPddSingleItems
}
