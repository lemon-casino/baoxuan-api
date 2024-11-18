const { query } = require('../../model/dbConn')
const jdRepo = {}

jdRepo.getJDData = async (start, end,lastStart, lastEnd, preStart, preEnd, shopname, servicer) => {
    let sql = `SELECT c1.shopname,
                    c1.servicer,
                    c1.reception_num AS reception_num,
                    c2.reception_num1 AS reception_num1,
                    c3.reception_num2 AS reception_num2,
                    CONCAT(ROUND((c2.reception_num1-c3.reception_num2)/c3.reception_num2,2)*100,'%') AS reception_numq,
                    c1.response_in_30_rate,
                    c1.satisfaction_rate AS satisfaction_rate,
                    c1.amount AS amount,
                    c2.amount1 AS amount1,
                    c3.amount2 AS amount2,
                    CONCAT(ROUND((c2.amount1-c3.amount2)/c3.amount2,2)*100,'%') AS amountq,
                    c1.transfer_rate AS transfer_rate
                FROM 
                (
                    SELECT '全部' AS shopname
                        ,servicer
                        ,SUM(amount) AS amount
                        ,SUM(reception_num) AS reception_num
                        ,CONCAT(ROUND(AVG(response_in_30_rate),2),'%') AS response_in_30_rate
                        ,SUM(satisfaction_rate) AS satisfaction_rate
                        ,CONCAT(ROUND(AVG(transfer_rate),2),'%') AS transfer_rate
                    FROM cs_jd  
                    WHERE start_time= ? and end_time= ?
                    GROUP BY servicer
                ) AS c1
                LEFT JOIN ( 
                SELECT servicer
                    ,'' AS shopname
                    ,SUM(amount) AS amount1
                    ,SUM(reception_num) AS reception_num1 
                FROM cs_jd  
                WHERE start_time= ? and end_time= ?
                GROUP BY servicer)AS c2
                ON c1.servicer=c2.servicer 
                LEFT JOIN(
                SELECT servicer
                    ,'' AS shopname
                    ,SUM(amount) AS amount2
                    ,SUM(reception_num) AS reception_num2 
                FROM cs_jd  
                WHERE start_time= ? and end_time= ?
                GROUP BY servicer) AS c3
                ON c1.servicer=c3.servicer `
    let params = [start, end,lastStart, lastEnd, preStart, preEnd]
    if (shopname) {
        let sqls=`SELECT c1.shopname,
                    c1.servicer,
                    c1.reception_num AS reception_num,
                    c2.reception_num1 AS reception_num1,
                    c3.reception_num2 AS reception_num2,
                    CONCAT(ROUND((c2.reception_num1-c3.reception_num2)/c3.reception_num2,2)*100,'%') AS reception_numq,
                    c1.response_in_30_rate,
                    c1.satisfaction_rate AS satisfaction_rate,
                    c1.amount AS amount,
                    c2.amount1 AS amount1,
                    c3.amount2 AS amount2,
                    CONCAT(ROUND((c2.amount1-c3.amount2)/c3.amount2,2)*100,'%') AS amountq,
                    c1.transfer_rate AS transfer_rate
                FROM 
                (
                    SELECT shopname
                        ,servicer
                        ,SUM(amount) AS amount
                        ,SUM(reception_num) AS reception_num
                        ,CONCAT(max(response_in_30_rate),'%') AS response_in_30_rate
                        ,SUM(satisfaction_rate) AS satisfaction_rate
                        ,CONCAT(max(transfer_rate),'%') AS transfer_rate 
                    FROM cs_jd  
                    WHERE start_time= ? AND end_time= ?
                    GROUP BY servicer,shopname
                ) AS c1
                LEFT JOIN ( 
                SELECT servicer
                    ,shopname
                    ,SUM(amount) AS amount1
                    ,SUM(reception_num) AS reception_num1 
                FROM cs_jd  
                WHERE start_time= ? AND end_time= ?
                GROUP BY servicer,shopname )AS c2
                ON c1.servicer=c2.servicer AND c1.shopname=c2.shopname
                LEFT JOIN(
                SELECT servicer
                    ,shopname
                    ,SUM(amount) AS amount2
                    ,SUM(reception_num) AS reception_num2 
                FROM cs_jd  
                WHERE start_time= ? AND end_time= ?
                GROUP BY servicer,shopname) AS c3
                ON c1.servicer=c3.servicer AND c1.shopname=c3.shopname`
        sql = `${sqls} WHERE c1.shopname LIKE '%${shopname}%'`
    }
    if (servicer) {
        sql = `${sql} WHERE c1.servicer LIKE '%${servicer}%' `
    }
    sql = `${sql} ORDER BY c1.servicer desc `
    const result = await query(sql, params)
    return result
}

jdRepo.getJDKFData =async(start,end,servicer)=>{
    let sql=`SELECT c1.servicer
                ,SUM(c1.login_duration) AS login_duration
                ,SUM(c1.reception_duration) AS reception_duration
                ,ROUND(SUM(c1.reception_num),0) AS reception_num
                ,CONCAT(ROUND(AVG(c1.response_in_30_rate),2),'%') AS response_in_30_rate
                ,CONCAT(ROUND(AVG(c1.satisfaction_rate),2),'%') AS satisfaction_rate
                ,SUM(c1.amount) AS amount
                ,CONCAT(ROUND(AVG(c1.transfer_rate),2),'%') AS transfer_rate
            FROM cs_jd AS C1
            WHERE c1.start_time=c1.end_time 
            AND c1.start_time BETWEEN "${start}" AND "${end}" 
            AND c1.end_time BETWEEN "${start}" AND "${end}"
            `
    if(servicer){
        sql=`${sql} AND c1.servicer="${servicer}" `
    }
    sql=`${sql} GROUP BY c1.servicer `
   
    const result = await query(sql)
    return result
    
}

jdRepo.getJDDPData = async(start,end,shopname)=>{
    let sql=`SELECT c1.shopname
                ,MAX(c1.id) AS id
                ,SUM(c1.login_duration) AS login_duration
                ,SUM(c1.reception_duration) AS reception_duration
                ,ROUND(SUM(c1.reception_num),0) AS reception_num
                ,CONCAT(ROUND(AVG(c1.response_in_30_rate),2),'%') AS response_in_30_rate
                ,CONCAT(ROUND(AVG(c1.satisfaction_rate),2),'%') AS satisfaction_rate
                ,SUM(c1.amount) AS amount
                ,CONCAT(ROUND(AVG(c1.transfer_rate),2),'%') AS transfer_rate
            FROM cs_jd AS c1
            WHERE c1.start_time=end_time 
            AND c1.start_time BETWEEN "${start}" AND "${end}" 
            AND c1.end_time BETWEEN "${start}" AND "${end}"
            `
    if(shopname){
        sql=`${sql} AND c1.shopname="${shopname}" `
    }
    sql=`${sql} GROUP BY c1.shopname ORDER BY id `
   
    const result = await query(sql)
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
jdRepo.getShopName =async(start,end)=>{
    let sql = `SELECT DISTINCT shopname FROM cs_jd `
    const result = await query(sql)
    return result
}
jdRepo.getServicer =async(start,end)=>{
    let sql = `SELECT DISTINCT servicer 
            FROM cs_jd 
            WHERE start_time=end_time 
            AND start_time BETWEEN "${start}" AND "${end}" 
            AND end_time BETWEEN "${start}" AND "${end}"`
    const result = await query(sql)
    return result
}
module.exports = jdRepo
