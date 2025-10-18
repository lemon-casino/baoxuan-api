const { query } = require('../../model/dbConn')
const rivalsSkuRepo = {}

rivalsSkuRepo.get = async (plan_id) => {
    let sql = `SELECT * FROM rivals_sku WHERE plan_id = ? ORDER BY sort, id DESC`
    const result = await query(sql, [plan_id])
    return result || []
}

rivalsSkuRepo.getByName = async (plan_id, rival_id, name) => {
    let sql = `SELECT * FROM rivals_sku WHERE plan_id = ? AND rival_id = ? AND sku = ?`
    const result = await query(sql, [plan_id, rival_id, name])
    return result || []
}

rivalsSkuRepo.create = async (data) => {
    let sql = `INSERT INTO rivals_sku(plan_id, rival_id, goods_id, sku, picture, price, 
        ratio, cost_price, express_fee, bill_amount, profit, profit_percent, other_info, 
        sort) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    const result = await query(sql, data)
    return result.affectedRows ? true:false
}

rivalsSkuRepo.updateByGoodsIdAndName = async (data) => {
    let sql = `UPDATE rivals_sku SET picture = ?, price = ?, ratio = ?, cost_price = ?,
        express_fee = ?, bill_amount = ?, profit = ?, profit_percent = ?, other_info = ?, 
        sort = ? WHERE plan_id = ? AND goods_id = ? AND sku = ?`
    const result = await query(sql, data)
    return result.affectedRows ? true:false
}

rivalsSkuRepo.deleteByGoodsId = async (plan_id, goods_id) => {
    let sql = `DELETE FROM rivals_sku WHERE plan_id = ? AND goods_id = ?`
    const result = await query(sql, [plan_id, goods_id])
    return result.affectedRows ? true:false
}

rivalsSkuRepo.deleteByPlanId = async (plan_id) => {
    let sql = `DELETE FROM rivals_sku WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result.affectedRows ? true:false
}

rivalsSkuRepo.deleteByGoodsIdAndName = async (plan_id, goods_id, name) => {
    let sql = `DELETE FROM rivals_sku WHERE plan_id = ? AND goods_id = ? AND name = ?`
    const result = await query(sql, [plan_id, goods_id, name])
    return result.affectedRows ? true:false
}

module.exports = rivalsSkuRepo