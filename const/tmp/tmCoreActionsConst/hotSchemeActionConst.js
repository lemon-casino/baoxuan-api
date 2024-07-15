const {opCodes} = require("@/const/operatorConst");
const commonActionStatus = {TODO: "TODO", DOING: "DOING", DONE: "DONE"}

module.exports = [
    {
        actionName: "爆款方案(新品)",
        actionCode: "hotSchema",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: commonActionStatus.TODO,
                children: [],
                rules: [
                    {
                        formName: "爆款方案流程(全平台)",
                        formId: "FORM-479D4CBC6B6E433494FA1AAF35EDAF527IGB",
                        flowDetailsRules: [
                            {fieldId: "radioField_lxkb9f8z", opCode: opCodes.Equal, value: "新品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclxkbw8kwf",
                                    name: "提交竞店ID与样品明细",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxkbw8kwf",
                                    name: "提交竞店ID与样品明细",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "提交竞店ID与样品明细",
                                    id: "node_oclxkbw8kwf"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxkbw8kwe",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxkbw8kwe",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "分配执行",
                                    id: "employeeField_lxkb9f9a"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxkbw8kwg",
                                    name: "执行统计五维表",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxkbw8kwg",
                                    name: "执行统计五维表",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "执行统计五维表",
                                    id: "employeeField_lxkb9f9a"
                                }
                            },
                        ]
                    }
                ]
            },
            {
                nameCN: "在做",
                nameEN: commonActionStatus.DOING,
                rules: [
                    {
                        formName: "爆款方案流程(全平台)",
                        formId: "FORM-479D4CBC6B6E433494FA1AAF35EDAF527IGB",
                        flowDetailsRules: [
                            {fieldId: "radioField_lxkb9f8z", opCode: opCodes.Equal, value: "新品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclxkbw8kwh",
                                    name: "审核执行五维统计表",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxkbw8kwh",
                                    name: "审核执行五维统计表",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核执行五维统计表",
                                    id: "node_oclxkbw8kwh"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxkcjr639",
                                    name: "完成五维表分析",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxkcjr639",
                                    name: "完成五维表分析",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "完成五维表分析",
                                    id: "node_oclxkcjr639"
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
                        formName: "爆款方案流程(全平台)",
                        formId: "FORM-479D4CBC6B6E433494FA1AAF35EDAF527IGB",
                        flowDetailsRules: [
                            {fieldId: "radioField_lxkb9f8z", opCode: opCodes.Equal, value: "新品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclxkcjr639",
                                    name: "完成五维表分析",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclxkcjr639",
                                    name: "完成五维表分析",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "完成五维表分析",
                                    id: "node_oclxkcjr639"
                                }
                            }
                        ]
                    }
                ]
            },
        ]
    },
    {
        actionName: "爆款方案(老品)",
        actionCode: "hotSchema",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: commonActionStatus.TODO,
                children: [],
                rules: [
                    {
                        formName: "爆款方案流程(全平台)",
                        formId: "FORM-479D4CBC6B6E433494FA1AAF35EDAF527IGB",
                        flowDetailsRules: [
                            {fieldId: "radioField_lxkb9f8z", opCode: opCodes.Equal, value: "老品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclymct9k21",
                                    name: "提交竞店ID与样品明细",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclymct9k21",
                                    name: "提交竞店ID与样品明细",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "提交竞店ID与样品明细",
                                    id: "node_oclymct9k21"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxkd9uqud",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxkd9uqud",
                                    name: "分配执行",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "分配执行",
                                    id: "employeeField_lxkb9f9a"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclymct9k26",
                                    name: "执行统计五维表",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclymct9k26",
                                    name: "执行统计五维表",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "执行统计五维表",
                                    id: "employeeField_lxkb9f9a"
                                }
                            },
                        ]
                    }
                ]
            },
            {
                nameCN: "在做",
                nameEN: commonActionStatus.DOING,
                rules: [
                    {
                        formName: "爆款方案流程(全平台)",
                        formId: "FORM-479D4CBC6B6E433494FA1AAF35EDAF527IGB",
                        flowDetailsRules: [
                            {fieldId: "radioField_lxkb9f8z", opCode: opCodes.Equal, value: "老品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclymct9k27",
                                    name: "审核执行五维统计表",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclymct9k27",
                                    name: "审核执行五维统计表",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核执行五维统计表",
                                    id: "node_oclymct9k27"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclymct9k28",
                                    name: "完成五维表分析",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclymct9k28",
                                    name: "完成五维表分析",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "完成五维表分析",
                                    id: "node_oclymct9k28"
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
                        formName: "爆款方案流程(全平台)",
                        formId: "FORM-479D4CBC6B6E433494FA1AAF35EDAF527IGB",
                        flowDetailsRules: [
                            {fieldId: "radioField_lxkb9f8z", opCode: opCodes.Equal, value: "老品"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclymct9k28",
                                    name: "完成五维表分析",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclymct9k28",
                                    name: "完成五维表分析",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "完成五维表分析",
                                    id: "node_oclymct9k28"
                                }
                            }
                        ]
                    }
                ]
            },
        ]
    }
]