const startActivityId = "sid-restartevent"

// 钉钉里流程设计页面的发起的id，在实际创建流程的时候会改变（两者都是固定的）
const activityIdMappingConst = {
    "node_ockpz6phx72": "sid-restartevent"
}

const flowStatusConst = {
    RUNNING: "RUNNING",
    ERROR: "ERROR",
    COMPLETE: "COMPLETED",
    TERMINATED: "TERMINATED",
    // 自定义的状态
    OVERDUE: "OVERDUE"
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
    CARBON: {name: "carbon", action: "抄送"},
    SUBMIT: {name: "submit", action: "提交申请"},
    DOING: {name: "doing"},
    NEXT: {name: "next"},
    AGREE: {name: "agree", action: "同意"},
    DISAGREE: {name: "disagree", action: "拒绝"},
    RESTART: {name: "restart", action: "重定向流程实例"},
    RECALL: {name: "recall", action: "重定向流程实例"},
    REDIRECT: {name: "redirect", action: "重定向流程实例"},
    REVOKED: {name: "revoked", action: "终止流程实例"},
    FORWARD: {name: "forward", action: "转交"}
}

const meaninglessActionExitConst = [
    actionExitConst.RECALL,
    actionExitConst.REDIRECT,
    actionExitConst.RESTART,
    actionExitConst.FORWARD
]

const taskTypeConst = {
    COMMON_ALL_AT_ONCE: "COMMON_ALL_AT_ONCE",
    COMMON_ONE_BY_ONE: "COMMON_ONE_BY_ONE"
}

const oaApprovalStatus = {
    // 审批中
    RUNNING: "RUNNING",
    // 已撤销
    TERMINATED: "TERMINATED",
    // COMPLETED
    COMPLETED: "COMPLETED"
}

module.exports = {
    startActivityId,
    flowStatusConst,
    flowReviewTypeConst,
    activityIdMappingConst,
    operateTypeConst,
    actionExitConst,
    taskTypeConst,
    oaApprovalStatus,
    meaninglessActionExitConst
}