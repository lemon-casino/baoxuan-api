const { query } = require('../../model/dbConn')
const supplierRecommendRepo = {}

supplierRecommendRepo.getById = async (id) => {
    let sql = `SELECT * FROM supplier_recommend_management WHERE id = ?`
    const result = await query(sql, [id])
    return result
}

supplierRecommendRepo.getByGoodsName = async (goods_name) => {
    let sql = `SELECT * FROM supplier_recommend_management WHERE goods_name = ?`
    const result = await query(sql, [goods_name])
    return result?.length ? result[0] : {}
}

supplierRecommendRepo.get = async (limit, offset, params) => {
    let data = [], total = 0, subsql = 'WHERE 1=1'
    for (let i = 0; i < params.length; i++) {
        if (params[i].value !== undefined) {
            if (params[i].type == 'input') {
                if (params[i].field_id == 'exploit_director') {
                    subsql = `${subsql} AND EXISTS(
                        SELECT id FROM users WHERE nickname LIKE '%${params[i].value}%'
                            AND users.user_id = exploit_director)`
                } else 
                    subsql = `${subsql} AND \`${params[i].field_id}\` LIKE '%${params[i].value}%'`
            } else if (['select', 'date'].includes(params[i].type)) {
                subsql = `${subsql} AND \`${params[i].field_id}\` = '${params[i].value}'`
            }
        }
    }
    let sql = `SELECT COUNT(1) AS count FROM supplier_recommend_management ${subsql}`
    let row = await query(sql)
    if (row?.length && row[0].count) {
        total = row[0].count
        sql = `SELECT *, (
                SELECT nickname FROM users WHERE user_id = exploit_director LIMIT 1
            ) AS exploit_director FROM supplier_recommend_management ${subsql} 
            ORDER BY id DESC LIMIT ${offset}, ${limit}`
        row = await query(sql, [limit, offset])
        if (row?.length) data = row
    }
    return {data, total}
}

supplierRecommendRepo.insert = async (data) => {
    let sql = `INSERT INTO supplier_recommend_management(
            exploit_director,
            recommend_time,
            brief_product_line,
            first_category,
            second_category,
            third_category,
            supplier,
            supplier_type,
            purchase_type,
            product_info,
            goods_name,
            goods_type,
            seasons,
            patent_belongs,
            patent_type,
            related,
            sale_purpose,
            product_img,
            remark,
            update_time) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

supplierRecommendRepo.update = async (data) => {
    let sql = `UPDATE supplier_recommend_management SET recommend_time = ?, 
        brief_product_line = ?, first_category = ?, second_category = ?, 
        third_category = ?, supplier = ?, supplier_type = ?, purchase_type = ?, 
        product_info = ?, goods_name = ?, goods_type = ?, seasons = ?, 
        patent_belongs = ?, patent_type = ?, related = ?, sale_purpose = ?, 
        product_img = ?, remark = ?, update_time = NOW() WHERE id = ?`
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

supplierRecommendRepo.updateStatus = async (id, status) => {
    let sql = `UPDATE supplier_recommend_management SET \`status\` = ?, 
        update_time = NOW() WHERE id = ?`
    const result = await query(sql, [status, id])
    return result?.affectedRows ? true : false
}

supplierRecommendRepo.updateLink = async (id, link) => {
    let sql = `UPDATE supplier_recommend_management SET link = ?, 
        update_time = NOW() WHERE id = ?`
    const result = await query(sql, [link, id])
    return result?.affectedRows ? true : false
}

module.exports = supplierRecommendRepo