const { query } = require('../../model/dbConn')
const goodsBillRepo = {}

goodsBillRepo.deleteByDate = async (date) => {
    let sql = `DELETE FROM goods_bill_info WHERE \`date\` = ? 
        AND shop_name != '京东自营旗舰店'`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

goodsBillRepo.deleteByDate2 = async (date) => {
    let sql = `DELETE FROM goods_bill_info WHERE \`date\` = ? 
        AND shop_name = '京东自营旗舰店'`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

goodsBillRepo.batchInsert = async (count, data) => {
    let sql = `INSERT INTO goods_bill_info(
            goods_id, 
            sku_id, 
            shop_name, 
            bill_name,
            amount,
            \`date\`) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

goodsBillRepo.getDataDetailByTime = async (goods_id, start, end) => {
    let sql = `SELECT IFNULL(SUM(amount), 0) AS amount, bill_name
        FROM goods_bill_info WHERE goods_id = ? 
            AND \`date\` >= ? AND \`date\` <= ?
        GROUP BY bill_name
        
        UNION ALL 
        
        SELECT IFNULL(SUM(amount), 0) AS amount, '合计' AS bill_name
        FROM goods_bill_info WHERE goods_id = ? 
            AND \`date\` >= ? AND \`date\` <= ?`
    const result = await query(sql, [goods_id, start, end, goods_id, start, end])
    return result || []
}

module.exports = goodsBillRepo