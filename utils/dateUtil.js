const moment = require("moment")

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

const format2Str = (datetime, pattern) => {
    if (!pattern) {
        pattern = "YYYY-MM-DD HH:mm";
    }
    return moment(datetime.toString()).format(pattern)
}

const startOfDay = (day) => {
    return moment(day).format("YYYY-MM-DD 00:00:00")
}

const startOfToday = () => {
    return moment(new Date().toString()).format("YYYY-MM-DD 00:00:0")
}

const dateOfEarliest = () => {
    return "2023-02-03"
}

const dateEndOffToday = (daysOff, pattern) => {
    return moment().subtract(daysOff, 'days').format(pattern)
}


const endOfDay = (day) => {
    return moment(day).format("YYYY-MM-DD 23:59:59")
}

const endOfToday = () => {
    return dateEndOffToday(0, "YYYY-MM-DD 23:59:59")
}

const endOfYesterday = () => {
    return dateEndOffToday(1, "YYYY-MM-DD 23:59:59")
}

const diff = (endDate, startDate) => {
    return moment(endDate).diff(moment(startDate), "hours", true).toFixed(2)
}

const delay = (ms = 800) => new Promise((res) => setTimeout(res, ms));

const convertToStr = (date) => {
    return moment(date).format("YYYY-MM-DD HH:mm:ss")
}

module.exports = {
    diff,
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
    endOfDay
}