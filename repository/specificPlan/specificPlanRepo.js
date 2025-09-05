const { query } = require('../../model/dbConn')
const specificPlanRepo = {}

specificPlanRepo.get = async (user_id, title, id, offset, limit) => {
    let subsql = ''
    if (title) subsql = `AND title LIKE "%${title}%" `
    if (id) subsql = `${subsql}AND id = ${id}`
    else subsql = `${subsql}AND user_id = ${user_id}`
    let sql = `SELECT *, (SELECT nickname FROM users WHERE user_id = p.user_id) AS username 
        FROM specific_plans p WHERE 1=1 ${subsql} ORDER BY id DESC LIMIT ?,?`
    const result = await query(sql, [offset, limit])
    return result || []
}

specificPlanRepo.getByGoodsId = async (goods_id) => {
    let sql = `SELECT p.id, p.title, p.create_time, (SELECT nickname FROM users WHERE user_id = p.user_id) 
            AS username, r.create_time AS add_time FROM specific_plans_relation r JOIN specific_plans p 
            ON r.plan_id = p.id WHERE r.goods_id = ? ORDER BY r.create_time DESC`
    const result = await query(sql, [goods_id])
    return result || []
}

specificPlanRepo.getList = async (goods_id, user_id) => {
    let sql = `SELECT p.id, p.title FROM specific_plans p 
        WHERE NOT EXISTS(SELECT * FROM specific_plans_relation r WHERE r.plan_id = p.id AND r.goods_id = ?) 
            AND p.user_id = ? AND p.status = 1`
    const result = await query(sql, [goods_id, user_id])
    return result || []
}

specificPlanRepo.getCount = async (user_id, title, id) => {
    let subsql = ''
    if (title) subsql = `AND title = "${title}"`
    if (id) subsql = `AND id = ${id}`
    else subsql = `${subsql}AND user_id = ${user_id}`
    let sql = `SELECT COUNT(1) AS count FROM specific_plans p WHERE 1=1 ${subsql}`
    const result = await query(sql, [user_id])
    return result
}

specificPlanRepo.getById = async (id) => {
    let sql = `SELECT * FROM specific_plans WHERE id = ?`
    const result = await query(sql, [id])
    return result || []
}

specificPlanRepo.getByTitle = async (user_id, title) => {
    let sql = `SELECT * FROM specific_plans WHERE title = ? AND user_id = ?`
    const result = await query(sql, [title, user_id])
    return result || []
}

specificPlanRepo.create = async (data) => {
    let sql = `INSERT INTO specific_plans(title, user_id, remark) VALUES(?,?,?)`
    const result = await query(sql, data)
    return result.affectedRows ? true:false
}

specificPlanRepo.updateById = async (id, title, remark, status) => {
    let sql = `UPDATE specific_plans SET title = ?, remark = ?, \`status\` = ? WHERE id = ?`
    const result = await query(sql, [title, remark, status, id])
    return result.affectedRows ? true:false
}

specificPlanRepo.deleteById = async (id) => {
    let sql = `DELETE FROM specific_plans WHERE id = ?`
    const result = await query(sql, [id])
    return result.affectedRows ? true:false
}

specificPlanRepo.updateGoodsNameAndKeywordsAndStyle = async (id, name, keywords, style) => {
    let sql = `UPDATE specific_plans SET goods_name = ?, keywords = ?, keywords_style = ? WHERE id = ?`
    const result = await query(sql, [name, keywords, style, id])
    return result.affectedRows ? true:false
}

specificPlanRepo.updateVolumePlanAndSalesTargetAndStyle = async (id, plan, target, style) => {
    let sql = `UPDATE specific_plans SET volume_plan = ?, sales_target = ?, analysis_style = ? WHERE id = ?`
    const result = await query(sql, [plan, target, style, id])
    return result.affectedRows ? true:false
}

specificPlanRepo.updateSkuStyle = async (id, style) => {
    let sql = `UPDATE specific_plans SET sku_style = ? WHERE id = ?`
    const result = await query(sql, [style, id])
    return result.affectedRows ? true:false
}

specificPlanRepo.updateVisionStyle = async (id, style) => {
    let sql = `UPDATE specific_plans SET vision_style = ? WHERE id = ?`
    const result = await query(sql, [style, id])
    return result.affectedRows ? true:false
}

specificPlanRepo.updateMainPicStyle = async (id, style) => {
    let sql = `UPDATE specific_plans SET main_pic_style = ? WHERE id = ?`
    const result = await query(sql, [style, id])
    return result.affectedRows ? true:false
}

specificPlanRepo.updateDirectPicStyle = async (id, style) => {
    let sql = `UPDATE specific_plans SET direct_pic_style = ? WHERE id = ?`
    const result = await query(sql, [style, id])
    return result.affectedRows ? true:false
}

specificPlanRepo.updateDetailPicStyle = async (id, style) => {
    let sql = `UPDATE specific_plans SET detail_pic_style = ? WHERE id = ?`
    const result = await query(sql, [style, id])
    return result.affectedRows ? true:false
}

specificPlanRepo.updateMainVideoStyle = async (id, style) => {
    let sql = `UPDATE specific_plans SET main_video_style = ? WHERE id = ?`
    const result = await query(sql, [style, id])
    return result.affectedRows ? true:false
}

specificPlanRepo.updateSalesStyle = async (id, style) => {
    let sql = `UPDATE specific_plans SET sales_style = ? WHERE id = ?`
    const result = await query(sql, [style, id])
    return result.affectedRows ? true:false
}

specificPlanRepo.createRelations = async (plan_id, type, goods_id, process_id) => {
    let sql = `INSERT INTO specific_plans_relation(plan_id, type, goods_id, process_id) 
        VALUES(?,?,?,?)`
    const result = await query(sql, [plan_id, type, goods_id, process_id])
    return result.affectedRows ? true:false
}

specificPlanRepo.deleteRelations = async (plan_id) => {
    let sql = `DELETE FROM specific_plans_relation WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result.affectedRows ? true:false
}

module.exports = specificPlanRepo