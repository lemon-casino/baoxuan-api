const { query, transaction } = require('../../model/dbConn')
const goodsVerifiedsStats = {}

goodsVerifiedsStats.batchInsert = async (date) => {
    let sqls = [], params = []
    sqls.push(`DELETE FROM goods_verifieds_stats WHERE \`date\` = ?`)
    params.push([date])
    let sql = `SELECT a1.goods_id, a1.shop_name, s.shop_id, a1.date, a1.sale_amount, 
	        a1.cost_amount, a1.express_fee, a1.packing_fee, a2.labor_cost, a1.promotion_amount, 
            a1.operation_amount, a1.order_num, a1.refund_num, a1.profit, a3.pay_amount, 
            a3.brushing_amount, a3.brushing_qty, a3.refund_amount, a3.pay_express_fee, 
            IFNULL(a3.pay_amount, 0) - IFNULL(a3.brushing_amount, 0) - IFNULL(a3.refund_amount, 0) 
                AS real_pay_amount, a3.bill, a4.words_market_vol, a4.words_vol, a4.dsr
        FROM goods_verifieds a1 LEFT JOIN goods_other_info a4 ON a4.goods_id = a1.goods_id 
		    AND a4.date = ?
        LEFT JOIN goods_payments a3 ON a1.goods_id = a3.goods_id AND a3.date = ? 
        LEFT JOIN shop_info s ON s.shop_name = a1.shop_name 
        LEFT JOIN (SELECT SUM(rate) AS labor_cost, goods_id, shop_id FROM orders_goods 
            WHERE verified_date = ? GROUP BY goods_id, shop_id) a2 ON a1.goods_id = a2.goods_id 
            AND s.shop_id = a2.shop_id 
        WHERE a1.date = ?`
    let rows = await query(sql, [date, date, date, date]), data = []
    if (!rows?.length) return false
    sql = `INSERT INTO goods_verifieds_stats(
            goods_id, 
            shop_name, 
            shop_id, 
            \`date\`, 
            pay_amount, 
            brushing_amount, 
            brushing_qty, 
            refund_amount, 
            pay_express_fee, 
            real_pay_amount, 
            bill, 
            sale_amount, 
            cost_amount, 
            express_fee, 
            packing_fee, 
            labor_cost, 
            promotion_amount, 
            operation_amount, 
            words_market_vol, 
            words_vol, 
            dsr, 
            order_num, 
            refund_num, 
            profit) VALUES`
    for (let i = 0; i < rows.length; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
        data.push(
            rows[i].goods_id, 
            rows[i].shop_name, 
            rows[i].shop_id, 
            rows[i].date, 
            rows[i].pay_amount, 
            rows[i].brushing_amount, 
            rows[i].brushing_qty, 
            rows[i].refund_amount, 
            rows[i].pay_express_fee, 
            rows[i].real_pay_amount, 
            rows[i].bill, 
            rows[i].sale_amount, 
            rows[i].cost_amount, 
            rows[i].express_fee, 
            rows[i].packing_fee, 
            rows[i].labor_cost, 
            rows[i].promotion_amount, 
            rows[i].operation_amount, 
            rows[i].words_market_vol, 
            rows[i].words_vol, 
            rows[i].dsr, 
            rows[i].order_num, 
            rows[i].refund_num, 
            rows[i].profit
        )
    }
    sql = sql.substring(0, sql.length - 1)
    sqls.push(sql)
    params.push(data)
    const result = await transaction(sqls, params)
    return result
}

goodsVerifiedsStats.updateVol = async (goods_id, words_market_vol, words_vol, date) => {
    const sql = `UPDATE goods_verifieds_stats SET words_market_vol = ?, words_vol = ?, 
        WHERE goods_id = ? AND \`date\` = ?`
    const result = await query(sql, [
        words_market_vol, 
        words_vol, 
        goods_id, 
        date])
    return result?.affectedRows ? true : false
}

goodsVerifiedsStats.updateDSR = async (goods_id, dsr, date) => {
    const sql = `UPDATE goods_verifieds_stats SET dsr = ? WHERE goods_id = ? AND \`date\` = ?`
    const result = await query(sql, [
        dsr, 
        goods_id, 
        date])
    return result?.affectedRows ? true : false
}

goodsVerifiedsStats.updateLaborCost = async (goods_id, shop_id, date) => {
    let sql = `SELECT SUM(rate) AS labor_cost FROM orders_goods WHERE goods_id = ? 
        AND shop_id = ? AND verified_date = ?`
    let rows = await query(sql, [goods_id, shop_id, date])
    if (!rows?.length) return false
    sql = `UPDATE goods_verifieds_stats SET labor_cost = ? WHERE goods_id = ? 
        AND shop_id = ? AND \`date\` = ?`
    const result = await query(sql, [rows[0].labor_cost, goods_id, shop_id, date])
    return result?.affectedRows ? true : false
}

goodsVerifiedsStats.deleteByDate = async (date) => {
    const sql = `DELETE FROM goods_verifieds_stats WHERE \`date\` = ?`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

module.exports = goodsVerifiedsStats