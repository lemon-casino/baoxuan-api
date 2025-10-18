const moment = require('moment')
const dyRepo = require('../../repository/customerService/dyRepo')
const dyService = {}

dyService.getDYDataByDate = async (startDate, endDate, shopname, servicer) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    let lastStart = moment(startDate).subtract(moment(startDate).weekday() + 6, 'day').format('YYYY-MM-DD')
    let lastEnd = moment(startDate).subtract(moment(startDate).weekday(), 'day').format('YYYY-MM-DD')
    let preStart = moment(lastStart).subtract(7, 'day').format('YYYY-MM-DD')
    let preEnd = moment(lastEnd).subtract(7, 'day').format('YYYY-MM-DD')
    let data = await dyRepo.getDYData(start, end,lastStart, lastEnd, preStart, preEnd, shopname, servicer)
    return data || []
}

dyService.getDYKFDataByDate = async (startDate, endDate, servicer) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    let data = await dyRepo.getDYKFData(start, end , servicer)
    return data || []
}

dyService.getDYDPDataByDate = async (startDate, endDate, shopname) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    let data = await dyRepo.getDYDPData(start, end , shopname)
    return data || []
}

dyService.getDYImgByDate = async (startDate, endDate) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    const result = await dyRepo.getDYDataImg(start, end)
    return result || []
}

dyService.insertDY = async (count, info) => {
    return await dyRepo.insertDY(count, info)
}

dyService.insertDYImg = async (info) => {
    return await dyRepo.insertDYImg(info)
}
dyService.getShopName = async(startDate, endDate)=>{
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    result = await dyRepo.getShopName(start, end)
    return result
}
dyService.getServicer = async(startDate, endDate)=>{
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    result = await dyRepo.getServicer(start, end)
    return result
}
module.exports = dyService