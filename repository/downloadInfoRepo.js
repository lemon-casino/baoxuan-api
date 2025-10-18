const { query } = require('../model/dbConn')
const downloadInfoRepo = {}

downloadInfoRepo.insert = async (user_id, name, path, params) => {
    const sql = `INSERT INTO download_info(user_id, name, path, params) VALUES(?,?,?,?)`
    const result = await query(sql, [user_id, name, path, params])
    return result?.affectedRows ? true:false
}

downloadInfoRepo.updateStatus = async (status, user_id, name) => {
    const sql = `UPDATE download_info SET STATUS = ? WHERE user_id = ? AND name = ?`
    const result = await query(sql, [status, user_id, name])
    return result?.affectedRows ? true:false
}

downloadInfoRepo.getInfo = async (user_id) => {
    const sql = `SELECT * FROM download_info WHERE user_id = ? ORDER BY id DESC`
    const result = await query(sql, [user_id])
    return result || []
}

module.exports = downloadInfoRepo