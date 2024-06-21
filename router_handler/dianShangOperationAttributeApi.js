const dianShangOperationAttributeService = require("../service/dianShangOperationAttributeService")
const joiUtil = require("../utils/joiUtil")
const biResponse = require("../utils/biResponse")

const getPagingOperateAttributes = async (req, res, next) => {
    try {
        const {
            deptId,
            // 前端页码从1开始好处理
            page,
            pageSize,
            goodsName: productLine,
            operator: operatorName,
            goodsId: linkId,
            platform,
            shopName,
            skuId
        } = req.query
        joiUtil.validate({
            page, pageSize,
            deptId: {value: deptId, schema: joiUtil.commonJoiSchemas.required},
            platform: {value: platform, schema: joiUtil.commonJoiSchemas.required}
        })
        const result = await dianShangOperationAttributeService.getPagingOperateAttributes(
            deptId,
            Math.max(parseInt(page) - 1, 0),
            parseInt(pageSize),
            productLine,
            operatorName,
            linkId,
            platform,
            shopName,
            skuId)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getProductAttrDetails = async (req, res, next) => {
    try {
        const {id} = req.query
        joiUtil.validate({id})
        const result = await dianShangOperationAttributeService.getProductAttrDetails(id)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const updateProductAttrDetails = async (req, res, next) => {
    try {
        const body = req.body
        await dianShangOperationAttributeService.updateProductAttrDetails(body)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const saveProductAttrDetails = async (req, res, next) => {
    try {
        const body = req.body
        await dianShangOperationAttributeService.saveProductAttr(body)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const deleteProductAttr = async (req, res, next) => {
    try {
        const {id} = req.query
        joiUtil.validate({id})
        await dianShangOperationAttributeService.deleteProductAttr(id)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getPagingOperateAttributes,
    getProductAttrDetails,
    saveProductAttrDetails,
    updateProductAttrDetails,
    deleteProductAttr
}