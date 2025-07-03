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

goodsSkuRepo.getSalesBySysSkuId = async (start, end, info) => {
    const sql = `SELECT IFNULL(SUM(a.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(a.profit), 0) AS profit, 
            IFNULL(SUM(a.cost_amount), 0) AS cost_amount, 
            IFNULL(SUM(a.sale_qty), 0) AS sale_qty, 
            s1.sku_id, s1.goods_id, s1.spu, di.division_name, s1.create_time, 
            s1.purchase_time, s1.first_category, s1.second_category, 
            s1.third_category, s1.director, s1.price, pi.project_name, s1.shop_name FROM (        
            SELECT s.sku_id, s.goods_id, s.create_time, s.shop_name, 
                gi.\`工期\` AS purchase_time, gi.\`spu简称\` AS spu, 
                gi.\`一级类目\` AS first_category, 
                gi.\`二级类目\` AS second_category, 
                gi.\`三级类目\` AS third_category, gi.\`开发员\` AS director, 
                gi.\`市场|吊牌价\` AS price FROM (
                    SELECT a2.goods_id, a2.shop_name, IF(pc.\`商品编码\` IS NOT NULL, 
                        pc.\`商品编码\`, a2.sys_sku_id) AS sku_id, a1.create_time FROM (
                        SELECT sys_sku_id, MIN(create_time) AS create_time 
                        FROM jst_goods_sku GROUP BY sys_sku_id
                    ) a1 LEFT JOIN jst_goods_sku a2 ON a1.sys_sku_id = a2.sys_sku_id
                    LEFT JOIN danpin.combination_product_code pc ON pc.\`组合商品编码\` = a1.sys_sku_id
                    WHERE a1.create_time BETWEEN ? AND ?
                    GROUP BY a2.goods_id, a2.shop_name, IF(pc.\`商品编码\` IS NOT NULL, 
                        pc.\`商品编码\`, a2.sys_sku_id), a1.create_time 
                ) s 
            JOIN danpin.goods_info gi ON gi.\`商品编码\` = s.sku_id) s1 
        LEFT JOIN goods_sale_info a ON s1.sku_id = a.sku_code 
            AND s1.goods_id = a.goods_id 
        LEFT JOIN shop_info si ON si.shop_name = s1.shop_name 
        LEFT JOIN project_info pi ON pi.id = si.project_id 
        LEFT JOIN division_info di ON di.id = pi.division_id 
        GROUP BY s1.sku_id, s1.goods_id, s1.spu, di.division_name, s1.create_time, 
            s1.purchase_time, s1.first_category, s1.second_category, 
            s1.third_category, s1.director, s1.price, pi.project_name, s1.shop_name
        ORDER BY s1.${info}`
    const result = await query(sql, [start, end])
    return result
}

goodsSkuRepo.getSalesBySysSkuId1 = async (start, end) => {
    const sql = `SELECT IFNULL(SUM(s2.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(s2.profit), 0) AS profit, gi.\`开发员\` AS director, 
            COUNT(DISTINCT s1.goods_id) AS shelf_link_num 
        FROM (SELECT a2.goods_id, IF(pc.\`商品编码\` IS NOT NULL, 
            pc.\`商品编码\`, a2.sys_sku_id) AS sku_id FROM (
            SELECT sys_sku_id, MIN(create_time) AS create_time 
            FROM jst_goods_sku GROUP BY sys_sku_id
        ) a1 LEFT JOIN jst_goods_sku a2 ON a1.sys_sku_id = a2.sys_sku_id
        LEFT JOIN danpin.combination_product_code pc ON pc.\`组合商品编码\` = a1.sys_sku_id
        WHERE DATE_ADD(a1.create_time, INTERVAL 150 DAY) > ? 
        GROUP BY a2.goods_id, IF(pc.\`商品编码\` IS NOT NULL, 
            pc.\`商品编码\`, a2.sys_sku_id), a1.create_time) s1
        JOIN danpin.goods_info gi ON gi.\`商品编码\` = s1.sku_id
        JOIN goods_sale_info s2 ON s2.goods_id = s1.goods_id AND s2.sku_code = s1.sku_id
            AND s2.date BETWEEN ? AND ? GROUP BY gi.\`开发员\``
    const result = await query(sql, [end, start, end])
    return result
}

goodsSkuRepo.getSalesBySysSkuId2 = async (start, end) => {
    const sql = `SELECT IFNULL(SUM(s2.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(s2.profit), 0) AS profit, gi.\`开发员\` AS director, 
            COUNT(DISTINCT s1.goods_id) AS shelf_link_num 
        FROM (SELECT a2.goods_id, IF(pc.\`商品编码\` IS NOT NULL, 
            pc.\`商品编码\`, a2.sys_sku_id) AS sku_id, a1.create_time FROM (
            SELECT sys_sku_id, MIN(create_time) AS create_time 
            FROM jst_goods_sku GROUP BY sys_sku_id
        ) a1 LEFT JOIN jst_goods_sku a2 ON a1.sys_sku_id = a2.sys_sku_id
        LEFT JOIN danpin.combination_product_code pc ON pc.\`组合商品编码\` = a1.sys_sku_id
        WHERE a1.create_time BETWEEN ? AND ? 
        GROUP BY a2.goods_id, IF(pc.\`商品编码\` IS NOT NULL, 
            pc.\`商品编码\`, a2.sys_sku_id), a1.create_time) s1
        JOIN danpin.goods_info gi ON gi.\`商品编码\` = s1.sku_id
        JOIN goods_sale_info s2 ON s2.goods_id = s1.goods_id AND s2.sku_code = s1.sku_id
            AND s2.date < DATE_ADD(s1.create_time, INTERVAL 150 DAY) 
        GROUP BY gi.\`开发员\``
    const result = await query(sql, [start, end])
    return result
}

