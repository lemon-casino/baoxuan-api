const sequelize = require('../model/init');
const gettmallCompetitorModel = require("../model/tmallCompetitor");
const {Sequelize,QueryTypes} = require("sequelize");
const tmallCompetitorModel = gettmallCompetitorModel(sequelize);

const uploadSingleIteTaoBaoCompetitorTable = async (data) => {
    // 批量插入数据  忽略重复数据
    try {

        const  install=await tmallCompetitorModel.bulkCreate(data);
        await updateWeeklyAndMonthlyMetrics();
        return install;
    } catch (e) {
        console.error('向 tmallCompetitorModel 插入数据时出错：', e);
        throw e; // 记录错误后重新抛出错误
    }
};



const updateWeeklyAndMonthlyMetrics = async () => {
    const today = new Date();

    // 检查是否需要更新周环比（每周一）
    if (today.getDay() === 1) { // 0 是周日，1 是周一
        await updateWeeklyMonthOnMonth();
    }

    // 检查是否需要更新月环比（每月的第一天）
    if (today.getDate() === 1) {
        await updateMonthlyMonthOnMonth();
    }
};
// 周环比 每周一更新
const updateWeeklyMonthOnMonth = async () => {
    // 构建更新 SQL 语句
    const updateSql = `
        UPDATE tmall_competitor AS st
        JOIN (
            SELECT
                link_id,
                (SUM(CASE WHEN date BETWEEN CURDATE() - INTERVAL 7 DAY AND CURDATE() - INTERVAL 1 DAY THEN number_searches ELSE 0 END) -
                 SUM(CASE WHEN date BETWEEN CURDATE() - INTERVAL 14 DAY AND CURDATE() - INTERVAL 8 DAY THEN number_searches ELSE 0 END)) /
                 NULLIF(SUM(CASE WHEN date BETWEEN CURDATE() - INTERVAL 14 DAY AND CURDATE() - INTERVAL 8 DAY THEN number_searches ELSE 0 END), 0)
                 AS month_on_month
            FROM
                tmall_competitor
            WHERE
                date <= CURDATE() - INTERVAL 1 DAY
            GROUP BY link_id
        ) AS calc
        ON st.link_id = calc.link_id
        SET st.month_on_month = calc.month_on_month
        WHERE st.date = CURDATE()
          AND DAYOFWEEK(CURDATE()) = 2;
    `;

    try {
        // 执行更新操作
        await tmallCompetitorModel.sequelize.query(updateSql, {
            type: QueryTypes.UPDATE
        });
        console.log("周环比更新成功。");
    } catch (e) {
        console.error('更新周环比时出错：', e);
        throw e; // 记录错误后重新抛出错误
    }
};


const updateMonthlyMonthOnMonth = async () => {
    // 构建更新 SQL 语句
    const updateSql = `
        UPDATE tmall_competitor AS st
        JOIN (
            SELECT
                link_id,
                (
                    SUM(IF(date BETWEEN CURDATE() - INTERVAL (DAY(CURDATE()) - 1) DAY - INTERVAL 1 MONTH AND CURDATE() - INTERVAL (DAY(CURDATE())) DAY, number_searches, 0)) -
                    SUM(IF(date BETWEEN CURDATE() - INTERVAL (DAY(CURDATE()) - 1) DAY - INTERVAL 2 MONTH AND CURDATE() - INTERVAL (DAY(CURDATE()) - 1) DAY - INTERVAL 1 MONTH, number_searches, 0))
                ) / NULLIF(
                    SUM(IF(date BETWEEN CURDATE() - INTERVAL (DAY(CURDATE()) - 1) DAY - INTERVAL 2 MONTH AND CURDATE() - INTERVAL (DAY(CURDATE()) - 1) DAY - INTERVAL 1 MONTH, number_searches, 0)), 0
                ) AS month_on_month
            FROM
                tmall_competitor
            WHERE
                date <= CURDATE() - INTERVAL 1 DAY
            GROUP BY
                link_id
        ) AS calc
        ON st.link_id = calc.link_id
        SET
            st.month_on_month = calc.month_on_month
        WHERE
            st.date = CURDATE()
            AND DAYOFMONTH(CURDATE()) = 1;
    `;

    try {
        // 执行更新操作
        await tmallCompetitorModel.sequelize.query(updateSql, {
            type: QueryTypes.UPDATE
        });
        console.log("月环比更新成功。");
    } catch (e) {
        console.error('更新月环比时出错：', e);
        throw e;
    }
};


const searchSingleIteTaoBaoCompetitorTable = async (searchParams, page, pageSize) => {
    try {
        const offset = (page - 1) * pageSize;
        const { count, rows } = await tmallCompetitorModel.findAndCountAll({
            where: searchParams,
            offset: offset,
            limit: pageSize,
            raw: true,
            logging: true
        });

        return {
            total: count,
            data: rows
        };
    } catch (e) {
        throw e;
    }
};
const conditionalFiltering = async () => {
    try {
        return await tmallCompetitorModel.findAll({
            attributes: [
                'link_id',
                'headOf_operations',
                'headOf_productLine',
                'store_name',
                'competitors_name',
                'competitor_id',
            ],
            group: [
                'link_id',
                'headOf_operations',
                'headOf_productLine',
                'store_name',
                'competitors_name',
                'competitor_id'
            ],
            raw: true,
            logging: true
        });
    } catch (e) {
        throw e;
    }
};


module.exports = {
    uploadSingleIteTaoBaoCompetitorTable,
    searchSingleIteTaoBaoCompetitorTable,
    conditionalFiltering
};
