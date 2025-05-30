const ipConst = {
    STATUS: {
        SUCCESS: 1, //立项未DM
        DEVELOPING: 2, //已DM未上市
        FINISH: 3, //已DM已上市
        PENDING: 0  //未立项
    },
    STATUS_LIST: [
        {key: 1, value: '立项未DM'},
        {key: 2, value: '已DM未上市'},
        {key: 3, value: '已DM已上市'},
        {key: 0, value: '未立项'}
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
        {key: '春夏泡茶类产品', value: '春夏泡茶类产品'}
    ],
    PROJECT_TYPE_LIST: [
        {key: '存量产品准备立项+IP', value: '存量产品准备立项+IP'},
        {key: '已立项产品', value: '已立项产品'},
        {key: '空白类目产品IP化', value: '空白类目产品IP化'}
    ],
    DECISION_MAKING_LIST: [
        {key: '保留新增', value: '保留新增'},
        {key: '保留并不新增', value: '保留并不新增'},
        {key: '不保留新增', value: '不保留新增'}
    ],
}

module.exports = ipConst