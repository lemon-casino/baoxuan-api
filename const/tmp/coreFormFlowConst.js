/**
 * 正常一个节点仅有一个id
 * 对于条件分支同一个名称的节点会存在多个id的情况
 *
 * @type {[{formId: string, formName: string, actions: [{nodeIds: string[], name: string},{nodeIds: string[], name: string},{nodeIds: string[], name: string},{nodeIds: string[], name: string},{nodeIds: string[], name: string},null,null,null]},{formId: string, formName: string, actions: [{nodeIds: string[], name: string},{nodeIds: string[], name: string},{nodeIds: string[], name: string},{nodeIds: string[], name: string}]},{formId: string, formName: string, actions: [{nodeIds: string[], name: string},{nodeIds: string[], name: string},{nodeIds: string[], name: string},{nodeIds: string[], name: string},{nodeIds: string[], name: string},null]},{formId: string, formName: string, actions: [{nodeIds: string[], name: string},{nodeIds: string[], name: string},{nodeIds: string[], name: string},{nodeIds: string[], name: string},{nodeIds: string[], name: string},null]},{formId: string, formName: string, actions: [{nodeIds: string[], name: string},{nodeIds: string[], name: string},{nodeIds: string[], name: string},{nodeIds: string[], name: string},{nodeIds: string[], name: string},null,null,null]},null,null]}
 */
