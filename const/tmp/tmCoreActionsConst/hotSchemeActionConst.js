const commonActionStatus = {TODO: "TODO", DOING: "DOING", DONE: "DONE"}

module.exports = [
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
    }
]