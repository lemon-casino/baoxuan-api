const excel4node = require("excel4node");
const fs = require("fs");
const path = require("path");
const FlowForm = require("../model/flowfrom")
const FlowFormReviewModel = require("../model/flowformreview");
const dd = require("../core/dingDingReq");
const whiteList = require("../config/whiteList");
const {formatDateTime} = require("../utils/tools");
const dateUtil = require("../utils/dateUtil")
const excelUtil = require("../utils/excelUtil")
const biResponse = require("../utils/biResponse")
const redisRepo = require("../repository/redisRepo")
const departmentService = require("../service/departmentService")
const userService = require("../service/userService")
const flowService = require("../service/flowService")
const globalGetter = require("../global/getter")
const statisticStatusConst = require("../const/statisticStatusConst")
const flowFormService = require("../service/flowFormService")

// 数组对象去重
const uniqueByProperty = (array, propertyName) =>
    array.reduce((acc, cur) => {
        let has = acc.some((item) => item[propertyName] === cur[propertyName]);
        return has ? acc : acc.concat(cur);
    }, []);

const mergeListByNameAndIdInSection = (type, result) => {
    if (type === "bm") {
        let results = result.map((item) => {
            if (item.title === "已发起") {
                // 使用 Map 对象去重部门和用户
                let depMap = new Map();
                let userMap = new Map();

                for (let dep of item.list) {
                    if (depMap.has(dep.dept_id)) {
                        // 更新已存在部门的 liuchengdata
                        let existingDep = depMap.get(dep.dept_id);
                        existingDep.liuchengdata = existingDep.liuchengdata.concat(
                            dep.liuchengdata
                        );
                    } else {
                        // 添加新部门到 Map 中
                        depMap.set(dep.dept_id, {
                            ...dep,
                            liuchengdata: [...dep.liuchengdata],
                        });
                    }
                    // 处理用户
                    for (let user of dep.dep_user) {
                        if (userMap.has(user.userid)) {
                            // 更新已存在用户的 liuchengdata
                            let existingUser = userMap.get(user.userid);
                            existingUser.liuchengdata = existingUser.liuchengdata.concat(
                                user.liuchengdata
                            );
                        } else {
                            // 添加新用户到 Map 中
                            userMap.set(user.userid, {
                                ...user,
                                liuchengdata: [...user.liuchengdata],
                            });
                        }
                    }
                }

                const mergedDepUsers = Array.from(depMap.values()).map((dep) => ({
                    ...dep,
                    dep_user: dep.dep_user.map((user) => userMap.get(user.userid)),
                }));
                return {
                    title: item.title,
                    list: mergedDepUsers,
                    len: mergedDepUsers.reduce(
                        // (total, dep) => total + dep.liuchengdata.length + dep.dep_user.reduce((total, user) => total + user.liuchengdata.length, 0),
                        (total, dep) => total + dep.liuchengdata.length,
                        0
                    ),
                };
            } else {
                return item;
            }
        });
        return results;
    } else {
        let results = result.map((item) => {
            if (item.title === "已发起") {
                let depMap = new Map();
                for (let dep of item.list) {
                    if (depMap.has(dep.dept_id)) {
                        // 更新已存在部门的 liuchengdata
                        let existingDep = depMap.get(dep.dept_id);
                        existingDep.liuchengdata = existingDep.liuchengdata.concat(
                            dep.liuchengdata
                        );
                    } else {
                        // 添加新部门到 Map 中
                        depMap.set(dep.dept_id, {
                            ...dep,
                            liuchengdata: [...dep.liuchengdata],
                        });
                    }
                }
                const mergedDepUsers = Array.from(depMap.values()).map((dep) => ({
                    ...dep,
                }));
                return {
                    title: item.title,
                    list: mergedDepUsers,
                    len: mergedDepUsers.reduce(
                        (total, dep) => total + dep.liuchengdata.length,
                        0
                    ),
                };
            } else {
                return item;
            }
        });
        return results;
    }
};
// 处理个人发起参与方法
const handle_fq_cy_liuc = async (
    ddAccessToken,
    timesRange,
    ddUserId,
    flowStatusMap,
    selfLaunchOrJoin,
    formImportanceCondition,
    statusOfFlow
) => {
    // 初始化结果对象
    let resultTemplate = {
        已发起: {data: [], depUser: new Map(), depList: []},
        进行中: {data: [], depUser: new Map(), depList: []},
        已完成: {data: [], depUser: new Map(), depList: []},
        已终止: {data: [], depUser: new Map(), depList: []},
        已逾期: {data: [], depUser: new Map(), depList: []},
        待转入: {data: [], depUser: new Map(), depList: []},
        异常: {data: [], depUser: new Map(), depList: []},
    };

    const allUserDetails = await redisRepo.getAllUsersDetail();
    const allFlowsInDingDing = await redisRepo.getAllFlowsUntilNow();
    // 获取当前用户下的所有流程数据
    const currentUsers = allUserDetails.filter((item) => item.userid === ddUserId);
    if (currentUsers.length > 0) {
        // 获取创建时间区间内的流程数据（没有详情）
        const {type, forms} = formImportanceCondition;
        let satisfiedFlows = currentUsers[0][selfLaunchOrJoin]
        if (timesRange) {
            const startDate = new Date(timesRange[0]);
            const endDate = new Date(timesRange[1]);
            satisfiedFlows = satisfiedFlows.filter((item) => {
                const creteDate = dateUtil.formatGMT(item.createTimeGMT);
                return creteDate >= startDate && creteDate <= endDate;
            });
        }

        // 获取流程数据详情
        satisfiedFlows = satisfiedFlows
            .map((flow) =>
                allFlowsInDingDing.filter(
                    (item) => item.processInstanceId === flow.processInstanceId
                )
            )
            .flat();

        // 根据状态获取流程数据
        satisfiedFlows = satisfiedFlows.filter((flow) => {
            return flow.instanceStatus === statusOfFlow
        })

        let filteredAgainFlowsByImportance = [];
        // 根据流程详情中的formUuid获取form详情过滤重要性选项  1:重要  2：普通
        // 根据是否重要过滤流程
        if (forms && forms.length) {
            filteredAgainFlowsByImportance = satisfiedFlows.filter((flow) => {
                return forms.includes(flow.formUuid)
            })
        } else if (type) {
            const allForms = await FlowForm.getFlowFormList()
            filteredAgainFlowsByImportance = satisfiedFlows.filter((flow) => {
                const forms = allForms.filter((form) => form.flow_form_id === flow.formUuid)
                if (forms && forms.length) {
                    return ((type === "important" && forms[0].status === "1") || (type === "unImportant" && forms[0].status === "2"))
                }
                return false
            })
        } else {
            filteredAgainFlowsByImportance = satisfiedFlows
        }

        for (const flow of filteredAgainFlowsByImportance) {
            // 获取审核节点状态数据
            for (const reviewItem of flow.overallprocessflow) {
                if (reviewItem.operatorUserId === ddUserId) {
                    const statusTextInReview = flowStatusMap[reviewItem.type];
                    if (
                        statusTextInReview &&
                        !resultTemplate[statusTextInReview].data.some(
                            (item_) => item_.processInstanceId === flow.processInstanceId
                        )
                    ) {
                        resultTemplate[statusTextInReview].data.push(flow);
                    }

                    // 判断是否有逾期
                    if (reviewItem.isOverDue) {
                        const overDueData = resultTemplate["已逾期"].data
                        if (!overDueData.some(item => item.processInstanceId === flow.processInstanceId)) {
                            resultTemplate["已逾期"].data.push(flow);
                        }
                    }
                }
            }
            // 获取流程状态数据
            const statusTextInFlow = flowStatusMap[flow.instanceStatus];
            if (statusTextInFlow) {
                resultTemplate[statusTextInFlow].data.push(flow);
            }
        }
    }

    // 对于每一种状态，获取相关的用户和部门信息
    for (const statusText in resultTemplate) {
        let statistic = resultTemplate[statusText];
        // 获取属于每一种状态的用户数据
        for (const flow of statistic.data) {
            const ddUserId = flow.originator.userId;
            const flowsOfUser = statistic.depUser.has(ddUserId) ? [...statistic.depUser.get(ddUserId), flow] : [flow]
            statistic.depUser.set(
                ddUserId,
                flowsOfUser
            );
        }
        // 获取所有用户的部门信息
        let departmentsOfUsers = await Promise.all(
            Array.from(statistic.depUser.keys()).map(async (ddUserId) =>
                departmentService.getDepLev(ddAccessToken, ddUserId)
            )
        );

        for (let i = 0; i < departmentsOfUsers.length; i++) {
            let dept = departmentsOfUsers[i];
            let userId = Array.from(statistic.depUser.keys())[i];
            // 防止用户对应的部门信息为空
            if (dept.length <= 0) {
                dept = [
                    {
                        dept_id: 1111,
                        leader: false,
                        name: "其他-未知-可能离职",
                        parent_id: 1,
                        dep_child: [],
                    },
                ];
            }

            const flowsOfUser = statistic.depUser.get(userId);
            // 将流程数据和部门信息关联起来
            if (dept[0].dep_child.length <= 0) {
                dept[0].liuchengdata = flowsOfUser;
                statistic.depList.push({
                    name: dept[0].name,
                    dept_id: dept[0].dept_id,
                    leader: dept[0].leader,
                    dep_child: dept[0].dep_child,
                    liuchengdata: dept[0].liuchengdata,
                });
            } else {
                dept[0].dep_child[0].liuchengdata = flowsOfUser;
                statistic.depList.push(dept[0].dep_child[0]);
            }
        }
        // 合并去重部门数据
        statistic.depList = await departmentService.mergeDataByDeptId(statistic.depList);
    }

    // 获取流程长度
    const sumFlows = (data) => {
        return data.reduce((total, item) => total + item, 0);
    };

    const result = [
        {title: "已发起", list: [], len: 0},
        {
            title: "进行中",
            list: resultTemplate["进行中"].depList,
            len: sumFlows(
                resultTemplate["进行中"].depList.map((item) => item.liuchengdata.length)
            ),
        },
        {
            title: "待转入",
            list: resultTemplate["待转入"].depList,
            len: sumFlows(
                resultTemplate["待转入"].depList.map((item) => item.liuchengdata.length)
            ),
        },
        {
            title: "已完成",
            list: resultTemplate["已完成"].depList,
            len: sumFlows(
                resultTemplate["已完成"].depList.map((item) => item.liuchengdata.length)
            ),
        },
        {
            title: "已逾期",
            list: resultTemplate["已逾期"].depList,
            len: sumFlows(
                resultTemplate["已逾期"].depList.map((item) => item.liuchengdata.length)
            ),
        },
        {
            title: "已终止",
            list: resultTemplate["已终止"].depList,
            len: sumFlows(
                resultTemplate["已终止"].depList.map((item) => item.liuchengdata.length)
            ),
        },
        {
            title: "异常",
            list: resultTemplate["异常"].depList,
            len: sumFlows(
                resultTemplate["异常"].depList.map((item) => item.liuchengdata.length)
            ),
        },
    ];
    let initiatedStatus = ["进行中", "已完成", "已终止", "异常"];
    for (let i = 0; i < result.length; i++) {
        let item = result[i];
        if (item.title === "已发起") {
            item.len = initiatedStatus.reduce(
                (acc, curr) => acc + result.find((item) => item.title === curr).len,
                0
            );
            item.list = initiatedStatus.reduce(
                (acc, curr) =>
                    acc.concat(result.find((item) => item.title === curr).list),
                []
            );
        }
    }
    return mergeListByNameAndIdInSection("gr", result);
};

const statusTypes = {flowStatus: "flowStatus", reviewStatus: "reviewStatus"}


const handleSelfJoinedFlowsOfStatus = async (userId, status) => {
    const flowsOfUser = redisRepo.getAllUsersDetail().filter((user) => {
        return user.user_id === userId
    })
}


