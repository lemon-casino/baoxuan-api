const { query } = require('../../model/dbConn')
const dyRepo = {}

dyRepo.getDYData = async ( start, end,lastStart, lastEnd, preStart, preEnd,shopname,servicer) => {
    let sql=`SELECT c1.shopname,
                    c1.servicer,
                    c1.reception_num AS reception_num,
                    c2.reception_num1 AS reception_num1,
                    c3.reception_num2 AS reception_num2,
                    concat(round((c2.reception_num1-c3.reception_num2)/c3.reception_num2,2)*100,'%') as reception_numq,
                    c1.session_num AS session_num,
                    c1.satisfaction_rate AS satisfaction_rate,
                    c1.amount AS amount,
                    c2.amount1 as amount1,
                    c3.amount2 as amount2,
                    concat(round((c2.amount1-c3.amount2)/c3.amount2,2)*100,'%') as amountq,
                    c1.transfer_rate AS transfer_rate
            FROM 
            (
                select '全部'as shopname
                        ,servicer
                        ,sum(amount) as amount
                        ,sum(reception_num) as reception_num
                        ,sum(session_num) as session_num 
                        ,sum(ave_response_duration) as ave_response_duration
                        ,sum(satisfaction_rate) as satisfaction_rate
                        ,sum(transfer_rate) as transfer_rate 
                from cs_dy  
                where start_time=? and end_time=?
                GROUP BY servicer
            ) as c1
            left join ( 
            select ''as shopename
                    ,servicer
                    ,sum(amount) as amount1
                    ,sum(reception_num) as reception_num1 
            from cs_dy  
            where start_time=? and end_time=?
            GROUP BY servicer )as c2
            on c1.servicer=c2.servicer 
            left join(
            select ''as shopename
                    ,servicer
                    ,sum(amount) as amount2
                    ,sum(reception_num) as reception_num2 
            from cs_dy  
            where start_time=? and end_time=?
            GROUP BY servicer ) as c3
            on c1.servicer=c3.servicer `
    let params = [start, end,lastStart, lastEnd, preStart, preEnd]
    if (shopname) {
        let sqls=`SELECT c1.shopname,
			c1.servicer,
			c1.reception_num AS reception_num,
			c2.reception_num1 AS reception_num1,
			c3.reception_num2 AS reception_num2,
			concat(round((c2.reception_num1-c3.reception_num2)/c3.reception_num2,2)*100,'%') as reception_numq,
			c1.session_num AS session_num,
			c1.session_in_3_rate AS session_in_3_rate,
			c1.ave_response_duration AS ave_response_duration,
			c1.satisfaction_rate AS satisfaction_rate,
			c1.amount AS amount,
			c2.amount1 as amount1,
			c3.amount2 as amount2,
			concat(round((c2.amount1-c3.amount2)/c3.amount2,2)*100,'%') as amountq,
			c1.transfer_rate AS transfer_rate
            FROM 
            (
                select shopname
                            ,servicer
                            ,sum(amount) as amount
                            ,sum(reception_num) as reception_num
                            ,sum(session_num) as session_num 
                            ,sum(session_in_3_rate) as session_in_3_rate
                            ,sum(ave_response_duration) as ave_response_duration
                            ,sum(satisfaction_rate) as satisfaction_rate
                            ,sum(transfer_rate) as transfer_rate 
                from cs_dy  
                where start_time= ? and end_time= ?
                GROUP BY servicer,shopname
            ) as c1
            left join ( 
            select servicer
                        ,shopname
                        ,sum(amount) as amount1
                        ,sum(reception_num) as reception_num1 
            from cs_dy  
            where start_time= ? and end_time= ?
            GROUP BY servicer,shopname )as c2
            on c1.servicer=c2.servicer and c1.shopname=c2.shopname
            left join(
            select servicer
                        ,shopname
                        ,sum(amount) as amount2
                        ,sum(reception_num) as reception_num2 
            from cs_dy  
            where start_time= ? and end_time= ?
            GROUP BY servicer,shopname) as c3
            on c1.servicer=c3.servicer and c1.shopname=c3.shopname
            `
        sql = `${sqls} where c1.shopname LIKE '%${shopname}%'`
    }
    if (servicer) {
        sql = `${sql} where c1.servicer LIKE '%${servicer}%'`
    }
    const result = await query(sql,params)
    return result
}
dyRepo.getDYKFData =async (start,end,servicer) =>{
    let sql =`SELECT c1.servicer
                    ,ROUND(SUM(c1.reception_num),0) AS reception_num
                    ,ROUND(SUM(c1.session_num),0) AS session_num
                    ,CONCAT(ROUND(AVG(c1.dissatisfied_rate),2),'%') AS dissatisfied_rate
                    ,CONCAT(ROUND(AVG(c1.session_in_3_rate),2),'%') AS session_in_3_rate
                    ,CONCAT(ROUND(AVG(c1.response_in_3_rate),2),'%') AS response_in_3_rate
                    ,ROUND(AVG(c1.response_duration),2) AS response_duration
                    ,ROUND(AVG(c1.ave_response_duration),2) AS ave_response_duration
                    ,CONCAT(ROUND(AVG(c1.satisfaction_rate),2),'%') AS satisfaction_rate
                    ,ROUND(SUM(c1.amount),2) AS amount
                    ,ROUND(SUM(c1.contact_num),0) AS contact_num
                    ,ROUND(SUM(c1.order_num),0) AS order_num
                    ,ROUND(SUM(c1.pay_num),0) AS pay_num
                    ,CONCAT(ROUND(AVG(c1.transfer_rate),2),'%') AS transfer_rate
                    ,ROUND(SUM(c1.warn_num),0) AS warn_num
                FROM cs_dy AS c1
                WHERE start_time=end_time 
                AND start_time BETWEEN "${start}" AND "${end}" 
                AND end_time BETWEEN "${start}" AND "${end}" 
                `
    if(servicer){
        sql=`${sql} AND c1.servicer='${servicer}'`
    }
    sql=`${sql} GROUP BY c1.servicer `
    const result = await query(sql)
    return result

}

