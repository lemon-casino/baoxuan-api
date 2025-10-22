const ExcelJS = require('exceljs')
const tgcService = require("../../service/customerService/tgcService")
const joiUtil = require("../../utils/joiUtil")
const biResponse = require("../../utils/biResponse")
const customerServiceSchema = require("../../schema/customerServiceSchema")
const formidable = require("formidable")
const fs = require('fs')
const moment =  require('moment')

const getTGCDataByDate = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(customerServiceSchema.requiredDateSchema, req.query)
        const data = await tgcService.getTGCDataByDate(req.query.startDate, req.query.endDate, req.query.servicer_id)
        const columns = [
            { header: '淘工厂', key: 'servicer_id', isDefault: true },
            { header: '上周会话量', key: 'reception_num_1', isDefault: true },
            { header: '上上周会话量', key: 'reception_num_2', isDefault: true },
            { header: '环比', key: 'chain_base_1', isDefault: true },
            { header: '上周销售额', key: 'amount_1', isDefault: true },
            { header: '上上周销售额', key: 'amount_2', isDefault: true },
            { header: '环比', key: 'chain_base_2', isDefault: true },
            { header: '上周转化率', key: 'transfer_rate_1', isDefault: true },
            { header: '上上周转化率', key: 'transfer_rate_2', isDefault: true },
            { header: '环比', key: 'chain_base_3', isDefault: true },
            { header: '满意度', key: 'satisfaction_rate', isDefault: true },
        ]
        let img = []
        if (req.query.is_export) {
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet('淘工厂')
            let tmpDefault = {
                servicer_id: null,
                reception_num_1: null,
                reception_num_2: null,
                chain_base_1: null,
                amount_1: null,
                amount_2: null,
                chain_base_2: null,
                transfer_rate_1: null,
                transfer_rate_2: null,
                chain_base_3: null,
                satisfaction_rate: null
            }

            worksheet.columns = columns

            for (let i = 0; i < data.length; i++) {
                let tmp = JSON.parse(JSON.stringify(tmpDefault))
                
                tmp['servicer_id'] = data[i].servicer_id
                tmp['reception_num_1'] = data[i].reception_num_1
                tmp['reception_num_2'] = data[i].reception_num_2
                tmp['chain_base_1'] = data[i].chain_base_1
                tmp['amount_1'] = data[i].amount_1
                tmp['amount_2'] = data[i].amount_2
                tmp['chain_base_2'] = data[i].chain_base_2
                tmp['transfer_rate_1'] = data[i].transfer_rate_1
                tmp['transfer_rate_2'] = data[i].transfer_rate_2
                tmp['chain_base_3'] = data[i].chain_base_3               
                tmp['satisfaction_rate'] = data[i].satisfaction_rate 

                worksheet.addRow(data[i])
            }

            const buffer = await workbook.xlsx.writeBuffer()
            res.setHeader('Content-Disposition', `attachment; filename="tgc-${req.query.startDate}-${req.query.endDate}.xlsx"`)
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

const importTGCData = async (req, res, next) => {
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
                        info.push(row.getCell(1).value ? row.getCell(1).value.trim(' ') : null)
                        info.push(row.getCell(2).value ? row.getCell(2).value.trim(' ') : null)
                        info.push(row.getCell(3).value)
                        info.push(row.getCell(4).value)
                        info.push(row.getCell(5).value)
                        info.push(row.getCell(6).value ? row.getCell(6).value * 100 : null)
                        info.push(row.getCell(7).value ? row.getCell(7).value * 100 : null)
                        info.push(row.getCell(8).value)
                        count = count + 1
                    }
                }
                if (count > 0) {
                    let row = await tgcService.insertTGC(count, info)
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
    getTGCDataByDate,
    importTGCData
}