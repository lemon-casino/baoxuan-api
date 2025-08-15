const {
    DataTypes
} = require('sequelize');
module.exports = sequelize => {
    const attributes = {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: null,
            primaryKey: true,
            autoIncrement: true,
            comment: null,
            field: "id"
        },
        goodsId: {
            type: DataTypes.STRING(32),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "goods_id"
        },
        linkAttribute: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "link_attribute"
        },
        importantAttribute: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "important_attribute"
        },
        goodsName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "goods_name"
        },
        briefName: {
            type: DataTypes.STRING(64),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "brief_name"
        },
        lineDirector: {
            type: DataTypes.STRING(32),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "line_director"
        },
        operator: {
            type: DataTypes.STRING(32),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "operator"
        },
        purchaseDirector: {
            type: DataTypes.STRING(32),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "purchase_director"
        },
        maintenanceLeader: {
            type: DataTypes.STRING(30),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: ";维护负责人",
            field: "maintenance_leader"
        },
        targets: {
            type: DataTypes.STRING(32),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "targets"
        },
        profitTarget: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "profit_target"
        },
        searchTarget: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "search_target"
        },
        pitTarget: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "pit_target"
        },
        onsaleDate: {
            type: DataTypes.STRING(64),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "onsale_date"
        },
        firstCategory: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "first_category"
        },
        secondCategory: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "second_category"
        },
        goodsLine1: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "goods_line1"
        },
        goodsLine2: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "goods_line2"
        },
        createTime: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "create_time"
        },
        updateTime: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "update_time"
        },
        deptId: {
            type: DataTypes.STRING(30),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "部门id",
            field: "dept_id"
        },
        deptName: {
            type: DataTypes.STRING(30),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "dept_name"
        },
        skuId: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: ";",
            field: "sku_id"
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: ";编码",
            field: "code"
        },
        costPrice: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: ";成本价",
            field: "cost_price"
        },
        supplyPrice: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: ";供货价",
            field: "supply_price"
        },
        level3Category: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: ";三级类目",
            field: "level_3_category"
        },
        shopName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: ";店铺名称",
            field: "shop_name"
        },
        platform: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: ";平台",
            field: "platform"
        },
        visitorTarget: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: "0",
            primaryKey: false,
            autoIncrement: false,
            comment: ";商品访客目标",
            field: "visitor_target"
        },
        exploitDirector: {
            type: DataTypes.STRING(30),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: ";开发负责人",
            field: "exploit_director"
        },
        userDef1: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "userDef1"
        },
        userDef2: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "userDef2"
        },
        userDef3: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "userDef3"
        },
        userDef4: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: ";",
            field: "userDef4"
        },
        userDef5: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: ";",
            field: "userDef5"
        },
        userDef6: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: ";",
            field: "userDef6"
        },
        userDef7: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: ";",
            field: "userDef7"
        },
        userDef8: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: ";",
            field: "userDef8"
        },
        userDef9: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: ";",
            field: "userDef9"
        },
        userDef10: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: ";",
            field: "userDef10"
        },
        briefProductLine: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "产品线简称",
            field: "brief_product_line"
        },
        productDefinition: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "产品定义",
            field: "product_definition"
        },
        stockStructure: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "库存结构",
            field: "stock_structure"
        },
        productRank: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "产品等级",
            field: "product_rank"
        },
        productDesignAttr: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "产品设计属性",
            field: "product_design_attr"
        },
        seasons: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "季节",
            field: "seasons"
        },
        brand: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "品牌",
            field: "brand"
        },
        lineManager: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "产品线管理人",
            field: "line_manager"
        },
        IsPriceComparison: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: '否',
            primaryKey: false,
            autoIncrement: false,
            comment: "是否比价链接",
            field: "is_price_comparison"
        },
        VolumeTarget: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "体量目标",
            field: "volume_target"
        },
        ProductStage: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "产品阶段",
            field: "product_stage"
        },
        Play: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "玩法",
            field: "play"
        },
        IsCirculation: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "是否流转",
            field: "is_circulation"
        },
        LinkState: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "链接状态",
            field: "link_state"
        }
    };
    const options = {
        tableName: "dianshang_operation_attribute",
        comment: "",
        indexes: []
    };
    const DianshangOperationAttributeModel = sequelize.define("dianshangOperationAttributeModel", attributes, options);
    return DianshangOperationAttributeModel;
};