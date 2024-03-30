const singleItemTaoBaoService = require('../service/singleItemTaoBaoService')
const biResponse = require("../utils/biResponse")

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
 * 获取淘宝单品表数据
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const getTaoBaoSingleItems = async (req, res, next) => {
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
        const result = await singleItemTaoBaoService.getTaoBaoSingleItems(
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
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    saveSingleItemTaoBao,
    deleteSingleIteTaoBaoByBatchIdAndLinkId,
    getTaoBaoSingleItems,
    getSearchDataTaoBaoSingleItem,
    getSingleItemDetails
}