goodsSkuRepo.getSales = async (skuids, start, end, goods_id) => {
    let sql = `SELECT IFNULL(SUM(s2.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(s2.profit), 0) AS profit, 
            IF(DATE_ADD(MIN(s1.create_time), INTERVAL 30 DAY) >= NOW(), 1, 
            IF(DATE_ADD(MIN(s1.create_time), INTERVAL 60 DAY) >= NOW(), 2, 
            IF(DATE_ADD(MIN(s1.create_time), INTERVAL 90 DAY) >= NOW(), 3, 4))) AS type 
        FROM (SELECT a2.goods_id, IF(pc.\`商品编码\` IS NOT NULL, 
            pc.\`商品编码\`, a2.sys_sku_id) AS sku_id, a1.create_time FROM (
            SELECT sys_sku_id, MIN(create_time) AS create_time 
            FROM jst_goods_sku GROUP BY sys_sku_id
        ) a1 LEFT JOIN jst_goods_sku a2 ON a1.sys_sku_id = a2.sys_sku_id
        LEFT JOIN danpin.combination_product_code pc ON pc.\`组合商品编码\` = a1.sys_sku_id
        WHERE a1.create_time BETWEEN ? AND ?
        GROUP BY a2.goods_id, IF(pc.\`商品编码\` IS NOT NULL, 
            pc.\`商品编码\`, a2.sys_sku_id), a1.create_time) s1
        JOIN goods_sale_info s2 ON s2.goods_id = s1.goods_id AND s2.sku_code = s1.sku_id
		WHERE s1.sku_id in ("${skuids}")`
    if (goods_id) {
        sql = `${sql} AND s1.goods_id = "${goods_id}"`
    }
    sql = `${sql} GROUP BY s1.sku_id`
    const result = await query(sql, [start, end])
    return result
}

goodsSkuRepo.getDatesBySpu = async (spu, start, end) => {
    let sql = `SELECT s1.* FROM (SELECT IF(pc.\`商品编码\` IS NOT NULL, 
                pc.\`组合商品编码\`, s.sys_sku_id) AS sku_id,
                s.goods_id, s.create_time FROM jst_goods_sku s 
            LEFT JOIN danpin.combination_product_code pc ON s.sys_sku_id = pc.\`组合商品编码\`
        ) s1 JOIN danpin.goods_info gi ON gi.\`商品编码\` = s1.sku_id 
        WHERE gi.\`spu简称\` = ? AND s1.create_time BETWEEN ? and ?`
    let result = await query(sql, [spu, start, end])
    if (!result?.length) return {}
    sql = `SELECT SUM(profit) OVER (ORDER BY \`date\`) AS profit, \`date\` FROM(
        SELECT IFNULL(SUM(profit), 0) AS profit, \`date\` FROM(`
    for (let i = 0; i < result.length; i++) {
        sql = `${sql} 
            SELECT profit, date FROM goods_sale_info 
            WHERE goods_id = "${result[i].goods_id}" AND sku_code = "${result[i].sku_id}"
                AND \`date\` > "${result[i].create_time}" 
            UNION ALL`
    }
    sql = sql.substring(0, sql.length - 9)
    sql = `${sql})a GROUP BY \`date\`) b
        ORDER BY \`date\``
    result = await query(sql)
    start = null, end = null
    if (result?.length) {
        start = result[0].date
        for (let i = 1; i < result.length; i++) {
            if (result[i].profit > 2000) {
                end = result[i].date
                break
            }
        }
    }
    return {start, end}
}

goodsSkuRepo.getDatesByGoodsId = async (goods_id, start, end) => {
    let sql = `SELECT IF(pc.\`商品编码\` IS NOT NULL, 
                pc.\`组合商品编码\`, s.sys_sku_id) AS sku_id,
                s.goods_id, s.create_time FROM jst_goods_sku s 
            LEFT JOIN danpin.combination_product_code pc ON s.sys_sku_id = pc.\`组合商品编码\`
            WHERE s.goods_id = ? AND s.create_time BETWEEN ? and ?`
    let result = await query(sql, [goods_id, start, end])
    if (!result?.length) return {}
    sql = `SELECT IFNULL(SUM(profit), 0) OVER (ORDER BY date) AS profit, date FROM(`
    for (let i = 0; i < result.length; i++) {
        sql = `${sql} 
            SELECT profit, date FROM goods_sale_info 
            WHERE goods_id = "${result[i].goods_id}" AND sku_code = "${result[i].sku_id}"
                AND \`date\` > "${result[i].create_time}" 
            UNION ALL`
    }
    sql = sql.substring(0, sql.length - 9)
    sql = `${sql}) a
        GROUP BY date ORDER BY date`
    result = await query(sql)
    start = null, end = null
    if (result?.length) {
        start = result[0].date
        for (let i = 1; i < result.length; i++) {
            if (result[i].profit > 2000) {
                end = result[i].date
                break
            }
        }
    }
    return {start, end}
}

module.exports = goodsSkuRepo