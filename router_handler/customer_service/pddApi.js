const ExcelJS = require('exceljs')
const pddService = require("../../service/customerService/pddService")
const joiUtil = require("../../utils/joiUtil")
const biResponse = require("../../utils/biResponse")
const customerServiceSchema = require("../../schema/customerServiceSchema")
const formidable = require("formidable")
const fs = require('fs')
const moment =  require('moment')

const getPddDataByDate = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(customerServiceSchema.requiredDateSchema, req.query)
        const data = await pddService.getPddDataByDate(req.query.startDate, req.query.endDate, req.query.shopname, req.query.servicer)
        const img = await pddService.getPddImgByDate(req.query.startDate, req.query.endDate)
        const options_shopname=await pddService.getShopName(req.query.startDate, req.query.endDate)
        const options_servicer=await pddService.getServicer(req.query.startDate, req.query.endDate)
        const columns = [
            { header: '店铺名', key: 'shopname', isDefault: true },
            { header: '客服账号', key: 'servicer', isDefault: true },
            { header: '咨询人数', key: 'reception_num', isDefault: true },
            { header: '询单转化率', key: 'reception_rate', isDefault: true },
            { header: '客服销售额', key: 'amount', isDefault: true },
            { header: '3分钟人工回复率(8-23点)', key: 'answer_in_3_rate', isDefault: true },
            { header: '30秒应答率(8-23点)', key: 'response_in_30_rate', isDefault: true },
            { header: '客服服务分', key: 'score', isDefault: true },
        ]
        if (req.query.is_export) {
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet('拼多多')
            let tmpDefault = {
                shopname: null,
                date: null,
                servicer: null,
                reception_num: null,
                reception_rate: null,
                amount: null,
                answer_in_3_rate: null,
                response_in_30_rate: null,
                score: null
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
                tl: { col: 10, row: 0 },
                br: { col: 11, row: 1 },
                editAs: 'oneCell',
            })

            imageBuffer = fs.readFileSync(img[j + 1].img_url)
            image = await workbook.addImage({
                buffer: imageBuffer,
                extension: img[j + 1].img_url.split('.')[1]
            })
            worksheet.addImage(image, {
                tl: { col: 13, row: 0 },
                br: { col: 14, row: 1 },
                editAs: 'oneCell',
            })
                
            tmp['shopname'] = data[i].shopname
            tmp['date'] = `${req.query.startDate}~${req.query.endDate}`
            tmp['servicer'] = data[i].servicer
            tmp['reception_num'] = data[i].reception_num
            tmp['reception_rate'] = data[i].reception_rate + '%'
            tmp['amount'] = data[i].amount
            tmp['answer_in_3_rate'] = data[i].answer_in_3_rate + '%'
            tmp['response_in_30_rate'] = data[i].response_in_30_rate + '%'
            tmp['score'] = data[i].score

            worksheet.addRow(data[i])

            for (let i = 1; i < data.length; i++) {
                tmp = JSON.parse(JSON.stringify(tmpDefault))

                if (data[i].shop_name != data[i - 1].shop_name) {
                    j = j + 2
                    worksheet.addRow(JSON.parse(JSON.stringify(tmpDefault)))
                    worksheet.addRow({
                        shopname: '店铺名',
                        date: '日期',
                        servicer: '客服账号',
                        reception_num: '咨询人数',
                        reception_rate: '询单转化率',
                        amount: '客服销售额',
                        answer_in_3_rate: '3分钟人工回复率(8-23点)',
                        response_in_30_rate: '30秒应答率(8-23点)',
                        score: '客服服务分'
                    })

                    imageBuffer = fs.readFileSync(img[j].img_url)
                    image = await workbook.addImage({
                        buffer: imageBuffer,
                        extension: img[j].img_url.split('.')[1]
                    })
                    worksheet.addImage(image, {
                        tl: { col: 10, row: i },
                        br: { col: 11, row: i + 1 },
                        editAs: 'oneCell',
                    })

                    imageBuffer = fs.readFileSync(img[j + 1].img_url)
                    image = await workbook.addImage({
                        buffer: imageBuffer,
                        extension: img[j + 1].img_url.split('.')[1]
                    })
                    worksheet.addImage(image, {
                        tl: { col: 13, row: i },
                        br: { col: 14, row: i + 1 },
                        editAs: 'oneCell',
                    })
                }
                
                tmp['shopname'] = data[i].shopname
                tmp['date'] = `${req.query.startDate}~${req.query.endDate}`
                tmp['servicer'] = data[i].servicer
                tmp['reception_num'] = data[i].reception_num
                tmp['reception_rate'] = data[i].reception_rate + '%'
                tmp['amount'] = data[i].amount
                tmp['answer_in_3_rate'] = data[i].answer_in_3_rate + '%'
                tmp['response_in_30_rate'] = data[i].response_in_30_rate + '%'
                tmp['score'] = data[i].score

                worksheet.addRow(data[i])
            }

            const buffer = await workbook.xlsx.writeBuffer()
            res.setHeader('Content-Disposition', `attachment; filename="pdd-${req.query.startDate}-${req.query.endDate}.xlsx"`)
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')        
            return res.send(buffer)
        } else {
            return res.send(biResponse.success({
                columns, data, img,options_servicer,options_shopname
            }))
        }
    } catch (e) {
        next(e)
    }
}

