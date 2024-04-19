// tm_video.js   天猫的视频数据模型
const Sequelize = require('sequelize');
const sequelize = require('./init'); // Ensure the connection is properly set up as in your Users model

const TMVideoModel = sequelize.define('tmall_short_video_tm', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    publish_content: Sequelize.INTEGER,
    number_common_domain_contents: Sequelize.INTEGER,
    number_transactions_planting_grass: Sequelize.INTEGER,
    transaction_amount_planting_grass: Sequelize.DECIMAL(10, 2),
    payment: Sequelize.DECIMAL(10, 2),
    percentage_of_sales: Sequelize.DECIMAL(10, 2),
    date: Sequelize.DATEONLY,
    create_time: Sequelize.DATE
}, {
    tableName: 'tmall_short_video_tm' // 指定表名
});

module.exports = TMVideoModel;
