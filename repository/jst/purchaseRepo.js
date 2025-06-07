const { query } = require('../../model/dbConn')
const purchaseRepo = {}

purchaseRepo.batchInsert = async (data, count) => {
    let sql = `INSERT INTO jst_purchase_info(
        po_id,
        io_date,
        warehouse,
        io_id,
        sku_code,
        goods_code) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

purchaseRepo.get = async (po_id, io_id, goods_code) => {
    let sql = `SELECT * FROM jst_purchase_info 
        WHERE po_id = ? AND io_id = ? AND sku_code = ?`
    const result = await query(sql, [po_id, io_id, goods_code])
    return result || []
}

purchaseRepo.getBySkuCode = async (sku_code) => {
    let sql = `SELECT sku_code, MIN(io_date) as io_date FROM jst_purchase_info 
        WHERE sku_code IN ("${sku_code}") GROUP BY sku_code`
    const result = await query(sql)
    return result || []
}

purchaseRepo.update = async (data) => {
    let sql = `UPDATE jst_purchase_info SET io_date = ?, warehouse = ?, 
        goods_code = ? WHERE po_id = ? AND io_id = ? AND sku_code = ?`
    const result = await query(sql, data)
    return result?.affectedRows ? true:false
}

module.exports = purchaseRepo