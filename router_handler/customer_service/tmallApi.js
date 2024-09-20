const ExcelJS = require('exceljs')
const tmallService = require("../../service/customerService/tmallService")
const joiUtil = require("../../utils/joiUtil")
const biResponse = require("../../utils/biResponse")
const customerServiceSchema = require("../../schema/customerServiceSchema")
const formidable = require("formidable")
const fs = require('fs')
const moment =  require('moment')

const getTmallAsByDate = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(customerServiceSchema.requiredDateSchema, req.query)
        const data = await tmallService.getTmallAsByDate(req.query.startDate, req.query.endDate)
        const img = await tmallService.getTmallAsImgByDate(req.query.startDate, req.query.endDate)
        const columns = [
            { header: '旺旺', key: 'servicer', isDefault: true },
            { header: '上周平均响应', key: 'response_average_1', isDefault: true },
            { header: '上周售后人数', key: 'service_num_1', isDefault: true },
            { header: '上上周售后人数', key: 'service_num_2', isDefault: true },
            { header: '环比', key: 'chain_base_1', isDefault: true },
            { header: '上周满意率', key: 'satisfaction_rate_1', isDefault: true },
            { header: '排名', key: 'rank_1', isDefault: true },
            { header: '上上周满意率', key: 'satisfaction_rate_2', isDefault: true },
            { header: '环比', key: 'chain_base_2', isDefault: true },
            { header: '上周解决率', key: 'onetime_rate_1', isDefault: true },
            { header: '上上周解决率', key: 'onetime_rate_2', isDefault: true },
            { header: '环比', key: 'chain_base_3', isDefault: true },
            { header: null, key: 'blank_1', isDefault: true },
            { header: '平均响应(秒)', key: 'response_average', isDefault: true },
            { header: '客户满意率', key: 'satisfaction_rate', isDefault: true },
            { header: '接待售后人数', key: 'service_num', isDefault: true },
            { header: '售后一次解决率', key: 'onetime_rate', isDefault: true },
        ]
        if (req.query.is_export) {
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet('天猫售后')
            let tmpDefault = {
                servicer: null,
                response_average_1: null,
                service_num_1: null,
                service_num_2: null,
                chain_base_1: null,
                satisfaction_rate_1: null,
                rank_1: null,
                satisfaction_rate_2: null,
                chain_base_2: null,
                onetime_rate_1: null,
                onetime_rate_2: null,
                chain_base_3: null,
                response_average: null,
                satisfaction_rate: null,
                service_num: null,
                onetime_rate: null
            }

            worksheet.columns = columns

            for (let i = 0; i < data.length; i++) {
                let tmp = JSON.parse(JSON.stringify(tmpDefault))
                
                tmp['servicer'] = data[i].servicer
                tmp['response_average_1'] = data[i].response_average_1
                tmp['service_num_1'] = data[i].service_num_1
                tmp['service_num_2'] = data[i].service_num_2
                tmp['chain_base_1'] = data[i].chain_base_1
                tmp['satisfaction_rate_1'] = data[i].satisfaction_rate_1 + '%'
                tmp['rank_1'] = data[i].rank_1
                tmp['satisfaction_rate_2'] = data[i].satisfaction_rate_2 + '%'
                tmp['chain_base_2'] = data[i].chain_base_2
                tmp['onetime_rate_1'] = data[i].onetime_rate_1 + '%'
                tmp['onetime_rate_2'] = data[i].onetime_rate_2 + '%'
                tmp['chain_base_3'] = data[i].chain_base_3
                tmp['response_average'] = data[i].response_average
                tmp['satisfaction_rate'] = data[i].satisfaction_rate + '%'
                tmp['service_num'] = data[i].service_num
                tmp['onetime_rate'] = data[i].onetime_rate + '%'

                worksheet.addRow(data[i])
            }

            for (let i = 0; i < img.length; i++) {
                let imageBuffer = fs.readFileSync(img[i].img_url)
                const image = await workbook.addImage({
                    buffer: imageBuffer,
                    extension: img[i].img_url.split('.')[1]
                })
                worksheet.addImage(image, {
                    tl: { col: 0, row: data.length + (i + 1) * 5 },
                    br: { col: 4, row: data.length + (i + 1) * 5 + 1 },
                    editAs: 'oneCell',
                })
            }

            const buffer = await workbook.xlsx.writeBuffer()
            res.setHeader('Content-Disposition', `attachment; filename="tmall-as-${req.query.startDate}-${req.query.endDate}.xlsx"`)
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')        
            return res.send(buffer)
        } else {
            return res.send(biResponse.success({
                columns, data, img
            }))
        }
    } catch (e) {
        next(e)
    }
}

