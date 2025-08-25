const { query } = require('../../model/dbConn')
const spKeywordsRepo = {}

spKeywordsRepo.get = async (plan_id) => {
    let sql = `SELECT * FROM sp_keywords WHERE plan_id = ? ORDER BY sort, id DESC`
    const result = await query(sql, [plan_id])
    return result || []
}

spKeywordsRepo.create = async (data) => {
    let sql = `INSERT INTO sp_keywords(plan_id, rivals_shop_name, keywords, visitors, pay_visitors, sort) 
        VALUES(?,?,?,?,?,?)`
    const result = await query(sql, data)
    return result.affectedRows ? result.insertId:null
}

spKeywordsRepo.updateByRivalsShopNameAndKeywords = async (plan_id, shop_name, keywords, visitors, pay_visitors, sort) => {
    let sql = `UPDATE sp_keywords SET visitors = ?, pay_visitors = ?, sort = ? 
        WHERE rivals_shop_name = ? AND keywords = ? AND plan_id = ?`
    const result = await query(sql, [visitors, pay_visitors, sort, shop_name, keywords, plan_id])
    return result.affectedRows ? true:false
}

spKeywordsRepo.deleteByRivalsShopNameAndKeywords = async (plan_id, shop_name, keywords) => {
    let sql = `DELETE FROM sp_keywords WHERE plan_id = ? AND rivals_shop_name = ? AND keywords = ?`
    const result = await query(sql, [plan_id, shop_name, keywords])
    return result.affectedRows ? true:false
}

spKeywordsRepo.deleteByPlanId = async (plan_id) => {
    let sql = `DELETE FROM sp_keywords WHERE plan_id = ?`
    const result = await query(sql, [plan_id])
    return result.affectedRows ? true:false
}

module.exports = spKeywordsRepo