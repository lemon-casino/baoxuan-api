const { query } = require('../../model/dbConn')
const goodsSalesStats = {}

goodsSalesStats.batchInsert = async (date) => {
    let sql = `SELECT a1.goods_id, a1.shop_name, a1.shop_id, a1.date, a1.sale_amount, 
	        a1.cost_amount, a1.express_fee, a1.packing_fee, a2.labor_cost, a1.promotion_amount, 
            a1.operation_amount, a1.order_num, a1.refund_num, a1.profit, a3.pay_amount, 
            a3.brushing_amount, a3.brushing_qty, a3.refund_amount, a3.pay_express_fee, 
            IFNULL(a3.pay_amount, 0) - IFNULL(a3.brushing_amount, 0) - IFNULL(a3.refund_amount, 0) 
                AS real_pay_amount, a3.bill, a4.words_market_vol, a4.words_vol, a4.dsr
        FROM goods_sales a1 LEFT JOIN goods_other_info a4 ON a4.goods_id = a1.goods_id 
		    AND a4.date = ?
        LEFT JOIN goods_payments a3 ON a1.goods_id = a3.goods_id AND a3.date = ?
        LEFT JOIN (SELECT SUM(rate) AS labor_cost, goods_id, shop_id FROM orders_goods 
            WHERE \`date\` = ? GROUP BY goods_id, shop_id) a2 ON a1.goods_id = a2.goods_id 
            AND a1.shop_id = a2.shop_id 
        WHERE a1.date = ?`
    let rows = await query(sql, [date, date, date, date]), data = []
    if (!rows?.length) return false
    sql = `INSERT INTO goods_sales_stats(
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
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

goodsSalesStats.updatePayments = async (goods_id, date) => {
    let sql = `SELECT pay_amount, brushing_amount, brushing_qty, refund_amount, 
        pay_express_fee, bill FROM goods_payments WHERE goods_id = ? AND \`date\` = ?`
    let rows = await query(sql, [goods_id, date])
    if (!rows?.length) return false
    sql = `UPDATE goods_sales_stats SET pay_amount = ?, brushing_amount = ?, 
            brushing_qty = ?, refund_amount = ?, pay_express_fee = ?, bill = ? 
        WHERE goods_id = ? AND \`date\` = ?`
    const result = await query(sql, [
        rows[0].pay_amount, 
        rows[0].brushing_amount, 
        rows[0].brushing_qty, 
        rows[0].refund_amount, 
        rows[0].pay_express_fee, 
        rows[0].bill, 
        goods_id, 
        date])
    return result?.affectedRows ? true : false
}

goodsSalesStats.updateVol = async (goods_id, words_market_vol, words_vol, date) => {
    const sql = `UPDATE goods_sales_stats SET words_market_vol = ?, words_vol = ?, 
        WHERE goods_id = ? AND \`date\` = ?`
    const result = await query(sql, [
        words_market_vol, 
        words_vol, 
        goods_id, 
        date])
    return result?.affectedRows ? true : false
}

goodsSalesStats.updateDSR = async (goods_id, dsr, date) => {
    const sql = `UPDATE goods_sales_stats SET dsr = ? WHERE goods_id = ? AND \`date\` = ?`
    const result = await query(sql, [
        dsr, 
        goods_id, 
        date])
    return result?.affectedRows ? true : false
}

goodsSalesStats.updateLaborCost = async (goods_id, shop_id, date) => {
    let sql = `SELECT SUM(rate) AS labor_cost FROM orders_goods WHERE goods_id = ? 
        AND shop_id = ? AND \`date\` = ?`
    let rows = await query(sql, [goods_id, shop_id, date])
    if (!rows?.length) return false
    sql = `UPDATE goods_sales_stats SET labor_cost = ? WHERE goods_id = ? AND shop_id = ? 
        AND \`date\` = ?`
    const result = await query(sql, [rows[0].labor_cost, goods_id, shop_id, date])
    return result?.affectedRows ? true : false
}

goodsSalesStats.deleteByDate = async (date) => {
    const sql = `DELETE FROM goods_sales_stats WHERE \`date\` = ?`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

module.exports = goodsSalesStats