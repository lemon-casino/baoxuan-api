const { query } = require('../../model/dbConn')
const skuRepo = {}

skuRepo.create = async (data, count) => {
    let sql = `INSERT INTO jst_sku_info(co_id, sku_id, i_id, name, c_id, 
        brand, market_price, sale_price, cost_price, enabled, category, 
        creator, modifier, creator_name, modifier_name, properties_value, 
        sku_code, purchase_price, pic, pic_big, weight, short_name, item_type, 
        supplier_id, supplier_name, supplier_sku_id, supplier_i_id, remark, 
        vc_name, l, w, h, other_price_1, other_price_2, other_price_3, 
        other_price_4, other_price_5, labels, other_1, other_2, other_3, 
        other_4, other_5, unit, shelf_life, productionbatch_format, 
        production_licence, drp_co_id_to) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,
            ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result
}

skuRepo.count = async () => {
    const sql = `SELECT COUNT(1) AS count FROM jst_sku_info`
    const result = await query(sql)
    return result
}

skuRepo.get = async (size, offset) => {
    const sql = `SELECT * FROM jst_sku_info ORDER BY sku_id LIMIT ${offset}, ${size}`
    const result = await query(sql)
    return result
}

skuRepo.updateById = async (data) => {
    let sql = `UPDATE jst_sku_info SET name = ? , c_id = ?, brand = ?, market_price = ?, 
        sale_price = ?, cost_price = ?, enabled = ?, category = ?, creator = ?, modifier = ?, creator_name = ?, modifier_name = ?, properties_value = ?, sku_code = ?, 
        purchase_price = ?, pic = ?, pic_big = ?, weight = ?, short_name = ?, item_type = ?, 
        supplier_id = ?, supplier_name = ?, supplier_sku_id = ?, supplier_i_id = ?, remark = ?, 
        vc_name = ?, l = ?, w = ?, h = ?, other_price_1 = ?, other_price_2 = ?, other_price_3 = ?, 
        other_price_4 = ?, other_price_5 = ?, labels = ?, other_1 = ?, other_2 = ?, other_3 = ?, 
        other_4 = ?, other_5 = ?, unit = ?, shelf_life = ?, productionbatch_format = ?, 
        production_licence = ?, drp_co_id_to = ? WHERE sku_id = ?`
    const result = await query(sql, data)
    return result
}

module.exports = skuRepo