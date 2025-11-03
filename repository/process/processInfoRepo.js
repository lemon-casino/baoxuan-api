const { query } = require('../../model/dbConn')
const processInfoRepo = {}

processInfoRepo.getByProcessIdAndField = async (process_id, field) => {
    const sql = `SELECT * FROM process_info WHERE process_id = ? AND field = ?`
    const result = await query(sql, [process_id, field])
    return result?.length ? result[0] : {}
}

processInfoRepo.getFieldValuesForDevelopmentProcesses = async (titles) => {
    if (!Array.isArray(titles) || !titles.length) return []
    const placeholders = titles.map(() => '?').join(', ')
    const sql = `SELECT DISTINCT dp.uid AS development_uid, pi.title AS field_title, pi.content
        FROM development_process dp
        JOIN process_info pi_uid ON pi_uid.content = dp.uid
        JOIN process_info pi ON pi.process_id = pi_uid.process_id
        WHERE pi.title IN (${placeholders}) AND pi_uid.content IS NOT NULL`
    const result = await query(sql, titles)
    return result || []
}

module.exports = processInfoRepo
