const { query, transaction } = require('../../model/dbConn')
const ordersGoodsSalesRepo = {}

ordersGoodsSalesRepo.batchInsert = async (count, data) => {
    let sql = `INSERT INTO orders_goods_sales(
            order_code, 
            \`date\`, 
            shop_id, 
            shop_name, 
            goods_id,
            sku_id,
            sku_code,
            sale_amount, 
            total_amount,
            rate,
            cost_amount,
            express_fee,
            packing_fee,
            bill_amount,
            quantity) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

ordersGoodsSalesRepo.deleteByDate = async (date) => {
    const sql = `DELETE FROM orders_goods_sales WHERE \`date\` = ?`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

ordersGoodsSalesRepo.getByordercode = async (order_id) =>{
    const sql = `SELECT shop_id,order_code,sum(sale_amount) AS sale_amount,MAX(goods_id) AS goods_id,MAX(shop_name) AS shop_name
                FROM orders_goods_sales WHERE order_code = ? GROUP BY shop_id,order_code`
    const result  = await query(sql,order_id)
    return result
}

module.exports = ordersGoodsSalesRepo