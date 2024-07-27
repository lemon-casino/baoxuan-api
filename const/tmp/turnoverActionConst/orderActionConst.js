module.exports = {
    actionName: "订货",
    actionCode: "order",
    actionStatus: [
        {
            nameCN: "待做",
            rules: [
                {
                    formName: "采购任务运营发布",
                    formId: "FORM-0A966I819O8BZMVBE16JLAK96KK42KD1QEIILC",
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_ocliifx9y62",
                                name: "分配采购订货人",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_ocliifx9y62",
                                name: "分配采购订货人",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配采购订货人",
                                id: "node_ocliifx9y62",
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
                                id: "node_ocliid9xm74",
                                name: "分配采购办理人",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_ocliid9xm74",
                                name: "分配采购办理人",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配采购办理人",
                                id: "node_ocliid9xm74",
                            }
                        }
                    ]
                },
                {
                    formName: "新增SKU订货流程",
                    formId: "FORM-TP866D91IM6ESSF18NJZABCB83Q23X46IAHML3",
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclwvs7clx1",
                                name: "分配周转订货",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclwvs7clx1",
                                name: "分配周转订货",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配周转订货",
                                id: "node_oclwvs7clx1",
                            }
                        }
                    ]
                },
            ]
        },
        {
            nameCN: "进行中",
            rules: [
                {
                    formName: "采购任务运营发布",
                    formId: "FORM-0A966I819O8BZMVBE16JLAK96KK42KD1QEIILC",
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_ocliifx9y63",
                                name: "周转采购订货",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_ocliifx9y63",
                                name: "周转采购订货",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "周转采购订货",
                                id: "node_ocliifx9y63",
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
                                id: "node_oclkxfaina1",
                                name: "周转订货合同说明",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclkxfaina1",
                                name: "周转订货合同说明",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "周转订货合同说明",
                                id: "node_oclkxfaina1",
                            }
                        },
                        {
                            from: {
                                id: "node_ocliidtnye1",
                                name: "采购办理订货",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_ocliidtnye1",
                                name: "采购办理订货",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "采购办理订货",
                                id: "node_ocliidtnye1",
                            }
                        },
                    ]
                },
                {
                    formName: "新增SKU订货流程",
                    formId: "FORM-TP866D91IM6ESSF18NJZABCB83Q23X46IAHML3",
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclwvs7clx2",
                                name: "周转订货给出预计到货时间",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclwvs7clx2",
                                name: "周转订货给出预计到货时间",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "周转订货给出预计到货时间",
                                id: "node_oclwvs7clx2",
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
                    formName: "采购任务运营发布",
                    formId: "FORM-0A966I819O8BZMVBE16JLAK96KK42KD1QEIILC",
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_ocliifx9y63",
                                name: "周转采购订货",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_ocliifx9y63",
                                name: "周转采购订货",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "周转采购订货",
                                id: "node_ocliifx9y63",
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
                                id: "node_ocliidtnye1",
                                name: "采购办理订货",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_ocliidtnye1",
                                name: "采购办理订货",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "采购办理订货",
                                id: "node_ocliidtnye1",
                            }
                        },
                    ]
                },
                {
                    formName: "新增SKU订货流程",
                    formId: "FORM-TP866D91IM6ESSF18NJZABCB83Q23X46IAHML3",
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclwvs7clx2",
                                name: "周转订货给出预计到货时间",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclwvs7clx2",
                                name: "周转订货给出预计到货时间",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "周转订货给出预计到货时间",
                                id: "node_oclwvs7clx2",
                            }
                        }
                    ]
                }
            ]
        }
    ]
}