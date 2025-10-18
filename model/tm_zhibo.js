// tm_video.js   天猫的视频数据模型
const Sequelize = require('sequelize');
const sequelize = require('./init'); // Ensure the connection is properly set up as in your Users model

const LIVE_DATA = sequelize.define('live_data', {
    id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        primaryKey: true
    },
    viewership: Sequelize.INTEGER,
    transaction_amount_planting_grass: Sequelize.DECIMAL(10, 2),
    per_capita_viewing_time: Sequelize.INTEGER,
    percentage_of_sales: Sequelize.DECIMAL(10, 4),
    date: Sequelize.DATEONLY,
    create_time: Sequelize.DATE
}, {
    tableName: 'live_data' // 指定表名
});

module.exports = LIVE_DATA;
