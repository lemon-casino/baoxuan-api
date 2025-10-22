const { query } = require('../../model/dbConn')
const spMainPicRepo = {}

spMainPicRepo.get = async (plan_id) => {
    let sql = `SELECT * FROM sp_main_pic WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result || []
}

spMainPicRepo.create = async (data) => {
    let sql = `INSERT INTO sp_main_pic(plan_id, operator, goods_link, goods_info, num, customer_segmentation, 
            design_for, selling_point, design_info) VALUES(?,?,?,?,?,?,?,?,?)`
    const result = await query(sql, data)
    return result.affectedRows ? result.insertId:null
}

spMainPicRepo.update = async (data) => {
    let sql = `UPDATE sp_main_pic SET operator = ?, goods_link = ?, goods_info = ?, num = ?, customer_segmentation = ?, 
            design_for = ?, selling_point = ?, design_info = ? WHERE plan_id = ?`
    const result = await query(sql, data)
    return result.affectedRows ? true:false
}

spMainPicRepo.delete = async (plan_id) => {
    let sql = `DELETE FROM sp_main_pic WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result.affectedRows ? true:false
}

module.exports = spMainPicRepo