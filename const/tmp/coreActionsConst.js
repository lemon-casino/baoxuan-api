const {opCodes} = require("../operatorConst")
const commonActionStatus = {TODO: "TODO", DOING: "DOING", DONE: "DONE"}

const tmCoreActionsConfig = [
    {
        actionName: "爆款方案",
        actionCode: "hotSchema",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: commonActionStatus.TODO,
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
                nameEN: commonActionStatus.DOING,
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
                nameEN: commonActionStatus.DONE,
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
    },
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

const mbActionTypes = {
    WAIT_TO_SHOOT: "WAIT_TO_SHOOT", BE_SHOOTING: "BE_SHOOTING", SHOOT_DONE: "SHOOT_DONE",
    WAIT_TO_PS: "WAIT_TO_PS", ON_PS: "BE_PS", PS_DONE: "PS_DONE",
    WAIT_TO_CUT: "WAIT_TO_CUT", BE_CUTTING: "BE_CUTTING", CUT_DONE: "CUT_DONE"
}

const mbCoreActionsConfig = [
    {
        actionName: "全套",
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
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.EqualAny, value: ["全套", "套图"]},
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Contain, value: "套"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ocllqa26nn1",
                                    name: "审批视觉方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocllqa26nn1",
                                    name: "审批视觉方案",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocllqa26nn1",
                                    name: "审批视觉方案",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审批视觉方案",
                                    id: "node_ocllqa26nn1"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclrolj7io1",
                                    name: "分配执行助理",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclrolj7io1",
                                    name: "分配执行助理",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclrolj7io1",
                                    name: "分配执行助理",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkml6kp"
                                }
                            },
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
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkml6kp"
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
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkml6kp"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {
                                fieldId: "radioField_ltjt0ykc",
                                opCode: opCodes.EqualAny,
                                value: ["全套", "套图"]
                            }
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclkvznwuu1",
                                    name: "提交竞店ID",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclkvznwuu1",
                                    name: "提交竞店ID",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclkvznwuu1",
                                    name: "提交竞店ID",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclohx0w4s1",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclohx0w4s1",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclohx0w4s1",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclix0goa91",
                                    name: "统计五维表",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclix0goa91",
                                    name: "统计五维表",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclix0goa91",
                                    name: "统计五维表",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclix34wly1",
                                    name: "审核执行统计五给出样品明细",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclix34wly1",
                                    name: "审核执行统计五给出样品明细",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclix34wly1",
                                    name: "审核执行统计五给出样品明细",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclwketkev4",
                                    name: "执行确认样品来源",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclwketkev4",
                                    name: "执行确认样品来源",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclwketkev4",
                                    name: "执行确认样品来源",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclwketkev6",
                                    name: "执行联系样品到公司",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclwketkev6",
                                    name: "执行联系样品到公司",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclwketkev6",
                                    name: "执行联系样品到公司",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclwkf0tuy1",
                                    name: "开发联系样品",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclwkf0tuy1",
                                    name: "开发联系样品",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclwkf0tuy1",
                                    name: "开发联系样品",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
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
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclto83mms5",
                                    name: "组长审核方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclto83mms5",
                                    name: "组长审核方案",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclto83mms5",
                                    name: "组长审核方案",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvx64tg92",
                                    name: "组长审核方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvx64tg92",
                                    name: "组长审核方案",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvx64tg92",
                                    name: "组长审核方案",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclii6vcap2",
                                    name: "项目负责人审核方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclii6vcap2",
                                    name: "项目负责人审核方案",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclii6vcap2",
                                    name: "项目负责人审核方案",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltseng6r1",
                                    name: "执行运营确认样品到公司",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltseng6r1",
                                    name: "执行运营确认样品到公司",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocltseng6r1",
                                    name: "执行运营确认样品到公司",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclii6vcap3",
                                    name: "视觉方案审核",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclii6vcap3",
                                    name: "视觉方案审核",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclii6vcap3",
                                    name: "视觉方案审核",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "视觉方案审核",
                                    id: "node_oclii6vcap3"
                                }
                            },
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
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
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
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            }
                        ]
                    },
                    {
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_ltxy12s6", opCode: opCodes.EqualAny, value: ["全套图片", "外包拍摄"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclm91902f1",
                                    name: "安排执行统计五维表",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclm91902f1",
                                    name: "安排执行统计五维表",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclm91902f1",
                                    name: "安排执行统计五维表",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvktxsdb"
                                }
                            },
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
                    },
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx00ubuy7",
                                    name: "确认拍摄类型",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx00ubuy7",
                                    name: "确认拍摄类型",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuy7",
                                    name: "确认拍摄类型",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认拍摄类型",
                                    id: "node_oclx00ubuy7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx00ubuyc",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx00ubuyc",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuyc",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配执行",
                                    id: "node_oclx00ubuyc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx00ubuyd",
                                    name: "执行确认样品",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx00ubuyd",
                                    name: "执行确认样品",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuyd",
                                    name: "执行确认样品",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行确认样品",
                                    id: "node_oclx00ubuyd"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx00ubuye",
                                    name: "审核方案分配摄像/美编负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx00ubuye",
                                    name: "审核方案分配摄像/美编负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuye",
                                    name: "审核方案分配摄像/美编负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核方案分配摄像/美编负责人",
                                    id: "node_oclx00ubuye"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr071t",
                                    name: "分配外拍负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr071t",
                                    name: "分配外拍负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr071t",
                                    name: "分配外拍负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配外拍负责人",
                                    id: "node_oclx03jr071t"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr071u",
                                    name: "分配执行邮寄样品",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr071u",
                                    name: "分配执行邮寄样品",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr071u",
                                    name: "分配执行邮寄样品",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认拍摄类型",
                                    id: "node_oclx00ubuy7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr071v",
                                    name: "执行填写快递单号",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr071v",
                                    name: "执行填写快递单号",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr071v",
                                    name: "执行填写快递单号",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认拍摄类型",
                                    id: "node_oclx00ubuy7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr071w",
                                    name: "通知外包负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr071w",
                                    name: "通知外包负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr071w",
                                    name: "通知外包负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认拍摄类型",
                                    id: "node_oclx00ubuy7"
                                }
                            }
                        ]
                    },
                    {
                        formName: "外包拍摄视觉流程",
                        formId: "FORM-30500E23B9C44712A5EBBC5622D3D1C4TL18",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv670frf", opCode: opCodes.Contain, value: "套"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx48rz9a1",
                                    name: "运营填写样品信息-分配执行",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx48rz9a1",
                                    name: "运营填写样品信息-分配执行",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx48rz9a1",
                                    name: "运营填写样品信息-分配执行",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "外包摄影负责人",
                                    id: "textField_lvumnj2k"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx48rz9a1",
                                    name: "执行填写快递单号",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx49xlb31",
                                    name: "执行填写快递单号",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuyu",
                                    name: "执行填写快递单号",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "外包摄影责人",
                                    id: "textField_lvumnj2k"
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
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.EqualAny, value: ["全套", "套图"]},
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Contain, value: "套"}
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
                            {
                                fieldId: "radioField_ltjt0ykc",
                                opCode: opCodes.EqualAny,
                                value: ["全套", "套图"]
                            }
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
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.EqualAny, value: ["全套图片", "外包拍摄"]}
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
                    },
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx00ubuyu",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx00ubuyu",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuyu",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "拍摄完成",
                                    id: "node_oclx00ubuyu"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxcz6yq71",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxcz6yq71",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclxcz6yq71",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "拍摄完成",
                                    id: "node_oclxcz6yq71"
                                }
                            }
                        ]
                    },
                    {
                        formName: "外包拍摄视觉流程",
                        formId: "FORM-30500E23B9C44712A5EBBC5622D3D1C4TL18",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv670frf", opCode: opCodes.Contain, value: "套"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx49xlb31",
                                    name: "通知外拍摄影师等待收图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx49xlb31",
                                    name: "通知外拍摄影师等待收图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx49xlb31",
                                    name: "通知外拍摄影师等待收图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "外包美编负责人",
                                    id: "textField_lvumnj2k"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx49xlb32",
                                    name: "外拍审核",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx49xlb32",
                                    name: "外拍审核",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx49xlb32",
                                    name: "外拍审核",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "外拍审核",
                                    id: "node_oclx49xlb32"
                                }
                            },
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
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.EqualAny, value: ["全套", "套图"]},
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Contain, value: "套"}
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
                            {
                                fieldId: "radioField_ltjt0ykc",
                                opCode: opCodes.EqualAny,
                                value: ["全套", "套图"]
                            }
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
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.EqualAny, value: ["全套图片", "外包拍摄"]}
                        ],
                        flowNodeRules: [
                            {
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
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx00ubuyu",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclx00ubuyu",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuyu",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "拍摄完成",
                                    id: "node_oclx00ubuyu"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxcz6yq71",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclxcz6yq71",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclxcz6yq71",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "拍摄完成",
                                    id: "node_oclxcz6yq71"
                                }
                            }
                        ]
                    },
                    {
                        formName: "外包拍摄视觉流程",
                        formId: "FORM-30500E23B9C44712A5EBBC5622D3D1C4TL18",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv670frf", opCode: opCodes.Contain, value: "套"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx49xlb32",
                                    name: "外拍审核",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclx49xlb32",
                                    name: "外拍审核",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclx49xlb32",
                                    name: "外拍审核",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "外拍审核",
                                    id: "node_oclx49xlb32"
                                }
                            },
                        ]
                    }
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
                            {fieldId: "radioField_lv641k3b", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
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
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.EqualAny, value: ["全套", "套图"]},
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Contain, value: "套"}
                        ],
                        flowNodeRules: [
                            {
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
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {
                                fieldId: "radioField_ltjt0ykc",
                                opCode: opCodes.EqualAny,
                                value: ["全套", "套图"]
                            }
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
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.EqualAny, value: ["全套图片", "外包拍摄"]}
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
                    },
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx1f3cl76",
                                    name: "确认修图属性",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx1f3cl76",
                                    name: "确认修图属性",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx1f3cl76",
                                    name: "确认修图属性",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认修图属性",
                                    id: "node_oclx1f3cl76"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5j5bv41",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5j5bv41",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5j5bv41",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配美编",
                                    id: "node_oclx5j5bv41"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5j5bv42",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5j5bv42",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5j5bv42",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配美编",
                                    id: "node_oclx5j5bv42"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5j5bv43",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5j5bv43",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5j5bv43",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配美编",
                                    id: "node_oclx5j5bv43"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxcz6yq71",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxcz6yq71",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclxcz6yq71",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "大美编负责人",
                                    id: "employeeField_lwyt5hfa"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr071x",
                                    name: "确认视觉性质",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr071x",
                                    name: "确认视觉性质",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr071x",
                                    name: "确认视觉性质",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认视觉性质",
                                    id: "node_oclx03jr071x"
                                }
                            },
                        ]
                    },
                    {
                        formName: "美编修图任务",
                        formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx41cnvt", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx422jq8p",
                                    name: "确认是否AI",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx422jq8p",
                                    name: "确认是否AI",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx422jq8p",
                                    name: "确认是否AI",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认是否AI",
                                    id: "node_oclx422jq8p"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5ij0pq5",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5ij0pq5",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5ij0pq5",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配美编",
                                    id: "node_oclx5ij0pq5"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5ij0pq6",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5ij0pq6",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5ij0pq6",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配美编",
                                    id: "node_oclx5ij0pq6"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5ij0pq7",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5ij0pq7",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5ij0pq7",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配美编",
                                    id: "node_oclx5ij0pq7"
                                }
                            }
                        ]
                    },
                    {
                        formName: "外包修图视觉流程",
                        formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx48e5gm", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ockpz6phx73",
                                    name: "分配外包美编制作",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ockpz6phx73",
                                    name: "分配外包美编制作",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ockpz6phx73",
                                    name: "分配外包美编制作",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配外包美编制作",
                                    id: "node_ockpz6phx73"
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
                            {fieldId: "radioField_lv641k3b", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvgffo395",
                                    name: "精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvgffo395",
                                    name: "精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvgffo395",
                                    name: "精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "精修美编完成任务",
                                    id: "node_oclvgffo395"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvgffo396",
                                    name: "简单美编任务完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvgffo396",
                                    name: "简单美编任务完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvgffo396",
                                    name: "简单美编任务完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编任务完成",
                                    id: "node_oclvgffo396"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvghx5li1",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvghx5li1",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvghx5li1",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclvghx5li1"
                                }
                            },

                            {
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
                            },
                            {
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
                            },
                            {
                                from: {
                                    id: "node_oclvt49cil4",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvt49cil4",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvt49cil4",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclvt49cil4"
                                }
                            },

                            {
                                from: {
                                    id: "node_oclw7dfsbp2",
                                    name: " 精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclw7dfsbp2",
                                    name: " 精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclw7dfsbp2",
                                    name: " 精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "精修美编完成任务",
                                    id: "node_oclw7dfsbp2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclw7dfsbp4",
                                    name: " 审核美编任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclw7dfsbp4",
                                    name: " 审核美编任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclw7dfsbp4",
                                    name: " 审核美编任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclw7dfsbp4"
                                }
                            },

                            // {
                            //     from: {
                            //         id: "node_oclvgh4l0z2",
                            //         name: " 重点精修美编完成任务",
                            //         status: ["TODO"]
                            //     },
                            //     to: {
                            //         id: "node_oclvgh4l0z2",
                            //         name: " 重点精修美编完成任务",
                            //         status: ["TODO"]
                            //     },
                            //     overdue: {
                            //         id: "node_oclvgh4l0z2",
                            //         name: " 重点精修美编完成任务",
                            //         status: ["TODO"]
                            //     },
                            //     ownerRule: {
                            //         from: "process",
                            //         name: "重点精修美编完成任务",
                            //         id: "node_oclvgh4l0z2"
                            //     }
                            // },
                            // {
                            //     from: {
                            //         id: "node_oclvgh4l0zb",
                            //         name: "精修美编完成任务",
                            //         status: ["TODO"]
                            //     },
                            //     to: {
                            //         id: "node_oclvgh4l0zb",
                            //         name: "精修美编完成任务",
                            //         status: ["TODO"]
                            //     },
                            //     overdue: {
                            //         id: "node_oclvgh4l0zb",
                            //         name: "精修美编完成任务",
                            //         status: ["TODO"]
                            //     },
                            //     ownerRule: {
                            //         from: "process",
                            //         name: "精修美编完成任务",
                            //         id: "node_oclvgh4l0zb"
                            //     }
                            // },
                            // {
                            //     from: {
                            //         id: "node_oclw7dfsbp6",
                            //         name: "精修美编完成任务",
                            //         status: ["TODO"]
                            //     },
                            //     to: {
                            //         id: "node_oclw7dfsbp6",
                            //         name: "精修美编完成任务",
                            //         status: ["TODO"]
                            //     },
                            //     overdue: {
                            //         id: "node_oclw7dfsbp6",
                            //         name: "精修美编完成任务",
                            //         status: ["TODO"]
                            //     },
                            //     ownerRule: {
                            //         from: "process",
                            //         name: "精修美编完成任务",
                            //         id: "node_oclw7dfsbp6"
                            //     }
                            // },
                            // {
                            //     from: {
                            //         id: "node_oclvgh4l0zf",
                            //         name: "简单任务完成",
                            //         status: ["TODO"]
                            //     },
                            //     to: {
                            //         id: "node_oclvgh4l0zf",
                            //         name: "简单任务完成",
                            //         status: ["TODO"]
                            //     },
                            //     overdue: {
                            //         id: "node_oclvgh4l0zf",
                            //         name: "简单任务完成",
                            //         status: ["TODO"]
                            //     },
                            //     ownerRule: {
                            //         from: "process",
                            //         name: "简单任务完成",
                            //         id: "node_oclvgh4l0zf"
                            //     }
                            // },
                            // {
                            //     from: {
                            //         id: "node_oclvghx5lia",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     to: {
                            //         id: "node_oclvghx5lia",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     overdue: {
                            //         id: "node_oclvghx5lia",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     ownerRule: {
                            //         from: "process",
                            //         name: "审核美编任务",
                            //         id: "node_oclvghx5lia"
                            //     }
                            // },
                            // {
                            //     from: {
                            //         id: "node_oclwhrd6j62",
                            //         name: "建模美编完成任务",
                            //         status: ["TODO"]
                            //     },
                            //     to: {
                            //         id: "node_oclwhrd6j62",
                            //         name: "建模美编完成任务",
                            //         status: ["TODO"]
                            //     },
                            //     overdue: {
                            //         id: "node_oclwhrd6j62",
                            //         name: "建模美编完成任务",
                            //         status: ["TODO"]
                            //     },
                            //     ownerRule: {
                            //         from: "process",
                            //         name: "建模美编完成任务",
                            //         id: "node_oclwhrd6j62"
                            //     }
                            // },
                            // {
                            //     from: {
                            //         id: "node_oclvghx5lia",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     to: {
                            //         id: "node_oclvghx5lia",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     overdue: {
                            //         id: "node_oclvghx5lia",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     ownerRule: {
                            //         from: "process",
                            //         name: "审核美编任务",
                            //         id: "node_oclvghx5lia"
                            //     }
                            // },
                            // {
                            //     from: {
                            //         id: "node_oclwhrd6j63",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     to: {
                            //         id: "node_oclwhrd6j63",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     overdue: {
                            //         id: "node_oclwhrd6j63",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     ownerRule: {
                            //         from: "process",
                            //         name: "审核美编任务",
                            //         id: "node_oclwhrd6j63"
                            //     }
                            // },
                            // {
                            //     from: {
                            //         id: "node_oclvghx5li1",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     to: {
                            //         id: "node_oclvghx5li1",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     overdue: {
                            //         id: "node_oclvghx5li1",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     ownerRule: {
                            //         from: "process",
                            //         name: "审核美编任务",
                            //         id: "node_oclvghx5li1"
                            //     }
                            // },
                            // {
                            //     from: {
                            //         id: "node_oclvt49cil4",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     to: {
                            //         id: "node_oclvt49cil4",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     overdue: {
                            //         id: "node_oclvt49cil4",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     ownerRule: {
                            //         from: "process",
                            //         name: "审核美编任务",
                            //         id: "node_oclvt49cil4"
                            //     }
                            // },
                            // {
                            //     from: {
                            //         id: "node_oclw7dfsbp4",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     to: {
                            //         id: "node_oclw7dfsbp4",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     overdue: {
                            //         id: "node_oclw7dfsbp4",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     ownerRule: {
                            //         from: "process",
                            //         name: "审核美编任务",
                            //         id: "node_oclw7dfsbp4"
                            //     }
                            // },
                            // {
                            //     from: {
                            //         id: "node_oclvghx5li7",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     to: {
                            //         id: "node_oclvghx5li7",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     overdue: {
                            //         id: "node_oclvghx5li7",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     ownerRule: {
                            //         from: "process",
                            //         name: "审核美编任务",
                            //         id: "node_oclvghx5li7"
                            //     }
                            // },
                            // {
                            //     from: {
                            //         id: "node_oclvghx5li8",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     to: {
                            //         id: "node_oclvghx5li8",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     overdue: {
                            //         id: "node_oclvghx5li8",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     ownerRule: {
                            //         from: "process",
                            //         name: "审核美编任务",
                            //         id: "node_oclvghx5li8"
                            //     }
                            // },
                            // {
                            //     from: {
                            //         id: "node_oclw7dfsbp7",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     to: {
                            //         id: "node_oclw7dfsbp7",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     overdue: {
                            //         id: "node_oclw7dfsbp7",
                            //         name: "审核美编任务",
                            //         status: ["TODO"]
                            //     },
                            //     ownerRule: {
                            //         from: "process",
                            //         name: "审核美编任务",
                            //         id: "node_oclw7dfsbp7"
                            //     }
                            // },
                        ]
                    },
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.EqualAny, value: ["全套", "套图"]},
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Contain, value: "套"}
                        ],
                        flowNodeRules: [
                            {
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
                            },
                            {
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
                            },
                            {
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
                            },
                            {
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
                            },
                            {
                                from: {
                                    id: "node_oclvkpzz4g3",
                                    name: "审核美编工作",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvkpzz4g3",
                                    name: "审核美编工作",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvkpzz4g3",
                                    name: "审核美编工作",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编工作",
                                    id: "node_oclvkpzz4g3"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvkpzz4g1",
                                    name: "审核美编工作",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvkpzz4g1",
                                    name: "审核美编工作",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvkpzz4g1",
                                    name: "审核美编工作",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编工作",
                                    id: "node_oclvkpzz4g1"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {
                                fieldId: "radioField_ltjt0ykc",
                                opCode: opCodes.EqualAny,
                                value: ["全套", "套图"]
                            }
                        ],
                        flowNodeRules: [
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
                                    id: "node_ockpz6phx73",
                                    name: "视觉完成确认审核",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ockpz6phx73",
                                    name: "视觉完成确认审核",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ockpz6phx73",
                                    name: "视觉完成确认审核",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "视觉完成确认审核",
                                    id: "node_ockpz6phx73"
                                }
                            }
                        ]
                    },
                    {
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.EqualAny, value: ["全套图片", "外包拍摄"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvxgf8mzc",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxgf8mzc",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxgf8mzc",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvxgf8mzc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvxgf8mzd",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxgf8mzd",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxgf8mzd",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvxgf8mzd"
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
                                    id: "node_oclvxgf8mzf",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxgf8mzf",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxgf8mzf",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvxgf8mzf"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvxgf8mzg",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxgf8mzg",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxgf8mzg",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvxgf8mzg"
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
                            },
                            {
                                from: {
                                    id: "node_oclm91ca7l9",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclm91ca7l9",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclm91ca7l9",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclm91ca7l9"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx1f3cl77",
                                    name: "小美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx1f3cl77",
                                    name: "小美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx1f3cl77",
                                    name: "小美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "小美编修图",
                                    id: "node_oclx1f3cl77"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx1f3cl78",
                                    name: "AI作图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx1f3cl78",
                                    name: "AI作图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx1f3cl78",
                                    name: "AI作图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "AI作图",
                                    id: "node_oclx1f3cl78"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx00ubuyy",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx00ubuyy",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuyy",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx00ubuyy"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4jrkfs2",
                                    name: "小美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4jrkfs2",
                                    name: "小美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4jrkfs2",
                                    name: "小美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "小美编修图",
                                    id: "node_oclx4jrkfs2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4jrkfs3",
                                    name: "AI作图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4jrkfs3",
                                    name: "AI作图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4jrkfs3",
                                    name: "AI作图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "AI作图",
                                    id: "node_oclx4jrkfs3"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4jrkfs4",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4jrkfs4",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4jrkfs4",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx4jrkfs4"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx30pi4f6",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx30pi4f6",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx30pi4f6",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx30pi4f6"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxcz6yq72",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxcz6yq72",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclxcz6yq72",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "中美编自修",
                                    id: "node_oclxcz6yq72"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx1f3cl7b",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx1f3cl7b",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx1f3cl7b",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "小美编套版",
                                    id: "node_oclx1f3cl7b"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70w7",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70w7",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70w7",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx4kc70w7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70w2",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70w2",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70w2",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx4kc70w2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70w4",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70w4",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70w4",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "中美编自修",
                                    id: "node_oclx4kc70w4"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70w5",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70w5",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70w5",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "小美编套版",
                                    id: "node_oclx4kc70w5"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4bnhfb3",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4bnhfb3",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4bnhfb3",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx4bnhfb3"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wj",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wj",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wj",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "中美编自修",
                                    id: "node_oclx4kc70wj"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wx",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wx",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wx",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "小美编套版",
                                    id: "node_oclx4kc70wx"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wy",
                                    name: "外包修图数量",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wy",
                                    name: "外包修图数量",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wy",
                                    name: "外包修图数量",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "外包修图数量",
                                    id: "node_oclx4kc70wy"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wz",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wz",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wz",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx4kc70wz"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70w3",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70w3",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70w3",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配中美编",
                                    id: "node_oclx4kc70w3"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4bnhfb2",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4bnhfb2",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4bnhfb2",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配中美编",
                                    id: "node_oclx4bnhfb2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx1flxsv1",
                                    name: "分配大美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx1flxsv1",
                                    name: "分配大美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx1flxsv1",
                                    name: "分配大美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配大美编",
                                    id: "node_oclx1flxsv1"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wi",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wi",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wi",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配中美编",
                                    id: "node_oclx4kc70wi"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核图片",
                                    id: "node_oclx03jr074d"
                                }
                            }
                        ]
                    },
                    {
                        formName: "美编修图任务",
                        formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx41cnvt", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx422jq87",
                                    name: "小美编负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx422jq87",
                                    name: "小美编负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx422jq87",
                                    name: "小美编负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "小美编负责人",
                                    id: "node_oclx422jq87"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx422jq88",
                                    name: "AI修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx422jq88",
                                    name: "AI修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx422jq88",
                                    name: "AI修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "AI修图",
                                    id: "node_oclx422jq88"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx422jq89",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx422jq89",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx422jq89",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx422jq89"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5gvwwq1",
                                    name: "小美编负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5gvwwq1",
                                    name: "小美编负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5gvwwq1",
                                    name: "小美编负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "小美编负责人",
                                    id: "node_oclx5gvwwq1"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5gvwwq2",
                                    name: "AI修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5gvwwq2",
                                    name: "AI修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5gvwwq2",
                                    name: "AI修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "AI修图",
                                    id: "node_oclx5gvwwq2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5gvwwq3",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5gvwwq3",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5gvwwq3",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx5gvwwq3"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx422jq8j",
                                    name: "中美编负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx422jq8j",
                                    name: "中美编负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx422jq8j",
                                    name: "中美编负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "中美编负责人",
                                    id: "node_oclx422jq8j"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx422jq8k",
                                    name: "套版美编负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx422jq8k",
                                    name: "套版美编负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx422jq8k",
                                    name: "套版美编负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "套版美编负责人",
                                    id: "node_oclx422jq8k"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4b3zdl3",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4b3zdl3",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4b3zdl3",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx4b3zdl3"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5gvwwqz",
                                    name: "中美编负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5gvwwqz",
                                    name: "中美编负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5gvwwqz",
                                    name: "中美编负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "中美编负责人",
                                    id: "node_oclx5gvwwqz"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5gvwwq10",
                                    name: "套版编负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5gvwwq10",
                                    name: "套版编负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5gvwwq10",
                                    name: "套版编负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "套版编负责人",
                                    id: "node_oclx5gvwwq10"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxfqmy8l2",
                                    name: "分配大美编后期修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxfqmy8l2",
                                    name: "分配大美编后期修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclxfqmy8l2",
                                    name: "分配大美编后期修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配大美编后期修图",
                                    id: "node_oclxfqmy8l2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxfqmy8l3",
                                    name: "大美编修图确认修图属性",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxfqmy8l3",
                                    name: "大美编修图确认修图属性",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclxfqmy8l3",
                                    name: "大美编修图确认修图属性",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图确认修图属性",
                                    id: "node_oclxfqmy8l3"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4b3zdl5",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4b3zdl5",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4b3zdl5",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配中美编",
                                    id: "node_oclx4b3zdl5"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审批人",
                                    id: "node_oclx422jq8o"
                                }
                            }
                        ]
                    },
                    {
                        formName: "外包修图视觉流程",
                        formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx48e5gm", opCode: opCodes.Equal, value: "全套"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "外包修图中",
                                    id: "textField_lx48e5gk"
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
                            {fieldId: "radioField_lv641k3b", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvghx5li1",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvghx5li1",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvghx5li1",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclvghx5li1"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvt49cil4",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvt49cil4",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvt49cil4",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclvt49cil4"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclw7dfsbp4",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclw7dfsbp4",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclw7dfsbp4",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclw7dfsbp4"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.EqualAny, value: ["全套", "套图"]},
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Contain, value: "套"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvkpzz4g3",
                                    name: "审核美编工作",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvkpzz4g3",
                                    name: "审核美编工作",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvkpzz4g3",
                                    name: "审核美编工作",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编工作",
                                    id: "node_oclvkpzz4g3"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvkpzz4g1",
                                    name: "审核美编工作",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvkpzz4g1",
                                    name: "审核美编工作",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvkpzz4g1",
                                    name: "审核美编工作",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编工作",
                                    id: "node_oclvkpzz4g1"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {
                                fieldId: "radioField_ltjt0ykc",
                                opCode: opCodes.EqualAny,
                                value: ["全套", "套图"]
                            }
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ockpz6phx73",
                                    name: "视觉完成确认审核",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_ockpz6phx73",
                                    name: "视觉完成确认审核",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_ockpz6phx73",
                                    name: "视觉完成确认审核",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "视觉完成确认审核",
                                    id: "node_ockpz6phx73"
                                }
                            }
                        ]
                    },
                    {
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.EqualAny, value: ["全套图片", "外包拍摄"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclm91ca7l9",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclm91ca7l9",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclm91ca7l9",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclm91ca7l9"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核图片",
                                    id: "node_oclx03jr074d"
                                }
                            }
                        ]
                    },
                    {
                        formName: "美编修图任务",
                        formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx41cnvt", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审批人",
                                    id: "node_oclx422jq8o"
                                }
                            }
                        ]
                    },
                    {
                        formName: "外包修图视觉流程",
                        formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx48e5gm", opCode: opCodes.EqualAny, value: ["全套", "套图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "外包修图中",
                                    id: "textField_lx48e5gk"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        actionName: "半套",
        actionCode: "halfPackedPicture",
        actionStatus: [
            {
                nameCN: "待拍摄影",
                nameEN: mbActionTypes.WAIT_TO_SHOOT,
                rules: [
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["半套"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx00ubuy7",
                                    name: "确认拍摄类型",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx00ubuy7",
                                    name: "确认拍摄类型",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuy7",
                                    name: "确认拍摄类型",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认拍摄类型",
                                    id: "node_oclx00ubuy7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx00ubuyc",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx00ubuyc",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuyc",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配执行",
                                    id: "node_oclx00ubuyc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx00ubuyd",
                                    name: "执行确认样品",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx00ubuyd",
                                    name: "执行确认样品",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuyd",
                                    name: "执行确认样品",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行确认样品",
                                    id: "node_oclx00ubuyd"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx00ubuye",
                                    name: "审核方案分配摄像/美编负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx00ubuye",
                                    name: "审核方案分配摄像/美编负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuye",
                                    name: "审核方案分配摄像/美编负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核方案分配摄像/美编负责人",
                                    id: "node_oclx00ubuye"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr071t",
                                    name: "分配外拍负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr071t",
                                    name: "分配外拍负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr071t",
                                    name: "分配外拍负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配外拍负责人",
                                    id: "node_oclx03jr071t"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr071u",
                                    name: "分配执行邮寄样品",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr071u",
                                    name: "分配执行邮寄样品",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr071u",
                                    name: "分配执行邮寄样品",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认拍摄类型",
                                    id: "node_oclx00ubuy7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr071v",
                                    name: "执行填写快递单号",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr071v",
                                    name: "执行填写快递单号",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr071v",
                                    name: "执行填写快递单号",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认拍摄类型",
                                    id: "node_oclx00ubuy7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr071w",
                                    name: "通知外包负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr071w",
                                    name: "通知外包负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr071w",
                                    name: "通知外包负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认拍摄类型",
                                    id: "node_oclx00ubuy7"
                                }
                            }
                        ]
                    },
                ]
            },
            {
                nameCN: "摄影进行中",
                nameEN: mbActionTypes.BE_SHOOTING,
                rules: [
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["半套"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx00ubuyu",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx00ubuyu",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuyu",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "拍摄完成",
                                    id: "node_oclx00ubuyu"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxcz6yq71",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxcz6yq71",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclxcz6yq71",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "拍摄完成",
                                    id: "node_oclxcz6yq71"
                                }
                            }
                        ]
                    },
                ]
            },
            {
                nameCN: "摄影完成",
                nameEN: mbActionTypes.SHOOT_DONE,
                rules: [
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["半套"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx00ubuyu",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclx00ubuyu",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuyu",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "拍摄完成",
                                    id: "node_oclx00ubuyu"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxcz6yq71",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclxcz6yq71",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclxcz6yq71",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "拍摄完成",
                                    id: "node_oclxcz6yq71"
                                }
                            }
                        ]
                    }
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
                            {fieldId: "radioField_lv641k3b", opCode: opCodes.EqualAny, value: ["半套"]}
                        ],
                        flowNodeRules: [
                            {
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
                            }
                        ]
                    },
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["半套"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx1f3cl76",
                                    name: "确认修图属性",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx1f3cl76",
                                    name: "确认修图属性",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx1f3cl76",
                                    name: "确认修图属性",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认修图属性",
                                    id: "node_oclx1f3cl76"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5j5bv41",
                                    name: "确认修图属性",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5j5bv41",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5j5bv41",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配美编",
                                    id: "node_oclx5j5bv41"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxcz6yq71",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxcz6yq71",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclxcz6yq71",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "大美编负责人",
                                    id: "employeeField_lwyt5hfa"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr071x",
                                    name: "确认视觉性质",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr071x",
                                    name: "确认视觉性质",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr071x",
                                    name: "确认视觉性质",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认视觉性质",
                                    id: "node_oclx03jr071x"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx1flxsv1",
                                    name: "分配大美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx1flxsv1",
                                    name: "分配大美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx1flxsv1",
                                    name: "分配大美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配大美编",
                                    id: "node_oclx1flxsv1"
                                }
                            }
                        ]
                    },
                    {
                        formName: "美编修图任务",
                        formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx41cnvt", opCode: opCodes.EqualAny, value: ["半套"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx422jq8p",
                                    name: "确认是否AI",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx422jq8p",
                                    name: "确认是否AI",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx422jq8p",
                                    name: "确认是否AI",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认是否AI",
                                    id: "node_oclx422jq8p"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5ij0pq5",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5ij0pq5",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5ij0pq5",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配美编",
                                    id: "node_oclx5ij0pq5"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5ij0pq6",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5ij0pq6",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5ij0pq6",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配美编",
                                    id: "node_oclx5ij0pq6"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5ij0pq7",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5ij0pq7",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5ij0pq7",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配美编",
                                    id: "node_oclx5ij0pq7"
                                }
                            }
                        ]
                    },
                    {
                        formName: "外包修图视觉流程",
                        formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx48e5gm", opCode: opCodes.EqualAny, value: ["半套"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ockpz6phx73",
                                    name: "分配外包美编制作",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ockpz6phx73",
                                    name: "分配外包美编制作",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ockpz6phx73",
                                    name: "分配外包美编制作",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配外包美编制作",
                                    id: "node_ockpz6phx73"
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
                            {fieldId: "radioField_lv641k3b", opCode: opCodes.EqualAny, value: ["半套"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvgh4l0z2",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvgh4l0z2",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvgh4l0z2",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvgh4l0z2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvgh4l0zb",
                                    name: "精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvgh4l0zb",
                                    name: "精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvgh4l0zb",
                                    name: "精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "精修美编完成任务",
                                    id: "node_oclvgh4l0zb"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclw7dfsbp6",
                                    name: " 精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclw7dfsbp6",
                                    name: " 精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclw7dfsbp6",
                                    name: " 精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "精修美编完成任务",
                                    id: "node_oclw7dfsbp6"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvgh4l0zf",
                                    name: "简单任务完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvgh4l0zf",
                                    name: "简单任务完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvgh4l0zf",
                                    name: "简单任务完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单任务完成",
                                    id: "node_oclvt49cil2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclwhrd6j62",
                                    name: "建模美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclwhrd6j62",
                                    name: "建模美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclwhrd6j62",
                                    name: "建模美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "建模美编完成任务",
                                    id: "node_oclwhrd6j62"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvghx5li7",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvghx5li7",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvghx5li7",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclvghx5li7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvghx5li8",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvghx5li8",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvghx5li8",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclvghx5li8"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclw7dfsbp7",
                                    name: " 审核美编任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclw7dfsbp7",
                                    name: " 审核美编任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclw7dfsbp7",
                                    name: " 审核美编任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclw7dfsbp7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvghx5lia",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvghx5lia",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvghx5lia",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclvghx5lia"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclwhrd6j63",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclwhrd6j63",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclwhrd6j63",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclwhrd6j63"
                                }
                            },
                        ]
                    },
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["半套"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx1f3cl77",
                                    name: "小美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx1f3cl77",
                                    name: "小美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx1f3cl77",
                                    name: "小美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "小美编修图",
                                    id: "node_oclx1f3cl77"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx1f3cl78",
                                    name: "AI作图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx1f3cl78",
                                    name: "AI作图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx1f3cl78",
                                    name: "AI作图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "AI作图",
                                    id: "node_oclx1f3cl78"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx00ubuyy",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx00ubuyy",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuyy",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx00ubuyy"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4jrkfs2",
                                    name: "小美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4jrkfs2",
                                    name: "小美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4jrkfs2",
                                    name: "小美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "小美编修图",
                                    id: "node_oclx4jrkfs2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4jrkfs3",
                                    name: "AI作图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4jrkfs3",
                                    name: "AI作图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4jrkfs3",
                                    name: "AI作图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "AI作图",
                                    id: "node_oclx4jrkfs3"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4jrkfs4",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4jrkfs4",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4jrkfs4",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx4jrkfs4"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx30pi4f6",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx30pi4f6",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx30pi4f6",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx30pi4f6"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70w3",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70w3",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70w3",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配中美编",
                                    id: "node_oclx4kc70w3"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxcz6yq72",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxcz6yq72",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclxcz6yq72",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "中美编自修",
                                    id: "node_oclxcz6yq72"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx1f3cl7b",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx1f3cl7b",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx1f3cl7b",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "小美编套版",
                                    id: "node_oclx1f3cl7b"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70w6",
                                    name: "外包修图数量",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70w6",
                                    name: "外包修图数量",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70w6",
                                    name: "外包修图数量",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "外包修图数量",
                                    id: "node_oclx4kc70w6"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70w7",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70w7",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70w7",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx4kc70w7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70w2",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70w2",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70w2",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx4kc70w2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4bnhfb2",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4bnhfb2",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4bnhfb2",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配中美编",
                                    id: "node_oclx4bnhfb2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70w4",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70w4",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70w4",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "中美编自修",
                                    id: "node_oclx4kc70w4"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70w5",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70w5",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70w5",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "小美编套版",
                                    id: "node_oclx4kc70w5"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4dqaay1",
                                    name: "外包修图数量",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4dqaay1",
                                    name: "外包修图数量",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4dqaay1",
                                    name: "外包修图数量",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "外包修图数量",
                                    id: "node_oclx4dqaay1"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4bnhfb3",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4bnhfb3",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4bnhfb3",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx4bnhfb3"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wi",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wi",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wi",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配中美编",
                                    id: "node_oclx4kc70wi"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wj",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wj",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wj",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "中美编自修",
                                    id: "node_oclx4kc70wj"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wx",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wx",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wx",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "小美编套版",
                                    id: "node_oclx4kc70wx"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wy",
                                    name: "外包修图数量",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wy",
                                    name: "外包修图数量",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wy",
                                    name: "外包修图数量",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "外包修图数量",
                                    id: "node_oclx4kc70wy"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wz",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wz",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wz",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx4kc70wz"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核图片",
                                    id: "node_oclx03jr074d"
                                }
                            }
                        ]
                    },
                    {
                        formName: "美编修图任务",
                        formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx41cnvt", opCode: opCodes.EqualAny, value: ["半套"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx422jq87",
                                    name: "小美编负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx422jq87",
                                    name: "小美编负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx422jq87",
                                    name: "小美编负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "小美编负责人",
                                    id: "node_oclx422jq87"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx422jq88",
                                    name: "AI修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx422jq88",
                                    name: "AI修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx422jq88",
                                    name: "AI修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "AI修图",
                                    id: "node_oclx422jq88"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx422jq89",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx422jq89",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx422jq89",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx422jq89"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5gvwwq1",
                                    name: "小美编负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5gvwwq1",
                                    name: "小美编负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5gvwwq1",
                                    name: "小美编负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "小美编负责人",
                                    id: "node_oclx5gvwwq1"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5gvwwq2",
                                    name: "AI修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5gvwwq2",
                                    name: "AI修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5gvwwq2",
                                    name: "AI修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "AI修图",
                                    id: "node_oclx5gvwwq2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5gvwwq3",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5gvwwq3",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5gvwwq3",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx5gvwwq3"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx422jq8j",
                                    name: "中美编负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx422jq8j",
                                    name: "中美编负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx422jq8j",
                                    name: "中美编负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "中美编负责人",
                                    id: "node_oclx422jq8j"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx422jq8k",
                                    name: "套版美编负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx422jq8k",
                                    name: "套版美编负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx422jq8k",
                                    name: "套版美编负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "套版美编负责人",
                                    id: "node_oclx422jq8k"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4b3zdl3",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4b3zdl3",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4b3zdl3",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx4b3zdl3"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5gvwwqz",
                                    name: "中美编负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5gvwwqz",
                                    name: "中美编负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5gvwwqz",
                                    name: "中美编负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "中美编负责人",
                                    id: "node_oclx5gvwwqz"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5gvwwq10",
                                    name: "套版编负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5gvwwq10",
                                    name: "套版编负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5gvwwq10",
                                    name: "套版编负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "套版编负责人",
                                    id: "node_oclx5gvwwq10"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审批人",
                                    id: "node_oclx422jq8o"
                                }
                            }
                        ]
                    },
                    {
                        formName: "外包修图视觉流程",
                        formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx48e5gm", opCode: opCodes.EqualAny, value: ["半套"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "外包修图中",
                                    id: "textField_lx48e5gk"
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
                            {fieldId: "radioField_lv641k3b", opCode: opCodes.EqualAny, value: ["半套"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvghx5li7",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvghx5li7",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvghx5li7",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclvghx5li7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvghx5li8",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvghx5li8",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvghx5li8",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclvghx5li8"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclw7dfsbp7",
                                    name: " 审核美编任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclw7dfsbp7",
                                    name: " 审核美编任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclw7dfsbp7",
                                    name: " 审核美编任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclw7dfsbp7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvghx5lia",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvghx5lia",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvghx5lia",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclvghx5lia"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclwhrd6j63",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclwhrd6j63",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclwhrd6j63",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclwhrd6j63"
                                }
                            },
                        ]
                    },
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["半套"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核图片",
                                    id: "node_oclx03jr074d"
                                }
                            }
                        ]
                    },
                    {
                        formName: "美编修图任务",
                        formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx41cnvt", opCode: opCodes.EqualAny, value: ["半套"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审批人",
                                    id: "node_oclx422jq8o"
                                }
                            }
                        ]
                    },
                    {
                        formName: "外包修图视觉流程",
                        formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx48e5gm", opCode: opCodes.EqualAny, value: ["半套"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["HISTORYHISTORY"]
                                },
                                overdue: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "外包修图中",
                                    id: "textField_lx48e5gk"
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
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "散图"},
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "部分图片"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ocllqa26nn1",
                                    name: "审批视觉方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocllqa26nn1",
                                    name: "审批视觉方案",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocllqa26nn1",
                                    name: "审批视觉方案",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审批视觉方案",
                                    id: "node_ocllqa26nn1"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclrolj7io1",
                                    name: "分配执行助理",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclrolj7io1",
                                    name: "分配执行助理",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclrolj7io1",
                                    name: "分配执行助理",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkml6kp"
                                }
                            },
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
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkml6kp"
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
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkml6kp"
                                }
                            }
                        ]
                    },
                    {
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "部分图片"}
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
                    },
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["散图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx00ubuy7",
                                    name: "确认拍摄类型",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx00ubuy7",
                                    name: "确认拍摄类型",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuy7",
                                    name: "确认拍摄类型",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认拍摄类型",
                                    id: "node_oclx00ubuy7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx00ubuyc",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx00ubuyc",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuyc",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配执行",
                                    id: "node_oclx00ubuyc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx00ubuyd",
                                    name: "执行确认样品",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx00ubuyd",
                                    name: "执行确认样品",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuyd",
                                    name: "执行确认样品",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行确认样品",
                                    id: "node_oclx00ubuyd"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx00ubuye",
                                    name: "审核方案分配摄像/美编负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx00ubuye",
                                    name: "审核方案分配摄像/美编负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuye",
                                    name: "审核方案分配摄像/美编负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核方案分配摄像/美编负责人",
                                    id: "node_oclx00ubuye"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr071t",
                                    name: "分配外拍负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr071t",
                                    name: "分配外拍负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr071t",
                                    name: "分配外拍负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配外拍负责人",
                                    id: "node_oclx03jr071t"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr071u",
                                    name: "分配执行邮寄样品",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr071u",
                                    name: "分配执行邮寄样品",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr071u",
                                    name: "分配执行邮寄样品",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认拍摄类型",
                                    id: "node_oclx00ubuy7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr071v",
                                    name: "执行填写快递单号",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr071v",
                                    name: "执行填写快递单号",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr071v",
                                    name: "执行填写快递单号",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认拍摄类型",
                                    id: "node_oclx00ubuy7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr071w",
                                    name: "通知外包负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr071w",
                                    name: "通知外包负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr071w",
                                    name: "通知外包负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认拍摄类型",
                                    id: "node_oclx00ubuy7"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {
                                fieldId: "radioField_ltjt0ykc",
                                opCode: opCodes.EqualAny,
                                value: ["散图"]
                            }
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclkvznwuu1",
                                    name: "提交竞店ID",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclkvznwuu1",
                                    name: "提交竞店ID",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclkvznwuu1",
                                    name: "提交竞店ID",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclohx0w4s1",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclohx0w4s1",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclohx0w4s1",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclix0goa91",
                                    name: "统计五维表",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclix0goa91",
                                    name: "统计五维表",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclix0goa91",
                                    name: "统计五维表",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclix34wly1",
                                    name: "审核执行统计五给出样品明细",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclix34wly1",
                                    name: "审核执行统计五给出样品明细",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclix34wly1",
                                    name: "审核执行统计五给出样品明细",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclwketkev4",
                                    name: "执行确认样品来源",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclwketkev4",
                                    name: "执行确认样品来源",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclwketkev4",
                                    name: "执行确认样品来源",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclwketkev6",
                                    name: "执行联系样品到公司",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclwketkev6",
                                    name: "执行联系样品到公司",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclwketkev6",
                                    name: "执行联系样品到公司",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclwkf0tuy1",
                                    name: "开发联系样品",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclwkf0tuy1",
                                    name: "开发联系样品",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclwkf0tuy1",
                                    name: "开发联系样品",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
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
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclto83mms5",
                                    name: "组长审核方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclto83mms5",
                                    name: "组长审核方案",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclto83mms5",
                                    name: "组长审核方案",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvx64tg92",
                                    name: "组长审核方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvx64tg92",
                                    name: "组长审核方案",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvx64tg92",
                                    name: "组长审核方案",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclii6vcap2",
                                    name: "项目负责人审核方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclii6vcap2",
                                    name: "项目负责人审核方案",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclii6vcap2",
                                    name: "项目负责人审核方案",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltseng6r1",
                                    name: "执行运营确认样品到公司",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltseng6r1",
                                    name: "执行运营确认样品到公司",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocltseng6r1",
                                    name: "执行运营确认样品到公司",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclii6vcap3",
                                    name: "视觉方案审核",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclii6vcap3",
                                    name: "视觉方案审核",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclii6vcap3",
                                    name: "视觉方案审核",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "视觉方案审核",
                                    id: "node_oclii6vcap3"
                                }
                            },
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
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
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
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            }
                        ]
                    },
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
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "散图"},
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "部分图片"}
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
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "部分图片"}
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
                    },
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["散图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclxcz6yq73",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxcz6yq73",
                                    name: "拍摄完成",
                                    status: ["todo"]
                                },
                                overdue: {
                                    id: "node_oclxcz6yq73",
                                    name: "拍摄完成",
                                    status: ["todo"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "拍摄完成",
                                    id: "node_oclxcz6yq73"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxcz6yq74",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxcz6yq74",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclxcz6yq74",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "拍摄完成",
                                    id: "node_oclxcz6yq74"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {
                                fieldId: "radioField_ltjt0ykc",
                                opCode: opCodes.EqualAny,
                                value: ["散图"]
                            }
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
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "散图"},
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "部分图片"}
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
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "部分图片"}
                        ],
                        flowNodeRules: [
                            {
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
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["散图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclxcz6yq73",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclxcz6yq73",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclxcz6yq73",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "拍摄完成",
                                    id: "node_oclxcz6yq73"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxcz6yq74",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclxcz6yq74",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclxcz6yq74",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "拍摄完成",
                                    id: "node_oclxcz6yq74"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {
                                fieldId: "radioField_ltjt0ykc",
                                opCode: opCodes.EqualAny,
                                value: ["散图"]
                            }
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
                nameCN: "待入美编",
                nameEN: mbActionTypes.WAIT_TO_PS,
                rules: [
                    {
                        formName: "美编任务运营发布",
                        formId: "FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv641k3b", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
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
                            }
                        ]
                    },
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "散图"},
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "部分图片"}
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
                        formName: " 天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "部分图片"}
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
                    },
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["散图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx4kc70wa",
                                    name: "确认修图属性",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wa",
                                    name: "确认修图属性",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wa",
                                    name: "确认修图属性",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "确认修图属性",
                                    id: "node_oclx4kc70wa"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5j5bv44",
                                    name: "确认修图属性",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5j5bv44",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5j5bv44",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配美编",
                                    id: "node_oclx5j5bv44"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5j5bv45",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5j5bv45",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5j5bv45",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配美编",
                                    id: "node_oclx5j5bv45"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5j5bv46",
                                    name: "确认修图属性",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5j5bv46",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5j5bv46",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配美编",
                                    id: "node_oclx5j5bv46"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxcz6yq74",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxcz6yq74",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclxcz6yq74",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "大美编负责人",
                                    id: "employeeField_lwyt5hfa"
                                }
                            }
                        ]
                    },
                    {
                        formName: "美编修图任务",
                        formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx41cnvt", opCode: opCodes.EqualAny, value: ["散图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx422jq8p",
                                    name: "确认是否AI",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx422jq8p",
                                    name: "确认是否AI",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx422jq8p",
                                    name: "确认是否AI",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认是否AI",
                                    id: "node_oclx422jq8p"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5ij0pq5",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5ij0pq5",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5ij0pq5",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配美编",
                                    id: "node_oclx5ij0pq5"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5ij0pq6",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5ij0pq6",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5ij0pq6",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配美编",
                                    id: "node_oclx5ij0pq6"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5ij0pq7",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5ij0pq7",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5ij0pq7",
                                    name: "分配美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配美编",
                                    id: "node_oclx5ij0pq7"
                                }
                            }
                        ]
                    },
                    {
                        formName: "外包修图视觉流程",
                        formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx48e5gm", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ockpz6phx73",
                                    name: "分配外包美编制作",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ockpz6phx73",
                                    name: "分配外包美编制作",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ockpz6phx73",
                                    name: "分配外包美编制作",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配外包美编制作",
                                    id: "node_ockpz6phx73"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {
                                fieldId: "radioField_ltjt0ykc",
                                opCode: opCodes.EqualAny,
                                value: ["散图"]
                            }
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
                            {fieldId: "radioField_lv641k3b", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvgh4l0z2",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvgh4l0z2",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvgh4l0z2",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvgh4l0z2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvgh4l0zb",
                                    name: "精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvgh4l0zb",
                                    name: "精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvgh4l0zb",
                                    name: "精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "精修美编完成任务",
                                    id: "node_oclvgh4l0zb"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclw7dfsbp6",
                                    name: " 精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclw7dfsbp6",
                                    name: " 精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclw7dfsbp6",
                                    name: " 精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "精修美编完成任务",
                                    id: "node_oclw7dfsbp6"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvgh4l0zf",
                                    name: "简单任务完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvgh4l0zf",
                                    name: "简单任务完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvgh4l0zf",
                                    name: "简单任务完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单任务完成",
                                    id: "node_oclvt49cil2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclwhrd6j62",
                                    name: "建模美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclwhrd6j62",
                                    name: "建模美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclwhrd6j62",
                                    name: "建模美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "建模美编完成任务",
                                    id: "node_oclwhrd6j62"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvghx5li7",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvghx5li7",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvghx5li7",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclvghx5li7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvghx5li8",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvghx5li8",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvghx5li8",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclvghx5li8"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclw7dfsbp7",
                                    name: " 审核美编任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclw7dfsbp7",
                                    name: " 审核美编任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclw7dfsbp7",
                                    name: " 审核美编任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclw7dfsbp7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvghx5lia",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvghx5lia",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvghx5lia",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclvghx5lia"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclwhrd6j63",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclwhrd6j63",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclwhrd6j63",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclwhrd6j63"
                                }
                            },
                        ]
                    },
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "散图"},
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "部分图片"}
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
                                    id: "node_oclvkqswtb4",
                                    name: "审核美编工作",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvkqswtb4",
                                    name: "审核美编工作",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvkqswtb4",
                                    name: "审核美编工作",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编工作",
                                    id: "node_oclvkqswtb4"
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
                            },
                            {
                                from: {
                                    id: "node_oclvkqswtbc",
                                    name: "审核美编工作",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvkqswtbc",
                                    name: "审核美编工作",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvkqswtbc",
                                    name: "审核美编工作",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编工作",
                                    id: "node_oclvkqswtbc"
                                }
                            }
                        ]
                    },
                    {
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "部分图片"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvxgf8mzc",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxgf8mzc",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxgf8mzc",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvxgf8mzc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvxgf8mzd",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxgf8mzd",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxgf8mzd",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvxgf8mzd"
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
                                    id: "node_oclvxgf8mzf",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxgf8mzf",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxgf8mzf",
                                    name: "重点精修美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "重点精修美编完成任务",
                                    id: "node_oclvxgf8mzf"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvxgf8mzg",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvxgf8mzg",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvxgf8mzg",
                                    name: "简单美编完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "简单美编完成任务",
                                    id: "node_oclvxgf8mzg"
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
                            },
                            {
                                from: {
                                    id: "node_oclm91ca7l9",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclm91ca7l9",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclm91ca7l9",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclm91ca7l9"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["散图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx4kc70wb",
                                    name: "小美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wb",
                                    name: "小美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wb",
                                    name: "小美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "小美编修图",
                                    id: "node_oclx4kc70wb"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wc",
                                    name: "AI作图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wc",
                                    name: "AI作图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wc",
                                    name: "AI作图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "AI作图",
                                    id: "node_oclx4kc70wc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wd",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wd",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wd",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx4kc70wd"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70we",
                                    name: "小美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70we",
                                    name: "小美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70we",
                                    name: "小美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "小美编修图",
                                    id: "node_oclx4kc70we"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wf",
                                    name: "AI作图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wf",
                                    name: "AI作图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wf",
                                    name: "AI作图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "AI作图",
                                    id: "node_oclx4kc70wf"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wg",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wg",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wg",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx4kc70wg"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wh",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wh",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wh",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx4kc70wh"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wp",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wp",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wp",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配中美编",
                                    id: "node_oclx4kc70wp"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxcz6yq75",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxcz6yq75",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclxcz6yq75",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "中美编自修",
                                    id: "node_oclxcz6yq75"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wr",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wr",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wr",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "小美编套版",
                                    id: "node_oclx4kc70wr"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wl",
                                    name: "外包修图数量",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wl",
                                    name: "外包修图数量",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wl",
                                    name: "外包修图数量",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "外包修图数量",
                                    id: "node_oclx4kc70wl"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wm",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wm",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wm",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx4kc70wm"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wo",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wo",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wo",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx4kc70wo"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wv",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wv",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wv",
                                    name: "分配中美编",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配中美编",
                                    id: "node_oclx4kc70wv"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxcz6yq76",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxcz6yq76",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclxcz6yq76",
                                    name: "中美编自修",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "中美编自修",
                                    id: "node_oclxcz6yq76"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wk",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wk",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wk",
                                    name: "小美编套版",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "小美编套版",
                                    id: "node_oclx4kc70wk"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70ws",
                                    name: "外包修图数量",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70ws",
                                    name: "外包修图数量",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70ws",
                                    name: "外包修图数量",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "外包修图数量",
                                    id: "node_oclx4kc70ws"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx4kc70wt",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx4kc70wt",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx4kc70wt",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx4kc70wt"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核图片",
                                    id: "node_oclx03jr074d"
                                }
                            }
                        ]
                    },
                    {
                        formName: "美编修图任务",
                        formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx41cnvt", opCode: opCodes.EqualAny, value: ["散图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx5gvwwq4",
                                    name: "小美编负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5gvwwq4",
                                    name: "小美编负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5gvwwq4",
                                    name: "小美编负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "小美编负责人",
                                    id: "node_oclx5gvwwq4"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5gvwwq5",
                                    name: "AI修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5gvwwq5",
                                    name: "AI修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5gvwwq5",
                                    name: "AI修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "AI修图",
                                    id: "node_oclx5gvwwq5"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5gvwwq6",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5gvwwq6",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5gvwwq6",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx5gvwwq6"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5gvwwq7",
                                    name: "小美编负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5gvwwq7",
                                    name: "小美编负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5gvwwq7",
                                    name: "小美编负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "小美编负责人",
                                    id: "node_oclx5gvwwq7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5gvwwq8",
                                    name: "AI修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5gvwwq8",
                                    name: "AI修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5gvwwq8",
                                    name: "AI修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "AI修图",
                                    id: "node_oclx5gvwwq8"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5gvwwq9",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5gvwwq9",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5gvwwq9",
                                    name: "大美编修图",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "大美编修图",
                                    id: "node_oclx5gvwwq9"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5gvwwqd",
                                    name: "中美编负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5gvwwqd",
                                    name: "中美编负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5gvwwqd",
                                    name: "中美编负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "中美编负责人",
                                    id: "node_oclx5gvwwqd"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx5gvwwqe",
                                    name: "套版美编负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5gvwwqe",
                                    name: "套版美编负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5gvwwqe",
                                    name: "套版美编负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "套版美编负责人",
                                    id: "node_oclx5gvwwqe"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审批人",
                                    id: "node_oclx422jq8o"
                                }
                            }
                        ]
                    },
                    {
                        formName: "外包修图视觉流程",
                        formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx48e5gm", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "外包修图中",
                                    id: "textField_lx48e5gk"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {
                                fieldId: "radioField_ltjt0ykc",
                                opCode: opCodes.EqualAny,
                                value: ["散图"]
                            }
                        ],
                        flowNodeRules: [
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
                                    id: "node_ockpz6phx73",
                                    name: "视觉完成确认审核",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ockpz6phx73",
                                    name: "视觉完成确认审核",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ockpz6phx73",
                                    name: "视觉完成确认审核",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "视觉完成确认审核",
                                    id: "node_ockpz6phx73"
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
                            {fieldId: "radioField_lv641k3b", opCode: opCodes.Equal, value: "散图"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvghx5li7",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvghx5li7",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvghx5li7",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclvghx5li7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvghx5li8",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvghx5li8",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvghx5li8",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclvghx5li8"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclw7dfsbp7",
                                    name: " 审核美编任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclw7dfsbp7",
                                    name: " 审核美编任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclw7dfsbp7",
                                    name: " 审核美编任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclw7dfsbp7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvghx5lia",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvghx5lia",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvghx5lia",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclvghx5lia"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclwhrd6j63",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclwhrd6j63",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclwhrd6j63",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclwhrd6j63"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "散图"},
                            {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "部分图片"}
                        ],
                        flowNodeRules: [{
                            from: {
                                id: "node_oclvkqswtb4",
                                name: "审核美编工作",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvkqswtb4",
                                name: "审核美编工作",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvkqswtb4",
                                name: "审核美编工作",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "审核美编工作",
                                id: "node_oclvkqswtb4"
                            }
                        },
                            {
                                from: {
                                    id: "node_oclvkqswtbc",
                                    name: "审核美编工作",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvkqswtbc",
                                    name: "审核美编工作",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvkqswtbc",
                                    name: "审核美编工作",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编工作",
                                    id: "node_oclvkqswtbc"
                                }
                            }
                        ]
                    },
                    {
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "部分图片"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclm91ca7l9",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclm91ca7l9",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclm91ca7l9",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclm91ca7l9"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["散图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核图片",
                                    id: "node_oclx03jr074d"
                                }
                            }
                        ]
                    },
                    {
                        formName: "美编修图任务",
                        formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx41cnvt", opCode: opCodes.EqualAny, value: ["散图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审批人",
                                    id: "node_oclx422jq8o"
                                }
                            }
                        ]
                    },
                    {
                        formName: "外包修图视觉流程",
                        formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx48e5gm", opCode: opCodes.EqualAny, value: ["散图"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["HISTORYHISTORY"]
                                },
                                overdue: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "外包修图中",
                                    id: "textField_lx48e5gk"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {
                                fieldId: "radioField_ltjt0ykc",
                                opCode: opCodes.EqualAny,
                                value: ["散图"]
                            }
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ockpz6phx73",
                                    name: "视觉完成确认审核",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_ockpz6phx73",
                                    name: "视觉完成确认审核",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_ockpz6phx73",
                                    name: "视觉完成确认审核",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "视觉完成确认审核",
                                    id: "node_ockpz6phx73"
                                }
                            }
                        ]
                    },
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
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "视频"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ocllqa26nn1",
                                    name: "审批视觉方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocllqa26nn1",
                                    name: "审批视觉方案",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocllqa26nn1",
                                    name: "审批视觉方案",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审批视觉方案",
                                    id: "node_ocllqa26nn1"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclrolj7io1",
                                    name: "分配执行助理",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclrolj7io1",
                                    name: "分配执行助理",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclrolj7io1",
                                    name: "分配执行助理",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkml6kp"
                                }
                            },
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
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkml6kp"
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
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkml6kp"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["视频"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx00ubuy7",
                                    name: "确认拍摄类型",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx00ubuy7",
                                    name: "确认拍摄类型",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuy7",
                                    name: "确认拍摄类型",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认拍摄类型",
                                    id: "node_oclx00ubuy7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx00ubuyc",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx00ubuyc",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuyc",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配执行",
                                    id: "node_oclx00ubuyc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx00ubuyd",
                                    name: "执行确认样品",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx00ubuyd",
                                    name: "执行确认样品",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuyd",
                                    name: "执行确认样品",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行确认样品",
                                    id: "node_oclx00ubuyd"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx00ubuye",
                                    name: "审核方案分配摄像/美编负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx00ubuye",
                                    name: "审核方案分配摄像/美编负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx00ubuye",
                                    name: "审核方案分配摄像/美编负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核方案分配摄像/美编负责人",
                                    id: "node_oclx00ubuye"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr071t",
                                    name: "分配外拍负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr071t",
                                    name: "分配外拍负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr071t",
                                    name: "分配外拍负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配外拍负责人",
                                    id: "node_oclx03jr071t"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr071u",
                                    name: "分配执行邮寄样品",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr071u",
                                    name: "分配执行邮寄样品",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr071u",
                                    name: "分配执行邮寄样品",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认拍摄类型",
                                    id: "node_oclx00ubuy7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr071v",
                                    name: "执行填写快递单号",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr071v",
                                    name: "执行填写快递单号",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr071v",
                                    name: "执行填写快递单号",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认拍摄类型",
                                    id: "node_oclx00ubuy7"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr071w",
                                    name: "通知外包负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr071w",
                                    name: "通知外包负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr071w",
                                    name: "通知外包负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认拍摄类型",
                                    id: "node_oclx00ubuy7"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {
                                fieldId: "radioField_ltjt0ykc",
                                opCode: opCodes.EqualAny,
                                value: ["视频"]
                            }
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclkvznwuu1",
                                    name: "提交竞店ID",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclkvznwuu1",
                                    name: "提交竞店ID",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclkvznwuu1",
                                    name: "提交竞店ID",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclohx0w4s1",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclohx0w4s1",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclohx0w4s1",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclix0goa91",
                                    name: "统计五维表",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclix0goa91",
                                    name: "统计五维表",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclix0goa91",
                                    name: "统计五维表",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclix34wly1",
                                    name: "审核执行统计五给出样品明细",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclix34wly1",
                                    name: "审核执行统计五给出样品明细",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclix34wly1",
                                    name: "审核执行统计五给出样品明细",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclwketkev4",
                                    name: "执行确认样品来源",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclwketkev4",
                                    name: "执行确认样品来源",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclwketkev4",
                                    name: "执行确认样品来源",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclwketkev6",
                                    name: "执行联系样品到公司",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclwketkev6",
                                    name: "执行联系样品到公司",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclwketkev6",
                                    name: "执行联系样品到公司",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclwkf0tuy1",
                                    name: "开发联系样品",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclwkf0tuy1",
                                    name: "开发联系样品",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclwkf0tuy1",
                                    name: "开发联系样品",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
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
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclto83mms5",
                                    name: "组长审核方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclto83mms5",
                                    name: "组长审核方案",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclto83mms5",
                                    name: "组长审核方案",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvx64tg92",
                                    name: "组长审核方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvx64tg92",
                                    name: "组长审核方案",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvx64tg92",
                                    name: "组长审核方案",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclii6vcap2",
                                    name: "项目负责人审核方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclii6vcap2",
                                    name: "项目负责人审核方案",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclii6vcap2",
                                    name: "项目负责人审核方案",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltseng6r1",
                                    name: "执行运营确认样品到公司",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltseng6r1",
                                    name: "执行运营确认样品到公司",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocltseng6r1",
                                    name: "执行运营确认样品到公司",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclii6vcap3",
                                    name: "视觉方案审核",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclii6vcap3",
                                    name: "视觉方案审核",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclii6vcap3",
                                    name: "视觉方案审核",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "视觉方案审核",
                                    id: "node_oclii6vcap3"
                                }
                            },
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
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            },
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
                                    from: "form",
                                    name: "摄影负责人",
                                    id: "employeeField_lvkss8pc"
                                }
                            }
                        ]
                    },
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
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "视频"}
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
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["视频"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx1f3cl7k",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx1f3cl7k",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx1f3cl7k",
                                    name: "拍摄完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "拍摄完成",
                                    id: "node_oclx1f3cl7k"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {
                                fieldId: "radioField_ltjt0ykc",
                                opCode: opCodes.EqualAny,
                                value: ["视频"]
                            }
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
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "视频"}
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
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["视频"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx1f3cl7k",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclx1f3cl7k",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclx1f3cl7k",
                                    name: "拍摄完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "拍摄完成",
                                    id: "node_oclx1f3cl7k"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowDetailsRules: [
                            {
                                fieldId: "radioField_ltjt0ykc",
                                opCode: opCodes.EqualAny,
                                value: ["视频"]
                            }
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
                            {fieldId: "radioField_lv641k3b", opCode: opCodes.Equal, value: "视频"}
                        ],
                        flowNodeRules: [
                            {
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
                                    name: "确认美编任务",
                                    id: "node_oclvgenwmp6"
                                }
                            }]
                    },
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["视频"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx03jr071x",
                                    name: "确认视觉性质",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr071x",
                                    name: "确认视觉性质",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr071x",
                                    name: "确认视觉性质",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "确认视觉性质",
                                    id: "node_oclx03jr071x"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx1ixqtj2",
                                    name: "分配剪辑负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx1ixqtj2",
                                    name: "分配剪辑负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx1ixqtj2",
                                    name: "分配剪辑负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配剪辑负责人",
                                    id: "node_oclx1ixqtj2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx1ixqtj4",
                                    name: "分配剪辑负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx1ixqtj4",
                                    name: "分配剪辑负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx1ixqtj4",
                                    name: "分配剪辑负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配剪辑负责人",
                                    id: "node_oclx1ixqtj4"
                                }
                            }
                        ]
                    },
                    {
                        formName: "美编修图任务",
                        formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx41cnvt", opCode: opCodes.EqualAny, value: ["视频"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx42mxwc1",
                                    name: "分配剪辑负责人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx42mxwc1",
                                    name: "分配剪辑负责人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx42mxwc1",
                                    name: "分配剪辑负责人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配剪辑负责人",
                                    id: "node_oclx42mxwc1"
                                }
                            }
                        ]
                    },
                    {
                        formName: "外包修图视觉流程",
                        formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx48e5gm", opCode: opCodes.EqualAny, value: ["视频"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ockpz6phx73",
                                    name: "分配外包美编制作",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ockpz6phx73",
                                    name: "分配外包美编制作",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ockpz6phx73",
                                    name: "分配外包美编制作",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "分配外包美编制作",
                                    id: "node_ockpz6phx73"
                                }
                            }
                        ]
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
                            {fieldId: "radioField_lv641k3b", opCode: opCodes.Equal, value: "视频"}
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
                                    id: "node_oclvghx5li9",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvghx5li9",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvghx5li9",
                                    name: "审核美编任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclvghx5li9"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "视频"}
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
                            },
                            {
                                from: {
                                    id: "node_oclvkpzz4g4",
                                    name: "审核美编工作",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvkpzz4g4",
                                    name: "审核美编工作",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvkpzz4g4",
                                    name: "审核美编工作",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编工作",
                                    id: "node_oclvkpzz4g4"
                                }
                            },
                        ]
                    },
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["视频"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx1ixqtj5",
                                    name: "视频剪辑",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx1ixqtj5",
                                    name: "视频剪辑",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx1ixqtj5",
                                    name: "视频剪辑",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "剪辑负责人",
                                    id: "employeeField_lwyq3iff"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx1ixqtj3",
                                    name: "视频剪辑",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx1ixqtj3",
                                    name: "视频剪辑",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx1ixqtj3",
                                    name: "视频剪辑",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "剪辑负责人",
                                    id: "employeeField_lwyq3iff"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核图片",
                                    id: "node_oclx03jr074d"
                                }
                            }
                        ]
                    },
                    {
                        formName: "美编修图任务",
                        formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx41cnvt", opCode: opCodes.EqualAny, value: ["视频"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx5gvwwqh",
                                    name: "剪辑视频",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx5gvwwqh",
                                    name: "剪辑视频",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx5gvwwqh",
                                    name: "剪辑视频",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "剪辑视频",
                                    id: "node_oclx5gvwwqh"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审批人",
                                    id: "node_oclx422jq8o"
                                }
                            }
                        ]
                    },
                    {
                        formName: "外包修图视觉流程",
                        formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx48e5gm", opCode: opCodes.EqualAny, value: ["视频"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "外包修图中",
                                    id: "textField_lx48e5gk"
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
                            {fieldId: "radioField_lv641k3b", opCode: opCodes.Equal, value: "视频"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvghx5li9",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvghx5li9",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvghx5li9",
                                    name: "审核美编任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编任务",
                                    id: "node_oclvghx5li9"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营拍摄流程",
                        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                        flowDetailsRules: [
                            {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "视频"}
                        ],
                        flowNodeRules: [
                            // {
                            //     from: {
                            //         id: "node_oclrj9wznym",
                            //         name: "视频剪辑完成",
                            //         status: ["HISTORY"]
                            //     },
                            //     to: {
                            //         id: "node_oclrj9wznym",
                            //         name: "视频剪辑完成",
                            //         status: ["HISTORY"]
                            //     },
                            //     overdue: {
                            //         id: "node_oclrj9wznym",
                            //         name: "视频剪辑完成",
                            //         status: ["HISTORY"]
                            //     },
                            //     ownerRule: {
                            //         from: "process",
                            //         name: "视频剪辑完成",
                            //         id: "node_oclrj9wznym"
                            //     }
                            // },
                            {
                                from: {
                                    id: "node_oclvkpzz4g4",
                                    name: "审核美编工作",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvkpzz4g4",
                                    name: "审核美编工作",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvkpzz4g4",
                                    name: "审核美编工作",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核美编工作",
                                    id: "node_oclvkpzz4g4"
                                }
                            },
                        ]
                    },
                    {
                        formName: "运营视觉流程（拍摄+美编）",
                        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                        flowDetailsRules: [
                            {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["视频"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclx03jr074d",
                                    name: "审核图片",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核图片",
                                    id: "node_oclx03jr074d"
                                }
                            }
                        ]
                    },
                    {
                        formName: "美编修图任务",
                        formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx41cnvt", opCode: opCodes.EqualAny, value: ["视频"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclx422jq8o",
                                    name: "审批人",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审批人",
                                    id: "node_oclx422jq8o"
                                }
                            }
                        ]
                    },
                    {
                        formName: "外包修图视觉流程",
                        formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx48e5gm", opCode: opCodes.EqualAny, value: ["视频"]}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["HISTORYHISTORY"]
                                },
                                overdue: {
                                    id: "node_oclx48iwil1",
                                    name: "外包修图中",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "外包修图中",
                                    id: "textField_lx48e5gk"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
]