const tmCoreFormFlowsConfig = [
    {
        formName: "采购选品会",
        formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
        actions: [
            {
                name: "审核产品",
                nodeIds: [
                    "node_oclv1t0i396",
                    "node_oclv1t0i398",
                    "node_oclv1t0i39a",
                    "node_oclv24zen52",
                    "node_oclv24zen56",
                    "node_oclv2a2mj42",
                    "node_oclv2a2mj45",
                    "node_oclv2a2mj48",
                    "node_oclv2a2mj4b"
                ]
            },
            {
                name: "分配运营分析",
                nodeIds: [
                    "node_oclv1t0i397",
                    "node_oclv1t0i399",
                    "node_oclv1t0i39b"
                ]
            },
            {
                name: "运营负责人提交市场统计模板",
                nodeIds: [
                    "node_oclklxv8kk1",
                    "node_oclv1ugwu31",
                    "node_oclv1ugwu32",
                    "node_oclv24zen54",
                    "node_oclv24zen58",
                    "node_oclv2a2mj43",
                    "node_oclv2a2mj46",
                    "node_oclv2a2mj49",
                    "node_oclv2a2mj4c"
                ]
            },
            {
                name: "运营提交市场分析方案",
                nodeIds: ["node_ocliieab3b1"]
            },
            {
                name: "组长审核方案",
                nodeIds: [
                    "node_oclv2a2mj4h",
                    "node_oclv2a2mj4k"
                ]
            },
            {
                name: "项目负责人审核方案",
                nodeIds: [
                    "node_oclv2a2mj4i",
                    "node_oclv2a2mj4l",
                    "node_oclv2a2mj4m"
                ]
            },
            {
                name: "运营确认样品预估销量",
                nodeIds: [
                    "node_ocliid9xm73"
                ]
            },
            {
                name: "审核订货量",
                nodeIds: [
                    "node_oclm60vm9a1",
                    "node_oclv2ayeqti",
                    "node_oclv2ayeqtj"
                ]
            }
        ]
    },
    {
        formName: "运营优化方案",
        formId: "FORM-CP766081CPAB676X6KT35742KAC229LLKHIILB",
        actions: [
            {
                name: "制定优化方案",
                nodeIds: ["node_oclu3u9gmm1"]
            },
            {
                name: "组长审核方案",
                nodeIds: [
                    "node_oclto07a599",
                    "node_oclto07a59b",
                    "node_oclv7ila163",
                    "node_ocltnzlp8s7",
                    "node_oclto07a593",
                    "node_oclv7ipmzf2"
                ]
            },
            {
                name: "项目负责人审核方案",
                nodeIds: [
                    "node_oclv7ila164",
                    "node_oclto07a594"
                ]
            },
            {
                name: "优化动作完成确认",
                nodeIds: [
                    "node_oclnpduv0g6",
                    "node_ocljzcy54s1"
                ]
            }
        ]
    },
    {
        formName: "天猫链接打仗审核流程",
        formId: "FORM-495A1584CBE84928BB3B1E0D4AA4B56AYN1J",
        actions: [
            {
                name: "审核链接状态",
                nodeIds: [
                    "node_oclqhp9c101"
                ]
            },
            {
                name: "提交优化方案",
                nodeIds: [
                    "node_oclqhp9c103"
                ]
            },
            {
                name: "审核优化方案",
                nodeIds: [
                    "node_oclqhp9c104"
                ]
            },
            {
                name: "确认优化完成",
                nodeIds: [
                    "node_oclqhp9c105"
                ]
            },
            {
                name: "运营确认数据恢复",
                nodeIds: [
                    "node_ocltqyzlu32"
                ]
            },
            {
                name: "审核优化效果",
                nodeIds: [
                    "node_ockpz6phx73"
                ]
            }
        ]
    },
    {
        formName: "天猫链接上架流程",
        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
        actions: [
            {
                name: "审核执行动作完成",
                nodeIds: [
                    "node_oclm91902f2"
                ]
            },
            {
                name: "提交五维表方案",
                nodeIds: [
                    "node_oclo8dzm951"
                ]
            },
            {
                name: "组长审核方案",
                nodeIds: [
                    "node_oclto7ocj77",
                    "node_oclto7ocj75",
                    "node_oclvhw76j22"
                ]
            },
            {
                name: "项目负责人审核方案",
                nodeIds: [
                    "node_oclto7ocj78",
                    "node_oclto7ocj76",
                    "node_oclvhw76j23",
                    "node_oclm91902f3"
                ]
            },
            {
                name: "提交订货明细",
                nodeIds: [
                    "node_ocltpgxaqr5"
                ]
            },
            {
                name: "审核视觉完成",
                nodeIds: [
                    "node_oclm91ca7le"
                ]
            }
        ]
    },
    {
        formName: "运营新品流程",
        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
        actions: [
            {
                name: "提交竞店ID",
                nodeIds: [
                    "node_oclkvznwuu1"
                ]
            },
            {
                name: "审核执行统计五维表",
                nodeIds: [
                    "node_oclix34wly1"
                ]
            },
            {
                name: "五维表分析",
                nodeIds: [
                    "node_oclii6vcap1"
                ]
            },
            {
                name: "组长审核方案",
                nodeIds: [
                    "node_oclto83mms7",
                    "node_oclto83mms5",
                    "node_oclvx64tg92"
                ]
            },
            {
                name: "项目负责人审核方案",
                nodeIds: [
                    "node_oclii6vcap2"
                ]
            },
            {
                name: "运营提供样品明细",
                nodeIds: [
                    "node_oclmbqrsr56"
                ]
            },
            {
                name: "视觉完成确认审核",
                nodeIds: [
                    "node_ockpz6phx73"
                ]
            },
            {
                name: "审核上架完成",
                nodeIds: [
                    "node_oclii7t3xt6"
                ]
            },
        ]
    },
    {
        formName: "宝可梦新品开发流程",
        formId: "FORM-CC0B476071F24581B129A24835910B81AK56",
        actions: [
            {
                name: "审核产品是否做",
                nodeIds: [
                    "node_oclv1wec4t1",
                    "node_oclv1wec4t2",
                    "node_oclv1wec4t3",
                    "node_oclv1wec4t4"
                ]
            },
            {
                name: "运营提交客群分析",
                nodeIds: [
                    "node_ocluts9plxb",
                    "node_oclv1wec4te",
                    "node_oclv212smo8"
                ]
            },
            {
                name: "分配运营做市场方案",
                nodeIds: [
                    "node_oclv1xgp7v8",
                    "node_oclv1zji4a1",
                    "node_oclv1zji4a7"
                ]
            },
            {
                name: "分配执行市场分析方案",
                nodeIds: ["node_oclv1xr53i4"]
            },
            {
                name: "审核执行市场分析方案",
                nodeIds: ["node_oclvkc9r0a3"]
            },
            {
                name: "完成市场分析方案",
                nodeIds: [
                    "node_oclvkc9r0a4"
                ]
            },
            {
                name: "审核运营市场分析方案",
                nodeIds: [
                    "node_oclv22kx374",
                    "node_oclv22kx375"
                ]
            },
            {
                name: "分配运营做营销方案",
                nodeIds: [
                    "node_oclv1zonogy",
                    "node_oclv1zonogz",
                    "node_oclv1zonog10"
                ]
            },
            {
                name: "分配执行营销分析方案",
                nodeIds: [
                    "node_oclvkcjxy41"
                ]
            },
            {
                name: "运营提交营销方案",
                nodeIds: [
                    "node_oclv1zonogt",
                    "node_oclv1zonogv",
                    "node_oclv1zonogw"
                ]
            },
            {
                name: "审核营销方案",
                nodeIds: [
                    "node_oclv27pdv11",
                    "node_oclv27pdv12",
                    "node_oclv27pdv13"
                ]
            }
        ]
    },
    {
        formName: "开发新品设计流程",
        formId: "FORM-2529762FC54F44849153E5564C1628FAHFKN",
        actions: [
            {
                name: "审核产品是否做",
                nodeIds: [
                    "node_oclv1wec4t1",
                    "node_oclv1wec4t2",
                    "node_oclv1wec4t3",
                    "node_oclv1wec4t4"
                ]
            },
            {
                name: "运营提交客群分析",
                nodeIds: [
                    "node_oclv212smo8",
                    "node_oclv1wec4te",
                    "node_ocluts9plxb"
                ]
            },
            {
                name: "分配运营做市场方案",
                nodeIds: [
                    "node_oclv1xgp7v8",
                    "node_oclv1zji4a1",
                    "node_oclv1zji4a7",
                    "node_oclv28u6jsj",
                    "node_oclv28u6jsp",
                    "node_oclv28u6jsy"
                ]
            },
            {
                name: "分配执行做市场分析",
                nodeIds: [
                    "node_oclvkcrnz61"
                ]
            },
            {
                name: "运营提交市场分析方案",
                nodeIds: [
                    "node_oclv1xr53i4",
                    "node_oclv1zji4a5",
                    "node_oclv1zji4ab",
                    "node_oclv1zonog9",
                    "node_oclv28u6jsn",
                    "node_oclv28u6jsw",
                    "node_oclv28u6js12",
                    "node_oclv28u6js13"
                ]
            },
            {
                name: "审核运营市场分析方案",
                nodeIds: [
                    "node_oclv22kx374",
                    "node_oclv22kx375",
                    "node_oclv28u6jso",
                    "node_oclv28u6jsx",
                    "node_oclv22kx376"
                ]
            },
            {
                name: "分配运营做营销方案",
                nodeIds: [
                    "node_oclv1zonogy",
                    "node_oclv1zonogz",
                    "node_oclv1zonog10",
                    "node_oclv28u6js1b",
                    "node_oclv28u6js1e",
                    "node_oclv28u6js1h"
                ]
            },
            {
                name: "分配执行做营销分析",
                nodeIds: [
                    "node_oclvkcrnz63"
                ]
            },
            {
                name: "运营提交营销方案",
                nodeIds: [
                    "node_oclv1zonogt",
                    "node_oclv1zonogv",
                    "node_oclv1zonogw",
                    "node_oclv28u6js1c",
                    "node_oclv28u6js1f",
                    "node_oclv28u6js1i"
                ]
            },
            {
                name: "审核营销方案",
                nodeIds: [
                    "node_oclv28u6js1j",
                    "node_oclv28u6js1g",
                    "node_oclv28u6js1d",
                    "node_oclv27pdv13",
                    "node_oclv27pdv12",
                    "node_oclv27pdv11"
                ]
            }
        ]
    }
]

