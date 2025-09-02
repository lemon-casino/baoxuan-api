const { query } = require('../model/dbConn')
const userSettingRepo = {}

userSettingRepo.getByType = async (user_id, type, tab) => {
    const sql = `SELECT * FROM user_setting WHERE user_id = ? AND type = ? AND subtype = ?`
    const result = await query(sql, [user_id, type,tab])
    return result || []
}

userSettingRepo.insert = async (user_id, type, subtype, attribute) => {
    const sql = `INSERT INTO user_setting(user_id, type, subtype, attributes) VALUES(?,?,?,?)`
    const result = await query(sql, [user_id, type, subtype, attribute])
    return result?.affectedRows ? true : false
}

userSettingRepo.updateByUserIdAndType = async (user_id, type, subtype, attribute) => {
    const sql = `UPDATE user_setting SET attributes = ? WHERE user_id = ? AND type = ? AND subtype = ?`
    const result = await query(sql, [attribute, user_id, type, subtype])
    return result?.affectedRows ? true : false
}

module.exports = userSettingRepo