const importTmallAsData = async (req, res, next) => {
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
            fs.rename(file.filepath, newPath, (err) => {  
                if (err) throw err
            })
            const workbook = new ExcelJS.Workbook()
            let readRes =await workbook.xlsx.readFile(newPath)
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                const date = file.originalFilename.split('.')[0].split('_')
                const start_time = date[1]
                const end_time = date[2] ? date[2] : date[1]
                let info = [], insertInfo
                let rows = worksheet.getRows(2, worksheet.rowCount - 1)
                if (file.originalFilename.indexOf('有延迟') != -1) {
                    for (let i = 0; i < worksheet.rowCount - 1; i++) {
                        let row = rows[i]
                        info = []
                        if (row.getCell(1).value) {           
                            info.push(row.getCell(2).value ? row.getCell(2).value * 100 : null)
                            info.push(row.getCell(3).value)
                            info.push(row.getCell(4).value ? row.getCell(4).value * 100 : null)
                            info.push(row.getCell(5).value)
                            info.push(row.getCell(6).value)
                            info.push(row.getCell(7).value ? row.getCell(7).value * 100 : null)
                            info.push(row.getCell(8).value)
                            info.push(row.getCell(9).value)
                            info.push(row.getCell(10).value ? row.getCell(10).value * 100 : null)
                            info.push(row.getCell(11).value ? row.getCell(11).value * 100 : null)
                            info.push(row.getCell(12).value)
                            info.push(row.getCell(13).value)
                            info.push(row.getCell(14).value)
                            info.push(row.getCell(15).value)
                            info.push(start_time)
                            info.push(end_time)
                            info.push(row.getCell(1).value ? row.getCell(1).value.trim(' ') : null)
                            
                            insertInfo = await tmallService.updateTmallAs(info)
                        }
                    }
                } else {
                    let count = 0                    
                    for (let i = 0; i < worksheet.rowCount - 1; i++) {
                        let row = rows[i]
                        if (row.getCell(1).value) {
                            info.push(start_time)
                            info.push(end_time)
                            info.push(row.getCell(1).value ? row.getCell(1).value.trim(' ') : null)
                            info.push(row.getCell(2).value ? row.getCell(2).value * 100 : null)
                            info.push(row.getCell(3).value)
                            info.push(row.getCell(4).value ? row.getCell(4).value * 100 : null)
                            info.push(row.getCell(5).value)
                            info.push(row.getCell(6).value)
                            info.push(row.getCell(7).value ? row.getCell(7).value * 100 : null)
                            info.push(row.getCell(8).value)
                            info.push(row.getCell(9).value)
                            info.push(row.getCell(10).value ? row.getCell(10).value * 100 : null)
                            info.push(row.getCell(11).value ? row.getCell(11).value * 100 : null)
                            info.push(row.getCell(12).value)
                            info.push(row.getCell(13).value)
                            info.push(row.getCell(14).value)
                            info.push(row.getCell(15).value)
                            count = count + 1
                        }
                    }
                    insertInfo = await tmallService.insertTmallAs(count, info)
                    const images = worksheet.getImages()
                    
                    images.forEach(medium => {
                        if (medium.type === 'image') {
                            let image = workbook.getImage(medium.imageId)
                            const dir = `./public/avatar/tmall/as`
                            fs.mkdirSync(dir, { recursive: true })
                            const imgPath = `${dir}/${moment().valueOf()}-${image.name}.${image.extension}`
                            fs.writeFileSync(imgPath, image.buffer)
                            tmallService.insertTmallAsImg([imgPath, start_time, end_time])
                        }
                    })
                }
                if (insertInfo?.affectedRows) fs.rmSync(newPath)
                else res.send(biResponse.createFailed())
            }
            return res.send(biResponse.success())
        })
    } catch (e) {
        next(e)
    }
}

