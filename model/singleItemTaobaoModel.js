const {
    DataTypes
} = require('sequelize');
module.exports = sequelize => {
    const attributes = {
        id: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: null,
            primaryKey: true,
            autoIncrement: false,
            comment: "主键",
            field: "id"
        },
        batchId: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "批次;",
            field: "batch_id"
        },
        productName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "产品名称",
            field: "product_name"
        },
        linkId: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "链接ID",
            field: "link_id"
        },
        operationLeader: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "运营负责人",
            field: "operation_leader"
        },
        productLineLeader: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "产品线负责人",
            field: "product_line_leader"
        },
        purchaseLeader: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "采购负责人",
            field: "purchase_leader"
        },
        shopName: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "店铺名称",
            field: "shop_name"
        },
        linkType: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "链接属性",
            field: "link_type"
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "日期",
            field: "date"
        },
        firstLevelItem: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "一级类目",
            field: "first_level_item"
        },
        payAmount: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "支付金额",
            field: "pay_amount"
        },
        shouTaoVisitors: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: "0",
            primaryKey: false,
            autoIncrement: false,
            comment: "手淘搜索访客数",
            field: "shou_tao_visitors"
        },
        shouTaoBuyers: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: "0",
            primaryKey: false,
            autoIncrement: false,
            comment: "手淘搜索买家数",
            field: "shou_tao_buyers"
        },
        shouTaoReallyConversionRate: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "手淘真转率",
            field: "shou_tao_really_conversion_rate"
        },
        profitAmount: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "利润额",
            field: "profit_amount"
        },
        profitRate: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "利润率",
            field: "profit_rate"
        },
        visitors: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: "0",
            primaryKey: false,
            autoIncrement: false,
            comment: "访客数",
            field: "visitors"
        },
        paidBuyers: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: "0",
            primaryKey: false,
            autoIncrement: false,
            comment: "支付买家数",
            field: "paid_buyers"
        },
        sumShoppingCart: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: "0",
            primaryKey: false,
            autoIncrement: false,
            comment: "总购物车数",
            field: "sum_shopping_cart"
        },
        shoppingCartClickAmount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: "0",
            primaryKey: false,
            autoIncrement: false,
            comment: "车点击量",
            field: "shopping_cart_click_amount"
        },
        shoppingCartSumClick: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "车总点击率",
            field: "shopping_cart_sum_click"
        },
        shoppingCartConversion: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "车转化",
            field: "shopping_cart_conversion"
        },
        shoppingCartSumAmount: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "车总花费",
            field: "shopping_cart_sum_amount"
        },
        shoppingCatSumRoi: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "车总投产比",
            field: "shopping_cat_sum_roi"
        },
        payConversionRate: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "支付转化率",
            field: "pay_conversion_rate"
        },
        reallyDealRate: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "真实成交率",
            field: "really_deal_rate"
        },
        deductionPoint: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "扣点",
            field: "deduction_point"
        },
        juBaiCost: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "聚百花费",
            field: "ju_bai_cost"
        },
        clickFarmingAmount: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "刷单金额",
            field: "click_farming_amount"
        },
        clickFarmingCount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: "0",
            primaryKey: false,
            autoIncrement: false,
            comment: "刷单金笔数",
            field: "click_farming_count"
        },
        reallyPaidAmount: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "实际支付金额",
            field: "really_paid_amount"
        },
        refund: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "退款",
            field: "refund"
        },
        reallyShipmentAmount: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "实际发货金额",
            field: "really_shipment_amount"
        },
        cost: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "成本",
            field: "cost"
        },
        freight: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "运费",
            field: "freight"
        },
        shouTaoPeopleNumMarketRate: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "手淘人数市场占比",
            field: "shou_tao_people_num_market_rate"
        },
        salesMarketRate: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "坑产市场占比",
            field: "sales_market_rate"
        },
        shouTaoPeopleNumMarketRateCircleRateDay: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "手淘人数市场占比环比（日）",
            field: "shou_tao_people_num_market_rate_circle_rate_day"
        },
        salesMarketRateCircleRateDay: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "坑市场占比环比（日）",
            field: "sales_market_rate_circle_rate_day"
        },
        shouTaoPeopleNumMarketRateCircleRate7Day: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "手淘人数市场占比环比（7天）",
            field: "shou_tao_people_num_market_rate_circle_rate_7day"
        },
        salesMarketRateCircleRate7Day: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "坑市场占比环比（7天）",
            field: "sales_market_rate_circle_rate_7day"
        },
        shouTaoPeopleNumMarketRateCircleRate30Day: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "手淘人数市场占比环比（30天）",
            field: "shou_tao_people_num_market_rate_circle_rate_30day"
        },
        salesMarketRateCircleRate30Day: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "坑市场占比环比（30天）",
            field: "sales_market_rate_circle_rate_30day"
        },
        brandFirstBuySumAmount: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "品牌新享费用合计",
            field: "brand_first_buy_sum_amount"
        },
        xiaoHongShuRefund: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "小红书返款",
            field: "xiao_hong_shu_refund"
        },
        accuratePeoplePromotionCost: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "精准人群推广费用",
            field: "accurate_people_promotion_cost"
        },
        accuratePeoplePromotionProductionRate: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "精准人群推广花费",
            field: "accurate_people_promotion_production_rate"
        },
        wanXiangTaiCost: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "万相台花费",
            field: "wan_xiang_tai_cost"
        },
        wanXiangTaiProductionRate: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "万相台投产比",
            field: "wan_xiang_tai_production_rate"
        },
        feeRate: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "费用比例",
            field: "fee_rate"
        },
        cartSumPayment: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "车总支付",
            field: "cart_sum_payment"
        },
        accuratePeopleSumPayment: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "精准人群总支付;",
            field: "accurate_people_sum_payment"
        },
        wanXiangTaiSumPayment: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "万象台总支付",
            field: "wan_xiang_tai_sum_payment"
        },
        createTime: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "创建时间",
            field: "create_time"
        },
        linkHierarchy: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "链接层级",
            field: "link_hierarchy"
        },
        userDef1: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "自定义属性1;",
            field: "user_def_1"
        },
        userDef2: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "自定义属性2;",
            field: "user_def_2"
        },
        userDef3: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "自定义属性3;",
            field: "user_def_3"
        },
        userDef4: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "自定义属性4;",
            field: "user_def_4"
        },
        userDef5: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "自定义属性5;",
            field: "user_def_5"
        },
        userDef6: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "自定义属性6;",
            field: "user_def_6"
        },
        userDef7: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "自定义属性7;",
            field: "user_def_7"
        },
        userDef8: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "自定义属性8;",
            field: "user_def_8"
        },
        userDef9: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "自定义属性9;",
            field: "user_def_9"
        },
        userDef10: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "自定义属性10;",
            field: "user_def_10"
        },
        userDef11: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "自定义属性11;",
            field: "user_def_11"
        },
        userDef12: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "自定义属性12;",
            field: "user_def_12"
        },
        userDef13: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "自定义属性13;",
            field: "user_def_13"
        },
        userDef14: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "自定义属性14;",
            field: "user_def_14"
        },
        userDef15: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "自定义属性15;",
            field: "user_def_15"
        },
        userDef16: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "自定义属性16;",
            field: "user_def_16"
        },
        userDef17: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "自定义属性17;",
            field: "user_def_17"
        },
        userDef18: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "自定义属性18;",
            field: "user_def_18"
        },
        userDef19: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "自定义属性19;",
            field: "user_def_19"
        },
        userDef20: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "自定义属性20;",
            field: "user_def_20"
        }
    };
    const options = {
        tableName: "single_item_taobao",
        comment: "",
        indexes: []
    };
    return sequelize.define("singleItemTaoBaoModel", attributes, options);
};