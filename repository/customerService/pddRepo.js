const { query } = require('../../model/dbConn')
const pddRepo = {}

pddRepo.getPddData = async (start, end, shopname, servicer) => {
    let sql = `SELECT c1.shopname,
            c1.servicer,
            c1.reception_num AS reception_num,
            c1.reception_rate AS reception_rate,
            c1.amount AS amount,
            c1.answer_in_3_rate AS answer_in_3_rate,
            c1.response_in_30_rate AS response_in_30_rate,
            c1.score AS score
        FROM cs_pdd c1
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

pddRepo.getPddDataImg = async (start, end) => {
    let sql = `SELECT * FROM cs_img WHERE start_time = ? AND end_time = ? 
        AND type = 2 ORDER BY id`
    const result = await query(sql, [start, end])
    return result
}

pddRepo.insertPdd = async (count, info) => {
    let sql = `INSERT INTO cs_pdd(
            shopname,
            start_time,
            end_time,
            servicer,
            reception_num,
            lost_num,
            reception_rate,
            amount,
            answer_in_3_rate,
            response_in_30_rate,
            score) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    await query(sql, info)
}

pddRepo.updatePdd = async (info) => {
    let sql = `UPDATE cs_pdd SET 
            reception_num = ?,
            lost_num = ?,
            reception_rate = ?,
            amount = ?,
            answer_in_3_rate = ?,
            response_in_30_rate = ?,
            score = ? 
        WHERE shopname = ? AND start_time = ? AND end_time = ? AND servicer = ?`
    await query(sql, info)
}

pddRepo.insertPddImg = async (info) => {
    let sql = `INSERT INTO cs_img(img_url, start_time, end_time, type) VALUES(?,?,?,2)`
    await query(sql, info)
}

module.exports = pddRepo
