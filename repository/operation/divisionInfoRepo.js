const { query } = require('../../model/dbConn')
const divisionInfoRepo = {}

divisionInfoRepo.getInfo = async () => {
    const sql = `SELECT * FROM division_info`
    const result = await query(sql)
    return result || []
}

divisionInfoRepo.getShopNameById = async (id) => {
    const sql = `SELECT si.shop_name, di.division_name AS name, si.has_promotion  
        FROM division_info di JOIN project_info pi ON di.id = pi.division_id 
        JOIN shop_info si ON pi.id = si.project_id 
        WHERE di.id = ?`
    const result = await query(sql, id)
    return result || []
}

divisionInfoRepo.getShopNameByName = async (name) => {
    const sql = `SELECT si.shop_name, pi.project_name AS name, si.has_promotion 
        FROM division_info di JOIN project_info pi ON di.id = pi.division_id 
        JOIN shop_info si ON pi.id = si.project_id 
        WHERE di.division_name = ? 
            ORDER BY pi.project_name `
    const result = await query(sql, name)
    return result || []
}

module.exports = divisionInfoRepo