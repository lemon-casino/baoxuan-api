const { query } = require('../../model/dbConn')
const goodsPromotionRepo = {}

goodsPromotionRepo.deleteByDate = async (date, promotion_name) => {
    let sql = `DELETE FROM goods_promotion_info WHERE \`date\` = ?`
    if (promotion_name) sql = `${sql} AND promotion_name = "${promotion_name}"`
    else sql = `${sql} AND shop_name != "京东自营旗舰店"`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

goodsPromotionRepo.batchInsert = async (count, data) => {
    let sql = `INSERT INTO goods_promotion_info(
            goods_id, 
            sku_id, 
            shop_name, 
            promotion_name,
            amount,
            \`date\`) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

goodsPromotionRepo.getByPromotionName = async (date, promotion_name, goods_id, sku_id) => {
    let sql = `SELECT * FROM goods_promotion_info WHERE \`date\` = ?
        AND promotion_name = ? AND goods_id = ? AND sku_id = ?`
    const result = await query(sql, [date, promotion_name, goods_id, sku_id])
    return result || []
}

goodsPromotionRepo.getDataDetailByTime = async (goods_id, start, end) => {
    let sql = `SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount FROM 
        goods_sale_info WHERE goods_id = ? AND \`date\` >= ? AND \`date\` <= ?`
    let row = await query(sql, [goods_id, start, end])
    let sale_amount = 0
    if (row?.length) sale_amount = row[0].sale_amount
    
    sql = `SELECT IFNULL(SUM(amount), 0) AS amount, IF(IFNULL(SUM(amount), 0) > 0, 
                FORMAT(${sale_amount} / IFNULL(SUM(amount), 0), 2), 0) AS roi, 
            promotion_name, ${sale_amount} AS sale_amount 
        FROM goods_promotion_info WHERE goods_id = ? 
            AND \`date\` >= ? AND \`date\` <= ?
        GROUP BY promotion_name
        
        UNION ALL
        
        SELECT IFNULL(SUM(amount), 0) AS amount, IF(IFNULL(SUM(amount), 0) > 0, 
                FORMAT(${sale_amount} / IFNULL(SUM(amount), 0), 2), 0) AS roi, 
            '合计' AS promotion_name, ${sale_amount} AS sale_amount 
        FROM goods_promotion_info WHERE goods_id = ? 
            AND \`date\` >= ? AND \`date\` <= ?`
    const result = await query(sql, [goods_id, start, end, goods_id, start, end])
    return result || []
}

module.exports = goodsPromotionRepo