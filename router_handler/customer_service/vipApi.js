const ExcelJS = require('exceljs')
const vipService = require("../../service/customerService/vipService")
const joiUtil = require("../../utils/joiUtil")
const biResponse = require("../../utils/biResponse")
const customerServiceSchema = require("../../schema/customerServiceSchema")
const formidable = require("formidable")
const fs = require('fs')
const moment =  require('moment')

const getVIPDataByDate = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(customerServiceSchema.requiredDateSchema, req.query)
        const data = await vipService.getVIPDataByDate(req.query.startDate, req.query.endDate, req.query.servicer_id)
        const columns = [
            { header: '唯品会', key: 'servicer_id', isDefault: true },
            { header: '接待人数', key: 'reception_num', isDefault: true },
            { header: '销售额', key: 'amount', isDefault: true },
            { header: '满意率', key: 'satisfaction_rate', isDefault: true },
            { header: '平均响应', key: 'ps_session_num', isDefault: true },
            { header: '在线客服60s应答率', key: 'response_in_60_rate', isDefault: true },
        ]
        let img = []
        if (req.query.is_export) {
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet('唯品会')
            let tmpDefault = {
                servicer_id: null,
                reception_num: null,
                amount: null,
                satisfaction_rate: null,
                ps_session_num: null,
                response_in_60_rate: null
            }

            worksheet.columns = columns

            for (let i = 0; i < data.length; i++) {
                let tmp = JSON.parse(JSON.stringify(tmpDefault))
                
                tmp['servicer_id'] = data[i].servicer_id
                tmp['reception_num'] = data[i].reception_num
                tmp['amount'] = data[i].amount
                tmp['satisfaction_rate'] = data[i].satisfaction_rate + '%'
                tmp['ps_session_num'] = data[i].ps_session_num
                tmp['response_in_60_rate'] = data[i].response_in_60_rate + '%'

                worksheet.addRow(data[i])
            }

            const buffer = await workbook.xlsx.writeBuffer()
            res.setHeader('Content-Disposition', `attachment; filename="vip-${req.query.startDate}-${req.query.endDate}.xlsx"`)
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

const importVIPData = async (req, res, next) => {
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
            const start_time = fields.start_time
            const end_time = fields.end_time
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let info = []
                let rows = worksheet.getRows(2, worksheet.rowCount - 1)
                
                let count = 0                   
                for (let i = 0; i < worksheet.rowCount - 1; i++) {
                    let row = rows[i]
                    if (row.getCell(1).value) {
                        info.push(start_time)
                        info.push(end_time)
                        info.push(row.getCell(1).value)
                        info.push(row.getCell(2).value)
                        info.push(row.getCell(3).value)
                        info.push(row.getCell(4).value)
                        info.push(row.getCell(5).value ? row.getCell(5).value * 100 : null)
                        info.push(row.getCell(6).value ? row.getCell(6).value * 100 : null)
                        info.push(row.getCell(7).value)
                        info.push(row.getCell(8).value)
                        info.push(row.getCell(9).value)
                        info.push(row.getCell(10).value)
                        info.push(row.getCell(11).value)
                        info.push(row.getCell(12).value)
                        info.push(row.getCell(13).value ? row.getCell(13).value * 100 : null)
                        info.push(row.getCell(14).value)
                        info.push(row.getCell(15).value)
                        info.push(row.getCell(16).value ? row.getCell(16).value * 100 : null)
                        count = count + 1
                    }
                }
                if (count > 0) {
                    let row = await vipService.insertVIP(count, info)
                    if (row?.affectedRows) fs.rmSync(newPath)
                    else return res.send(biResponse.createFailed())
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
    getVIPDataByDate,
    importVIPData
}