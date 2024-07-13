/**
 *  flowNodeRules的调整方向：
 *  1. 每项from-to节点都是指向单一的节点，去掉逾期节点的配置
 *  2. ownerRule需要保留
 *
 *  rules：或的关系   flowDetailsRules：且的关系  flowNodeRules：或的关系
 */

const {opCodes} = require("@/const/operatorConst");

const mbActionTypes = {
    WAIT_TO_SHOOT: "WAIT_TO_SHOOT", BE_SHOOTING: "BE_SHOOTING", SHOOT_DONE: "SHOOT_DONE",
    WAIT_TO_PS: "WAIT_TO_PS", ON_PS: "BE_PS", PS_DONE: "PS_DONE",
    WAIT_TO_CUT: "WAIT_TO_CUT", BE_CUTTING: "BE_CUTTING", CUT_DONE: "CUT_DONE"
}

module.exports = {
    actionName: "散图",
    actionCode: "fragmentedPicture",
    actionStatus: [
        {
            nameCN: "待拍摄影",
            nameEN: mbActionTypes.WAIT_TO_SHOOT,
            rules: [
                // 注意：不要删掉，表单内容过滤内容不同  或的关系
                {
                    formName: "运营拍摄流程",
                    formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                    flowDetailsRules: [
                        {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "散图"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_ocllqa26nn1",
                                name: "审批视觉方案",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_ocllqa26nn1",
                                name: "审批视觉方案",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_ocllqa26nn1",
                                name: "审批视觉方案",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "审批视觉方案",
                                id: "node_ocllqa26nn1"
                            }
                        },
                        {
                            from: {
                                id: "node_oclrolj7io1",
                                name: "分配执行助理",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclrolj7io1",
                                name: "分配执行助理",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclrolj7io1",
                                name: "分配执行助理",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkml6kp",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_oclrolllmq1",
                                name: "执行准备道具",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclrolllmq1",
                                name: "执行准备道具",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclrolllmq1",
                                name: "执行准备道具",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkml6kp",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_ocliimu2ur1",
                                name: "摄影确认道具",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_ocliimu2ur1",
                                name: "摄影确认道具",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_ocliimu2ur1",
                                name: "摄影确认道具",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkml6kp",
                                defaultUserName: "张杰"
                            }
                        }
                    ]
                },
                {
                    formName: "运营拍摄流程",
                    formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                    flowDetailsRules: [
                        {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "散图"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_ocllqa26nn1",
                                name: "审批视觉方案",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_ocllqa26nn1",
                                name: "审批视觉方案",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_ocllqa26nn1",
                                name: "审批视觉方案",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "审批视觉方案",
                                id: "node_ocllqa26nn1"
                            }
                        },
                        {
                            from: {
                                id: "node_oclrolj7io1",
                                name: "分配执行助理",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclrolj7io1",
                                name: "分配执行助理",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclrolj7io1",
                                name: "分配执行助理",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkml6kp",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_oclrolllmq1",
                                name: "执行准备道具",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclrolllmq1",
                                name: "执行准备道具",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclrolllmq1",
                                name: "执行准备道具",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkml6kp",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_ocliimu2ur1",
                                name: "摄影确认道具",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_ocliimu2ur1",
                                name: "摄影确认道具",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_ocliimu2ur1",
                                name: "摄影确认道具",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkml6kp",
                                defaultUserName: "张杰"
                            }
                        }
                    ]
                },
                {
                    formName: "运营拍摄流程",
                    formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                    flowDetailsRules: [
                        {fieldId: "multiSelectField_lwvqb4bj", opCode: opCodes.Equal, value: "部分图片"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_ocllqa26nn1",
                                name: "审批视觉方案",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_ocllqa26nn1",
                                name: "审批视觉方案",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_ocllqa26nn1",
                                name: "审批视觉方案",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "审批视觉方案",
                                id: "node_ocllqa26nn1"
                            }
                        },
                        {
                            from: {
                                id: "node_oclrolj7io1",
                                name: "分配执行助理",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclrolj7io1",
                                name: "分配执行助理",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclrolj7io1",
                                name: "分配执行助理",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkml6kp",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_oclrolllmq1",
                                name: "执行准备道具",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclrolllmq1",
                                name: "执行准备道具",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclrolllmq1",
                                name: "执行准备道具",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkml6kp",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_ocliimu2ur1",
                                name: "摄影确认道具",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_ocliimu2ur1",
                                name: "摄影确认道具",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_ocliimu2ur1",
                                name: "摄影确认道具",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkml6kp",
                                defaultUserName: "张杰"
                            }
                        }
                    ]
                },

                {
                    formName: "天猫链接上架流程",
                    formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                    flowDetailsRules: [
                        {fieldId: "radioField_ltxy12s6", opCode: opCodes.Equal, value: "部分图片"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_ocln14cs9r2",
                                name: "样品与道具准备",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_ocln14cs9r2",
                                name: "样品与道具准备",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_ocln14cs9r2",
                                name: "样品与道具准备",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "样品与道具准备",
                                id: "node_ocln14cs9r2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclofn02iu1",
                                name: "审核视觉方案",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclofn02iu1",
                                name: "审核视觉方案",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclofn02iu1",
                                name: "审核视觉方案",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "审核视觉方案",
                                id: "node_oclofn02iu1"
                            }
                        }
                    ]
                },
                {
                    formName: "天猫链接上架流程",
                    formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                    flowDetailsRules: [
                        {fieldId: "multiSelectField_lwvpqf78", opCode: opCodes.NotContain, value: "套"},
                        {fieldId: "multiSelectField_lwvpqf78", opCode: opCodes.Contain, value: "部分图片"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_ocln14cs9r2",
                                name: "样品与道具准备",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_ocln14cs9r2",
                                name: "样品与道具准备",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_ocln14cs9r2",
                                name: "样品与道具准备",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "样品与道具准备",
                                id: "node_ocln14cs9r2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclofn02iu1",
                                name: "审核视觉方案",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclofn02iu1",
                                name: "审核视觉方案",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclofn02iu1",
                                name: "审核视觉方案",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "审核视觉方案",
                                id: "node_oclofn02iu1"
                            }
                        }
                    ]
                },

                {
                    formName: "运营视觉流程（拍摄+美编）",
                    formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                    flowDetailsRules: [
                        {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["散图"]}
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
                                id: "node_oclx00ubuy7"
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
                                // 指定为张杰
                                from: "process",
                                name: "审核方案分配摄像/美编负责人",
                                id: "node_oclx00ubuye"
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
                    formName: "运营新品流程",
                    formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                    flowDetailsRules: [
                        {
                            fieldId: "radioField_ltjt0ykc",
                            opCode: opCodes.EqualAny,
                            value: ["散图"]
                        }
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclkvznwuu1",
                                name: "提交竞店ID",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclkvznwuu1",
                                name: "提交竞店ID",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclkvznwuu1",
                                name: "提交竞店ID",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkss8pc",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_oclohx0w4s1",
                                name: "分配执行",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclohx0w4s1",
                                name: "分配执行",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclohx0w4s1",
                                name: "分配执行",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkss8pc",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_oclix0goa91",
                                name: "统计五维表",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclix0goa91",
                                name: "统计五维表",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclix0goa91",
                                name: "统计五维表",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkss8pc",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_oclix34wly1",
                                name: "审核执行统计五给出样品明细",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclix34wly1",
                                name: "审核执行统计五给出样品明细",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclix34wly1",
                                name: "审核执行统计五给出样品明细",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkss8pc",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_oclwketkev4",
                                name: "执行确认样品来源",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclwketkev4",
                                name: "执行确认样品来源",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclwketkev4",
                                name: "执行确认样品来源",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkss8pc",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_oclwketkev6",
                                name: "执行联系样品到公司",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclwketkev6",
                                name: "执行联系样品到公司",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclwketkev6",
                                name: "执行联系样品到公司",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkss8pc",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_oclwkf0tuy1",
                                name: "开发联系样品",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclwkf0tuy1",
                                name: "开发联系样品",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclwkf0tuy1",
                                name: "开发联系样品",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkss8pc",
                                defaultUserName: "张杰"
                            }
                        },
                        {
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
                                name: "摄影负责人",
                                id: "employeeField_lvkss8pc",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_oclto83mms5",
                                name: "组长审核方案",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclto83mms5",
                                name: "组长审核方案",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclto83mms5",
                                name: "组长审核方案",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkss8pc",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvx64tg92",
                                name: "组长审核方案",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvx64tg92",
                                name: "组长审核方案",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvx64tg92",
                                name: "组长审核方案",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkss8pc",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_oclii6vcap2",
                                name: "项目负责人审核方案",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclii6vcap2",
                                name: "项目负责人审核方案",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclii6vcap2",
                                name: "项目负责人审核方案",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkss8pc",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_ocltseng6r1",
                                name: "执行运营确认样品到公司",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_ocltseng6r1",
                                name: "执行运营确认样品到公司",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_ocltseng6r1",
                                name: "执行运营确认样品到公司",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkss8pc",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_oclii6vcap3",
                                name: "视觉方案审核",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclii6vcap3",
                                name: "视觉方案审核",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclii6vcap3",
                                name: "视觉方案审核",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "视觉方案审核",
                                id: "node_oclii6vcap3"
                            }
                        },
                        {
                            from: {
                                id: "node_oclii6vcap5",
                                name: "样品与道具确认",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclii6vcap5",
                                name: "样品与道具确认",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclii6vcap5",
                                name: "样品与道具确认",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkss8pc",
                                defaultUserName: "张杰"
                            }
                        },
                        {
                            from: {
                                id: "node_oclii6vcap6",
                                name: "摄影确认样品与道具",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclii6vcap6",
                                name: "摄影确认样品与道具",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclii6vcap6",
                                name: "摄影确认样品与道具",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "摄影负责人",
                                id: "employeeField_lvkss8pc",
                                defaultUserName: "张杰"
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
                // 注意：不要删掉，表单内容过滤内容不同  或的关系
                {
                    formName: "运营拍摄流程",
                    formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                    flowDetailsRules: [
                        {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "散图"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclrolllmq2"
                            }
                        }
                    ]
                },
                {
                    formName: "运营拍摄流程",
                    formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                    flowDetailsRules: [
                        {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "散图"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclrolllmq2"
                            }
                        }
                    ]
                },
                {
                    formName: "运营拍摄流程",
                    formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                    flowDetailsRules: [
                        {fieldId: "multiSelectField_lwvqb4bj", opCode: opCodes.Equal, value: "部分图片"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclrolllmq2"
                            }
                        }
                    ]
                },

                {
                    formName: "天猫链接上架流程",
                    formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                    flowDetailsRules: [
                        {fieldId: "radioField_ltxy12s6", opCode: opCodes.Equal, value: "部分图片"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclm91ca7l4",
                                name: "确认样品道具",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclm91ca7l4",
                                name: "确认样品道具",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclm91ca7l4",
                                name: "确认样品道具",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "确认样品道具",
                                id: "node_oclm91ca7l4"
                            }
                        },
                        {
                            from: {
                                id: "node_oclm91ca7l5",
                                name: "摄影完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclm91ca7l5",
                                name: "摄影完成",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclm91ca7l5",
                                name: "摄影完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "摄影完成",
                                id: "node_oclm91ca7l5"
                            }
                        }
                    ]
                },
                {
                    formName: "天猫链接上架流程",
                    formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                    flowDetailsRules: [
                        {fieldId: "multiSelectField_lwvpqf78", opCode: opCodes.NotContain, value: "套"},
                        {fieldId: "multiSelectField_lwvpqf78", opCode: opCodes.Contain, value: "部分图片"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclm91ca7l4",
                                name: "确认样品道具",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclm91ca7l4",
                                name: "确认样品道具",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclm91ca7l4",
                                name: "确认样品道具",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "确认样品道具",
                                id: "node_oclm91ca7l4"
                            }
                        },
                        {
                            from: {
                                id: "node_oclm91ca7l5",
                                name: "摄影完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclm91ca7l5",
                                name: "摄影完成",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclm91ca7l5",
                                name: "摄影完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "摄影完成",
                                id: "node_oclm91ca7l5"
                            }
                        }
                    ]
                },

                {
                    formName: "运营视觉流程（拍摄+美编）",
                    formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                    flowDetailsRules: [
                        {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["散图"]}
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
                                id: "node_oclxcz6yq73",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclxcz6yq73",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclxcz6yq73",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclxcz6yq73"
                            }
                        },
                        {
                            from: {
                                id: "node_oclxcz6yq74",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclxcz6yq74",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclxcz6yq74",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclxcz6yq74"
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
                    formName: "运营新品流程",
                    formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                    flowDetailsRules: [
                        {
                            fieldId: "radioField_ltjt0ykc",
                            opCode: opCodes.EqualAny,
                            value: ["散图"]
                        }
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclii6vcap6",
                                name: "摄影确认样品与道具",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclii6vcap6",
                                name: "摄影确认样品与道具",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclii6vcap6",
                                name: "摄影确认样品与道具",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "摄影确认样品与道具",
                                id: "node_oclii6vcap6"
                            }
                        },
                        {
                            from: {
                                id: "node_oclii6vcap7",
                                name: "摄影拍照",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclii6vcap7",
                                name: "摄影拍照",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclii6vcap7",
                                name: "摄影拍照",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "摄影拍照",
                                id: "node_oclii6vcap7"
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
                // 注意：不要删掉，表单内容过滤内容不同  或的关系
                {
                    formName: "运营拍摄流程",
                    formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                    flowDetailsRules: [
                        {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "散图"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            to: {

                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclrolllmq2"
                            }
                        }
                    ]
                },
                {
                    formName: "运营拍摄流程",
                    formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                    flowDetailsRules: [
                        {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "散图"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            to: {

                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclrolllmq2"
                            }
                        }
                    ]
                },
                {
                    formName: "运营拍摄流程",
                    formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                    flowDetailsRules: [
                        {fieldId: "multiSelectField_lwvqb4bj", opCode: opCodes.Equal, value: "部分图片"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            to: {

                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclrolllmq2",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclrolllmq2"
                            }
                        }
                    ]
                },

                {
                    formName: "天猫链接上架流程",
                    formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                    flowDetailsRules: [
                        {fieldId: "radioField_ltxy12s6", opCode: opCodes.Equal, value: "部分图片"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclm91ca7l5",
                                name: "摄影完成",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclm91ca7l5",
                                name: "摄影完成",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclm91ca7l5",
                                name: "摄影完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "摄影完成",
                                id: "node_oclm91ca7l5"
                            }
                        }]
                },
                {
                    formName: "天猫链接上架流程",
                    formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                    flowDetailsRules: [
                        {fieldId: "multiSelectField_lwvpqf78", opCode: opCodes.NotContain, value: "套"},
                        {fieldId: "multiSelectField_lwvpqf78", opCode: opCodes.Contain, value: "部分图片"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclm91ca7l5",
                                name: "摄影完成",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclm91ca7l5",
                                name: "摄影完成",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclm91ca7l5",
                                name: "摄影完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "摄影完成",
                                id: "node_oclm91ca7l5"
                            }
                        }]
                },

                {
                    formName: "运营视觉流程（拍摄+美编）",
                    formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                    flowDetailsRules: [
                        {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["散图"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclxcz6yq73",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclxcz6yq73",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclxcz6yq73",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclxcz6yq73"
                            }
                        },
                        {
                            from: {
                                id: "node_oclxcz6yq74",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclxcz6yq74",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclxcz6yq74",
                                name: "拍摄完成",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "拍摄完成",
                                id: "node_oclxcz6yq74"
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
                        },
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
                        }
                    ]
                },

                {
                    formName: "运营新品流程",
                    formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                    flowDetailsRules: [
                        {
                            fieldId: "radioField_ltjt0ykc",
                            opCode: opCodes.EqualAny,
                            value: ["散图"]
                        }
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclii6vcap7",
                                name: "摄影拍照",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclii6vcap7",
                                name: "摄影拍照",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclii6vcap7",
                                name: "摄影拍照",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "摄影拍照",
                                id: "node_oclii6vcap7"
                            }
                        },
                        {
                            from: {
                                id: "node_oclii6vcap7_patch1",
                                name: "摄影拍照",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclii6vcap7_patch1",
                                name: "摄影拍照",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclii6vcap7_patch1",
                                name: "摄影拍照",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "摄影拍照",
                                id: "node_oclii6vcap7_patch1"
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
                        {fieldId: "radioField_lv641k3b", opCode: opCodes.Equal, value: "散图"}
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
                // 注意：不要删掉，表单内容过滤内容不同  或的关系
                {
                    formName: "运营拍摄流程",
                    formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                    flowDetailsRules: [
                        {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "散图"}
                    ],
                    flowNodeRules: [{
                        from: {
                            id: "node_oclrj9wzny1",
                            name: "分配美编制作",
                            status: ["TODO"]
                        },
                        to: {
                            id: "node_oclrj9wzny1",
                            name: "分配美编制作",
                            status: ["TODO"]
                        },
                        overdue: {
                            id: "node_oclrj9wzny1",
                            name: "分配美编制作",
                            status: ["TODO"]
                        },
                        ownerRule: {
                            from: "process",
                            name: "分配美编制作",
                            id: "node_oclrj9wzny1"
                        }
                    }]
                },
                {
                    formName: "运营拍摄流程",
                    formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                    flowDetailsRules: [
                        {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "散图"}
                    ],
                    flowNodeRules: [{
                        from: {
                            id: "node_oclrj9wzny1",
                            name: "分配美编制作",
                            status: ["TODO"]
                        },
                        to: {
                            id: "node_oclrj9wzny1",
                            name: "分配美编制作",
                            status: ["TODO"]
                        },
                        overdue: {
                            id: "node_oclrj9wzny1",
                            name: "分配美编制作",
                            status: ["TODO"]
                        },
                        ownerRule: {
                            from: "process",
                            name: "分配美编制作",
                            id: "node_oclrj9wzny1"
                        }
                    }]
                },
                {
                    formName: "运营拍摄流程",
                    formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                    flowDetailsRules: [
                        {fieldId: "multiSelectField_lwvqb4bj", opCode: opCodes.Equal, value: "部分图片"}
                    ],
                    flowNodeRules: [{
                        from: {
                            id: "node_oclrj9wzny1",
                            name: "分配美编制作",
                            status: ["TODO"]
                        },
                        to: {
                            id: "node_oclrj9wzny1",
                            name: "分配美编制作",
                            status: ["TODO"]
                        },
                        overdue: {
                            id: "node_oclrj9wzny1",
                            name: "分配美编制作",
                            status: ["TODO"]
                        },
                        ownerRule: {
                            from: "process",
                            name: "分配美编制作",
                            id: "node_oclrj9wzny1"
                        }
                    }]
                },

                // 注意：不要删掉重复的表单（历史该表单有两个字段会表示散图，或的关系只能重复定义了）
                {
                    formName: "天猫链接上架流程",
                    formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                    flowDetailsRules: [
                        {fieldId: "radioField_ltxy12s6", opCode: opCodes.Equal, value: "部分图片"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclm91ca7l6",
                                name: "确认摄影拍摄数据量和分配美编制作",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclm91ca7l6",
                                name: "确认摄影拍摄数据量和分配美编制作",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclm91ca7l6",
                                name: "确认摄影拍摄数据量和分配美编制作",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "确认摄影拍摄数据量和分配美编制作",
                                id: "node_oclm91ca7l6"
                            }
                        },
                        {
                            from: {
                                id: "node_oclv68umqp1",
                                name: "确认美编任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclv68umqp1",
                                name: "确认美编任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclv68umqp1",
                                name: "确认美编任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "确认美编任务",
                                id: "node_oclv68umqp1"
                            }
                        }
                    ]
                },
                {
                    formName: "天猫链接上架流程",
                    formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                    flowDetailsRules: [
                        {fieldId: "multiSelectField_lwvpqf78", opCode: opCodes.NotContain, value: "套"},
                        {fieldId: "multiSelectField_lwvpqf78", opCode: opCodes.Contain, value: "部分图片"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclm91ca7l6",
                                name: "确认摄影拍摄数据量和分配美编制作",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclm91ca7l6",
                                name: "确认摄影拍摄数据量和分配美编制作",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclm91ca7l6",
                                name: "确认摄影拍摄数据量和分配美编制作",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "确认摄影拍摄数据量和分配美编制作",
                                id: "node_oclm91ca7l6"
                            }
                        },
                        {
                            from: {
                                id: "node_oclv68umqp1",
                                name: "确认美编任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclv68umqp1",
                                name: "确认美编任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclv68umqp1",
                                name: "确认美编任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "确认美编任务",
                                id: "node_oclv68umqp1"
                            }
                        }
                    ]
                },

                {
                    formName: "运营视觉流程（拍摄+美编）",
                    formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                    flowDetailsRules: [
                        {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["散图"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclx4kc70wa",
                                name: "确认修图属性",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70wa",
                                name: "确认修图属性",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wa",
                                name: "确认修图属性",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "确认修图属性",
                                id: "node_oclx4kc70wa"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5j5bv44",
                                name: "确认修图属性",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx5j5bv44",
                                name: "分配美编",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx5j5bv44",
                                name: "分配美编",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配美编",
                                id: "node_oclx5j5bv44"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5j5bv45",
                                name: "分配美编",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx5j5bv45",
                                name: "分配美编",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx5j5bv45",
                                name: "分配美编",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配美编",
                                id: "node_oclx5j5bv45"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5j5bv46",
                                name: "确认修图属性",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx5j5bv46",
                                name: "分配美编",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx5j5bv46",
                                name: "分配美编",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配美编",
                                id: "node_oclx5j5bv46"
                            }
                        },
                        {
                            from: {
                                id: "node_oclxcz6yq74",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclxcz6yq74",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclxcz6yq74",
                                name: "拍摄完成",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "form",
                                name: "大美编负责人",
                                id: "employeeField_lwyt5hfa"
                            }
                        }
                    ]
                },
                {
                    formName: "美编修图任务",
                    formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
                    flowDetailsRules: [
                        {fieldId: "radioField_lx41cnvt", opCode: opCodes.EqualAny, value: ["散图"]}
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
                        {fieldId: "radioField_lx48e5gm", opCode: opCodes.Equal, value: "散图"}
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
                },
                {
                    formName: "运营新品流程",
                    formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                    flowDetailsRules: [
                        {
                            fieldId: "radioField_ltjt0ykc",
                            opCode: opCodes.EqualAny,
                            value: ["散图"]
                        }
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclii6vcap8",
                                name: "分配美编制作",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclii6vcap8",
                                name: "分配美编制作",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclii6vcap8",
                                name: "分配美编制作",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配美编制作",
                                id: "node_oclii6vcap8"
                            }
                        }
                    ]
                },
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
                        {fieldId: "radioField_lv641k3b", opCode: opCodes.Equal, value: "散图"}
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
                                id: "node_oclvgh4l0zf"
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
                        }
                    ]
                },
                // 注意：不要删掉，表单内容过滤内容不同  或的关系
                {
                    formName: "运营拍摄流程",
                    formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                    flowDetailsRules: [
                        {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "散图"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclvkqswtb2",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtb2",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtb2",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvkqswtb2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvkqswtb3",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtb3",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtb3",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvkqswtb3"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvkqswtba",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtba",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtba",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvkqswtba"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvkqswtbb",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtbb",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtbb",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvkqswtbb"
                            }
                        },
                        // {
                        //     from: {
                        //         id: "node_oclvkqswtb4",
                        //         name: "审核美编工作",
                        //         status: ["TODO"]
                        //     },
                        //     to: {
                        //         id: "node_oclvkqswtb4",
                        //         name: "审核美编工作",
                        //         status: ["TODO"]
                        //     },
                        //     overdue: {
                        //         id: "node_oclvkqswtb4",
                        //         name: "审核美编工作",
                        //         status: ["TODO"]
                        //     },
                        //     ownerRule: {
                        //         from: "process",
                        //         name: "审核美编工作",
                        //         id: "node_oclvkqswtb4"
                        //     }
                        // },
                        // {
                        //     from: {
                        //         id: "node_oclvkqswtbc",
                        //         name: "审核美编工作",
                        //         status: ["TODO"]
                        //     },
                        //     to: {
                        //         id: "node_oclvkqswtbc",
                        //         name: "审核美编工作",
                        //         status: ["TODO"]
                        //     },
                        //     overdue: {
                        //         id: "node_oclvkqswtbc",
                        //         name: "审核美编工作",
                        //         status: ["TODO"]
                        //     },
                        //     ownerRule: {
                        //         from: "process",
                        //         name: "审核美编工作",
                        //         id: "node_oclvkqswtbc"
                        //     }
                        // }
                    ]
                },
                {
                    formName: "运营拍摄流程",
                    formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                    flowDetailsRules: [
                        {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "散图"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclvkqswtb2",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtb2",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtb2",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvkqswtb2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvkqswtb3",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtb3",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtb3",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvkqswtb3"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvkqswtba",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtba",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtba",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvkqswtba"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvkqswtbb",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtbb",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtbb",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvkqswtbb"
                            }
                        },
                        // {
                        //     from: {
                        //         id: "node_oclvkqswtb4",
                        //         name: "审核美编工作",
                        //         status: ["TODO"]
                        //     },
                        //     to: {
                        //         id: "node_oclvkqswtb4",
                        //         name: "审核美编工作",
                        //         status: ["TODO"]
                        //     },
                        //     overdue: {
                        //         id: "node_oclvkqswtb4",
                        //         name: "审核美编工作",
                        //         status: ["TODO"]
                        //     },
                        //     ownerRule: {
                        //         from: "process",
                        //         name: "审核美编工作",
                        //         id: "node_oclvkqswtb4"
                        //     }
                        // },
                        // {
                        //     from: {
                        //         id: "node_oclvkqswtbc",
                        //         name: "审核美编工作",
                        //         status: ["TODO"]
                        //     },
                        //     to: {
                        //         id: "node_oclvkqswtbc",
                        //         name: "审核美编工作",
                        //         status: ["TODO"]
                        //     },
                        //     overdue: {
                        //         id: "node_oclvkqswtbc",
                        //         name: "审核美编工作",
                        //         status: ["TODO"]
                        //     },
                        //     ownerRule: {
                        //         from: "process",
                        //         name: "审核美编工作",
                        //         id: "node_oclvkqswtbc"
                        //     }
                        // }
                    ]
                },
                {
                    formName: "运营拍摄流程",
                    formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                    flowDetailsRules: [
                        {fieldId: "multiSelectField_lwvqb4bj", opCode: opCodes.Equal, value: "部分图片"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclvkqswtb2",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtb2",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtb2",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvkqswtb2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvkqswtb3",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtb3",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtb3",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvkqswtb3"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvkqswtba",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtba",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtba",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvkqswtba"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvkqswtbb",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtbb",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtbb",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvkqswtbb"
                            }
                        },
                        // {
                        //     from: {
                        //         id: "node_oclvkqswtb4",
                        //         name: "审核美编工作",
                        //         status: ["TODO"]
                        //     },
                        //     to: {
                        //         id: "node_oclvkqswtb4",
                        //         name: "审核美编工作",
                        //         status: ["TODO"]
                        //     },
                        //     overdue: {
                        //         id: "node_oclvkqswtb4",
                        //         name: "审核美编工作",
                        //         status: ["TODO"]
                        //     },
                        //     ownerRule: {
                        //         from: "process",
                        //         name: "审核美编工作",
                        //         id: "node_oclvkqswtb4"
                        //     }
                        // },
                        // {
                        //     from: {
                        //         id: "node_oclvkqswtbc",
                        //         name: "审核美编工作",
                        //         status: ["TODO"]
                        //     },
                        //     to: {
                        //         id: "node_oclvkqswtbc",
                        //         name: "审核美编工作",
                        //         status: ["TODO"]
                        //     },
                        //     overdue: {
                        //         id: "node_oclvkqswtbc",
                        //         name: "审核美编工作",
                        //         status: ["TODO"]
                        //     },
                        //     ownerRule: {
                        //         from: "process",
                        //         name: "审核美编工作",
                        //         id: "node_oclvkqswtbc"
                        //     }
                        // }
                    ]
                },

                // 注意：不要删掉重复的表单（历史该表单有两个字段会表示散图，或的关系只能重复定义了）
                {
                    formName: "天猫链接上架流程",
                    formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                    flowDetailsRules: [
                        {fieldId: "radioField_ltxy12s6", opCode: opCodes.Equal, value: "部分图片"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclvxgf8mzc",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxgf8mzc",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxgf8mzc",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxgf8mzc"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxgf8mzd",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxgf8mzd",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxgf8mzd",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxgf8mzd"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr495",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxczr495",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxczr495",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxczr495"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr496",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxczr496",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxczr496",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr496"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr498",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxczr498",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxczr498",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxczr498"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr499",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxczr499",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxczr499",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr499"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxgf8mzf",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxgf8mzf",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxgf8mzf",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxgf8mzf"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxgf8mzg",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxgf8mzg",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxgf8mzg",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxgf8mzg"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr49g",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxczr49g",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxczr49g",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxczr49g"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr49h",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxczr49h",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxczr49h",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr49h"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr49j",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxczr49j",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxczr49j",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxczr49j"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr49k",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxczr49k",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxczr49k",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr49k"
                            }
                        }
                    ]
                },
                {
                    formName: "天猫链接上架流程",
                    formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                    flowDetailsRules: [
                        {fieldId: "multiSelectField_lwvpqf78", opCode: opCodes.NotContain, value: "套"},
                        {fieldId: "multiSelectField_lwvpqf78", opCode: opCodes.Contain, value: "部分图片"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclvxgf8mzc",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxgf8mzc",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxgf8mzc",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxgf8mzc"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxgf8mzd",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxgf8mzd",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxgf8mzd",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxgf8mzd"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr495",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxczr495",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxczr495",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxczr495"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr496",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxczr496",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxczr496",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr496"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr498",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxczr498",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxczr498",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxczr498"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr499",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxczr499",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxczr499",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr499"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxgf8mzf",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxgf8mzf",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxgf8mzf",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxgf8mzf"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxgf8mzg",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxgf8mzg",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxgf8mzg",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxgf8mzg"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr49g",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxczr49g",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxczr49g",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxczr49g"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr49h",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxczr49h",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxczr49h",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr49h"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr49j",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxczr49j",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxczr49j",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxczr49j"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr49k",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvxczr49k",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvxczr49k",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr49k"
                            }
                        }
                    ]
                },
                {
                    formName: "运营视觉流程（拍摄+美编）",
                    formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                    flowDetailsRules: [
                        {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["散图"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclx4kc70wb",
                                name: "小美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70wb",
                                name: "小美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wb",
                                name: "小美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编修图",
                                id: "node_oclx4kc70wb"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wc",
                                name: "AI作图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70wc",
                                name: "AI作图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wc",
                                name: "AI作图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI作图",
                                id: "node_oclx4kc70wc"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wd",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70wd",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wd",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4kc70wd"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70we",
                                name: "小美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70we",
                                name: "小美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70we",
                                name: "小美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编修图",
                                id: "node_oclx4kc70we"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wf",
                                name: "AI作图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70wf",
                                name: "AI作图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wf",
                                name: "AI作图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI作图",
                                id: "node_oclx4kc70wf"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wg",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70wg",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wg",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4kc70wg"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wh",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70wh",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wh",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4kc70wh"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wp",
                                name: "分配中美编",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70wp",
                                name: "分配中美编",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wp",
                                name: "分配中美编",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配中美编",
                                id: "node_oclx4kc70wp"
                            }
                        },
                        {
                            from: {
                                id: "node_oclxcz6yq75",
                                name: "中美编自修",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclxcz6yq75",
                                name: "中美编自修",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclxcz6yq75",
                                name: "中美编自修",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "中美编自修",
                                id: "node_oclxcz6yq75"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wr",
                                name: "小美编套版",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70wr",
                                name: "小美编套版",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wr",
                                name: "小美编套版",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编套版",
                                id: "node_oclx4kc70wr"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wl",
                                name: "外包修图数量",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70wl",
                                name: "外包修图数量",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wl",
                                name: "外包修图数量",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "外包修图数量",
                                id: "node_oclx4kc70wl"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wm",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70wm",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wm",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4kc70wm"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wo",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70wo",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wo",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4kc70wo"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wv",
                                name: "分配中美编",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70wv",
                                name: "分配中美编",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wv",
                                name: "分配中美编",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配中美编",
                                id: "node_oclx4kc70wv"
                            }
                        },
                        {
                            from: {
                                id: "node_oclxcz6yq76",
                                name: "中美编自修",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclxcz6yq76",
                                name: "中美编自修",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclxcz6yq76",
                                name: "中美编自修",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "中美编自修",
                                id: "node_oclxcz6yq76"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wk",
                                name: "小美编套版",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70wk",
                                name: "小美编套版",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wk",
                                name: "小美编套版",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编套版",
                                id: "node_oclx4kc70wk"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70ws",
                                name: "外包修图数量",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70ws",
                                name: "外包修图数量",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70ws",
                                name: "外包修图数量",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "外包修图数量",
                                id: "node_oclx4kc70ws"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wt",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx4kc70wt",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wt",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4kc70wt"
                            }
                        }
                    ]
                },
                {
                    formName: "美编修图任务",
                    formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
                    flowDetailsRules: [
                        {fieldId: "radioField_lx41cnvt", opCode: opCodes.EqualAny, value: ["散图"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclx5gvwwq4",
                                name: "小美编负责人",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx5gvwwq4",
                                name: "小美编负责人",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwq4",
                                name: "小美编负责人",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编负责人",
                                id: "node_oclx5gvwwq4"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwq5",
                                name: "AI修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx5gvwwq5",
                                name: "AI修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwq5",
                                name: "AI修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI修图",
                                id: "node_oclx5gvwwq5"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwq6",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx5gvwwq6",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwq6",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx5gvwwq6"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwq7",
                                name: "小美编负责人",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx5gvwwq7",
                                name: "小美编负责人",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwq7",
                                name: "小美编负责人",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编负责人",
                                id: "node_oclx5gvwwq7"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwq8",
                                name: "AI修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx5gvwwq8",
                                name: "AI修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwq8",
                                name: "AI修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI修图",
                                id: "node_oclx5gvwwq8"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwq9",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx5gvwwq9",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwq9",
                                name: "大美编修图",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx5gvwwq9"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwqd",
                                name: "中美编负责人",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx5gvwwqd",
                                name: "中美编负责人",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwqd",
                                name: "中美编负责人",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "中美编负责人",
                                id: "node_oclx5gvwwqd"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwqe",
                                name: "套版美编负责人",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclx5gvwwqe",
                                name: "套版美编负责人",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwqe",
                                name: "套版美编负责人",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "套版美编负责人",
                                id: "node_oclx5gvwwqe"
                            }
                        }
                    ]
                },
                {
                    formName: "外包修图视觉流程",
                    formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
                    flowDetailsRules: [
                        {fieldId: "radioField_lx48e5gm", opCode: opCodes.Equal, value: "散图"}
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
                    formName: "运营新品流程",
                    formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                    flowDetailsRules: [
                        {
                            fieldId: "radioField_ltjt0ykc",
                            opCode: opCodes.EqualAny,
                            value: ["散图"]
                        }
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclvksud0d8",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvksud0d8",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvksud0d8",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvksud0d8"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvksud0d9",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvksud0d9",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvksud0d9",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvksud0d9"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvksud0db",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvksud0db",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvksud0db",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvksud0db"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvksud0dc",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvksud0dc",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvksud0dc",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvksud0dc"
                            }
                        },
                        // {
                        //     from: {
                        //         id: "node_ockpz6phx73",
                        //         name: "视觉完成确认审核",
                        //         status: ["TODO"]
                        //     },
                        //     to: {
                        //         id: "node_ockpz6phx73",
                        //         name: "视觉完成确认审核",
                        //         status: ["TODO"]
                        //     },
                        //     overdue: {
                        //         id: "node_ockpz6phx73",
                        //         name: "视觉完成确认审核",
                        //         status: ["TODO"]
                        //     },
                        //     ownerRule: {
                        //         from: "process",
                        //         name: "视觉完成确认审核",
                        //         id: "node_ockpz6phx73"
                        //     }
                        // }
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
                        {fieldId: "radioField_lv641k3b", opCode: opCodes.Equal, value: "散图"}
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
                        }
                    ]
                },
                // 注意：不要删掉，表单内容过滤内容不同  或的关系
                {
                    formName: "运营拍摄流程",
                    formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                    flowDetailsRules: [
                        {fieldId: "radioField_lv7hq6e1", opCode: opCodes.Equal, value: "散图"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclvkqswtb2",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvkqswtb2",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvkqswtb2",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvkqswtb2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvkqswtb3",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtb3",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtb3",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvkqswtb3"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvkqswtba",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtba",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtba",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvkqswtba"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvkqswtbb",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtbb",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtbb",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvkqswtbb"
                            }
                        },
                        //     {
                        //     from: {
                        //         id: "node_oclvkqswtb4",
                        //         name: "审核美编工作",
                        //         status: ["HISTORY"]
                        //     },
                        //     to: {
                        //         id: "node_oclvkqswtb4",
                        //         name: "审核美编工作",
                        //         status: ["HISTORY"]
                        //     },
                        //     overdue: {
                        //         id: "node_oclvkqswtb4",
                        //         name: "审核美编工作",
                        //         status: ["HISTORY"]
                        //     },
                        //     ownerRule: {
                        //         from: "process",
                        //         name: "审核美编工作",
                        //         id: "node_oclvkqswtb4"
                        //     }
                        // },
                        //     {
                        //         from: {
                        //             id: "node_oclvkqswtbc",
                        //             name: "审核美编工作",
                        //             status: ["HISTORY"]
                        //         },
                        //         to: {
                        //             id: "node_oclvkqswtbc",
                        //             name: "审核美编工作",
                        //             status: ["HISTORY"]
                        //         },
                        //         overdue: {
                        //             id: "node_oclvkqswtbc",
                        //             name: "审核美编工作",
                        //             status: ["HISTORY"]
                        //         },
                        //         ownerRule: {
                        //             from: "process",
                        //             name: "审核美编工作",
                        //             id: "node_oclvkqswtbc"
                        //         }
                        //     }
                    ]
                },
                {
                    formName: "运营拍摄流程",
                    formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                    flowDetailsRules: [
                        {fieldId: "selectField_ljxvfuiw", opCode: opCodes.Equal, value: "散图"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclvkqswtb2",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvkqswtb2",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvkqswtb2",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvkqswtb2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvkqswtb3",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtb3",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtb3",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvkqswtb3"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvkqswtba",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtba",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtba",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvkqswtba"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvkqswtbb",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtbb",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtbb",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvkqswtbb"
                            }
                        },
                        //     {
                        //     from: {
                        //         id: "node_oclvkqswtb4",
                        //         name: "审核美编工作",
                        //         status: ["HISTORY"]
                        //     },
                        //     to: {
                        //         id: "node_oclvkqswtb4",
                        //         name: "审核美编工作",
                        //         status: ["HISTORY"]
                        //     },
                        //     overdue: {
                        //         id: "node_oclvkqswtb4",
                        //         name: "审核美编工作",
                        //         status: ["HISTORY"]
                        //     },
                        //     ownerRule: {
                        //         from: "process",
                        //         name: "审核美编工作",
                        //         id: "node_oclvkqswtb4"
                        //     }
                        // },
                        //     {
                        //         from: {
                        //             id: "node_oclvkqswtbc",
                        //             name: "审核美编工作",
                        //             status: ["HISTORY"]
                        //         },
                        //         to: {
                        //             id: "node_oclvkqswtbc",
                        //             name: "审核美编工作",
                        //             status: ["HISTORY"]
                        //         },
                        //         overdue: {
                        //             id: "node_oclvkqswtbc",
                        //             name: "审核美编工作",
                        //             status: ["HISTORY"]
                        //         },
                        //         ownerRule: {
                        //             from: "process",
                        //             name: "审核美编工作",
                        //             id: "node_oclvkqswtbc"
                        //         }
                        //     }
                    ]
                },
                {
                    formName: "运营拍摄流程",
                    formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
                    flowDetailsRules: [
                        {fieldId: "multiSelectField_lwvqb4bj", opCode: opCodes.Equal, value: "部分图片"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclvkqswtb2",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvkqswtb2",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvkqswtb2",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvkqswtb2"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvkqswtb3",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtb3",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtb3",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvkqswtb3"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvkqswtba",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtba",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtba",
                                name: "重点精修美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvkqswtba"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvkqswtbb",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            to: {
                                id: "node_oclvkqswtbb",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            overdue: {
                                id: "node_oclvkqswtbb",
                                name: "简单美编完成任务",
                                status: ["TODO"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvkqswtbb"
                            }
                        },
                        //     {
                        //     from: {
                        //         id: "node_oclvkqswtb4",
                        //         name: "审核美编工作",
                        //         status: ["HISTORY"]
                        //     },
                        //     to: {
                        //         id: "node_oclvkqswtb4",
                        //         name: "审核美编工作",
                        //         status: ["HISTORY"]
                        //     },
                        //     overdue: {
                        //         id: "node_oclvkqswtb4",
                        //         name: "审核美编工作",
                        //         status: ["HISTORY"]
                        //     },
                        //     ownerRule: {
                        //         from: "process",
                        //         name: "审核美编工作",
                        //         id: "node_oclvkqswtb4"
                        //     }
                        // },
                        //     {
                        //         from: {
                        //             id: "node_oclvkqswtbc",
                        //             name: "审核美编工作",
                        //             status: ["HISTORY"]
                        //         },
                        //         to: {
                        //             id: "node_oclvkqswtbc",
                        //             name: "审核美编工作",
                        //             status: ["HISTORY"]
                        //         },
                        //         overdue: {
                        //             id: "node_oclvkqswtbc",
                        //             name: "审核美编工作",
                        //             status: ["HISTORY"]
                        //         },
                        //         ownerRule: {
                        //             from: "process",
                        //             name: "审核美编工作",
                        //             id: "node_oclvkqswtbc"
                        //         }
                        //     }
                    ]
                },

                // 注意：不要删掉重复的表单（历史该表单有两个字段会表示散图，或的关系只能重复定义了）
                {
                    formName: "天猫链接上架流程",
                    formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                    flowDetailsRules: [
                        {fieldId: "radioField_ltxy12s6", opCode: opCodes.Equal, value: "部分图片"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclvxgf8mzc",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxgf8mzc",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxgf8mzc",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxgf8mzc"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxgf8mzd",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxgf8mzd",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxgf8mzd",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxgf8mzd"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr495",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr495",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr495",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxczr495"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr496",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr496",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr496",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr496"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr498",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr498",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr498",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxczr498"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr499",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr499",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr499",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr499"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxgf8mzf",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxgf8mzf",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxgf8mzf",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxgf8mzf"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxgf8mzg",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxgf8mzg",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxgf8mzg",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxgf8mzg"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr49g",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr49g",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr49g",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxczr49g"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr49h",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr49h",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr49h",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr49h"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr49j",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr49j",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr49j",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxczr49j"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr49k",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr49k",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr49k",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr49k"
                            }
                        }
                    ]
                },
                {
                    formName: "天猫链接上架流程",
                    formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
                    flowDetailsRules: [
                        {fieldId: "multiSelectField_lwvpqf78", opCode: opCodes.NotContain, value: "套"},
                        {fieldId: "multiSelectField_lwvpqf78", opCode: opCodes.Contain, value: "部分图片"}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclvxgf8mzc",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxgf8mzc",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxgf8mzc",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxgf8mzc"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxgf8mzd",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxgf8mzd",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxgf8mzd",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxgf8mzd"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr495",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr495",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr495",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxczr495"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr496",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr496",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr496",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr496"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr498",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr498",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr498",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxczr498"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr499",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr499",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr499",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr499"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxgf8mzf",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxgf8mzf",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxgf8mzf",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxgf8mzf"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxgf8mzg",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxgf8mzg",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxgf8mzg",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxgf8mzg"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr49g",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr49g",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr49g",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxczr49g"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr49h",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr49h",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr49h",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr49h"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr49j",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr49j",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr49j",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvxczr49j"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvxczr49k",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvxczr49k",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvxczr49k",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvxczr49k"
                            }
                        }
                    ]
                },
                {
                    formName: "运营视觉流程（拍摄+美编）",
                    formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
                    flowDetailsRules: [
                        {fieldId: "radioField_lwyq3if9", opCode: opCodes.EqualAny, value: ["散图"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclx4kc70wb",
                                name: "小美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70wb",
                                name: "小美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wb",
                                name: "小美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编修图",
                                id: "node_oclx4kc70wb"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wc",
                                name: "AI作图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70wc",
                                name: "AI作图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wc",
                                name: "AI作图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI作图",
                                id: "node_oclx4kc70wc"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wd",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70wd",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wd",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4kc70wd"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70we",
                                name: "小美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70we",
                                name: "小美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70we",
                                name: "小美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编修图",
                                id: "node_oclx4kc70we"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wf",
                                name: "AI作图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70wf",
                                name: "AI作图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wf",
                                name: "AI作图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI作图",
                                id: "node_oclx4kc70wf"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wg",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70wg",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wg",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4kc70wg"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wh",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70wh",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wh",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4kc70wh"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wp",
                                name: "分配中美编",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70wp",
                                name: "分配中美编",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wp",
                                name: "分配中美编",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配中美编",
                                id: "node_oclx4kc70wp"
                            }
                        },
                        {
                            from: {
                                id: "node_oclxcz6yq75",
                                name: "中美编自修",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclxcz6yq75",
                                name: "中美编自修",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclxcz6yq75",
                                name: "中美编自修",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "中美编自修",
                                id: "node_oclxcz6yq75"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wr",
                                name: "小美编套版",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70wr",
                                name: "小美编套版",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wr",
                                name: "小美编套版",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编套版",
                                id: "node_oclx4kc70wr"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wl",
                                name: "外包修图数量",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70wl",
                                name: "外包修图数量",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wl",
                                name: "外包修图数量",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "外包修图数量",
                                id: "node_oclx4kc70wl"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wm",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70wm",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wm",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4kc70wm"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wo",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70wo",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wo",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4kc70wo"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wv",
                                name: "分配中美编",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70wv",
                                name: "分配中美编",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wv",
                                name: "分配中美编",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "分配中美编",
                                id: "node_oclx4kc70wv"
                            }
                        },
                        {
                            from: {
                                id: "node_oclxcz6yq76",
                                name: "中美编自修",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclxcz6yq76",
                                name: "中美编自修",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclxcz6yq76",
                                name: "中美编自修",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "中美编自修",
                                id: "node_oclxcz6yq76"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wk",
                                name: "小美编套版",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70wk",
                                name: "小美编套版",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wk",
                                name: "小美编套版",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编套版",
                                id: "node_oclx4kc70wk"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70ws",
                                name: "外包修图数量",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70ws",
                                name: "外包修图数量",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70ws",
                                name: "外包修图数量",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "外包修图数量",
                                id: "node_oclx4kc70ws"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx4kc70wt",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx4kc70wt",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx4kc70wt",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx4kc70wt"
                            }
                        }
                    ]
                },
                {
                    formName: "美编修图任务",
                    formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
                    flowDetailsRules: [
                        {fieldId: "radioField_lx41cnvt", opCode: opCodes.EqualAny, value: ["散图"]}
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclx5gvwwq4",
                                name: "小美编负责人",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx5gvwwq4",
                                name: "小美编负责人",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwq4",
                                name: "小美编负责人",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编负责人",
                                id: "node_oclx5gvwwq4"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwq5",
                                name: "AI修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx5gvwwq5",
                                name: "AI修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwq5",
                                name: "AI修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI修图",
                                id: "node_oclx5gvwwq5"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwq6",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx5gvwwq6",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwq6",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx5gvwwq6"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwq7",
                                name: "小美编负责人",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx5gvwwq7",
                                name: "小美编负责人",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwq7",
                                name: "小美编负责人",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "小美编负责人",
                                id: "node_oclx5gvwwq7"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwq8",
                                name: "AI修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx5gvwwq8",
                                name: "AI修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwq8",
                                name: "AI修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "AI修图",
                                id: "node_oclx5gvwwq8"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwq9",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx5gvwwq9",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwq9",
                                name: "大美编修图",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "大美编修图",
                                id: "node_oclx5gvwwq9"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwqd",
                                name: "中美编负责人",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx5gvwwqd",
                                name: "中美编负责人",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwqd",
                                name: "中美编负责人",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "中美编负责人",
                                id: "node_oclx5gvwwqd"
                            }
                        },
                        {
                            from: {
                                id: "node_oclx5gvwwqe",
                                name: "套版美编负责人",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclx5gvwwqe",
                                name: "套版美编负责人",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclx5gvwwqe",
                                name: "套版美编负责人",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "套版美编负责人",
                                id: "node_oclx5gvwwqe"
                            }
                        }
                    ]
                },
                {
                    formName: "外包修图视觉流程",
                    formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
                    flowDetailsRules: [
                        {fieldId: "radioField_lx48e5gm", opCode: opCodes.EqualAny, value: ["散图"]}
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
                    formName: "运营新品流程",
                    formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
                    flowDetailsRules: [
                        {
                            fieldId: "radioField_ltjt0ykc",
                            opCode: opCodes.EqualAny,
                            value: ["散图"]
                        }
                    ],
                    flowNodeRules: [
                        {
                            from: {
                                id: "node_oclvksud0d8",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvksud0d8",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvksud0d8",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvksud0d8"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvksud0d9",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvksud0d9",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvksud0d9",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvksud0d9"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvksud0db",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvksud0db",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvksud0db",
                                name: "重点精修美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "重点精修美编完成任务",
                                id: "node_oclvksud0db"
                            }
                        },
                        {
                            from: {
                                id: "node_oclvksud0dc",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            to: {
                                id: "node_oclvksud0dc",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            overdue: {
                                id: "node_oclvksud0dc",
                                name: "简单美编完成任务",
                                status: ["HISTORY"]
                            },
                            ownerRule: {
                                from: "process",
                                name: "简单美编完成任务",
                                id: "node_oclvksud0dc"
                            }
                        },
                    ]
                },
            ]
        }
    ]
}