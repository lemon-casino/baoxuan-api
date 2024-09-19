const { query } = require('../../model/dbConn')
const dyRepo = {}

dyRepo.getDYData = async (start, end) => {
    let sql = `SELECT c1.shopname,
            c1.servicer,
            c1.reception_num AS reception_num,
            c1.session_num AS session_num,
            c1.ave_response_duration AS ave_response_duration,
            c1.satisfaction_rate AS satisfaction_rate,
            c1.amount AS amount,
            c1.transfer_rate AS transfer_rate
        FROM cs_dy c1
        WHERE c1.start_time = ? AND c1.end_time = ?
        ORDER BY c1.shopname, c1.servicer`
    const result = await query(sql, [
        start, end
    ])
    return result
}

dyRepo.getDYDataImg = async (start, end) => {
    let sql = `SELECT * FROM cs_img WHERE start_time = ? AND end_time = ? 
        AND type = 4 ORDER BY id`
    const result = await query(sql, [start, end])
    return result
}

dyRepo.insertDY = async (count, info) => {
    let sql = `INSERT INTO cs_dy(
            shopname,
            start_time,
            end_time,
            servicer,
            account,
            reception_num,
            session_num,
            cpd,
            dissatisfied_rate,
            session_in_3_rate,
            response_in_3_rate,
            response_duration,
            ave_response_duration,
            satisfaction_rate,
            amount,
            contact_num,
            order_num,
            pay_num,
            transfer_rate,
            warn_num,
            online_duration,
            break_duration,
            offline_duration) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    await query(sql, info)
}

dyRepo.insertDYImg = async (info) => {
    let sql = `INSERT INTO cs_img(img_url, start_time, end_time, type) VALUES(?,?,?,4)`
    await query(sql, info)
}

module.exports = dyRepo
