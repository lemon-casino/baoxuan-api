const action = {
    next: {
        key: 'next',
        value: '待转入',
        type: 0,
    },
    doing: {
        key: 'doing',
        value: '进行中',
        type: 1,
    },
    agree: {
        key: 'agree',
        value: '已完成',
        type: 2
    }
}

const actionItem = {
    actionName: '',
    children: [{
        actionName: '逾期',
        children: [],
        sum: 0
    },{
        actionName: '未逾期',
        children: [],
        sum: 0
    }],
    sum: 0
}

const actionItem2 = {
    actionName: '工作量',
    children: [{
        actionName: '进行中',
        children: [],
        sum: 0,
        score: 0,
        sumAlone: true,
        tooltip: '该工作量会统计表单中预计的数据',
        uniqueIds: true
    },{
        actionName: '已完成',
        children: [],
        sum: 0,
        score: 0,
        sumAlone: true,
        uniqueIds: true
    }],
    sum: 0,
    score: 0
}
const item = {
    actionCode: 'userActStat',
    actionName: '',
    children: [],
    sum: 0
}

const actionFilter = {
    '待转入': ['next'],
    '进行中': ['doing'],
    '已完成': ['agree'],
    '工作量': ['next', 'doing', 'agree'],
    '待拍摄影': ['next'],
    '摄影进行中': ['doing'],
    '摄影完成': ['agree'],
    '待入美编': ['next'],
    '美编进行中': ['doing'],
    '美编已完成': ['agree'],
}

const fullActionFilter = {
    '待转入': 0,
    '进行中': 1,
    '已完成': 2,
}

const statItem = {
    actionName: '',
    actionCode: '',
    children: [],
    ids: [],
    sum: 0,
    score: 0
}

const statItem1 = [
    {
        name: '流程汇总(不包含修图流程)',
        code: 'total'
    }, {
        name: '流程汇总(外包)',
        code: 'out'
    }, {
        name: '流程汇总(内部)',
        code: 'inside'
    }, {
        name: '修图流程',
        code: 'retouch'
    }
]

const retouchList = [
    {
        name: '自主',
        code: 'inside',
        child: ['insidePhoto', 'insideArt']
    }, {
        name: '外包',
        code: 'out',
        child: ['outPhoto', 'outArt']
    }
]

const statItem1Type = [
    ['outPhoto', 'outArt'],
    ['insidePhoto', 'insideArt']
]

const statItem2 = [
    {
        name: '全套'
    }, {
        name: '半套'
    }, {
        name: '散图'
    }, {
        name: '视频'
    }, {
        name: '半原创',
    }, {
        name: '原创-店铺首页',
    }, {
        name: '原创-创意图',
    }, {
        name: '原创-全套',
    }, {
        name: '基础修改',
    }, {
        name: '视频剪辑',
    }, {
        name: '换文字/换产品/调色/换背景/ 新增小元素/套图（单位：张）',
    }, {
        name: '整套规范存图（单位：套）',
    }, {
        name: '主图打标/logo修改（单位：张）',
    }, {
        name: '摄影'
    }
]

const statItem2Type = {
    1: [0],
    2: [1],
    3: [2],
    4: [3],
    5: [0, 3],
    6: [4],
    7: [5],
    8: [6],
    9: [7],
    10: [8], 
    11: [9],
    12: [10],
    13: [11],
    14: [12],
    15: [13]
}

const statItem3 = [
    {
        name: '待转入',
        code: 'TODO'
    }, {
        name: '进行中',
        code: 'DOING'
    }, {
        name: '已完成',
        code: 'DONE'
    }
]

const statItem3Type = {
    next: 0,
    doing: 1,
    agree: 2
}

const statItem4 = [
    {
        name: '逾期',
        code: 'overdue'
    }, {
        name: '未逾期',
        code: 'notOverdue'
    }
]

const statItem5 = [
    {
        name: '摄影'
    }, {
        name: '美编'
    }, {
        name: '外包'
    }
]

const statItem5Type = {
    insidePhoto: 0,
    insideArt: 1,
    outPhoto: 2,
    outArt: 2
}

const totalName = '工作量汇总'
const totalCode = 'sumActStat'

const totalStat = [
    {
        name: '待拍摄影'
    }, {
        name: '摄影进行中'
    }, {
        name: '摄影完成'
    }, {
        name: '待入美编'
    }, {
        name: '美编进行中'
    }, {
        name: '美编已完成'
    }
]

