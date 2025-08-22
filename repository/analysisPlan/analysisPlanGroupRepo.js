const { query } = require('../../model/dbConn')
const analysisPlanGroupRepo = {}

analysisPlanGroupRepo.get = async (plan_id) => {
    let sql = `SELECT rg.rival_id, rg.group_id, g.name AS group_name, g.remark, r.name, r.goods_id, 
            r.category, r.shop_name, r.shop_type, r.monthly_sales, r.price, r.picture 
        FROM analysis_plans_group g LEFT JOIN rivals_group rg ON rg.group_id = g.id 
        LEFT JOIN rivals r ON r.id = rg.rival_id WHERE g.plan_id = ? 
        ORDER BY g.sort, g.id DESC, rg.sort, rg.id DESC`
    const result = await query(sql, [plan_id])
    return result || []
}

analysisPlanGroupRepo.getCountByPlanIdAndName = async (plan_id, name) => {
    let sql = `SELECT COUNT(1) AS count, g.id FROM analysis_plans_group g LEFT JOIN rivals_group rg 
            ON rg.group_id = g.id LEFT JOIN rivals r ON r.id = rg.rival_id 
        WHERE g.plan_id = ? AND g.name = ? GROUP BY g.id`
    const result = await query(sql, [plan_id, name])
    return result || []
}

analysisPlanGroupRepo.create = async (data) => {
    let sql = `INSERT INTO analysis_plans_group(name, remark, plan_id, sort) VALUES(?,?,?,?)`
    const result = await query(sql, data)
    return result.affectedRows ? result.insertId:null
}

analysisPlanGroupRepo.updateByPlanIdAndName = async (plan_id, name, remark, sort) => {
    let sql = `UPDATE analysis_plans_group SET remark = ?, sort = ? WHERE plan_id = ? AND name = ?`
    const result = await query(sql, [remark, sort, plan_id, name])
    return result.affectedRows ? true:false
}

analysisPlanGroupRepo.deleteById = async (id) => {
    let sql = `DELETE FROM analysis_plans_group WHERE id = ?`
    const result = await query(sql, [id])
    return result.affectedRows ? true:false
}

analysisPlanGroupRepo.deleteByPlanId = async (plan_id) => {
    let sql = `DELETE FROM analysis_plans_group WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result.affectedRows ? true:false
}

analysisPlanGroupRepo.addRivals = async (plan_id, group_id, rival_id, sort) => {
    let sql = `INSERT INTO rivals_group(plan_id, rival_id, group_id, sort) VALUES(?,?,?,?)`
    const result = await query(sql, [plan_id, rival_id, group_id, sort])
    return result.affectedRows ? true:false
}

analysisPlanGroupRepo.deleteRivals = async (plan_id, group_id) => {
    let sql = `DELETE FROM rivals_group WHERE plan_id = ? AND group_id = ?`
    const result = await query(sql, [plan_id, group_id])
    return result.affectedRows ? true:false
}

analysisPlanGroupRepo.deleteRivalByPlanId = async (plan_id) => {
    let sql = `DELETE FROM rivals_group WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result.affectedRows ? true:false
}

analysisPlanGroupRepo.deleteRivalByGoodsId = async (plan_id, group_id, goods_id) => {
    let sql = `DELETE FROM rivals_group WHERE plan_id = ? AND group_id = ? AND EXISTS(
        SELECT id FROM rivals WHERE id = rival_id AND goods_id = ?)`
    const result = await query(sql, [plan_id, group_id, goods_id])
    return result.affectedRows ? true:false
}

analysisPlanGroupRepo.deleteRivalByGoods = async (plan_id, goods_id) => {
    let sql = `DELETE FROM rivals_group WHERE plan_id = ? AND EXISTS(
        SELECT id FROM rivals WHERE id = rival_id AND plan_id = ? AND goods_id = ?)`
    const result = await query(sql, [plan_id, plan_id, goods_id])
    return result.affectedRows ? true:false
}

module.exports = analysisPlanGroupRepo