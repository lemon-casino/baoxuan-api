const { query } = require('../../model/dbConn')
const goodsPromotionRepo = {}

goodsPromotionRepo.deleteByDate = async (date, type) => {
    let sql = `DELETE FROM goods_promotion_info WHERE \`date\` = ?`
    let params = [date]
    if (type) {
        sql = `${sql} AND promotion_name = ? AND shop_name = '京东自营旗舰店'`
        params.push(type)
    } else {
        sql = `${sql} AND shop_name != '京东自营旗舰店'`
    }
    const result = await query(sql, params)
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

module.exports = goodsPromotionRepo