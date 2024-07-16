const {opCodes} = require("@/const/operatorConst")
const commonActionStatus = {TODO: "TODO", DOING: "DOING", DONE: "DONE"}

const config = [
    {
        actionName: "五维分析",
        actionCode: "fiveDimensionalAnalysis",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: commonActionStatus.TODO,
                children: [],
                rules: [
                    {
                        formName: "运营优化方案流程（全平台）",
                        formId: "FORM-51A6DCCF660B4C1680135461E762AC82JV53",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx30hv7y", opCode: opCodes.Equal, value: "是"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx30r79v1",
                                    name: "执行统计五维表",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx30r79v1",
                                    name: "执行统计五维表",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
                                }
                            }
                        ]
                    },
                    {
                        formName: "爆款方案流程(全平台)",
                        formId: "FORM-479D4CBC6B6E433494FA1AAF35EDAF527IGB",
                        flowNodeRules: [
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
                                    name: "运营负责人",
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
                                    name: "运营负责人",
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
                        formName: "运营优化方案流程（全平台）",
                        formId: "FORM-51A6DCCF660B4C1680135461E762AC82JV53",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx30hv7y", opCode: opCodes.Equal, value: "是"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclyim4za81",
                                    name: "运营分析五维统计表",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyim4za81",
                                    name: "运营分析五维统计表",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "运营分析五维统计表",
                                    id: "node_oclyim4za81"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx30r79v2",
                                    name: "提交优化方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx30r79v2",
                                    name: "提交优化方案",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "提交优化方案",
                                    id: "node_oclx30r79v2"
                                }
                            }
                        ]
                    },
                    {
                        formName: "爆款方案流程(全平台)",
                        formId: "FORM-479D4CBC6B6E433494FA1AAF35EDAF527IGB",
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
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_lxkb9f9a"
                                }
                            },
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
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_lxkb9f9a"
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
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_lxkb9f9a"
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
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_lxkb9f9a"
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
                        formName: "运营优化方案流程（全平台）",
                        formId: "FORM-51A6DCCF660B4C1680135461E762AC82JV53",
                        flowDetailsRules: [
                            {fieldId: "radioField_lx30hv7y", opCode: opCodes.Equal, value: "是"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclx30r79v2",
                                    name: "提交优化方案",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclx30r79v2",
                                    name: "提交优化方案",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "提交优化方案",
                                    id: "node_oclx30r79v2"
                                }
                            }
                        ]
                    },
                    {
                        formName: "爆款方案流程(全平台)",
                        formId: "FORM-479D4CBC6B6E433494FA1AAF35EDAF527IGB",
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
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_lxkb9f9a"
                                }
                            },
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
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_lxkb9f9a"
                                }
                            }
                        ]
                    }
                ]
            },
        ]
    }
]

module.exports = []