const totalStatType = {
    insidePhoto: {
        next: 0,
        doing: 1,
        agree: 2
    },
    insideArt: {
        next: 3,
        doing: 4,
        agree: 5
    }
}

const totalStat1 = [
    {
        name: '待拍摄影'
    }, {
        name: '摄影进行中'
    }, {
        name: '摄影完成'
    }, {
        name: '待入美编'
    }, {
        name: '美编进行中'
    }, {
        name: '美编已完成'
    }, {
        name: '工作量'
    }
]

const typeFilter = {
    '全套': [1, 5],
    '半套': [2],
    '散图': [3],
    '视频': [4, 5],
    '半原创': [6],
    '原创-店铺首页': [7],
    '原创-创意图': [8],
    '原创-全套': [9],
    '基础修改': [10],
    '视频剪辑': [11],
    '换文字/换产品/调色/换背景/ 新增小元素/套图（单位：张）': [12],
    '整套规范存图（单位：套）': [13],
    '主图打标/logo修改（单位：张）': [14],
    '摄影': [15]
}

const nameFilter = {
    '候依雯': '侯依雯',
    '李徐莹': '余颖'
}

const statLeaderItem = [
    {
        name: '视觉预审',
        code: 'visionReview',
        child: [0, 1, 2],
        childMap: {
            0: 0,
            1: 1,
            2: 2
        },
        childItem: {
            2: [-1, 0, 1] //-1:视觉类型，0优先级，1链接级别，2样品，3外包, 4AI拍摄, 5一般拍摄，63D
        }
    }, {
        name: '视觉方案',
        code: 'visionPlan',
        child: [0, 1, 2],
        childMap: {
            0: 0,
            1: 1,
            2: 2
        },
        childItem: {
            0: [-1, 2, 3],
            1: [-1, 2, 3],
            2: [-1, 2, 3]
        }
    }, {
        name: '视觉项目',
        code: 'visionProject',
        child: [1, 2],        
        childMap: {
            1: 0,
            2: 1
        },
        childItem: {
            1: [7, 8, 9],
            2: [7, 8, 9]
        },
        childItemMap: {
            1: {
                7: 0,
                8: 1,
                9: 2
            }, 
            2: {
                7: 0,
                8: 1,
                9: 2
            }
        }
    }
]
//display: 0源数据显示，1映射, 2展示部分
const leaderItemField = {
    '-1': {
        name: '视觉类型',
        display: 1,
        data: [
            '全套', '半套', '散图', '视频', 
            '半原创', '原创-店铺首页', '原创-创意图', '原创-全套', '基础修改',
            '视频剪辑', '换文字/换产品/调色/换背景/ 新增小元素/套图（单位：张）',
            '整套规范存图（单位：套）', '主图打标/logo修改（单位：张）', '摄影'
        ],
        map: statItem2Type
    },
    0: {
        name: '优先级',
        display: 0
    }, 
    1: {
        name: '链接级别',
        display: 0
    },
    2: {
        name: '样品',
        display: 2,
        data: '需要',
        map: 'equal'
    },
    3: {
        name: '外包',
        display: 2,
        data: '自行',
        map: 'like'
    },
    4: {
        name: 'AI拍摄',
        display: 2,
        data: '是',
        map: 'equal'
    },
    5: {
        name: '一般拍摄',
        display: 2,
        data: '是',
        map: 'equal',
    },
    6: {
        name: '3D建模',
        display: 2,
        data: '是',
        map: 'equal'
    }, 
    7: {
        name: '3D渲染',
        display: 2,
        data: 0,
        map: 'more than'
    },
    8: {
        name: 'AI修图',
        display: 2,
        data: 0,
        map: 'more than'
    },
    9: {
        name: '传统',
        display: 2,
        data: 0,
        map: 'same'
    }
}

const designerTags = ['mainDesigner', 'designer', 'associateDesigner', 'visionLeader']
const designerSort = {
    'visionLeader': 0,
    'mainDesigner': 1,
    'designer': 2,
    'associateDesigner': 3
}

const photographerTags = ['photographyManager', 'photographer', 'associatePhotographer']
const photographerSort = {
    'photographyManager': 0, 
    'photographer': 1, 
    'associatePhotographer': 2
}

const memberItem = {
    name: '',
    position: '-',
    sort: 0,
}

const visionList = ['out', 'inside']
const visionFilter = {
    'out': ['outArt', 'outPhoto'],
    'inside': ['insideArt', 'insidePhoto']
}

const photographerChild = {
    item: [4,5],
    map: {
        4: 0,
        5: 1
    }
}

