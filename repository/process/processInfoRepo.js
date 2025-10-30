const { query } = require('../../model/dbConn')
const processInfoRepo = {}

processInfoRepo.getByProcessIdAndField = async (process_id, field) => {
    const sql = `SELECT * FROM process_info WHERE process_id = ? AND field = ?`
    const result = await query(sql, [process_id, field])
    return result?.length ? result[0] : {}
}

module.exports = processInfoRepo