const biResponse = require("../utils/biResponse")
const singleItemTaoBaoService = require("../service/singleItemTaoBaoService")
const dateUtil = require("../utils/dateUtil")
const joiUtil = require("../utils/joiUtil")

/**
 * 获取链接操作数: 获取库中最新一天的链接操作数据
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const getLinkOperationCount = async (req, res, next) => {
    try {
        let {productLineLeaders} = req.query
        joiUtil.validate({id: productLineLeaders})
        productLineLeaders = JSON.parse(productLineLeaders)
        const latestSingleItems = await singleItemTaoBaoService.getLatestBatchIdRecords(1)
        const latestDate = latestSingleItems[0]["batchId"]
        const timeRange = [dateUtil.startOfDay(latestDate), dateUtil.endOfDay(latestDate)]
        const singleItems = await singleItemTaoBaoService.getAllSatisfiedSingleItems(
            productLineLeaders,
            null,
            null,
            null,
            null,
            null,
            timeRange)

        const uniqueSingleItems = await singleItemTaoBaoService.getUniqueSingleItems(singleItems)
        const result = await singleItemTaoBaoService.getLinkOperationCount(
            req.params.status,
            uniqueSingleItems,
            productLineLeaders)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

/**
 * 获取链接问题处理数据: 固定统计昨天的
 * @returns {Promise<void>}
 */
const getErrorLinkCount = async (req, res, next) => {
    try {
        const status = req.params.status
        const {productLineLeaders} = req.query

        const latestSingleItems = await singleItemTaoBaoService.getLatestBatchIdRecords(1)
        const latestDate = latestSingleItems[0]["batchId"]
        const timeRange = [dateUtil.startOfDay(latestDate), dateUtil.endOfDay(latestDate)]

        const singleItems = await singleItemTaoBaoService.getAllSatisfiedSingleItems(
            JSON.parse(productLineLeaders),
            null,
            null,
            null,
            null,
            null,
            timeRange
        )
        const uniqueSingleItems = singleItemTaoBaoService.getUniqueSingleItems(singleItems)
        const result = await singleItemTaoBaoService.getErrorLinkOperationCount(uniqueSingleItems, status)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getLinkOperationCount,
    getErrorLinkCount
}