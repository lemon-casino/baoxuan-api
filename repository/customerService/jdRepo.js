const { query } = require('../../model/dbConn')
const jdRepo = {}

jdRepo.getJDData = async (start, end, shopname, servicer) => {
    let sql = `SELECT c1.shopname,
            c1.servicer,
            c1.reception_num AS reception_num,
            c1.response_in_30_rate AS response_in_30_rate,
            c1.amount AS amount,
            c1.transfer_rate AS transfer_rate,
            c1.satisfaction_rate AS satisfaction_rate 
        FROM cs_jd c1
        WHERE c1.start_time = ? AND c1.end_time = ?`
    let params = [start, end]
    if (shopname) {
        sql = `${sql} AND c1.shopname LIKE '%${shopname}%'`
    }
    if (servicer) {
        sql = `${sql} AND c1.servicer LIKE '%${servicer}%'`
    }
    sql = `${sql} ORDER BY c1.id`
    const result = await query(sql, params)
    return result
}

jdRepo.getJDDataImg = async (start, end) => {
    let sql = `SELECT * FROM cs_img WHERE start_time = ? AND end_time = ? 
        AND type = 3 ORDER BY id`
    const result = await query(sql, [start, end])
    return result
}

jdRepo.insertJD = async (count, info) => {
    let sql = `INSERT INTO cs_jd(
            shopname,
            start_time,
            end_time,
            servicer,
            login_duration,
            reception_duration,
            reception_num,
            response_in_30_rate,
            satisfaction_rate,
            amount,
            transfer_rate) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, info)
    return result
}

jdRepo.insertJDImg = async (info) => {
    let sql = `INSERT INTO cs_img(img_url, start_time, end_time, type) VALUES(?,?,?,3)`
    const result = await query(sql, info)
    return result
}

module.exports = jdRepo
