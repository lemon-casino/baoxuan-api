const activities = {
    insidePhoto: ['拍摄完成', '拍摄数量', 'AI拍摄完成', '摄影完成', '摄影拍照', 'AI拍摄', '一般拍摄'],
    insideArt: ['重点精修美编完成任务', '精修美编完成任务', '精修美编制作', '大美编修图', '小美编修图', 'AI作图', '中美编自修', '套版修图', 'AI修图', '美工修图', 'AI修图完成', '修图师修图'],
    outPhoto: ['分配外包摄影拍摄'],
    outCompleteSet: ['外包修图中', '外包修图数量'],
    outArt: ['外包修图中', '外包修图数量'],
}

const deptAction = {
    insidePhoto: ['一般拍摄', 'AI拍摄'],
    insideArt: {
        normal: ['美编修图'],
        airetouch: ['AI修图'],
        video: ['视频剪辑'],
        render: ['3D渲染']
    },
    outPhoto: ['美编主管确认拍摄完成'],
    outCompleteSet: ['美编主管确认拍摄完成'],
    outArt: ['美编主管确认拍摄完成']
}

const deptField = {
    insidePhoto: {
        normal: [
            'numberField_lzc1dw8e', //实际拍摄图片数量
            'numberField_lzc1dw8o' //实际摄影AI数量
        ],
        video: [
            'numberField_lzc1dw8g' //实际拍摄视频数量
        ]
    },
    insideArt: {
        normal: [
            'numberField_lzkuhwuf', //实际重点精修图数量
            'numberField_lzc1dw98', //实际精修图数量
            'numberField_lzc1dw9a', //实际普通修图数量
            'numberField_lzc1dw9c', //实际简单修图数量
            'numberField_lzc1dw9e', //实际开版修图数量
            'numberField_lzc1dw9g', //实际套版修图数量
        ],
        airetouch: [
            'numberField_lzc1dw9q' //实际美编AI作图数
        ],
        video: [
            'numberField_lzc1dw9i' //实际视频剪辑数量
        ],
        render: [
            'numberField_lzciwm5n' //实际3D渲染数量
        ]
    },
    outPhoto: {
        normal: [
            'numberField_lzc1dw8e', 
            'numberField_lzc1dw8o'
        ],
        video: [
            'numberField_lzc1dw8g'
        ]
    },
    outCompleteSet: {
        normal: [
            'numberField_lzc1dw8e', 
            'numberField_lzc1dw8o', 
            'numberField_lzkuhwuf', 
            'numberField_lzc1dw98', 
            'numberField_lzc1dw9a', 
            'numberField_lzc1dw9c', 
            'numberField_lzc1dw9e', 
            'numberField_lzc1dw9g', 
            'numberField_lzc1dw9q', 
            'numberField_lzciwm5n'
        ],
        video: [
            'numberField_lzc1dw8g', 
            'numberField_lzc1dw9i'
        ]
    },
    outArt: {
        normal: [
            'numberField_lzkuhwuf', 
            'numberField_lzc1dw98', 
            'numberField_lzc1dw9a', 
            'numberField_lzc1dw9c', 
            'numberField_lzc1dw9e', 
            'numberField_lzc1dw9g', 
            'numberField_lzc1dw9q', 
            'numberField_lzciwm5n'
        ],
        video: [
            'numberField_lzc1dw9i'
        ]
    }
}

const deptPreField = {
    insidePhoto: {
        normal: [
            'numberField_lzc1dw86', //预计拍摄图片数量
            'numberField_lzc1dw8m' //预计摄影AI数量
        ],
        video: [
            'numberField_lzc1dw88', //预计拍摄视频数量
        ]
    },
    insideArt: {
        normal: [
            'numberField_lzc1dw8s', //预计重点精修图数量
            'numberField_lzc1dw8u', //预计精修图数量
            'numberField_lzc1dw8w', //预计普通修图数量
            'numberField_lzc1dw8y', //预计简单修图数量
            'numberField_lzc1dw90', //预计开版修图数量
            'numberField_lzc1dw92', //预计套版修图数量
        ],
        airetouch: [
            'numberField_lzc1dw9o', //预计美编AI作图数
        ],
        video: [
            'numberField_lzc1dw94' //预计视频剪辑数量
        ],
        render: [
            'numberField_lzciwm5l' //预计3D渲染数量
        ]
    },
    outPhoto: {
        normal: [
            'numberField_lzc1dw86', 
            'numberField_lzc1dw8m'
        ],
        video: [
            'numberField_lzc1dw88'
        ]
    },
    outCompleteSet: {
        normal: [
            'numberField_lzc1dw86', 
            'numberField_lzc1dw8m', 
            'numberField_lzc1dw8s', 
            'numberField_lzc1dw8u', 
            'numberField_lzc1dw8w', 
            'numberField_lzc1dw8y', 
            'numberField_lzc1dw90', 
            'numberField_lzc1dw92', 
            'numberField_lzc1dw9o', 
            'numberField_lzciwm5l'
        ],
        video: [
            'numberField_lzc1dw94', 
            'numberField_lzc1dw88'
        ]
    },
    outArt: {
        normal: [
            'numberField_lzc1dw8s', 
            'numberField_lzc1dw8u', 
            'numberField_lzc1dw8w', 
            'numberField_lzc1dw8y', 
            'numberField_lzc1dw90', 
            'numberField_lzc1dw92', 
            'numberField_lzc1dw9o', 
            'numberField_lzciwm5l'
        ],
        video: [
            'numberField_lzc1dw94'
        ]
    }
}

const artField = {
    judge: {
        key: 'radioField_lzklnb6i',
        eq: '"是"',
        neq: '"否"'
    },
    field: [
        'numberField_lzkuhwu9', //实际重点精修图数量
        'numberField_lzkuhwua', //实际精修图数量
        'numberField_lzkuhwub', //实际普通修图数量
        'numberField_lzkuhwuc', //实际简单修图数量
        'numberField_lzkuhwud', //实际开版修图数量
        'numberField_lzkuhwue' //实际套版修图数量
    ]
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
    actionFilter,
    artField
}