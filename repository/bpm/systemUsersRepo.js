const { query } = require('../../model/bpmDbConn')
const bpmSequelize = require('@/model/bpmInit')
const { QueryTypes } = require('sequelize')
const systemUsersRepo = {}

systemUsersRepo.getRefreshToken = async (mobile) => {
    let sql = `SELECT u.id AS refresh_token FROM system_users u 
        WHERE u.deleted = 0 AND u.status = 0 AND u.mobile = ?`
    let result = await query(sql, [mobile])
    return result
}
systemUsersRepo.getID = async (nickname) => {
    let sql = `SELECT id FROM system_users WHERE nickname = ? AND status = 0 `
    let result = await query(sql, [nickname])
    return result
}

systemUsersRepo.getBpmIdByNickname = async (nickname) => {
    const sql = `SELECT id FROM system_users WHERE nickname = ? AND status = 0`
    return bpmSequelize.query(sql, { replacements: [nickname], type: QueryTypes.SELECT })
}

module.exports = systemUsersRepo
