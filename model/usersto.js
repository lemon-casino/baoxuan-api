const Sequelize = require('sequelize');
const sequelize = require('./init'); // Ensure the connection is properly set up as in your Users model

module.exports = sequelize.define('users', {
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: null,
        primaryKey: true,
        autoIncrement: true,
        comment: "id唯一字段",
        field: "user_id"
    },
    username: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "用户名",
        field: "username"
    },
    dingdingUserId: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "钉钉用户id",
        field: "dingding_user_id"
    }

}, {
    tableName: 'users' // 指定表名
});


