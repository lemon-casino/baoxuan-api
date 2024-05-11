
const ChannengFenxiSumModel = require('../model/channengFenxiSum');
const RenshiRichangModel = require('../model/resumeResult');
const renshiRichangModel = require('../model/renshiRichang');
const sequelizeUtil = require("../utils/sequelizeUtil");
const {Sequelize, QueryTypes, Op} = require('sequelize');
const {query} = require("../model/init");
const getHrDepartment = async (startDate, endDate,) => {
    try {
        // 计算offset
        return await ChannengFenxiSumModel.sequelize.query(
            `
            WITH CalculatedValues AS (
                SELECT
                    cfs.section,cfs.matching_resume_volume AS matchingResumeVolume,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.number_preliminary_applicants, 0)) AS passTheFirstTest,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.number_of_re_examinations, 0)) AS passTheSecondExamination,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.offer_number, 0)) AS offer_number,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.attendance, 0)) AS startWorkThisMonth
                FROM
                    channeng_fenxi_sum cfs
                LEFT JOIN
                    renshi_richang rr ON rr.position LIKE CONCAT('%', cfs.keyword, '%')
                WHERE
                    rr.date BETWEEN :startDate AND :endDate
                GROUP BY
                    cfs.section,cfs.matching_resume_volume
            )
            SELECT
                section,
                SUM(matchingResumeVolume) As matchingResumeVolume,
                SUM(passTheFirstTest)AS passTheFirstTest,
                SUM(passTheSecondExamination)AS passTheSecondExamination,
                SUM(startWorkThisMonth) AS startWorkThisMonth,
                SUM(offer_number) AS offer_number,
                CONCAT(FORMAT(IF(SUM(passTheFirstTest) > 0, 100.0 * SUM(passTheSecondExamination) / SUM(passTheFirstTest), 0), 2), '%') AS secondTestPassRate
            FROM
                CalculatedValues
           GROUP BY
            section
        `, {
                replacements: {startDate, endDate},
                type: QueryTypes.SELECT
            }
        );
    } catch (error) {
        throw new Error('查询数据失败');
    }
};

