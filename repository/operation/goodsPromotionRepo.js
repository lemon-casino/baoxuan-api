const { query } = require('../../model/dbConn')
const goodsPromotionRepo = {}

goodsPromotionRepo.deleteByDate = async (date, promotion_name) => {
    let sql = `DELETE FROM goods_promotion_info WHERE \`date\` = ?`
    if (promotion_name) sql = `${sql} AND promotion_name = "${promotion_name}"`
    else sql = `${sql} AND shop_name != "京东自营-厨具"`
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

goodsPromotionRepo.getDataDetailByTime = async (goods_id, shop_name, start, end) => {
    let sql = `SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount FROM 
        goods_sale_info WHERE goods_id = ? AND \`date\` >= ? AND \`date\` <= ?`
    let row = await query(sql, [goods_id, start, end])
    let sale_amount = 0
    if (row?.length) sale_amount = row[0].sale_amount

    let sql1 = `SELECT IFNULL(SUM(pay_amount),0) - IFNULL(SUM(refund_amount),0) - IFNULL(SUM(brushing_amount),0) 
        AS real_pay_amount FROM goods_pay_info WHERE goods_id = ? AND \`date\` >= ? AND \`date\` <= ?`
    let row1 = await query(sql1, [goods_id, start, end])
    let real_pay_amount = 0
    if (row1?.length) real_pay_amount = row1[0].real_pay_amount

    if (['pakchoice旗舰店（天猫）','八千行旗舰店（天猫）','天猫teotm旗舰店'].includes(shop_name)){
        sql = `SELECT IFNULL(SUM(pay_amount), 0) AS amount
                ,IFNULL(SUM(trans_amount), 0) as trans_amount 
                ,IF(IFNULL(SUM(pay_amount), 0) > 0 and IFNULL(SUM(trans_amount), 0) > 0
                ,FORMAT(IFNULL(SUM(trans_amount), 0) / IFNULL(SUM(pay_amount), 0), 2), 0) AS roi
                ,promotion_name, ${sale_amount} AS sale_amount
                ,CONCAT(ROUND(IFNULL(SUM(pay_amount),0)/${real_pay_amount}*100,2),"%") AS promotion_proportion
                ,${real_pay_amount} AS real_pay_amount
            FROM tmall_promotion_info 
            WHERE goods_id = ? AND \`date\` >= ? AND \`date\` <= ? AND period = 1
            GROUP BY promotion_name
            UNION ALL
            SELECT IFNULL(SUM(pay_amount), 0) AS amount
                ,IFNULL(SUM(trans_amount), 0) as trans_amount
                ,IF(IFNULL(SUM(pay_amount), 0) > 0 and IFNULL(SUM(trans_amount), 0) > 0
                ,FORMAT(IFNULL(SUM(trans_amount), 0) / IFNULL(SUM(pay_amount), 0), 2), 0) AS roi
                ,'合计' AS promotion_name
                ,${sale_amount} AS sale_amount
                ,CONCAT(ROUND(IFNULL(SUM(pay_amount),0)/${real_pay_amount}*100,2),"%") AS promotion_proportion
                ,${real_pay_amount} AS real_pay_amount
            FROM tmall_promotion_info WHERE goods_id = ? AND \`date\` >= ? AND \`date\` <= ? AND period = 1` 
    }else{
        sql = `SELECT IFNULL(SUM(amount), 0) AS amount, IF(IFNULL(SUM(amount), 0) > 0, 
                FORMAT(${sale_amount} / IFNULL(SUM(amount), 0), 2), 0) AS roi, 
                promotion_name, ${sale_amount} AS sale_amount 
                ,CONCAT(ROUND(IFNULL(SUM(amount),0)/${real_pay_amount}*100,2),"%") AS promotion_proportion
                ,${real_pay_amount} AS real_pay_amount
            FROM goods_promotion_info WHERE goods_id = ? 
                AND \`date\` >= ? AND \`date\` <= ?
            GROUP BY promotion_name
            UNION ALL
            SELECT IFNULL(SUM(amount), 0) AS amount, IF(IFNULL(SUM(amount), 0) > 0, 
                FORMAT(${sale_amount} / IFNULL(SUM(amount), 0), 2), 0) AS roi, 
                '合计' AS promotion_name, ${sale_amount} AS sale_amount
                ,CONCAT(ROUND(IFNULL(SUM(amount),0)/${real_pay_amount}*100,2),"%") AS promotion_proportion
                ,${real_pay_amount} AS real_pay_amount
            FROM goods_promotion_info WHERE goods_id = ? 
                AND \`date\` >= ? AND \`date\` <= ?`
    }
    const result = await query(sql, [goods_id, start, end, goods_id, start, end])
    return result || []
}

goodsPromotionRepo.deletetmallpromotion = async (shopname, paytime, day) =>{
    sql = `delete from tmall_promotion_info where pay_time= ? and period = ? and shop_name= ? `
    const result = await query(sql, [paytime,day,shopname])
    return result
}
goodsPromotionRepo.Inserttmallpromotion = async (data) =>{
    sql = `INSERT INTO tmall_promotion_info (promotion_name,
                goods_id,
                direct_amount,
                indirect_amount,
                trans_amount,
                trans_num,
                direct_num,
                indirect_num,
                trans_users_num,
                total_cart_num,
                exposure,
                click_num,
                pay_amount,
                period,
                pay_time,
                date,
                roi,
                shop_name) VALUES ?`
    const result = await query(sql, [data])
    return result
    
}
module.exports = goodsPromotionRepo