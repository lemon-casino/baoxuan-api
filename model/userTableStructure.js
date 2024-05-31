const {
    DataTypes
} = require('sequelize');
const sequelize = require("./init");
module.exports = sequelize.define('userTableStructureModel', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: "id"
    },
    userId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "user_id"
    },
    field: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "field"
    },
    fixed: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "fixed"
    },
    width: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "width"
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "title"
    },
    editRender: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "editRender"
    },
    visible: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: "1",
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "visible"
    },
    version: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "editRender_version"
    },
    editable: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: "1",
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "editable"
    },
}, {
    tableName: "user_table_structure",
    comment: "",
    indexes: []
});
