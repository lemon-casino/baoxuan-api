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
        const {goods_id,shop_name, startDate, endDate, stats} = req.query
        joiUtil.validate({
            column: {value: req.params.column, schema: joiUtil.commonJoiSchemas.strRequired},
            goods_id: {value: goods_id, schema: joiUtil.commonJoiSchemas.strRequired},
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            shop_name: {value: shop_name, schema: joiUtil.commonJoiSchemas.strRequired}
        })
        const start = moment(req.query.startDate).format('YYYY-MM-DD')
        const end = moment(req.query.endDate).format('YYYY-MM-DD')
        const result = await operationService.getGoodsInfoDetail(req.params.column, goods_id, shop_name, start, end, stats, req.user.id)
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
            let datainfo = fs.readFileSync(newPath)
            datainfo = iconv.decode(datainfo, 'GBK')
            fs.writeFileSync(newPath, datainfo)
            let readRes = await workbook.csv.readFile(newPath, {map: newMap})
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
        const {startDate, endDate,goodsinfo} = req.query
        joiUtil.validate({
            goodsinfo: {value: goodsinfo, schema: joiUtil.commonJoiSchemas.strRequired},
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired}
        })
        let lstart = moment(startDate).format('YYYY-MM-DD')
        let lend = moment(endDate).format('YYYY-MM-DD') 
        let preStart = moment(startDate).subtract(7, 'day').format('YYYY-MM-DD')
        let preEnd = moment(endDate).subtract(7, 'day').format('YYYY-MM-DD')
        let mstart = moment(startDate).startOf('month').format('YYYY-MM-DD')
        let mend = moment(endDate).endOf('month').format('YYYY-MM-DD')
        let lmstart = moment(startDate).subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
        let lmend = moment(endDate).subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
        let result=[]
        if(goodsinfo=='推广汇总'){
            result = await operationService.getTMPromotion(lstart,lend)
        }else if(goodsinfo=='推广明细'){
            result = await operationService.getTMPromotioninfo(lstart,lend)
        }else{
            if(moment(lstart).isSame(mstart, 'day')&&moment(lend).isSame(mend, 'day')){
                result = await operationService.getReportInfo(lstart, lend,lmstart,lmend,goodsinfo)
            }else{
                result = await operationService.getReportInfo(lstart, lend,preStart,preEnd,goodsinfo)
                
            }
        }
        console.log(result)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const ReportDownload = async (req, res, next) => {
    try {
        const {startDate, endDate} = req.query
        joiUtil.validate({
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired}
        })
        let lstart = moment(startDate).format('YYYY-MM-DD')
        let lend = moment(endDate).format('YYYY-MM-DD') 
        let preStart = moment(startDate).subtract(7, 'day').format('YYYY-MM-DD')
        let preEnd = moment(endDate).subtract(7, 'day').format('YYYY-MM-DD')
        let mstart = moment(startDate).startOf('month').format('YYYY-MM-DD')
        let mend = moment(endDate).endOf('month').format('YYYY-MM-DD')
        let lmstart = moment(startDate).subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
        let lmend = moment(endDate).subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
        const workbook = new ExcelJS.Workbook()
        const sheet1 = workbook.addWorksheet('汇总')
        const sheet2 = workbook.addWorksheet('新品')
        const sheet3 = workbook.addWorksheet('老品')
        const sheet4 = workbook.addWorksheet('推广明细')
        const sheet5 = workbook.addWorksheet('推广汇总')
        if(moment(lstart).isSame(mstart, 'day')&&moment(lend).isSame(mend, 'day')){
           result1 = await operationService.getReportInfo(lstart, lend,lmstart,lmend,'汇总')
           result2 = await operationService.getReportInfo(lstart, lend,lmstart,lmend,'新品')
           result3 = await operationService.getReportInfo(lstart, lend,lmstart,lmend,'老品')
        }else{
            result1 = await operationService.getReportInfo(lstart, lend,preStart,preEnd,'汇总')
            result2 = await operationService.getReportInfo(lstart, lend,preStart,preEnd,'新品')
            result3 = await operationService.getReportInfo(lstart, lend,preStart,preEnd,'老品')
        }
        result4 = await operationService.getTMPromotioninfo(lstart, lend)
        result5 = await operationService.getTMPromotion(lstart, lend)
        sheet1.columns = result1.columns
        sheet2.columns = result2.columns
        sheet3.columns = result3.columns
        sheet4.columns = result4.columns
        sheet5.columns = result5.columns
        data1 = result1.data
        data2 = result2.data
        data3 = result3.data
        data4 = result4.data
        data5 = result5.data
        for (let i = 0; i < data1.length; i++) {
            data1[i].promotion_rate = data1[i].promotion_rate + '%'
            data1[i].bill_rate = data1[i].bill_rate + '%'
            data1[i].profit_rate = data1[i].profit_rate + '%'
            data1[i].verified_profit_rate = data1[i].verified_profit_rate + '%'
            data1[i].team_saleamount_rate = data1[i].team_saleamount_rate + '%'
            sheet1.addRow(data1[i])
        }
        for (let i = 0; i < data2.length; i++) {
            data2[i].promotion_rate = data2[i].promotion_rate + '%'
            data2[i].bill_rate = data2[i].bill_rate + '%'
            data2[i].profit_rate = data2[i].profit_rate + '%'
            data2[i].verified_profit_rate = data2[i].verified_profit_rate + '%'
            data2[i].team_saleamount_rate = data2[i].team_saleamount_rate + '%'
            sheet2.addRow(data2[i])
        }
        for (let i = 0; i < data3.length; i++) {
            data3[i].promotion_rate = data3[i].promotion_rate + '%'
            data3[i].bill_rate = data3[i].bill_rate + '%'
            data3[i].profit_rate = data3[i].profit_rate + '%'
            data3[i].verified_profit_rate = data3[i].verified_profit_rate + '%'
            data3[i].team_saleamount_rate = data3[i].team_saleamount_rate + '%'
            sheet3.addRow(data3[i])
        }
        for (let i = 0; i < data4.length; i++) {
            sheet4.addRow(data4[i])
        }
        for (let i = 0; i < data3.length; i++) {
            sheet5.addRow(data5[i])
        }
        const buffer = await workbook.xlsx.writeBuffer()
        res.setHeader('Content-Disposition', `attachment; filename="zb-${req.query.startDate}-${req.query.endDate}.xlsx"`)
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        return res.end(buffer)
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

const importErleiShuadan = async (req, res, next) => {
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
            let readRes = await workbook.xlsx.readFile(newPath, {map: newMap})
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let rows = worksheet.getRows(1, worksheet.rowCount)
                let result = await operationService.importErleiShuadan(rows, time)
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

const importXhsShuadan = async (req, res, next) => {
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
            let datainfo = fs.readFileSync(newPath)
            datainfo = iconv.decode(datainfo, 'GBK')
            fs.writeFileSync(newPath, datainfo)
            let readRes = await workbook.csv.readFile(newPath, {map: newMap})
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let rows = worksheet.getRows(1, worksheet.rowCount)
                let result = await operationService.importXhsShuadan(rows, time)
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
        await operationService.batchInsertJDGoodsSales(date)
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

const importTmallpromotioninfo = async (req, res, next) => {
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
            const filename = file.originalFilename.split('.')[0].split('_')
            const shopname = filename[0]
            const paytime = filename[1]
            const day = filename[2]
            const date = moment(paytime).add(day-1, 'days').format("YYYY-MM-DD")
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
                let result = await operationService.importTmallpromotioninfo(rows, shopname,paytime,day,date)
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
    getReportInfo,
    importErleiShuadan,
    importXhsShuadan,
    ReportDownload,
    importTmallpromotioninfo
}