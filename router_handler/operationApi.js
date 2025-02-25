const joiUtil = require("../utils/joiUtil")
const biResponse = require("../utils/biResponse")
const operationService = require("../service/operationService")
const downloadInfoService = require('../service/downloadInfoService')
const operationSchema = require("../schema/operationSchema")
const moment = require('moment')
const ExcelJS = require('exceljs')
const XLSX = require('xlsx')
const formidable = require("formidable")
const fs = require('fs')
const iconv = require("iconv-lite")
const crypto = require('crypto')
const AdmZip = require('adm-zip')
const path = require('path')
const newMap = function(datum) {
    if (datum === '') {
        return null;
    }
    datum = datum.trim()
    return datum;
}

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

const getDataStatsDetail = async (req, res, next) => {
    try {
        const {type, name, startDate, endDate, stats} = req.query
        joiUtil.validate({
            column: {value: req.params.column, schema: joiUtil.commonJoiSchemas.strRequired},
            type: {value: type, schema: joiUtil.commonJoiSchemas.strRequired},
            name: {value: name, schema: joiUtil.commonJoiSchemas.strRequired},
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired},
        })
        const start = moment(req.query.startDate).format('YYYY-MM-DD')
        const end = moment(req.query.endDate).format('YYYY-MM-DD')
        const result = await operationService.getDataStatsDetail(type, name, req.params.column, start, end, stats, req.user)
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
        let result
        if (req.query.export) {            
            const uploadDir = `./public/excel/${req.user.id}`
            fs.mkdirSync(uploadDir, { recursive: true })
            let info = `${JSON.stringify(req.query)}`
            let key = crypto.createHash('md5').update(info).digest('hex')
            const name = `${startDate}_${endDate}_${key}`
            const path = `${uploadDir}/${name}.xlsx`
            await downloadInfoService.insert(req.user.id, name, path, req.query)
            new Promise(async (resolve, reject) => {
                const workbook = new ExcelJS.Workbook('Sheet1')
                const worksheet = workbook.addWorksheet()
                logger.info(`user: ${req.user.id}, file: ${path} start`)
                result = await operationService.getGoodsInfo(startDate, endDate, req.query, req.user.id)
                let columns = []
                for (let i = 0; i < result.column.length; i++) {
                    if (result.column[i].sub?.length) {
                        for (let j = 0; j < result.column[i].sub.length; j++) {
                            columns.push({
                                header: result.column[i].sub[j].title,
                                key: result.column[i].sub[j].field_id,
                            })
                        }
                    } else if (result.column[i].field_id != 'operate')
                        columns.push({
                            header: result.column[i].title,
                            key: result.column[i].field_id,
                        })
                }
                worksheet.columns = columns
                for (let i = 0; i < result.data.data.length; i++) {                           
                    worksheet.addRow(result.data.data[i])
                }
                const buffer = await workbook.xlsx.writeBuffer()
                fs.writeFileSync(path, buffer)
                await downloadInfoService.update(req.user.id, name, 1)
                logger.info(`user: ${req.user.id}, file: ${path} end`)
                resolve(true)
            })     
            return res.send(biResponse.success())
        } else {
            result = await operationService.getGoodsInfo(startDate, endDate, req.query, req.user.id)
        }
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
            let readRes = await workbook.csv.readFile(newPath, {map: newMap})
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

const importGoodsOrderStat = async (req, res, next) => {
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
            let datainfo = fs.readFileSync(newPath)
            datainfo = iconv.decode(datainfo, 'GBK')
            fs.writeFileSync(newPath, datainfo)
            let readRes = await workbook.csv.readFile(newPath, {map: newMap})
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let rows = worksheet.getRows(1, worksheet.rowCount)
                let result = await operationService.importGoodsOrderStat(rows, time)
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
        const {goods_id, startDate, endDate, stats} = req.query
        joiUtil.validate({
            column: {value: req.params.column, schema: joiUtil.commonJoiSchemas.strRequired},
            goods_id: {value: goods_id, schema: joiUtil.commonJoiSchemas.strRequired},
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired}
        })
        const start = moment(req.query.startDate).format('YYYY-MM-DD')
        const end = moment(req.query.endDate).format('YYYY-MM-DD')
        const result = await operationService.getGoodsInfoDetail(req.params.column, goods_id, start, end, stats, req.user.id)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getJDskuInfoDetail = async (req, res, next) => {
    try {
        const {goods_id, startDate, endDate, stats} = req.query
        joiUtil.validate({
            goods_id: {value: goods_id, schema: joiUtil.commonJoiSchemas.strRequired},
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired}
        })
        const start = moment(req.query.startDate).format('YYYY-MM-DD')
        const end = moment(req.query.endDate).format('YYYY-MM-DD')
        const result = await operationService.getJDskuInfoDetail(goods_id, start, end, stats, req.user.id)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getGoodsInfoDetailTotal = async (req, res, next) => {
    try {
        const {goods_id, startDate, endDate, stats} = req.query
        joiUtil.validate({
            goods_id: {value: goods_id, schema: joiUtil.commonJoiSchemas.strRequired},
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired}
        })
        const start = moment(req.query.startDate).format('YYYY-MM-DD')
        const end = moment(req.query.endDate).format('YYYY-MM-DD')
        const result = await operationService.getGoodsInfoDetailTotal(goods_id, start, end, stats)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getskuInfoDetailTotal = async (req, res, next) => {
    try {
        const {sku_id, startDate, endDate, stats} = req.query
        joiUtil.validate({
            sku_id: {value: sku_id, schema: joiUtil.commonJoiSchemas.strRequired},
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired}
        })
        const start = moment(req.query.startDate).format('YYYY-MM-DD')
        const end = moment(req.query.endDate).format('YYYY-MM-DD')
        const result = await operationService.getskuInfoDetailTotal(sku_id, start, end, stats)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getGoodsInfoSubDetail = async (req, res, next) => {
    try {
        const {goods_id, startDate, endDate, stats} = req.query
        joiUtil.validate({
            goods_id: {value: goods_id, schema: joiUtil.commonJoiSchemas.strRequired},
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired}
        })
        const start = moment(req.query.startDate).format('YYYY-MM-DD')
        const end = moment(req.query.endDate).format('YYYY-MM-DD')
        const result = await operationService.getGoodsInfoSubDetail(goods_id, start, end, stats)
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

const importGoodsPayInfo = async (req, res, next) => {
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
            let readRes = await workbook.csv.readFile(newPath, {map: newMap})
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let rows = worksheet.getRows(1, worksheet.rowCount)
                let result = await operationService.importGoodsPayInfo(rows, time)
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

const importGoodsCompositeInfo = async (req, res, next) => {
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
                let result = await operationService.importGoodsCompositeInfo(rows, time)
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

const importGoodsSYCMInfo = async (req, res, next) => {
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
            const time = date[date.length - 1]
            const newPath = `${form.uploadDir}/${moment().valueOf()}-${file.originalFilename}`
            fs.renameSync(file.filepath, newPath, (err) => {  
                if (err) throw err
            })
            const workbook = new XLSX.readFile(newPath)
            const worksheet = workbook.Sheets[workbook.SheetNames[0]]
            let data = XLSX.utils.sheet_to_json(worksheet)
            let result = await operationService.importGoodsSYCMInfo(data, time)
            if (result) {
                fs.rmSync(newPath)
            } else {
                return res.send(biResponse.createFailed())
            }
            return res.send(biResponse.success())
        })
    } catch (e) {
        next(e)
    }
}

const importGoodsXHSInfo = async (req, res, next) => {
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
            const time = date[date.length - 1]
            const newPath = `${form.uploadDir}/${moment().valueOf()}-${file.originalFilename}`
            fs.renameSync(file.filepath, newPath, (err) => {  
                if (err) throw err
            })
            const workbook = new ExcelJS.Workbook()
            let readRes = await workbook.xlsx.readFile(newPath)
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let rows = worksheet.getRows(1, worksheet.rowCount)
                let result = await operationService.importGoodsXHSInfo(rows, time)
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

const importGoodsBrushingInfo = async (req, res, next) => {
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
            const time = date[date.length - 1]
            const newPath = `${form.uploadDir}/${moment().valueOf()}-${file.originalFilename}`
            fs.renameSync(file.filepath, newPath, (err) => {  
                if (err) throw err
            })
            const workbook = new ExcelJS.Workbook()
            let readRes = await workbook.csv.readFile(newPath, {map: newMap})
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let rows = worksheet.getRows(1, worksheet.rowCount)
                let result = await operationService.importGoodsBrushingInfo(rows, time)
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

const importJDZYInfo = async (req, res, next) => {
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
            const ext = file.originalFilename.split('.')[1]
            const time = date[1]
            const newPath = `${form.uploadDir}/${moment().valueOf()}-${file.originalFilename}`
            fs.renameSync(file.filepath, newPath, (err) => {  
                if (err) throw err
            })
            const workbook = new ExcelJS.Workbook()            
            let readRes
            if (ext == 'xlsx') {
                readRes = await workbook.xlsx.readFile(newPath, {map: newMap})
            } else {                
                let datainfo = fs.readFileSync(newPath)
                datainfo = iconv.decode(datainfo, 'GBK')
                fs.writeFileSync(newPath, datainfo)
                readRes = await workbook.csv.readFile(newPath, {map: newMap})
            }
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let rows = worksheet.getRows(1, worksheet.rowCount)
                let result = await operationService.importJDZYInfo(rows, time)
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

const importJDZYPromotionInfo = async (req, res, next) => {
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
            const name = date[0]
            const time = date[1]
            const newPath = `${form.uploadDir}/${moment().valueOf()}-${file.originalFilename}`
            fs.renameSync(file.filepath, newPath, (err) => {  
                if (err) throw err
            })
            const workbook = new ExcelJS.Workbook()
            let readRes = await workbook.csv.readFile(newPath, {map: newMap})
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let rows = worksheet.getRows(1, worksheet.rowCount)
                let result = await operationService.importJDZYPromotionInfo(rows, name, time)
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

const importJDZYcompositeInfo = async (req, res, next) => {
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
            const newPath = `${form.uploadDir}/${moment().valueOf()}-${file.originalFilename}`

            // 将上传的 ZIP 文件移动到指定目录
            fs.renameSync(file.filepath, newPath, (err) => {
                if (err) throw err
            })

            try {
                // 解压 ZIP 文件
                const zip = new AdmZip(newPath)
                const extractPath = path.join(form.uploadDir, `经营状况-${moment().valueOf()}`)
                fs.mkdirSync(extractPath, { recursive: true })
                zip.extractAllTo(extractPath, true)

                // 获取解压后的所有文件
                const extractedFiles = fs.readdirSync(extractPath)
                for (const extractedFile of extractedFiles) {
                    const filePath = path.join(extractPath, extractedFile)
                    const workbook = new ExcelJS.Workbook()
                    const date = extractedFile.split('.')[0].split('-全部')
                    const time1 = date[0].split('报-')
                    const time = time1[1]
                    let readRes = await workbook.xlsx.readFile(filePath, {map: newMap})
                    if (readRes) {
                        const worksheet = workbook.getWorksheet(1)
                        let rows = worksheet.getRows(1, worksheet.rowCount)
                        let result = await operationService.importJDZYcompositeInfo(rows, time)
                        if (result) {
                            fs.rmSync(filePath)
                        } else {
                            return res.send(biResponse.createFailed())
                        }
                    }
                }
                fs.rmSync(extractPath, { recursive: true, force: true })
                fs.rmSync(newPath)
                return res.send(biResponse.success())
            } catch (zipError) {
                console.error('解压 ZIP 文件时出错:', zipError)
                return res.send(biResponse.createFailed())
            }
        })
    } catch (e) {
        next(e)
    }
}


const importGoodsPDDInfo = async (req, res, next) => {
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
                let result = await operationService.importGoodsPDDInfo(rows, time)
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

const importGoodsOrderInfo = async (req, res, next) => {
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
            let datainfo = fs.readFileSync(newPath)
            datainfo = iconv.decode(datainfo, 'GBK')
            fs.writeFileSync(newPath, datainfo)
            const workbook = new ExcelJS.Workbook()
            let readRes = await workbook.csv.readFile(newPath, {map: newMap})
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let rows = worksheet.getRows(1, worksheet.rowCount)
                let result = await operationService.importGoodsOrderInfo(rows, time)
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

const setPannelSetting = async (req, res, next) => {
    try {
        const {type, attribute} = req.body
        joiUtil.validate({
            type: {value: type, schema: joiUtil.commonJoiSchemas.numberRequired},
            attribute: {value: attribute, schema: joiUtil.commonJoiSchemas.strRequired}
        })
        const result = await operationService.setPannelSetting(req.user.id, type, attribute)
        if (result) return res.send(biResponse.success())
        return res.send(biResponse.createFailed())
    } catch (e) {
        next(e)
    }
}

const getNewOnSaleInfo = async (req, res, next) => {
    try {
        const {currentPage, pageSize} = req.query
        joiUtil.validate({
            currentPage: {value: currentPage, schema: joiUtil.commonJoiSchemas.strRequired},
            pageSize: {value: pageSize, schema: joiUtil.commonJoiSchemas.strRequired}
        })
        const sale_date = moment().subtract(59, 'day').format('YYYY-MM-DD')
        const start = moment().subtract(61, 'day').format('YYYY-MM-DD')
        const end = moment().subtract(2, 'day').format('YYYY-MM-DD')
        let limit = parseInt(pageSize)
        let offset = (currentPage - 1) * pageSize
        if (limit <= 0 || offset < 0) return res.send(biResponse.canTFindIt())
        const result = await operationService.getNewOnSaleInfo(sale_date, start, end, limit, offset)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getOptimizeInfo = async (req, res, next) => {
    try {
        const {currentPage, pageSize, startDate, endDate} = req.query
        joiUtil.validate({
            currentPage: {value: currentPage, schema: joiUtil.commonJoiSchemas.strRequired},
            pageSize: {value: pageSize, schema: joiUtil.commonJoiSchemas.strRequired},
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired}
        })
        req.query.limit = parseInt(pageSize)
        req.query.offset = (currentPage - 1) * pageSize
        if (req.query.limit <= 0 || req.query.offset < 0) return res.send(biResponse.canTFindIt())
        req.query.start = moment(startDate).format('YYYY-MM-DD')
        req.query.end = moment(endDate).format('YYYY-MM-DD') + ' 23:59:59'
        const result = await operationService.getOptimizeInfo(req.query, req.user)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getReportInfo = async (req, res, next) => {
    try {
        const {startDate, endDate} = req.query
        joiUtil.validate({
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired}
        })
        const result = await operationService.getReportInfo(startDate, endDate)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}
const checkOperationOptimize = async (req, res, next) => {
    try {
        const result = await operationService.checkOperationOptimize()
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const importGoodsVerified = async (req, res, next) => {
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
            let readRes = await workbook.csv.readFile(newPath, {map: newMap})
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let rows = worksheet.getRows(1, worksheet.rowCount)
                let result = await operationService.importGoodsVerified(rows, time)
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

const importGoodsOrderVerifiedStat = async (req, res, next) => {
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
            let datainfo = fs.readFileSync(newPath)
            datainfo = iconv.decode(datainfo, 'GBK')
            fs.writeFileSync(newPath, datainfo)
            let readRes = await workbook.csv.readFile(newPath, {map: newMap})
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let rows = worksheet.getRows(1, worksheet.rowCount)
                let result = await operationService.importGoodsOrderVerifiedStat(rows, time)
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

const createShopPromotionLog = async (req, res, next) => {
    try {
        const {date, shop_name} = req.body
        joiUtil.validate({
            date: {value: date, schema: joiUtil.commonJoiSchemas.strRequired},
            shop_name: {value: shop_name, schema: joiUtil.commonJoiSchemas.strRequired}
        })
        const result = await operationService.createShopPromotionLog(date, shop_name)
        if (result) return res.send(biResponse.success())
        return res.send(biResponse.canTFindIt())
    } catch (e) {
        next(e)
    }
}

const importOrdersGoods = async (req, res, next) => {
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
            let datainfo = fs.readFileSync(newPath)
            datainfo = iconv.decode(datainfo, 'GBK')
            fs.writeFileSync(newPath, datainfo)
            let readRes = await workbook.csv.readFile(newPath, {map: newMap})
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let rows = worksheet.getRows(1, worksheet.rowCount)
                let result = await operationService.importOrdersGoods(rows, time)
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

const importOrdersGoodsVerified = async (req, res, next) => {
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
            let datainfo = fs.readFileSync(newPath)
            datainfo = iconv.decode(datainfo, 'GBK')
            fs.writeFileSync(newPath, datainfo)
            let readRes = await workbook.csv.readFile(newPath, {map: newMap})
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let rows = worksheet.getRows(1, worksheet.rowCount)
                let result = await operationService.importOrdersGoodsVerified(rows, time)
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

const refreshGoodsSalesStats = async (req, res, next) => {
    try {
        const {date} = req.body
        joiUtil.validate({
            date: {value: date, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        await operationService.batchInsertGoodsSales(date)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const refreshGoodsVerifiedsStats = async (req, res, next) => {
    try {
        const {date} = req.body
        joiUtil.validate({
            date: {value: date, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        await operationService.batchInsertGoodsVerifieds(date)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const refreshGoodsPayments = async (req, res, next) => {
    try {
        const {date} = req.body
        joiUtil.validate({
            date: {value: date, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        await operationService.updateGoodsPayments(date)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const refreshLaborCost = async (req, res, next) => {
    try {
        const {date} = req.body
        joiUtil.validate({
            date: {value: date, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        await operationService.updateOrderGoods(date)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const refreshVerifiedLaborCost = async (req, res, next) => {
    try {
        const {date} = req.body
        joiUtil.validate({
            date: {value: date, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        await operationService.updateOrderGoodsVerified(date)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getDataStats,
    getDataStatsDetail,
    getGoodsInfo,
    getGoodsLineInfo,
    importGoodsInfo,
    importGoodsOrderStat,
    importGoodsKeyWords,
    importGoodsDSR,
    getGoodsInfoDetail,
    getGoodsInfoDetailTotal,
    getGoodsInfoSubDetail,
    getWorkStats,
    importGoodsPayInfo,
    importGoodsCompositeInfo,
    importGoodsSYCMInfo,
    importGoodsXHSInfo,
    importGoodsBrushingInfo,
    importJDZYInfo,
    importJDZYPromotionInfo,
    importGoodsPDDInfo,
    importGoodsOrderInfo,
    setPannelSetting,
    getNewOnSaleInfo,
    getOptimizeInfo,
    checkOperationOptimize,
    importGoodsVerified,
    importGoodsOrderVerifiedStat,
    createShopPromotionLog,
    importOrdersGoods,
    importOrdersGoodsVerified,
    refreshGoodsSalesStats,
    refreshGoodsVerifiedsStats,
    refreshGoodsPayments,
    refreshLaborCost,
    refreshVerifiedLaborCost,
    importJDZYcompositeInfo,
    getJDskuInfoDetail,
    getskuInfoDetailTotal,
    getReportInfo
}