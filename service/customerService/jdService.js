const moment = require('moment')
const jdRepo = require('../../repository/customerService/jdRepo')
const jdService = {}

jdService.getJDDataByDate = async (startDate, endDate) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    let data = await jdRepo.getJDData(start, end)
    return data
}

jdService.getJDImgByDate = async (startDate, endDate) => {
    let start = moment(startDate).format('YYYY-MM-DD')
    let end = moment(endDate).format('YYYY-MM-DD')
    const result = await jdRepo.getJDDataImg(start, end)
    return result
}

jdService.insertJD = async (count, info) => {
    await jdRepo.insertJD(count, info)
}

jdService.updateJD = async (info) => {
    await jdRepo.updateJD(info)
}

jdService.insertJDImg = async (info) => {
    await jdRepo.insertJD(info)
}

module.exports = jdService