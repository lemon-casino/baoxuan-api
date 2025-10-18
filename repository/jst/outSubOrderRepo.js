const { query } = require('../../model/localDbConn')
const outSubOrderRepo = {}

outSubOrderRepo.create = async (data, count) => {
    let sql = `INSERT INTO jst_out_sub_order_info(shop_id, io_id, ioi_id, pic, sku_id, qty, 
        name, properties_value, sale_price, oi_id, sale_amount, i_id, unit, sale_base_price, 
        combine_sku_id, is_gift, outer_oi_id, raw_so_id, batch_id, product_date, 
        supplier_id, expiration_date) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result || []
}

outSubOrderRepo.updateByIdAndShopId = async (data) => {
    let sql = `UPDATE jst_out_sub_order_info SET ioi_id = ?, pic = ?, sku_id = ?, qty = ?, 
        name = ?, properties_value = ?, sale_price = ?, oi_id = ?, sale_amount = ?, 
        i_id = ?, unit = ?, sale_base_price = ?, combine_sku_id = ?, is_gift = ?, 
        raw_so_id = ?, batch_id = ?, product_date = ?, supplier_id = ?, expiration_date = ? 
        WHERE outer_oi_id = ? AND shop_id = ?`
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

outSubOrderRepo.getByIoIdAndIoiId = async (io_id, ioi_id) => {
    let sql = `SELECT ioi_id FROM jst_out_sub_order_info WHERE io_id = ? 
        AND ioi_id = ?`
    let result = await query(sql, [io_id, ioi_id])
    return result
}

module.exports = outSubOrderRepo