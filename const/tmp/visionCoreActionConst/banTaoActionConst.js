/**
 *  flowNodeRules的调整方向：
 *  1. 每项from-to节点都是指向单一的节点，去掉逾期节点的配置
 *  2. ownerRule需要保留
 *
 *  rules：或的关系   flowDetailsRules：且的关系  flowNodeRules：或的关系
 */

const {opCodes} = require("@/const/ruleConst/operatorConst")
const mbActionTypes = {
    WAIT_TO_SHOOT: "WAIT_TO_SHOOT", BE_SHOOTING: "BE_SHOOTING", SHOOT_DONE: "SHOOT_DONE",
    WAIT_TO_PS: "WAIT_TO_PS", ON_PS: "BE_PS", PS_DONE: "PS_DONE",
    WAIT_TO_CUT: "WAIT_TO_CUT", BE_CUTTING: "BE_CUTTING", CUT_DONE: "CUT_DONE"
}

module.exports = {
    actionName: "半套",
    actionCode: "halfPackedPicture",
    actionStatus: [
        {
            nameCN: "待拍摄影",
            nameEN: mbActionTypes.WAIT_TO_SHOOT,
            rules: [
                {
                    formName: "运营视觉流程（拍摄+美编）",
                    formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                    flowDetailsRules: [
                        {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclx00ubuyn",
                                name: "确认样品和道具",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx00ubuyn",
                                name: "确认样品和道具",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx00ubuyn",
                                name: "确认样品和道具",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "确认样品和道具",
                                id: "node_oclx00ubuyn"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx00ubuy7",
                                name: "确认拍摄类型",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx00ubuy7",
                                name: "确认拍摄类型",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx00ubuy7",
                                name: "确认拍摄类型",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "确认拍摄类型",
                                id: "node_oclx00ubuy7",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx00ubuyc",
                                name: "分配执行",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx00ubuyc",
                                name: "分配执行",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx00ubuyc",
                                name: "分配执行",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "确认拍摄类型",
                                id: "node_oclx00ubuy7",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx00ubuyd",
                                name: "执行确认样品",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx00ubuyd",
                                name: "执行确认样品",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx00ubuyd",
                                name: "执行确认样品",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "确认拍摄类型",
                                id: "node_oclx00ubuy7",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx00ubuye",
                                name: "审核方案分配摄像/美编负责人",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx00ubuye",
                                name: "审核方案分配摄像/美编负责人",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx00ubuye",
                                name: "审核方案分配摄像/美编负责人",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "审核方案分配摄像/美编负责人",
                                id: "node_oclx00ubuye"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx03jr071t",
                                name: "分配外拍负责人",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx03jr071t",
                                name: "分配外拍负责人",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx03jr071t",
                                name: "分配外拍负责人",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配外拍负责人",
                                id: "node_oclx03jr071t"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx03jr071u",
                                name: "分配执行邮寄样品",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx03jr071u",
                                name: "分配执行邮寄样品",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx03jr071u",
                                name: "分配执行邮寄样品",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "确认拍摄类型",
                                id: "node_oclx00ubuy7",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx03jr071v",
                                name: "执行填写快递单号",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx03jr071v",
                                name: "执行填写快递单号",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx03jr071v",
                                name: "执行填写快递单号",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "确认拍摄类型",
                                id: "node_oclx00ubuy7",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx03jr071w",
                                name: "通知外包负责人",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx03jr071w",
                                name: "通知外包负责人",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx03jr071w",
                                name: "通知外包负责人",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "确认拍摄类型",
                                id: "node_oclx00ubuy7",
                                defaultUserName: "张杰"
                            }
                        }
                    ]
                },
                {
                    formName: "运营视觉流程（拍摄+美编）",
                    formId: "FORM-955A09160AB34B4489E96B8929AFFA2AVE2R",
                    flowDetailsRules: [
                        {fieldId: "radioField_lypub2tw", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclys3tuxz1",
                                name: "确认道具齐全",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclys3tuxz1",
                                name: "确认道具齐全",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lyqkh2mw"
                            }
                        },
                        {
                            from: {
                                id: "node_oclyqmfkje1",
                                name: "确认道具齐全",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclyqmfkje1",
                                name: "确认道具齐全",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lyqkh2mw"
                            }
                        },
                        {
                            from: {
                                id: "node_oclyqllinba",
                                name: "统计样品",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclyqllinba",
                                name: "统计样品",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "外包拍摄负责人",
                                id: "radioField_lyqkh2nw"
                            }
                        },
                        {
                            from: {
                                id: "node_oclyqllinbf",
                                name: "联系快递通知外拍负责人",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclyqllinbf",
                                name: "联系快递通知外拍负责人",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "外包拍摄负责人",
                                id: "radioField_lyqkh2nw"
                            }
                        }
                    ]
                },
            ]
        },
        {
            nameCN: "摄影进行中",
            nameEN: mbActionTypes.BE_SHOOTING,
            rules: [
                {
                    formName: "运营视觉流程（拍摄+美编）",
                    formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                    flowDetailsRules: [
                        {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclx4kc70w9",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70w9",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70w9",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclx4kc70w9"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx00ubuyu",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx00ubuyu",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx00ubuyu",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclx00ubuyu"
                            }
                        },
                        {
                            from: {
                                id: "node_oclxcz6yq71",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclxcz6yq71",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclxcz6yq71",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclxcz6yq71"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx03jr07n",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx03jr07n",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx03jr07n",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclx03jr07n"
                            }
                        }
                    ]
                },
                {
                    formName: "运营视觉流程（拍摄+美编）",
                    formId: "FORM-955A09160AB34B4489E96B8929AFFA2AVE2R",
                    flowDetailsRules: [
                        {fieldId: "radioField_lypub2tw", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclyqmivse5",
                                name: "AI拍摄完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclyqmivse5",
                                name: "AI拍摄完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI拍摄完成",
                                id: "node_oclyqmivse5"
                            }
                        },
                        {
                            from: {
                                id: "node_oclyqmp3fm2",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclyqmp3fm2",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclyqmp3fm2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclyqllinbg",
                                name: "确认拍摄完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclyqllinbg",
                                name: "确认拍摄完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "外包拍摄负责人",
                                id: "radioField_lyqkh2nw"
                            }
                        }
                    ]
                },
            ]
        },
        {
            nameCN: "摄影完成",
            nameEN: mbActionTypes.SHOOT_DONE,
            rules: [
                {
                    formName: "运营视觉流程（拍摄+美编）",
                    formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                    flowDetailsRules: [
                        {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclx4kc70w9",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70w9",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70w9",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclx4kc70w9"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx00ubuyu",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx00ubuyu",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx00ubuyu",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclx00ubuyu"
                            }
                        },
                        {
                            from: {
                                id: "node_oclxcz6yq71",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclxcz6yq71",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclxcz6yq71",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclxcz6yq71"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx03jr07n",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx03jr07n",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx03jr07n",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclx03jr07n"
                            }
                        }
                    ]
                },
                {
                    formName: "运营视觉流程（拍摄+美编）",
                    formId: "FORM-955A09160AB34B4489E96B8929AFFA2AVE2R",
                    flowDetailsRules: [
                        {fieldId: "radioField_lypub2tw", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclyqmivse5",
                                name: "AI拍摄完成",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclyqmivse5",
                                name: "AI拍摄完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI拍摄完成",
                                id: "node_oclyqmivse5"
                            }
                        },
                        {
                            from: {
                                id: "node_oclyqmp3fm2",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclyqmp3fm2",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclyqmp3fm2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclyqllinbg",
                                name: "确认拍摄完成",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclyqllinbg",
                                name: "确认拍摄完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "外包拍摄负责人",
                                id: "radioField_lyqkh2nw"
                            }
                        }
                    ]
                }
            ]
        },
        
        {
            nameCN: "待入美编",
            nameEN: mbActionTypes.WAIT_TO_PS,
            rules: [
                {
                    formName: "美编任务运营发布",
                    formId: "FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS",
                    flowDetailsRules: [
                        {fieldId: "radioField_lv641k3b", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclvgenwmp6",
                                name: "确认美编任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvgenwmp6",
                                name: "确认美编任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvgenwmp6",
                                name: "确认美编任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "执行人",
                                id: "node_oclvgenwmp6"
                            }
                        }
                    ]
                },
                
                {
                    formName: "运营视觉流程（拍摄+美编）",
                    formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                    flowDetailsRules: [
                        {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclx1f3cl76",
                                name: "确认修图属性",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx1f3cl76",
                                name: "确认修图属性",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx1f3cl76",
                                name: "确认修图属性",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "确认修图属性",
                                id: "node_oclx1f3cl76"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5j5bv41",
                                name: "确认修图属性",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx5j5bv41",
                                name: "分配美编",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx5j5bv41",
                                name: "分配美编",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配美编",
                                id: "node_oclx5j5bv41"
                            }
                        },
                        {
                            from: {
                                id: "node_oclxcz6yq71",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclxcz6yq71",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclxcz6yq71",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "大美编负责人",
                                id: "employeeField_lwyt5hfa"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx03jr071x",
                                name: "确认视觉性质",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx03jr071x",
                                name: "确认视觉性质",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx03jr071x",
                                name: "确认视觉性质",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "确认视觉性质",
                                id: "node_oclx03jr071x"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx1flxsv1",
                                name: "分配大美编",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx1flxsv1",
                                name: "分配大美编",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx1flxsv1",
                                name: "分配大美编",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配大美编",
                                id: "node_oclx1flxsv1"
                            }
                        }
                    ]
                },
                {
                    formName: "运营视觉流程（拍摄+美编）",
                    formId: "FORM-955A09160AB34B4489E96B8929AFFA2AVE2R",
                    flowDetailsRules: [
                        {fieldId: "radioField_lypub2tw", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclys3tuxz2",
                                name: "审核视觉",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclys3tuxz2",
                                name: "审核视觉",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "美编修图负责人",
                                id: "employeeField_lyqkh2my"
                            }
                        },
                        {
                            from: {
                                id: "node_oclyqllinbo",
                                name: "审核视觉",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclyqllinbo",
                                name: "审核视觉",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "美编修图负责人",
                                id: "employeeField_lyqkh2my"
                            }
                        },
                        {
                            from: {
                                id: "node_oclyqvzdr92",
                                name: "拍摄上传链图云",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclyqvzdr92",
                                name: "拍摄上传链图云",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "美编修图负责人",
                                id: "employeeField_lyqkh2my"
                            }
                        },
                        {
                            from: {
                                id: "node_oclyqvzdr93",
                                name: "拍摄上传链图云",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclyqvzdr93",
                                name: "拍摄上传链图云",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "美编修图负责人",
                                id: "employeeField_lyqkh2my"
                            }
                        },
                        {
                            from: {
                                id: "node_oclyqm9hmf1",
                                name: "视觉总监确认拍摄方案",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclyqm9hmf1",
                                name: "视觉总监确认拍摄方案",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "3D建模负责人",
                                id: "employeeField_lz2ejnhq",
                                defaultUserName: "王洪彬"
                            }
                        },
                        {
                            from: {
                                id: "node_oclz2elklg2",
                                name: "分配3D建模、美编负责人",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclz2elklg2",
                                name: "分配3D建模、美编负责人",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "3D建模负责人",
                                id: "employeeField_lz2ejnhq",
                                defaultUserName: "王洪彬"
                            }
                        }
                    ]
                },
                
                {
                    formName: "美编修图任务",
                    formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
                    flowDetailsRules: [
                        {fieldId: "radioField_lx41cnvt", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclx422jq8p",
                                name: "确认是否AI",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx422jq8p",
                                name: "确认是否AI",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx422jq8p",
                                name: "确认是否AI",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "确认是否AI",
                                id: "node_oclx422jq8p"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5ij0pq5",
                                name: "分配美编",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx5ij0pq5",
                                name: "分配美编",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx5ij0pq5",
                                name: "分配美编",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配美编",
                                id: "node_oclx5ij0pq5"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5ij0pq6",
                                name: "分配美编",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx5ij0pq6",
                                name: "分配美编",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx5ij0pq6",
                                name: "分配美编",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配美编",
                                id: "node_oclx5ij0pq6"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5ij0pq7",
                                name: "分配美编",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx5ij0pq7",
                                name: "分配美编",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx5ij0pq7",
                                name: "分配美编",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配美编",
                                id: "node_oclx5ij0pq7"
                            }
                        }
                    ]
                },
                {
                    formName: "外包修图视觉流程",
                    formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
                    flowDetailsRules: [
                        {fieldId: "radioField_lx48e5gm", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_ockpz6phx73",
                                name: "分配外包美编制作",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_ockpz6phx73",
                                name: "分配外包美编制作",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_ockpz6phx73",
                                name: "分配外包美编制作",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配外包美编制作",
                                id: "node_ockpz6phx73"
                            }
                        }
                    ]
                }
            ]
        },
        {
            nameCN: "美编进行中",
            nameEN: mbActionTypes.ON_PS,
            rules: [
                {
                    formName: "美编任务运营发布",
                    formId: "FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS",
                    flowDetailsRules: [
                        {fieldId: "radioField_lv641k3b", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclvgh4l0z2",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvgh4l0z2",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvgh4l0z2",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvgh4l0z2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvgh4l0zb",
                                name: "精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvgh4l0zb",
                                name: "精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvgh4l0zb",
                                name: "精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "精修美编完成任务",
                                id: "node_oclvgh4l0zb"
                            }
                        },
                        {
                            from: {
                                id: "node_oclw7dfsbp6",
                                name: " 精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclw7dfsbp6",
                                name: " 精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclw7dfsbp6",
                                name: " 精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "精修美编完成任务",
                                id: "node_oclw7dfsbp6"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvgh4l0zf",
                                name: "简单任务完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvgh4l0zf",
                                name: "简单任务完成",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvgh4l0zf",
                                name: "简单任务完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单任务完成",
                                id: "node_oclvt49cil2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclwhrd6j62",
                                name: "建模美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclwhrd6j62",
                                name: "建模美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclwhrd6j62",
                                name: "建模美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "建模美编完成任务",
                                id: "node_oclwhrd6j62"
                            }
                        },
                        // {
                        //     from: {
                        //         id: "node_oclvghx5li7",
                        //         name: "审核美编任务",
                        //         status: ["TODO"]
                        //     },
                        //     to: {
                        //         id: "node_oclvghx5li7",
                        //         name: "审核美编任务",
                        //         status: ["TODO"]
                        //     },
                        //     overdue: {
                        //         id: "node_oclvghx5li7",
                        //         name: "审核美编任务",
                        //         status: ["TODO"]
                        //     },
                        //     ownerRule: {
                        //         from: "process",
                        //         name: "审核美编任务",
                        //         id: "node_oclvghx5li7"
                        //     }
                        // },
                        // {
                        //     from: {
                        //         id: "node_oclvghx5li8",
                        //         name: "审核美编任务",
                        //         status: ["TODO"]
                        //     },
                        //     to: {
                        //         id: "node_oclvghx5li8",
                        //         name: "审核美编任务",
                        //         status: ["TODO"]
                        //     },
                        //     overdue: {
                        //         id: "node_oclvghx5li8",
                        //         name: "审核美编任务",
                        //         status: ["TODO"]
                        //     },
                        //     ownerRule: {
                        //         from: "process",
                        //         name: "审核美编任务",
                        //         id: "node_oclvghx5li8"
                        //     }
                        // },
                        // {
                        //     from: {
                        //         id: "node_oclw7dfsbp7",
                        //         name: " 审核美编任务",
                        //         status: ["TODO"]
                        //     },
                        //     to: {
                        //         id: "node_oclw7dfsbp7",
                        //         name: " 审核美编任务",
                        //         status: ["TODO"]
                        //     },
                        //     overdue: {
                        //         id: "node_oclw7dfsbp7",
                        //         name: " 审核美编任务",
                        //         status: ["TODO"]
                        //     },
                        //     ownerRule: {
                        //         from: "process",
                        //         name: "审核美编任务",
                        //         id: "node_oclw7dfsbp7"
                        //     }
                        // },
                        // {
                        //     from: {
                        //         id: "node_oclvghx5lia",
                        //         name: "审核美编任务",
                        //         status: ["TODO"]
                        //     },
                        //     to: {
                        //         id: "node_oclvghx5lia",
                        //         name: "审核美编任务",
                        //         status: ["TODO"]
                        //     },
                        //     overdue: {
                        //         id: "node_oclvghx5lia",
                        //         name: "审核美编任务",
                        //         status: ["TODO"]
                        //     },
                        //     ownerRule: {
                        //         from: "process",
                        //         name: "审核美编任务",
                        //         id: "node_oclvghx5lia"
                        //     }
                        // },
                        // {
                        //     from: {
                        //         id: "node_oclwhrd6j63",
                        //         name: "审核美编任务",
                        //         status: ["TODO"]
                        //     },
                        //     to: {
                        //         id: "node_oclwhrd6j63",
                        //         name: "审核美编任务",
                        //         status: ["TODO"]
                        //     },
                        //     overdue: {
                        //         id: "node_oclwhrd6j63",
                        //         name: "审核美编任务",
                        //         status: ["TODO"]
                        //     },
                        //     ownerRule: {
                        //         from: "process",
                        //         name: "审核美编任务",
                        //         id: "node_oclwhrd6j63"
                        //     }
                        // },
                    ]
                },
                
                {
                    formName: "运营视觉流程（拍摄+美编）",
                    formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                    flowDetailsRules: [
                        {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclx1f3cl77",
                                name: "小美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx1f3cl77",
                                name: "小美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx1f3cl77",
                                name: "小美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编修图",
                                id: "node_oclx1f3cl77"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx1f3cl78",
                                name: "AI作图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx1f3cl78",
                                name: "AI作图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx1f3cl78",
                                name: "AI作图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI作图",
                                id: "node_oclx1f3cl78"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx00ubuyy",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx00ubuyy",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx00ubuyy",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx00ubuyy"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4jrkfs2",
                                name: "小美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4jrkfs2",
                                name: "小美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4jrkfs2",
                                name: "小美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编修图",
                                id: "node_oclx4jrkfs2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4jrkfs3",
                                name: "AI作图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4jrkfs3",
                                name: "AI作图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4jrkfs3",
                                name: "AI作图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI作图",
                                id: "node_oclx4jrkfs3"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4jrkfs4",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4jrkfs4",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4jrkfs4",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4jrkfs4"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx30pi4f6",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx30pi4f6",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx30pi4f6",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx30pi4f6"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70w3",
                                name: "分配中美编",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70w3",
                                name: "分配中美编",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70w3",
                                name: "分配中美编",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配中美编",
                                id: "node_oclx4kc70w3"
                            }
                        },
                        {
                            from: {
                                id: "node_oclxcz6yq72",
                                name: "中美编自修",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclxcz6yq72",
                                name: "中美编自修",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclxcz6yq72",
                                name: "中美编自修",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "中美编自修",
                                id: "node_oclxcz6yq72"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx1f3cl7b",
                                name: "小美编套版",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx1f3cl7b",
                                name: "小美编套版",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx1f3cl7b",
                                name: "小美编套版",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编套版",
                                id: "node_oclx1f3cl7b"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70w6",
                                name: "外包修图数量",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70w6",
                                name: "外包修图数量",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70w6",
                                name: "外包修图数量",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "外包修图数量",
                                id: "node_oclx4kc70w6"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70w7",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70w7",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70w7",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4kc70w7"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70w2",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70w2",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70w2",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4kc70w2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4bnhfb2",
                                name: "分配中美编",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4bnhfb2",
                                name: "分配中美编",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4bnhfb2",
                                name: "分配中美编",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配中美编",
                                id: "node_oclx4bnhfb2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70w4",
                                name: "中美编自修",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70w4",
                                name: "中美编自修",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70w4",
                                name: "中美编自修",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "中美编自修",
                                id: "node_oclx4kc70w4"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70w5",
                                name: "小美编套版",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70w5",
                                name: "小美编套版",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70w5",
                                name: "小美编套版",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编套版",
                                id: "node_oclx4kc70w5"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4dqaay1",
                                name: "外包修图数量",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4dqaay1",
                                name: "外包修图数量",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4dqaay1",
                                name: "外包修图数量",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "外包修图数量",
                                id: "node_oclx4dqaay1"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4bnhfb3",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4bnhfb3",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4bnhfb3",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4bnhfb3"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wi",
                                name: "分配中美编",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70wi",
                                name: "分配中美编",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wi",
                                name: "分配中美编",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配中美编",
                                id: "node_oclx4kc70wi"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wj",
                                name: "中美编自修",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70wj",
                                name: "中美编自修",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wj",
                                name: "中美编自修",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "中美编自修",
                                id: "node_oclx4kc70wj"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wx",
                                name: "小美编套版",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70wx",
                                name: "小美编套版",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wx",
                                name: "小美编套版",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编套版",
                                id: "node_oclx4kc70wx"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wy",
                                name: "外包修图数量",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70wy",
                                name: "外包修图数量",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wy",
                                name: "外包修图数量",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "外包修图数量",
                                id: "node_oclx4kc70wy"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wz",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70wz",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wz",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4kc70wz"
                            }
                        }
                    ]
                },
                {
                    formName: "运营视觉流程（拍摄+美编）",
                    formId: "FORM-955A09160AB34B4489E96B8929AFFA2AVE2R",
                    flowDetailsRules: [
                        {fieldId: "radioField_lypub2tw", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclyqmivse6",
                                name: "AI修图完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclyqmivse6",
                                name: "AI修图完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI修图完成",
                                id: "node_oclyqmivse6"
                            }
                        },
                        {
                            from: {
                                id: "node_oclyqmp3fm3",
                                name: "美工修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclyqmp3fm3",
                                name: "美工修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "美工修图",
                                id: "node_oclyqmp3fm3"
                            }
                        },
                        {
                            from: {
                                id: "node_oclyqllinbj",
                                name: "美工修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclyqllinbj",
                                name: "美工修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "美工修图",
                                id: "node_oclyqllinbj"
                            }
                        },
                        {
                            from: {
                                id: "node_oclz2elklgj",
                                name: "3D建模",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclz2elklgj",
                                name: "3D建模",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "3D建模",
                                id: "node_oclz2elklgj"
                            }
                        }
                    ]
                },
                
                {
                    formName: "美编修图任务",
                    formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
                    flowDetailsRules: [
                        {fieldId: "radioField_lx41cnvt", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclx422jq87",
                                name: "小美编负责人",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx422jq87",
                                name: "小美编负责人",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx422jq87",
                                name: "小美编负责人",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编负责人",
                                id: "node_oclx422jq87"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx422jq88",
                                name: "AI修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx422jq88",
                                name: "AI修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx422jq88",
                                name: "AI修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI修图",
                                id: "node_oclx422jq88"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx422jq89",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx422jq89",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx422jq89",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx422jq89"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwq1",
                                name: "小美编负责人",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx5gvwwq1",
                                name: "小美编负责人",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwq1",
                                name: "小美编负责人",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编负责人",
                                id: "node_oclx5gvwwq1"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwq2",
                                name: "AI修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx5gvwwq2",
                                name: "AI修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwq2",
                                name: "AI修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI修图",
                                id: "node_oclx5gvwwq2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwq3",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx5gvwwq3",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwq3",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx5gvwwq3"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx422jq8j",
                                name: "中美编负责人",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx422jq8j",
                                name: "中美编负责人",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx422jq8j",
                                name: "中美编负责人",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "中美编负责人",
                                id: "node_oclx422jq8j"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx422jq8k",
                                name: "套版美编负责人",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx422jq8k",
                                name: "套版美编负责人",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx422jq8k",
                                name: "套版美编负责人",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "套版美编负责人",
                                id: "node_oclx422jq8k"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4b3zdl3",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4b3zdl3",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4b3zdl3",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4b3zdl3"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwqz",
                                name: "中美编负责人",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx5gvwwqz",
                                name: "中美编负责人",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwqz",
                                name: "中美编负责人",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "中美编负责人",
                                id: "node_oclx5gvwwqz"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwq10",
                                name: "套版编负责人",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx5gvwwq10",
                                name: "套版编负责人",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwq10",
                                name: "套版编负责人",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "套版编负责人",
                                id: "node_oclx5gvwwq10"
                            }
                        }
                    ]
                },
                {
                    formName: "外包修图视觉流程",
                    formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
                    flowDetailsRules: [
                        {fieldId: "radioField_lx48e5gm", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclx48iwil1",
                                name: "外包修图中",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx48iwil1",
                                name: "外包修图中",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx48iwil1",
                                name: "外包修图中",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "外包修图中",
                                id: "radioField_lxzzbsbm"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx48iwil1",
                                name: "外包修图中",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx48iwil1",
                                name: "外包修图中",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx48iwil1",
                                name: "外包修图中",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "外包修图中",
                                id: "textField_lx48e5gk"
                            }
                        }
                    ]
                },
                
                {
                    formName: "运营美编修图流程",
                    formId: "FORM-D2D43EACD2564C94AC549E40B67A9EEDQFEZ",
                    flowDetailsRules: [
                        {fieldId: "radioField_lx41cnvt", opCode: opCodes.Equal, value: "半套"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclyqp11yp1",
                                name: "修图师修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclyqp11yp1",
                                name: "修图师修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "修图师修图",
                                id: "node_oclyqp11yp1"
                            }
                        },
                        {
                            from: {
                                id: "node_oclyqp11yp2",
                                name: "AI美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclyqp11yp2",
                                name: "AI美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI美编修图",
                                id: "node_oclyqp11yp2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclyqp11yp3",
                                name: "3D建模",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclyqp11yp3",
                                name: "3D建模",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "3D建模",
                                id: "node_oclyqp11yp3"
                            }
                        },
                    ]
                }
            ]
        },
        {
            nameCN: "美编已完成",
            nameEN: mbActionTypes.PS_DONE,
            rules: [
                {
                    formName: "美编任务运营发布",
                    formId: "FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS",
                    flowDetailsRules: [
                        {fieldId: "radioField_lv641k3b", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclvgh4l0z2",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvgh4l0z2",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvgh4l0z2",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvgh4l0z2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvgh4l0zb",
                                name: "精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvgh4l0zb",
                                name: "精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvgh4l0zb",
                                name: "精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "精修美编完成任务",
                                id: "node_oclvgh4l0zb"
                            }
                        },
                        {
                            from: {
                                id: "node_oclw7dfsbp6",
                                name: " 精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclw7dfsbp6",
                                name: " 精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclw7dfsbp6",
                                name: " 精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "精修美编完成任务",
                                id: "node_oclw7dfsbp6"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvgh4l0zf",
                                name: "简单任务完成",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvgh4l0zf",
                                name: "简单任务完成",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvgh4l0zf",
                                name: "简单任务完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单任务完成",
                                id: "node_oclvt49cil2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclwhrd6j62",
                                name: "建模美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclwhrd6j62",
                                name: "建模美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclwhrd6j62",
                                name: "建模美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "建模美编完成任务",
                                id: "node_oclwhrd6j62"
                            }
                        },
                    ]
                },
                
                {
                    formName: "运营视觉流程（拍摄+美编）",
                    formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                    flowDetailsRules: [
                        {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclx1f3cl77",
                                name: "小美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx1f3cl77",
                                name: "小美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx1f3cl77",
                                name: "小美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编修图",
                                id: "node_oclx1f3cl77"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx1f3cl78",
                                name: "AI作图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx1f3cl78",
                                name: "AI作图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx1f3cl78",
                                name: "AI作图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI作图",
                                id: "node_oclx1f3cl78"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx00ubuyy",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx00ubuyy",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx00ubuyy",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx00ubuyy"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4jrkfs2",
                                name: "小美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4jrkfs2",
                                name: "小美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4jrkfs2",
                                name: "小美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编修图",
                                id: "node_oclx4jrkfs2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4jrkfs3",
                                name: "AI作图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4jrkfs3",
                                name: "AI作图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4jrkfs3",
                                name: "AI作图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI作图",
                                id: "node_oclx4jrkfs3"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4jrkfs4",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4jrkfs4",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4jrkfs4",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4jrkfs4"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx30pi4f6",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx30pi4f6",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx30pi4f6",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx30pi4f6"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70w3",
                                name: "分配中美编",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70w3",
                                name: "分配中美编",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70w3",
                                name: "分配中美编",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配中美编",
                                id: "node_oclx4kc70w3"
                            }
                        },
                        {
                            from: {
                                id: "node_oclxcz6yq72",
                                name: "中美编自修",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclxcz6yq72",
                                name: "中美编自修",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclxcz6yq72",
                                name: "中美编自修",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "中美编自修",
                                id: "node_oclxcz6yq72"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx1f3cl7b",
                                name: "小美编套版",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx1f3cl7b",
                                name: "小美编套版",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx1f3cl7b",
                                name: "小美编套版",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编套版",
                                id: "node_oclx1f3cl7b"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70w6",
                                name: "外包修图数量",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70w6",
                                name: "外包修图数量",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70w6",
                                name: "外包修图数量",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "外包修图数量",
                                id: "node_oclx4kc70w6"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70w7",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70w7",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70w7",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4kc70w7"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70w2",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70w2",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70w2",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4kc70w2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4bnhfb2",
                                name: "分配中美编",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4bnhfb2",
                                name: "分配中美编",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4bnhfb2",
                                name: "分配中美编",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配中美编",
                                id: "node_oclx4bnhfb2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70w4",
                                name: "中美编自修",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70w4",
                                name: "中美编自修",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70w4",
                                name: "中美编自修",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "中美编自修",
                                id: "node_oclx4kc70w4"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70w5",
                                name: "小美编套版",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70w5",
                                name: "小美编套版",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70w5",
                                name: "小美编套版",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编套版",
                                id: "node_oclx4kc70w5"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4dqaay1",
                                name: "外包修图数量",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4dqaay1",
                                name: "外包修图数量",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4dqaay1",
                                name: "外包修图数量",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "外包修图数量",
                                id: "node_oclx4dqaay1"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4bnhfb3",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4bnhfb3",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4bnhfb3",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4bnhfb3"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wi",
                                name: "分配中美编",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70wi",
                                name: "分配中美编",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wi",
                                name: "分配中美编",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配中美编",
                                id: "node_oclx4kc70wi"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wj",
                                name: "中美编自修",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70wj",
                                name: "中美编自修",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wj",
                                name: "中美编自修",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "中美编自修",
                                id: "node_oclx4kc70wj"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wx",
                                name: "小美编套版",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70wx",
                                name: "小美编套版",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wx",
                                name: "小美编套版",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编套版",
                                id: "node_oclx4kc70wx"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wy",
                                name: "外包修图数量",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70wy",
                                name: "外包修图数量",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wy",
                                name: "外包修图数量",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "外包修图数量",
                                id: "node_oclx4kc70wy"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wz",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70wz",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wz",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4kc70wz"
                            }
                        }
                    ]
                },
                {
                    formName: "运营视觉流程（拍摄+美编）",
                    formId: "FORM-955A09160AB34B4489E96B8929AFFA2AVE2R",
                    flowDetailsRules: [
                        {fieldId: "radioField_lypub2tw", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclyqmivse6",
                                name: "AI修图完成",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclyqmivse6",
                                name: "AI修图完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI修图完成",
                                id: "node_oclyqmivse6"
                            }
                        },
                        {
                            from: {
                                id: "node_oclyqmp3fm3",
                                name: "美工修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclyqmp3fm3",
                                name: "美工修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "美工修图",
                                id: "node_oclyqmp3fm3"
                            }
                        },
                        {
                            from: {
                                id: "node_oclyqllinbj",
                                name: "美工修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclyqllinbj",
                                name: "美工修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "美工修图",
                                id: "node_oclyqllinbj"
                            }
                        },
                        {
                            from: {
                                id: "node_oclz2elklgj",
                                name: "3D建模",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclz2elklgj",
                                name: "3D建模",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "3D建模",
                                id: "node_oclz2elklgj"
                            }
                        }
                    ]
                },
                
                {
                    formName: "美编修图任务",
                    formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
                    flowDetailsRules: [
                        {fieldId: "radioField_lx41cnvt", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclx422jq87",
                                name: "小美编负责人",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx422jq87",
                                name: "小美编负责人",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx422jq87",
                                name: "小美编负责人",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编负责人",
                                id: "node_oclx422jq87"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx422jq88",
                                name: "AI修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx422jq88",
                                name: "AI修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx422jq88",
                                name: "AI修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI修图",
                                id: "node_oclx422jq88"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx422jq89",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx422jq89",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx422jq89",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx422jq89"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwq1",
                                name: "小美编负责人",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx5gvwwq1",
                                name: "小美编负责人",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwq1",
                                name: "小美编负责人",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编负责人",
                                id: "node_oclx5gvwwq1"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwq2",
                                name: "AI修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx5gvwwq2",
                                name: "AI修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwq2",
                                name: "AI修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI修图",
                                id: "node_oclx5gvwwq2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwq3",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx5gvwwq3",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwq3",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx5gvwwq3"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx422jq8j",
                                name: "中美编负责人",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx422jq8j",
                                name: "中美编负责人",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx422jq8j",
                                name: "中美编负责人",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "中美编负责人",
                                id: "node_oclx422jq8j"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx422jq8k",
                                name: "套版美编负责人",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx422jq8k",
                                name: "套版美编负责人",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx422jq8k",
                                name: "套版美编负责人",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "套版美编负责人",
                                id: "node_oclx422jq8k"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4b3zdl3",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4b3zdl3",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4b3zdl3",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4b3zdl3"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwqz",
                                name: "中美编负责人",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx5gvwwqz",
                                name: "中美编负责人",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwqz",
                                name: "中美编负责人",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "中美编负责人",
                                id: "node_oclx5gvwwqz"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwq10",
                                name: "套版编负责人",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx5gvwwq10",
                                name: "套版编负责人",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwq10",
                                name: "套版编负责人",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "套版编负责人",
                                id: "node_oclx5gvwwq10"
                            }
                        }
                    ]
                },
                {
                    formName: "外包修图视觉流程",
                    formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
                    flowDetailsRules: [
                        {fieldId: "radioField_lx48e5gm", opCode: opCodes.EqualAny, value: ["半套"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclx48iwil1",
                                name: "外包修图中",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx48iwil1",
                                name: "外包修图中",
                                status: ["HISTORYHISTORY"]
                            },
                            overdue: {
                                id: "node_oclx48iwil1",
                                name: "外包修图中",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "外包修图中",
                                id: "radioField_lxzzbsbm"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx48iwil1",
                                name: "外包修图中",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx48iwil1",
                                name: "外包修图中",
                                status: ["HISTORYHISTORY"]
                            },
                            overdue: {
                                id: "node_oclx48iwil1",
                                name: "外包修图中",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "外包修图中",
                                id: "textField_lx48e5gk"
                            }
                        }
                    ]
                },
                
                {
                    formName: "运营美编修图流程",
                    formId: "FORM-D2D43EACD2564C94AC549E40B67A9EEDQFEZ",
                    flowDetailsRules: [
                        {fieldId: "radioField_lx41cnvt", opCode: opCodes.Equal, value: "半套"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclyqp11yp1",
                                name: "修图师修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclyqp11yp1",
                                name: "修图师修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "修图师修图",
                                id: "node_oclyqp11yp1"
                            }
                        },
                        {
                            from: {
                                id: "node_oclyqp11yp2",
                                name: "AI美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclyqp11yp2",
                                name: "AI美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI修图负责人",
                                id: "node_oclyqp11yp2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclyqp11yp3",
                                name: "3D建模",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclyqp11yp3",
                                name: "3D建模",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "3D建模",
                                id: "node_oclyqp11yp3"
                            }
                        },
                    ]
                }
            ]
        }
    ]
}