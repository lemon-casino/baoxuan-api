const { query, transaction } = require('../../model/dbConn')
const moment = require('moment')
const goodsPaysStats = {}

goodsPaysStats.batchInsert = async (date) => {
    let sqls = [], params = []
    sqls.push(`DELETE FROM goods_pays_stats WHERE \`date\` = ? AND shop_name !='京东自营-厨具' AND shop_name !='京东自营-日用' `)
    params.push([date])
    let sql = `SELECT a1.goods_id, a1.shop_name, a1.shop_id, a1.date, a1.sale_qty, a1.sale_amount, 
	        a1.cost_amount, a1.express_fee, a1.packing_fee, a2.labor_cost, a1.promotion_amount, 
            a1.operation_amount, a1.order_num, a1.refund_num, a1.profit, a1.pay_amount, 
            a1.brushing_amount, a1.brushing_qty, a1.refund_amount, a1.bill_amount, 
            a4.words_market_vol, a4.words_vol, a4.dsr
        FROM goods_pays a1 LEFT JOIN goods_other_info a4 ON a4.goods_id = a1.goods_id 
		    AND a4.date = ? 
        LEFT JOIN (SELECT SUM(rate) AS labor_cost, goods_id, shop_id FROM orders_goods_pays 
            WHERE \`date\` = ? GROUP BY goods_id, shop_id) a2 ON a1.goods_id = a2.goods_id 
            AND a1.shop_id = a2.shop_id 
        WHERE a1.date = ? AND shop_name !='京东自营-厨具' AND shop_name !='京东自营-日用'`
    let rows = await query(sql, [date, date, date, date]), data = [], start, end
    if (!rows?.length) return false
    let chunk = Math.ceil(rows.length / 500)
    for (let i = 0; i < chunk; i++) {
        sql = `INSERT INTO goods_pays_stats(
            goods_id, 
            shop_name, 
            shop_id, 
            \`date\`, 
            pay_amount, 
            brushing_amount, 
            brushing_qty, 
            refund_amount, 
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
            profit, 
            sale_qty) VALUES`, start = i * 500, data = [], 
            end = (i + 1) * 500 <= rows.length ? (i + 1) * 500 : rows.length
        for (let j = start; j < end; j++) {
            sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
            data.push(
                rows[j].goods_id, 
                rows[j].shop_name, 
                rows[j].shop_id, 
                rows[j].date, 
                rows[j].pay_amount, 
                rows[j].brushing_amount, 
                rows[j].brushing_qty, 
                rows[j].refund_amount, 
                rows[j].bill_amount, 
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
                rows[j].profit,
                rows[j].sale_qty
            )
        }
        sql = sql.substring(0, sql.length - 1)
        sqls.push(sql)
        params.push(data)
    }
    const result = await transaction(sqls, params)
    return result
}

goodsPaysStats.batchInsertJD = async (date,shop_name) => {
    let sqls = [], params = []
    sqls.push(`DELETE FROM goods_pays_stats WHERE \`date\` = ? AND shop_name = ?' `)
    params.push([date,shop_name])
    let sql = `SELECT a1.goods_id, a1.shop_name, a1.shop_id, a1.date, a1.sale_qty, a1.sale_amount, 
	        a1.cost_amount, a1.express_fee, a1.packing_fee, a2.labor_cost, a1.promotion_amount, 
            a1.operation_amount, a1.order_num, a1.refund_num, a1.profit, a1.pay_amount, 
            a1.brushing_amount, a1.brushing_qty, a1.refund_amount, a1.bill_amount, 
            a4.words_market_vol, a4.words_vol, a4.dsr
        FROM goods_pays a1 LEFT JOIN goods_other_info a4 ON a4.goods_id = a1.goods_id 
		    AND a4.date = ? 
        LEFT JOIN (SELECT SUM(rate) AS labor_cost, goods_id, shop_id FROM orders_goods_pays 
            WHERE \`date\` = ? GROUP BY goods_id, shop_id) a2 ON a1.goods_id = a2.goods_id 
            AND a1.shop_id = a2.shop_id 
        WHERE a1.date = ? AND shop_name = ?'`
    let rows = await query(sql, [date, date, date, date,shop_name]), data = [], start, end
    if (!rows?.length) return false
    let chunk = Math.ceil(rows.length / 500)
    for (let i = 0; i < chunk; i++) {
        sql = `INSERT INTO goods_pays_stats(
            goods_id, 
            shop_name, 
            shop_id, 
            \`date\`, 
            pay_amount, 
            brushing_amount, 
            brushing_qty, 
            refund_amount, 
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
            profit, 
            sale_qty) VALUES`, start = i * 500, data = [], 
            end = (i + 1) * 500 <= rows.length ? (i + 1) * 500 : rows.length
        for (let j = start; j < end; j++) {
            sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
            data.push(
                rows[j].goods_id, 
                rows[j].shop_name, 
                rows[j].shop_id, 
                rows[j].date, 
                rows[j].pay_amount, 
                rows[j].brushing_amount, 
                rows[j].brushing_qty, 
                rows[j].refund_amount, 
                rows[j].bill_amount, 
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
                rows[j].profit,
                rows[j].sale_qty
            )
        }
        sql = sql.substring(0, sql.length - 1)
        sqls.push(sql)
        params.push(data)
    }
    const result = await transaction(sqls, params)
    return result
}

