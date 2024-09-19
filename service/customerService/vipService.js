const moment = require('moment')
const vipRepo = require('../../repository/customerService/vipRepo')
const vipService = {}

vipService.getVIPDataByDate = async (startDate, endDate) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    let data = await vipRepo.getVIPData(start, end)
    return data || []
}

vipService.insertVIP = async (count, info) => {
    await vipRepo.insertVIP(count, info)
}

module.exports = vipService