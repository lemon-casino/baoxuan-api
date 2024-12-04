const { query } = require('../../model/dbConn')
const projectInfoRepo = {}

projectInfoRepo.getInfo = async () => {
    const sql = `SELECT * FROM project_info`
    const result = await query(sql)
    return result || []
}

projectInfoRepo.getShopNameById = async (id) => {
    const sql = `SELECT si.shop_name, pi.project_name AS name, si.has_promotion 
        FROM project_info pi LEFT JOIN shop_info si ON pi.id = si.project_id 
        WHERE pi.id = ?`
    const result = await query(sql, id)
    return result || []
}

projectInfoRepo.getShopNameByName = async (name) => {
    const sql = `SELECT si.shop_name, si.shop_name AS name, si.has_promotion 
        FROM project_info pi LEFT JOIN shop_info si ON pi.id = si.project_id 
        WHERE pi.project_name = ?`
    const result = await query(sql, name)
    return result || []
}

module.exports = projectInfoRepo