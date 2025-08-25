const joiUtil = require("../utils/joiUtil")
const biResponse = require("../utils/biResponse")
const moment = require('moment')
const ExcelJS = require('exceljs')
const formidable = require("formidable")
const fs = require('fs')
const specificPlanService = require("@/service/specificPlan/specificPlanService")
const spKeywordsService = require("@/service/specificPlan/spKeywordsService")
const spSkuService = require("@/service/specificPlan/spSkuService")
const spVisionService = require("@/service/specificPlan/spVisionService")
const spMainPicService = require("@/service/specificPlan/spMainPicService")
const spDirectPicService = require("@/service/specificPlan/spDirectService")
const spMainVideoService = require("@/service/specificPlan/spMainVideoService")
const spAnalysisService = require("@/service/specificPlan/spAnalysisService")
const spSalesPredictService = require("@/service/specificPlan/spSalesPredictService")
const spDetailPicService = require("@/service/specificPlan/spDetailService")
const newMap = function(datum) {
    if (datum === '') {
        return null;
    }
    datum = datum.trim()
    return datum;
}
const specificPlanApi = {}

specificPlanApi.getSpecificPlan = async (req, res, next) => {
    try {
        result = await specificPlanService.get(req.query, req.user.id)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}
specificPlanApi.createSpecificPlan = async (req, res, next) => {
    try {
        result = await specificPlanService.create(req.body, req.user.id)
        if (result) return res.send(biResponse.success())
        else return res.send(biResponse.createFailed())
    } catch (e) {
        next(e)
    }
}
specificPlanApi.updateSpecificPlan = async (req, res, next) => {
    try {
        result = await specificPlanService.update(req.body, req.user.id)
        if (result) return res.send(biResponse.success())
        else return res.send(biResponse.updateFailed())
    } catch (e) {
        next(e)
    }
}
specificPlanApi.deleteSpecificPlan = async (req, res, next) => {
    try {
        result = await specificPlanService.delete(req.body)
        if (result) return res.send(biResponse.success())
        else return res.send(biResponse.deleteFailed())
    } catch (e) {
        next(e)
    }
}
specificPlanApi.getKeywords = async (req, res, next) => {
    try {
        const {plan_id} = req.query
        joiUtil.validate({
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        result = await spKeywordsService.get(req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}
specificPlanApi.createKeywords = async (req, res, next) => {
    try {
        const {data, plan_id} = req.body
        joiUtil.validate({
            data: {value: data, schema: joiUtil.commonJoiSchemas.required},
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.required},
        })
        result = await spKeywordsService.create(req.body)
        if (result) return res.send(biResponse.success())
        else return res.send(biResponse.createFailed('链接标题,刷单关键词,竞店名称,关键词为必填项'))
    } catch (e) {
        next(e)
    }
}
specificPlanApi.getSku = async (req, res, next) => {
    try {
        const {plan_id} = req.query
        joiUtil.validate({
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        result = await spSkuService.get(req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}
specificPlanApi.createSku = async (req, res, next) => {
    try {
        const {data, plan_id} = req.body
        joiUtil.validate({
            data: {value: data, schema: joiUtil.commonJoiSchemas.required},
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.required},
        })
        result = await spSkuService.create(req.body)
        if (result) return res.send(biResponse.success())
        else return res.send(biResponse.createFailed('竞店名称,竞店SKU,竞品图片,竞品价格,竞品占比,SKU为必填项'))
    } catch (e) {
        next(e)
    }
}
specificPlanApi.getVision = async (req, res, next) => {
    try {
        const {plan_id} = req.query
        joiUtil.validate({
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        result = await spVisionService.get(req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}
specificPlanApi.createVision = async (req, res, next) => {
    try {
        const {data, plan_id} = req.body
        joiUtil.validate({
            data: {value: data, schema: joiUtil.commonJoiSchemas.required},
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.required},
        })
        result = await spVisionService.create(req.body)
        if (result) return res.send(biResponse.success())
        else return res.send(biResponse.createFailed('竞店名称,卖点为必填项'))
    } catch (e) {
        next(e)
    }
}
specificPlanApi.getMainPic = async (req, res, next) => {
    try {
        const {plan_id} = req.query
        joiUtil.validate({
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        result = await spMainPicService.get(req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}
specificPlanApi.createMainPic = async (req, res, next) => {
    try {
        const {data, plan_id} = req.body
        joiUtil.validate({
            data: {value: data, schema: joiUtil.commonJoiSchemas.required},
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.required},
        })
        result = await spMainPicService.create(req.body)
        if (result) return res.send(biResponse.success())
        else return res.send(biResponse.createFailed())
    } catch (e) {
        next(e)
    }
}
specificPlanApi.getDirectPic = async (req, res, next) => {
    try {
        const {plan_id} = req.query
        joiUtil.validate({
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        result = await spDirectPicService.get(req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}
specificPlanApi.createDirectPic = async (req, res, next) => {
    try {
        const {data, plan_id} = req.body
        joiUtil.validate({
            data: {value: data, schema: joiUtil.commonJoiSchemas.required},
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.required},
        })
        result = await spDirectPicService.create(req.body)
        if (result) return res.send(biResponse.success())
        else return res.send(biResponse.createFailed())
    } catch (e) {
        next(e)
    }
}
specificPlanApi.getDetailPic = async (req, res, next) => {
    try {
        const {plan_id} = req.query
        joiUtil.validate({
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        result = await spDetailPicService.get(req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}
specificPlanApi.createDetailPic = async (req, res, next) => {
    try {
        const {data, plan_id} = req.body
        joiUtil.validate({
            data: {value: data, schema: joiUtil.commonJoiSchemas.required},
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.required},
        })
        result = await spDetailPicService.create(req.body)
        if (result) return res.send(biResponse.success())
        else return res.send(biResponse.createFailed())
    } catch (e) {
        next(e)
    }
}
specificPlanApi.getMainVideo = async (req, res, next) => {
    try {
        const {plan_id} = req.query
        joiUtil.validate({
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        result = await spMainVideoService.get(req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}
specificPlanApi.createMainVideo = async (req, res, next) => {
    try {
        const {data, plan_id} = req.body
        joiUtil.validate({
            data: {value: data, schema: joiUtil.commonJoiSchemas.required},
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.required},
        })
        result = await spMainVideoService.create(req.body)
        if (result) return res.send(biResponse.success())
        else return res.send(biResponse.createFailed())
    } catch (e) {
        next(e)
    }
}
specificPlanApi.getAnalysis = async (req, res, next) => {
    try {
        const {plan_id} = req.query
        joiUtil.validate({
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        result = await spAnalysisService.get(req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}
specificPlanApi.createAnalysis = async (req, res, next) => {
    try {
        const {data, plan_id} = req.body
        joiUtil.validate({
            data: {value: data, schema: joiUtil.commonJoiSchemas.required},
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.required},
        })
        result = await spAnalysisService.create(req.body)
        if (result) return res.send(biResponse.success())
        else return res.send(biResponse.createFailed('流量方案,销售目标,日期,竞店名称,竞品名称,SKU为必填项'))
    } catch (e) {
        next(e)
    }
}
specificPlanApi.getSales = async (req, res, next) => {
    try {
        const {plan_id} = req.query
        joiUtil.validate({
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        result = await spSalesPredictService.get(req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}
specificPlanApi.createSales = async (req, res, next) => {
    try {
        const {data, plan_id} = req.body
        joiUtil.validate({
            data: {value: data, schema: joiUtil.commonJoiSchemas.required},
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.required},
        })
        result = await spSalesPredictService.create(req.body)
        if (result) return res.send(biResponse.success())
        else return res.send(biResponse.createFailed())
    } catch (e) {
        next(e)
    }
}
module.exports = specificPlanApi