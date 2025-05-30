const { query } = require('../../model/bpmDbConn')
const systemUsersRepo = {}

systemUsersRepo.getRefreshToken = async (mobile) => {
    let sql = `SELECT u.id AS refresh_token FROM system_users u 
        WHERE u.deleted = 0 AND u.status = 0 AND u.mobile = ?`
    let result = await query(sql, [mobile])
    return result
}

module.exports = systemUsersRepo