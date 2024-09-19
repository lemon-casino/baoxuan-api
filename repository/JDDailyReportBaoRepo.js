const Sequelize = require("sequelize")
const sequelize = require('../model/init');
const {QueryTypes, Op,col,fn, literal} = require("sequelize");
const getJDDailyReport = require("../model/jdDailyReport")
const JDDailyReport = getJDDailyReport(sequelize)





const inquiryTodayjdDailyReport = async () => {

    return  JDDailyReport.findAll({
        where: {
            reportTime:
                {
                    [Op.gte]: fn('DATE_SUB', fn('CURDATE'), literal('INTERVAL 1 DAY'))
                }
        },
        logging:true,
        raw:true
    })
}


async function updateFluxForYesterday() {
    const query = `
    UPDATE jd_daily_report AS today
    JOIN (
        SELECT
            today.id,
            today.sku,
            today.visitors AS today_visitors,
            yesterday.visitors AS yesterday_visitors,
            IF(yesterday.visitors = 0, NULL, ROUND((yesterday.visitors - today.visitors) / yesterday.visitors * 100, 2)) AS flux
        FROM
            jd_daily_report AS today
        JOIN
            jd_daily_report AS yesterday
        ON
            today.sku = yesterday.sku
          AND DATE(yesterday.report_time) = DATE(today.report_time) - INTERVAL 1 DAY
    ) AS subquery
    ON today.id = subquery.id
    SET today.flux = subquery.flux
    WHERE DATE(today.report_time) = DATE(CURDATE()) - INTERVAL 1 DAY;
  `;

    try {
        await JDDailyReport.sequelize.query(query, {
            type: QueryTypes.UPDATE,
            logging: true
        });
        console.log('Flux updated successfully');
    } catch (error) {
        console.error('Error updating flux:', error);
    }
}


module.exports = {
    inquiryTodayjdDailyReport,
    updateFluxForYesterday
}