const getHrQuarters = async (startDate, endDate) => {

    try {
        // 计算offset
        return await ChannengFenxiSumModel.sequelize.query(
            `
            WITH CalculatedValues AS (
                SELECT
                    cfs.keyword,cfs.matching_resume_volume AS matchingResumeVolume,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.number_preliminary_applicants, 0)) AS passTheFirstTest,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.number_of_re_examinations, 0)) AS passTheSecondExamination,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.offer_number, 0)) AS offer_number,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.attendance, 0)) AS startWorkThisMonth
                FROM
                    channeng_fenxi_sum cfs
                LEFT JOIN
                    renshi_richang rr ON rr.position LIKE CONCAT('%', cfs.keyword, '%')
                WHERE
                    rr.date BETWEEN :startDate AND :endDate
                GROUP BY
                    cfs.keyword,cfs.matching_resume_volume
            )
            SELECT
                keyword,
                SUM(matchingResumeVolume) AS matchingResumeVolume,
                SUM(passTheFirstTest) AS  passTheFirstTest,
                SUM(passTheSecondExamination) AS passTheSecondExamination,
                SUM(startWorkThisMonth) AS startWorkThisMonth,
                SUM(offer_number) AS offer_number,
                CONCAT(FORMAT(IF(SUM(passTheFirstTest) > 0, 100.0 * SUM(passTheSecondExamination) / SUM(passTheFirstTest), 0), 2), '%') AS secondTestPassRate
            FROM
                CalculatedValues
            GROUP BY
                keyword
        `, {
                replacements: {startDate, endDate},
                type: QueryTypes.SELECT
            }
        );
    } catch (error) {
        throw new Error('查询数据失败');
    }

};
const getMatching = async (startDate, endDate,) => {
    console.log(startDate, endDate);
    try {
        // 计算offset
        return await RenshiRichangModel.findAll({
                attributes: [
                    [Sequelize.literal(`SUBSTRING_INDEX(position, ' _', 1)`), 'position'],
                    ['keyword', 'keyword'],
                    ['number_resumes', 'numberResumes']
                ],
                where: {
                    date: {
                        $between: [startDate, endDate]
                    }
                }});
    } catch (error) {
        throw new Error('查询数据失败', error);
    }
};
const getPoProgressMap = async (startDate, endDate,) => {
    try {
        // 计算offset
        return await ChannengFenxiSumModel.sequelize.query(
            `            WITH CalculatedValues AS (
                SELECT
                    cfs.keyword,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.number_preliminary_applicants, 0)) AS passTheFirstTest,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.number_of_re_examinations, 0)) AS passTheSecondExamination,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.offer_number, 0)) AS offer_number,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.attendance, 0)) AS startWorkThisMonth
                FROM
                    channeng_fenxi_sum cfs
                LEFT JOIN
                    renshi_richang rr ON rr.position LIKE CONCAT('%', cfs.keyword, '%')
                WHERE
                    rr.date BETWEEN :startDate AND :endDate
                GROUP BY
                    cfs.keyword,cfs.matching_resume_volume
            )
            SELECT
                keyword AS position ,
                SUM(startWorkThisMonth) AS  attendance,
                CONCAT(FORMAT(IF(SUM(passTheFirstTest) > 0, 100.0 * SUM(passTheSecondExamination) / SUM(passTheFirstTest), 0), 2), '%') AS secondTestPassRate
            FROM
                CalculatedValues
            where startWorkThisMonth>0 
            GROUP BY
                keyword
            `, {
                replacements: {startDate, endDate},
                type: QueryTypes.SELECT
            }
        );
    } catch (error) {
        throw new Error('查询数据失败');
    }
};
const getHead = async (startDate, endDate,) => {
    try {
        // 计算offset
        return await ChannengFenxiSumModel.sequelize.query(
            `select  name AS position,  FORMAT(COALESCE(SUM(number_of_re_examinations) / NULLIF(SUM(number_preliminary_applicants), 0), 0) * 100,2) AS secondTestPassRate
     ,sum(attendance) AS attendance   from  renshi_richang  where date BETWEEN :startDate AND :endDate  group by  name;`, {
                replacements: {startDate, endDate},
                type: QueryTypes.SELECT
            }
        );
    } catch (error) {
        throw new Error('查询数据失败');
    }
};
const getOnboarding = async () => {
    try {
        return await renshiRichangModel.findAll({
            attributes: [
                [Sequelize.fn('sum', Sequelize.col('attendance')), 'attendance'], // Sum of attendance
                [Sequelize.fn('date_format', Sequelize.col('date'), '%m'), 'month'] // 时间
            ],
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date_format', Sequelize.col('date'), '%Y'), Sequelize.literal('YEAR(CURDATE())'))
                ]
            },
            group: [Sequelize.fn('date_format', Sequelize.col('date'), '%m')], //分组
            logging: true,
            raw: true
        });
        // return await renshiRichangModel.sequelize.query(
        //     `SELECT COALESCE(SUM(r.attendance), 0) AS attendance, m.date FROM (SELECT '01' AS date UNION ALL SELECT '02' UNION ALL SELECT '03' UNION ALL
        //             SELECT '04' UNION ALL SELECT '05' UNION ALL SELECT '06' UNION ALL
        //             SELECT '07' UNION ALL SELECT '08' UNION ALL  SELECT '09' UNION ALL
        //             SELECT '10' UNION ALL  SELECT '11' UNION ALL SELECT '12') AS m
        //             LEFT JOIN renshi_richang AS r ON DATE_FORMAT(r.date, '%m') = m.date
        //             GROUP BY m.date;`,
        // );



    } catch (error) {
        throw new Error('Failed to query onboarding data', error);
    }
};

