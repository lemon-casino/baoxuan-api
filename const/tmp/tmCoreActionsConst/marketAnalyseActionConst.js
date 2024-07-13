const commonActionStatus = {TODO: "TODO", DOING: "DOING", DONE: "DONE"}

module.exports = [
    {
        actionName: "市场分析",
        actionCode: "marketAnalysis",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: commonActionStatus.TODO,
                rules: [
                    {
                        formName: "宝可梦新品开发流程",
                        formId: "FORM-CC0B476071F24581B129A24835910B81AK56",
                        flowNodeRules: [{
                            from: {
                                id: "node_oclv1xr53i4",
                                name: "分配执行市场分析方案",
                                status: ["TODO", "HISTORY"]
                            },
                            to: {
                                id: "node_oclvkc9r0a3",
                                name: "审核执行市场分析方案",
                                status: ["TODO", "FORCAST"]
                            },
                            overdue: {
                                id: "node_oclvkc9r0a3",
                                name: "审核执行市场分析方案",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "分配运营做市场分析",
                                id: "employeeField_luv1lfuq"
                            }
                        }]
                    },
                    {
                        formName: "采购任务运营发布",
                        formId: "FORM-0A966I819O8BZMVBE16JLAK96KK42KD1QEIILC",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ockpz6phx72",
                                    name: "发起",
                                    status: ["TODO", "HISTORY"]
                                },
                                to: {
                                    id: "node_oclvt63juf3",
                                    name: "执行提交市场统计",
                                    status: ["TODO", 'FORCAST']
                                },
                                overdue: {
                                    id: "node_oclvt63juf3",
                                    name: "执行提交市场统计",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "分配运营",
                                    id: "employeeField_lvesa8t3"
                                }
                            },
                            {
                                from: {
                                    id: "node_ockpz6phx72",
                                    name: "发起",
                                    status: ["TODO", "HISTORY"]
                                },
                                to: {
                                    id: "node_oclvesclp09",
                                    name: "运营提交市场分析",
                                    status: ["TODO", 'FORCAST']
                                },
                                overdue: {
                                    id: "node_oclvesclp09",
                                    name: "运营提交市场分析",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "发起人",
                                    id: "node_ockpz6phx72"
                                }
                            },
                            {
                                from: {
                                    id: "node_ockpz6phx72",
                                    name: "发起",
                                    status: ["TODO", "HISTORY"]
                                },
                                to: {
                                    id: "node_oclvesclp0d",
                                    name: "运营提交市场分析",
                                    status: ["TODO", 'FORCAST']
                                },
                                overdue: {
                                    id: "node_oclvesclp0d",
                                    name: "运营提交市场分析",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "发起人",
                                    id: "node_ockpz6phx72"
                                }
                            }
                        ]
                    },
                    // 仅天猫
                    {
                        formName: "采购选品会",
                        formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
                        flowNodeRules: [{
                            from: {
                                id: "node_oclklxv8kk1",
                                name: "运营负责人提交市场统计模板",
                                status: ["TODO", "HISTORY"]
                            },
                            to: {
                                id: "node_oclix0mfzn1",
                                name: "执行提交市场分析表",
                                status: ["TODO", "FORCAST"]
                            },
                            overdue: {
                                id: "node_oclklxv8kk1",
                                name: "运营负责人提交市场统计模板",
                                status: ["TODO", "HISTORY"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "运营负责人",
                                id: "employeeField_lii9qts2"
                            }
                        }]
                    }
                ]
            },
            {
                nameCN: "在做",
                nameEN: commonActionStatus.DOING,
                rules: [
                    {
                        formName: "宝可梦新品开发流程",
                        formId: "FORM-CC0B476071F24581B129A24835910B81AK56",
                        flowNodeRules: [{
                            from: {
                                id: "node_oclvkc9r0a4",
                                name: "完成市场分析方案",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkc9r0a4",
                                name: "完成市场分析方案",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkc9r0a4",
                                name: "完成市场分析方案",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "分配运营做市场分析",
                                id: "employeeField_luv1lfuq"
                            }
                        }]
                    },
                    {
                        formName: "采购任务运营发布",
                        formId: "FORM-0A966I819O8BZMVBE16JLAK96KK42KD1QEIILC",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvesclp04",
                                    name: "运营提交市场分析",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvesclp04",
                                    name: "运营提交市场分析",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvesclp04",
                                    name: "运营提交市场分析",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    id: "employeeField_lvesa8t3",
                                    name: "分配运营"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvesclp09",
                                    name: "运营提交市场分析",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvesclp09",
                                    name: "运营提交市场分析",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvesclp09",
                                    name: "运营提交市场分析",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    id: "employeeField_lvesa8t3",
                                    name: "分配运营"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvesclp0d",
                                    name: "运营提交市场分析",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvesclp0d",
                                    name: "运营提交市场分析",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvesclp0d",
                                    name: "运营提交市场分析",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    id: "employeeField_lvesa8t3",
                                    name: "分配运营"
                                }
                            }
                        ]
                    },
                    {
                        formName: "采购选品会",
                        formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
                        flowNodeRules: [{
                            from: {
                                id: "node_ocliieab3b1",
                                name: "运营提交市场分析方案",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_ocliieab3b1",
                                name: "运营提交市场分析方案",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_ocliieab3b1",
                                name: "运营提交市场分析方案",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "运营负责人",
                                id: "employeeField_lii9qts2"

                            }
                        }]
                    }
                ]
            },
            {
                nameCN: "已做",
                nameEN: commonActionStatus.DONE,
                rules: [{
                    formName: "宝可梦新品开发流程",
                    formId: "FORM-CC0B476071F24581B129A24835910B81AK56",
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclvkc9r0a4",
                                name: "完成市场分析方案",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvkc9r0a4",
                                name: "完成市场分析方案",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvkc9r0a4",
                                name: "完成市场分析方案",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "form",
                                id: "employeeField_luv1lfuq"
                            }
                        }
                    ]
                },
                    {
                        formName: "采购任务运营发布",
                        formId: "FORM-0A966I819O8BZMVBE16JLAK96KK42KD1QEIILC",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvesclp04",
                                    name: "运营提交市场分析",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvesclp04",
                                    name: "运营提交市场分析",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvesclp04",
                                    name: "运营提交市场分析",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    id: "employeeField_lvesa8t3",
                                    name: "分配运营"
                                }
                            }
                        ]
                    },
                    {
                        formName: "采购选品会",
                        formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ocliieab3b1",
                                    name: "运营提交市场分析方案",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_ocliieab3b1",
                                    name: "运营提交市场分析方案",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_ocliieab3b1",
                                    name: "运营提交市场分析方案",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_lii9qts2"
                                }
                            }
                        ]
                    }
                ]
            },
        ]
    }
]