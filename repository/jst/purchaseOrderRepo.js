const { query } = require('../../model/dbConn')
const purchaseOrderRepo = {}

purchaseOrderRepo.batchInsert = async (data, count) => {
    let sql = `INSERT INTO jst_purchase_order(
        po_date, 
        po_id, 
        so_id, 
        remark, 
        status, 
        supplier_id, 
        seller, 
        purchaser_name, 
        sku_id, 
        i_id, 
        qty, 
        plan_arrive_qty, 
        price, 
        delivery_date, 
        confirm_date, 
        finish_time, 
        modified) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

purchaseOrderRepo.getBySkuCodeAndDate = async (po_id, sku_id) => {
    let sql = `SELECT * FROM jst_purchase_order WHERE po_id = ? and sku_id = ?`
    const result = await query(sql, [po_id, sku_id])
    return result || []
}

purchaseOrderRepo.update = async (data) => {
    let sql = `UPDATE jst_purchase_order SET remark = ?, status = ?, 
            confirm_date = ?, finish_time = ?, modified = ? 
        WHERE po_id = ? AND sku_id = ?`
    const result = await query(sql, data)
    return result?.affectedRows ? true:false
}

module.exports = purchaseOrderRepo