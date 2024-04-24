const {redisKeys} = require("../const/redisConst")
const redisUtil = require("../utils/redisUtil")
const dingDingReq = require("../core/dingDingReq")

const setToken = async (ddToken) => {
    await redisUtil.setKey(redisKeys.DDToken, JSON.stringify(ddToken), 7200)
}

const getToken = async () => {
    const reply = await redisUtil.getKey(redisKeys.DDToken);
    return JSON.parse(reply);
};

const getDepartments = async () => {
    const reply = await redisUtil.getKey(redisKeys.Department);
    return JSON.parse(reply);
};
// 获取redis所有详情用户信息
const getAllUsersDetail = async () => {
    const reply = await redisUtil.getKey(redisKeys.AllUsersDetailWithJoinLaunchData);
    return JSON.parse(reply);
};
// 获取redis流程数据
const getAllFlowsUntilNow = async () => {
    const reply = await redisUtil.getKey(redisKeys.AllFlowsUntilNow);
    return JSON.parse(reply);
};
// 根据流程id获取全部审批流程详情
const getAllProcessFlow = async (token, userId, formInstanceId) => {
    const data = await dingDingReq.getProcessRecord(token, userId, formInstanceId);
    if (data) {
        return data.result;
    }
    return null;
};

const setUsersWithJoinLaunchDataUnderDepartment = async (departments) => {
    await redisUtil.setKey(redisKeys.UsersWithJoinLaunchDataUnderDepartment, JSON.stringify(departments));
}

// 获取所有部门下的所有用户信息
const getUsersWithJoinLaunchDataUnderDepartment = async () => {
    const reply = await redisUtil.getKey(redisKeys.UsersWithJoinLaunchDataUnderDepartment);
    return JSON.parse(reply);
};

const getAllFlowUntilNowByTimeRange = async (timesRange) => {
    const reply = await getAllFlowsUntilNow();
    let liuChengData = JSON.parse(reply);
    let startDate = new Date(timesRange[0]);
    let endDate = new Date(timesRange[1]);
    let filteredData = liuChengData.filter((item) => {
        let itemDate = new Date(item.createTimeGMT);
        return itemDate >= startDate && itemDate <= endDate;
    });
    return filteredData;
};

const getTodayRunningAndFinishedFlows = async () => {
    const result = await redisUtil.getKey(redisKeys.FlowsOfRunningAndFinishedOfToday)
    return JSON.parse(result)
}

const setTodayFlows = async (flows) => {
    await redisUtil.setKey(redisKeys.FlowsOfRunningAndFinishedOfToday, JSON.stringify(flows))
    return true
}

module.exports = {
    setToken,
    getToken,
    getDepartments,
    getAllUsersDetail,
    getAllFlowsUntilNow,
    getAllProcessFlow,
    getUsersWithJoinLaunchDataUnderDepartment,
    setUsersWithJoinLaunchDataUnderDepartment,
    getAllFlowUntilNowByTimeRange,
    getTodayRunningAndFinishedFlows,
    setTodayFlows
}
