module.exports = [
    {
        actionName: "退残冲抵账目",
        actionCode: "tuiCanChongDiZhangMu",
        actionStatus: [
            {
                nameCN: "待做",
                rules: [
                    {
                        formName: "仓外库存调整差异流程",
                        formId: "FORM-NO7665914UHBI1LH7C79CAD8H08D3FL35MPILA",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclwvhkcr02",
                                    name: "执行人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclwvhkcr02",
                                    name: "执行人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_oclwvhkcr02",
                                }
                            },
                            {
                                from: {
                                    id: "node_oclipqgr4p3",
                                    name: "提交退残明细",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclipqgr4p3",
                                    name: "提交退残明细",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "提交退残明细",
                                    id: "node_oclipqgr4p3",
                                }
                            },
                            {
                                from: {
                                    id: "node_oclitp40ap1",
                                    name: "开具退残单/退货地址",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclitp40ap1",
                                    name: "开具退残单/退货地址",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "开具退残单/退货地址",
                                    id: "node_oclitp40ap1",
                                }
                            },
                            {
                                from: {
                                    id: "node_oclitp7soc1",
                                    name: "完成货品准备并提交数量",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclitp7soc1",
                                    name: "完成货品准备并提交数量",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "完成货品准备并提交数量",
                                    id: "node_oclitp7soc1",
                                }
                            },
                            {
                                from: {
                                    id: "node_ocljqq6uq42",
                                    name: "核对工厂签收差异",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_ocljqq6uq42",
                                    name: "核对工厂签收差异",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "核对工厂签收差异",
                                    id: "node_ocljqq6uq42",
                                }
                            },
                            {
                                from: {
                                    id: "node_oclmu6wul51",
                                    name: "开发采购提交退残金额与退款凭证",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclmu6wul51",
                                    name: "开发采购提交退残金额与退款凭证",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "开发采购提交退残金额与退款凭证",
                                    id: "node_oclmu6wul51",
                                }
                            },
                            {
                                from: {
                                    id: "node_oclipqgr4p4",
                                    name: "审核退仓流程结果",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclipqgr4p4",
                                    name: "审核退仓流程结果",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核退仓流程结果",
                                    id: "node_oclipqgr4p4",
                                }
                            },
                            {
                                from: {
                                    id: "node_oclyh0gkyr2",
                                    name: "审核信息",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyh0gkyr2",
                                    name: "审核信息",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核信息",
                                    id: "node_oclyh0gkyr2",
                                }
                            },
                            {
                                from: {
                                    id: "node_oclyh0gkyr3",
                                    name: "执行人",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyh0gkyr3",
                                    name: "执行人",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "执行人",
                                    id: "node_oclyh0gkyr3",
                                }
                            },
                            {
                                from: {
                                    id: "node_oclyh0gkyr4",
                                    name: "提交退残明细",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyh0gkyr4",
                                    name: "提交退残明细",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "提交退残明细",
                                    id: "node_oclyh0gkyr4",
                                }
                            },
                            {
                                from: {
                                    id: "node_oclyh0gkyr5",
                                    name: "开具退残单/退货地址",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyh0gkyr5",
                                    name: "开具退残单/退货地址",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "开具退残单/退货地址",
                                    id: "node_oclyh0gkyr5",
                                }
                            },
                            {
                                from: {
                                    id: "node_oclyh0gkyr6",
                                    name: "完成货品准备并提交数量",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyh0gkyr6",
                                    name: "完成货品准备并提交数量",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "完成货品准备并提交数量",
                                    id: "node_oclyh0gkyr6",
                                }
                            },
                            {
                                from: {
                                    id: "node_oclyh0gkyr7",
                                    name: "核对工厂签收差异",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyh0gkyr7",
                                    name: "核对工厂签收差异",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "核对工厂签收差异",
                                    id: "node_oclyh0gkyr7",
                                }
                            },
                            {
                                from: {
                                    id: "node_oclyh0gkyr8",
                                    name: "开发采购提交退残金额与退款凭证",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyh0gkyr8",
                                    name: "开发采购提交退残金额与退款凭证",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "开发采购提交退残金额与退款凭证",
                                    id: "node_oclyh0gkyr8",
                                }
                            },
                            {
                                from: {
                                    id: "node_oclyh0gkyr9",
                                    name: "审核退仓流程结果",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyh0gkyr9",
                                    name: "审核退仓流程结果",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "审核退仓流程结果",
                                    id: "node_oclyh0gkyr9",
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "进行中",
                rules: [
                    {
                        formName: "仓外库存调整差异流程",
                        formId: "FORM-NO7665914UHBI1LH7C79CAD8H08D3FL35MPILA",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclm4f0fvk1",
                                    name: "周转冲抵账目",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclm4f0fvk1",
                                    name: "周转冲抵账目",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "周转冲抵账目",
                                    id: "node_oclm4f0fvk1",
                                }
                            },
                            {
                                from: {
                                    id: "node_oclyh0gkyra",
                                    name: "周转冲抵账目",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "node_oclyh0gkyra",
                                    name: "周转冲抵账目",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "周转冲抵账目",
                                    id: "node_oclyh0gkyra",
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
                        formName: "仓外库存调整差异流程",
                        formId: "FORM-NO7665914UHBI1LH7C79CAD8H08D3FL35MPILA",
                        flowNodeRules: [
                            {
                                from: {
                                    id: "node_oclm4f0fvk1",
                                    name: "周转冲抵账目",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclm4f0fvk1",
                                    name: "周转冲抵账目",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "周转冲抵账目",
                                    id: "node_oclm4f0fvk1",
                                }
                            },
                            {
                                from: {
                                    id: "node_oclyh0gkyra",
                                    name: "周转冲抵账目",
                                    status: ["HISTORY"]
                                },
                                to: {
                                    id: "node_oclyh0gkyra",
                                    name: "周转冲抵账目",
                                    status: ["HISTORY"]
                                },
                                ownerRule: {
                                    from: "process",
                                    name: "周转冲抵账目",
                                    id: "node_oclyh0gkyra",
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
]