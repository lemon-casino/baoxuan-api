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
        name: '流程汇总',
        code: 'sumFlowStat'
    }, {
        name: '流程汇总(外包)',
        code: 'sumFlowStat'
    }, {
        name: '流程汇总(内部)',
        code: 'sumFlowStat'
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
    fullActionFilter
}