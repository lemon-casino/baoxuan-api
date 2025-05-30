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

module.exports = goodsSkuRepo