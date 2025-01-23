const { query } = require('../../model/dbConn')
const ordersGoodsRepo = {}

ordersGoodsRepo.getByDate = async (date) => {
    const sql = `SELECT SUM(rate) AS labor_cost, shop_id, goods_id FROM orders_goods 
        WHERE \`date\` = ? GROUP BY shop_id, goods_id`
    const result = await query(sql, [date])
    return result || []
}

ordersGoodsRepo.getByVerifiedDate = async (date) => {
    const sql = `SELECT SUM(rate) AS labor_cost, shop_id, goods_id FROM orders_goods 
        WHERE verified_date = ? GROUP BY shop_id, goods_id`
    const result = await query(sql, [date])
    return result || []
}

ordersGoodsRepo.batchInsert = async (count, data) => {
    let sql = `INSERT INTO orders_goods(
            order_code, 
            \`date\`, 
            shop_id, 
            shop_name, 
            goods_id, 
            sku_code,
            sale_amount, 
            total_amount, 
            rate) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

ordersGoodsRepo.update = async (date, order_code, goods_id, sku_code) => {
    let sql = `UPDATE orders_goods SET verified_date = ? WHERE order_code = ? 
        AND goods_id = ? AND sku_code = ?`, 
        params = [date, order_code, goods_id, sku_code]
    if (goods_id === null) {
        sql = `UPDATE orders_goods SET verified_date = ? WHERE order_code = ? 
        AND goods_id IS NULL AND sku_code = ?`
        params = [date, order_code, sku_code]
    }
    result = await query(sql, params)
    return result?.affectedRows ? true : false
}

ordersGoodsRepo.deleteByDate = async (date) => {
    const sql = `DELETE FROM orders_goods WHERE \`date\` = ?`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

module.exports = ordersGoodsRepo