const { query } = require('../../model/dbConn')
const moment = require('moment')
const goodsPayInfoRepo = {}

goodsPayInfoRepo.getPaymentByShopNamesAndTime = async (shopNames, start, end) => {
    const sql = `SELECT IFNULL(SUM(a1.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(a1.express_fee), 0) AS express_fee, 
            IFNULL(SUM(a1.packing_fee), 0) AS packing_fee, 
            IFNULL(SUM(a1.promotion_amount), 0) AS promotion_amount, 
            IFNULL(SUM(a1.bill_amount), 0) AS bill_amount, 
            IFNULL(SUM(a1.operation_amount), 0) AS operation_amount, 
            IFNULL(SUM(a2.words_market_vol), 0) AS words_market_vol, 
            IFNULL(SUM(a2.words_vol), 0) AS words_vol, 
            IFNULL(SUM(a1.order_num), 0) AS order_num, 
            IFNULL(SUM(a1.refund_num), 0) AS refund_num, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.operation_amount), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS operation_rate, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.promotion_amount), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS promotion_rate,
            FORMAT(IF(IFNULL(SUM(a1.promotion_amount), 0) > 0, 
                IFNULL(SUM(a1.sale_amount), 0) / SUM(a1.promotion_amount), 
                0), 2) AS roi, 
            FORMAT(IF(IFNULL(SUM(a2.words_market_vol), 0) > 0, 
                IFNULL(SUM(a2.words_vol), 0) / SUM(a2.words_market_vol) * 100, 
                0), 2) AS market_rate, 
            FORMAT(IF(IFNULL(SUM(a1.order_num), 0) > 0, 
                IFNULL(SUM(a1.refund_num), 0) / SUM(a1.order_num) * 100, 
                0), 2) AS refund_rate, 
            IFNULL(SUM(a1.profit), 0) AS profit, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.profit), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS profit_rate FROM goods_pays a1
        LEFT JOIN goods_other_info a2 ON a1.goods_id = a2.goods_id
            AND a1.date = a2.date
        WHERE a1.shop_name IN ("${shopNames}") 
            AND a1.date >= ?
            AND a1.date <= ?`
    const result = await query(sql, [start, end])
    return result || []
}

