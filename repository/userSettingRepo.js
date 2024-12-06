const { query } = require('../model/dbConn')
const userSettingRepo = {}

userSettingRepo.getByType = async (user_id, type) => {
    const sql = `SELECT * FROM user_setting WHERE user_id = ? AND type = ?`
    const result = await query(sql, [user_id, type])
    return result || []
}

userSettingRepo.insert = async (user_id, type, attribute) => {
    const sql = `INSERT INTO user_setting(user_id, type, attributes) VALUES(?,?,?)`
    const result = await query(sql, [user_id, type, attribute])
    return result?.affectedRows ? true : false
}

userSettingRepo.updateByUserIdAndType = async (user_id, type, attribute) => {
    const sql = `UPDATE user_setting SET attributes = ? WHERE user_id = ? AND type = ?`
    const result = await query(sql, [attribute, user_id, type])
    return result?.affectedRows ? true : false
}

module.exports = userSettingRepo