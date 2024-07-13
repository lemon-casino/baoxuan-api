const commonActionStatus = {TODO: "TODO", DOING: "DOING", DONE: "DONE"}

module.exports = [
    {
        actionName: "优化方案",
        actionCode: "optimizeSchema",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: commonActionStatus.TODO,
                rules: [
                    {
                        formName: "天猫链接打仗审核流程",
                        formId: "FORM-495A1584CBE84928BB3B1E0D4AA4B56AYN1J",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ockpz6phx72",
                                    name: "发起",
                                    status: ["TODO", "HISTORY"]
                                },
                                to: {
                                    id: "node_oclqhp9c102",
                                    name: "执行BI系统打标签",
                                    status: ["TODO", "FORCAST"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "发起人",
                                    id: "node_ockpz6phx72"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "在做",
                nameEN: commonActionStatus.DOING,
                rules: [{
                    formName: "天猫链接打仗审核流程",
                    formId: "FORM-495A1584CBE84928BB3B1E0D4AA4B56AYN1J",
                    flowNodeRules: [{
                        from: {
                            id: "node_oclqhp9c103",
                            name: "提交优化方案",
                            status: ["TODO"]
                        },
                        to: {
                            id: "node_oclqhp9c103",
                            name: "提交优化方案",
                            status: ["TODO"]
                        },
                        overdue: {
                            id: "node_oclqhp9c103",
                            name: "提交优化方案",
                            status: ["TODO"]
                        },
                        ownerRule: {
                            from: "process",
                            name: "发起人",
                            id: "node_ockpz6phx72"
                        }
                    }]
                },
                    {
                        formName: "运营优化方案流程",
                        formId: "FORM-CP766081CPAB676X6KT35742KAC229LLKHIILB",
                        flowNodeRules: [{
                            from: {
                                id: "node_oclu3u9gmm1",
                                name: "制定优化方案",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclu3u9gmm1",
                                name: "制定优化方案",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclu3u9gmm1",
                                name: "制定优化方案",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "运营负责人",
                                id: "employeeField_liihs7l0"
                            }
                        }]
                    }
                ]
            },
            {
                nameCN: "已做",
                nameEN: commonActionStatus.DONE,
                rules: [{
                    formName: "天猫链接打仗审核流程",
                    formId: "FORM-495A1584CBE84928BB3B1E0D4AA4B56AYN1J",
                    flowNodeRules: [{
                        from: {
                            id: "node_oclqhp9c103",
                            name: "提交优化方案",
                            status: ["HISTORY"]
                        },
                        to: {
                            id: "node_oclqhp9c103",
                            name: "提交优化方案",
                            status: ["HISTORY"]
                        },
                        overdue: {
                            id: "node_oclqhp9c103",
                            name: "提交优化方案",
                            status: ["HISTORY"]
                        },
                        ownerRule: {
                            from: "process",
                            name: "发起人",
                            id: "node_ockpz6phx72"
                        }
                    }]
                },
                    {
                        formName: "运营优化方案流程",
                        formId: "FORM-CP766081CPAB676X6KT35742KAC229LLKHIILB",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclu3u9gmm1",
                                    name: "制定优化方案",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclu3u9gmm1",
                                    name: "制定优化方案",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclu3u9gmm1",
                                    name: "制定优化方案",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
]