const supplierConst = {
    STATUS: {
        SUCCESS: 1, //选中-运营立项
        FAILED: -1, //未选中
        RUNNING: 0  //进行中
    },
    STATUS_LIST: [
        {key: 1, value: '选中-运营立项'},
        {key: -1, value: '未选中'},
        {key: 0, value: '进行中'},
    ],
    SUPPLIER_TYPE_LIST: [
        {key: '新供应商', value: '新供应商'},
        {key: '原有供应商', value: '原有供应商'}
    ],
    PURCHASE_TYPE_LIST: [
        {key: '可代发', value: '可代发'},
        {key: '不可代发', value: '不可代发'}
    ],
    PATENT_TYPE_LIST: [
        {key: '实用新型', value: '实用新型'},
        {key: '著作权', value: '著作权'},
        {key: '发明专利', value: '发明专利'},
        {key: '外观专利', value: '外观专利'},
        {key: '无', value: '无'}
    ],
    GOODS_TYPE_LIST: [
        {key: '通货', value: '通货'},
        {key: '等待打样中', value: '等待打样中'},
    ],
    SEASON_LIST: [
        {key: '春季3月-5月', value: '春季3月-5月'},
        {key: '夏季6月-8月', value: '夏季6月-8月'},
        {key: '秋季9月-12月', value: '秋季9月-12月'},
        {key: '冬季12月-2月', value: '冬季12月-2月'},
        {key: '全年', value: '全年'}
    ],
    PATENT_BELONGS_LIST: [
        {key: '工厂', value: '工厂'},
        {key: '公司', value: '公司'},
        {key: '无', value: '无'}
    ],
    PATENT_TYPE_LIST: [
        {key: '实用新型', value: '实用新型'},
        {key: '著作权', value: '著作权'},
        {key: '发明专利', value: '发明专利'},
        {key: '外观专利', value: '外观专利'},
        {key: '无', value: '无'}
    ],
    RELATED_LIST: [
        {key: '过年相关产品', value: '过年相关产品'},
        {key: '保存产品的相关产品', value: '保存产品的相关产品'},
        {key: '厨房产品，情人节', value: '厨房产品，情人节'},
        {key: '春季开学季', value: '春季开学季'},
        {key: '三八妇女节', value: '三八妇女节'},
        {key: '春游秋游相关产品', value: '春游秋游相关产品'},
        {key: '4月热切冷水杯', value: '4月热切冷水杯'},
        {key: '520节', value: '520节'},
        {key: '6.1儿童节', value: '6.1儿童节'},
        {key: '毕业季', value: '毕业季'},
        {key: '七夕产品', value: '七夕产品'},
        {key: '准备购买中秋国庆旅游装备', value: '准备购买中秋国庆旅游装备'},
        {key: '秋季开学产品', value: '秋季开学产品'},
        {key: '水具换季', value: '水具换季'},
        {key: '换季产品', value: '换季产品'},
        {key: '无', value: '无'},
        {key: '礼品', value: '礼品'},
        {key: '春夏泡茶类产品', value: '春夏泡茶类产品'},
        {key: '夏季', value: '夏季'}
    ],
    SALE_PURPOSE_LIST: [
        {key: '迭代', value: '迭代'},
        {key: '填补空白', value: '填补空白'}
    ],
    EXPLOITATION_FEATURES_LIST: [
        {key: '通货', value: '通货'},
        {key: '供应商知识产权', value: '供应商知识产权'},
        {key: '自研', value: '自研'},
        {key: 'IP', value: 'IP'}
    ],
    DESIGN_TYPE_LIST: [
        {key: '贴图', value: '贴图'},
        {key: '缝合', value: '缝合'},
        {key: '模具创新', value: '模具创新'},
        {key: 'IP', value: 'IP'},
    ],
}

module.exports = supplierConst