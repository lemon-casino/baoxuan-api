const { query } = require('../../model/dbConn')
const spSkuRepo = {}

spSkuRepo.get = async (plan_id) => {
    let sql = `SELECT * FROM sp_sku WHERE plan_id = ? ORDER BY sort, id DESC`
    const result = await query(sql, [plan_id])
    return result || []
}

spSkuRepo.create = async (data) => {
    let sql = `INSERT INTO sp_sku(plan_id, rivals_shop_name, rivals_sku, rivals_picture, rivals_price,
            rivals_ratio, rivals_cost_price, rivals_express_fee, rivals_bill_amount, rivals_profit,
            rivals_profit_percent, sku, picture, cost_price, sku_code, price, express_fee, bill_amount,
            profit, profit_percent, sort) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    const result = await query(sql, data)
    return result.affectedRows ? result.insertId:null
}

spSkuRepo.updateByRivalsShopNameAndSku = async (data) => {
    let sql = `UPDATE sp_sku SET rivals_picture = ?, rivals_price = ?, rivals_ratio = ?, rivals_cost_price = ?, 
            rivals_express_fee = ?, rivals_bill_amount = ?, rivals_profit = ?, rivals_profit_percent = ?, 
            picture = ?, cost_price = ?, sku_code = ?, price = ?, express_fee = ?, bill_amount = ?,
            profit = ?, profit_percent = ?, sort = ? WHERE rivals_shop_name = ? AND rivals_sku = ? AND sku_code = ? 
            AND plan_id = ?`
    const result = await query(sql, data)
    return result.affectedRows ? true:false
}

spSkuRepo.deleteByRivalsShopNameAndSku = async (plan_id, shop_name, rivals_sku, sku) => {
    let sql = `DELETE FROM sp_sku WHERE plan_id = ? AND rivals_shop_name = ? AND rivals_sku = ? AND sku_code = ?`
    const result = await query(sql, [plan_id, shop_name, rivals_sku, sku])
    return result.affectedRows ? true:false
}

spSkuRepo.deleteByPlanId = async (plan_id) => {
    let sql = `DELETE FROM sp_sku WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result.affectedRows ? true:false
}

module.exports = spSkuRepo