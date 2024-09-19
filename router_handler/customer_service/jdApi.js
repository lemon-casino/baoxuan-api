const ExcelJS = require('exceljs')
const jdService = require("../../service/customerService/jdService")
const joiUtil = require("../../utils/joiUtil")
const biResponse = require("../../utils/biResponse")
const customerServiceSchema = require("../../schema/customerServiceSchema")
const formidable = require("formidable")
const fs = require('fs')
const moment =  require('moment')

const getJDDataByDate = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(customerServiceSchema.requiredDateSchema, req.query)
        const data = await jdService.getJDDataByDate(req.query.startDate, req.query.endDate)
        if (!data?.length) return res.send(biResponse.canTFindIt)
        const img = await jdService.getJDImgByDate(req.query.startDate, req.query.endDate)
        if (req.query.is_export) {
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet('拼多多')
            let tmpDefault = {
                shopname: null,
                date: null,
                servicer: null,
                reception_num: null,
                response_in_30_rate: null,
                satisfaction_rate: null,
                amount: null,
                transfer_rate: null
            }
            let columns = [
                { header: '店铺名', key: 'shopname', isDefault: true },
                { header: '日期', key: 'date', isDefault: true },
                { header: '客服', key: 'servicer', isDefault: true },
                { header: '咨询量', key: 'reception_num', isDefault: true },
                { header: '30s应答率', key: 'response_in_30_rate', isDefault: true },
                { header: '满意率', key: 'satisfaction_rate', isDefault: true },
                { header: '24小时下单金额', key: 'amount', isDefault: true },
                { header: '24小时下单转化率', key: 'transfer_rate', isDefault: true },
            ]

            worksheet.columns = columns

            let tmp = JSON.parse(JSON.stringify(tmpDefault))
            let j = 0
            let imageBuffer = fs.readFileSync(img[j].img_url)
            let image = await workbook.addImage({
                buffer: imageBuffer,
                extension: img[j].img_url.split('.')[1]
            })
            worksheet.addImage(image, {
                tl: { col: 12, row: 0 },
                br: { col: 13, row: 1 },
                editAs: 'oneCell',
            })
                
            tmp['shopname'] = data[i].shopname
            tmp['date'] = `${req.query.startDate}~${req.query.endDate}`
            tmp['servicer'] = data[i].servicer
            tmp['reception_num'] = data[i].reception_num
            tmp['response_in_30_rate'] = data[i].response_in_30_rate
            tmp['satisfaction_rate'] = data[i].satisfaction_rate
            tmp['amount'] = data[i].amount
            tmp['transfer_rate'] = data[i].transfer_rate

            worksheet.addRow(data[i])

            for (let i = 1; i < data.length; i++) {
                tmp = JSON.parse(JSON.stringify(tmpDefault))

                if (data[i].shop_name != data[i - 1].shop_name) {
                    j = j + 1
                    worksheet.addRow(JSON.parse(JSON.stringify(tmpDefault)))
                    worksheet.addRow({
                        shopname: '店铺名',
                        date: '日期',
                        servicer: '客服',
                        reception_num: '咨询量',
                        response_in_30_rate: '30s应答率',
                        satisfaction_rate: '满意率',
                        amount: '24小时下单金额',
                        transfer_rate: '24小时下单转化率'
                    })

                    imageBuffer = fs.readFileSync(img[j].img_url)
                    image = await workbook.addImage({
                        buffer: imageBuffer,
                        extension: img[j].img_url.split('.')[1]
                    })
                    worksheet.addImage(image, {
                        tl: { col: 12, row: i },
                        br: { col: 13, row: i + 1 },
                        editAs: 'oneCell',
                    })
                }
                
                tmp['shopname'] = data[i].shopname
                tmp['date'] = `${req.query.startDate}~${req.query.endDate}`
                tmp['servicer'] = data[i].servicer
                tmp['reception_num'] = data[i].reception_num
                tmp['response_in_30_rate'] = data[i].response_in_30_rate
                tmp['satisfaction_rate'] = data[i].satisfaction_rate
                tmp['amount'] = data[i].amount
                tmp['transfer_rate'] = data[i].transfer_rate

                worksheet.addRow(data[i])
            }

            const buffer = await workbook.xlsx.writeBuffer()
            res.setHeader('Content-Disposition', `attachment; filename="jd-${req.query.startDate}-${req.query.endDate}.xlsx"`)
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')        
            return res.send(buffer)
        } else {
            return res.send(biResponse.success({
                data, img
            }))
        }
    } catch (e) {
        next(e)
    }
}

const importJDData = async (req, res, next) => {
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
                let info = []
                let rows = worksheet.getRows(2, worksheet.rowCount - 1)
                
                let count = 0, start_time, end_time                   
                for (let i = 0; i < worksheet.rowCount - 1; i++) {
                    let row = rows[i]
                    if (row.getCell(1).value && row.getCell(1).value == '客服') break
                    else if (row.getCell(1).value && row.getCell(1).value != '店铺名') {
                        info.push(row.getCell(1).value ? row.getCell(1).value.trim(' ') : null)
                        const date = row.getCell(2).value ? row.getCell(2).value : rows[i - 1].getCell(2).value
                        start_time = moment(date.split('-')[0]).format('YYYY-MM-DD')
                        end_time = date.split('-')[1] ? moment(date.split('-')[1]).format('YYYY-MM-DD') : start_time
                        info.push(start_time)
                        info.push(end_time)
                        info.push(row.getCell(3).value ? row.getCell(3).value.trim(' ') : null)
                        info.push(row.getCell(4).value)
                        info.push(row.getCell(5).value)
                        info.push(row.getCell(6).value ? row.getCell(6).value * 100 : null)
                        info.push(row.getCell(7).value)
                        info.push(row.getCell(8).value ? row.getCell(8).value * 100 : null)
                        info.push(row.getCell(9).value ? row.getCell(9).value * 100 : null)
                        info.push(row.getCell(10).value)
                        count = count + 1
                    }
                }
                await jdService.insertjd(count, info)
                const images = worksheet.getImages()
                
                images.forEach(medium => {
                    if (medium.type === 'image') {
                        let image = workbook.getImage(medium.imageId)
                        const dir = `./public/avatar/jd`
                        fs.mkdirSync(dir, { recursive: true })
                        const imgPath = `${dir}/${moment().valueOf()}-${image.name}.${image.extension}`
                        fs.writeFileSync(imgPath, image.buffer)
                        jdService.insertJDImg([imgPath, start_time, end_time])
                    }
                })
                fs.rmSync(newPath)
            }
            return res.send(biResponse.success())
        })
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getJDDataByDate,
    importJDData
}