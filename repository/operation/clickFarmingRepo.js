const { query, transaction } = require('../../model/dbConn')
const mysql = require('mysql2')
const clickFarmingRepo = {}
clickFarmingRepo.InsertErlei = async (data,count) => {
    let sql= `INSERT INTO click_farming(
                order_code,
                commission,
                shop_id,
                sale_amount,
                goods_id,
                shop_name,
                date,
                name) VALUES `
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result
}
clickFarmingRepo.deleteByName = async(date,name) =>{
    let sql = `DELETE FROM click_farming where \`date\`=? and \`name\` = ?`
    const result = await query(sql,[date,name])
    let q = mysql.format(sql,[date,name])
    console.log(q)
    return result
}
module.exports = clickFarmingRepo