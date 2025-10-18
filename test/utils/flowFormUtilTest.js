const flowFormReviewUtil = require("@/utils/flowFormReviewUtil")

describe("flowFormReviewUtil", ()=>{
    it("formExecutePaths", async () => {
        const xuanPinHuiForm = [
            {
                "id": "node_ockpz6phx72",
                "time": 0,
                "title": "发起",
                "isTime": true,
                "children": [],
                "description": "",
                "componentName": "ApplyNode",
                "lastTimingNodes": []
            },
            {
                "id": "node_oclv2c2ehf1",
                "time": 8,
                "title": "开发交接确认样品",
                "isTime": true,
                "children": [],
                "lastNode": "node_ockpz6phx72",
                "description": "",
                "componentName": "OperatorNode",
                "lastTimingNodes": [
                    "node_ockpz6phx72"
                ]
            },
            {
                "id": "node_oclv1t0i391",
                "time": 0,
                "title": "并行分支",
                "children": [
                    {
                        "id": "node_oclv1t0i392",
                        "time": 0,
                        "title": "条件1 (发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳)",
                        "children": [
                            {
                                "id": "node_oclv1t0i396",
                                "time": 8,
                                "title": "审核产品",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2c2ehf1"
                                ]
                            },
                            {
                                "id": "node_oclv1t0i397",
                                "time": 4,
                                "title": "分配运营分析",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv1t0i396",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv1t0i396"
                                ]
                            },
                            {
                                "id": "node_oclklxv8kk1",
                                "time": 3,
                                "title": "运营负责人提交市场统计模板",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv1t0i397",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv1t0i397"
                                ]
                            },
                            {
                                "id": "node_oclix0mfzn1",
                                "time": 8,
                                "title": "执行提交市场分析表",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclklxv8kk1",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclklxv8kk1"
                                ]
                            },
                            {
                                "id": "node_ocliieab3b1",
                                "time": 8,
                                "title": "运营提交市场分析方案",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclix0mfzn1",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclix0mfzn1"
                                ]
                            },
                            {
                                "id": "node_oclv2a2mj4e",
                                "time": 0,
                                "title": "条件分支",
                                "children": [
                                    {
                                        "id": "node_oclv2a2mj4f",
                                        "time": 0,
                                        "title": "条件1 (运营负责人等于任意一个安静淼, 薛娜)",
                                        "children": [
                                            {
                                                "id": "node_oclv2a2mj4h",
                                                "time": 4,
                                                "title": "组长审核方案",
                                                "isTime": true,
                                                "children": [],
                                                "description": "",
                                                "componentName": "ApprovalNode",
                                                "lastTimingNodes": [
                                                    "node_ocliieab3b1"
                                                ]
                                            },
                                            {
                                                "id": "node_oclv2a2mj4i",
                                                "time": 4,
                                                "title": "项目负责人审核方案",
                                                "isTime": true,
                                                "children": [],
                                                "lastNode": "node_oclv2a2mj4h",
                                                "description": "",
                                                "componentName": "ApprovalNode",
                                                "lastTimingNodes": [
                                                    "node_oclv2a2mj4h"
                                                ]
                                            }
                                        ],
                                        "description": "运营负责人等于任意一个安静淼, 薛娜",
                                        "componentName": "ConditionNode"
                                    },
                                    {
                                        "id": "node_oclv2a2mj4j",
                                        "time": 0,
                                        "title": "条件1 (运营负责人等于任意一个唐再宏)",
                                        "children": [
                                            {
                                                "id": "node_oclv2a2mj4k",
                                                "time": 4,
                                                "title": "组长审核方案",
                                                "isTime": true,
                                                "children": [],
                                                "description": "",
                                                "componentName": "ApprovalNode",
                                                "lastTimingNodes": [
                                                    "node_ocliieab3b1"
                                                ]
                                            },
                                            {
                                                "id": "node_oclv2a2mj4l",
                                                "time": 4,
                                                "title": "项目负责人审核方案",
                                                "isTime": true,
                                                "children": [],
                                                "lastNode": "node_oclv2a2mj4k",
                                                "description": "",
                                                "componentName": "ApprovalNode",
                                                "lastTimingNodes": [
                                                    "node_oclv2a2mj4k"
                                                ]
                                            }
                                        ],
                                        "lastNode": "node_oclv2a2mj4f",
                                        "description": "运营负责人等于任意一个唐再宏",
                                        "componentName": "ConditionNode"
                                    },
                                    {
                                        "id": "node_oclv2a2mj4g",
                                        "time": 0,
                                        "title": "其他情况",
                                        "children": [
                                            {
                                                "id": "node_oclv2a2mj4m",
                                                "time": 4,
                                                "title": "项目负责人审核方案",
                                                "isTime": true,
                                                "children": [],
                                                "description": "",
                                                "componentName": "ApprovalNode",
                                                "lastTimingNodes": [
                                                    "node_ocliieab3b1"
                                                ]
                                            }
                                        ],
                                        "lastNode": "node_oclv2a2mj4j",
                                        "description": "",
                                        "componentName": "ConditionNode"
                                    }
                                ],
                                "lastNode": "node_ocliieab3b1",
                                "description": "",
                                "componentName": "ConditionContainer"
                            },
                            {
                                "id": "node_ocliid9xm73",
                                "time": 8,
                                "title": "运营确认样品预估销量",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2a2mj4e",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv2a2mj4i",
                                    "node_oclv2a2mj4l",
                                    "node_oclv2a2mj4m"
                                ]
                            },
                            {
                                "id": "node_oclm60vm9a1",
                                "time": 2,
                                "title": "审核订货量",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_ocliid9xm73",
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_ocliid9xm73"
                                ]
                            }
                        ],
                        "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳",
                        "componentName": "ParallelNode"
                    },
                    {
                        "id": "node_oclv1t0i395",
                        "time": 0,
                        "title": "条件1 (发起人等于任意一个李梦灵, 胡晓东, 崔竹, 郭晓龙, 刘玉鹤, 陈盈佳)",
                        "children": [
                            {
                                "id": "node_oclv1t0i398",
                                "time": 8,
                                "title": "审核产品",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2c2ehf1"
                                ]
                            },
                            {
                                "id": "node_oclv1t0i399",
                                "time": 4,
                                "title": "分配运营分析",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv1t0i398",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv1t0i398"
                                ]
                            },
                            {
                                "id": "node_oclv1ugwu31",
                                "time": 4,
                                "title": "运营负责人提交市场统计模板",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv1t0i399",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv1t0i399"
                                ]
                            },
                            {
                                "id": "node_oclv2ayeqta",
                                "time": 8,
                                "title": "运营确认样品预估销量与上架时间",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv1ugwu31",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv1ugwu31"
                                ]
                            },
                            {
                                "id": "node_oclv2ayeqti",
                                "time": 4,
                                "title": "审核订货量",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2ayeqta",
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2ayeqta"
                                ]
                            }
                        ],
                        "lastNode": "node_oclv1t0i392",
                        "description": "发起人等于任意一个李梦灵, 胡晓东, 崔竹, 郭晓龙, 刘玉鹤, 陈盈佳",
                        "componentName": "ParallelNode"
                    },
                    {
                        "id": "node_oclv1t0i394",
                        "time": 0,
                        "title": "条件1 (发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳)",
                        "children": [
                            {
                                "id": "node_oclv1t0i39a",
                                "time": 8,
                                "title": "审核产品",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2c2ehf1"
                                ]
                            },
                            {
                                "id": "node_oclv1t0i39b",
                                "time": 4,
                                "title": "分配运营分析",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv1t0i39a",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv1t0i39a"
                                ]
                            },
                            {
                                "id": "node_oclv1ugwu32",
                                "time": 8,
                                "title": "运营负责人提交市场统计模板",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv1t0i39b",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv1t0i39b"
                                ]
                            },
                            {
                                "id": "node_oclv2ayeqtb",
                                "time": 4,
                                "title": "运营确认样品预估销量与上架时间",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv1ugwu32",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv1ugwu32"
                                ]
                            },
                            {
                                "id": "node_oclv2ayeqtj",
                                "time": 4,
                                "title": "审核订货量",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2ayeqtb",
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2ayeqtb"
                                ]
                            }
                        ],
                        "lastNode": "node_oclv1t0i395",
                        "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳",
                        "componentName": "ParallelNode"
                    },
                    {
                        "id": "node_oclv24zen51",
                        "time": 0,
                        "title": "条件1 (发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳)",
                        "children": [
                            {
                                "id": "node_oclv24zen52",
                                "time": 8,
                                "title": "审核产品",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2c2ehf1"
                                ]
                            },
                            {
                                "id": "node_oclv24zen54",
                                "time": 4,
                                "title": "运营负责人提交市场统计模板",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv24zen52",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv24zen52"
                                ]
                            },
                            {
                                "id": "node_oclv2ayeqtc",
                                "time": 4,
                                "title": "运营确认样品预估销量与上架时间",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv24zen54",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv24zen54"
                                ]
                            }
                        ],
                        "lastNode": "node_oclv1t0i394",
                        "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳",
                        "componentName": "ParallelNode"
                    },
                    {
                        "id": "node_oclv24zen55",
                        "time": 0,
                        "title": "条件1 (发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳)",
                        "children": [
                            {
                                "id": "node_oclv24zen56",
                                "time": 8,
                                "title": "审核产品",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2c2ehf1"
                                ]
                            },
                            {
                                "id": "node_oclv24zen58",
                                "time": 8,
                                "title": "运营负责人提交市场统计模板",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv24zen56",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv24zen56"
                                ]
                            },
                            {
                                "id": "node_oclv2ayeqtd",
                                "time": 4,
                                "title": "运营确认样品预估销量与上架时间",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv24zen58",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv24zen58"
                                ]
                            }
                        ],
                        "lastNode": "node_oclv24zen51",
                        "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳",
                        "componentName": "ParallelNode"
                    },
                    {
                        "id": "node_oclv2a2mj41",
                        "time": 0,
                        "title": "条件1 (发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳)",
                        "children": [
                            {
                                "id": "node_oclv2a2mj42",
                                "time": 8,
                                "title": "审核产品",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2c2ehf1"
                                ]
                            },
                            {
                                "id": "node_oclv2a2mj43",
                                "time": 8,
                                "title": "运营负责人提交市场统计模板",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2a2mj42",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv2a2mj42"
                                ]
                            },
                            {
                                "id": "node_oclv2ayeqte",
                                "time": 4,
                                "title": "运营确认样品预估销量与上架时间",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2a2mj43",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv2a2mj43"
                                ]
                            }
                        ],
                        "lastNode": "node_oclv24zen55",
                        "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳",
                        "componentName": "ParallelNode"
                    },
                    {
                        "id": "node_oclv2a2mj44",
                        "time": 0,
                        "title": "条件1 (发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳)",
                        "children": [
                            {
                                "id": "node_oclv2a2mj45",
                                "time": 8,
                                "title": "审核产品",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2c2ehf1"
                                ]
                            },
                            {
                                "id": "node_oclv2a2mj46",
                                "time": 8,
                                "title": "运营负责人提交市场统计模板",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2a2mj45",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv2a2mj45"
                                ]
                            },
                            {
                                "id": "node_oclv2ayeqtf",
                                "time": 4,
                                "title": "运营确认样品预估销量与上架时间",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2a2mj46",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv2a2mj46"
                                ]
                            }
                        ],
                        "lastNode": "node_oclv2a2mj41",
                        "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳",
                        "componentName": "ParallelNode"
                    },
                    {
                        "id": "node_oclv2a2mj47",
                        "time": 0,
                        "title": "条件1 (发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳)",
                        "children": [
                            {
                                "id": "node_oclv2a2mj48",
                                "time": 8,
                                "title": "审核产品",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2c2ehf1"
                                ]
                            },
                            {
                                "id": "node_oclv2a2mj49",
                                "time": 8,
                                "title": "运营负责人提交市场统计模板",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2a2mj48",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv2a2mj48"
                                ]
                            },
                            {
                                "id": "node_oclv2ayeqtg",
                                "time": 4,
                                "title": "运营确认样品预估销量与上架时间",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2a2mj49",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv2a2mj49"
                                ]
                            }
                        ],
                        "lastNode": "node_oclv2a2mj44",
                        "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳",
                        "componentName": "ParallelNode"
                    },
                    {
                        "id": "node_oclv2a2mj4a",
                        "time": 0,
                        "title": "条件1 (发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳)",
                        "children": [
                            {
                                "id": "node_oclv2a2mj4b",
                                "time": 8,
                                "title": "审核产品",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2c2ehf1"
                                ]
                            },
                            {
                                "id": "node_oclv2a2mj4c",
                                "time": 8,
                                "title": "运营负责人提交市场统计模板",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2a2mj4b",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv2a2mj4b"
                                ]
                            },
                            {
                                "id": "node_oclv2ayeqth",
                                "time": 4,
                                "title": "运营确认样品预估销量与上架时间",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2a2mj4c",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv2a2mj4c"
                                ]
                            }
                        ],
                        "lastNode": "node_oclv2a2mj47",
                        "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳",
                        "componentName": "ParallelNode"
                    },
                    {
                        "id": "node_oclv1t0i393",
                        "time": 0,
                        "title": "其他情况",
                        "children": [],
                        "lastNode": "node_oclv2a2mj4a",
                        "description": "",
                        "componentName": "ParallelNode"
                    }
                ],
                "lastNode": "node_oclv2c2ehf1",
                "description": "",
                "componentName": "ConditionContainer"
            },
            {
                "id": "node_oclv2ayeqt1",
                "time": 24,
                "title": "统计预估销量与样品需求",
                "isTime": true,
                "children": [],
                "lastNode": "node_oclv1t0i391",
                "description": "",
                "componentName": "OperatorNode",
                "lastTimingNodes": [
                    "node_oclm60vm9a1",
                    "node_oclv2ayeqti",
                    "node_oclv2ayeqtj",
                    "node_oclv2ayeqtc",
                    "node_oclv2ayeqtd",
                    "node_oclv2ayeqte",
                    "node_oclv2ayeqtf",
                    "node_oclv2ayeqtg",
                    "node_oclv2ayeqth",
                    "node_oclv1t0i393"
                ]
            },
            {
                "id": "node_ocliid9xm74",
                "time": 24,
                "title": "分配采购办理人",
                "isTime": true,
                "children": [],
                "lastNode": "node_oclv2ayeqt1",
                "description": "",
                "componentName": "OperatorNode",
                "lastTimingNodes": [
                    "node_oclv2ayeqt1"
                ]
            },
            {
                "id": "node_oclkxfaina1",
                "time": 16,
                "title": "周转订货合同说明",
                "isTime": true,
                "children": [],
                "lastNode": "node_ocliid9xm74",
                "description": "",
                "componentName": "OperatorNode",
                "lastTimingNodes": [
                    "node_ocliid9xm74"
                ]
            },
            {
                "id": "node_ocliidtnye1",
                "time": 16,
                "title": "采购办理订货",
                "isTime": true,
                "children": [],
                "lastNode": "node_oclkxfaina1",
                "description": "",
                "componentName": "OperatorNode",
                "lastTimingNodes": [
                    "node_oclkxfaina1"
                ]
            },
            {
                "id": "node_oclqnoegtn1",
                "time": 56,
                "title": "货品到仓确认",
                "isTime": true,
                "children": [],
                "lastNode": "node_ocliidtnye1",
                "description": "",
                "componentName": "OperatorNode",
                "lastTimingNodes": [
                    "node_ocliidtnye1"
                ]
            },
            {
                "id": "node_oclp9c3fe21",
                "time": 0,
                "title": "抄送人",
                "isTime": true,
                "children": [],
                "lastNode": "node_oclqnoegtn1",
                "description": "",
                "componentName": "CarbonNode",
                "lastTimingNodes": [
                    "node_oclqnoegtn1"
                ]
            },
            {
                "id": "node_ockpz6phx78",
                "time": 0,
                "title": "结束",
                "children": [],
                "lastNode": "node_oclp9c3fe21",
                "description": "",
                "componentName": "EndNode"
            }
        ]
        const xuanPinHuiForm1 = [
            {
                "id": "node_ockpz6phx72",
                "time": 0,
                "title": "发起",
                "isTime": true,
                "children": [],
                "description": "",
                "componentName": "ApplyNode",
                "lastTimingNodes": []
            },
            {
                "id": "node_oclv2c2ehf1",
                "time": 8,
                "title": "开发交接确认样品",
                "isTime": true,
                "children": [],
                "lastNode": "node_ockpz6phx72",
                "description": "",
                "componentName": "OperatorNode",
                "lastTimingNodes": [
                    "node_ockpz6phx72"
                ]
            },
            {
                "id": "node_oclv1t0i391",
                "time": 0,
                "title": "并行分支",
                "children": [
                    {
                        "id": "node_oclv1t0i392",
                        "time": 0,
                        "title": "条件1 (发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳)",
                        "children": [
                            {
                                "id": "node_oclv1t0i396",
                                "time": 8,
                                "title": "审核产品",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2c2ehf1"
                                ]
                            },
                            {
                                "id": "node_oclv1t0i397",
                                "time": 4,
                                "title": "分配运营分析",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv1t0i396",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv1t0i396"
                                ]
                            },
                            {
                                "id": "node_oclklxv8kk1",
                                "time": 3,
                                "title": "运营负责人提交市场统计模板",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv1t0i397",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv1t0i397"
                                ]
                            },
                            {
                                "id": "node_oclix0mfzn1",
                                "time": 8,
                                "title": "执行提交市场分析表",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclklxv8kk1",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclklxv8kk1"
                                ]
                            },
                            {
                                "id": "node_ocliieab3b1",
                                "time": 8,
                                "title": "运营提交市场分析方案",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclix0mfzn1",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclix0mfzn1"
                                ]
                            },
                            {
                                "id": "node_ocliid9xm73",
                                "time": 8,
                                "title": "运营确认样品预估销量",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2a2mj4e",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv2a2mj4i",
                                    "node_oclv2a2mj4l",
                                    "node_oclv2a2mj4m"
                                ]
                            },
                            {
                                "id": "node_oclm60vm9a1",
                                "time": 2,
                                "title": "审核订货量",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_ocliid9xm73",
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_ocliid9xm73"
                                ]
                            }
                        ],
                        "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳",
                        "componentName": "ParallelNode"
                    },
                    {
                        "id": "node_oclv1t0i395",
                        "time": 0,
                        "title": "条件2 (发起人等于任意一个李梦灵, 胡晓东, 崔竹, 郭晓龙, 刘玉鹤, 陈盈佳)",
                        "children": [
                            {
                                "id": "node_oclv1t0i398",
                                "time": 8,
                                "title": "审核产品",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2c2ehf1"
                                ]
                            },
                            {
                                "id": "node_oclv1t0i399",
                                "time": 4,
                                "title": "分配运营分析",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv1t0i398",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv1t0i398"
                                ]
                            },
                            {
                                "id": "node_oclv1ugwu31",
                                "time": 4,
                                "title": "运营负责人提交市场统计模板",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv1t0i399",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv1t0i399"
                                ]
                            },
                            {
                                "id": "node_oclv2a2mj4e",
                                "time": 0,
                                "title": "条件分支",
                                "children": [
                                    {
                                        "id": "node_oclv2a2mj4f",
                                        "time": 0,
                                        "title": "条件1 (运营负责人等于任意一个安静淼, 薛娜)",
                                        "children": [
                                            {
                                                "id": "node_oclv2a2mj4h",
                                                "time": 4,
                                                "title": "组长审核方案",
                                                "isTime": true,
                                                "children": [],
                                                "description": "",
                                                "componentName": "ApprovalNode",
                                                "lastTimingNodes": [
                                                    "node_ocliieab3b1"
                                                ]
                                            },
                                            {
                                                "id": "node_oclv2a2mj4i",
                                                "time": 4,
                                                "title": "项目负责人审核方案",
                                                "isTime": true,
                                                "children": [],
                                                "lastNode": "node_oclv2a2mj4h",
                                                "description": "",
                                                "componentName": "ApprovalNode",
                                                "lastTimingNodes": [
                                                    "node_oclv2a2mj4h"
                                                ]
                                            }
                                        ],
                                        "description": "运营负责人等于任意一个安静淼, 薛娜",
                                        "componentName": "ConditionNode"
                                    },
                                    {
                                        "id": "node_oclv2a2mj4j",
                                        "time": 0,
                                        "title": "条件1 (运营负责人等于任意一个唐再宏)",
                                        "children": [
                                            {
                                                "id": "node_oclv2a2mj4k",
                                                "time": 4,
                                                "title": "组长审核方案",
                                                "isTime": true,
                                                "children": [],
                                                "description": "",
                                                "componentName": "ApprovalNode",
                                                "lastTimingNodes": [
                                                    "node_ocliieab3b1"
                                                ]
                                            },
                                            {
                                                "id": "node_oclv2a2mj4l",
                                                "time": 4,
                                                "title": "项目负责人审核方案",
                                                "isTime": true,
                                                "children": [],
                                                "lastNode": "node_oclv2a2mj4k",
                                                "description": "",
                                                "componentName": "ApprovalNode",
                                                "lastTimingNodes": [
                                                    "node_oclv2a2mj4k"
                                                ]
                                            }
                                        ],
                                        "lastNode": "node_oclv2a2mj4f",
                                        "description": "运营负责人等于任意一个唐再宏",
                                        "componentName": "ConditionNode"
                                    },
                                    {
                                        "id": "node_oclv2a2mj4g",
                                        "time": 0,
                                        "title": "其他情况",
                                        "children": [
                                            {
                                                "id": "node_oclv2a2mj4m",
                                                "time": 4,
                                                "title": "项目负责人审核方案",
                                                "isTime": true,
                                                "children": [],
                                                "description": "",
                                                "componentName": "ApprovalNode",
                                                "lastTimingNodes": [
                                                    "node_ocliieab3b1"
                                                ]
                                            }
                                        ],
                                        "lastNode": "node_oclv2a2mj4j",
                                        "description": "",
                                        "componentName": "ConditionNode"
                                    }
                                ],
                                "lastNode": "node_ocliieab3b1",
                                "description": "",
                                "componentName": "ConditionContainer"
                            },
                            {
                                "id": "node_oclv2ayeqta",
                                "time": 8,
                                "title": "运营确认样品预估销量与上架时间",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv1ugwu31",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv1ugwu31"
                                ]
                            },
                            {
                                "id": "node_oclv2ayeqti",
                                "time": 4,
                                "title": "审核订货量",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2ayeqta",
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2ayeqta"
                                ]
                            }
                        ],
                        "lastNode": "node_oclv1t0i392",
                        "description": "发起人等于任意一个李梦灵, 胡晓东, 崔竹, 郭晓龙, 刘玉鹤, 陈盈佳",
                        "componentName": "ParallelNode"
                    },
                    {
                        "id": "node_oclv1t0i394",
                        "time": 0,
                        "title": "条件3 (发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳)",
                        "children": [
                            {
                                "id": "node_oclv1t0i39a",
                                "time": 8,
                                "title": "审核产品",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2c2ehf1"
                                ]
                            },
                            {
                                "id": "node_oclv1t0i39b",
                                "time": 4,
                                "title": "分配运营分析",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv1t0i39a",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv1t0i39a"
                                ]
                            },
                            {
                                "id": "node_oclv1ugwu32",
                                "time": 8,
                                "title": "运营负责人提交市场统计模板",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv1t0i39b",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv1t0i39b"
                                ]
                            },
                            {
                                "id": "node_oclv2ayeqtb",
                                "time": 4,
                                "title": "运营确认样品预估销量与上架时间",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv1ugwu32",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv1ugwu32"
                                ]
                            },
                            {
                                "id": "node_oclv2ayeqtj",
                                "time": 4,
                                "title": "审核订货量",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2ayeqtb",
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2ayeqtb"
                                ]
                            }
                        ],
                        "lastNode": "node_oclv1t0i395",
                        "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳",
                        "componentName": "ParallelNode"
                    },
                    {
                        "id": "node_oclv24zen51",
                        "time": 0,
                        "title": "条件4 (发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳)",
                        "children": [
                            {
                                "id": "node_oclv24zen52",
                                "time": 8,
                                "title": "审核产品",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2c2ehf1"
                                ]
                            },
                            {
                                "id": "node_oclv24zen54",
                                "time": 4,
                                "title": "运营负责人提交市场统计模板",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv24zen52",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv24zen52"
                                ]
                            },
                            {
                                "id": "node_oclv2ayeqtc",
                                "time": 4,
                                "title": "运营确认样品预估销量与上架时间",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv24zen54",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv24zen54"
                                ]
                            }
                        ],
                        "lastNode": "node_oclv1t0i394",
                        "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳",
                        "componentName": "ParallelNode"
                    },
                    {
                        "id": "node_oclv24zen55",
                        "time": 0,
                        "title": "条件5 (发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳)",
                        "children": [
                            {
                                "id": "node_oclv24zen56",
                                "time": 8,
                                "title": "审核产品",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2c2ehf1"
                                ]
                            },
                            {
                                "id": "node_oclv24zen58",
                                "time": 8,
                                "title": "运营负责人提交市场统计模板",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv24zen56",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv24zen56"
                                ]
                            },
                            {
                                "id": "node_oclv2ayeqtd",
                                "time": 4,
                                "title": "运营确认样品预估销量与上架时间",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv24zen58",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv24zen58"
                                ]
                            }
                        ],
                        "lastNode": "node_oclv24zen51",
                        "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳",
                        "componentName": "ParallelNode"
                    },
                    {
                        "id": "node_oclv2a2mj41",
                        "time": 0,
                        "title": "条件6 (发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳)",
                        "children": [
                            {
                                "id": "node_oclv2a2mj42",
                                "time": 8,
                                "title": "审核产品",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2c2ehf1"
                                ]
                            },
                            {
                                "id": "node_oclv2a2mj43",
                                "time": 8,
                                "title": "运营负责人提交市场统计模板",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2a2mj42",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv2a2mj42"
                                ]
                            },
                            {
                                "id": "node_oclv2ayeqte",
                                "time": 4,
                                "title": "运营确认样品预估销量与上架时间",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2a2mj43",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv2a2mj43"
                                ]
                            }
                        ],
                        "lastNode": "node_oclv24zen55",
                        "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳",
                        "componentName": "ParallelNode"
                    },
                    {
                        "id": "node_oclv2a2mj44",
                        "time": 0,
                        "title": "条件7 (发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳)",
                        "children": [
                            {
                                "id": "node_oclv2a2mj45",
                                "time": 8,
                                "title": "审核产品",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2c2ehf1"
                                ]
                            },
                            {
                                "id": "node_oclv2a2mj46",
                                "time": 8,
                                "title": "运营负责人提交市场统计模板",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2a2mj45",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv2a2mj45"
                                ]
                            },
                            {
                                "id": "node_oclv2ayeqtf",
                                "time": 4,
                                "title": "运营确认样品预估销量与上架时间",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2a2mj46",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv2a2mj46"
                                ]
                            }
                        ],
                        "lastNode": "node_oclv2a2mj41",
                        "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳",
                        "componentName": "ParallelNode"
                    },
                    {
                        "id": "node_oclv2a2mj47",
                        "time": 0,
                        "title": "条件8 (发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳)",
                        "children": [
                            {
                                "id": "node_oclv2a2mj48",
                                "time": 8,
                                "title": "审核产品",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2c2ehf1"
                                ]
                            },
                            {
                                "id": "node_oclv2a2mj49",
                                "time": 8,
                                "title": "运营负责人提交市场统计模板",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2a2mj48",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv2a2mj48"
                                ]
                            },
                            {
                                "id": "node_oclv2ayeqtg",
                                "time": 4,
                                "title": "运营确认样品预估销量与上架时间",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2a2mj49",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv2a2mj49"
                                ]
                            }
                        ],
                        "lastNode": "node_oclv2a2mj44",
                        "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳",
                        "componentName": "ParallelNode"
                    },
                    {
                        "id": "node_oclv2a2mj4a",
                        "time": 0,
                        "title": "条件9 (发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳)",
                        "children": [
                            {
                                "id": "node_oclv2a2mj4b",
                                "time": 8,
                                "title": "审核产品",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "ApprovalNode",
                                "lastTimingNodes": [
                                    "node_oclv2c2ehf1"
                                ]
                            },
                            {
                                "id": "node_oclv2a2mj4c",
                                "time": 8,
                                "title": "运营负责人提交市场统计模板",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2a2mj4b",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv2a2mj4b"
                                ]
                            },
                            {
                                "id": "node_oclv2ayeqth",
                                "time": 4,
                                "title": "运营确认样品预估销量与上架时间",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclv2a2mj4c",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": [
                                    "node_oclv2a2mj4c"
                                ]
                            }
                        ],
                        "lastNode": "node_oclv2a2mj47",
                        "description": "发起人等于任意一个李梦灵, 胡晓东, 郭晓龙, 崔竹, 刘玉鹤, 陈盈佳",
                        "componentName": "ParallelNode"
                    },
                    {
                        "id": "node_oclv1t0i393",
                        "time": 0,
                        "title": "其他情况",
                        "children": [],
                        "lastNode": "node_oclv2a2mj4a",
                        "description": "",
                        "componentName": "ParallelNode"
                    }
                ],
                "lastNode": "node_oclv2c2ehf1",
                "description": "",
                "componentName": "ConditionContainer"
            },
            {
                "id": "node_oclv2ayeqt1",
                "time": 24,
                "title": "统计预估销量与样品需求",
                "isTime": true,
                "children": [],
                "lastNode": "node_oclv1t0i391",
                "description": "",
                "componentName": "OperatorNode",
                "lastTimingNodes": [
                    "node_oclm60vm9a1",
                    "node_oclv2ayeqti",
                    "node_oclv2ayeqtj",
                    "node_oclv2ayeqtc",
                    "node_oclv2ayeqtd",
                    "node_oclv2ayeqte",
                    "node_oclv2ayeqtf",
                    "node_oclv2ayeqtg",
                    "node_oclv2ayeqth",
                    "node_oclv1t0i393"
                ]
            },
            {
                "id": "node_ocliid9xm74",
                "time": 24,
                "title": "分配采购办理人",
                "isTime": true,
                "children": [],
                "lastNode": "node_oclv2ayeqt1",
                "description": "",
                "componentName": "OperatorNode",
                "lastTimingNodes": [
                    "node_oclv2ayeqt1"
                ]
            },
            {
                "id": "node_oclkxfaina1",
                "time": 16,
                "title": "周转订货合同说明",
                "isTime": true,
                "children": [],
                "lastNode": "node_ocliid9xm74",
                "description": "",
                "componentName": "OperatorNode",
                "lastTimingNodes": [
                    "node_ocliid9xm74"
                ]
            },
            {
                "id": "node_ocliidtnye1",
                "time": 16,
                "title": "采购办理订货",
                "isTime": true,
                "children": [],
                "lastNode": "node_oclkxfaina1",
                "description": "",
                "componentName": "OperatorNode",
                "lastTimingNodes": [
                    "node_oclkxfaina1"
                ]
            },
            {
                "id": "node_oclqnoegtn1",
                "time": 56,
                "title": "货品到仓确认",
                "isTime": true,
                "children": [],
                "lastNode": "node_ocliidtnye1",
                "description": "",
                "componentName": "OperatorNode",
                "lastTimingNodes": [
                    "node_ocliidtnye1"
                ]
            },
            {
                "id": "node_oclp9c3fe21",
                "time": 0,
                "title": "抄送人",
                "isTime": true,
                "children": [],
                "lastNode": "node_oclqnoegtn1",
                "description": "",
                "componentName": "CarbonNode",
                "lastTimingNodes": [
                    "node_oclqnoegtn1"
                ]
            },
            {
                "id": "node_ockpz6phx78",
                "time": 0,
                "title": "结束",
                "children": [],
                "lastNode": "node_oclp9c3fe21",
                "description": "",
                "componentName": "EndNode"
            }
        ]

        const tmForm = [
            {
                "id": "node_ockpz6phx72",
                "time": 0,
                "title": "发起",
                "children": [],
                "description": "",
                "componentName": "ApplyNode"
            }, {
                "id": "node_oclm91902f1",
                "time": 24,
                "title": "执行统计五维表",
                "isTime": true,
                "children": [],
                "lastNode": "node_ockpz6phx72",
                "description": "",
                "componentName": "OperatorNode",
                "lastTimingNodes": []
            }, {
                "id": "node_oclv6afgcd1",
                "time": 2,
                "title": "执行人",
                "isTime": true,
                "children": [],
                "lastNode": "node_oclm91902f1",
                "description": "",
                "componentName": "OperatorNode",
                "lastTimingNodes": ["node_oclm91902f1"]
            }, {
                "id": "node_oclm91902f2",
                "time": 1,
                "title": "审核执行动作完成",
                "isTime": true,
                "children": [],
                "lastNode": "node_oclv6afgcd1",
                "description": "",
                "componentName": "ApprovalNode",
                "lastTimingNodes": ["node_oclv6afgcd1"]
            }, {
                "id": "node_oclo8dzm951",
                "time": 8,
                "title": "提交五维表方案",
                "isTime": true,
                "children": [],
                "lastNode": "node_oclm91902f2",
                "description": "",
                "componentName": "OperatorNode",
                "lastTimingNodes": ["node_oclm91902f2"]
            }, {
                "id": "node_oclto7ocj71",
                "time": 0,
                "title": "条件分支",
                "children": [{
                    "id": "node_oclto7ocj72",
                    "time": 0,
                    "title": "条件1 (负责运营等于安静淼或负责运营等于薛娜)",
                    "children": [{
                        "id": "node_oclto7ocj77",
                        "time": 5,
                        "title": "组长审核方案",
                        "isTime": true,
                        "children": [],
                        "description": "",
                        "componentName": "ApprovalNode",
                        "lastTimingNodes": ["node_oclo8dzm951"]
                    }, {
                        "id": "node_oclto7ocj78",
                        "time": 1,
                        "title": "项目负责人审核方案",
                        "isTime": true,
                        "children": [],
                        "lastNode": "node_oclto7ocj77",
                        "description": "",
                        "componentName": "ApprovalNode",
                        "lastTimingNodes": ["node_oclto7ocj77"]
                    }],
                    "description": "负责运营等于安静淼或负责运营等于薛娜",
                    "componentName": "ConditionNode"
                }, {
                    "id": "node_oclto7ocj74",
                    "time": 0,
                    "title": "条件2 (负责运营等于唐再宏)",
                    "children": [{
                        "id": "node_oclto7ocj75",
                        "time": 5,
                        "title": "组长审核方案",
                        "isTime": true,
                        "children": [],
                        "description": "",
                        "componentName": "ApprovalNode",
                        "lastTimingNodes": ["node_oclo8dzm951"]
                    }, {
                        "id": "node_oclto7ocj76",
                        "time": 1,
                        "title": "项目负责人审核方案",
                        "isTime": true,
                        "children": [],
                        "lastNode": "node_oclto7ocj75",
                        "description": "",
                        "componentName": "ApprovalNode",
                        "lastTimingNodes": ["node_oclto7ocj75"]
                    }],
                    "lastNode": "node_oclto7ocj72",
                    "description": "负责运营等于唐再宏",
                    "componentName": "ConditionNode"
                }, {
                    "id": "node_oclvhw76j21",
                    "time": 0,
                    "title": "条件3 (负责运营等于赵佳雯)",
                    "children": [{
                        "id": "node_oclvhw76j22",
                        "time": 5,
                        "title": "组长审核方案",
                        "isTime": true,
                        "children": [],
                        "description": "",
                        "componentName": "ApprovalNode",
                        "lastTimingNodes": ["node_oclo8dzm951"]
                    }, {
                        "id": "node_oclvhw76j23",
                        "time": 1,
                        "title": "项目负责人审核方案",
                        "isTime": true,
                        "children": [],
                        "lastNode": "node_oclvhw76j22",
                        "description": "",
                        "componentName": "ApprovalNode",
                        "lastTimingNodes": ["node_oclvhw76j22"]
                    }],
                    "lastNode": "node_oclto7ocj74",
                    "description": "负责运营等于赵佳雯",
                    "componentName": "ConditionNode"
                }, {
                    "id": "node_oclto7ocj73",
                    "time": 0,
                    "title": "其他情况",
                    "children": [{
                        "id": "node_oclm91902f3",
                        "time": 5,
                        "title": "项目负责人审核方案",
                        "isTime": true,
                        "children": [],
                        "description": "",
                        "componentName": "ApprovalNode",
                        "lastTimingNodes": ["node_oclo8dzm951"]
                    }],
                    "lastNode": "node_oclvhw76j21",
                    "description": "",
                    "componentName": "ConditionNode"
                }],
                "lastNode": "node_oclo8dzm951",
                "description": "",
                "componentName": "ConditionContainer"
            }, {
                "id": "node_ocltpgxaqr1",
                "time": 4,
                "title": "运营确认是否订货",
                "isTime": true,
                "children": [],
                "lastNode": "node_oclto7ocj71",
                "description": "",
                "componentName": "OperatorNode",
                "lastTimingNodes": ["node_oclto7ocj78", "node_oclto7ocj76", "node_oclvhw76j23", "node_oclm91902f3"]
            }, {
                "id": "node_ocltpgxaqr2",
                "time": 0,
                "title": "条件分支",
                "children": [{
                    "id": "node_ocltpgxaqr3",
                    "time": 0,
                    "title": "条件1 (是否需要订货等于是)",
                    "children": [{
                        "id": "node_ocltpgxaqr5",
                        "time": 3,
                        "title": "提交订货明细",
                        "isTime": true,
                        "children": [],
                        "description": "",
                        "componentName": "OperatorNode",
                        "lastTimingNodes": ["node_ocltpgxaqr1"]
                    }, {
                        "id": "node_oclu9d9ejm1",
                        "time": 1,
                        "title": "开发确认供应商及价格",
                        "isTime": true,
                        "children": [],
                        "lastNode": "node_ocltpgxaqr5",
                        "description": "",
                        "componentName": "ApprovalNode",
                        "lastTimingNodes": ["node_ocltpgxaqr5"]
                    }, {
                        "id": "node_ocltpj0jxr1",
                        "time": 40,
                        "title": "周转确认订货",
                        "isTime": true,
                        "children": [],
                        "lastNode": "node_oclu9d9ejm1",
                        "description": "",
                        "componentName": "ApprovalNode",
                        "lastTimingNodes": ["node_oclu9d9ejm1"]
                    }],
                    "description": "是否需要订货等于是",
                    "componentName": "ConditionNode"
                }, {
                    "id": "node_ocltpgxaqr4",
                    "time": 0,
                    "title": "其他情况",
                    "children": [],
                    "lastNode": "node_ocltpgxaqr3",
                    "description": "",
                    "componentName": "ConditionNode"
                }],
                "lastNode": "node_ocltpgxaqr1",
                "description": "",
                "componentName": "ConditionContainer"
            }, {
                "id": "node_oclv68pdw91",
                "time": 2,
                "title": "运营确认是否拍照",
                "isTime": true,
                "children": [],
                "lastNode": "node_ocltpgxaqr2",
                "description": "",
                "componentName": "OperatorNode",
                "lastTimingNodes": ["node_ocltpj0jxr1", "node_ocltpgxaqr4"]
            }, {
                "id": "node_oclm91ca7l1", "time": 0, "title": "条件分支", "children": [{
                    "id": "node_oclm91ca7l2",
                    "time": 0,
                    "title": "条件1 (是否拍照等于是)",
                    "children": [{
                        "id": "node_ocln14cs9r2",
                        "time": 42,
                        "title": "样品与道具准备",
                        "isTime": true,
                        "children": [],
                        "description": "",
                        "componentName": "OperatorNode",
                        "lastTimingNodes": ["node_oclv68pdw91"]
                    }, {
                        "id": "node_oclofn02iu1",
                        "time": 8,
                        "title": "审核视觉方案",
                        "isTime": true,
                        "children": [],
                        "lastNode": "node_ocln14cs9r2",
                        "description": "",
                        "componentName": "ApprovalNode",
                        "lastTimingNodes": ["node_ocln14cs9r2"]
                    }, {
                        "id": "node_oclm91ca7l4",
                        "time": 16,
                        "title": "确认样品道具",
                        "isTime": true,
                        "children": [],
                        "lastNode": "node_oclofn02iu1",
                        "description": "",
                        "componentName": "OperatorNode",
                        "lastTimingNodes": ["node_oclofn02iu1"]
                    }, {
                        "id": "node_oclm91ca7l5",
                        "time": 16,
                        "title": "摄影完成",
                        "isTime": true,
                        "children": [],
                        "lastNode": "node_oclm91ca7l4",
                        "description": "",
                        "componentName": "OperatorNode",
                        "lastTimingNodes": ["node_oclm91ca7l4"]
                    }, {
                        "id": "node_oclm91ca7l6",
                        "time": 2,
                        "title": "确认摄影拍摄数量和分配美编制作",
                        "isTime": true,
                        "children": [],
                        "lastNode": "node_oclm91ca7l5",
                        "description": "",
                        "componentName": "ApprovalNode",
                        "lastTimingNodes": ["node_oclm91ca7l5"]
                    }, {
                        "id": "node_oclvxczr491",
                        "time": 0,
                        "title": "条件分支",
                        "children": [{
                            "id": "node_oclvxczr492",
                            "time": 0,
                            "title": "条件1 (美编负责人等于李徐莹)",
                            "children": [{
                                "id": "node_oclm91ca7l8",
                                "time": 16,
                                "title": "重点精修美编完成任务",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": ["node_oclm91ca7l6"]
                            }, {
                                "id": "node_oclrkczkhk1",
                                "time": 8,
                                "title": "简单美编完成任务",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclm91ca7l8",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": ["node_oclm91ca7l8"]
                            }],
                            "description": "美编负责人等于李徐莹",
                            "componentName": "ConditionNode"
                        }, {
                            "id": "node_oclvxczr494",
                            "time": 0,
                            "title": "条件2 (美编负责人等于丁芳)",
                            "children": [{
                                "id": "node_oclvxczr495",
                                "time": 16,
                                "title": "重点精修美编完成任务",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": ["node_oclm91ca7l6"]
                            }, {
                                "id": "node_oclvxczr496",
                                "time": 16,
                                "title": "简单美编完成任务",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclvxczr495",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": ["node_oclvxczr495"]
                            }],
                            "lastNode": "node_oclvxczr492",
                            "description": "美编负责人等于丁芳",
                            "componentName": "ConditionNode"
                        }, {
                            "id": "node_oclvxczr497",
                            "time": 0,
                            "title": "条件3 (美编负责人等于张月坤)",
                            "children": [{
                                "id": "node_oclvxczr498",
                                "time": 16,
                                "title": "重点精修美编完成任务",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": ["node_oclm91ca7l6"]
                            }, {
                                "id": "node_oclvxczr499",
                                "time": 16,
                                "title": "简单美编完成任务",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclvxczr498",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": ["node_oclvxczr498"]
                            }],
                            "lastNode": "node_oclvxczr494",
                            "description": "美编负责人等于张月坤",
                            "componentName": "ConditionNode"
                        }, {
                            "id": "node_oclvxczr493",
                            "time": 0,
                            "title": "其他情况",
                            "children": [],
                            "lastNode": "node_oclvxczr497",
                            "description": "",
                            "componentName": "ConditionNode"
                        }],
                        "lastNode": "node_oclm91ca7l6",
                        "description": "",
                        "componentName": "ConditionContainer"
                    }],
                    "description": "是否拍照等于是",
                    "componentName": "ConditionNode"
                }, {
                    "id": "node_oclvxgf8mz1",
                    "time": 0,
                    "title": "条件1 (是否拍照等于是且拍摄需求等于外包拍摄)",
                    "children": [{
                        "id": "node_oclvxgf8mz3",
                        "time": 4,
                        "title": "审核视觉方案",
                        "isTime": true,
                        "children": [],
                        "description": "",
                        "componentName": "ApprovalNode",
                        "lastTimingNodes": ["node_oclv68pdw91"]
                    }, {
                        "id": "node_oclvxgf8mzi",
                        "time": 16,
                        "title": "执行人寄样品",
                        "isTime": true,
                        "children": [],
                        "lastNode": "node_oclvxgf8mz3",
                        "description": "",
                        "componentName": "OperatorNode",
                        "lastTimingNodes": ["node_oclvxgf8mz3"]
                    }, {
                        "id": "node_oclvxgf8mz5",
                        "time": 16,
                        "title": "确认摄影拍摄完成",
                        "isTime": true,
                        "children": [],
                        "lastNode": "node_oclvxgf8mzi",
                        "description": "",
                        "componentName": "OperatorNode",
                        "lastTimingNodes": ["node_oclvxgf8mzi"]
                    }, {
                        "id": "node_oclvxgf8mz6",
                        "time": 4,
                        "title": "分配美编作图",
                        "isTime": true,
                        "children": [],
                        "lastNode": "node_oclvxgf8mz5",
                        "description": "",
                        "componentName": "ApprovalNode",
                        "lastTimingNodes": ["node_oclvxgf8mz5"]
                    }, {
                        "id": "node_oclvxgf8mz7",
                        "time": 0,
                        "title": "",
                        "children": [{
                            "id": "node_oclvxgf8mz8",
                            "time": 0,
                            "title": "条件1 (美编负责人等于李徐莹)",
                            "children": [{
                                "id": "node_oclvxgf8mz9",
                                "time": 16,
                                "title": "重点精修美编完成任务",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": ["node_oclvxgf8mz6"]
                            }, {
                                "id": "node_oclvxgf8mza",
                                "time": 16,
                                "title": "简单美编完成任务",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclvxgf8mz9",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": ["node_oclvxgf8mz9"]
                            }],
                            "description": "美编负责人等于李徐莹",
                            "componentName": "ConditionNode"
                        }, {
                            "id": "node_oclvxgf8mzb",
                            "time": 0,
                            "title": "条件2 (美编负责人等于丁芳)",
                            "children": [{
                                "id": "node_oclvxgf8mzc",
                                "time": 16,
                                "title": "重点精修美编完成任务",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": ["node_oclvxgf8mz6"]
                            }, {
                                "id": "node_oclvxgf8mzd",
                                "time": 16,
                                "title": "简单美编完成任务",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclvxgf8mzc",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": ["node_oclvxgf8mzc"]
                            }],
                            "lastNode": "node_oclvxgf8mz8",
                            "description": "美编负责人等于丁芳",
                            "componentName": "ConditionNode"
                        }, {
                            "id": "node_oclvxgf8mze",
                            "time": 0,
                            "title": "条件3 (美编负责人等于张月坤)",
                            "children": [{
                                "id": "node_oclvxgf8mzf",
                                "time": 16,
                                "title": "重点精修美编完成任务",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": ["node_oclvxgf8mz6"]
                            }, {
                                "id": "node_oclvxgf8mzg",
                                "time": 16,
                                "title": "简单美编完成任务",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclvxgf8mzf",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": ["node_oclvxgf8mzf"]
                            }],
                            "lastNode": "node_oclvxgf8mzb",
                            "description": "美编负责人等于张月坤",
                            "componentName": "ConditionNode"
                        }, {
                            "id": "node_oclvxgf8mzh",
                            "time": 0,
                            "title": "其他情况",
                            "children": [],
                            "lastNode": "node_oclvxgf8mze",
                            "description": "",
                            "componentName": "ConditionNode"
                        }],
                        "lastNode": "node_oclvxgf8mz6",
                        "description": "",
                        "componentName": "ConditionContainer"
                    }],
                    "lastNode": "node_oclm91ca7l2",
                    "description": "是否拍照等于是且拍摄需求等于外包拍摄",
                    "componentName": "ConditionNode"
                }, {
                    "id": "node_oclm91ca7la",
                    "time": 0,
                    "title": "条件2 (是否拍照等于否)",
                    "children": [{
                        "id": "node_oclv68umqp1",
                        "time": 2,
                        "title": "确认美编任务",
                        "isTime": true,
                        "children": [],
                        "description": "",
                        "componentName": "OperatorNode",
                        "lastTimingNodes": ["node_oclv68pdw91"]
                    }, {
                        "id": "node_oclvxczr49a",
                        "time": 0,
                        "title": "条件分支",
                        "children": [{
                            "id": "node_oclvxczr49b",
                            "time": 0,
                            "title": "条件1 (美编负责人等于李徐莹)",
                            "children": [{
                                "id": "node_oclvxczr49d",
                                "time": 16,
                                "title": "重点精修美编完成任务",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": ["node_oclv68umqp1"]
                            }, {
                                "id": "node_oclvxczr49e",
                                "time": 16,
                                "title": "简单美编完成任务",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclvxczr49d",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": ["node_oclvxczr49d"]
                            }],
                            "description": "美编负责人等于李徐莹",
                            "componentName": "ConditionNode"
                        }, {
                            "id": "node_oclvxczr49f",
                            "time": 0,
                            "title": "条件2 (美编负责人等于丁芳)",
                            "children": [{
                                "id": "node_oclvxczr49g",
                                "time": 16,
                                "title": "重点精修美编完成任务",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": ["node_oclv68umqp1"]
                            }, {
                                "id": "node_oclvxczr49h",
                                "time": 16,
                                "title": "简单美编完成任务",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclvxczr49g",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": ["node_oclvxczr49g"]
                            }],
                            "lastNode": "node_oclvxczr49b",
                            "description": "美编负责人等于丁芳",
                            "componentName": "ConditionNode"
                        }, {
                            "id": "node_oclvxczr49i",
                            "time": 0,
                            "title": "条件3 (美编负责人等于张月坤)",
                            "children": [{
                                "id": "node_oclvxczr49j",
                                "time": 16,
                                "title": "重点精修美编完成任务",
                                "isTime": true,
                                "children": [],
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": ["node_oclv68umqp1"]
                            }, {
                                "id": "node_oclvxczr49k",
                                "time": 16,
                                "title": "简单美编完成任务",
                                "isTime": true,
                                "children": [],
                                "lastNode": "node_oclvxczr49j",
                                "description": "",
                                "componentName": "OperatorNode",
                                "lastTimingNodes": ["node_oclvxczr49j"]
                            }],
                            "lastNode": "node_oclvxczr49f",
                            "description": "美编负责人等于张月坤",
                            "componentName": "ConditionNode"
                        }, {
                            "id": "node_oclvxczr49c",
                            "time": 0,
                            "title": "其他情况",
                            "children": [],
                            "lastNode": "node_oclvxczr49i",
                            "description": "",
                            "componentName": "ConditionNode"
                        }],
                        "lastNode": "node_oclv68umqp1",
                        "description": "",
                        "componentName": "ConditionContainer"
                    }],
                    "lastNode": "node_oclvxgf8mz1",
                    "description": "是否拍照等于否",
                    "componentName": "ConditionNode"
                }, {
                    "id": "node_oclm91ca7l3",
                    "time": 0,
                    "title": "其他情况",
                    "children": [],
                    "lastNode": "node_oclm91ca7la",
                    "description": "",
                    "componentName": "ConditionNode"
                }], "lastNode": "node_oclv68pdw91", "description": "", "componentName": "ConditionContainer"
            }, {
                "id": "node_oclm91ca7l9",
                "time": 4,
                "title": "审核美编任务",
                "isTime": true,
                "children": [],
                "lastNode": "node_oclm91ca7l1",
                "description": "",
                "componentName": "ApprovalNode",
                "lastTimingNodes": ["node_oclm91ca7l6", "node_oclvxgf8mz6", "node_oclv68umqp1", "node_oclm91ca7l3"]
            }, {
                "id": "node_oclm91ca7le",
                "time": 4,
                "title": "审核视觉完成",
                "isTime": true,
                "children": [],
                "lastNode": "node_oclm91ca7l9",
                "description": "",
                "componentName": "OperatorNode",
                "lastTimingNodes": ["node_oclm91ca7l9"]
            }, {
                "id": "node_oclm91ca7lf",
                "time": 8,
                "title": "执行完成上架",
                "isTime": true,
                "children": [],
                "lastNode": "node_oclm91ca7le",
                "description": "",
                "componentName": "OperatorNode",
                "lastTimingNodes": ["node_oclm91ca7le"]
            }, {
                "id": "node_ockpz6phx73",
                "time": 2,
                "title": "审批人",
                "isTime": true,
                "children": [],
                "lastNode": "node_oclm91ca7lf",
                "description": "",
                "componentName": "ApprovalNode",
                "lastTimingNodes": ["node_oclm91ca7lf"]
            }, {
                "id": "node_ockpz6phx78",
                "time": 0,
                "title": "结束",
                "children": [],
                "lastNode": "node_ockpz6phx73",
                "description": "",
                "componentName": "EndNode"
            }]
        const result = flowFormReviewUtil.getFormExecutePaths(xuanPinHuiForm)
        // assert.equal(result[0].children.length, 22)
        // assert.equal(result[1].children.length, 22)
        // assert.equal(result[2].children.length, 21)
        // assert.equal(result[3].children.length, 16)
        // assert.equal(result[4].children.length, 16)
        // assert.equal(result[5].children.length, 14)
        // assert.equal(result[6].children.length, 14)
        // assert.equal(result[7].children.length, 14)
        // assert.equal(result[8].children.length, 14)
        // assert.equal(result[9].children.length, 14)
        // assert.equal(result[10].children.length, 14)
        // assert.equal(result[11].children.length, 11)
        const result1 = flowFormReviewUtil.getFormExecutePaths(xuanPinHuiForm1)
        // assert.equal(result1[0].children.length, 18)
        // assert.equal(result1[1].children.length, 20)
        // assert.equal(result1[2].children.length, 20)
        // assert.equal(result1[3].children.length, 19)
        // assert.equal(result1[4].children.length, 16)
        // assert.equal(result1[5].children.length, 14)
        // assert.equal(result1[6].children.length, 14)
        // assert.equal(result1[7].children.length, 14)
        // assert.equal(result1[8].children.length, 14)
        // assert.equal(result1[9].children.length, 14)
        // assert.equal(result1[10].children.length, 14)
        // assert.equal(result1[11].children.length, 11)
        const result2 = flowFormReviewUtil.getFormExecutePaths(tmForm)
        console.log(result)
    })
})