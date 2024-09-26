const { query } = require('../../model/dbConn')
const tgcRepo = {}

tgcRepo.getTGCData = async (servicer_id, start, end, lastStart, lastEnd, preStart, preEnd) => {
    let sql = `SELECT c1.servicer_id,
            c1.satisfaction_rate,
            c2.reception_num AS reception_num_1,
            c2.amount AS amount_1,
            c2.transfer_rate AS transfer_rate_1,
            c3.reception_num AS reception_num_2,
            c3.amount AS amount_2,
            c3.transfer_rate AS transfer_rate_2 
        FROM cs_tgc c1
        LEFT JOIN cs_tgc c2 ON c1.servicer_id = c2.servicer_id 
            AND c2.start_time >= ? AND c2.start_time <= ? 
        LEFT JOIN cs_tgc c3 ON c1.servicer_id = c3.servicer_id
            AND c3.start_time >= ? AND c3.start_time <= ? 
        WHERE c1.start_time >= ? AND c1.start_time <= ?`
    let params = [
        lastStart, lastEnd, preStart, preEnd, start, end
    ]
    if (servicer_id) {
        sql = `${sql} AND c1.servicer_id = ?`
        params.push(servicer_id)
    }
    sql = `${sql} ORDER BY c1.id`
    const result = await query(sql, params)
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
    const result = await query(sql, info)
    return result
}

module.exports = tgcRepo
