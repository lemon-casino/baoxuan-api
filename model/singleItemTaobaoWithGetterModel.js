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
            field: "shou_tao_really_conversion_rate",
            get() {
                const shouTaoReallyConversionRate = this.getDataValue("shouTaoReallyConversionRate")
                if (shouTaoReallyConversionRate && shouTaoReallyConversionRate !== "0.00") {
                    return `${shouTaoReallyConversionRate}%`
                }
                return shouTaoReallyConversionRate
            }
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
            field: "profit_rate",
            get() {
                const profitRate = this.getDataValue("profitRate")
                if (profitRate) {
                    return `${profitRate}%`
                }
                return profitRate
            }
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
            field: "shopping_cart_sum_click",
            get() {
                const shoppingCartSumClick = this.getDataValue("shoppingCartSumClick")
                if (shoppingCartSumClick && shoppingCartSumClick !== "0.00") {
                    return `${shoppingCartSumClick}%`
                }
                return shoppingCartSumClick
            }
        },
        shoppingCartConversion: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "车转化",
            field: "shopping_cart_conversion",
            get() {
                const shoppingCartConversion = this.getDataValue("shoppingCartConversion")
                if (shoppingCartConversion && shoppingCartConversion !== "0.00") {
                    return `${shoppingCartConversion}%`
                }
                return shoppingCartConversion
            }
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
            field: "shopping_cat_sum_roi",
            get() {
                const shoppingCatSumRoi = this.getDataValue("shoppingCatSumRoi")
                if (shoppingCatSumRoi && shoppingCatSumRoi !== "0.00") {
                    return `${shoppingCatSumRoi}%`
                }
                return shoppingCatSumRoi
            }
        },
        payConversionRate: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "支付转化率",
            field: "pay_conversion_rate",
            get() {
                const payConversionRate = this.getDataValue("payConversionRate")
                if (payConversionRate && payConversionRate !== "0.00") {
                    return `${payConversionRate}%`
                }
                return payConversionRate
            }
        },
        reallyDealRate: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "真实成交率",
            field: "really_deal_rate",
            get() {
                const reallyDealRate = this.getDataValue("reallyDealRate")
                if (reallyDealRate && reallyDealRate !== "0.00") {
                    return `${reallyDealRate}%`
                }
                return reallyDealRate
            }
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
            field: "shou_tao_people_num_market_rate",
            get() {
                const shouTaoPeopleNumMarketRate = this.getDataValue("shouTaoPeopleNumMarketRate")
                if (shouTaoPeopleNumMarketRate && shouTaoPeopleNumMarketRate !== "0.00") {
                    return `${shouTaoPeopleNumMarketRate}%`
                }
                return shouTaoPeopleNumMarketRate
            }
        },
        salesMarketRate: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "坑产市场占比",
            field: "sales_market_rate",
            get() {
                const salesMarketRate = this.getDataValue("salesMarketRate")
                if (salesMarketRate && salesMarketRate !== "0.00") {
                    return `${salesMarketRate}%`
                }
                return salesMarketRate
            }
        },
        shouTaoPeopleNumMarketRateCircleRateDay: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "手淘人数市场占比环比（日）",
            field: "shou_tao_people_num_market_rate_circle_rate_day",
            get() {
                const shouTaoPeopleNumMarketRateCircleRateDay = this.getDataValue("shouTaoPeopleNumMarketRateCircleRateDay")
                if (shouTaoPeopleNumMarketRateCircleRateDay && shouTaoPeopleNumMarketRateCircleRateDay !== "0.00") {
                    return `${shouTaoPeopleNumMarketRateCircleRateDay}%`
                }
                return shouTaoPeopleNumMarketRateCircleRateDay
            }
        },
        salesMarketRateCircleRateDay: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "坑市场占比环比（日）",
            field: "sales_market_rate_circle_rate_day",
            get() {
                const salesMarketRateCircleRateDay = this.getDataValue("salesMarketRateCircleRateDay")
                if (salesMarketRateCircleRateDay && salesMarketRateCircleRateDay !== "0.00") {
                    return `${salesMarketRateCircleRateDay}%`
                }
                return salesMarketRateCircleRateDay
            }
        },
        shouTaoPeopleNumMarketRateCircleRate7Day: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "手淘人数市场占比环比（7天）",
            field: "shou_tao_people_num_market_rate_circle_rate_7day",
            get() {
                const shouTaoPeopleNumMarketRateCircleRate7Day = this.getDataValue("shouTaoPeopleNumMarketRateCircleRate7Day")
                if (shouTaoPeopleNumMarketRateCircleRate7Day && shouTaoPeopleNumMarketRateCircleRate7Day !== "0.00") {
                    return `${shouTaoPeopleNumMarketRateCircleRate7Day}%`
                }
                return shouTaoPeopleNumMarketRateCircleRate7Day
            }
        },
        salesMarketRateCircleRate7Day: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "坑市场占比环比（7天）",
            field: "sales_market_rate_circle_rate_7day",
            get() {
                const salesMarketRateCircleRate7Day = this.getDataValue("salesMarketRateCircleRate7Day")
                if (salesMarketRateCircleRate7Day && salesMarketRateCircleRate7Day !== "0.00") {
                    return `${salesMarketRateCircleRate7Day}%`
                }
                return salesMarketRateCircleRate7Day
            }
        },
        shouTaoPeopleNumMarketRateCircleRate30Day: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "手淘人数市场占比环比（30天）",
            field: "shou_tao_people_num_market_rate_circle_rate_30day",
            get() {
                const shouTaoPeopleNumMarketRateCircleRate30Day = this.getDataValue("shouTaoPeopleNumMarketRateCircleRate30Day")
                if (shouTaoPeopleNumMarketRateCircleRate30Day && shouTaoPeopleNumMarketRateCircleRate30Day !== "0.00") {
                    return `${shouTaoPeopleNumMarketRateCircleRate30Day}%`
                }
                return shouTaoPeopleNumMarketRateCircleRate30Day
            }
        },
        salesMarketRateCircleRate30Day: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "坑市场占比环比（30天）",
            field: "sales_market_rate_circle_rate_30day",
            get() {
                const salesMarketRateCircleRate30Day = this.getDataValue("salesMarketRateCircleRate30Day")
                if (salesMarketRateCircleRate30Day && salesMarketRateCircleRate30Day !== "0.00") {
                    return `${salesMarketRateCircleRate30Day}%`
                }
                return salesMarketRateCircleRate30Day
            }
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
            field: "wan_xiang_tai_production_rate",
            get() {
                const wanXiangTaiProductionRate = this.getDataValue("wanXiangTaiProductionRate")
                if (wanXiangTaiProductionRate && wanXiangTaiProductionRate !== "0.00") {
                    return `${wanXiangTaiProductionRate}%`
                }
                return wanXiangTaiProductionRate
            }
        },
        feeRate: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: "0.00",
            primaryKey: false,
            autoIncrement: false,
            comment: "费用比例",
            field: "fee_rate",
            get() {
                const feeRate = this.getDataValue("feeRate")
                if (feeRate && feeRate !== "0.00") {
                    return `${feeRate}%`
                }
                return feeRate
            }
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
        }
    };
    const options = {
        tableName: "single_item_taobao",
        comment: "",
        indexes: []
    };
    const SingleItemTaobaoModel = sequelize.define("singleItemTaobaoModel", attributes, options);
    return SingleItemTaobaoModel;
};