goodsPayInfoRepo.getDataRateByTime = async(col1, col2, column, goods_id, start, end, percent) => {
    let sql = `SELECT FORMAT(IF(IFNULL(SUM(${col1}), 0) > 0, 
            IFNULL(SUM(${col2}), 0) / SUM(${col1}), 0) * ${percent}, 2) AS ${column}, 
            \`date\` FROM goods_sale_info WHERE \`date\` >= ? AND \`date\` <= ? 
            AND goods_id = ?
        GROUP BY \`date\``
    if(column == 'profit_rate_gmv'){
        sql = `SELECT FORMAT(IF(IFNULL(SUM(real_sale_amount), 0) > 0
                , IFNULL(SUM(profit), 0) / SUM(real_sale_amount), 0) * ${percent}, 2) AS ${column}, 
            \`date\` FROM goods_sale_info WHERE \`date\` >= ? AND \`date\` <= ? 
            AND goods_id = ?
        GROUP BY \`date\``
    }
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsPayInfoRepo.getTargetsByShopNames = async (shopNames, months) => {
    let presql = `SELECT FORMAT(IF(IFNULL(SUM(a2.amount), 0) > 0, 
            IFNULL(SUM(a1.amount), 0) / SUM(a2.amount) * 100, 0), 2) AS target, 
        IFNULL(SUM(a1.amount), 0) AS amount1, 
        IFNULL(SUM(a2.amount), 0) AS amount2, a2.month FROM 
        goods_monthly_sales_target a2 JOIN dianshang_operation_attribute doa 
            ON a2.goods_id = doa.goods_id 
        LEFT JOIN (SELECT IFNULL(sum(sale_amount), 0) AS amount, `
    let search = ''
    for (let i = 0; i < months.length; i++) {
        let sql = `'${moment(months[i].start).format('YYYYMM')}' AS month, goods_id 
            FROM goods_pays WHERE date >= '${months[i].start}' 
                AND date < '${months[i].end}' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) a1 
                ON a1.month = a2.month AND a1.goods_id = a2.goods_id
            WHERE a2.month = '${moment(months[i].start).format('YYYYMM')}' 
                AND doa.shop_name IN ("${shopNames}") 
            GROUP BY a2.month`
        search = `${search}${presql}
                ${sql}
            UNION ALL `
    }
    search = search.substring(0, search.length - 10)
    search = `${search} ORDER BY month`
    let result = await query(search)
    return result || []
}

goodsPayInfoRepo.getNullPromotionByTime = async (shopNames, start, end) => {
    let sql = `SELECT a1.shop_name FROM goods_pays a1 LEFT JOIN shop_info si
            ON a1.shop_name = si.shop_name 
        WHERE a1.shop_name IN ("${shopNames}") AND a1.date >= ? 
            AND a1.date <= ? 
            AND si.has_promotion = 1 
            AND a1.date > '2024-12-31' 
            AND NOT EXISTS (
                SELECT s.id FROM shop_promotion_log s WHERE s.shop_name = a1.shop_name 
                    AND a1.date = s.date
            )
        GROUP BY a1.shop_name, a1.date HAVING SUM(a1.promotion_amount) = 0`
    let result = await query(sql, [start, end])
    return result?.length ? true:false
}

goodsPayInfoRepo.getDetailByShopNamesAndTme = async (shopNames, column, start, end) => {
    let sql = `SELECT IFNULL(SUM(${column}), 0) AS ${column}, \`date\` FROM goods_pays  
        WHERE \`date\` >= ? AND \`date\` <= ? AND shop_name IN ("${shopNames}") 
        GROUP BY \`date\``
    let result = await query(sql, [start, end])
    return  result || []
}

goodsPayInfoRepo.getRateByShopNamesAndTme = async (shopNames, col1, col2, column, start, end, percent) => {
    let sql = `SELECT FORMAT(IF(IFNULL(SUM(${col1}), 0) > 0, 
                IFNULL(SUM(${col2}), 0) / SUM(${col1}) * ${percent}, 0), 2) AS ${column}, \`date\` 
        FROM goods_pays 
        WHERE \`date\` >= ? AND \`date\` <= ? AND shop_name IN ("${shopNames}") 
        GROUP BY \`date\``
    let result = await query(sql, [start, end])
    return  result || []
}

goodsPayInfoRepo.getChildPaymentByShopNamesAndTime = async (shopNames, start, end) => {
    const sql = `SELECT IFNULL(SUM(A1.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(a1.express_fee), 0) AS express_fee, 
            IFNULL(SUM(a1.packing_fee), 0) AS packing_fee, 
            IFNULL(SUM(a1.promotion_amount), 0) AS promotion_amount, 
            IFNULL(SUM(a1.bill_amount), 0) AS bill_amount, 
            IFNULL(SUM(a1.operation_amount), 0) AS operation_amount, 
            IFNULL(SUM(a2.words_market_vol), 0) AS words_market_vol, 
            IFNULL(SUM(a2.words_vol), 0) AS words_vol, 
            IFNULL(SUM(a1.order_num), 0) AS order_num, 
            IFNULL(SUM(a1.refund_num), 0) AS refund_num, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.operation_amount), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS operation_rate, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.promotion_amount), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS promotion_rate, 
            FORMAT(IF(IFNULL(SUM(a1.promotion_amount), 0) > 0, 
                IFNULL(SUM(a1.sale_amount), 0) / SUM(a1.promotion_amount), 
                0), 2) AS roi, 
            FORMAT(IF(IFNULL(SUM(a2.words_market_vol), 0) > 0, 
                IFNULL(SUM(a2.words_vol), 0) / SUM(a2.words_market_vol), 
                0), 2) AS market_rate, 
            FORMAT(IF(IFNULL(SUM(a1.order_num), 0) > 0, 
                IFNULL(SUM(a1.refund_num), 0) / SUM(a1.order_num) * 100, 
                0), 2) AS refund_rate, 
            IFNULL(SUM(a1.profit), 0) AS profit, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.profit), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS profit_rate, 
            (CASE WHEN doa.onsale_date IS NULL OR 
					doa.operator IN ('无操作', '非操作') THEN 0
				WHEN DATE_SUB(NOW(), INTERVAL 60 DAY) <= doa.onsale_date THEN 1
				ELSE 2 END) AS type FROM goods_pays a1
        LEFT JOIN dianshang_operation_attribute doa ON doa.goods_id = a1.goods_id
        LEFT JOIN goods_other_info a2 ON a1.goods_id = a2.goods_id 
            AND a1.date = a2.date
        WHERE a1.shop_name IN ("${shopNames}") 
            AND a1.date >= ?
            AND a1.date <= ?
        GROUP BY (CASE WHEN doa.onsale_date IS NULL OR 
					doa.operator IN ('无操作', '非操作') THEN 0
				WHEN DATE_SUB(NOW(), INTERVAL 60 DAY) <= doa.onsale_date THEN 1
				ELSE 2 END)`
    const result = await query(sql, [start, end])
    return result || []
}

goodsPayInfoRepo.getPaymentByLinkIdsAndTime = async (linkIds, start, end) => {
    const sql = `SELECT IFNULL(SUM(a1.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(a1.express_fee), 0) AS express_fee, 
            IFNULL(SUM(a1.packing_fee), 0) AS packing_fee, 
            IFNULL(SUM(a1.promotion_amount), 0) AS promotion_amount, 
            IFNULL(SUM(a1.bill_amount), 0) AS bill_amount, 
            IFNULL(SUM(a1.operation_amount), 0) AS operation_amount, 
            IFNULL(SUM(a2.words_market_vol), 0) AS words_market_vol, 
            IFNULL(SUM(a2.words_vol), 0) AS words_vol, 
            IFNULL(SUM(a1.order_num), 0) AS order_num, 
            IFNULL(SUM(a1.refund_num), 0) AS refund_num, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.operation_amount), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS operation_rate, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.promotion_amount), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS promotion_rate, 
            FORMAT(IF(IFNULL(SUM(a1.promotion_amount), 0) > 0, 
                IFNULL(SUM(a1.sale_amount), 0) / SUM(a1.promotion_amount), 
                0), 2) AS roi, 
            FORMAT(IF(IFNULL(SUM(a2.words_market_vol), 0) > 0, 
                IFNULL(SUM(a2.words_vol), 0) / SUM(a2.words_market_vol) * 100, 
                0), 2) AS market_rate, 
            FORMAT(IF(IFNULL(SUM(a1.order_num), 0) > 0, 
                IFNULL(SUM(a1.refund_num), 0) / SUM(a1.order_num) * 100, 
                0), 2) AS refund_rate, 
            IFNULL(SUM(a1.profit), 0) AS profit, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.profit), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS profit_rate FROM goods_pays a1 
        LEFT JOIN goods_other_info a2 ON a1.goods_id = a2.goods_id
            AND a1.date = a2.date
        WHERE a1.goods_id IN ("${linkIds}") 
            AND a1.date >= ?
            AND a1.date <= ?`
    const result = await query(sql, [start, end])
    return result || []
}

goodsPayInfoRepo.getTargetsByLinkIds = async (linkIds, months) => {
    let presql = `SELECT FORMAT(IF(IFNULL(SUM(a2.amount), 0) > 0, 
            IFNULL(SUM(a1.amount), 0) / SUM(a2.amount) * 100, 0), 2) AS target, 
        IFNULL(SUM(a1.amount), 0) AS amount1, 
        IFNULL(SUM(a2.amount), 0) AS amount2, a2.month FROM 
        goods_monthly_sales_target a2 LEFT JOIN (SELECT IFNULL(sum(sale_amount), 0) AS amount, `
    let search = ''
    for (let i = 0; i < months.length; i++) {
        let sql = `'${moment(months[i].start).format('YYYYMM')}' AS month, goods_id 
            FROM goods_pays WHERE date >= '${months[i].start}' 
                AND date < '${months[i].end}' 
                AND goods_id IN ("${linkIds}") GROUP BY goods_id) a1 
                ON a1.month = a2.month AND a1.goods_id = a2.goods_id
            WHERE a2.month = '${moment(months[i].start).format('YYYYMM')}' 
                AND a2.goods_id IN ("${linkIds}") 
            GROUP BY a2.month`
        search = `${search}${presql}
                ${sql}
            UNION ALL `
    }
    search = search.substring(0, search.length - 10)
    search = `${search} ORDER BY month`
    let result = await query(search)
    return result || []
}

goodsPayInfoRepo.getDetailByLinkIdsAndTme = async (linkIds, column, start, end) => {
    let sql = `SELECT IFNULL(SUM(${column}), 0) AS ${column}, \`date\` FROM goods_pays
        WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id IN ("${linkIds}") 
        GROUP BY \`date\``
    let result = await query(sql, [start, end])
    return  result || []
}

goodsPayInfoRepo.getRateByLinkIdsAndTme = async (linkIds, col1, col2, column, start, end, percent) => {
    let sql = `SELECT FORMAT(IF(IFNULL(SUM(${col1}), 0) > 0, 
                IFNULL(SUM(${col2}), 0) / SUM(${col1}) * ${percent}, 0), 2) AS ${column}, \`date\` 
        FROM goods_pays 
        WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id IN ("${linkIds}") 
        GROUP BY \`date\``
    let result = await query(sql, [start, end])
    return  result || []
}

goodsPayInfoRepo.getChildPaymentByLinkIdsAndTime = async (linkIds, start, end) => {
    const sql = `SELECT IFNULL(SUM(a1.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(a1.express_fee), 0) AS express_fee, 
            IFNULL(SUM(a1.packing_fee), 0) AS packing_fee, 
            IFNULL(SUM(a1.promotion_amount), 0) AS promotion_amount, 
            IFNULL(SUM(a1.operation_amount), 0) AS operation_amount, 
            IFNULL(SUM(a2.words_market_vol), 0) AS words_market_vol, 
            IFNULL(SUM(a2.words_vol), 0) AS words_vol, 
            IFNULL(SUM(a1.order_num), 0) AS order_num, 
            IFNULL(SUM(a1.refund_num), 0) AS refund_num, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.operation_amount), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS operation_rate, 
            FORMAT(IF(IFNULL(SUM(a1.promotion_amount), 0) > 0, 
                IFNULL(SUM(a1.sale_amount), 0) / SUM(a1.promotion_amount), 
                0), 2) AS roi, 
            FORMAT(IF(IFNULL(SUM(a2.words_market_vol), 0) > 0, 
                IFNULL(SUM(a2.words_vol), 0) / SUM(a2.words_market_vol) * 100, 
                0), 2) AS market_rate, 
            FORMAT(IF(IFNULL(SUM(a1.order_num), 0) > 0, 
                IFNULL(SUM(a1.refund_num), 0) / SUM(a1.order_num) * 100, 
                0), 2) AS refund_rate, 
            IFNULL(SUM(a1.profit), 0) AS profit, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.profit), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS profit_rate, 
            (CASE WHEN doa.onsale_date IS NULL OR 
                    doa.operator IN ('无操作', '非操作') THEN 0
                WHEN DATE_SUB(NOW(), INTERVAL 60 DAY) <= doa.onsale_date THEN 1
                ELSE 2 END) AS type FROM goods_pays a1 
        LEFT JOIN dianshang_operation_attribute doa ON doa.goods_id = a1.goods_id
        LEFT JOIN goods_other_info a2 ON a1.goods_id = a2.goods_id
            AND a1.date = a2.date
        WHERE a1.goods_id IN ("${linkIds}") 
            AND a1.date >= ?
            AND a1.date <= ?
        GROUP BY (CASE WHEN doa.onsale_date IS NULL OR 
                doa.operator IN ('无操作', '非操作') THEN 0
            WHEN DATE_SUB(NOW(), INTERVAL 60 DAY) <= doa.onsale_date THEN 1
            ELSE 2 END)`
    const result = await query(sql, [start, end])
    return result || []
}

goodsPayInfoRepo.getData = async (start, end, params, shopNames, linkIds,shopNames1) => {
    let page = parseInt(params.currentPage)
    let size = parseInt(params.pageSize)
    let offset = (page - 1) * size
    let p = [], result = {
        currentPage: params.currentPage,
        pageSize: params.pageSize,
        data: [],
        total: 0,
        sum: 0
    }
    let preStart = moment(start).subtract(1, 'day').format('YYYY-MM-DD')
    let preEnd = moment(end).subtract(1, 'day').format('YYYY-MM-DD') 
    let targettime = moment(preEnd).diff(moment(preStart), 'days')+1
    let days = moment(end).daysInMonth()
    let start_year = parseInt(moment(start).format('YYYY')),
        end_year = parseInt(moment(end).format('YYYY')),
        start_month = parseInt(moment(start).format('MM')),
        end_month = parseInt(moment(end).format('MM'))
        let month_duration = (end_year - start_year) * 12 + end_month - start_month + 1
        let months = [], timeline = [], tmp1
    for (let i = 0; i < month_duration; i++) {
        let tmp = i+1 < month_duration ? 
            moment(start).add(i + 1, 'months').format('YYYY-MM') + '-01' : 
            moment(end).add(1, 'days').format('YYYY-MM-DD')
        months.push({start: tmp1 || start, end: tmp})
        let rate = ((moment(tmp).diff(tmp1 || start, 'days')) / moment(tmp1 || start).daysInMonth()).toFixed(4)    
        timeline.push({month:moment(tmp1 || start).format('YYYYMM'),rate:rate})
        tmp1 = tmp
    }
    let sql = `SELECT SUM(a1.sale_amount) AS sale_amount, a1.goods_id FROM goods_pays a1`
    subsql = ` WHERE a1.date BETWEEN ? AND ?`
    let hasChild = start == end ? false:true
    let date = start == end ? start: start+'~'+end
    p.push(start, end)
    for (let i =0; i < params.search.length; i++) {
        if (params.search[i].field_id == 'operation_rate') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.operation_amount), 0) AS operation_amount, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_pays a2
                        WHERE a2.date BETWEEN ? AND ? AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.operation_amount * 100 >= ${params.search[i].min} * b.sale_amount
                        AND b.operation_amount * 100 <= ${params.search[i].max} * b.sale_amount)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'roi') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.promotion_amount), 0) AS promotion_amount, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_pays a2 
                        WHERE a2.date BETWEEN ? AND ? AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.sale_amount >= ${params.search[i].min} * b.promotion_amount 
                        AND b.sale_amount <= ${params.search[i].max} * b.promotion_amount)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'market_rate') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a3.words_market_vol), 0) AS words_market_vol, 
                            IFNULL(SUM(a3.words_vol), 0) AS words_vol FROM goods_other_info a3 
                        WHERE a3.date BETWEEN ? AND ? AND a1.goods_id = a3.goods_id 
                    ) b WHERE b.words_vol * 100 >= ${params.search[i].min} * b.words_market_vol
                        AND b.words_vol * 100 <= ${params.search[i].max} * b.words_market_vol)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'refund_rate') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.order_num), 0) AS order_num, 
                            IFNULL(SUM(a2.refund_num), 0) AS refund_num FROM goods_pays a2 
                        WHERE a2.date BETWEEN ? AND ? AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.refund_num * 100 >= ${params.search[i].min} * b.order_num
                        AND b.refund_num * 100 <= ${params.search[i].max} * b.order_num)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'profit_rate') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.profit), 0) AS profit, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_pays a2 
                        WHERE a2.date BETWEEN ? AND ? AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.profit * 100 >= ${params.search[i].min} * b.sale_amount
                        AND b.profit * 100 <= ${params.search[i].max} * b.sale_amount)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'gross_profit') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT FORMAT(IF(SUM(a4.sale_amount) > 0, 
                            1 - SUM(a4.cost_amount) / SUM(a4.sale_amount), 0) * 100, 2) AS val 
                        FROM goods_verifieds_stats a4 WHERE a1.goods_id = a4.goods_id 
                            AND a4.date BETWEEN '${preStart}' AND '${preEnd}' 
                    ) b WHERE b.val BETWEEN ${params.search[i].min} AND ${params.search[i].max})`
        } else if (params.search[i].field_id == 'bill') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.bill_amount), 0) AS val 
                        FROM goods_pays a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'pay_express_fee') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.express_fee), 0) AS val 
                        FROM goods_pays a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'real_pay_amount') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.sale_amount), 0) AS val 
                        FROM goods_pays a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'real_pay_amount_qoq') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.sale_amount), 0) AS val1, 
                            IFNULL(SUM(a3.sale_amount), 0) AS val2
                        FROM goods_pays a2 JOIN goods_pays a3 ON a3.goods_id = a2.goods_id
                            AND a3.date = DATE_SUB(a2.date, INTERVAL 1 DAY)
                        WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE ((b.val2 = 0 AND 0 >= ${params.search[i].min}) OR 
                     (b.val1 * 100 >= (${params.search[i].min} + 100) * b.val2 AND b.val2 > 0)) 
                        AND ((b.val2 = 0 AND 0 <= ${params.search[i].max}) OR 
                        (b.val1 * 100 <= (${params.search[i].max} + 100) * b.val2 AND b.val2 > 0)))`
            p.push(start, end)
        }else if (params.search[i].field_id == 'sale_amount_profit_day') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT val FROM (
                        SELECT a2.goods_id,ROUND(IFNULL(sale_amount,0)/(pit_target*${targettime})*100,2) AS val FROM (
                            SELECT goods_id,SUM(sale_amount) AS sale_amount 
                            FROM goods_pays WHERE date BETWEEN ? AND ?
                            GROUP BY goods_id
                        )AS a2
                        LEFT JOIN (
                            SELECT goods_id,IFNULL(pit_target,0)AS pit_target
                            FROM dianshang_operatiON_attribute 
                            WHERE product_definition IS NOT NULL 
                        )AS a3
                        on a2.goods_id = a3.goods_id
                    )AS b where b.val >= ${params.search[i].min} 
                    AND b.val <= ${params.search[i].max} and a1.goods_id=b.goods_id)`
            p.push(start, end)
        }else if (params.search[i].field_id == 'sale_amount_profit_month') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT val FROM (
                        SELECT a2.goods_id,ROUND(IFNULL(sale_amount,0)/(pit_target*${days})*100,2) AS val FROM (
                            SELECT goods_id,SUM(sale_amount)AS sale_amount 
                            FROM goods_pays where date BETWEEN ? AND ?
                            GROUP BY goods_id
                        )AS a2
                        LEFT JOIN (
                            SELECT goods_id,IFNULL(pit_target,0)AS pit_target
                            FROM dianshang_operatiON_attribute 
                            WHERE product_definition IS NOT NULL
                        )AS a3
                        on a2.goods_id=a3.goods_id
                    )AS b where b.val >= ${params.search[i].min} 
                    AND b.val <= ${params.search[i].max} and a1.goods_id=b.goods_id)`
            p.push(start, end)
        }else if (['words_market_vol', 'words_vol'].includes(params.search[i].field_id)) {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.${params.search[i].field_id}), 0) AS val 
                        FROM goods_other_info a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'dsr') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT FORMAT(IFNULL(SUM(a2.dsr), 0) / COUNT(1), 2) AS val 
                        FROM goods_other_info a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'promotion_amount_qoq') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT FORMAT(IF(IFNULL(SUM(a2.promotion_amount), 0) > 0, 
                            (IFNULL(SUM(a1.promotion_amount), 0) - SUM(a2.promotion_amount)) /
                            SUM(a2.promotion_amount) * 100, 0 
                        ), 2) AS val FROM goods_pays a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(preStart, preEnd)
        } else if (params.search[i].field_id == 'is_goods_id') {
            if (params.search[i].value == 0)
                subsql = `${subsql} AND a1.goods_id IS NULL`
            else subsql = `${subsql} AND a1.goods_id IS NOT NULL`
        } else if (params.search[i].field_id == 'shop_id') {
            subsql = `${subsql} AND a1.shop_id LIKE '%${params.search[i].value}%'`
        } else if (params.search[i].field_id == 'onsale_info') {
            if (params.search[i].value != 'old') {
                let tStart = moment().subtract(params.search[i].value-1, 'day').format('YYYY-MM-DD')
                let tEnd = moment().format('YYYY-MM-DD')
                subsql = `${subsql} AND (EXISTS(
                        SELECT a2.brief_name FROM dianshang_operation_attribute a2 
                        WHERE a2.onsale_date BETWEEN ? AND ? AND a1.goods_id = a2.brief_name
                            AND a2.platform = '自营') OR EXISTS(
                        SELECT * FROM (SELECT a2.goods_id, MIN(a2.create_time) AS create_time FROM 
                            jst_goods_sku a2 WHERE a2.goods_id = a1.goods_id) aa 
                        WHERE create_time BETWEEN ? AND ?))`
                p.push(tStart, tEnd, tStart, tEnd)
            } else
                subsql = `${subsql} AND (EXISTS(
                    SELECT a2.brief_name FROM dianshang_operation_attribute a2 WHERE 
                        (a2.onsale_date < DATE_SUB(NOW(), INTERVAL 90 DAY) OR 
                            a2.onsale_date IS NULL
                        ) AND a1.goods_id = a2.brief_name AND a2.platform = '自营') OR EXISTS(
                    SELECT * FROM (SELECT a2.goods_id, MIN(a2.create_time) AS create_time 
                        FROM jst_goods_sku a2 WHERE a2.goods_id = a1.goods_id) aa 
                        WHERE create_time < DATE_SUB(NOW(), INTERVAL 90 DAY)))`
        } else if (params.search[i].field_id == 'goods_id') {
            subsql = `${subsql} AND a1.goods_id LIKE '%${params.search[i].value}%'`
        } else if (params.search[i].field_id == 'sku_id') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(s.on_sku_code, a2.sku_id) AS sku_id FROM 
                        orders_goods_pays a2 LEFT JOIN jst_goods_sku s 
                            ON a2.goods_id = s.goods_id AND a2.sku_id = s.sku_id 
                        WHERE a2.goods_id = a1.goods_id AND a2.date BETWEEN ? AND ? 
                        GROUP BY a2.sku_id, s.on_sku_code 
                        ORDER BY IFNULL(SUM(a2.sale_amount), 0) DESC LIMIT 1 
                    ) a3 WHERE a3.sku_id LIKE '%${params.search[i].value}%')`
            p.push(start, end)
        } else if (params.search[i].field_id == 'sku_sid') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (SELECT * FROM (
                        SELECT IFNULL(s.on_sku_code, a2.sku_id) AS sku_id, 
                            IFNULL(SUM(a2.sale_amount), 0) AS amount 
                        FROM orders_goods_pays a2 LEFT JOIN jst_goods_sku s 
                            ON a2.goods_id = s.goods_id AND a2.sku_id = s.sku_id 
                        WHERE a2.goods_id = a1.goods_id AND a2.date BETWEEN ? AND ? 
                        GROUP BY a2.sku_id, s.on_sku_code 
                        ORDER BY IFNULL(SUM(a2.sale_amount), 0) DESC LIMIT 2 
                    ) a3 WHERE (SELECT COUNT(1) FROM (
                        SELECT IFNULL(s.on_sku_code, a2.sku_id) AS sku_id, 
                            IFNULL(SUM(a2.sale_amount), 0) AS amount 
                        FROM orders_goods_pays a2 LEFT JOIN jst_goods_sku s 
                            ON a2.goods_id = s.goods_id AND a2.sku_id = s.sku_id 
                        WHERE a2.goods_id = a1.goods_id AND a2.date BETWEEN ? AND ? 
                        GROUP BY a2.sku_id, s.on_sku_code 
                        ORDER BY IFNULL(SUM(a2.sale_amount), 0) DESC LIMIT 2) a4
                    ) = 2 ORDER BY amount LIMIT 1) a4 
                    WHERE a4.sku_id LIKE '%${params.search[i].value}%')`
            p.push(start, end, start, end)
        } else if (['pit_target_day', 'pit_target_month'].includes(params.search[i].field_id)) {
            if(params.search[i].field_id=='pit_target_day'){
                day_s = targettime
            }else{
                day_s = days
            }
            subsql = `${subsql} AND EXISTS(
                    select * FROM (								
                    select pit_target*${day_s} as val from dianshang_operation_attribute AS a2
                    where a2.goods_id=a1.goods_id
                    )AS b
                    WHERE b.val>=${params.search[i].min} and b.val<=${params.search[i].max})`
        } else if (params.search[i].type == 'number') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.${params.search[i].field_id}), 0) AS val FROM 
                        goods_pays a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max})`
            p.push(start, end)
        } else if (params.search[i].type == 'date' && params.search[i].time) {
            subsql = `${subsql} AND EXISTS(
                    SELECT a2.goods_id AS val FROM dianshang_operation_attribute a2 
                    WHERE a1.goods_id = a2.goods_id 
                        AND a2.${params.search[i].field_id} BETWEEN '${params.search[i].time[0]}'
                        AND '${params.search[i].time[1]}')`
        } else if (params.search[i].type == 'input' && params.search[i].value) {
            subsql = `${subsql} AND EXISTS(
                    SELECT a2.goods_id AS val FROM dianshang_operation_attribute a2 
                    WHERE a1.goods_id = a2.goods_id 
                        AND a2.${params.search[i].field_id} LIKE '%${params.search[i].value}%')`
        }
    }
    if (shopNames != null) {
        if (shopNames.length == 0) return result
        subsql = `${subsql}
                AND a1.shop_name IN ("${shopNames}") AND a1.shop_name NOT IN ("${shopNames1}")`
    }
    if (linkIds != null) {
        if (linkIds.length == 0) return result
        subsql = `${subsql}
                AND a1.goods_id IN ("${linkIds}") AND a1.shop_name NOT IN ("${shopNames1}")`
    }
    if (shopNames1 != null) {
        if(shopNames1.length == 0) return result
        subsql =`${subsql}
                AND a1.shop_name NOT IN ("${shopNames1}")`
    }
    let sql1 = `GROUP BY a1.goods_id, a1.shop_name, a1.shop_id`
    sql = `SELECT COUNT(1) AS count, SUM(sale_amount) AS sale_amount FROM(
        ${sql}${subsql} GROUP BY a1.goods_id) aa`
    let row = await query(sql, p)
    if (row?.length && row[0].count) {
        result.total = row[0].count
        result.sum = row[0].sale_amount        
        sql = `SELECT a1.goods_id, a1.shop_name,
            IFNULL(SUM(a1.pay_amount), 0) AS pay_amount, 
            IFNULL(SUM(a1.pay_amount), 0) AS real_sale_amount,
            IFNULL(SUM(a1.brushing_amount), 0) AS brushing_amount, 
            IFNULL(SUM(a1.brushing_qty), 0) AS brushing_qty, 
            IFNULL(SUM(a1.refund_amount), 0) AS refund_amount, 
            IFNULL(SUM(a1.express_fee), 0) AS pay_express_fee, 
            IFNULL(SUM(a1.sale_amount), 0) AS real_pay_amount, 
            IF(IFNULL(SUM(a2.sale_amount), 0) > 0, 
                FORMAT((IFNULL(SUM(a1.sale_amount), 0) - IFNULL(SUM(a2.sale_amount), 0)) / 
                SUM(a2.sale_amount) * 100, 2), 0) AS real_pay_amount_qoq, 
            IFNULL(SUM(a1.bill), 0) AS bill,
            IFNULL(SUM(a1.sale_amount), 0) AS sale_amount,
            IFNULL(SUM(a1.sale_qty), 0) AS sale_qty,
            IFNULL(SUM(a1.cost_amount), 0) AS cost_amount, 
            FORMAT(IF(a1.shop_name='京东自营-厨具',IFNULL(SUM(a1.sale_amount), 0)*0.07, 
                IFNULL(SUM(a1.sale_amount), 0)*0.07 +IFNULL(SUM(a1.pay_amount), 0)*0.02),2) AS tax,
            IFNULL(SUM(a1.express_fee), 0) AS express_fee, 
            IFNULL(SUM(a1.packing_fee), 0) AS packing_fee, 
            IFNULL(SUM(a1.promotion_amount), 0) AS promotion_amount, 
            FORMAT(IFNULL(SUM(a1.promotion_amount), 0)/IFNULL(SUM(a1.sale_amount), 0)*100,2) AS promotion_rate,
            IFNULL(SUM(a1.gross_standard), 0) AS gross_standard, 
            IFNULL(SUM(a1.other_cost), 0) AS other_cost, 
            FORMAT(IF(IFNULL(SUM(a2.promotion_amount), 0) > 0, 
                (IFNULL(SUM(a1.promotion_amount), 0) - SUM(a2.promotion_amount)) /
                SUM(a2.promotion_amount) * 100, 0 
            ), 2) AS promotion_amount_qoq,
            IFNULL(SUM(a1.operation_amount), 0) AS operation_amount, 
            IFNULL(SUM(a1.words_market_vol), 0) AS words_market_vol, 
            IFNULL(SUM(a1.words_vol), 0) AS words_vol, 
            IFNULL(SUM(a1.order_num), 0) AS order_num, 
            IFNULL(SUM(a1.refund_num), 0) AS refund_num, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.operation_amount), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS operation_rate, 
            FORMAT(IF(IFNULL(SUM(a1.promotion_amount), 0) > 0, 
                IFNULL(SUM(a1.sale_amount), 0) / SUM(a1.promotion_amount), 
                0), 2) AS roi, 
            FORMAT(IF(IFNULL(SUM(a1.words_market_vol), 0) > 0, 
                IFNULL(SUM(a1.words_vol), 0) / SUM(a1.words_market_vol) * 100, 
                0), 2) AS market_rate, 
            FORMAT(IF(IFNULL(SUM(a1.order_num), 0) > 0, 
                IFNULL(SUM(a1.refund_num), 0) / SUM(a1.order_num) * 100, 
                0), 2) AS refund_rate, 
            IFNULL(SUM(a1.profit), 0) AS profit, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.profit), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS profit_rate, 
            FORMAT(IF(IFNULL(SUM(a1.pay_amount), 0) > 0, 
            IFNULL(SUM(a1.profit), 0) / SUM(a1.pay_amount) * 100, 
            0), 2) AS jprofit_rate_gmv, 
            FORMAT(IF(SUM(a4.sale_amount) > 0, 
                1 - SUM(a4.cost_amount) / SUM(a4.sale_amount), 0) * 100, 2) AS gross_profit 
            FROM goods_pays_stats a1 LEFT JOIN goods_pays_stats a2 ON a2.goods_id = a1.goods_id 
                AND a2.date = DATE_SUB(a1.date, INTERVAL 1 DAY) 
            LEFT JOIN goods_verifieds_stats a4 ON a1.goods_id = a4.goods_id 
                AND a4.date = DATE_SUB(a1.date, INTERVAL 1 DAY)`
        sql1 = `GROUP BY a1.goods_id, a1.shop_name`
        sql = `SELECT aa.* FROM (${sql}${subsql}${sql1}) aa`
        if (params.sort) sql = `${sql} ORDER BY aa.${params.sort}`
        if (!params.export)
            sql = `${sql}
                LIMIT ${offset}, ${size}`
        row = await query(sql, p)
        if (row?.length) {
            let goods_ids = '', goodsMap = {}, row1
            sql = ''
            for (let i = 0; i < row.length; i++) {
                row[i].sku_id = ''
                row[i].sku_sid = ''
                row[i].hasChild = hasChild
                row[i].id = row[i].goods_id || row[i].sku_code
                row[i].parent_id = null
                row[i].date = date
                row[i].jgross_profit = parseFloat(row[i].real_sale_amount) > 0 ? ((parseFloat(row[i].profit)+parseFloat(row[i].promotion_amount))/row[i].real_sale_amount*100).toFixed(2) : 0
                row[i].no_total_roi =row[i].jgross_profit!=0 ? (1/row[i].jgross_profit+0.5).toFixed(2) : null
                row[i].total_roi =row[i].jgross_profit!=0 ? (1/(row[i].jgross_profit-0.15)+0.5).toFixed(2) : null
                if (row[i].goods_id) {
                    goods_ids = `${goods_ids}"${row[i].goods_id}",`
                    goodsMap[row[i].goods_id] = i
                }
            }
            if (goods_ids?.length) {
                goods_ids = goods_ids.substring(0, goods_ids.length - 1) 
                sql = `SELECT d.goods_name, d.brief_name, d.operator, d.brief_product_line, 
                        d.line_director, d.purchase_director, s.create_time AS onsale_date, 
                        d.link_attribute, d.important_attribute, d.first_category, d.second_category, 
                        d.pit_target, (CASE WHEN DATE_SUB(NOW(), INTERVAL 30 DAY) <= s.create_time 
                            THEN '新品30' 
                        WHEN DATE_SUB(NOW(), INTERVAL 60 DAY) <= s.create_time 
                            THEN '新品60' 
                        WHEN DATE_SUB(NOW(), INTERVAL 90 DAY) <= s.create_time 
                            THEN '新品90' 
                        ELSE '老品' END) AS onsale_info, o.dsr,d.sku_id,
                        a.goal, s.goods_id,d.play,d.product_stage,d.level_3_category
                    FROM (
                        SELECT goods_id, MIN(create_time) AS create_time FROM jst_goods_sku 
                        WHERE goods_id IN (${goods_ids}) GROUP BY goods_id
                    ) s LEFT JOIN dianshang_operation_attribute d ON s.goods_id = d.goods_id 
                    LEFT JOIN (
                        SELECT GROUP_CONCAT(CONCAT(g.month, ': ', FORMAT(g.amount, 2)) SEPARATOR '\n') 
                            AS goal, g.goods_id FROM goods_monthly_sales_target g
                        WHERE g.goods_id IN (${goods_ids}) AND g.month BETWEEN ? AND ? 
                        GROUP BY g.goods_id 
                    ) a ON a.goods_id = d.goods_id   
                    LEFT JOIN (
                        SELECT dsr FROM goods_other_info 
                        WHERE date = DATE_SUB(CURRENT_DATE,INTERVAL 1 DAY) 
                        AND goods_id IN (${goods_ids})
                    ) AS o ON a.goods_id = d.goods_id 
                    WHERE d.goods_id IN (${goods_ids}) AND d.platform !='自营'
                    UNION ALL
                    SELECT goods_name, brief_name, operator, brief_product_line, 
                        line_director, purchase_director, onsale_date, link_attribute, 
                        important_attribute, first_category, second_category, pit_target,
                        (CASE WHEN DATE_SUB(NOW(), INTERVAL 30 DAY) <= onsale_date 
                            THEN '新品30' 
                        WHEN DATE_SUB(NOW(), INTERVAL 60 DAY) <= onsale_date 
                            THEN '新品60' 
                        WHEN DATE_SUB(NOW(), INTERVAL 90 DAY) <= onsale_date 
                            THEN '新品90' 
                        ELSE '老品' END) AS onsale_info, o.dsr,d.sku_id,
                        a.goal, d.goods_id ,d.play,d.product_stage,d.level_3_category
                    FROM dianshang_operation_attribute d 
                    LEFT JOIN (
                        SELECT GROUP_CONCAT(CONCAT(g.month, ': ', FORMAT(g.amount, 2)) SEPARATOR '\n') 
                            AS goal, g.goods_id FROM goods_monthly_sales_target g
                        WHERE g.goods_id IN (${goods_ids}) AND g.month BETWEEN ? AND ? 
                        GROUP BY g.goods_id 
                    ) a ON a.goods_id = d.brief_name 
                    LEFT JOIN (
                        SELECT dsr FROM goods_other_info 
                        WHERE date = DATE_SUB(CURRENT_DATE,INTERVAL 1 DAY) 
                        AND goods_id IN (${goods_ids})
                    ) AS o ON a.goods_id = d.brief_name 
                    WHERE d.brief_name IN (${goods_ids}) AND d.platform ='自营'`
                row1 = await query(sql, [
                    moment(start).format('YYYYMM'), 
                    moment(end).format('YYYYMM'),
                    moment(start).format('YYYYMM'), 
                    moment(end).format('YYYYMM')
                ])
                if (row1?.length) {
                    for (let j = 0; j < row1.length; j++) {
                        let i = goodsMap[row1[j].goods_id ? row1[j].goods_id : row1[j].brief_name]
                        row[i].goods_name = row1[j].goods_name
                        row[i].brief_name = row1[j].brief_name
                        row[i].operator = row1[j].operator
                        row[i].brief_product_line = row1[j].brief_product_line
                        row[i].line_director = row1[j].line_director
                        row[i].purchase_director = row1[j].purchase_director
                        row[i].onsale_date = row1[j].onsale_date
                        row[i].link_attribute = row1[j].link_attribute
                        row[i].important_attribute = row1[j].important_attribute
                        row[i].first_category = row1[j].first_category
                        row[i].second_category = row1[j].second_category
                        row[i].pit_target = row1[j].pit_target
                        row[i].pit_target_day = row1[j].pit_target*targettime
                        row[i].pit_target_month = row1[j].pit_target*days
                        row[i].onsale_info = row1[j].onsale_info
                        row[i].goal = row1[j].goal
                        row[i].play = row1[j].play
                        row[i].dsr = row1[j].dsr
                        row[i].sku_id = row1[j].sku_id
                        row[i].product_stage = row1[j].product_stage
                        row[i].level_3_category = row1[j].level_3_category
                        row[i].sale_amount_profit_day = row1[j].pit_target*targettime>0 ? (row[i].sale_amount/(row1[j].pit_target*targettime)*100).toFixed(2) + '%' : null
                        row[i].sale_amount_profit_month = row1[j].pit_target*days>0 ? (row[i].sale_month/(row1[j].pit_target*days)*100).toFixed(2) + '%' : null
                        const arrary=["pakchoice旗舰店（天猫）","八千行旗舰店（天猫）","宝厨行（淘宝）","八千行（淘宝）","北平商号（淘宝）","天猫teotm旗舰店"]
                        if (!arrary.includes(row[i].shop_name)) {
                            row[i].sale_amount_profit_day = null
                            row[i].sale_amount_profit_month = null
                        }else{
                            if(row[i].onsale_info == '老品'){
                                row[i].target_roi =row[i].sale_amount>0 ? (1/((row[i].sale_amount-row[i].cost_amount)/row[i].sale_amount-0.33)+0.5).toFixed(2):null
                            }else{
                                row[i].target_roi = row[i].sale_amount>0 ? (1/((row[i].sale_amount-row[i].cost_amount)/row[i].sale_amount)).toFixed(2):null
                            }
                        }
                        let targetamount =0,target
                        for (c= 0;c<month_duration;c++){
                            sql = `SELECT ROUND(amount*${timeline[c].rate},2) AS target FROM goods_monthly_sales_target WHERE month = ? AND goods_id =?`
                            target = await query(sql, [timeline[c].month,row[i].goods_id])
                            if (target.length === 0) continue
                            targetamount += parseFloat(target[0].target)
                        }
                        if(row[i].onsale_info == '新品30'){
                            // 筛选的结束时间是上架的第几天
                            let start_onsaledays = moment(start).diff(moment(row[i].onsale_date), 'days') >0 ? moment(start).diff(moment(row[i].onsale_date),'days')+2 :1
                            let end_onsaledays = moment(end).diff(moment(row[i].onsale_date), 'days') >0 ?  moment(end).diff(moment(row[i].onsale_date),'days')+2:1
                            sql = `SELECT SUM(sale_amount) AS period_target FROM spiral_target WHERE REGEXP_SUBSTR(day,'[0-9]+') BETWEEN ? AND ? AND goods_id = ?`
                            let row5 = await query(sql,[start_onsaledays,end_onsaledays,row[i].goods_id])
                            row[i].period_target = row5[0].period_target
                            row[i].goal_rate = targetamount>0 ? (row[i].sale_amount/targetamount*100).toFixed(2) : null
                        }else{
                            row[i].period_target = targetamount
                            row[i].goal_rate = targetamount>0 ? (row[i].sale_amount/targetamount*100).toFixed(2) : null
                        }
                    }
                }
                sql = `SELECT SUM(IF(promotion_name='日常推广',pay_amount,null)) AS daily_promotion
                        ,SUM(IF(promotion_name='日常推广',trans_amount,null)) AS daily_promotion_amount
                        ,SUM(IF(promotion_name='场景推广',pay_amount,null)) AS scene_promotion
                        ,SUM(IF(promotion_name='场景推广',trans_amount,null)) AS scene_promotion_amount
                        ,SUM(IF(promotion_name='京东快车1' OR promotion_name='京东快车2' OR promotion_name='京东快车3',pay_amount,null)) AS jd_express_promotion
                        ,SUM(IF(promotion_name='京东快车1' OR promotion_name='京东快车2' OR promotion_name='京东快车3',trans_amount,null)) AS jd_express_promotion_amount
                        ,SUM(IF(promotion_name='全站营销' OR promotion_name='新品全站营销',pay_amount,null)) AS total_promotion
                        ,SUM(IF(promotion_name='全站营销' OR promotion_name='新品全站营销',trans_amount,null)) AS total_promotion_amount
                        ,SUM(IF(promotion_name='稳定成本推广',pay_amount,null)) AS stable_cost_promotion
                        ,SUM(IF(promotion_name='稳定成本推广',trans_amount,null)) AS stable_cost_promotion_amount
                        ,SUM(IF(promotion_name='稳定成本推广',plan_goal,null)) AS stable_cost_goal
                        ,'' as full_site_promotion,'' as full_site_promotion_amount,'' as keyword_promotion,'' as keyword_promotion_amount
                        ,'' as targeted_audience_promotion,'' as targeted_audience_promotion_amount,'' as super_short_video,'' as super_short_video_amount,goods_id 
                    FROM goods_promotion_plan
                    WHERE \`date\` BETWEEN '${start}' AND '${end}'  AND goods_id IN (${goods_ids}) 
                    AND shop_name not in ("pakchoice旗舰店（天猫）","八千行旗舰店（天猫）","宝厨行（淘宝）","八千行（淘宝）","北平商号（淘宝）","天猫teotm旗舰店")
                    GROUP BY goods_id
                    UNION ALL
                    SELECT '' AS daily_promotion,'' AS daily_promotion_amount,'' AS scene_promotion,'' AS scene_promotion_amount,'' AS jd_express_promotion
                        ,'' AS jd_express_promotion_amount,'' AS total_promotion,'' AS total_promotion_amount,'' AS stable_cost_promotion
                        ,'' AS stable_cost_promotion_amount,'' AS stable_cost_goal
                        ,SUM(IF(promotion_name='货品全站推' OR promotion_name='全站推广',pay_amount,null)) AS full_site_promotion
                        ,SUM(IF(promotion_name='货品全站推' OR promotion_name='货品全站推',trans_amount,null)) AS full_site_promotion_amount
                        ,SUM(IF(promotion_name='关键词推广',pay_amount,null)) AS keyword_promotion
                        ,SUM(IF(promotion_name='关键词推广',trans_amount,null)) AS keyword_promotion_amount
                        ,SUM(IF(promotion_name='人群推广',pay_amount,null)) AS targeted_audience_promotion
                        ,SUM(IF(promotion_name='人群推广',trans_amount,null)) AS targeted_audience_promotion_amount
                        ,SUM(IF(promotion_name='超级短视频',pay_amount,null)) AS super_short_video
                        ,SUM(IF(promotion_name='超级短视频',trans_amount,null)) AS super_short_video_amount
                        ,goods_id
                    FROM tmall_promotion_info 
                    WHERE \`date\` BETWEEN '${start}' AND '${end}'  AND period = 1 AND goods_id IN (${goods_ids})
                    GROUP BY goods_id`
                let row2 = await query(sql)
                if(row2?.length){
                    for (let j = 0; j < row2.length; j++) {
                        let i = goodsMap[row2[j].goods_id]
                        row[i].daily_promotion = row2[j].daily_promotion
                        row[i].scene_promotion = row2[j].scene_promotion
                        row[i].jd_express_promotion = row2[j].jd_express_promotion
                        row[i].total_promotion = row2[j].total_promotion
                        row[i].stable_cost_promotion = row2[j].stable_cost_promotion
                        row[i].full_site_promotion = row2[j].full_site_promotion
                        row[i].keyword_promotion = row2[j].keyword_promotion
                        row[i].targeted_audience_promotion = row2[j].targeted_audience_promotion
                        row[i].super_short_video = row2[j].super_short_video
                        row[i].stable_cost_goal = row2[j].stable_cost_goal
                        row[i].daily_promotion_roi = row2[j].daily_promotion >0 ? (row2[j].daily_promotion_amount/row2[j].daily_promotion).toFixed(2) : null
                        row[i].scene_promotion_roi = row2[j].scene_promotion >0 ? (row2[j].scene_promotion_amount/row2[j].scene_promotion).toFixed(2) : null
                        row[i].jd_express_promotion_roi = row2[j].jd_express_promotion >0 ? (row2[j].jd_express_promotion_amount/row2[j].jd_express_promotion).toFixed(2) : null
                        row[i].total_promotion_roi = row2[j].total_promotion >0 ? (row2[j].total_promotion_amount/row2[j].total_promotion).toFixed(2) : null
                        row[i].stable_cost_promotion_roi = row2[j].stable_cost_promotion >0 ? (row2[j].stable_cost_promotion_amount/row2[j].stable_cost_promotion).toFixed(2) : null
                        row[i].targeted_audience_promotion_difference = row2[j].stable_cost_promotion >0 ? (row2[j].stable_cost_promotion_amount/row2[j].stable_cost_promotion-row2[j].stable_cost_goal).toFixed(2) : -row2[j].stable_cost_goal
                        row[i].full_site_promotion_roi = row2[j].full_site_promotion >0 ? (row2[j].full_site_promotion_amount/row2[j].full_site_promotion).toFixed(2) : null
                        row[i].keyword_promotion_roi = row2[j].keyword_promotion >0 ? (row2[j].keyword_promotion_amount/row2[j].keyword_promotion).toFixed(2) : null
                        row[i].targeted_audience_promotion_roi = row2[j].targeted_audience_promotion >0 ? (row2[j].targeted_audience_promotion_amount/row2[j].targeted_audience_promotion).toFixed(2) : null
                        row[i].super_short_video_roi = row2[j].super_short_video >0 ? (row2[j].super_short_video_amount/row2[j].super_short_video).toFixed(2) : null
                    }
                }
                sql=`SELECT IFNULL(SUM(a1.users_num), 0) AS users_num, 
                        IFNULL(SUM(a1.trans_users_num), 0) AS trans_users_num,
                        IF(IFNULL(SUM(a1.users_num), 0) > 0, FORMAT(
                            (IFNULL(SUM(a1.trans_users_num), 0) - 
                            IFNULL(SUM(a2.brushing_qty), 0)) / 
                            IFNULL(SUM(a1.users_num), 0) * 100, 2), 0) AS real_pay_rate,
                            IFNULL(SUM(a1.total_users_num), 0) AS total_users_num, 
                            IFNULL(SUM(a1.total_trans_users_num), 0) AS total_trans_users_num, a1.goods_id 
                    FROM goods_composite_info a1 
                    LEFT JOIN goods_pays a2 
                    ON a1.goods_id = a2.goods_id AND a1.date = a2.date 
                    WHERE a1.date BETWEEN '${start}' AND '${end}' AND a1.goods_id IN (${goods_ids}) 
                    GROUP BY a1.goods_id`
                let row3 = await query(sql)
                for (let j = 0; j < row3.length; j++) {
                    let i = goodsMap[row3[j].goods_id]
                    row[i].users_num = row3[j].users_num
                    row[i].trans_users_num = row3[j].trans_users_num
                    row[i].real_pay_rate = row3[j].real_pay_rate
                    row[i].total_trans_users_num = row3[j].total_trans_users_num
                    row[i].total_users_num = row3[j].total_users_num
                }
                sql = `SELECT goods_id
                            ,SUM(real_gross_profit) AS real_gross_profit
                        FROM goods_sales 
                        WHERE goods_id IN (${goods_ids})
                        AND date BETWEEN '${start}' AND '${end}' GROUP BY goods_id`
                let row4 = await query(sql)
                if(row4?.length){
                    for (let j = 0; j < row4.length; j++) {
                        let i = goodsMap[row4[j].goods_id]
                        row[i].real_gross_profit = row4[j].real_gross_profit
                    }
                }
            }
            result.data = row
        }
    }
    return result
}

