const { query } = require('../../model/dbConn')
const shopInfoRepo = {}

shopInfoRepo.getInfo = async () => {
    const sql = `SELECT * FROM shop_info`
    const result = await query(sql)
    return result || []
}

shopInfoRepo.getShopNameById = async (id) => {
    const sql = `SELECT shop_name, shop_name AS name, has_promotion 
        FROM shop_info WHERE id = ?`
    const result = await query(sql, id)
    return result || []
}

module.exports = shopInfoRepo