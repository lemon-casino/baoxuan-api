const { query } = require('../../model/dbConn')
const rivalsKeywordsRepo = {}

rivalsKeywordsRepo.get = async (plan_id) => {
    let sql = `SELECT k.id, k.rival_id, k.other_info, r.name, r.link, r.goods_id, r.category, r.shop_name, 
            r.shop_type, r.monthly_sales, r.price, r.picture, r.keywords_trend_pic, r.customer_segmentation, 
            k.name AS keywords, k.visitors, k.pay_visitors FROM rivals r 
        LEFT JOIN rivals_keywords k ON r.id = k.rival_id WHERE r.plan_id = ? AND r.is_specific = 1 
        ORDER BY r.sort1, r.id DESC, k.sort, k.id DESC`
    const result = await query(sql, [plan_id])
    return result || []
}

rivalsKeywordsRepo.getCountByPlanIdAndGoodsId = async (plan_id, goods_id) => {
    let sql = `SELECT COUNT(1) AS count, r.id FROM rivals r LEFT JOIN rivals_keywords k ON r.id = k.rival_id 
        WHERE r.plan_id = ? AND r.goods_id = ? GROUP BY r.id`
    const result = await query(sql, [plan_id, goods_id])
    return result || []
}

rivalsKeywordsRepo.getByPlanIdAndKeywords = async (plan_id, rival_id, keywords) => {
    let sql = `SELECT * FROM rivals_keywords WHERE plan_id = ? AND rival_id = ? AND name = ?`
    const result = await query(sql, [plan_id, rival_id, keywords])
    return result || []
}

rivalsKeywordsRepo.create = async (data) => {
    let sql = `INSERT INTO rivals_keywords(plan_id, rival_id, name, visitors, pay_visitors, sort, other_info) 
        VALUES(?,?,?,?,?,?,?)`
    const result = await query(sql, data)
    return result.affectedRows ? true:false
}

rivalsKeywordsRepo.updateById = async (data) => {
    let sql = `UPDATE rivals_keywords SET name = ?, visitors = ?, pay_visitors = ?, sort = ? 
        WHERE id = ?`
    const result = await query(sql, data)
    return result.affectedRows ? true:false
}

rivalsKeywordsRepo.updateByPlanIdAndKeywords = async (data) => {
    let sql = `UPDATE rivals_keywords SET visitors = ?, pay_visitors = ?, sort = ?, other_info = ?  
        WHERE plan_id = ? AND name = ? AND EXISTS(
            SELECT id FROM rivals WHERE id = rival_id AND plan_id = ? AND goods_id = ?)`
    const result = await query(sql, data)
    return result.affectedRows ? true:false
}

rivalsKeywordsRepo.deleteByGoodsId = async (plan_id, goods_id) => {
    let sql = `DELETE FROM rivals_keywords WHERE plan_id = ? AND EXISTS(
        SELECT id FROM rivals WHERE plan_id = ? AND goods_id = ? AND id = rival_id)`
    const result = await query(sql, [plan_id, plan_id, goods_id])
    return result.affectedRows ? true:false
}

rivalsKeywordsRepo.deleteByPlanId = async (plan_id) => {
    let sql = `DELETE FROM rivals_keywords WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result.affectedRows ? true:false
}

rivalsKeywordsRepo.deleteByKeywords = async (plan_id, rival_id, keywords) => {
    let sql = `DELETE FROM rivals_keywords WHERE plan_id = ? AND rival_id = ? AND name = ?`
    const result = await query(sql, [plan_id, rival_id, keywords])
    return result.affectedRows ? true:false
}

module.exports = rivalsKeywordsRepo