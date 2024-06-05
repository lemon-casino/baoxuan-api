const {redisKeys} = require("../const/redisConst")
const redisUtil = require("../utils/redisUtil")
const dingDingReq = require("../core/dingDingReq")

const setToken = async (ddToken) => {
    await redisUtil.setValue(redisKeys.DDToken, JSON.stringify(ddToken), 7200)
}

const getToken = async () => {
    const reply = await redisUtil.getValue(redisKeys.DDToken);
    return JSON.parse(reply);
}

const getDepartments = async () => {
    const reply = await redisUtil.getValue(redisKeys.Departments);
    return JSON.parse(reply);
};

// 获取redis所有详情用户信息
const getAllUsersDetail = async () => {
    const reply = await redisUtil.getValue(redisKeys.Users);
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
    await redisUtil.setValue(redisKeys.DepartmentsUsers, JSON.stringify(departments));
}

// 获取所有部门下的所有用户信息
const getUsersUnderDepartment = async () => {
    const reply = await redisUtil.getValue(redisKeys.DepartmentsUsers);
    return JSON.parse(reply);
};

const getTodayRunningAndFinishedFlows = async () => {
    const result = await redisUtil.getValue(redisKeys.TodayRunningAndFinishedFlows)
    return JSON.parse(result)
}

const setTodayFlows = async (flows) => {
    await redisUtil.setValue(redisKeys.TodayRunningAndFinishedFlows, JSON.stringify(flows))
    return true
}

const getAllWorkingDays = async () => {
    const allWorkingDays = await redisUtil.lRange(redisKeys.WorkingDays, 0, 9999)
    return allWorkingDays
}

module.exports = {
    setToken,
    getToken,
    getDepartments,
    getAllUsersDetail,
    getAllProcessFlow,
    getUsersUnderDepartment,
    setUsersUnderDepartment,
    getTodayRunningAndFinishedFlows,
    setTodayFlows,
    getAllWorkingDays
}
