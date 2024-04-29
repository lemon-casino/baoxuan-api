const tmCoreActions = [{
    actionName: "爆款方案",
    statuses: [
        {
            name: "待做",
            forms: [{
                formName: "运营新品流程",
                formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                startNodes: [{
                    id: "",
                    name: "提交竞店ID",
                    statuses: ["TODO", "HISTORY"]
                }],
                endNodes: [{
                    id: "node_oclii6vcap1",
                    name: "五维表分析",
                    statuses: ["TODO", "FORECAST"]
                }],
                overDueNode: {
                    id: "",
                    name: "审核执行统计五维表"
                },
                personInCharge: {
                    from: "process",
                    id: "node_oclimxk5wu1" // ？
                }
            },
                {
                    name: "宝可梦新品开发流程",
                    formId: "FORM-CC0B476071F24581B129A24835910B81AK56",
                    startNodes: [{
                        id: "node_oclvkcjxy41",
                        name: "分配执行营销分析方案",
                        statuses: ["TODO", "HISTORY"]
                    }],
                    // 分支情况
                    endNodes: [
                        {
                            id: "node_oclv1zonogt",
                            name: "运营提交营销方案",
                            statuses: ["TODO", "FORECAST"]
                        },
                        {
                            id: "node_oclv1zonogv",
                            name: "运营提交营销方案",
                            statuses: ["TODO", "FORECAST"]
                        },
                        {
                            id: "node_oclv1zonogw",
                            name: "运营提交营销方案",
                            statuses: ["TODO", "FORECAST"]
                        }],
                    overDueNode: {
                        id: "node_oclvkcjxy41",
                        name: "分配执行营销分析方案"
                    },
                    personInCharge: {
                        from: "form",
                        name: "分配运营做市场分析",
                        id: "employeeField_luv1lfuq"
                    }
                },
                {
                    name: "天猫链接上架流程",
                    formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                    startNodes: [{
                        id: "node_ockpz6phx72",
                        name: "发起",
                        statuses: ["TODO", "HISTORY"]
                    }],
                    endNodes: [{
                        id: "node_oclm91902f2",
                        name: "审核执行动作完成",
                        statuses: ["TODO", 'FORECAST']
                    }],
                    overDueNode: {
                        id: "node_oclm91902f2",
                        name: "审核执行动作完成"
                    },
                    personInCharge: {
                        from: "process",
                        name: "发起",
                        id: "node_ockpz6phx72"
                    }
                }]
        },
        {
            name: "在做",
            forms: [{
                formName: "",
                formId: "",
                id: "",
                startNode: {
                    id: "",
                    status: []
                },
                endNode: {
                    id: "",
                    statuses: []
                }
            }]
        },
        {
            name: "已做",
            forms: [{
                startNode: {
                    id: "",
                    status: []
                },
                endNode: {
                    id: "",
                    statuses: []
                }
            }]
        }
    ],

    status1: [
        {
            flowFormId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
            flowFormName: "运营新品流程",
            coreReviewItems: [{nodeId: "node_oclii6vcap1", title: "五维表分析"}]
        },
        {
            flowFormId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
            flowFormName: "天猫链接上架流程",
            coreReviewItems: [{nodeId: "node_oclo8dzm951", title: "提交五维表方案"}]
        },
        {
            flowFormId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP", flowFormName: "采购选品会",
            coreReviewItems: [{nodeId: "node_ocliieab3b1s", title: "运营提交市场分析方案"}]
        },
        {
            flowFormId: "FORM-495A1584CBE84928BB3B1E0D4AA4B56AYN1J", flowFormName: "天猫链接打仗审核流程",
            coreReviewItems: [
                {nodeId: "node_oclqhp9c103", title: "提交优化方案"}
            ]
        },
        {
            flowFormId: "FORM-CP766081CPAB676X6KT35742KAC229LLKHIILB", flowFormName: "运营优化方案",
            coreReviewItems: [{nodeId: "node_oclu3u9gmm1", title: "制定优化方案"}]
        },
        {
            flowFormId: "FORM-2529762FC54F44849153E5564C1628FAHFKN", flowFormName: "开发新品设计流程",
            coreReviewItems: [
                // todo: 还缺少好几个运营提交营销方案，等表单流程入库后补充
                {nodeId: "node_ocluv2dys83", title: "运营提交营销方案"},
                {nodeId: "node_ocluv3sh959", title: "运营提交营销方案"},
                // todo: 库中暂时没有等表单流程入库后补充
                // {nodeId: "", title: "运营提交营销方案"}
            ]
        },
    ]
}]

module.exports = {}