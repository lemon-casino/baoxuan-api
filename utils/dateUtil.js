const moment = require("moment")

const formatGMT = (datetimeOfGMT, pattern) => {
    if (!pattern) {
        pattern = "YYYY-MM-DD HH:mm";
    }
    return new Date(moment(datetimeOfGMT.toString().replace("Z", "+08:00")).format(pattern))
}

const startOfDay = (day) => {
    return moment(day).format("YYYY-MM-DD 00:00:00")
}

const startOfToday = () => {
    return startOfDay(new Date().toString())
}

const endOfDay = (day) => {
    return moment(day).format("YYYY-MM-DD 23:59:59")
}

const endOfToday = () => {
    return endOfDay(new Date().toString())
}

const diff = (endDate, startDate) => {
    return moment(endDate).diff(moment(startDate), "hours", true).toFixed(2)
}

const delay = (ms = 800) => new Promise((res) => setTimeout(res, ms));

const earliestDate = "2020-01-01 00:00:00"

module.exports = {
    diff,
    delay,
    formatGMT,
    startOfToday,
    endOfToday,
    earliestDate,
    startOfDay,
    endOfDay
}