dyRepo.getDYDPData =async (start,end,shopname) =>{
    let sql =`SELECT c1.shopname
                    ,MAX(c1.id) AS id
                    ,ROUND(SUM(c1.reception_num),0) AS reception_num
                    ,ROUND(SUM(c1.session_num),0) AS session_num
                    ,CONCAT(ROUND(AVG(c1.dissatisfied_rate),2),'%') AS dissatisfied_rate
                    ,CONCAT(ROUND(AVG(c1.session_in_3_rate),2),'%') AS session_in_3_rate
                    ,CONCAT(ROUND(AVG(c1.response_in_3_rate),2),'%') AS response_in_3_rate
                    ,ROUND(AVG(c1.response_duration),2) AS response_duration
                    ,ROUND(AVG(c1.ave_response_duration),2) AS ave_response_duration
                    ,CONCAT(ROUND(AVG(c1.satisfaction_rate),2),'%') AS satisfaction_rate
                    ,ROUND(SUM(c1.amount),2) AS amount
                    ,ROUND(SUM(c1.contact_num),0) AS contact_num
                    ,ROUND(SUM(c1.order_num),0) AS order_num
                    ,ROUND(SUM(c1.pay_num),0) AS pay_num
                    ,CONCAT(ROUND(AVG(c1.transfer_rate),2),'%') AS transfer_rate
                    ,ROUND(SUM(c1.warn_num),0) AS warn_num
                FROM cs_dy AS c1
                WHERE start_time=end_time 
                AND start_time BETWEEN "${start}" AND "${end}" 
                AND end_time BETWEEN "${start}" AND "${end}" 
                `
    if(shopname){
        sql=`${sql} AND c1.shopname='${shopname}' `
    }
    sql=`${sql} GROUP BY c1.shopname  ORDER BY id`
    const result = await query(sql)
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
    const result = await query(sql, info)
    return result
}

dyRepo.insertDYImg = async (info) => {
    let sql = `INSERT INTO cs_img(img_url, start_time, end_time, type) VALUES(?,?,?,4)`
    const result = await query(sql, info)
    return result
}
dyRepo.getShopName =async(start, end)=>{
    let sql = `SELECT DISTINCT shopname FROM cs_dy `
    const result = await query(sql)
    return result
}
dyRepo.getServicer =async(start, end)=>{
    let sql = `SELECT DISTINCT servicer 
            FROM cs_dy 
            WHERE start_time=end_time 
            AND start_time BETWEEN "${start}" AND "${end}" 
            AND end_time BETWEEN "${start}" AND "${end}"`
    const result = await query(sql)
    return result
}

module.exports = dyRepo
