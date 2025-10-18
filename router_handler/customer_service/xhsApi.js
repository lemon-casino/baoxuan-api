const ExcelJS = require('exceljs')
const xhsService = require("../../service/customerService/xhsService")
const joiUtil = require("../../utils/joiUtil")
const biResponse = require("../../utils/biResponse")
const customerServiceSchema = require("../../schema/customerServiceSchema")
const formidable = require("formidable")
const fs = require('fs')
const moment =  require('moment')

const getXHSDataByDate = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(customerServiceSchema.requiredDateSchema, req.query)
        const data = await xhsService.getXHSDataByDate(req.query.startDate, req.query.endDate, req.query.servicer_id)
        const columns = [
            { header: '小红书', key: 'servicer_id', isDefault: true },
            { header: '会话量', key: 'session_num', isDefault: true },
            { header: '销售额', key: 'transfer_amount', isDefault: true },
            { header: '转化率', key: 'transfer_rate', isDefault: true },
            { header: '3分钟回复率', key: 'response_in_3_rate', isDefault: true },
        ]
        let img = []
        if (req.query.is_export) {
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet('小红书')
            let tmpDefault = {
                servicer_id: null,
                session_num: null,
                transfer_amount: null,
                transfer_rate: null,
                response_in_3_rate: null
            }

            worksheet.columns = columns

            for (let i = 0; i < data.length; i++) {
                let tmp = JSON.parse(JSON.stringify(tmpDefault))
                
                tmp['servicer_id'] = data[i].servicer_id
                tmp['session_num'] = data[i].session_num
                tmp['transfer_amount'] = data[i].transfer_amount
                tmp['transfer_rate'] = data[i].transfer_rate
                tmp['response_in_3_rate'] = data[i].response_in_3_rate

                worksheet.addRow(data[i])
            }

            const buffer = await workbook.xlsx.writeBuffer()
            res.setHeader('Content-Disposition', `attachment; filename="xhs-${req.query.startDate}-${req.query.endDate}.xlsx"`)
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

const importXHSData = async (req, res, next) => {
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
            fs.renameSync(file.filepath, newPath, (err) => {  
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
                        info.push(row.getCell(2).value)
                        info.push(row.getCell(3).value ? row.getCell(2).value.trim(' ') : null)
                        info.push(row.getCell(4).value)
                        info.push(row.getCell(5).value)
                        info.push(row.getCell(6).value)
                        info.push(row.getCell(7).value)
                        info.push(row.getCell(8).value)
                        info.push(row.getCell(9).value)
                        info.push(row.getCell(10).value)
                        info.push(row.getCell(11).value)
                        info.push(row.getCell(12).value)
                        info.push(row.getCell(13).value)
                        info.push(row.getCell(14).value)
                        info.push(row.getCell(15).value)
                        info.push(row.getCell(16).value)
                        info.push(row.getCell(17).value)
                        info.push(row.getCell(18).value)
                        info.push(row.getCell(19).value)
                        count = count + 1
                    }
                }
                if (count > 0) {
                    let row = await xhsService.insertXHS(count, info)
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
    getXHSDataByDate,
    importXHSData
}