const getPddKFDataByDate =async (req, res, next) =>{
    try {
        joiUtil.clarityValidate(customerServiceSchema.requiredDateSchema, req.query)
        const data = await pddService.getPddKFDataByDate(req.query.startDate, req.query.endDate, req.query.servicer)
        const img = await pddService.getPddImgByDate(req.query.startDate, req.query.endDate)
        const options_servicer=await pddService.getServicer(req.query.startDate, req.query.endDate)
        const columns = [
            { header: '客服账号', key: 'servicer', isDefault: true },
            { header: '咨询人数', key: 'reception_num', isDefault: true },
            { header: '询单转化率', key: 'reception_rate', isDefault: true },
            { header: '客服销售额', key: 'amount', isDefault: true },
            { header: '3分钟人工回复率(8-23点)', key: 'answer_in_3_rate', isDefault: true },
            { header: '30秒应答率(8-23点)', key: 'response_in_30_rate', isDefault: true },
            { header: '客服服务分', key: 'score', isDefault: true },
        ]
        if (req.query.is_export) {
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet('拼多多')
            let tmpDefault = {
                shopname: null,
                date: null,
                servicer: null,
                reception_num: null,
                reception_rate: null,
                amount: null,
                answer_in_3_rate: null,
                response_in_30_rate: null,
                score: null
            }

            worksheet.columns = columns

            // let tmp = JSON.parse(JSON.stringify(tmpDefault))
            // let j = 0

            // // let imageBuffer = fs.readFileSync(img[j].img_url)
            // // let image = await workbook.addImage({
            // //     buffer: imageBuffer,
            // //     extension: img[j].img_url.split('.')[1]
            // // })
            // // worksheet.addImage(image, {
            // //     tl: { col: 10, row: 0 },
            // //     br: { col: 11, row: 1 },
            // //     editAs: 'oneCell',
            // // })

            // // imageBuffer = fs.readFileSync(img[j + 1].img_url)
            // // image = await workbook.addImage({
            // //     buffer: imageBuffer,
            // //     extension: img[j + 1].img_url.split('.')[1]
            // // })
            // // worksheet.addImage(image, {
            // //     tl: { col: 13, row: 0 },
            // //     br: { col: 14, row: 1 },
            // //     editAs: 'oneCell',
            // // })
            // tmp['servicer'] = data[i].servicer
            // tmp['date'] = `${req.query.startDate}~${req.query.endDate}`
            // tmp['reception_num'] = data[i].reception_num
            // tmp['reception_rate'] = data[i].reception_rate + '%'
            // tmp['amount'] = data[i].amount
            // tmp['answer_in_3_rate'] = data[i].answer_in_3_rate + '%'
            // tmp['response_in_30_rate'] = data[i].response_in_30_rate + '%'
            // tmp['score'] = data[i].score

            // worksheet.addRow(data[i])

            for (let i = 1; i < data.length; i++) {
                tmp = JSON.parse(JSON.stringify(tmpDefault))

                if (data[i].shop_name != data[i - 1].shop_name) {
                    j = j + 2
                    worksheet.addRow(JSON.parse(JSON.stringify(tmpDefault)))
                    worksheet.addRow({
                        servicer: '客服账号',
                        reception_num: '咨询人数',
                        reception_rate: '询单转化率',
                        amount: '客服销售额',
                        answer_in_3_rate: '3分钟人工回复率(8-23点)',
                        response_in_30_rate: '30秒应答率(8-23点)',
                        score: '客服服务分'
                    })

                    // imageBuffer = fs.readFileSync(img[j].img_url)
                    // image = await workbook.addImage({
                    //     buffer: imageBuffer,
                    //     extension: img[j].img_url.split('.')[1]
                    // })
                    // worksheet.addImage(image, {
                    //     tl: { col: 10, row: i },
                    //     br: { col: 11, row: i + 1 },
                    //     editAs: 'oneCell',
                    // })

                    // imageBuffer = fs.readFileSync(img[j + 1].img_url)
                    // image = await workbook.addImage({
                    //     buffer: imageBuffer,
                    //     extension: img[j + 1].img_url.split('.')[1]
                    // })
                    // worksheet.addImage(image, {
                    //     tl: { col: 13, row: i },
                    //     br: { col: 14, row: i + 1 },
                    //     editAs: 'oneCell',
                    // })
                }
                tmp['date'] = `${req.query.startDate}~${req.query.endDate}`
                tmp['servicer'] = data[i].servicer
                tmp['reception_num'] = data[i].reception_num
                tmp['reception_rate'] = data[i].reception_rate + '%'
                tmp['amount'] = data[i].amount
                tmp['answer_in_3_rate'] = data[i].answer_in_3_rate + '%'
                tmp['response_in_30_rate'] = data[i].response_in_30_rate + '%'
                tmp['score'] = data[i].score

                worksheet.addRow(data[i])
            }

            const buffer = await workbook.xlsx.writeBuffer()
            res.setHeader('Content-Disposition', `attachment; filename="pdd-${req.query.startDate}-${req.query.endDate}.xlsx"`)
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')        
            return res.send(buffer)
        } else {
            return res.send(biResponse.success({
                columns,img, data,options_servicer
                
            }))
        }
    } catch (e) {
        next(e)
    }

}

