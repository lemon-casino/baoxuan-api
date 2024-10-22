const { query } = require('../../model/dbConn')
const jdRepo = {}

jdRepo.getJDData = async (start, end,lastStart, lastEnd, preStart, preEnd, shopname, servicer) => {
    let sql = `SELECT c1.shopname,
                    c1.servicer,
                    c1.reception_num AS reception_num,
                    c2.reception_num1 AS reception_num1,
                    c3.reception_num2 AS reception_num2,
                    concat(round((c2.reception_num1-c3.reception_num2)/c3.reception_num2,2)*100,'%') as reception_numq,
                    c1.response_in_30_rate,
                    c1.satisfaction_rate AS satisfaction_rate,
                    c1.amount AS amount,
                    c2.amount1 as amount1,
                    c3.amount2 as amount2,
                    concat(round((c2.amount1-c3.amount2)/c3.amount2,2)*100,'%') as amountq,
                    c1.transfer_rate AS transfer_rate
                FROM 
                (
                    select '全部' as shopname
                        ,servicer
                        ,sum(amount) as amount
                        ,sum(reception_num) as reception_num
                        ,concat(round(avg(response_in_30_rate)*100,2),'%') as response_in_30_rate
                        ,sum(satisfaction_rate) as satisfaction_rate
                        ,concat(round(avg(transfer_rate)*100,2),'%') as transfer_rate
                    from cs_jd  
                    where start_time= ? and end_time= ? and servicer not in ('均值','总值')
                    GROUP BY servicer
                ) as c1
                left join ( 
                select servicer
                    ,'' as shopname
                    ,sum(amount) as amount1
                    ,sum(reception_num) as reception_num1 
                from cs_jd  
                where start_time= ? and end_time= ? and servicer not in ('均值','总值')
                GROUP BY servicer)as c2
                on c1.servicer=c2.servicer 
                left join(
                select servicer
                    ,'' as shopname
                    ,sum(amount) as amount2
                    ,sum(reception_num) as reception_num2 
                from cs_jd  
                where start_time= ? and end_time= ? and servicer not in ('均值','总值')
                GROUP BY servicer) as c3
                on c1.servicer=c3.servicer `
    let params = [start, end,lastStart, lastEnd, preStart, preEnd]
    if (shopname) {
        let sqls=`SELECT c1.shopname,
                    c1.servicer,
                    c1.reception_num AS reception_num,
                    c2.reception_num1 AS reception_num1,
                    c3.reception_num2 AS reception_num2,
                    concat(round((c2.reception_num1-c3.reception_num2)/c3.reception_num2,2)*100,'%') as reception_numq,
                    c1.response_in_30_rate,
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
                        ,concat(max(response_in_30_rate)*100,'%') as response_in_30_rate
                        ,sum(satisfaction_rate) as satisfaction_rate
                        ,concat(max(transfer_rate)*100,'%') as transfer_rate 
                    from cs_jd  
                    where start_time= ? and end_time= ? and servicer not in ('均值','总值')
                    GROUP BY servicer,shopname
                ) as c1
                left join ( 
                select servicer
                    ,shopname
                    ,sum(amount) as amount1
                    ,sum(reception_num) as reception_num1 
                from cs_jd  
                where start_time= ? and end_time= ? and servicer not in ('均值','总值')
                GROUP BY servicer,shopname )as c2
                on c1.servicer=c2.servicer and c1.shopname=c2.shopname
                left join(
                select servicer
                    ,shopname
                    ,sum(amount) as amount2
                    ,sum(reception_num) as reception_num2 
                from cs_jd  
                where start_time= ? and end_time= ? and servicer not in ('均值','总值')
                GROUP BY servicer,shopname) as c3
                on c1.servicer=c3.servicer and c1.shopname=c3.shopname`
        sql = `${sqls} where c1.shopname LIKE '%${shopname}%' order by c1.servicer`
    }
    if (servicer) {
        sql = `${sql} where c1.servicer LIKE '%${servicer}%' `
    }
    sql = `${sql} ORDER BY c1.servicer desc `
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
