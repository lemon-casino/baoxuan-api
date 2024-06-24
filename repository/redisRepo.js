const {redisKeys} = require("../const/redisConst")
const redisUtil = require("../utils/redisUtil")
const yiDaReq = require("../core/dingDingReq/yiDaReq")

const setToken = async (ddToken) => {
    await redisUtil.set(redisKeys.DDToken, JSON.stringify(ddToken), 7200)
}

const getToken = async () => {
    const reply = await redisUtil.get(redisKeys.DDToken);
    return JSON.parse(reply);
}

const getDepartments = async () => {
    const reply = await redisUtil.get(redisKeys.Departments);
    return JSON.parse(reply);
};

// 获取redis所有详情用户信息
const getAllUsersDetail = async () => {
    const reply = await redisUtil.get(redisKeys.Users);
    return JSON.parse(reply);
};

const getAllUsersWithKeyFields = async () => {
    const allUsers = await getAllUsersDetail()
    return allUsers.map(user => {
        const pureUser = {
            userId: user.userid,
            userName: user.name
        }
        if (user.multiDeptStat) {
            pureUser.multiDeptStat = true
            pureUser.departments = user.leader_in_dept.map(dept => {
                return {
                    deptId: dept.dept_id,
                    deptName: dept.dep_detail.name,
                    statForms: dept.statForms,
                    isVirtual: dept.isVirtual,
                }
            })
        } else {
            pureUser.departments = [
                {
                    deptId: user.leader_in_dept[0].dept_id,
                    deptName: user.leader_in_dept[0].dep_detail.name
                }
            ]
        }
        return pureUser
    })
}

// 根据流程id获取全部审批流程详情
const getAllProcessFlow = async (token, userId, formInstanceId) => {
    const data = await yiDaReq.getProcessRecord(token, userId, formInstanceId);
    if (data) {
        return data.result;
    }
    return null;
};

const setUsersUnderDepartment = async (departments) => {
    await redisUtil.set(redisKeys.DepartmentsUsers, JSON.stringify(departments));
}

// 获取所有部门下的所有用户信息
const getUsersUnderDepartment = async () => {
    const reply = await redisUtil.get(redisKeys.DepartmentsUsers);
    return JSON.parse(reply);
};

const getTodayRunningAndFinishedFlows = async () => {
    const result = await redisUtil.get(redisKeys.TodayRunningAndFinishedFlows)
    return JSON.parse(result)
}

const setTodayFlows = async (flows) => {
    await redisUtil.set(redisKeys.TodayRunningAndFinishedFlows, JSON.stringify(flows))
    return true
}

const getAllWorkingDays = async () => {
    const allWorkingDays = await redisUtil.lRange(redisKeys.WorkingDays, 0, 9999)
    return allWorkingDays
}

const setOutSourcingUser = async (deptId, userName) => {
    return await redisUtil.sAdd(`${redisKeys.OutSourcingUsers}:${deptId}`, userName)
}

const getOutSourcingUsers = async (deptId) => {
    return await redisUtil.sMembers(`${redisKeys.OutSourcingUsers}:${deptId}`)
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
    getAllWorkingDays,
    getAllUsersWithKeyFields,
    setOutSourcingUser,
    getOutSourcingUsers
}
