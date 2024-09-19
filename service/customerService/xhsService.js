const moment = require('moment')
const xhsRepo = require('../../repository/customerService/xhsRepo')
const xhsService = {}

xhsService.getXHSDataByDate = async (startDate, endDate) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    let data = await xhsRepo.getXHSData(start, end)    
    return data || []
}

xhsService.insertXHS = async (count, info) => {
    await xhsRepo.insertXHS(count, info)
}

module.exports = xhsService