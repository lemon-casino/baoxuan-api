const { query } = require('../../model/dbConn')
const operatorRecommendRepo = {}

operatorRecommendRepo.getById = async (id) => {
    let sql = `SELECT * FROM operator_recommend_management WHERE id = ?`
    const result = await query(sql, [id])
    return result
}

operatorRecommendRepo.get = async (limit, offset, params) => {
    let data = [], total = 0, subsql = 'WHERE 1=1'
    for (let i = 0; i < params.length; i++) {
        if (params[i].value !== undefined) {
            if (params[i].type == 'input') {
                if (['operator', 'director'].includes(params[i].field_id)) {
                    subsql = `${subsql} AND EXISTS(
                        SELECT id FROM users WHERE nickname LIKE '%${params[i].value}%'
                            AND users.user_id = ${params[i].field_id})`
                } else 
                    subsql = `${subsql} AND \`${params[i].field_id}\` LIKE '%${params[i].value}%'`
            } else if (['select', 'date'].includes(params[i].type)) {
                subsql = `${subsql} AND \`${params[i].field_id}\` = '${params[i].value}'`
            }
        }
    }
    let sql = `SELECT COUNT(1) AS count FROM operator_recommend_management ${subsql}`
    let row = await query(sql)
    if (row?.length && row[0].count) {
        total = row[0].count
        sql = `SELECT *, (
                SELECT nickname FROM users WHERE user_id = operator LIMIT 1
            ) AS operator, (
                SELECT nickname FROM users WHERE user_id = director LIMIT 1
            ) AS director FROM operator_recommend_management ${subsql} 
            ORDER BY id DESC LIMIT ${offset}, ${limit}`
        row = await query(sql, [limit, offset])
        if (row?.length) data = row
    }
    return {data, total}
}

operatorRecommendRepo.insert = async (data) => {
    let sql = `INSERT INTO operator_recommend_management(
            project,
            recommend_time,
            operator,
            analyse_link,
            first_category,
            second_category,
            third_category,
            seasons,
            related,
            sale_purpose,
            brief_product_line,
            remark,
            update_time) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,NOW())`
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

operatorRecommendRepo.update = async (data) => {
    let sql = `UPDATE operator_recommend_management SET project = ?, recommend_time = ?, 
        analyse_link = ?, first_category = ?, second_category = ?, third_category = ?, 
        seasons = ?, related = ?, sale_purpose = ?, brief_product_line = ?, remark = ?, 
        update_time = NOW() WHERE id = ?`
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

operatorRecommendRepo.updateStatus = async (id, status) => {
    let sql = `UPDATE operator_recommend_management SET \`status\` = ?, 
        update_time = NOW() WHERE id = ?`
    const result = await query(sql, [status, id])
    return result?.affectedRows ? true : false
}

operatorRecommendRepo.updateLink = async (id, link) => {
    let sql = `UPDATE operator_recommend_management SET link = ?, 
        update_time = NOW() WHERE id = ?`
    const result = await query(sql, [link, id])
    return result?.affectedRows ? true : false
}

operatorRecommendRepo.updateLinkStatus = async (id, status) => {
    let sql = `UPDATE operator_recommend_management SET link_status = ?, 
        update_time = NOW() WHERE id = ?`
    const result = await query(sql, [status, id])
    return result?.affectedRows ? true : false
}

operatorRecommendRepo.updateExtraValue = async (id, key, value) => {
    let sql = `UPDATE operator_recommend_management SET ${key} = ?, 
        update_time = NOW() WHERE id = ?`
    const result = await query(sql, [value, id])
    return result?.affectedRows ? true : false
}

module.exports = operatorRecommendRepo