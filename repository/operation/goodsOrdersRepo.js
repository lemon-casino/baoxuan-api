const { query } = require('../../model/dbConn')
const goodsOrdersRepo = {}

goodsOrdersRepo.batchInsert = async (count, data) => {
    let sql = `INSERT INTO goods_orders(
            goods_id, 
            sku_id, 
            shop_name, 
            sku_code, 
            sale_amount, 
            cost_amount,
            express_fee,
            sale_qty,
            order_time) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

goodsOrdersRepo.deleteByDate = async (order_time) => {
    let sql = `DELETE FROM goods_orders WHERE order_time = ?`
    const result = await query(sql, [order_time])
    return result?.affectedRows ? true : false
}

goodsOrdersRepo.getByTime = async (order_time) => {
    let sql = `SELECT a1.sale_amount, a1.sale_qty, a1.cost_amount, 
        a1.express_fee, a1.goods_id, a1.sku_code, a2.amount AS bill_amount,
	    s.amount AS settle_amount, a1.order_time FROM goods_orders a1 JOIN (
		    SELECT SUM(amount) AS amount, goods_id, \`date\`  
            FROM goods_bill_info GROUP BY goods_id, \`date\`
	    ) a2 on a2.goods_id = a1.goods_id 
            AND a2.date = a1.order_time 
	    JOIN (SELECT SUM(amount) AS amount, 
		    CAST(settle_time AS DATE) AS order_time, sku_id2 
            FROM settlement WHERE type  IN ('货款','货款收入','实收货款') 
            AND amount > 0 GROUP BY CAST(settle_time AS DATE), sku_id2) s 
        ON s.sku_id2 = a1.sku_id
        AND s.order_time = a1.order_time
        WHERE a1.order_time = ?`
    const result = await query(sql, [order_time])
    return result
}

module.exports = goodsOrdersRepo