const wechatRepo = require("@/repository/wechatRepo")
const dateUtil = require("@/utils/dateUtil")

const getChatStatistics = async (startDate,endDate) => {
    return wechatRepo.getChatStatistics(startDate,endDate)
}
const getChatCountNumber = async (startDate,endDate,department) => {
    return wechatRepo.getChatCountNumber(startDate,endDate,department)
}

module.exports = {
    getChatStatistics,
    getChatCountNumber
}