const tableHeaderExtra = {
    119: [{
        fieldId: "planComplete",
        fieldName: "是否过方案",
        search: false,
    }, {
        fieldId: "planCompleteTime",
        fieldName: "过方案时间",
        search: false,
    }, {
        fieldId: "planType",
        fieldName: "方案类型",
        search: false,
    }, {
        fieldId: "photographyStartTime",
        fieldName: "开始拍摄时间",
        search: false,
    }, {
        fieldId: "photographyEndTime",
        fieldName: "结束拍摄时间",
        search: false,
    }, {
        fieldId: "photographyStatus",
        fieldName: "摄影当前状态",
        search: false,
    }, {
        fieldId: "visionProgress",
        fieldName: "视觉进度",
        search: false,
    }, {
        fieldId: "completeTime",
        fieldName: "完成时间",
        search: false,
    }, {
        fieldId: "photoStatus",
        fieldName: "上传链图云",
        search: false,
    }],
    197: [{
        fieldId: "sampleComplete",
        fieldName: "样品是否齐全",
        search: true,
        value: ['是', '否']
    }, {
        fieldId: "planComplete",
        fieldName: "是否过方案",
        search: false,
    }, {
        fieldId: "planCompleteTime",
        fieldName: "过方案时间",
        search: false,
    }, {
        fieldId: "planType",
        fieldName: "方案类型",
        search: false,
    }, {
        fieldId: "photographyStartTime",
        fieldName: "开始拍摄时间",
        search: false,
    }, {
        fieldId: "photographyEndTime",
        fieldName: "结束拍摄时间",
        search: false,
    }, {
        fieldId: "photographyStatus",
        fieldName: "摄影当前状态",
        search: false,
    }, {
        fieldId: "visionProgress",
        fieldName: "视觉进度",
        search: false,
    }, {
        fieldId: "completeTime",
        fieldName: "完成时间",
        search: false,
    }, {
        fieldId: "photoStatus",
        fieldName: "上传链图云",
        search: false,
    }]
}

