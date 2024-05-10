const {opCodes} = require("../operatorConst")
const tmActionStatus = {TODO: "TODO", DOING: "DOING", DONE: "DONE"}

const tmCoreActionsConfig = [
    {
        actionName: "爆款方案",
        actionCode: "hotSchema",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: tmActionStatus.TODO,
                children: [],
                rules: [
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclkvznwuu1",
                                    name: "提交竞店ID",
                                    status: ["TODO", "HISTORY"]
                                },
                                to: {
                                    id: "node_oclix34wly1",
                                    name: "审核执行统计五维表",
                                    status: ["TODO", "FORCAST"]
                                },
                                overdue: {
                                    id: "node_oclix34wly1",
                                    name: "审核执行统计五维表",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_lii5gvq3"
                                }
                            }]
                    },
                    {
                        formName: "宝可梦新品开发流程",
                        formId: "FORM-CC0B476071F24581B129A24835910B81AK56",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvkcjxy41",
                                    name: "分配执行营销分析方案",
                                    status: ["TODO", "HISTORY"]
                                },
                                to: {
                                    id: "node_oclvkcjxy42",
                                    name: "执行提交市场分析方案",
                                    status: ["TODO", "FORCAST"]
                                },
                                overdue: {
                                    id: "node_oclvkcjxy41",
                                    name: "分配执行营销分析方案",
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
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ockpz6phx72",
                                    name: "发起",
                                    status: ["TODO", "HISTORY"]
                                },
                                to: {
                                    id: "node_oclm91902f2",
                                    name: "审核执行动作完成",
                                    status: ["TODO", 'FORCAST']
                                },
                                overdue: {
                                    id: "node_oclm91902f2",
                                    name: "审核执行动作完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "发起",
                                    id: "node_ockpz6phx72"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "在做",
                nameEN: tmActionStatus.DOING,
                rules: [
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowNodeRules: [{
                            from: {
                                id: "node_oclii6vcap1",
                                name: "五维表分析",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclii6vcap1",
                                name: "五维表分析",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclii6vcap1",
                                name: "五维表分析",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "运营负责人",
                                id: "employeeField_lii5gvq3"
                            }
                        }
                        ]
                    },
                    {
                        formName: "宝可梦新品开发流程",
                        formId: "FORM-CC0B476071F24581B129A24835910B81AK56",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclv1zonogt",
                                    name: "运营提交营销方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclv1zonogt",
                                    name: "运营提交营销方案",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclv1zonogt",
                                    name: "运营提交营销方案",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "分配运营做市场分析",
                                    id: "employeeField_luv1lfuq"
                                }
                            }
                        ]
                    },
                    {
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowNodeRules: [{
                            from: {
                                id: "node_oclo8dzm951",
                                name: "提交五维表方案",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclo8dzm951",
                                name: "提交五维表方案",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclo8dzm951",
                                name: "提交五维表方案",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "发起",
                                id: "node_ockpz6phx72"
                            }
                        }],
                    }
                ]
            },
            {
                nameCN: "已做",
                nameEN: tmActionStatus.DONE,
                rules: [
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowNodeRules: [{
                            from: {
                                id: "node_oclii6vcap1",
                                name: "五维表分析",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclii6vcap1",
                                name: "五维表分析",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclii6vcap1",
                                name: "五维表分析",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "运营负责人",
                                id: "employeeField_lii5gvq3"
                            }
                        }]
                    },
                    {
                        formName: "宝可梦新品开发流程",
                        formId: "FORM-CC0B476071F24581B129A24835910B81AK56",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclv1zonogt",
                                    name: "运营提交营销方案",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclv1zonogt",
                                    name: "运营提交营销方案",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclv1zonogt",
                                    name: "运营提交营销方案",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "分配运营做市场分析",
                                    id: "employeeField_luv1lfuq"
                                }
                            }
                        ]
                    },
                    {
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclo8dzm951",
                                    name: "提交五维表方案",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclo8dzm951",
                                    name: "提交五维表方案",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclo8dzm951",
                                    name: "提交五维表方案",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "发起",
                                    id: "node_ockpz6phx72"
                                }
                            }
                        ]
                    }
                ]
            },
        ]
    },
    {
        actionName: "市场分析",
        actionCode: "marketAnalysis",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: tmActionStatus.TODO,
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
                nameEN: tmActionStatus.DOING,
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
                nameEN: tmActionStatus.DONE,
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
    },
    {
        actionName: "优化方案",
        actionCode: "optimizeSchema",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: tmActionStatus.TODO,
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
                nameEN: tmActionStatus.DOING,
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
                nameEN: tmActionStatus.DONE,
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

const mbActionTypes = {
    WAIT_TO_SHOOT: "WAIT_TO_SHOOT", BE_SHOOTING: "BE_SHOOTING", SHOOT_DONE: "SHOOT_DONE",
    WAIT_TO_PS: "WAIT_TO_PS", ON_PS: "ON_PS", PS_DONE: "PS_DONE",
    WAIT_TO_CUT: "WAIT_TO_CUT", BE_CUTTING: "BE_CUTTING", CUT_DONE: "CUT_DONE"
}


const mbCoreActionsConfig = [
    {
        actionName: "套图",
        actionCode: "packedPicture",
        actionStatus: [
            {
                nameCN: "待拍摄影",
                nameEN: mbActionTypes.WAIT_TO_SHOOT,
                rules: [
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclrolllmq1",
                                    name: "执行准备道具",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclrolllmq1",
                                    name: "执行准备道具",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclrolllmq1",
                                    name: "执行准备道具",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行准备道具",
                                    id: "node_oclrolllmq1"
                                }
                            }, {
                                from: {
                                    id: "node_ocliimu2ur1",
                                    name: "摄影确认道具",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocliimu2ur1",
                                    name: "摄影确认道具",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocliimu2ur1",
                                    name: "摄影确认道具",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "摄影确认道具",
                                    id: "node_ocliimu2ur1"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {fieldId: "radioField_ltjt0ykc", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclii6vcap5",
                                    name: "样品与道具确认",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclii6vcap5",
                                    name: "样品与道具确认",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclii6vcap5",
                                    name: "样品与道具确认",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "样品与道具确认",
                                    id: "node_oclii6vcap5"
                                }
                            }]
                    },
                    {
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7ht3fd", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ocln14cs9r2",
                                    name: "样品与道具准备",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocln14cs9r2",
                                    name: "样品与道具准备",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocln14cs9r2",
                                    name: "样品与道具准备",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "样品与道具准备",
                                    id: "node_ocln14cs9r2"
                                }
                            }, {
                                from: {
                                    id: "node_oclofn02iu1",
                                    name: "审核视觉方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclofn02iu1",
                                    name: "审核视觉方案",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclofn02iu1",
                                    name: "审核视觉方案",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核视觉方案",
                                    id: "node_oclofn02iu1"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "摄影进行中",
                nameEN: mbActionTypes.BE_SHOOTING,
                rules: [
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclrolllmq2",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclrolllmq2",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclrolllmq2",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "拍摄完成",
                                    id: "node_oclrolllmq2"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {fieldId: "radioField_ltjt0ykc", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclii6vcap6",
                                    name: "摄影确认样品与道具",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclii6vcap6",
                                    name: "摄影确认样品与道具",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclii6vcap6",
                                    name: "摄影确认样品与道具",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "摄影确认样品与道具",
                                    id: "node_oclii6vcap6"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclii6vcap7",
                                    name: "摄影拍照",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclii6vcap7",
                                    name: "摄影拍照",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclii6vcap7",
                                    name: "摄影拍照",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "摄影拍照",
                                    id: "node_oclii6vcap7"
                                }
                            }
                        ]
                    },
                    {
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7ht3fd", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclm91ca7l4",
                                    name: "确认样品道具",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclm91ca7l4",
                                    name: "确认样品道具",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclm91ca7l4",
                                    name: "确认样品道具",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认样品道具",
                                    id: "node_oclm91ca7l4"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclm91ca7l5",
                                    name: "摄影完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclm91ca7l5",
                                    name: "摄影完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclm91ca7l5",
                                    name: "摄影完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "摄影完成",
                                    id: "node_oclm91ca7l5"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "摄影完成",
                nameEN: mbActionTypes.SHOOT_DONE,
                rules: [
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            to: {

                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclrolllmq2"
                            }
                        }]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {fieldId: "radioField_ltjt0ykc", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclii6vcap7",
                                name: "摄影拍照",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclii6vcap7",
                                name: "摄影拍照",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclii6vcap7",
                                name: "摄影拍照",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "摄影拍照",
                                id: "node_oclii6vcap7"
                            }
                        }]
                    },
                    {
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7ht3fd", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclm91ca7l5",
                                name: "摄影完成",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclm91ca7l5",
                                name: "摄影完成",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclm91ca7l5",
                                name: "摄影完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "摄影完成",
                                id: "node_oclm91ca7l5"
                            }
                        }]
                    },
                ]
            },
            {
                nameCN: "待入美编",
                nameEN: mbActionTypes.WAIT_TO_PS,
                rules: [
                    {
                        formName: "美编任务运营发布",
                        formId: "FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS",
                        flowDetailsRules: [
                            {fieldId: "selectField_liikmvi4", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclvgenwmp6",
                                name: "确认美编任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvgenwmp6",
                                name: "确认美编任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvgenwmp6",
                                name: "确认美编任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "执行人",
                                id: "node_oclvgenwmp6"
                            }
                        }]
                    },
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclrj9wzny1",
                                name: "分配美编制作",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclrj9wzny1",
                                name: "分配美编制作",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclrj9wzny1",
                                name: "分配美编制作",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配美编制作",
                                id: "node_oclrj9wzny1"
                            }
                        }]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {fieldId: "radioField_ltjt0ykc", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclii6vcap8",
                                name: "分配美编制作",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclii6vcap8",
                                name: "分配美编制作",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclii6vcap8",
                                name: "分配美编制作",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配美编制作",
                                id: "node_oclii6vcap8"
                            }
                        }]
                    },
                    {
                        formName: " 天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7ht3fd", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclm91ca7l6",
                                name: "确认摄影拍摄数据量和分配美编制作",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclm91ca7l6",
                                name: "确认摄影拍摄数据量和分配美编制作",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclm91ca7l6",
                                name: "确认摄影拍摄数据量和分配美编制作",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "确认摄影拍摄数据量和分配美编制作",
                                id: "node_oclm91ca7l6"
                            }
                        },
                            {
                                from: {
                                    id: "node_oclv68umqp1",
                                    name: "确认美编任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclv68umqp1",
                                    name: "确认美编任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclv68umqp1",
                                    name: "确认美编任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认美编任务",
                                    id: "node_oclv68umqp1"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "美编进行中",
                nameEN: mbActionTypes.ON_PS,
                rules: [
                    {
                        formName: "美编任务运营发布",
                        formId: "FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS",
                        flowDetailsRules: [
                            {fieldId: "selectField_liikmvi4", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclvgenwmp4",
                                name: "精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvgenwmp4",
                                name: "精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvgenwmp4",
                                name: "精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "精修美编完成任务",
                                id: "node_oclvgenwmp4"
                            }
                        }, {
                            from: {
                                id: "node_oclvgenwmp5",
                                name: "简单美编任务完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvgenwmp5",
                                name: "简单美编任务完成",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvgenwmp5",
                                name: "简单美编任务完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编任务完成",
                                id: "node_oclvgenwmp5"
                            }
                        }, {
                            from: {
                                id: "node_oclvgffo392",
                                name: "精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvgffo392",
                                name: "精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvgffo392",
                                name: "精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "精修美编完成任务",
                                id: "node_oclvgffo392"
                            }
                        }, {
                            from: {
                                id: "node_oclvgffo393",
                                name: "简单美编任务完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvgffo393",
                                name: "简单美编任务完成",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvgffo393",
                                name: "简单美编任务完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编任务完成",
                                id: "node_oclvgffo393"
                            }
                        }, {
                            from: {
                                id: "node_oclvgffo395",
                                name: " 精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvgffo395",
                                name: " 精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvgffo395",
                                name: " 精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "精修美编完成任务",
                                id: "node_oclvgffo395"
                            }
                        }, {
                            from: {
                                id: "node_oclvgffo396",
                                name: " 简单美编任务完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvgffo396",
                                name: " 简单美编任务完成",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvgffo396",
                                name: " 简单美编任务完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编任务完成",
                                id: "node_oclvgffo396"
                            }
                        }, {
                            from: {
                                id: "node_oclvt49cil2",
                                name: "精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvt49cil2",
                                name: "精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvt49cil2",
                                name: "精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "精修美编完成任务",
                                id: "node_oclvt49cil2"
                            }
                        }, {
                            from: {
                                id: "node_oclvt49cil3",
                                name: "简单美编任务完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvt49cil3",
                                name: "简单美编任务完成",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvt49cil3",
                                name: "简单美编任务完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编任务完成",
                                id: "node_oclvt49cil3"
                            }
                        }
                        ]
                    },
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclvkq3wa11",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkq3wa11",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkq3wa11",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvkq3wa11"
                            }
                        }, {
                            from: {
                                id: "node_oclvkq3wa12",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkq3wa12",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkq3wa12",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvkq3wa12"
                            }
                        }, {
                            from: {
                                id: "node_oclrj9wznyh",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclrj9wznyh",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclrj9wznyh",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclrj9wznyh"
                            }
                        }, {
                            from: {
                                id: "node_oclrj9wznyi",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclrj9wznyi",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclrj9wznyi",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclrj9wznyi"
                            }
                        }, {
                            from: {
                                id: "node_oclrj9wzny7",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclrj9wzny7",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclrj9wzny7",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclrj9wzny7"
                            }
                        }, {
                            from: {
                                id: "node_oclrj9wzny6",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclrj9wzny6",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclrj9wzny6",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclrj9wzny6"
                            }
                        }]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {fieldId: "radioField_ltjt0ykc", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvksud0d5",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvksud0d5",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvksud0d5",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvksud0d5"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvksud0d6",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvksud0d6",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvksud0d6",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvksud0d6"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvksud0d8",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvksud0d8",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvksud0d8",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvksud0d8"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvksud0d9",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvksud0d9",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvksud0d9",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvksud0d9"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvksud0db",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvksud0db",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvksud0db",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvksud0db"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvksud0dc",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvksud0dc",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvksud0dc",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvksud0dc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclii89ejz1",
                                    name: "精修美编制作",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclii89ejz1",
                                    name: "精修美编制作",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclii89ejz1",
                                    name: "精修美编制作",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "精修美编制作",
                                    id: "node_oclii89ejz1"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclrkbghp22",
                                    name: "普通美编制作",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclrkbghp22",
                                    name: "普通美编制作",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclrkbghp22",
                                    name: "普通美编制作",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "普通美编制作",
                                    id: "node_oclrkbghp22"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclrkbghp23",
                                    name: "套版美编完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclrkbghp23",
                                    name: "套版美编完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclrkbghp23",
                                    name: "套版美编完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "套版美编完成",
                                    id: "node_oclrkbghp23"
                                }
                            }
                        ]
                    },
                    {
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7ht3fd", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclm91ca7l8",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclm91ca7l8",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclm91ca7l8",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclm91ca7l8"
                                }
                            }, {
                                from: {
                                    id: "node_oclrkczkhk1",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclrkczkhk1",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclrkczkhk1",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclrkczkhk1"
                                }
                            }, {
                                from: {
                                    id: "node_oclvxczr495",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxczr495",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxczr495",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvxczr495"
                                }
                            }, {
                                from: {
                                    id: "node_oclvxczr496",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxczr496",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxczr496",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvxczr496"
                                }
                            }, {
                                from: {
                                    id: "node_oclvxczr498",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxczr498",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxczr498",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvxczr498"
                                }
                            }, {
                                from: {
                                    id: "node_oclvxczr499",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxczr499",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxczr499",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvxczr499"
                                }
                            }, {
                                from: {
                                    id: "node_oclvxczr49d",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxczr49d",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxczr49d",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvxczr49d"
                                }
                            }, {
                                from: {
                                    id: "node_oclvxczr49e",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxczr49e",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxczr49e",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvxczr49e"
                                }
                            }, {
                                from: {
                                    id: "node_oclvxczr49g",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxczr49g",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxczr49g",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvxczr49g"
                                }
                            }, {
                                from: {
                                    id: "node_oclvxczr49h",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxczr49h",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxczr49h",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvxczr49h"
                                }
                            }, {
                                from: {
                                    id: "node_oclvxczr49j",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxczr49j",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxczr49j",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvxczr49j"
                                }
                            }, {
                                from: {
                                    id: "node_oclvxczr49k",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxczr49k",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxczr49k",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvxczr49k"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "美编已完成",
                nameEN: mbActionTypes.PS_DONE,
                rules: [
                    {
                        formName: "美编任务运营发布",
                        formId: "FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS",
                        flowDetailsRules: [
                            {fieldId: "selectField_liikmvi4", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclvgenwmp5",
                                name: "简单美编任务完成",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvgenwmp5",
                                name: "简单美编任务完成",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvgenwmp5",
                                name: "简单美编任务完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编任务完成",
                                id: "node_oclvgenwmp5"
                            }
                        }, {
                            from: {
                                id: "node_oclvgffo393",
                                name: "简单美编任务完成",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvgffo393",
                                name: "简单美编任务完成",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvgffo393",
                                name: "简单美编任务完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编任务完成",
                                id: "node_oclvgffo393"
                            }
                        }, {
                            from: {
                                id: "node_oclvgffo396",
                                name: "简单美编任务完成",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvgffo396",
                                name: "简单美编任务完成",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvgffo396",
                                name: "简单美编任务完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编任务完成",
                                id: "node_oclvgffo396"
                            }
                        }, {
                            from: {
                                id: "node_oclvt49cil3",
                                name: "简单美编任务完成",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvt49cil3",
                                name: "简单美编任务完成",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvt49cil3",
                                name: "简单美编任务完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编任务完成",
                                id: "node_oclvt49cil3"
                            }
                        }]
                    },
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclvkq3wa12",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvkq3wa12",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvkq3wa12",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvkq3wa12"
                            }
                        }, {
                            from: {
                                id: "node_oclrj9wznyi",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclrj9wznyi",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclrj9wznyi",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclrj9wznyi"
                            }
                        }, {
                            from: {
                                id: "node_oclrj9wzny6",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclrj9wzny6",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclrj9wzny6",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclrj9wzny6"
                            }
                        },
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {fieldId: "radioField_ltjt0ykc", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvksud0d6",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvksud0d6",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvksud0d6",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvksud0d6"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvksud0d9",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvksud0d9",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvksud0d9",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvksud0d9"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvksud0dc",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvksud0dc",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvksud0dc",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvksud0dc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclii89ejz1",
                                    name: "精修美编制作",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclii89ejz1",
                                    name: "精修美编制作",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclii89ejz1",
                                    name: "精修美编制作",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "精修美编制作",
                                    id: "node_oclii89ejz1"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclrkbghp22",
                                    name: "普通美编制作",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclrkbghp22",
                                    name: "普通美编制作",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclrkbghp22",
                                    name: "普通美编制作",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "普通美编制作",
                                    id: "node_oclrkbghp22"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclrkbghp23",
                                    name: "套版美编完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclrkbghp23",
                                    name: "套版美编完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclrkbghp23",
                                    name: "套版美编完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "套版美编完成",
                                    id: "node_oclrkbghp23"
                                }
                            }
                        ]
                    },
                    {
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7ht3fd", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclrkczkhk1",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclrkczkhk1",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclrkczkhk1",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclrkczkhk1"
                            }
                        }, {
                            from: {
                                id: "node_oclvxczr496",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr496",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr496",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr496"
                            }
                        }, {
                            from: {
                                id: "node_oclvxczr499",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr499",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr499",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr499"
                            }
                        }, {
                            from: {
                                id: "node_oclvxczr49e",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr49e",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr49e",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr49e"
                            }
                        }, {
                            from: {
                                id: "node_oclvxczr49h",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr49h",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr49h",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr49h"
                            }
                        }, {
                            from: {
                                id: "node_oclvxczr49k",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr49k",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr49k",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr49k"
                            }
                        }
                        ]
                    }
                ]
            }
        ]
    },
    {
        actionName: "散图",
        actionCode: "fragmentedPicture",
        actionStatus: [
            {
                nameCN: "待拍摄影",
                nameEN: mbActionTypes.WAIT_TO_SHOOT,
                rules: [
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclrolllmq1",
                                    name: "执行准备道具",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclrolllmq1",
                                    name: "执行准备道具",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclrolllmq1",
                                    name: "执行准备道具",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行准备道具",
                                    id: "node_oclrolllmq1"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocliimu2ur1",
                                    name: "摄影确认道具",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocliimu2ur1",
                                    name: "摄影确认道具",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocliimu2ur1",
                                    name: "摄影确认道具",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "摄影确认道具",
                                    id: "node_ocliimu2ur1"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {fieldId: "radioField_ltjt0ykc", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclii6vcap5",
                                    name: "样品与道具确认",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclii6vcap5",
                                    name: "样品与道具确认",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclii6vcap5",
                                    name: "样品与道具确认",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "样品与道具确认",
                                    id: "node_oclii6vcap5"
                                }
                            }]
                    },
                    {
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7ht3fd", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ocln14cs9r2",
                                    name: "样品与道具准备",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocln14cs9r2",
                                    name: "样品与道具准备",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocln14cs9r2",
                                    name: "样品与道具准备",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "样品与道具准备",
                                    id: "node_ocln14cs9r2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclofn02iu1",
                                    name: "审核视觉方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclofn02iu1",
                                    name: "审核视觉方案",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclofn02iu1",
                                    name: "审核视觉方案",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核视觉方案",
                                    id: "node_oclofn02iu1"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "摄影进行中",
                nameEN: mbActionTypes.BE_SHOOTING,
                rules: [
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclrolllmq2",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclrolllmq2",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclrolllmq2",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "拍摄完成",
                                    id: "node_oclrolllmq2"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {fieldId: "radioField_ltjt0ykc", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclii6vcap6",
                                    name: "摄影确认样品与道具",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclii6vcap6",
                                    name: "摄影确认样品与道具",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclii6vcap6",
                                    name: "摄影确认样品与道具",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "摄影确认样品与道具",
                                    id: "node_oclii6vcap6"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclii6vcap7",
                                    name: "摄影拍照",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclii6vcap7",
                                    name: "摄影拍照",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclii6vcap7",
                                    name: "摄影拍照",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "摄影拍照",
                                    id: "node_oclii6vcap7"
                                }
                            }
                        ]
                    },
                    {
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7ht3fd", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclm91ca7l4",
                                    name: "确认样品道具",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclm91ca7l4",
                                    name: "确认样品道具",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclm91ca7l4",
                                    name: "确认样品道具",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认样品道具",
                                    id: "node_oclm91ca7l4"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclm91ca7l5",
                                    name: "摄影完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclm91ca7l5",
                                    name: "摄影完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclm91ca7l5",
                                    name: "摄影完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "摄影完成",
                                    id: "node_oclm91ca7l5"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "摄影完成",
                nameEN: mbActionTypes.SHOOT_DONE,
                rules: [
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclrolllmq2",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                to: {

                                    id: "node_oclrolllmq2",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclrolllmq2",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "拍摄完成",
                                    id: "node_oclrolllmq2"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {fieldId: "radioField_ltjt0ykc", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclii6vcap7",
                                name: "摄影拍照",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclii6vcap7",
                                name: "摄影拍照",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclii6vcap7",
                                name: "摄影拍照",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "摄影拍照",
                                id: "node_oclii6vcap7"
                            }
                        }]
                    },
                    {
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7ht3fd", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclm91ca7l5",
                                name: "摄影完成",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclm91ca7l5",
                                name: "摄影完成",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclm91ca7l5",
                                name: "摄影完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "摄影完成",
                                id: "node_oclm91ca7l5"
                            }
                        }]
                    },
                ]
            },
            {
                nameCN: "待入美编",
                nameEN: mbActionTypes.WAIT_TO_PS,
                rules: [
                    {
                        formName: "美编任务运营发布",
                        formId: "FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS",
                        flowDetailsRules: [
                            {fieldId: "selectField_liikmvi4", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclvgenwmp6",
                                name: "确认美编任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvgenwmp6",
                                name: "确认美编任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvgenwmp6",
                                name: "确认美编任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "执行人",
                                id: "node_oclvgenwmp6"
                            }
                        }]
                    },
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclrj9wzny1",
                                name: "分配美编制作",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclrj9wzny1",
                                name: "分配美编制作",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclrj9wzny1",
                                name: "分配美编制作",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配美编制作",
                                id: "node_oclrj9wzny1"
                            }
                        }]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {fieldId: "radioField_ltjt0ykc", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclii6vcap8",
                                name: "分配美编制作",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclii6vcap8",
                                name: "分配美编制作",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclii6vcap8",
                                name: "分配美编制作",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配美编制作",
                                id: "node_oclii6vcap8"
                            }
                        }]
                    },
                    {
                        formName: " 天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7ht3fd", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclm91ca7l6",
                                    name: "确认摄影拍摄数据量和分配美编制作",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclm91ca7l6",
                                    name: "确认摄影拍摄数据量和分配美编制作",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclm91ca7l6",
                                    name: "确认摄影拍摄数据量和分配美编制作",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认摄影拍摄数据量和分配美编制作",
                                    id: "node_oclm91ca7l6"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclv68umqp1",
                                    name: "确认美编任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclv68umqp1",
                                    name: "确认美编任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclv68umqp1",
                                    name: "确认美编任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认美编任务",
                                    id: "node_oclv68umqp1"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "美编进行中",
                nameEN: mbActionTypes.ON_PS,
                rules: [
                    {
                        formName: "美编任务运营发布",
                        formId: "FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS",
                        flowDetailsRules: [
                            {fieldId: "selectField_liikmvi4", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvgh4l0z8",
                                    name: "重点精修美编任务完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvgh4l0z8",
                                    name: "重点精修美编任务完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvgh4l0z8",
                                    name: "重点精修美编任务完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编任务完成",
                                    id: "node_oclvgh4l0z8"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvgh4l0z5",
                                    name: "重点精修美编任务完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvgh4l0z5",
                                    name: "重点精修美编任务完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvgh4l0z5",
                                    name: "重点精修美编任务完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编任务完成",
                                    id: "node_oclvgh4l0z5"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvgh4l0z2",
                                    name: "重点精修美编任务完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvgh4l0z2",
                                    name: "重点精修美编任务完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvgh4l0z2",
                                    name: "重点精修美编任务完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编任务完成",
                                    id: "node_oclvgh4l0z2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvgh4l0zb",
                                    name: "简单美编任务完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvgh4l0zb",
                                    name: "简单美编任务完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvgh4l0zb",
                                    name: "简单美编任务完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编任务完成",
                                    id: "node_oclvgh4l0zb"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvt4kpea1",
                                    name: " 精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvt4kpea1",
                                    name: " 精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvt4kpea1",
                                    name: " 精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "精修美编完成任务",
                                    id: "node_oclvt4kpea1"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvkqswtb2",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvkqswtb2",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvkqswtb2",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvkqswtb2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvkqswtb3",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvkqswtb3",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvkqswtb3",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvkqswtb3"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvkqswtb6",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvkqswtb6",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvkqswtb6",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvkqswtb6"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvkqswtb7",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvkqswtb7",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvkqswtb7",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvkqswtb7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvkqswtba",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvkqswtba",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvkqswtba",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvkqswtba"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvkqswtbb",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvkqswtbb",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvkqswtbb",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvkqswtbb"
                                }
                            }]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {fieldId: "radioField_ltjt0ykc", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvksud0d5",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvksud0d5",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvksud0d5",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvksud0d5"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvksud0d6",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvksud0d6",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvksud0d6",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvksud0d6"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvksud0d8",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvksud0d8",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvksud0d8",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvksud0d8"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvksud0d9",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvksud0d9",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvksud0d9",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvksud0d9"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvksud0db",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvksud0db",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvksud0db",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvksud0db"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvksud0dc",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvksud0dc",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvksud0dc",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvksud0dc"
                                }
                            }
                        ]
                    },
                    {
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7ht3fd", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclm91ca7l8",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclm91ca7l8",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclm91ca7l8",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclm91ca7l8"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclrkczkhk1",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclrkczkhk1",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclrkczkhk1",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclrkczkhk1"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvxczr495",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxczr495",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxczr495",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvxczr495"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvxczr496",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxczr496",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxczr496",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvxczr496"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvxczr498",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxczr498",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxczr498",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvxczr498"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvxczr499",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxczr499",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxczr499",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvxczr499"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvxczr49d",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxczr49d",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxczr49d",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvxczr49d"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvxczr49e",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxczr49e",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxczr49e",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvxczr49e"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvxczr49g",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxczr49g",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxczr49g",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvxczr49g"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvxczr49h",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxczr49h",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxczr49h",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvxczr49h"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvxczr49j",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxczr49j",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxczr49j",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvxczr49j"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvxczr49k",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxczr49k",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxczr49k",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvxczr49k"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "美编已完成",
                nameEN: mbActionTypes.PS_DONE,
                rules: [
                    {
                        formName: "美编任务运营发布",
                        formId: "FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS",
                        flowDetailsRules: [
                            {fieldId: "selectField_liikmvi4", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvgenwmp5",
                                    name: "重点精修美编任务完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvgenwmp5",
                                    name: "重点精修美编任务完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvgenwmp5",
                                    name: "重点精修美编任务完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编任务完成",
                                    id: "node_oclvgenwmp5"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvgh4l0z8",
                                    name: "重点精修美编任务完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvgh4l0z8",
                                    name: "重点精修美编任务完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvgh4l0z8",
                                    name: "重点精修美编任务完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编任务完成",
                                    id: "node_oclvgh4l0z8"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvgh4l0z5",
                                    name: "重点精修美编任务完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvgh4l0z5",
                                    name: "重点精修美编任务完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvgh4l0z5",
                                    name: "重点精修美编任务完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编任务完成",
                                    id: "node_oclvgh4l0z5"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvgh4l0z2",
                                    name: "重点精修美编任务完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvgh4l0z2",
                                    name: "重点精修美编任务完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvgh4l0z2",
                                    name: "重点精修美编任务完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编任务完成",
                                    id: "node_oclvgh4l0z2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvgh4l0zb",
                                    name: "精修美编任务完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvgh4l0zb",
                                    name: "精修美编任务完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvgh4l0zb",
                                    name: "精修美编任务完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "精修美编任务完成",
                                    id: "node_oclvgh4l0zb"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvt4kpea1",
                                    name: "精修美编任务完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvt4kpea1",
                                    name: "精修美编任务完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvt4kpea1",
                                    name: "精修美编任务完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "精修美编任务完成",
                                    id: "node_oclvt4kpea1"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvkqswtb3",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvkqswtb3",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvkqswtb3",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvkqswtb3"
                                }
                            }, {
                                from: {
                                    id: "node_oclvkqswtb7",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvkqswtb7",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvkqswtb7",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvkqswtb7"
                                }
                            }, {
                                from: {
                                    id: "node_oclvkqswtbb",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvkqswtbb",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvkqswtbb",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvkqswtbb"
                                }
                            },
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {fieldId: "radioField_ltjt0ykc", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvksud0d6",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvksud0d6",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvksud0d6",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvksud0d6"
                                }
                            }, {
                                from: {
                                    id: "node_oclvksud0d9",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvksud0d9",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvksud0d9",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvksud0d9"
                                }
                            }, {
                                from: {
                                    id: "node_oclvksud0dc",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvksud0dc",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvksud0dc",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvksud0dc"
                                }
                            }
                        ]
                    },
                    {
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7ht3fd", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclrkczkhk1",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclrkczkhk1",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclrkczkhk1",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclrkczkhk1"
                                }
                            }, {
                                from: {
                                    id: "node_oclvxczr496",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvxczr496",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvxczr496",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvxczr496"
                                }
                            }, {
                                from: {
                                    id: "node_oclvxczr499",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvxczr499",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvxczr499",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvxczr499"
                                }
                            }, {
                                from: {
                                    id: "node_oclvxczr49e",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvxczr49e",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvxczr49e",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvxczr49e"
                                }
                            }, {
                                from: {
                                    id: "node_oclvxczr49h",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvxczr49h",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvxczr49h",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvxczr49h"
                                }
                            }, {
                                from: {
                                    id: "node_oclvxczr49k",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvxczr49k",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvxczr49k",
                                    name: "简单美编完成任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvxczr49k"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        actionName: "视频",
        actionCode: "video",
        actionStatus: [
            {
                nameCN: "待拍摄影",
                nameEN: mbActionTypes.WAIT_TO_SHOOT,
                rules: [
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "视频"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclrolllmq1",
                                    name: "执行准备道具",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclrolllmq1",
                                    name: "执行准备道具",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclrolllmq1",
                                    name: "执行准备道具",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行准备道具",
                                    id: "node_oclrolllmq1"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocliimu2ur1",
                                    name: "摄影确认道具",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocliimu2ur1",
                                    name: "摄影确认道具",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocliimu2ur1",
                                    name: "摄影确认道具",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "摄影确认道具",
                                    id: "node_ocliimu2ur1"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {fieldId: "radioField_ltjt0ykc", opCode: opCodes.Equal, value: "视频"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclii6vcap5",
                                    name: "样品与道具确认",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclii6vcap5",
                                    name: "样品与道具确认",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclii6vcap5",
                                    name: "样品与道具确认",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "样品与道具确认",
                                    id: "node_oclii6vcap5"
                                }
                            }]
                    }
                ]
            },
            {
                nameCN: "摄影进行中",
                nameEN: mbActionTypes.BE_SHOOTING,
                rules: [
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "视频"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclrolllmq2",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclrolllmq2",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclrolllmq2",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "拍摄完成",
                                    id: "node_oclrolllmq2"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {fieldId: "radioField_ltjt0ykc", opCode: opCodes.Equal, value: "视频"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclii6vcap6",
                                    name: "摄影确认样品与道具",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclii6vcap6",
                                    name: "摄影确认样品与道具",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclii6vcap6",
                                    name: "摄影确认样品与道具",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "摄影确认样品与道具",
                                    id: "node_oclii6vcap6"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclii6vcap7",
                                    name: "摄影拍照",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclii6vcap7",
                                    name: "摄影拍照",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclii6vcap7",
                                    name: "摄影拍照",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "摄影拍照",
                                    id: "node_oclii6vcap7"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "摄影完成",
                nameEN: mbActionTypes.SHOOT_DONE,
                rules: [
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "视频"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclrolllmq2",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                to: {

                                    id: "node_oclrolllmq2",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclrolllmq2",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "拍摄完成",
                                    id: "node_oclrolllmq2"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {fieldId: "radioField_ltjt0ykc", opCode: opCodes.Equal, value: "视频"}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclii6vcap7",
                                name: "摄影拍照",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclii6vcap7",
                                name: "摄影拍照",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclii6vcap7",
                                name: "摄影拍照",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "摄影拍照",
                                id: "node_oclii6vcap7"
                            }
                        }]
                    }
                ]
            },
            {
                nameCN: "待入剪辑",
                nameEN: mbActionTypes.WAIT_TO_CUT,
                rules: [
                    {
                        formName: "美编任务运营发布",
                        formId: "FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS",
                        flowDetailsRules: [
                            {fieldId: "selectField_liikmvi4", opCode: opCodes.Equal, value: "视频"}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclvgenwmp6",
                                name: "确认美编任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvgenwmp6",
                                name: "确认美编任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvgenwmp6",
                                name: "确认美编任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "执行人",
                                id: "node_oclvgenwmp6"
                            }
                        }]
                    },
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "视频"}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclrj9wzny1",
                                name: "分配美编制作",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclrj9wzny1",
                                name: "分配美编制作",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclrj9wzny1",
                                name: "分配美编制作",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配美编制作",
                                id: "node_oclrj9wzny1"
                            }
                        }]
                    }
                ]
            },
            {
                nameCN: "剪辑进行中",
                nameEN: mbActionTypes.BE_CUTTING,
                rules: [
                    {
                        formName: "美编任务运营发布",
                        formId: "FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS",
                        flowDetailsRules: [
                            {fieldId: "selectField_liikmvi4", opCode: opCodes.Equal, value: "视频"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvgh4l0zd",
                                    name: "视频剪辑任务完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvgh4l0zd",
                                    name: "视频剪辑任务完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvgh4l0zd",
                                    name: "视频剪辑任务完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "视频剪辑任务完成",
                                    id: "node_oclvgh4l0zd"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvvytk8v2",
                                    name: "视频剪辑任务完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvvytk8v2",
                                    name: "视频剪辑任务完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvvytk8v2",
                                    name: "视频剪辑任务完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "视频剪辑任务完成",
                                    id: "node_oclvvytk8v2"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "视频"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclrj9wznym",
                                    name: "视频剪辑完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclrj9wznym",
                                    name: "视频剪辑完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclrj9wznym",
                                    name: "视频剪辑完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "视频剪辑完成",
                                    id: "node_oclrj9wznym"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "剪辑已完成",
                nameEN: mbActionTypes.CUT_DONE,
                rules: [
                    {
                        formName: "美编任务运营发布",
                        formId: "FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS",
                        flowDetailsRules: [
                            {fieldId: "selectField_liikmvi4", opCode: opCodes.Equal, value: "视频"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvgh4l0zd",
                                    name: "视频剪辑任务完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvgh4l0zd",
                                    name: "视频剪辑任务完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvgh4l0zd",
                                    name: "视频剪辑任务完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "视频剪辑任务完成",
                                    id: "node_oclvgh4l0zd"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvvytk8v2",
                                    name: "视频剪辑任务完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvvytk8v2",
                                    name: "视频剪辑任务完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvvytk8v2",
                                    name: "视频剪辑任务完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "视频剪辑任务完成",
                                    id: "node_oclvvytk8v2"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "视频"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclrj9wznym",
                                    name: "视频剪辑完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclrj9wznym",
                                    name: "视频剪辑完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclrj9wznym",
                                    name: "视频剪辑完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "视频剪辑完成",
                                    id: "node_oclrj9wznym"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
]

module.exports = {
    tmCoreActionsConfig,
    mbCoreActionsConfig
}