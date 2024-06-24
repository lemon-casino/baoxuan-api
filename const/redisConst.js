const redisKeys = {
    "TodayRunningAndFinishedFlows": "flows:today:running_and_finished",
    "Departments": "bases:departments",
    "DepartmentsUsers": "bases:departments:users",
    "Users": "bases:users",
    "DDToken": "bases:dd_token",
    "WorkingDays": "bases:working_days",
    "QRCodes": "qr_codes",
    "OutSourcingUsers": "out",
    "StatCountTodayDingDingApiInvoke": "stat:count:today_ding_ding_api_invoke"
}

module.exports = {
    redisKeys
}