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
    const batchSize = 100; // 每批次更新的条数
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

const  updateWeeklyTrafficChange = async () => {
    const getDateString = (daysAgo) => new Date(new Date().setDate(new Date().getDate() - daysAgo)).toISOString().slice(0, 10);

    const seven = getDateString(7);
    const one = getDateString(1);
    const fourteen = getDateString(14);
    const eight = getDateString(8);

    const query = `
    SELECT
        weekly_data.code,
        weekly_data.last_week_visitors,
        weekly_data.current_week_visitors,
        ROUND(
            IF(
                weekly_data.last_week_visitors = 0,
                0,
                (weekly_data.current_week_visitors - weekly_data.last_week_visitors) / NULLIF(weekly_data.last_week_visitors, 0)*100
            ),
            2
        ) AS traffic_change_percentage
    FROM (
        SELECT
            current_monday.code,
            SUM(IF(current_monday.report_time BETWEEN  `+"'"+fourteen+"'"+`  AND  `+"'"+eight +"'"+`, current_monday.visitors, 0)) AS last_week_visitors,
            SUM(IF(current_monday.report_time BETWEEN `+"'"+seven+"'"+` AND `+"'"+one+"'"+`, current_monday.visitors, 0)) AS current_week_visitors
        FROM
            jd_daily_report AS current_monday
        GROUP BY
            current_monday.code
    ) AS weekly_data;
    `;

    return JDDailyReport.sequelize.query(query, {
        type: QueryTypes.SELECT,
        logging:false
    });
}

const updateWeeklyTraffic = async (weeklist) => {
    console.log(weeklist)
    for (const item of weeklist) {
        await JDDailyReport.update(
            { weeklyTraffic: item.traffic_change_percentage },
            {
                where: {
                    code: item.code,
                    createdAt: new Date()
                }
            }
        );
    }

}

// 更新周利润 周利润率
 const updateWeeklyProfit = async () => {
    // 查看上周的数据 利润综合
    const getDateString = (daysAgo) => new Date(new Date().setDate(new Date().getDate() - daysAgo)).toISOString().slice(0, 10);
    const seven = getDateString(7);
    const one = getDateString(1);

   const  list =await  JDDailyReport.findAll(
        {
            attributes: ['code', [fn('SUM', col('profit')), 'weeklyProfit'], [fn('SUM', col('transaction_amount')), 'transactionAmount']],
            where: {
                reportTime: {
                    [Op.between]: [seven, one]
                }
            },
            group: ['code'],
            logging:true,
            raw:true
        }
    )
     for (const listElement of list) {
       await JDDailyReport.update(
             {weeklyProfit: listElement.weeklyProfit},
             {
                 where: {
                     code: listElement.code,
                     reportTime: one
                 },
                 logging:true
             }
         );
         // 更新周利润率
         await JDDailyReport.update(
             {weeklyProfitMargin: listElement.transactionAmount === 0 ? 0 : (listElement.weeklyProfit / listElement.transactionAmount) * 100},
             {
                 where: {
                     code: listElement.code,
                     reportTime: one
                 },
                 logging:true
             }
         );
     }
    
}


module.exports = {
    inquiryTodayjdDailyReport,
    updateFluxForYesterday,
    updateWeeklyTrafficChange,
    updateWeeklyTraffic,
    updateWeeklyProfit
}