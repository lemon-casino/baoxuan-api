const Sequelize = require("sequelize")
const sequelize = require('../model/init');
const {QueryTypes, Op,col,fn} = require("sequelize");
const getJDDailyReport = require("../model/jdDailyReport")
const JDDailyReport = getJDDailyReport(sequelize)





const inquiryTodayjdDailyReport = async () => {
//select  * from jd_daily_report where created_at= CURDATE() 只要当天的 日期


    return  JDDailyReport.findAll({
        where: {
            createdAt:
                {
                    [Op.gt] :  fn('CURDATE')
                }
        },
        logging:true,
        raw:true
    })
}
module.exports = {
    inquiryTodayjdDailyReport
}