const moment = require('moment')
const tmallRepo = require('../../repository/customerService/tmallRepo')
const tmallService = {}

tmallService.getTmallAsByDate = async (startDate, endDate, servicer) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    let lastStart = moment(startDate).subtract(moment(startDate).weekday() + 6, 'day').format('YYYY-MM-DD')
    let lastEnd = moment(startDate).subtract(moment(startDate).weekday(), 'day').format('YYYY-MM-DD')
    let preStart = moment(lastStart).subtract(7, 'day').format('YYYY-MM-DD')
    let preEnd = moment(lastEnd).subtract(7, 'day').format('YYYY-MM-DD')
    let data = await tmallRepo.getTmallAs(servicer, start, end, lastStart, lastEnd, preStart, preEnd)
    for (let i = 0; i < data?.length; i++) {
        data[i].rank_1 = data[i].rank_1 ?? i + 1
        for (let j = i + 1; j < data.length; j++) {
            if (data[i].satisfaction_rate_1 < data[j].satisfaction_rate_1) {
                data[i].rank_1 = i + 1
                data[j].rank_1 = j + 1
            }
        }
        data[i].chain_base_1 = data[i].service_num_1 > 0 ? 
            ((data[i].service_num_1 - data[i].service_num_2) / data[i].service_num_1 ?? 0).toFixed(2) : 0
        data[i].chain_base_2 = data[i].satisfaction_rate_1 > 0 ? 
            ((data[i].satisfaction_rate_1 - data[i].satisfaction_rate_2 ?? 0) / data[i].satisfaction_rate_1).toFixed(2) : 0
        data[i].chain_base_3 = data[i].onetime_rate_1 > 0 ? 
            ((data[i].onetime_rate_1 - data[i].onetime_rate_2 ?? 0) / data[i].onetime_rate_1).toFixed(2) : 0
    }
    return data || []
}

tmallService.getTmallAsImgByDate = async (startDate, endDate) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    const result = await tmallRepo.getTmallAsImg(start, end)
    return result ||[]
}

tmallService.insertTmallAs = async (count, info) => {
    return await tmallRepo.insertTmallAs(count, info)
}

tmallService.updateTmallAs = async (info) => {
    return await tmallRepo.updateTmallAs(info)
}

tmallService.insertTmallAsImg = async (info) => {
    return await tmallRepo.insertTmallAsImg(info)
}

tmallService.getTmallPsByDate = async (startDate, endDate, servicer) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    let lastStart = moment(startDate).subtract(moment(startDate).weekday() + 7, 'day').format('YYYY-MM-DD')
    let lastEnd = moment(startDate).subtract(moment(startDate).weekday() + 1, 'day').format('YYYY-MM-DD')
    let preStart = moment(lastStart).subtract(7, 'day').format('YYYY-MM-DD')
    let preEnd = moment(lastEnd).subtract(7, 'day').format('YYYY-MM-DD')
    let data = await tmallRepo.getTmallPs(servicer, start, end, lastStart, lastEnd, preStart, preEnd)
    for (let i = 0; i < data?.length; i++) {
        data[i].rank_1 = data[i].rank_1 ?? i + 1
        for (let j = i + 1; j < data.length; j++) {
            if (data[i].success_rate < data[j].success_rate) {
                data[i].rank_1 = i + 1
                data[j].rank_1 = j + 1
            }
        }
        data[i].rank_2 = data[i].rank_2 ?? i + 1
        for (let j = i + 1; j < data.length; j++) {
            if (data[i].satisfaction_rate < data[j].satisfaction_rate) {
                data[i].rank_2 = i + 1
                data[j].rank_3 = j + 1
            }
        }
        data[i].rank_3 = data[i].rank_3 ?? i + 1
        for (let j = i + 1; j < data.length; j++) {
            if (data[i].amount < data[j].amount) {
                data[i].rank_3 = i + 1
                data[j].rank_3 = j + 1
            }
        }
        data[i].chain_base_1 = data[i].amount_1 > 0 ? 
            ((data[i].amount_1 - data[i].amount_2) / data[i].amount_1 ?? 0).toFixed(2) : 0
        data[i].chain_base_2 = data[i].success_rate_1 > 0 ? 
            ((data[i].success_rate_1 - data[i].success_rate_2 ?? 0) / data[i].success_rate_1).toFixed(2) : 0
        data[i].chain_base_3 = data[i].reception_num_1 > 0 ? 
            ((data[i].reception_num_1 - data[i].reception_num_2 ?? 0) / data[i].reception_num_1).toFixed(2) : 0            
    }
    return data || []
}

tmallService.insertTmallPs = async (count, info) => {
    return await tmallRepo.insertTmallPs(count, info)
}

tmallService.updateTmallPs = async (info) => {
    return await tmallRepo.updateTmallPs(info)
}

module.exports = tmallService