const handleDepartmentJoinFlows = async (departments, timesRange, formImportanceCondition) => {
    const satisfiedFlows = flowService.getFlowsOfDepartmentBy(departments, "canyu_liu", timesRange, formImportanceCondition);
    const requiredStatus = [
        {name: "TODO", value: "进行中", statusType: statusTypes.reviewStatus},
        {name: "FORCAST", value: "待转入", statusType: statusTypes.reviewStatus},
        {name: "HISTORY", value: "已完成", statusType: statusTypes.reviewStatus},
        {name: "OVERDUE", value: "已逾期"},
        {name: "TERMINATED", value: "已终止", statusType: statusTypes.flowStatus},
        {name: "ERROR", value: "异常", statusType: statusTypes.flowStatus}
    ];

    const result = []

    for (const status of requiredStatus) {
        // 1.汇总个人信息
        let statisticOfUsers = []
        for (const flow of satisfiedFlows) {
            if (status.statusType === statusTypes.reviewStatus) {
                const reviewItem = await flowService.findReviewItemByType(flow, status.name)
                if (reviewItem) {
                    const user = {userId: reviewItem.operatorUserId, userName: reviewItem.operatorName}
                    statisticOfUsers = await sumOfStatisticOfUsers(user, statisticOfUsers);
                }
            } else {
                // 将该流程统计到审核节点的各个操作人
                const reviewItems = flow.overallprocessflow
                if (reviewItems) {
                    for (const reviewItem of reviewItems) {
                        const user = {userId: reviewItem.operatorUserId, userName: reviewItem.operatorName}
                        statisticOfUsers = await sumOfStatisticOfUsers(user, statisticOfUsers);
                    }
                }
            }
        }
        // 保存当前状态的全部数
        let sum = 0;
        let statisticOfDepartments = []
        // 2. 汇总部门信息
        for (const department of departments) {
            //todo: 需要确认users的结构
            const users = await userService.getUsersOfDepartment(department.dept_id)
            const filteredStatisticOfUsers = statisticOfUsers.filter((item) => {
                for (const user of users) {
                    if (user.userId === item.userId) {
                        return true
                    }
                }
                return false
            })
            const computedDepartment = statisticOfDepartments.filter((flowOfDepartment) =>
                flowOfDepartment.dept_id === department.dept_id
            )
            if (computedDepartment.length > 0) {
                computedDepartment[0].sum = parseInt(computedDepartment[0].sum) + filteredStatisticOfUsers.length
                computedDepartment[0].users = computedDepartment[0].users.push(filteredStatisticOfUsers);
            } else {
                statisticOfDepartments.push({
                    departmentId: department.dept_id,
                    departmentName: department.name,
                    sum: filteredStatisticOfUsers.length,
                    users: filteredStatisticOfUsers
                })
            }
            sum += filteredStatisticOfUsers.length
        }

        result.push({
            status: status.name,
            name: status.value,
            order: 1,
            sum: sum,
            departments: statisticOfDepartments
        })
    }
    return result;

}

const sumOfStatisticOfUsers = async (user, statisticOfUsers) => {
    const computedUsers = statisticOfUsers.filter((flowOfUser) =>
        flowOfUser.userId === user.userId
    )
    if (computedUsers) {
        computedUsers[0].sum = parseInt(computedUsers[0].sum) + 1
    } else {
        statisticOfUsers.push({
            userId: user.userId,
            userName: user.userName,
            sum: 1
        })
    }
    return statisticOfUsers
}

// 处理部门发起参与方法
const handleDepartmentLaunchOrJoinFlows = async (
    ddAccessToken,
    timesRange,
    parentDepartmentId,
    statusMap,
    launchOrJoin,
    departments,
    formImportanceCondition
) => {
    const startDate = new Date(timesRange[0]);
    const endDate = new Date(timesRange[1]);
    const allUsersOfAllDepartments = await redisRepo.getUsersUnderDepartment();
    const ddAllFlows = await redisRepo.getAllFlowsUntilNow();
    const results = [];
    const usersOfParentDepartment = allUsersOfAllDepartments.filter((item) => item.dept_id == parentDepartmentId);

    // 根据用户的departments过滤掉不包含的部门
    let subDepartmentsWithUsers = departments.map((obj1) => {
        let obj2 = usersOfParentDepartment[0].dep_chil.find((item) => item.dept_id === obj1.dept_id);
        // 如果没有子部门获取一级部门下的用户id
        if (obj2) {
            return {...obj1, dep_user: obj2.dep_user};
        } else {
            return {...obj1, dep_user: usersOfParentDepartment[0].dep_user};
        }
    });

    usersOfParentDepartment[0].dep_chil = subDepartmentsWithUsers;

    const allForms = await FlowForm.getFlowFormList()
    const {type, forms} = formImportanceCondition
    for (const item of subDepartmentsWithUsers) {
        // 如果是主管
        if (item.leader) {
            for (const user of item.dep_user) {
                let resultObj = {
                    已发起: {data: [], depUser: new Map(), depList: []},
                    进行中: {data: [], depUser: new Map(), depList: []},
                    已完成: {data: [], depUser: new Map(), depList: []},
                    已终止: {data: [], depUser: new Map(), depList: []},
                    已逾期: {data: [], depUser: new Map(), depList: []},
                    待转入: {data: [], depUser: new Map(), depList: []},
                    异常: {data: [], depUser: new Map(), depList: []},
                };

                user.status = {};
                if (user[launchOrJoin]) {
                    // 获取指定时间区间内容流程，如果查询指定了flows，需要根据flows再过滤
                    const filteredData = user[launchOrJoin].filter((item) => {
                        const createDate = dateUtil.formatGMT(item.createTimeGMT)
                        return createDate >= startDate && createDate <= endDate;
                    });

                    // 获取流程详情
                    const flowsDetails = filteredData
                        .map((l_item) =>
                            ddAllFlows.filter(
                                (item) => item.processInstanceId === l_item.processInstanceId
                            )
                        )
                        .flat();

                    let filteredAgainFlowsByImportance = [];
                    // 根据流程详情中的formUuid获取form详情过滤重要性选项  1:重要  2：普通
                    // 根据是否重要过滤流程
                    if (forms && forms.length) {
                        filteredAgainFlowsByImportance = flowsDetails.filter((flow) => {
                            return forms.includes(flow.formUuid)
                        })
                    } else if (type) {
                        filteredAgainFlowsByImportance = flowsDetails.filter((flow) => {
                            const forms = allForms.filter((form) => form.flow_form_id === flow.formUuid)
                            if (forms && forms.length) {
                                return ((type === "important" && forms[0].status === "1") || (type === "unImportant" && forms[0].status === "2"))
                            }
                            return false
                        })
                    } else {
                        filteredAgainFlowsByImportance = flowsDetails
                    }

                    for (const flow of filteredAgainFlowsByImportance) {
                        // 获取审核节点状态数据
                        for (const reviewItem of flow.overallprocessflow) {
                            // 1.先筛选出自己参与的流程
                            if (reviewItem.operatorUserId === user.userid) {
                                const status_sh = statusMap[reviewItem.type];
                                if (
                                    status_sh &&
                                    !resultObj[status_sh].data.some(
                                        (item_) =>
                                            item_.processInstanceId === flow.processInstanceId
                                    )
                                ) {
                                    resultObj[status_sh].data.push(flow);
                                }

                                // 判断是否有逾期
                                if (reviewItem.isOverDue) {
                                    const overDueData = resultObj["已逾期"].data
                                    if (!overDueData.some(item => item.processInstanceId === flow.processInstanceId)) {
                                        resultObj["已逾期"].data.push(flow);
                                    }
                                }
                            }
                        }
                        // 获取流程状态数据
                        let status_lc = statusMap[flow.instanceStatus];
                        if (status_lc) {
                            resultObj[status_lc].data.push(flow);
                        }
                    }
                }
                // 将对应状态加入到该用户下的status
                user.status = resultObj;
            }
        } else {

        }
        results.push(item);
    }


    // 获取对应状态的所有流程长度和流程数据
    const handleliuc_len = (status, dep_g_user) => {
        const depData = JSON.parse(JSON.stringify(dep_g_user));
        // 状态字段
        const f_status = status;
        for (let i = 0; i < depData.length; i++) {
            const depInfo = depData[i];
            depInfo.liuchengdata = [];
            depInfo.liuchengdata_len = 0;
            for (let j = 0; j < depInfo.dep_user.length; j++) {
                const userInfo = depInfo.dep_user[j];
                depInfo.liuchengdata_len += userInfo.status[f_status].data.length;
                // 格式化流程结构
                const liu_data = userInfo.status[f_status].data.map((l_items) => {
                    return {
                        title: l_items.title,
                        createTimeGMT: l_items.createTimeGMT,
                        formUuid: l_items.formUuid,
                        processInstanceId: l_items.processInstanceId,
                        modifiedTimeGMT: l_items.modifiedTimeGMT,
                        overallprocessflow: l_items.overallprocessflow,
                        originator: {
                            name: l_items.originator.name.nameInChinese,
                            userId: l_items.originator.userId,
                        },
                        instanceStatus: l_items.instanceStatus,
                    };
                });
                // 对应状态下的部门总流程数据
                depInfo.liuchengdata.push(liu_data);
            }
            // 对应状态下的部门总流程数据
            depInfo.liuchengdata = depInfo.liuchengdata.flat();
        }
        return depData;
    };
    // 格式化dep_user数据结构
    const dep_g_user = subDepartmentsWithUsers
        .map((item) => {
            return {
                ...item,
                dep_user: item.dep_user.map((items) => {
                    return {
                        name: items.name,
                        userid: items.userid,
                        status: items.status,
                    };
                }),
            };
        })
        .flat();
    // 格式化最终返回结构
    const handle_gs_data = (status, dep_list) => {
        const data = handleliuc_len(status, dep_list);
        const a_data = data.map((item) => {
            const u_list = item.dep_user.map((u_item) => {
                const liu_data = u_item.status[status].data.map((l_items) => {
                    return {
                        title: l_items.title,
                        createTimeGMT: l_items.createTimeGMT,
                        formUuid: l_items.formUuid,
                        processInstanceId: l_items.processInstanceId,
                        modifiedTimeGMT: l_items.modifiedTimeGMT,
                        overallprocessflow: l_items.overallprocessflow,
                        // originator: l_items.originator,
                        originator: {
                            name: l_items.originator.name.nameInChinese,
                            userId: l_items.originator.userId,
                        },
                        instanceStatus: l_items.instanceStatus,
                    };
                });
                return {
                    name: u_item.name,
                    userid: u_item.userid,
                    liuchengdata: liu_data,
                };
            });
            return {
                dep_name: item.dep_name || item.name,
                dept_id: item.dept_id,
                parent_id: item.parent_id,
                dep_child: item.dep_child,
                leader: item.leader,
                dep_user: u_list,
                liuchengdata: item.liuchengdata,
                liuchengdata_len: item.liuchengdata_len,
            };
        });
        return {
            title: status,
            list: a_data,
            len: a_data.reduce((total, item) => total + item.liuchengdata_len, 0),
        };
    };
    // 获取流程长度
    const l_len = (data) => {
        return data.reduce((total, item) => total + item.liuchengdata_len, 0);
    };
    const result = [
        {
            title: "已发起",
            list: [],
            len: 0,
        },
        {
            title: "进行中",
            list: handle_gs_data("进行中", dep_g_user).list,
            len: l_len(handle_gs_data("进行中", dep_g_user).list),
        },
        {
            title: "待转入",
            list: handle_gs_data("待转入", dep_g_user).list,
            len: l_len(handle_gs_data("待转入", dep_g_user).list),
        },
        {
            title: "已完成",
            list: handle_gs_data("已完成", dep_g_user).list,
            len: l_len(handle_gs_data("已完成", dep_g_user).list),
        },
        {
            title: "已逾期",
            list: handle_gs_data("已逾期", dep_g_user).list,
            len: l_len(handle_gs_data("已逾期", dep_g_user).list),
        },
        {
            title: "已终止",
            list: handle_gs_data("已终止", dep_g_user).list,
            len: l_len(handle_gs_data("已终止", dep_g_user).list),
        },
        {
            title: "异常",
            list: handle_gs_data("异常", dep_g_user).list,
            len: l_len(handle_gs_data("异常", dep_g_user).list),
        },
    ];
    let initiatedStatus = ["进行中", "已完成", "已终止", "异常"];
    for (let i = 0; i < result.length; i++) {
        let item = result[i];
        if (item.title === "已发起") {
            item.len = initiatedStatus.reduce(
                (acc, curr) => acc + result.find((item) => item.title === curr).len,
                0
            );
            item.list = initiatedStatus.reduce(
                (acc, curr) =>
                    acc.concat(result.find((item) => item.title === curr).list),
                []
            );
        }
    }

    return mergeListByNameAndIdInSection("bm", result);
};

// 本人发起
const handle_br_h_dep_yfq_LiuChengList = async (ddAccessToken, timesRange, ddUserid, formImportanceCondition, statusOfFlow) => {
    const flowStatusMap = {
        RUNNING: "进行中",
        COMPLETED: "已完成",
        TERMINATED: "已终止",
        OVERDUE: "已逾期",
        FORCAST: "待转入", // 审核维度状态
        ERROR: "异常",
    };
    const selfLaunchData = await handle_fq_cy_liuc(
        ddAccessToken,
        timesRange,
        ddUserid,
        flowStatusMap,
        "faqi_liu",
        formImportanceCondition,
        statusOfFlow
    );
    return selfLaunchData;
};
// 本人参与
const handle_br_cy_LiuChengList = async (ddAccessToken, timesRange, ddUserId, formImportanceCondition, statusOfFlow) => {
    const flowStatusMap = {
        TODO: "进行中",
        FORCAST: "待转入",
        HISTORY: "已完成",
        OVERDUE: "已逾期",
        // 流程状态
        TERMINATED: "已终止",
        ERROR: "异常",
    };
    const selfJoinData = await handle_fq_cy_liuc(
        ddAccessToken,
        timesRange,
        ddUserId,
        flowStatusMap,
        "canyu_liu",
        formImportanceCondition,
        statusOfFlow
    );
    return selfJoinData;
};

