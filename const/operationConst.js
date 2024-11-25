const typeList = {
    division: {
        key: 1,
        value: 'division',
        column: 'shop_name',
        map: [2],
        item: [
            {label: '', key: 'name', is_link: true}, 
            {label: '发货金额', key: 'sale_amount'}, 
            {label: '推广费', key: 'promotion_amount'}, 
            {label: '费用', key: 'operation_amount'},  
            {label: '费比(%)', key: 'operation_rate'}, 
            {label: 'ROI', key: 'roi'}, 
            {label: '访问量', key: 'words_vol'},
            {label: '市场流量', key: 'words_market_vol'},
            {label: '市占率(%)', key: 'market_rate'}, 
            {label: '退货量', key: 'refund_qty'},
            {label: '商品销量', key: 'real_sale_qty'},
            {label: '退货率(%)', key: 'refund_rate'}, 
            {label: '运费', key: 'express_fee'}, 
            {label: '利润', key: 'profit'}, 
            {label: '利润率(%)', key: 'profit_rate'}, 
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
            {label: '发货金额', key: 'sale_amount'}, 
            {label: '推广费', key: 'promotion_amount'}, 
            {label: '费用', key: 'operation_amount'},  
            {label: '费比(%)', key: 'operation_rate'}, 
            {label: 'ROI', key: 'roi'}, 
            {label: '访问量', key: 'words_vol'},
            {label: '市场流量', key: 'words_market_vol'},
            {label: '市占率(%)', key: 'market_rate'}, 
            {label: '退货量', key: 'refund_qty'},
            {label: '商品销量', key: 'real_sale_qty'},
            {label: '退货率(%)', key: 'refund_rate'}, 
            {label: '运费', key: 'express_fee'}, 
            {label: '利润', key: 'profit'}, 
            {label: '利润率(%)', key: 'profit_rate'}, 
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
            {label: '发货金额', key: 'sale_amount'},
            {label: '推广费', key: 'promotion_amount'},
            {label: '费用', key: 'operation_amount'},  
            {label: '费比(%)', key: 'operation_rate'}, 
            {label: 'ROI', key: 'roi'}, 
            {label: '访问量', key: 'words_vol'},
            {label: '市场流量', key: 'words_market_vol'},
            {label: '市占率(%)', key: 'market_rate'}, 
            {label: '退货量', key: 'refund_qty'},
            {label: '商品销量', key: 'real_sale_qty'},
            {label: '退货率(%)', key: 'refund_rate'}, 
            {label: '运费', key: 'express_fee'}, 
            {label: '利润', key: 'profit'}, 
            {label: '利润率(%)', key: 'profit_rate'}, 
        ]
    },
    team: {
        key: 4,
        value: 'team',
        column: 'link_id',
        map: [5],
        item: [
            {label: '', key: 'name', is_link: true}, 
            {label: '发货金额', key: 'sale_amount'},
            {label: '推广费', key: 'promotion_amount'},
            {label: '费用', key: 'operation_amount'},  
            {label: '费比(%)', key: 'operation_rate'}, 
            {label: 'ROI', key: 'roi'}, 
            {label: '访问量', key: 'words_vol'},
            {label: '市场流量', key: 'words_market_vol'},
            {label: '市占率(%)', key: 'market_rate'}, 
            {label: '退货量', key: 'refund_qty'},
            {label: '商品销量', key: 'real_sale_qty'},
            {label: '退货率(%)', key: 'refund_rate'}, 
            {label: '运费', key: 'express_fee'}, 
            {label: '利润', key: 'profit'}, 
            {label: '利润率(%)', key: 'profit_rate'}, 
        ]
    },
    user: {
        key: 5,
        value: 'user',
        column: 'link_id',
        map: [5],
        item: [
            {label: '', key: 'name', is_link: true}, 
            {label: '发货金额', key: 'sale_amount'},
            {label: '推广费', key: 'promotion_amount'},
            {label: '费用', key: 'operation_amount'},  
            {label: '费比(%)', key: 'operation_rate'}, 
            {label: 'ROI', key: 'roi'}, 
            {label: '访问量', key: 'words_vol'},
            {label: '市场流量', key: 'words_market_vol'},
            {label: '市占率(%)', key: 'market_rate'}, 
            {label: '退货量', key: 'refund_qty'},
            {label: '商品销量', key: 'real_sale_qty'},
            {label: '退货率(%)', key: 'refund_rate'}, 
            {label: '运费', key: 'express_fee'}, 
            {label: '利润', key: 'profit'}, 
            {label: '利润率(%)', key: 'profit_rate'}, 
        ]
    }
}
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

const workItemList = ['选品', '视觉', '上架', '优化']
const workItemMap = {
    1: 0,
    2: 1,
    3: 2,
    4: 3
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
    analysisLinkPrevious
}