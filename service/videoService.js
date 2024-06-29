const TMVideoModel = require('../model/tm_video');
const LIVE_DATA = require('../model/tm_zhibo');
const sequelizeUtil = require("../utils/sequelizeUtil");
const { Sequelize } = require('sequelize');
const getVideosByDateRange = async (start_endDate) => {
    try {
        //  根据日期范围查询视频数据 列数据相加 日期范围

        return  await TMVideoModel.findOne(
            {
                attributes: [
                    [Sequelize.fn('sum', Sequelize.col('publish_content')), 'total_common_publish_content'],
                    [Sequelize.fn('sum', Sequelize.col('number_common_domain_contents')), 'total_common_domain_contents'],
                    [Sequelize.fn('sum', Sequelize.col('number_transactions_planting_grass')), 'total_transactions_planting_grass'],
                    [Sequelize.fn('sum', Sequelize.col('transaction_amount_planting_grass')), 'total_transaction_amount'],
                    [Sequelize.fn('sum', Sequelize.col('payment')), 'total_payment'],
                    [Sequelize.fn('sum', Sequelize.col('percentage_of_sales')), 'total_sales']
                ],
                where: {
                    date: {
                        $between: start_endDate
                    }
                }
            }
        );
    } catch (error) {
        throw new Error('查询视频数据失败');
    }
};


const getzhiboByDateRange = async (start_endDate) => {
    try {
        console.log(start_endDate)
        //  根据日期范围查询视频数据 列数据相加 日期范围
        return await LIVE_DATA.findOne(
            {
                attributes: [
                    [Sequelize.fn('sum', Sequelize.col('viewership')), 'total_viewership'],
                    [Sequelize.fn('sum', Sequelize.col('transaction_amount')), 'total_transaction_amount'],
                    [Sequelize.fn('sum', Sequelize.col('per_capita_viewing_time')), 'total_per_capita_viewing_time'],
                    [Sequelize.fn('sum', Sequelize.col('percentage_of_sales')), 'total_percentage_of_sales']
                ],
                where: {
                    date: {
                        $between: start_endDate
                    }
                }
            }
        );
    } catch (error) {
        throw new Error('查询直播数据失败');
    }
};
module.exports = {
    getVideosByDateRange,
    getzhiboByDateRange
};