// 部门参与
const handle_dep_cy_LiuChengList = async (
    ddAccessToken,
    timesRange,
    parentDepartmentId,
    departments,
    formImportanceCondition
) => {
    const statusMap = {
        TODO: "进行中",
        FORCAST: "待转入",
        HISTORY: "已完成",
        OVERDUE: "已逾期",
        TERMINATED: "已终止",
        ERROR: "异常",
    };
    const canyu_liu = await handleDepartmentLaunchOrJoinFlows(
        ddAccessToken,
        timesRange,
        parentDepartmentId,
        statusMap,
        "canyu_liu",
        departments,
        formImportanceCondition
    );
    return canyu_liu;
};

// 部门发起
const handle_dep_fq_LiuChengList = async (
    ddAccessToken,
    timesRange,
    parentDepartmentId,
    departments,
    formImportanceCondition
) => {
    const launchStatusMap = {
        RUNNING: "进行中",
        COMPLETED: "已完成",
        TERMINATED: "已终止",
        OVERDUE: "已逾期",
        FORCAST: "待转入",
        ERROR: "异常",
    };
    const faqi_liu = await handleDepartmentLaunchOrJoinFlows(
        ddAccessToken,
        timesRange,
        parentDepartmentId,
        launchStatusMap,
        "faqi_liu",
        departments,
        formImportanceCondition
    );
    return faqi_liu;
};

// 公共方法 end========================================================

// 获取子部门信息
exports.getdepartment = async (req, res) => {
    const {depId} = req.query;
    // 获取钉钉user_id
    const dd_id = await userService.getDingDingUserId(req.user.id);
    // 获取钉钉Token
    const {access_token} = await redisRepo.getToken();
    let dep_info = [];
    // 管理员身份
    if (whiteList.pepArr().includes(dd_id)) {
        // 获取子部门信息
        dep_info = await departmentService.getSubDeptLev(await globalGetter.getDepartments(), depId);
    } else {
        // 返回用户详情
        const lev_dep_list = await departmentService.getDepLev(access_token, dd_id);
        dep_info = lev_dep_list.filter((item) => item.dept_id == depId)[0]
            .dep_child;
    }
    // 返回指定的部门信息
    return res.send(biResponse.success(dep_info));
};

const getDepartmentOfUser = async (ddUserId, ddAccessToken, parentDepartmentId, subDepartmentId) => {
    let dep_info = [];
    // 根据userid判断是否存在于白名单中
    if (whiteList.pepArr().includes(ddUserId)) {
        const allDepts = await redisRepo.getDepartments();
        const subDepartments = await departmentService.getSubDeptLev(allDepts, parentDepartmentId)
        if (subDepartments.length === 0) {
            const parentDepartmentDetails = allDepts.filter((item) => item.dept_id == parentDepartmentId);
            parentDepartmentDetails.forEach((element) => {
                element.leader = true;
            });
            dep_info = parentDepartmentDetails;
        } else {
            dep_info = subDepartments.filter((item) => item.dept_id == subDepartmentId);
        }
    } else {
        // 返回用户详情
        const lev_dep_list = await departmentService.getDepLev(ddAccessToken, ddUserId);
        const lev_dep_lists = lev_dep_list.filter(
            (item) => item.dept_id == parentDepartmentId
        );
        // 如果子部门为空
        if (lev_dep_lists[0].dep_child.length === 0) {
            dep_info = lev_dep_lists;
        } else {
            dep_info = lev_dep_list.filter((item) => item.dept_id == parentDepartmentId);
        }
        // 判断当前用户是否是管理员
        if (dep_info[0].dep_child.length > 0) {
            const c_dep = dep_info[0].dep_child.filter(
                (item) => item.dept_id === subDepartmentId
            );
            dep_info = c_dep;
        }
    }
    return dep_info;
}

exports.getSelfLaunchDoingFlowsStatistic = async (req, res) => {
    const {parentDepartmentId, subDepartmentId, timesRange, formImportanceCondition} = req.query;
    const ddUserId = await userService.getDingDingUserId(req.user.id);
    const {access_token: ddAccessToken} = await redisRepo.getToken();
    // 单个
    const dep_info = await getDepartmentOfUser(ddUserId, ddAccessToken, parentDepartmentId, subDepartmentId)
    const isAdmin = dep_info && dep_info.length ? dep_info[0].leader : false;

    // 本人发起
    const selfLaunchStatistic = await handle_br_h_dep_yfq_LiuChengList(
        ddAccessToken,
        JSON.parse(timesRange),
        ddUserId,
        JSON.parse(formImportanceCondition),
        "RUNNING"
    );
    return res.send(biResponse.success({"is_admin": isAdmin, "doing_br_faqi": selfLaunchStatistic}))
}

/**
 * 个人参与的流程统计
 * @param req
 * time： 筛选区间，精确到天
 * user： 登录的用户信息
 * flowImportanceCondition：流程重要性
 *    {flowImportanceCondition: {type: "important"| "unImportant", flows:[]}}
 *    type："important" | "unImportant"，为空是表示全部
 *    flows：需要精确筛选的流程ids
 * @param res
 * @returns {Promise<*>}
 */
exports.getSelfJoinDoingFlowsStatistic = async (req, res) => {

    const {parentDepartmentId, subDepartmentId, timesRange, formImportanceCondition} = req.query;
    const ddUserId = await userService.getDingDingUserId(req.user.id);
    const {access_token: ddAccessToken} = await redisRepo.getToken();

    // 单个
    let dep_info = getDepartmentOfUser(ddUserId, ddAccessToken, parentDepartmentId, subDepartmentId)
    const isAdmin = dep_info && dep_info.length ? dep_info[0].leader : false;

    const selfJoinData = await handle_br_cy_LiuChengList(
        ddAccessToken,
        JSON.parse(timesRange),
        ddUserId,
        JSON.parse(formImportanceCondition),
        "RUNNING"
    )

    return res.send(biResponse.success({"is_admin": isAdmin, "br_canyu": selfJoinData}))
}

exports.getDepartmentLaunchDoingFlowsStatistic = async (req, res) => {
    const {parentDepartmentId, subDepartmentId, timesRange, formImportanceCondition} = req.query;
    const ddUserId = await userService.getDingDingUserId(req.user.id);
    const {access_token: ddAccessToken} = await redisRepo.getToken();

    // 统计指定项目组下的流程数据
    if (subDepartmentId) {
        // 保存该项目的部门信息
        let departments = [];
        // 根据userid判断是否存在于白名单中
        if (whiteList.pepArr().includes(ddUserId)) {
            const depLists = await globalGetter.getDepartments();
            const subDepartments = await departmentService.getSubDeptLev(depLists, parentDepartmentId)
            if (subDepartments.length === 0) {
                const parentDepartment = depLists.filter((item) => item.dept_id == parentDepartmentId);
                parentDepartment.forEach((element) => {
                    element.leader = true;
                });
                departments = parentDepartment;
            } else {
                departments = subDepartments.filter((item) => item.dept_id == subDepartmentId);
            }
        } else {
            // 返回用户所有的部门信息
            const departmentsOfUser = await departmentService.getDepLev(ddAccessToken, ddUserId);
            // 根据传递的 parentDepartmentId 获取一级部门信息
            const parentDepartmentsOfUser = departmentsOfUser.filter(
                (item) => item.dept_id == parentDepartmentId
            );

            if (!parentDepartmentsOfUser[0].dep_child.length) {
                departments = parentDepartmentsOfUser;
            } else {
                departments = departmentsOfUser.filter((item) => item.dept_id == parentDepartmentId);
            }
            if (departments[0].dep_child.length) {
                const c_dep = departments[0].dep_child.filter(
                    (item) => item.dept_id === subDepartmentId
                );
                departments = c_dep;
            }
        }

        const isAdmin = departments[0].leader;
        if (isAdmin) {
            // 部门发起
            console.time("部门发起");
            const departmentLaunchData = await handle_dep_fq_LiuChengList(
                ddAccessToken,
                JSON.parse(timesRange),
                parentDepartmentId,
                departments,
                JSON.parse(formImportanceCondition)
            );
            console.timeEnd("部门发起");

            return res.send(biResponse.success(
                {
                    is_admin: isAdmin,
                    dep_faqi: departmentLaunchData,
                }
            ))
        }
    }
    // 统计一级部门下所有项目组的流程数据
    else {
        let subDepts = [];
        let dep_info = [];
        // 根据userid判断是否存在于白名单中
        if (whiteList.pepArr().includes(ddUserId)) {
            const depLists = await globalGetter.getDepartments();
            const subDepartments = await departmentService.getSubDeptLev(depLists, parentDepartmentId)
            if ((subDepartments.length === 0)) {
                const depas = depLists.filter((item) => item.dept_id == parentDepartmentId);
                depas.forEach((element) => {
                    element.leader = true;
                });
                dep_info = depas;
            } else {
                dep_info = subDepartments;
            }
            subDepts = dep_info;
        } else {
            // 返回用户的部门信息
            const departmentsOfUser = await departmentService.getDepLev(ddAccessToken, ddUserId);
            // 筛选出当前所在部门
            const ac_dep = departmentsOfUser.filter((item) => item.dept_id == parentDepartmentId);
            // 如果子部门为空
            if (ac_dep[0].dep_child.length === 0) {
                dep_info = ac_dep;
                subDepts = dep_info;
            } else {
                // 如果存在子部门
                dep_info = ac_dep[0].dep_child;
                subDepts = dep_info;
            }
        }
        // 判断当前部门是否是主管 是主管返回部门信息不是主管返回个人信息
        // 判断当前用户是否是管理员
        const is_admin = dep_info[0].leader;
        if (is_admin) {
            // 部门发起
            console.time("部门发起");
            const dep_faqi = await handle_dep_fq_LiuChengList(
                ddAccessToken,
                JSON.parse(timesRange),
                parentDepartmentId,
                subDepts,
                JSON.parse(formImportanceCondition)
            );
            console.timeEnd("部门发起");

            return res.send(biResponse.success(
                {
                    is_admin: is_admin,
                    dep_faqi: dep_faqi,
                }
            ))
        }
    }
    return res.send(biResponse.success({
        is_admin: false,
        dep_faqi: [],
    }))
}

exports.getDepartmentJoinDoingFlowsStatistic = async (req, res) => {
    const {parentDepartmentId, subDepartmentId, timesRange, formImportanceCondition} = req.query;
    const ddUserId = await userService.getDingDingUserId(req.user.id);
    const {access_token: ddAccessToken} = await redisRepo.getToken();

    if (subDepartmentId) {
        // 单个
        let dep_info = departmentService.getDepartmentsOfUser(ddUserId);
        const isAdmin = dep_info[0].leader;
        if (isAdmin) {
            // 部门参与
            console.time("部门参与");
            const dep_canyuliu = await handle_dep_cy_LiuChengList(
                ddAccessToken,
                JSON.parse(timesRange),
                parentDepartmentId,
                dep_info,
                JSON.parse(formImportanceCondition)
            );
            console.timeEnd("部门参与");
            return res.send(biResponse.success({is_admin: isAdmin, dep_canyuliu: dep_canyuliu}))
        }
    } else {
        // 全部
        // 部门信息
        let dep_list = [];
        let dep_info = [];
        // 根据userid判断是否存在于白名单中
        if (whiteList.pepArr().includes(ddUserId)) {
            const depLists = await globalGetter.getDepartments();
            if ((await departmentService.getSubDeptLev(depLists, parentDepartmentId)).length === 0) {
                const depas = depLists.filter((item) => item.dept_id == parentDepartmentId);
                depas.forEach((element) => {
                    element.leader = true;
                });
                dep_info = depas;
            } else {
                dep_info = await departmentService.getSubDeptLev(depLists, parentDepartmentId);
            }
            dep_list = dep_info;
        } else {
            // 返回用户详情
            const lev_dep_list = await departmentService.getDepLev(ddAccessToken, ddUserId);
            // 筛选出当前所在部门
            const ac_dep = lev_dep_list.filter((item) => item.dept_id == parentDepartmentId);
            // 如果子部门为空
            if (ac_dep[0].dep_child.length === 0) {
                dep_info = ac_dep;
                dep_list = dep_info;
            } else {
                // 如果存在子部门
                dep_info = ac_dep[0].dep_child;
                dep_list = dep_info;
            }
        }
        // 判断当前部门是否是主管 是主管返回部门信息不是主管返回个人信息
        // 判断当前用户是否是管理员
        const is_admin = dep_info[0].leader;
        if (is_admin) {
            // 部门参与
            console.time("部门参与");
            const dep_canyuliu = await handle_dep_cy_LiuChengList(
                ddAccessToken,
                JSON.parse(timesRange),
                parentDepartmentId,
                dep_list,
                JSON.parse(formImportanceCondition)
            );
            console.timeEnd("部门参与");

            return res.send(biResponse.success({
                    is_admin: is_admin,
                    dep_canyuliu: dep_canyuliu
                })
            )
        }
    }

    return res.send(biResponse.success({
        is_admin: false,
        dep_faqi: [],
    }))
}