goodsPayInfoRepo.getPromotionData = async (start, end, params, shopNames, linkIds) => {
    let page = parseInt(params.currentPage)
    let size = parseInt(params.pageSize)
    let offset = (page - 1) * size
    let p = [], result = {
        currentPage: params.currentPage,
        pageSize: params.pageSize,
        data: [],
        total: 0,
        sum: 0
    }
    let preStart = moment(start).subtract(1, 'day').format('YYYY-MM-DD')
    let preEnd = moment(end).subtract(1, 'day').format('YYYY-MM-DD') 
    let targettime = moment(preEnd).diff(moment(preStart), 'days')+1
    let end1 = moment().subtract(1, 'day').format('YYYY-MM-DD')
    let start1 = moment().subtract(7, 'day').format('YYYY-MM-DD')
    let end2 = end1
    let start2 = moment().subtract(30, 'day').format('YYYY-MM-DD')
    let end3 = moment(end).subtract(1, 'day').format('YYYY-MM-DD')
    let start3 = moment(start).subtract(1, 'day').format('YYYY-MM-DD')
    let start2_start = moment(moment(start2).format('YYYY-MM') + '-01')
    let end2_start = moment(moment(start2).add(1, 'month').format('YYYY-MM') + '-01')
    let end2_end = moment(moment(end2).add(1, 'month').format('YYYY-MM') + '-01')
    let months = [{
        month: parseInt(moment(start2).format('YYYYMM')),
        percent: end2_start.diff(moment(start2), 'day') / end2_start.diff(start2_start, 'day')
    }]
    if (end2_start.format('YYYY-MM') != end2_end.format('YYYY-MM')) {
        months.push({
            month: parseInt(moment(end2).format('YYYYMM')),
            percent: moment(end2).diff(end2_start, 'day') / end2_end.diff(end2_start, 'day')
        })
    }
    let days = moment(end).daysInMonth()    
    let presql = 'LEFT JOIN (SELECT IFNULL(SUM(amount), 0) AS amount, goods_id FROM ('    
    for (let i = 0; i < months.length; i++) {
        let sql1 = `SELECT goods_id, amount * ${months[i].percent} AS amount 
            FROM goods_monthly_sales_target WHERE month = ${months[i].month}`
        presql = `${presql}
                ${sql1}
            UNION ALL `
    }    
    presql = presql.substring(0, presql.length - 10)
    presql = `${presql}) t1 GROUP BY t1.goods_id) t ON t.goods_id = s.goods_id `
    let sql = `SELECT IFNULL(SUM(a1.sale_amount), 0) AS sale_amount, s.goods_id FROM 
        (SELECT goods_id, MIN(create_time) AS onsale_date, shop_name FROM jst_goods_sku 
            WHERE is_shelf = '是' AND create_time IS NOT NULL GROUP BY goods_id, shop_name 
            UNION ALL 
            SELECT brief_name AS goods_id, onsale_date, shop_name 
            FROM dianshang_operation_attribute WHERE platform = '自营') s 
        LEFT JOIN goods_pays a1 ON a1.goods_id = s.goods_id
            AND a1.date BETWEEN ? AND ? 
            AND a1.goods_id NOT IN ('', '【无法匹配到商品】')
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
        ) b1 ON b1.goods_id = s.goods_id
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit,
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
        ) b2 ON b2.goods_id = s.goods_id 
        LEFT JOIN (SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, 
                IFNULL(SUM(plan_goal), 0) / 7 AS plan_goal, goods_id 
            FROM goods_promotion_plan WHERE \`date\` BETWEEN ? AND ? GROUP BY goods_id
        ) b3 ON b3.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            OR d.brief_name = s.goods_id 
        LEFT JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, 
                IFNULL(SUM(sale_qty), 0) AS sale_qty, goods_id FROM goods_verifieds
            WHERE \`date\` BETWEEN ? AND ? GROUP BY goods_id
        ) b4 ON b4.goods_id = s.goods_id 
        JOIN shop_info si ON s.shop_name = si.shop_name
        JOIN project_info pi ON pi.id = si.project_id 
        ${presql}`
    subsql = ` WHERE s.goods_id IS NOT NULL`
    let hasChild = start == end ? false:true
    p.push(start, end, start1, end1, start2, end2, start1, end1, start3, end3)
    for (let i =0; i < params.search.length; i++) {
        if (params.search[i].field_id == 'operation_rate') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.operation_amount), 0) AS operation_amount, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_pays a2
                        WHERE a2.date BETWEEN ? AND ? AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.operation_amount * 100 >= ${params.search[i].min} * b.sale_amount
                        AND b.operation_amount * 100 <= ${params.search[i].max} * b.sale_amount)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'roi') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.promotion_amount), 0) AS promotion_amount, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_pays a2 
                        WHERE a2.date BETWEEN ? AND ? AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.sale_amount >= ${params.search[i].min} * b.promotion_amount 
                        AND b.sale_amount <= ${params.search[i].max} * b.promotion_amount)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'market_rate') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a3.words_market_vol), 0) AS words_market_vol, 
                            IFNULL(SUM(a3.words_vol), 0) AS words_vol FROM goods_other_info a3 
                        WHERE a3.date BETWEEN ? AND ? AND a1.goods_id = a3.goods_id 
                    ) b WHERE b.words_vol * 100 >= ${params.search[i].min} * b.words_market_vol
                        AND b.words_vol * 100 <= ${params.search[i].max} * b.words_market_vol)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'refund_rate') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.order_num), 0) AS order_num, 
                            IFNULL(SUM(a2.refund_num), 0) AS refund_num FROM goods_pays a2 
                        WHERE a2.date BETWEEN ? AND ? AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.refund_num * 100 >= ${params.search[i].min} * b.order_num
                        AND b.refund_num * 100 <= ${params.search[i].max} * b.order_num)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'profit_rate') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.profit), 0) AS profit, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_pays a2 
                        WHERE a2.date BETWEEN ? AND ? AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.profit * 100 >= ${params.search[i].min} * b.sale_amount
                        AND b.profit * 100 <= ${params.search[i].max} * b.sale_amount)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'gross_profit') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT FORMAT(IF(SUM(a4.sale_amount) > 0, 
                            1 - SUM(a4.cost_amount) / SUM(a4.sale_amount), 0) * 100, 2) AS val 
                        FROM goods_verifieds_stats a4 WHERE a1.goods_id = a4.goods_id 
                            AND a4.date BETWEEN '${preStart}' AND '${preEnd}' 
                    ) b WHERE b.val BETWEEN ${params.search[i].min} AND ${params.search[i].max})`
        } else if (params.search[i].field_id == 'bill') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.bill_amount), 0) AS val 
                        FROM goods_pays a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'pay_express_fee') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.express_fee), 0) AS val 
                        FROM goods_pays a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'real_pay_amount') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.sale_amount), 0) AS val 
                        FROM goods_pays a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'real_pay_amount_qoq') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.sale_amount), 0) AS val1, 
                            IFNULL(SUM(a3.sale_amount), 0) AS val2
                        FROM goods_pays a2 JOIN goods_pays a3 ON a3.goods_id = a2.goods_id
                            AND a3.date = DATE_SUB(a2.date, INTERVAL 1 DAY)
                        WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE ((b.val2 = 0 AND 0 >= ${params.search[i].min}) OR 
                     (b.val1 * 100 >= (${params.search[i].min} + 100) * b.val2 AND b.val2 > 0)) 
                        AND ((b.val2 = 0 AND 0 <= ${params.search[i].max}) OR 
                        (b.val1 * 100 <= (${params.search[i].max} + 100) * b.val2 AND b.val2 > 0)))`
            p.push(start, end)
        }else if (params.search[i].field_id == 'sale_amount_profit_day') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT val FROM (
                        SELECT a2.goods_id,ROUND(IFNULL(sale_amount,0)/(pit_target*${targettime})*100,2) AS val FROM (
                            SELECT goods_id,SUM(sale_amount) AS sale_amount 
                            FROM goods_pays WHERE date BETWEEN ? AND ?
                            GROUP BY goods_id
                        )AS a2
                        LEFT JOIN (
                            SELECT goods_id,IFNULL(pit_target,0)AS pit_target
                            FROM dianshang_operatiON_attribute 
                            WHERE product_definition IS NOT NULL 
                        )AS a3
                        on a2.goods_id = a3.goods_id
                    )AS b where b.val >= ${params.search[i].min} 
                    AND b.val <= ${params.search[i].max} and a1.goods_id=b.goods_id)`
            p.push(start, end)
        }else if (params.search[i].field_id == 'sale_amount_profit_month') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT val FROM (
                        SELECT a2.goods_id,ROUND(IFNULL(sale_amount,0)/(pit_target*${days})*100,2) AS val FROM (
                            SELECT goods_id,SUM(sale_amount)AS sale_amount 
                            FROM goods_pays where date BETWEEN ? AND ?
                            GROUP BY goods_id
                        )AS a2
                        LEFT JOIN (
                            SELECT goods_id,IFNULL(pit_target,0)AS pit_target
                            FROM dianshang_operatiON_attribute 
                            WHERE product_definition IS NOT NULL
                        )AS a3
                        on a2.goods_id=a3.goods_id
                    )AS b where b.val >= ${params.search[i].min} 
                    AND b.val <= ${params.search[i].max} and a1.goods_id=b.goods_id)`
            p.push(start, end)
        }else if (['words_market_vol', 'words_vol'].includes(params.search[i].field_id)) {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.${params.search[i].field_id}), 0) AS val 
                        FROM goods_other_info a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'dsr') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT FORMAT(IFNULL(SUM(a2.dsr), 0) / COUNT(1), 2) AS val 
                        FROM goods_other_info a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'promotion_amount_qoq') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT FORMAT(IF(IFNULL(SUM(a2.promotion_amount), 0) > 0, 
                            (IFNULL(SUM(a1.promotion_amount), 0) - SUM(a2.promotion_amount)) /
                            SUM(a2.promotion_amount) * 100, 0 
                        ), 2) AS val FROM goods_pays a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(preStart, preEnd)
        } else if (params.search[i].field_id == 'shop_id') {
            subsql = `${subsql} AND si.shop_id LIKE '%${params.search[i].value}%'`
        } else if (params.search[i].field_id == 'onsale_info') {
            if (params.search[i].value != 'old') {
                let tStart = moment().subtract(params.search[i].value-1, 'day').format('YYYY-MM-DD')
                let tEnd = moment().format('YYYY-MM-DD')
                subsql = `${subsql} AND (EXISTS(
                        SELECT a2.brief_name FROM dianshang_operation_attribute a2 
                        WHERE a2.onsale_date BETWEEN ? AND ? AND a1.goods_id = a2.brief_name
                            AND a2.platform = '自营') OR EXISTS(
                        SELECT * FROM (SELECT a2.goods_id, MIN(a2.create_time) AS create_time FROM 
                            jst_goods_sku a2 WHERE a2.goods_id = a1.goods_id) aa 
                        WHERE create_time BETWEEN ? AND ?))`
                p.push(tStart, tEnd, tStart, tEnd)
            } else
                subsql = `${subsql} AND (EXISTS(
                    SELECT a2.brief_name FROM dianshang_operation_attribute a2 WHERE 
                        (a2.onsale_date < DATE_SUB(NOW(), INTERVAL 90 DAY) OR 
                            a2.onsale_date IS NULL
                        ) AND a1.goods_id = a2.brief_name AND a2.platform = '自营') OR EXISTS(
                    SELECT * FROM (SELECT a2.goods_id, MIN(a2.create_time) AS create_time 
                        FROM jst_goods_sku a2 WHERE a2.goods_id = a1.goods_id) aa 
                        WHERE create_time < DATE_SUB(NOW(), INTERVAL 90 DAY)))`
        } else if (params.search[i].field_id == 'goods_id') {
            subsql = `${subsql} AND s.goods_id LIKE '%${params.search[i].value}%'`
        } else if (params.search[i].field_id == 'shop_name') {
            subsql = `${subsql} AND s.shop_name LIKE '%${params.search[i].value}%'`
        } else if (params.search[i].field_id == 'sku_id') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(s.on_sku_code, a2.sku_id) AS sku_id FROM 
                        orders_goods_pays a2 LEFT JOIN jst_goods_sku s 
                            ON a2.goods_id = s.goods_id AND a2.sku_id = s.sku_id 
                        WHERE a2.goods_id = a1.goods_id AND a2.date BETWEEN ? AND ? 
                        GROUP BY a2.sku_id, s.on_sku_code 
                        ORDER BY IFNULL(SUM(a2.sale_amount), 0) DESC LIMIT 1 
                    ) a3 WHERE a3.sku_id LIKE '%${params.search[i].value}%')`
            p.push(start, end)
        } else if (params.search[i].field_id == 'sku_sid') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (SELECT * FROM (
                        SELECT IFNULL(s.on_sku_code, a2.sku_id) AS sku_id, 
                            IFNULL(SUM(a2.sale_amount), 0) AS amount 
                        FROM orders_goods_pays a2 LEFT JOIN jst_goods_sku s 
                            ON a2.goods_id = s.goods_id AND a2.sku_id = s.sku_id 
                        WHERE a2.goods_id = a1.goods_id AND a2.date BETWEEN ? AND ? 
                        GROUP BY a2.sku_id, s.on_sku_code 
                        ORDER BY IFNULL(SUM(a2.sale_amount), 0) DESC LIMIT 2 
                    ) a3 WHERE (SELECT COUNT(1) FROM (
                        SELECT IFNULL(s.on_sku_code, a2.sku_id) AS sku_id, 
                            IFNULL(SUM(a2.sale_amount), 0) AS amount 
                        FROM orders_goods_pays a2 LEFT JOIN jst_goods_sku s 
                            ON a2.goods_id = s.goods_id AND a2.sku_id = s.sku_id 
                        WHERE a2.goods_id = a1.goods_id AND a2.date BETWEEN ? AND ? 
                        GROUP BY a2.sku_id, s.on_sku_code 
                        ORDER BY IFNULL(SUM(a2.sale_amount), 0) DESC LIMIT 2) a4
                    ) = 2 ORDER BY amount LIMIT 1) a4 
                    WHERE a4.sku_id LIKE '%${params.search[i].value}%')`
            p.push(start, end, start, end)
        } else if (['pit_target_day', 'pit_target_month'].includes(params.search[i].field_id)) {
            if(params.search[i].field_id=='pit_target_day'){
                day_s = targettime
            }else{
                day_s = days
            }
            subsql = `${subsql} AND EXISTS(
                    select * FROM (								
                    select pit_target*${day_s} as val from dianshang_operation_attribute AS a2
                    where a2.goods_id=a1.goods_id
                    )AS b
                    WHERE b.val>=${params.search[i].min} and b.val<=${params.search[i].max})`
        } else if (params.search[i].type == 'number') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.${params.search[i].field_id}), 0) AS val FROM 
                        goods_pays a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max})`
            p.push(start, end)
        } else if (params.search[i].type == 'date' && params.search[i].time) {
            subsql = `${subsql} AND EXISTS(
                    SELECT a2.goods_id AS val FROM dianshang_operation_attribute a2 
                    WHERE a1.goods_id = a2.goods_id 
                        AND a2.${params.search[i].field_id} BETWEEN '${params.search[i].time[0]}'
                        AND '${params.search[i].time[1]}')`
        } else if (params.search[i].type == 'input' && params.search[i].value) {
            subsql = `${subsql} AND EXISTS(
                    SELECT a2.goods_id AS val FROM dianshang_operation_attribute a2 
                    WHERE a1.goods_id = a2.goods_id 
                        AND a2.${params.search[i].field_id} LIKE '%${params.search[i].value}%')`
        }
    }
    switch (params.promotionType) {
        case 'negative_profit':
            subsql = `${subsql} AND s.onsale_date < DATE_SUB(NOW(), INTERVAL 30 DAY) 
                AND (b1.profit < 0 OR b1.goods_id IS NULL)
                AND IF(s.onsale_date < DATE_SUB(NOW(), INTERVAL 60 DAY), 
				    IF(pi.division_id = 1, b2.sale_amount >= 3000 OR b2.profit >= b2.sale_amount * 0.18, 
                        IF(pi.division_id = 2, b2.sale_amount >= 3000 OR b2.profit >= b2.sale_amount * 0.15, 
                            b2.sale_amount >= 12000 OR b2.profit >= b2.sale_amount * 0.18)), 1)
                AND (d.id IS NULL OR ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 != '滞销' OR d.userDef7 IS NULL) AND (d.link_attribute != '滞销' OR d.link_attribute IS NULL)))`
            break
        case 'low_profit':
            subsql = `${subsql} AND s.onsale_date < DATE_SUB(NOW(), INTERVAL 60 DAY) 
                AND (b1.profit < b1.sale_amount * 0.18 OR b1.sale_amount = 0 OR b1.goods_id IS NULL) 
                AND IF(pi.division_id = 1, b2.sale_amount >= 3000 OR b2.profit >= b2.sale_amount * 0.18, 
                        IF(pi.division_id = 2, b2.sale_amount >= 3000 OR b2.profit >= b2.sale_amount * 0.15, 
                            b2.sale_amount >= 12000 OR b2.profit >= b2.sale_amount * 0.18))
                AND (d.id IS NULL OR ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 != '滞销' OR d.userDef7 IS NULL) AND (d.link_attribute != '滞销' OR d.link_attribute IS NULL)))`
            break
        case 'none_promotion':
            subsql = `${subsql} AND a1.promotion_amount = 0 
                AND IF(s.onsale_date < DATE_SUB(NOW(), INTERVAL 60 DAY), 
				    IF(pi.division_id = 1, b2.sale_amount >= 3000 OR b2.profit >= b2.sale_amount * 0.18, 
                        IF(pi.division_id = 2, b2.sale_amount >= 3000 OR b2.profit >= b2.sale_amount * 0.15, 
                            b2.sale_amount >= 12000 OR b2.profit >= b2.sale_amount * 0.18)), 1)
                AND (d.is_price_comparison = '否' OR d.is_price_comparison IS NULL) 
                AND (d.id IS NULL OR ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 != '滞销' OR d.userDef7 IS NULL) AND (d.link_attribute != '滞销' OR d.link_attribute IS NULL)))`
            break
        case 'low_promotion':
            subsql = `${subsql} AND IF(pi.division_id = 1, a1.promotion_amount < a1.sale_amount * 0.1, 
                    IF(pi.division_id = 2, a1.promotion_amount < a1.sale_amount * 0.06, 
                        a1.promotion_amount < a1.sale_amount * 0.1)) 
                AND IF(s.onsale_date < DATE_SUB(NOW(), INTERVAL 60 DAY), 
				    IF(pi.division_id = 1, b2.sale_amount >= 3000 OR b2.profit >= b2.sale_amount * 0.18, 
                        IF(pi.division_id = 2, b2.sale_amount >= 3000 OR b2.profit >= b2.sale_amount * 0.15, 
                            b2.sale_amount >= 12000 OR b2.profit >= b2.sale_amount * 0.18)), 1)
                AND (d.id IS NULL OR ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 != '滞销' OR d.userDef7 IS NULL) AND (d.link_attribute != '滞销' OR d.link_attribute IS NULL)))`
            break
        case 'low_roi':
            subsql = `${subsql} AND a1.promotion_amount * a1.cost_amount < a1.sale_amount * 
                (2.67 * a1.promotion_amount + 2 * a1.cost_amount - 1.34 * a1.sale_amount)
                AND (d.id IS NULL OR ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 != '滞销' OR d.userDef7 IS NULL) AND (d.link_attribute != '滞销' OR d.link_attribute IS NULL)))`
            break
        case 'low_plan_roi':
            subsql = `${subsql} AND IF(pi.division_id = 1, b3.trans_amount < b3.pay_amount * b3.plan_goal, 
                    1.34 * b1.sale_amount * b3.trans_amount + b3.pay_amount * b1.cost_amount < 
                    2.67 * b1.sale_amount * b3.pay_amount + 2 * b3.trans_amount * b1.cost_amount)
                AND (d.id IS NULL OR ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 != '滞销' OR d.userDef7 IS NULL) AND (d.link_attribute != '滞销' OR d.link_attribute IS NULL)))`
            break
        case 'goal_not_achieve':
            subsql = `${subsql} AND s.onsale_date < DATE_SUB(NOW(), INTERVAL 60 DAY) 
                AND IF(pi.division_id = 1, b2.sale_amount >= 3000 OR b2.profit >= b2.sale_amount * 0.18 
                    AND b2.sale_amount < t.amount, 
                    IF(pi.division_id = 2, b2.sale_amount >= 3000 OR b2.profit >= b2.sale_amount * 0.15 
                        AND b2.sale_amount < d.pit_target * 10000, 
                        b2.sale_amount >= 12000 OR b2.profit >= b2.sale_amount * 0.18 
                            AND b2.sale_amount < t.amount)
                AND (d.id IS NULL OR ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 != '滞销' OR d.userDef7 IS NULL) AND (d.link_attribute != '滞销' OR d.link_attribute IS NULL)))`
            break
        case 'invalid_link':
            subsql = `${subsql} AND s.onsale_date < DATE_SUB(NOW(), INTERVAL 60 DAY) 
				AND IF(pi.division_id = 1, (b2.sale_amount IS NULL OR 
                    (b2.sale_amount < 3000 AND b2.profit < b2.sale_amount * 0.18)), 
                    IF(pi.division_id = 2, (b2.sale_amount IS NULL OR 
                        (b2.sale_amount < 3000 AND b2.profit < b2.sale_amount * 0.15)), 
                        (b2.sale_amount IS NULL OR 
                            (b2.sale_amount < 12000 AND b2.profit < b2.sale_amount * 0.18))))
                AND (d.id IS NULL OR ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 != '滞销' OR d.userDef7 IS NULL) AND (d.link_attribute != '滞销' OR d.link_attribute IS NULL)))`
            break
        case 'important_link':
            subsql = `${subsql} AND s.onsale_date >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
				AND pi.project_name IN ('宝选天猫', '京东', '抖音', '拼多多') 
                AND IF(pi.project_name = '宝选天猫', d.userDef7 IN ('打仗', '爆款'), 
                    IF(pi.project_name = '京东', d.userDef1 IN ('打仗', '爆款'), 
                        d.link_attribute IN ('打仗', '爆款')))`
            break
        case 'low_gross_profit':
            subsql = `${subsql} AND IF(pi.division_id = 1, ((b4.cost_amount >= 30 * b4.sale_qty 
                    AND b4.sale_amount * 0.6 < b4.cost_amount) 
                    OR (b4.cost_amount < 30 * b4.sale_qty AND b4.sale_amount * 0.55 < b4.cost_amount)), 
                    IF(pi.division_id = 2, ((b4.cost_amount >= 50 * b4.sale_qty 
                        AND b4.sale_amount * 0.45 < b4.cost_amount) 
                        OR (b4.cost_amount < 50 * b4.sale_qty AND b4.sale_amount * 0.4 < b4.cost_amount)), 
                        ((b4.cost_amount >= 50 * b4.sale_qty 
                        AND b4.sale_amount * 0.45 < b4.cost_amount) 
                        OR (b4.cost_amount < 50 * b4.sale_qty AND b4.sale_amount * 0.4 < b4.cost_amount))))
                AND (d.id IS NULL OR ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 != '滞销' OR d.userDef7 IS NULL) AND (d.link_attribute != '滞销' OR d.link_attribute IS NULL)))`
            break
        case 'unsalable_link':
            subsql = `${subsql} AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销')`
            break
    }
    if (shopNames != null) {
        if (shopNames.length == 0) return result
        subsql = `${subsql}
                AND s.shop_name IN ("${shopNames}") `
    }
    if (linkIds != null) {
        if (linkIds.length == 0) return result
        subsql = `${subsql}
                AND s.goods_id IN ("${linkIds}") `
    }
    let sql1 = `GROUP BY s.goods_id, si.shop_id, s.shop_name`
    sql = `SELECT COUNT(1) AS count, SUM(sale_amount) AS sale_amount FROM (
        ${sql}${subsql} GROUP BY s.goods_id) aa`
    let row = await query(sql, p)
    if (row?.length && row[0].count) {
        result.total = row[0].count
        result.sum = row[0].sale_amount        
        sql = `SELECT s.goods_id, s.shop_name, si.shop_id, 
            IFNULL(SUM(a1.pay_amount), 0) AS pay_amount, 
            IFNULL(SUM(a1.brushing_amount), 0) AS brushing_amount, 
            IFNULL(SUM(a1.brushing_qty), 0) AS brushing_qty, 
            IFNULL(SUM(a1.refund_amount), 0) AS refund_amount, 
            IFNULL(SUM(a1.express_fee), 0) AS pay_express_fee, 
            IFNULL(SUM(a1.sale_amount), 0) AS real_pay_amount, 
            IF(IFNULL(SUM(a2.sale_amount), 0) > 0, 
                FORMAT((IFNULL(SUM(a1.sale_amount), 0) - IFNULL(SUM(a2.sale_amount), 0)) / 
                SUM(a2.sale_amount) * 100, 2), 0) AS real_pay_amount_qoq, 
            IFNULL(SUM(a1.bill), 0) AS bill,
            IFNULL(SUM(a1.sale_amount), 0) AS sale_amount,
            IFNULL(SUM(a1.cost_amount), 0) AS cost_amount, 
            IFNULL(SUM(a1.express_fee), 0) AS express_fee, 
            IFNULL(SUM(a1.packing_fee), 0) AS packing_fee, 
            IFNULL(SUM(a1.promotion_amount), 0) AS promotion_amount, 
            FORMAT(IF(IFNULL(SUM(a2.promotion_amount), 0) > 0, 
                (IFNULL(SUM(a1.promotion_amount), 0) - SUM(a2.promotion_amount)) /
                SUM(a2.promotion_amount) * 100, 0 
            ), 2) AS promotion_amount_qoq,
            IFNULL(SUM(a1.operation_amount), 0) AS operation_amount, 
            IFNULL(SUM(a1.words_market_vol), 0) AS words_market_vol, 
            IFNULL(SUM(a1.words_vol), 0) AS words_vol, 
            FORMAT(IFNULL(SUM(a1.dsr), 0) / COUNT(1), 2) AS dsr, 
            IFNULL(SUM(a1.order_num), 0) AS order_num, 
            IFNULL(SUM(a1.refund_num), 0) AS refund_num, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.operation_amount), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS operation_rate, 
            FORMAT(IF(IFNULL(SUM(a1.promotion_amount), 0) > 0, 
                IFNULL(SUM(a1.sale_amount), 0) / SUM(a1.promotion_amount), 
                0), 2) AS roi, 
            FORMAT(IF(IFNULL(SUM(a1.words_market_vol), 0) > 0, 
                IFNULL(SUM(a1.words_vol), 0) / SUM(a1.words_market_vol) * 100, 
                0), 2) AS market_rate, 
            FORMAT(IF(IFNULL(SUM(a1.order_num), 0) > 0, 
                IFNULL(SUM(a1.refund_num), 0) / SUM(a1.order_num) * 100, 
                0), 2) AS refund_rate, 
            IFNULL(SUM(a1.profit), 0) AS profit, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.profit), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS profit_rate, 
            FORMAT(IF(SUM(a4.sale_amount) > 0, 
                1 - SUM(a4.cost_amount) / SUM(a4.sale_amount), 0) * 100, 2) AS gross_profit 
            FROM (
                SELECT goods_id, MIN(create_time) AS onsale_date, shop_name FROM jst_goods_sku 
                WHERE is_shelf = '是' AND create_time IS NOT NULL GROUP BY goods_id, shop_name
                UNION ALL
                SELECT brief_name AS goods_id, onsale_date, shop_name 
                FROM dianshang_operation_attribute WHERE platform = '自营'
            ) s LEFT JOIN goods_pays_stats a1 ON a1.goods_id = s.goods_id 
                AND a1.date BETWEEN ? AND ? 
                AND a1.goods_id NOT IN ('', '【无法匹配到商品】')
            LEFT JOIN goods_pays_stats a2 ON a2.goods_id = a1.goods_id 
                AND a2.date = DATE_SUB(a1.date, INTERVAL 1 DAY) 
            LEFT JOIN goods_verifieds_stats a4 ON a1.goods_id = a4.goods_id 
                AND a4.date = DATE_SUB(a1.date, INTERVAL 1 DAY)
            JOIN shop_info si ON s.shop_name = si.shop_name
            JOIN project_info pi ON pi.id = si.project_id 
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
            ) b1 ON b1.goods_id = s.goods_id
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit,
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
            ) b2 ON b2.goods_id = s.goods_id
            LEFT JOIN (SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, 
                    IFNULL(SUM(trans_amount), 0) AS trans_amount, 
                    IFNULL(SUM(plan_goal), 0) / 7 AS plan_goal, goods_id 
                FROM goods_promotion_plan WHERE \`date\` BETWEEN ? AND ? GROUP BY goods_id
            ) b3 ON b3.goods_id = s.goods_id 
            LEFT JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                    IFNULL(SUM(cost_amount), 0) AS cost_amount, 
                    IFNULL(SUM(sale_qty), 0) AS sale_qty, goods_id FROM goods_verifieds
                WHERE \`date\` BETWEEN ? AND ? GROUP BY goods_id
            ) b4 ON b4.goods_id = s.goods_id 
            LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
                OR d.brief_name = s.goods_id 
            ${presql}`
        sql1 = `GROUP BY s.goods_id, s.shop_name, si.shop_id`
        sql = `SELECT aa.* FROM (${sql}${subsql}${sql1}) aa`
        if (params.sort) sql = `${sql} ORDER BY aa.${params.sort}`
        if (!params.export)
            sql = `${sql}
                LIMIT ${offset}, ${size}`
        row = await query(sql, p)
        if (row?.length) {
            let goods_ids = '', goodsMap = {}, row1
            sql = ''
            for (let i = 0; i < row.length; i++) {
                row[i].sku_id = ''
                row[i].sku_sid = ''
                row[i].hasChild = hasChild
                row[i].id = row[i].goods_id || row[i].sku_code
                row[i].parent_id = null
                if (row[i].goods_id) {
                    goods_ids = `${goods_ids}"${row[i].goods_id}",`
                    goodsMap[row[i].goods_id] = i
                }
            }
            if (goods_ids?.length) {
                goods_ids = goods_ids.substring(0, goods_ids.length - 1) 
                sql = `WITH a1 AS (
                        SELECT IFNULL(s.on_sku_code, o.sku_id) AS sku_id, o.goods_id, 
                        ROW_NUMBER() OVER (PARTITION BY o.goods_id ORDER BY 
                            IFNULL(SUM(o.sale_amount), 0) DESC) AS rk FROM goods_pay_info o 
                        LEFT JOIN jst_goods_sku s ON o.goods_id = s.goods_id 
                            AND o.sku_id = s.sku_id 
                        WHERE o.goods_id IN (${goods_ids}) AND o.date BETWEEN ? AND ? 
                        GROUP BY o.sku_id, s.on_sku_code, o.goods_id
                    ) SELECT sku_id, goods_id, rk FROM a1 WHERE rk <= 2`
                row1 = await query(sql, [start, end])
                if (row1?.length) {
                    for (let j = 0; j < row1.length; j++) {
                        let i = goodsMap[row1[j].goods_id]
                        if (row1[j].rk == 1) row[i].sku_id = row1[j].sku_id
                        else row[i].sku_sid = row1[j].sku_id               
                    }
                }
                sql = `SELECT d.goods_name, d.brief_name, d.operator, d.brief_product_line, 
                        d.line_director, d.purchase_director, s.create_time AS onsale_date, 
                        d.link_attribute, d.important_attribute, d.first_category, d.second_category, 
                        d.pit_target, (CASE WHEN DATE_SUB(NOW(), INTERVAL 30 DAY) <= s.create_time 
                            THEN '新品30' 
                        WHEN DATE_SUB(NOW(), INTERVAL 60 DAY) <= s.create_time 
                            THEN '新品60' 
                        WHEN DATE_SUB(NOW(), INTERVAL 90 DAY) <= s.create_time 
                            THEN '新品90' 
                        ELSE '老品' END) AS onsale_info, 
                        a.goal, s.goods_id 
                    FROM (
                        SELECT goods_id, MIN(create_time) AS create_time FROM jst_goods_sku 
                        WHERE goods_id IN (${goods_ids}) GROUP BY goods_id
                    ) s LEFT JOIN dianshang_operation_attribute d ON s.goods_id = d.goods_id 
                    LEFT JOIN (
                        SELECT GROUP_CONCAT(CONCAT(g.month, ': ', FORMAT(g.amount, 2)) SEPARATOR '\n') 
                            AS goal, g.goods_id FROM goods_monthly_sales_target g
                        WHERE g.goods_id IN (${goods_ids}) AND g.month BETWEEN ? AND ? 
                        GROUP BY g.goods_id 
                    ) a ON a.goods_id = d.goods_id  
                    UNION ALL
                    SELECT goods_name, brief_name, operator, brief_product_line, 
                        line_director, purchase_director, onsale_date, link_attribute, 
                        important_attribute, first_category, second_category, pit_target,
                        (CASE WHEN DATE_SUB(NOW(), INTERVAL 30 DAY) <= onsale_date 
                            THEN '新品30' 
                        WHEN DATE_SUB(NOW(), INTERVAL 60 DAY) <= onsale_date 
                            THEN '新品60' 
                        WHEN DATE_SUB(NOW(), INTERVAL 90 DAY) <= onsale_date 
                            THEN '新品90' 
                        ELSE '老品' END) AS onsale_info, 
                        a.goal, d.goods_id 
                    FROM dianshang_operation_attribute d 
                    LEFT JOIN (
                        SELECT GROUP_CONCAT(CONCAT(g.month, ': ', FORMAT(g.amount, 2)) SEPARATOR '\n') 
                            AS goal, g.goods_id FROM goods_monthly_sales_target g
                        WHERE g.goods_id IN (${goods_ids}) AND g.month BETWEEN ? AND ? 
                        GROUP BY g.goods_id 
                    ) a ON a.goods_id = d.brief_name 
                    WHERE d.brief_name IN (${goods_ids}) AND d.platform ='自营'`
                row1 = await query(sql, [
                    moment(start).format('YYYYMM'), 
                    moment(end).format('YYYYMM'),
                    moment(start).format('YYYYMM'), 
                    moment(end).format('YYYYMM')
                ])
                if (row1?.length) {
                    for (let j = 0; j < row1.length; j++) {
                        let i = goodsMap[row1[j].goods_id ? row1[j].goods_id : row1[j].brief_name]
                        row[i].goods_name = row1[j].goods_name
                        row[i].brief_name = row1[j].brief_name
                        row[i].operator = row1[j].operator
                        row[i].brief_product_line = row1[j].brief_product_line
                        row[i].line_director = row1[j].line_director
                        row[i].purchase_director = row1[j].purchase_director
                        row[i].onsale_date = row1[j].onsale_date
                        row[i].link_attribute = row1[j].link_attribute
                        row[i].important_attribute = row1[j].important_attribute
                        row[i].first_category = row1[j].first_category
                        row[i].second_category = row1[j].second_category
                        row[i].pit_target = row1[j].pit_target
                        row[i].pit_target_day = row1[j].pit_target*targettime
                        row[i].pit_target_month = row1[j].pit_target*days
                        row[i].onsale_info = row1[j].onsale_info
                        row[i].goal = row1[j].goal
                        row[i].sale_amount_profit_day = row1[j].pit_target*targettime>0 ? (row[i].sale_amount/(row1[j].pit_target*targettime)*100).toFixed(2) + '%' : null
                        row[i].sale_amount_profit_month = row1[j].pit_target*days>0 ? (row[i].sale_month/(row1[j].pit_target*days)*100).toFixed(2) + '%' : null
                        const arrary=["pakchoice旗舰店（天猫）","八千行旗舰店（天猫）","宝厨行（淘宝）","八千行（淘宝）","北平商号（淘宝）","天猫teotm旗舰店"]
                        if (!arrary.includes(row[i].shop_name)) {
                            row[i].sale_amount_profit_day = null
                            row[i].sale_amount_profit_month = null
                        }
                    }
                }
                sql = `select SUM(IF(promotion_name='6003416精准人群推广',amount,null)) as targeted_audience_promotion
                        ,SUM(IF(promotion_name='6003431万相台无界-全站推广',amount,null)) as full_site_promotion
                        ,SUM(IF(promotion_name='6003414多目标直投',amount,null)) as multi_objective_promotion
                        ,SUM(IF(promotion_name='60030412关键词推广',amount,null)) as keyword_promotion
                        ,SUM(IF(promotion_name='6003432万相台无界-货品运营',amount,null)) as product_operation_promotion
                        ,SUM(IF(promotion_name='日常推广',amount,null)) AS daily_promotion
                        ,SUM(IF(promotion_name='场景推广',amount,null)) AS scene_promotion
                        ,SUM(IF(promotion_name='京东快车1' OR promotion_name='京东快车2' OR promotion_name='京东快车3',amount,null)) AS jd_express_promotion
                        ,SUM(IF(promotion_name='全站营销' OR promotion_name='新品全站营销',amount,null)) AS total_promotion, goods_id 
                    from goods_promotion_info 
                    where date BETWEEN '${start}' AND '${end}' AND goods_id IN (${goods_ids}) 
                    GROUP BY goods_id`
                let row2 = await query(sql)
                if(row2?.length){
                    for (let j = 0; j < row2.length; j++) {
                        let i = goodsMap[row2[j].goods_id]
                        row[i].full_site_promotion = row2[j].full_site_promotion
                        row[i].multi_objective_promotion = row2[j].multi_objective_promotion
                        row[i].targeted_audience_promotion = row2[j].targeted_audience_promotion
                        row[i].product_operation_promotion = row2[j].product_operation_promotion
                        row[i].keyword_promotion = row2[j].keyword_promotion
                        row[i].daily_promotion = row2[j].daily_promotion
                        row[i].scene_promotion = row2[j].scene_promotion
                        row[i].jd_express_promotion = row2[j].jd_express_promotion
                        row[i].total_promotion = row2[j].total_promotion
                        row[i].full_site_promotion_roi = row2[j].full_site_promotion!=null ? (row[i].sale_amount/row2[j].full_site_promotion).toFixed(2) : null
                        row[i].multi_objective_promotion_roi = row2[j].multi_objective_promotion!=null ? (row[i].sale_amount/row2[j].multi_objective_promotion).toFixed(2) : null
                        row[i].targeted_audience_promotion_roi = row2[j].targeted_audience_promotion!=null ? (row[i].sale_amount/row2[j].targeted_audience_promotion).toFixed(2) : null
                        row[i].product_operation_promotion_roi = row2[j].product_operation_promotion!=null ? (row[i].sale_amount/row2[j].product_operation_promotion).toFixed(2) : null
                        row[i].keyword_promotion_roi = row2[j].keyword_promotion!=null ? (row[i].sale_amount/row2[j].keyword_promotion).toFixed(2) : null
                    }
                }
                sql=`SELECT IFNULL(SUM(a1.users_num), 0) AS users_num, 
                        IFNULL(SUM(a1.trans_users_num), 0) AS trans_users_num,
                        IF(IFNULL(SUM(a1.users_num), 0) > 0, FORMAT(
                            (IFNULL(SUM(a1.trans_users_num), 0) - 
                            IFNULL(SUM(a2.brushing_qty), 0)) / 
                            IFNULL(SUM(a1.users_num), 0) * 100, 2), 0) AS real_pay_rate,
                            IFNULL(SUM(a1.total_users_num), 0) AS total_users_num, 
                            IFNULL(SUM(a1.total_trans_users_num), 0) AS total_trans_users_num, a1.goods_id 
                    FROM goods_composite_info a1 
                    LEFT JOIN goods_pays a2 
                    ON a1.goods_id = a2.goods_id AND a1.date = a2.date 
                    WHERE a1.date BETWEEN '${start}' AND '${end}' AND a1.goods_id IN (${goods_ids}) 
                    GROUP BY a1.goods_id`
                let row3 = await query(sql)
                for (let j = 0; j < row3.length; j++) {
                    let i = goodsMap[row3[j].goods_id]
                    row[i].users_num = row3[j].users_num
                    row[i].trans_users_num = row3[j].trans_users_num
                    row[i].real_pay_rate = row3[j].real_pay_rate
                    row[i].total_trans_users_num = row3[j].total_trans_users_num
                    row[i].total_users_num = row3[j].total_users_num
                }
            }
            result.data = row
        }
    }
    return result
}

