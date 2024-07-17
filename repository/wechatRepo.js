const sequelize = require('@/model/init');
const getSupplierModel = require("@/model/supplier")
const supplierModel = getSupplierModel(sequelize)
const {QueryTypes} = require('sequelize');

/**
 * 查询某个月的微信聊天开发供应商统计
 * @param date 日期
 * @returns {Promise<boolean>}
 */
const getChatStatistics = async (startDate,endDate) => {
    return await supplierModel.sequelize.query(
        `select a.users_name,count(a.id) numbner  from supplier a
                                                           inner join enterprise_wechat_chat e on a.users_name = e.users_name
         where a.create_time between '${startDate}' and '${endDate}'
         GROUP BY a.users_name
        `,
        {
            type: QueryTypes.SELECT
        }
    )
}
/**
 * 查询新增供应商数量
 * @param startDate,endDate 日期
 * @param department 部门
 * @returns {Promise<<object[]>>}
 */
const getChatCountNumber = async (startDate,endDate,department) => {
    return await supplierModel.sequelize.query(
        `select a.users_name,a.increase_number  from enterprise_wechat_chat a
         where a.create_time between '${startDate}' and '${endDate}'
         and a.department = '${department}'
        `,
        {
            type: QueryTypes.SELECT
        }
    )
}


module.exports = {
    getChatStatistics,
    getChatCountNumber
}