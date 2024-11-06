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
    const batchSize = 1000; // 每批次更新的条数
    let offset = 0;         // 偏移量
    const maxRetries = 3;   // 设置最大重试次数
    let attempt = 0;        // 当前重试次数

    // 重试机制，处理死锁
    while (true) {
        const queryBatch = `
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
            LIMIT ${batchSize} OFFSET ${offset}
        ) AS subquery
        ON today.id = subquery.id
        SET today.flux = subquery.flux
        WHERE DATE(today.report_time) = DATE(CURDATE()) - INTERVAL 1 DAY;
        `;

        try {
            await JDDailyReport.sequelize.query(queryBatch, {
                type: QueryTypes.UPDATE,
                logging: true
            });
            console.log(`Flux updated successfully for batch starting at offset ${offset}`);
            offset += batchSize;  // 更新偏移量，处理下一批次
        } catch (error) {
            if (error.code === 'ER_LOCK_DEADLOCK') {
                attempt++;
                console.log(`死锁错误，重试第${attempt}次...`);
                if (attempt >= maxRetries) {
                    console.error('重试次数已达到上限，操作失败');
                    break;
                }
            } else {
                console.error('Error updating flux:', error);
                break;  // 遇到其他错误则直接终止
            }
        }

        // 如果当前批次更新的记录数小于批量大小，说明已完成所有更新，退出循环
        if (offset === 0 || await isUpdateComplete(offset, batchSize)) {
            console.log('所有数据已更新');
            break;
        }
    }
}

// 判断当前批次是否更新完成（即返回的记录数小于批量大小）
async function isUpdateComplete(offset, batchSize) {
    const countQuery = `
    SELECT COUNT(*)
    FROM jd_daily_report AS today
    JOIN (
        SELECT
            today.id
        FROM
            jd_daily_report AS today
        JOIN
            jd_daily_report AS yesterday
        ON
            today.sku = yesterday.sku
          AND DATE(yesterday.report_time) = DATE(today.report_time) - INTERVAL 1 DAY
        LIMIT ${batchSize} OFFSET ${offset}
    ) AS subquery
    ON today.id = subquery.id
    WHERE DATE(today.report_time) = DATE(CURDATE()) - INTERVAL 1 DAY;
    `;

    const result = await JDDailyReport.sequelize.query(countQuery, {
        type: QueryTypes.SELECT
    });

    return result[0]['COUNT(*)'] < batchSize; // 如果返回的记录数少于批量大小，说明更新完成
}



module.exports = {
    inquiryTodayjdDailyReport,
    updateFluxForYesterday
}