goodsPayInfoRepo.getDataPromotionQOQByTime = async(goods_id, start, end) => {
    const sql = `SELECT FORMAT(IF(IFNULL(SUM(a2.promotion_amount), 0) > 0, 
                (IFNULL(SUM(a1.promotion_amount), 0) - SUM(a2.promotion_amount)) / 
                SUM(a2.promotion_amount), 0), 2) AS promotion_amount_qoq, 
            DATE_FORMAT(a1.date, '%Y-%m-%d') as \`date\` 
        FROM goods_pay_info a1 LEFT JOIN goods_pay_info a2 ON a1.goods_id = a2.goods_id
            AND a1.sku_code = a2.sku_code 
            AND a1.date = DATE_ADD(a2.date, INTERVAL 1 DAY)
        WHERE a1.date >= ? AND a1.date <= ? AND a1.goods_id = ?
        GROUP BY a1.date`
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsPayInfoRepo.getDataGrossProfitByTime = async(goods_id, start, end) => {
    const sql = `SELECT FORMAT(IF(SUM(g.sale_amount) > 0, 
                (1 - SUM(g.cost_amount) / SUM(g.sale_amount)), 0) * 100, 2) AS gross_profit, g.date
        FROM goods_verifieds_stats g  
        WHERE g.date BETWEEN ? AND ? AND g.goods_id = ? 
        GROUP BY g.date`
    const result = await query(sql, [
        moment(start).subtract(1, 'day').format('YYYY-MM-DD'),
        moment(end).subtract(1, 'day').format('YYYY-MM-DD'),
        goods_id])
    return result || []
}

goodsPayInfoRepo.batchInsert = async (count, data) => {
    let sql = `INSERT INTO goods_pay_info(
            goods_id, 
            sku_id, 
            sku_code, 
            shop_name, 
            shop_id, 
            \`date\`, 
            pay_amount, 
            brushing_amount, 
            refund_amount, 
            express_fee, 
            bill,
            sale_amount, 
            cost_amount, 
            gross_profit, 
            profit,
            promotion_amount,
            operation_amount,
            packing_fee,
            sale_qty,
            refund_qty,
            gross_standard,
            other_cost) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

goodsPayInfoRepo.updateOrder = async ({
    date, goods_id, sku_code, shop_name, order_num, refund_num
}) => {
    let sql = `UPDATE goods_pay_info SET order_num = ?, refund_num = ? 
        WHERE \`date\` = ? AND sku_code = ? AND shop_name = ?`
    let params = [order_num, refund_num, date, sku_code, shop_name]
    if (!goods_id) sql = `${sql} AND goods_id IS NULL`
    else {
        sql = `${sql} AND goods_id = ?`
        params.push(goods_id)
    }
    const result = await query(sql, params)
    return result?.affectedRows ? true : false
}

goodsPayInfoRepo.insertBrushingInfo = async (data) => {
    let sql = `INSERT INTO goods_pay_info(
        goods_id,
        sku_code,
        \`date\`, 
        brushing_qty) VALUES(?,?,?,?)`
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

goodsPayInfoRepo.deleteByDate = async (date) => {
    let sql = `DELETE FROM goods_pay_info WHERE date = ? 
        AND  shop_name NOT IN ('京东自营-厨具', '京东自营-日用')`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

goodsPayInfoRepo.deleteByDate2 = async (date,shop_name) => {
    let sql = `DELETE FROM goods_pay_info WHERE \`date\` = ? AND shop_name = ? `
    const result = await query(sql, [date,shop_name])
    return result?.affectedRows ? true : false
}

goodsPayInfoRepo.updateBrushingQty = async (goods_id, sku_code, brushing_qty, date) => {
    let sql = `UPDATE goods_pay_info SET brushing_qty = ? WHERE \`date\` = ?
        AND goods_id = ? AND sku_code = ?`
    const result = await query(sql, [brushing_qty, date, goods_id, sku_code])
    return result?.affectedRows ? true : false
}

goodsPayInfoRepo.resetBrushingQty = async (date) => {
    let sql = `UPDATE goods_pay_info SET brushing_qty = NULL WHERE \`date\` = ?`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

goodsPayInfoRepo.getDataDetailByTime = async (column, goods_id, start, end) => {
    const sql = `SELECT IFNULL(SUM(${column}), 0) AS ${column}, \`date\` 
        FROM goods_pay_info WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id = ?
        GROUP BY \`date\``
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsPayInfoRepo.getDataDetailByTime1 = async (goods_id, start, end) => {
    const sql = `SELECT IFNULL(SUM(sale_qty), 0) AS real_sale_qty, \`date\` 
        FROM goods_pay_info WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id = ?
        GROUP BY \`date\``
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsPayInfoRepo.getDataDetailTotalByTime = async(goods_id, start, end) => {
    const sql = `SELECT IFNULL(a1.sale_amount, 0) AS sale_amount, 
            IFNULL(a1.cost_amount, 0) AS cost_amount, 
            IFNULL(a1.operation_amount, 0) AS operation_amount, 
            IFNULL(a1.promotion_amount, 0) AS promotion_amount, 
            IFNULL(a1.express_fee, 0) AS express_fee, 
            IFNULL(a1.profit, 0) AS profit, 
            IFNULL(a1.shop_name,'') AS shop_name, 
            FORMAT(IF(IFNULL(a1.sale_amount, 0) > 0, 
                IFNULL(a1.operation_amount, 0) / a1.sale_amount, 0) * 100, 2) AS operation_rate, 
            FORMAT(IF(IFNULL(a1.promotion_amount, 0) > 0, 
                IFNULL(a1.sale_amount, 0) / a1.promotion_amount, 0), 2) AS roi, 
            FORMAT(IF(IFNULL(a1.order_num, 0) > 0, 
                IFNULL(a1.refund_num, 0) / a1.order_num, 0) * 100, 2) AS refund_rate, 
            FORMAT(IF(IFNULL(a1.sale_amount, 0) > 0, 
                IFNULL(a1.profit, 0) / a1.sale_amount, 0) * 100, 2) AS profit_rate, 
            FORMAT(IF(a2.sale_amount > 0, 
                (1 - a2.cost_amount / a2.sale_amount) * 100, 0), 2) AS gross_profit, 
            FORMAT(IF(IFNULL(a1.sale_amount, 0) > 0, 
                IFNULL(a1.profit, 0) / a1.sale_amount, 0) * 100, 2) AS profit_rate_gmv, 
            FORMAT(IFNULL(a5.targeted_audience_promotion,0),2) AS targeted_audience_promotion,
            FORMAT(IFNULL(a5.full_site_promotion,0),2) AS full_site_promotion,
            FORMAT(IFNULL(a5.multi_objective_promotion,0),2) AS multi_objective_promotion,
            FORMAT(IFNULL(a5.keyword_promotion,0),2) AS keyword_promotion,
            FORMAT(IFNULL(a5.product_operation_promotion,0),2) AS product_operation_promotion,
            FORMAT(IFNULL(a5.daily_promotion,0),2) AS daily_promotion,
            FORMAT(IFNULL(a5.scene_promotion,0),2) AS scene_promotion,
            FORMAT(IFNULL(a5.jd_express_promotion,0),2) AS jd_express_promotion,
            FORMAT(IFNULL(a5.total_promotion,0),2) AS total_promotion,
            FORMAT(IFNULL(a1.sale_amount, 0)/IFNULL(a5.targeted_audience_promotion,0),2) AS targeted_audience_promotion_roi,
            FORMAT(IFNULL(a1.sale_amount, 0)/IFNULL(a5.full_site_promotion,0),2) AS full_site_promotion_roi,
            FORMAT(IFNULL(a1.sale_amount, 0)/IFNULL(a5.multi_objective_promotion,0),2) AS multi_objective_promotion_roi,
            FORMAT(IFNULL(a1.sale_amount, 0)/IFNULL(a5.keyword_promotion,0),2) AS keyword_promotion_roi,
            FORMAT(IFNULL(a1.sale_amount, 0)/IFNULL(a5.product_operation_promotion,0),2) AS product_operation_promotion_roi,
            DATE_FORMAT(a1.date, '%Y-%m-%d') as \`date\` 
        FROM goods_pays_stats a1 LEFT JOIN goods_verifieds_stats a2 ON a1.goods_id = a2.goods_id 
            AND a2.date = DATE_SUB(a1.date, INTERVAL 1 DAY) 
        LEFT JOIN(
            select date
                    ,SUM(IF(promotion_name='6003416精准人群推广',amount,null)) as targeted_audience_promotion
                    ,SUM(IF(promotion_name='6003431万相台无界-全站推广',amount,null)) as full_site_promotion
                    ,SUM(IF(promotion_name='6003414多目标直投',amount,null)) as multi_objective_promotion
                    ,SUM(IF(promotion_name='60030412关键词推广',amount,null)) as keyword_promotion
                    ,SUM(IF(promotion_name='6003432万相台无界-货品运营',amount,null)) as product_operation_promotion
                    ,SUM(IF(promotion_name='日常推广',amount,null)) AS daily_promotion
                    ,SUM(IF(promotion_name='场景推广',amount,null)) AS scene_promotion
                    ,SUM(IF(promotion_name='京东快车1' OR promotion_name='京东快车2' OR promotion_name='京东快车3',amount,null)) AS jd_express_promotion
                    ,SUM(IF(promotion_name='全站营销' OR promotion_name='新品全站营销',amount,null)) AS total_promotion,goods_id
            from goods_promotion_info 
            where date BETWEEN ? AND ? AND goods_id = ?
            GROUP BY date,goods_id
        ) as a5 ON a1.goods_id = a5.goods_id AND a1.date = a5.date 
        WHERE a1.date BETWEEN ? AND ? AND a1.goods_id = ?`
    const result = await query(sql, [start, end, goods_id, start, end, goods_id])
    return result || []
}

goodsPayInfoRepo.getDataDetailTotalByTime1 = async (goods_id, start, end) => {
    const sql = `SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, 
            IFNULL(SUM(brushing_amount), 0) AS brushing_amount, 
            IFNULL(SUM(brushing_qty), 0) AS brushing_qty, 
            IFNULL(SUM(refund_amount), 0) AS refund_amount, 
            IFNULL(SUM(bill), 0) AS bill, 
            IFNULL(SUM(express_fee), 0) AS pay_express_fee, 
            IFNULL(SUM(pay_amount), 0) - IFNULL(SUM(brushing_amount), 0) 
            - IFNULL(SUM(refund_amount), 0) AS real_pay_amount, 
            DATE_FORMAT(\`date\`, '%Y-%m-%d') as \`date\` 
        FROM goods_pay_info WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id = ?
        GROUP BY \`date\``
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsPayInfoRepo.getExpressFeeByTime = async (goods_id, start, end) => {
    const sql = `SELECT IFNULL(SUM(express_fee), 0) AS pay_express_fee, \`date\` 
        FROM goods_pay_info WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id = ?
        GROUP BY \`date\``
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsPayInfoRepo.getRealPayAmountByTime = async (goods_id, start, end) => {
    const sql = `SELECT IFNULL(SUM(pay_amount), 0) - IFNULL(SUM(brushing_amount), 0) 
            - IFNULL(SUM(refund_amount), 0) AS real_pay_amount, \`date\` FROM goods_pay_info 
        WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id = ?
        GROUP BY \`date\``
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsPayInfoRepo.getRealPayAmountQOQByTime = async (goods_id, start, end) => {
    const sql = `SELECT IF(IFNULL(SUM(a2.pay_amount), 0) - IFNULL(SUM(a2.brushing_amount), 0) 
            - IFNULL(SUM(a2.refund_amount), 0) > 0, 
            FORMAT((IFNULL(SUM(a1.pay_amount), 0) - IFNULL(SUM(a1.brushing_amount), 0) 
            - IFNULL(SUM(a1.refund_amount), 0) - IFNULL(SUM(a2.pay_amount), 0) 
            + IFNULL(SUM(a2.brushing_amount), 0) + IFNULL(SUM(a2.refund_amount), 0)) * 100 / 
            (IFNULL(SUM(a2.pay_amount), 0) - IFNULL(SUM(a2.brushing_amount), 0) 
                - IFNULL(SUM(a2.refund_amount), 0)), 2), 0) AS real_pay_amount_qoq, a1.date 
            FROM goods_payments a1 
            LEFT JOIN goods_payments a2 ON a1.goods_id = a2.goods_id 
                AND a2.date = DATE_SUB(a1.date, INTERVAL 1 DAY) 
        WHERE a1.date >= ? AND a1.date <= ? AND a1.goods_id = ?
        GROUP BY a1.date`
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

/**
 * negative profit count without invalid link & unsalable link
 * @param {*} shopNames 
 * @param {*} start 
 * @param {*} end 
 * @param {*} start1 
 * @param {*} end1 
 * @param {*} sale_amount 
 * @param {*} profit_rate 
 * @param {*} shopNames1 
 * @returns 
 */
goodsPayInfoRepo.getNegativeProfitByShopNamesAndTime = async (shopNames, start, end, start1, end1, sale_amount, profit_rate, shopNames1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s 
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? 
                AND shop_name IN ("${shopNames}") 
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit,
				IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND date BETWEEN ? AND ? 
                AND shop_name IN ("${shopNames}") 
            GROUP BY goods_id) a1 ON a1.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        WHERE s.create_time < DATE_SUB(NOW(), INTERVAL 30 DAY) 
            AND (a.profit < 0 OR a.goods_id IS NULL) AND d.id IS NULL 
            AND IF(s.create_time < DATE_SUB(NOW(), INTERVAL 60 DAY), 
				(a1.sale_amount >= ? OR a1.profit >= a1.sale_amount * ?), 1) `
    let params = [start, end, start1, end1, sale_amount, profit_rate]
    if (shopNames1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL)) s LEFT JOIN (
                SELECT IFNULL(SUM(profit), 0) AS profit, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? 
                    AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit,
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND date BETWEEN ? AND ? 
                    AND shop_name IN ("${shopNames1}") 
                GROUP BY goods_id) a1 ON a1.goods_id = s.goods_id
            WHERE s.onsale_date < DATE_SUB(NOW(), INTERVAL 30 DAY) 
                AND (a.profit < 0 OR a.goods_id IS NULL) 
                AND IF(s.onsale_date < DATE_SUB(NOW(), INTERVAL 60 DAY), 
                    (a1.sale_amount >= ? OR a1.profit >= a1.sale_amount * ?), 1)) c`
        params.push(start, end, start1, end1, sale_amount, profit_rate)
    }
    const result = await query(sql, params)
    return result
}

/**
 * negative profit count without invalid link & unsalable link
 * @param {*} links 
 * @param {*} start 
 * @param {*} end 
 * @param {*} start1 
 * @param {*} end1 
 * @param {*} sale_amount 
 * @param {*} profit_rate 
 * @param {*} links1 
 * @returns 
 */
goodsPayInfoRepo.getNegativeProfitByLinksAndTime = async (links, start, end, start1, end1, sale_amount, profit_rate, links1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s 
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? 
                AND goods_id IN ("${links}") 
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit,
				IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND date BETWEEN ? AND ? 
                AND goods_id IN ("${links}") 
            GROUP BY goods_id) a1 ON a1.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        WHERE s.create_time < DATE_SUB(NOW(), INTERVAL 30 DAY) 
            AND (a.profit < 0 OR a.goods_id IS NULL) AND d.id IS NULL 
            AND IF(s.create_time < DATE_SUB(NOW(), INTERVAL 60 DAY), 
				(a1.sale_amount >= ? OR a1.profit >= a1.sale_amount * ?), 1) `
    let params = [start, end, start1, end1, sale_amount, profit_rate]
    if (links1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL)) s LEFT JOIN (
                SELECT IFNULL(SUM(profit), 0) AS profit, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? 
                    AND goods_id IN ("${links1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit,
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND date BETWEEN ? AND ? 
                    AND goods_id IN ("${links1}") 
                GROUP BY goods_id) a1 ON a1.goods_id = s.goods_id
            WHERE s.onsale_date < DATE_SUB(NOW(), INTERVAL 30 DAY) 
                AND (a.profit < 0 OR a.goods_id IS NULL) 
                AND IF(s.onsale_date < DATE_SUB(NOW(), INTERVAL 60 DAY), 
                    (a1.sale_amount >= ? OR a1.profit >= a1.sale_amount * ?), 1)) c`
        params.push(start, end, start1, end1, sale_amount, profit_rate)
    }
    const result = await query(sql, params)
    return result
}

/**
 * low profit count without jdzy and invalid link & unsalable link
 * @param {*} shopNames 
 * @param {*} start 
 * @param {*} end 
 * @param {*} start1 
 * @param {*} end1 
 * @param {*} sale_amount 
 * @param {*} profit_rate 
 * @param {*} shopNames1 
 * @returns 
 */
goodsPayInfoRepo.getLowProfitByShopNamesAndTime = async (shopNames, start, end, start1, end1, sale_amount, profit_rate, shopNames1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s 
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? 
                AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? 
                AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a1 ON a1.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        WHERE s.create_time < DATE_SUB(NOW(), INTERVAL 60 DAY) AND d.id IS NULL 
            AND (a.profit < a.sale_amount * 0.18 OR a.sale_amount = 0 OR a.goods_id IS NULL)
            AND (a1.sale_amount >= ? OR a1.profit >= a1.sale_amount * ?)`
    let params = [start, end, start1, end1, sale_amount, profit_rate]
    if (shopNames1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL)) s 
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? 
                    AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? 
                    AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id) a1 ON a1.goods_id = s.goods_id 
            WHERE s.onsale_date < DATE_SUB(NOW(), INTERVAL 60 DAY) 
                AND (a.profit < a.sale_amount * 0.18 OR a.sale_amount = 0 OR a.goods_id IS NULL) 
                AND (a1.sale_amount >= ? OR a1.profit >= a1.sale_amount * ?)) c`
        params.push(start, end, start1, end1, sale_amount, profit_rate)
    }
    const result = await query(sql, params)
    return result
}

/**
 * low profit count without jdzy and invalid link & unsalable link
 * @param {*} links 
 * @param {*} start 
 * @param {*} end 
 * @param {*} start1 
 * @param {*} end1 
 * @param {*} sale_amount 
 * @param {*} profit_rate 
 * @param {*} links1 
 * @returns 
 */
goodsPayInfoRepo.getLowProfitByLinksAndTime = async (links, start, end, start1, end1, sale_amount, profit_rate, links1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s 
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? 
                AND goods_id IN ("${links}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? 
                AND goods_id IN ("${links}")
            GROUP BY goods_id) a1 ON a1.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        WHERE s.create_time < DATE_SUB(NOW(), INTERVAL 60 DAY) AND d.id IS NULL 
            AND (a.profit < a.sale_amount * 0.18 OR a.sale_amount = 0 OR a.goods_id IS NULL)
            AND (a1.sale_amount >= ? OR a1.profit >= a1.sale_amount * ?)`
    let params = [start, end, start1, end1, sale_amount, profit_rate]
    if (links1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL)) s 
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? 
                    AND goods_id IN ("${links1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? 
                    AND goods_id IN ("${links1}")
                GROUP BY goods_id) a1 ON a1.goods_id = s.goods_id 
            WHERE s.onsale_date < DATE_SUB(NOW(), INTERVAL 60 DAY) 
                AND (a.profit < a.sale_amount * 0.18 OR a.sale_amount = 0 OR a.goods_id IS NULL) 
                AND (a1.sale_amount >= ? OR a1.profit >= a1.sale_amount * ?)) c`
        params.push(start, end, start1, end1, sale_amount, profit_rate)
    }
    const result = await query(sql, params)
    return result
}

/**
 * none promotion count without invalid link & unsalable link
 * @param {*} shopNames 
 * @param {*} start 
 * @param {*} end 
 * @param {*} start1 
 * @param {*} end1 
 * @param {*} sale_amount 
 * @param {*} profit_rate 
 * @param {*} shopNames1 
 * @returns 
 */
goodsPayInfoRepo.getNullPromotionByShopNamesAndTime = async (shopNames, start, end, start1, end1, sale_amount, profit_rate, shopNames1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s 
        LEFT JOIN (SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? 
                AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? 
                AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a1 ON a1.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        WHERE (a.promotion_amount = 0 OR a.goods_id IS NULL) AND d.id IS NULL 
            AND (d.is_price_comparison = '否' OR d.is_price_comparison IS NULL)
            AND IF(s.create_time < DATE_SUB(NOW(), INTERVAL 60 DAY), 
                (a1.sale_amount >= ? OR a1.profit >= a1.sale_amount * ?), 1)`
    let params = [start, end, start1, end1, sale_amount, profit_rate]
    if (shopNames1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL)) s LEFT JOIN (
                SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? 
                    AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? 
                    AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id) a1 ON a1.goods_id = s.goods_id 
            WHERE (a.promotion_amount = 0 OR a.goods_id IS NULL) 
                AND IF(s.onsale_date < DATE_SUB(NOW(), INTERVAL 60 DAY), 
                    (a1.sale_amount >= ? OR a1.profit >= a1.sale_amount * ?), 1)) c`
        params.push(start, end, start1, end1, sale_amount, profit_rate)
    }
    const result = await query(sql, params)
    return result
}

/**
 * none promotion count without invalid link & unsalable link
 * @param {*} links 
 * @param {*} start 
 * @param {*} end 
 * @param {*} start1 
 * @param {*} end1 
 * @param {*} sale_amount 
 * @param {*} profit_rate 
 * @param {*} links1 
 * @returns 
 */
goodsPayInfoRepo.getNullPromotionByLinksAndTime = async (links, start, end, start1, end1, sale_amount, profit_rate, links1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s 
        LEFT JOIN (SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? 
                AND goods_id IN ("${links}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? 
                AND goods_id IN ("${links}")
            GROUP BY goods_id) a1 ON a1.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        WHERE (a.promotion_amount = 0 OR a.goods_id IS NULL) AND d.id IS NULL 
            AND (d.is_price_comparison = '否' OR d.is_price_comparison IS NULL)
            AND IF(s.create_time < DATE_SUB(NOW(), INTERVAL 60 DAY), 
                (a1.sale_amount >= ? OR a1.profit >= a1.sale_amount * ?), 1)`
    let params = [start, end, start1, end1, sale_amount, profit_rate]
    if (links1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL)) s LEFT JOIN (
                SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? 
                    AND goods_id IN ("${links1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? 
                    AND goods_id IN ("${links1}")
                GROUP BY goods_id) a1 ON a1.goods_id = s.goods_id 
            WHERE (a.promotion_amount = 0 OR a.goods_id IS NULL) 
                AND IF(s.onsale_date < DATE_SUB(NOW(), INTERVAL 60 DAY), 
                    (a1.sale_amount >= ? OR a1.profit >= a1.sale_amount * ?), 1)) c`
        params.push(start, end, start1, end1, sale_amount, profit_rate)
    }
    const result = await query(sql, params)
    return result
}

/**
 * low promotion count without jdzy and invalid link & unsalable link
 * @param {*} shopNames 
 * @param {*} start 
 * @param {*} end 
 * @param {*} start1 
 * @param {*} end1 
 * @param {*} sale_amount 
 * @param {*} profit_rate 
 * @param {*} rate 
 * @param {*} shopNames1 
 * @returns 
 */
goodsPayInfoRepo.getLowPromotionByShopNamesAndTime = async (shopNames, start, end, start1, end1, sale_amount, profit_rate, rate, shopNames1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s 
        JOIN (SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? 
                AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? 
                AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a1 ON a1.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        WHERE a.promotion_amount < a.sale_amount * ? AND d.id IS NULL 
            AND IF(s.create_time < DATE_SUB(NOW(), INTERVAL 60 DAY), 
                (a1.sale_amount >= ? OR a1.profit >= a1.sale_amount * ?), 1)`
    let params = [start, end, start1, end1, rate, sale_amount, profit_rate]
    if (shopNames1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL)) s JOIN (
                SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? 
                    AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? 
                    AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id) a1 ON a1.goods_id = s.goods_id 
            WHERE a.promotion_amount < a.sale_amount * ? 
                AND IF(s.onsale_date < DATE_SUB(NOW(), INTERVAL 60 DAY), 
                    (a1.sale_amount >= ? OR a1.profit >= a1.sale_amount * ?), 1)) c`
        params.push(start, end, start1, end1, rate, sale_amount, profit_rate)
    }
    const result = await query(sql, params)
    return result
}

/**
 * low promotion count without jdzy and invalid link & unsalable link
 * @param {*} links 
 * @param {*} start 
 * @param {*} end 
 * @param {*} start1 
 * @param {*} end1 
 * @param {*} sale_amount 
 * @param {*} profit_rate 
 * @param {*} rate 
 * @param {*} links1 
 * @returns 
 */
goodsPayInfoRepo.getLowPromotionByLinksAndTime = async (links, start, end, start1, end1, sale_amount, profit_rate, rate, links1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s 
        JOIN (SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? 
                AND goods_id IN ("${links}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? 
                AND goods_id IN ("${links}")
            GROUP BY goods_id) a1 ON a1.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        WHERE a.promotion_amount < a.sale_amount * ? AND d.id IS NULL 
            AND IF(s.create_time < DATE_SUB(NOW(), INTERVAL 60 DAY), 
                (a1.sale_amount >= ? OR a1.profit >= a1.sale_amount * ?), 1)`
    let params = [start, end, start1, end1, rate, sale_amount, profit_rate]
    if (links1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL)) s JOIN (
                SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? 
                    AND goods_id IN ("${links1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? 
                    AND goods_id IN ("${links1}")
                GROUP BY goods_id) a1 ON a1.goods_id = s.goods_id 
            WHERE a.promotion_amount < a.sale_amount * ? 
                AND IF(s.onsale_date < DATE_SUB(NOW(), INTERVAL 60 DAY), 
                    (a1.sale_amount >= ? OR a1.profit >= a1.sale_amount * ?), 1)) c`
        params.push(start, end, start1, end1, rate, sale_amount, profit_rate)
    }
    const result = await query(sql, params)
    return result
}

/**
 * low roi count without unsalable link
 * s = sale_amount, c = cost_amount, p = promotion_amount
 * s / p < s / (0.67 * s - c) + 0.5 ===> s * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 * ===> p * c < s * (2.67 * p + 2 * c - 1.34 * s) 
 * @param {*} shopNames 
 * @param {*} start 
 * @param {*} end 
 * @returns 
 * @returns 
 */
goodsPayInfoRepo.getLowROIByShopNamesAndTime = async (shopNames, start, end) => {
    const sql = `SELECT COUNT(DISTINCT a.goods_id) AS count FROM (
            SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? 
                AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = a.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        WHERE a.promotion_amount * a.cost_amount < a.sale_amount * 
                (2.67 * a.promotion_amount + 2 * a.cost_amount - 1.34 * a.sale_amount) 
            AND d.id IS NULL`
    const result = await query(sql, [start, end])
    return result
}

/**
 * low roi count without unsalable link
 * s = sale_amount, c = cost_amount, p = promotion_amount
 * s / p < s / (0.67 * s - c) + 0.5 ===> s * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 * ===> p * c < s * (2.67 * p + 2 * c - 1.34 * s) 
 * @param {*} links 
 * @param {*} start 
 * @param {*} end 
 * @returns 
 * @returns 
 */
goodsPayInfoRepo.getLowROIByLinksAndTime = async (links, start, end) => {
    const sql = `SELECT COUNT(DISTINCT a.goods_id) AS count FROM (
            SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? 
                AND goods_id IN ("${links}")
            GROUP BY goods_id) a 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = a.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        WHERE a.promotion_amount * a.cost_amount < a.sale_amount * 
                (2.67 * a.promotion_amount + 2 * a.cost_amount - 1.34 * a.sale_amount) 
            AND d.id IS NULL`
    const result = await query(sql, [start, end])
    return result
}

/**
 * low plan roi count without pdd & unsalable link
 * s = sale_amount, c = cost_amount, p = pay_amount, t = trans_amount
 * t / p < s / (0.67 * s - c) + 0.5 ===> t * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 * ===> 1.34 * s * t + p * c < 2.67 * s * p + 2 * t * c
 * @param {*} shopNames 
 * @param {*} start 
 * @param {*} end 
 * @returns 
 * @returns 
 */
goodsPayInfoRepo.getLowPlanROIByShopNamesAndTime = async (shopNames, start, end) => {
    const sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN ? AND ? AND shop_name IN ("${shopNames}") GROUP BY goods_id) s 
        JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? 
                AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        WHERE 1.34 * a.sale_amount * s.trans_amount + s.pay_amount * a.cost_amount < 
                2.67 * a.sale_amount * s.pay_amount + 2 * s.trans_amount * a.cost_amount 
            AND d.id IS NULL`
    const result = await query(sql, [start, end, start, end])
    return result
}

/**
 * low plan roi count without pdd & unsalable link
 * s = sale_amount, c = cost_amount, p = pay_amount, t = trans_amount
 * t / p < s / (0.67 * s - c) + 0.5 ===> t * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 * ===> 1.34 * s * t + p * c < 2.67 * s * p + 2 * t * c
 * @param {*} links 
 * @param {*} start 
 * @param {*} end 
 * @returns 
 * @returns 
 */
goodsPayInfoRepo.getLowPlanROIByLinksAndTime = async (links, start, end) => {
    const sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN ? AND ? AND goods_id IN ("${links}") GROUP BY goods_id) s 
        JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? 
                AND goods_id IN ("${links}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        WHERE 1.34 * a.sale_amount * s.trans_amount + s.pay_amount * a.cost_amount < 
                2.67 * a.sale_amount * s.pay_amount + 2 * s.trans_amount * a.cost_amount 
            AND d.id IS NULL`
    const result = await query(sql, [start, end, start, end])
    return result
}

/**
 * pdd low plan roi count (7 days average) without unsalable link
 * g = plan_goal, p = pay_amount, t = trans_amount
 * t / p < g ===> t < p * g
 * @param {*} shopNames 
 * @param {*} start 
 * @param {*} end 
 * @returns 
 */
goodsPayInfoRepo.getLowPlanROIByShopNamesAndTime1 = async (shopNames, start, end) => {
    const sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, 
                IFNULL(SUM(plan_goal), 0) / 7 AS plan_goal, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN ? AND ? AND shop_name IN ("${shopNames}") GROUP BY goods_id) s 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        WHERE s.trans_amount < s.pay_amount * s.plan_goal AND d.id IS NULL`
    const result = await query(sql, [start, end])
    return result
}

/**
 * pdd low plan roi count (7 days average) without unsalable link
 * g = plan_goal, p = pay_amount, t = trans_amount
 * t / p < g ===> t < p * g
 * @param {*} links 
 * @param {*} start 
 * @param {*} end 
 * @returns 
 */
goodsPayInfoRepo.getLowPlanROIByLinksAndTime1 = async (links, start, end) => {
    const sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, 
                IFNULL(SUM(plan_goal), 0) / 7 AS plan_goal, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN ? AND ? AND goods_id IN ("${links}") GROUP BY goods_id) s 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        WHERE s.trans_amount < s.pay_amount * s.plan_goal AND d.id IS NULL`
    const result = await query(sql, [start, end])
    return result
}

/**
 * goal not acheive without jd, dy & unsalable link
 * @param {*} shopNames 
 * @param {*} months 
 * @param {*} start 
 * @param {*} end 
 * @param {*} sale_amount 
 * @param {*} profit_rate 
 * @returns 
 */
goodsPayInfoRepo.getGoalNotAchieveByShopNameAndTime = async (shopNames, months, start, end, sale_amount, profit_rate) => {
    let presql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s 
        JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND date BETWEEN ? AND ? 
                AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        JOIN (SELECT IFNULL(SUM(amount), 0) AS amount, goods_id FROM (`
    let search = ''
    for (let i = 0; i < months.length; i++) {
        let sql = `SELECT goods_id, amount * ${months[i].percent} AS amount 
            FROM goods_monthly_sales_target WHERE month = ${months[i].month}`
        search = `${search}
                ${sql}
            UNION ALL `
    }
    search = search.substring(0, search.length - 10)
    search = `${presql}${search}) t1 GROUP BY t1.goods_id) t
            ON t.goods_id = s.goods_id 
        WHERE s.create_time < DATE_SUB(NOW(), INTERVAL 60 DAY) 
            AND a.sale_amount >= ? AND a.profit >= a.sale_amount * ? 
            AND a.sale_amount < t.amount AND d.id IS NULL`
    const result = await query(search, [start, end, sale_amount, profit_rate])
    return result
}

/**
 * goal not acheive without jd, dy & unsalable link
 * @param {*} links 
 * @param {*} months 
 * @param {*} start 
 * @param {*} end 
 * @param {*} sale_amount 
 * @param {*} profit_rate 
 * @returns 
 */
goodsPayInfoRepo.getGoalNotAchieveByLinksAndTime = async (links, months, start, end, sale_amount, profit_rate) => {
    let presql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s 
        JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND date BETWEEN ? AND ? 
                AND goods_id IN ("${links}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        JOIN (SELECT IFNULL(SUM(amount), 0) AS amount, goods_id FROM (`
    let search = ''
    for (let i = 0; i < months.length; i++) {
        let sql = `SELECT goods_id, amount * ${months[i].percent} AS amount 
            FROM goods_monthly_sales_target WHERE month = ${months[i].month}`
        search = `${search}
                ${sql}
            UNION ALL `
    }
    search = search.substring(0, search.length - 10)
    search = `${presql}${search}) t1 GROUP BY t1.goods_id) t
            ON t.goods_id = s.goods_id 
        WHERE s.create_time < DATE_SUB(NOW(), INTERVAL 60 DAY) 
            AND a.sale_amount >= ? AND a.profit >= a.sale_amount * ? 
            AND a.sale_amount < t.amount AND d.id IS NULL`
    const result = await query(search, [start, end, sale_amount, profit_rate])
    return result
}

/**
 * jd & dy goal not acheive without unsalable link
 * @param {*} shopNames 
 * @param {*} start 
 * @param {*} end 
 * @param {*} sale_amount 
 * @param {*} profit_rate 
 * @param {*} shopNames1 
 * @returns 
 */
goodsPayInfoRepo.getGoalNotAchieveByShopNameAndTime1 = async (shopNames, start, end, sale_amount, profit_rate, shopNames1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s 
        JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND date BETWEEN ? AND ? 
                AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d1 ON d1.goods_id = s.goods_id 
            AND (d1.userDef1 = '滞销' OR d1.link_attribute = '滞销') 
        WHERE s.create_time < DATE_SUB(NOW(), INTERVAL 60 DAY) 
            AND a.sale_amount >= ? AND a.profit >= a.sale_amount * ? 
            AND a.sale_amount < d.pit_target * 10000 AND d1.id IS NULL`
    let params = [start, end, sale_amount, profit_rate]
    if (shopNames1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date, pit_target 
                FROM dianshang_operation_attribute WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL)) s 
                JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND date BETWEEN ? AND ? 
                    AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE s.onsale_date < DATE_SUB(NOW(), INTERVAL 60 DAY) 
                AND a.sale_amount >= ? AND a.profit >= a.sale_amount * ? 
                AND a.sale_amount < s.pit_target * 10000) c`
        params.push(start, end, sale_amount, profit_rate)
    }
    const result = await query(sql, params)
    return result
}

/**
 * jd & dy goal not acheive without unsalable link
 * @param {*} links 
 * @param {*} start 
 * @param {*} end 
 * @param {*} sale_amount 
 * @param {*} profit_rate 
 * @param {*} links1 
 * @returns 
 */
goodsPayInfoRepo.getGoalNotAchieveByLinksAndTime1 = async (links, start, end, sale_amount, profit_rate, links1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s 
        JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND date BETWEEN ? AND ? 
                AND goods_id IN ("${links}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d1 ON d1.goods_id = s.goods_id 
            AND (d1.userDef1 = '滞销' OR d1.link_attribute = '滞销') 
        WHERE s.create_time < DATE_SUB(NOW(), INTERVAL 60 DAY) 
            AND a.sale_amount >= ? AND a.profit >= a.sale_amount * ? 
            AND a.sale_amount < d.pit_target * 10000 AND d1.id IS NULL`
    let params = [start, end, sale_amount, profit_rate]
    if (links1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date, pit_target 
                FROM dianshang_operation_attribute WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL)) s 
                JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND date BETWEEN ? AND ? 
                    AND goods_id IN ("${links1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE s.onsale_date < DATE_SUB(NOW(), INTERVAL 60 DAY) 
                AND a.sale_amount >= ? AND a.profit >= a.sale_amount * ? 
                AND a.sale_amount < s.pit_target * 10000) c`
        params.push(start, end, sale_amount, profit_rate)
    }
    const result = await query(sql, params)
    return result
}

/**
 * invalid count without unsalable link
 * @param {*} shopNames 
 * @param {*} sale_amount 
 * @param {*} profit_rate 
 * @param {*} start 
 * @param {*} end 
 * @param {*} shopNames1 
 * @returns 
 */
goodsPayInfoRepo.getInvalidByShopNamesAndTime = async (shopNames, sale_amount, profit_rate, start, end, shopNames1) => {
    let sql = `SELECT COUNT(DISTINCT s1.goods_id) AS count FROM (
        SELECT s.goods_id, MIN(s.create_time) AS create_time, a.sale_amount, a.profit 
        FROM (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s LEFT JOIN (
            SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND date BETWEEN ? AND ? 
                    AND shop_name IN ("${shopNames}") 
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
                AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
            WHERE s.create_time < DATE_SUB(NOW(), INTERVAL 60 DAY) AND d.id IS NULL
                AND (a.sale_amount IS NULL 
                    OR (a.sale_amount < ? 
                    AND a.sale_amount * ? > a.profit))
            GROUP BY s.goods_id, a.sale_amount, a.profit) s1`
    let params = [start, end, sale_amount, profit_rate]
    if (shopNames1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL)) s LEFT JOIN (
                SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                    FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                        AND date BETWEEN ? AND ? 
                        AND shop_name IN ("${shopNames1}") 
                    GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE s.onsale_date < DATE_SUB(NOW(), INTERVAL 60 DAY) 
                AND (a.sale_amount IS NULL 
                    OR (a.sale_amount < ? 
                    AND a.sale_amount * ? > a.profit))) c`
        params.push(start, end, sale_amount, profit_rate)
    }
    const result = await query(sql, params)
    return result
}

/**
 * invalid count without unsalable link
 * @param {*} links 
 * @param {*} sale_amount 
 * @param {*} profit_rate 
 * @param {*} start 
 * @param {*} end 
 * @param {*} links1 
 * @returns 
 */
goodsPayInfoRepo.getInvalidByLinksAndTime = async (links, sale_amount, profit_rate, start, end, links1) => {
    let sql = `SELECT COUNT(DISTINCT s1.goods_id) AS count FROM (
        SELECT s.goods_id, MIN(s.create_time) AS create_time, a.sale_amount, a.profit 
        FROM (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s LEFT JOIN (
            SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND date BETWEEN ? AND ? 
                    AND goods_id IN ("${links}") 
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
                AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
            WHERE s.create_time < DATE_SUB(NOW(), INTERVAL 60 DAY) AND d.id IS NULL 
                AND (a.sale_amount IS NULL 
                    OR (a.sale_amount < ? 
                    AND a.sale_amount * ? > a.profit))
            GROUP BY s.goods_id, a.sale_amount, a.profit) s1`
    let params = [start, end, sale_amount, profit_rate]
    if (links1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL)) s LEFT JOIN (
                SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                    FROM goods_pays WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                        AND date BETWEEN ? AND ? 
                        AND goods_id IN ("${links1}") 
                    GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE s.onsale_date < DATE_SUB(NOW(), INTERVAL 60 DAY) 
                AND (a.sale_amount IS NULL 
                    OR (a.sale_amount < ? 
                    AND a.sale_amount * ? > a.profit))) c`
        params.push(start, end, sale_amount, profit_rate)
    }
    const result = await query(sql, params)
    return result
}

/**
 * tmall important link count
 * userDef7
 * @param {*} shopNames 
 * @returns 
 */
goodsPayInfoRepo.getImportByShopNames = async (shopNames) => {
    const sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM dianshang_operation_attribute d 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s ON d.goods_id = s.goods_id 
        WHERE s.create_time >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
            AND d.userDef7 IN ('打仗', '爆款')
            AND d.shop_name IN ("${shopNames}")`
    const result = await query(sql)
    return result
}

/**
 * tmall important link count
 * userDef7
 * @param {*} links 
 * @returns 
 */
goodsPayInfoRepo.getImportByLinks = async (links) => {
    const sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM dianshang_operation_attribute d 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s ON d.goods_id = s.goods_id 
        WHERE s.create_time >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
            AND d.userDef7 IN ('打仗', '爆款')
            AND d.goods_id IN ("${links}")`
    const result = await query(sql)
    return result
}

/**
 * jd dy important link count
 * userDef1 jd
 * linkAttribute dy
 * @param {*} shopNames 
 * @param {*} shopNames1 
 * @returns 
 */
goodsPayInfoRepo.getImportByShopNames1 = async (shopNames, shopNames1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM dianshang_operation_attribute d 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s ON d.goods_id = s.goods_id 
        WHERE s.create_time >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
            AND (d.userDef1 IN ('打仗', '爆款') OR d.link_attribute IN ('打仗', '爆款'))
            AND d.shop_name IN ("${shopNames}")`
    if (shopNames1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM dianshang_operation_attribute s 
            WHERE s.onsale_date >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
                AND s.userDef1 IN ('打仗', '爆款')
                AND s.shop_name IN ("${shopNames1}")) c`
    }
    const result = await query(sql)
    return result
}

