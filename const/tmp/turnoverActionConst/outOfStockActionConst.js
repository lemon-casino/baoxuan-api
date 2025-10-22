const {opCodes} = require("@/const/ruleConst/operatorConst");
// 发起采购断货
module.exports = [
    {
        actionName: "断货-等待到货",
        actionCode: "outOfStock",
        actionStatus: [
            {
                nameCN: "进行中",
                rules: [
                    {
                        formName: "采购断货",
                        formId: "FORM-F8666NB1JO8BPCAW7KNFD7TMJWMJ29APAQIILQ",
                        flowDetailsRules: [
                            {fieldId: "selectField_lijkikzq", opCode: opCodes.Equal, value: "等待到货"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclimwrh9c1",
                                    name: "发起任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclimwrh9c1",
                                    name: "发起任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "发起任务",
                                    id: "node_oclimwrh9c1",
                                }
                            }
                        ]
                    },
                    {
                        formName: "京东仓断货流程",
                        formId: "FORM-F4D138FF47C84A8D984D2B991E958C0DT80I",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclswsx8881",
                                    name: "周转填写原因与到货日期",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclswsx8881",
                                    name: "周转填写原因与到货日期",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "周转填写原因与到货日期",
                                    id: "node_oclswsx8881",
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "已完成",
                rules: [
                    {
                        formName: "采购断货",
                        formId: "FORM-F8666NB1JO8BPCAW7KNFD7TMJWMJ29APAQIILQ",
                        flowDetailsRules: [
                            {fieldId: "selectField_lijkikzq", opCode: opCodes.Equal, value: "等待到货"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclimwrh9c1",
                                    name: "发起任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclimwrh9c1",
                                    name: "发起任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "发起任务",
                                    id: "node_oclimwrh9c1",
                                }
                            }
                        ]
                    },
                    {
                        formName: "京东仓断货流程",
                        formId: "FORM-F4D138FF47C84A8D984D2B991E958C0DT80I",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclswsx8881",
                                    name: "周转填写原因与到货日期",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclswsx8881",
                                    name: "周转填写原因与到货日期",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "周转填写原因与到货日期",
                                    id: "node_oclswsx8881",
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        actionName: "断货-拆单发出",
        actionCode: "outOfStock",
        actionStatus: [
            {
                nameCN: "进行中",
                rules: [
                    {
                        formName: "采购断货",
                        formId: "FORM-F8666NB1JO8BPCAW7KNFD7TMJWMJ29APAQIILQ",
                        flowDetailsRules: [
                            {fieldId: "selectField_lijkikzq", opCode: opCodes.Equal, value: "拆单发出"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclimwrh9c1",
                                    name: "发起任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclimwrh9c1",
                                    name: "发起任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "发起任务",
                                    id: "node_oclimwrh9c1",
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "已完成",
                rules: [
                    {
                        formName: "采购断货",
                        formId: "FORM-F8666NB1JO8BPCAW7KNFD7TMJWMJ29APAQIILQ",
                        flowDetailsRules: [
                            {fieldId: "selectField_lijkikzq", opCode: opCodes.Equal, value: "拆单发出"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclimwrh9c1",
                                    name: "发起任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclimwrh9c1",
                                    name: "发起任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "发起任务",
                                    id: "node_oclimwrh9c1",
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        actionName: "断货-预售",
        actionCode: "outOfStock",
        actionStatus: [
            {
                nameCN: "进行中",
                rules: [
                    {
                        formName: "采购断货",
                        formId: "FORM-F8666NB1JO8BPCAW7KNFD7TMJWMJ29APAQIILQ",
                        flowDetailsRules: [
                            {fieldId: "selectField_lijkikzq", opCode: opCodes.Equal, value: "预售"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclimwrh9c1",
                                    name: "发起任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclimwrh9c1",
                                    name: "发起任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "发起任务",
                                    id: "node_oclimwrh9c1",
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "已完成",
                rules: [
                    {
                        formName: "采购断货",
                        formId: "FORM-F8666NB1JO8BPCAW7KNFD7TMJWMJ29APAQIILQ",
                        flowDetailsRules: [
                            {fieldId: "selectField_lijkikzq", opCode: opCodes.Equal, value: "预售"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclimwrh9c1",
                                    name: "发起任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclimwrh9c1",
                                    name: "发起任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "发起任务",
                                    id: "node_oclimwrh9c1",
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        actionName: "断货-销完下架",
        actionCode: "outOfStock",
        actionStatus: [
            {
                nameCN: "进行中",
                rules: [
                    {
                        formName: "采购断货",
                        formId: "FORM-F8666NB1JO8BPCAW7KNFD7TMJWMJ29APAQIILQ",
                        flowDetailsRules: [
                            {fieldId: "selectField_lijkikzq", opCode: opCodes.Equal, value: "销完下架"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclimwrh9c1",
                                    name: "发起任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclimwrh9c1",
                                    name: "发起任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "发起任务",
                                    id: "node_oclimwrh9c1",
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "已完成",
                rules: [
                    {
                        formName: "采购断货",
                        formId: "FORM-F8666NB1JO8BPCAW7KNFD7TMJWMJ29APAQIILQ",
                        flowDetailsRules: [
                            {fieldId: "selectField_lijkikzq", opCode: opCodes.Equal, value: "销完下架"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclimwrh9c1",
                                    name: "发起任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclimwrh9c1",
                                    name: "发起任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "发起任务",
                                    id: "node_oclimwrh9c1",
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        actionName: "断货-仓库发",
        actionCode: "outOfStock",
        actionStatus: [
            {
                nameCN: "进行中",
                rules: [
                    {
                        formName: "采购断货",
                        formId: "FORM-F8666NB1JO8BPCAW7KNFD7TMJWMJ29APAQIILQ",
                        flowDetailsRules: [
                            {fieldId: "selectField_lijkikzq", opCode: opCodes.Contain, value: "仓发"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclimwrh9c1",
                                    name: "发起任务",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclimwrh9c1",
                                    name: "发起任务",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "发起任务",
                                    id: "node_oclimwrh9c1",
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "已完成",
                rules: [
                    {
                        formName: "采购断货",
                        formId: "FORM-F8666NB1JO8BPCAW7KNFD7TMJWMJ29APAQIILQ",
                        flowDetailsRules: [
                            {fieldId: "selectField_lijkikzq", opCode: opCodes.Contain, value: "仓发"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclimwrh9c1",
                                    name: "发起任务",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclimwrh9c1",
                                    name: "发起任务",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "发起任务",
                                    id: "node_oclimwrh9c1",
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
]