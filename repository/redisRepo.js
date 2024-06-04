const {redisKeys} = require("../const/redisConst")
const redisUtil = require("../utils/redisUtil")
const dingDingReq = require("../core/dingDingReq")

const setToken = async (ddToken) => {
    await redisUtil.setValue(redisKeys.DDToken, JSON.stringify(ddToken), 7200)
}

const setBiToken = async (biToken) => {
    await redisUtil.setValue(redisKeys.BiToken, JSON.stringify(biToken), 7200)
}

const getToken = async () => {
    const reply = await redisUtil.getValue(redisKeys.DDToken);
    return JSON.parse(reply);
}

const getBiToken = async () => {
    const reply = await redisUtil.getValue(redisKeys.BiToken);
    return JSON.parse(reply);
}

const getDepartments = async () => {
    const reply = await redisUtil.getValue(redisKeys.Department);
    return JSON.parse(reply);
};
// 获取redis所有详情用户信息
const getAllUsersDetail = async () => {
    const reply = await redisUtil.getValue(redisKeys.AllUsersWithDepartment);
    return JSON.parse(reply);
};
// 获取redis流程数据
const getAllFlowsUntilNow = async () => {
    const reply = await redisUtil.getValue(redisKeys.AllFlowsUntilNow);
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

const setUsersUnderDepartment = async (departments) => {
    await redisUtil.setValue(redisKeys.UsersUnderDepartment, JSON.stringify(departments));
}

// 获取所有部门下的所有用户信息
const getUsersUnderDepartment = async () => {
    const reply = await redisUtil.getValue(redisKeys.UsersUnderDepartment);
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
    const result = await redisUtil.getValue(redisKeys.FlowsOfRunningAndFinishedOfToday)
    return JSON.parse(result)
}

const setTodayFlows = async (flows) => {
    await redisUtil.setValue(redisKeys.FlowsOfRunningAndFinishedOfToday, JSON.stringify(flows))
    return true
}

const getAllWorkingDays = async () => {
    const allWorkingDays = await redisUtil.lRange(redisKeys.WorkingDays, 0, 9999)
    return allWorkingDays
}

module.exports = {
    setBiToken,
    setToken,
    getBiToken,
    getToken,
    getDepartments,
    getAllUsersDetail,
    getAllFlowsUntilNow,
    getAllProcessFlow,
    getUsersUnderDepartment,
    setUsersUnderDepartment,
    getAllFlowUntilNowByTimeRange,
    getTodayRunningAndFinishedFlows,
    setTodayFlows,
    getAllWorkingDays
}
