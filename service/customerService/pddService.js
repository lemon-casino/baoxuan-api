const moment = require('moment')
const pddRepo = require('../../repository/customerService/pddRepo')
const pddService = {}

pddService.getPddDataByDate = async (startDate, endDate) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    let data = await pddRepo.getPddData(start, end)
    return data || []
}

pddService.getPddImgByDate = async (startDate, endDate) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    const result = await pddRepo.getPddDataImg(start, end)
    return result || []
}

pddService.insertPdd = async (count, info) => {
    await pddRepo.insertPdd(count, info)
}

pddService.updatePdd = async (info) => {
    await pddRepo.updatePdd(info)
}

pddService.insertPddImg = async (info) => {
    await pddRepo.insertPdd(info)
}

module.exports = pddService