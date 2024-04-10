const singleItemTaoBaoService = require('../service/singleItemTaoBaoService')
const biResponse = require("../utils/biResponse")
const joiUtil = require("../utils/joiUtil")


const saveSingleItemTaoBao = async (req, res, next) => {
    try {
        const item = req.body
        await singleItemTaoBaoService.saveSingleItemTaoBao(item)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const deleteSingleIteTaoBaoByBatchIdAndLinkId = async (req, res, next) => {
    try {
        const {id, batchId, linkId} = req.query

        if (batchId) {
            await singleItemTaoBaoService.deleteSingleIteTaoBaoByBatchIdAndLinkId(batchId, linkId)
            return res.send(biResponse.success())
        }
        if (id) {
            // todo:根据需要补充
            return res.send(biResponse.success())
        }
        return res.send(biResponse.format("500", "仅提供基于id和batchId的删除操作"))
    } catch (e) {
        next(e)
    }
}


/**
 * 获取淘宝单品表数据： 同时汇总付费数据、支付数据、市场占有率
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const getTaoBaoSingleItemsWithStatistic = async (req, res, next) => {
    try {
        const {
            pageIndex,
            pageSize,
            productLineLeaders,
            firstLevelProductLine,
            secondLevelProductLine,
            errorItem,
            linkType,
            linkStatus,
            timeRange
        } = req.query

        joiUtil.validate({pageIndex, pageSize})
        const result = await singleItemTaoBaoService.getTaoBaoSingleItemsWithStatistic(
            pageIndex,
            pageSize,
            productLineLeaders,
            firstLevelProductLine,
            secondLevelProductLine,
            errorItem,
            linkType,
            linkStatus,
            timeRange)

        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

/**
 * 获取淘宝单品表中的查询条件需要的数据
 * @param req
 * @param res
 * @param next
 * @returns {Promise<{linkStatuses: *[], errorItems: *[], linkTypes: *[], operationLeaders: *[], firstLevelLines: *[], secondLevelLines: *[]}>}
 */
const getSearchDataTaoBaoSingleItem = async (req, res, next) => {
    try {
        const result = await singleItemTaoBaoService.getSearchDataTaoBaoSingleItem(req.user.id)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

/**
 * 获取单品表详情数据
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const getSingleItemDetails = async (req, res, next) => {
    try {
        const id = req.params.id
        const result = await singleItemTaoBaoService.getSingleItemById(id)
        const data = singleItemTaoBaoService.attachPercentageTagToField(result)
        return res.send(biResponse.success(data))
    } catch (e) {
        next(e)
    }
}

/**
 * 获取单品表中最新的入库时间
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const getLatest = async (req, res, next) => {
    try {
        const data = await singleItemTaoBaoService.getLatestBatchIdRecords(1)
        let latestDate = new Date().toDateString()
        if (data && data.length > 0) {
            latestDate = data[0].batchId
        }
        return res.send(biResponse.success(latestDate))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    saveSingleItemTaoBao,
    deleteSingleIteTaoBaoByBatchIdAndLinkId,
    getTaoBaoSingleItemsWithStatistic,
    getSearchDataTaoBaoSingleItem,
    getSingleItemDetails,
    getLatest
}