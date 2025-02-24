const { query, transaction } = require('../../model/dbConn')
const moment = require('moment')
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
        LEFT JOIN (SELECT SUM(rate) AS labor_cost, goods_id, shop_id FROM orders_goods_verifieds 
            WHERE \`date\` = ? GROUP BY goods_id, shop_id) a2 ON a1.goods_id = a2.goods_id 
            AND s.shop_id = a2.shop_id 
        WHERE a1.date = ?`
    let rows = await query(sql, [date, date, date, date]), data = [], start, end
    if (!rows?.length) return false
    for (let i = 0; i < rows.length; i++) {
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
            profit) VALUES`, start = i * 500, data = [], 
            end = (i + 1) * 500 <= rows.length ? (i + 1) * 500 : rows.length
        for (let j = start; j < end; j++) {
            sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
            data.push(
                rows[j].goods_id, 
                rows[j].shop_name, 
                rows[j].shop_id, 
                rows[j].date, 
                rows[j].pay_amount, 
                rows[j].brushing_amount, 
                rows[j].brushing_qty, 
                rows[j].refund_amount, 
                rows[j].pay_express_fee, 
                rows[j].real_pay_amount, 
                rows[j].bill, 
                rows[j].sale_amount, 
                rows[j].cost_amount, 
                rows[j].express_fee, 
                rows[j].packing_fee, 
                rows[j].labor_cost, 
                rows[j].promotion_amount, 
                rows[j].operation_amount, 
                rows[j].words_market_vol, 
                rows[j].words_vol, 
                rows[j].dsr, 
                rows[j].order_num, 
                rows[j].refund_num, 
                rows[j].profit
            )
        }
        sql = sql.substring(0, sql.length - 1)
        sqls.push(sql)
        params.push(data)
    }
    const result = await transaction(sqls, params)
    return result
}

goodsVerifiedsStats.updateSalemonth = async (date) => {
    let targetstart = moment(date).startOf('month').format('YYYY-MM-DD')
    let targetend = moment(date).endOf('month').format('YYYY-MM-DD')
    let sql1 = `SELECT goods_id,shop_id,SUM(IFNULL(sale_amount,0)) AS sale_month
                FROM goods_verifieds_stats
                WHERE date BETWEEN '${targetstart}' AND '${targetend}'
                GROUP BY goods_id,shop_id`
    const sales_month = await query(sql1)
    for(let i = 0; i < sales_month.length; i++){
        sql1 = `UPDATE goods_verifieds_stats SET sale_month = ? WHERE goods_id =? AND shop_id=? AND date BETWEEN '${targetstart}' AND '${targetend}'`
        result = await query(sql1,[sales_month[i].sale_month,sales_month[i].goods_id,sales_month[i].shop_id])
    }
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

goodsVerifiedsStats.updateLaborCost = async (date) => {
    let sql = `SELECT SUM(rate) AS labor_cost, goods_id, shop_id FROM orders_goods_verifieds 
        WHERE \`date\` = ? GROUP BY goods_id, shop_id`
    let rows = await query(sql, [date])
    if (!rows?.length) return false
    sql = `UPDATE goods_verifieds_stats SET labor_cost = NULL WHERE \`date\` = ?`
    await query(sql, [date])
    sql = `UPDATE goods_verifieds_stats SET labor_cost = ? WHERE goods_id = ? 
        AND shop_id = ? AND \`date\` = ?`
    let sql1 = `UPDATE goods_verifieds_stats SET labor_cost = ? WHERE goods_id IS NULL  
            AND shop_id = ? AND \`date\` = ?`, result
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].goods_id === null) {
            result = await query(sql1, [
                rows[i].labor_cost, 
                rows[i].shop_id, 
                date
            ])
        } else {
            result = await query(sql, [
                rows[i].labor_cost, 
                rows[i].goods_id, 
                rows[i].shop_id, 
                date
            ])
        }
    }
    return result?.affectedRows ? true : false
}

goodsVerifiedsStats.deleteByDate = async (date) => {
    const sql = `DELETE FROM goods_verifieds_stats WHERE \`date\` = ?`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

module.exports = goodsVerifiedsStats