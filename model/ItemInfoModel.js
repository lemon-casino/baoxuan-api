
const Sequelize = require("sequelize");
module.exports = sequelize => {
    const attributes = {

        itemId: {
            type: Sequelize.STRING,
            primaryKey: true,
            autoIncrement: true,
            comment: "itemId",
            field: "itemId"
        },
    linkAttribute2: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "链接属性2",
        field: "链接属性2"
    },
    productLine: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "产品线",
        field: "产品线"
    },
    abbreviation: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "简称",
        field: "简称"
    },
    headOfProductLine: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "产品线负责人",
        field: "产品线负责人"
    },
    maintainers: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "维护人",
        field: "维护人"
    },
    headOfPurchasing: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "采购负责人",
        field: "采购负责人"
    },
    listingDate: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "上架日期",
        field: "上架日期"
    },
    firstLevelCategories: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "一级类目",
        field: "一级类目"
    },
    secondaryCategories: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "二级类目",
        field: "二级类目"
    },
    productLine1: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "产品线1",
        field: "产品线1"
    },
    productLine2: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "产品线2",
        field: "产品线2"
    },
    nature1: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "性质1",
        field: "性质1"
    },
    nature2: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "性质2",
        field: "性质2"
    },
    searchForATarget: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "搜索目标",
        field: "搜索目标"
    },
    pitProductionGoals: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "坑产目标",
        field: "坑产目标"
    },
    executor: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "执行人",
        field: "执行人"
    }
};
    const options = {
        tableName: 'item_info',
        charset: 'utf8',
        dialectOptions: {
            collate: 'utf8_general_ci'
        },
        timestamps: false
    }
    return sequelize.define("ItemInfoModel", attributes, options);
};


