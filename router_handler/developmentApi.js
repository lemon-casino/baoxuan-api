const biResponse = require("../utils/biResponse")
const joiUtil = require("../utils/joiUtil")
const developmentService = require('../service/developmentService')
const ShippingAttributeService = require('../service/development/shippingattribute')
const moment = require('moment')
const ExcelJS = require('exceljs')
const formidable = require("formidable")
const fs = require('fs')
const { result } = require("lodash")

const getWorkPannel = async (req, res, next) => {
    try {
        const {type, startDate, endDate, months, timeType, project, process} = req.query
        joiUtil.validate({
            type: {value: type, schema: joiUtil.commonJoiSchemas.strRequired}
        })
        let start, end, month
        switch (type) {
            case '1':
            case '3':
            case '4':
                joiUtil.validate({
                    startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
                    endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired}
                })
                start = moment(startDate).format('YYYY-MM-DD')
                end = moment(endDate).format('YYYY-MM-DD') + ' 23:59:59'
                break
            case '5':
                joiUtil.validate({
                    months: {value: months, schema: joiUtil.commonJoiSchemas.strRequired}
                })
                month = JSON.parse(months)
                break
            case '2':
                joiUtil.validate({
                    startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
                    endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired},
                    timeType: {value: timeType, schema: joiUtil.commonJoiSchemas.strRequired}
                })
                start = moment(startDate).format('YYYY-MM-DD')
                end = moment(endDate).format('YYYY-MM-DD') + ' 23:59:59'
                break
            default:
                return res.send(biResponse.canTFindIt())
        }
        const result = await developmentService.getDataStats(type, start, end, month, timeType, project, process)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getWorkDetail = async (req, res, next) => {
    try {
        const {startDate, endDate, id} = req.query
        joiUtil.validate({
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.strRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.strRequired},
            id: {value: id, schema: joiUtil.commonJoiSchemas.strRequired}
        })
        let start = moment(startDate).format('YYYY-MM-DD')
        let end = moment(endDate).format('YYYY-MM-DD') + ' 23:59:59'
        const result = await developmentService.getWorkDetail(start, end, id)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getProjectData = async (req, res, next) => {
    try {
        const {currentPage, pageSize} = req.query
        const type = req.params.type
        joiUtil.validate({
            currentPage: {value: currentPage, schema: joiUtil.commonJoiSchemas.strRequired},
            pageSize: {value: pageSize, schema: joiUtil.commonJoiSchemas.strRequired}
        })
        let limit = parseInt(pageSize)
        let offset = (currentPage - 1) * pageSize
        const result = await developmentService.getProjectData(limit, offset, req.query.search, type, req.user.id)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const createProjectData = async (req, res, next) => {
    try {
        const type = req.params.type
        const user_id = req.user.id
        const result = await developmentService.createProjectData(user_id, req.body, type)
        if (result)
            return res.send(biResponse.success(result))
        else if (result === false)
            return res.send(biResponse.createFailed())
        return res.send(biResponse.createFailed('立项产品名称已存在'))
    } catch (e) {
        next(e)
    }
}

const updateProjectData = async (req, res, next) => {
    try {
        const id = req.params.id
        const user_id = req.user.id
        const type = req.params.type
        const result = await developmentService.updateProjectData(user_id, id, req.body, type)
        if (result)
            return res.send(biResponse.success(result))
        else if (result === false)
            return res.send(biResponse.createFailed())
        return res.send(biResponse.createFailed('立项产品名称已存在或立项不存在'))
    } catch (e) {
        next(e)
    }
}

const start = async (req, res, next) => {
    try {
        const id = req.params.id  
        const type = req.params.type   
        const user_id = req.user.id
        const result = await developmentService.start(type, id, user_id)
        if (result)
            return res.send(biResponse.success(result))
        else if (result === false)
            return res.send(biResponse.createFailed('发起流程失败'))
        return res.send(biResponse.createFailed('立项不存在'))
    } catch (e) {
        next(e)
    }
}

const getCategoryList = async (req, res, next) => {
    try {
        const {parent_id} = req.query
        joiUtil.validate({
            parent_id: {value: parent_id, schema: joiUtil.commonJoiSchemas.required}
        })
        const result = await developmentService.getCategoryList(parent_id)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getDataPannel = async (req, res, next) => {
    try {
        const {type, month, currentPage, pageSize, sort} = req.query
        joiUtil.validate({
            type: {value: type, schema: joiUtil.commonJoiSchemas.strRequired},
            month: {value: month, schema: joiUtil.commonJoiSchemas.strRequired},
            currentPage: {value: currentPage, schema: joiUtil.commonJoiSchemas.dateRequired},
            pageSize: {value: pageSize, schema: joiUtil.commonJoiSchemas.dateRequired}
        })
        let limit = parseInt(pageSize)
        let offset = (currentPage - 1) * pageSize
        const result = await developmentService.getSaleStats(type, month, limit, offset, sort)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getDataPannelProject = async (req, res, next) => {
    try {
        const {type, month, brief_product_line} = req.query
        joiUtil.validate({
            type: {value: type, schema: joiUtil.commonJoiSchemas.strRequired},
            month: {value: month, schema: joiUtil.commonJoiSchemas.strRequired},
            brief_product_line: {value: brief_product_line, schema: joiUtil.commonJoiSchemas.strRequired}
        })
        const result = await developmentService.getSaleStatsPoject(type, month, brief_product_line)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getDataPannelDetail = async (req, res, next) => {
    try {
        const {type, month, brief_product_line} = req.query
        joiUtil.validate({
            type: {value: type, schema: joiUtil.commonJoiSchemas.strRequired},
            month: {value: month, schema: joiUtil.commonJoiSchemas.strRequired},
            brief_product_line: {value: brief_product_line, schema: joiUtil.commonJoiSchemas.strRequired}
        })
        const result = await developmentService.getSaleStatsDetail(type, month, brief_product_line)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getRunningProcessInfo = async (req, res, next) => {
    try {
        let result           
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet()
        result = await developmentService.getRunningProcessInfo(req.query)
        worksheet.columns = [
            {header: '日期', key: 'create_time'},
            {header: '链接', key: 'link'},
            {header: '推品类型', key: 'type'},
            {header: '流程名称', key: 'title'},
            {header: '发起人', key: 'nickname'},
            {header: '开发人', key: 'developer'},
            {header: '渠道', key: 'platform'},
            {header: '目前卡滞人', key: 'operator'},
            {header: '目前卡滞节点', key: 'node'},
            {header: '开始时间', key: 'start_time'},
            {header: '审批状态', key: 'task_status'},
            {header: '审批建议', key: 'task_reason'},
            {header: '卡滞天数', key: 'due_date'},
        ]
        for (let i = 0; i < result.length; i++) {                           
            worksheet.addRow(result[i])
        }
        const buffer = await workbook.xlsx.writeBuffer()
        let start = moment(req.query.start_time).format('YYYY-MM-DD') || moment().format('YYYY-MM-DD')
        let end = moment(req.query.end_time).format('YYYY-MM-DD') || moment().format('YYYY-MM-DD')
        res.setHeader('Content-Disposition', `attachment; filename="${start}~${end}~running-process.xlsx"`)
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')        
        return res.send(buffer)
    } catch (e) {
        next(e)
    }
}

const getFinishProcessInfo = async (req, res, next) => {
    try {
        let result           
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet()
        result = await developmentService.getFinishProcessInfo()
        worksheet.columns = [
            {header: '流程名称', key: 'title'},
            {header: '链接', key: 'link'},
            {header: '流程标题', key: 'name'},
            {header: '流程创建时间', key: 'create_time'},
            {header: '流程状态', key: 'status'},
            {header: '完结原因', key: 'reason'},
        ]
        for (let i = 0; i < result.length; i++) {                           
            worksheet.addRow(result[i])
        }
        const buffer = await workbook.xlsx.writeBuffer()
        let start = moment().subtract(14, 'day').format('YYYY-MM-DD')
        let end = moment().format('YYYY-MM-DD')
        res.setHeader('Content-Disposition', `attachment; filename="${start}~${end}~finish-process.xlsx"`)
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')        
        return res.send(buffer)
    } catch (e) {
        next(e)
    }
}

const getProductDevelopFirst = async (req, res, next) => {
    try {
        let {start, end, type, addSales} = req.query
        joiUtil.validate({
            type: {value: type, schema: joiUtil.commonJoiSchemas.strRequired},
            start: {value: start, schema: joiUtil.commonJoiSchemas.strRequired},
            end: {value: end, schema: joiUtil.commonJoiSchemas.strRequired},
            addSales: {value: addSales, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        start = moment(start).format('YYYY-MM-DD')
        end = moment(end).format('YYYY-MM-DD') + ' 23:59:59'
        const result = await developmentService.getProductDevelopFirst(start, end, type, addSales)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getProductDevelopSecond = async (req, res, next) => {
    try {
        let {start, end, type, addSales, platform} = req.query
        joiUtil.validate({
            type: {value: type, schema: joiUtil.commonJoiSchemas.strRequired},
            start: {value: start, schema: joiUtil.commonJoiSchemas.strRequired},
            end: {value: end, schema: joiUtil.commonJoiSchemas.strRequired},
            addSales: {value: addSales, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        start = moment(start).format('YYYY-MM-DD')
        end = moment(end).format('YYYY-MM-DD') + ' 23:59:59'
        const result = await developmentService.getProductDevelopSecond(start, end, type, addSales, platform)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getProductDevelopThird = async (req, res, next) => {
    try {
        let {start, end, type, addSales, spu} = req.query
        joiUtil.validate({
            type: {value: type, schema: joiUtil.commonJoiSchemas.strRequired},
            start: {value: start, schema: joiUtil.commonJoiSchemas.strRequired},
            end: {value: end, schema: joiUtil.commonJoiSchemas.strRequired},
            addSales: {value: addSales, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        start = moment(start).format('YYYY-MM-DD')
        end = moment(end).format('YYYY-MM-DD') + ' 23:59:59'
        const result = await developmentService.getProductDevelopThird(start, end, type, addSales, spu)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getProductSalesFirst = async (req, res, next) => {
    try {
        let {start, end, type, productType, addSales} = req.query
        joiUtil.validate({
            start: {value: start, schema: joiUtil.commonJoiSchemas.strRequired},
            end: {value: end, schema: joiUtil.commonJoiSchemas.strRequired},
            type: {value: type, schema: joiUtil.commonJoiSchemas.strRequired},
            productType: {value: productType, schema: joiUtil.commonJoiSchemas.strRequired},
            addSales: {value: addSales, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        const result = await developmentService.getProductSalesFirst(start, end, type, productType, addSales)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getProductSalesSecond = async (req, res, next) => {
    try {
        let {start, end, type, productType, addSales} = req.query
        joiUtil.validate({
            start: {value: start, schema: joiUtil.commonJoiSchemas.strRequired},
            end: {value: end, schema: joiUtil.commonJoiSchemas.strRequired},
            type: {value: type, schema: joiUtil.commonJoiSchemas.strRequired},
            productType: {value: productType, schema: joiUtil.commonJoiSchemas.strRequired},
            addSales: {value: addSales, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        const result = await developmentService.getProductSalesSecond(start, end, type, productType, addSales)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getProductSalesThird = async (req, res, next) => {
    try {
        let {start, end, type, productType, addSales, shop_name} = req.query
        joiUtil.validate({
            start: {value: start, schema: joiUtil.commonJoiSchemas.strRequired},
            end: {value: end, schema: joiUtil.commonJoiSchemas.strRequired},
            type: {value: type, schema: joiUtil.commonJoiSchemas.strRequired},
            productType: {value: productType, schema: joiUtil.commonJoiSchemas.strRequired},
            addSales: {value: addSales, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        const result = await developmentService.getProductSalesThird(start, end, type, productType, addSales, shop_name)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getProductSalesFourth = async (req, res, next) => {
    try {
        let {start, end, type, productType, addSales, spu} = req.query
        joiUtil.validate({
            start: {value: start, schema: joiUtil.commonJoiSchemas.strRequired},
            end: {value: end, schema: joiUtil.commonJoiSchemas.strRequired},
            type: {value: type, schema: joiUtil.commonJoiSchemas.strRequired},
            productType: {value: productType, schema: joiUtil.commonJoiSchemas.strRequired},
            addSales: {value: addSales, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        const result = await developmentService.getProductSalesFourth(start, end, type, productType, addSales, spu)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getProductDevelopInfo = async (req, res, next) => {
    try {
        let {start, end, infoType} = req.query
        joiUtil.validate({
            start: {value: start, schema: joiUtil.commonJoiSchemas.strRequired},
            end: {value: end, schema: joiUtil.commonJoiSchemas.strRequired},
            infoType: {value: infoType, schema: joiUtil.commonJoiSchemas.strNumRequired}
        })
        const result = await developmentService.getProductDevelopInfo(req.query, req.user.id)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getProductDevelopInfoDetail = async (req, res, next) => {
    try {
        const result = await developmentService.getProductDevelopInfoDetail(req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getProductDevelopSales = async (req, res, next) => {
    try {
        let {start, end, salesType} = req.query
        joiUtil.validate({
            start: {value: start, schema: joiUtil.commonJoiSchemas.strRequired},
            end: {value: end, schema: joiUtil.commonJoiSchemas.strRequired},
            salesType: {value: salesType, schema: joiUtil.commonJoiSchemas.strNumRequired}
        })
        const result = await developmentService.getProductDevelopSales(req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getProductDevelopDirectorSales = async (req, res, next) => {
    try {
        let {start, end} = req.query
        joiUtil.validate({
            start: {value: start, schema: joiUtil.commonJoiSchemas.strRequired},
            end: {value: end, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        const result = await developmentService.getProductDevelopDirectorSales(req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getProductSales = async (req, res, next) => {
    try {
        let {start, end} = req.query
        joiUtil.validate({
            start: {value: start, schema: joiUtil.commonJoiSchemas.strRequired},
            end: {value: end, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        const result = await developmentService.getProductSales(req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const UploadShippingAttribute = async (req, res, next) => {
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
            let readRes = await workbook.xlsx.readFile(newPath)
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let rows = worksheet.getRows(1, worksheet.rowCount)
                let result = await ShippingAttributeService.UploadShippingAttribute(rows)
                if (result) {
                    fs.rmSync(newPath)
                } else {
                    return res.send(biResponse.createFailed())
                }
            }
            return res.send(biResponse.success({ code: 200, data: "文件上传并解析成功!" }))
        })
    } catch (e) {
        next(e)
    }
}

const getShippingAttribute = async (req, res, next) => {
    try {
        let result = await ShippingAttributeService.getShippingAttribute()
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getsputags = async (req, res, next) => {
    try {
        const {type} = req.query
        joiUtil.validate({
            type: {value: type, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        let result = await developmentService.getsputags(type)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getfirst = async (req, res, next) => {
    try {
        const {type} = req.query
        joiUtil.validate({
            type: {value: type, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        let result = await developmentService.getfirst(type)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getfirstInfo = async (req, res, next) => {
    try {
        const {type,first,second,third} = req.query
        joiUtil.validate({
            type: {value: type, schema: joiUtil.commonJoiSchemas.strRequired},
            first: {value: first, schema: joiUtil.commonJoiSchemas.strRequired},
            second: {value: second, schema: joiUtil.commonJoiSchemas.strRequired},
            third: {value: third, schema: joiUtil.commonJoiSchemas.strRequired}
        })
        let result = await developmentService.getfirstInfo(type,first,second,third)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getProcessInfo = async (req, res, next) => {
    try {
        let result = await developmentService.getProcessInfo(req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getProcessDetail = async (req, res, next) => {
    try {
        let result = await developmentService.getProcessDetail(req.query)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getWorkPannel, 
    getWorkDetail,
    getProjectData,
    createProjectData,
    updateProjectData,
    start,
    getDataPannel,
    getDataPannelProject,
    getDataPannelDetail,
    getCategoryList,
    getFinishProcessInfo,
    getRunningProcessInfo,
    getProductDevelopFirst,
    getProductDevelopSecond,
    getProductDevelopThird,
    getProductSalesFirst,
    getProductSalesSecond,
    getProductSalesThird,
    getProductSalesFourth,
    getProductDevelopInfo,
    getProductDevelopInfoDetail,
    getProductDevelopSales,
    getProductDevelopDirectorSales,
    getProductSales,
    UploadShippingAttribute,
    getShippingAttribute,
    getsputags,
    getfirst,
    getfirstInfo,
    getProcessInfo,
    getProcessDetail
}