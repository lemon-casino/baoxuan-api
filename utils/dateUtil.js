const moment = require("moment")
const momentUnitConst = require("../const/momentUnitConst")

const formatGMT = (datetimeOfGMT, pattern) => {
    if (!pattern) {
        pattern = "YYYY-MM-DD HH:mm";
    }
    return new Date(moment(datetimeOfGMT.toString().replace("Z", "+08:00")).format(pattern))
}

const formatGMT2Str = (datetimeOfGMT, pattern) => {
    if (!pattern) {
        pattern = "YYYY-MM-DD HH:mm";
    }
    return moment(datetimeOfGMT.toString().replace("Z", "+08:00")).format(pattern)
}

const format2Str = (datetime, pattern = "YYYY-MM-DD HH:mm:ss") => {
    return moment(datetime).format(pattern)
}

const startOfDay = (day) => {
    return moment(day).format("YYYY-MM-DD 00:00:00")
}

const startOfToday = () => {
    return startOfDay(new Date())
}

const dateOfEarliest = () => {
    return "2023-06-01"
}

const dateEndOffToday = (daysOff, pattern) => {
    return moment().subtract(daysOff, 'days').format(pattern)
}

const endOfDay = (day) => {
    return moment(day).format("YYYY-MM-DD 23:59:59")
}

const endOfToday = () => {
    return endOfDay(new Date())
}

const endOfYesterday = () => {
    return dateEndOffToday(1, "YYYY-MM-DD 23:59:59")
}

const duration = (endDate, startDate, unitOfTime = "hours") => {
    return moment(endDate).diff(moment(startDate), unitOfTime, true).toFixed(2)
}

const delay = (ms = 100) => new Promise((res) => setTimeout(res, ms));

const convertToStr = (date) => {
    return moment(date).format("YYYY-MM-DD HH:mm:ss")
}

const add = (date, amount, unitOfTime = momentUnitConst.DAYS) => {
    return moment(date).add(amount, unitOfTime)
}

module.exports = {
    duration,
    delay,
    formatGMT,
    startOfToday,
    endOfToday,
    endOfYesterday,
    dateOfEarliest,
    convertToStr,
    formatGMT2Str,
    dateEndOffToday,
    format2Str,
    startOfDay,
    endOfDay,
    add
}