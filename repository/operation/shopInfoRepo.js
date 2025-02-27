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

shopInfoRepo.getShopNameByName = async (name) => {
    const sql = `SELECT shop_name, shop_name AS name, has_promotion 
        FROM shop_info WHERE shop_name = ?`
    const result = await query(sql, name)
    return result || []
}

shopInfoRepo.getUsersByShopName = async (name) => {
    const sql = `SELECT shop_name, shop_name AS name, has_promotion 
        FROM shop_info WHERE shop_name = ?`
    const result = await query(sql, [name])
    return result || []
}

shopInfoRepo.getShopIdByName = async (name) =>{
    const sql = `SELECT shop_id 
    FROM shop_info WHERE shop_name = ?`
    const result = await query(sql, [name])
    return result || []
}
module.exports = shopInfoRepo