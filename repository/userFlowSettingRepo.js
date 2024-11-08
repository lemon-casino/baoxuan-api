const { query } = require('../model/dbConn')

const userFlowSettingRepo = {}

userFlowSettingRepo.getSetting = async (user_id, form_id) => {
    let sql = `SELECT * FROM user_flow_setting WHERE user_id = ? AND form_id = ?`
    let row = await query(sql, [user_id, form_id])
    if (row?.length && row[0].attributes) return JSON.parse(row[0].attributes)
    return []
}

userFlowSettingRepo.updateSetting = async (user_id, form_id, setting) => {
    let sql = `UPDATE user_flow_setting SET attributes = ? 
        WHERE user_id = ? AND form_id = ?`
    let row = await query(sql, [setting, user_id, form_id])
    return row?.affectedRows ? true : false
}

userFlowSettingRepo.insertSetting = async (user_id, form_id, setting) => {
    let sql = `INSERT INTO user_flow_setting(user_id, form_id, attributes) 
        VALUES (?,?,?)`
    let row = await query(sql, [user_id, form_id, setting])
    return row?.affectedRows ? true : false
}

module.exports = userFlowSettingRepo