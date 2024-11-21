const joiUtil = require("../utils/joiUtil")
const biResponse = require("../utils/biResponse")
const operationService = require("../service/operationService")
const operationSchema = require("../schema/operationSchema")
const moment = require('moment')
const ExcelJS = require('exceljs')
const formidable = require("formidable")
const fs = require('fs')

const getDataStats = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(operationSchema.requiredDateSchema, req.query)
        const startDate = moment(req.query.startDate).format('YYYY-MM-DD')
        const endDate = moment(req.query.endDate).format('YYYY-MM-DD')
        const result = await operationService.getDataStats(req.user.id, startDate, endDate, req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getGoodsInfo = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(operationSchema.requiredDataSchema, req.query)
        const startDate = moment(req.query.startDate).format('YYYY-MM-DD')
        const endDate = moment(req.query.endDate).format('YYYY-MM-DD')
        const result = await operationService.getGoodsInfo(startDate, endDate, req.query, req.user.id)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const importGoodsInfo = async (req, res, next) => {
    try {
        let form = new formidable.IncomingForm()
        form.uploadDir = "./public/excel"
        fs.mkdirSync(form.uploadDir, { recursive: true })
        form.keepExtensions = true
        form.parse(req, async function (error, fields, files) {
            if (error) {
                return res.send(biResponse.canTFindIt)
            }
            
            const file = files.file
            const date = file.originalFilename.split('.')[0].split('_')
            const time = date[2]
            const newPath = `${form.uploadDir}/${moment().valueOf()}-${file.originalFilename}`
            fs.renameSync(file.filepath, newPath, (err) => {  
                if (err) throw err
            })
            const workbook = new ExcelJS.Workbook()
            let readRes = await workbook.csv.readFile(newPath)
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let rows = worksheet.getRows(1, worksheet.rowCount)
                let result = await operationService.importGoodsInfo(rows, time)
                if (result) {
                    fs.rmSync(newPath)
                } else {
                    return res.send(biResponse.createFailed())
                }
            }
            return res.send(biResponse.success())
        })
    } catch (e) {
        next(e)
    }
}

const importGoodsKeyWords = async (req, res, next) => {
    try {
        let form = new formidable.IncomingForm()
        form.uploadDir = "./public/excel"
        fs.mkdirSync(form.uploadDir, { recursive: true })
        form.keepExtensions = true
        form.parse(req, async function (error, fields, files) {
            if (error) {
                return res.send(biResponse.canTFindIt)
            }
            
            const file = files.file
            const date = file.originalFilename.split('.')[0].split('_')
            const time = date[1]
            const newPath = `${form.uploadDir}/${moment().valueOf()}-${file.originalFilename}`
            fs.renameSync(file.filepath, newPath, (err) => {  
                if (err) throw err
            })
            const workbook = new ExcelJS.Workbook()
            let readRes = await workbook.xlsx.readFile(newPath)
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let rows = worksheet.getRows(1, worksheet.rowCount)
                let result = await operationService.importGoodsKeyWords(rows, time)
                if (result) {
                    fs.rmSync(newPath)
                } else {
                    return res.send(biResponse.createFailed())
                }
            }
            return res.send(biResponse.success())
        })
    } catch (e) {
        next(e)
    }
}

const importGoodsDSR = async (req, res, next) => {
    try {
        let form = new formidable.IncomingForm()
        form.uploadDir = "./public/excel"
        fs.mkdirSync(form.uploadDir, { recursive: true })
        form.keepExtensions = true
        form.parse(req, async function (error, fields, files) {
            if (error) {
                return res.send(biResponse.canTFindIt)
            }
            
            const file = files.file
            const date = file.originalFilename.split('.')[0].split('_')
            const time = date[1]
            const newPath = `${form.uploadDir}/${moment().valueOf()}-${file.originalFilename}`
            fs.renameSync(file.filepath, newPath, (err) => {  
                if (err) throw err
            })
            const workbook = new ExcelJS.Workbook()
            let readRes = await workbook.xlsx.readFile(newPath)
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let rows = worksheet.getRows(1, worksheet.rowCount)
                let result = await operationService.importGoodsDSR(rows, time)
                if (result) {
                    fs.rmSync(newPath)
                } else {
                    return res.send(biResponse.createFailed())
                }
            }
            return res.send(biResponse.success())
        })
    } catch (e) {
        next(e)
    }
}

const getGoodsLineInfo = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(operationSchema.requiredDataSchema, req.query)
        const startDate = moment(req.query.startDate).format('YYYY-MM-DD')
        const endDate = moment(req.query.endDate).format('YYYY-MM-DD')
        const result = await operationService.getGoodsLineInfo(startDate, endDate, req.query, req.user.id)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getGoodsInfoDetail = async (req, res, next) => {
    try {
        const {goods_id, startDate, endDate} = req.query
        joiUtil.validate({
            column: {value: req.params.column, schema: joiUtil.commonJoiSchemas.strRequired},
            goods_id: {value: goods_id, schema: joiUtil.commonJoiSchemas.strRequired},
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired}
        })
        const start = moment(req.query.startDate).format('YYYY-MM-DD')
        const end = moment(req.query.endDate).format('YYYY-MM-DD')
        const result = await operationService.getGoodsInfoDetail(req.params.column, goods_id, start, end)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getWorkStats = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(operationSchema.requiredDateSchema, req.query)
        const startDate = moment(req.query.startDate).format('YYYY-MM-DD')
        const endDate = moment(req.query.endDate).format('YYYY-MM-DD') + ' 23:59:59'
        const result = await operationService.getWorkStats(req.user, startDate, endDate, req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getDataStats,
    getGoodsInfo,
    getGoodsLineInfo,
    importGoodsInfo,
    importGoodsKeyWords,
    importGoodsDSR,
    getGoodsInfoDetail,
    getWorkStats
}