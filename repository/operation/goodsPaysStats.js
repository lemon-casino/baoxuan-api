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
    let rows = await query(sql, [date, date, date]), data = [], start, end
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

goodsPaysStats.batchInsertJD = async (date) => {
    let sqls = [], params = []
    sqls.push(`DELETE FROM goods_pays_stats WHERE \`date\` = ? AND shop_name ='京东自营-厨具' OR shop_name ='京东自营-日用' `)
    params.push([date])
    let sql = `SELECT a1.goods_id, a1.shop_name, a1.shop_id, a1.date, a1.sale_qty, a1.sale_amount, 
	        a1.cost_amount, a1.express_fee, a1.packing_fee, a2.labor_cost, a1.promotion_amount, 
            a1.operation_amount, a1.order_num, a1.refund_num, a1.profit, a1.pay_amount, 
            a1.brushing_amount, a1.brushing_qty, a1.refund_amount, a1.bill_amount, 
            a4.words_market_vol, a4.words_vol, a4.dsr,a1.gross_standard,a1.other_cost
        FROM goods_pays a1 LEFT JOIN goods_other_info a4 ON a4.goods_id = a1.goods_id 
		    AND a4.date = ? 
        LEFT JOIN (SELECT SUM(rate) AS labor_cost, goods_id, shop_id FROM orders_goods_pays 
            WHERE \`date\` = ? GROUP BY goods_id, shop_id) a2 ON a1.goods_id = a2.goods_id 
            AND a1.shop_id = a2.shop_id 
        WHERE a1.date = ? AND shop_name ='京东自营-厨具' OR shop_name ='京东自营-日用'`
    let rows = await query(sql, [date, date, date]), data = [], start, end
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
            sale_qty,
            gross_standard,
            other_cost) VALUES`, start = i * 500, data = [], 
            end = (i + 1) * 500 <= rows.length ? (i + 1) * 500 : rows.length
        for (let j = start; j < end; j++) {
            sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
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
                rows[j].sale_qty,
                rows[j].gross_standard,
                rows[j].other_cost
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

goodsPaysStats.getVolumeTargetJD = async () =>{
    let sql = `select goods_id,SUM(sale_amount) as sale_amount,(CASE 
            WHEN SUM(sale_amount)>=90000 THEN '超大'
            WHEN SUM(sale_amount) >= 30000  and SUM(sale_amount) < 90000 THEN '大'
            WHEN SUM(sale_amount) < 30000 AND SUM(sale_amount) >=15000 THEN '中'
            WHEN SUM(sale_amount) < 15000 AND SUM(sale_amount) >=8000 THEN '小'
            ELSE NULL
        END) as volume_target
        from goods_pays_stats 
        WHERE date BETWEEN DATE_SUB(CURRENT_DATE,INTERVAL 30 DAY) AND DATE_SUB(CURRENT_DATE,INTERVAL 1 DAY) 
        AND shop_name in ('京东自营-厨具','京东自营-日用')
        GROUP BY goods_id`
    let result = await query(sql)
    return result
}

goodsPaysStats.getVolumeTargetPDD = async () =>{
    let sql = `select goods_id,SUM(sale_amount) as sale_amount,(CASE 
            WHEN SUM(sale_amount)>=60000 THEN '超大'
            WHEN SUM(sale_amount) >= 30000  and SUM(sale_amount) < 60000 THEN '大'
            WHEN SUM(sale_amount) < 30000 AND SUM(sale_amount) >=15000 THEN '中'
            WHEN SUM(sale_amount) < 15000 AND SUM(sale_amount) >=9000 THEN '小'
            ELSE NULL
        END) as volume_target
        from goods_pays_stats 
        WHERE date BETWEEN DATE_SUB(CURRENT_DATE,INTERVAL 30 DAY) AND DATE_SUB(CURRENT_DATE,INTERVAL 1 DAY) 
        AND shop_name like '%拼多多%'
        GROUP BY goods_id`
    let result = await query(sql)
    return result
}

goodsPaysStats.getVolumeTargetTM = async () =>{
    let sql = `select goods_id,avg(sale_amount) as sale_amount,(CASE 
                WHEN avg(sale_amount) >= 5000 THEN '超大'
                WHEN avg(sale_amount) >= 3000 AND avg(sale_amount) < 5000 THEN '大'
                WHEN avg(sale_amount) < 3000 AND avg(sale_amount) >=1000 THEN '中'
                WHEN avg(sale_amount) < 1000 AND avg(sale_amount) >=400 THEN '小'
                ELSE NULL
            END) as volume_target
            from goods_pays_stats 
            WHERE date BETWEEN DATE_SUB(CURRENT_DATE,INTERVAL 7 DAY) AND DATE_SUB(CURRENT_DATE,INTERVAL 1 DAY) 
            AND shop_name = 'pakchoice旗舰店（天猫）'
            GROUP BY goods_id`
    let result = await query(sql)
    return result
}

goodsPaysStats.getVolumeTargetInfo = async(column,goods_id)=>{
    let sql = `select * from dianshang_operation_attribute where ${column} = ?`
    let result = await query(sql,[goods_id])
    return result
}

goodsPaysStats.getWeekSalesAmount = async() => {
    let month1 = moment().format('YYYYMM'), 
        days1 = moment().format('YYYYMM') == moment().subtract(1, 'day').format('YYYYMM') ? 
            moment().subtract(1, 'day').date() : 0, 
        total1 = moment().daysInMonth(), 
        month2 = moment().subtract(1, 'month').format('YYYYMM'), 
        days2 = 7 - days1, 
        total2 = moment().subtract(1, 'month').daysInMonth()
    
    let sql = `SELECT g.goods_id, g.platform, g.userDef1, g.link_state, 
            IF(g.platform = '自营', g.onsale_date, s.create_time) AS onsale_date, 
            a.sale_amount, a.profit, b.sale_amount AS target1, c.sale_amount AS target2, 
            d.sale_amount AS target3, t.amount AS target4, g.product_stage 
        FROM (SELECT IF(platform = '自营', brief_name, goods_id) AS goods_id, platform, userDef1, 
                link_state, onsale_date, product_stage FROM dianshang_operation_attribute 
            WHERE platform IN ('自营', 'fcs+pop', '拼多多部', '天猫部') 
            GROUP BY brief_name, goods_id, platform, userDef1, link_state, onsale_date, product_stage) g 
        LEFT JOIN (SELECT goods_id, MIN(create_time) AS create_time FROM jst_goods_sku GROUP BY goods_id) s 
            ON g.goods_id = s.goods_id 
        LEFT JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, IFNULL(SUM(profit), 0) AS profit, goods_id 
            FROM goods_pays_stats WHERE date BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY) 
                AND DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY) 
            GROUP BY goods_id) a ON a.goods_id = g.goods_id 
        LEFT JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id FROM spiral_target 
            WHERE date BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY) 
                AND DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY) 
                AND day IN ('第7天', '第6天', '第5天', '第4天', '第3天', '第2天', '第1天')
            GROUP BY goods_id) b ON a.goods_id = g.goods_id
        LEFT JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id FROM spiral_target 
            WHERE date BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY) 
                AND DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY) 
                AND day IN ('第11天', '第10天', '第9天', '第8天', '第7天', '第6天', '第5天') 
            GROUP BY goods_id) c ON c.goods_id = g.goods_id 
        LEFT JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id FROM spiral_target 
            WHERE date BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY) 
                AND DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY) 
                AND day IN ('第20天', '第19天', '第18天', '第17天', '第16天', '第15天', '第14天') 
            GROUP BY goods_id) d ON d.goods_id = g.goods_id 
        LEFT JOIN (SELECT SUM(amount) AS amount, goods_id FROM (
            SELECT FORMAT(amount * ${days1}/${total1}, 2) AS amount, goods_id 
            FROM goods_monthly_sales_target WHERE month = "${month1}"
			UNION ALL 
            SELECT FORMAT(amount * ${days2}/${total2}, 2) AS amount, goods_id 
            FROM goods_monthly_sales_target WHERE month = "${month2}"
        ) t1 GROUP BY goods_id) t ON t.goods_id = g.goods_id 
        WHERE g.goods_id IS NOT NULL`
    const result = await query(sql)
    return result
}

module.exports = goodsPaysStats