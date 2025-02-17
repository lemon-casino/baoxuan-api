const { query, transaction } = require('../../model/dbConn')
const ordersGoodsVerifiedsRepo = {}

ordersGoodsVerifiedsRepo.batchInsert = async (count, data) => {
    let sql = `INSERT INTO orders_goods_verifieds(
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

ordersGoodsVerifiedsRepo.deleteByDate = async (date) => {
    const sql = `DELETE FROM orders_goods_verifieds WHERE \`date\` = ?`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

module.exports = ordersGoodsVerifiedsRepo