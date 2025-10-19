const joiUtil = require("../utils/joiUtil")
const biResponse = require("../utils/biResponse")
const analysisPlanService = require("@/service/analysisPlan/analysisPlanService")
const analysisPlanGroupService = require("@/service/analysisPlan/analysisPlanGroupService")
const rivalsService = require("@/service/analysisPlan/rivalsService")
const moment = require('moment')
const ExcelJS = require('exceljs')
const formidable = require("formidable")
const fs = require('fs')
const rivalsKeywordsService = require("@/service/analysisPlan/rivalsKeywordsService")
const rivalsSkuService = require("@/service/analysisPlan/rivalsSkuService")
const newMap = function(datum) {
    if (datum === '') {
        return null;
    }
    datum = datum.trim()
    return datum;
}
const analysisPlanApi = {}

analysisPlanApi.getAnalysisPlanRelationByGoods = async (req, res, next) => {
    try {
        result = await analysisPlanService.getRelationByGoodsId(req.query, req.user.id)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}
analysisPlanApi.createAnalysisPlanRelationByGoods = async (req, res, next) => {
    try {
        result = await analysisPlanService.createRelationByGoodsId(req.body)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}
analysisPlanApi.getAnalysisPlan = async (req, res, next) => {
    try {
        result = await analysisPlanService.get(req.query, req.user.id)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}
analysisPlanApi.createAnalysisPlan = async (req, res, next) => {
    try {
        result = await analysisPlanService.create(req.body, req.user.id)
        if (result) return res.send(biResponse.success())
        else return res.send(biResponse.createFailed())
    } catch (e) {
        next(e)
    }
}
analysisPlanApi.updateAnalysisPlan = async (req, res, next) => {
    try {
        result = await analysisPlanService.update(req.body, req.user.id)
        if (result) return res.send(biResponse.success())
        else return res.send(biResponse.updateFailed())
    } catch (e) {
        next(e)
    }
}
analysisPlanApi.deleteAnalysisPlan = async (req, res, next) => {
    try {
        result = await analysisPlanService.delete(req.body)
        if (result) return res.send(biResponse.success())
        else return res.send(biResponse.deleteFailed())
    } catch (e) {
        next(e)
    }
}
analysisPlanApi.getGroup = async (req, res, next) => {
    try {
        const {plan_id} = req.query
        joiUtil.validate({
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        result = await analysisPlanGroupService.get(req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}
analysisPlanApi.createGroup = async (req, res, next) => {
    try {
        const {data, plan_id} = req.body
        joiUtil.validate({
            data: {value: data, schema: joiUtil.commonJoiSchemas.required},
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.required},
        })
        result = await analysisPlanGroupService.create(req.body)
        if (result) return res.send(biResponse.success())
        else return res.send(biResponse.createFailed('分组名称,商品ID为必填项'))
    } catch (e) {
        next(e)
    }
}
analysisPlanApi.getRivals = async (req, res, next) => {
    try {
        const {plan_id} = req.query
        joiUtil.validate({
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        result = await rivalsService.get(req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}
analysisPlanApi.createRivals = async (req, res, next) => {
    try {
        const {data, plan_id} = req.body
        joiUtil.validate({
            data: {value: data, schema: joiUtil.commonJoiSchemas.required},
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.required},
        })
        result = await rivalsService.create(req.body)
        if (result) return res.send(biResponse.success())
        else return res.send(biResponse.createFailed('商品名称,商品ID,类目,店铺名称,店铺类型为必填项'))
    } catch (e) {
        next(e)
    }
}
analysisPlanApi.getSpecificRivals = async (req, res, next) => {
    try {
        const {plan_id} = req.query
        joiUtil.validate({
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        result = await rivalsKeywordsService.get(req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}
analysisPlanApi.createSpecificRivals = async (req, res, next) => {
    try {
        const {data, plan_id} = req.body
        joiUtil.validate({
            data: {value: data, schema: joiUtil.commonJoiSchemas.required},
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.required},
        })
        result = await rivalsKeywordsService.create(req.body)
        if (result) return res.send(biResponse.success())
        else return res.send(biResponse.createFailed('商品ID,关键词为必填项'))
    } catch (e) {
        next(e)
    }
}
analysisPlanApi.getSku = async (req, res, next) => {
    try {
        const {plan_id} = req.query
        joiUtil.validate({
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        result = await rivalsSkuService.get(req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}
analysisPlanApi.createSku = async (req, res, next) => {
    try {
        const {data, plan_id} = req.body
        joiUtil.validate({
            data: {value: data, schema: joiUtil.commonJoiSchemas.required},
            plan_id: {value: plan_id, schema: joiUtil.commonJoiSchemas.required},
        })
        result = await rivalsSkuService.create(req.body)
        if (result) return res.send(biResponse.success())
        else return res.send(biResponse.createFailed('商品ID,SKU名称为必填项'))
    } catch (e) {
        next(e)
    }
}
analysisPlanApi.fileUpload = async (req, res, next) => {
    try {
        let form = new formidable.IncomingForm()
        form.uploadDir = "./public/avatar/bpm"
        fs.mkdirSync(form.uploadDir, { recursive: true })
        form.keepExtensions = true
        form.parse(req, async function (error, fields, files) {
            if (error) {
                return res.send(biResponse.canTFindIt)
            }
            
            const file = files.file
            let result = await analysisPlanService.fileUpload(file)
            return res.send(biResponse.success(result))
        })
    } catch (e) {
        next(e)
    }
}

analysisPlanApi.wangEditorUpload = async (req, res, next) => {
    try {
        let form = new formidable.IncomingForm()
        form.uploadDir = "./public/avatar/bpm"
        fs.mkdirSync(form.uploadDir, { recursive: true })
        form.keepExtensions = true
        form.parse(req, async function (error, fields, files) {
            if (error) {
                return res.send(biResponse.canTFindIt)
            }
            
            const file = files.file
            let result = await analysisPlanService.wangEditorUpload(file)
            return res.send(biResponse.success(result))
        })
    } catch (e) {
        next(e)
    }
}
module.exports = analysisPlanApi