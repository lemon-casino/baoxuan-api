const { query } = require('../../model/dbConn')
const goodsPromotionPlanRepo = {}

goodsPromotionPlanRepo.deleteByDate = async (date, shop_name, promotion_name) => {
    let sql = `DELETE FROM goods_promotion_plan WHERE \`date\` = ? AND shop_name = ? 
        AND promotion_name = ?`
    const result = await query(sql, [date, shop_name, promotion_name])
    return result?.affectedRows ? true : false
}

goodsPromotionPlanRepo.batchInsert = async (count, data) => {
    let sql = `INSERT INTO goods_promotion_plan(
            goods_id, 
            sku_id, 
            shop_name, 
            \`date\`, 
            promotion_name,
            plan_name,
            plan_goal,
            pay_amount,
            trans_amount) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

module.exports = goodsPromotionPlanRepo