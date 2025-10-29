const processService = require('@/service/processService')
const biResponse = require("@/utils/biResponse")
const joiUtil = require("@/utils/joiUtil")
const {toJSON} = require("lodash/seq");
//查询流程信息
const getProcurementProcessStatistics = async (req, res, next) => {
    try {
        const {startDate,endDate,title,fieldName} = req.body
        //校验请求参数
        joiUtil.validate({
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired}
        })
        //查询流程信息
        const chatStatisticsDatas = await processService.getProcurementProcessStatistics(startDate,endDate)
        return res.send(biResponse.success(chatStatisticsDatas))
    } catch (e) {
        console.log(e)
        next(e)
    }
}
//查询完成流程信息
const getProcessIdsData = async (req, res, next) => {
    try {
        const {startDate,endDate,nickname,dateType,isSelect} = req.body
        //校验请求参数
        joiUtil.validate({
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired}
        })
        //查询采购任务数据
        const processIdsData = await processService.getProcessIdsData(dateType,nickname,startDate,endDate,isSelect)
        return res.send(biResponse.success(processIdsData))
    } catch (e) {
        console.log(e)
        next(e)
    }
}
//查询进行中流程数据
const getProcessIdsTmpData = async (req, res, next) => {
    try {
        const {startDate,endDate,nickname,dateType,isSelect} = req.body
        //校验请求参数
        joiUtil.validate({
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired}
        })
        //查询采购任务数据
        const processIdsTmpData = await processService.getProcessIdsTmpData(dateType,nickname,startDate,endDate,isSelect)
        return res.send(biResponse.success(processIdsTmpData))
    } catch (e) {
        console.log(e)
        next(e)
    }
}
//查询进行中和和已完成表数据
const getProcessMergeIdsData = async (req, res, next) => {
    try {
        const {startDate,endDate,nickname,dateType,isSelect} = req.body
        //校验请求参数
        joiUtil.validate({
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired}
        })
        //查询采购任务数据
        const processMergeIdsData = await processService.getProcessMergeIdsData(dateType,nickname,startDate,endDate,isSelect)
        return res.send(biResponse.success(processMergeIdsData))
    } catch (e) {
        console.log(e)
        next(e)
    }
}

module.exports = {
    getProcurementProcessStatistics,
    getProcessIdsData,
    getProcessIdsTmpData,
    getProcessMergeIdsData,
}