/**
 * jd dy important link count
 * userDef1 jd
 * linkAttribute dy
 * @param {*} links 
 * @param {*} links1 
 * @returns 
 */
goodsPayInfoRepo.getImportByLinks1 = async (links, links1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM dianshang_operation_attribute d 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s ON d.goods_id = s.goods_id 
        WHERE s.create_time >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
            AND (d.userDef1 IN ('打仗', '爆款') OR d.link_attribute IN ('打仗', '爆款'))
            AND d.goods_id IN ("${links}")`
    if (links1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM dianshang_operation_attribute s 
            WHERE s.onsale_date >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
                AND s.userDef1 IN ('打仗', '爆款')
                AND s.goods_id IN ("${links1}")) c`
    }
    const result = await query(sql)
    return result
}

/**
 * pdd important link count
 * linkAttribute
 * @param {*} shopNames 
 * @returns 
 */
goodsPayInfoRepo.getImportByShopNames2 = async (shopNames) => {
    const sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM dianshang_operation_attribute d 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s ON d.goods_id = s.goods_id 
        WHERE s.create_time >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
            AND d.link_attribute IN ('打仗', '爆款')
            AND d.shop_name IN ("${shopNames}")`
    const result = await query(sql)
    return result
}

/**
 * pdd important link count
 * linkAttribute
 * @param {*} links 
 * @returns 
 */
goodsPayInfoRepo.getImportByLink2 = async (links) => {
    const sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM dianshang_operation_attribute d 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s ON d.goods_id = s.goods_id 
        WHERE s.create_time >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
            AND d.link_attribute IN ('打仗', '爆款')
            AND d.goods_id IN ("${links}")`
    const result = await query(sql)
    return result
}

/**
 * unsalable link count
 * @param {*} shopNames 
 * @returns 
 */
goodsPayInfoRepo.getUnsalableByShopNames = async (shopNames) => {
    const sql = `SELECT COUNT(DISTINCT d.goods_id) AS count FROM dianshang_operation_attribute d 
        WHERE (d.userDef7 = '滞销' OR d.userDef1 = '滞销' OR d.link_attribute = '滞销')
            AND d.shop_name IN ("${shopNames}")`
    const result = await query(sql)
    return result
}

/**
 * unsalable link count
 * @param {*} links 
 * @returns 
 */
goodsPayInfoRepo.getUnsalableByLinks = async (links) => {
    const sql = `SELECT COUNT(DISTINCT d.goods_id) AS count FROM dianshang_operation_attribute d 
        WHERE (d.userDef7 = '滞销' OR d.userDef1 = '滞销' OR d.link_attribute = '滞销')
            AND d.goods_id IN ("${links}")`
    const result = await query(sql)
    return result
}

module.exports = goodsPayInfoRepo