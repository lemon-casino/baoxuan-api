const typeList = {
    division: {
        key: 1,
        value: 'division',
        column: 'shop_name',
        map: [2],
        item: [
            {label: '', key: 'name', is_link: true}, 
            {label: '发货金额', key: 'payment'}, 
            {label: '账单金额', key: 'invoice'}
        ]
    },
    project: {
        key: 2,
        value: 'project',
        column: 'shop_name',
        map: [3, 4, 5],
        item: [
            {label: '', key: 'name', is_link: true}, 
            {label: '发货金额', key: 'payment'}, 
            {label: '账单金额', key: 'invoice'}
        ]
    },
    shop: {
        key: 3,
        value: 'shop',
        column: 'shop_name',
        map: [5],
        item: [
            {label: '', key: 'name', is_link: true}, 
            {label: '发货金额', key: 'payment'}
        ]
    },
    team: {
        key: 4,
        value: 'team',
        column: 'link_id',
        map: [5],
        item: [
            {label: '', key: 'name', is_link: true}, 
            {label: '发货金额', key: 'payment'}
        ]
    },
    user: {
        key: 5,
        value: 'user',
        column: 'link_id',
        map: [],
        item: [
            {label: '', key: 'name'}, 
            {label: '发货金额', key: 'payment'}
        ]
    }
}
const operationDefaultItem = {
    total: {
        column: [],
        data: [{name: '汇总', payment: 0, invoice: 0}]
    },
    division: {
        column: [],
        data: []
    },
    project: {
        column: [],
        data: []
    },
    shop: {
        column: [],
        data: []
    },
    team: {
        column: [],
        data: []
    },
    user: {
        column: [],
        data: []
    }
}

const projectNameList = {
    'pdd': '拼多多',
    'tgc': '淘工厂',
    'tmmart': '天猫超市',
    'coupang': 'COUPANG',
    'jd': '京东',
    'jdss': '京东自营',
    'dy': '抖音',
    'wxvideo': '视频号',
    'vip': '唯品会',
    '1688': '1688',
    'xy': '闲鱼',
    'dw': '得物',
    'ks': '快手',
    'xhs': '小红书',
    'tm': '天猫'
}

const statItem = {
    actionName: '',
    actionCode: '',
    sum: 0,
    children: [],
}

const workItemList = ['选品', '视觉', '上架', '优化']
const workItemMap = {
    1: 0,
    2: 1,
    3: 2,
    4: 3
}

const workTypeList = ['待转入', '进行中', '已完成']

module.exports = {
    typeList,
    operationDefaultItem,
    projectNameList,
    statItem,
    workItemList,
    workItemMap,
    workTypeList
}