const getPddDPDataByDate =async (req, res, next) =>{
    try {
        joiUtil.clarityValidate(customerServiceSchema.requiredDateSchema, req.query)
        const data = await pddService.getPddDPDataByDate(req.query.startDate, req.query.endDate, req.query.shopname, req.query.servicer)
        const img = await pddService.getPddImgByDate(req.query.startDate, req.query.endDate)
        const options_shopname=await pddService.getShopName(req.query.startDate, req.query.endDate)
        const columns = [
            { header: '店铺名', key: 'shopname', isDefault: true },
            { header: '咨询人数', key: 'reception_num', isDefault: true },
            { header: '询单转化率', key: 'reception_rate', isDefault: true },
            { header: '客服销售额', key: 'amount', isDefault: true },
            { header: '3分钟人工回复率(8-23点)', key: 'answer_in_3_rate', isDefault: true },
            { header: '30秒应答率(8-23点)', key: 'response_in_30_rate', isDefault: true },
            { header: '客服服务分', key: 'score', isDefault: true },
        ]
        if (req.query.is_export) {
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet('拼多多')
            let tmpDefault = {
                shopname: null,
                date: null,
                servicer: null,
                reception_num: null,
                reception_rate: null,
                amount: null,
                answer_in_3_rate: null,
                response_in_30_rate: null,
                score: null
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
                tl: { col: 10, row: 0 },
                br: { col: 11, row: 1 },
                editAs: 'oneCell',
            })

            imageBuffer = fs.readFileSync(img[j + 1].img_url)
            image = await workbook.addImage({
                buffer: imageBuffer,
                extension: img[j + 1].img_url.split('.')[1]
            })
            worksheet.addImage(image, {
                tl: { col: 13, row: 0 },
                br: { col: 14, row: 1 },
                editAs: 'oneCell',
            })
                
            tmp['shopname'] = data[i].shopname
            tmp['date'] = `${req.query.startDate}~${req.query.endDate}`
            tmp['reception_num'] = data[i].reception_num
            tmp['reception_rate'] = data[i].reception_rate + '%'
            tmp['amount'] = data[i].amount
            tmp['answer_in_3_rate'] = data[i].answer_in_3_rate + '%'
            tmp['response_in_30_rate'] = data[i].response_in_30_rate + '%'
            tmp['score'] = data[i].score

            worksheet.addRow(data[i])

            for (let i = 1; i < data.length; i++) {
                tmp = JSON.parse(JSON.stringify(tmpDefault))

                if (data[i].shop_name != data[i - 1].shop_name) {
                    j = j + 2
                    worksheet.addRow(JSON.parse(JSON.stringify(tmpDefault)))
                    worksheet.addRow({
                        shopname: '店铺名',
                        reception_num: '咨询人数',
                        reception_rate: '询单转化率',
                        amount: '客服销售额',
                        answer_in_3_rate: '3分钟人工回复率(8-23点)',
                        response_in_30_rate: '30秒应答率(8-23点)',
                        score: '客服服务分'
                    })

                    imageBuffer = fs.readFileSync(img[j].img_url)
                    image = await workbook.addImage({
                        buffer: imageBuffer,
                        extension: img[j].img_url.split('.')[1]
                    })
                    worksheet.addImage(image, {
                        tl: { col: 10, row: i },
                        br: { col: 11, row: i + 1 },
                        editAs: 'oneCell',
                    })

                    imageBuffer = fs.readFileSync(img[j + 1].img_url)
                    image = await workbook.addImage({
                        buffer: imageBuffer,
                        extension: img[j + 1].img_url.split('.')[1]
                    })
                    worksheet.addImage(image, {
                        tl: { col: 13, row: i },
                        br: { col: 14, row: i + 1 },
                        editAs: 'oneCell',
                    })
                }
                
                tmp['shopname'] = data[i].shopname
                tmp['date'] = `${req.query.startDate}~${req.query.endDate}`
                tmp['reception_num'] = data[i].reception_num
                tmp['reception_rate'] = data[i].reception_rate + '%'
                tmp['amount'] = data[i].amount
                tmp['answer_in_3_rate'] = data[i].answer_in_3_rate + '%'
                tmp['response_in_30_rate'] = data[i].response_in_30_rate + '%'
                tmp['score'] = data[i].score

                worksheet.addRow(data[i])
            }

            const buffer = await workbook.xlsx.writeBuffer()
            res.setHeader('Content-Disposition', `attachment; filename="pdd-${req.query.startDate}-${req.query.endDate}.xlsx"`)
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')        
            return res.send(buffer)
        } else {
            return res.send(biResponse.success({
                columns, data, img,options_shopname
            }))
        }
    } catch (e) {
        next(e)
    }

}

