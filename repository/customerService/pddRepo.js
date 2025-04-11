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
    sql = `${sql} ORDER BY id`
    const result = await query(sql, params)
    return result
}

pddRepo.getPddDPData = async (start, end, shopname) => {
    let sql = `SELECT c1.shopname
                    ,MAX(c1.id) AS id
                    ,ROUND(SUM(c1.reception_num),0) AS reception_num
                    ,ROUND(SUM(c1.lost_num),0) AS lost_num
                    ,CONCAT(ROUND(SUM(c1.reception_rate),2),'%') AS reception_rate
                    ,ROUND(SUM(c1.amount),2) AS amount
                    ,CONCAT(ROUND(AVG(c1.answer_in_3_rate),2),'%') AS answer_in_3_rate
                    ,CONCAT(ROUND(AVG(c1.response_in_30_rate),2),'%') AS response_in_30_rate
                    ,ROUND(AVG(c1.score),2) AS score
                FROM cs_pdd AS c1
                WHERE c1.start_time=c1.end_time 
                AND c1.start_time BETWEEN "${start}" AND "${end}" 
                AND c1.end_time BETWEEN "${start}" AND "${end}"
                `
    if (shopname) {
        sql = `${sql} AND c1.shopname = '${shopname}'`
    }
    sql = `${sql} GROUP BY c1.shopname ORDER BY id`
    const result = await query(sql)
    return result
}

pddRepo.getPddKFData = async (start, end, servicer) => {
    let sql = `SELECT c1.servicer
                    ,ROUND(SUM(c1.reception_num),0) AS reception_num
                    ,ROUND(SUM(c1.lost_num),0) AS lost_num
                    ,CONCAT(ROUND(SUM(c1.reception_rate),2),'%') AS reception_rate
                    ,ROUND(SUM(c1.amount),2) AS amount
                    ,CONCAT(ROUND(AVG(c1.answer_in_3_rate),2),'%') AS answer_in_3_rate
                    ,CONCAT(ROUND(AVG(c1.response_in_30_rate),2),'%') AS response_in_30_rate
                    ,ROUND(AVG(c1.score),2) AS score
                FROM cs_pdd AS c1
                WHERE c1.start_time=c1.end_time 
                AND c1.start_time BETWEEN "${start}" AND "${end}" 
                AND c1.end_time BETWEEN "${start}" AND "${end}"
                `
    if (servicer) {
        sql = `${sql} AND c1.servicer = '${servicer}'`
    }
    sql = `${sql} GROUP BY c1.servicer `
    const result = await query(sql)
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
    const result = await query(sql, info)
    return result
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
    const result = await query(sql, info)
    return result
}

pddRepo.insertPddImg = async (info) => {
    let sql = `INSERT INTO cs_img(img_url, start_time, end_time, type) VALUES(?,?,?,2)`
    const result = await query(sql, info)
    return result
}
pddRepo.getShopName =async(start,end)=>{
    let sql = `SELECT DISTINCT shopname 
            FROM cs_pdd 
            WHERE start_time=end_time  `
    const result = await query(sql)
    return result
}
pddRepo.getServicer =async(start,end)=>{
    let sql = `SELECT DISTINCT servicer 
            FROM cs_pdd 
            WHERE start_time=end_time 
            AND start_time BETWEEN "${start}" AND "${end}" 
            AND end_time BETWEEN "${start}" AND "${end}" `
    const result = await query(sql)
    return result
}

module.exports = pddRepo
