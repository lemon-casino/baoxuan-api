const TM_SHOP = require('../model/tm_shop');
const LIVE_DATA = require('../model/tm_zhibo');
const sequelizeUtil = require("../utils/sequelizeUtil");
const {Sequelize} = require('sequelize');
const getVideosByDateRange = async (start_endDate, page, pageSize) => {
    try {
        // 计算offset
        const offset = (page - 1) * pageSize;
        // 根据日期范围查询店铺数据，并进行分页
        //
        return await TM_SHOP.findAndCountAll({
            attributes: [
                [Sequelize.literal(`CONCAT(FORMAT(customer_satisfaction, 2), '%')`), 'customer_satisfaction'],
                [Sequelize.literal(`CONCAT(FORMAT(24h_receiving_rate, 2), '%')`), '24h_receiving_rate'],
                [Sequelize.literal('ranking'), 'ranking'],
                [Sequelize.literal('amount_paid'), 'amount_paid'],
                [Sequelize.literal('shop_violation'), 'shop_violation'],
                [Sequelize.literal('shop_penalty'), 'shop_penalty'],
                [Sequelize.literal('false_shipment_rate'), 'false_shipment_rate'],
                [Sequelize.literal('number_store_members'), 'number_store_members'],
                [Sequelize.literal('number_new_members'), 'number_new_members'],
            ],
            where: {
                date: {
                    $between: start_endDate
                }
            },
            offset: offset,
            limit: Number(pageSize)
        });
    } catch (error) {
        throw new Error('查询店铺数据失败');
    }
};

module.exports = {
    getVideosByDateRange
};