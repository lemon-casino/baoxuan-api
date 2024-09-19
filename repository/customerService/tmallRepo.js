const { query } = require('../../model/dbConn')
const tmallRepo = {}

tmallRepo.getTmallAs = async (start, end, lastStart, lastEnd, preStart, preEnd) => {
    let sql = `SELECT c1.servicer,
            c1.response_average AS response_average,
            c1.satisfaction_rate AS satisfaction_rate,
            c1.service_num AS service_num,
            c1.onetime_rate AS onetime_rate,
            c2.response_average AS response_average_1,
            c2.satisfaction_rate AS satisfaction_rate_1,
            c2.service_num AS service_num_1,
            c2.onetime_rate AS onetime_rate_1,
            c3.satisfaction_rate AS satisfaction_rate_2,
            c3.service_num AS service_num_2,
            c3.onetime_rate AS onetime_rate_2
        FROM cs_tmall_as c1
        LEFT JOIN cs_tmall_as c2 ON c1.servicer = c2.servicer 
            AND c2.start_time = ? 
            AND c2.end_time = ?
        LEFT JOIN cs_tmall_as c3 ON c1.servicer = c3.servicer 
            AND c3.start_time = ? 
            AND c3.end_time = ?
        WHERE c1.start_time = ? AND c1.end_time = ?`
    const result = await query(sql, [
        lastStart, lastEnd, preStart, preEnd, start, end
    ])
    return result
}

tmallRepo.getTmallAsImg = async (start, end) => {
    let sql = `SELECT * FROM cs_img WHERE start_time = ? AND end_time = ? 
        AND type = 1 ORDER BY id`
    const result = await query(sql, [start, end])
    return result
}

tmallRepo.insertTmallAs = async (count, info) => {
    let sql = `INSERT INTO cs_tmall_as(
            start_time,
            end_time,
            servicer,
            response_rate,
            response_average,
            onetime_rate,
            transfer_num,
            reception_num,
            satisfaction_rate,
            score,
            service_num,
            score_rate,
            display_rate,
            score_num,
            dissatisfied_num,
            very_dissatisfied_num,
            work_days) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    await query(sql, info)
}

tmallRepo.updateTmallAs = async (info) => {
    let sql = `UPDATE cs_tmall_as SET 
            response_rate = ?,
            response_average = ?,
            onetime_rate = ?,
            transfer_num = ?,
            reception_num = ?,
            satisfaction_rate = ?,
            score = ?,
            service_num = ?,
            score_rate = ?,
            display_rate = ?,
            score_num = ?,
            dissatisfied_num = ?,
            very_dissatisfied_num = ?,
            work_days = ? 
        WHERE start_time = ? AND end_time = ? AND servicer = ?`
    await query(sql, info)
}

tmallRepo.insertTmallAsImg = async (info) => {
    let sql = `INSERT INTO cs_img(img_url, start_time, end_time, type) VALUES(?,?,?,1)`
    await query(sql, info)
}

tmallRepo.getTmallPs = async (start, end, lastStart, lastEnd, preStart, preEnd) => {
    let sql = `SELECT c1.servicer,
            c1.qa_rate AS qa_rate,
            c1.success_rate AS success_rate,
            c1.satisfaction_rate AS satisfaction_rate,
            c1.amount AS amount,
            c1.reception_num AS reception_num,
            c1.work_days AS work_days,
            c1.price AS price,
            c2.amount AS amount_1,
            c2.success_rate AS success_rate_1,
            c2.reception_num AS reception_num_1,
            c2.satisfaction_rate AS satisfaction_rate_1,
            c3.amount AS amount_2,
            c3.success_rate AS success_rate_2,
            c3.reception_num AS reception_num_2
        FROM cs_tmall_ps c1
        LEFT JOIN cs_tmall_ps c2 ON c1.servicer = c2.servicer 
            AND c2.start_time = ? 
            AND c2.end_time = ?
        LEFT JOIN cs_tmall_ps c3 ON c1.servicer = c3.servicer 
            AND c3.start_time = ? 
            AND c3.end_time = ?
        WHERE c1.start_time = ? AND c1.end_time = ?`
    const result = await query(sql, [
        lastStart, lastEnd, preStart, preEnd, start, end
    ])
    return result
}

tmallRepo.insertTmallPs = async (count, info) => {
    let sql = `INSERT INTO cs_tmall_ps(
            start_time,
            end_time,
            servicer,
            response_average,
            success_rate,
            satisfaction_rate,
            amount,
            reception_num,
            qa_rate,
            work_days,
            price,
            out_num,
            unresponse_num,
            ave_satisfied_num,
            dissatisfied_num,
            very_dissatisfied_num,
            servicer_group,
            score_rate,
            slow_response_num) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    await query(sql, info)
}

tmallRepo.updateTmallPs = async (info) => {
    let sql = `UPDATE cs_tmall_ps SET 
            response_average = ?,
            success_rate = ?,
            satisfaction_rate = ?,
            amount = ?,
            reception_num = ?,
            qa_rate = ?,
            work_days = ?,
            price = ?,
            out_num = ?,
            unresponse_num = ?,
            ave_satisfied_num = ?,
            dissatisfied_num = ?,
            very_dissatisfied_num = ?,
            servicer_group = ?,
            score_rate = ?,
            slow_response_num = ? 
        WHERE start_time = ? AND end_time = ? AND servicer = ?`
    await query(sql, info)
}

module.exports = tmallRepo
