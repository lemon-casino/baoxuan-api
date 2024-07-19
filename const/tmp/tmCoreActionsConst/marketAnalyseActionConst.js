const {opCodes} = require("@/const/ruleConst/operatorConst");
const commonActionStatus = {TODO: "TODO", DOING: "DOING", DONE: "DONE"}

module.exports = [
    {
        actionName: "市场分析(正推)",
        actionCode: "positiveMarketAnalysis",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: commonActionStatus.TODO,
                rules: [
                    {
                        formName: "运营市场统计流程",
                        formId: "FORM-8F47FCEF33E94B66B461B819B4C0A5DFIBTV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lyiibaze", opCode: opCodes.Equal, value: "正推产品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: " node_oclvesclp04",
                                    name: "执行统计正推市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: " node_oclvesclp04",
                                    name: "执行统计正推市场",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "发起人",
                                    id: "sid-restartevent"
                                }
                            }]
                    },
                    {
                        formName: "选品会",
                        formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclklxv8kk1",
                                    name: "运营负责人提交市场统计模板",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclklxv8kk1",
                                    name: "运营负责人提交市场统计模板",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "天猫运营负责人",
                                    id: "employeeField_lii9qts2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclix0mfzn1",
                                    name: "执行提交市场统计表",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclix0mfzn1",
                                    name: "执行提交市场统计表",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "天猫运营负责人",
                                    id: "employeeField_lii9qts2"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclyilqx4v1",
                                    name: "执行统计市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyilqx4v1",
                                    name: "执行统计市场",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "天猫运营负责人",
                                    id: "employeeField_lii9qts2"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "进行中",
                nameEN: commonActionStatus.DOING,
                rules: [
                    {
                        formName: "运营市场统计流程",
                        formId: "FORM-8F47FCEF33E94B66B461B819B4C0A5DFIBTV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lyiibaze", opCode: opCodes.Equal, value: "正推产品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: " node_oclyil049v7",
                                    name: "运营分析正推产品市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: " node_oclyil049v7",
                                    name: "运营分析正推产品市场",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营分析正推产品市场",
                                    id: "node_oclyil049v7"
                                }
                            },
                            {
                                from: {
                                    id: " node_oclyil049v9",
                                    name: "运营完成市场分析",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: " node_oclyil049v9",
                                    name: "运营完成市场分析",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营完成市场分析",
                                    id: "node_oclyil049v9"
                                }
                            }
                        ]
                    },
                    {
                        formName: "选品会",
                        formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclyilqx4v2",
                                    name: "运营分析正推产品市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyilqx4v2",
                                    name: "运营分析正推产品市场",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营分析正推产品市场",
                                    id: "node_oclyilqx4v2"
                                }
                            },
                            {
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
                                ownerRule: {
                                    from: "process",
                                    name: "运营提交市场分析方案",
                                    id: "node_ocliieab3b1"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "已完成",
                nameEN: commonActionStatus.DONE,
                rules: [
                    {
                        formName: "运营市场统计流程",
                        formId: "FORM-8F47FCEF33E94B66B461B819B4C0A5DFIBTV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lyiibaze", opCode: opCodes.Equal, value: "正推产品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: " node_oclyil049v7",
                                    name: "运营分析正推产品市场",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: " node_oclyil049v7",
                                    name: "运营分析正推产品市场",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营分析正推产品市场",
                                    id: "node_oclyil049v7"
                                }
                            },
                            {
                                from: {
                                    id: " node_oclyil049v9",
                                    name: "运营完成市场分析",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: " node_oclyil049v9",
                                    name: "运营完成市场分析",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营完成市场分析",
                                    id: "node_oclyil049v9"
                                }
                            }
                        ]
                    },
                    {
                        formName: "选品会",
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
                                ownerRule: {
                                    from: "process",
                                    name: "运营提交市场分析方案",
                                    id: "node_ocliieab3b1"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        actionName: "市场分析(反推)",
        actionCode: "negativeMarketAnalysis",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: commonActionStatus.TODO,
                rules: [
                    {
                        formName: "运营市场统计流程",
                        formId: "FORM-8F47FCEF33E94B66B461B819B4C0A5DFIBTV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lyiibaze", opCode: opCodes.Equal, value: "反推产品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclyilaomm2",
                                    name: "执行统计反推市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyilaomm2",
                                    name: "执行统计反推市场",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "发起人",
                                    id: "sid-restartevent"
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
                                    id: "node_oclvt63juf1",
                                    name: "运营提交市场统计模板",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvt63juf1",
                                    name: "运营提交市场统计模板",
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
                                    id: "node_oclvt63juf2",
                                    name: "分配执行统计市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvt63juf2",
                                    name: "分配执行统计市场",
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
                                    id: "node_oclvt63juf3",
                                    name: "执行提交市场统计",
                                    status: ["TODO"]
                                },
                                to: {
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
                                    id: "node_oclvesclp06",
                                    name: "审核市场分析",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvesclp06",
                                    name: "审核市场分析",
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
                                    id: "node_oclvt7r3d81",
                                    name: "是否需要做五维",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvt7r3d81",
                                    name: "是否需要做五维",
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
                                    id: "node_oclvt7r3d86",
                                    name: "运营提交竞品id",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvt7r3d86",
                                    name: "运营提交竞品id",
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
                                    id: "node_oclvt7r3d85",
                                    name: "分配执行统计五维",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvt7r3d85",
                                    name: "分配执行统计五维",
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
                                    id: "node_oclvt7r3d87",
                                    name: "执行提交五维表",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvt7r3d87",
                                    name: "执行提交五维表",
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
                                    id: "node_oclvt900fv1",
                                    name: "审核五维分析",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvt900fv1",
                                    name: "审核五维分析",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "分配运营",
                                    id: "employeeField_lvesa8t3"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "进行中",
                nameEN: commonActionStatus.DOING,
                rules: [
                    {
                        formName: "运营市场统计流程",
                        formId: "FORM-8F47FCEF33E94B66B461B819B4C0A5DFIBTV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lyiibaze", opCode: opCodes.Equal, value: "反推产品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclyilaomm3",
                                    name: "运营分析反推产品市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyilaomm3",
                                    name: "运营分析反推产品市场",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营分析反推产品市场",
                                    id: "node_oclyilaomm3"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclyil049v9",
                                    name: "运营完成市场分析",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyil049v9",
                                    name: "运营完成市场分析",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营完成市场分析",
                                    id: "node_oclyil049v9"
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
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvesclp04",
                                    name: "运营提交市场分析",
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
                                    id: "node_oclvt7r3d88",
                                    name: "运营提交五维分析",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvt7r3d88",
                                    name: "运营提交五维分析",
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
                                    id: "node_oclvesclp07",
                                    name: "运营提交反选信息",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvesclp07",
                                    name: "运营提交反选信息",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "分配运营",
                                    id: "employeeField_lvesa8t3"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "已完成",
                nameEN: commonActionStatus.DONE,
                rules: [
                    {
                        formName: "运营市场统计流程",
                        formId: "FORM-8F47FCEF33E94B66B461B819B4C0A5DFIBTV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lyiibaze", opCode: opCodes.Equal, value: "反推产品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclyilaomm3",
                                    name: "运营分析反推产品市场",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclyilaomm3",
                                    name: "运营分析反推产品市场",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营分析反推产品市场",
                                    id: "node_oclyilaomm3"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclyil049v9",
                                    name: "运营完成市场分析",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclyil049v9",
                                    name: "运营完成市场分析",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营完成市场分析",
                                    id: "node_oclyil049v9"
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
                                    id: "node_oclvesclp07",
                                    name: "运营提交反选信息",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclvesclp07",
                                    name: "运营提交反选信息",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "分配运营",
                                    id: "employeeField_lvesa8t3"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        actionName: "市场分析(老品分析)",
        actionCode: "historyProductMarketAnalysis",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: commonActionStatus.TODO,
                rules: [
                    {
                        formName: "运营市场统计流程",
                        formId: "FORM-8F47FCEF33E94B66B461B819B4C0A5DFIBTV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lyiibaze", opCode: opCodes.Equal, value: "老品分析"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclyilaomm5",
                                    name: "执行统计老品重上市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyilaomm5",
                                    name: "执行统计老品重上市场",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "发起人",
                                    id: "sid-restartevent"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "进行中",
                nameEN: commonActionStatus.DOING,
                rules: [
                    {
                        formName: "运营市场统计流程",
                        formId: "FORM-8F47FCEF33E94B66B461B819B4C0A5DFIBTV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lyiibaze", opCode: opCodes.Equal, value: "老品分析"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclyilaomm6",
                                    name: "运营分析老品重上市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyilaomm6",
                                    name: "运营分析老品重上市场",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营分析老品重上市场",
                                    id: "node_oclyilaomm6"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclyil049v9",
                                    name: "运营完成市场分析",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyil049v9",
                                    name: "运营完成市场分析",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营完成市场分析",
                                    id: "node_oclyil049v9"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "已完成",
                nameEN: commonActionStatus.DONE,
                rules: [
                    {
                        formName: "运营市场统计流程",
                        formId: "FORM-8F47FCEF33E94B66B461B819B4C0A5DFIBTV",
                        flowDetailsRules: [
                            {fieldId: "radioField_lyiibaze", opCode: opCodes.Equal, value: "老品分析"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclyilaomm6",
                                    name: "运营分析老品重上市场",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclyilaomm6",
                                    name: "运营分析老品重上市场",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营分析老品重上市场",
                                    id: "node_oclyilaomm6"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclyil049v9",
                                    name: "运营完成市场分析",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclyil049v9",
                                    name: "运营完成市场分析",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营完成市场分析",
                                    id: "node_oclyil049v9"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
]