const moment = require('moment')
const dyRepo = require('../../repository/customerService/dyRepo')
const dyService = {}

dyService.getDYDataByDate = async (startDate, endDate) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    let data = await dyRepo.getDYData(start, end)
    return data || []
}

dyService.getDYImgByDate = async (startDate, endDate) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    const result = await dyRepo.getDYDataImg(start, end)
    return result
}

dyService.insertDY = async (count, info) => {
    await dyRepo.insertDY(count, info)
}

dyService.insertDYImg = async (info) => {
    await dyRepo.insertDYImg(info)
}

module.exports = dyService