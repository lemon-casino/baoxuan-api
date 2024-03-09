const dd = require("../utils/dingding");
// 引入封装好的redis
const redis = require("../utils/redis.js");
// 引入流程表单模型
const FlowFormModel = require("../model/flowfrom");
// 引入流程数据模型
const ProcessModel = require("../model/process");
// 引入时间格式化方法
const {formatDateTime} = require("../utils/tools");
// ===============公共方法 start=====================
const com_userid = "073105202321093148"; // 涛哥id
// 延迟函数
const delay = (ms = 800) => new Promise((res) => setTimeout(res, ms));
// 获取redis钉钉token
const getToken = async () => {
    const reply = await redis.getKey("ddCorpToken");
    return JSON.parse(reply);
};
// 获取redis钉钉部门层级信息
const getDepList = async () => {
    const reply = await redis.getKey("dep_List");
    return JSON.parse(reply);
};
// 获取redis所有详情用户信息
const getuserDetailAll = async () => {
    const reply = await redis.getKey("userAllDetail");
    return JSON.parse(reply);
};
// 获取redis流程数据
const getNewLiuChengLists = async () => {
    const reply = await redis.getKey("newLiuChengList");
    return JSON.parse(reply);
};
// 根据流程id获取全部审批流程详情
const getAllProcessFlow = async (token, userId, formInstanceId) => {
    const {result} = await dd.getProcessRecord(token, userId, formInstanceId);
    return result;
};
// 分页获取表单所有的流程详情
const handelgetyd_LiuChengInfoByForm = async (
    time,
    status,
    token,
    userId,
    formUuid,
    pageNumber = 1,
    pageSize = 99
) => {
    const createFromTimeGMT = time[0];
    const createToTimeGMT = time[1];
    // 2.分页去请求所有流程id
    const resLiuChengList = await dd.getyd_LiuChengInfoSingle(
        createFromTimeGMT,
        createToTimeGMT,
        status,
        token,
        userId,
        formUuid,
        pageSize,
        pageNumber
    );
    let allData = resLiuChengList.data;
    let requestCount = 0;
    // 获取对应的流程的审核记录
    for (let i = 0; i < allData.length; i++) {
        await delay(30);
        allData[i]["overallprocessflow"] = await getAllProcessFlow(
            token,
            userId,
            allData[i].processInstanceId
        );
        requestCount += 1;
        console.log("requestCount=========>", formUuid, requestCount);
    }
    // 如果总数大于当前页数*每页数量，继续请求
    if (resLiuChengList.totalCount > pageNumber * pageSize) {
        console.log("pageNumber=========>", pageNumber, formUuid);
        const nextPageData = await handelgetyd_LiuChengInfoByForm(
            time,
            status,
            token,
            userId,
            formUuid,
            pageNumber + 1,
            pageSize
        );
        allData = allData.concat(nextPageData);
    }
    return allData;
};
// 获取宜搭流程表单数据方法
const getyd_LiuChengList = async (access_token, userid, status, time) => {
    console.time("timer2");
    // 1.获取所有宜搭表单数据
    const yd_form = await dd.getyd_FormList(access_token, userid);
    // 循环请求宜搭实例详情和审核详情数据
    let yd_shiliInfos = [];
    for (let i = 0; i < yd_form.result.data.length; i++) {
        const formUuid = yd_form.result.data[i].formUuid;
        await delay(30);
        const allData = await handelgetyd_LiuChengInfoByForm(
            time,
            status,
            access_token,
            userid,
            formUuid
        );
        yd_shiliInfos = yd_shiliInfos.concat(allData);
    }
    console.timeEnd("timer2");
    return yd_shiliInfos;
};
// 获取今天的开始和结束时间
const getTodayStartAndEnd = () => {
    const start = formatDateTime(new Date(), "YYYY-mm-dd 00:00:00");
    const end = formatDateTime(new Date(), "YYYY-mm-dd 23:59:00");
    //   const end = formatDateTime(new Date(), "YYYY-mm-dd 11:20:00");
    return {start, end};
};
// 获取昨天的开始和结束时间
const getzuotStartAndEnd = () => {
    const date = new Date();
    // 减去一天
    date.setDate(date.getDate() - 1);
    const year = date.getFullYear();
    // getMonth() 方法返回的月份是从0开始的，所以要加1
    const month = date.getMonth() + 1;
    const day = date.getDate();
    // 使用模板字符串来格式化日期，确保月份和日期为两位数
    const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;
    const start = formattedDate + " 00:00:00";
    const end = formattedDate + " 23:59:00";
    return {start, end};
};
// ===============公共方法 end=====================

