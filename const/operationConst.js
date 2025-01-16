const typeList = {
    division: {
        key: 1,
        value: 'division',
        column: 'shop_name',
        map: [2],
    },
    project: {
        key: 2,
        value: 'project',
        column: 'shop_name',
        map: [3, 4, 5],
    },
    shop: {
        key: 3,
        value: 'shop',
        column: 'shop_name',
        map: [5],
    },
    team: {
        key: 4,
        value: 'team',
        column: 'link_id',
        map: [5],
    },
    user: {
        key: 5,
        value: 'user',
        column: 'link_id',
        map: [5],
    }
}

const columnList = [
    {label: '', key: 'name', is_link: true}, 
    {label: '发货金额', key: 'sale_amount'}, 
    {label: '推广费', key: 'promotion_amount'}, 
    {label: '费用', key: 'operation_amount'},  
    {label: '费比(%)', key: 'operation_rate'}, 
    {label: 'ROI', key: 'roi'}, 
    {label: '访问量', key: 'words_vol'},
    {label: '市场流量', key: 'words_market_vol'},
    {label: '市占率(%)', key: 'market_rate'}, 
    {label: '退单量', key: 'refund_num'},
    {label: '订单量', key: 'order_num'},
    {label: '退货率(%)', key: 'refund_rate'}, 
    {label: '运费', key: 'express_fee'}, 
    {label: '包材费', key: 'packing_fee'}, 
    {label: '利润', key: 'profit'}, 
    {label: '利润率(%)', key: 'profit_rate'}
]

const operationDefaultItem = {
    total: {
        column: [],
        data: [{name: '汇总', sale_amount: 0, invoice: 0}]
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
    'jdssp': '京东自营推广',
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

const workItemList = ['选品', '市场分析', '爆款方案', '视觉', '上架', '优化']
const workItemMap = {
    1: 0,
    2: 3,
    3: 4,
    4: 5,
    5: 1,
    6: 2
}

const workTypeList = ['待转入', '进行中', '已完成']
const operationSelectionFlow = [11, 106]
const operationSelectionFlowNode = [
    {
        activity_id: 'node_oclwzzaj997',
        activity_name: '审核产品'
    },{
        activity_id: 'node_ocm1ag8ewd3',
        activity_name: '运营成本是否选中'
    }
]

const analysisFlowUUid = 'FORM-FEAF99D22148431E91EB2E8297FBB45DCS9Z'
const analysisLinkPrevious = 'https://t8sk7d.aliwork.com/APP_BXS79QCC8MY5ZV0EZZ07/processDetail?formInstId='
const analysisFieldMap = {
    platform: 'radioField_m1g24ev1',
    selected: 'radioField_m1hjo1ka',
    instance_id: 'textField_m2pxi0qq',
    link: 'textField_m2py5hjz',
    operator: 'employeeField_lii9qts2'
}

const optimizeFlowUUid = 'FORM-51A6DCCF660B4C1680135461E762AC82JV53'
const optimizeUser = '02353062153726101260'
const platformMap = {
    '天猫部': '天猫',
    'fcs+pop': '京东',
    '拼多多部': '拼多多',
    '淘工厂部': '淘工厂'
}
const optimizeFieldMap = {
    name: 'textField_liihs7kv',
    operator: 'employeeField_liihs7l0',
    goods_id: 'textField_liihs7kw',
    platform: 'radioField_lxlncgm1',
    type: 'selectField_lk7qoefv',
    content: 'multiSelectField_lwufb7oy'
}

module.exports = {
    typeList,
    operationDefaultItem,
    projectNameList,
    statItem,
    workItemList,
    workItemMap,
    workTypeList,
    operationSelectionFlow,
    operationSelectionFlowNode,
    analysisFieldMap,
    analysisFlowUUid,
    analysisLinkPrevious,
    columnList,
    optimizeFlowUUid,
    platformMap,
    optimizeFieldMap,
    optimizeUser
}