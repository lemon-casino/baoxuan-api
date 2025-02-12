const { query, transaction } = require('../../model/dbConn')
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

ordersGoodsRepo.update = async (data, date) => {
    let sql = `UPDATE orders_goods SET verified_date = ? WHERE order_code = ? 
        AND goods_id = ? AND sku_id = ? AND sku_code = ?`, 
    sql1 = `UPDATE orders_goods SET verified_date = ? WHERE order_code = ? 
        AND goods_id IS NULL AND sku_id IS NULL AND sku_code = ?`, result, 
    sql2 = `INSERT INTO orders_goods(
        verified_date, 
        order_code, 
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
        quantity) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    for (let i = 0; i < data.length; i++) {
        if (data[i].goods_id === null) {
            result = await query(sql1, [
                date,
                data[i].order_code,
                data[i].sku_code
            ])
            
        } else {
            result = await query(sql, [
                date,
                data[i].order_code,
                data[i].goods_id,
                data[i].sku_id,
                data[i].sku_code
            ])
        }
        if (!result?.affectedRows) {
            result = await query(sql2, [
                date,
                data[i].order_code,
                data[i].shop_id,
                data[i].shop_name,
                data[i].goods_id,
                data[i].sku_id,
                data[i].sku_code,
                data[i].sale_amount,
                data[i].total_amount,
                data[i].rate,
                data[i].cost_amount,
                data[i].express_fee,
                data[i].packing_fee,
                data[i].bill_amount,
                data[i].quantity
            ])
        }
    }
    return result?.affectedRows ? true : false
}

ordersGoodsRepo.deleteByDate = async (date) => {
    const sql = `DELETE FROM orders_goods WHERE \`date\` = ?`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

module.exports = ordersGoodsRepo