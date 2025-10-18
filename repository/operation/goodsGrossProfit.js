const { query } = require('../../model/dbConn')
const goodsGrossProfit = {}

goodsGrossProfit.batchInsert = async (count, data) => {
    let sql = `INSERT INTO goods_gross_profit(
            goods_id, 
            sku_code, 
            sale_amount, 
            sale_qty,
            cost_amount,
            express_fee,
            settle_amount,
            bill_amount,
            order_time) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

goodsGrossProfit.deleteByDate = async (order_time) => {
    let sql = `DELETE FROM goods_gross_profit WHERE order_time = ?`
    const result = await query(sql, [order_time])
    return result?.affectedRows ? true : false
}

module.exports = goodsGrossProfit