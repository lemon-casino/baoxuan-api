const { query, transaction } = require('../../model/dbConn')
const goodsPaymentsRepo = {}

goodsPaymentsRepo.batchInsert = async (date) => {
    let sql = `SELECT goods_id, IFNULL(SUM(pay_amount), 0) AS pay_amount, 
                IFNULL(SUM(brushing_amount), 0) AS brushing_amount, 
                IFNULL(SUM(brushing_qty), 0) AS brushing_qty, 
                IFNULL(SUM(refund_amount), 0) AS refund_amount, 
                IFNULL(SUM(express_fee), 0) AS pay_express_fee, 
                IFNULL(SUM(bill), 0) AS  bill
            FROM goods_pay_info WHERE \`date\` = ? GROUP BY goods_id`
    let rows = await query(sql, [date])
    if (!rows?.length) return false
    let sqls = [], params = [], data = []
    sql = `INSERT INTO goods_payments(goods_id, \`date\`, pay_amount, brushing_amount, 
        brushing_qty, refund_amount, pay_express_fee, bill) VALUES`
    for (let i = 0; i < rows.length; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?),`
        data.push(
            rows[i].goods_id, 
            date,
            rows[i].pay_amount, 
            rows[i].brushing_amount, 
            rows[i].brushing_qty, 
            rows[i].refund_amount, 
            rows[i].pay_express_fee, 
            rows[i].bill)
        
        sqls.push(`UPDATE goods_sales_stats SET pay_amount = ?, brushing_amount = ?, 
                brushing_qty = ?, refund_amount = ?, pay_express_fee = ?, bill = ? 
            WHERE goods_id = ? AND \`date\` = ?`)
        params.push([
            rows[i].pay_amount, 
            rows[i].brushing_amount, 
            rows[i].brushing_qty, 
            rows[i].refund_amount, 
            rows[i].pay_express_fee, 
            rows[i].bill, 
            rows[i].goods_id, 
            date
        ])
        sqls.push(`UPDATE goods_verifieds_stats SET pay_amount = ?, brushing_amount = ?, 
                brushing_qty = ?, refund_amount = ?, pay_express_fee = ?, real_pay_amount = ?, 
                bill = ? WHERE goods_id = ? AND \`date\` = ?`)
        params.push([
            rows[i].pay_amount, 
            rows[i].brushing_amount, 
            rows[i].brushing_qty, 
            rows[i].refund_amount, 
            rows[i].pay_express_fee, 
            (rows[i].pay_amount || 0) - (rows[i].brushing_amount || 0) - (rows[i].refund_amount || 0), 
            rows[i].bill, 
            rows[i].goods_id, 
            date
        ])
    }
    sql = sql.substring(0, sql.length - 1)
    sqls = [
        `DELETE FROM goods_payments WHERE \`date\` = ?`,
        sql
    ].concat(sqls)
    params = [[date], data].concat(params)
    const result = await transaction(sqls, params)
    return result
}

module.exports = goodsPaymentsRepo