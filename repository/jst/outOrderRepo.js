const { query } = require('../../model/dbConn')
const outOrderRepo = {}

outOrderRepo.create = async (data, count) => {
    let sql = `INSERT INTO jst_out_order_info(co_id, shop_id, io_id, o_id, so_id, 
        created, modified, status, order_type, invoice_title, shop_buyer_id, open_id, 
        receiver_country, receiver_state, receiver_city, receiver_district, 
        receiver_town, receiver_address, receiver_name, receiver_phone, receiver_mobile, 
        buyer_message, remark, is_cod, pay_amount, l_id, io_date, lc_id, stock_enabled, 
        drp_co_id_from, labels, paid_amount, free_amount, freight, weight, f_weight, 
        merge_so_id, wms_co_id, business_staff, currency, pay_date, logistics_company, 
        wave_id, seller_flag, order_staff_id, order_staff_name, node) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,
            ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result || []
}

outOrderRepo.updateByIdAndShopId = async (data) => {
    let sql = `UPDATE jst_out_order_info SET modified = ?, status = ?, invoice_title = ?, 
        shop_buyer_id = ?, open_id = ?, receiver_country = ?, receiver_state = ?, 
        receiver_city = ?, receiver_district = ?, receiver_town = ?, receiver_address = ?, 
        receiver_name = ?, receiver_phone = ?, receiver_mobile = ?, buyer_message = ?, 
        remark = ?, l_id = ?, io_date = ?, lc_id = ?, stock_enabled = ?, drp_co_id_from = ?, 
        labels = ?, weight = ?, f_weight = ?, merge_so_id = ?, business_staff = ?, 
        logistics_company = ?, wave_id = ?, seller_flag = ?, order_staff_id = ?, 
        order_staff_name = ?, node = ? WHERE io_id = ? AND shop_id = ?`
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

outOrderRepo.getSalesByTime = async (start, end) => {
    const sql = `SELECT SUM(josoi.qty) AS sale, si.project_id, si.shop_name, josoi.sku_id, 
            josoi.name, josoi.i_id FROM shop_info si 
        LEFT JOIN jst_out_order_info jooi ON jooi.shop_id = si.shop_id
        LEFT JOIN jst_out_sub_order_info josoi ON josoi.shop_id = jooi.shop_id 
            AND josoi.io_id = jooi.io_id
        WHERE si.project_id in (1,2,5,14) 
            AND jooi.created >= "${start}"
            AND jooi.created < "${end}" 
            AND jooi.labels NOT LIKE '%特殊单%'
        GROUP BY si.project_id, si.shop_name, josoi.sku_id, josoi.name, josoi.i_id`
    const result = await query(sql)
    return result || []
}

outOrderRepo.getByIoId = async (io_id) => {
    let sql = `SELECT io_id FROM jst_out_order_info WHERE io_id = ?`
    let result = await query(sql, [io_id])
    return result
}

module.exports = outOrderRepo