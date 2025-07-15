const { query } = require('../../model/dbConn')
const returnRepo = {}
returnRepo.batchInsert = async (data, count) => {
    let sql = `INSERT INTO jst_purchase_return(
        return_id,
        return_date,
        warehouse,
        supplier,
        sku_code,
        goods_code,
        qty,
        amount) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

returnRepo.get = async (po_id, io_id, goods_code) => {
    let sql = `SELECT * FROM jst_purchase_return 
        WHERE return_id = ? AND sku_code = ?`
    const result = await query(sql, [po_id, io_id, goods_code])
    return result || []
}

returnRepo.getBySkuCode = async (sku_code) => {
    let sql = `SELECT sku_code, MIN(return_date) as return_date FROM jst_purchase_return 
        WHERE sku_code IN ("${sku_code}") GROUP BY sku_code`
    const result = await query(sql)
    return result || []
}

returnRepo.update = async (data) => {
    let sql = `UPDATE jst_purchase_return SET return_date = ?, warehouse = ?, 
        supplier = ?, io_qty = ?, io_amount = ?, goods_code = ?
        WHERE po_id = ? AND sku_code = ?
        `
    const result = await query(sql, data)
    return result?.affectedRows ? true:false
}

module.exports = returnRepo