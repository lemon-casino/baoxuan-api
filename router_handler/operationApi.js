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
            const time = date[1]
            const newPath = `${form.uploadDir}/${moment().valueOf()}-${file.originalFilename}`
            fs.renameSync(file.filepath, newPath, (err) => {  
                if (err) throw err
            })
            const workbook = new ExcelJS.Workbook()
            let readRes = await workbook.csv.readFile(newPath)
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let info = []
                let rows = worksheet.getRows(2, worksheet.rowCount - 1)
                
                let count = 0                   
                for (let i = 0; i < worksheet.rowCount - 1; i++) {
                    let row = rows[i]
                    
                    if (row.getCell(1).value) {
                        info.push(row.getCell(1).value ?? '') 
                        info.push(typeof(row.getCell(2).value) == 'string' ? row.getCell(2).value.trim() : '') 
                        info.push(typeof(row.getCell(65).value) == 'string' ? row.getCell(65).value.trim() : '') 
                        info.push(row.getCell(66).value ?? '') 
                        info.push(typeof(row.getCell(3).value) == 'string' ? row.getCell(3).value.trim() : '')                        
                        info.push(time)
                        info.push(row.getCell(31).value ?? 0)
                        count = count + 1
                    }
                }
                if (count > 0) {
                    let row = await operationService.importGoodsSalesInfo(count, info)
                    if (row) {
                        fs.rmSync(newPath)
                    } else {
                        return res.send(biResponse.createFailed())
                    }
                } else {
                    fs.rmSync(newPath)
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
    getWorkStats
}