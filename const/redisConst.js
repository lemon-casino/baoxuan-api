const redisKeys = {
    "TodayRunningAndFinishedFlows": "flows:today:running_and_finished",
    "Departments": "bases:departments",
    "DepartmentsUsers": "bases:departments:users",
    "Users": "bases:users",
    "DDToken": "bases:dd_token",
    "WorkingDays": "bases:working_days",
    "QRCodes": "qr_codes",
    "StatCountTodayDingDingApiInvoke": "stat:count:today_ding_ding_api_invoke",
    "OutSourcingUsers": "out",
    "Oa": "oa",
    "CoreActionRules": "rules:core_action",
    "jstToken": "bases:jst_token",
    "jstRefreshToken": "bases:refresh_token",
    "synchronizedState": "flows:today:synchronizedState",
}

module.exports = {
    redisKeys
}