const { query } = require('../../model/dbConn')
const vipRepo = {}

vipRepo.getVIPData = async (servicer_id, start, end) => {
    let sql = `SELECT c1.servicer_id,
            c1.reception_num,
            c1.amount,
            c1.satisfaction_rate,
            c1.ps_session_num,
            c1.ps_60_response_rate 
        FROM cs_vip c1
        WHERE c1.start_time = ? AND c1.end_time = ?`
    let params = [start, end]
    if (servicer_id) {
        sql = `${sql} AND c1.servicer_id = ?`
        params.push(servicer_id)
    }
    const result = await query(sql, params)
    return result
}

vipRepo.insertVIP = async (count, info) => {
    let sql = `INSERT INTO cs_vip(
            start_time,
            end_time,
            servicer_id,
            work_days,
            reception_num,
            timeout_num,
            response_in_60_rate,
            satisfaction_rate,
            amount,
            dissatisfied_num,
            ask_score_num,
            contact_num,
            ps_session_num,
            ps_60_timeout_num,
            ps_60_response_rate,
            as_session_num,
            as_3_timeout_num,
            as_3_response_rate) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    await query(sql, info)
}

module.exports = vipRepo