// 获取所有状态总览数据
exports.getoverview = async (req, res) => {
    const {f_dep_id, dep_q_info, time} = req.query;
    // 子部门信息
    const dep_q_infos = JSON.parse(dep_q_info);
    // 获取钉钉user_id
    const dd_id = await userService.getDingDingUserId(req.user.id);
    // 获取钉钉Token
    const {access_token} = await redisRepo.getToken();
    // 返回格式
    const resObj = {
        code: 200,
        message: "获取成功",
        data: {
            is_admin: false,
            br_faqi: [],
            br_canyu: [],
            dep_canyuliu: [],
            dep_faqi: [],
        },
    };
    console.time("本人参与");
    // 本人参与
    const canyuliu = await handle_br_cy_LiuChengList(
        access_token,
        JSON.parse(time),
        dd_id
    );
    console.timeEnd("本人参与");

    console.time("本人发起");
    // 本人发起
    const liuchenglist = await handle_br_h_dep_yfq_LiuChengList(
        access_token,
        JSON.parse(time),
        dd_id
    );
    console.timeEnd("本人发起");

    // 筛选项全部还是指定
    if (dep_q_infos.id !== "All") {
        // 单个
        let dep_info = [];
        let dep_list = [];
        // 根据userid判断是否存在于白名单中
        if (whiteList.pepArr().includes(dd_id)) {
            const depLists = await globalGetter.getDepartments();
            if ((await departmentService.getSubDeptLev(depLists, f_dep_id)).length === 0) {
                const depas = depLists.filter((item) => item.dept_id == f_dep_id);
                depas.forEach((element) => {
                    element.leader = true;
                });
                dep_info = depas;
            } else {
                const dg_dep = await departmentService.getSubDeptLev(depLists, f_dep_id);
                dep_info = dg_dep.filter((item) => item.dept_id == dep_q_infos.id);
            }
            dep_list = dep_info;
        } else {
            // 返回用户详情
            const lev_dep_list = await departmentService.getDepLev(access_token, dd_id);
            const lev_dep_lists = lev_dep_list.filter(
                (item) => item.dept_id == f_dep_id
            );
            // 如果子部门为空
            if (lev_dep_lists[0].dep_child.length === 0) {
                dep_info = lev_dep_lists;
            } else {
                dep_info = lev_dep_list.filter((item) => item.dept_id == f_dep_id);
            }
            // 判断当前用户是否是管理员
            if (dep_info[0].dep_child.length > 0) {
                const c_dep = dep_info[0].dep_child.filter(
                    (item) => item.dept_id === dep_q_infos.id
                );
                dep_info = c_dep;
            }
        }

        const is_admin = dep_info[0].leader;
        if (is_admin) {
            // 部门参与
            console.time("部门参与");
            const dep_canyuliu = await handle_dep_cy_LiuChengList(
                access_token,
                JSON.parse(time),
                f_dep_id,
                JSON.parse(JSON.stringify(dep_info)),
                dd_id
            );
            console.timeEnd("部门参与");
            // 部门发起
            console.time("部门发起");
            const dep_faqi = await handle_dep_fq_LiuChengList(
                access_token,
                JSON.parse(time),
                f_dep_id,
                JSON.parse(JSON.stringify(dep_info)),
                dd_id
            );
            console.timeEnd("部门发起");
            resObj.data = {
                is_admin: is_admin,
                br_faqi: liuchenglist,
                br_canyu: canyuliu,
                dep_canyuliu: dep_canyuliu,
                dep_faqi: dep_faqi,
            };
        } else {
            resObj.data = {
                is_admin: is_admin,
                br_faqi: liuchenglist,
                br_canyu: canyuliu,
            };
        }

    } else {
        // 全部
        // 部门信息
        let dep_list = [];
        let dep_info = [];
        // 根据userid判断是否存在于白名单中
        if (whiteList.pepArr().includes(dd_id)) {
            const depLists = await globalGetter.getDepartments();
            if ((await departmentService.getSubDeptLev(depLists, f_dep_id)).length === 0) {
                const depas = depLists.filter((item) => item.dept_id == f_dep_id);
                depas.forEach((element) => {
                    element.leader = true;
                });
                dep_info = depas;
            } else {
                dep_info = await departmentService.getSubDeptLev(depLists, f_dep_id);
            }
            dep_list = dep_info;
        } else {
            // 返回用户详情
            const lev_dep_list = await departmentService.getDepLev(access_token, dd_id);
            // 筛选出当前所在部门
            const ac_dep = lev_dep_list.filter((item) => item.dept_id == f_dep_id);
            // 如果子部门为空
            if (ac_dep[0].dep_child.length === 0) {
                dep_info = ac_dep;
                dep_list = dep_info;
            } else {
                // 如果存在子部门
                dep_info = ac_dep[0].dep_child;
                dep_list = dep_info;
            }
        }
        // 判断当前部门是否是主管 是主管返回部门信息不是主管返回个人信息
        // 判断当前用户是否是管理员
        const is_admin = dep_info[0].leader;
        if (is_admin) {
            // 部门参与
            console.time("部门参与");
            const dep_canyuliu = await handle_dep_cy_LiuChengList(
                access_token,
                JSON.parse(time),
                f_dep_id,
                JSON.parse(JSON.stringify(dep_list)),
                dd_id
            );
            console.timeEnd("部门参与");
            // 部门发起
            console.time("部门发起");
            const dep_faqi = await handle_dep_fq_LiuChengList(
                access_token,
                JSON.parse(time),
                f_dep_id,
                JSON.parse(JSON.stringify(dep_list)),
                dd_id
            );
            console.timeEnd("部门发起");
            resObj.data = {
                is_admin: is_admin,
                br_faqi: liuchenglist,
                br_canyu: canyuliu,
                dep_canyuliu: dep_canyuliu,
                dep_faqi: dep_faqi,
            };
        } else {
            resObj.data = {
                is_admin: is_admin,
                br_faqi: liuchenglist,
                br_canyu: canyuliu,
                dep_canyuliu: [],
                dep_faqi: [],
            };
        }
    }
    return res.send(biResponse.success(resObj.data));
};

// 获取流程表单数据
exports.getprocessformlist = async (req, res) => {
    // 钉钉token
    const {access_token} = await redisRepo.getToken();
    const userid = "073105202321093148"; // 涛哥id
    // 1.获取所有宜搭表单数据
    const yd_form = await dd.getAllForms(access_token, userid);
    console.log("yd_form.result.data=========>", yd_form.result.data.length);

    // const resLiuChengList = await dd.getyd_LiuChengInfoSingle(
    //   access_token,
    //   userid,
    //   "FORM-0A966I819O8BZMVBE16JLAK96KK42KD1QEIILC",
    //   10,
    //   1
    // );
    // console.log('resLiuChengList=========>', resLiuChengList.data[0])

    // return
    const sh_list = [];
    console.time("组装表单数据时间");
    // 获取流程表单的审核流
    for (let c_item of yd_form.result.data) {
        c_item.examine = null;
        await dateUtil.delay(20);
        // 获取实例详情
        const resLiuChengList = await dd.getFlowsOfStatusAndTimeRange(
            access_token,
            userid,
            c_item.formUuid,
            10,
            1
        );
        if (resLiuChengList.totalCount > 0) {
            // 判断 instanceStatus 是否为 "TERMINATED"
            const isTerminated = (item) => item.instanceStatus === "TERMINATED";
            // 找到第一个不为 "TERMINATED" 的数据
            const firstNonTerminated = resLiuChengList.data.find(
                (item) => !isTerminated(item)
            );
            let processInstanceId = "";
            // 如果都不存在取resLiuChengList.data第一个
            if (!firstNonTerminated) {
                processInstanceId = resLiuChengList.data[0].processInstanceId;
            } else {
                processInstanceId = firstNonTerminated.processInstanceId;
            }
            // 获取审批记录
            const {result} = await dd.getProcessRecord(
                access_token,
                userid,
                processInstanceId
            );
            c_item.examine = {
                title: c_item.title.zhCN,
                createTimeGMT: firstNonTerminated
                    ? firstNonTerminated.createTimeGMT
                    : resLiuChengList.data[0].createTimeGMT,
                updataTimeGMT: firstNonTerminated
                    ? firstNonTerminated.modifiedTimeGMT
                    : resLiuChengList.data[0].modifiedTimeGMT,
                data: {
                    processInstanceId,
                    title: firstNonTerminated
                        ? firstNonTerminated.title
                        : resLiuChengList.data[0].title,
                },
                approveData: result.map((approveItem) => {
                    return {
                        showName: approveItem.showName,
                        time: 0.1,
                    };
                }),
                // approveData: [processInstanceId].concat(
                //   result.map((approveItem) => approveItem.showName)
                // ),
            };
        }
    }
    const bd_liuc = yd_form.result.data.map((item) => {
        return {
            condition: "",
            formUuid: item.formUuid,
            title: item.title.zhCN,
            examineList: item.examine,
        };
    });
    console.timeEnd("组装表单数据时间");

    return res.send(biResponse.success(bd_liuc));
    console.log("req=========>", yd_form.result.data);
};
// 修改流程表单数据
exports.editprocessformobj = async (req, res) => {
    // 钉钉token
    const {access_token} = await redisRepo.getToken();
    const userid = "073105202321093148"; // 涛哥id
    // 1.获取所有宜搭表单数据
    const yd_form = await dd.getAllForms(access_token, userid);

    console.log("sh_list=========>", sh_list);
    // const bd_liuc = yd_form.result.data.map((item) => {
    //   return {
    //     formUuid: item.formUuid,
    //     title: item.title.zhCN,
    //   };
    // });

    return res.send(biResponse.success([]));
    console.log("req=========>", yd_form.result.data);
};
// 获取所有流程表单的审核流列表
exports.getliuchenglist = async (req, res) => {
    const userid = "073105202321093148"; // 涛哥id
    const {access_token} = await redisRepo.getToken();
    const list = [];
    // 1.获取所有宜搭表单数据
    const yd_form = await dd.getAllForms(access_token, userid);
    // 产品与包装设计流：FORM-6F3FC251B384490A8881DA6EAF6646A6MNGP
    // const resLiuChengList = await dd.getyd_LiuChengInfoSingle(
    //   access_token,
    //   userid,
    //   "FORM-027086325D5B4B24885D75A541FD633E7AMV",
    //   10,
    //   1
    // );
    for (let c_item of yd_form.result.data) {
        // 获取实例详情
        const resLiuChengList = await dd.getFlowsOfStatusAndTimeRange(
            access_token,
            userid,
            c_item.formUuid,
            10,
            1
        );
        if (resLiuChengList.totalCount > 0) {
            // 判断 instanceStatus 是否为 "TERMINATED"
            const isTerminated = (item) => item.instanceStatus === "TERMINATED";
            // 找到第一个不为 "TERMINATED" 的数据
            const firstNonTerminated = resLiuChengList.data.find(
                (item) => !isTerminated(item)
            );
            let processInstanceId = "";
            // 如果都不存在取resLiuChengList.data第一个
            if (!firstNonTerminated) {
                processInstanceId = resLiuChengList.data[0].processInstanceId;
            } else {
                processInstanceId = firstNonTerminated.processInstanceId;
            }
            // 获取审批记录
            const {result} = await dd.getProcessRecord(
                access_token,
                userid,
                processInstanceId
            );
            list.push({
                title: c_item.title.zhCN,
                createTimeGMT: firstNonTerminated
                    ? firstNonTerminated.createTimeGMT
                    : resLiuChengList.data[0].createTimeGMT,
                updataTimeGMT: firstNonTerminated
                    ? firstNonTerminated.modifiedTimeGMT
                    : resLiuChengList.data[0].modifiedTimeGMT,
                data: {
                    processInstanceId,
                    title: firstNonTerminated
                        ? firstNonTerminated.title
                        : resLiuChengList.data[0].title,
                },
                approveData: [processInstanceId].concat(
                    result.map((approveItem) => approveItem.showName)
                ),
            });
        }
    }
    excelUtil.createExcel(list, "审核流模版.xlsx");
    return res.send(biResponse.success(list));
};