const mbCoreFormFlowConfig = [
    {
        formName: "美编任务运营发布",
        formId: "FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS",
        actions: [
            {
                name: "确认美编任务",
                nodeIds: [
                    "node_oclvgenwmp6"
                ],
                types: ["todo", "forcast", "history"]
            },
            {
                name: "重点精修美编完成任务",
                nodeIds: [
                    "node_oclvgh4l0z8",
                    "node_oclvgh4l0z5",
                    "node_oclvgh4l0z2"
                ]
            },
            {
                name: "精修美编完成任务",
                nodeIds: [
                    "node_oclvgenwmp4",
                    "node_oclvgffo392",
                    "node_oclvgffo395",
                    "node_oclvt49cil2",
                    "node_oclvgh4l0zb",
                    "node_oclvt4kpea1",
                ]
            },
            {
                name: "简单美编完成任务",
                nodeIds: [
                    "node_oclvgenwmp5",
                    "node_oclvgffo393",
                    "node_oclvgffo396",
                    "node_oclvt49cil3",
                    "node_oclvgh4l0zf"
                ]
            },
            {
                name: "视频剪辑完成任务",
                nodeIds: [
                    "node_oclvgh4l0zd",
                    "node_oclvvytk8v2"
                ]
            },
            {
                name: "审核美编任务",
                nodeIds: [
                    "node_oclvghx5li5",
                    "node_oclvghx5li4",
                    "node_oclvghx5li1",
                    "node_oclvt49cil4",
                    "node_oclvghx5li2",
                    "node_oclvghx5li6",
                    "node_oclvghx5li7",
                    "node_oclvghx5li8",
                    "node_oclvt4kpea2",
                    "node_oclvghx5li9",
                    "node_oclvvytk8v3",
                    "node_oclvghx5lia"
                ]
            }
        ]
    },
    {
        formName: "运营拍摄流程",
        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
        actions: [
            {
                name: "审批视觉方案",
                nodeIds: [
                    "node_ocllqa26nn1"
                ]
            },
            {
                name: "摄影确认道具",
                nodeIds: []
            },
            {
                name: "拍摄完成",
                nodeIds: [
                    "node_ocliimu2ur1"
                ]
            },
            {
                name: "分配美编制作",
                nodeIds: [
                    "node_oclrj9wzny1"
                ]
            },
            {
                name: "重点精修美编完成任务",
                nodeIds: [
                    "node_oclrj9wzny7",
                    "node_oclvkqswtb2",
                    "node_oclvkq3wa11",
                    "node_oclvkqswtb6",
                    "node_oclrj9wznyh",
                    "node_oclvkqswtba"
                ]
            },
            {
                name: "简单美编完成任务",
                nodeIds: [
                    "node_oclrj9wzny6",
                    "node_oclvkqswtb3",
                    "node_oclvkq3wa12",
                    "node_oclvkqswtb7",
                    "node_oclrj9wznyi",
                    "node_oclvkqswtbb"
                ]
            },
            {
                name: "视频剪辑完成",
                nodeIds: [
                    "node_oclrj9wznym"
                ]
            },
            {
                name: "审核美编工作",
                nodeIds: [
                    "node_oclvkpzz4g1",
                    "node_oclvkqswtb4",
                    "node_oclvkq3wa13",
                    "node_oclvkqswtb8",
                    "node_oclvkpzz4g3",
                    "node_oclvkqswtbc",
                    "node_oclvkpzz4g4"
                ]
            }
        ]
    },
    {
        formName: "运营新品流程",
        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
        actions: [
            {
                name: "视觉方案审核",
                nodeIds: [
                    "node_oclii6vcap3"
                ]
            },
            {
                name: "摄影确认样品与道具",
                nodeIds: [
                    "node_oclii6vcap6"
                ]
            },
            {
                name: "摄影拍照",
                nodeIds: [
                    "node_oclii6vcap7"
                ]
            },
            {
                name: "分配美编",
                nodeIds: [
                    "node_oclii6vcap8"
                ]
            },
            {
                name: "重点精修美编完成任务",
                nodeIds: [
                    "node_oclvksud0d5",
                    "node_oclvksud0d8",
                    "node_oclvksud0db",
                    "node_oclii89ejz1"
                ]
            },
            {
                name: "简单美编完成任务",
                nodeIds: [
                    "node_oclvksud0d6",
                    "node_oclvksud0d9",
                    "node_oclvksud0dc",
                    "node_oclrkbghp22",
                    "node_oclrkbghp23"
                ]
            },
            {
                name: "视觉完成确认审核",
                nodeIds: [
                    "node_ockpz6phx73"
                ]
            }
        ]
    },
    {
        formName: "天猫链接上架流程",
        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
        actions: [
            {
                name: "审核视觉方案",
                nodeIds: [
                    "node_oclofn02iu1"
                ]
            },
            {
                name: "确认样品道具",
                nodeIds: [
                    "node_oclm91ca7l4"
                ]
            },
            {
                // 摄影完成
                name: "摄影拍照",
                nodeIds: [
                    "node_oclm91ca7l5"
                ]
            },
            {
                // 确认美编任务
                name: "分配美编",
                nodeIds: [
                    "node_oclv68umqp1",
                    "node_oclm91ca7l6"
                ]
            },
            {
                name: "精修美编完成任务",
                nodeIds: [
                    "node_oclm91ca7l8",
                    "node_oclrkczkhk3"
                ]
            },
            {
                name: "普通美编完成任务",
                nodeIds: [
                    "node_oclrkczkhk4",
                    "node_oclrkczkhk1",
                    "node_oclrkczkhk2",
                    "node_oclrkczkhk5"
                ]
            },
            {
                name: "审核视觉完成",
                nodeIds: [
                    "node_oclm91ca7le"
                ]
            }
        ]
    },
]

