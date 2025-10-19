const { query } = require('../../model/dbConn')
const purchaseRepo = {}

purchaseRepo.batchInsert = async (data, count) => {
    let sql = `INSERT INTO jst_purchase_info(
        po_id,
        io_date,
        warehouse,
        io_id,
        sku_code,
        goods_code,
        io_qty,
        io_amount) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?),`
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
        goods_code = ?, io_qty = ?, io_amount = ? 
        WHERE po_id = ? AND io_id = ? AND sku_code = ?
        `
    const result = await query(sql, data)
    return result?.affectedRows ? true:false
}

purchaseRepo.getOrderBySkuCode = async (sku_code) => {
    let sql = `SELECT sku_id, MIN(confirm_date) AS create_time FROM jst_purchase_order 
        WHERE sku_id IN ("${sku_code}") AND confirm_date IS NOT NULL GROUP BY sku_id`
    const result = await query(sql)
    return result || []
}

purchaseRepo.getOrderingBySkuCode = async (sku_code) => {
    let sql = `SELECT sku_id, MIN(confirm_date) AS create_time FROM jst_purchase_order 
        WHERE sku_id IN ("${sku_code}") AND confirm_date IS NOT NULL 
            AND finish_time IS NULL GROUP BY sku_id`
    const result = await query(sql)
    return result || []
}

purchaseRepo.getShelfingBySkuCode = async (sku_code) => {
    let sql = `SELECT sku_code, MIN(io_date) as io_date FROM jst_purchase_info 
        WHERE sku_code IN ("${sku_code}") AND NOT EXISTS(
            SELECT * FROM jst_goods_sku s 
            LEFT JOIN danpin.combination_product_code pc ON pc.\`组合商品编码\` = s.sys_sku_id
            WHERE (s.sys_sku_id IN ("${sku_code}") OR pc.\`商品编码\` IN ("${sku_code}")) 
                AND s.is_shelf = '是'
        ) GROUP BY sku_code`
    const result = await query(sql)
    return result || []
}

module.exports = purchaseRepo