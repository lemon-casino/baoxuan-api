const moment = require('moment')
const pddRepo = require('../../repository/customerService/pddRepo')
const pddService = {}

pddService.getPddDataByDate = async (startDate, endDate, shopname, servicer) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    let data = await pddRepo.getPddData(start, end, shopname, servicer)
    return data || []
}
pddService.getPddKFDataByDate = async (startDate, endDate, servicer) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    let data = await pddRepo.getPddKFData(start, end, servicer)
    return data || []
}
pddService.getPddDPDataByDate = async (startDate, endDate, shopname) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    let data = await pddRepo.getPddDPData(start, end, shopname)
    return data || []
}

pddService.getPddImgByDate = async (startDate, endDate) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    const result = await pddRepo.getPddDataImg(start, end)
    return result || []
}

pddService.insertPdd = async (count, info) => {
    return await pddRepo.insertPdd(count, info)
}

pddService.updatePdd = async (info) => {
    return await pddRepo.updatePdd(info)
}

pddService.insertPddImg = async (info) => {
    return await pddRepo.insertPdd(info)
}
pddService.getShopName = async(startDate, endDate)=>{
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    const result = await pddRepo.getShopName(start,end)
    return result
}
pddService.getServicer = async(startDate, endDate)=>{
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    const result = await pddRepo.getServicer(start,end)
    return result
}

module.exports = pddService