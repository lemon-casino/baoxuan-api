const { query } = require('../../model/dbConn')
const analysisPlanRepo = {}

analysisPlanRepo.get = async (user_id, title, id, offset, limit) => {
    let subsql = ''
    if (title) subsql = `AND title LIKE "%${title}%"`
    if (id) subsql = `AND id = ${id}`
    let sql = `SELECT *, (SELECT nickname FROM users WHERE user_id = p.user_id) AS username 
        FROM analysis_plans p WHERE user_id = ? ${subsql} ORDER BY id DESC LIMIT ?,?`
    const result = await query(sql, [user_id, offset, limit])
    return result || []
}

analysisPlanRepo.getCount = async (user_id, title, id) => {
    let subsql = ''
    if (title) subsql = `AND title = "${title}"`
    if (id) subsql = `AND id = ${id}`
    let sql = `SELECT COUNT(1) AS count FROM analysis_plans p WHERE user_id = ? ${subsql}`
    const result = await query(sql, [user_id])
    return result
}

analysisPlanRepo.getById = async (id) => {
    let sql = `SELECT * FROM analysis_plans WHERE id = ?`
    const result = await query(sql, [id])
    return result || []
}

analysisPlanRepo.getByTitle = async (user_id, title) => {
    let sql = `SELECT * FROM analysis_plans WHERE title = ? AND user_id = ?`
    const result = await query(sql, [title, user_id])
    return result || []
}

analysisPlanRepo.create = async (data) => {
    let sql = `INSERT INTO analysis_plans(title, user_id, remark) VALUES(?,?,?)`
    const result = await query(sql, data)
    return result.affectedRows ? true:false
}

analysisPlanRepo.updateById = async (id, title, remark, status) => {
    let sql = `UPDATE analysis_plans SET title = ?, remark = ?, \`status\` = ?, update_time = NOW() WHERE id = ?`
    const result = await query(sql, [title, remark, status, id])
    return result.affectedRows ? true:false
}

analysisPlanRepo.deleteById = async (id) => {
    let sql = `DELETE FROM analysis_plans WHERE id = ?`
    const result = await query(sql, [id])
    return result.affectedRows ? true:false
}

analysisPlanRepo.createRelations = async (plan_id, type, goods_id, process_id) => {
    let sql = `INSERT INTO analysis_plans_relation(plan_id, type, goods_id, process_id) 
        VALUES(?,?,?,?)`
    const result = await query(sql, [plan_id, type, goods_id, process_id])
    return result.affectedRows ? true:false
}

analysisPlanRepo.deleteRelations = async (plan_id) => {
    let sql = `DELETE FROM analysis_plans_relation WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result.affectedRows ? true:false
}

module.exports = analysisPlanRepo