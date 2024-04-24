// tm_video.js   天猫的视频数据模型
const Sequelize = require('sequelize');
const sequelize = require('./init'); // Ensure the connection is properly set up as in your Users model

const TM_SHOP = sequelize.define('store_data_tm', {
    // 店铺id
    id: {

        type: Sequelize.STRING(255),
        //        allowNull: false, 的意思是  不允许为空
        allowNull: false,
        //primaryKey: true,  的意思是  主键
        primaryKey: true,
        //        autoIncrement: true 的作用是  自动递增
        autoIncrement: false
    },
    //时间
    date: Sequelize.DATEONLY,
    // 排名
    ranking: Sequelize.INTEGER,
    //支付金额
    amount_paid: Sequelize.DECIMAL(10, 2),
    //店铺违规
    shop_violation: Sequelize.INTEGER,
    //店铺罚款金额
    shop_penalty: Sequelize.DECIMAL(10, 2),
    //客户满意度
    customer_satisfaction: Sequelize.DECIMAL(10, 10),
    //false_shipment_rate 虚假发货量 decimal(10, 4)
    false_shipment_rate: Sequelize.DECIMAL(10, 4),
    //店铺会员数量
    number_store_members: Sequelize.INTEGER,
    //新增会员数量
    number_new_members: Sequelize.INTEGER,
    //24h揽收及时率
    '24h_receiving_rate': Sequelize.DECIMAL(10, 4),
    //create_time  datetime
    create_time: Sequelize.DATE
}, {
    tableName: 'store_data_tm' // 指定表名
});

module.exports = TM_SHOP;
