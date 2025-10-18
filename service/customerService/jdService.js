const moment = require('moment')
const jdRepo = require('../../repository/customerService/jdRepo')
const jdService = {}

jdService.getJDDataByDate = async (startDate, endDate, shopname, servicer) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    let lastStart = moment(startDate).subtract(moment(startDate).weekday() + 6, 'day').format('YYYY-MM-DD')
    let lastEnd = moment(startDate).subtract(moment(startDate).weekday(), 'day').format('YYYY-MM-DD')
    let preStart = moment(lastStart).subtract(7, 'day').format('YYYY-MM-DD')
    let preEnd = moment(lastEnd).subtract(7, 'day').format('YYYY-MM-DD')
    let data = await jdRepo.getJDData(start, end, lastStart, lastEnd, preStart, preEnd, shopname, servicer)
    return data || []
}

jdService.getJDKFDataByDate = async (startDate, endDate, servicer) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    let data = await jdRepo.getJDKFData(start, end,servicer)
    return data || []
}
jdService.getJDDPDataByDate = async (startDate,endDate,shopname) =>{
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    let data = await jdRepo.getJDDPData(start, end,shopname)
    return data || []
}
jdService.getJDImgByDate = async (startDate, endDate) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    const result = await jdRepo.getJDDataImg(start, end)
    return result || []
}

jdService.insertJD = async (count, info) => {
    return await jdRepo.insertJD(count, info)
}

jdService.insertJDImg = async (info) => {
    return await jdRepo.insertJDImg(info)
}
jdService.getShopName = async(startDate,endDate)=>{
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    return await jdRepo.getShopName(start,end)
}
jdService.getServicer = async(startDate,endDate)=>{
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    return await jdRepo.getServicer(start,end)
}
module.exports = jdService