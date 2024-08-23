const activities = {
    insidePhoto: ['拍摄完成', '拍摄数量', 'AI拍摄完成', '摄影完成', '摄影拍照', 'AI拍摄', '一般拍摄'],
    insideArt: ['重点精修美编完成任务', '精修美编完成任务', '精修美编制作', '大美编修图', '小美编修图', 'AI作图', '中美编自修', '套版修图', 'AI修图', '美工修图', 'AI修图完成', '修图师修图'],
    outPhoto: ['分配外包摄影拍摄'],
    outCompleteSet: ['外包修图中', '外包修图数量'],
    outArt: ['外包修图中', '外包修图数量'],
}

const deptAction = {
    insidePhoto: ['一般拍摄', 'AI拍摄'],
    insideArt: ['AI修图', '3D渲染', '视频剪辑', '美编修图'],
    outPhoto: ['美编主管确认拍摄完成'],
    outCompleteSet: ['美编主管确认拍摄完成'],
    outArt: ['美编主管确认拍摄完成']
}

const deptField = {
    insidePhoto: {
        normal: ['numberField_lzc1dw8e', 'numberField_lzc1dw8o'],
        video: ['numberField_lzc1dw8g']
    },
    insideArt: {
        normal: ['numberField_lzkuhwu9', 'numberField_lzc1dw98', 'numberField_lzc1dw9a', 'numberField_lzc1dw9c', 'numberField_lzc1dw9e', 'numberField_lzc1dw9g'],
        video: ['numberField_lzc1dw9i']
    },
    outPhoto: {
        normal: ['numberField_lzc1dw8e', 'numberField_lzc1dw8o'],
        video: ['numberField_lzc1dw8g']
    },
    outCompleteSet: {
        normal: ['numberField_lzc1dw8e', 'numberField_lzc1dw8o', 'numberField_lzkuhwu9', 'numberField_lzc1dw98', 'numberField_lzc1dw9a', 'numberField_lzc1dw9c', 'numberField_lzc1dw9e', 'numberField_lzc1dw9g'],
        video: ['numberField_lzc1dw8g', 'numberField_lzc1dw9i']
    },
    outArt: {
        normal: ['numberField_lzkuhwu9', 'numberField_lzc1dw98', 'numberField_lzc1dw9a', 'numberField_lzc1dw9c', 'numberField_lzc1dw9e', 'numberField_lzc1dw9g'],
        video: ['numberField_lzc1dw9i']
    }
}

const deptPreField = {
    insidePhoto: {
        normal: ['numberField_lzc1dw86', 'numberField_lzc1dw8m'],
        video: ['numberField_lzc1dw88']
    },
    insideArt: {
        normal: ['numberField_lzc1dw8s', 'numberField_lzc1dw8u', 'numberField_lzc1dw8w', 'numberField_lzc1dw8y', 'numberField_lzc1dw90', 'numberField_lzc1dw92'],
        video: ['numberField_lzc1dw94']
    },
    outPhoto: {
        normal: ['numberField_lzc1dw86', 'numberField_lzc1dw8m'],
        video: ['numberField_lzc1dw88']
    },
    outCompleteSet: {
        normal: ['numberField_lzc1dw86', 'numberField_lzc1dw8m', 'numberField_lzc1dw8s', 'numberField_lzc1dw8u', 'numberField_lzc1dw8w', 'numberField_lzc1dw8y', 'numberField_lzc1dw90', 'numberField_lzc1dw92'],
        video: ['numberField_lzc1dw94', 'numberField_lzc1dw88']
    },
    outArt: {
        normal: ['numberField_lzc1dw8s', 'numberField_lzc1dw8u', 'numberField_lzc1dw8w', 'numberField_lzc1dw8y', 'numberField_lzc1dw90', 'numberField_lzc1dw92'],
        video: ['numberField_lzc1dw94']
    }
}
const action = {
    next: {
        key: 'next',
        value: '待转入'
    },
    doing: {
        key: 'doing',
        value: '进行中'
    },
    complete: {
        key: 'agree',
        value: '已完成',
    }
}

const actionItem = {
    actionName: '',
    children: [{
        actionName: '逾期',
        children: [{
            actionName: '全套',
            ids: [],
            sum: 0,
            userFlowsDataStat: []
        },{
            actionName: '半套',
            ids: [],
            sum: 0,
            userFlowsDataStat: []
        },{
            actionName: '散图',
            ids: [],
            sum: 0,
            userFlowsDataStat: []
        },{
            actionName: '视频',
            ids: [],
            sum: 0,
            userFlowsDataStat: []
        }],
        ids: [],
        sum: 0
    },{
        actionName: '未逾期',
        children: [{
            actionName: '全套',
            ids: [],
            sum: 0,
            userFlowsDataStat: []
        },{
            actionName: '半套',
            ids: [],
            sum: 0,
            userFlowsDataStat: []
        },{
            actionName: '散图',
            ids: [],
            sum: 0,
            userFlowsDataStat: []
        },{
            actionName: '视频',
            ids: [],
            sum: 0,
            userFlowsDataStat: []
        }],
        ids: [],
        sum: 0
    }],
    ids: [],
    sum: 0
}
const actionItem2 = {
    actionName: '工作量',
    children: [{
        actionName: '进行中',
        children: [],
        ids: [],
        sum: 0,
        sumAlone: true,
        tooltip: '该工作量会统计表单中预计的数据',
        uniqueIds: true
    },{
        actionName: '已完成',
        children: [],
        ids: [],
        sum: 0,
        sumAlone: true,
        uniqueIds: true
    }],
    ids: [],
    sum: 0
}
const item = {
    actionCode: 'userActStat',
    actionName: '',
    children: [],
    ids: [],
    sum: 0
}

const actionFilter = {
    '待转入': ['next'],
    '进行中': ['doing'],
    '已完成': ['agree'],
    '工作量': ['next', 'doing', 'agree']
}

module.exports = {
    activities,
    deptAction,
    deptField,
    deptPreField,
    action,
    actionItem,
    actionItem2,
    item,
    actionFilter
}