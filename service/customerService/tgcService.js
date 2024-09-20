const moment = require('moment')
const tgcRepo = require('../../repository/customerService/tgcRepo')
const tgcService = {}

tgcService.getTGCDataByDate = async (startDate, endDate, servicer_id) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    let lastStart = moment(startDate).subtract(moment(startDate).weekday() + 6, 'day').format('YYYY-MM-DD')
    let lastEnd = moment(startDate).subtract(moment(startDate).weekday(), 'day').format('YYYY-MM-DD')
    let preStart = moment(lastStart).subtract(7, 'day').format('YYYY-MM-DD')
    let preEnd = moment(lastEnd).subtract(7, 'day').format('YYYY-MM-DD')
    let data = await tgcRepo.getTGCData(servicer_id, start, end, lastStart, lastEnd, preStart, preEnd)
    for (let i = 0; i < data?.length; i++) {
        data[i].chain_base_1 = data[i].reception_num_1 > 0 ? 
            ((data[i].reception_num_1 - data[i].reception_num_2) / data[i].reception_num_1 ?? 0).toFixed(2) : 0
        data[i].chain_base_2 = data[i].amount_1 > 0 ? 
            ((data[i].amount_1 - data[i].amount_2 ?? 0) / data[i].amount_1).toFixed(2) : 0
        data[i].chain_base_3 = data[i].transfer_rate_1 > 0 ? 
            ((data[i].transfer_rate_1 - data[i].transfer_rate_2 ?? 0) / data[i].transfer_rate_1).toFixed(2) : 0
    }
    return data || []
}

tgcService.insertTGC = async (count, info) => {
    await tgcRepo.insertTGC(count, info)
}

module.exports = tgcService