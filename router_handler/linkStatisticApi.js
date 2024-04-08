const biResponse = require("../utils/biResponse")
const singleItemTaoBaoService = require("../service/singleItemTaoBaoService")
const userService = require("../service/userService")


/**
 * 获取链接操作数
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const getLinkOperationCount = async (req, res, next) => {
    try {
        const {
            productLineLeaders,
            firstLevelProductLine,
            secondLevelProductLine,
            errorItem,
            linkType,
            linkStatus,
            timeRange
        } = req.query

        const singleItems = await singleItemTaoBaoService.getAllSatisfiedSingleItems(
            productLineLeaders,
            firstLevelProductLine,
            secondLevelProductLine,
            errorItem,
            linkType,
            linkStatus,
            timeRange)

        const result = await singleItemTaoBaoService.getLinkOperationCount(
            req.params.status,
            singleItems,
            productLineLeaders)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

/**
 * 获取链接问题处理数据
 * @returns {Promise<void>}
 */
const getErrorLinkCount = async (req, res, next) => {
    try {
        const status = req.params.status
        const {
            productLineLeaders,
            firstLevelProductLine,
            secondLevelProductLine,
            errorItem,
            linkType,
            linkStatus,
            timeRange
        } = req.query

        const singleItems = await singleItemTaoBaoService.getAllSatisfiedSingleItems(
            productLineLeaders,
            firstLevelProductLine,
            secondLevelProductLine,
            errorItem,
            linkType,
            linkStatus,
            timeRange)
        const result = await singleItemTaoBaoService.getErrorLinkOperationCount(singleItems, status)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}


/**
 * 获取付费数据
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const getPaymentData = async (req, res, next) => {
    try {
        const {
            productLineLeaders,
            firstLevelProductLine,
            secondLevelProductLine,
            errorItem,
            linkType,
            linkStatus,
            timeRange
        } = req.query

        const singleItems = await singleItemTaoBaoService.getAllSatisfiedSingleItems(
            productLineLeaders,
            firstLevelProductLine,
            secondLevelProductLine,
            errorItem,
            linkType,
            linkStatus,
            timeRange)
        const result = await singleItemTaoBaoService.getPayment(singleItems)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

/**
 * 获取支付数据（数据不同付费数据，更偏向于利润所以取profit）
 * @returns {Promise<void>}
 */
const getProfitData = async (req, res, next) => {
    try {
        const {
            productLineLeaders,
            firstLevelProductLine,
            secondLevelProductLine,
            errorItem,
            linkType,
            linkStatus,
            timeRange
        } = req.query

        const singleItems = await singleItemTaoBaoService.getAllSatisfiedSingleItems(
            productLineLeaders,
            firstLevelProductLine,
            secondLevelProductLine,
            errorItem,
            linkType,
            linkStatus,
            timeRange)
        const result = await singleItemTaoBaoService.getProfitData(singleItems)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

/**
 * 获取市场占有率数据
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const getMarketRatioData = async (req, res, next) => {
    try {
        const {
            productLineLeaders,
            firstLevelProductLine,
            secondLevelProductLine,
            errorItem,
            linkType,
            linkStatus,
            timeRange
        } = req.query

        const singleItems = await singleItemTaoBaoService.getAllSatisfiedSingleItems(
            productLineLeaders,
            firstLevelProductLine,
            secondLevelProductLine,
            errorItem,
            linkType,
            linkStatus,
            timeRange)
        const result = await singleItemTaoBaoService.getMarketRatioData(singleItems)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getLinkOperationCount,
    getErrorLinkCount,
    getPaymentData,
    getProfitData,
    getMarketRatioData
}