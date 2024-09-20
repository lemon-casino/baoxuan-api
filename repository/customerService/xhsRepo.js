const { query } = require('../../model/dbConn')
const xhsRepo = {}

xhsRepo.getXHSData = async (servicer_id, start, end) => {
    let sql = `SELECT c1.servicer_id,
            c1.session_num,
            c1.transfer_amount,
            c1.transfer_rate,
            c1.response_in_3_rate 
        FROM cs_xhs c1 
        WHERE c1.start_time = ? AND c1.end_time = ?`
    let params = [start, end]
    if (servicer_id) {
        sql = `${sql} AND c1.servicer_id = ?`
        params.push(servicer_id)
    }
    sql = `${sql} ORDER BY c1.id`
    const result = await query(sql, params)
    return result
}

xhsRepo.insertXHS = async (count, info) => {
    let sql = `INSERT INTO cs_xhs(
            start_time,
            end_time,
            servicer_id,
            account,
            online_duration,
            busy_duration,
            session_num,
            response_rate,
            response_in_3_rate,
            response_in_45_rate,
            score_num,
            satisfied_num,
            dissatisfied_num,
            score_rate,
            servicer_dissatisfied_rate,
            servicer_satisfied_rate,
            transfer_num,
            transfer_amount,
            transfer_rate,
            transfer_amount_rate) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    await query(sql, info)
}

module.exports = xhsRepo
