const ExcelJS = require('exceljs')
const dyService = require("../../service/customerService/dyService")
const joiUtil = require("../../utils/joiUtil")
const biResponse = require("../../utils/biResponse")
const customerServiceSchema = require("../../schema/customerServiceSchema")
const formidable = require("formidable")
const fs = require('fs')
const moment =  require('moment')

const getDYDataByDate = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(customerServiceSchema.requiredDateSchema, req.query)
        const data = await dyService.getDYDataByDate(req.query.startDate, req.query.endDate, req.query.shopname, req.query.servicer)
        const img = await dyService.getDYImgByDate(req.query.startDate, req.query.endDate)
        const columns = [
            { header: '账号名称', key: 'servicer', isDefault: true },
            { header: '人工已接待人数', key: 'reception_num', isDefault: true },
            { header: '3分钟人工回复率 (会话)', key: 'session_in_3_rate', isDefault: true },
            { header: '新平均响应时长（秒）', key: 'ave_response_duration', isDefault: true },
            { header: '满意率', key: 'satisfaction_rate', isDefault: true },
            { header: '客服销售额', key: 'amount', isDefault: true },
            { header: '询单转化率', key: 'transfer_rate', isDefault: true },
        ]
        if (req.query.is_export) {
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet('抖音')
            let tmpDefault = {
                servicer: null,
                reception_num: null,
                session_in_3_rate: null,
                ave_response_duration: null,
                satisfaction_rate: null,
                amount: null,
                transfer_rate: null
            }

            worksheet.columns = columns

            let tmp = JSON.parse(JSON.stringify(tmpDefault))
            let j = 0
            let imageBuffer = fs.readFileSync(img[j].img_url)
            let image = await workbook.addImage({
                buffer: imageBuffer,
                extension: img[j].img_url.split('.')[1]
            })
            worksheet.addImage(image, {
                tl: { col: 9, row: 0 },
                br: { col: 10, row: 1 },
                editAs: 'oneCell',
            })
            imageBuffer = fs.readFileSync(img[j + 1].img_url)
            image = await workbook.addImage({
                buffer: imageBuffer,
                extension: img[j + 1].img_url.split('.')[1]
            })
            worksheet.addImage(image, {
                tl: { col: 11, row: 0 },
                br: { col: 12, row: 1 },
                editAs: 'oneCell',
            })
                
            tmp['servicer'] = data[i].servicer
            tmp['reception_num'] = data[i].reception_num
            tmp['session_in_3_rate'] = data[i].session_in_3_rate
            tmp['ave_response_duration'] = data[i].ave_response_duration
            tmp['satisfaction_rate'] = data[i].satisfaction_rate
            tmp['amount'] = data[i].amount
            tmp['transfer_rate'] = data[i].transfer_rate

            worksheet.addRow(data[i])

            for (let i = 1; i < data.length; i++) {
                tmp = JSON.parse(JSON.stringify(tmpDefault))

                if (data[i].shop_name != data[i - 1].shop_name) {
                    j = j + 2
                    worksheet.addRow(JSON.parse(JSON.stringify(tmpDefault)))
                    worksheet.addRow({
                        servicer: '账号名称',
                        reception_num: '人工已接待人数',
                        session_in_3_rate: '3分钟人工回复率 (会话)',
                        ave_response_duration: '新平均响应时长（秒）',
                        satisfaction_rate: '满意率',
                        amount: '客服销售额',
                        transfer_rate: '询单转化率'
                    })

                    imageBuffer = fs.readFileSync(img[j].img_url)
                    image = await workbook.addImage({
                        buffer: imageBuffer,
                        extension: img[j].img_url.split('.')[1]
                    })
                    worksheet.addImage(image, {
                        tl: { col: 9, row: i },
                        br: { col: 10, row: i + 1 },
                        editAs: 'oneCell',
                    })

                    imageBuffer = fs.readFileSync(img[j + 1].img_url)
                    image = await workbook.addImage({
                        buffer: imageBuffer,
                        extension: img[j + 1].img_url.split('.')[1]
                    })
                    worksheet.addImage(image, {
                        tl: { col: 11, row: i },
                        br: { col: 12, row: i + 1 },
                        editAs: 'oneCell',
                    })
                }
                
                tmp['servicer'] = data[i].
                tmp['reception_num'] = data[i].reception_num
                tmp['session_in_3_rate'] = data[i].session_in_3_rate
                tmp['ave_response_duration'] = data[i].ave_response_duration
                tmp['satisfaction_rate'] = data[i].satisfaction_rate
                tmp['amount'] = data[i].amount
                tmp['transfer_rate'] = data[i].transfer_rate

                worksheet.addRow(data[i])
            }

            const buffer = await workbook.xlsx.writeBuffer()
            res.setHeader('Content-Disposition', `attachment; filename="dy-${req.query.startDate}-${req.query.endDate}.xlsx"`)
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

const importDYData = async (req, res, next) => {
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
            const start_time = date[1]
            const end_time = date[2] ? date[2] : date[1]
            const newPath = `${form.uploadDir}/${moment().valueOf()}-${file.originalFilename}`
            fs.rename(file.filepath, newPath, (err) => {  
                if (err) throw err
            })
            const workbook = new ExcelJS.Workbook()
            let readRes =await workbook.xlsx.readFile(newPath)
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let info = []
                let rows = worksheet.getRows(2, worksheet.rowCount - 1)
                
                let count = 0                   
                for (let i = 0; i < worksheet.rowCount - 1; i++) {
                    let row = rows[i]
                    if (row.getCell(1).value && row.getCell(1).value == '汇总') break
                    else if (row.getCell(1).value && row.getCell(1).value != '店铺名称') {
                        info.push(row.getCell(1).value ? row.getCell(1).value.trim(' ') : null)                        
                        info.push(start_time)
                        info.push(end_time)
                        info.push(row.getCell(2).value ? row.getCell(2).value.trim(' ') : null)
                        info.push(row.getCell(3).value ? row.getCell(3).value.trim(' ') : null)
                        info.push(row.getCell(4).value != '-' ? row.getCell(4).value : null)
                        info.push(row.getCell(5).value != '-' ? row.getCell(5).value : null)
                        info.push(row.getCell(6).value != '-' ? row.getCell(6).value : null)
                        info.push(row.getCell(7).value instanceof Number ? row.getCell(7).value * 100 : null)
                        info.push(row.getCell(8).value instanceof Number ? row.getCell(8).value * 100 : null)
                        info.push(row.getCell(9).value instanceof Number ? row.getCell(9).value * 100 : null)
                        info.push(row.getCell(10).value != '-' ? row.getCell(10).value : null)
                        info.push(row.getCell(11).value != '-' ? row.getCell(11).value : null)
                        info.push(row.getCell(12).value instanceof Number ? row.getCell(12).value * 100 : null)
                        info.push(row.getCell(13).value != '-' ? row.getCell(13).value : null)
                        info.push(row.getCell(14).value != '-' ? row.getCell(14).value : null)
                        info.push(row.getCell(15).value != '-' ? row.getCell(15).value : null)
                        info.push(row.getCell(16).value != '-' ? row.getCell(16).value : null)
                        info.push(row.getCell(17).value instanceof Number ? row.getCell(17).value * 100 : null)
                        info.push(row.getCell(18).value != '-' ? row.getCell(18).value : null)
                        info.push(row.getCell(19).value != '-' ? row.getCell(19).value : null)
                        info.push(row.getCell(20).value != '-' ? row.getCell(20).value : null)
                        info.push(row.getCell(21).value != '-' ? row.getCell(21).value : null)

                        count = count + 1
                    }
                }
                if (count > 0) {
                    let row = await dyService.insertDY(count, info)
                    if (row?.affectedRows) {
                        const images = worksheet.getImages()                        
                        images.forEach(medium => {
                            if (medium.type === 'image') {
                                let image = workbook.getImage(medium.imageId)
                                const dir = `./public/avatar/dy`
                                fs.mkdirSync(dir, { recursive: true })
                                const imgPath = `${dir}/${moment().valueOf()}-${image.name}.${image.extension}`
                                fs.writeFileSync(imgPath, image.buffer)
                                dyService.insertDYImg([imgPath, start_time, end_time])
                            }
                        })
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

module.exports = {
    getDYDataByDate,
    importDYData
}