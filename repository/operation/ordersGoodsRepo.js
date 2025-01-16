const { query } = require('../../model/dbConn')
const ordersGoodsRepo = {}

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
    const sql = `UPDATE orders_goods SET verified_date = ? WHERE order_code = ? 
        AND goods_id = ? AND sku_code = ?`
    const result = await query(sql, [date, order_code, goods_id, sku_code])
    return result?.affectedRows ? true : false
}

ordersGoodsRepo.deleteByDate = async (date) => {
    const sql = `DELETE FROM orders_goods WHERE \`date\` = ?`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

module.exports = ordersGoodsRepo