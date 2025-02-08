const { query } = require('../../model/dbConn')
const goodsMonthSalesTarget = {}

goodsMonthSalesTarget.getInfo = async (goods_id, month) => {
    const sql = `SELECT * FROM goods_monthly_sales_target WHERE goods_id = ? 
        AND month = ?`
    const result = await query(sql, [goods_id, month])
    return result || []
}

goodsMonthSalesTarget.batchInsert = async (count, data) => {
    let sql = `INSERT INTO goods_monthly_sales_target(goods_id, month, amount) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

goodsMonthSalesTarget.update = async (goods_id, month, amount) => {
    const sql = `UPDATE goods_monthly_sales_target SET amount = ? WHERE goods_id = ? 
        AND month = ?`
    const result = await query(sql, [amount, goods_id, month])
    return result?.affectedRows ? true : false
}

goodsMonthSalesTarget.getByMonth = async (goods_id, offset, limit, start, end) => {
    let sql = `SELECT COUNT(1) AS count FROM goods_monthly_sales_target WHERE goods_id = ?`
    let subsql = '', search = '', params = [goods_id], result = {
        total: 0,
        data: []
    }
    if (start) {
        subsql = `${subsql} 
            AND month BETWEEN ? AND ?`
        params.push(start, end)
    }
    search = `${sql}${subsql}`
    let rows = await query(search, params)
    if (rows?.length && rows[0].count > 0) {
        result.total = rows[0].count
        sql = `SELECT * FROM goods_monthly_sales_target WHERE goods_id = ?`
        search = `${sql}${subsql} ORDER BY id DESC LIMIT ?,?`
        params.push(offset, limit)
        rows = await query(search, params)
        if (rows?.length) result.data = rows
    }
    return result
}

module.exports = goodsMonthSalesTarget