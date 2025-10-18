const { query } = require('../../model/dbConn')
const spDirectPicRepo = {}

spDirectPicRepo.get = async (plan_id) => {
    let sql = `SELECT * FROM sp_direct_pic WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result || []
}

spDirectPicRepo.create = async (data) => {
    let sql = `INSERT INTO sp_direct_pic(plan_id, operator, goods_link, goods_info, num, customer_segmentation, 
            design_for, selling_point, design_info) VALUES(?,?,?,?,?,?,?,?,?)`
    const result = await query(sql, data)
    return result.affectedRows ? result.insertId:null
}

spDirectPicRepo.update = async (data) => {
    let sql = `UPDATE sp_direct_pic SET operator = ?, goods_link = ?, goods_info = ?, num = ?, customer_segmentation = ?, 
            design_for = ?, selling_point = ?, design_info = ? WHERE plan_id = ?`
    const result = await query(sql, data)
    return result.affectedRows ? true:false
}

spDirectPicRepo.delete = async (plan_id) => {
    let sql = `DELETE FROM sp_direct_pic WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result.affectedRows ? true:false
}

module.exports = spDirectPicRepo