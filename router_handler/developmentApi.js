const biResponse = require("../utils/biResponse")
const joiUtil = require("../utils/joiUtil")
const developmentService = require('../service/developmentService')
const moment = require('moment')

const getWorkPannel = async (req, res, next) => {
    try {
        const {type, startDate, endDate, months} = req.query
        joiUtil.validate({
            type: {value: type, schema: joiUtil.commonJoiSchemas.strRequired}
        })
        let start, end, month
        switch (type) {
            case '1':
            case '2':
            case '3':
                joiUtil.validate({
                    startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
                    endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired}
                })
                start = moment(startDate).format('YYYY-MM-DD')
                end = moment(endDate).format('YYYY-MM-DD') + ' 23:59:59'
                break
            case '4':
                joiUtil.validate({
                    months: {value: months, schema: joiUtil.commonJoiSchemas.strRequired}
                })
                month = JSON.parse(months)
                break
            default:
                return res.send(biResponse.canTFindIt())
        }
        const result = await developmentService.getDataStats(type, start, end, month)
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
        joiUtil.validate({
            currentPage: {value: currentPage, schema: joiUtil.commonJoiSchemas.strRequired},
            pageSize: {value: pageSize, schema: joiUtil.commonJoiSchemas.strRequired}
        })
        let limit = parseInt(pageSize)
        let offset = (currentPage - 1) * pageSize
        const result = await developmentService.getProjectData(limit, offset, req.query.search)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const createProjectData = async (req, res, next) => {
    try {
        const {
            first_category, second_category, type, goods_name, seasons, patent_belongs, 
            schedule_time, analyse_link, sale_purpose, exploitation_features, 
            core_reasons, product_img
        } = req.body
        const user_id = req.user.id
        joiUtil.validate({
            first_category: {value: first_category, schema: joiUtil.commonJoiSchemas.strRequired}, 
            second_category: {value: second_category, schema: joiUtil.commonJoiSchemas.strRequired},  
            type: {value: type, schema: joiUtil.commonJoiSchemas.strRequired}, 
            goods_name: {value: goods_name, schema: joiUtil.commonJoiSchemas.strRequired}, 
            seasons: {value: seasons, schema: joiUtil.commonJoiSchemas.strRequired}, 
            patent_belongs: {value: patent_belongs, schema: joiUtil.commonJoiSchemas.strRequired}, 
            schedule_time: {value: schedule_time, schema: joiUtil.commonJoiSchemas.strRequired}, 
            analyse_link: {value: analyse_link, schema: joiUtil.commonJoiSchemas.strRequired}, 
            sale_purpose: {value: sale_purpose, schema: joiUtil.commonJoiSchemas.strRequired}, 
            exploitation_features: {value: exploitation_features, schema: joiUtil.commonJoiSchemas.strRequired}, 
            core_reasons: {value: core_reasons, schema: joiUtil.commonJoiSchemas.strRequired}, 
            product_img: {value: product_img, schema: joiUtil.commonJoiSchemas.strRequired}
        })
        req.body.schedule_time = moment(req.body.schedule_time).format('YYYY-MM-DD')
        const result = await developmentService.createProjectData(user_id, req.body)
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
        const result = await developmentService.updateProjectData(user_id, id, req.body)
        if (result)
            return res.send(biResponse.success(result))
        else if (result === false)
            return res.send(biResponse.createFailed())
        return res.send(biResponse.createFailed('立项不存在'))
    } catch (e) {
        next(e)
    }
}

const updateProjectDataStatus = async (req, res, next) => {
    try {
        const {status} = req.body
        joiUtil.validate({
            status: {value: status, schema: joiUtil.commonJoiSchemas.required}
        })
        const id = req.params.id     
        const user_id = req.user.id
        const dingding_user_id = req.user.userId
        const result = await developmentService.updateProjectDataStatus(user_id, id, status, dingding_user_id)
        if (result)
            return res.send(biResponse.success(result))
        else if (result === false)
            return res.send(biResponse.createFailed())
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

module.exports = {
    getWorkPannel, 
    getWorkDetail,
    getProjectData,
    createProjectData,
    updateProjectData,
    updateProjectDataStatus,
    getDataPannel,
    getDataPannelProject,
    getDataPannelDetail,
    getCategoryList
}