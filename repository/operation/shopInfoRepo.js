const { query } = require('../../model/dbConn')
const mysql = require('mysql2')
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

shopInfoRepo.isCoupang = async (name) => {
    const sql = `SELECT id FROM shop_info WHERE shop_name = ? AND project_id = 4`
    const result = await query(sql, [name])
    return result?.length ? true : false
}

shopInfoRepo.getDivisionByShopName = async (name) => {
    const sql = `SELECT di.division_name FROM shop_info si JOIN project_info pi 
            ON pi.id = si.project_id 
        JOIN division_info di ON di.id = pi.division_id 
        WHERE si.shop_name IN ("${name}") LIMIT 1`
    const result = await query(sql)
    return result
}

shopInfoRepo.getTable= async(tab) =>{
    const sql = `SELECT DISTINCT shop_name FROM shop_info WHERE tab != ?`
    const result = await query(sql,tab)
    return result
}
module.exports = shopInfoRepo