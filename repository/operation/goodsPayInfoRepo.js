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

module.exports = goodsPayInfoRepo