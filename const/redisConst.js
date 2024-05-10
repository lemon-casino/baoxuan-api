const redisKeys = {
    // old key
    "AllFinishedFlowsBeforeToday": "flows:before_today:all_finished_flows", //sql_liuchengdata
    "AllNotFinishedFlowsBeforeToday": "flows:before_today:all_not_finished_flows", // AllNoCompletedLiu_Old
    "AllFlowsOfToday": "flows:today:all_flows", //getTodayAllLiu_New
    "AllDoingFlowsOfToday": "flows:today:all_doing_flows",
    "AllFlowsUntilNow": "flows:all_flows_until_now", // newLiuChengList
    "Department": "bases:departments", // dep_List
    "UsersWithJoinLaunchDataUnderDepartment": "bases:departments:users", //dep_userList
    "AllUsersWithDepartment": "bases:users", //userAllDetail
    "DDToken": "bases:dd_token",//ddCorpToken
    // new key
    "FlowsOfRunningAndFinishedOfToday": "flows:today:running_and_finished"
}

module.exports = {
    redisKeys
}