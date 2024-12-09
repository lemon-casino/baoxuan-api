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
        a1.express_fee, a1.goods_id, a1.sku_code, - s2.amount AS bill_amount,
	    s.amount AS settle_amount, a1.order_time FROM goods_orders a1  
	    JOIN (SELECT SUM(amount) AS amount, 
		    CAST(settle_time AS DATE) AS order_time, shop_name 
            FROM settlement WHERE type IN (
                '货款','货款收入','实收货款','退货退款订单','退款',
                '交易收入', '销售订单') 
            GROUP BY CAST(settle_time AS DATE), shop_name) s 
        ON s.shop_name = a1.shop_name AND s.order_time = a1.order_time
        JOIN (SELECT SUM(amount) AS amount, 
		    CAST(settle_time AS DATE) AS order_time, shop_name 
            FROM settlement WHERE type NOT IN (
                '货款','货款收入','实收货款','退货退款订单','退款',
                '交易收入', '销售订单') 
            GROUP BY CAST(settle_time AS DATE), shop_name) s2 
        ON s2.shop_name = a1.shop_name AND s2.order_time = a1.order_time
        WHERE a1.order_time = ?`
    const result = await query(sql, [order_time])
    return result
}

module.exports = goodsOrdersRepo