const { query } = require('../../model/dbConn')
const goodsSkuRepo = {}

goodsSkuRepo.batchInsert = async (data, count) => {
    let sql = `INSERT INTO jst_goods_sku(
        shop_id, 
        shop_name,
        goods_id,
        sku_id,
        on_goods_id,
        on_sku_id,
        or_sku_id,
        on_sku_code,
        sys_goods_id,
        sys_sku_id,
        is_shelf,
        create_time) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

goodsSkuRepo.get = async (goods_id, sku_id) => {
    let sql = `SELECT * FROM jst_goods_sku WHERE goods_id = ? AND sku_id = ?`
    const result = await query(sql, [goods_id, sku_id])
    return result || []
}

goodsSkuRepo.update = async (data) => {
    let sql = `UPDATE jst_goods_sku SET on_goods_id = ?, on_sku_id = ?, 
        or_sku_id = ?, on_sku_code = ?, sys_goods_id = ?, sys_sku_id = ?, 
        is_shelf = ?, create_time = ? WHERE goods_id = ? AND sku_id = ?`
    const result = await query(sql, data)
    return result?.affectedRows ? true:false
}

goodsSkuRepo.getProcessInfoByTime = async (start, end, project) => {
    let sql = `SELECT s.on_goods_id, s.sys_goods_id, s.sys_sku_id, s.shop_name, o.spu_short_name, 
        p.io_date, s.create_time, d.operator, pi.id FROM jst_goods_sku s
        LEFT JOIN jst_purchase_info p ON s.sys_sku_id = p.sku_code
            AND p.io_date = (
                SELECT MAX(p1.io_date) FROM jst_purchase_info p1 WHERE p1.sku_code = p.sku_code
            )
        LEFT JOIN jst_ori_sku_info o ON o.sku_code = s.sys_sku_id 
        JOIN shop_info si ON si.shop_name = s.shop_name
        JOIN project_info pi ON pi.id = si.project_id
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.on_goods_id
	        AND d.operator NOT IN ('无操作', '非操作')
        WHERE s.create_time BETWEEN ? AND ? AND s.sys_sku_id IS NOT NULL`
    if (project) {
        sql = `${sql} AND pi.id IN (${project})`
    }
    let result = await query(sql, [start, end])
    return result
}

goodsSkuRepo.getProcessInfoByGoodsId = async (goods_id, project) => {
    let sql = `SELECT s.on_goods_id, s.sys_goods_id, s.sys_sku_id, s.shop_name, o.spu_short_name, 
        p.io_date, s.create_time, d.operator, pi.id FROM jst_goods_sku s
        LEFT JOIN jst_purchase_info p ON s.sys_sku_id = p.sku_code
            AND p.io_date = (
                SELECT MAX(p1.io_date) FROM jst_purchase_info p1 WHERE p1.sku_code = p.sku_code
            )
        LEFT JOIN jst_ori_sku_info o ON o.sku_code = s.sys_sku_id 
        JOIN shop_info si ON si.shop_name = s.shop_name
        JOIN project_info pi ON pi.id = si.project_id
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.on_goods_id
	        AND d.operator NOT IN ('无操作', '非操作')
        WHERE s.on_goods_id = ? AND s.sys_sku_id IS NOT NULL`
    if (project) {
        sql = `${sql} AND pi.id IN (${project})`
    }
    let result = await query(sql, [goods_id])
    return result
}

goodsSkuRepo.getBySysSkuId = async (sku_id) => {
    let sql = `SELECT goods_id, sys_sku_id AS sku_id, create_time FROM jst_goods_sku 
        WHERE sys_sku_id IN ("${sku_id}") AND is_shelf = '是' ORDER BY goods_id`
    let row = await query(sql)
    return row
}

goodsSkuRepo.getSalesBySysSkuId = async (start, end) => {
    const sql = `SELECT IFNULL(SUM(a.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(a.profit), 0) AS profit, 
            IFNULL(SUM(a.cost_amount), 0) AS cost_amount, 
            IFNULL(SUM(a.sale_qty), 0) AS sale_qty, 
            s.sys_sku_id AS sku_id, s.goods_id, di.division_name, s.create_time 
        FROM jst_goods_sku s LEFT JOIN goods_sale_info a ON s.sys_sku_id = a.sku_code 
            AND s.goods_id = a.goods_id
        LEFT JOIN shop_info si ON si.shop_name = s.shop_name 
        LEFT JOIN project_info pi ON pi.id = si.project_id 
        LEFT JOIN division_info di ON di.id = pi.division_id 
        WHERE s.create_time BETWEEN ? AND ? 
        GROUP BY s.sys_sku_id, s.goods_id, di.division_name, s.create_time`
    const result = await query(sql, [start, end])
    return result
}

goodsSkuRepo.getSales = async (skuids, goods_id) => {
    let sql = `SELECT IFNULL(SUM(a.sale_amount), 0) AS sale_amount, 
            IF(DATE_ADD(MIN(s.create_time), INTERVAL 30 DAY) >= NOW(), 1, 
            IF(DATE_ADD(MIN(s.create_time), INTERVAL 60 DAY) >= NOW(), 2, 3)) AS type, 
            DATEDIFF(NOW(), MIN(s.create_time)) AS time 
        FROM jst_goods_sku s LEFT JOIN goods_sale_info a ON s.sys_sku_id = a.sku_code 
            AND s.goods_id = a.goods_id
            AND a.date >= DATE_ADD(s.create_time, INTERVAL 14 DAY) 
        WHERE s.sys_sku_id IN ("${skuids}")`
    if (goods_id) {
        sql = `${sql} AND s.goods_id = "${goods_id}"`
    }
    sql = `${sql} GROUP BY s.sys_sku_id`
    const result = await query(sql)
    return result
}

module.exports = goodsSkuRepo