const importPddData = async (req, res, next) => {
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
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let info = []
                let rows = worksheet.getRows(2, worksheet.rowCount - 1)
                
                let count = 0, start_time, end_time                    
                for (let i = 0; i < worksheet.rowCount - 1; i++) {
                    let row = rows[i]
                    if (row.getCell(1).value && row.getCell(1).value == '客服账号') break
                    else if ((row.getCell(1).value && row.getCell(1).value != '店铺名') && (row.getCell(1).value && row.getCell(1).value != '均值') && (row.getCell(1).value && row.getCell(1).value != '合计')) {
                        info.push(row.getCell(1).value ? row.getCell(1).value.trim(' ') : null)
                        const date = row.getCell(2).value ? row.getCell(2).value : 
                            (rows[i - 1].getCell(2).value ? rows[i - 1].getCell(2).value : rows[i - 2].getCell(2).value)
                        if (date.toString().indexOf('~') != -1) {
                            start_time = date.split(' ~ ')[0]
                            end_time = date.split(' ~ ')[1] ? date.split(' ~ ')[1] : start_time
                        } else {
                            start_time = end_time = moment(date).format('YYYY-MM-DD')
                        }
                        info.push(start_time)
                        info.push(end_time)
                        info.push(row.getCell(3).value ? row.getCell(3).value.trim(' ') : null)
                        info.push(row.getCell(4).value != '--' ? row.getCell(4).value : null)
                        info.push(row.getCell(5).value != '--' ? row.getCell(5).value : null)
                        info.push(typeof(row.getCell(6).value) == "number" ? Number((row.getCell(6).value * 100).toFixed(2)) : null)
                        info.push(row.getCell(7).value != '--' ? row.getCell(7).value : null)
                        info.push(typeof(row.getCell(8).value) == "number" ? Number((row.getCell(8).value * 100).toFixed(2)) : null)
                        info.push(typeof(row.getCell(9).value) == "number" ? Number((row.getCell(9).value * 100).toFixed(2)) : null)
                        info.push(row.getCell(10).value != '--' ? row.getCell(10).value : null)

                        count = count + 1
                    }
                }
                if (count > 0) {
                    let row = await pddService.insertPdd(count, info)
                    console.log(count,info)
                    if (row?.affectedRows) {
                        const images = worksheet.getImages()                    
                        images.forEach(medium => {
                            if (medium.type === 'image') {
                                let image = workbook.getImage(medium.imageId)
                                const dir = `./public/avatar/pdd`
                                fs.mkdirSync(dir, { recursive: true })
                                const imgPath = `${dir}/${moment().valueOf()}-${image.name}.${image.extension}`
                                fs.writeFileSync(imgPath, image.buffer)
                                pddService.insertPddImg([imgPath, start_time, end_time])
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
    getPddDataByDate,
    getPddKFDataByDate,
    getPddDPDataByDate,
    importPddData
}