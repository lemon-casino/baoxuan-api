const { query } = require('../../model/dbConn')
const tgcRepo = {}

tgcRepo.getTGCData = async (start, end, lastStart, lastEnd, preStart, preEnd) => {
    let sql = `SELECT c1.servicer_id,
            c1.servicer_satisfied_rate,
            c2.session_num AS session_num_1,
            c2.transfer_amount AS transfer_amount_1,
            c2.transfer_rate AS transfer_rate_1,
            c3.session_num AS session_num_2,
            c3.transfer_amount AS transfer_amount_2,
            c3.transfer_rate AS transfer_rate_2 
        FROM cs_tgc c1
        LEFT JOIN cs_tgc c2 ON c1.servicer_id = c2.servicer_id 
            AND c2.start_time = ? AND c2.end_time = ? 
        LEFT JOIN cs_tgc c3 ON c1.servicer_id = c3.servicer_id
            AND c3.start_time = ? AND c3.end_time = ? 
        WHERE c1.start_time = ? AND c1.end_time = ?`
    const result = await query(sql, [
        lastStart, lastEnd, preStart, preEnd, start, end
    ])
    return result
}

tgcRepo.insertTGC = async (count, info) => {
    let sql = `INSERT INTO cs_tgc(
            start_time,
            end_time,
            servicer,
            servicer_id,
            reception_num,
            ave_response_duration,
            amount,
            transfer_rate,
            satisfaction_rate,
            timeout_num) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    await query(sql, info)
}

module.exports = tgcRepo