// 获取json文件数据
const getpreid = (fileName) => {
    const dirPath = path.resolve(__dirname, `../file/审核流数据/${fileName}`);
    let results = []; // 用于存储所有json文件的结果
    fs.readdirSync(dirPath).forEach((file) => {
        if (path.extname(file) === ".json") {
            const fileName = path.basename(file, ".json");
            let fileFullPath = path.join(dirPath, file);
            try {
                let content = fs.readFileSync(fileFullPath, "utf8");
                let jsonContent = JSON.parse(content);

                if (jsonContent && jsonContent.content && jsonContent.content.data) {
                    jsonContent.content.data.forEach((dataItem) => {
                        results.push({
                            fileName: fileName,
                            dataItem: dataItem,
                        });
                    });
                } else {
                    results.push({
                        fileName: fileName,
                        dataItem: jsonContent.content,
                    });
                }
            } catch (error) {
                console.error(`出错文件=》》》》》》》》》》 ${file}:`, error);
            }
        }
    });
    return results;
};
// 处理审核流数据
const handlesh = (q_jsonData, h_jsonData) => {
    console.log("q_jsonData.length=========>", q_jsonData.length);
    console.log("h_jsonData.length=========>", h_jsonData.length);
    const formid = [
        {
            name: "产品与包装设计流程",
            code: "TPROC--D2B665D1B3JHBTCTBBGB585UUAZD31BISU5RL1",
            formId: "FORM-6F3FC251B384490A8881DA6EAF6646A6MNGP",
        },
        {
            name: "天猫链接流转流程",
            code: "TPROC--QMB66NA1YI1H7ODU6UVV8BWE76RZ2AT0PFHQL2",
            formId: "FORM-1935E30017E64A23A0578D0CD30B041CQ7YA",
        },
        {
            name: "天猫链接打仗审核流程",
            code: "TPROC--4W8667D1OB1HDHK6DK89LCJ4XFUR21ROZOHQL4",
            formId: "FORM-495A1584CBE84928BB3B1E0D4AA4B56AYN1J",
        },
        {
            name: "运营单项奖励流程",
            code: "TPROC--4V966QC164UGBO4QELIF05NJH9CO3F1KLQBQL8",
            formId: "FORM-5AF7B7327DE94F59905BB5B6B733BFABSGH5",
        },
        {
            name: "猫超上架流程",
            code: "TPROC--AC666081ZSCG49N86SUSR4V8DYX33KQ7MPKPL1",
            formId: "FORM-5DC23EDC58094574B796CB2DBA29C4E1PA29",
        },
        {
            name: "京东市场分析流程",
            code: "TPROC--A8666NA1I0AB7546FZYMFAV08IM02QK5PJIIL6",
            formId: "FORM-A8666NA1I0AB7546FZYMFAV08IM02OK5PJIIL5",
        },
        {
            name: "部门电脑申请流程",
            code: "TPROC--A8666NA1PXREP0GH8JLK6BIMPAW93W381PCNL3",
            formId: "FORM-A8666NA1PXREP0GH8JLK6BIMPAW93V381PCNL2",
        },
        {
            name: "运营执行流程",
            code: "TPROC--K5A66M718P8B40TK8PS1W45BHQK32WWJOGIILV",
            formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
        },
        {
            name: "运营优化方案流程",
            code: "TPROC--CP766081CPAB676X6KT35742KAC22BLLKHIILC",
            formId: "FORM-CP766081CPAB676X6KT35742KAC229LLKHIILB",
        },
        {
            name: "运营定制产品流程",
            code: "TPROC--FDA66N819N8BQ2K38CZWQBA05JSP3I2IJYJILD",
            formId: "FORM-FDA66N819N8BQ2K38CZWQBA05JSP3H2IJYJILC",
        },
        {
            name: "降成本运营发布流程",
            code: "TPROC--9O666M711Y8B594PALYYTABX5DGD2LAQ9IIILD",
            formId: "FORM-9O666M711Y8B594PALYYTABX5DGD2JAQ9IIILC",
        },
        {
            name: "采购任务运营发布",
            code: "TPROC--0A966I819O8BZMVBE16JLAK96KK42LD1QEIILD",
            formId: "FORM-0A966I819O8BZMVBE16JLAK96KK42KD1QEIILC",
        },
        {
            name: "美编任务运营发布",
            code: "TPROC--WV866IC1JU8B99PU77CDKBMZ4N5K271FLKIILT",
            formId: "FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS",
        },
        {
            name: "运营拍摄流程",
            code: "TPROC--HT866U9170EBJIC28EBJC7Q078ZA3YEPPMIIL2",
            formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
        },
        {
            name: "产品编码销完下架流程",
            code: "TPROC--F8666NB18MGCVKUTB5S36CEMIOFK2YHV2U3KL3",
            formId: "FORM-F8666NB18MGCVKUTB5S36CEMIOFK2XHV2U3KL2",
        },
        {
            name: "美编新品作图流程",
            code: "TPROC--566665710VTHFJ6WB5VWCDM28Z3B30HCL9KRL0",
            formId: "FORM-D5D36E9FEB5A440EAB873A8450A07FA8EB33",
        },
        {
            name: "运营预售商品流程",
            code: "TPROC--K9766DA1ZVDB1L0W7VM0H97S44ZR2KOJEOJILK",
            formId: "FORM-K9766DA1ZVDB1L0W7VM0H97S44ZR2JOJEOJILJ",
        },
        {
            name: "京东入仓差异调整流程",
            code: "TPROC--3J866L813P8BY3Y1CX7AV6RZCTW82CY9HMJILL",
            formId: "FORM-3J866L813P8BY3Y1CX7AV6RZCTW82BY9HMJILK",
        },
        {
            name: "拼多多上架流程",
            code: "TPROC--56666571GT8B1F7HBMW3V5DBZKCJ3BIH1NJILU",
            formId: "FORM-56666571GT8B1F7HBMW3V5DBZKCJ3AIH1NJILT",
        },
        {
            name: "运营销量变化流程",
            code: "TPROC--IQ8666B19V8BYKVT614OUB3J7S5N29096OJILG",
            formId: "FORM-IQ8666B19V8BYKVT614OUB3J7S5N28096OJILF",
        },
        {
            name: "京东增加SKU到仓流程",
            code: "TPROC--Y6666RA19P8BFASD682FE8OMWGSQ3DSK9NJILY",
            formId: "FORM-Y6666RA19P8BFASD682FE8OMWGSQ3DSK9NJILX",
        },
        {
            name: "运营链接破价流程",
            code: "TPROC--Q4A664A14SNCPLWT8GBZFA8JW40R3LW5WVAKL1",
            formId: "FORM-Q4A664A14SNCPLWT8GBZFA8JW40R3JW5WVAKL0",
        },
        {
            name: "天猫链接上架流程",
            code: "TPROC--0X966971LL0EI3OC9EJWUATDC84839H8V09ML2",
            formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
        },
        {
            name: "运营代发流程",
            code: "TPROC--GI666T81KINCWI9UEHGTPA1T2C1J3JSDAIGKLK",
            formId: "FORM-GI666T81KINCWI9UEHGTPA1T2C1J3ISDAIGKLJ",
        },
        {
            name: "运营新品流程6.8",
            code: "TPROC--UP966371U6HBS5WPEMFKF505T8K82APC62NIL1",
            formId: "FORM-UP966371U6HBS5WPEMFKF505T8K829PC62NIL0",
        },
        {
            name: "运营产品专利投诉解决流程",
            code: "TPROC--4IA668916HKCDJ2O9KPRFBWT069H3G08AJ6KL7",
            formId: "FORM-4IA668916HKCDJ2O9KPRFBWT069H3F08AJ6KL6",
        },
        {
            name: "京东链接优化流程",
            code: "TPROC--KW766OD1UJ0E80US7YISQ9TMNX5X36QZ18AMLX",
            formId: "FORM-KW766OD1UJ0E80US7YISQ9TMNX5X36QZ18AMLW",
        },
        {
            name: "京东上架流程",
            code: "TPROC--4UA668D10ALFPF8T6TLPMAVOBDPL2TE5N2FOL0",
            formId: "FORM-4UA668D1N8KFOLG6B2BWW41NLQ4V2RE5N2FOL83",
        },
        {
            name: "运营新品流程",
            code: "TPROC--6L966171SX9B1OIODYR0ICISRNJ13C9F75IIL4",
            formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
        },
        {
            name: "拼多多市场分析流程",
            code: "TPROC--5Q966D91S9NG2COIFDRG79FH0RVS2BB1FNXPL1",
            formId: "FORM-24E26CB73155486F978F0FA5072311D70LSA",
        },
        {
            name: "拼多多链接优化流程",
            code: "TPROC--CP7660816ZZEOHY06AGOAD39ICX62K0YLGCOL81",
            formId: "FORM-CP7660816ZZEOHY06AGOAD39ICX62WYXLGCOL71",
        },
        {
            name: "产品标签优化需求流程",
            code: "TPROC--0X96697193SG7U0VC1ZDJAPJARRO2D1SL73QL0",
            formId: "FORM-361AF0EEAFCB4F9C932BFA6AF70801DD49U4",
        },
        {
            name: "新建质检报告流程",
            code: "TPROC--PQ866RC1VXXEIV62DY8PQ5TQGWUK3B7ETHINL3",
            formId: "FORM-PQ866RC1VXXEIV62DY8PQ5TQGWUK3B7ETHINL2",
        },
        {
            name: "工商投诉流程",
            code: "TPROC--NO766591R66FKG1EF0UXN7HANWWA3QI8YM2OLN",
            formId: "FORM-NO766591R66FKG1EF0UXN7HANWWA3PI8YM2OLM",
        },
        {
            name: "库房样品检查核对流程",
            code: "TPROC--2J6666D1G32DEAPK76ZOY9X8OKUA2MENL3WKL9",
            formId: "FORM-2J6666D1G32DEAPK76ZOY9X8OKUA2LENL3WKL8",
        },
        {
            name: "仓外库存调整差异流程",
            code: "TPROC--NO7665914UHBI1LH7C79CAD8H08D3HL35MPILB",
            formId: "FORM-NO7665914UHBI1LH7C79CAD8H08",
        },
        {
            name: "采购选品会",
            code: "TPROC--33666CB1FV8BQCCE9IWPV4DYQIEJ35M5Q9IILQ",
            formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
        },
        {
            name: "采购断货流程",
            code: "TPROC--F8666NB1JO8BPCAW7KNFD7TMJWMJ2AAPAQIILR",
            formId: "FORM-F8666NB1JO8BPCAW7KNFD7TMJWMJ29APAQIILQ",
        },
        {
            name: "非天猫平台选品流程",
            code: "TPROC--4V966QC11QKCNLYQ709ZU8BCDEG93S5L9L6KL2",
            formId: "FORM-4V966QC11QKCNLYQ709ZU8BCDEG93S5L9L6KL1",
        },
        {
            name: "采购成本变化流程",
            code: "TPROC--FDA66N81QFGCJ5ALA6LQG6KZLRJH35JTIK0KL1",
            formId: "FORM-FDA66N81QFGCJ5ALA6LQG6KZLRJH34JTIK0KL0",
        },
        {
            name: "库房断货流程",
            code: "TPROC--XN966G71P3EBWDKS67FVB6VM87WZ1LE61QIIL1",
            formId: "FORM-XN966G71P3EBWDKS67FVB6VM87WZ1KE61QIIL0",
        },
        {
            name: "新增SKU订货流程",
            code: "TPROC--TP866D91IM6ESSF18NJZABCB83Q23Y46IAHML4",
            formId: "FORM-TP866D91IM6ESSF18NJZABCB83Q23X46IAHML3",
        },
        {
            name: "产品问题解决流程",
            code: "TPROC--CP766081IWECNTLIF4H1MDAUORHV3I54K21KLH",
            formId: "FORM-CP766081IWECNTLIF4H1MDAUORHV3H54K21KLG",
        },
        {
            name: "加班申请流程",
            code: "TPROC--K5766HA14HSFVQ9C63BNCB4XMOY32WX6D5SOL1",
            formId: "FORM-K5766HA1MQSF943NE794HCWU0T3K2VX6D5SOLD5",
        },
        {
            name: "1688市场分析流程",
            code: "TPROC--IQ8666B1XGTGQ0QO806TUAGD47PD25BQC55QL0",
            formId: "FORM-E0E95F1BFCA14D319CBB629202D6D98FD0GP",
        },
        {
            name: "1688新品上架流程",
            code: "TPROC--AKA66FB13HTGAHRS65YQW4VV2AG13T5WK55QL0",
            formId: "FORM-C385A12DA9B947428DD2A2C8BCDE9588BGAZ",
        },
        {
            name: "财务押金保证金申请流程",
            code: "TPROC--8Y866XB1N5ZGPIJJCJL7J90QCZW33LN6R5DQL1",
            formId: "FORM-EF1980B18F5845EA972B5201DC3B6066WL2L",
        },
        {
            name: "财务经营费用流程",
            code: "TPROC--RS966T81K6ZGK4DAFGJEI8XPZGA73FWD86DQL0",
            formId: "FORM-027086325D5B4B24885D75A541FD633E7AMV",
        },
        {
            name: "财务管理费用申请流程",
            code: "TPROC--J1A66U81UGZG3ZMOE9GF7BVY0XID2XY0OKDQL0",
            formId: "FORM-98EE0546F1844DFCAEE5378EA176E278IJYR",
        },
        {
            name: "产品包装盒采购需求流程",
            code: "TPROC--0IA66C71TAZGUQNJ6NBB78IQ61RK27S4DUEQL2",
            formId: "FORM-D638B46CB8B74316B36FDF579E800590CL0C",
        },
        {
            name: "日常订货付款申请",
            code: "TPROC--TP866D91JF2HKLV0CG94Z698DCLB2ZE6SFKQL3",
            formId: "FORM-56818F54DAAC4445ADA7FB499FC8A626BCGL",
        },
        {
            name: "快递、云仓付款申请",
            code: "TPROC--AKA66FB1751HF3T1F7ROMC5L3CFC3X47NGKQL4",
            formId: "FORM-19D27577A8B0468DA987163A6E95F3C6OT73",
        },
        {
            name: "各平台（或定制款）订货下单流程",
            code: "TPROC--AC666081UT1HKMH5CR2HR57GIPE8358IGHKQL4",
            formId: "FORM-A5572E2D70844276BEA42FF2695A6E58FTNE",
        },
        {
            name: "供应商月对账单审批流程",
            code: "TPROC--3J866L81GE4H30XU9JPH785ZM1ZU28PR4IKQL0",
            formId: "FORM-3884780863BF4631B4B7E97AAB0A2ECFEV6U",
        },
        {
            name: "网店管家采购单冲抵流程",
            code: "TPROC--DJC666A1ME4HOSV4AHKSFDQUYWI12BI8DIKQL0",
            formId: "FORM-C442887CCBC14E73AC744B7394C771EDP7NN",
        },
        {
            name: "出差申请流程",
            code: "TPROC--LS5663B16C5H4H806LLBPB5XCYPZ292BF6NQL6",
            formId: "FORM-1A348EF7669544D4B93AFCEDD6509B18APV7",
        },
        {
            name: "各物流月拦截情况汇总表",
            code: "TPROC--6L966171QJ7HA82WAE3ZW9XOCQDC2PT49XOQL0",
            formId: "FORM-0C4DFD9B2D7C4C4E851A36E76413E9B5IL68",
        },
        {
            name: "未命名流程表单",
            code: "TPROC--WV866IC1HUFH8SH395BSX5TF5O752SJCLPHRLC",
            formId: "FORM-E39DCFAE59DF42D5B076266C40F33868V7A1",
        },
        {
            name: "12333",
            code: "TPROC--3J866L810V0IMDDN6Z05567TV23Z2CRCMFURLM",
            formId: "FORM-728E2640040343BEBC4CF44F3F0A8906KH57",
        },
        {
            name: "TK出库申请流程",
            code: "TPROC--56666571758I0R1WDOFI06G4E2O72YGB57XSLP",
            formId: "FORM-80B6ED5B59804748838B81D24E93F647U7YM",
        },
        {
            name: "仓内库存调整流程",
            code: "TPROC--D2B665D1V38I8H4VDEUI7A2XXV4Q3DN5M2YSL4",
            formId: "FORM-53B93E5C695F44399B39D997FB11BECBKLOV",
        },
    ];
    console.log("formid.length=========>", formid.length);
    const formidMap = new Map(formid.map((item) => [item.name, item]));
    const res = [];
    q_jsonData.forEach((item_q) => {
        const matchedFormItem = formidMap.get(item_q.fileName);
        // console.log('matchedFormItem=========>', matchedFormItem)
        if (matchedFormItem) {
            h_jsonData.forEach((item_h) => {
                if (item_h.fileName === item_q.fileName) {
                    res.push({
                        formId: matchedFormItem.formId,
                        formName: matchedFormItem.name,
                        status: item_q.dataItem.status,
                        l_id: item_q.dataItem.id,
                        reviewProcess: JSON.parse(item_h.dataItem),
                    });
                }
            });
        }
    });
    return res;
};