const executionGroupCoreFormFlowConfig = [
    {
        formName: "运营执行流程",
        formId: "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU",
        actions: [
            {
                name: "分配执行发布",
                nodeIds: [
                    "node_ocltzh0nbm7"
                ]
            },
            {
                name: "分配执行人",
                nodeIds: [
                    "node_ocltzh0nbm9"
                ]
            },
            {
                name: "发布完成",
                nodeIds: [
                    "node_ocltzh0nbm8"
                ]
            },
            {
                name: "执行完成任务",
                nodeIds: [
                    "node_ocltzh0nbma"
                ]
            }
        ]
    },
    {
        formName: "运营新品流程",
        formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
        actions: [
            {
                name: "分配执行",
                nodeIds: [
                    "node_oclohx0w4s1"
                ]
            },
            {
                name: "统计五维表",
                nodeIds: [
                    "node_oclix0goa91"
                ]
            },
            {
                name: "执行运营填写样品登记表",
                nodeIds: [
                    "node_ocltsdtj1u5"
                ]
            },
            {
                name: "执行运营确认样品到公司",
                nodeIds: [
                    "node_ocltseng6r1"
                ]
            },
            {
                name: "样品与道具确认",
                nodeIds: [
                    "node_oclii6vcap5"
                ]
            },
            {
                name: "执行寄样品",
                nodeIds: [
                    "node_oclvxhoetg7"
                ]
            },
            {
                name: "确认摄影拍摄完成",
                nodeIds: [
                    "node_oclvxhoetg8"
                ]
            },
            {
                name: "执行人",
                nodeIds: [
                    "node_oclvxhoetg5"
                ]
            },
            {
                name: "上传产品使用视频与客服样品交接",
                nodeIds: [
                    "node_oclii7t3xt1"
                ]
            },
            {
                name: "链接上架及BI数据维护",
                nodeIds: [
                    "node_oclii7t3xt4"
                ]
            }
        ]
    },
    {
        formName: "采购断货流程",
        formId: "FORM-F8666NB1JO8BPCAW7KNFD7TMJWMJ29APAQIILQ",
        actions: [
            {
                name: "运营上架",
                nodeIds: [
                    "node_oclijksmlzd"
                ]
            },
            {
                name: "运营解除预售",
                nodeIds: [
                    "node_oclijksmlzo"
                ]
            },
            {
                name: "运营确认",
                nodeIds: [
                    "node_oclijksmlza",
                    "node_oclijksmlzg",
                    "node_oclijksmlzk",
                    "node_oclijksmlzq"
                ]
            }
        ]
    },
    {
        formName: "运营预售商品流程",
        formId: "FORM-K9766DA1ZVDB1L0W7VM0H97S44ZR2JOJEOJILJ",
        actions: [
            {
                name: "运营解除预售/确认延长预售",
                nodeIds: [
                    "node_oclijrkauv4"
                ]
            }
        ]
    },
    {
        formName: "运营产品专利投诉解决流程",
        formId: "FORM-4IA668916HKCDJ2O9KPRFBWT069H3F08AJ6KL6",
        actions: [
            {
                name: "审核流程结果",
                nodeIds: [
                    "node_oclklz3mer1"
                ]
            }
        ]
    },
    {
        formName: "采购选品会",
        formId: "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP",
        actions: [
            {
                name: "开发交接确认样品",
                nodeIds: [
                    "node_oclv2c2ehf1"
                ]
            },
            {
                name: "执行提交市场分析表",
                nodeIds: [
                    "node_oclix0mfzn1"
                ]
            },
            {
                name: "统计预估销量与样品需求",
                nodeIds: [
                    "node_oclv2ayeqt1"
                ]
            }
        ]
    },
    {
        formName: "运营拍摄流程",
        formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
        actions: [
            {
                name: "分配执行助理",
                nodeIds: [
                    "node_oclrolj7io1"
                ]
            },
            {
                name: "执行准备道具",
                nodeIds: [
                    "node_oclrolllmq1"
                ]
            }
        ]
    },
    {
        formName: "天猫链接上架流程",
        formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
        actions: [

            {
                name: "执行统计五维表",
                nodeIds: [
                    "node_oclm91902f1"
                ]
            },
            {
                name: "执行人",
                nodeIds: [
                    "node_oclv6afgcd1"
                ]
            },
            {
                name: "样品与道具准备",
                nodeIds: [
                    "node_ocln14cs9r2"
                ]
            },
            {
                name: "执行人寄样品",
                nodeIds: [
                    "node_oclvxgf8mzi"
                ]
            },
            {
                name: "确认摄影拍摄完成",
                nodeIds: [
                    "node_oclvxgf8mz5"
                ]
            },
            {
                name: "执行完成上架",
                nodeIds: [
                    "node_oclm91ca7lf"
                ]
            }
        ]
    },
    {
        formName: "工商投诉流程",
        formId: "FORM-NO766591R66FKG1EF0UXN7HANWWA3PI8YM2OLM",
        actions: [
            {
                name: "执行确认资料",
                nodeIds: [
                    "node_oclssdsafx1",
                    "node_oclssdsafx2",
                    "node_oclssdsafx3"
                ]
            },
            {
                name: "运营调整截图",
                nodeIds: [
                    "node_oclo2o8xnr8"
                ]
            }
        ]
    },
    {
        formName: "外包视觉制作流程",
        formId: "FORM-30500E23B9C44712A5EBBC5622D3D1C4TL18",
        actions: [
            {
                name: "分配外包摄影拍摄",
                nodeIds: [
                    "node_oclvulwdg91"
                ]
            },
            {
                name: "分配外包美编制作",
                nodeIds: [
                    "node_oclvsua8gb1",
                    "node_oclvulwdg92"
                ]
            },
            {
                name: "分配执行寄样品",
                nodeIds: [
                    "node_oclvum5btl2"
                ]
            },
            {
                name: "确认任务数量",
                nodeIds: [
                    "node_oclv672mq11",
                    "node_oclv679al65"
                ]
            },
            {
                name: "发出样品填写快递单号",
                nodeIds: [
                    "node_oclv67im1r1"
                ]
            },
            {
                name: "快递已发出",
                nodeIds: [
                    "node_oclvx4muig1"
                ]
            },
            {
                name: "统计作图数量",
                nodeIds: [
                    "node_oclvsua8gb2"
                ]
            }
        ]
    },
    {
        formName: "宝可梦新品开发流程",
        formId: "FORM-CC0B476071F24581B129A24835910B81AK56",
        actions: [
            {
                name: "执行提交市场统计",
                nodeIds: [
                    "node_oclvkcjxy42",
                    "node_oclvkc9r0a2"
                ]
            }
        ]
    },
    {
        formName: "天猫链接打仗审核流程",
        formId: "FORM-495A1584CBE84928BB3B1E0D4AA4B56AYN1J",
        actions: [
            {
                name: "执行BI系统打标签",
                nodeIds: [
                    "node_oclqhp9c102"
                ]
            },
            {
                name: "统计优化后数据结果",
                nodeIds: [
                    "node_oclqhp9c106"
                ]
            }
        ]
    },
    {
        formName: "采购任务运营发布",
        formId: "FORM-0A966I819O8BZMVBE16JLAK96KK42KD1QEIILC",
        actions: [
            {
                name: "分配执行统计市场",
                nodeIds: [
                    "node_oclvt63juf2"
                ]
            },
            {
                name: "执行提交市场统计",
                nodeIds: [
                    "node_oclvt63juf3"
                ]
            },
            {
                name: "分配执行统计五维",
                nodeIds: [
                    "node_oclvt7r3d85",
                    "node_oclvugt7k57"
                ]
            },
            {
                name: "执行提交五维表",
                nodeIds: [
                    "node_oclvt7r3d87",
                    "node_oclvugt7k58"
                ]
            }
        ]
    }
]

module.exports = {
    "903075138": tmCoreFormFlowsConfig,
    "482162119": mbCoreFormFlowConfig,
    "902515853": executionGroupCoreFormFlowConfig
}