const getTmallPsByDate = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(customerServiceSchema.requiredDateSchema, req.query)
        const data = await tmallService.getTmallPsByDate(req.query.startDate, req.query.endDate)
        const columns = [
            { header: '旺旺', key: 'servicer', isDefault: true },
            { header: '上周销售额', key: 'amount_1', isDefault: true },
            { header: '上上周销售额', key: 'amount_2', isDefault: true },
            { header: '环比', key: 'chain_base_1', isDefault: true },
            { header: '上周转化率', key: 'success_rate_1', isDefault: true },
            { header: '上上周转化率', key: 'success_rate_2', isDefault: true },
            { header: '环比', key: 'chain_base_2', isDefault: true },
            { header: '上周接待', key: 'reception_num_1', isDefault: true },
            { header: '上上周接待', key: 'reception_num_2', isDefault: true },
            { header: '环比', key: 'chain_base_3', isDefault: true },
            { header: '上周解决率', key: 'onetime_rate_1', isDefault: true },
            { header: '上上周解决率', key: 'onetime_rate_2', isDefault: true },
            { header: '环比', key: 'chain_base_4', isDefault: true },
            { header: '上周满意率', key: 'satisfaction_rate_1', isDefault: true },
            { header: '问答比', key: 'qa_rate', isDefault: true },
            { header: null, key: 'blank_1', isDefault: true },
            { header: '转化率', key: 'success_rate', isDefault: true },
            { header: '排名', key: 'rank_1', isDefault: true },
            { header: '客户满意率', key: 'satisfaction_rate', isDefault: true },
            { header: '排名', key: 'rank_2', isDefault: true },
            { header: '销售额', key: 'amount', isDefault: true },
            { header: '排名', key: 'rank_3', isDefault: true },
            { header: '接待人数', key: 'reception_num', isDefault: true },
            { header: '上班天数', key: 'work_days', isDefault: true },
            { header: '客单价', key: 'price', isDefault: true },
        ]
        let img = []
        if (req.query.is_export) {
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet('天猫售前')
            let tmpDefault = {
                servicer: null,
                amount_1: null,
                amount_2: null,
                chain_base_1: null,
                success_rate_1: null,
                success_rate_2: null,
                chain_base_2: null,
                reception_num_1: null,
                reception_num_2: null,
                chain_base_3: null,
                onetime_rate_1: null,
                onetime_rate_2: null,
                chain_base_4: null,
                satisfaction_rate_1: null,
                qa_rate: null,
                success_rate: null,
                rank_1: null,
                satisfaction_rate: null,
                rank_2: null,
                amount: null,
                rank_3: null,
                reception_num: null,
                work_days: null,
                price: null
            }

            worksheet.columns = columns

            for (let i = 0; i < data.length; i++) {
                let tmp = JSON.parse(JSON.stringify(tmpDefault))
                
                tmp['servicer'] = data[i].servicer
                tmp['amount_1'] = data[i].amount_1
                tmp['amount_2'] = data[i].amount_2
                tmp['chain_base_1'] = data[i].chain_base_1
                tmp['success_rate_1'] = data[i].success_rate_1 + '%'
                tmp['success_rate_2'] = data[i].success_rate_2 + '%'
                tmp['chain_base_2'] = data[i].chain_base_2
                tmp['reception_num_1'] = data[i].reception_num_1
                tmp['reception_num_2'] = data[i].reception_num_2
                tmp['chain_base_3'] = data[i].chain_base_3
                tmp['onetime_rate_1'] = data[i].onetime_rate_1 + '%'
                tmp['onetime_rate_2'] = data[i].onetime_rate_2 + '%'
                tmp['chain_base_4'] = data[i].chain_base_4
                tmp['satisfaction_rate_1'] = data[i].satisfaction_rate_1 + '%'
                tmp['qa_rate'] = data[i].qa_rate + '%'
                tmp['success_rate'] = data[i].success_rate + '%'             
                tmp['rank_1'] = data[i].rank_1
                tmp['satisfaction_rate'] = data[i].satisfaction_rate + '%'
                tmp['rank_2'] = data[i].rank_2
                tmp['amount'] = data[i].amount
                tmp['rank_3'] = data[i].rank_3
                tmp['reception_num'] = data[i].reception_num
                tmp['work_days'] = data[i].work_days
                tmp['price'] = data[i].price

                worksheet.addRow(data[i])
            }

            const buffer = await workbook.xlsx.writeBuffer()
            res.setHeader('Content-Disposition', `attachment; filename="tmall-ps-${req.query.startDate}-${req.query.endDate}.xlsx"`)
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')        
            return res.send(buffer)
        } else {
            return res.send(biResponse.success({
                columns, data, img
            }))
        }
    } catch (e) {
        next(e)
    }
}

