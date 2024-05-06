const actionStatus = {TODO: "TODO", DOING: "DOING", DONE: "DONE"}

const tmCoreActionsConfig = [
    {
        actionName: "爆款方案",
        actionCode: "hotSchema",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: actionStatus.TODO,
                rules: [
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        countNodePairs: [{
                            from: {
                                id: "node_oclkvznwuu1",
                                name: "提交竞店ID",
                                status: ["TODO", "HISTORY"]
                            },
                            to: {
                                id: "node_oclix34wly1",
                                name: "审核执行统计五维表",
                                status: ["TODO", "FORECAST"]
                            },
                            overdue: {
                                id: "node_oclix34wly1",
                                name: "审核执行统计五维表",
                                status: ["TODO", "HISTORY"]
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
                        countNodePairs: [{
                            from: {
                                id: "node_oclvkcjxy41",
                                name: "分配执行营销分析方案",
                                status: ["TODO", "HISTORY"]
                            },
                            to: {
                                id: "node_oclvkcjxy42",
                                name: "执行提交市场分析方案",
                                status: ["TODO", "FORECAST"]
                            },
                            overdue: {
                                id: "node_oclvkcjxy41",
                                name: "分配执行营销分析方案",
                                status: ["TODO", "HISTORY"]
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
                        countNodePairs: [
                            {
                                from: {
                                    id: "node_ockpz6phx72",
                                    name: "发起",
                                    status: ["TODO", "HISTORY"]
                                },
                                to: {
                                    id: "node_oclm91902f2",
                                    name: "审核执行动作完成",
                                    status: ["TODO", 'FORECAST']
                                },
                                overdue: {
                                    id: "node_oclm91902f2",
                                    name: "审核执行动作完成",
                                    status: ["TODO", "HISTORY"]
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
                nameEN: actionStatus.DOING,
                rules: [
                    {
                        formName: "运营新品流程",
                        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                        countNodePairs: [{
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
                        countNodePairs: [
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
                                overdue:{
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
                        countNodePairs: [{
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
                nameEN: actionStatus.DONE,
                rules: [{
                    formName: "运营新品流程",
                    formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                    countNodePairs: [{
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
                        countNodePairs: [
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
                        countNodePairs: [
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
                nameEN: actionStatus.TODO,
                rules: [
                    {
                        formName: "宝可梦新品开发流程",
                        formId: "FORM-CC0B476071F24581B129A24835910B81AK56",
                        countNodePairs: [{
                            from: {
                                id: "node_oclv1xr53i4",
                                name: "分配执行市场分析方案",
                                status: ["TODO", "HISTORY"]
                            },
                            to: {
                                id: "node_oclvkc9r0a3",
                                name: "审核执行市场分析方案",
                                status: ["TODO", "FORECAST"]
                            },
                            overdue: {
                                id: "node_oclvkc9r0a3",
                                name: "审核执行市场分析方案",
                                status: ["TODO", "HISTORY"]
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
                        countNodePairs: [
                            {
                                from: {
                                    id: "node_ockpz6phx72",
                                    name: "发起",
                                    status: ["TODO", "HISTORY"]
                                },
                                to: {
                                    id: "node_oclvesclp04",
                                    name: "运营提交市场分析",
                                    status: ["TODO", 'FORECAST']
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
                                    id: "node_oclvesclp09",
                                    name: "运营提交市场分析",
                                    status: ["TODO", 'FORECAST']
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
                                    status: ["TODO", 'FORECAST']
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
                        countNodePairs: [{
                            from: {
                                id: "node_oclklxv8kk1",
                                name: "运营负责人提交市场统计模板",
                                status: ["TODO", "HISTORY"]
                            },
                            to: {
                                id: "node_oclix0mfzn1",
                                name: "执行提交市场分析表",
                                status: ["TODO", "HISTORY"]
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
                nameEN: actionStatus.DOING,
                rules: [{
                    formName: "宝可梦新品开发流程",
                    formId: "FORM-CC0B476071F24581B129A24835910B81AK56",
                    countNodePairs: [{
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
                        countNodePairs: [
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
                                    status: ["TODO", "HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    id: "node_ockpz6phx72",
                                    name: "发起人"
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
                                    status: ["TODO", "HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    id: "node_ockpz6phx72",
                                    name: "发起人"
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
                                    status: ["TODO", "HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    id: "node_ockpz6phx72",
                                    name: "发起人"
                                }
                            }
                        ]
                    },
                    {
                        formName: "采购选品会",
                        formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
                        countNodePairs: [{
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
                nameCN: "已做",
                nameEN: actionStatus.DONE,
                rules: [{
                    formName: "宝可梦新品开发流程",
                    formId: "FORM-CC0B476071F24581B129A24835910B81AK56",
                    countNodePairs: [
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
                                status: ["TODO", "HISTORY"]
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
                        countNodePairs: [
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
                                    status: ["TODO", "HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    id: "node_ockpz6phx72"
                                }
                            }
                        ]
                    },
                    {
                        formName: "采购选品会",
                        formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
                        countNodePairs: [
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
                                    status: ["TODO", "HISTORY"]
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
                nameEN: actionStatus.TODO,
                rules: [
                    {
                        formName: "天猫链接打仗审核流程",
                        formId: "FORM-495A1584CBE84928BB3B1E0D4AA4B56AYN1J",
                        countNodePairs: [
                            {
                                from: {
                                    id: "node_ockpz6phx72",
                                    name: "发起",
                                    status: ["TODO", "HISTORY"]
                                },
                                to: {
                                    id: "node_oclqhp9c102",
                                    name: "执行BI系统打标签",
                                    status: ["TODO", "FORECAST"]
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
                nameEN: actionStatus.DOING,
                rules: [{
                    formName: "天猫链接打仗审核流程",
                    formId: "FORM-495A1584CBE84928BB3B1E0D4AA4B56AYN1J",
                    countNodePairs: [{
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
                            status: ["TODO", "HISTORY"]
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
                        countNodePairs: [{
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
                                status: ["TODO", "HISTORY"]
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
                nameEN: actionStatus.DONE,
                rules: [{
                    formName: "天猫链接打仗审核流程",
                    formId: "FORM-495A1584CBE84928BB3B1E0D4AA4B56AYN1J",
                    countNodePairs: [{
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
                            status: ["TODO", "HISTORY"]
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
                        countNodePairs: [
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
                                    status: ["TODO", "HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
                                }
                            }
                        ]
                    }]
            }
        ]
    }
]

module.exports = tmCoreActionsConfig