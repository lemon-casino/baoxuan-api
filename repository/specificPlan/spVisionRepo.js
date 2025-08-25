const { query } = require('../../model/dbConn')
const spVisionRepo = {}

spVisionRepo.get = async (plan_id) => {
    let sql = `SELECT * FROM sp_vision WHERE plan_id = ? ORDER BY sort, id DESC`
    const result = await query(sql, [plan_id])
    return result || []
}

spVisionRepo.create = async (data) => {
    let sql = `INSERT INTO sp_vision(plan_id, rivals_shop_name, selling_point, mobile_pic, main_pic,
            detail_pic, sort) VALUES(?,?,?,?,?,?,?)`
    const result = await query(sql, data)
    return result.affectedRows ? result.insertId:null
}

spVisionRepo.updateByRivalsShopName = async (data) => {
    let sql = `UPDATE sp_vision SET selling_point = ?, mobile_pic = ?, main_pic = ?, detail_pic = ?, sort = ? 
        WHERE rivals_shop_name = ? AND plan_id = ?`
    const result = await query(sql, data)
    return result.affectedRows ? true:false
}

spVisionRepo.deleteByRivalsShopName = async (plan_id, shop_name) => {
    let sql = `DELETE FROM sp_vision WHERE plan_id = ? AND rivals_shop_name = ?`
    const result = await query(sql, [plan_id, shop_name])
    return result.affectedRows ? true:false
}

spVisionRepo.deleteByPlanId = async (plan_id) => {
    let sql = `DELETE FROM sp_vision WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result.affectedRows ? true:false
}

module.exports = spVisionRepo