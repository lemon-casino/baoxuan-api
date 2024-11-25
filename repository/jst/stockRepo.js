const { query } = require('../../model/dbConn')
const moment = require('moment')
const stockRepo = {}

stockRepo.create = async (data, count) => {
    let sql = `INSERT INTO jst_stock_info(sku_id, ts, i_id, qty, order_lock, 
        pick_lock, virtual_qty, purchase_qty, return_qty, in_qty, defective_qty, 
        modified, min_qty, max_qty, lock_qty, name, customize_qty_1, 
        customize_qty_2, customize_qty_3, allocate_qty, sale_refund_qty) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result || []
}

stockRepo.truncate = async () => {
    const sql = `TRUNCATE jst_stock_info`
    const result = await query(sql)
    return result
}

stockRepo.getStockSales = async () => {
    let month_start = moment().subtract(30, 'day').format('YYYY-MM-DD')
    let end = moment().format('YYYY-MM-DD')
    let now = moment().format('YYYY-MM-DD HH:mm:ss')
    let week_start = moment().subtract(7, 'day').format('YYYY-MM-DD')
    let yesterday_start = moment().subtract(1, 'day').format('YYYY-MM-DD')
    const sql = `SELECT jst.other_1, jst.other_2, jst.other_3, jst.other_4, 
            IF(jst.other_2, MONTH(jst.other_2), NULL) as other_2_month, a.*, 
            jst.name, jst1.sku_id, jst.i_id, IFNULL(jst1.qty, 0) AS qty FROM 
        jst_sku_info jst LEFT JOIN jst_stock_info jst1 ON jst.sku_id = jst1.sku_id 
        LEFT JOIN (
                SELECT SUM(IF(jooi.created >= "${month_start}" AND 
                    jooi.created < "${end}", josoi.qty, 0)) AS month_sale, 
                SUM(IF(jooi.created >= "${week_start}" AND 
                    jooi.created < "${end}", josoi.qty, 0)) AS week_sale, 
                SUM(IF(jooi.created >= "${yesterday_start}" AND 
                    jooi.created < "${end}", josoi.qty, 0)) AS yesterday_sale, 
                SUM(IF(jooi.created >= "${end}" AND 
                    jooi.created < "${now}", josoi.qty, 0)) AS today_sale,  
                jst.sku_id FROM jst_sku_info jst 
            LEFT JOIN jst_out_sub_order_info josoi ON josoi.sku_id = jst.sku_id 
            LEFT JOIN jst_out_order_info jooi ON jooi.shop_id = josoi.shop_id 
                AND jooi.io_id = josoi.io_id
            WHERE jooi.created >= "${month_start}"
                AND jooi.created < "${now}" 
                AND jooi.labels NOT LIKE '%特殊单%' GROUP BY jst.sku_id
        ) a ON jst.sku_id = a.sku_id`
    const result = await query(sql)
    return result || []
}

module.exports = stockRepo