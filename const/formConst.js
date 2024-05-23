const formImportance = {
    "important": "1",
    "unImportant": "2"
}

const formFlowNodeTypes = {
    CanvasEngine: {name: "CanvasEngine", desc: "根节点"},
    ApplyNode: {name: "ApplyNode", desc: "发起节点"},
    OperatorNode: {name: "OperatorNode", desc: "操作节点"},
    ApprovalNode: {name: "ApprovalNode", desc: "审批节点"},
    ConditionContainer: {name: "ConditionContainer", desc: "条件分支"}, //  type =="parallel"（并发） 没有type 是普通（非并发）
    ParallelNode: {name: "ParallelNode", desc: "并发分支节点"},
    ConditionNode: {name: "ConditionNode", desc: "普通分支节点"},
    CarbonNode: {name: "CarbonNode", desc: "抄送"},
    EndNode: {name: "EndNode", desc: "结束节点"}
}
const timingFormFlowNodes = ["CarbonNode", "OperatorNode", "ApprovalNode"]

module.exports = {
    timingFormFlowNodes,
    formFlowNodeTypes,
    formImportance
}