// 1.获取钉钉_token
const getDingdingToken = async () => {
    console.log("开始获取token=========>");
    const ddToken = await dd.getddCorpToken();
    // 存入redis
    await redis.setKey("ddCorpToken", JSON.stringify(ddToken));
};
// 2.获取钉钉_指定状态的所有流程数据
const fetchDataAndSaveToRedis = async (status, time) => {
    console.log("开始获取获取钉钉_所有流程数据=========>");
    const {access_token} = await getToken();
    // 获取所有流程数据
    let yd_LiuChengList = await getyd_LiuChengList(
        access_token,
        com_userid,
        status,
        time
    );
    return yd_LiuChengList || [];
    // 存入redis
    //   await redis.setKey("newLiuChengList", JSON.stringify(yd_LiuChengList));
};
// 3.定时更新部门层级详情信息
const DepartmentInformation = async () => {
    console.log("开始获取更新部门层级详情信息=========>");
    // 获取钉钉Token
    const {access_token} = await getToken();
    const depList = await dd.getSubDeptAll(access_token);
    console.log("depList=========>", depList);
    // 获取一级部门下的子部门
    for (const item of depList.result) {
        await delay(50);
        // 获取子部门
        const dep_chil = await dd.getSubDeptAll(access_token, item.dept_id);
        item.dep_chil = dep_chil.result;
    }
    // 存入redis
    await redis.setKey("dep_List", JSON.stringify(depList.result));
};
// 4.获取钉钉_部门下的所有用户
const fetchUserList = async () => {
    console.log("开始获取钉钉_部门下的所有用户=========>");
    const {access_token} = await getToken();
    const getDepListAll = await getDepList();
    const diguiDep = async (depList) => {
        for (const item of depList) {
            await delay(100);
            item.dep_user = [];
            const res = await dd.getDeptUser_def(access_token, item.dept_id, 0, 100);
            for (let userid of res.result.list) {
                const info = (await getuserDetailAll()).filter(
                    (item) => item.userid === userid.userid
                );
                if (info.length > 0) {
                    userid.canyu_liu = info[0].canyu_liu;
                    userid.faqi_liu = info[0].faqi_liu;
                }
            }
            item.dep_user = res.result.list;
            if (item.dep_chil && item.dep_chil.length > 0) {
                await diguiDep(item.dep_chil);
            }
        }
    };
    await diguiDep(getDepListAll);
    console.log("getDepListAll=========>", getDepListAll.length);
    // 存入redis
    await redis.setKey("dep_userList", JSON.stringify(getDepListAll));
};
// fetchUserList()

