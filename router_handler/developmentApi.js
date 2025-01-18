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
    getDataPannel,
    getDataPannelDetail
}