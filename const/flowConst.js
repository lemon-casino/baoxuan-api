// 钉钉里流程设计页面的发起的id，在实际创建流程的时候会改变（两者都是固定的）
const activityIdMappingConst = {
    "node_ockpz6phx72": "sid-restartevent"
}

const flowStatusConst = {
    RUNNING: "RUNNING",
    ERROR: "ERROR",
    COMPLETE: "COMPLETE",
    TERMINATED: "TERMINATED"
}

const flowReviewTypeConst = {
    TODO: "TODO",
    HISTORY: "HISTORY",
    FORCAST: "FORCAST",
    TERMINATED: "TERMINATED",
    ERROR: "ERROR"
}

const operateTypeConst = {
    EXECUTE_TASK_AUTO: "EXECUTE_TASK_AUTO",
    AGENT_EXECUTE_TASK: "AGENT_EXECUTE_TASK",
    AGENT_REDIRECT_PROCESS: "AGENT_REDIRECT_PROCESS", // action： 重定向流程实例
    AGENT_REDIRECT_TASK: "AGENT_REDIRECT_TASK",// action： 转交
    EXECUTE_TASK_NORMAL: "EXECUTE_TASK_NORMAL", // action: 提交
    NEW_PROCESS: "NEW_PROCESS", // action: 提交申请
    REDIRECT_PROCESS: "REDIRECT_PROCESS",  // action: 重定向流程实例
    REDIRECT_TASK: "REDIRECT_TASK", // action: 转交
    TERMINATE_PROCESS: "", // action: 终止流程实例
}

const actionExitConst = {
    carbon: {name: "carbon", action: "抄送"},
    submit: {name: "submit", action: "提交申请"},
    doing: {name: "doing"},
    next: {name: "next"},
    agree: {name: "agree", action: "同意"},
    disagree: {name: "disagree", action: "拒绝"},
    restart: {name: "restart", action: "重定向流程实例"},
    recall: {name: "recall", action: "重定向流程实例"},
    redirect: {name: "redirect", action: "重定向流程实例"},
    revoked: {name: "revoked", action: "终止流程实例"},
    forward: {name: "forward", action: "转交"}
}

const taskTypeConst = {
    COMMON_ALL_AT_ONCE: "COMMON_ALL_AT_ONCE",
    COMMON_ONE_BY_ONE: "COMMON_ONE_BY_ONE"
}

module.exports = {
    flowStatusConst,
    flowReviewTypeConst,
    activityIdMappingConst,
    operateTypeConst,
    actionExitConst,
    taskTypeConst
}