// 格式化审核数据数据结构
const formatData = (originForms) => {

    const result = originForms.map(form => {
        let reviewProcess = [];
        const liuData = JSON.parse(form.liu_data);
        if (liuData && liuData.schema && liuData.schema.children) {
            reviewProcess = flowFormService.refactorReviewItems(liuData.schema.children)
        }
        return {
            formId: form.form_id,
            c_id: form.c_id,
            modifiedTime: form.modifiedTime,
            reviewProcess: reviewProcess,
        };
    });

    return result;
};


// 将抓取到的审核流模版处理成excel
const createRevewExcel = (data, fileName) => {
    let wb = new excel4node.Workbook();
    let processChildren = (formId, node, level = 0) => {
        let result = [];

        // 如果 node.props 或者 node.props.name 不存在，就使用 node.title ，如果都不存在，使用一个默认字符串
        let name = "";
        if (
            node.componentName === "ApplyNode" ||
            node.componentName === "EndNode"
        ) {
            name = node.props.name.zh_CN || node.props.name;
        } else {
            if (!node.props || !node.props.name) {
                name = node.title || formId;
            } else {
                if (node.props.conditions) {
                    name = `${node.props.name}(${
                        node.props.conditions.description || ""
                    })`;
                } else {
                    if (typeof node.props.name === "string") {
                        name = `${node.props.name || ""}`;
                    } else {
                        name = `${node.props.name.zh_CN || ""}`;
                    }
                }
            }
        }
        let bgColor = "";
        if (name === "条件分支") {
            bgColor = "ffffff"; // RED
        } else if (name.includes("条件")) {
            bgColor = "FFFFFF00"; // Yellow
        } else if (
            name.includes("抄送人") ||
            name.includes("其他情况") ||
            name.includes("发起") ||
            name.includes("条件分支") ||
            name.includes("结束")
        ) {
            bgColor = "red"; // Yellow
        } else {
            // bgColor = colors[level % colors.length]; // 根据层级选择颜色
            bgColor = "ffffff";
        }

        let style = {
            fill: {
                patternType: "solid",
                fgColor: {rgb: bgColor},
                bgColor: {indexed: 64},
            },
        };

        // 输出当前行，并附加level数量的缩进
        const prefix = "\u00A0".repeat(level * 4);
        // const prefix = "-".repeat(level * 4);
        result.push({name: `${prefix}${name}`, style});

        // 处理子节点
        if (node.children) {
            let children = node.children;
            // node.componentName === "CanvasEngine"
            //   ? node.children.slice(1)
            //   : node.children;
            for (let child of children) {
                result = result.concat(processChildren(formId, child, level + 1));
            }
        }

        return result;
    };

    data.forEach((item, index) => {
        let rows = processChildren(item.formId, item.reviewProcess.schema, 0);
        let ws = wb.addWorksheet(item.formName);

        ws.column(1).setWidth(60);

        rows.forEach((row, i) => {
            let style = wb.createStyle({
                fill: {
                    type: "pattern",
                    patternType: "solid",
                    fgColor: row.style.fill.fgColor.rgb,
                },
                border: {
                    left: {style: "thin", color: "#000000"},
                    right: {style: "thin", color: "#000000"},
                    top: {style: "thin", color: "#000000"},
                    bottom: {style: "thin", color: "#000000"},
                },
            });

            ws.cell(i + 1, 1)
                .string(row.name)
                .style(style);

            // 如果名字为'条件分支'或者包含'条件'则在第二列同一行添加 '不填写时间'
            if (
                row.name.includes("条件分支") ||
                row.name.includes("条件") ||
                row.name.includes("其他情况") ||
                row.name.includes("抄送人")
            ) {
                ws.cell(i + 1, 2).string("不填写时间");
            }
        });

        ws.cell(1, 2).string("不填写时间");
        ws.cell(2, 2).string("不填写时间");
        ws.cell(rows.length, 2).string("不填写时间");
    });

    // 将所有数据写入一个Excel文件
    wb.write(fileName);
};
// 处理审核流数据
exports.createExcel = async (req, res) => {
    const q_jsonData = getpreid("前置数据");
    const h_jsonData = getpreid("后置数据");
    const new_data = handlesh(q_jsonData, h_jsonData);
    // 生成审核流模版excel文件
    createRevewExcel(JSON.parse(JSON.stringify(new_data)), "template/审核流数据模版.xlsx");
    // 格式化之后的数据
    const data = formatData(JSON.parse(JSON.stringify(new_data)));
    // 入库数据结构
    data.forEach(async (item) => {
        await FlowFormReviewModel.upsert({
            form_id: item.formId,
            form_review: item.reviewProcess,
        });
    });

    return res.send(biResponse.success([]));
};
// 导出oa所有流程
exports.getOaAllProcess = async (req, res) => {
    // const { access_token } = await getToken();
    // const userid = "073105202321093148"; // 涛哥id
    // const resLiuChengList = await dd.getOaAllProcess(access_token, userid);
    let wb = new excel4node.Workbook();
    const oa_List = [
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "日常订货付款申请",
            gmtModified: "2024-01-05T14:32Z",
            iconName: "common",
            processCode: "PROC-7DBEA61E-7BBF-4B6A-943C-A9AB44F0B035",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "备用金申请",
            gmtModified: "2024-01-08T10:06Z",
            iconName: "biz",
            processCode: "PROC-0C45B1DA-E65E-4C57-B1BE-5FF8FF7B4EED",
            iconUrl:
                "https://img.alicdn.com/imgextra/i1/O1CN0169Fn5R24E16X0jVZ6_!!6000000007358-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "离职",
            gmtModified: "2023-12-12T13:52Z",
            iconName: "fly",
            processCode: "PROC-6966E6FD-887D-413C-819F-8E9FBC4A8434",
            iconUrl:
                "https://img.alicdn.com/imgextra/i3/O1CN01LerNcO1ZzsP53zuLJ_!!6000000003266-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 7,
            flowTitle: "换班",
            gmtModified: "2020-08-04T16:25Z",
            iconName: "relieve",
            processCode: "PROC-A558155D-EA7C-4AD4-A010-748BED720849",
            iconUrl:
                "https://img.alicdn.com/imgextra/i3/O1CN01C4MeMd1ZCPcxWUe8q_!!6000000003158-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "部门协作（一对一）",
            gmtModified: "2021-08-30T17:44Z",
            iconName: "exchange",
            processCode: "PROC-832ACD84-0984-4052-A1F7-2C6A7C038548",
            iconUrl:
                "https://img.alicdn.com/imgextra/i3/O1CN01ST07Gs25ABP9pzgSS_!!6000000007485-2-tps-480-480.png",
        },
        {
            newProcess: false,
            attendanceType: 2,
            flowTitle: "客服请假",
            gmtModified: "2023-11-21T09:27Z",
            iconName: "leave",
            processCode: "PROC-19AB9973-97F6-4409-913A-548583C79E04",
            iconUrl:
                "https://img.alicdn.com/imgextra/i3/O1CN01KlxdBZ1RwCITwWURk_!!6000000002175-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "快递付款申请",
            gmtModified: "2023-12-15T12:49Z",
            iconName: "procurement",
            processCode: "PROC-3B68A1FF-7C03-4AD0-ACF0-C2EEAFD89CD5",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01AYTIyi1tsMDVcgNSq_!!6000000005957-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "杂费",
            gmtModified: "2024-02-21T10:20Z",
            iconName: "procurement",
            processCode: "PROC-0D2BCBB5-7882-487E-8FF1-F6DBE7E19F63",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01AYTIyi1tsMDVcgNSq_!!6000000005957-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "软件采购申请",
            gmtModified: "2023-10-25T11:22Z",
            iconName: "biz",
            processCode: "PROC-77F40AA6-D6C2-46F5-81E7-FDDB9859CA27",
            iconUrl:
                "https://img.alicdn.com/imgextra/i1/O1CN0169Fn5R24E16X0jVZ6_!!6000000007358-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "房租",
            gmtModified: "2023-10-23T16:06Z",
            iconName: "house",
            processCode: "PROC-F2867A64-FE58-42B2-ADDC-044282E7376C",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN017ix8gZ1ebD9XWrom5_!!6000000003889-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "仓库运费及日杂费",
            gmtModified: "2022-08-26T18:03Z",
            iconName: "biz",
            processCode: "PROC-04192EE0-93D1-4010-AA70-D59714CFFF56",
            iconUrl:
                "https://img.alicdn.com/imgextra/i1/O1CN0169Fn5R24E16X0jVZ6_!!6000000007358-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "运营推广费",
            gmtModified: "2024-01-11T17:00Z",
            iconName: "datapie",
            processCode: "PROC-36B4FCEB-4F57-4012-814C-1D60018D0C19",
            iconUrl:
                "https://img.alicdn.com/imgextra/i4/O1CN01EuisBL1SSiPogkS3k_!!6000000002246-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "专利审批",
            gmtModified: "2022-08-23T14:01Z",
            iconName: "payment",
            processCode: "PROC-E5393684-C6EF-450B-B1FB-690502E2D661",
            iconUrl:
                "https://img.alicdn.com/imgextra/i3/O1CN01NcX3GA261JLcC1KzU_!!6000000007601-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "拍照用品",
            gmtModified: "2024-01-10T19:48Z",
            iconName: "biz",
            processCode: "PROC-0117DD0D-FB49-4B64-AFB3-4B167AF47182",
            iconUrl:
                "https://img.alicdn.com/imgextra/i1/O1CN0169Fn5R24E16X0jVZ6_!!6000000007358-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "差旅报销费用",
            gmtModified: "2023-11-14T17:01Z",
            iconName: "trip",
            processCode: "PROC-949A66E5-9156-4A4B-A0D5-523C71114D9F",
            iconUrl:
                "https://img.alicdn.com/imgextra/i3/O1CN011JkyFi29g1Ov9ZBPB_!!6000000008096-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "业务招待",
            gmtModified: "2023-05-23T18:45Z",
            iconName: "message",
            processCode: "PROC-7DD4ED81-297E-4FD8-AFC4-79491C3B850A",
            iconUrl:
                "https://img.alicdn.com/imgextra/i1/O1CN01QFVaYy1YkvraxC3vW_!!6000000003098-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "外聘费",
            gmtModified: "2023-11-17T14:38Z",
            iconName: "love",
            processCode: "PROC-16C61BA5-9F82-419B-84CA-682DDD4424DE",
            iconUrl:
                "https://img.alicdn.com/imgextra/i3/O1CN0103C48E1liGYy18eGQ_!!6000000004852-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "付款申请单",
            gmtModified: "2023-12-14T20:12Z",
            iconName: "pay",
            processCode: "PROC-20C43271-5D2E-4D91-BAA5-7A838F0234EE",
            iconUrl:
                "https://img.alicdn.com/imgextra/i1/O1CN01VkwWMH28poFdlsfL9_!!6000000007982-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "财务、行政、人事物品借用申请",
            gmtModified: "2023-03-10T13:16Z",
            iconName: "tag",
            processCode: "PROC-6EE3A030-040B-4EFD-A455-E8C84C5E585B",
            iconUrl:
                "https://img.alicdn.com/imgextra/i3/O1CN01S7JMRH1L7Sj8f23gW_!!6000000001252-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "开发票申请审批",
            gmtModified: "2023-09-19T09:36Z",
            iconName: "out",
            processCode: "PROC-896687BC-73C5-4E81-BBDA-135A4DC44EE6",
            iconUrl:
                "https://img.alicdn.com/imgextra/i3/O1CN01LDNnNJ1kkGg9ZYS1F_!!6000000004721-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "维修申请单",
            gmtModified: "2020-08-19T20:01Z",
            iconName: "maintenance",
            processCode: "PROC-79C3632F-755D-4614-93C5-7783D70B806F",
            iconUrl:
                "https://img.alicdn.com/imgextra/i4/O1CN01RsBV4N1pL920AQejY_!!6000000005343-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "包材采买申请",
            gmtModified: "2021-08-31T17:58Z",
            iconName: "common",
            processCode: "PROC-0C51E33B-0DA2-4D84-86CA-892C21A9C0EB",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "软件费",
            gmtModified: "2023-11-28T16:45Z",
            iconName: "common",
            processCode: "PROC-EB0B687F-7D92-4865-97FF-287D1F4D1C61",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 2,
            flowTitle: "采购请假",
            gmtModified: "2024-01-10T09:19Z",
            iconName: "leave",
            processCode: "PROC-EA751A88-CD2B-4D99-9C08-E13320DEE804",
            iconUrl:
                "https://img.alicdn.com/imgextra/i3/O1CN01KlxdBZ1RwCITwWURk_!!6000000002175-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 2,
            flowTitle: "财务请假",
            gmtModified: "2023-11-21T09:27Z",
            iconName: "leave",
            processCode: "PROC-E4EC5FAD-7412-441B-A64B-4B0F2692D247",
            iconUrl:
                "https://img.alicdn.com/imgextra/i3/O1CN01KlxdBZ1RwCITwWURk_!!6000000002175-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 2,
            flowTitle: "部门负责人请假流程",
            gmtModified: "2023-11-21T09:45Z",
            iconName: "leave",
            processCode: "PROC-E181AA5A-B3CA-4BF8-A4A7-D19C19677AF7",
            iconUrl:
                "https://img.alicdn.com/imgextra/i3/O1CN01KlxdBZ1RwCITwWURk_!!6000000002175-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "运营代发流程",
            gmtModified: "2023-05-29T09:16Z",
            iconName: "common",
            processCode: "PROC-C0CED0C5-1C83-4571-9925-2D404632F847",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "盘点差异调整",
            gmtModified: "2023-12-23T14:39Z",
            iconName: "common",
            processCode: "PROC-810C228F-8FD8-4B80-BAE2-27CD40C0FF36",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "异常订单处理",
            gmtModified: "2022-05-17T16:33Z",
            iconName: "common",
            processCode: "PROC-1B04C1B8-6783-46EA-8FAE-9DFBD69E93B6",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "破损处理流程",
            gmtModified: "2022-08-24T10:37Z",
            iconName: "common",
            processCode: "PROC-19AAF7F9-88B0-41DB-9AB0-C7A5F52757FB",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "残次仓处理",
            gmtModified: "2021-08-30T18:41Z",
            iconName: "common",
            processCode: "PROC-CCD118AD-B9F7-4018-8631-EB75AF3F8FC2",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "1688刷坑产单",
            gmtModified: "2022-06-06T18:21Z",
            iconName: "common",
            processCode: "PROC-9516F4EF-87AD-457B-A017-351245865794",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "残品组合转正品流程",
            gmtModified: "2022-09-23T11:18Z",
            iconName: "common",
            processCode: "PROC-A6699374-5461-4D15-8555-06301E69CCA8",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "管理人员质检",
            gmtModified: "2024-02-07T12:51Z",
            iconName: "common",
            processCode: "PROC-E5F32BEB-D973-4ACD-8682-D52551BD876B",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "库房拆单流程",
            gmtModified: "2021-10-14T12:40Z",
            iconName: "common",
            processCode: "PROC-83D2AE8A-F02D-4A42-BB56-9A6223F68458",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "正品拆配件后转残次仓流程",
            gmtModified: "2021-11-22T14:14Z",
            iconName: "common",
            processCode: "PROC-EA366DE0-9D49-49EC-85FF-CCE4457FDB12",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "京东入仓流程申请",
            gmtModified: "2023-03-18T15:30Z",
            iconName: "common",
            processCode: "PROC-0B02669A-8E76-4B86-B816-2268926C84C4",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "工厂退残流程",
            gmtModified: "2022-10-31T14:05Z",
            iconName: "common",
            processCode: "PROC-1AEBFA95-4192-4C00-9705-AA3B9D8380F6",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "补发配件需求",
            gmtModified: "2022-04-06T16:09Z",
            iconName: "common",
            processCode: "PROC-1469B71E-B16A-41F3-9FF6-FF3C0EFA4086",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "增、减员申请",
            gmtModified: "2022-05-06T17:10Z",
            iconName: "fly",
            processCode: "PROC-C6723CE8-F9A5-4349-8B6C-A8CE1CC0E760",
            iconUrl:
                "https://img.alicdn.com/imgextra/i3/O1CN01LerNcO1ZzsP53zuLJ_!!6000000003266-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "转正（新）",
            gmtModified: "2023-12-27T14:10Z",
            iconName: "positive",
            processCode: "PROC-2CAF9D6E-700E-4FC9-9E16-4262E652C1E6",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01jEGQPU22UqQVqiC9f_!!6000000007124-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 2,
            flowTitle: "人事请假",
            gmtModified: "2023-12-27T14:09Z",
            iconName: "leave",
            processCode: "PROC-FDC43338-F7F3-47D2-BD01-D1057CAF86EC",
            iconUrl:
                "https://img.alicdn.com/imgextra/i3/O1CN01KlxdBZ1RwCITwWURk_!!6000000002175-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "快递、云仓付款申请",
            gmtModified: "2023-12-20T09:05Z",
            iconName: "procurement",
            processCode: "PROC-A2703227-6F6B-4C1E-A590-7AA563A390B8",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01AYTIyi1tsMDVcgNSq_!!6000000005957-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "盖章申请",
            gmtModified: "2022-09-13T09:25Z",
            iconName: "inchapter#orange",
            processCode: "PROC-99D79371-3043-4608-AA6C-1F0DF24BA3E6",
            iconUrl:
                "https://img.alicdn.com/imgextra/i3/O1CN01Lxcogf1ExwnvlqTg1_!!6000000000419-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "残次品结账",
            gmtModified: "2023-12-07T10:41Z",
            iconName: "common",
            processCode: "PROC-DCD2581C-7C3E-4CA9-BF60-980262EB379A",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "市场询价",
            gmtModified: "2024-01-12T14:32Z",
            iconName: "common",
            processCode: "PROC-C4292E7D-09BE-4FC2-BE01-CD8FA3DF08FC",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "拼多多采购选品会流程",
            gmtModified: "2022-10-05T09:46Z",
            iconName: "common",
            processCode: "PROC-0F6524F3-ED80-4616-9879-94CDC7CCBAA9",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "供应商问题沟通表",
            gmtModified: "2023-10-21T15:42Z",
            iconName: "common",
            processCode: "PROC-C723E332-2343-47CC-BF29-A8E3CE945699",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "库房产品报废流程",
            gmtModified: "2022-10-27T15:23Z",
            iconName: "common",
            processCode: "PROC-7BA75459-38D5-41D8-9716-7A6377DD93D1",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "智能合同审批",
            gmtModified: "2022-11-21T11:19Z",
            iconName: "contractNew#blue",
            processCode: "PROC-213F43C6-0126-48C1-A678-B83A7C45BC1B",
            iconUrl:
                "https://img.alicdn.com/imgextra/i4/O1CN01SlypYt1nmxrMUl70d_!!6000000005133-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "采购样品报销",
            gmtModified: "2023-11-01T13:00Z",
            iconName: "procurement",
            processCode: "PROC-D980947B-B94A-405F-9197-89EBC14DBCAA",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01AYTIyi1tsMDVcgNSq_!!6000000005957-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "各平台（或定制款）订货下单流程",
            gmtModified: "2023-12-13T16:26Z",
            iconName: "common",
            processCode: "PROC-23A07CC2-80E7-4376-8EDC-6C81F79DFBB8",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "供应商月对账单审批流程",
            gmtModified: "2023-08-08T09:18Z",
            iconName: "common",
            processCode: "PROC-5342D3F0-F29C-4638-A47D-4AA83DD2F1B1",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "南京仓日常费用报销",
            gmtModified: "2023-01-13T16:14Z",
            iconName: "common",
            processCode: "PROC-2F720D2F-EA8D-4532-90E8-9605F5268728",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "库房退款发货流程",
            gmtModified: "2023-02-10T18:10Z",
            iconName: "common",
            processCode: "PROC-51E2833F-A132-4F15-AE91-B0CFE76AE85F",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "网店管家采购单冲抵流程",
            gmtModified: "2023-12-09T09:42Z",
            iconName: "common",
            processCode: "PROC-974A5F3C-620E-424A-8744-2EF7B2B7AB51",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "日常报销",
            gmtModified: "2023-02-21T11:06Z",
            iconName: "behavior",
            processCode: "PROC-06FF2359-C030-4E4A-A850-C4DE8D30309A",
            iconUrl:
                "https://img.alicdn.com/imgextra/i1/O1CN01XQZ14h1Yv0ZtgabEj_!!6000000003120-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "差旅报销",
            gmtModified: "2023-02-21T11:06Z",
            iconName: "trip",
            processCode: "PROC-2550F230-0049-4069-9C69-4BD439514D22",
            iconUrl:
                "https://img.alicdn.com/imgextra/i3/O1CN011JkyFi29g1Ov9ZBPB_!!6000000008096-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "付款单",
            gmtModified: "2023-02-21T11:06Z",
            iconName: "biz#green",
            processCode: "PROC-D4FF2227-96E0-4412-A03D-660431A66618",
            iconUrl:
                "https://img.alicdn.com/imgextra/i1/O1CN01AvRkiO1QaNoev0iPa_!!6000000001992-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "收款单",
            gmtModified: "2023-02-21T11:06Z",
            iconName: "collection#green",
            processCode: "PROC-3434B3A0-E194-403E-8100-96A56DB7C1A1",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01nnvt1j21gSrHeYuQm_!!6000000007014-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "备用金",
            gmtModified: "2023-02-21T11:06Z",
            iconName: "commonRepo.js#green",
            processCode: "PROC-B681BBE0-5839-4C7B-BDA8-8E23339D4F6F",
            iconUrl:
                "https://img.alicdn.com/imgextra/i1/O1CN01N8qCer28EiATxILyj_!!6000000007901-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "备用金核销",
            gmtModified: "2023-02-21T11:06Z",
            iconName: "work_instructions#green",
            processCode: "PROC-9105CBC6-8897-4564-9842-6371A48574A3",
            iconUrl:
                "https://img.alicdn.com/imgextra/i3/O1CN01D5dZ1K1MbyjV0rt8d_!!6000000001454-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "备用金还款",
            gmtModified: "2023-02-21T11:06Z",
            iconName: "propaganda#green",
            processCode: "PROC-2E03E73F-D079-4352-9606-468877FDA466",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01rtAVs41ycqt5OaJvg_!!6000000006600-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "应收单",
            gmtModified: "2023-02-21T11:06Z",
            iconName: "datacurve#green",
            processCode: "PROC-A4D32F84-BCFF-4001-B7DA-E17EBC400943",
            iconUrl:
                "https://img.alicdn.com/imgextra/i1/O1CN01oiIgcQ1gC8heWQmDv_!!6000000004105-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "应收坏账",
            gmtModified: "2023-02-21T11:06Z",
            iconName: "leave#green",
            processCode: "PROC-17723A33-CA4D-4C08-BFB8-81B1F2650D0C",
            iconUrl:
                "https://img.alicdn.com/imgextra/i4/O1CN01Ridjdk28RzefcrHHC_!!6000000007930-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "应收回款",
            gmtModified: "2023-02-21T11:06Z",
            iconName: "exchange#green",
            processCode: "PROC-F7D81B22-5266-4EEE-A2A5-8B91F35B1885",
            iconUrl:
                "https://img.alicdn.com/imgextra/i1/O1CN01OvKAGK1LiYoDrXmKL_!!6000000001333-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "应付单",
            gmtModified: "2023-02-21T11:06Z",
            iconName: "biz#green",
            processCode: "PROC-BBC64A42-A166-446F-8589-55583C44905E",
            iconUrl:
                "https://img.alicdn.com/imgextra/i1/O1CN01AvRkiO1QaNoev0iPa_!!6000000001992-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "应付实付",
            gmtModified: "2023-02-21T11:06Z",
            iconName: "payment#green",
            processCode: "PROC-DEFE9F7F-7F04-443E-A922-4426C6D69B0E",
            iconUrl:
                "https://img.alicdn.com/imgextra/i1/O1CN01nx1AUI28X20h0C6SS_!!6000000007941-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "应付免付",
            gmtModified: "2023-02-21T11:06Z",
            iconName: "biz#green",
            processCode: "PROC-863DABA1-FA3C-447A-B775-C3C32D8AC7A9",
            iconUrl:
                "https://img.alicdn.com/imgextra/i1/O1CN01AvRkiO1QaNoev0iPa_!!6000000001992-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "转账申请",
            gmtModified: "2023-02-21T11:06Z",
            iconName: "exchange#green",
            processCode: "PROC-7B4BF801-1681-4246-BD7D-4B9B8B46D47E",
            iconUrl:
                "https://img.alicdn.com/imgextra/i1/O1CN01OvKAGK1LiYoDrXmKL_!!6000000001333-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "产品采购问题决策沟通申请",
            gmtModified: "2024-01-19T09:41Z",
            iconName: "common",
            processCode: "PROC-29F902A0-928D-4FA9-A1D6-79B5F146C31D",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "运营新人入职流程",
            gmtModified: "2023-06-08T10:44Z",
            iconName: "common",
            processCode: "PROC-D26F9764-B9DB-486B-AF91-026E5626B93C",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "各物流月拦截情况汇总表",
            gmtModified: "2023-02-28T17:46Z",
            iconName: "common",
            processCode: "PROC-6F29CA06-F234-4418-A2B7-57C26ADCE0B9",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "采购费用报销",
            gmtModified: "2023-03-10T14:49Z",
            iconName: "common",
            processCode: "PROC-767008E6-5B13-4E4A-81B0-A0FF85B2E5B5",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "修改个人档案",
            gmtModified: "2023-04-28T13:55Z",
            iconName: "common",
            processCode: "PROC-BF05723E-5BEE-4F63-BB31-EC5D39DCC758",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "美编任务运营发布",
            gmtModified: "2023-06-10T09:02Z",
            iconName: "common",
            processCode: "PROC-DF174ADF-48AA-4AFE-A536-73AE34B81808",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "采购断货流程",
            gmtModified: "2023-10-12T08:34Z",
            iconName: "common",
            processCode: "PROC-116B1A49-399C-4FF4-9253-7860D03164A8",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "新品开发流程",
            gmtModified: "2023-06-10T09:27Z",
            iconName: "datacurve",
            processCode: "PROC-1A8ABA52-5977-479E-AD82-0D377DFF854B",
            iconUrl:
                "https://img.alicdn.com/imgextra/i4/O1CN01CzHOUC1mu0KX4Nx8J_!!6000000005013-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "摄影加美编任务运营发布",
            gmtModified: "2023-07-07T13:12Z",
            iconName: "common",
            processCode: "PROC-0C552879-F50B-403D-AA5E-DD03D1FC8066",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "运营拍摄视频流程",
            gmtModified: "2023-07-07T16:19Z",
            iconName: "common",
            processCode: "PROC-F1DD6C68-D331-448D-BFF7-F7580CDB353A",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 2,
            flowTitle: "运营、美工请假",
            gmtModified: "2024-02-22T09:31Z",
            iconName: "leave",
            processCode: "PROC-420A7B11-B6F2-4B6D-9A65-E011BC3EAAB8",
            iconUrl:
                "https://img.alicdn.com/imgextra/i3/O1CN01KlxdBZ1RwCITwWURk_!!6000000002175-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "质检",
            gmtModified: "2023-11-15T09:44Z",
            iconName: "common",
            processCode: "PROC-531B1592-A9CA-4C15-96D5-BAA5C0773C90",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "钉钉应用市场申请开通试用",
            gmtModified: "2023-12-14T09:25Z",
            iconName: "common",
            processCode: "PROC-875EF4E6-7000-49A8-92B8-294E195DB936",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 4,
            flowTitle: "加班申请",
            gmtModified: "2024-02-26T09:29Z",
            iconName: "timefades",
            processCode: "PROC-C37DC990-E2B8-490C-8CB5-929467335263",
            iconUrl:
                "https://img.alicdn.com/imgextra/i1/O1CN01iZVS5g1VMi4M2xN0C_!!6000000002639-2-tps-480-480.png",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "公开发布审批",
            gmtModified: "2023-12-30T15:34Z",
            iconName: "common",
            processCode: "PROC-AC74D1E7-90E7-487C-A286-C6BA346F95E3",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 5,
            flowTitle: "外出申请",
            gmtModified: "2024-01-29T17:26Z",
            iconName: "contract",
            processCode: "PROC-83F7E302-53CF-403D-89BD-4CE8B7A1CDB0",
            iconUrl:
                "https://img.alicdn.com/imgextra/i4/O1CN015QEpq61u8O4vtsSLX_!!6000000005992-0-tps-480-480.jpg",
        },
        {
            newProcess: false,
            attendanceType: 0,
            flowTitle: "排班审批",
            gmtModified: "2024-01-31T18:27Z",
            iconName: "common",
            processCode: "PROC-7078F5A2-6578-45D6-9D85-D4D4122FC42F",
            iconUrl:
                "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg",
        },
    ];
    let ws = wb.addWorksheet("Sheet 1");

    //横向展示
    oa_List.forEach((item, colIndex) => {
        ws.cell(1, colIndex + 1).string(item.flowTitle);
    });
    // 竖向展示
    // ws.cell(1, 1).string("flowTitle");

    // // 提取 flowTitle 并写入到每行
    // oa_List.forEach((item, rowIndex) => {
    //   ws.cell(rowIndex + 2, 1).string(item.flowTitle);
    // });
    wb.write("template/OA审批流模版1.xlsx");
    return res.send(biResponse.success([]));
};
// const datasss = require("./data.json");
// http://127.0.0.1:9999/user/flowpath/getprocessAuditing
// 获取所有流程设计模版数据
exports.getprocessAuditing = async (req, res) => {
    let {data} = req.body;
    data = formatData(JSON.parse(JSON.stringify(data)));
    await FlowFormReviewModel.addFlowFormReview(data);

    return res.send(biResponse.success());
}

