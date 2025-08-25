const { query } = require('../../model/dbConn')
const spSalesRepo = {}

spSalesRepo.get = async (plan_id) => {
    let sql = `SELECT * FROM sp_sales_predict WHERE plan_id = ? ORDER BY id DESC`
    const result = await query(sql, [plan_id])
    return result || []
}

spSalesRepo.create = async (data) => {
    let sql = `INSERT INTO sp_sales_predict(plan_id, day, amount, amount_param, quantity, quantity_param) 
        VALUES(?,?,?,?,?,?)`
    const result = await query(sql, data)
    return result.affectedRows ? result.insertId:null
}

spSalesRepo.updateByDay = async (data) => {
    let sql = `UPDATE sp_sales_predict SET amount = ?, amount_param = ?, quantity = ?, quantity_param = ? 
        WHERE plan_id = ? And day = ?`
    const result = await query(sql, data)
    return result.affectedRows ? true:false
}

spSalesRepo.deleteByPlanId = async (plan_id) => {
    let sql = `DELETE FROM sp_sales_predict WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result.affectedRows ? true:false
}

module.exports = spSalesRepo