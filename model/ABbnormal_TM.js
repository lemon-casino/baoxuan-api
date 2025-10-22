const {
    DataTypes
} = require('sequelize');

module.exports = sequelize => {
    const attributes = {
        id: {
            type: DataTypes.STRING(100),
            allowNull: true,
            primaryKey: true,
            field: 'id'
        },
        linkId: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'link_id'
        },
        new_16_30: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'new_16_30'
        },
        new_30_60: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'new_30_60'
        },
        old: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'old'
        },
        negative_profit_60: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'negative_profit_60'
        },
        date: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'date'
        },
        create_time: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'create_time'
        }
    };
    const options = {
        tableName: "abnormal_tm",
        comment: "",
        indexes: [],
        charset: 'utf8',
        rowFormat: 'DYNAMIC'
    };
    return sequelize.define("ABbnormal_TM", attributes, options);
};
