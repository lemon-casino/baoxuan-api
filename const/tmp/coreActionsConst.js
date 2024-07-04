const {opCodes} = require("@/const/operatorConst")
const commonActionStatus = {TODO: "TODO", DOING: "DOING", DONE: "DONE"}

const quanTaoActionConst = require("@/const/tmp/visionCoreActionConst/quanTaoActionConst")
const banTaoActionConst = require("@/const/tmp/visionCoreActionConst/banTaoActionConst")
const sanTuActionConst = require("@/const/tmp/visionCoreActionConst/sanTuActionConst")
const videoActionConst = require("@/const/tmp/visionCoreActionConst/videoActionConst")

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

// rules：或的关系   flowDetailsRules：且的关系  flowNodeRules：或的关系
const mbCoreActionsConfig = [
    quanTaoActionConst,
    banTaoActionConst,
    sanTuActionConst,
    videoActionConst
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

const visionFormDoneActivityIds = [
    {
        formName: "运营新品流程",
        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
        doneActivityIds: ["node_ockpz6phx73"]
    },
    {
        formName: "运营拍摄流程",
        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
        doneActivityIds: ["node_oclvkpzz4g1", "node_oclvkqswtb4", "node_oclvkpzz4g3", "node_oclvkqswtbc", "node_oclvkpzz4g4"]
    },
    {
        formName: "天猫链接上架流程",
        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
        doneActivityIds: ["node_oclm91ca7l9"]
    },
    {
        formName: "运营视觉流程（拍摄+美编）",
        formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
        doneActivityIds: ["node_oclx03jr074d"]
    },
    {
        formName: "美编修图任务",
        formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
        doneActivityIds: ["node_oclx422jq8o"]
    },
    {
        formName: "美编任务运营发布",
        formId: "FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS",
        doneActivityIds: ["node_oclvghx5li1", "node_oclvt49cil4", "node_oclw7dfsbp4", "node_oclvghx5li7", "node_oclvghx5li8", "node_oclw7dfsbp7", "node_oclvghx5li9", "node_oclvghx5lia", "node_oclwhrd6j63"]
    },
    {
        formName: "外包拍摄视觉流程",
        formId: "FORM-30500E23B9C44712A5EBBC5622D3D1C4TL18",
        doneActivityIds: ["node_oclx49xlb32"]
    },
    {
        formName: "外包修图视觉流程",
        formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
        doneActivityIds: ["node_oclx48iwil1"]
    }
]

module.exports = {
    "903075138": tmCoreActionsConfig,
    "482162119": mbCoreActionsConfig,
    "902515853": executionCoreActionsConfig,
    visionFormDoneActivityIds
}