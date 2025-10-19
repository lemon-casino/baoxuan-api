const { query } = require('../../model/dbConn')
const spAnalysisRepo = {}

spAnalysisRepo.get = async (plan_id) => {
    let sql = `SELECT * FROM sp_analysis WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result || []
}

spAnalysisRepo.getProfit = async (plan_id) => {
    let sql = `SELECT * FROM sp_analysis_profit WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result || []
}

spAnalysisRepo.create = async (data) => {
    let sql = `INSERT INTO sp_analysis(plan_id, type, rivals_shop_name, rivals_name, volume_source, visitors, 
            pay_visitors, pay_conversion, sort) VALUES(?,?,?,?,?,?,?,?,?)`
    const result = await query(sql, data)
    return result.affectedRows ? result.insertId:null
}

spAnalysisRepo.createProfit = async (data) => {
    let sql = `INSERT INTO sp_analysis_profit(plan_id, sku, price, ratio, cost_price, express_fee, bill_amount, 
            profit, profit_percent, sku_cost_price, sku_sales, sku_promotion_amount, sku_profit, 
            sku_gross_profit_percent, sort) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    const result = await query(sql, data)
    return result.affectedRows ? result.insertId:null
}

spAnalysisRepo.update = async (data) => {
    let sql = `UPDATE sp_analysis SET volume_source = ?, visitors = ?, pay_visitors = ?, pay_conversion = ?, sort = ? 
        WHERE plan_id = ? AND type = ? AND rivals_shop_name = ? AND rivals_name = ?`
    const result = await query(sql, data)
    return result.affectedRows ? true:false
}

spAnalysisRepo.updateProfit = async (data) => {
    let sql = `UPDATE sp_analysis_profit SET price = ?, ratio = ?, cost_price = ?, express_fee = ?, bill_amount = ?, 
            profit = ?, profit_percent = ?, sku_cost_price = ?, sku_sales = ?, sku_promotion_amount = ?, sku_profit = ?, 
            sku_gross_profit_percent = ?, sort = ? WHERE plan_id = ? AND sku = ?`
    const result = await query(sql, data)
    return result.affectedRows ? result.insertId:null
}

spAnalysisRepo.deleteByPlanId = async (plan_id) => {
    let sql = `DELETE FROM sp_analysis WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result.affectedRows ? true:false
}

spAnalysisRepo.delete = async (plan_id, type, shop_name, name) => {
    let sql = `DELETE FROM sp_analysis WHERE plan_id = ? AND type = ? AND rivals_shop_name = ? AND rivals_name = ?`
    const result = await query(sql, [plan_id, type, shop_name, name])
    return result.affectedRows ? true:false
}

spAnalysisRepo.deleteProfitByPlanId = async (plan_id) => {
    let sql = `DELETE FROM sp_analysis WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result.affectedRows ? true:false
}

spAnalysisRepo.deleteProfit = async (plan_id, sku) => {
    let sql = `DELETE FROM sp_analysis WHERE plan_id = ? AND sku = ?`
    const result = await query(sql, [plan_id, sku])
    return result.affectedRows ? true:false
}

module.exports = spAnalysisRepo