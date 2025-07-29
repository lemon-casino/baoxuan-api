const { query, transaction } = require('../../model/dbConn')
const goodsPaysRepo = {}

goodsPaysRepo.batchInsert = async (date) => {
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
            IFNULL(SUM(packing_fee), 0) AS packing_fee 
        FROM goods_pay_info WHERE \`date\` = ? AND shop_name !='京东自营-厨具' AND shop_name !='京东自营-日用'
        GROUP BY goods_id, shop_name, shop_id, \`date\``
    let rows = await query(sql, [date])
    if (!rows?.length) return false
    let sqls = [], params = [], data = []
    sql = `INSERT INTO goods_pays(goods_id, shop_name, shop_id, \`date\`, pay_amount, 
        brushing_amount, brushing_qty, refund_amount, bill_amount, sale_amount, 
        cost_amount, gross_profit, profit, promotion_amount, operation_amount, 
        refund_qty, sale_qty, express_fee, packing_fee) VALUES`
    for (let i = 0; i < rows.length; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
        data.push(
            rows[i].goods_id, 
            rows[i].shop_name,
            rows[i].shop_id,
            date, 
            rows[i].pay_amount, 
            rows[i].brushing_amount, 
            rows[i].brushing_qty, 
            rows[i].refund_amount, 
            rows[i].bill_amount,
            rows[i].sale_amount,
            rows[i].cost_amount,
            rows[i].gross_profit,
            rows[i].profit,
            rows[i].promotion_amount,
            rows[i].operation_amount,
            rows[i].refund_qty, 
            rows[i].sale_qty, 
            rows[i].express_fee, 
            rows[i].packing_fee)
    }
    sql = sql.substring(0, sql.length - 1)
    sqls = [
        `DELETE FROM goods_pays WHERE \`date\` = ? AND shop_name !='京东自营-厨具' AND shop_name !='京东自营-日用'`,
        sql
    ].concat(sqls)
    params = [[date], data].concat(params)
    const result = await transaction(sqls, params)
    return result
}

goodsPaysRepo.batchInsertJD = async (date,shop_name) => {
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
            IFNULL(SUM(packing_fee), 0) AS packing_fee 
        FROM goods_pay_info WHERE \`date\` = ? AND shop_name = '${shop_name}'
        GROUP BY goods_id, shop_name, shop_id, \`date\``
    let rows = await query(sql, [date,shop_name])
    if (!rows?.length) return false
    let sqls = [], params = [], data = []
    sql = `INSERT INTO goods_pays(goods_id, shop_name, shop_id, \`date\`, pay_amount, 
        brushing_amount, brushing_qty, refund_amount, bill_amount, sale_amount, 
        cost_amount, gross_profit, profit, promotion_amount, operation_amount, 
        refund_qty, sale_qty, express_fee, packing_fee) VALUES`
    for (let i = 0; i < rows.length; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
        data.push(
            rows[i].goods_id, 
            rows[i].shop_name,
            rows[i].shop_id,
            date, 
            rows[i].pay_amount, 
            rows[i].brushing_amount, 
            rows[i].brushing_qty, 
            rows[i].refund_amount, 
            rows[i].bill_amount,
            rows[i].sale_amount,
            rows[i].cost_amount,
            rows[i].gross_profit,
            rows[i].profit,
            rows[i].promotion_amount,
            rows[i].operation_amount,
            rows[i].refund_qty, 
            rows[i].sale_qty, 
            rows[i].express_fee, 
            rows[i].packing_fee)
    }
    sql = sql.substring(0, sql.length - 1)
    sqls = [
        `DELETE FROM goods_pays WHERE \`date\` = ? AND shop_name = '${shop_name}'`,
        sql
    ].concat(sqls)
    params = [[date], data].concat(params)
    const result = await transaction(sqls, params)
    return result
}
module.exports = goodsPaysRepo