const getInvert = async () => {
    try {
        return await renshiRichangModel.findAll({
            attributes: [
                [Sequelize.literal(`FORMAT(COALESCE(SUM(number_of_re_examinations) / NULLIF(SUM(number_preliminary_applicants), 0), 0) * 100, 2)`), 'attendance'],
                [Sequelize.fn('date_format', Sequelize.col('date'), '%m'), 'month'] // 时间
            ],
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date_format', Sequelize.col('date'), '%Y'), Sequelize.literal('YEAR(CURDATE())'))
                ]
            },
            group: [Sequelize.fn('date_format', Sequelize.col('date'), '%m')], //分组
            logging: true,
            raw: true
        });




    } catch (error) {
        throw new Error('Failed to query onboarding data', error);
    }
};

const getRecommend = async () => {
    try {
        return await ChannengFenxiSumModel.findAll({
            attributes: [
                [Sequelize.fn('sum', Sequelize.col('matching_resume_volume')), 'attendance'], // Sum of attendance
                [Sequelize.fn('date_format', Sequelize.col('date'), '%m'), 'month'] // 时间
            ],
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date_format', Sequelize.col('date'), '%Y'), Sequelize.literal('YEAR(CURDATE())'))
                ]
            },
            group: [Sequelize.fn('date_format', Sequelize.col('date'), '%m')], //分组
            logging: true,
            raw: true
        });




    } catch (error) {
        throw new Error('Failed to query onboarding data', error);
    }
};

const getHrRecruitment = async (startDate, endDate,) => {
    try {
        // 计算offset
        return await ChannengFenxiSumModel.sequelize.query(
            `            WITH CalculatedValues AS (
                SELECT
                    cfs.keyword, cfs.target_number_demand, cfs.target_completions,cfs.rate_of_completion,cfs.matching_resume_volume,cfs.amount_invitation ,cfs.area_reach ,cfs.second_test_pass_rate,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.number_preliminary_applicants, 0)) AS passTheFirstTest,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.number_of_re_examinations, 0)) AS passTheSecondExamination,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.offer_number, 0)) AS offer_number,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.attendance, 0)) AS startWorkThisMonth
                FROM
                    channeng_fenxi_sum cfs
                LEFT JOIN
                    renshi_richang rr ON rr.position LIKE CONCAT('%', cfs.keyword, '%')
                WHERE
                    rr.date BETWEEN :startDate AND :endDate
                GROUP BY
                    cfs.keyword,cfs.target_number_demand,target_completions,rate_of_completion,second_test_pass_rate,matching_resume_volume,amount_invitation,area_reach
            )
            SELECT
                keyword AS position ,
                SUM(target_number_demand) AS targetNumberDemand,
                SUM(target_completions) AS target_completions,
                CONCAT(FORMAT(IF(SUM(rate_of_completion) > 0, SUM(rate_of_completion), 0), 2), '%') AS rateOfCompletion,
                SUM(passTheFirstTest) AS passTheFirstTest,
                SUM(passTheSecondExamination) AS passTheSecondExamination,
                SUM(startWorkThisMonth) AS startWorkThisMonth,
                SUM(second_test_pass_rate) AS secondTestPassRate,
                SUM(matching_resume_volume) AS matchingResumeVolume,
                SUM(amount_invitation) AS amountInvitation,
                CONCAT(FORMAT(IF(SUM(passTheSecondExamination) > 0, 100.0 * SUM(startWorkThisMonth) / SUM(passTheSecondExamination), 0), 2), '%') AS conversionRate,
                 SUM(area_reach) AS areaReach,
                 CONCAT(FORMAT(IF(SUM(passTheFirstTest) > 0, 100.0 * SUM(passTheSecondExamination) / SUM(passTheFirstTest), 0), 2), '%') AS secondTestPassRate
            FROM
                CalculatedValues
            GROUP BY
                keyword
                `, {
                replacements: {startDate, endDate},
                type: QueryTypes.SELECT
            }
        );
    } catch (error) {
        throw new Error('查询数据失败');
    }
};
module.exports = {
    getHrDepartment,
    getHrQuarters,
    getPoProgressMap,
    getHead,
    getMatching,
    getOnboarding,
    getInvert,
    getRecommend,
    getHrRecruitment
};