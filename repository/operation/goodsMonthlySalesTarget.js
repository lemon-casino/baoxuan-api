const { query } = require('../../model/dbConn')
const goodsMonthSalesTarget = {}

goodsMonthSalesTarget.getInfo = async (goods_id, month) => {
    const sql = `SELECT * FROM goods_monthly_sales_target WHERE goods_id = ? 
        AND month = ?`
    const result = await query(sql, [goods_id, month])
    return result || []
}

goodsMonthSalesTarget.getIdInfo = async (goods_id) => {
    const sql = `SELECT brief_name FROM dianshang_operation_attribute WHERE sku_id = ? `
    const result = await query(sql, [goods_id])
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

goodsMonthSalesTarget.update = async (goods_id, month, amount,tag) => {
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

goodsMonthSalesTarget.getDetailByMonth = async (start, end, department) => {
    const sql = `SELECT a1.goods_id, a2.brief_name, a2.brief_product_line, 
            a2.operator, a1.month, a1.amount FROM goods_monthly_sales_target a1 
        LEFT JOIN dianshang_operation_attribute a2 ON a1.goods_id = a2.goods_id
        WHERE a1.month BETWEEN ? AND ? AND a2.dept_id = ?
        ORDER BY a1.goods_id, a1.month`
    const result = await query(sql, [start, end, department])
    return result || []
}

module.exports = goodsMonthSalesTarget