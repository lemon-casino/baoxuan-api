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
        children: [{
            actionName: '全套',
            sum: 0,
        },{
            actionName: '半套',
            sum: 0,
        },{
            actionName: '散图',
            sum: 0,
        },{
            actionName: '视频',
            sum: 0,
        }],
        sum: 0
    },{
        actionName: '未逾期',
        children: [{
            actionName: '全套',
            sum: 0,
        },{
            actionName: '半套',
            sum: 0,
        },{
            actionName: '散图',
            sum: 0,
        },{
            actionName: '视频',
            sum: 0,
        }],
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
        sumAlone: true,
        tooltip: '该工作量会统计表单中预计的数据',
        uniqueIds: true
    },{
        actionName: '已完成',
        children: [],
        sum: 0,
        sumAlone: true,
        uniqueIds: true
    }],
    sum: 0
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
    sum: 0
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
    }
]

const statItem2Type = {
    1: [0],
    2: [1],
    3: [2],
    4: [3],
    5: [0, 3]
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
    '视频': [4, 5]
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
        data: ['全套', '半套', '散图', '视频'],
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
    photographerChild
}