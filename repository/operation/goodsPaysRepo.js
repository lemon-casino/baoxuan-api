const { query, transaction } = require('../../model/dbConn')
const goodsPaysRepo = {}

goodsPaysRepo.batchInsert = async (date) => {
    let sqls = [], params = []
    sqls.push(`DELETE FROM goods_pays WHERE \`date\` = ? AND shop_name !='京东自营-厨具' AND shop_name !='京东自营-日用'`)
    params.push([date])
    let sql = `SELECT goods_id, shop_name, shop_id, \`date\`, 
            IFNULL(SUM(pay_amount), 0) AS pay_amount, 
            IFNULL(SUM(brushing_amount), 0) AS brushing_amount, 
            IFNULL(SUM(brushing_qty), 0) AS brushing_qty, 
            IFNULL(SUM(refund_amount), 0) AS refund_amount, 
            IFNULL(SUM(bill), 0) AS bill_amount,
            IFNULL(SUM(sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(cost_amount), 0) AS cost_amount, 
            IFNULL(SUM(gross_profit), 0) AS gross_profit, 
            IFNULL(SUM(profit), 0) AS profit, 
            IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
            IFNULL(SUM(operation_amount), 0) AS operation_amount, 
            IFNULL(SUM(refund_qty), 0) AS refund_qty, 
            IFNULL(SUM(sale_qty), 0) AS sale_qty, 
            IFNULL(SUM(express_fee), 0) AS express_fee, 
            IFNULL(SUM(packing_fee), 0) AS packing_fee, 
            IFNULL(SUM(order_num), 0) AS order_num, 
            IFNULL(SUM(refund_num), 0) AS refund_num  
        FROM goods_pay_info WHERE \`date\` = ? AND shop_name !='京东自营-厨具' AND shop_name !='京东自营-日用'
        GROUP BY goods_id, shop_name, shop_id, \`date\``
    let rows = await query(sql, [date]), start, end
    if (!rows?.length) return false
    let chunk = Math.ceil(rows.length / 500)
    for (let i = 0; i < chunk; i++) {
        sql = `INSERT INTO goods_pays(goods_id, shop_name, shop_id, \`date\`, pay_amount, 
        brushing_amount, brushing_qty, refund_amount, bill_amount, sale_amount, 
        cost_amount, gross_profit, profit, promotion_amount, operation_amount, 
        refund_qty, sale_qty, express_fee, packing_fee, order_num, refund_num) VALUES`, 
        start = i * 500, data = [], 
        end = (i + 1) * 500 <= rows.length ? (i + 1) * 500 : rows.length
        for (let j = start; j < end; j++) {
            sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
            data.push(
                rows[j].goods_id, 
                rows[j].shop_name,
                rows[j].shop_id,
                date, 
                rows[j].pay_amount, 
                rows[j].brushing_amount, 
                rows[j].brushing_qty, 
                rows[j].refund_amount, 
                rows[j].bill_amount,
                rows[j].sale_amount,
                rows[j].cost_amount,
                rows[j].gross_profit,
                rows[j].profit,
                rows[j].promotion_amount,
                rows[j].operation_amount,
                rows[j].refund_qty, 
                rows[j].sale_qty, 
                rows[j].express_fee, 
                rows[j].packing_fee, 
                rows[j].order_num, 
                rows[j].refund_num)
        }
        sql = sql.substring(0, sql.length - 1)
        sqls.push(sql)
        params.push(data)
    }
    const result = await transaction(sqls, params)
    return result
}

goodsPaysRepo.batchInsertJD = async (date,shop_name) => {
    let sqls = [], params = []
    sqls.push(`DELETE FROM goods_pays WHERE \`date\` = ? AND shop_name IN ('京东自营-厨具','京东自营-日用')`)
    params.push([date])
    let sql = `SELECT goods_id, shop_name, shop_id, \`date\`, 
            IFNULL(SUM(pay_amount), 0) AS pay_amount, 
            IFNULL(SUM(brushing_amount), 0) AS brushing_amount, 
            IFNULL(SUM(brushing_qty), 0) AS brushing_qty, 
            IFNULL(SUM(refund_amount), 0) AS refund_amount, 
            IFNULL(SUM(bill), 0) AS bill_amount,
            IFNULL(SUM(sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(cost_amount), 0) AS cost_amount, 
            IFNULL(SUM(gross_profit), 0) AS gross_profit, 
            IFNULL(SUM(profit), 0) AS profit, 
            IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
            IFNULL(SUM(operation_amount), 0) AS operation_amount, 
            IFNULL(SUM(refund_qty), 0) AS refund_qty, 
            IFNULL(SUM(sale_qty), 0) AS sale_qty, 
            IFNULL(SUM(express_fee), 0) AS express_fee, 
            IFNULL(SUM(packing_fee), 0) AS packing_fee,
            IFNULL(SUM(gross_standard), 0) AS gross_standard,
            IFNULL(SUM(IF(other_cost>0,other_cost,0)),0) AS other_cost
        FROM goods_pay_info WHERE \`date\` = ? AND shop_name IN ('京东自营-厨具','京东自营-日用')
        GROUP BY goods_id, shop_name, shop_id, \`date\``
    let rows = await query(sql, [date]), start, end
    if (!rows?.length) return false
    let chunk = Math.ceil(rows.length / 500)
    for (let i = 0; i < chunk; i++) {
        sql = `INSERT INTO goods_pays(goods_id, shop_name, shop_id, \`date\`, pay_amount, 
        brushing_amount, brushing_qty, refund_amount, bill_amount, sale_amount, 
        cost_amount, gross_profit, profit, promotion_amount, operation_amount, 
        refund_qty, sale_qty, express_fee, packing_fee,gross_standard,other_cost) VALUES`,
        start = i * 500, data = [], 
        end = (i + 1) * 500 <= rows.length ? (i + 1) * 500 : rows.length
        for (let j = start; j < end; j++) {
            sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
            data.push(
                rows[j].goods_id, 
                rows[j].shop_name,
                rows[j].shop_id,
                date, 
                rows[j].pay_amount, 
                rows[j].brushing_amount, 
                rows[j].brushing_qty, 
                rows[j].refund_amount, 
                rows[j].bill_amount,
                rows[j].sale_amount,
                rows[j].cost_amount,
                rows[j].gross_profit,
                rows[j].profit,
                rows[j].promotion_amount,
                rows[j].operation_amount,
                rows[j].refund_qty, 
                rows[j].sale_qty, 
                rows[j].express_fee, 
                rows[j].packing_fee,
                rows[j].gross_standard,
                rows[j].other_cost)
        }
        sql = sql.substring(0, sql.length - 1)
        sqls.push(sql)
        params.push(data)
    }
    const result = await transaction(sqls, params)
    return result
}

goodsPaysRepo.getnegativeProfit =async(goods_id) =>{
    const sql = `SELECT DATE_FORMAT(date,'%Y-%m-%d') AS date
			,sale_amount
			,promotion_amount
			,operation_amount
			,cost_amount
			,profit
			,profit
			,CONCAT(ROUND(profit/sale_amount*100,2),'%') as profit_rate
        FROM goods_pays
        WHERE profit<0 AND goods_id = ?
        AND date BETWEEN DATE_SUB(CURRENT_DATE,INTERVAL 30 DAY) and DATE_SUB(CURRENT_DATE,INTERVAL 1 DAY)`
    const result = await query(sql,[goods_id])
    return result
}
module.exports = goodsPaysRepo