goodsPaysStats.updateSalemonth = async (date) => {
    let targetstart = moment(date).startOf('month').format('YYYY-MM-DD')
    let targetend = moment(date).endOf('month').format('YYYY-MM-DD')
    let sqls = [], params = []
    let sql1 = `SELECT goods_id, shop_id, SUM(IFNULL(sale_amount,0)) AS sale_month
                FROM goods_pays_stats
                WHERE date BETWEEN '${targetstart}' AND '${targetend}'
                GROUP BY goods_id, shop_id`
    const sales_month = await query(sql1)
    for(let i = 0; i < sales_month.length; i++){
        if(sales_month[i].goods_id === null){
            sqls.push(`UPDATE goods_pays_stats SET sale_month = ? WHERE goods_id IS NULL AND shop_id=? AND date BETWEEN '${targetstart}' AND '${targetend}'`)
            params.push([
                sales_month[i].sale_month,
                sales_month[i].goods_id,
                sales_month[i].shop_id
            ])
        }else{
            sqls.push(`UPDATE goods_pays_stats SET sale_month = ? WHERE goods_id =? AND shop_id=? AND date BETWEEN '${targetstart}' AND '${targetend}'`)
            params.push([
                sales_month[i].sale_month,
                sales_month[i].goods_id,
                sales_month[i].shop_id
            ])
        }
    }
    const result = await transaction(sqls, params)
    return result
}

goodsPaysStats.updateVol = async (goods_id, words_market_vol, words_vol, date) => {
    const sql = `UPDATE goods_pays_stats SET words_market_vol = ?, words_vol = ?, 
        WHERE goods_id = ? AND \`date\` = ?`
    const result = await query(sql, [
        words_market_vol, 
        words_vol, 
        goods_id, 
        date])
    return result?.affectedRows ? true : false
}

goodsPaysStats.updateDSR = async (date) => {
    const sql = `SELECT dsr, goods_id FROM goods_other_info WHERE date = ?`
    const rows = await query(sql, [date])
    let sqls = [], params = []
    for (let i = 0; i < rows.length; i++) {
        sqls.push(`UPDATE goods_pays_stats SET dsr = ? WHERE goods_id = ? AND \`date\` = ?`)
        params.push([
            rows[i].dsr, 
            rows[i].goods_id, 
            date
        ])
    }
    const result = await transaction(sqls, params)
    return result
}

goodsPaysStats.updateLaborCost = async (date) => {
    let sql = `SELECT SUM(rate) AS labor_cost, shop_id, goods_id FROM orders_goods_pays 
        WHERE \`date\` = ? GROUP BY shop_id, goods_id`
    let rows = await query(sql, [date])
    if (!rows?.length) return false
    sql = `UPDATE goods_pays_stats SET labor_cost = NULL WHERE \`date\` = ?`
    await query(sql, [date])
    sql = `UPDATE goods_pays_stats SET labor_cost = ? WHERE goods_id = ? AND shop_id = ? 
        AND \`date\` = ?`
    let sql1 = `UPDATE goods_pays_stats SET labor_cost = ? WHERE goods_id IS NULL 
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

goodsPaysStats.deleteByDate = async (date) => {
    const sql = `DELETE FROM goods_pays_stats WHERE \`date\` = ?`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

module.exports = goodsPaysStats