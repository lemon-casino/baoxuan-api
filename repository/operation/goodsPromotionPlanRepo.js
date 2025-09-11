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

goodsPromotionPlanRepo.goodspromotionPlan = async (goods_id, start, end) =>{
    let sql = `SELECT a.*
        ,b.real_pay_amount
        ,c.sale_amount
        ,CONCAT(ROUND(a.pay_amount/b.real_pay_amount*100,2),'%') AS promotion_rate
        FROM(
            SELECT goods_id
                ,promotion_name
                ,plan_name
                ,SUM(pay_amount) AS pay_amount
                ,SUM(trans_amount) AS trans_amount
                ,ROUND(SUM(trans_amount)/SUM(pay_amount),2) AS roi
            FROM goods_promotion_plan 
            WHERE date BETWEEN ? AND ?
            AND goods_id = ?
            GROUP BY goods_id,promotion_name,plan_name
        ) AS a
        CROSS JOIN(
            SELECT SUM(sale_amount) AS real_pay_amount 
            FROM goods_pays  WHERE date BETWEEN ? AND ?
            AND goods_id = ?
        ) AS b
        CROSS JOIN(
            SELECT SUM(sale_amount) AS sale_amount
            FROM goods_sales  WHERE date BETWEEN ? AND ?
            AND goods_id = ?
        ) AS c`
    let result =await query(sql,[start, end, goods_id,start, end, goods_id,start, end, goods_id])
    return result
}

module.exports = goodsPromotionPlanRepo