const importTmallPsData = async (req, res, next) => {
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
            fs.rename(file.filepath, newPath, (err) => {  
                if (err) throw err
            })
            const workbook = new ExcelJS.Workbook()
            let readRes =await workbook.xlsx.readFile(newPath)
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                const date = file.originalFilename.split('.')[0].split('_')
                const start_time = date[1]
                const end_time = date[2] ? date[2] : date[1]
                let info = [], insertInfo
                let rows = worksheet.getRows(2, worksheet.rowCount - 1)
                if (file.originalFilename.indexOf('有未回复') != -1) {
                    for (let i = 0; i < worksheet.rowCount - 1; i++) {
                        let row = rows[i]
                        info = []
                        if (row.getCell(1).value) {           
                            info.push(row.getCell(2).value)
                            info.push(row.getCell(3).value ? row.getCell(3).value * 100 : null)
                            info.push(row.getCell(4).value ? row.getCell(4).value * 100 : null)
                            info.push(row.getCell(5).value)
                            info.push(row.getCell(6).value)
                            info.push(row.getCell(7).value ? row.getCell(7).value * 100 : null)
                            info.push(row.getCell(8).value)
                            info.push(row.getCell(9).value)
                            info.push(row.getCell(10).value)
                            info.push(row.getCell(11).value)
                            info.push(row.getCell(12).value)
                            info.push(row.getCell(13).value)
                            info.push(row.getCell(14).value)
                            info.push(row.getCell(15).value)
                            info.push(row.getCell(16).value ? row.getCell(16).value * 100 : null)
                            info.push(row.getCell(17).value)
                            info.push(start_time)
                            info.push(end_time)
                            info.push(row.getCell(1).value ? row.getCell(1).value.trim(' ') : null)
                            
                            insertInfo = await tmallService.updateTmallPs(info)
                        }
                    }
                } else {
                    let count = 0                    
                    for (let i = 0; i < worksheet.rowCount - 1; i++) {
                        let row = rows[i]
                        if (row.getCell(1).value) {
                            info.push(start_time)
                            info.push(end_time)
                            info.push(row.getCell(1).value ? row.getCell(1).value.trim(' ') : null)
                            info.push(row.getCell(2).value)
                            info.push(row.getCell(3).value ? row.getCell(3).value * 100 : null)
                            info.push(row.getCell(4).value ? row.getCell(4).value * 100 : null)
                            info.push(row.getCell(5).value)
                            info.push(row.getCell(6).value)
                            info.push(row.getCell(7).value ? row.getCell(7).value * 100 : null)
                            info.push(row.getCell(8).value)
                            info.push(row.getCell(9).value)
                            info.push(row.getCell(10).value)
                            info.push(row.getCell(11).value)
                            info.push(row.getCell(12).value)
                            info.push(row.getCell(13).value)
                            info.push(row.getCell(14).value)
                            info.push(row.getCell(15).value)
                            info.push(row.getCell(16).value ? row.getCell(16).value * 100 : null)
                            info.push(row.getCell(17).value)
                            count = count + 1
                        }
                    }
                    insertInfo = await tmallService.insertTmallPs(count, info)
                }
                if (insertInfo?.affectedRows) fs.rmSync(newPath)
                else res.send(biResponse.createFailed())
            }
            return res.send(biResponse.success())
        })
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getTmallAsByDate,
    importTmallAsData,
    getTmallPsByDate,
    importTmallPsData
}