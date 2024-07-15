const {opCodes} = require("@/const/operatorConst");
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
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "市场统计"},
                            {fieldId: "radioField_lyij2hvn", opCode: opCodes.Equal, value: "正推产品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclyijfith7",
                                    name: "执行统计正推市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclvkc9r0a3",
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
                        flowDetailsRules: [
                            {fieldId: "radioField_lruf2zuu", opCode: opCodes.Equal, value: "正推产品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: " node_oclyilqx4v1",
                                    name: "执行统计正推市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: " node_oclyilqx4v1",
                                    name: "执行统计正推市场",
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
                nameCN: "在做",
                nameEN: commonActionStatus.DOING,
                rules: [
                    {
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "市场统计"},
                            {fieldId: "radioField_lyij2hvn", opCode: opCodes.Equal, value: "正推产品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclyij4qvn3",
                                    name: "运营分析正推产品市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyij4qvn3",
                                    name: "运营分析正推产品市场",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营分析正推产品市场",
                                    id: "node_oclyij4qvn3"
                                }
                            }
                        ]
                    },
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
                            }
                        ]
                    },
                    {
                        formName: "选品会",
                        formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
                        flowDetailsRules: [
                            {fieldId: "radioField_lruf2zuu", opCode: opCodes.Equal, value: "正推产品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: " node_oclyilqx4v2",
                                    name: "运营分析正推产品市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: " node_oclyilqx4v2",
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
                                    id: " node_ocliieab3b1",
                                    name: "运营提交市场分析方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: " node_ocliieab3b1",
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
                nameCN: "已做",
                nameEN: commonActionStatus.DONE,
                rules: [
                    {
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "市场统计"},
                            {fieldId: "radioField_lyij2hvn", opCode: opCodes.Equal, value: "正推产品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclyij4qvn3",
                                    name: "运营分析正推产品市场",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclyij4qvn3",
                                    name: "运营分析正推产品市场",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营分析正推产品市场",
                                    id: "node_oclyij4qvn3"
                                }
                            }
                        ]
                    },
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
                            }
                        ]
                    },
                    {
                        formName: "选品会",
                        formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
                        flowDetailsRules: [
                            {fieldId: "radioField_lruf2zuu", opCode: opCodes.Equal, value: "正推产品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: " node_ocliieab3b1",
                                    name: "运营提交市场分析方案",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: " node_ocliieab3b1",
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
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "市场统计"},
                            {fieldId: "radioField_lyij2hvn", opCode: opCodes.Equal, value: "反推产品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclyijfithc",
                                    name: "执行统计反推市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyijfithc",
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
                        formName: "选品会",
                        formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
                        flowDetailsRules: [
                            {fieldId: "radioField_lruf2zuu", opCode: opCodes.Equal, value: "反推产品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: " node_oclyilqx4v4",
                                    name: "执行统计反推市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: " node_oclyilqx4v4",
                                    name: "执行统计反推市场",
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
                nameCN: "在做",
                nameEN: commonActionStatus.DOING,
                rules: [
                    {
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "市场统计"},
                            {fieldId: "radioField_lyij2hvn", opCode: opCodes.Equal, value: "反推产品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclyijfithd",
                                    name: "运营分析反推产品市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyijfithd",
                                    name: "运营分析反推产品市场",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营分析反推产品市场",
                                    id: "node_oclyijfithd"
                                }
                            }
                        ]
                    },
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
                            }
                        ]
                    },
                    {
                        formName: "选品会",
                        formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
                        flowDetailsRules: [
                            {fieldId: "radioField_lruf2zuu", opCode: opCodes.Equal, value: "反推产品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: " node_oclyilqx4v5",
                                    name: "运营分析反推产品市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: " node_oclyilqx4v5",
                                    name: "运营分析反推产品市场",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营分析反推产品市场",
                                    id: "node_oclyilqx4v5"
                                }
                            },
                            {
                                from: {
                                    id: " node_ocliieab3b1",
                                    name: "运营提交市场分析方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: " node_ocliieab3b1",
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
                nameCN: "已做",
                nameEN: commonActionStatus.DONE,
                rules: [
                    {
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "市场统计"},
                            {fieldId: "radioField_lyij2hvn", opCode: opCodes.Equal, value: "正推产品"}
                        ],
                        flowNodeRules: [
                            {
                                formName: "运营执行流程",
                                formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                                flowDetailsRules: [
                                    {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "市场统计"},
                                    {fieldId: "radioField_lyij2hvn", opCode: opCodes.Equal, value: "反推产品"}
                                ],
                                flowNodeRules: [
                                    {
                                        from: {
                                            id: "node_oclyijfithd",
                                            name: "运营分析反推产品市场",
                                            status: ["HISTORY"]
                                        },
                                        to: {
                                            id: "node_oclyijfithd",
                                            name: "运营分析反推产品市场",
                                            status: ["HISTORY"]
                                        },
                                        ownerRule: {
                                            from: "process",
                                            name: "运营分析反推产品市场",
                                            id: "node_oclyijfithd"
                                        }
                                    }
                                ]
                            }
                        ]
                    },
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
                            }
                        ]
                    },
                    {
                        formName: "选品会",
                        formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
                        flowDetailsRules: [
                            {fieldId: "radioField_lruf2zuu", opCode: opCodes.Equal, value: "反推产品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: " node_ocliieab3b1",
                                    name: "运营提交市场分析方案",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: " node_ocliieab3b1",
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
        actionName: "市场分析(老品分析)",
        actionCode: "historyProductMarketAnalysis",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: commonActionStatus.TODO,
                rules: [
                    {
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "市场统计"},
                            {fieldId: "radioField_lyij2hvn", opCode: opCodes.Equal, value: "老品分析"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclyijfith9",
                                    name: "执行统计老品分析市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyijfith9",
                                    name: "执行统计老品分析市场",
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
                    },
                    {
                        formName: "选品会",
                        formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
                        flowDetailsRules: [
                            {fieldId: "radioField_lruf2zuu", opCode: opCodes.Equal, value: "老品分析"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: " node_oclyilqx4v7",
                                    name: "执行统计老品重上市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: " node_oclyilqx4v7",
                                    name: "执行统计老品重上市场",
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
                nameCN: "在做",
                nameEN: commonActionStatus.DOING,
                rules: [
                    {
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "市场统计"},
                            {fieldId: "radioField_lyij2hvn", opCode: opCodes.Equal, value: "老品分析"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclyijfitha",
                                    name: "运营分析老品重上市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyijfitha",
                                    name: "运营分析老品重上市场",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营分析老品重上市场",
                                    id: "node_oclyijfitha"
                                }
                            }
                        ]
                    },
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
                            }
                        ]
                    },
                    {
                        formName: "选品会",
                        formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
                        flowDetailsRules: [
                            {fieldId: "radioField_lruf2zuu", opCode: opCodes.Equal, value: "老品分析"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: " node_oclyilqx4v8",
                                    name: "运营分析老品重上市场",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: " node_oclyilqx4v8",
                                    name: "运营分析老品重上市场",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营分析老品重上市场",
                                    id: "node_oclyilqx4v8"
                                }
                            },
                            {
                                from: {
                                    id: " node_ocliieab3b1",
                                    name: "运营提交市场分析方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: " node_ocliieab3b1",
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
                nameCN: "已做",
                nameEN: commonActionStatus.DONE,
                rules: [
                    {
                        formName: "运营执行流程",
                        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
                        flowDetailsRules: [
                            {fieldId: "selectField_liigx7wc", opCode: opCodes.Equal, value: "市场统计"},
                            {fieldId: "radioField_lyij2hvn", opCode: opCodes.Equal, value: "老品分析"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclyijfitha",
                                    name: "运营分析老品重上市场",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclyijfitha",
                                    name: "运营分析老品重上市场",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营分析老品重上市场",
                                    id: "node_oclyijfitha"
                                }
                            }
                        ]
                    },
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
                            }
                        ]
                    },
                    {
                        formName: "选品会",
                        formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
                        flowDetailsRules: [
                            {fieldId: "radioField_lruf2zuu", opCode: opCodes.Equal, value: "老品分析"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: " node_ocliieab3b1",
                                    name: "运营提交市场分析方案",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: " node_ocliieab3b1",
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
    }
]