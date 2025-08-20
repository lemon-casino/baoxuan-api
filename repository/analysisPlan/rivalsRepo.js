const { query } = require('../../model/dbConn')
const rivalsRepo = {}

rivalsRepo.get = async (plan_id) => {
    let sql = `SELECT * FROM rivals WHERE plan_id = ? ORDER BY sort, id DESC `
    const result = await query(sql, [plan_id])
    return result || []
}

rivalsRepo.getByPlanIdAndGoodsId = async (plan_id, goods_id) => {
    let sql = `SELECT * FROM rivals WHERE plan_id = ? AND goods_id = ?`
    const result = await query(sql, [plan_id, goods_id])
    return result || []
}

rivalsRepo.create = async (data) => {
    let sql = `INSERT INTO rivals(plan_id, name, link, goods_id, category, shop_name, shop_type, 
        monthly_sales, price, picture, keywords_trend_pic, customer_segmentation, other_info, 
        is_specific, sort, sort1, sort2) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    const result = await query(sql, data)
    return result.affectedRows ? result.insertId:null
}

rivalsRepo.updateByPlanIdAndGoodsId = async (data) => {
    let sql = `UPDATE rivals SET name = ?, category = ?, shop_name = ?, shop_type = ?, monthly_sales = ?, 
        price = ?, picture = ? WHERE plan_id = ? AND goods_id = ?`
    const result = await query(sql, data)
    return result.affectedRows ? true:false
}

rivalsRepo.updateByPlanIdAndGoodsId1 = async (data) => {
    let sql = `UPDATE rivals SET name = ?, category = ?, shop_name = ?, shop_type = ?, monthly_sales = ?, 
        price = ?, picture = ?, other_info = ?, sort = ? WHERE plan_id = ? AND goods_id = ?`
    const result = await query(sql, data)
    return result.affectedRows ? true:false
}

rivalsRepo.updateByPlanIdAndGoodsId2 = async (data) => {
    let sql = `UPDATE rivals SET name = ?, link = ?, category = ?, shop_name = ?, shop_type = ?, monthly_sales = ?, 
        price = ?, picture = ?, keywords_trend_pic = ?, customer_segmentation = ?, sort1 = ?, is_specific = 1 
        WHERE plan_id = ? AND goods_id = ?`
    const result = await query(sql, data)
    return result.affectedRows ? true:false
}

rivalsRepo.updateIsSpecific = async (plan_id, rival_id) => {
    let sql = `UPDATE rivals SET is_specific = 0 WHERE plan_id = ? AND rival_id = ?`
    const result = await query(sql, [plan_id, rival_id])
    return result.affectedRows ? true:false
}

rivalsRepo.deleteByPlanId = async (plan_id) => {
    let sql = `DELETE FROM rivals WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result.affectedRows ? true:false
}

rivalsRepo.deleteByGoodsId = async (plan_id, goods_id) => {
    let sql = `DELETE FROM rivals WHERE plan_id = ? AND goods_id = ?`
    const result = await query(sql, [plan_id, goods_id])
    return result.affectedRows ? true:false
}

module.exports = rivalsRepo