// 格式化实例状态
const formatInstanceStatus = (instanceStatus) => {
    return instanceStatus === "RUNNING"
        ? "运行中"
        : instanceStatus === "TERMINATED"
            ? "已终止"
            : instanceStatus === "COMPLETED"
                ? "已完成"
                : "异常";
};
// 导出指定日期，指定表单的所有宜搭表单数据
exports.exportYiDaData = async (req, res) => {
    const {startTime, endTime, form_ids, file_name} = req.query;
    // 钉钉token
    const {access_token} = await getToken();
    const userid = "073105202321093148"; // 涛哥id
    const liucList = await getNewLiuChengListsAll();
    const formIdData = JSON.parse(form_ids);
    let startDate = new Date(formatDateTime(new Date(startTime), "YYYY-mm-dd"));
    let endDate = new Date(formatDateTime(new Date(endTime), "YYYY-mm-dd"));
    let wb = XLSX.utils.book_new();
    let promises = formIdData.map(async (formId) => {
        // 获取表单组件信息
        const componentData = await dd.getFormComponent(
            access_token,
            formId,
            userid
        );
        const processDataForFormId = liucList.filter(
            (process) =>
                process.formUuid === formId &&
                new Date(
                    formatDateTime(new Date(process.createTimeGMT), "YYYY-mm-dd")
                ) >= startDate &&
                new Date(
                    formatDateTime(new Date(process.createTimeGMT), "YYYY-mm-dd")
                ) <= endDate
        );
        // 获取数据列表表头
        let newData = processDataForFormId.map((item) => {
            let newItem = {...item}; // 复制 item 防止修改原始数据

            // 遍历 item.data 中的每个键
            Object.keys(newItem.data).forEach((key) => {
                // 在 id-标题 数据中寻找匹配的标签
                let matchLabel = componentData.result.find(
                    (label) => label.fieldId === key
                );
                // 如果找到匹配的标签，替换相应的键
                if (matchLabel) {
                    newItem.data[matchLabel.label.zh_CN] = JSON.stringify(
                        newItem.data[key]
                    );
                    delete newItem.data[key]; // 如果需要，删除旧的键
                }
            });

            return newItem;
        });
        const data = newData.map(
            ({
                 title,
                 createTimeGMT,
                 instanceStatus,
                 overallprocessflow,
                 data,
                 originator,
             }) => {
                let s_jindu = [];
                for (let s_item of overallprocessflow) {
                    const jt =
                        s_item.action === "拒绝" ? `---------(${s_item.remark})` : "";
                    s_jindu.push(
                        `${s_item.operatorName}(${s_item.showName || s_item.action})${jt}`
                    );
                }
                return {
                    流程名称: title,
                    流程发起时间: createTimeGMT,
                    流程发起人: originator.name.nameInChinese,
                    流程状态: formatInstanceStatus(instanceStatus),
                    ...data,
                    流程审核流: JSON.stringify(s_jindu),
                };
            }
        );
        let ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, formId.slice(0, 10));
    });
    Promise.all(promises).then(() => {
        XLSX.writeFile(
            wb,
            path.join(
                __dirname,
                "../file",
                `${startTime}----${endTime}${file_name ?? "指定流程数据"}.xlsx`
            )
        );
    });
    let fileName = `${startTime}----${endTime}${
        file_name ?? "指定流程数据"
    }.xlsx`;
    let fileUrl = `${req.protocol}://${req.get("host")}/download/${fileName}`;
    return res.send(biResponse.success({
        fileUrl: fileUrl,
        fileName: fileName,
    }));
};