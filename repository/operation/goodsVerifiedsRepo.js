const { query, transaction } = require('../../model/dbConn')
const goodsVerifiedsRepo = {}

goodsVerifiedsRepo.batchInsert = async (date) => {
    let sqls = [], params = []
    sqls.push(`DELETE FROM goods_verifieds WHERE \`date\` = ?`)
    params.push([date])
    let sql = `SELECT goods_id, shop_name, 
            IFNULL(SUM(sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(cost_amount), 0) AS cost_amount,
            IFNULL(SUM(gross_profit), 0) AS gross_profit,
            IFNULL(SUM(profit), 0) AS profit,
            IFNULL(SUM(promotion_amount), 0) AS promotion_amount,
            IFNULL(SUM(express_fee), 0) AS express_fee,
            IFNULL(SUM(operation_amount), 0) AS operation_amount,
            IFNULL(SUM(real_sale_qty), 0) AS real_sale_qty,
            IFNULL(SUM(refund_qty), 0) AS refund_qty,
            IFNULL(SUM(real_sale_amount), 0) AS real_sale_amount,
            IFNULL(SUM(packing_fee), 0) AS packing_fee,
            IFNULL(SUM(bill_amount), 0) AS bill_amount,
            IFNULL(SUM(order_num), 0) AS order_num,
            IFNULL(SUM(refund_num), 0) AS refund_num
        FROM goods_sale_verified WHERE date = ? GROUP BY goods_id, shop_name`
    let rows = await query(sql, [date]), data = []
    if (!rows?.length) return false
    sql = `INSERT INTO goods_verifieds(
            goods_id, 
            shop_name, 
            \`date\`, 
            sale_amount, 
            cost_amount, 
            gross_profit, 
            profit, 
            promotion_amount, 
            express_fee, 
            operation_amount, 
            real_sale_qty, 
            refund_qty, 
            real_sale_amount, 
            packing_fee, 
            bill_amount, 
            order_num, 
            refund_num) VALUES`
    for (let i = 0; i < rows.length; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
        data.push(
            rows[i].goods_id, 
            rows[i].shop_name, 
            date, 
            rows[i].sale_amount, 
            rows[i].cost_amount, 
            rows[i].gross_profit, 
            rows[i].profit, 
            rows[i].promotion_amount, 
            rows[i].express_fee, 
            rows[i].operation_amount, 
            rows[i].real_sale_qty, 
            rows[i].refund_qty, 
            rows[i].real_sale_amount, 
            rows[i].packing_fee, 
            rows[i].bill_amount, 
            rows[i].order_num, 
            rows[i].refund_num
        )
    }
    sql = sql.substring(0, sql.length - 1)
    sqls.push(sql)
    params.push(data)
    const result = await transaction(sqls, params)
    return result
}

goodsVerifiedsRepo.delete = async (date) => {
    const sql = `DELETE FROM goods_verifieds WHERE \`date\` = ?`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

module.exports = goodsVerifiedsRepo