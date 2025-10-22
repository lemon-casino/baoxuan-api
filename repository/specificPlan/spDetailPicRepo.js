const { query } = require('../../model/dbConn')
const spDetailPicRepo = {}

spDetailPicRepo.get = async (plan_id) => {
    let sql = `SELECT * FROM sp_detail_pic WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result || []
}

spDetailPicRepo.create = async (data) => {
    let sql = `INSERT INTO sp_detail_pic(plan_id, operator, goods_link, goods_info, type, customer_segmentation, 
            selling_point, design_info) VALUES(?,?,?,?,?,?,?,?)`
    const result = await query(sql, data)
    return result.affectedRows ? result.insertId:null
}

spDetailPicRepo.update = async (data) => {
    let sql = `UPDATE sp_detail_pic SET operator = ?, goods_link = ?, goods_info = ?, type = ?, customer_segmentation = ?, 
            selling_point = ?, design_info = ? WHERE plan_id = ?`
    const result = await query(sql, data)
    return result.affectedRows ? true:false
}

spDetailPicRepo.delete = async (plan_id) => {
    let sql = `DELETE FROM sp_detail_pic WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result.affectedRows ? true:false
}

module.exports = spDetailPicRepo