const newPannelHeader = [
    {
        field_id: 'textField_lxkb9f8v', 
        title: '需求/产品名称',
        type: 'input'
    }, {
        field_id: 'radioField_lxkb9f93', 
        title: '上架平台',
        type: 'select',
        data: [
            '天猫', '拼多多', '京东', '唯品会', '天猫超市', '1688', '得物',
            '淘工厂', '天猫垂类店', '小红书', 'Coupang', '抖音', '快手', '人事/行政'
        ]
    }, {
        field_id: 'employeeField_lxkb9f9a', 
        title: '运营负责人',
        type: 'input'
    }, {
        field_id: 'operation_leader', 
        title: '运营组长',
        type: 'input'
    }, {
        field_id: 'product_img', 
        title: '产品图片'
    }, {
        field_id: 'radioField_m4s69d9s', 
        title: '链接级别',
        type: 'select',
        data: [
            'S（月销20w以上）', 'A（月销10-20w）', 'B（月销3-10w）', 'C（月销3w以下）'
        ]
    }, {
        field_id: 'radioField_m82nqz8h', 
        title: '优先级',
        type: 'select',
        data: ['P0', 'P1', 'P2', 'P3']
    }, {
        field_id: 'sample_complete', 
        title: '样品是否齐全',
        type: 'select',
        data: ['齐全', '不齐全']
    }, {
        field_id: 'operation_vision_type', 
        title: '运营视觉类别',
        type: 'select',
        data: ['原创', '半原创']
    }, {
        field_id: 'operation_vision_info', 
        title: '运营类别细分',
        type: 'select',
        data: [
            '套版详情/套（简单）（单位：套）',
            '套版详情/套（复杂）（单位：套）',
            '仿主图/仿车图/仿详情（简单）（单位：张）',
            '仿主图/仿车图/仿详情（复杂）（单位：屏）',
            '详情/KV/推广图仅部分原创（单位：屏）',
            '厂图基础上做设计调整（单位：屏）',
            '活动首页+日常首页',
            '原创详情（S级 6天）（单位：屏）',
            '原创详情（A级 4天）（单位：屏）',
            '原创详情（B级 3天）（单位：屏）',
            '原创详情（C级 2天）（单位：屏）',
            '主图/车图/详情前3屏创意图（重点）（单位：张）',
            '主图/车图/详情创意图（普通）（单位：张）'
        ]
    }, {
        field_id: 'vision_type', 
        title: '视觉类别',
        type: 'select',
        data: ['原创', '半原创', '基础修改']
    }, {
        field_id: 'vision_info', 
        title: '类别细分',
        type: 'select',
        data: [
            '活动首页+日常首页（4天）',
            '主图/车图/详情前3屏创意图（重点）',
            '主图/车图/详情创意图（普通）',
            '原创详情（S级 6天）',
            '原创详情（A级 4天）',
            '原创详情（B级 3天）',
            '原创详情（C级 2天）',
            '主图/车图/详情首张（重点）',
            '详情靠前三张大图/其他推广图（普通）',
            '换背景 部分修图（简单）',
            '建模渲染主图/车图/详情(简单）',
            '建模渲染主图/车图/详情(复杂）',
            '动态详情/屏',
            '产品建模（简单）',
            '产品建模（复杂）',
            '3D场景库素材',
            '场景背景AI生成（简单）',
            '场景AI生成（复杂）',
            'AI工作流搭建',
            '套版详情/套（简单）',
            '套版详情/套（复杂）',
            '仿主图/仿车图/仿详情（简单）',
            '仿主图/仿车图/仿详情（复杂）',
            '详情/KV/推广图仅部分原创',
            '厂图基础上做设计调整'
        ]
    }, {
        field_id: 'employeeField_m0n7i20u', 
        title: '视觉负责人',
        type: 'input'
    }, {
        field_id: 'plan_status', 
        title: '方案',
        type: 'select',
        data: ['已过', '未过', '无需过方案', '不做了']
    }, {
        field_id: 'checkboxField_m5orks8h', 
        title: '方案类型',
        type: 'select',
        data: ['3D', '拍摄', '修图', 'AI']
    }, {
        field_id: 'num', 
        title: '过方案后需求屏数',
        children: [
            {
                field_id: 'textField_m82nqz8k',
                title: '重点'
            }, {
                field_id: 'textField_m82nqz8l',
                title: '普通'
            }, {
                field_id: 'textField_m82nqz8m',
                title: '简单'
            }
        ]
    }, {
        field_id: 'design_start', 
        title: '设计开始啥时间',
        type: 'date'
    }, {
        field_id: 'photography_progress', 
        title: '摄影进度',
        type: 'select',
        data: ['未开始', '拍摄中', '已拍完', '不需要拍摄']
    }, {
        field_id: 'employeeField_lzcfqrh3', 
        title: '摄影负责人',
        type: 'input'
    }, {
        field_id: 'design_progress', 
        title: '视觉进度',
        type: 'select',
        data: ['未开始', '进行中', '已完成']
    }, {
        field_id: 'design_end', 
        title: '设计完成时间',
        type: 'date'
    }, {
        field_id: 'upload_status', 
        title: '上传链图云',
        type: 'select',
        data: ['未完成', '完成上传', '散图不上传']
    }
]

const developmentType = {
    1: 'supplier_num',
    2: 're_num',
    3: 'self_num',
    4: 'ip_num',
    5: 'create_num'
}
const developmentTypeMap = {
    supplier_num: 1,
    re_num: 2,
    self_num: 3,
    ip_num: 4,
    create_num: 5
}
const developmentStatusMap = {
    '待转入': 0,
    '进行中': 1,
    '已完成': 2,
    '选中': 3,
    '未选中': 4
}
const developmentWorkType = {
    1: 'cost_optimize',
    2: 'imperfect',
    3: 'analyse',
    4: 'quality_control',
    5: 'property',
    6: 'valid_supplier'
}

const developmentWorkProblem = {
    1: 'nexts',
    2: 'rollback',
    3: 'transfer',
    4: 'reject',
}

module.exports = {
    action,
    actionItem,
    actionItem2,
    item,
    actionFilter,
    statItem,
    statItem1,
    statItem1Type,
    statItem2,
    statItem2Type,
    statItem3,
    statItem3Type,
    statItem4,
    statItem5,
    statItem5Type,
    totalName,
    totalCode,
    totalStat,
    totalStatType,
    totalStat1,
    typeFilter,
    fullActionFilter, 
    nameFilter,
    statLeaderItem,
    leaderItemField,
    designerTags,
    designerSort,
    photographerTags,
    photographerSort,
    memberItem,
    visionList,
    visionFilter,
    retouchList,
    photographerChild,
    tableHeaderExtra,
    developmentType,
    developmentTypeMap,
    developmentStatusMap,
    developmentWorkType,
    developmentWorkProblem,
    newPannelHeader
}