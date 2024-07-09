const redisKeys = {
    "TodayRunningAndFinishedFlows": "flows:today:running_and_finished",
    "Departments": "bases:new:departments",
    "DepartmentsUsers": "bases:new:departments:users",
    "Users": "bases:new:users",
    "DDToken": "bases:dd_token",
    "WorkingDays": "bases:working_days",
    "QRCodes": "qr_codes",
    "StatCountTodayDingDingApiInvoke": "stat:count:today_ding_ding_api_invoke",
    "OutSourcingUsers": "out",
    "Oa": "oa"
}

module.exports = {
    redisKeys
}