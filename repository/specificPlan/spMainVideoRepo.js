const { query } = require('../../model/dbConn')
const spMainVideoRepo = {}

spMainVideoRepo.get = async (plan_id) => {
    let sql = `SELECT * FROM sp_main_video WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result || []
}

spMainVideoRepo.create = async (data) => {
    let sql = `INSERT INTO sp_main_video(plan_id, goods_link, requirement, link_reference, design_info) 
        VALUES(?,?,?,?,?)`
    const result = await query(sql, data)
    return result.affectedRows ? result.insertId:null
}

spMainVideoRepo.update = async (data) => {
    let sql = `UPDATE sp_main_video SET goods_link = ?, requirement = ?, link_reference = ?, design_info = ? 
        WHERE plan_id = ?`
    const result = await query(sql, data)
    return result.affectedRows ? true:false
}

spMainVideoRepo.delete = async (plan_id) => {
    let sql = `DELETE FROM sp_main_video WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result.affectedRows ? true:false
}

module.exports = spMainVideoRepo