const executionCoreActionsConfig = [
    {
        actionName: "市场统计",
        actionCode: "marketStatistic",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: commonActionStatus.TODO,
                children: [],
                rules: [
                    {
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "市场分析统计"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["FORCAST"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm6",
                                    name: "审批人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["FORCAST"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_ocltzh0nbm7"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["FORCAST"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            }
                        ]
                    },
                    {
                        formName: "选品会流程",
                        formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclv1ugwu31",
                                    name: "运营负责人提交市场统计模板",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclix0mfzn1",
                                    name: "执行提交市场分析表",
                                    status: ["FORCAST"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_lii9qts2"
                                }
                            }]
                    },
                    {
                        formName: "宝可梦新品开发流程",
                        formId: "FORM-CC0B476071F24581B129A24835910B81AK56",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclv1xr53i4",
                                    name: "运营提交市场统计模板",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvkc9r0a2",
                                    name: "执行提交市场统计",
                                    status: ["FORCAST"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_oclvkc9r0a2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvkcjxy41",
                                    name: "分配执行营销分析方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvkcjxy42",
                                    name: "执行提交市场统计",
                                    status: ["FORCAST"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_oclvkcjxy42"
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
                                    id: "node_oclvt63juf2",
                                    name: "分配执行统计市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvt63juf3",
                                    name: "执行提交市场统计",
                                    status: ["FORCAST"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "分配执行统计市场",
                                    id: "employeeField_lvt5untf"
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
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "市场分析统计"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_ocltzh0nbm9"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_ocltzh0nbm7"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            }
                        ]
                    },
                    {
                        formName: "选品会流程",
                        formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclix0mfzn1",
                                    name: "执行提交市场分析表",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclix0mfzn1",
                                    name: "执行提交市场分析表",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclix0mfzn1",
                                    name: "执行提交市场分析表",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_lii9qts2"
                                }
                            },
                        ]
                    },
                    {
                        formName: "宝可梦新品开发流程",
                        formId: "FORM-CC0B476071F24581B129A24835910B81AK56",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvkc9r0a2",
                                    name: "执行提交市场统计",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvkc9r0a2",
                                    name: "执行提交市场统计",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvkc9r0a2",
                                    name: "执行提交市场统计",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_oclvkc9r0a2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvkcjxy42",
                                    name: "执行提交市场统计",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvkcjxy42",
                                    name: "执行提交市场统计",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvkcjxy42",
                                    name: "执行提交市场统计",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_oclvkcjxy42"
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
                                    id: "node_oclvt63juf3",
                                    name: "执行提交市场统计",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvt63juf3",
                                    name: "执行提交市场统计",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvt63juf3",
                                    name: "执行提交市场统计",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "分配执行统计市场",
                                    id: "employeeField_lvt5untf"
                                }
                            },
                        ]
                    }
                ]
            },
            {
                nameCN: "已做",
                nameEN: commonActionStatus.DONE,
                rules: [
                    {
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "市场分析统计"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_ocltzh0nbm9"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_ocltzh0nbm7"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            }
                        ]
                    },
                    {
                        formName: "选品会流程",
                        formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclix0mfzn1",
                                    name: "执行提交市场分析表",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclix0mfzn1",
                                    name: "执行提交市场分析表",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclix0mfzn1",
                                    name: "执行提交市场分析表",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_lii9qts2"
                                }
                            },
                        ]
                    },
                    {
                        formName: "宝可梦新品开发流程",
                        formId: "FORM-CC0B476071F24581B129A24835910B81AK56",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclvkc9r0a2",
                                    name: "执行提交市场统计",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvkc9r0a2",
                                    name: "执行提交市场统计",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvkc9r0a2",
                                    name: "执行提交市场统计",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_oclvkc9r0a2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclvkcjxy42",
                                    name: "执行提交市场统计",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvkcjxy42",
                                    name: "执行提交市场统计",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvkcjxy42",
                                    name: "执行提交市场统计",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_oclvkcjxy42"
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
                                    id: "node_oclvt63juf3",
                                    name: "执行提交市场统计",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvt63juf3",
                                    name: "执行提交市场统计",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvt63juf3",
                                    name: "执行提交市场统计",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "分配执行统计市场",
                                    id: "employeeField_lvt5untf"
                                }
                            },
                        ]
                    }
                ]
            },
        ]
    },
    {
        actionName: "五维统计",
        actionCode: "fiveDimensionalTableStatistic",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: commonActionStatus.TODO,
                children: [],
                rules: [
                    {
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "五维表统计"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["FORCAST"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm6",
                                    name: "审批人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["FORCAST"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_ocltzh0nbm7"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["FORCAST"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclohx0w4s1",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclix0goa91",
                                    name: "统计五维表",
                                    status: ["FORCAST"]
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
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclm91902f1",
                                    name: "执行统计五维表",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclv6afgcd1",
                                    name: "执行人",
                                    status: ["FORCAST"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "执行运营",
                                    id: "employeeField_lm91md3u"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "在做",
                nameEN: commonActionStatus.DOING,
                children: [],
                rules: [
                    {
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "五维表统计"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_ocltzh0nbm9"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_ocltzh0nbm7"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclix0goa91",
                                    name: "统计五维表",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclix0goa91",
                                    name: "统计五维表",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclix0goa91",
                                    name: "统计五维表",
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
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclv6afgcd1",
                                    name: "执行人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclv6afgcd1",
                                    name: "执行人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclv6afgcd1",
                                    name: "执行人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "执行运营",
                                    id: "employeeField_lm91md3u"
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
                                    id: "node_oclvt7r3d87",
                                    name: "执行提交五维表",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvt7r3d87",
                                    name: "执行提交五维表",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_oclvt7r3d87",
                                    name: "执行提交五维表",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "分配执行统计五维",
                                    id: "employeeField_lvt5unth"
                                }
                            }
                        ]
                    }
                ]
            },

            {
                nameCN: "已做",
                nameEN: commonActionStatus.DONE,
                children: [],
                rules: [
                    {
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "五维表统计"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_ocltzh0nbm9"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_ocltzh0nbm7"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            }
                        ]
                    },
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclix0goa91",
                                    name: "统计五维表",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclix0goa91",
                                    name: "统计五维表",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclix0goa91",
                                    name: "统计五维表",
                                    status: ["HISTORY"]
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
                        formName: "天猫链接上架流程",
                        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclv6afgcd1",
                                    name: "执行人",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclv6afgcd1",
                                    name: "执行人",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclv6afgcd1",
                                    name: "执行人",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "执行运营",
                                    id: "employeeField_lm91md3u"
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
                                    id: "node_oclvt7r3d87",
                                    name: "执行提交五维表",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvt7r3d87",
                                    name: "执行提交五维表",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_oclvt7r3d87",
                                    name: "执行提交五维表",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "分配执行统计五维",
                                    id: "employeeField_lvt5unth"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        actionName: "链接上架",
        actionCode: "linkPutAway",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: commonActionStatus.TODO,
                children: [],
                rules: [
                    {
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "链接上架"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["FORCAST"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm6",
                                    name: "审批人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["FORCAST"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_ocltzh0nbm7"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["FORCAST"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "在做",
                nameEN: commonActionStatus.DOING,
                children: [],
                rules: [
                    {
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "链接上架"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_ocltzh0nbm9"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_ocltzh0nbm7"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "已做",
                nameEN: commonActionStatus.DONE,
                children: [],
                rules: [
                    {
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "链接上架"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_ocltzh0nbm9"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_ocltzh0nbm7"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }, {
        actionName: "补单",
        actionCode: "replacementOrder",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: commonActionStatus.TODO,
                children: [],
                rules: [
                    {
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "补单"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["FORCAST"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm6",
                                    name: "审批人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["FORCAST"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_ocltzh0nbm7"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["FORCAST"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "在做",
                nameEN: commonActionStatus.DOING,
                children: [],
                rules: [
                    {
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "补单"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_ocltzh0nbm9"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_ocltzh0nbm7"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["TODO"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "已做",
                nameEN: commonActionStatus.DONE,
                children: [],
                rules: [
                    {
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "补单"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm9",
                                    name: "分配执行人",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_ocltzh0nbm9"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbma",
                                    name: "执行完成任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm7",
                                    name: "分配执行发布",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_ocltzh0nbm7"
                                }
                            },
                            {
                                from: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["HISTORY"]
                                },
                                overdue: {
                                    id: "node_ocltzh0nbm8",
                                    name: "发布完成",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营执行人",
                                    id: "employeeField_liigx7wd"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
]

module.exports = {
    "903075138": tmCoreActionsConfig,
    "482162119": mbCoreActionsConfig,
    "902515853": executionCoreActionsConfig
}