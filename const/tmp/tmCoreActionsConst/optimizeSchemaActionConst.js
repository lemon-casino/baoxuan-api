const {opCodes} = require("@/const/operatorConst");
const commonActionStatus = {TODO: "TODO", DOING: "DOING", DONE: "DONE"}

module.exports = [
    {
        actionName: "优化方案(简单)",
        actionCode: "optimizeSchema",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: commonActionStatus.TODO,
                rules: [
                    {
                        formName: "运营优化方案流程（全平台）",
                        formId: "FORM-51A6DCCF660B4C1680135461E762AC82JV53",
                        flowDetailsRules: [
                            {fieldId: "selectField_lk0jfy7h", opCode: opCodes.Equal, value: "简单"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclxmm4w8b2",
                                    name: "运营提交信息",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxmm4w8b2",
                                    name: "运营提交信息",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx30llo95",
                                    name: "提交竞品ID",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx30llo95",
                                    name: "提交竞品ID",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx30llo96",
                                    name: "分配执行统计五维",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx30llo96",
                                    name: "分配执行统计五维",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx30r79v1",
                                    name: "执行统计五维",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx30r79v1",
                                    name: "执行统计五维",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
                                }
                            },
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
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
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
                        formName: "运营优化方案流程（全平台）",
                        formId: "FORM-51A6DCCF660B4C1680135461E762AC82JV53",
                        flowDetailsRules: [
                            {fieldId: "selectField_lk0jfy7h", opCode: opCodes.Equal, value: "简单"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclyh5wg4p1",
                                    name: "提交优化方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyh5wg4p1",
                                    name: "提交优化方案",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxmm4w8b3",
                                    name: "提交优化方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxmm4w8b3",
                                    name: "提交优化方案",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
                                }
                            },
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
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
                                }
                            },
                            // {
                            //     from: {
                            //         id: "node_oclto07a599",
                            //         name: "组长审核方案",
                            //         status: ["TODO"]
                            //     },
                            //     to: {
                            //         id: "node_oclto07a599",
                            //         name: "组长审核方案",
                            //         status: ["TODO"]
                            //     },
                            //     ownerRule: {
                            //         from: "form",
                            //         name: "运营负责人",
                            //         id: "employeeField_liihs7l0"
                            //     }
                            // },
                            // {
                            //     from: {
                            //         id: "node_oclv7ila163",
                            //         name: "组长审核方案",
                            //         status: ["TODO"]
                            //     },
                            //     to: {
                            //         id: "node_oclv7ila163",
                            //         name: "组长审核方案",
                            //         status: ["TODO"]
                            //     },
                            //     ownerRule: {
                            //         from: "form",
                            //         name: "运营负责人",
                            //         id: "employeeField_liihs7l0"
                            //     }
                            // }
                        ]
                    }
                ]
            },
            {
                nameCN: "已完成",
                nameEN: commonActionStatus.DONE,
                rules: [
                    {
                        formName: "运营优化方案流程（全平台）",
                        formId: "FORM-51A6DCCF660B4C1680135461E762AC82JV53",
                        flowDetailsRules: [
                            // 统计表单中selectField_lk0jfy7h为简单或 历史表单中没有该字段的流程
                            {fieldId: "selectField_lk0jfy7h", opCode: opCodes.NotEqual, value: "困难"}
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
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
                                }
                            },
                            // {
                            //     from: {
                            //         id: "node_oclto07a599",
                            //         name: "组长审核方案",
                            //         status: ["HISTORY"]
                            //     },
                            //     to: {
                            //         id: "node_oclto07a599",
                            //         name: "组长审核方案",
                            //         status: ["HISTORY"]
                            //     },
                            //     ownerRule: {
                            //         from: "form",
                            //         name: "运营负责人",
                            //         id: "employeeField_liihs7l0"
                            //     }
                            // },
                            // {
                            //     from: {
                            //         id: "node_oclv7ila163",
                            //         name: "组长审核方案",
                            //         status: ["HISTORY"]
                            //     },
                            //     to: {
                            //         id: "node_oclv7ila163",
                            //         name: "组长审核方案",
                            //         status: ["HISTORY"]
                            //     },
                            //     ownerRule: {
                            //         from: "form",
                            //         name: "运营负责人",
                            //         id: "employeeField_liihs7l0"
                            //     }
                            // }
                        ]
                    }
                ]
            }
        ]
    },
    {
        actionName: "优化方案(困难)",
        actionCode: "optimizeSchema",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: commonActionStatus.TODO,
                rules: [
                    {
                        formName: "运营优化方案流程（全平台）",
                        formId: "FORM-51A6DCCF660B4C1680135461E762AC82JV53",
                        flowDetailsRules: [
                            {fieldId: "selectField_lk0jfy7h", opCode: opCodes.Equal, value: "困难"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclxmm4w8b2",
                                    name: "运营提交信息",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxmm4w8b2",
                                    name: "运营提交信息",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx30llo95",
                                    name: "提交竞品ID",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx30llo95",
                                    name: "提交竞品ID",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx30llo96",
                                    name: "分配执行统计五维",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx30llo96",
                                    name: "分配执行统计五维",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclx30r79v1",
                                    name: "执行统计五维",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclx30r79v1",
                                    name: "执行统计五维",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
                                }
                            },
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
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
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
                        formName: "运营优化方案流程（全平台）",
                        formId: "FORM-51A6DCCF660B4C1680135461E762AC82JV53",
                        flowDetailsRules: [
                            {fieldId: "selectField_lk0jfy7h", opCode: opCodes.Equal, value: "困难"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclyh5wg4p1",
                                    name: "提交优化方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyh5wg4p1",
                                    name: "提交优化方案",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
                                }
                            },
                            {
                                from: {
                                    id: "node_oclxmm4w8b3",
                                    name: "提交优化方案",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclxmm4w8b3",
                                    name: "提交优化方案",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
                                }
                            },
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
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
                                }
                            },
                            // {
                            //     from: {
                            //         id: "node_oclto07a599",
                            //         name: "组长审核方案",
                            //         status: ["TODO"]
                            //     },
                            //     to: {
                            //         id: "node_oclto07a599",
                            //         name: "组长审核方案",
                            //         status: ["TODO"]
                            //     },
                            //     ownerRule: {
                            //         from: "form",
                            //         name: "运营负责人",
                            //         id: "employeeField_liihs7l0"
                            //     }
                            // },
                            // {
                            //     from: {
                            //         id: "node_oclv7ila163",
                            //         name: "组长审核方案",
                            //         status: ["TODO"]
                            //     },
                            //     to: {
                            //         id: "node_oclv7ila163",
                            //         name: "组长审核方案",
                            //         status: ["TODO"]
                            //     },
                            //     ownerRule: {
                            //         from: "form",
                            //         name: "运营负责人",
                            //         id: "employeeField_liihs7l0"
                            //     }
                            // }
                        ]
                    }
                ]
            },
            {
                nameCN: "已完成",
                nameEN: commonActionStatus.DONE,
                rules: [
                    {
                        formName: "运营优化方案流程（全平台）",
                        formId: "FORM-51A6DCCF660B4C1680135461E762AC82JV53",
                        flowDetailsRules: [
                            {fieldId: "selectField_lk0jfy7h", opCode: opCodes.Equal, value: "困难"}
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
                                    from: "form",
                                    name: "运营负责人",
                                    id: "employeeField_liihs7l0"
                                }
                            },
                            // {
                            //     from: {
                            //         id: "node_oclto07a599",
                            //         name: "组长审核方案",
                            //         status: ["HISTORY"]
                            //     },
                            //     to: {
                            //         id: "node_oclto07a599",
                            //         name: "组长审核方案",
                            //         status: ["HISTORY"]
                            //     },
                            //     ownerRule: {
                            //         from: "form",
                            //         name: "运营负责人",
                            //         id: "employeeField_liihs7l0"
                            //     }
                            // },
                            // {
                            //     from: {
                            //         id: "node_oclv7ila163",
                            //         name: "组长审核方案",
                            //         status: ["HISTORY"]
                            //     },
                            //     to: {
                            //         id: "node_oclv7ila163",
                            //         name: "组长审核方案",
                            //         status: ["HISTORY"]
                            //     },
                            //     ownerRule: {
                            //         from: "form",
                            //         name: "运营负责人",
                            //         id: "employeeField_liihs7l0"
                            //     }
                            // }
                        ]
                    }
                ]
            }
        ]
    }
]