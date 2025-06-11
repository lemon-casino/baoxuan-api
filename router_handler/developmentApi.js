const biResponse = require("../utils/biResponse")
const joiUtil = require("../utils/joiUtil")
const developmentService = require('../service/developmentService')
const moment = require('moment')
const ExcelJS = require('exceljs')

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
        result = await developmentService.getRunningProcessInfo()
        worksheet.columns = [
            {header: '流程名称', key: 'title'},
            {header: '链接', key: 'link'},
            {header: '流程标题', key: 'name'},
            {header: '流程创建时间', key: 'create_time'},
            {header: '卡滞节点', key: 'node'},
            {header: '操作人', key: 'operator'},
        ]
        for (let i = 0; i < result.length; i++) {                           
            worksheet.addRow(result[i])
        }
        const buffer = await workbook.xlsx.writeBuffer()
        let start = moment().subtract(14, 'day').format('YYYY-MM-DD')
        let end = moment().format('YYYY-MM-DD')
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
        end = moment(end).format('YYYY-MM-DD')
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
        end = moment(end).format('YYYY-MM-DD')
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
        end = moment(end).format('YYYY-MM-DD')
        const result = await developmentService.getProductDevelopThird(start, end, type, addSales, spu)
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
}