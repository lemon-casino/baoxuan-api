const { query } = require('../../model/dbConn')
const moment = require('moment')

const goodsPayInfoRepo = {}

goodsPayInfoRepo.batchInsert = async (count, data) => {
    let sql = `INSERT INTO goods_pay_info(
            goods_id, 
            sku_id, 
            sku_code, 
            shop_name, 
            shop_id, 
            \`date\`, 
            pay_amount, 
            brushing_amount, 
            refund_amount, 
            express_fee,
            bill) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

goodsPayInfoRepo.deleteByDate = async (date) => {
    let sql = `DELETE FROM goods_pay_info WHERE \`date\` = ?`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

goodsPayInfoRepo.updateBrushingQty = async (goods_id, brushing_qty, date) => {
    let sql = `UPDATE goods_pay_info SET brushing_qty = ? WHERE \`date\` = ?
        AND goods_id = ?`
    const result = await query(sql, [brushing_qty, date, goods_id])
    return result?.affectedRows ? true : false
}

goodsPayInfoRepo.resetBrushingQty = async (date) => {
    let sql = `UPDATE goods_pay_info SET brushing_qty = NULL WHERE \`date\` = ?`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

goodsPayInfoRepo.getDataDetailByTime = async (column, goods_id, start, end) => {
    const sql = `SELECT IFNULL(SUM(${column}), 0) AS ${column}, \`date\` 
        FROM goods_pay_info WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id = ?
        GROUP BY \`date\``
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsPayInfoRepo.getExpressFeeByTime = async (goods_id, start, end) => {
    const sql = `SELECT IFNULL(SUM(express_fee), 0) AS pay_express_fee, \`date\` 
        FROM goods_pay_info WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id = ?
        GROUP BY \`date\``
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsPayInfoRepo.getRealPayAmountByTime = async (goods_id, start, end) => {
    const sql = `SELECT IFNULL(SUM(pay_amount), 0) - IFNULL(SUM(brushing_amount), 0) 
            AS real_pay_amount, \`date\` FROM goods_pay_info 
        WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id = ?
        GROUP BY \`date\``
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsPayInfoRepo.getQOQ2ByTime = async (goods_id, start, end) => {
    const sql = `SELECT FORMAT(IF(IFNULL(SUM(a2.pay_amount), 0) > 0, 
                (IFNULL(SUM(a1.pay_amount), 0) - SUM(a2.pay_amount)) / 
                SUM(a2.pay_amount), 0), 2) AS qoq2, a1.date 
        FROM goods_pay_info a1 LEFT JOIN goods_pay_info a2 ON a1.goods_id = a2.goods_id
                AND a1.date = DATE_ADD(a2.date, INTERVAL 2 DAY)
        WHERE a1.date >= ? AND a1.date <= ? AND a1.goods_id = ?
        GROUP BY a1.date`
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsPayInfoRepo.getQOQ30ByTime = async (goods_id, start, end) => {
    let sql = '', days = moment(end).diff(moment(start), 'day')
    for (let i = 0; i <= days; i++) {
        let time = moment(start).add(i, 'day').format('YYYY-MM-DD')
        sql = `${sql}
            SELECT FORMAT(IF(IFNULL(SUM(a2.pay_amount), 0) > 0, 
                (IFNULL(SUM(a1.pay_amount), 0) - SUM(a2.pay_amount)) / 
                SUM(a2.pay_amount), 0), 2) AS qoq2, '${time}' AS date 
            FROM goods_pay_info a1 LEFT JOIN goods_pay_info a2 ON a1.goods_id = a2.goods_id
                AND a1.date = DATE_ADD(a2.date, INTERVAL 30 DAY)
            WHERE DATE_SUB("${time}", INTERVAL 30 DAY) >= a1.date
                AND DATE_SUB("${time}", INTERVAL 1 DAY) <= a1.date
                AND a1.goods_id = "${goods_id}" 
            UNION ALL `
    }
    sql = sql.substring(0, sql.length - 10)
    const result = await query(sql)
    return result || []
}

module.exports = goodsPayInfoRepo