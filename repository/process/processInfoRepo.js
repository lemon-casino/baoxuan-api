const { query } = require('../../model/dbConn')
const processInfoRepo = {}

processInfoRepo.getByProcessIdAndField = async (process_id, field) => {
    const sql = `SELECT * FROM process_info WHERE process_id = ? AND field = ?`
    const result = await query(sql, [process_id, field])
    return result?.length ? result[0] : {}
}

processInfoRepo.getDevelopmentProcessesInstanceidByUid = async (uid) => {
    const sql = `SELECT DISTINCT pi_uid.process_id
        FROM development_process dp
        JOIN process_info pi_uid ON pi_uid.content = dp.uid
        WHERE pi_uid.content= ?`
    const result = await query(sql,[uid])
    return result?.length ? result[0].process_id : ''
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

processInfoRepo.getProcessFieldValuesByCodeAndTitles = async (processCode, titles) => {
    if (!processCode || !Array.isArray(titles) || !titles.length) return []
    const placeholders = titles.map(() => '?').join(', ')
    const sql = `SELECT DISTINCT dp.uid AS development_uid, pi.process_id, pi.title AS field_title, pi.content
        FROM development_process dp
        JOIN process_info pi_uid ON pi_uid.content = dp.uid
        JOIN process_info pi ON pi.process_id = pi_uid.process_id
        JOIN processes p ON p.process_id = pi.process_id
        WHERE p.process_code = ? AND pi.title IN (${placeholders}) AND pi_uid.content IS NOT NULL`
    const params = [processCode, ...titles]
    const result = await query(sql, params)
    return result || []
}

processInfoRepo.getProcessFieldRowsByTitle = async (title) => {
    if (!title) return []
    const sql = `SELECT DISTINCT dp.uid AS development_uid, pi.process_id, p.process_code,
            pi.title AS field_title, pi.content
        FROM development_process dp
        JOIN process_info pi_uid ON pi_uid.content = dp.uid
        JOIN process_info pi ON pi.process_id = pi_uid.process_id
        JOIN processes p ON p.process_id = pi.process_id
        WHERE pi.title = ? AND pi_uid.content IS NOT NULL`
    const result = await query(sql, [title])
    return result || []
}

processInfoRepo.getProcessStatusesForDevelopmentProcesses = async () => {
    const sql = `SELECT dp.uid AS development_uid, pi_uid.process_id, p.status AS process_status,
            p.start_time
        FROM development_process dp
        JOIN process_info pi_uid ON pi_uid.content = dp.uid
        JOIN processes p ON p.process_id = pi_uid.process_id
        WHERE pi_uid.content IS NOT NULL
        ORDER BY p.start_time DESC, pi_uid.process_id DESC`
    const result = await query(sql)
    return result || []
}

module.exports = processInfoRepo
