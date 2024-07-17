const wechatService = require('@/service/wechatService')
const biResponse = require("@/utils/biResponse")
const joiUtil = require("@/utils/joiUtil")
const {toJSON} = require("lodash/seq");
//查询微信聊天统计
const chatStatistics = async (req, res, next) => {
    try {
        const {startDate,endDate,department} = req.body
        //校验请求参数
        joiUtil.validate({
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            department
        })
        //查询建联统计
        const chatStatisticsDatas = await wechatService.getChatStatistics(startDate,endDate)
        //查询新增数量
        const chatCountNumberDatas = await wechatService.getChatCountNumber(startDate,endDate,department)
        const resData = {
            chatStatisticsDatas:chatStatisticsDatas,
            chatCountNumberDatas:chatCountNumberDatas
        }
        return res.send(biResponse.success(resData))
    } catch (e) {
        console.log(e)
        next(e)
    }
}

module.exports = {
    chatStatistics
}