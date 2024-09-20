const moment = require('moment')
const xhsRepo = require('../../repository/customerService/xhsRepo')
const xhsService = {}

xhsService.getXHSDataByDate = async (startDate, endDate, servicer_id) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    let data = await xhsRepo.getXHSData(servicer_id, start, end)    
    return data || []
}

xhsService.insertXHS = async (count, info) => {
    await xhsRepo.insertXHS(count, info)
}

module.exports = xhsService