// 5.获取钉钉_所有用户详情
const fetchUserDetail = async () => {
    console.time("定时更新所有用户详情时间=========>");
    // 获取token
    const {access_token} = await getToken();
    const [liuchengList, departmentList] = await Promise.all([
        getNewLiuChengLists(),
        getDepList(),
    ]);
    const allUsersFromDepartments = [];
    // 获取部门下的所有用户信息
    for (const item of departmentList) {
        await delay(50);
        const res = await dd.getDeptUserList(access_token, item.dept_id);
        allUsersFromDepartments.push(res.result.userid_list);
    }
    // 用户去重
    const uniqueUsers = new Set(allUsersFromDepartments.flat());
    const userDetails = [];
    // 根据用户id获取用户详情
    for (let userId of uniqueUsers) {
        await delay(50);

        const userDetail = await dd.getddUserInfo(access_token, userId);

        const depDetails = [];
        for (let dep of userDetail.result.leader_in_dept) {
            const dep_res = await dd.getDpInfo(access_token, dep.dept_id);
            dep.dep_detail = dep_res.result;
            // depDetails.push({ ...dep_res.result, ...dep });
        }
        // userDetail.result.leader_in_dept = depDetails;
        //  获取每个用户发起的流程数据
        userDetail.result.faqi_liu = liuchengList
            .filter((liu) => liu.originator.userId === userId)
            .map((item) => {
                return {
                    createTimeGMT: item.createTimeGMT,
                    processInstanceId: item.processInstanceId,
                    modifiedTimeGMT: item.modifiedTimeGMT,
                };
            });

        // 获取每个用户参与的流程数据
        userDetail.result.canyu_liu = liuchengList
            .filter((liu) =>
                liu.overallprocessflow
                    .slice(1)
                    .some((flow) => flow.operatorUserId === userId)
            )
            .map((item) => {
                return {
                    createTimeGMT: item.createTimeGMT,
                    processInstanceId: item.processInstanceId,
                    modifiedTimeGMT: item.modifiedTimeGMT,
                };
            }); // 将每个符合条件的对象映射为其 id
        userDetails.push(userDetail.result);
    }
    // 存入redis
    await redis.setKey("userAllDetail", JSON.stringify(userDetails));
    console.timeEnd("定时更新所有用户详情时间=========>");
};
// fetchUserDetail()
// 6.获取钉钉_流程表单列表
const getAllProcessFlows = async () => {
    console.log("开始获取钉钉_流程表单列表=========>");
    // 钉钉token
    const {access_token} = await getToken();
    // 1.获取所有宜搭表单数据
    const yd_form = await dd.getyd_FormList(access_token, com_userid);
    //循环插入/更新表单
    yd_form.result.data.forEach(async (item) => {
        await FlowFormModel.upsert({
            flow_form_id: item.formUuid,
            flow_form_name: item.title.zhCN,
        });
    });
    return yd_form;
};
// 7. 获取今天以前所有已完成,已终止，异常,流程数据  -----------每天晚上23：59开始执行
const getAllCompletedLiu = async () => {
    // 开始时间：昨天00:00:00
    // 结束时间：昨天23:59:00
    const {start, end} = getTodayStartAndEnd();
    let startTime = start;
    let endTime = end;
    const list = [];
    const type = ["COMPLETED", "TERMINATED", "ERROR"];
    for (let i of type) {
        const liuchengdata = await fetchDataAndSaveToRedis(i, [startTime, endTime]);
        list.push(...liuchengdata);
    }
    console.log(startTime, endTime + "新增流程数据=========>", list.length);
    //   await redis.setKey("sql_liuchengdata", JSON.stringify(list), 86400);
    await ProcessModel.addProcess(list);
    await redis.setKey(
        "sql_liuchengdata",
        JSON.stringify(await ProcessModel.getProcessList())
    );
};
// getAllCompletedLiu()
// 8. 获取今天以前所有运行中的流程数据            -----------每天晚上23：59开始执行
const getAllNoCompletedLiu_Old = async (starttime) => {
    const {start, end} = getTodayStartAndEnd();
    let startTime = "2001-01-01 00:00:00";
    let endTime = end;
    console.log ("====", end)
    const list = [];
    const type = ["RUNNING"];
    for (let i of type) {
        const liuchengdata = await fetchDataAndSaveToRedis(i, [startTime, endTime]);
        list.push(...liuchengdata);
    }
    // 存入redis
    await redis.setKey("AllNoCompletedLiu_Old", JSON.stringify(list));
};
// getAllNoCompletedLiu_Old()
// 9.获取今天所有的流程数据                     -----------每5分钟执行一次
const getAllLiu_New = async () => {
    const {start, end} = getTodayStartAndEnd();
    let startTime = start;
    let endTime = end;
    const list = [];
    const type = ["RUNNING", "TERMINATED", "COMPLETED", "ERROR"];
    for (let i of type) {
        const liuchengdata = await fetchDataAndSaveToRedis(i, [startTime, endTime]);
        list.push(...liuchengdata);
    }
    // 存入redis
    await redis.setKey("getTodayAllLiu_New", JSON.stringify(list));
    await handleAssemblydata();
};
// getAllLiu_New()
// 9. 组装昨天入库数据和 当天,历史缓存数据
const handleAssemblydata = async () => {
    console.time("查询所有流程数据");

    let list = [];
    // 获取所有已完成历史数据
    const r_liuchengdata = JSON.parse(await redis.getKey("sql_liuchengdata"));

    // 获取所有非已完成所有历史数据
    const h_old_liuchengdata = JSON.parse(
        await redis.getKey("AllNoCompletedLiu_Old")
    );

    // 获取今天所有流程数据
    const h_new_liuchengdata = JSON.parse(
        await redis.getKey("getTodayAllLiu_New")
    );

    // console.log('h_old_liuchengdata=========>', h_old_liuchengdata[0])
    // console.log('h_new_liuchengdata=========>', h_new_liuchengdata[0])
    list = [...r_liuchengdata, ...h_old_liuchengdata, ...h_new_liuchengdata];
    // const aaa = list.filter((item) => item.processInstanceId === '7c4a2938-6276-4884-a55d-08928ac89045')
    // console.log('aaa=========>', aaa)
    await redis.setKey("newLiuChengList", JSON.stringify(list));
    // 获取当天所有运行中的数据
    console.log('所有已完成历史数据长度=========>', r_liuchengdata.length)
    console.log('获取今天所有流程数据=========>', h_new_liuchengdata.length)
    console.log('获取所有非已完成所有历史数据=========>', h_old_liuchengdata.length)
    console.log("所有流程数据长度=========>", list.length);
    console.timeEnd("查询所有流程数据");
};
// handleAssemblydata()
// getAllNoCompletedLiu_Old()
module.exports = {
    getDingdingToken,
    fetchUserList,
    fetchUserDetail,
    getAllProcessFlows,
    DepartmentInformation,
    getAllCompletedLiu,
    getAllNoCompletedLiu_Old,
    getAllLiu_New,
    handleAssemblydata,
};
