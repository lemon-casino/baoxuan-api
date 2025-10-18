const { query } = require('../../model/dbConn')
const shopPromotionLog = {}

shopPromotionLog.create = async (date, shop_name) => {
    const sql = `INSERT INTO shop_promotion_log(shop_name, \`date\`) VALUES(?,?)`
    const result = await query(sql, [shop_name, date])
    return result?.affectedRows ? true:false
}

module.exports = shopPromotionLog