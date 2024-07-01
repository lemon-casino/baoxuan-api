const flowFormService = require("@/service/flowFormService")
const assert = require('assert')

describe("refactorReviewItems", () => {
    it("line", async () => {
        const reviewItems = [
            {
                "componentName": "ApplyNode",
                "id": "node_ockpz6phx72",
                "props": {
                    "nodeName": "ApplyNode",
                    "name": {
                        "en_US": "start",
                        "zh_CN": "发起",
                        "type": "i18n"
                    },
                    "conditions": {
                        "priority": 1
                    }
                }
            },
            {
                "componentName": "OperatorNode",
                "id": "node_oclv2c2ehf1",
                "props": {
                    "nodeName": "OperatorNode",
                    "name": "开发交接确认样品",
                    "description": "请选择执行人",
                    "approverRules": {
                        "type": "ext_target_approval",
                        "approvals": [
                            {
                                "id": "01576511383236229829",
                                "label": "邓健康",
                                "type": "employee",
                                "roleType": "DINGTALK",
                                "avatar": "//img.alicdn.com/tfs/TB1mKVJSpXXXXcwaXXXXXXXXXXX-78-80.jpg"
                            }
                        ],
                        "description": "邓健康"
                    },
                    "title": "开发交接确认样品"
                },
                "title": "执行人"
            },
            {
                "componentName": "OperatorNode",
                "id": "node_oclv2ayeqt1",
                "props": {
                    "nodeName": "OperatorNode",
                    "name": "统计预估销量与样品需求",
                    "description": "请选择执行人",
                    "approverRules": {
                        "type": "ext_target_approval",
                        "approvals": [
                            {
                                "id": "01576511383236229829",
                                "label": "邓健康",
                                "type": "employee",
                                "roleType": "DINGTALK",
                                "avatar": "//img.alicdn.com/tfs/TB1mKVJSpXXXXcwaXXXXXXXXXXX-78-80.jpg"
                            }
                        ],
                        "description": "邓健康"
                    },
                    "title": "统计预估销量与样品需求"
                },
                "title": "执行人"
            },
            {
                "componentName": "OperatorNode",
                "id": "node_ocliid9xm74",
                "props": {
                    "nodeName": "OperatorNode",
                    "name": "分配采购办理人",
                    "description": "请选择执行人",
                    "nodeError": "",
                    "title": "分配采购办理人",
                    "noActionersType": "stopProcess",
                    "conditions": {
                        "priority": 10
                    }
                },
                "title": "执行人"
            },
            {
                "componentName": "OperatorNode",
                "id": "node_oclkxfaina1",
                "props": {
                    "nodeName": "OperatorNode",
                    "name": "周转订货合同说明",
                    "description": "请选择执行人",
                    "approverRules": {
                        "type": "ext_target_approval_variable",
                        "formMember": [
                            {
                                "deep": 0,
                                "value": "employeeField_lii9qts7",
                                "label": "采购办理人",
                                "multiple": false
                            }
                        ],
                        "description": "表单成员：采购办理人"
                    },
                    "title": "周转订货合同说明",
                    "conditions": {
                        "priority": 11
                    }
                },
                "title": "执行人"
            },
            {
                "componentName": "OperatorNode",
                "id": "node_ocliidtnye1",
                "props": {
                    "nodeName": "OperatorNode",
                    "name": "采购办理订货",
                    "description": "请选择执行人",
                    "conditions": {
                        "priority": 12
                    }
                },
                "title": "执行人"
            },
            {
                "componentName": "OperatorNode",
                "id": "node_oclqnoegtn1",
                "props": {
                    "nodeName": "OperatorNode",
                    "name": "货品到仓确认",
                    "description": "请选择执行人",
                    "title": "货品到仓确认",
                    "conditions": {
                        "priority": 13
                    }
                },
                "title": "执行人"
            },
            {
                "componentName": "CarbonNode",
                "id": "node_oclp9c3fe21",
                "props": {
                    "nodeName": "CarbonNode",
                    "name": "抄送人",
                    "description": "请选择抄送人",
                    "approverRules": {
                        "type": "ext_target_approval_originator",
                        "description": "发起人本人"
                    },
                    "conditions": {
                        "priority": 15
                    }
                },
                "title": "抄送人"
            },
            {
                "componentName": "EndNode",
                "id": "node_ockpz6phx78",
                "props": {
                    "name": {
                        "en_US": "end",
                        "zh_CN": "结束",
                        "type": "i18n"
                    },
                    "conditions": {
                        "priority": 16
                    }
                }
            }
        ]
        const result = flowFormService.refactorReviewItems(reviewItems, null)
        assert.equal(result[0].lastNode, undefined)
        assert.equal(result[0].lastTimingNodes, undefined)
        assert.equal(result[0].time, undefined)
        assert.equal(result[1].time, 0)
        assert.equal(result[1].isTime, true)
        assert.equal(result[1].lastNode, "node_ockpz6phx72")
        assert.equal(result[1].lastTimingNodes.length, 0)
        assert.equal(result[1].lastTimingNodes[0], undefined)
        assert.equal(result[2].lastTimingNodes[0], "node_oclv2c2ehf1")
        assert.equal(result[3].lastTimingNodes[0], "node_oclv2ayeqt1")
        assert.equal(result[4].lastTimingNodes[0], "node_ocliid9xm74")
        assert.equal(result[5].lastTimingNodes[0], "node_oclkxfaina1")
        assert.equal(result[6].lastTimingNodes[0], "node_ocliidtnye1")
        assert.equal(result[7].lastTimingNodes, undefined)
        assert.equal(result[8].lastTimingNodes, null)
    })

    it("commonCondition", () => {
        const reviewItems = [
            {
                "componentName": "ApplyNode",
                "id": "node_ockpz6phx72",
                "props": {
                    "nodeName": "ApplyNode",
                    "name": {
                        "en_US": "start",
                        "zh_CN": "发起",
                        "type": "i18n"
                    }
                }
            },
            {
                "componentName": "ConditionContainer",
                "id": "node_ocltzh0nbm1",
                "props": {},
                "title": "条件分支",
                "children": [
                    {
                        "componentName": "ConditionNode",
                        "id": "node_ocltzh0nbm2",
                        "props": {
                            "name": "条件1",
                            "description": "",
                            "conditions": {
                                "calculate": "condition",
                                "isDefault": false,
                                "priority": 1,
                                "description": "动作属性等于视频剪辑与发布"
                            }
                        },
                        "children": [
                            {
                                "componentName": "OperatorNode",
                                "id": "node_ocluwe3jmp1",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "执行人",
                                    "description": "请选择执行人"
                                },
                                "title": "执行人"
                            },
                            {
                                "componentName": "ApprovalNode",
                                "id": "node_ocltzh0nbm6",
                                "props": {
                                    "nodeName": "ApprovalNode",
                                    "name": "审批人",
                                    "description": "请选择审批人",
                                    "conditions": {
                                        "priority": 4
                                    }
                                },
                                "title": "审批人"
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_ocltzh0nbm7",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "分配执行发布",
                                    "description": "请选择执行人",
                                    "title": "分配执行发布",
                                    "conditions": {
                                        "priority": 5
                                    }
                                },
                                "title": "执行人"
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_ocltzh0nbm8",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "发布完成",
                                    "description": "请选择执行人",
                                    "title": "发布完成",
                                    "nodeError": "",
                                    "conditions": {
                                        "priority": 6
                                    }
                                },
                                "title": "执行人"
                            }
                        ]
                    },
                    {
                        "componentName": "ConditionNode",
                        "id": "node_ocltzh0nbm3",
                        "props": {
                            "isDefault": true,
                            "buttons": [
                                {
                                    "name": "关闭"
                                }
                            ],
                            "name": "其他情况",
                            "description": ""
                        },
                        "children": [
                            {
                                "componentName": "OperatorNode",
                                "id": "node_ocltzh0nbm9",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "分配执行人",
                                    "description": "请选择执行人",
                                    "title": "分配执行人",
                                    "conditions": {
                                        "priority": 2
                                    }
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_ocltzh0nbma",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "执行完成任务",
                                    "description": "请选择执行人",
                                    "title": "执行完成任务",
                                    "conditions": {
                                        "priority": 3
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "componentName": "ApprovalNode",
                "id": "node_ockpz6phx73",
                "props": {
                    "nodeName": "ApprovalNode",
                    "name": "发起人审核任务",
                    "description": {
                        "en_US": "Sponsor approval",
                        "zh_CN": "发起人审批",
                        "type": "i18n"
                    },
                    "title": "发起人审核任务"
                },
                "title": {
                    "en_US": "ApprovalNode",
                    "zh_CN": "审批人",
                    "type": "i18n"
                }
            },
            {
                "componentName": "EndNode",
                "id": "node_ockpz6phx78",
                "props": {
                    "name": {
                        "en_US": "end",
                        "zh_CN": "结束",
                        "type": "i18n"
                    }
                }
            }
        ]

        const result = flowFormService.refactorReviewItems(reviewItems, null)
        // 发起
        assert.equal(result[0].lastNode, undefined)
        assert.equal(result[0].lastTimingNodes, undefined)
        assert.equal(result[0].time, undefined)
        // 条件分支
        assert.equal(result[1].time, null)
        assert.equal(result[1].lastNode, "node_ockpz6phx72")
        // 条件1
        assert.equal(result[1].children[0].time, null)
        assert.equal(result[1].children[0].lastNode, null)
        assert.equal(result[1].children[0].lastTimingNodes, null)
        // 条件1- step1
        assert.equal(result[1].children[0].children[0].time, 0)
        assert.equal(result[1].children[0].children[0].lastNode, null)
        assert.equal(result[1].children[0].children[0].lastTimingNodes.length, 0)
        assert.equal(result[1].children[0].children[0].lastTimingNodes[0], undefined)
        assert.equal(result[1].children[0].children[0].time, 0)
        // 条件1-step2
        assert.equal(result[1].children[0].children[1].lastTimingNodes.length, 1)
        assert.equal(result[1].children[0].children[1].lastTimingNodes, "node_ocluwe3jmp1")
        assert.equal(result[1].children[0].children[1].time, 0)
        // 条件1-step3
        assert.equal(result[1].children[0].children[2].lastTimingNodes.length, 1)
        assert.equal(result[1].children[0].children[2].lastTimingNodes[0], "node_ocltzh0nbm6")
        assert.equal(result[1].children[0].children[2].time, 0)
        // 条件1-step4
        assert.equal(result[1].children[0].children[3].lastTimingNodes.length, 1)
        assert.equal(result[1].children[0].children[3].lastTimingNodes[0], "node_ocltzh0nbm7")
        assert.equal(result[1].children[0].children[3].time, 0)

        // 条件2
        assert.equal(result[1].children[1].time, null)
        assert.equal(result[1].children[1].lastNode, "node_ocltzh0nbm2")
        assert.equal(result[1].children[1].lastTimingNodes, null)
        // 条件2-step1
        assert.equal(result[1].children[1].children[0].time, 0)
        assert.equal(result[1].children[1].children[0].lastTimingNodes[0], undefined)
        // 条件2-step2
        assert.equal(result[1].children[1].children[1].time, 0)
        assert.equal(result[1].children[1].children[1].lastTimingNodes[0], "node_ocltzh0nbm9")

        // 审核
        assert.equal(result[2].time, 0)
        assert.equal(result[2].lastNode, "node_ocltzh0nbm1")
        assert.equal(result[2].lastTimingNodes.length, 0)
        assert.equal(result[2].lastTimingNodes.includes("node_ocltzh0nbm8"), false)
        assert.equal(result[2].lastTimingNodes.includes("node_ocltzh0nbma"), false)

        // 结束
        assert.equal(result[3].time, null)
        assert.equal(result[3].lastNode, "node_ockpz6phx73")
    })

    it("parallelCondition", () => {
        const reviewItems = [
            {
                "componentName": "ApplyNode",
                "id": "node_ockpz6phx72",
                "props": {
                    "nodeName": "ApplyNode",
                    "name": {
                        "en_US": "start",
                        "zh_CN": "发起",
                        "type": "i18n"
                    },

                    "conditions": {
                        "priority": 1
                    }
                }
            },
            {
                "componentName": "OperatorNode",
                "id": "node_oclv2c2ehf1",
                "props": {
                    "nodeName": "OperatorNode",
                    "name": "开发交接确认样品",
                    "description": "请选择执行人",
                    "title": "开发交接确认样品"
                },
                "title": "执行人"
            },
            {
                "componentName": "ConditionContainer",
                "id": "node_oclv1t0i391",
                "props": {
                    "name": "并行分支",
                    "conditions": {
                        "priority": 2
                    }
                },
                "type": "parallel",
                "children": [
                    {
                        "componentName": "ParallelNode",
                        "id": "node_oclv1t0i392",
                        "props": {
                            "name": "条件1",
                            "description": "",
                            "nodeError": ""
                        },
                        "children": [
                            {
                                "componentName": "ApprovalNode",
                                "id": "node_oclv1t0i396",
                                "props": {
                                    "nodeName": "ApprovalNode",
                                    "name": "审核产品",
                                    "description": {
                                        "en_US": "Sponsor approval",
                                        "zh_CN": "发起人审批",
                                        "type": "i18n"
                                    },
                                    "title": "审核产品",
                                    "conditions": {
                                        "priority": 1
                                    }
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclv1t0i397",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "分配运营分析",
                                    "description": "请选择执行人",
                                    "title": "分配运营分析",
                                    "conditions": {
                                        "priority": 2
                                    }
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclklxv8kk1",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "运营负责人提交市场统计模板",
                                    "description": "请选择执行人",
                                    "title": "运营负责人提交市场统计模板"
                                },
                                "title": "执行人"
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclix0mfzn1",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "执行提交市场分析表",
                                    "description": "请选择执行人",
                                    "title": "执行提交市场分析表",
                                    "conditions": {
                                        "priority": 4
                                    }
                                },
                                "title": "执行人"
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_ocliieab3b1",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "运营提交市场分析方案",
                                    "description": "请选择执行人",
                                    "title": "运营提交市场分析方案",
                                    "conditions": {
                                        "priority": 5
                                    }
                                },
                                "title": "执行人"
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclv2a2mj4d",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "分配运营分析",
                                    "description": "请选择执行人",
                                    "nodeError": "",
                                    "title": "分配运营分析",
                                    "noActionersType": "stopProcess",
                                    "conditions": {
                                        "priority": 6
                                    }
                                }
                            },
                            {
                                "componentName": "ConditionContainer",
                                "id": "node_oclv2a2mj4e",
                                "props": {
                                    "conditions": {
                                        "priority": 7
                                    }
                                },
                                "title": "条件分支",
                                "children": [
                                    {
                                        "componentName": "ConditionNode",
                                        "id": "node_oclv2a2mj4f",
                                        "props": {
                                            "name": "条件1",
                                            "description": "",
                                        },
                                        "children": [
                                            {
                                                "componentName": "ApprovalNode",
                                                "id": "node_oclv2a2mj4h",
                                                "props": {
                                                    "nodeName": "ApprovalNode",
                                                    "name": "审核方案",
                                                    "description": "请选择审批人",
                                                    "title": "审核方案"
                                                }
                                            },
                                            {
                                                "componentName": "ApprovalNode",
                                                "id": "node_oclv2a2mj4i",
                                                "props": {
                                                    "nodeName": "ApprovalNode",
                                                    "name": "审核方案",
                                                    "description": "请选择审批人",
                                                    "title": "审核方案"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "componentName": "ConditionNode",
                                        "id": "node_oclv2a2mj4j",
                                        "props": {
                                            "name": "条件1",
                                            "description": "",
                                        },
                                        "children": [
                                            {
                                                "componentName": "ApprovalNode",
                                                "id": "node_oclv2a2mj4k",
                                                "props": {
                                                    "nodeName": "ApprovalNode",
                                                    "name": "审核方案",
                                                    "description": "请选择审批人",
                                                    "conditions": {
                                                        "priority": 2
                                                    },
                                                    "title": "审核方案"
                                                }
                                            },
                                            {
                                                "componentName": "ApprovalNode",
                                                "id": "node_oclv2a2mj4l",
                                                "props": {
                                                    "nodeName": "ApprovalNode",
                                                    "name": "审核方案",
                                                    "description": "请选择审批人",
                                                    "conditions": {
                                                        "priority": 3
                                                    },
                                                    "title": "审核方案",
                                                    "formConfig": {},
                                                    "noActionersType": "stopProcess",
                                                    "timeoutRules": []
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "componentName": "ConditionNode",
                                        "id": "node_oclv2a2mj4g",
                                        "props": {
                                            "isDefault": true,
                                            "buttons": [
                                                {
                                                    "name": "关闭"
                                                }
                                            ],
                                            "name": "其他情况",
                                            "description": "",
                                            "conditions": {
                                                "priority": 3
                                            }
                                        },
                                        "children": [
                                            {
                                                "componentName": "ApprovalNode",
                                                "id": "node_oclv2a2mj4m",
                                                "props": {
                                                    "nodeName": "ApprovalNode",
                                                    "name": "审核方案",
                                                    "description": "请选择审批人",
                                                    "title": "审核方案"
                                                },
                                                "title": "审批人"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclt56puo91",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "样品到公司交接运营",
                                    "description": "请选择执行人",
                                    "approverRules": {
                                        "type": "ext_target_approval_variable",
                                        "formMember": [
                                            {
                                                "deep": 0,
                                                "value": "originator",
                                                "label": "发起人"
                                            }
                                        ],
                                        "description": "表单成员：发起人"
                                    },
                                    "title": "样品到公司交接运营",
                                },
                                "title": "执行人"
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_ocliid9xm73",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "运营确认样品预估销量与上架时间",
                                    "description": "请选择执行人",
                                    "approverRules": {
                                        "type": "ext_target_approval_variable",
                                        "formMember": [
                                            {
                                                "deep": 0,
                                                "value": "employeeField_lii9qts2",
                                                "label": "运营负责人",
                                                "multiple": false
                                            }
                                        ],
                                        "description": "表单成员：运营负责人"
                                    },
                                    "actions": {
                                        "normalActions": [
                                            {
                                                "hidden": false,
                                                "name": "提交",
                                                "action": "agree",
                                                "text": "提交"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "保存",
                                                "action": "save",
                                                "text": "保存"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "转交",
                                                "action": "forward",
                                                "text": "转交"
                                            },
                                            {
                                                "hidden": false,
                                                "name": "退回",
                                                "action": "return",
                                                "text": "退回"
                                            },
                                            {
                                                "action": "recall",
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "alias": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                }
                                            }
                                        ],
                                        "appendActions": [],
                                        "realBackOriginator": "y",
                                        "triggerRule": "n"
                                    },
                                    "formConfig": {
                                        "behaviorList": [
                                            {
                                                "fieldId": "textField_lii9qtrm",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtro",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrt",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtru",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrv",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrw",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrx",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtry",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrz",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts0",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts1",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qtrn",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts2",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_liid7q8t",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts3",
                                                "fieldBehavior": "NORMAL"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts5",
                                                "fieldBehavior": "NORMAL"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts4",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts7",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "cascadeDateField_lii9qts8",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "associationFormField_lii9qtsa",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "associationFormField_liigjref",
                                                "fieldBehavior": "HIDDEN"
                                            }
                                        ]
                                    },
                                    "nodeError": "",
                                    "title": "运营确认样品预估销量与上架时间",
                                    "noActionersType": "stopProcess",
                                    "timeoutRules": [
                                        {
                                            "timeoutAction": {
                                                "intervalTime": {
                                                    "intervalTime": 2,
                                                    "intervalType": "HOUR"
                                                },
                                                "action": {
                                                    "type": "remind",
                                                    "messageValue": {
                                                        "messageConfig": {
                                                            "messageInfo": {
                                                                "content": "有待办存在超期风险，请及时处理"
                                                            }
                                                        },
                                                        "notifyCurrentApprover": true
                                                    }
                                                }
                                            }
                                        }
                                    ],
                                    "conditions": {
                                        "priority": 9
                                    }
                                },
                                "title": "执行人"
                            },
                            {
                                "componentName": "ApprovalNode",
                                "id": "node_oclm60vm9a1",
                                "props": {
                                    "nodeName": "ApprovalNode",
                                    "name": "审核订货量",
                                    "description": "请选择审批人",
                                    "approverRules": {
                                        "type": "ext_target_approval",
                                        "approvals": [
                                            {
                                                "id": "286702661035552690",
                                                "label": "赵家平",
                                                "type": "employee",
                                                "roleType": "DINGTALK",
                                                "avatar": "//img.alicdn.com/tfs/TB1mKVJSpXXXXcwaXXXXXXXXXXX-78-80.jpg"
                                            }
                                        ],
                                        "description": "赵家平"
                                    },
                                    "actions": {
                                        "normalActions": [
                                            {
                                                "hidden": false,
                                                "name": "同意",
                                                "action": "agree",
                                                "text": "同意"
                                            },
                                            {
                                                "hidden": false,
                                                "name": "拒绝",
                                                "action": "disagree",
                                                "text": "拒绝"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "保存",
                                                "action": "save",
                                                "text": "保存"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "转交",
                                                "action": "forward",
                                                "text": "转交"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "加签",
                                                "action": "append",
                                                "text": "加签"
                                            },
                                            {
                                                "hidden": false,
                                                "name": "退回",
                                                "action": "return",
                                                "text": "退回"
                                            },
                                            {
                                                "action": "recall",
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "alias": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                }
                                            }
                                        ],
                                        "appendActions": [
                                            {
                                                "hidden": false,
                                                "name": "同意",
                                                "action": "agree",
                                                "text": "同意"
                                            },
                                            {
                                                "hidden": false,
                                                "name": "拒绝",
                                                "action": "disagree",
                                                "text": "拒绝"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "保存",
                                                "action": "save",
                                                "text": "保存"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "转交",
                                                "action": "forward",
                                                "text": "转交"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "加签",
                                                "action": "append",
                                                "text": "加签"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "退回",
                                                "action": "return",
                                                "text": "退回"
                                            }
                                        ],
                                        "realBackOriginator": "y",
                                        "triggerRule": "n"
                                    },
                                    "title": "审核订货量",
                                    "conditions": {
                                        "priority": 10
                                    }
                                },
                                "title": "审批人"
                            }
                        ]
                    },
                    {
                        "componentName": "ParallelNode",
                        "id": "node_oclv1t0i395",
                        "props": {
                            "name": "条件1",
                            "description": "",
                            "nodeError": ""
                        },
                        "children": [
                            {
                                "componentName": "ApprovalNode",
                                "id": "node_oclv1t0i398",
                                "props": {
                                    "nodeName": "ApprovalNode",
                                    "name": "审核产品",
                                    "description": {
                                        "en_US": "Sponsor approval",
                                        "zh_CN": "发起人审批",
                                        "type": "i18n"
                                    },
                                    "title": "审核产品",
                                    "conditions": {
                                        "priority": 1
                                    }
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclv1t0i399",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "分配运营分析",
                                    "description": "请选择执行人",
                                    "approverRules": {
                                        "type": "ext_target_approval",
                                        "approvals": [
                                            {
                                                "id": "023825161226096286",
                                                "label": "李占丰",
                                                "type": "employee",
                                                "roleType": "DINGTALK",
                                                "avatar": "https://static.dingtalk.com/media/lQDPM5YltLR1saTNA7bNA7awfFLt_jZlJsEEyZbQvwC0AA_950_950.jpg"
                                            }
                                        ],
                                        "description": "李占丰",
                                        "approvalType_ext_target_approval": "all"
                                    },
                                    "actions": {
                                        "normalActions": [
                                            {
                                                "hidden": false,
                                                "name": "提交",
                                                "action": "agree",
                                                "text": "提交"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "保存",
                                                "action": "save",
                                                "text": "保存"
                                            },
                                            {
                                                "hidden": false,
                                                "name": "转交",
                                                "action": "forward",
                                                "text": "转交"
                                            },
                                            {
                                                "hidden": false,
                                                "name": "退回",
                                                "action": "return",
                                                "text": "退回"
                                            },
                                            {
                                                "action": "recall",
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "alias": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                }
                                            }
                                        ],
                                        "appendActions": [],
                                        "realBackOriginator": "y",
                                        "triggerRule": "n"
                                    },
                                    "nodeError": "",
                                    "title": "分配运营分析",
                                    "formConfig": {
                                        "behaviorList": [
                                            {
                                                "fieldId": "textField_lii9qtrm",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtro",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrt",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtru",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrv",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrw",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrx",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtry",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrz",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "radioField_lrhgr6i7",
                                                "fieldBehavior": "NORMAL"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts0",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "textareaField_lp9c9nze",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts1",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lix0k7ir",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qtrn",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts2",
                                                "fieldBehavior": "NORMAL"
                                            },
                                            {
                                                "fieldId": "textField_liid7q8t",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "attachmentField_lklxword",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts3",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts5",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "attachmentField_lkxf9q66",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textareaField_liscxx0m",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts4",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "textField_lkxf9q65",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts7",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "cascadeDateField_lii9qts8",
                                                "fieldBehavior": "HIDDEN"
                                            }
                                        ]
                                    },
                                    "noActionersType": "stopProcess",
                                    "timeoutRules": [
                                        {
                                            "timeoutAction": {
                                                "intervalTime": {
                                                    "intervalTime": 24,
                                                    "intervalType": "HOUR"
                                                },
                                                "action": {
                                                    "type": "remind",
                                                    "messageValue": {
                                                        "messageConfig": {
                                                            "messageInfo": {
                                                                "content": "有待办存在超期风险，请及时处理"
                                                            }
                                                        },
                                                        "notifyCustomMember": false,
                                                        "customMembers": [],
                                                        "notifyCurrentApprover": true
                                                    }
                                                }
                                            }
                                        }
                                    ],
                                    "conditions": {
                                        "priority": 2
                                    }
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclv1ugwu31",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "运营负责人提交市场统计模板",
                                    "description": "请选择执行人",
                                    "approverRules": {
                                        "type": "ext_target_approval_variable",
                                        "formMember": [
                                            {
                                                "deep": 0,
                                                "value": "employeeField_lii9qts2",
                                                "label": "运营负责人",
                                                "multiple": false
                                            }
                                        ],
                                        "description": "表单成员：运营负责人"
                                    },
                                    "actions": {
                                        "normalActions": [
                                            {
                                                "hidden": false,
                                                "name": "提交",
                                                "action": "agree",
                                                "text": "提交"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "保存",
                                                "action": "save",
                                                "text": "保存"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "转交",
                                                "action": "forward",
                                                "text": "转交"
                                            },
                                            {
                                                "hidden": false,
                                                "name": "退回",
                                                "action": "return",
                                                "text": "退回"
                                            },
                                            {
                                                "action": "recall",
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "alias": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                }
                                            }
                                        ],
                                        "appendActions": [],
                                        "realBackOriginator": "y",
                                        "triggerRule": "n"
                                    },
                                    "title": "运营负责人提交市场统计模板",
                                    "formConfig": {
                                        "behaviorList": [
                                            {
                                                "fieldId": "textField_lii9qtrm",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtro",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrt",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtru",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrv",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrw",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrx",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtry",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrz",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts0",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts1",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lix0k7ir",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qtrn",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts2",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_liid7q8t",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lklxword",
                                                "fieldBehavior": "NORMAL"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts3",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts5",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textareaField_liscxx0m",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts4",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts7",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "cascadeDateField_lii9qts8",
                                                "fieldBehavior": "READONLY"
                                            }
                                        ]
                                    },
                                    "conditions": {
                                        "priority": 3
                                    }
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclv2ayeqta",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "运营确认样品预估销量与上架时间",
                                    "description": "请选择执行人",
                                    "approverRules": {
                                        "type": "ext_target_approval_variable",
                                        "formMember": [
                                            {
                                                "deep": 0,
                                                "value": "employeeField_lii9qts2",
                                                "label": "运营负责人",
                                                "multiple": false
                                            }
                                        ],
                                        "description": "表单成员：运营负责人"
                                    },
                                    "actions": {
                                        "normalActions": [
                                            {
                                                "hidden": false,
                                                "name": "提交",
                                                "action": "agree",
                                                "text": "提交"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "保存",
                                                "action": "save",
                                                "text": "保存"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "转交",
                                                "action": "forward",
                                                "text": "转交"
                                            },
                                            {
                                                "hidden": false,
                                                "name": "退回",
                                                "action": "return",
                                                "text": "退回"
                                            },
                                            {
                                                "action": "recall",
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "alias": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                }
                                            }
                                        ],
                                        "appendActions": [],
                                        "realBackOriginator": "y",
                                        "triggerRule": "n"
                                    },
                                    "formConfig": {
                                        "behaviorList": [
                                            {
                                                "fieldId": "textField_lii9qtrm",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtro",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrt",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtru",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrv",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrw",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrx",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtry",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrz",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts0",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts1",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qtrn",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts2",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_liid7q8t",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts3",
                                                "fieldBehavior": "NORMAL"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts5",
                                                "fieldBehavior": "NORMAL"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts4",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts7",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "cascadeDateField_lii9qts8",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "associationFormField_lii9qtsa",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "associationFormField_liigjref",
                                                "fieldBehavior": "HIDDEN"
                                            }
                                        ]
                                    },
                                    "nodeError": "",
                                    "title": "运营确认样品预估销量与上架时间",
                                    "noActionersType": "stopProcess",
                                    "timeoutRules": [
                                        {
                                            "timeoutAction": {
                                                "intervalTime": {
                                                    "intervalTime": 2,
                                                    "intervalType": "HOUR"
                                                },
                                                "action": {
                                                    "type": "remind",
                                                    "messageValue": {
                                                        "messageConfig": {
                                                            "messageInfo": {
                                                                "content": "有待办存在超期风险，请及时处理"
                                                            }
                                                        },
                                                        "notifyCurrentApprover": true
                                                    }
                                                }
                                            }
                                        }
                                    ],
                                    "conditions": {
                                        "priority": 5
                                    }
                                }
                            },
                            {
                                "componentName": "ApprovalNode",
                                "id": "node_oclv2ayeqti",
                                "props": {
                                    "nodeName": "ApprovalNode",
                                    "name": "审核订货量",
                                    "description": "请选择审批人",
                                    "title": "审核订货量",
                                    "conditions": {
                                        "priority": 6
                                    }
                                }
                            }
                        ]
                    },
                    {
                        "componentName": "ParallelNode",
                        "id": "node_oclv1t0i394",
                        "props": {
                            "name": "条件1",
                            "description": ""
                        },
                        "children": [
                            {
                                "componentName": "ApprovalNode",
                                "id": "node_oclv1t0i39a",
                                "props": {
                                    "nodeName": "ApprovalNode",
                                    "name": "审核产品",
                                    "description": {
                                        "en_US": "Sponsor approval",
                                        "zh_CN": "发起人审批",
                                        "type": "i18n"
                                    },
                                    "title": "审核产品",
                                    "conditions": {
                                        "priority": 1
                                    }
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclv1t0i39b",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "分配运营分析",
                                    "description": "请选择执行人",
                                    "approverRules": {
                                        "type": "ext_target_approval",
                                        "approvals": [
                                            {
                                                "id": "113818575435455022",
                                                "label": "赖兆飞",
                                                "type": "employee",
                                                "roleType": "DINGTALK",
                                                "avatar": "https://static.dingtalk.com/media/lADPBbCc1gfK_OTNArHNAkA_576_689.jpg"
                                            }
                                        ],
                                        "description": "赖兆飞",
                                        "approvalType_ext_target_approval": "all"
                                    },
                                    "actions": {
                                        "normalActions": [
                                            {
                                                "hidden": false,
                                                "name": "提交",
                                                "action": "agree",
                                                "text": "提交"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "保存",
                                                "action": "save",
                                                "text": "保存"
                                            },
                                            {
                                                "hidden": false,
                                                "name": "转交",
                                                "action": "forward",
                                                "text": "转交"
                                            },
                                            {
                                                "hidden": false,
                                                "name": "退回",
                                                "action": "return",
                                                "text": "退回"
                                            },
                                            {
                                                "action": "recall",
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "alias": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                }
                                            }
                                        ],
                                        "appendActions": [],
                                        "realBackOriginator": "y",
                                        "triggerRule": "n"
                                    },
                                    "nodeError": "",
                                    "title": "分配运营分析",
                                    "formConfig": {
                                        "behaviorList": [
                                            {
                                                "fieldId": "textField_lii9qtrm",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtro",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrt",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtru",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrv",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrw",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrx",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtry",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrz",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "radioField_lrhgr6i7",
                                                "fieldBehavior": "NORMAL"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts0",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "textareaField_lp9c9nze",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts1",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lix0k7ir",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qtrn",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts2",
                                                "fieldBehavior": "NORMAL"
                                            },
                                            {
                                                "fieldId": "textField_liid7q8t",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "attachmentField_lklxword",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts3",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts5",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "attachmentField_lkxf9q66",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textareaField_liscxx0m",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts4",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "textField_lkxf9q65",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts7",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "cascadeDateField_lii9qts8",
                                                "fieldBehavior": "HIDDEN"
                                            }
                                        ]
                                    },
                                    "noActionersType": "stopProcess",
                                    "timeoutRules": [
                                        {
                                            "timeoutAction": {
                                                "intervalTime": {
                                                    "intervalTime": 24,
                                                    "intervalType": "HOUR"
                                                },
                                                "action": {
                                                    "type": "remind",
                                                    "messageValue": {
                                                        "messageConfig": {
                                                            "messageInfo": {
                                                                "content": "有待办存在超期风险，请及时处理"
                                                            }
                                                        },
                                                        "notifyCustomMember": false,
                                                        "customMembers": [],
                                                        "notifyCurrentApprover": true
                                                    }
                                                }
                                            }
                                        }
                                    ],
                                    "conditions": {
                                        "priority": 2
                                    }
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclv1ugwu32",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "运营负责人提交市场统计模板",
                                    "description": "请选择执行人",
                                    "approverRules": {
                                        "type": "ext_target_approval_variable",
                                        "formMember": [
                                            {
                                                "deep": 0,
                                                "value": "employeeField_lii9qts2",
                                                "label": "运营负责人",
                                                "multiple": false
                                            }
                                        ],
                                        "description": "表单成员：运营负责人"
                                    },
                                    "actions": {
                                        "normalActions": [
                                            {
                                                "hidden": false,
                                                "name": "提交",
                                                "action": "agree",
                                                "text": "提交"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "保存",
                                                "action": "save",
                                                "text": "保存"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "转交",
                                                "action": "forward",
                                                "text": "转交"
                                            },
                                            {
                                                "hidden": false,
                                                "name": "退回",
                                                "action": "return",
                                                "text": "退回"
                                            },
                                            {
                                                "action": "recall",
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "alias": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                }
                                            }
                                        ],
                                        "appendActions": [],
                                        "realBackOriginator": "y",
                                        "triggerRule": "n"
                                    },
                                    "title": "运营负责人提交市场统计模板",
                                    "formConfig": {
                                        "behaviorList": [
                                            {
                                                "fieldId": "textField_lii9qtrm",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtro",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrt",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtru",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrv",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrw",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrx",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtry",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrz",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts0",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts1",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lix0k7ir",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qtrn",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts2",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_liid7q8t",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lklxword",
                                                "fieldBehavior": "NORMAL"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts3",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts5",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textareaField_liscxx0m",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts4",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts7",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "cascadeDateField_lii9qts8",
                                                "fieldBehavior": "READONLY"
                                            }
                                        ]
                                    },
                                    "conditions": {
                                        "priority": 3
                                    }
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclv2ayeqtb",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "运营确认样品预估销量与上架时间",
                                    "description": "请选择执行人",
                                    "approverRules": {
                                        "type": "ext_target_approval_variable",
                                        "formMember": [
                                            {
                                                "deep": 0,
                                                "value": "employeeField_lii9qts2",
                                                "label": "运营负责人",
                                                "multiple": false
                                            }
                                        ],
                                        "description": "表单成员：运营负责人"
                                    },
                                    "actions": {
                                        "normalActions": [
                                            {
                                                "hidden": false,
                                                "name": "提交",
                                                "action": "agree",
                                                "text": "提交"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "保存",
                                                "action": "save",
                                                "text": "保存"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "转交",
                                                "action": "forward",
                                                "text": "转交"
                                            },
                                            {
                                                "hidden": false,
                                                "name": "退回",
                                                "action": "return",
                                                "text": "退回"
                                            },
                                            {
                                                "action": "recall",
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "alias": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                }
                                            }
                                        ],
                                        "appendActions": [],
                                        "realBackOriginator": "y",
                                        "triggerRule": "n"
                                    },
                                    "formConfig": {
                                        "behaviorList": [
                                            {
                                                "fieldId": "textField_lii9qtrm",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtro",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrt",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtru",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrv",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrw",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrx",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtry",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrz",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts0",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts1",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qtrn",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts2",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_liid7q8t",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts3",
                                                "fieldBehavior": "NORMAL"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts5",
                                                "fieldBehavior": "NORMAL"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts4",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts7",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "cascadeDateField_lii9qts8",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "associationFormField_lii9qtsa",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "associationFormField_liigjref",
                                                "fieldBehavior": "HIDDEN"
                                            }
                                        ]
                                    },
                                    "nodeError": "",
                                    "title": "运营确认样品预估销量与上架时间",
                                    "noActionersType": "stopProcess",
                                    "timeoutRules": [
                                        {
                                            "timeoutAction": {
                                                "intervalTime": {
                                                    "intervalTime": 2,
                                                    "intervalType": "HOUR"
                                                },
                                                "action": {
                                                    "type": "remind",
                                                    "messageValue": {
                                                        "messageConfig": {
                                                            "messageInfo": {
                                                                "content": "有待办存在超期风险，请及时处理"
                                                            }
                                                        },
                                                        "notifyCurrentApprover": true
                                                    }
                                                }
                                            }
                                        }
                                    ],
                                    "conditions": {
                                        "priority": 5
                                    }
                                }
                            },
                            {
                                "componentName": "ApprovalNode",
                                "id": "node_oclv2ayeqtj",
                                "props": {
                                    "nodeName": "ApprovalNode",
                                    "name": "审核订货量",
                                    "description": "请选择审批人",
                                    "approverRules": {
                                        "type": "ext_target_approval",
                                        "approvals": [
                                            {
                                                "id": "113818575435455022",
                                                "label": "赖兆飞",
                                                "type": "employee",
                                                "roleType": "DINGTALK",
                                                "avatar": "https://static.dingtalk.com/media/lADPBbCc1gfK_OTNArHNAkA_576_689.jpg"
                                            }
                                        ],
                                        "description": "赖兆飞"
                                    },
                                    "actions": {
                                        "normalActions": [
                                            {
                                                "hidden": false,
                                                "name": "同意",
                                                "action": "agree",
                                                "text": "同意"
                                            },
                                            {
                                                "hidden": false,
                                                "name": "拒绝",
                                                "action": "disagree",
                                                "text": "拒绝"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "保存",
                                                "action": "save",
                                                "text": "保存"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "转交",
                                                "action": "forward",
                                                "text": "转交"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "加签",
                                                "action": "append",
                                                "text": "加签"
                                            },
                                            {
                                                "hidden": false,
                                                "name": "退回",
                                                "action": "return",
                                                "text": "退回"
                                            },
                                            {
                                                "action": "recall",
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "alias": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                }
                                            }
                                        ],
                                        "appendActions": [
                                            {
                                                "hidden": false,
                                                "name": "同意",
                                                "action": "agree",
                                                "text": "同意"
                                            },
                                            {
                                                "hidden": false,
                                                "name": "拒绝",
                                                "action": "disagree",
                                                "text": "拒绝"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "保存",
                                                "action": "save",
                                                "text": "保存"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "转交",
                                                "action": "forward",
                                                "text": "转交"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "加签",
                                                "action": "append",
                                                "text": "加签"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "退回",
                                                "action": "return",
                                                "text": "退回"
                                            }
                                        ],
                                        "realBackOriginator": "y",
                                        "triggerRule": "n"
                                    },
                                    "title": "审核订货量",
                                    "conditions": {
                                        "priority": 7
                                    }
                                }
                            }
                        ]
                    },
                    {
                        "componentName": "ParallelNode",
                        "id": "node_oclv24zen51",
                        "props": {
                            "name": "条件1",
                            "description": "",
                            "conditions": {
                                "priority": 4,
                                "calculate": "condition",
                                "conditions": {
                                    "condition": "AND",
                                    "rules": [
                                        {
                                            "id": "originator",
                                            "op": "等于任意一个",
                                            "operators": [],
                                            "value": [
                                                {
                                                    "id": "173460620526273885",
                                                    "label": "李梦灵",
                                                    "name": "李梦灵",
                                                    "deptDesc": "产品部",
                                                    "type": "employee",
                                                    "corpId": "",
                                                    "isDisabled": false,
                                                    "orgType": "",
                                                    "checked": true
                                                },
                                                {
                                                    "id": "01261026364932538314",
                                                    "label": "胡晓东",
                                                    "name": "胡晓东",
                                                    "avatar": "https://static.dingtalk.com/media/lQLPDhvpGTvdcRXNAhzNAhywAKrLu5IZly8DTpT3OUDOAA_540_540.png",
                                                    "deptDesc": "产品部",
                                                    "type": "employee",
                                                    "corpId": "",
                                                    "isDisabled": false,
                                                    "orgType": "",
                                                    "checked": true
                                                },
                                                {
                                                    "id": "146108032536506963",
                                                    "label": "郭晓龙",
                                                    "name": "郭晓龙",
                                                    "deptDesc": "产品部",
                                                    "type": "employee",
                                                    "corpId": "",
                                                    "isDisabled": false,
                                                    "orgType": "",
                                                    "checked": true
                                                },
                                                {
                                                    "id": "1535601507740792730",
                                                    "label": "崔竹",
                                                    "name": "崔竹",
                                                    "deptDesc": "管理中台",
                                                    "type": "employee",
                                                    "corpId": "",
                                                    "isDisabled": false,
                                                    "orgType": "",
                                                    "checked": true
                                                },
                                                {
                                                    "id": "023056436721153811",
                                                    "label": "刘玉鹤",
                                                    "name": "刘玉鹤",
                                                    "deptDesc": "产品部",
                                                    "type": "employee",
                                                    "corpId": "",
                                                    "isDisabled": false,
                                                    "orgType": "",
                                                    "checked": true
                                                },
                                                {
                                                    "id": "043724466837934579",
                                                    "label": "陈盈佳",
                                                    "name": "陈盈佳",
                                                    "avatar": "https://static.dingtalk.com/media/lQDPDhubVCtoaz7NBQLNBP-w-0EdKJqZ5hICzynz6oCzAA_1279_1282.jpg",
                                                    "deptDesc": "产品部",
                                                    "type": "employee",
                                                    "corpId": "",
                                                    "isDisabled": false,
                                                    "orgType": "",
                                                    "checked": true
                                                }
                                            ],
                                            "componentType": "EmployeeField",
                                            "ruleId": "item-42a28713-0727-4f0b-88c8-66cf54642795",
                                            "parentId": "group-9e5366b2-3d1e-40da-9112-064b169b1f8e",
                                            "extValue": "value",
                                            "ruleValue": [
                                                {
                                                    "id": "173460620526273885",
                                                    "label": "李梦灵",
                                                    "name": "李梦灵",
                                                    "deptDesc": "产品部",
                                                    "type": "employee",
                                                    "corpId": "",
                                                    "isDisabled": false,
                                                    "orgType": "",
                                                    "checked": true
                                                },
                                                {
                                                    "id": "01261026364932538314",
                                                    "label": "胡晓东",
                                                    "name": "胡晓东",
                                                    "avatar": "https://static.dingtalk.com/media/lQLPDhvpGTvdcRXNAhzNAhywAKrLu5IZly8DTpT3OUDOAA_540_540.png",
                                                    "deptDesc": "产品部",
                                                    "type": "employee",
                                                    "corpId": "",
                                                    "isDisabled": false,
                                                    "orgType": "",
                                                    "checked": true
                                                },
                                                {
                                                    "id": "146108032536506963",
                                                    "label": "郭晓龙",
                                                    "name": "郭晓龙",
                                                    "deptDesc": "产品部",
                                                    "type": "employee",
                                                    "corpId": "",
                                                    "isDisabled": false,
                                                    "orgType": "",
                                                    "checked": true
                                                },
                                                {
                                                    "id": "1535601507740792730",
                                                    "label": "崔竹",
                                                    "name": "崔竹",
                                                    "deptDesc": "管理中台",
                                                    "type": "employee",
                                                    "corpId": "",
                                                    "isDisabled": false,
                                                    "orgType": "",
                                                    "checked": true
                                                },
                                                {
                                                    "id": "023056436721153811",
                                                    "label": "刘玉鹤",
                                                    "name": "刘玉鹤",
                                                    "deptDesc": "产品部",
                                                    "type": "employee",
                                                    "corpId": "",
                                                    "isDisabled": false,
                                                    "orgType": "",
                                                    "checked": true
                                                },
                                                {
                                                    "id": "043724466837934579",
                                                    "label": "陈盈佳",
                                                    "name": "陈盈佳",
                                                    "avatar": "https://static.dingtalk.com/media/lQDPDhubVCtoaz7NBQLNBP-w-0EdKJqZ5hICzynz6oCzAA_1279_1282.jpg",
                                                    "deptDesc": "产品部",
                                                    "type": "employee",
                                                    "corpId": "",
                                                    "isDisabled": false,
                                                    "orgType": "",
                                                    "checked": true
                                                }
                                            ],
                                            "name": "发起人",
                                            "valueType": "literal",
                                            "ruleType": "rule_text",
                                            "opCode": "EqualAny"
                                        }
                                    ],
                                    "ruleId": "group-9e5366b2-3d1e-40da-9112-064b169b1f8e",
                                    "conditionCode": "&&"
                                },
                                "isDefault": false,
                                "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳"
                            }
                        },
                        "children": [
                            {
                                "componentName": "ApprovalNode",
                                "id": "node_oclv24zen52",
                                "props": {
                                    "nodeName": "ApprovalNode",
                                    "name": "审核产品",
                                    "description": {
                                        "en_US": "Sponsor approval",
                                        "zh_CN": "发起人审批",
                                        "type": "i18n"
                                    },
                                    "actions": {
                                        "normalActions": [
                                            {
                                                "hidden": false,
                                                "name": {
                                                    "en_US": "agree",
                                                    "zh_CN": "同意",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "agree",
                                                    "zh_CN": "同意",
                                                    "type": "i18n"
                                                },
                                                "action": "agree"
                                            },
                                            {
                                                "hidden": false,
                                                "name": {
                                                    "en_US": "disagree",
                                                    "zh_CN": "拒绝",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "disagree",
                                                    "zh_CN": "拒绝",
                                                    "type": "i18n"
                                                },
                                                "action": "disagree"
                                            },
                                            {
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "save",
                                                    "zh_CN": "保存",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "save",
                                                    "zh_CN": "保存",
                                                    "type": "i18n"
                                                },
                                                "action": "save"
                                            },
                                            {
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "forward",
                                                    "zh_CN": "转交",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "forward",
                                                    "zh_CN": "转交",
                                                    "type": "i18n"
                                                },
                                                "action": "forward"
                                            },
                                            {
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "append",
                                                    "zh_CN": "加签",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "append",
                                                    "zh_CN": "加签",
                                                    "type": "i18n"
                                                },
                                                "action": "append"
                                            },
                                            {
                                                "hidden": false,
                                                "name": {
                                                    "en_US": "return",
                                                    "zh_CN": "退回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "return",
                                                    "zh_CN": "退回",
                                                    "type": "i18n"
                                                },
                                                "action": "return"
                                            },
                                            {
                                                "action": "recall",
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "alias": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                }
                                            }
                                        ],
                                        "appendActions": [
                                            {
                                                "hidden": false,
                                                "name": {
                                                    "en_US": "agree",
                                                    "zh_CN": "同意",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "agree",
                                                    "zh_CN": "同意",
                                                    "type": "i18n"
                                                },
                                                "action": "agree"
                                            },
                                            {
                                                "hidden": false,
                                                "name": {
                                                    "en_US": "disagree",
                                                    "zh_CN": "拒绝",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "disagree",
                                                    "zh_CN": "拒绝",
                                                    "type": "i18n"
                                                },
                                                "action": "disagree"
                                            },
                                            {
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "forward",
                                                    "zh_CN": "转交",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "forward",
                                                    "zh_CN": "转交",
                                                    "type": "i18n"
                                                },
                                                "action": "forward"
                                            },
                                            {
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "append",
                                                    "zh_CN": "加签",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "append",
                                                    "zh_CN": "加签",
                                                    "type": "i18n"
                                                },
                                                "action": "append"
                                            },
                                            {
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "return",
                                                    "zh_CN": "退回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "return",
                                                    "zh_CN": "退回",
                                                    "type": "i18n"
                                                },
                                                "action": "return"
                                            }
                                        ],
                                        "realBackOriginator": "y",
                                        "triggerRule": "n"
                                    },
                                    "approverRules": {
                                        "type": "ext_target_approval",
                                        "approvals": [
                                            {
                                                "id": "093612106024638452",
                                                "label": "张顺明",
                                                "type": "employee",
                                                "roleType": "DINGTALK",
                                                "avatar": "//img.alicdn.com/tfs/TB1mKVJSpXXXXcwaXXXXXXXXXXX-78-80.jpg"
                                            }
                                        ],
                                        "description": "张顺明",
                                        "approvalType_ext_target_approval": "all"
                                    },
                                    "nodeError": "",
                                    "formConfig": {
                                        "behaviorList": [
                                            {
                                                "fieldId": "textField_lii9qtrm",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtro",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrt",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtru",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrv",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrw",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrx",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtry",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrz",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts0",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "textareaField_lp9c9nze",
                                                "fieldBehavior": "NORMAL"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts1",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lix0k7ir",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qtrn",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts2",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "textField_liid7q8t",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "attachmentField_lklxword",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts3",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts5",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "attachmentField_lkxf9q66",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textareaField_liscxx0m",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts4",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "textField_lkxf9q65",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts7",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "cascadeDateField_lii9qts8",
                                                "fieldBehavior": "HIDDEN"
                                            }
                                        ]
                                    },
                                    "noActionersType": "stopProcess",
                                    "timeoutRules": [
                                        {
                                            "timeoutAction": {
                                                "intervalTime": {
                                                    "intervalTime": 24,
                                                    "intervalType": "HOUR"
                                                },
                                                "action": {
                                                    "type": "remind",
                                                    "messageValue": {
                                                        "messageConfig": {
                                                            "messageInfo": {
                                                                "content": "有待办存在超期风险，请及时处理"
                                                            }
                                                        },
                                                        "notifyCurrentApprover": true
                                                    }
                                                }
                                            }
                                        }
                                    ],
                                    "title": "审核产品",
                                    "conditions": {
                                        "priority": 1
                                    }
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclv24zen54",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "运营负责人提交市场统计模板",
                                    "description": "请选择执行人",
                                    "approverRules": {
                                        "type": "ext_target_approval",
                                        "approvals": [
                                            {
                                                "id": "093612106024638452",
                                                "label": "张顺明",
                                                "type": "employee",
                                                "roleType": "DINGTALK",
                                                "avatar": "//img.alicdn.com/tfs/TB1mKVJSpXXXXcwaXXXXXXXXXXX-78-80.jpg"
                                            }
                                        ],
                                        "description": "张顺明"
                                    },
                                    "actions": {
                                        "normalActions": [
                                            {
                                                "hidden": false,
                                                "name": "提交",
                                                "action": "agree",
                                                "text": "提交"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "保存",
                                                "action": "save",
                                                "text": "保存"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "转交",
                                                "action": "forward",
                                                "text": "转交"
                                            },
                                            {
                                                "hidden": false,
                                                "name": "退回",
                                                "action": "return",
                                                "text": "退回"
                                            },
                                            {
                                                "action": "recall",
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "alias": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                }
                                            }
                                        ],
                                        "appendActions": [],
                                        "realBackOriginator": "y",
                                        "triggerRule": "n"
                                    },
                                    "title": "运营负责人提交市场统计模板",
                                    "formConfig": {
                                        "behaviorList": [
                                            {
                                                "fieldId": "textField_lii9qtrm",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtro",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrt",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtru",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrv",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrw",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrx",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtry",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrz",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts0",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts1",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lix0k7ir",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qtrn",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts2",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_liid7q8t",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lklxword",
                                                "fieldBehavior": "NORMAL"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts3",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts5",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textareaField_liscxx0m",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts4",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts7",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "cascadeDateField_lii9qts8",
                                                "fieldBehavior": "READONLY"
                                            }
                                        ]
                                    },
                                    "conditions": {
                                        "priority": 2
                                    }
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclv2ayeqtc",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "运营确认样品预估销量与上架时间",
                                    "description": "请选择执行人",
                                    "approverRules": {
                                        "type": "ext_target_approval",
                                        "approvals": [
                                            {
                                                "id": "093612106024638452",
                                                "label": "张顺明",
                                                "type": "employee",
                                                "roleType": "DINGTALK",
                                                "avatar": "//img.alicdn.com/tfs/TB1mKVJSpXXXXcwaXXXXXXXXXXX-78-80.jpg"
                                            }
                                        ],
                                        "description": "张顺明"
                                    },
                                    "title": "运营确认样品预估销量与上架时间",
                                    "conditions": {
                                        "priority": 4
                                    }
                                }
                            }
                        ]
                    },
                    {
                        "componentName": "ParallelNode",
                        "id": "node_oclv24zen55",
                        "props": {
                            "name": "条件1",
                            "description": "",
                        },
                        "children": [
                            {
                                "componentName": "ApprovalNode",
                                "id": "node_oclv24zen56",
                                "props": {
                                    "nodeName": "ApprovalNode",
                                    "name": "审核产品",
                                    "description": {
                                        "en_US": "Sponsor approval",
                                        "zh_CN": "发起人审批",
                                        "type": "i18n"
                                    },
                                    "actions": {
                                        "normalActions": [
                                            {
                                                "hidden": false,
                                                "name": {
                                                    "en_US": "agree",
                                                    "zh_CN": "同意",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "agree",
                                                    "zh_CN": "同意",
                                                    "type": "i18n"
                                                },
                                                "action": "agree"
                                            },
                                            {
                                                "hidden": false,
                                                "name": {
                                                    "en_US": "disagree",
                                                    "zh_CN": "拒绝",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "disagree",
                                                    "zh_CN": "拒绝",
                                                    "type": "i18n"
                                                },
                                                "action": "disagree"
                                            },
                                            {
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "save",
                                                    "zh_CN": "保存",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "save",
                                                    "zh_CN": "保存",
                                                    "type": "i18n"
                                                },
                                                "action": "save"
                                            },
                                            {
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "forward",
                                                    "zh_CN": "转交",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "forward",
                                                    "zh_CN": "转交",
                                                    "type": "i18n"
                                                },
                                                "action": "forward"
                                            },
                                            {
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "append",
                                                    "zh_CN": "加签",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "append",
                                                    "zh_CN": "加签",
                                                    "type": "i18n"
                                                },
                                                "action": "append"
                                            },
                                            {
                                                "hidden": false,
                                                "name": {
                                                    "en_US": "return",
                                                    "zh_CN": "退回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "return",
                                                    "zh_CN": "退回",
                                                    "type": "i18n"
                                                },
                                                "action": "return"
                                            },
                                            {
                                                "action": "recall",
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "alias": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                }
                                            }
                                        ],
                                        "appendActions": [
                                            {
                                                "hidden": false,
                                                "name": {
                                                    "en_US": "agree",
                                                    "zh_CN": "同意",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "agree",
                                                    "zh_CN": "同意",
                                                    "type": "i18n"
                                                },
                                                "action": "agree"
                                            },
                                            {
                                                "hidden": false,
                                                "name": {
                                                    "en_US": "disagree",
                                                    "zh_CN": "拒绝",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "disagree",
                                                    "zh_CN": "拒绝",
                                                    "type": "i18n"
                                                },
                                                "action": "disagree"
                                            },
                                            {
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "forward",
                                                    "zh_CN": "转交",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "forward",
                                                    "zh_CN": "转交",
                                                    "type": "i18n"
                                                },
                                                "action": "forward"
                                            },
                                            {
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "append",
                                                    "zh_CN": "加签",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "append",
                                                    "zh_CN": "加签",
                                                    "type": "i18n"
                                                },
                                                "action": "append"
                                            },
                                            {
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "return",
                                                    "zh_CN": "退回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "return",
                                                    "zh_CN": "退回",
                                                    "type": "i18n"
                                                },
                                                "action": "return"
                                            }
                                        ],
                                        "realBackOriginator": "y",
                                        "triggerRule": "n"
                                    },
                                    "approverRules": {
                                        "type": "ext_target_approval",
                                        "approvals": [
                                            {
                                                "id": "02203260542720384879",
                                                "label": "侯彤彤",
                                                "type": "employee",
                                                "roleType": "DINGTALK",
                                                "avatar": "//img.alicdn.com/tfs/TB1mKVJSpXXXXcwaXXXXXXXXXXX-78-80.jpg"
                                            }
                                        ],
                                        "description": "侯彤彤",
                                        "approvalType_ext_target_approval": "all"
                                    },
                                    "nodeError": "",
                                    "formConfig": {
                                        "behaviorList": [
                                            {
                                                "fieldId": "textField_lii9qtrm",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtro",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrt",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtru",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrv",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrw",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrx",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtry",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrz",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts0",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "textareaField_lp9c9nze",
                                                "fieldBehavior": "NORMAL"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts1",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lix0k7ir",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qtrn",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts2",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "textField_liid7q8t",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "attachmentField_lklxword",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts3",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts5",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "attachmentField_lkxf9q66",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textareaField_liscxx0m",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts4",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "textField_lkxf9q65",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts7",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "cascadeDateField_lii9qts8",
                                                "fieldBehavior": "HIDDEN"
                                            }
                                        ]
                                    },
                                    "noActionersType": "stopProcess",
                                    "timeoutRules": [
                                        {
                                            "timeoutAction": {
                                                "intervalTime": {
                                                    "intervalTime": 24,
                                                    "intervalType": "HOUR"
                                                },
                                                "action": {
                                                    "type": "remind",
                                                    "messageValue": {
                                                        "messageConfig": {
                                                            "messageInfo": {
                                                                "content": "有待办存在超期风险，请及时处理"
                                                            }
                                                        },
                                                        "notifyCurrentApprover": true
                                                    }
                                                }
                                            }
                                        }
                                    ],
                                    "title": "审核产品",
                                    "conditions": {
                                        "priority": 1
                                    }
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclv24zen58",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "运营负责人提交市场统计模板",
                                    "description": "请选择执行人",
                                    "approverRules": {
                                        "type": "ext_target_approval",
                                        "approvals": [
                                            {
                                                "id": "02203260542720384879",
                                                "label": "侯彤彤",
                                                "type": "employee",
                                                "roleType": "DINGTALK",
                                                "avatar": "//img.alicdn.com/tfs/TB1mKVJSpXXXXcwaXXXXXXXXXXX-78-80.jpg"
                                            }
                                        ],
                                        "description": "侯彤彤"
                                    },
                                    "actions": {
                                        "normalActions": [
                                            {
                                                "hidden": false,
                                                "name": "提交",
                                                "action": "agree",
                                                "text": "提交"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "保存",
                                                "action": "save",
                                                "text": "保存"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "转交",
                                                "action": "forward",
                                                "text": "转交"
                                            },
                                            {
                                                "hidden": false,
                                                "name": "退回",
                                                "action": "return",
                                                "text": "退回"
                                            },
                                            {
                                                "action": "recall",
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "alias": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                }
                                            }
                                        ],
                                        "appendActions": [],
                                        "realBackOriginator": "y",
                                        "triggerRule": "n"
                                    },
                                    "title": "运营负责人提交市场统计模板",
                                    "formConfig": {
                                        "behaviorList": [
                                            {
                                                "fieldId": "textField_lii9qtrm",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtro",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrt",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtru",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrv",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrw",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrx",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtry",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrz",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts0",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts1",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lix0k7ir",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qtrn",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts2",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_liid7q8t",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lklxword",
                                                "fieldBehavior": "NORMAL"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts3",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts5",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textareaField_liscxx0m",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts4",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts7",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "cascadeDateField_lii9qts8",
                                                "fieldBehavior": "READONLY"
                                            }
                                        ]
                                    },
                                    "conditions": {
                                        "priority": 2
                                    }
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclv2ayeqtd",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "运营确认样品预估销量与上架时间",
                                    "description": "请选择执行人",
                                    "approverRules": {
                                        "type": "ext_target_approval",
                                        "approvals": [
                                            {
                                                "id": "02203260542720384879",
                                                "label": "侯彤彤",
                                                "type": "employee",
                                                "roleType": "DINGTALK",
                                                "avatar": "//img.alicdn.com/tfs/TB1mKVJSpXXXXcwaXXXXXXXXXXX-78-80.jpg"
                                            }
                                        ],
                                        "description": "侯彤彤"
                                    },
                                    "actions": {
                                        "normalActions": [
                                            {
                                                "hidden": false,
                                                "name": "提交",
                                                "action": "agree",
                                                "text": "提交"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "保存",
                                                "action": "save",
                                                "text": "保存"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "转交",
                                                "action": "forward",
                                                "text": "转交"
                                            },
                                            {
                                                "hidden": false,
                                                "name": "退回",
                                                "action": "return",
                                                "text": "退回"
                                            },
                                            {
                                                "action": "recall",
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "alias": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                }
                                            }
                                        ],
                                        "appendActions": [],
                                        "realBackOriginator": "y",
                                        "triggerRule": "n"
                                    },
                                    "formConfig": {
                                        "behaviorList": [
                                            {
                                                "fieldId": "textField_lii9qtrm",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtro",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrt",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtru",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrv",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrw",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrx",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtry",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrz",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts0",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts1",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qtrn",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts2",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_liid7q8t",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts3",
                                                "fieldBehavior": "NORMAL"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts5",
                                                "fieldBehavior": "NORMAL"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts4",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts7",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "cascadeDateField_lii9qts8",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "associationFormField_lii9qtsa",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "associationFormField_liigjref",
                                                "fieldBehavior": "HIDDEN"
                                            }
                                        ]
                                    },
                                    "nodeError": "",
                                    "title": "运营确认样品预估销量与上架时间",
                                    "noActionersType": "stopProcess",
                                    "timeoutRules": [
                                        {
                                            "timeoutAction": {
                                                "intervalTime": {
                                                    "intervalTime": 2,
                                                    "intervalType": "HOUR"
                                                },
                                                "action": {
                                                    "type": "remind",
                                                    "messageValue": {
                                                        "messageConfig": {
                                                            "messageInfo": {
                                                                "content": "有待办存在超期风险，请及时处理"
                                                            }
                                                        },
                                                        "notifyCurrentApprover": true
                                                    }
                                                }
                                            }
                                        }
                                    ],
                                    "conditions": {
                                        "priority": 4
                                    }
                                }
                            }
                        ]
                    },
                    {
                        "componentName": "ParallelNode",
                        "id": "node_oclv2a2mj41",
                        "props": {
                            "name": "条件1",
                            "description": "",
                            "conditions": {
                                "priority": 6,
                                "calculate": "condition",
                                "isDefault": false,
                                "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳"
                            }
                        },
                        "children": [
                            {
                                "componentName": "ApprovalNode",
                                "id": "node_oclv2a2mj42",
                                "props": {
                                    "nodeName": "ApprovalNode",
                                    "name": "审核产品",
                                    "description": {
                                        "en_US": "Sponsor approval",
                                        "zh_CN": "发起人审批",
                                        "type": "i18n"
                                    },
                                    "actions": {
                                        "normalActions": [
                                            {
                                                "hidden": false,
                                                "name": {
                                                    "en_US": "agree",
                                                    "zh_CN": "同意",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "agree",
                                                    "zh_CN": "同意",
                                                    "type": "i18n"
                                                },
                                                "action": "agree"
                                            },
                                            {
                                                "hidden": false,
                                                "name": {
                                                    "en_US": "disagree",
                                                    "zh_CN": "拒绝",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "disagree",
                                                    "zh_CN": "拒绝",
                                                    "type": "i18n"
                                                },
                                                "action": "disagree"
                                            },
                                            {
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "save",
                                                    "zh_CN": "保存",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "save",
                                                    "zh_CN": "保存",
                                                    "type": "i18n"
                                                },
                                                "action": "save"
                                            },
                                            {
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "forward",
                                                    "zh_CN": "转交",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "forward",
                                                    "zh_CN": "转交",
                                                    "type": "i18n"
                                                },
                                                "action": "forward"
                                            },
                                            {
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "append",
                                                    "zh_CN": "加签",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "append",
                                                    "zh_CN": "加签",
                                                    "type": "i18n"
                                                },
                                                "action": "append"
                                            },
                                            {
                                                "hidden": false,
                                                "name": {
                                                    "en_US": "return",
                                                    "zh_CN": "退回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "return",
                                                    "zh_CN": "退回",
                                                    "type": "i18n"
                                                },
                                                "action": "return"
                                            },
                                            {
                                                "action": "recall",
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "alias": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                }
                                            }
                                        ],
                                        "appendActions": [
                                            {
                                                "hidden": false,
                                                "name": {
                                                    "en_US": "agree",
                                                    "zh_CN": "同意",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "agree",
                                                    "zh_CN": "同意",
                                                    "type": "i18n"
                                                },
                                                "action": "agree"
                                            },
                                            {
                                                "hidden": false,
                                                "name": {
                                                    "en_US": "disagree",
                                                    "zh_CN": "拒绝",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "disagree",
                                                    "zh_CN": "拒绝",
                                                    "type": "i18n"
                                                },
                                                "action": "disagree"
                                            },
                                            {
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "forward",
                                                    "zh_CN": "转交",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "forward",
                                                    "zh_CN": "转交",
                                                    "type": "i18n"
                                                },
                                                "action": "forward"
                                            },
                                            {
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "append",
                                                    "zh_CN": "加签",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "append",
                                                    "zh_CN": "加签",
                                                    "type": "i18n"
                                                },
                                                "action": "append"
                                            },
                                            {
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "return",
                                                    "zh_CN": "退回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "return",
                                                    "zh_CN": "退回",
                                                    "type": "i18n"
                                                },
                                                "action": "return"
                                            }
                                        ],
                                        "realBackOriginator": "y",
                                        "triggerRule": "n"
                                    },
                                    "approverRules": {
                                        "type": "ext_target_approval",
                                        "approvals": [
                                            {
                                                "id": "271154331626125090",
                                                "label": "曾思怡",
                                                "type": "employee",
                                                "roleType": "DINGTALK",
                                                "avatar": "https://static.dingtalk.com/media/lQDPD3Ga_oA2n0HNBQDNBQCw0ZanoErmTKgGA6vp-cTAAA_1280_1280.jpg"
                                            }
                                        ],
                                        "description": "曾思怡",
                                        "approvalType_ext_target_approval": "all"
                                    },
                                    "nodeError": "",
                                    "formConfig": {
                                        "behaviorList": [
                                            {
                                                "fieldId": "textField_lii9qtrm",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtro",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrt",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtru",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrv",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrw",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrx",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtry",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrz",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts0",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "textareaField_lp9c9nze",
                                                "fieldBehavior": "NORMAL"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts1",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lix0k7ir",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qtrn",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts2",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "textField_liid7q8t",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "attachmentField_lklxword",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts3",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts5",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "attachmentField_lkxf9q66",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textareaField_liscxx0m",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts4",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "textField_lkxf9q65",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts7",
                                                "fieldBehavior": "HIDDEN"
                                            },
                                            {
                                                "fieldId": "cascadeDateField_lii9qts8",
                                                "fieldBehavior": "HIDDEN"
                                            }
                                        ]
                                    },
                                    "noActionersType": "stopProcess",
                                    "timeoutRules": [
                                        {
                                            "timeoutAction": {
                                                "intervalTime": {
                                                    "intervalTime": 24,
                                                    "intervalType": "HOUR"
                                                },
                                                "action": {
                                                    "type": "remind",
                                                    "messageValue": {
                                                        "messageConfig": {
                                                            "messageInfo": {
                                                                "content": "有待办存在超期风险，请及时处理"
                                                            }
                                                        },
                                                        "notifyCurrentApprover": true
                                                    }
                                                }
                                            }
                                        }
                                    ],
                                    "title": "审核产品",
                                    "conditions": {
                                        "priority": 1
                                    }
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclv2a2mj43",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "运营负责人提交市场统计模板",
                                    "description": "请选择执行人",
                                    "approverRules": {
                                        "type": "ext_target_approval",
                                        "approvals": [
                                            {
                                                "id": "271154331626125090",
                                                "label": "曾思怡",
                                                "type": "employee",
                                                "roleType": "DINGTALK",
                                                "avatar": "https://static.dingtalk.com/media/lQDPD3Ga_oA2n0HNBQDNBQCw0ZanoErmTKgGA6vp-cTAAA_1280_1280.jpg"
                                            }
                                        ],
                                        "description": "曾思怡"
                                    },
                                    "actions": {
                                        "normalActions": [
                                            {
                                                "hidden": false,
                                                "name": "提交",
                                                "action": "agree",
                                                "text": "提交"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "保存",
                                                "action": "save",
                                                "text": "保存"
                                            },
                                            {
                                                "hidden": true,
                                                "name": "转交",
                                                "action": "forward",
                                                "text": "转交"
                                            },
                                            {
                                                "hidden": false,
                                                "name": "退回",
                                                "action": "return",
                                                "text": "退回"
                                            },
                                            {
                                                "action": "recall",
                                                "hidden": true,
                                                "name": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "text": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                },
                                                "alias": {
                                                    "en_US": "recall",
                                                    "zh_CN": "收回",
                                                    "type": "i18n"
                                                }
                                            }
                                        ],
                                        "appendActions": [],
                                        "realBackOriginator": "y",
                                        "triggerRule": "n"
                                    },
                                    "title": "运营负责人提交市场统计模板",
                                    "formConfig": {
                                        "behaviorList": [
                                            {
                                                "fieldId": "textField_lii9qtrm",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtro",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrt",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtru",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrv",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "selectField_lii9qtrw",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrx",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtry",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qtrz",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts0",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts1",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lix0k7ir",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qtrn",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts2",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_liid7q8t",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "attachmentField_lklxword",
                                                "fieldBehavior": "NORMAL"
                                            },
                                            {
                                                "fieldId": "attachmentField_lii9qts3",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts5",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textareaField_liscxx0m",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "textField_lii9qts4",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "employeeField_lii9qts7",
                                                "fieldBehavior": "READONLY"
                                            },
                                            {
                                                "fieldId": "cascadeDateField_lii9qts8",
                                                "fieldBehavior": "READONLY"
                                            }
                                        ]
                                    },
                                    "conditions": {
                                        "priority": 2
                                    }
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclv2ayeqte",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "运营确认样品预估销量与上架时间",
                                    "description": "请选择执行人",
                                    "approverRules": {
                                        "type": "ext_target_approval",
                                        "description": "曾思怡"
                                    },
                                    "nodeError": "",
                                    "title": "运营确认样品预估销量与上架时间",
                                    "noActionersType": "stopProcess",
                                    "conditions": {
                                        "priority": 4
                                    }
                                }
                            }
                        ]
                    },
                    {
                        "componentName": "ParallelNode",
                        "id": "node_oclv2a2mj44",
                        "props": {
                            "name": "条件1",
                            "description": "",
                            "conditions": {
                                "priority": 7,
                                "calculate": "condition",
                                "isDefault": false,
                                "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳"
                            }
                        },
                        "children": [
                            {
                                "componentName": "ApprovalNode",
                                "id": "node_oclv2a2mj45",
                                "props": {
                                    "nodeName": "ApprovalNode",
                                    "name": "审核产品",
                                    "description": {
                                        "en_US": "Sponsor approval",
                                        "zh_CN": "发起人审批",
                                        "type": "i18n"
                                    },
                                    "nodeError": "",
                                    "noActionersType": "stopProcess",
                                    "title": "审核产品",
                                    "conditions": {
                                        "priority": 1
                                    }
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclv2a2mj46",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "运营负责人提交市场统计模板",
                                    "description": "请选择执行人",
                                    "approverRules": {
                                        "type": "ext_target_approval",
                                        "approvals": [
                                            {
                                                "id": "214463031521041490",
                                                "label": "刘晨红",
                                                "type": "employee",
                                                "roleType": "DINGTALK",
                                                "avatar": "//img.alicdn.com/tfs/TB1mKVJSpXXXXcwaXXXXXXXXXXX-78-80.jpg"
                                            }
                                        ],
                                        "description": "刘晨红"
                                    },
                                    "title": "运营负责人提交市场统计模板",
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclv2ayeqtf",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "运营确认样品预估销量与上架时间",
                                    "description": "请选择执行人",
                                    "approverRules": {
                                        "type": "ext_target_approval",
                                        "approvals": [
                                            {
                                                "id": "214463031521041490",
                                                "label": "刘晨红",
                                                "type": "employee",
                                                "roleType": "DINGTALK",
                                                "avatar": "//img.alicdn.com/tfs/TB1mKVJSpXXXXcwaXXXXXXXXXXX-78-80.jpg"
                                            }
                                        ],
                                        "description": "刘晨红"
                                    },
                                    "nodeError": "",
                                    "title": "运营确认样品预估销量与上架时间",
                                    "noActionersType": "stopProcess",
                                    "conditions": {
                                        "priority": 4
                                    }
                                }
                            }
                        ]
                    },
                    {
                        "componentName": "ParallelNode",
                        "id": "node_oclv2a2mj47",
                        "props": {
                            "name": "条件1",
                            "description": "",
                            "conditions": {
                                "priority": 8,
                                "calculate": "condition",
                                "isDefault": false,
                                "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳"
                            }
                        },
                        "children": [
                            {
                                "componentName": "ApprovalNode",
                                "id": "node_oclv2a2mj48",
                                "props": {
                                    "nodeName": "ApprovalNode",
                                    "name": "审核产品",
                                    "description": {
                                        "en_US": "Sponsor approval",
                                        "zh_CN": "发起人审批",
                                        "type": "i18n"
                                    },
                                    "title": "审核产品",
                                    "conditions": {
                                        "priority": 1
                                    }
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclv2a2mj49",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "运营负责人提交市场统计模板",
                                    "description": "请选择执行人",
                                    "title": "运营负责人提交市场统计模板",
                                    "conditions": {
                                        "priority": 2
                                    }
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclv2ayeqtg",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "运营确认样品预估销量与上架时间",
                                    "description": "请选择执行人",
                                    "title": "运营确认样品预估销量与上架时间",
                                    "noActionersType": "stopProcess",
                                    "conditions": {
                                        "priority": 4
                                    }
                                }
                            }
                        ]
                    },
                    {
                        "componentName": "ParallelNode",
                        "id": "node_oclv2a2mj4a",
                        "props": {
                            "name": "条件1",
                            "description": "",
                            "conditions": {
                                "priority": 9,
                                "calculate": "condition",
                                "isDefault": false,
                                "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳"
                            }
                        },
                        "children": [
                            {
                                "componentName": "ApprovalNode",
                                "id": "node_oclv2a2mj4b",
                                "props": {
                                    "nodeName": "ApprovalNode",
                                    "name": "审核产品",
                                    "description": {
                                        "en_US": "Sponsor approval",
                                        "zh_CN": "发起人审批",
                                        "type": "i18n"
                                    },
                                    "title": "审核产品",
                                    "conditions": {
                                        "priority": 2
                                    }
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclv2a2mj4c",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "运营负责人提交市场统计模板",
                                    "description": "请选择执行人",
                                    "title": "运营负责人提交市场统计模板"
                                }
                            },
                            {
                                "componentName": "OperatorNode",
                                "id": "node_oclv2ayeqth",
                                "props": {
                                    "nodeName": "OperatorNode",
                                    "name": "运营确认样品预估销量与上架时间",
                                    "description": "请选择执行人",
                                    "title": "运营确认样品预估销量与上架时间",
                                    "noActionersType": "stopProcess",
                                    "conditions": {
                                        "priority": 5
                                    }
                                }
                            }
                        ]
                    },
                    {
                        "componentName": "ParallelNode",
                        "id": "node_oclv1t0i393",
                        "props": {
                            "isDefault": true,
                            "name": "其他情况",
                            "description": ""
                        }
                    }
                ]
            },
            {
                "componentName": "OperatorNode",
                "id": "node_oclv2ayeqt1",
                "props": {
                    "nodeName": "OperatorNode",
                    "name": "统计预估销量与样品需求",
                    "description": "请选择执行人",
                    "title": "统计预估销量与样品需求"
                },
                "title": "执行人"
            },
            {
                "componentName": "OperatorNode",
                "id": "node_ocliid9xm74",
                "props": {
                    "nodeName": "OperatorNode",
                    "name": "分配采购办理人",
                    "description": "请选择执行人",
                    "nodeError": "",
                    "title": "分配采购办理人"
                },
                "title": "执行人"
            },
            {
                "componentName": "OperatorNode",
                "id": "node_oclkxfaina1",
                "props": {
                    "nodeName": "OperatorNode",
                    "name": "周转订货合同说明",
                    "description": "请选择执行人",
                    "title": "周转订货合同说明",
                },
                "title": "执行人"
            },
            {
                "componentName": "OperatorNode",
                "id": "node_ocliidtnye1",
                "props": {
                    "nodeName": "OperatorNode",
                    "name": "采购办理订货",
                    "description": "请选择执行人",
                },
                "title": "执行人"
            },
            {
                "componentName": "OperatorNode",
                "id": "node_oclqnoegtn1",
                "props": {
                    "nodeName": "OperatorNode",
                    "name": "货品到仓确认",
                    "description": "请选择执行人",
                    "title": "货品到仓确认",
                    "conditions": {
                        "priority": 13
                    }
                },
                "title": "执行人"
            },
            {
                "componentName": "CarbonNode",
                "id": "node_oclp9c3fe21",
                "props": {
                    "nodeName": "CarbonNode",
                    "name": "抄送人",
                    "description": "请选择抄送人",
                    "approverRules": {
                        "type": "ext_target_approval_originator",
                        "description": "发起人本人"
                    },
                    "conditions": {
                        "priority": 15
                    }
                },
                "title": "抄送人"
            },
            {
                "componentName": "EndNode",
                "id": "node_ockpz6phx78",
                "props": {
                    "name": {
                        "en_US": "end",
                        "zh_CN": "结束",
                        "type": "i18n"
                    },
                    "conditions": {
                        "priority": 16
                    }
                }
            }
        ]

        const result = flowFormService.refactorReviewItems(reviewItems, null)
        // 发起
        assert.equal(result[0].time, undefined)
        assert.equal(result[0].lastNode, null)
        assert.equal(result[0].lastTimingNodes, undefined)

        // 第2个节点
        assert.equal(result[1].time, 0)
        assert.equal(result[1].lastNode, "node_ockpz6phx72")
        assert.equal(result[1].lastTimingNodes.length, 0)
        assert.equal(result[1].lastTimingNodes[0], undefined)

        // 并行条件
        assert.equal(result[2].time, null)
        assert.equal(result[2].lastNode, "node_oclv2c2ehf1")
        assert.equal(result[2].lastTimingNodes, null)
        // 条件1
        assert.equal(result[2].children[0].time, null)
        assert.equal(result[2].children[0].lastNode, null)
        assert.equal(result[2].children[0].lastTimingNodes, null)
        // 条件1- step1
        assert.equal(result[2].children[0].children[0].time, 0)
        assert.equal(result[2].children[0].children[0].lastNode, null)
        assert.equal(result[2].children[0].children[0].lastTimingNodes.length, 1)
        assert.equal(result[2].children[0].children[0].lastTimingNodes[0], "node_oclv2c2ehf1")
        // 条件1- step2
        assert.equal(result[2].children[0].children[1].time, 0)
        assert.equal(result[2].children[0].children[1].lastNode, "node_oclv1t0i396")
        assert.equal(result[2].children[0].children[1].lastTimingNodes.length, 1)
        assert.equal(result[2].children[0].children[1].lastTimingNodes[0], "node_oclv1t0i396")
        // 条件1- step3
        assert.equal(result[2].children[0].children[2].time, 0)
        assert.equal(result[2].children[0].children[2].lastNode, "node_oclv1t0i397")
        assert.equal(result[2].children[0].children[2].lastTimingNodes.length, 1)
        assert.equal(result[2].children[0].children[2].lastTimingNodes[0], "node_oclv1t0i397")
        // 条件1-step7
        // 条件分支
        assert.equal(result[2].children[0].children[6].time, null)
        assert.equal(result[2].children[0].children[6].lastNode, "node_oclv2a2mj4d")
        assert.equal(result[2].children[0].children[6].lastTimingNodes, null)
        // 条件1-step7-条件分支1
        assert.equal(result[2].children[0].children[6].children[0].time, null)
        assert.equal(result[2].children[0].children[6].children[0].lastNode, null)
        assert.equal(result[2].children[0].children[6].children[0].lastTimingNodes, null)
        // 条件1-step7-条件分支1-step1
        assert.equal(result[2].children[0].children[6].children[0].children[0].time, 0)
        assert.equal(result[2].children[0].children[6].children[0].children[0].lastNode, null)
        assert.equal(result[2].children[0].children[6].children[0].children[0].lastTimingNodes.length, 1)
        assert.equal(result[2].children[0].children[6].children[0].children[0].lastTimingNodes[0], "node_oclv2a2mj4d")
        // 条件1-step7-条件分支1-step2
        assert.equal(result[2].children[0].children[6].children[0].children[1].time, 0)
        assert.equal(result[2].children[0].children[6].children[0].children[1].lastNode, "node_oclv2a2mj4h")
        assert.equal(result[2].children[0].children[6].children[0].children[1].lastTimingNodes.length, 1)
        assert.equal(result[2].children[0].children[6].children[0].children[1].lastTimingNodes[0], "node_oclv2a2mj4h")
        // 条件1-step7-条件分支2-step1
        assert.equal(result[2].children[0].children[6].children[1].children[0].time, 0)
        assert.equal(result[2].children[0].children[6].children[1].children[0].lastNode, null)
        assert.equal(result[2].children[0].children[6].children[1].children[0].lastTimingNodes.length, 1)
        assert.equal(result[2].children[0].children[6].children[1].children[0].lastTimingNodes[0], "node_oclv2a2mj4d")
        // 条件1-step7-条件分支2-step2
        assert.equal(result[2].children[0].children[6].children[1].children[1].time, 0)
        assert.equal(result[2].children[0].children[6].children[1].children[1].lastNode, "node_oclv2a2mj4k")
        assert.equal(result[2].children[0].children[6].children[1].children[1].lastTimingNodes.length, 1)
        assert.equal(result[2].children[0].children[6].children[1].children[1].lastTimingNodes[0], "node_oclv2a2mj4k")
        // 条件1-step8
        assert.equal(result[2].children[0].children[7].time, 0)
        assert.equal(result[2].children[0].children[7].lastNode, "node_oclv2a2mj4e")
        assert.equal(result[2].children[0].children[7].lastTimingNodes.length, 3)
        assert.equal(result[2].children[0].children[7].lastTimingNodes.includes("node_oclv2a2mj4i"), true)
        assert.equal(result[2].children[0].children[7].lastTimingNodes.includes("node_oclv2a2mj4l"), true)
        assert.equal(result[2].children[0].children[7].lastTimingNodes.includes("node_oclv2a2mj4m"), true)

        // 条件2
        assert.equal(result[2].children[1].time, null)
        assert.equal(result[2].children[1].lastNode, "node_oclv1t0i392")
        assert.equal(result[2].children[1].lastTimingNodes, null)
        // 条件2- step1
        assert.equal(result[2].children[1].children[0].time, 0)
        assert.equal(result[2].children[1].children[0].lastNode, null)
        assert.equal(result[2].children[1].children[0].lastTimingNodes.length, 1)
        assert.equal(result[2].children[1].children[0].lastTimingNodes[0], "node_oclv2c2ehf1")
        // 条件2- step2
        assert.equal(result[2].children[1].children[1].time, 0)
        assert.equal(result[2].children[1].children[1].lastNode, "node_oclv1t0i398")
        assert.equal(result[2].children[1].children[1].lastTimingNodes.length, 1)
        assert.equal(result[2].children[1].children[1].lastTimingNodes[0], "node_oclv1t0i398")
        // 条件2- step5
        assert.equal(result[2].children[1].children[4].time, 0)
        assert.equal(result[2].children[1].children[4].lastNode, "node_oclv2ayeqta")
        assert.equal(result[2].children[1].children[4].lastTimingNodes.length, 1)
        assert.equal(result[2].children[1].children[4].lastTimingNodes[0], "node_oclv2ayeqta")
        // 条件3
        assert.equal(result[2].children[2].time, null)
        assert.equal(result[2].children[2].lastNode, "node_oclv1t0i395")
        assert.equal(result[2].children[2].lastTimingNodes, null)
        // 条件3- step1
        assert.equal(result[2].children[3].children[0].lastTimingNodes[0], "node_oclv2c2ehf1")
        // 条件10
        assert.equal(result[2].children[9].time, null)
        assert.equal(result[2].children[9].lastNode, "node_oclv2a2mj4a")

        // 统计预估
        assert.equal(result[3].time, 0)
        assert.equal(result[3].lastNode, "node_oclv1t0i391")
        assert.equal(result[3].lastTimingNodes.length, 10)
        assert.equal(result[3].lastTimingNodes.includes("node_oclm60vm9a1"), true)
        assert.equal(result[3].lastTimingNodes.includes("node_oclv2ayeqti"), true)
        assert.equal(result[3].lastTimingNodes.includes("node_oclv2ayeqtj"), true)
        assert.equal(result[3].lastTimingNodes.includes("node_oclv2ayeqtc"), true)
        assert.equal(result[3].lastTimingNodes.includes("node_oclv2ayeqtd"), true)
        assert.equal(result[3].lastTimingNodes.includes("node_oclv2ayeqte"), true)
        assert.equal(result[3].lastTimingNodes.includes("node_oclv2ayeqtf"), true)
        assert.equal(result[3].lastTimingNodes.includes("node_oclv2ayeqtg"), true)
        assert.equal(result[3].lastTimingNodes.includes("node_oclv2ayeqth"), true)
        assert.equal(result[3].lastTimingNodes.includes("node_oclv1t0i393"), true)

    })
})