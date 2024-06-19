const ChannengFenxiSumModel = require('../model/channengFenxiSum');
const RenshiRichangModel = require('../model/resumeResult');
const renshiRichangModel = require('../model/renshiRichang');
const sequelizeUtil = require("../utils/sequelizeUtil");
const {Sequelize, QueryTypes, Op} = require('sequelize');
const {query} = require("../model/init");
const getZaiZhiRen = require("../model/zaiZhiRen")
const sequelize = require("../model/init");
const ZaiZhiRen = getZaiZhiRen(sequelize)
const getHrDepartment = async (startDate, endDate,) => {
    try {
        // 计算offset
        return await ChannengFenxiSumModel.sequelize.query(
            `  WITH CalculatedValues AS (
                SELECT
                    section,max(matching_resume_volume) AS matching_resume_volume,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.number_preliminary_applicants, 0)) AS passTheFirstTest,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.number_of_re_examinations, 0)) AS passTheSecondExamination,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.offer_number, 0)) AS offer_number,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.attendance, 0)) AS startWorkThisMonth
                FROM (
                     select  section, max(cfs.matching_resume_volume) AS matching_resume_volume ,   cfs.keyword AS keyword FROM  channeng_fenxi_sum cfs
                                          group by section,  keyword
                     ) AS  cfs
                LEFT JOIN
                    renshi_richang rr ON rr.position LIKE CONCAT('%', cfs.keyword, '%')
                WHERE
                    rr.date BETWEEN :startDate AND :endDate
                GROUP BY
                    cfs.section
            )
            SELECT
                section,
                matching_resume_volume As matchingResumeVolume,
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
                    keyword,max(matching_resume_volume) AS matching_resume_volume,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.number_preliminary_applicants, 0)) AS passTheFirstTest,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.number_of_re_examinations, 0)) AS passTheSecondExamination,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.offer_number, 0)) AS offer_number,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.attendance, 0)) AS startWorkThisMonth
                FROM (
                     select  section, max(cfs.matching_resume_volume) AS matching_resume_volume ,   cfs.keyword AS keyword FROM  channeng_fenxi_sum cfs
                                          group by section,  keyword
                     ) AS  cfs
                LEFT JOIN
                    renshi_richang rr ON rr.position LIKE CONCAT('%', cfs.keyword, '%')
                WHERE
                    rr.date BETWEEN :startDate AND :endDate
                GROUP BY
                    cfs.keyword
            )
            SELECT
                keyword,
                matching_resume_volume As matchingResumeVolume,
                SUM(passTheFirstTest)AS passTheFirstTest,
                SUM(passTheSecondExamination)AS passTheSecondExamination,
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
            }
        });
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
            //                    WHERE
            //                     rr.date BETWEEN :startDate AND :endDate
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
     ,sum(attendance) AS attendance   from  renshi_richang    group by  name;`, {
                replacements: {startDate, endDate},
                logging: false,
                type: QueryTypes.SELECT
            }
            //     where date BETWEEN :startDate AND :endDate
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
            logging: false,
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
            logging: false,
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
            logging: false,
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
            `    
             WITH CalculatedValues AS (
                SELECT
                   MAX(cfs.target_number_demand) AS target_number_demand ,
                   cfs.keyword,
                   MAX(cfs.amount_invitation) AS amount_invitation,
                   MAX(cfs.target_completions) AS target_completions ,
                    MAX(cfs.matching_resume_volume) AS matching_resume_volume,
                    MAX(rate_of_completion) AS rate_of_completion,
                    SUM(second_test_pass_rate) AS second_test_pass_rate,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.number_preliminary_applicants, 0)) AS passTheFirstTest,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.number_of_re_examinations, 0)) AS passTheSecondExamination,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.offer_number, 0)) AS offer_number,
                    SUM(IF(rr.position LIKE CONCAT('%', cfs.keyword, '%'), rr.attendance, 0)) AS startWorkThisMonth,
                    MAX(area_reach) AS area_reach
                FROM
                   (select  keyword,   SUM(rate_of_completion) AS rate_of_completion,
                   SUM(amount_invitation) AS amount_invitation,
                   MAX(target_number_demand) target_number_demand,
                             MAX(cfs.target_completions) target_completions,
                             max(cfs.matching_resume_volume) AS matching_resume_volume ,
                            SUM(second_test_pass_rate) AS second_test_pass_rate,
                             SUM(area_reach) AS area_reach
                              FROM  channeng_fenxi_sum cfs
                                          group by   keyword
                     ) AS  cfs
                LEFT JOIN
                    renshi_richang rr ON rr.position LIKE CONCAT('%', cfs.keyword, '%')
                WHERE
                    rr.date BETWEEN :startDate AND :endDate
                GROUP BY
                    cfs.keyword
            )
            SELECT
                keyword AS position ,
                MAX(amount_invitation) AS amountInvitation,
                MAX(target_number_demand) AS targetNumberDemand,
                MAX(target_completions) AS target_completions,
                MAX(matching_resume_volume) AS matchingResumeVolume,
                  CONCAT(FORMAT(IF(SUM(rate_of_completion) > 0, SUM(rate_of_completion), 0), 2), '%') AS rateOfCompletion,
                SUM(passTheFirstTest) AS passTheFirstTest,
                SUM(passTheSecondExamination) AS passTheSecondExamination,
                SUM(startWorkThisMonth) AS startWorkThisMonth,
                SUM(second_test_pass_rate) AS secondTestPassRate,
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

const employeeManagement = async (page, pageSize, quarters, department) => {
    try {
        // const where = {date: {$between: [startDateTime, endDateTime]}}
        const where = {
            name: {[Op.notLike]: '机器人'}
        };

        if (quarters) {
            where.position = quarters
        }
        if (department) {
            where.section = department
        }

        const offset = (page - 1) * pageSize;
        return await ZaiZhiRen.findAndCountAll(
            {
                attributes: {exclude: ['id']},
                limit: pageSize,
                offset: offset,
                order: [['onBoardTime', 'DESC']],
                where,
                raw: true,
                logging: false
            }
        );


        // return await ZaiZhiRen.findAll({
        //         // attributes: [
        //         //     [Sequelize.fn('sum', Sequelize.col('attendance')), 'attendance'], // Sum of attendance
        //         //     [Sequelize.fn('date_format', Sequelize.col('date'), '%m'), 'month'] // 时间
        //         // ],
        //         // where: {
        //         //     // // 开始时间 结束时间
        //         //     // date: {
        //         //     //     $between: [startDate, endDate]
        //         //     // }
        //         // },
        //     }
        // );

    } catch (error) {
        throw new Error('查询数据失败');
    }
};

const department = async () => {
    try {

        return await ZaiZhiRen.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('section')), 'section']
            ],
            where: {
                section: {
                    [Op.ne]: '北京八千行商贸有限公司',
                }
            },
            raw: true,
            logging: true
        });


    } catch (error) {
        throw new Error('查询数据失败');
    }
};

const quarters = async () => {
    try {

        return await ZaiZhiRen.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('position')), 'position']
            ],
            where: {
                position: {
                    [Op.ne]: null
                }
            },
            raw: true,
            logging: false
        });

    } catch (error) {
        throw new Error('查询数据失败');
    }
};


const statistics = async () => {
    try {
        /*select
  count(1) as 总数,
  count(case when contract_company is not null then 1 end) as 合同管理数量
from zai_zhi_ren;*/
        return await ZaiZhiRen.sequelize.query(
            `SELECT
    total,
    contractManagementQuantity,
    numberOfNewEmployees,
    CASE
        WHEN contractManagementQuantity = 0 THEN 0
        ELSE ROUND(numberOfNewEmployees / contractManagementQuantity, 2)
    END as recentRatio,
    numberresignations,
    Joined_onth,
    Idling,
    total - jumptotal AS jumptotal,
    recentTotal
FROM (
    SELECT
        COUNT(1) AS total,
        COUNT(CASE WHEN   on_board_time <=  LAST_DAY(CURDATE() - INTERVAL 1 MONTH)  and  employee_status != '离职'     THEN 1 END) AS recentTotal,
        COUNT(CASE WHEN   contract_company IS NOT NULL THEN 1 END) AS contractManagementQuantity,
        COUNT(CASE WHEN   on_board_time >= DATE_FORMAT(CURDATE(), '%Y-%m-01') AND on_board_time <= LAST_DAY(CURDATE()) THEN 1 END) AS numberOfNewEmployees,
        COUNT(CASE WHEN  employee_status = '离职' AND turnover_time >= DATE_FORMAT(CURDATE(), '%Y-%m-01') AND turnover_time <= LAST_DAY(CURDATE()) THEN 1 END) AS numberresignations,
        COUNT(CASE WHEN  employee_status != '离职' AND on_board_time >= DATE_FORMAT(CURDATE(), '%Y-%m-01') AND on_board_time <= LAST_DAY(CURDATE()) THEN 1 END) AS Joined_onth,
        COUNT(CASE WHEN  employee_status = '离职' AND turnover_time >= DATE_FORMAT(CURDATE(), '%Y-%m-01') AND turnover_time <= LAST_DAY(CURDATE())  AND on_board_time >= DATE_FORMAT(CURDATE(), '%Y-%m-01') AND on_board_time <= LAST_DAY(CURDATE())  THEN 1 END) AS Idling,
        COUNT(CASE WHEN  employee_status = '离职'  THEN 1 END) AS jumptotal
    FROM
        zai_zhi_ren
) as subquery;`,
            {
                type: QueryTypes.SELECT,
                logging: true
            }
        );


    } catch (error) {
        throw new Error('查询数据失败');
    }
};

const qualificationEcharts = async () => {
    try {

        //select  COUNT(1) AS total ,educational_background from  zai_zhi_ren group by  educational_background
        return await ZaiZhiRen.findAll({
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.col('educational_background')), 'total'],
                ['educational_background', 'qualification']
            ],
            group: ['educational_background'],
            raw: true,
            logging: false
        });


    } catch (error) {
        throw new Error('查询数据失败');
    }
};


const AgeEcharts = async () => {
    try {


        return await ZaiZhiRen.sequelize.query(
            `    select COUNT(*) AS total, age   
                FROM ( 
                    SELECT TIMESTAMPDIFF(YEAR, birthday, CURDATE()) AS age 
                    FROM zai_zhi_ren ) AS subquery 
                    GROUP BY age;
                `, {
                type: QueryTypes.SELECT
            }
        );


    } catch (error) {
        throw new Error('查询数据失败');
    }
};


const employmentEcharts = async () => {
    try {


        return await ZaiZhiRen.sequelize.query(
            `SELECT
    CASE
        WHEN TIMESTAMPDIFF(YEAR, on_board_time, NOW()) < 1 THEN '一年以内'
        WHEN TIMESTAMPDIFF(YEAR, on_board_time, NOW()) BETWEEN 1 AND 3 THEN '1-3年'
        WHEN TIMESTAMPDIFF(YEAR, on_board_time, NOW()) BETWEEN 3 AND 5 THEN '3-5年'
        WHEN TIMESTAMPDIFF(YEAR, on_board_time, NOW()) BETWEEN 5 AND 10 THEN '5-10年'
        ELSE '10年以上'
    END AS classificationOfYearsOfEmployment,
    COUNT(*) AS numberOfEmployees,
    GROUP_CONCAT(name SEPARATOR ', ') AS data
FROM
    zai_zhi_ren
GROUP BY
    classificationOfYearsOfEmployment
ORDER BY
    CASE
        WHEN classificationOfYearsOfEmployment = '一年以内' THEN 1
        WHEN classificationOfYearsOfEmployment = '1-3年' THEN 2
        WHEN classificationOfYearsOfEmployment = '3-5年' THEN 3
        WHEN classificationOfYearsOfEmployment = '5-10年' THEN 4
        ELSE 5
    END; `, {
                type: QueryTypes.SELECT
            }
        );


    } catch (error) {
        throw new Error('查询数据失败');
    }
};
const departmentEcharts = async () => {
    try {

        //select  COUNT(1) AS total ,educational_background from  zai_zhi_ren group by  educational_background
        return await ZaiZhiRen.findAll({
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.col('section')), 'total'],
                ['section', 'section']
            ],
            group: ['section'],

            raw: true,
            logging: false
        });


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
    getHrRecruitment,
    employeeManagement,
    department,
    quarters,
    statistics,
    qualificationEcharts,
    AgeEcharts,
    employmentEcharts,
    departmentEcharts
};