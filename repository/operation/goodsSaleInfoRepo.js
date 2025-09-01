const { query } = require('../../model/dbConn')
const moment = require('moment')
const goodsSaleInfoRepo = {}
goodsSaleInfoRepo.getPaymentByShopNamesAndTime = async (shopNames, start, end) => {
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
                0), 2) AS profit_rate FROM goods_sales a1
        LEFT JOIN goods_other_info a2 ON a1.goods_id = a2.goods_id
            AND a1.date = a2.date
        WHERE a1.shop_name IN ("${shopNames}") 
            AND a1.date >= ?
            AND a1.date <= ?`
    const result = await query(sql, [start, end])
    return result || []
}

goodsSaleInfoRepo.getTargetsByShopNames = async (shopNames, months) => {
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
            FROM goods_sales WHERE date >= '${months[i].start}' 
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

goodsSaleInfoRepo.getNullPromotionByTime = async (shopNames, start, end) => {
    let sql = `SELECT a1.shop_name FROM goods_sale_info a1 LEFT JOIN shop_info si
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

goodsSaleInfoRepo.getDetailByShopNamesAndTme = async (shopNames, column, start, end) => {
    let sql = `SELECT IFNULL(SUM(${column}), 0) AS ${column}, \`date\` FROM goods_sale_info 
        WHERE \`date\` >= ? AND \`date\` <= ? AND shop_name IN ("${shopNames}") 
        GROUP BY \`date\``
    let result = await query(sql, [start, end])
    return  result || []
}

goodsSaleInfoRepo.getRateByShopNamesAndTme = async (shopNames, col1, col2, column, start, end, percent) => {
    let sql = `SELECT FORMAT(IF(IFNULL(SUM(${col1}), 0) > 0, 
                IFNULL(SUM(${col2}), 0) / SUM(${col1}) * ${percent}, 0), 2) AS ${column}, \`date\` 
        FROM goods_sale_info 
        WHERE \`date\` >= ? AND \`date\` <= ? AND shop_name IN ("${shopNames}") 
        GROUP BY \`date\``
    let result = await query(sql, [start, end])
    return  result || []
}

goodsSaleInfoRepo.getChildPaymentByShopNamesAndTime = async (shopNames, start, end) => {
    const sql = `SELECT IFNULL(SUM(A1.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(a1.express_fee), 0) AS express_fee, 
            IFNULL(SUM(a1.packing_fee), 0) AS packing_fee, 
            IFNULL(SUM(a1.promotion_amount), 0) AS promotion_amount, 
            IFNULL(SUM(a1.promotion_amount), 0) AS promotion_amount, 
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
				ELSE 2 END) AS type FROM goods_sales a1
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

goodsSaleInfoRepo.getPaymentByLinkIdsAndTime = async (linkIds, start, end) => {
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
                0), 2) AS profit_rate FROM goods_sales a1 
        LEFT JOIN goods_other_info a2 ON a1.goods_id = a2.goods_id
            AND a1.date = a2.date
        WHERE a1.goods_id IN ("${linkIds}") 
            AND a1.date >= ?
            AND a1.date <= ?`
    const result = await query(sql, [start, end])
    return result || []
}

goodsSaleInfoRepo.getTargetsByLinkIds = async (linkIds, months) => {
    let presql = `SELECT FORMAT(IF(IFNULL(SUM(a2.amount), 0) > 0, 
            IFNULL(SUM(a1.amount), 0) / SUM(a2.amount) * 100, 0), 2) AS target, 
        IFNULL(SUM(a1.amount), 0) AS amount1, 
        IFNULL(SUM(a2.amount), 0) AS amount2, a2.month FROM 
        goods_monthly_sales_target a2 LEFT JOIN (SELECT IFNULL(sum(sale_amount), 0) AS amount, `
    let search = ''
    for (let i = 0; i < months.length; i++) {
        let sql = `'${moment(months[i].start).format('YYYYMM')}' AS month, goods_id 
            FROM goods_sales WHERE date >= '${months[i].start}' 
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

goodsSaleInfoRepo.getDetailByLinkIdsAndTme = async (linkIds, column, start, end) => {
    let sql = `SELECT IFNULL(SUM(${column}), 0) AS ${column}, \`date\` FROM goods_sale_info 
        WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id IN ("${linkIds}") 
        GROUP BY \`date\``
    let result = await query(sql, [start, end])
    return  result || []
}

goodsSaleInfoRepo.getRateByLinkIdsAndTme = async (linkIds, col1, col2, column, start, end, percent) => {
    let sql = `SELECT FORMAT(IF(IFNULL(SUM(${col1}), 0) > 0, 
                IFNULL(SUM(${col2}), 0) / SUM(${col1}) * ${percent}, 0), 2) AS ${column}, \`date\` 
        FROM goods_sale_info 
        WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id IN ("${linkIds}") 
        GROUP BY \`date\``
    let result = await query(sql, [start, end])
    return  result || []
}

goodsSaleInfoRepo.getChildPaymentByLinkIdsAndTime = async (linkIds, start, end) => {
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
				ELSE 2 END) AS type FROM goods_sales a1 
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

goodsSaleInfoRepo.getData = async (start, end, params, shopNames, linkIds,shopNames1) => {
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
    let sql = `SELECT SUM(a1.sale_amount) AS sale_amount, a1.goods_id FROM goods_sales_stats a1`
    subsql = ` WHERE a1.date BETWEEN ? AND ?`
    let hasChild = start == end ? false:true
    let date = start == end ? start: start+'~'+end
    p.push(start, end)
    for (let i =0; i < params.search.length; i++) {
        if (params.search[i].field_id == 'operation_rate') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.operation_amount), 0) AS operation_amount, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_sales a2
                        WHERE a2.date BETWEEN ? AND ? AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.operation_amount * 100 >= ${params.search[i].min} * b.sale_amount
                        AND b.operation_amount * 100 <= ${params.search[i].max} * b.sale_amount)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'roi') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.promotion_amount), 0) AS promotion_amount, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_sales a2 
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
                            IFNULL(SUM(a2.refund_num), 0) AS refund_num FROM goods_sales a2 
                        WHERE a2.date BETWEEN ? AND ? AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.refund_num * 100 >= ${params.search[i].min} * b.order_num
                        AND b.refund_num * 100 <= ${params.search[i].max} * b.order_num)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'profit_rate') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.profit), 0) AS profit, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_sales a2 
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
        } else if (['pay_amount', 'brushing_amount', 'brushing_qty', 'refund_amount', 'bill', 'pay_express_fee'].includes(params.search[i].field_id)) {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.${params.search[i].field_id}), 0) AS val FROM 
                        goods_payments a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max})`
            p.push(start, end)
        } else if (params.search[i].field_id == 'real_pay_amount') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.pay_amount), 0) - IFNULL(SUM(a2.brushing_amount), 0) 
                            - IFNULL(SUM(a2.refund_amount), 0) AS val 
                        FROM goods_payments a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'real_pay_amount_qoq') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.pay_amount), 0) - IFNULL(SUM(a2.brushing_amount), 0) 
                            - IFNULL(SUM(a2.refund_amount), 0) AS val1, 
                            IFNULL(SUM(a3.pay_amount), 0) - IFNULL(SUM(a3.brushing_amount), 0) 
                            - IFNULL(SUM(a3.refund_amount), 0) AS val2
                        FROM goods_payments a2 JOIN goods_payments a3 ON a3.goods_id = a2.goods_id
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
                            FROM goods_sale_info WHERE date BETWEEN ? AND ?
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
        }else if (params.search[i].field_id == 'sale_amount_profit_month') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT val FROM (
                        SELECT a2.goods_id,ROUND(IFNULL(sale_amount,0)/(pit_target*${days})*100,2) AS val FROM (
                            SELECT goods_id,SUM(sale_amount)AS sale_amount 
                            FROM goods_sale_info where date BETWEEN ? AND ?
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
                        ), 2) AS val FROM goods_sales a2 WHERE a2.date BETWEEN ? AND ? 
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
                        orders_goods_sales a2 LEFT JOIN jst_goods_sku s 
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
                        FROM orders_goods_sales a2 LEFT JOIN jst_goods_sku s 
                            ON a2.goods_id = s.goods_id AND a2.sku_id = s.sku_id 
                        WHERE a2.goods_id = a1.goods_id AND a2.date BETWEEN ? AND ? 
                        GROUP BY a2.sku_id, s.on_sku_code 
                        ORDER BY IFNULL(SUM(a2.sale_amount), 0) DESC LIMIT 2 
                    ) a3 WHERE (SELECT COUNT(1) FROM (
                        SELECT IFNULL(s.on_sku_code, a2.sku_id) AS sku_id, 
                            IFNULL(SUM(a2.sale_amount), 0) AS amount 
                        FROM orders_goods_sales a2 LEFT JOIN jst_goods_sku s 
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
                        goods_sales a2 WHERE a2.date BETWEEN ? AND ? 
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
                AND a1.shop_name IN ("${shopNames}")`
    }
    if (linkIds != null) {
        if (linkIds.length == 0) return result
        subsql = `${subsql}
                AND a1.goods_id IN ("${linkIds}")`
    }
    if (shopNames1!=null) {
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
            IFNULL(SUM(a1.pay_express_fee), 0) AS pay_express_fee, 
            IFNULL(SUM(a1.real_pay_amount), 0) AS real_pay_amount, 
            IF(IFNULL(SUM(a2.real_pay_amount), 0) > 0, 
                FORMAT((IFNULL(SUM(a1.real_pay_amount), 0) - IFNULL(SUM(a2.real_pay_amount), 0)) / 
                SUM(a2.real_pay_amount) * 100, 2), 0) AS real_pay_amount_qoq, 
            IFNULL(SUM(a1.bill), 0) AS bill,
            IFNULL(SUM(a1.sale_amount), 0) AS sale_amount,
            IFNULL(SUM(a1.sale_qty), 0) AS sale_qty,
            IFNULL(MAX(a1.sale_month), 0) AS sale_month,
            IFNULL(SUM(a1.cost_amount), 0) AS cost_amount, 
            FORMAT(IF(a1.shop_name='京东自营-厨具',IFNULL(SUM(a1.sale_amount), 0)*0.07, 
                IFNULL(SUM(a1.sale_amount), 0)*0.07 +IFNULL(SUM(a1.pay_amount), 0)*0.02),2) AS tax,
            IFNULL(SUM(a1.express_fee), 0) AS express_fee, 
            IFNULL(SUM(a1.packing_fee), 0) AS packing_fee, 
            IFNULL(SUM(a1.labor_cost), 0) AS labor_cost, 
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
            FROM goods_sales_stats a1 LEFT JOIN goods_sales_stats a2 ON a2.goods_id = a1.goods_id 
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
                        ELSE '老品' END) AS onsale_info,o.dsr,d.sku_id,
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
                        ELSE '老品' END) AS onsale_info,o.dsr,d.sku_id,
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
                    LEFT JOIN goods_payments a2 
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

goodsSaleInfoRepo.getPromotionData = async (start, end, params, shopNames, linkIds,shopNames1) => {
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
    let end1 = moment().format('YYYY-MM-DD')
    let start1 = moment().subtract(7, 'day').format('YYYY-MM-DD')
    let end2 = end1
    let start2 = moment().subtract(30, 'day').format('YYYY-MM-DD')
    let end3 = moment(end).subtract(1, 'day').format('YYYY-MM-DD')
    let start3 = moment(start).subtract(1, 'day').format('YYYY-MM-DD')
    let end4 = moment().subtract(1, 'day').format('YYYY-MM-DD')
    let start4 = moment().subtract(3, 'day').format('YYYY-MM-DD')
    let end5 = moment().subtract(1, 'day').format('YYYY-MM-DD')
    let start5 = moment().subtract(14, 'day').format('YYYY-MM-DD')
    let start_end = moment(moment(start).add(1, 'month').format('YYYY-MM') + '-01')
    let end_start = moment(moment(end).format('YYYY-MM') + '-01')
    let months = [{
        month: parseInt(moment(start).format('YYYYMM')),
        percent: parseFloat((start_end.diff(moment(start), 'day') + 1) / moment(start).daysInMonth()).toFixed(2)
    }]
    for (i = 0; i <= end_start.diff(start_end, 'month'); i++) {
        let tmp = parseInt(start_end.add(i, 'month').format('YYYYMM'))
        months.push({
            month: tmp,
            percent: 1
        })
    }
    if (moment(start).format('YYYYMM') != moment(end).format('YYYYMM'))
        months.push({
            month: parseInt(moment(end).format('YYYYMM')),
            percent: parseFloat((moment(end).diff(end_start, 'day') + 1) / moment(end).daysInMonth()).toFixed(2)
        })
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
        LEFT JOIN goods_sales a1 ON a1.goods_id = s.goods_id
            AND a1.date BETWEEN ? AND ? 
            AND a1.goods_id NOT IN ('', '【无法匹配到商品】')
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
        ) b1 ON b1.goods_id = s.goods_id
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit,
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
        ) b2 ON b2.goods_id = s.goods_id 
        LEFT JOIN (SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, promotion_name, goods_id 
            FROM goods_promotion_plan WHERE \`date\` BETWEEN ? AND ? 
            GROUP BY goods_id, promotion_name
        ) b3 ON b3.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            OR d.brief_name = s.goods_id 
        LEFT JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, 
                IFNULL(SUM(sale_qty), 0) AS sale_qty, goods_id FROM goods_verifieds
            WHERE \`date\` BETWEEN ? AND ? GROUP BY goods_id
        ) b4 ON b4.goods_id = s.goods_id         
        LEFT JOIN (SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, promotion_name, goods_id 
            FROM goods_promotion_plan WHERE \`date\` BETWEEN ? AND ? 
            GROUP BY goods_id, promotion_name
        ) b5 ON b5.goods_id = s.goods_id 
        LEFT JOIN (SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, promotion_name, goods_id 
            FROM goods_promotion_plan WHERE \`date\` BETWEEN ? AND ? 
            GROUP BY goods_id, promotion_name
        ) b6 ON b6.goods_id = s.goods_id 
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
        ) b7 ON b7.goods_id = s.goods_id
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
        ) b8 ON b8.goods_id = s.goods_id
        LEFT JOIN (SELECT IFNULL(SUM(cost_amount), 0) AS cost_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_verifieds WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
        ) b9 ON b9.goods_id = s.goods_id
        JOIN shop_info si ON s.shop_name = si.shop_name
        JOIN project_info pi ON pi.id = si.project_id 
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(real_sale_amount), 0) AS real_sale_amount, 
                IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
        ) c1 ON c1.goods_id = s.goods_id
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(real_sale_amount), 0) AS real_sale_amount, 
                IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
        ) c2 ON c2.goods_id = s.goods_id
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(real_sale_amount), 0) AS real_sale_amount, 
                IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
        ) c3 ON c3.goods_id = s.goods_id
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(real_sale_amount), 0) AS real_sale_amount, 
                IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
        ) c4 ON c4.goods_id = s.goods_id
        ${presql}`
    subsql = ` WHERE s.goods_id IS NOT NULL`
    let hasChild = start == end ? false:true
    p.push(start, end, start1, end1, start2, end2, start1, end1, start3, end3, start4, end4, start5, end5, start4, end4, start5, end5, preStart, preEnd, start4, end4, start1, end1, start5, end5, start, end)
    for (let i =0; i < params.search.length; i++) {
        if (params.search[i].field_id == 'operation_rate') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.operation_amount), 0) AS operation_amount, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_sales a2
                        WHERE a2.date BETWEEN ? AND ? AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.operation_amount * 100 >= ${params.search[i].min} * b.sale_amount
                        AND b.operation_amount * 100 <= ${params.search[i].max} * b.sale_amount)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'roi') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.promotion_amount), 0) AS promotion_amount, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_sales a2 
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
                        SELECT IFNULL(SUM(a2.sale_qty), 0) AS order_num, 
                            IFNULL(SUM(a2.refund_qty), 0) AS refund_num FROM goods_sales a2 
                        WHERE a2.date BETWEEN ? AND ? AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.refund_num * 100 >= ${params.search[i].min} * b.order_num
                        AND b.refund_num * 100 <= ${params.search[i].max} * b.order_num)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'profit_rate') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.profit), 0) AS profit, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_sales a2 
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
                        FROM goods_sales a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'pay_express_fee') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.express_fee), 0) AS val 
                        FROM goods_sales a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'real_pay_amount') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.sale_amount), 0) AS val 
                        FROM goods_sales a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'real_pay_amount_qoq') {
            subsql = `${subsql} AND a1.goods_id IS NOT NULL AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.sale_amount), 0) AS val1, 
                            IFNULL(SUM(a3.sale_amount), 0) AS val2
                        FROM goods_sales a2 JOIN goods_sales a3 ON a3.goods_id = a2.goods_id
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
                            FROM goods_sales WHERE date BETWEEN ? AND ?
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
                            FROM goods_sales where date BETWEEN ? AND ?
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
                        ), 2) AS val FROM goods_sales a2 WHERE a2.date BETWEEN ? AND ? 
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
                        orders_goods_sales a2 LEFT JOIN jst_goods_sku s 
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
                        FROM orders_goods_sales a2 LEFT JOIN jst_goods_sku s 
                            ON a2.goods_id = s.goods_id AND a2.sku_id = s.sku_id 
                        WHERE a2.goods_id = a1.goods_id AND a2.date BETWEEN ? AND ? 
                        GROUP BY a2.sku_id, s.on_sku_code 
                        ORDER BY IFNULL(SUM(a2.sale_amount), 0) DESC LIMIT 2 
                    ) a3 WHERE (SELECT COUNT(1) FROM (
                        SELECT IFNULL(s.on_sku_code, a2.sku_id) AS sku_id, 
                            IFNULL(SUM(a2.sale_amount), 0) AS amount 
                        FROM orders_goods_sales a2 LEFT JOIN jst_goods_sku s 
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
                        goods_sales a2 WHERE a2.date BETWEEN ? AND ? 
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
            subsql = `${subsql} AND s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) 
                AND a1.profit < 0 AND d.is_price_comparison IS NULL
                AND (d.id IS NULL OR ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 != '滞销' OR d.userDef7 IS NULL) AND (d.link_attribute != '滞销' OR d.link_attribute IS NULL)))`
            break
        case 'low_profit':
            subsql = `${subsql} AND s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
                AND b1.profit < b1.sale_amount * 0.18 AND b1.profit >= 0 AND d.is_price_comparison IS NULL 
                AND (d.id IS NULL OR ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 != '滞销' OR d.userDef7 IS NULL) AND (d.link_attribute != '滞销' OR d.link_attribute IS NULL)))`
            break
        case 'none_promotion':
            subsql = `${subsql} AND a1.promotion_amount = 0 AND s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY) 
                AND d.is_price_comparison IS NULL 
                AND (d.id IS NULL OR ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 != '滞销' OR d.userDef7 IS NULL) AND (d.link_attribute != '滞销' OR d.link_attribute IS NULL)))`
            break
        case 'low_promotion':
            subsql = `${subsql} AND IF(pi.division_id = 1, a1.promotion_amount < a1.sale_amount * 0.08, 
                        IF(pi.division_id = 1, a1.promotion_amount < a1.sale_amount * 0.06, 
                            a1.promotion_amount < a1.sale_amount * 0.1)) AND a1.promotion_amount > 0 
                AND s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY) AND d.is_price_comparison IS NULL 
                AND (d.id IS NULL OR ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 != '滞销' OR d.userDef7 IS NULL) AND (d.link_attribute != '滞销' OR d.link_attribute IS NULL)))`
            break
        case 'low_roi':
            subsql = `${subsql} AND IF(pi.division_id = 1, 
                IF(d.platform = '自营', 
                    c2.sale_amount * (2 * c2.profit - 0.3) < c2.promotion_amount * (c2.real_sale_amount + c2.profit - 0.15), 
                    b1.promotion_amount * b1.cost_amount < 
                        b1.sale_amount * (2.67 * b1.promotion_amount + 2 * b1.cost_amount - 1.34 * b1.sale_amount)), 
                IF(pi.division_id = 2, 
                    b1.promotion_amount * b1.cost_amount < 
                        b1.sale_amount * (2.67 * b1.promotion_amount + 2 * b1.cost_amount - 1.34 * b1.sale_amount), 
                    IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), 
                        b1.promotion_amount * b1.cost_amount < 
                            b1.sale_amount * (2.67 * b1.promotion_amount + 2 * b1.cost_amount - 1.34 * b1.sale_amount), 
                        b1.sale_amount < b1.promotion_amount + b1.cost_amount))) 
                AND (d.product_stage NOT IN ('未起', '起') OR d.product_stage IS NULL)
                AND (d.id IS NULL OR ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 != '滞销' OR d.userDef7 IS NULL) AND (d.link_attribute != '滞销' OR d.link_attribute IS NULL)))`
            break
        case 'low_plan_roi':
            subsql = `${subsql} AND IF(pi.division_id = 1, IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), 
                    1.34 * b3.trans_amount * b1.sale_amount + b3.pay_amount * b1.cost_amount < 
                    2 * b1.sale_amount * b3.pay_amount + 0.67 * b3.pay_amount * b1.cost_amount + 
                        0.67 * b3.trans_amount * b1.cost_amount, 
                    (1.34 * b5.trans_amount * b7.sale_amount + b5.pay_amount * b7.cost_amount < 
                    2 * b7.sale_amount * b5.pay_amount + 0.67 * b5.pay_amount * b7.cost_amount + 
                        0.67 * b5.trans_amount * b7.cost_amount) AND d.product_stage IN ('稳', '控')), 
                    IF(pi.division_id = 2, IF(d.platform = '自营', IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), 
                        IF(b3.promotion_name = '全站营销', 
                            b3.trans_amount * (2 * c2.profit + 2 * c2.promotion_amount - 0.3 * c2.real_sale_amount) < 
                            b3.pay_amount * (1.85 * c2.real_sale_amount + c2.profit + c2.promotion_amount), 
                            b3.trans_amount * (c2.profit + c2.promotion_amount) < 
                            b3.pay_amount * (c2.real_sale_amount + 0.5 * c2.profit + 0.5 * c2.promotion_amount)), 
                        (IF(b5.promotion_name = '全站营销', 
                            b5.trans_amount * (2 * c1.profit + 2 * c1.promotion_amount - 0.3 * c1.real_sale_amount) < 
                            b5.pay_amount * (1.85 * c1.real_sale_amount + c1.profit + c1.promotion_amount), 
                            b5.trans_amount * (c1.profit + c1.promotion_amount) < 
                            b5.pay_amount * (c1.real_sale_amount + 0.5 * c1.profit + 0.5 * c1.promotion_amount)) 
                        AND d.product_stage IN ('稳', '控'))), 
                        IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), 
                            1.34 * b3.trans_amount * b1.sale_amount + b3.pay_amount * b1.cost_amount < 
                            2 * b1.sale_amount * b3.pay_amount + 0.67 * b3.pay_amount * b1.cost_amount + 0.67 * b3.trans_amount * b1.cost_amount, 
                            (1.34 * b5.trans_amount * b7.sale_amount + b5.pay_amount * b7.cost_amount < 
                            2 * b7.sale_amount * b5.pay_amount + 0.67 * b5.pay_amount * b7.cost_amount + 0.67 * b5.trans_amount * b7.cost_amount) 
                        AND d.product_stage IN ('稳', '控'))), 
                        IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), 
                            1.34 * b3.trans_amount * b1.sale_amount + b3.pay_amount * b1.cost_amount < 
                            2 * b1.sale_amount * b3.pay_amount + 0.67 * b3.pay_amount * b1.cost_amount + 0.67 * b3.trans_amount * b1.cost_amount, 
                            (1.34 * b5.trans_amount * b7.sale_amount + b5.pay_amount * b7.cost_amount < 
                            2 * b7.sale_amount * b5.pay_amount + 0.67 * b5.pay_amount * b7.cost_amount + 0.67 * b5.trans_amount * b7.cost_amount) 
                        AND d.product_stage IN ('稳', '控'))))
                AND (d.id IS NULL OR ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 != '滞销' OR d.userDef7 IS NULL) AND (d.link_attribute != '滞销' OR d.link_attribute IS NULL)))`
            break
        case 'low_plan_roi1':
            subsql = `${subsql} AND IF(pi.division_id = 1, IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), 
                    1.34 * b6.trans_amount * b8.sale_amount + b6.pay_amount * b8.cost_amount < 
                    2 * b8.sale_amount * b6.pay_amount + 0.67 * b6.pay_amount * b8.cost_amount + 
                        0.67 * b6.trans_amount * b8.cost_amount, 
                    (1.34 * b3.trans_amount * b1.sale_amount + b3.pay_amount * b1.cost_amount < 
                    2 * b1.sale_amount * b3.pay_amount + 0.67 * b3.pay_amount * b1.cost_amount + 
                        0.67 * b3.trans_amount * b1.cost_amount) AND d.product_stage IN ('稳', '控')), 
                    IF(pi.division_id = 2, IF(d.platform = '自营', IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), 
                        IF(b6.promotion_name = '全站营销', 
                            b6.trans_amount * (2 * c2.profit + 2 * c2.promotion_amount - 0.3 * c2.real_sale_amount) < 
                            b6.pay_amount * (1.85 * c2.real_sale_amount + c2.profit + c2.promotion_amount), 
                            b6.trans_amount * (c2.profit + c2.promotion_amount) < 
                            b6.pay_amount * (c2.real_sale_amount + 0.5 * c2.profit + 0.5 * c2.promotion_amount)), 
                        (IF(b5.promotion_name = '全站营销', 
                            b3.trans_amount * (2 * c1.profit + 2 * c1.promotion_amount - 0.3 * c1.real_sale_amount) < 
                            b3.pay_amount * (1.85 * c1.real_sale_amount + c1.profit + c1.promotion_amount), 
                            b3.trans_amount * (c1.profit + c1.promotion_amount) < 
                            b3.pay_amount * (c1.real_sale_amount + 0.5 * c1.profit + 0.5 * c1.promotion_amount)) 
                        AND d.product_stage IN ('稳', '控'))), 
                        IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), 
                            1.34 * b6.trans_amount * b8.sale_amount + b6.pay_amount * b8.cost_amount < 
                            2 * b8.sale_amount * b6.pay_amount + 0.67 * b6.pay_amount * b8.cost_amount + 0.67 * b6.trans_amount * b8.cost_amount, 
                            (1.34 * b3.trans_amount * b1.sale_amount + b3.pay_amount * b1.cost_amount < 
                            2 * b1.sale_amount * b3.pay_amount + 0.67 * b3.pay_amount * b1.cost_amount + 0.67 * b3.trans_amount * b1.cost_amount) 
                        AND d.product_stage IN ('稳', '控'))), 
                        IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), 
                            1.34 * b6.trans_amount * b8.sale_amount + b6.pay_amount * b8.cost_amount < 
                            2 * b8.sale_amount * b6.pay_amount + 0.67 * b6.pay_amount * b8.cost_amount + 0.67 * b6.trans_amount * b8.cost_amount, 
                            (1.34 * b3.trans_amount * b1.sale_amount + b3.pay_amount * b1.cost_amount < 
                            2 * b1.sale_amount * b3.pay_amount + 0.67 * b3.pay_amount * b1.cost_amount + 0.67 * b3.trans_amount * b1.cost_amount) 
                        AND d.product_stage IN ('稳', '控'))))
                AND (d.id IS NULL OR ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 != '滞销' OR d.userDef7 IS NULL) AND (d.link_attribute != '滞销' OR d.link_attribute IS NULL)))`
            break
        case 'invalid':
            subsql = `${subsql} AND d.is_price_comparison IS NOT NULL 
                AND (d.id IS NULL OR ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 != '滞销' OR d.userDef7 IS NULL) AND (d.link_attribute != '滞销' OR d.link_attribute IS NULL)))`
            break
        case 'important_link':
            subsql = `${subsql} AND ((d.userDef7 IN ('打仗', '爆款', '自定义') OR
                    (d.userDef1 IN ('打仗', '爆款', '自定义') OR (d.link_attribute IN ('打仗', '爆款', '自定义')))
                AND (d.id IS NULL OR ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 != '滞销' OR d.userDef7 IS NULL) AND (d.link_attribute != '滞销' OR d.link_attribute IS NULL)))`
            break
        case 'low_gross_profit':
            subsql = `${subsql} AND IF(pi.division_id = 1, b9.sale_amount - b9.cost_amount < b9.sale_amount * 0.45, 
                    IF(pi.division_id = 2, IF(d.platform = '自营', 
                        c4.sale_amount - c4.cost_amount < c4.sale_amount * 0.21, 
                            b9.sale_amount - b9.cost_amount < b9.sale_amount * 0.55), 
                        b9.sale_amount - b9.cost_amount < b9.sale_amount * 0.55)) 
                AND IF(s.onsale_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), d.product_stage IN ('稳', '控'), 1=1)
                AND (d.id IS NULL OR ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 != '滞销' OR d.userDef7 IS NULL) AND (d.link_attribute != '滞销' OR d.link_attribute IS NULL)))`
            break
        case 'unsalable_code':
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM jst_goods_sku s1 LEFT JOIN danpin.combination_product_code c ON c.\`组合商品编码\` = s1.sys_sku_id 
                    LEFT JOIN danpin.goods_info g ON g.\`商品编码\` = IFNULL(c.\`商品编码\`, s1.sys_sku_id) 
                    WHERE s.goods_id = a1.goods_id AND g.\`备注标签\` IN ('滞销', '销完下架'))`
            break
        case 'ip':
            subsql = `${subsql} AND d.is_ip = '是'`
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
    if (shopNames1 != null) {
        if (shopNames1.length == 0) return result
        subsql = `${subsql}
                AND s.shop_name NOT IN ("${shopNames1}") `
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
            ) s LEFT JOIN goods_sales_stats a1 ON a1.goods_id = s.goods_id 
                AND a1.date BETWEEN ? AND ? 
                AND a1.goods_id NOT IN ('', '【无法匹配到商品】')
            LEFT JOIN goods_sales_stats a2 ON a2.goods_id = a1.goods_id 
                AND a2.date = DATE_SUB(a1.date, INTERVAL 1 DAY) 
            LEFT JOIN goods_verifieds_stats a4 ON a1.goods_id = a4.goods_id 
                AND a4.date = DATE_SUB(a1.date, INTERVAL 1 DAY)
            JOIN shop_info si ON s.shop_name = si.shop_name
            JOIN project_info pi ON pi.id = si.project_id 
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(cost_amount), 0) AS cost_amount, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
            ) b1 ON b1.goods_id = s.goods_id
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit,
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
            ) b2 ON b2.goods_id = s.goods_id
            LEFT JOIN (SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, 
                    IFNULL(SUM(trans_amount), 0) AS trans_amount, promotion_name, goods_id 
                FROM goods_promotion_plan WHERE \`date\` BETWEEN ? AND ? 
                GROUP BY goods_id, promotion_name
            ) b3 ON b3.goods_id = s.goods_id 
            LEFT JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                    IFNULL(SUM(cost_amount), 0) AS cost_amount, 
                    IFNULL(SUM(sale_qty), 0) AS sale_qty, goods_id FROM goods_verifieds
                WHERE \`date\` BETWEEN ? AND ? GROUP BY goods_id
            ) b4 ON b4.goods_id = s.goods_id 
            LEFT JOIN (SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, 
                    IFNULL(SUM(trans_amount), 0) AS trans_amount, promotion_name, goods_id 
                FROM goods_promotion_plan WHERE \`date\` BETWEEN ? AND ? 
                GROUP BY goods_id, promotion_name
            ) b5 ON b5.goods_id = s.goods_id 
            LEFT JOIN (SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, 
                    IFNULL(SUM(trans_amount), 0) AS trans_amount, promotion_name, goods_id 
                FROM goods_promotion_plan WHERE \`date\` BETWEEN ? AND ? 
                GROUP BY goods_id, promotion_name
            ) b6 ON b6.goods_id = s.goods_id 
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(cost_amount), 0) AS cost_amount, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
            ) b7 ON b7.goods_id = s.goods_id
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(cost_amount), 0) AS cost_amount, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
            ) b8 ON b8.goods_id = s.goods_id
            LEFT JOIN (SELECT IFNULL(SUM(cost_amount), 0) AS cost_amount, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_verifieds WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
            ) b9 ON b9.goods_id = s.goods_id
            LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
                OR d.brief_name = s.goods_id 
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(real_sale_amount), 0) AS real_sale_amount, 
                    IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
            ) c1 ON c1.goods_id = s.goods_id
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(real_sale_amount), 0) AS real_sale_amount, 
                    IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
            ) c2 ON c2.goods_id = s.goods_id
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(real_sale_amount), 0) AS real_sale_amount, 
                    IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
            ) c3 ON c3.goods_id = s.goods_id
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(real_sale_amount), 0) AS real_sale_amount, 
                    IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(cost_amount), 0) AS cost_amount, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? GROUP BY goods_id
            ) c4 ON c4.goods_id = s.goods_id
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

goodsSaleInfoRepo.batchInsert = async (count, data) => {
    let sql = `INSERT INTO goods_sale_info(
            goods_id, 
            sku_id, 
            goods_code, 
            sku_code, 
            shop_name, 
            shop_id, 
            goods_name, 
            \`date\`, 
            sale_qty,
            sale_amount, 
            cost_amount, 
            gross_profit, 
            gross_profit_rate, 
            profit, 
            profit_rate, 
            promotion_amount, 
            express_fee,
            operation_amount,
            real_sale_qty,
            refund_qty,
            real_sale_amount,
            packing_fee,
            bill_amount,
            real_gross_profit,
            gross_standard,
            other_cost) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

goodsSaleInfoRepo.updateOrder = async ({
    date, goods_id, sku_code, shop_name, order_num, refund_num
}) => {
    let sql = `UPDATE goods_sale_info SET order_num = ?, refund_num = ? 
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

goodsSaleInfoRepo.deleteByDate = async (date, column, except,shop_name) => {
    let sql = `DELETE FROM goods_sale_info WHERE \`date\` = ? 
        AND ${column} IS NULL`
    if (except) sql = `${sql} AND shop_name = '${shop_name}'`
    else sql = `${sql} AND shop_name != '京东自营-厨具' AND shop_name != '京东自营-日用'`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

goodsSaleInfoRepo.getDataDetailByTime = async(column, goods_id, start, end) => {
    const sql = `SELECT IFNULL(SUM(${column}), 0) AS ${column}, \`date\` 
        FROM goods_sale_info WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id = ?
        GROUP BY \`date\``
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsSaleInfoRepo.getGrossStandardByTime = async( column,goods_id, start, end) => {
    let sql = `SELECT date
                    ,real_sale_amount
                    ,(CASE 
                    WHEN b.second_category in('水具', '酒杯/酒具','咖啡具','烹饪锅具','刀剪菜板','酒店用品','菜板/砧板') THEN real_sale_amount*0.28
                    WHEN b.second_category in('餐具', '茶具') THEN real_sale_amount*0.25
                    WHEN b.second_category in('厨房储物','烘焙用具','厨房置物架','一次性用品','厨房小工具') THEN real_sale_amount*0.26
                    END ) AS gross_standard
            FROM goods_sales AS a
            LEFT JOIN (
                SELECT DISTINCT brief_name,second_category 
                FROM dianshang_operation_attribute WHERE brief_name = ? and platform ='自营'
            ) AS b
            ON a.goods_id=b.brief_name
            WHERE goods_id = ? AND date BETWEEN ? AND ?
            ORDER BY date
            `
    if (column=='other_cost'){
        sql =`SELECT date
                    ,(CASE 
                    WHEN b.second_category in('水具', '酒杯/酒具','咖啡具','烹饪锅具','刀剪菜板','酒店用品','菜板/砧板') THEN real_sale_amount*0.28
                    WHEN b.second_category in('餐具', '茶具') THEN real_sale_amount*0.25
                    WHEN b.second_category in('厨房储物','烘焙用具','厨房置物架','一次性用品','厨房小工具') THEN real_sale_amount*0.26
                    END ) - real_gross_profit AS other_cost
            FROM goods_sales AS a
            LEFT JOIN (
                SELECT DISTINCT brief_name,second_category 
                FROM dianshang_operation_attribute WHERE brief_name = ? and platform ='自营'
            ) AS b
            ON a.goods_id=b.brief_name
            WHERE goods_id = ? AND date BETWEEN ? AND ?`
    } 
    const result = await query(sql, [goods_id,goods_id,start, end])
    return result || []
}
goodsSaleInfoRepo.getpromotionByTime = async( column,goods_id, start, end) => {
    let sql =``
    if(column == 'targeted_audience_promotion'){
        sql = `SELECT date,SUM(amount) AS targeted_audience_promotion from goods_promotion_info 
        WHERE date BETWEEN ? AND ? AND goods_id = ? AND promotion_name ='6003416精准人群推广' GROUP BY date`
    }else if(column == 'full_site_promotion'){
        sql = `SELECT date,SUM(amount) AS full_site_promotion from goods_promotion_info 
        WHERE date BETWEEN ? AND ? AND goods_id = ? AND promotion_name ='6003431万相台无界-全站推广' GROUP BY date`
    }else if(column == 'multi_objective_promotion'){
        sql = `SELECT date,SUM(amount) AS multi_objective_promotion from goods_promotion_info 
        WHERE date BETWEEN ? AND ? AND goods_id = ? AND promotion_name ='6003414多目标直投' GROUP BY date`
    }else if(column == 'keyword_promotion'){
        sql = `SELECT date,SUM(amount) AS keyword_promotion from goods_promotion_info 
        WHERE date BETWEEN ? AND ? AND goods_id = ? AND promotion_name ='60030412关键词推广' GROUP BY date`
    }else if(column == 'product_operation_promotion'){
        sql = `SELECT date,SUM(amount) AS product_operation_promotion from goods_promotion_info 
        WHERE date BETWEEN ? AND ? AND goods_id = ? AND promotion_name ='6003432万相台无界-货品运营' GROUP BY date`
    }else if(column == 'daily_promotion'){
        sql = `SELECT date,SUM(amount) AS daily_promotion from goods_promotion_info 
        WHERE date BETWEEN ? AND ? AND goods_id = ? AND promotion_name ='日常推广' GROUP BY date`
    }else if(column == 'scene_promotion'){
        sql = `SELECT date,SUM(amount) AS scene_promotion from goods_promotion_info 
        WHERE date BETWEEN ? AND ? AND goods_id = ? AND promotion_name ='场景推广' GROUP BY date`
    }else if(column == 'jd_express_promotion'){
        sql = `SELECT date,SUM(amount) AS jd_express_promotion from goods_promotion_info 
        WHERE date BETWEEN ? AND ? AND goods_id = ? AND promotion_name in ('京东快车1','京东快车2','京东快车3') GROUP BY date`
    }else if(column == 'total_promotion'){
        sql = `SELECT date,SUM(amount) AS total_promotion from goods_promotion_info 
        WHERE date BETWEEN ? AND ? AND goods_id = ? AND promotion_name in ('全站营销','新品全站营销') GROUP BY date`
    }
    const result = await query(sql,[start, end, goods_id])
    return result || []
}

goodsSaleInfoRepo.getpromotionroiByTime = async(column,goods_id, start, end) => {
    let name =null
    if(column == 'targeted_audience_promotion_roi'){
        name ='6003416精准人群推广'
    }else if(column == 'full_site_promotion_roi'){
        name ='6003431万相台无界-全站推广'
    }else if(column == 'multi_objective_promotion_roi'){
        name ='6003414多目标直投'
    }else if(column == 'keyword_promotion_roi'){
        name ='60030412关键词推广'
    }else if(column == 'product_operation_promotion_roi'){
        name ='6003432万相台无界-货品运营'
    }
    let sql =`SELECT a.date,ROUND(IFNULL(b.sale_amount,0)/a.amount,2) AS ${column} FROM (
        SELECT date,SUM(amount) AS amount FROM goods_promotion_info 
                WHERE date BETWEEN ? AND ? AND goods_id =? AND promotion_name ='${name}' GROUP BY date) AS a
        LEFT join (SELECT date,sale_amount FROM goods_sales  WHERE date BETWEEN ? AND ? AND goods_id =?) AS b
        ON a.date=b.date`
    const result = await query(sql,[start, end, goods_id,start, end, goods_id])
    return result || []
}
    
goodsSaleInfoRepo.gettarget = async (column,goods_id, start, end) =>{
    const sql=`SELECT CONCAT(ROUND(b.num/a.target*100,2),'%') AS ${column}  FROM (
        SELECT goods_id,(
        CASE 
            WHEN product_definition='三级:10万' THEN 100000
            WHEN product_definition='二级:30万' THEN 300000
            WHEN product_definition='一级:50万' THEN 500000
        END
        ) AS target
        FROM dianshang_operation_attribute WHERE goods_id= ?) AS a
        LEFT JOIN(
        SELECT goods_id AS id,SUM(sale_amount) AS num FROM goods_sale_info WHERE \`date\` BETWEEN ? AND ? AND  goods_id= ? )AS b
        ON a.goods_id = b.id`
    const result = await query(sql, [goods_id ,start, end, goods_id])
    return result || []
}
goodsSaleInfoRepo.getDataDetailTotalByTime = async(goods_id, start, end) => {
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
            FORMAT(IFNULL(a4.real_sale_qty,0),2) AS real_sale_qty,
            FORMAT(IFNULL(a4.real_sale_amount,0),2) AS real_sale_amount,
            FORMAT(IFNULL(a4.real_gross_profit,0),2) AS real_gross_profit,
            FORMAT(IFNULL(a6.gross_standard,0),2) AS gross_standard,
            FORMAT(IFNULL(a6.gross_standard,0)-IFNULL(a4.real_gross_profit,0),2) AS other_cost,
            FORMAT(IFNULL(a1.profit/a4.real_sale_amount*100,0),2) AS profit_rate_gmv,
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
        FROM goods_sales_stats a1 LEFT JOIN goods_verifieds_stats a2 ON a1.goods_id = a2.goods_id 
            AND a2.date = DATE_SUB(a1.date, INTERVAL 1 DAY) 
        LEFT JOIN(
            SELECT goods_id,date
                    ,SUM(real_sale_qty) as real_sale_qty
                    ,SUM(real_sale_amount) as real_sale_amount
                    ,SUM(real_gross_profit) as real_gross_profit
                    FROM goods_sales 
                    WHERE goods_id= ?
                    AND date BETWEEN '${start}' AND '${end}'
            GROUP BY goods_id, date
        )as a4 
        ON a1.goods_id = a4.goods_id AND a1.date = a4.date
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
        ) as a5
        ON a1.goods_id = a5.goods_id AND a1.date = a5.date
        LEFT JOIN(
                SELECT date
            ,(CASE 
            WHEN MAX(b.second_category) in('水具', '酒杯/酒具','咖啡具','烹饪锅具','刀剪菜板','酒店用品','菜板/砧板') THEN SUM(real_sale_amount)*0.28
            WHEN MAX(b.second_category) in('餐具', '茶具') THEN SUM(real_sale_amount)*0.25
            WHEN MAX(b.second_category) in('厨房储物','烘焙用具','厨房置物架','一次性用品','厨房小工具') THEN SUM(real_sale_amount)*0.26
            END ) AS gross_standard,goods_id
        FROM goods_sales AS a
        LEFT JOIN (
            SELECT DISTINCT brief_name,second_category 
            FROM dianshang_operation_attribute WHERE brief_name = ? and platform ='自营'
        ) AS b
        ON a.goods_id=b.brief_name
        WHERE goods_id = ? AND date BETWEEN ? AND ?
                    GROUP BY date,goods_id
        )as a6
        ON a1.goods_id = a6.goods_id AND a1.date = a6.date
        WHERE a1.date BETWEEN ? AND ? AND a1.goods_id = ?`
    const result = await query(sql, [goods_id,goods_id,start, end, goods_id ,goods_id,goods_id,start, end ,start, end, goods_id])
    return result || []
}

goodsSaleInfoRepo.getskuDetailTotalByTime = async(sku_id, start, end) => {
    const sql = `SELECT a1.sku_id
						,a1.sale_amount
						,a1.cost_amount
						,a1.real_sale_amount
						,a1.real_sale_qty
						,IFNULL(a1.operation_rate,0) AS operation_rate
						,a1.real_gross_profit
						,a1.promotion_amount
						,a1.gross_standard
						,a1.other_cost
                        ,a1.profit
                        ,a1.bill_name
                        ,a1.profit_rate
                        ,a1.profit_rate_gmv
						,a2.users_num
						,a2.trans_users_num
						,a2.real_pay_rate
						,a2.total_users_num
						,a2.total_trans_users_num
						,IFNULL(a4.jd_express_promotion,0) AS jd_express_promotion
						,IFNULL(a5.daily_promotion,0) AS daily_promotion
						,IFNULL(a6.scene_promotion,0) AS scene_promotion
						,IFNULL(a7.total_promotion,0) AS total_promotion
                        ,DATE_FORMAT(a1.date, '%Y-%m-%d') AS \`date\`
        FROM (
            SELECT sku_id
                    ,IFNULL(sale_amount,0) AS sale_amount
                    ,IFNULL(cost_amount,0) AS cost_amount
                    ,IFNULL(real_sale_amount,0) AS real_sale_amount
                    ,IFNULL(real_sale_qty,0) AS real_sale_qty
                    ,FORMAT(IFNULL(operation_amount,0)/IFNULL(sale_amount,0)*100,2) AS operation_rate
                    ,IFNULL(real_gross_profit,0) AS real_gross_profit
                    ,IFNULL(promotion_amount,0) AS promotion_amount
                    ,FORMAT(IFNULL(real_sale_amount,0) * 0.28,2) AS gross_standard
                    ,FORMAT(IFNULL(real_sale_amount,0) * 0.28 - IFNULL(real_gross_profit,0),2) AS other_cost
                    ,IFNULL(profit,0) AS profit
                    ,FORMAT(IFNULL(sale_amount*0.07,0),2) AS bill_name
                    ,FORMAT(IF(IFNULL(sale_amount,0) > 0, IFNULL(profit, 0) / sale_amount * 100,0) ,2) AS profit_rate
                    ,FORMAT(IF(IFNULL(real_sale_amount,0) > 0, IFNULL(profit, 0) / real_sale_amount * 100,0), 2) AS profit_rate_gmv
					,date
            FROM goods_sale_info
            WHERE date BETWEEN '${start}' AND '${end}' AND sku_id=?)AS a1
        LEFT JOIN (
                SELECT IFNULL(a1.users_num, 0) AS users_num,
                        IFNULL(a1.trans_users_num, 0) AS trans_users_num,
                        IF(IFNULL(a1.users_num, 0) > 0, FORMAT(
                        (IFNULL(a1.trans_users_num, 0) -
                        IFNULL(a2.brushing_qty, 0)) /
                        IFNULL(a1.users_num, 0) * 100, 2), 0) AS real_pay_rate,
                        IFNULL(a1.total_users_num, 0) AS total_users_num,
                        IFNULL(a1.total_trans_users_num, 0) AS total_trans_users_num,
                        a1.sku_id,
						a1.date
                FROM goods_composite_info a1
                LEFT JOIN goods_pay_info a2
                ON a1.sku_id = a2.sku_id AND a1.date = a2.date
                WHERE  a1.date BETWEEN '${start}' AND '${end}' AND a1.sku_id = ?) AS a2
        ON a1.sku_id= a2.sku_id AND a1.date = a2.date
        LEFT JOIN (
            select IFNULL(amount,0) AS jd_express_promotion,sku_id,date
            FROM goods_promotion_info
            WHERE sku_id=?
            AND date BETWEEN '${start}' AND '${end}'
            AND shop_name='京东自营-厨具'
            AND promotion_name in ('京东快车1','京东快车2','京东快车3')
        ) AS a4
        ON a1.sku_id=a4.sku_id AND a1.date = a4.date
        LEFT JOIN (
            select IFNULL(amount,0) AS daily_promotion,sku_id,date
            FROM goods_promotion_info
            WHERE sku_id=?
            AND date BETWEEN '${start}' AND '${end}'
            AND shop_name='京东自营-厨具'
            AND promotion_name ='日常推广'
        ) AS a5
        ON a1.sku_id=a5.sku_id AND a1.date = a5.date
        LEFT JOIN (
            select IFNULL(amount,0) AS scene_promotion,sku_id,date
            FROM goods_promotion_info
            WHERE sku_id=?
            AND date BETWEEN '${start}' AND '${end}'
            AND shop_name='京东自营-厨具'
            AND promotion_name ='场景推广'
        ) AS a6
        ON a1.sku_id=a6.sku_id AND a1.date = a6.date
        LEFT JOIN (
            select IFNULL(amount,0) AS total_promotion,sku_id,date
            FROM goods_promotion_info
            WHERE sku_id=?
            AND date BETWEEN '${start}' AND '${end}'
            AND shop_name='京东自营-厨具'
            AND promotion_name in ('全站营销','新品全站营销')
        ) AS a7
        ON a1.sku_id=a7.sku_id AND a1.date = a7.date`
    const result = await query(sql, [sku_id,sku_id,sku_id, sku_id, sku_id,sku_id])
    return result || []
}

goodsSaleInfoRepo.getDataRateByTime = async(col1, col2, column, goods_id, start, end, percent) => {
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

goodsSaleInfoRepo.getDataGrossProfitByTime = async(goods_id, start, end) => {
    const sql = `SELECT FORMAT(IF(SUM(o.sale_amount) > 0, 
                (1 - IFNULL(SUM(g.cost_amount), 0) / SUM(g.sale_amount)) * 100, 0), 2) 
            AS gross_profit, o.date
        FROM goods_verifieds_stats o WHERE o.date BETWEEN ? AND ? AND o.goods_id = ? 
        GROUP BY o.date`
    const result = await query(sql, [
        moment(start).subtract(1, 'day').format('YYYY-MM-DD'),
        moment(end).subtract(1, 'day').format('YYYY-MM-DD'),
        goods_id])
    return result || []
}

goodsSaleInfoRepo.getDataPromotionQOQByTime = async(goods_id, start, end) => {
    const sql = `SELECT FORMAT(IF(IFNULL(SUM(a2.promotion_amount), 0) > 0, 
                (IFNULL(SUM(a1.promotion_amount), 0) - SUM(a2.promotion_amount)) / 
                SUM(a2.promotion_amount), 0), 2) AS promotion_amount_qoq, 
            DATE_FORMAT(a1.date, '%Y-%m-%d') as \`date\` 
        FROM goods_sale_info a1 LEFT JOIN goods_sale_info a2 ON a1.goods_id = a2.goods_id
            AND a1.sku_code = a2.sku_code 
            AND a1.date = DATE_ADD(a2.date, INTERVAL 1 DAY)
        WHERE a1.date >= ? AND a1.date <= ? AND a1.goods_id = ?
        GROUP BY a1.date`
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsSaleInfoRepo.getDataGrossProfitDetailByTime = async(goods_id, start, end) => {
    const sql = `SELECT sku_id AS sku_code,gross_profit FROM(
            SELECT IFNULL(s.on_sku_code, o.sku_id) AS sku_id,FORMAT(IF(SUM(sale_amount) > 0, 
            1 - SUM(cost_amount) / SUM(sale_amount), 0) * 100, 2) AS gross_profit 
            FROM orders_goods_verifieds AS o 
            LEFT JOIN jst_goods_sku s ON o.goods_id = s.goods_id AND o.sku_id = s.sku_id 
            WHERE o.date BETWEEN ? AND ?
            AND o.goods_id = ?
            GROUP BY sku_id ) AS a`
    const result = await query(sql, [
        moment(start).subtract(1, 'day').format('YYYY-MM-DD'), 
        moment(end).subtract(1, 'day').format('YYYY-MM-DD'), 
        goods_id])
    return result || []
}

goodsSaleInfoRepo.updateFee = async(sku_id, promotion_amount, date,shop_name) => {
    const sql = `UPDATE goods_sale_info SET promotion_amount = promotion_amount + ?, 
        operation_amount = operation_amount + ?, profit = profit - ?, 
        profit_rate = IF(sale_amount>0, (profit - ?) / sale_amount, 0) WHERE sku_id = ?
            AND shop_name = '${shop_name}'
            AND \`date\` = ?`
    const result = await query(sql, [
        promotion_amount, 
        promotion_amount, 
        promotion_amount, 
        promotion_amount,
        sku_id.toString(),
        date
    ])

    const sql1 = `UPDATE goods_pay_info SET promotion_amount = promotion_amount + ?, 
        operation_amount = operation_amount + ?, profit = profit - ?
        WHERE sku_id = ? AND shop_name = '${shop_name}' AND \`date\` = ?`
    const result1 = await query(sql1, [
        promotion_amount, 
        promotion_amount, 
        promotion_amount, 
        sku_id.toString(),
        date
    ])
    return result1?.affectedRows ? true : false
}
goodsSaleInfoRepo.selectFee = async(sku_id, date, goods_id,shop_name,shop_id) => {
    const sql = `SELECT * FROM goods_sale_info WHERE shop_name=? AND sku_id=? AND \`date\`= ?`
    const result = await query(sql, [shop_name,sku_id, date])
    if (result.length==0){
        const sql=`INSERT INTO goods_sale_info(
            goods_id, 
            sku_id, 
            goods_code, 
            sku_code, 
            shop_name, 
            shop_id, 
            goods_name, 
            date, 
            sale_qty,
            sale_amount, 
            cost_amount, 
            gross_profit, 
            gross_profit_rate, 
            profit, 
            profit_rate, 
            promotion_amount, 
            express_fee,
            operation_amount,
            real_sale_qty,
            refund_qty,
            real_sale_amount,
            packing_fee,
            bill_amount,
            real_gross_profit)
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
        const insertResult = await query(sql, [goods_id,
            sku_id,null,null,shop_name,shop_id,null
            ,date,0,0,0,0,0,0,0,0,null,0,0,null,0,null,null,0])
    }
    return result
}

goodsSaleInfoRepo.getNewOnSaleInfo = async (sale_date, start, end, limit, offset) => {
    let result = {
        data: [],
        total: 0
    }
    let presql = `SELECT COUNT(1) AS count FROM (SELECT doa.goods_id, doa.onsale_date `
    const sql = `FROM dianshang_operation_attribute doa
        LEFT JOIN goods_sales gsi ON doa.goods_id = gsi.goods_id
        WHERE doa.onsale_date >= ? 
            AND gsi.date >= ? 
            AND gsi.date <= ? 
        GROUP BY doa.goods_id, doa.onsale_date`
    let search = `${presql}${sql}) aa`
    let rows = await query(search, [sale_date, start, end])
    if (rows?.length && rows[0].count) {
        result.total = rows[0].count
        presql = `SELECT IFNULL(SUM(gsi.sale_amount), 0) AS amount, doa.goods_id, doa.onsale_date, 
            IFNULL(SUM(gsi.sale_amount), 0) >= 30000 AS is_success `
        search = `${presql}${sql} ORDER BY doa.onsale_date DESC LIMIT ${offset}, ${limit}`
        rows = await query(search, [sale_date, start, end])
        if (rows?.length) result.data = rows
    }
    return result
}

goodsSaleInfoRepo.getOptimizeResult = async (goods_id, time, optimize) => {
    let sql = `SELECT COUNT(1) AS count FROM dianshang_operation_attribute a 
        WHERE a.goods_id = "${goods_id}"`, start, end
    for (let i = 0; i < optimize.length; i++) {
        if (!time) {
            end = moment().subtract(1, 'day').format('YYYY-MM-DD')
            if (optimize[i].column == 'profit_rate')
                start = moment().subtract(3, 'day').format('YYYY-MM-DD')
            else 
                start = moment().subtract(optimize[i].days, 'day').format('YYYY-MM-DD')
        } else {
            start = moment(time).add(1, 'day').format('YYYY-MM-DD')
            if (optimize[i].column == 'profit_rate')
                end = moment(time).add(3, 'day').format('YYYY-MM-DD')
            else end = moment(time).add(optimize[i].days, 'day').format('YYYY-MM-DD')
        }
        switch (optimize[i].column) {
            case 'profit_rate':
                sql = `${sql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a1.sale_amount), 0) AS sale_amount, 
                            IFNULL(SUM(a1.profit), 0) AS profit FROM goods_sales a1 
                        WHERE a1.goods_id = "${goods_id}" 
                            AND a1.date BETWEEN "${start}" AND "${end}") aa 
                    WHERE IF(sale_amount > 0, profit / sale_amount * 100`
                if (optimize[i].min != null && optimize[i].max != null) {
                    sql = `${sql} >= ${optimize[i].min} 
                            AND profit / sale_amount * 100 < ${optimize[i].max}`
                } else if (optimize[i].min != null) {
                    sql = `${sql} >= ${optimize[i].min}`
                } else if (optimize[i].max != null) {
                    sql = `${sql} < ${optimize[i].max}`
                }
                sql = `${sql}, 1))`
                if (optimize[i].start_sale) {
                    sql = `${sql} 
                        AND DATE_ADD(a.onsale_date, INTERVAL ${optimize[i].start_sale} DAY) < NOW()`
                }
                if (optimize[i].end_sale) {
                    sql = `${sql} 
                        AND DATE_ADD(a.onsale_date, INTERVAL ${optimize[i].end_sale} DAY) >= NOW()`
                }
                if (optimize[i].children?.length) {
                    for (let j = 0; j < optimize[i].children.length; j++) {
                        if (optimize[i].children[j].type == 3) {
                            let values = optimize[i].children[j].value.split(',')
                            for (let k = 0; k < values.length; k++) {
                                sql = `${sql}
                                    AND IF(a.${optimize[i].children[j].column} IS NOT NULL, a.${optimize[i].children[j].column} NOT LIKE '%${values[k]}%', 1=1)`
                            }
                        }
                    }
                }
                break
            case 'operation_rate':
                sql = `${sql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a1.sale_amount), 0) AS sale_amount, 
                            IFNULL(SUM(a1.operation_amount), 0) AS operation_amount 
                        FROM goods_sales a1 WHERE a1.goods_id = "${goods_id}" 
                            AND a1.date BETWEEN "${start}" AND "${end}") aa WHERE IF(sale_amount > 0, operation_amount / sale_amount * 100`
                if (optimize[i].min != null && optimize[i].max != null) {
                    sql = `${sql} >= ${optimize[i].min} 
                            AND operation_amount / sale_amount * 100 < ${optimize[i].max}`
                } else if (optimize[i].min != null) {
                    sql = `${sql} >= ${optimize[i].min}`
                } else if (optimize[i].max != null) {
                    sql = `${sql} < ${optimize[i].max}`
                }
                sql = `${sql}, 1))`
                if (optimize[i].children?.length) {
                    let start1 = moment(start).subtract(1, 'day').format('YYYY-MM-DD')
                    let end1 = moment(end).subtract(1, 'day').format('YYYY-MM-DD')
                    for (let j = 0; j < optimize[i].children.length; j++) {
                        if (optimize[i].children[j].type == 3) {
                            let values = optimize[i].children[j].value.split(',')
                            for (let k = 0; k < values.length; k++) {
                                sql = `${sql}
                                    AND NOT EXISTS(
                                        SELECT doa.goods_id FROM dianshang_operation_attribute doa 
                                        WHERE doa.goods_id = "${goods_id}" AND
                                            IF(doa.${optimize[i].children[j].column} IS NOT NULL, doa.${optimize[i].children[j].column} NOT LIKE '%${values[k]}%', 1=1))`
                            }              } else if (optimize[i].children[j].type == 1) {
                            sql = `${sql} AND EXISTS(
                                SELECT  * FROM (SELECT IFNULL(SUM(a3.sale_amount), 0) AS sale_amount, 
                                    IFNULL(SUM(a3.cost_amount), 0) AS cost_amount, 
                                    IFNULL(SUM(a3.express_fee), 0) AS express_fee, 
                                    IFNULL(SUM(a3.packing_fee), 0) AS packing_fee, 
                                    IFNULL(SUM(a3.rate), 0) AS labor_cost, 
                                    IFNULL(SUM(a2.bill), 0) AS bill, 
                                    IFNULL(SUM(a2.sale_amount), 0) AS amount, 
                                    a2.goods_id FROM goods_verifieds_stats a2, orders_goods_sales a3 
                                WHERE a2.goods_id = "${goods_id}" 
                                    AND a3.goods_id = "${goods_id}" 
                                    AND a2.date BETWEEN "${start1}" AND "${end1}"
                                    AND a3.date BETWEEN '${start}' AND '${end}') aa WHERE 
                                    goods_id IS NOT NULL AND 
                                    IF(sale_amount > 0, 
                                        (1 - (express_fee + packing_fee + labor_cost + cost_amount) / sale_amount - IF(amount > 0, bill / amount, 0)) * 100`
                            if (optimize[i].children[j].min != null && optimize[i].children[j].max != null) {
                                sql = `${sql} >= ${optimize[i].children[j].min} 
                                        AND (1 - (express_fee + packing_fee + labor_cost + cost_amount) / sale_amount - IF(amount > 0, bill / amount, 0)) * 100 < 
                                            ${optimize[i].children[j].max}`
                            } else if (optimize[i].children[j].min != null) {
                                sql = `${sql} >= ${optimize[i].children[j].min}`
                            } else if (optimize[i].children[j].max != null) {
                                sql = `${sql} < ${optimize[i].children[j].max}`
                            }
                            sql = `${sql}, 1))`
                        }
                    }
                }
                break
            case 'roi':
                sql = `${sql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a1.sale_amount), 0) AS sale_amount, 
                            IFNULL(SUM(a1.promotion_amount), 0) AS promotion_amount 
                        FROM goods_sales a1 WHERE a1.goods_id = "${goods_id}" 
                            AND a1.date BETWEEN "${start}" AND "${end}") aa WHERE 
                            IF(promotion_amount > 0, sale_amount / promotion_amount`
                if (optimize[i].min != null && optimize[i].max != null) {
                    sql = `${sql} >= ${optimize[i].min} 
                            AND sale_amount / promotion_amount < ${optimize[i].max}`
                } else if (optimize[i].min != null) {
                    sql = `${sql} >= ${optimize[i].min}`
                } else if (optimize[i].max != null) {
                    sql = `${sql} < ${optimize[i].max}`
                }
                sql = `${sql}, 0))`
                break
            case 'dsr':
                sql = `${sql} AND EXISTS(
                    SELECT * FROM (
                        SELECT SUM(a1.dsr) AS dsr, COUNT(1) AS count FROM goods_other_info a1 
                        WHERE a1.goods_id = "${goods_id}" AND a1.dsr > 0 
                            AND a1.date BETWEEN "${start}" AND "${end}") aa WHERE dsr / count`
                if (optimize[i].min != null && optimize[i].max != null) {
                    sql = `${sql} >= ${optimize[i].min} AND dsr / count < ${optimize[i].max}`
                } else if (optimize[i].min != null) {
                    sql = `${sql} >= ${optimize[i].min}`
                } else if (optimize[i].max != null) {
                    sql = `${sql} < ${optimize[i].max}`
                }
                sql = `${sql})`
                break
            case 'channel_roi':
                let start1 = moment(start).subtract(1, 'day').format('YYYY-MM-DD')
                let end1 = moment(end).subtract(1, 'day').format('YYYY-MM-DD')
                sql = `${sql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                            IFNULL(SUM(cost_amount), 0) AS cost_amount, 
                            IFNULL(SUM(express_fee), 0) AS express_fee, 
                            IFNULL(SUM(packing_fee), 0) AS packing_fee, 
                            IFNULL(SUM(rate), 0) AS labor_cost, goods_id 
                        FROM orders_goods_sales
                        WHERE \`date\` BETWEEN "${start}" AND "${end}" 
                            AND goods_id = '${goods_id}'
                    ) a2 LEFT JOIN (
                        SELECT IFNULL(SUM(bill), 0) AS bill, 
                            IFNULL(SUM(sale_amount), 0) AS amount, goods_id
                        FROM goods_verifieds_stats 
                        WHERE \`date\` BETWEEN "${start1}" AND "${end1}" 
                            AND goods_id = '${goods_id}'
                    ) a3 ON a2.goods_id = a3.goods_id 
                    JOIN tmall_promotion_info i ON i.goods_id = a2.goods_id
                        AND i.promotion_name = '${optimize[i]['value']}' 
                    WHERE a2.goods_id IS NOT NULL AND i.pay_time = '${end}' 
                        AND IF(a2.sale_amount > 0, 
                            a2.sale_amount > (a2.express_fee + a2.packing_fee + a2.labor_cost + a2.cost_amount + IF(a3.amount > 0, a3.bill / a3.amount, 0) * a2.sale_amount) * i.roi, 0))`
                break
            default:
        }
    }
    let result = await query(sql)
    return result|| []
}

goodsSaleInfoRepo.getJDskuInfoDetail = async(goods_id, start, end, stats) =>{
    let hasChild = start == end ? false : true
    sql = `SELECT a1.sku_id
			,a1.sale_amount
			,a1.cost_amount
			,a1.real_sale_amount
			,a1.real_sale_qty
			,IFNULL(a1.operation_rate,0) AS operation_rate
			,a1.real_gross_profit
			,a1.promotion_amount
			,a1.gross_standard
			,a1.other_cost
            ,a1.profit
            ,a1.bill_name
            ,a1.profit_rate
            ,a1.profit_rate_gmv
			,a2.users_num
			,a2.trans_users_num
			,a2.real_pay_rate
			,a2.total_users_num
			,a2.total_trans_users_num
			,a3.brief_name
			,a3.code
			,a3.operator
			,a3.userDef1
			,a3.onsale_date
			,a3.supply_price
			,a3.cost_price
			,IFNULL(a4.jd_express_promotion,0) AS jd_express_promotion
			,IFNULL(a5.daily_promotion,0) AS daily_promotion
			,IFNULL(a6.scene_promotion,0) AS scene_promotion
			,IFNULL(a7.total_promotion,0) AS total_promotion
            ,(CASE WHEN DATE_SUB(NOW(), INTERVAL 30 DAY) <= a3.onsale_date 
                                THEN '新品30' 
                            WHEN DATE_SUB(NOW(), INTERVAL 60 DAY) <= a3.onsale_date 
                                THEN '新品60' 
                            WHEN DATE_SUB(NOW(), INTERVAL 90 DAY) <= a3.onsale_date 
                                THEN '新品90' 
                            ELSE '老品' END) AS onsale_info
        FROM (
            SELECT sku_id
                    ,IFNULL(SUM(sale_amount),0) AS sale_amount
                    ,IFNULL(SUM(cost_amount),0) AS cost_amount
                    ,IFNULL(SUM(real_sale_amount),0) AS real_sale_amount
                    ,IFNULL(SUM(real_sale_qty),0) AS real_sale_qty
                    ,FORMAT(IFNULL(SUM(operation_amount),0)/IFNULL(SUM(sale_amount),0)*100,2) AS operation_rate
                    ,IFNULL(SUM(real_gross_profit),0) AS real_gross_profit
                    ,IFNULL(SUM(promotion_amount),0) AS promotion_amount
                    ,FORMAT(IFNULL(SUM(real_sale_amount),0) * 0.28,2) AS gross_standard
                    ,FORMAT(IFNULL(SUM(real_sale_amount),0) * 0.28 - IFNULL(SUM(real_gross_profit),0),2) AS other_cost
                    ,IFNULL(SUM(profit),0) AS profit
                    ,FORMAT(IFNULL(SUM(sale_amount)*0.07,0),2) AS bill_name
                    ,FORMAT(IF(IFNULL(SUM(sale_amount),0) > 0, IFNULL(SUM(profit), 0) / SUM(sale_amount) * 100,0) ,2) AS profit_rate
                    ,FORMAT(IF(IFNULL(SUM(real_sale_amount),0) > 0, IFNULL(SUM(profit), 0) / SUM(real_sale_amount) * 100,0), 2) AS profit_rate_gmv
            FROM goods_sale_info
            WHERE date BETWEEN '${start}' AND '${end}' AND goods_id=?
            GROUP BY sku_id)AS a1
        LEFT JOIN (
                SELECT IFNULL(SUM(a1.users_num), 0) AS users_num, 
                        IFNULL(SUM(a1.trans_users_num), 0) AS trans_users_num,
                        IF(IFNULL(SUM(a1.users_num), 0) > 0, FORMAT(
                        (IFNULL(SUM(a1.trans_users_num), 0) - 
                        IFNULL(SUM(a2.brushing_qty), 0)) / 
                        IFNULL(SUM(a1.users_num), 0) * 100, 2), 0) AS real_pay_rate,
                        IFNULL(SUM(a1.total_users_num), 0) AS total_users_num, 
                        IFNULL(SUM(a1.total_trans_users_num), 0) AS total_trans_users_num,
                        a1.sku_id
                FROM goods_composite_info a1 
                LEFT JOIN goods_pay_info a2 
                ON a1.goods_id = a2.goods_id AND a1.date = a2.date 
                WHERE  a1.date BETWEEN '${start}' AND '${end}' AND a1.goods_id = ?
                GROUP BY a1.sku_id) AS a2
        ON a1.sku_id= a2.sku_id
        LEFT JOIN dianshang_operation_attribute AS a3
        ON a1.sku_id= a3.sku_id
        LEFT JOIN (
            select IFNULL(SUM(amount),0) AS jd_express_promotion,sku_id
            FROM goods_promotion_info 
            WHERE goods_id=? 
            AND date BETWEEN '${start}' AND '${end}' 
            AND shop_name='京东自营-厨具' 
            AND promotion_name in ('京东快车1','京东快车2','京东快车3')
            GROUP BY sku_id
        ) AS a4
        ON a1.sku_id=a4.sku_id
        LEFT JOIN (
            select IFNULL(SUM(amount),0) AS daily_promotion,sku_id
            FROM goods_promotion_info 
            WHERE goods_id=? 
            AND date BETWEEN '${start}' AND '${end}' 
            AND shop_name='京东自营-厨具' 
            AND promotion_name ='日常推广'
            GROUP BY sku_id
        ) AS a5
        ON a1.sku_id=a5.sku_id
        LEFT JOIN (
            select IFNULL(SUM(amount),0) AS scene_promotion,sku_id
            FROM goods_promotion_info 
            WHERE goods_id=? 
            AND date BETWEEN '${start}' AND '${end}' 
            AND shop_name='京东自营-厨具' 
            AND promotion_name ='场景推广'
            GROUP BY sku_id
        ) AS a6
        ON a1.sku_id=a6.sku_id
        LEFT JOIN (
            select IFNULL(SUM(amount),0) AS total_promotion,sku_id
            FROM goods_promotion_info 
            WHERE goods_id=? 
            AND date BETWEEN '${start}' AND '${end}' 
            AND shop_name='京东自营-厨具' 
            AND promotion_name in ('全站营销','新品全站营销')
            GROUP BY sku_id
        ) AS a7
        ON a1.sku_id=a7.sku_id`
    let row = await query(sql,[goods_id,goods_id,goods_id,goods_id,goods_id,goods_id])
    for (let i=0;i<row.length;i++){
        row[i].hasChild=hasChild
        row[i].id = row[i].sku_id
    }
    return row
    
}

goodsSaleInfoRepo.getweeklyreport = async(lstart, lend,preStart,preEnd,goodsinfo) =>{
    let sql =`with t1 as(
            SELECT * FROM (
            SELECT '上周' AS date
                ,a.operator
                ,COUNT(a.goods_id) AS goods
                ,SUM(a.sale_amount) AS sale_amount
                ,SUM(a.profit) AS profit
                ,ROUND(SUM(a.profit)/SUM(a.sale_amount)*100,2) AS profit_rate
                ,SUM(a.promotion_amount) AS promotion_amount
                ,ROUND(SUM(a.promotion_amount)/SUM(a.sale_amount)*100,2) AS promotion_rate
                ,SUM(a.bill_amount) AS bill_amount
                ,SUM(a.order_num) AS order_num
                ,SUM(a.refund_num) AS refund_num
                ,ROUND(SUM(a.refund_num)/SUM(a.order_num)*100,2) AS refund_rate
                ,SUM(a.p) AS express
                ,SUM(a1.verified_amount) AS verified_amount
                ,SUM(a1.verified_profit) AS verified_profit
                ,ROUND(SUM(a1.verified_profit)/SUM(a1.verified_amount)*100,2) AS verified_profit_rate
                ,SUM(a2.after_sales_compensation) AS after_sales_compensation
                ,ROUND(AVG(dsr),2) AS dsr
                ,IFNULL(SUM(a4.xhs_shuadan),0) AS xhs_shuadan
                ,IFNULL(SUM(a5.erlei_shuadan),0) AS erlei_shuadan
                ,(IFNULL(SUM(a.bill_amount),0)+IFNULL(SUM(a.promotion_amount),0)+IFNULL(SUM(a2.after_sales_compensation),0)+IFNULL(SUM(a4.xhs_shuadan),0)+IFNULL(SUM(a5.erlei_shuadan),0)) AS bill
                ,ROUND((IFNULL(SUM(a.bill_amount),0)+IFNULL(SUM(a.promotion_amount),0)+IFNULL(SUM(a2.after_sales_compensation),0)+IFNULL(SUM(a4.xhs_shuadan),0)+IFNULL(SUM(a5.erlei_shuadan),0))/SUM(a.sale_amount)*100,2) AS bill_rate
            FROM (
            SELECT IFNULL(d.operator,'无操作') AS operator,s.* FROM (
            SELECT s.goods_id,SUM(s.sale_amount) AS sale_amount
                ,SUM(s.profit) AS profit
                ,SUM(s.promotion_amount) AS promotion_amount
                ,SUM(s.bill_amount) AS bill_amount
                ,SUM(s.order_num) AS order_num
                ,SUM(s.refund_num) AS refund_num
                ,SUM(s.packing_fee)+SUM(s.express_fee) AS p
            FROM goods_sales s
            WHERE s.shop_name='pakchoice旗舰店（天猫）' AND s.date BETWEEN '${lstart}' AND '${lend}'
            GROUP BY s.goods_id
            )AS s

            LEFT JOIN (SELECT * FROM dianshang_operation_attribute)as d
            ON s.goods_id=d.goods_id
            ) AS a
            LEFT JOIN (
            SELECT goods_id
                ,SUM(sale_amount) AS verified_amount
                ,SUM(profit) AS verified_profit
            FROM goods_verifieds
            WHERE shop_name='pakchoice旗舰店（天猫）' AND date BETWEEN '${lstart}' AND '${lend}'
            GROUP BY goods_id
            ) AS a1
            ON a.goods_id=a1.goods_id
            LEFT JOIN (
                SELECT goods_id,SUM(amount) AS after_sales_compensation FROM goods_bill_info
                WHERE bill_name='600901小额打款' AND shop_name='pakchoice旗舰店（天猫）' AND date BETWEEN '${lstart}' AND '${lend}'
                GROUP BY goods_id
            ) AS a2
            ON a.goods_id=a2.goods_id
            LEFT JOIN (
                SELECT goods_id,ROUND(avg(dsr),2) AS dsr
                FROM goods_other_info
                WHERE date BETWEEN '${lstart}' AND '${lend}'
                GROUP BY goods_id
            ) AS a3
            ON a.goods_id=a3.goods_id
            LEFT JOIN(
                SELECT goods_id,IFNULL(SUM(cost_amount),0) +IFNULL(SUM(express_fee),0)+IFNULL(SUM(packing_fee),0)+IFNULL(SUM(bill_amount),0) AS 'xhs_shuadan'
                FROM orders_goods_sales
                WHERE order_code in (SELECT order_code FROM click_farming WHERE date BETWEEN '${lstart}' AND '${lend}' AND name='小红书返款')
                GROUP BY goods_id
            ) AS a4
            ON a.goods_id=a4.goods_id
            LEFT JOIN (
                SELECT t.goods_id,IFNULL(t1.er+t.commission,0) AS erlei_shuadan FROM (
                    SELECT goods_id,SUM(commission) AS commission
                    FROM click_farming
                    WHERE shop_id=15545775 AND name ='二类' AND date BETWEEN '${lstart}' AND '${lend}'
                    GROUP BY goods_id) AS t
                    LEFT JOIN (
                    SELECT goods_id,IFNULL(SUM(express_fee),0)+IFNULL(SUM(packing_fee),0)+IFNULL(SUM(bill_amount),0) AS er
                    FROM orders_goods_sales
                    WHERE order_code in (SELECT order_code FROM click_farming WHERE shop_id=15545775 AND name ='二类' AND date BETWEEN '${lstart}' AND '${lend}')
                    GROUP BY goods_id
                    )AS t1
                    ON t.goods_id=t1.goods_id
            )AS a5
            ON a.goods_id=a5.goods_id
            GROUP BY operator) AS a
            UNION ALL
            SELECT * FROM (
            SELECT '上上周' AS date
                ,a.operator
                ,COUNT(a.goods_id) AS goods
                ,SUM(a.sale_amount) AS sale_amount
                ,SUM(a.profit) AS profit
                ,ROUND(SUM(a.profit)/SUM(a.sale_amount)*100,2) AS profit_rate
                ,SUM(a.promotion_amount) AS promotion_amount
                ,ROUND(SUM(a.promotion_amount)/SUM(a.sale_amount)*100,2) AS promotion_rate
                ,SUM(a.bill_amount) AS bill_amount
                ,SUM(a.order_num) AS order_num
                ,SUM(a.refund_num) AS refund_num
                ,ROUND(SUM(a.refund_num)/SUM(a.order_num)*100,2) AS refund_rate
                ,SUM(a.p) AS express
                ,SUM(a1.verified_amount) AS verified_amount
                ,SUM(a1.verified_profit) AS verified_profit
                ,ROUND(SUM(a1.verified_profit)/SUM(a1.verified_amount)*100,2) AS verified_profit_rate
                ,SUM(a2.after_sales_compensation) AS after_sales_compensation
                ,ROUND(AVG(dsr),2) AS dsr
                ,IFNULL(SUM(a4.xhs_shuadan),0) AS xhs_shuadan
                ,IFNULL(SUM(a5.erlei_shuadan),0) AS erlei_shuadan
                ,(IFNULL(SUM(a.bill_amount),0)+IFNULL(SUM(a.promotion_amount),0)+IFNULL(SUM(a2.after_sales_compensation),0)+IFNULL(SUM(a4.xhs_shuadan),0)+IFNULL(SUM(a5.erlei_shuadan),0)) AS bill
                ,ROUND((IFNULL(SUM(a.bill_amount),0)+IFNULL(SUM(a.promotion_amount),0)+IFNULL(SUM(a2.after_sales_compensation),0)+IFNULL(SUM(a4.xhs_shuadan),0)+IFNULL(SUM(a5.erlei_shuadan),0))/SUM(a.sale_amount)*100,2) AS bill_rate
            FROM (
            SELECT IFNULL(d.operator,'无操作') AS operator,s.* FROM (
            SELECT s.goods_id,SUM(s.sale_amount) AS sale_amount
                ,SUM(s.profit) AS profit
                ,SUM(s.promotion_amount) AS promotion_amount
                ,SUM(s.bill_amount) AS bill_amount
                ,SUM(s.order_num) AS order_num
                ,SUM(s.refund_num) AS refund_num
                ,SUM(s.packing_fee)+SUM(s.express_fee) AS p
            FROM goods_sales s
            WHERE s.shop_name='pakchoice旗舰店（天猫）' AND s.date BETWEEN '${preStart}' AND '${preEnd}' 
            GROUP BY s.goods_id)as s
            LEFT JOIN (SELECT * FROM dianshang_operation_attribute)AS d
            ON s.goods_id=d.goods_id) AS a
            LEFT JOIN (
            SELECT goods_id
                ,SUM(sale_amount) AS verified_amount
                ,SUM(profit) AS verified_profit
            FROM goods_verifieds
            WHERE shop_name='pakchoice旗舰店（天猫）' AND date BETWEEN '${preStart}' AND '${preEnd}' 
            GROUP BY goods_id) AS a1
            ON a.goods_id=a1.goods_id
            LEFT JOIN (
                SELECT goods_id,SUM(amount) AS after_sales_compensation FROM goods_bill_info
                WHERE bill_name='6008小额打款' AND shop_name='pakchoice旗舰店（天猫）' AND date BETWEEN '${preStart}' AND '${preEnd}' 
                GROUP BY goods_id) AS a2
            ON a.goods_id=a2.goods_id
            LEFT JOIN (
                SELECT goods_id,ROUND(avg(dsr),2) AS dsr
                FROM goods_other_info
                WHERE date BETWEEN '${preStart}' AND '${preEnd}' 
                GROUP BY goods_id) AS a3
            ON a.goods_id=a3.goods_id
            LEFT JOIN(
                SELECT goods_id,SUM(cost_amount) +SUM(express_fee)+SUM(packing_fee)+SUM(bill_amount) AS 'xhs_shuadan'
                FROM orders_goods_sales
                WHERE order_code in (SELECT order_code FROM click_farming WHERE date BETWEEN '${preStart}' AND '${preEnd}'    AND name='小红书返款')
                GROUP BY goods_id) AS a4
            ON a.goods_id=a4.goods_id
            LEFT JOIN (
                SELECT t.goods_id,t1.er+t.commission AS erlei_shuadan FROM (
                    SELECT goods_id,SUM(commission) AS commission
                    FROM click_farming
                    WHERE shop_id=15545775 AND name ='二类' AND date BETWEEN '${preStart}' AND '${preEnd}' 
                    GROUP BY goods_id) as t
                    LEFT JOIN (
                    SELECT goods_id,SUM(express_fee)+SUM(packing_fee)+SUM(bill_amount) AS er
                    FROM orders_goods_sales
                    WHERE order_code in (SELECT order_code FROM click_farming WHERE shop_id=15545775 AND name ='二类' AND date BETWEEN '${preStart}' AND '${preEnd}'  )
                    GROUP BY goods_id
                    )AS t1
                ON t.goods_id=t1.goods_id)AS a5
            ON a.goods_id=a5.goods_id
            GROUP BY operator) AS b),t2 AS(
					SELECT a.team_name AS team_name,u1.nickname AS line_director,u.nickname AS operator FROM (
                    SELECT t1.team_name,t1.user_id,t2.user_id AS member_id FROM team_info AS t1
                    LEFT JOIN team_member AS t2
                    ON t2.team_id=t1.id
                    WHERE t1.project_id=14
                )AS a
                LEFT JOIN users AS u 
                ON a.member_id=u.user_id
                LEFT JOIN users AS u1
                ON a.user_id=u1.user_id)
			SELECT a.* ,ROUND(IFNULL(d.group_effectiveness,a.sale_amount),2) AS group_effectiveness FROM (		
            SELECT IFNULL(b.line_director,'无操作') AS line_director ,IFNULL(b.team_name,'无操作') AS team_name,t1.*
            ,c.total_sale_amount,ROUND(t1.sale_amount/c.total_sale_amount*100,2) AS team_saleamount_rate FROM t1
            LEFT JOIN (
                SELECT * FROM t2)AS b
            ON t1.operator=b.operator
						LEFT JOIN(SELECT date
                ,SUM(sale_amount) AS total_sale_amount
            FROM t1
            GROUP BY date)AS c
                ON t1.date = c.date
                )AS a
                LEFT JOIN (
                SELECT t1.date,u.team_name,round(SUM(t1.sale_amount)/COUNT(u.operator),2) as group_effectiveness FROM t1 
                LEFT JOIN (SELECT * FROM t2)AS u
                ON t1.operator = u.operator
                GROUP BY u.team_name,t1.date
                ) AS d
                ON a.team_name=d.team_name AND a.date=d.date
            UNION ALL
            SELECT '总计' AS line_director
                ,'总计' AS team_name
                ,date
                ,'总计' AS operator
                ,SUM(goods) as goods
                ,SUM(sale_amount) AS sale_amount
                ,SUM(profit) AS profit
                ,ROUND(SUM(profit)/SUM(sale_amount)*100,2) AS profit_rate
                ,SUM(promotion_amount) AS promotion_amount
                ,ROUND(SUM(promotion_amount)/SUM(sale_amount)*100,2) AS promotion_rate
                ,SUM(bill_amount) AS bill_amount
                ,SUM(order_num) AS order_num
                ,SUM(refund_num) AS refund_num
                ,ROUND(SUM(refund_num)/SUM(order_num),2) AS refund_rate
                ,SUM(express) AS express
                ,SUM(verified_amount) AS verified_amount
                ,SUM(verified_profit) AS verified_profit
                ,ROUND(SUM(verified_profit)/SUM(verified_amount)*100,2) AS verified_profit_rate
                ,SUM(after_sales_compensation) AS after_sales_compensation
                ,ROUND(AVG(dsr),2) AS dsr
                ,SUM(xhs_shuadan) AS xhs_shuadan
                ,SUM(erlei_shuadan) AS erlei_shuadan
                ,IFNULL(SUM(bill),0) AS bill
                ,ROUND(IFNULL(SUM(bill),0)/SUM(sale_amount)*100,2) AS bill_rate
                ,SUM(sale_amount) AS total_sale_amount
                ,ROUND(SUM(sale_amount)/SUM(sale_amount)*100,2) AS team_saleamount_rate
                ,ROUND(SUM(sale_amount)/COUNT(operator),2) AS group_effectiveness
            FROM t1
            GROUP BY date`
    let result = await query(sql)
    return result
}
goodsSaleInfoRepo.getinfoweeklyreport = async(lstart, lend,preStart,preEnd,goodsinfo) =>{
    let sql = `WITH t1 AS (  SELECT * FROM (
        SELECT '上周' AS date
            ,a.operator
            ,count(a.goods_id) AS goods
            ,SUM(a.sale_amount) AS sale_amount
            ,SUM(a.profit) AS profit
            ,ROUND(SUM(a.profit)/SUM(a.sale_amount)*100,2) AS profit_rate
            ,SUM(a.promotion_amount) AS promotion_amount
            ,ROUND(SUM(a.promotion_amount)/SUM(a.sale_amount)*100,2) AS promotion_rate
            ,SUM(a.bill_amount) AS bill_amount
            ,SUM(a.order_num) AS order_num
            ,SUM(a.refund_num) AS refund_num
            ,ROUND(SUM(a.refund_num)/SUM(a.order_num)*100,2) AS refund_rate
            ,SUM(a.p) AS express
            ,SUM(a1.verified_amount) AS verified_amount
            ,SUM(a1.verified_profit) AS verified_profit
            ,ROUND(SUM(a1.verified_profit)/SUM(a1.verified_amount)*100,2) AS verified_profit_rate
            ,SUM(a2.after_sales_compensation) AS after_sales_compensation
            ,ROUND(AVG(dsr),2) AS dsr
            ,IFNULL(SUM(a4.xhs_shuadan),0) AS xhs_shuadan
            ,IFNULL(SUM(a5.erlei_shuadan),0) AS erlei_shuadan
            ,(IFNULL(SUM(a.bill_amount),0)+IFNULL(SUM(a.promotion_amount),0)+IFNULL(SUM(a2.after_sales_compensation),0)+IFNULL(SUM(a4.xhs_shuadan),0)+IFNULL(SUM(a5.erlei_shuadan),0)) AS bill
            ,ROUND((IFNULL(SUM(a.bill_amount),0)+IFNULL(SUM(a.promotion_amount),0)+IFNULL(SUM(a2.after_sales_compensation),0)+IFNULL(SUM(a4.xhs_shuadan),0)+IFNULL(SUM(a5.erlei_shuadan),0))/SUM(a.sale_amount)*100,2) AS bill_rate
            ,a.goodsinfo
        FROM (
        SELECT IFNULL(d.operator,'无操作') AS operator,s.*,IF(DATE_SUB('${lend}', INTERVAL 60 DAY) <= d.onsale_date,'新品','老品')  AS goodsinfo FROM (
        SELECT s.goods_id,SUM(s.sale_amount) AS sale_amount
            ,SUM(s.profit) AS profit
            ,SUM(s.promotion_amount) AS promotion_amount
            ,SUM(s.bill_amount) AS bill_amount
            ,SUM(s.order_num) AS order_num
            ,SUM(s.refund_num) AS refund_num
            ,SUM(s.packing_fee)+SUM(s.express_fee) AS p
        FROM goods_sales s
        WHERE s.shop_name='pakchoice旗舰店（天猫）' AND s.date BETWEEN '${lstart}' AND '${lend}'
        GROUP BY s.goods_id)AS s
        LEFT JOIN (SELECT * FROM dianshang_operation_attribute)AS d
        ON s.goods_id=d.goods_id) AS a
        LEFT JOIN (
        SELECT goods_id
            ,SUM(sale_amount) AS verified_amount
            ,SUM(profit) AS verified_profit
        FROM goods_verifieds
        WHERE shop_name='pakchoice旗舰店（天猫）' AND date BETWEEN '${lstart}' AND '${lend}'
        GROUP BY goods_id) AS a1
        ON a.goods_id=a1.goods_id
        LEFT JOIN (
            SELECT goods_id,sum(amount) AS after_sales_compensation FROM goods_bill_info
            WHERE bill_name='600901小额打款' AND shop_name='pakchoice旗舰店（天猫）' AND date BETWEEN '${lstart}' AND '${lend}'
            GROUP BY goods_id) AS a2
        ON a.goods_id=a2.goods_id
        LEFT JOIN (
            SELECT goods_id,ROUND(avg(dsr),2) AS dsr
                FROM goods_other_info
                WHERE date BETWEEN '${lstart}' AND '${lend}'
                GROUP BY goods_id
        ) AS a3
        ON a.goods_id=a3.goods_id
        LEFT JOIN(
            SELECT goods_id,IFNULL(SUM(cost_amount),0) +IFNULL(SUM(express_fee),0)+IFNULL(SUM(packing_fee),0)+IFNULL(SUM(bill_amount),0) AS 'xhs_shuadan'
            FROM orders_goods_sales
            WHERE order_code IN (SELECT order_code FROM click_farming WHERE date BETWEEN '${lstart}' AND '${lend}'  AND name='小红书返款')
            GROUP BY goods_id) AS a4
        ON a.goods_id=a4.goods_id
        LEFT JOIN (
            SELECT t.goods_id,IFNULL(t1.er+t.commission,0) AS erlei_shuadan FROM (
                SELECT goods_id,sum(commission) AS commission
                FROM click_farming
                WHERE shop_id=15545775 AND name ='二类' AND date BETWEEN '${lstart}' AND '${lend}'
                GROUP BY goods_id) AS t
                LEFT JOIN (
                SELECT goods_id,IFNULL(SUM(express_fee),0)+IFNULL(SUM(packing_fee),0)+IFNULL(SUM(bill_amount),0) AS er
                FROM orders_goods_sales
                WHERE order_code in (SELECT order_code FROM click_farming WHERE shop_id=15545775 AND name ='二类' AND date BETWEEN '${lstart}' AND '${lend}' )
                GROUP BY goods_id
                )AS t1
            ON t.goods_id=t1.goods_id)AS a5
        ON a.goods_id=a5.goods_id
        GROUP BY operator,goodsinfo) AS a
        UNION ALL
        SELECT * FROM (
        SELECT '上上周' AS date
            ,a.operator
            ,count(a.goods_id) AS goods
            ,SUM(a.sale_amount) AS sale_amount
            ,SUM(a.profit) AS profit
            ,ROUND(SUM(a.profit)/SUM(a.sale_amount)*100,2) AS profit_rate
            ,SUM(a.promotion_amount) AS promotion_amount
            ,ROUND(SUM(a.promotion_amount)/SUM(a.sale_amount)*100,2) AS promotion_rate
            ,SUM(a.bill_amount) AS bill_amount
            ,SUM(a.order_num) AS order_num
            ,SUM(a.refund_num) AS refund_num
            ,ROUND(SUM(a.refund_num)/SUM(a.order_num)*100,2) AS refund_rate
            ,SUM(a.p) AS express
            ,SUM(a1.verified_amount) AS verified_amount
            ,SUM(a1.verified_profit) AS verified_profit
            ,ROUND(SUM(a1.verified_profit)/SUM(a1.verified_amount)*100,2) AS verified_profit_rate
            ,SUM(a2.after_sales_compensation) AS after_sales_compensation
            ,ROUND(AVG(dsr),2) AS dsr
            ,IFNULL(SUM(a4.xhs_shuadan),0) AS xhs_shuadan
            ,IFNULL(SUM(a5.erlei_shuadan),0) AS erlei_shuadan
            ,(IFNULL(SUM(a.bill_amount),0)+IFNULL(SUM(a.promotion_amount),0)+IFNULL(SUM(a2.after_sales_compensation),0)+IFNULL(SUM(a4.xhs_shuadan),0)+IFNULL(SUM(a5.erlei_shuadan),0)) AS bill
            ,ROUND((IFNULL(SUM(a.bill_amount),0)+IFNULL(SUM(a.promotion_amount),0)+IFNULL(SUM(a2.after_sales_compensation),0)+IFNULL(SUM(a4.xhs_shuadan),0)+IFNULL(SUM(a5.erlei_shuadan),0))/SUM(a.sale_amount)*100,2) AS bill_rate
            ,a.goodsinfo
        FROM (
        SELECT IFNULL(d.operator,'无操作') AS operator,s.*,IF(DATE_SUB('${preEnd}', INTERVAL 60 DAY) <= d.onsale_date,'新品','老品')  AS goodsinfo FROM (
        SELECT s.goods_id,SUM(s.sale_amount) AS sale_amount
            ,SUM(s.profit) AS profit
            ,SUM(s.promotion_amount) AS promotion_amount
            ,sum(s.bill_amount) AS bill_amount
            ,sum(s.order_num) AS order_num
            ,sum(s.refund_num) AS refund_num
            ,sum(s.packing_fee)+sum(s.express_fee) AS p
        FROM goods_sales s
        WHERE s.shop_name='pakchoice旗舰店（天猫）' AND s.date BETWEEN '${preStart}' AND '${preEnd}'
        GROUP BY s.goods_id)AS s
        LEFT JOIN (SELECT * FROM dianshang_operation_attribute)AS d
        ON s.goods_id=d.goods_id) AS a
        LEFT JOIN (
        SELECT goods_id
            ,sum(sale_amount) AS verified_amount
            ,SUM(profit) AS verified_profit
        FROM goods_verifieds
        WHERE shop_name='pakchoice旗舰店（天猫）' AND date BETWEEN '${preStart}' AND '${preEnd}'
        GROUP BY goods_id) AS a1
        ON a.goods_id=a1.goods_id
        LEFT JOIN (
            SELECT goods_id,sum(amount) AS after_sales_compensation FROM goods_bill_info
            WHERE bill_name='600901小额打款' AND shop_name='pakchoice旗舰店（天猫）' AND date BETWEEN '${preStart}' AND '${preEnd}'
            GROUP BY goods_id) AS a2
        ON a.goods_id=a2.goods_id
        LEFT JOIN (
            SELECT goods_id,ROUND(avg(dsr),2) AS dsr
                FROM goods_other_info
                WHERE date BETWEEN '${preStart}' AND '${preEnd}'
                GROUP BY goods_id) AS a3
        ON a.goods_id=a3.goods_id
        LEFT JOIN(
            SELECT goods_id,IFNULL(SUM(cost_amount),0) +IFNULL(SUM(express_fee),0)+IFNULL(SUM(packing_fee),0)+IFNULL(SUM(bill_amount),0) AS 'xhs_shuadan'
                FROM orders_goods_sales
                WHERE order_code in (SELECT order_code FROM click_farming WHERE date BETWEEN '${preStart}' AND '${preEnd}' AND name='小红书返款')
                GROUP BY goods_id) AS a4
        ON a.goods_id=a4.goods_id
        LEFT JOIN (
        SELECT t.goods_id,IFNULL(t1.er+t.commission,0) AS erlei_shuadan FROM (
            SELECT goods_id,SUM(commission) AS commission
            FROM click_farming
            WHERE shop_id=15545775 AND name ='二类' AND date BETWEEN '${preStart}' AND '${preEnd}'
            GROUP BY goods_id) AS t
            LEFT JOIN (
            SELECT goods_id,IFNULL(SUM(express_fee),0)+IFNULL(SUM(packing_fee),0)+IFNULL(SUM(bill_amount),0) AS er
            FROM orders_goods_sales
            WHERE order_code in (SELECT order_code FROM click_farming WHERE shop_id=15545775 AND name ='二类' AND date BETWEEN '${preStart}' AND '${preEnd}')
            GROUP BY goods_id)AS t1
            ON t.goods_id=t1.goods_id)AS a5
        ON a.goods_id=a5.goods_id
        GROUP BY operator,goodsinfo) AS b),t2 AS(
            SELECT a.team_name AS team_name,u1.nickname AS line_director,u.nickname AS operator FROM (
                SELECT t1.team_name,t1.user_id,t2.user_id AS member_id FROM team_info AS t1
                LEFT JOIN team_member AS t2
                ON t2.team_id=t1.id
                WHERE t1.project_id=14
            )AS a
            LEFT JOIN users AS u 
            ON a.member_id=u.user_id
            LEFT JOIN users AS u1
            ON a.user_id=u1.user_id
            )
		SELECT a.*,ROUND(IFNULL(d.group_effectiveness,a.sale_amount),2) AS group_effectiveness FROM (
            SELECT IFNULL(b.line_director,'无操作') AS line_director ,IFNULL(b.team_name,'无操作') AS team_name,t1.*
            ,c.total_sale_amount,ROUND(t1.sale_amount/c.total_sale_amount*100,2) AS team_saleamount_rate from t1
				left join (select * from t2)AS b
				on t1.operator=b.operator
				LEFT JOIN(SELECT date,goodsinfo
                ,SUM(sale_amount) AS total_sale_amount
            FROM t1
            GROUP BY date,goodsinfo)AS c
                ON t1.date = c.date AND t1.goodsinfo=c.goodsinfo
				WHERE t1.goodsinfo = ?)as a
		LEFT JOIN (
			SELECT t1.date,u.team_name,round(SUM(t1.sale_amount)/COUNT(u.operator),2) as group_effectiveness FROM t1 
			LEFT JOIN (SELECT * FROM t2)AS u
			ON t1.operator = u.operator
			GROUP BY u.team_name,t1.date
			) AS d
			ON a.team_name=d.team_name AND a.date=d.date
            UNION ALL
            select '总计' AS line_director
            ,'总计' AS team_name
            ,date
            ,'总计' AS operator
            ,SUM(goods) AS goods
            ,SUM(sale_amount) AS sale_amount
            ,SUM(profit) AS profit
            ,ROUND(SUM(profit)/SUM(sale_amount)*100,2) AS profit_rate
            ,SUM(promotion_amount) AS promotion_amount
            ,ROUND(SUM(promotion_amount)/SUM(sale_amount)*100,2) AS promotion_rate
            ,SUM(bill_amount) AS bill_amount
            ,SUM(order_num) AS order_num
            ,SUM(refund_num) AS refund_num
            ,ROUND(SUM(refund_num)/SUM(order_num),2) AS refund_rate
            ,SUM(express) AS express
            ,SUM(verified_amount) AS verified_amount
            ,SUM(verified_profit) AS verified_profit
            ,ROUND(SUM(verified_profit)/SUM(verified_amount)*100,2) AS verified_profit_rate
            ,SUM(after_sales_compensation) AS after_sales_compensation
            ,ROUND(AVG(dsr),2) AS dsr
            ,SUM(xhs_shuadan) AS xhs_shuadan
            ,SUM(erlei_shuadan) AS erlei_shuadan
            ,IFNULL(SUM(bill),0) AS bill
            ,ROUND(IFNULL(SUM(bill),0)/SUM(sale_amount)*100,2) AS bill_rate
            ,t1.goodsinfo
			,SUM(sale_amount) AS total_sale_amount
            ,ROUND(SUM(sale_amount)/SUM(sale_amount)*100,2) AS team_saleamount_rate
			,ROUND(SUM(sale_amount)/COUNT(operator),2) AS group_effectiveness
            FROM t1
            WHERE t1.goodsinfo = ?
            GROUP BY date`
    let result = await query(sql,[goodsinfo,goodsinfo])
    return result
}
goodsSaleInfoRepo.getTMPromotioninfo = async(lstart, lend) =>{
    let sql = `SELECT a.goods_id
			,d.brief_name
			,d.line_director
			,d.operator
			,ROUND(a.targeted_audience_promotion,2) AS targeted_audience_promotion
			,ROUND(b.targeted_audience_promotion_trans_amount/a.targeted_audience_promotion,2) AS targeted_audience_promotion_roi
            ,ROUND(a.super_short_video,2) AS super_short_video
            ,ROUND(b.super_short_video_trans_amount/a.super_short_video,2) AS super_short_video_roi
            ,ROUND(a.full_site_promotion,2) AS full_site_promotion
            ,ROUND(b.full_site_promotion_trans_amount/a.full_site_promotion,2) AS full_site_promotion_roi
            ,ROUND(a.multi_objective_promotion,2) AS multi_objective_promotion
            ,ROUND(b.multi_objective_promotion_trans_amount/a.multi_objective_promotion,2) AS multi_objective_promotion_roi
            ,ROUND(a.keyword_promotion,2) AS keyword_promotion
            ,ROUND(b.keyword_promotion_trans_amount/a.keyword_promotion,2) AS keyword_promotion_roi
            ,ROUND(a.product_operation_promotion,2) AS product_operation_promotion
            ,ROUND(b.product_operation_promotion_trans_amount/a.product_operation_promotion,2) AS product_operation_promotion_roi
            ,ROUND(a.promotion_amount,2) AS promotion_amount
            ,ROUND(b.trans_amount/promotion_amount,2) AS roi 
            ,c.sale_amount
            ,c.sale_amount/a.promotion_amount AS sale_amount_roi
        FROM(
            SELECT goods_id,SUM(IF(promotion_name='6003416精准人群推广',amount,0)) AS targeted_audience_promotion
                ,SUM(IF(promotion_name='60030433万相台-超级短视频',amount,0)) AS super_short_video
                ,SUM(IF(promotion_name='6003431万相台无界-全站推广',amount,0)) AS full_site_promotion
                ,SUM(IF(promotion_name='6003414多目标直投',amount,0)) AS multi_objective_promotion
                ,SUM(IF(promotion_name='60030412关键词推广',amount,0)) AS keyword_promotion
                ,SUM(IF(promotion_name='6003432万相台无界-货品运营',amount,0)) AS product_operation_promotion
                ,SUM(amount) AS promotion_amount
            FROM goods_promotion_info WHERE shop_name = 'pakchoice旗舰店（天猫）' AND date BETWEEN '${lstart}' AND '${lend}'
            GROUP BY goods_id
        ) AS a
        LEFT JOIN(
            SELECT goods_id,SUM(IF(promotion_name='人群推广',trans_amount,0)) AS targeted_audience_promotion_trans_amount
                ,SUM(IF(promotion_name='超级短视频',trans_amount,0)) AS super_short_video_trans_amount
                ,SUM(IF(promotion_name='全站推广',trans_amount,0)) AS full_site_promotion_trans_amount
                ,SUM(IF(promotion_name='多目标直投',trans_amount,0)) AS multi_objective_promotion_trans_amount
                ,SUM(IF(promotion_name='关键词推广',trans_amount,0)) AS keyword_promotion_trans_amount
                ,SUM(IF(promotion_name='货品运营',trans_amount,0)) AS product_operation_promotion_trans_amount
                ,SUM(trans_amount) AS trans_amount
            FROM tmall_promotion_info WHERE shop_name = 'pakchoice旗舰店（天猫）' AND date BETWEEN '${lstart}' AND '${lend}' and period=1
            GROUP BY goods_id
        )AS b
        ON a.goods_id=b.goods_id
        LEFT JOIN(
            SELECT goods_id,SUM(sale_amount) AS sale_amount 
            FROM goods_sales 
            WHERE shop_name = 'pakchoice旗舰店（天猫）' AND date BETWEEN '${lstart}' AND '${lend}'
            GROUP BY goods_id
        )AS c
        ON a.goods_id=c.goods_id
        LEFT JOIN dianshang_operation_attribute AS d
        ON a.goods_id = d.goods_id`
    let result = await query(sql)
    return result
}

goodsSaleInfoRepo.getTMPromotion = async(lstart, lend) =>{
    let sql = `WITH t1 AS(
        SELECT IFNULL(b.team_name,'无操作') AS team_name
            ,IFNULL(b.line_director,'无操作') AS line_director,a.* from (
            SELECT a.operator
                ,SUM(targeted_audience_promotion) AS targeted_audience_promotion
                ,SUM(super_short_video) AS super_short_video
                ,SUM(full_site_promotion) AS full_site_promotion
                ,SUM(multi_objective_promotion) AS multi_objective_promotion
                ,SUM(keyword_promotion) AS keyword_promotion
                ,SUM(product_operation_promotion) AS product_operation_promotion
                ,SUM(promotion_amount) AS promotion_amount
				,SUM(targeted_audience_promotion_trans_amount) AS targeted_audience_promotion_trans_amount
                ,SUM(super_short_video_trans_amount) AS super_short_video_trans_amount
                ,SUM(full_site_promotion_trans_amount) AS full_site_promotion_trans_amount
                ,SUM(multi_objective_promotion_trans_amount) AS multi_objective_promotion_trans_amount
                ,SUM(keyword_promotion_trans_amount) AS keyword_promotion_trans_amount
                ,SUM(product_operation_promotion_trans_amount) AS product_operation_promotion_trans_amount
                ,SUM(trans_amount) AS trans_amount
            FROM (
                SELECT IFNULL(d.operator,'无操作') AS operator,a.*,b.targeted_audience_promotion_trans_amount
                ,b.super_short_video_trans_amount,b.full_site_promotion_trans_amount,b.multi_objective_promotion_trans_amount
                ,b.keyword_promotion_trans_amount,b.product_operation_promotion_trans_amount,b.trans_amount
                FROM (
                    SELECT goods_id
                        ,SUM(IF(promotion_name='6003416精准人群推广',amount,0)) AS targeted_audience_promotion
                        ,SUM(IF(promotion_name='60030433万相台-超级短视频',amount,0)) AS super_short_video
                        ,SUM(IF(promotion_name='6003431万相台无界-全站推广',amount,0)) AS full_site_promotion
                        ,SUM(IF(promotion_name='6003414多目标直投',amount,0)) AS multi_objective_promotion
                        ,SUM(IF(promotion_name='60030412关键词推广',amount,0)) AS keyword_promotion
                        ,SUM(IF(promotion_name='6003432万相台无界-货品运营',amount,0)) AS product_operation_promotion
                        ,SUM(amount) AS promotion_amount
                    FROM goods_promotion_info WHERE shop_name = 'pakchoice旗舰店（天猫）' AND date BETWEEN '${lstart}' AND '${lend}'
                    GROUP BY goods_id
                    )as a
					LEFT JOIN (select goods_id,SUM(IF(promotion_name='人群推广',trans_amount,0)) AS targeted_audience_promotion_trans_amount
                        ,SUM(IF(promotion_name='超级短视频',trans_amount,0)) AS super_short_video_trans_amount
                        ,SUM(IF(promotion_name='全站推广',trans_amount,0)) AS full_site_promotion_trans_amount
                        ,SUM(IF(promotion_name='多目标直投',trans_amount,0)) AS multi_objective_promotion_trans_amount
                        ,SUM(IF(promotion_name='关键词推广',trans_amount,0)) AS keyword_promotion_trans_amount
                        ,SUM(IF(promotion_name='货品运营',trans_amount,0)) AS product_operation_promotion_trans_amount
                        ,SUM(trans_amount) AS trans_amount
                        from tmall_promotion_info WHERE shop_name = 'pakchoice旗舰店（天猫）' AND date BETWEEN '${lstart}' AND '${lend}' and period=1
                        GROUP BY goods_id) as b
					ON a.goods_id = b.goods_id
                LEFT JOIN dianshang_operation_attribute AS d
                ON a.goods_id = d.goods_id
                )AS a
                GROUP BY operator
            )AS a
            LEFT JOIN(
                SELECT a.team_name AS team_name,u1.nickname AS line_director,u.nickname AS operator FROM (
                    SELECT t1.team_name,t1.user_id,t2.user_id AS member_id FROM team_info AS t1
                    LEFT JOIN team_member AS t2
                    ON t2.team_id=t1.id
                    WHERE t1.project_id=14
                    )AS a
                LEFT JOIN users AS u
                ON a.member_id=u.user_id
                LEFT JOIN users AS u1
                ON a.user_id=u1.user_id
            )AS b
            ON a.operator = b.operator)
        SELECT team_name
            ,line_director
            ,operator
            ,ROUND(targeted_audience_promotion,2) AS targeted_audience_promotion
			,ROUND(targeted_audience_promotion_trans_amount/targeted_audience_promotion,2) AS targeted_audience_promotion_roi
            ,ROUND(super_short_video,2) AS super_short_video
			,ROUND(super_short_video_trans_amount/super_short_video,2) AS super_short_video_roi
            ,ROUND(full_site_promotion,2) AS full_site_promotion
			,ROUND(full_site_promotion_trans_amount/full_site_promotion,2) AS full_site_promotion_roi
            ,ROUND(multi_objective_promotion,2) AS multi_objective_promotion
			,ROUND(multi_objective_promotion_trans_amount/multi_objective_promotion,2) AS multi_objective_promotion_roi
            ,ROUND(keyword_promotion,2) AS keyword_promotion
			,ROUND(keyword_promotion_trans_amount/keyword_promotion,2) AS keyword_promotion_roi
            ,ROUND(product_operation_promotion,2) AS product_operation_promotion
			,ROUND(product_operation_promotion_trans_amount/product_operation_promotion,2) AS product_operation_promotion_roi
            ,ROUND(promotion_amount,2) AS promotion_amount
			,ROUND(trans_amount/promotion_amount,2) AS roi 
		FROM t1
        UNION ALL
        SELECT CONCAT(team_name,'汇总')AS team_name
            ,CONCAT(team_name,'汇总')AS line_director
            ,CONCAT(team_name,'汇总')AS operator
            ,ROUND(SUM(targeted_audience_promotion),2) AS targeted_audience_promotion
			,ROUND(SUM(targeted_audience_promotion_trans_amount)/SUM(targeted_audience_promotion),2) AS targeted_audience_promotion_roi
            ,ROUND(SUM(super_short_video),2) AS super_short_video
			,ROUND(SUM(super_short_video_trans_amount)/SUM(super_short_video),2) AS super_short_video_roi
            ,ROUND(SUM(full_site_promotion),2) AS full_site_promotion
			,ROUND(SUM(full_site_promotion_trans_amount)/SUM(full_site_promotion),2) AS full_site_promotion_roi
            ,ROUND(SUM(multi_objective_promotion),2) AS multi_objective_promotion
			,ROUND(SUM(multi_objective_promotion_trans_amount)/SUM(multi_objective_promotion),2) AS multi_objective_promotion_roi
            ,ROUND(SUM(keyword_promotion),2) AS keyword_promotion
			,ROUND(SUM(keyword_promotion_trans_amount)/SUM(keyword_promotion),2) AS keyword_promotion_roi
            ,ROUND(SUM(product_operation_promotion),2) AS product_operation_promotion
			,ROUND(SUM(product_operation_promotion_trans_amount)/SUM(product_operation_promotion),2) AS product_operation_promotion_roi
            ,ROUND(SUM(promotion_amount),2) AS promotion_amount
			,ROUND(SUM(trans_amount)/SUM(promotion_amount),2) AS roi
        FROM t1
        GROUP BY team_name
        UNION ALL
        SELECT '汇总'AS team_name
            ,'汇总'AS line_director
            ,'汇总'AS operator
            ,ROUND(SUM(targeted_audience_promotion),2) AS targeted_audience_promotion
			,ROUND(SUM(targeted_audience_promotion_trans_amount)/SUM(targeted_audience_promotion),2) AS targeted_audience_promotion_roi
            ,ROUND(SUM(super_short_video),2) AS super_short_video
			,ROUND(SUM(super_short_video_trans_amount)/SUM(super_short_video),2) AS super_short_video_roi
            ,ROUND(SUM(full_site_promotion),2) AS full_site_promotion
			,ROUND(SUM(full_site_promotion_trans_amount)/SUM(full_site_promotion),2) AS full_site_promotion_roi
            ,ROUND(SUM(multi_objective_promotion),2) AS multi_objective_promotion
			,ROUND(SUM(multi_objective_promotion_trans_amount)/SUM(multi_objective_promotion),2) AS multi_objective_promotion_roi
            ,ROUND(SUM(keyword_promotion),2) AS keyword_promotion
			,ROUND(SUM(keyword_promotion_trans_amount)/SUM(keyword_promotion),2) AS keyword_promotion_roi
            ,ROUND(SUM(product_operation_promotion),2) AS product_operation_promotion
			,ROUND(SUM(product_operation_promotion_trans_amount)/SUM(product_operation_promotion),2) AS product_operation_promotion_roi
            ,ROUND(SUM(promotion_amount),2) AS promotion_amount
			,ROUND(SUM(trans_amount)/SUM(promotion_amount),2) AS roi
        FROM t1`
    let result = await query(sql)
    return result
}

goodsSaleInfoRepo.getSaleData = async(lstart,lend,preStart,preEnd,value,name) => {
    let sql =`select * from (
            select a.${name} as name
                        ,SUM(g.sale_amount) as '本期销售额'
                        ,SUM(g.real_sale_qty) as '本期销售数量' 
                        ,SUM(g1.sale_amount) as '上期销售额'
                        ,SUM(g1.real_sale_qty) as '上期销售数量'
                        ,ROUND((SUM(g.sale_amount)-SUM(g1.sale_amount))/SUM(g1.sale_amount)*100,2) as '销售额环比'
                        ,ROUND((SUM(g.real_sale_qty)-SUM(g1.real_sale_qty))/SUM(g1.real_sale_qty)*100,2) as '销售数量环比'
            FROM (SELECT shop_name,SUM(sale_amount)as sale_amount,SUM(real_sale_qty) as real_sale_qty
            FROM goods_sales WHERE date BETWEEN '${lstart}' and '${lend}' GROUP BY shop_name) as g
            LEFT JOIN (SELECT shop_name,SUM(sale_amount)as sale_amount,SUM(real_sale_qty) as real_sale_qty
            FROM goods_sales WHERE date BETWEEN '${preStart}' and '${preEnd}' GROUP BY shop_name) as g1
            on g.shop_name=g1.shop_name
            LEFT JOIN (select p.project_name
                        ,s.shop_name
                        ,d.division_name
            from shop_info as s 
            left join project_info as p 
            on s.project_id=p.id
            left join division_info as d 
            on p.division_id=d.id
            )as a
            on g.shop_name=a.shop_name
            WHERE a.division_name is not null
            GROUP BY a.${name}
            )as a`
    if(value?.length){
        sql = `${sql} where a.name in (?)`
    }
    let result = await query(sql,[value])
    return result
}

goodsSaleInfoRepo.getInventoryData = async(type) => {
    let sql =`SELECT sum(num*cost_price) as Current_inventory_cost
			,SUM(total_num*cost_price) as total_inventory_cost
			,ROUND(SUM(num)/(SUM(day7_sale_qty)/7),0) as stock_sale7
			,ROUND(SUM(num)/(SUM(day30_sale_qty)/30),0) as stock_sale30
			,ROUND(SUM(day30_sale_qty)/(SUM(num30)+SUM(io_qty)-IFNULL(SUM(fund_num),0))*100,2) as sell_through_rate
			,ROUND(SUM(day30_sale_qty*cost_price)/((sum(num30*cost_price)+sum(num*cost_price))*2)*100,2) as inventory_turnover
            from inventory_attributes`
    let subsql =`WHERE shipping_attributes is null`
    if (type == 1){
        sql =`${sql} ${subsql}`
    }
    let result = await query(sql)
    return result
}

goodsSaleInfoRepo.getInventoryCostData = async(start,end,days) => {
    let sql = `
        SELECT SUM(cost) AS cost , SUM(cost)/${days} AS cost_avg,SUM(sale) AS sale FROM(
                SELECT SUM(\`利润-销售成本(扣退)\`)AS cost,SUM(\`利润-销售金额(扣退)\`) AS sale FROM danpin.sku_code_sale WHERE 日期 BETWEEN ? AND ?
                UNION ALL
                SELECT SUM(总成本),SUM(成交金额) AS cost FROM danpin.jb_ziying WHERE 时间 BETWEEN ? AND ?
                UNION ALL
                SELECT SUM(总成本),SUM(成交金额) AS cost FROM danpin.jb_ziying_everday WHERE 时间 BETWEEN ? AND ?
        ) AS a`
    let result = await query(sql,[start,end,start,end,start,end])
    return result
}

goodsSaleInfoRepo.getInventorysaleqtyData = async(start,end) => {
    let sql = `SELECT SUM(sale_qty) AS sale_qty FROM (
            SELECT SUM(\`利润-销售数量(扣退)\`) AS sale_qty FROM danpin.sku_code_sale WHERE 日期 BETWEEN ? AND ?
            UNION ALL
            SELECT SUM(a.成交商品件数) AS sale_qty FROM (
                SELECT IFNULL(c.商品编码,a.编码) AS '商品编码'
                    ,IF(c.数量 IS NOT NULL,a.成交商品件数*c.数量,a.成交商品件数) AS '成交商品件数' 
                FROM (
                    SELECT 编码,成交金额,成交商品件数 FROM  danpin.jb_ziying 
                    WHERE 时间 BETWEEN ? AND ?
                    UNION ALL
                    SELECT 编码,成交金额,成交商品件数 FROM  danpin.jb_ziying_everday
                    WHERE 时间 BETWEEN ? AND ?
                ) AS a
                LEFT JOIN(
                    SELECT 组合商品编码,商品编码,数量,(数量*子商品成本价)/组合成本价 AS '占比' FROM danpin.combination_product_code) AS c
                    ON a.编码 = c.组合商品编码
                )AS a
            WHERE a.商品编码 IS NOT NULL
        )as a`
    let result = await query(sql,[start,end,start,end,start,end])
    return result
}

goodsSaleInfoRepo.getDivisionSaleData = async() => {
    let sql = `WITH t1 AS(
            SELECT YEAR(日期) AS year
                ,店铺名称 AS shop_name
                ,SUM(IF(MONTH(日期)=1,\`利润-销售金额(扣退)\`,0)) AS one
                ,SUM(IF(MONTH(日期)=2,\`利润-销售金额(扣退)\`,0)) AS two
                ,SUM(IF(MONTH(日期)=3,\`利润-销售金额(扣退)\`,0)) AS three
                ,SUM(IF(MONTH(日期)=4,\`利润-销售金额(扣退)\`,0)) AS four
                ,SUM(IF(MONTH(日期)=5,\`利润-销售金额(扣退)\`,0)) AS five
                ,SUM(IF(MONTH(日期)=6,\`利润-销售金额(扣退)\`,0)) AS six
                ,SUM(IF(MONTH(日期)=7,\`利润-销售金额(扣退)\`,0)) AS seven
                ,SUM(IF(MONTH(日期)=8,\`利润-销售金额(扣退)\`,0)) AS eight
                ,SUM(IF(MONTH(日期)=9,\`利润-销售金额(扣退)\`,0)) AS nine
                ,SUM(IF(MONTH(日期)=10,\`利润-销售金额(扣退)\`,0)) AS ten
                ,SUM(IF(MONTH(日期)=11,\`利润-销售金额(扣退)\`,0)) AS eleven
                ,SUM(IF(MONTH(日期)=12,\`利润-销售金额(扣退)\`,0)) AS twelve
                ,SUM(\`利润-销售金额(扣退)\`) AS sum
            FROM danpin.sku_code_sale
            WHERE 日期 BETWEEN '2024-01-01' AND '2025-12-31' and 店铺名称 !='京东自营-厨具'
            GROUP BY 店铺名称,YEAR(日期)
            UNION ALL
            SELECT '2024' AS year
                ,'京东自营-厨具' AS shop_name
                ,SUM(IF(MONTH(日期)=1,京仓发货金额,0)) AS one
                ,SUM(IF(MONTH(日期)=2,京仓发货金额,0)) AS two
                ,SUM(IF(MONTH(日期)=3,京仓发货金额,0)) AS three
                ,SUM(IF(MONTH(日期)=4,京仓发货金额,0)) AS four
                ,SUM(IF(MONTH(日期)=5,京仓发货金额,0)) AS five
                ,SUM(IF(MONTH(日期)=6,京仓发货金额,0)) AS six
                ,SUM(IF(MONTH(日期)=7,京仓发货金额,0)) AS seven
                ,SUM(IF(MONTH(日期)=8,京仓发货金额,0)) AS eight
                ,SUM(IF(MONTH(日期)=9,京仓发货金额,0)) AS nine
                ,SUM(IF(MONTH(日期)=10,京仓发货金额,0)) AS ten
                ,SUM(IF(MONTH(日期)=11,京仓发货金额,0)) AS eleven
                ,SUM(IF(MONTH(日期)=12,京仓发货金额,0)) AS twelve
                ,SUM(京仓发货金额) AS sum
            FROM danpin.jbzz_month where YEAR(日期) =2024
            UNION ALL
            SELECT '2025' AS year
                ,'京东自营-厨具' AS shop_name
                ,SUM(IF(MONTH(时间)=1,成交金额,0)) AS one
                ,SUM(IF(MONTH(时间)=2,成交金额,0)) AS two
                ,SUM(IF(MONTH(时间)=3,成交金额,0)) AS three
                ,SUM(IF(MONTH(时间)=4,成交金额,0)) AS four
                ,SUM(IF(MONTH(时间)=5,成交金额,0)) AS five
                ,SUM(IF(MONTH(时间)=6,成交金额,0)) AS six
                ,SUM(IF(MONTH(时间)=7,成交金额,0)) AS seven
                ,SUM(IF(MONTH(时间)=8,成交金额,0)) AS eight
                ,SUM(IF(MONTH(时间)=9,成交金额,0)) AS nine
                ,SUM(IF(MONTH(时间)=10,成交金额,0)) AS ten
                ,SUM(IF(MONTH(时间)=11,成交金额,0)) AS eleven
                ,SUM(IF(MONTH(时间)=12,成交金额,0)) AS twelve
                ,SUM(成交金额) AS sum
            FROM (
                SELECT 时间,成交金额 FROM danpin.jb_ziying WHERE 时间 BETWEEN '2025-01-01' AND '2025-12-31'
                UNION ALL 
                SELECT 时间,成交金额 FROM danpin.jb_ziying_everday WHERE 时间 BETWEEN '2025-01-01' AND '2025-12-31'
            ) AS a)
            SELECT a.year,b.事业部 AS division,ROUND(SUM(one)/10000,1) AS one,ROUND(SUM(two)/10000,1) AS two,ROUND(SUM(three)/10000,1) AS three
                ,ROUND(SUM(four)/10000,1) AS four,ROUND(SUM(five)/10000,1) AS five,ROUND(SUM(six)/10000,1) AS six,ROUND(SUM(seven)/10000,1) AS seven
                ,ROUND(SUM(eight)/10000,1) AS eight,ROUND(SUM(nine)/10000,1) AS nine,ROUND(SUM(ten)/10000,1) AS ten,ROUND(SUM(eleven)/10000,1) AS eleven
                ,ROUND(SUM(twelve)/10000,1) AS twelve ,ROUND(SUM(sum)/10000,1) AS sum
            FROM t1 AS a 
            LEFT JOIN danpin.inventory_shop_info AS b 
            ON a.shop_name=b.店铺名称 
            WHERE b.事业部 IS NOT NULL 
            GROUP BY a.year,b.事业部 
            UNION ALL 
            SELECT a.year, '累计' AS division,ROUND(SUM(one)/10000,1) AS one
                ,ROUND(SUM(two)/10000,1) AS two,ROUND(SUM(three)/10000,1) AS three,ROUND(SUM(four)/10000,1) AS four
                ,ROUND(SUM(five)/10000,1) AS five,ROUND(SUM(six)/10000,1) AS six,ROUND(SUM(seven)/10000,1) AS seven
                ,ROUND(SUM(eight)/10000,1) AS eight,ROUND(SUM(nine)/10000,1) AS nine,ROUND(SUM(ten)/10000,1) AS ten
                ,ROUND(SUM(eleven)/10000,1) AS eleven,ROUND(SUM(twelve)/10000,1) AS twelve,ROUND(SUM(sum)/10000,1) AS sum
            FROM t1 AS a 
            LEFT JOIN danpin.inventory_shop_info AS b 
            ON a.shop_name=b.店铺名称
            WHERE b.事业部 IS NOT NULL 
            GROUP BY a.year`
    let result = await query(sql)
    return result
}

goodsSaleInfoRepo.getProjectSaleData = async() => {
    let sql = `WITH t1 AS(
            SELECT YEAR(日期) AS year
                ,店铺名称 AS shop_name
                ,SUM(IF(MONTH(日期)=1,\`利润-销售金额(扣退)\`,0)) AS one
                ,SUM(IF(MONTH(日期)=2,\`利润-销售金额(扣退)\`,0)) AS two
                ,SUM(IF(MONTH(日期)=3,\`利润-销售金额(扣退)\`,0)) AS three
                ,SUM(IF(MONTH(日期)=4,\`利润-销售金额(扣退)\`,0)) AS four
                ,SUM(IF(MONTH(日期)=5,\`利润-销售金额(扣退)\`,0)) AS five
                ,SUM(IF(MONTH(日期)=6,\`利润-销售金额(扣退)\`,0)) AS six
                ,SUM(IF(MONTH(日期)=7,\`利润-销售金额(扣退)\`,0)) AS seven
                ,SUM(IF(MONTH(日期)=8,\`利润-销售金额(扣退)\`,0)) AS eight
                ,SUM(IF(MONTH(日期)=9,\`利润-销售金额(扣退)\`,0)) AS nine
                ,SUM(IF(MONTH(日期)=10,\`利润-销售金额(扣退)\`,0)) AS ten
                ,SUM(IF(MONTH(日期)=11,\`利润-销售金额(扣退)\`,0)) AS eleven
                ,SUM(IF(MONTH(日期)=12,\`利润-销售金额(扣退)\`,0)) AS twelve
                ,SUM(\`利润-销售金额(扣退)\`) AS sum
            FROM danpin.sku_code_sale
            WHERE 日期 BETWEEN '2024-01-01' AND '2025-12-31' and 店铺名称 !='京东自营-厨具'
            GROUP BY 店铺名称,YEAR(日期)
            UNION ALL
            SELECT '2024' AS year
                ,'京东自营-厨具' AS shop_name
                ,SUM(IF(MONTH(日期)=1,京仓发货金额,0)) AS one
                ,SUM(IF(MONTH(日期)=2,京仓发货金额,0)) AS two
                ,SUM(IF(MONTH(日期)=3,京仓发货金额,0)) AS three
                ,SUM(IF(MONTH(日期)=4,京仓发货金额,0)) AS four
                ,SUM(IF(MONTH(日期)=5,京仓发货金额,0)) AS five
                ,SUM(IF(MONTH(日期)=6,京仓发货金额,0)) AS six
                ,SUM(IF(MONTH(日期)=7,京仓发货金额,0)) AS seven
                ,SUM(IF(MONTH(日期)=8,京仓发货金额,0)) AS eight
                ,SUM(IF(MONTH(日期)=9,京仓发货金额,0)) AS nine
                ,SUM(IF(MONTH(日期)=10,京仓发货金额,0)) AS ten
                ,SUM(IF(MONTH(日期)=11,京仓发货金额,0)) AS eleven
                ,SUM(IF(MONTH(日期)=12,京仓发货金额,0)) AS twelve
                ,SUM(京仓发货金额) AS sum
            FROM danpin.jbzz_month where YEAR(日期) =2024
            UNION ALL
            SELECT '2025' AS year
                ,'京东自营-厨具' AS shop_name
                ,SUM(IF(MONTH(时间)=1,成交金额,0)) AS one
                ,SUM(IF(MONTH(时间)=2,成交金额,0)) AS two
                ,SUM(IF(MONTH(时间)=3,成交金额,0)) AS three
                ,SUM(IF(MONTH(时间)=4,成交金额,0)) AS four
                ,SUM(IF(MONTH(时间)=5,成交金额,0)) AS five
                ,SUM(IF(MONTH(时间)=6,成交金额,0)) AS six
                ,SUM(IF(MONTH(时间)=7,成交金额,0)) AS seven
                ,SUM(IF(MONTH(时间)=8,成交金额,0)) AS eight
                ,SUM(IF(MONTH(时间)=9,成交金额,0)) AS nine
                ,SUM(IF(MONTH(时间)=10,成交金额,0)) AS ten
                ,SUM(IF(MONTH(时间)=11,成交金额,0)) AS eleven
                ,SUM(IF(MONTH(时间)=12,成交金额,0)) AS twelve
                ,SUM(成交金额) AS sum
            FROM (
                SELECT 时间,成交金额 FROM danpin.jb_ziying WHERE 时间 BETWEEN '2025-01-01' AND '2025-12-31'
                UNION ALL 
                SELECT 时间,成交金额 FROM danpin.jb_ziying_everday WHERE 时间 BETWEEN '2025-01-01' AND '2025-12-31'
            ) AS a)
            SELECT a.year,b.销售平台 AS project,ROUND(SUM(one)/10000,1) AS one,ROUND(SUM(two)/10000,1) AS two,ROUND(SUM(three)/10000,1) AS three
                ,ROUND(SUM(four)/10000,1) AS four,ROUND(SUM(five)/10000,1) AS five,ROUND(SUM(six)/10000,1) AS six,ROUND(SUM(seven)/10000,1) AS seven
                ,ROUND(SUM(eight)/10000,1) AS eight,ROUND(SUM(nine)/10000,1) AS nine,ROUND(SUM(ten)/10000,1) AS ten,ROUND(SUM(eleven)/10000,1) AS eleven
                ,ROUND(SUM(twelve)/10000,1) AS twelve ,ROUND(SUM(sum)/10000,1) AS sum
            FROM t1 AS a 
            LEFT JOIN danpin.inventory_shop_info AS b 
            ON a.shop_name=b.店铺名称 
            WHERE b.销售平台 IS NOT NULL 
            GROUP BY a.year,b.销售平台 
            UNION ALL 
            SELECT a.year, '累计' AS project,ROUND(SUM(one)/10000,1) AS one
                ,ROUND(SUM(two)/10000,1) AS two,ROUND(SUM(three)/10000,1) AS three,ROUND(SUM(four)/10000,1) AS four
                ,ROUND(SUM(five)/10000,1) AS five,ROUND(SUM(six)/10000,1) AS six,ROUND(SUM(seven)/10000,1) AS seven
                ,ROUND(SUM(eight)/10000,1) AS eight,ROUND(SUM(nine)/10000,1) AS nine,ROUND(SUM(ten)/10000,1) AS ten
                ,ROUND(SUM(eleven)/10000,1) AS eleven,ROUND(SUM(twelve)/10000,1) AS twelve,ROUND(SUM(sum)/10000,1) AS sum
            FROM t1 AS a 
            LEFT JOIN danpin.inventory_shop_info AS b 
            ON a.shop_name=b.店铺名称
            WHERE b.销售平台 IS NOT NULL 
            GROUP BY a.year`
    let result = await query(sql)
    return result
}

goodsSaleInfoRepo.getShopSaleData = async() => {
    let sql = `WITH t1 AS(
            SELECT YEAR(日期) AS year
                ,店铺名称 AS shop_name
                ,SUM(IF(MONTH(日期)=1,\`利润-销售金额(扣退)\`,0)) AS one
                ,SUM(IF(MONTH(日期)=2,\`利润-销售金额(扣退)\`,0)) AS two
                ,SUM(IF(MONTH(日期)=3,\`利润-销售金额(扣退)\`,0)) AS three
                ,SUM(IF(MONTH(日期)=4,\`利润-销售金额(扣退)\`,0)) AS four
                ,SUM(IF(MONTH(日期)=5,\`利润-销售金额(扣退)\`,0)) AS five
                ,SUM(IF(MONTH(日期)=6,\`利润-销售金额(扣退)\`,0)) AS six
                ,SUM(IF(MONTH(日期)=7,\`利润-销售金额(扣退)\`,0)) AS seven
                ,SUM(IF(MONTH(日期)=8,\`利润-销售金额(扣退)\`,0)) AS eight
                ,SUM(IF(MONTH(日期)=9,\`利润-销售金额(扣退)\`,0)) AS nine
                ,SUM(IF(MONTH(日期)=10,\`利润-销售金额(扣退)\`,0)) AS ten
                ,SUM(IF(MONTH(日期)=11,\`利润-销售金额(扣退)\`,0)) AS eleven
                ,SUM(IF(MONTH(日期)=12,\`利润-销售金额(扣退)\`,0)) AS twelve
                ,SUM(\`利润-销售金额(扣退)\`) AS sum
            FROM danpin.sku_code_sale
            WHERE 日期 BETWEEN '2024-01-01' AND '2025-12-31' and 店铺名称 !='京东自营-厨具'
            GROUP BY 店铺名称,YEAR(日期)
            UNION ALL
            SELECT '2024' AS year
                ,'京东自营-厨具' AS shop_name
                ,SUM(IF(MONTH(日期)=1,京仓发货金额,0)) AS one
                ,SUM(IF(MONTH(日期)=2,京仓发货金额,0)) AS two
                ,SUM(IF(MONTH(日期)=3,京仓发货金额,0)) AS three
                ,SUM(IF(MONTH(日期)=4,京仓发货金额,0)) AS four
                ,SUM(IF(MONTH(日期)=5,京仓发货金额,0)) AS five
                ,SUM(IF(MONTH(日期)=6,京仓发货金额,0)) AS six
                ,SUM(IF(MONTH(日期)=7,京仓发货金额,0)) AS seven
                ,SUM(IF(MONTH(日期)=8,京仓发货金额,0)) AS eight
                ,SUM(IF(MONTH(日期)=9,京仓发货金额,0)) AS nine
                ,SUM(IF(MONTH(日期)=10,京仓发货金额,0)) AS ten
                ,SUM(IF(MONTH(日期)=11,京仓发货金额,0)) AS eleven
                ,SUM(IF(MONTH(日期)=12,京仓发货金额,0)) AS twelve
                ,SUM(京仓发货金额) AS sum
            FROM danpin.jbzz_month where YEAR(日期) =2024
            UNION ALL
            SELECT '2025' AS year
                ,'京东自营-厨具' AS shop_name
                ,SUM(IF(MONTH(时间)=1,成交金额,0)) AS one
                ,SUM(IF(MONTH(时间)=2,成交金额,0)) AS two
                ,SUM(IF(MONTH(时间)=3,成交金额,0)) AS three
                ,SUM(IF(MONTH(时间)=4,成交金额,0)) AS four
                ,SUM(IF(MONTH(时间)=5,成交金额,0)) AS five
                ,SUM(IF(MONTH(时间)=6,成交金额,0)) AS six
                ,SUM(IF(MONTH(时间)=7,成交金额,0)) AS seven
                ,SUM(IF(MONTH(时间)=8,成交金额,0)) AS eight
                ,SUM(IF(MONTH(时间)=9,成交金额,0)) AS nine
                ,SUM(IF(MONTH(时间)=10,成交金额,0)) AS ten
                ,SUM(IF(MONTH(时间)=11,成交金额,0)) AS eleven
                ,SUM(IF(MONTH(时间)=12,成交金额,0)) AS twelve
                ,SUM(成交金额) AS sum
            FROM (
                SELECT 时间,成交金额 FROM danpin.jb_ziying WHERE 时间 BETWEEN '2025-01-01' AND '2025-12-31'
                UNION ALL 
                SELECT 时间,成交金额 FROM danpin.jb_ziying_everday WHERE 时间 BETWEEN '2025-01-01' AND '2025-12-31'
            ) AS a)
            SELECT * FROM t1
            UNION ALL 
            SELECT year, '累计' AS project,ROUND(SUM(one)/10000,1) AS one
                ,ROUND(SUM(two)/10000,1) AS two,ROUND(SUM(three)/10000,1) AS three,ROUND(SUM(four)/10000,1) AS four
                ,ROUND(SUM(five)/10000,1) AS five,ROUND(SUM(six)/10000,1) AS six,ROUND(SUM(seven)/10000,1) AS seven
                ,ROUND(SUM(eight)/10000,1) AS eight,ROUND(SUM(nine)/10000,1) AS nine,ROUND(SUM(ten)/10000,1) AS ten
                ,ROUND(SUM(eleven)/10000,1) AS eleven,ROUND(SUM(twelve)/10000,1) AS twelve,ROUND(SUM(sum)/10000,1) AS sum
            FROM t1 GROUP BY year`
    let result = await query(sql)
    return result
}

goodsSaleInfoRepo.getDivisionSaleQtyData = async() => {
    let sql = `WITH t1 AS(
                SELECT YEAR(日期) AS year
                        ,店铺名称 AS shop_name
                        ,SUM(IF(MONTH(日期)=1,\`利润-销售数量(扣退)\`,0)) AS one
                        ,SUM(IF(MONTH(日期)=2,\`利润-销售数量(扣退)\`,0)) AS two
                        ,SUM(IF(MONTH(日期)=3,\`利润-销售数量(扣退)\`,0)) AS three
                        ,SUM(IF(MONTH(日期)=4,\`利润-销售数量(扣退)\`,0)) AS four
                        ,SUM(IF(MONTH(日期)=5,\`利润-销售数量(扣退)\`,0)) AS five
                        ,SUM(IF(MONTH(日期)=6,\`利润-销售数量(扣退)\`,0)) AS six
                        ,SUM(IF(MONTH(日期)=7,\`利润-销售数量(扣退)\`,0)) AS seven
                        ,SUM(IF(MONTH(日期)=8,\`利润-销售数量(扣退)\`,0)) AS eight
                        ,SUM(IF(MONTH(日期)=9,\`利润-销售数量(扣退)\`,0)) AS nine
                        ,SUM(IF(MONTH(日期)=10,\`利润-销售数量(扣退)\`,0)) AS ten
                        ,SUM(IF(MONTH(日期)=11,\`利润-销售数量(扣退)\`,0)) AS eleven
                        ,SUM(IF(MONTH(日期)=12,\`利润-销售数量(扣退)\`,0)) AS twelve
                        ,SUM(\`利润-销售数量(扣退)\`) AS sum
                FROM danpin.sku_code_sale
                WHERE 日期 BETWEEN '2024-01-01' AND '2025-12-31' and 店铺名称 !='京东自营-厨具'
                GROUP BY 店铺名称,YEAR(日期)
                UNION ALL
                SELECT '2024' AS year
                        ,'京东自营-厨具' AS shop_name
                        ,SUM(IF(MONTH(日期)=1,发货商品件数,0)) AS one
                        ,SUM(IF(MONTH(日期)=2,发货商品件数,0)) AS two
                        ,SUM(IF(MONTH(日期)=3,发货商品件数,0)) AS three
                        ,SUM(IF(MONTH(日期)=4,发货商品件数,0)) AS four
                        ,SUM(IF(MONTH(日期)=5,发货商品件数,0)) AS five
                        ,SUM(IF(MONTH(日期)=6,发货商品件数,0)) AS six
                        ,SUM(IF(MONTH(日期)=7,发货商品件数,0)) AS seven
                        ,SUM(IF(MONTH(日期)=8,发货商品件数,0)) AS eight
                        ,SUM(IF(MONTH(日期)=9,发货商品件数,0)) AS nine
                        ,SUM(IF(MONTH(日期)=10,发货商品件数,0)) AS ten
                        ,SUM(IF(MONTH(日期)=11,发货商品件数,0)) AS eleven
                        ,SUM(IF(MONTH(日期)=12,发货商品件数,0)) AS twelve
                        ,SUM(发货商品件数) AS sum
                FROM (
                    SELECT 日期,IF(b.数量 IS NOT NULL,a.发货商品件数*b.数量,a.发货商品件数) AS '发货商品件数' FROM danpin.jbzz_month AS a
                    LEFT JOIN danpin.combination_product_code AS b
                    ON a.商品编码 = b.组合商品编码
                )AS a where YEAR(a.日期) =2024
                UNION ALL
                SELECT '2025' AS year
                        ,'京东自营-厨具' AS shop_name
                        ,SUM(IF(MONTH(时间)=1,成交商品件数,0)) AS one
                        ,SUM(IF(MONTH(时间)=2,成交商品件数,0)) AS two
                        ,SUM(IF(MONTH(时间)=3,成交商品件数,0)) AS three
                        ,SUM(IF(MONTH(时间)=4,成交商品件数,0)) AS four
                        ,SUM(IF(MONTH(时间)=5,成交商品件数,0)) AS five
                        ,SUM(IF(MONTH(时间)=6,成交商品件数,0)) AS six
                        ,SUM(IF(MONTH(时间)=7,成交商品件数,0)) AS seven
                        ,SUM(IF(MONTH(时间)=8,成交商品件数,0)) AS eight
                        ,SUM(IF(MONTH(时间)=9,成交商品件数,0)) AS nine
                        ,SUM(IF(MONTH(时间)=10,成交商品件数,0)) AS ten
                        ,SUM(IF(MONTH(时间)=11,成交商品件数,0)) AS eleven
                        ,SUM(IF(MONTH(时间)=12,成交商品件数,0)) AS twelve
                        ,SUM(成交商品件数) AS sum
                FROM (
                        SELECT 时间,IF(b.数量 is not NULL,a.成交商品件数*b.数量,a.成交商品件数) AS '成交商品件数' FROM(
                            SELECT 编码,时间,成交商品件数 FROM danpin.jb_ziying WHERE 时间 BETWEEN '2025-01-01' AND '2025-12-31'
                            UNION ALL
                            SELECT 编码,时间,成交商品件数 FROM danpin.jb_ziying_everday WHERE 时间 BETWEEN '2025-01-01' AND '2025-12-31'
                        ) as a
                        LEFT JOIN danpin.combination_product_code AS b
                    ON a.编码 = b.组合商品编码
                ) AS a)
                SELECT a.year,b.事业部 AS division,SUM(one) AS one,SUM(two) AS two,SUM(three) AS three
                        ,SUM(four) AS four,SUM(five) AS five,SUM(six) AS six,SUM(seven) AS seven
                        ,SUM(eight) AS eight,SUM(nine) AS nine,SUM(ten) AS ten,SUM(eleven) AS eleven
                        ,SUM(twelve) AS twelve ,SUM(sum) AS sum
                FROM t1 AS a
                LEFT JOIN danpin.inventory_shop_info AS b
                ON a.shop_name=b.店铺名称
                WHERE b.事业部 IS NOT NULL
                GROUP BY a.year,b.事业部
                UNION ALL
                SELECT a.year, '累计' AS division,SUM(one) AS one
                        ,SUM(two) AS two,SUM(three) AS three,SUM(four) AS four
                        ,SUM(five) AS five,SUM(six) AS six,SUM(seven) AS seven
                        ,SUM(eight) AS eight,SUM(nine) AS nine,SUM(ten) AS ten
                        ,SUM(eleven) AS eleven,SUM(twelve) AS twelve,SUM(sum) AS sum
                FROM t1 AS a
                LEFT JOIN danpin.inventory_shop_info AS b
                ON a.shop_name=b.店铺名称
                WHERE b.事业部 IS NOT NULL
                GROUP BY a.year`
    let result = await query(sql)
    return result
}

goodsSaleInfoRepo.getProjectSaleQtyData = async() => {
    let sql = `WITH t1 AS(
        SELECT YEAR(日期) AS year
                ,店铺名称 AS shop_name
                ,SUM(IF(MONTH(日期)=1,\`利润-销售数量(扣退)\`,0)) AS one
                ,SUM(IF(MONTH(日期)=2,\`利润-销售数量(扣退)\`,0)) AS two
                ,SUM(IF(MONTH(日期)=3,\`利润-销售数量(扣退)\`,0)) AS three
                ,SUM(IF(MONTH(日期)=4,\`利润-销售数量(扣退)\`,0)) AS four
                ,SUM(IF(MONTH(日期)=5,\`利润-销售数量(扣退)\`,0)) AS five
                ,SUM(IF(MONTH(日期)=6,\`利润-销售数量(扣退)\`,0)) AS six
                ,SUM(IF(MONTH(日期)=7,\`利润-销售数量(扣退)\`,0)) AS seven
                ,SUM(IF(MONTH(日期)=8,\`利润-销售数量(扣退)\`,0)) AS eight
                ,SUM(IF(MONTH(日期)=9,\`利润-销售数量(扣退)\`,0)) AS nine
                ,SUM(IF(MONTH(日期)=10,\`利润-销售数量(扣退)\`,0)) AS ten
                ,SUM(IF(MONTH(日期)=11,\`利润-销售数量(扣退)\`,0)) AS eleven
                ,SUM(IF(MONTH(日期)=12,\`利润-销售数量(扣退)\`,0)) AS twelve
                ,SUM(\`利润-销售数量(扣退)\`) AS sum
        FROM danpin.sku_code_sale
        WHERE 日期 BETWEEN '2024-01-01' AND '2025-12-31' and 店铺名称 !='京东自营-厨具'
        GROUP BY 店铺名称,YEAR(日期)
        UNION ALL
        SELECT '2024' AS year
                ,'京东自营-厨具' AS shop_name
                ,SUM(IF(MONTH(日期)=1,发货商品件数,0)) AS one
                ,SUM(IF(MONTH(日期)=2,发货商品件数,0)) AS two
                ,SUM(IF(MONTH(日期)=3,发货商品件数,0)) AS three
                ,SUM(IF(MONTH(日期)=4,发货商品件数,0)) AS four
                ,SUM(IF(MONTH(日期)=5,发货商品件数,0)) AS five
                ,SUM(IF(MONTH(日期)=6,发货商品件数,0)) AS six
                ,SUM(IF(MONTH(日期)=7,发货商品件数,0)) AS seven
                ,SUM(IF(MONTH(日期)=8,发货商品件数,0)) AS eight
                ,SUM(IF(MONTH(日期)=9,发货商品件数,0)) AS nine
                ,SUM(IF(MONTH(日期)=10,发货商品件数,0)) AS ten
                ,SUM(IF(MONTH(日期)=11,发货商品件数,0)) AS eleven
                ,SUM(IF(MONTH(日期)=12,发货商品件数,0)) AS twelve
                ,SUM(发货商品件数) AS sum
        FROM (
            SELECT 日期,IF(b.数量 IS NOT NULL,a.发货商品件数*b.数量,a.发货商品件数) AS '发货商品件数' FROM danpin.jbzz_month AS a
            LEFT JOIN danpin.combination_product_code AS b
            ON a.商品编码 = b.组合商品编码
        )AS a where YEAR(a.日期) =2024
        UNION ALL
        SELECT '2025' AS year
                ,'京东自营-厨具' AS shop_name
                ,SUM(IF(MONTH(时间)=1,成交商品件数,0)) AS one
                ,SUM(IF(MONTH(时间)=2,成交商品件数,0)) AS two
                ,SUM(IF(MONTH(时间)=3,成交商品件数,0)) AS three
                ,SUM(IF(MONTH(时间)=4,成交商品件数,0)) AS four
                ,SUM(IF(MONTH(时间)=5,成交商品件数,0)) AS five
                ,SUM(IF(MONTH(时间)=6,成交商品件数,0)) AS six
                ,SUM(IF(MONTH(时间)=7,成交商品件数,0)) AS seven
                ,SUM(IF(MONTH(时间)=8,成交商品件数,0)) AS eight
                ,SUM(IF(MONTH(时间)=9,成交商品件数,0)) AS nine
                ,SUM(IF(MONTH(时间)=10,成交商品件数,0)) AS ten
                ,SUM(IF(MONTH(时间)=11,成交商品件数,0)) AS eleven
                ,SUM(IF(MONTH(时间)=12,成交商品件数,0)) AS twelve
                ,SUM(成交商品件数) AS sum
        FROM (
                SELECT 时间,IF(b.数量 is not NULL,a.成交商品件数*b.数量,a.成交商品件数) AS '成交商品件数' FROM(
                    SELECT 编码,时间,成交商品件数 FROM danpin.jb_ziying WHERE 时间 BETWEEN '2025-01-01' AND '2025-12-31'
                    UNION ALL
                    SELECT 编码,时间,成交商品件数 FROM danpin.jb_ziying_everday WHERE 时间 BETWEEN '2025-01-01' AND '2025-12-31'
                ) as a
                LEFT JOIN danpin.combination_product_code AS b
            ON a.编码 = b.组合商品编码
        ) AS a)
        SELECT a.year,b.销售平台 AS project,SUM(one) AS one,SUM(two) AS two,SUM(three) AS three
                ,SUM(four) AS four,SUM(five) AS five,SUM(six) AS six,SUM(seven) AS seven
                ,SUM(eight) AS eight,SUM(nine) AS nine,SUM(ten) AS ten,SUM(eleven) AS eleven
                ,SUM(twelve) AS twelve ,SUM(sum) AS sum
        FROM t1 AS a
        LEFT JOIN danpin.inventory_shop_info AS b
        ON a.shop_name=b.店铺名称
        WHERE b.销售平台 IS NOT NULL
        GROUP BY a.year,b.销售平台
        UNION ALL
        SELECT a.year, '累计' AS project,SUM(one) AS one
                ,SUM(two) AS two,SUM(three) AS three,SUM(four) AS four
                ,SUM(five) AS five,SUM(six) AS six,SUM(seven) AS seven
                ,SUM(eight) AS eight,SUM(nine) AS nine,SUM(ten) AS ten
                ,SUM(eleven) AS eleven,SUM(twelve) AS twelve,SUM(sum) AS sum
        FROM t1 AS a
        LEFT JOIN danpin.inventory_shop_info AS b
        ON a.shop_name=b.店铺名称
        WHERE b.销售平台 IS NOT NULL
        GROUP BY a.year`
    let result = await query(sql)
    return result
}

goodsSaleInfoRepo.getShopSaleQtyData = async() => {
    let sql = `WITH t1 AS(
            SELECT YEAR(日期) AS year
                ,店铺名称 AS shop_name
                ,SUM(IF(MONTH(日期)=1,\`利润-销售数量(扣退)\`,0)) AS one
                ,SUM(IF(MONTH(日期)=2,\`利润-销售数量(扣退)\`,0)) AS two
                ,SUM(IF(MONTH(日期)=3,\`利润-销售数量(扣退)\`,0)) AS three
                ,SUM(IF(MONTH(日期)=4,\`利润-销售数量(扣退)\`,0)) AS four
                ,SUM(IF(MONTH(日期)=5,\`利润-销售数量(扣退)\`,0)) AS five
                ,SUM(IF(MONTH(日期)=6,\`利润-销售数量(扣退)\`,0)) AS six
                ,SUM(IF(MONTH(日期)=7,\`利润-销售数量(扣退)\`,0)) AS seven
                ,SUM(IF(MONTH(日期)=8,\`利润-销售数量(扣退)\`,0)) AS eight
                ,SUM(IF(MONTH(日期)=9,\`利润-销售数量(扣退)\`,0)) AS nine
                ,SUM(IF(MONTH(日期)=10,\`利润-销售数量(扣退)\`,0)) AS ten
                ,SUM(IF(MONTH(日期)=11,\`利润-销售数量(扣退)\`,0)) AS eleven
                ,SUM(IF(MONTH(日期)=12,\`利润-销售数量(扣退)\`,0)) AS twelve
                ,SUM(\`利润-销售数量(扣退)\`) AS sum
            FROM danpin.sku_code_sale
            WHERE 日期 BETWEEN '2024-01-01' AND '2025-12-31' and 店铺名称 !='京东自营-厨具'
            GROUP BY 店铺名称,YEAR(日期)
            UNION ALL
            SELECT '2024' AS year
                ,'京东自营-厨具' AS shop_name
                ,SUM(IF(MONTH(日期)=1,发货商品件数,0)) AS one
                ,SUM(IF(MONTH(日期)=2,发货商品件数,0)) AS two
                ,SUM(IF(MONTH(日期)=3,发货商品件数,0)) AS three
                ,SUM(IF(MONTH(日期)=4,发货商品件数,0)) AS four
                ,SUM(IF(MONTH(日期)=5,发货商品件数,0)) AS five
                ,SUM(IF(MONTH(日期)=6,发货商品件数,0)) AS six
                ,SUM(IF(MONTH(日期)=7,发货商品件数,0)) AS seven
                ,SUM(IF(MONTH(日期)=8,发货商品件数,0)) AS eight
                ,SUM(IF(MONTH(日期)=9,发货商品件数,0)) AS nine
                ,SUM(IF(MONTH(日期)=10,发货商品件数,0)) AS ten
                ,SUM(IF(MONTH(日期)=11,发货商品件数,0)) AS eleven
                ,SUM(IF(MONTH(日期)=12,发货商品件数,0)) AS twelve
                ,SUM(发货商品件数) AS sum
            FROM (
                SELECT 日期,IF(b.数量 IS NOT NULL,a.发货商品件数*b.数量,a.发货商品件数) AS '发货商品件数' FROM danpin.jbzz_month AS a
                LEFT JOIN danpin.combination_product_code AS b
                ON a.商品编码 = b.组合商品编码
            )AS a where YEAR(a.日期) =2024
            UNION ALL
            SELECT '2025' AS year
                ,'京东自营-厨具' AS shop_name
                ,SUM(IF(MONTH(时间)=1,成交商品件数,0)) AS one
                ,SUM(IF(MONTH(时间)=2,成交商品件数,0)) AS two
                ,SUM(IF(MONTH(时间)=3,成交商品件数,0)) AS three
                ,SUM(IF(MONTH(时间)=4,成交商品件数,0)) AS four
                ,SUM(IF(MONTH(时间)=5,成交商品件数,0)) AS five
                ,SUM(IF(MONTH(时间)=6,成交商品件数,0)) AS six
                ,SUM(IF(MONTH(时间)=7,成交商品件数,0)) AS seven
                ,SUM(IF(MONTH(时间)=8,成交商品件数,0)) AS eight
                ,SUM(IF(MONTH(时间)=9,成交商品件数,0)) AS nine
                ,SUM(IF(MONTH(时间)=10,成交商品件数,0)) AS ten
                ,SUM(IF(MONTH(时间)=11,成交商品件数,0)) AS eleven
                ,SUM(IF(MONTH(时间)=12,成交商品件数,0)) AS twelve
                ,SUM(成交商品件数) AS sum
            FROM (
                SELECT 时间,IF(b.数量 is not NULL,a.成交商品件数*b.数量,a.成交商品件数) AS '成交商品件数' FROM(
                    SELECT 编码,时间,成交商品件数 FROM danpin.jb_ziying WHERE 时间 BETWEEN '2025-01-01' AND '2025-12-31'
                    UNION ALL
                    SELECT 编码,时间,成交商品件数 FROM danpin.jb_ziying_everday WHERE 时间 BETWEEN '2025-01-01' AND '2025-12-31'
                ) as a
                LEFT JOIN danpin.combination_product_code AS b
            ON a.编码 = b.组合商品编码
            ) AS a)
            SELECT * FROM t1
            UNION ALL
            SELECT year, '累计' AS project,SUM(one) AS one
                ,SUM(two) AS two,SUM(three) AS three,SUM(four) AS four
                ,SUM(five) AS five,SUM(six) AS six,SUM(seven) AS seven
                ,SUM(eight) AS eight,SUM(nine) AS nine,SUM(ten) AS ten
                ,SUM(eleven) AS eleven,SUM(twelve) AS twelve,SUM(sum) AS sum
            FROM t1 GROUP BY year`
    let result = await query(sql)
    return result
}

goodsSaleInfoRepo.getProductSaleInfo = async (sku_code, addSales) => {
    let sql = `SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(profit), 0) AS profit FROM goods_sale_info s 
        WHERE sku_code IN ("${sku_code}")`
    if (addSales == '0') {
        sql = `${sql} AND EXISTS(
            SELECT * FROM jst_goods_sku g WHERE g.sys_sku_id = s.sku_code 
                AND g.shop_name = s.shop_name AND g.goods_id = s.goods_id 
                AND s.date > DATE_ADD(g.create_time, INTERVAL 14 DAY)
        )`
    }
    let row = await query(sql)
    return row
}

goodsSaleInfoRepo.getSalesBySkuAndShopAndDate = async (skuids, shops, start, end) => {
    let sql = `SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(cost_amount), 0) AS cost_amount, 
            IFNULL(SUM(profit), 0) AS profit 
        FROM goods_sale_info WHERE sku_code IN (${skuids})
            AND shop_name IN (${shops}) AND \`date\` BETWEEN ? AND ?`
    let result = await query(sql, [start, end])
    return result
}

goodsSaleInfoRepo.getQtyBySkuAndShopAndDate = async (skuids, shops, start, end) => {
    let sql = `SELECT IFNULL(SUM(sale_qty), 0) AS sale_qty, IFNULL(SUM(cost_amount), 0) AS cost_amount, sku_code 
        FROM goods_sale_info WHERE sku_code IN (${skuids})
            AND shop_name IN (${shops}) AND \`date\` BETWEEN ? AND ? 
        GROUP BY sku_code`
    let result = await query(sql, [start, end])
    return result
}

/**
 * negative profit count without invalid link & unsalable link
 * @param {*} shopNames 
 * @param {*} start 
 * @param {*} end 
 * @param {*} shopNames1 
 * @returns 
 */
goodsSaleInfoRepo.getNegativeProfitByShopNamesAndTime = async (shopNames, start, end, shopNames1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s 
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? AND shop_name IN ("${shopNames}") 
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销' 
                OR d.is_price_comparison IS NOT NULL) 
        WHERE s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND a.profit < 0 AND d.id IS NULL `
    let params = [start, end]
    if (shopNames1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND is_price_comparison IS NULL) s LEFT JOIN (
                SELECT IFNULL(SUM(profit), 0) AS profit, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND a.profit < 0) c`
        params.push(start, end)
    }
    const result = await query(sql, params)
    return result
}

/**
 * child negative profit count without invalid link & unsalable link
 * @param {*} shopNames 
 * @param {*} start 
 * @param {*} end 
 * @param {*} shopNames1 
 * @returns 
 */
goodsSaleInfoRepo.getChildNegativeProfitByShopNamesAndTime = async (shopNames, start, end, shopNames1) => {
    let sql = `SELECT COUNT(1) AS count, type, volume_target FROM (
        SELECT IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
            s.goods_id, d.volume_target FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s 
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? AND shop_name IN ("${shopNames}") 
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) AND 
                (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) AND d.is_price_comparison IS NULL 
        WHERE s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND a.profit < 0 
            AND d.volume_target IS NOT NULL 
        GROUP BY IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
            s.goods_id, d.volume_target) a1 GROUP BY type, volume_target `
    let params = [start, end]
    if (shopNames1) {
        sql = `SELECT SUM(count) AS count, type, volume_target FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(1) AS count, type, volume_target FROM (
                SELECT IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
                    s.goods_id, s.volume_target FROM (
                SELECT brief_name AS goods_id, onsale_date, volume_target FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND is_price_comparison IS NULL AND volume_target IS NOT NULL) s LEFT JOIN (
                SELECT IFNULL(SUM(profit), 0) AS profit, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND a.profit < 0
            GROUP BY IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
                s.goods_id, s.volume_target) b1 GROUP BY type, volume_target) c 
        GROUP BY type, volume_target`
        params.push(start, end)
    }
    const result = await query(sql, params)
    return result
}

/**
 * negative profit count without invalid link & unsalable link
 * @param {*} links 
 * @param {*} start 
 * @param {*} end 
 * @param {*} links1 
 * @returns 
 */
goodsSaleInfoRepo.getNegativeProfitByLinksAndTime = async (links, start, end, links1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s 
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? AND goods_id IN ("${links}") 
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销' 
                OR d.is_price_comparison IS NOT NULL) 
        WHERE s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND a.profit < 0 AND d.id IS NULL `
    let params = [start, end]
    if (links1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND is_price_comparison IS NULL) s LEFT JOIN (
                SELECT IFNULL(SUM(profit), 0) AS profit, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? AND goods_id IN ("${links1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND a.profit < 0) c`
        params.push(start, end)
    }
    const result = await query(sql, params)
    return result
}

/**
 * child negative profit count without invalid link & unsalable link
 * @param {*} links 
 * @param {*} start 
 * @param {*} end 
 * @param {*} links1 
 * @returns 
 */
goodsSaleInfoRepo.getChildNegativeProfitByLinksAndTime = async (links, start, end, links1) => {
    let sql = `SELECT COUNT(1) AS count, type, volume_target FROM (
        SELECT IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
            s.goods_id, d.volume_target FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s 
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? AND goods_id IN ("${links}") 
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) AND 
                (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) AND d.is_price_comparison IS NULL 
        WHERE s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND a.profit < 0 
            AND d.volume_target IS NOT NULL 
        GROUP BY IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
            s.goods_id, d.volume_target) a1 GROUP BY type, volume_target `
    let params = [start, end]
    if (links1) {
        sql = `SELECT SUM(count) AS count, type, volume_target FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(1) AS count, type, volume_target FROM (
                SELECT IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
                    s.goods_id, s.volume_target FROM (
                SELECT brief_name AS goods_id, onsale_date, volume_target FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND is_price_comparison IS NULL AND volume_target IS NOT NULL) s LEFT JOIN (
                SELECT IFNULL(SUM(profit), 0) AS profit, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? AND goods_id IN ("${links1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND a.profit < 0
            GROUP BY IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
                s.goods_id, s.volume_target) b1 GROUP BY type, volume_target) c 
        GROUP BY type, volume_target`
        params.push(start, end)
    }
    const result = await query(sql, params)
    return result
}

/**
 * low profit count without jdzy and invalid link & unsalable link
 * @param {*} shopNames 
 * @param {*} shopNames1 
 * @returns 
 */
goodsSaleInfoRepo.getLowProfitByShopNamesAndTime = async (shopNames, shopNames1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s 
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames}") 
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) AND 
                (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) AND d.is_price_comparison IS NULL 
        WHERE (s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            OR (s.create_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) AND d.product_stage = '控')) 
            AND a.profit < a.sale_amount * 0.18 AND a.profit >= 0 `
    let params = []
    if (shopNames1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date, product_stage FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND is_price_comparison IS NULL) s 
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                    AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE (s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
                OR (s.onsale_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) AND s.product_stage = '控')) 
                AND a.profit < a.sale_amount * 0.18 AND a.profit >= 0) c`
    }
    const result = await query(sql, params)
    return result
}

/**
 * child low profit count without jdzy and invalid link & unsalable link
 * @param {*} shopNames 
 * @param {*} shopNames1 
 * @returns 
 */
goodsSaleInfoRepo.getChildLowProfitByShopNamesAndTime = async (shopNames, shopNames1) => {
    let sql = `SELECT COUNT(1) AS count, type, volume_target FROM (
        SELECT IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
            s.goods_id, d.volume_target FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' AND shop_name IN ("${shopNames}") GROUP BY goods_id) s 
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames}") 
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) AND 
                (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) AND d.is_price_comparison IS NULL 
        WHERE (s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            OR (s.create_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) AND d.product_stage = '控')) 
            AND a.profit < a.sale_amount * 0.18 AND a.profit >= 0 AND d.volume_target IS NOT NULL 
        GROUP BY IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
            s.goods_id, d.volume_target) a1 GROUP BY type, volume_target `
    let params = []
    if (shopNames1) {
        sql = `SELECT SUM(count) AS count, type, volume_target FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(1) AS count, type, volume_target FROM (
                SELECT IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
                    s.goods_id, s.volume_target FROM (
                SELECT brief_name AS goods_id, onsale_date, product_stage, volume_target FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) AND is_price_comparison IS NULL) s 
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                    AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE (s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
                OR (s.onsale_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) AND s.product_stage = '控')) 
                AND a.profit < a.sale_amount * 0.18 AND a.profit >= 0 AND s.volume_target IS NOT NULL 
            GROUP BY IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
                s.goods_id, s.volume_target) b1 GROUP BY type, volume_target) c GROUP BY type, volume_target`
    }
    const result = await query(sql, params)
    return result
}

/**
 * low profit count without jdzy and invalid link & unsalable link
 * @param {*} links
 * @param {*} links1 
 * @returns 
 */
goodsSaleInfoRepo.getLowProfitByLinksAndTime = async (links, links1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s 
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND goods_id IN ("${links}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) AND 
                (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) AND d.is_price_comparison IS NULL 
        WHERE (s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            OR (s.create_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) AND d.product_stage = '控')) 
            AND a.profit < a.sale_amount * 0.18 AND a.profit >= 0 `
    let params = []
    if (links1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date, product_stage FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND is_price_comparison IS NULL) s 
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                    AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND goods_id IN ("${links1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE (s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
                OR (s.onsale_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) AND s.product_stage = '控')) 
                AND a.profit < a.sale_amount * 0.18 AND a.profit >= 0) c`
    }
    const result = await query(sql, params)
    return result
}

/**
 * child low profit count without jdzy and invalid link & unsalable link
 * @param {*} shopNames 
 * @param {*} shopNames1 
 * @returns 
 */
goodsSaleInfoRepo.getChildLowProfitByShopNamesAndTime = async (shopNames, shopNames1) => {
    let sql = `SELECT COUNT(1) AS count, type, volume_target FROM (
        SELECT IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
            s.goods_id, d.volume_target FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' AND shop_name IN ("${shopNames}") GROUP BY goods_id) s 
        LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames}") 
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) AND 
                (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) AND d.is_price_comparison IS NULL 
        WHERE (s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            OR (s.create_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) AND d.product_stage = '控')) 
            AND a.profit < a.sale_amount * 0.18 AND a.profit >= 0 AND d.volume_target IS NOT NULL 
        GROUP BY IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
            s.goods_id, d.volume_target) a1 GROUP BY type, volume_target `
    let params = []
    if (shopNames1) {
        sql = `SELECT SUM(count) AS count, type, volume_target FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(1) AS count, type, volume_target FROM (
                SELECT IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
                    s.goods_id, s.volume_target FROM (
                SELECT brief_name AS goods_id, onsale_date, product_stage, volume_target FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) AND is_price_comparison IS NULL) s 
            LEFT JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                    AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE (s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
                OR (s.onsale_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) AND s.product_stage = '控')) 
                AND a.profit < a.sale_amount * 0.18 AND a.profit >= 0 AND s.volume_target IS NOT NULL 
            GROUP BY IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
                s.goods_id, s.volume_target) b1 GROUP BY type, volume_target) c GROUP BY type, volume_target`
    }
    const result = await query(sql, params)
    return result
}

/**
 * none promotion count without invalid link & unsalable link
 * @param {*} shopNames 
 * @param {*} start 
 * @param {*} end 
 * @param {*} shopNames1 
 * @returns 
 */
goodsSaleInfoRepo.getNullPromotionByShopNamesAndTime = async (shopNames, start, end, shopNames1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s 
        LEFT JOIN (SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? AND shop_name IN ("${shopNames}") 
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销' 
                OR d.is_price_comparison IS NOT NULL) 
        WHERE a.promotion_amount = 0 AND d.id IS NULL AND s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY) `
    let params = [start, end]
    if (shopNames1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND is_price_comparison IS NULL) s LEFT JOIN (
                SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE a.promotion_amount = 0 AND s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY)) c`
        params.push(start, end)
    }
    const result = await query(sql, params)
    return result
}

/**
 * child none promotion count without invalid link & unsalable link
 * @param {*} shopNames 
 * @param {*} start 
 * @param {*} end 
 * @param {*} shopNames1 
 * @returns 
 */
goodsSaleInfoRepo.getChildNullPromotionByShopNamesAndTime = async (shopNames, start, end, shopNames1) => {
    let sql = `SELECT COUNT(1) AS count, type, volume_target FROM (
        SELECT IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
            s.goods_id, d.volume_target FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' AND shop_name IN ("${shopNames}") GROUP BY goods_id) s 
        LEFT JOIN (SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? AND shop_name IN ("${shopNames}") 
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) AND 
                (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) AND d.is_price_comparison IS NULL 
        WHERE a.promotion_amount = 0 AND s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY) 
            AND d.volume_target IS NOT NULL 
        GROUP BY IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
            s.goods_id, d.volume_target) a1 GROUP BY type, volume_target`
    let params = [start, end]
    if (shopNames1) {
        sql = `SELECT SUM(count) AS count, type, volume_target FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(1) AS count, type, volume_target FROM (
                SELECT IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
                    s.goods_id, s.volume_target FROM (
                SELECT brief_name AS goods_id, onsale_date, volume_target FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND is_price_comparison IS NULL AND volume_target IS NOT NULL) s LEFT JOIN (
                SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE a.promotion_amount = 0 AND s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY) 
            GROUP BY IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
                s.goods_id, s.volume_target) b1 GROUP BY type, volume_target) c GROUP BY type, volume_target`
        params.push(start, end)
    }
    const result = await query(sql, params)
    return result
}

/**
 * none promotion count without invalid link & unsalable link
 * @param {*} links 
 * @param {*} start 
 * @param {*} end 
 * @param {*} links1 
 * @returns 
 */
goodsSaleInfoRepo.getNullPromotionByLinksAndTime = async (links, start, end, links1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s 
        LEFT JOIN (SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? AND goods_id IN ("${links}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销' 
                OR d.is_price_comparison IS NOT NULL) 
        WHERE a.promotion_amount = 0 AND d.id IS NULL AND s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY) `
    let params = [start, end]
    if (links1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND is_price_comparison IS NULL) s LEFT JOIN (
                SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? AND goods_id IN ("${links1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE a.promotion_amount = 0 AND s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY)) c`
        params.push(start, end)
    }
    const result = await query(sql, params)
    return result
}

/**
 * child none promotion count without invalid link & unsalable link
 * @param {*} links 
 * @param {*} start 
 * @param {*} end 
 * @param {*} links1 
 * @returns 
 */
goodsSaleInfoRepo.getChildNullPromotionByLinksAndTime = async (links, start, end, links1) => {
    let sql = `SELECT COUNT(1) AS count, type, volume_target FROM (
        SELECT IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
            s.goods_id, d.volume_target FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' AND goods_id IN ("${links}") GROUP BY goods_id) s 
        LEFT JOIN (SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? AND goods_id IN ("${links}") 
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) AND 
                (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) AND d.is_price_comparison IS NULL 
        WHERE a.promotion_amount = 0 AND s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY) 
            AND d.volume_target IS NOT NULL 
        GROUP BY IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
            s.goods_id, d.volume_target) a1 GROUP BY type, volume_target`
    let params = [start, end]
    if (links1) {
        sql = `SELECT SUM(count) AS count, type, volume_target FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(1) AS count, type, volume_target FROM (
                SELECT IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
                    s.goods_id, s.volume_target FROM (
                SELECT brief_name AS goods_id, onsale_date, volume_target FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND is_price_comparison IS NULL AND volume_target IS NOT NULL) s LEFT JOIN (
                SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? AND goods_id IN ("${links1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE a.promotion_amount = 0 AND s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY) 
            GROUP BY IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
                s.goods_id, s.volume_target) b1 GROUP BY type, volume_target) c GROUP BY type, volume_target`
        params.push(start, end)
    }
    const result = await query(sql, params)
    return result
}

/**
 * low promotion count without jdzy and invalid link & unsalable link
 * @param {*} shopNames 
 * @param {*} start 
 * @param {*} end 
 * @param {*} promotion_rate 
 * @param {*} shopNames1 
 * @returns 
 */
goodsSaleInfoRepo.getLowPromotionByShopNamesAndTime = async (shopNames, start, end, promotion_rate, shopNames1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s 
        JOIN (SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? AND shop_name IN ("${shopNames}") 
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销'
                OR d.is_price_comparison IS NOT NULL) 
        WHERE a.promotion_amount < a.sale_amount * ? AND a.promotion_amount > 0 AND d.id IS NULL 
            AND s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY)`
    let params = [start, end, promotion_rate]
    if (shopNames1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND is_price_comparison IS NULL) s JOIN (
                SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE a.promotion_amount < a.sale_amount * ? AND a.promotion_amount > 0 
                AND s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY)) c`
        params.push(start, end, promotion_rate)
    }
    const result = await query(sql, params)
    return result
}

/**
 * child low promotion count without jdzy and invalid link & unsalable link
 * @param {*} shopNames 
 * @param {*} start 
 * @param {*} end 
 * @param {*} promotion_rate 
 * @param {*} shopNames1 
 * @returns 
 */
goodsSaleInfoRepo.getChildLowPromotionByShopNamesAndTime = async (shopNames, start, end, promotion_rate, shopNames1) => {
    let sql = `SELECT COUNT(1) AS count, type, volume_target FROM (
        SELECT IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
            s.goods_id, d.volume_target FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s 
        JOIN (SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? AND shop_name IN ("${shopNames}") 
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) AND 
                (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) AND d.is_price_comparison IS NULL 
        WHERE a.promotion_amount < a.sale_amount * ? AND a.promotion_amount > 0 
            AND s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY) AND d.volume_target IS NOT NULL 
        GROUP BY IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
            s.goods_id, d.volume_target) a1 GROUP BY type, volume_target`
    let params = [start, end, promotion_rate]
    if (shopNames1) {
        sql = `SELECT SUM(count) AS count, type, volume_target FROM (
            ${sql}
            UNION ALL
            SELECT COUNT(1) AS count, type, volume_target FROM ( 
                SELECT IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
                    s.goods_id, s.volume_target FROM (
                SELECT brief_name AS goods_id, onsale_date, volume_target FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND is_price_comparison IS NULL AND volume_target IS NOT NULL ) s JOIN (
                SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE a.promotion_amount < a.sale_amount * ? AND a.promotion_amount > 0 
                AND s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY) 
            GROUP BY IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
                s.goods_id, s.volume_target) b1 GROUP BY type, volume_target) c GROUP BY type, volume_target`
        params.push(start, end, promotion_rate)
    }
    const result = await query(sql, params)
    return result
}

/**
 * low promotion count without jdzy and invalid link & unsalable link
 * @param {*} links 
 * @param {*} start 
 * @param {*} end 
 * @param {*} promotion_rate 
 * @param {*} links1 
 * @returns 
 */
goodsSaleInfoRepo.getLowPromotionByLinksAndTime = async (links, start, end, promotion_rate, links1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s 
        JOIN (SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? AND goods_id IN ("${links}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销'
                OR d.is_price_comparison IS NOT NULL) 
        WHERE a.promotion_amount < a.sale_amount * ? AND a.promotion_amount > 0 AND d.id IS NULL 
            AND s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY) `
    let params = [start, end, promotion_rate]
    if (links1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND is_price_comparison IS NULL) s JOIN (
                SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? AND goods_id IN ("${links1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE a.promotion_amount < a.sale_amount * ? AND a.promotion_amount > 0 
                AND s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY)) c`
        params.push(start, end, promotion_rate)
    }
    const result = await query(sql, params)
    return result
}

/**
 * child low promotion count without jdzy and invalid link & unsalable link
 * @param {*} links 
 * @param {*} start 
 * @param {*} end 
 * @param {*} promotion_rate 
 * @param {*} links1 
 * @returns 
 */
goodsSaleInfoRepo.getChildLowPromotionByLinksAndTime = async (links, start, end, promotion_rate, links1) => {
    let sql = `SELECT COUNT(1) AS count, type, volume_target FROM (
        SELECT IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
            s.goods_id, d.volume_target FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' AND goods_id IN ("${links}") GROUP BY goods_id) s 
        JOIN (SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN ? AND ? AND goods_id IN ("${links}") 
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) AND 
                (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) AND d.is_price_comparison IS NULL 
        WHERE a.promotion_amount < a.sale_amount * ? AND a.promotion_amount > 0 
            AND s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY) AND d.volume_target IS NOT NULL 
        GROUP BY IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
            s.goods_id, d.volume_target) a1 GROUP BY type, volume_target`
    let params = [start, end, promotion_rate]
    if (links1) {
        sql = `SELECT SUM(count) AS count, type, volume_target FROM (
            ${sql}
            UNION ALL
            SELECT COUNT(1) AS count, type, volume_target FROM ( 
                SELECT IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
                    s.goods_id, s.volume_target FROM (
                SELECT brief_name AS goods_id, onsale_date, volume_target FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND is_price_comparison IS NULL AND volume_target IS NOT NULL ) s JOIN (
                SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN ? AND ? AND goods_id IN ("${links1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE a.promotion_amount < a.sale_amount * ? AND a.promotion_amount > 0 
                AND s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY) 
            GROUP BY IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
                s.goods_id, s.volume_target) b1 GROUP BY type, volume_target) c GROUP BY type, volume_target`
        params.push(start, end, promotion_rate)
    }
    const result = await query(sql, params)
    return result
}

/**
 * tmall low roi count without unsalable link 
 * s = sale_amount, c = cost_amount, p = promotion_amount
 * create_time > 60: s / p < s / (0.67 * s - c) + 0.5 ===> s * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 *                   ===> p * c < s * (2.67 * p + 2 * c - 1.34 * s) 
 * create_time <= 60: s / p < s / (s - c) ===> s < p + c
 * @param {*} shopNames 
 * @returns 
 */
goodsSaleInfoRepo.getLowROIByShopNamesAndTime = async (shopNames) => {
    const sql = `SELECT COUNT(DISTINCT a.goods_id) AS count FROM (
            SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)  
                AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = a.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销' 
                OR d.product_stage IN ('起', '未起')) 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s ON s.goods_id = a.goods_id
        WHERE IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), 
                a.promotion_amount * a.cost_amount < a.sale_amount * 
                (2.67 * a.promotion_amount + 2 * a.cost_amount - 1.34 * a.sale_amount), 
                a.sale_amount < a.promotion_amount + a.cost_amount) AND d.id IS NULL`
    const result = await query(sql)
    return result
}

/**
 * child tmall low roi count without unsalable link 
 * s = sale_amount, c = cost_amount, p = promotion_amount
 * create_time > 60: s / p < s / (0.67 * s - c) + 0.5 ===> s * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 *                   ===> p * c < s * (2.67 * p + 2 * c - 1.34 * s) 
 * create_time <= 60: s / p < s / (s - c) ===> s < p + c
 * @param {*} shopNames 
 * @returns 
 */
goodsSaleInfoRepo.getChildLowROIByShopNamesAndTime = async (shopNames) => {
    const sql = `SELECT COUNT(1) AS count, type, volume_target FROM (
        SELECT IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
            s.goods_id, d.volume_target FROM (
            SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)  AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = a.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) AND 
                (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) 
            AND (d.product_stage NOT IN ('起', '未起') OR d.product_stage IS NULL) 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s ON s.goods_id = a.goods_id
        WHERE IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), 
                a.promotion_amount * a.cost_amount < a.sale_amount * 
                (2.67 * a.promotion_amount + 2 * a.cost_amount - 1.34 * a.sale_amount), 
                a.sale_amount < a.promotion_amount + a.cost_amount) AND d.volume_target IS NOT NULL 
        GROUP BY IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
            s.goods_id, d.volume_target) a1 GROUP BY type, volume_target`
    const result = await query(sql)
    return result
}

/**
 * pdd low roi count without unsalable link 
 * s = sale_amount, c = cost_amount, p = promotion_amount
 * s / p < s / (0.67 * s - c) + 0.5 ===> s * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 * ===> p * c < s * (2.67 * p + 2 * c - 1.34 * s) 
 * @param {*} shopNames 
 * @returns
 */
goodsSaleInfoRepo.getLowROIByShopNamesAndTime1 = async (shopNames) => {
    const sql = `SELECT COUNT(DISTINCT a.goods_id) AS count FROM (
            SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)  
                AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = a.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销' 
                OR d.product_stage IN ('起', '未起')) 
        WHERE a.promotion_amount * a.cost_amount < a.sale_amount * 
                (2.67 * a.promotion_amount + 2 * a.cost_amount - 1.34 * a.sale_amount) 
            AND d.id IS NULL`
    const result = await query(sql)
    return result
}

/**
 * child pdd low roi count without unsalable link 
 * s = sale_amount, c = cost_amount, p = promotion_amount
 * s / p < s / (0.67 * s - c) + 0.5 ===> s * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 * ===> p * c < s * (2.67 * p + 2 * c - 1.34 * s) 
 * @param {*} shopNames 
 * @returns
 */
goodsSaleInfoRepo.getChildLowROIByShopNamesAndTime1 = async (shopNames) => {
    const sql = `SELECT COUNT(1) AS count, type, volume_target FROM (
        SELECT IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
            s.goods_id, d.volume_target FROM (
            SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames}") 
            GROUP BY goods_id) a LEFT JOIN ( 
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' AND shop_name IN ("${shopNames}") 
            GROUP BY goods_id) s ON s.goods_id = a.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = a.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) AND 
                (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) 
            AND (d.product_stage NOT IN ('起', '未起') OR d.product_stage IS NULL) 
        WHERE a.promotion_amount * a.cost_amount < a.sale_amount * 
                (2.67 * a.promotion_amount + 2 * a.cost_amount - 1.34 * a.sale_amount) 
             AND d.volume_target IS NOT NULL
        GROUP BY IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
            s.goods_id, d.volume_target) a1 GROUP BY type, volume_target`
    const result = await query(sql)
    return result
}

/**
 * jd low roi count without unsalable link 
 * s = sale_amount, c = cost_amount, p = promotion_amount, p1 = profit, rs = real_sale_amount
 * normal jd: s / p < s / (0.67 * s - c) + 0.5 ===> s * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 *            ===> p * c < s * (2.67 * p + 2 * c - 1.34 * s) 
 * jdzy: s / p < rs / (p - 0.15) + 0.5 ===> s * (2 * p1 - 0.3) < p * (rs + p1 - 0.15)
 * @param {*} shopNames 
 * @param {*} shopNames1 
 * @returns 
 */
goodsSaleInfoRepo.getLowROIByShopNamesAndTime2 = async (shopNames, shopNames1) => {
    let sql = `SELECT COUNT(DISTINCT a.goods_id) AS count FROM (
            SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = a.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销' 
                OR d.product_stage IN ('起', '未起')) 
        WHERE a.promotion_amount * a.cost_amount < a.sale_amount * 
                (2.67 * a.promotion_amount + 2 * a.cost_amount - 1.34 * a.sale_amount) 
            AND d.id IS NULL`
    if (shopNames1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND (product_stage NOT IN ('起', '未起') OR product_stage IS NULL)) s JOIN (
                SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                    IFNULL(SUM(real_sale_amount), 0) AS real_sale_amount, 
                    IFNULL(SUM(profit), 0) AS profit, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                    AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE a.sale_amount * (2 * a.profit - 0.3) < a.promotion_amount * 
                    (a.real_sale_amount + a.profit - 0.15)) c`
    }
    const result = await query(sql)
    return result
}

/**
 * child jd low roi count without unsalable link 
 * s = sale_amount, c = cost_amount, p = promotion_amount, p1 = profit, rs = real_sale_amount
 * normal jd: s / p < s / (0.67 * s - c) + 0.5 ===> s * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 *            ===> p * c < s * (2.67 * p + 2 * c - 1.34 * s) 
 * jdzy: s / p < rs / (p - 0.15) + 0.5 ===> s * (2 * p1 - 0.3) < p * (rs + p1 - 0.15)
 * @param {*} shopNames 
 * @param {*} shopNames1 
 * @returns 
 */
goodsSaleInfoRepo.getChildLowROIByShopNamesAndTime2 = async (shopNames, shopNames1) => {
    let sql = `SELECT COUNT(1) AS count, type, volume_target FROM (
        SELECT IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
            s.goods_id, d.volume_target FROM (
            SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a LEFT JOIN (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' AND shop_name IN ("${shopNames}") 
            GROUP BY goods_id) s ON s.goods_id = a.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = a.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) AND 
                (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) 
            AND (d.product_stage NOT IN ('起', '未起') OR d.product_stage IS NULL) 
        WHERE a.promotion_amount * a.cost_amount < a.sale_amount * 
                (2.67 * a.promotion_amount + 2 * a.cost_amount - 1.34 * a.sale_amount) 
             AND d.volume_target IS NOT NULL
        GROUP BY IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
            s.goods_id, d.volume_target) a1 GROUP BY type, volume_target`
    if (shopNames1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(1) AS count, type, volume_target FROM (
                SELECT IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
                    s.goods_id, s.volume_target FROM (
                SELECT brief_name AS goods_id, onsale_date, volume_target FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND (product_stage NOT IN ('起', '未起') OR product_stage IS NULL) 
                    AND volume_target IS NOT NULL) s JOIN (
                SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                    IFNULL(SUM(real_sale_amount), 0) AS real_sale_amount, 
                    IFNULL(SUM(profit), 0) AS profit, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                    AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE a.sale_amount * (2 * a.profit - 0.3) < a.promotion_amount * 
                    (a.real_sale_amount + a.profit - 0.15) 
            GROUP BY IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
                s.goods_id, s.volume_target) b1 GROUP BY type, volume_target) c GROUP BY type, volume_target`
    }
    const result = await query(sql)
    return result
}

/**
 * tmall low roi count without unsalable link 
 * s = sale_amount, c = cost_amount, p = promotion_amount
 * create_time > 60: s / p < s / (0.67 * s - c) + 0.5 ===> s * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 *                   ===> p * c < s * (2.67 * p + 2 * c - 1.34 * s) 
 * create_time <= 60: s / p < s / (s - c) ===> s < p + c
 * @param {*} links 
 * @returns  
 */
goodsSaleInfoRepo.getLowROIByLinksAndTime = async (links) => {
    const sql = `SELECT COUNT(DISTINCT a.goods_id) AS count FROM (
            SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)  
                AND goods_id IN ("${links}")
            GROUP BY goods_id) a 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = a.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销' 
                OR d.product_stage IN ('起', '未起')) 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s ON s.goods_id = a.goods_id
        WHERE IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), 
                a.promotion_amount * a.cost_amount < a.sale_amount * 
                (2.67 * a.promotion_amount + 2 * a.cost_amount - 1.34 * a.sale_amount), 
                a.sale_amount < a.promotion_amount + a.cost_amount) AND d.id IS NULL`
    const result = await query(sql)
    return result
}

/**
 * child tmall low roi count without unsalable link 
 * s = sale_amount, c = cost_amount, p = promotion_amount
 * create_time > 60: s / p < s / (0.67 * s - c) + 0.5 ===> s * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 *                   ===> p * c < s * (2.67 * p + 2 * c - 1.34 * s) 
 * create_time <= 60: s / p < s / (s - c) ===> s < p + c
 * @param {*} links 
 * @returns 
 */
goodsSaleInfoRepo.getChildLowROIByLinksAndTime = async (links) => {
    const sql = `SELECT COUNT(1) AS count, type, volume_target FROM (
        SELECT IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
            s.goods_id, d.volume_target FROM (
            SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)  AND goods_id IN ("${links}")
            GROUP BY goods_id) a 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = a.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) AND 
                (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) 
            AND (d.product_stage NOT IN ('起', '未起') OR d.product_stage IS NULL) 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s ON s.goods_id = a.goods_id
        WHERE IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), 
                a.promotion_amount * a.cost_amount < a.sale_amount * 
                (2.67 * a.promotion_amount + 2 * a.cost_amount - 1.34 * a.sale_amount), 
                a.sale_amount < a.promotion_amount + a.cost_amount) AND d.volume_target IS NOT NULL 
        GROUP BY IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
            s.goods_id, d.volume_target) a1 GROUP BY type, volume_target`
    const result = await query(sql)
    return result
}

/**
 * pdd low roi count without unsalable link 
 * s = sale_amount, c = cost_amount, p = promotion_amount
 * s / p < s / (0.67 * s - c) + 0.5 ===> s * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 * ===> p * c < s * (2.67 * p + 2 * c - 1.34 * s) 
 * @param {*} links 
 * @returns 
 * @returns 
 */
goodsSaleInfoRepo.getLowROIByLinksAndTime1 = async (links) => {
    const sql = `SELECT COUNT(DISTINCT a.goods_id) AS count FROM (
            SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)  
                AND goods_id IN ("${links}")
            GROUP BY goods_id) a 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = a.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销' 
                OR d.product_stage IN ('起', '未起')) 
        WHERE a.promotion_amount * a.cost_amount < a.sale_amount * 
                (2.67 * a.promotion_amount + 2 * a.cost_amount - 1.34 * a.sale_amount) 
            AND d.id IS NULL`
    const result = await query(sql)
    return result
}

/**
 * child pdd low roi count without unsalable link 
 * s = sale_amount, c = cost_amount, p = promotion_amount
 * s / p < s / (0.67 * s - c) + 0.5 ===> s * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 * ===> p * c < s * (2.67 * p + 2 * c - 1.34 * s) 
 * @param {*} links 
 * @returns
 */
goodsSaleInfoRepo.getChildLowROIByLinksAndTime1 = async (links) => {
    const sql = `SELECT COUNT(1) AS count, type, volume_target FROM (
        SELECT IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
            s.goods_id, d.volume_target FROM (
            SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND goods_id IN ("${links}") 
            GROUP BY goods_id) a LEFT JOIN ( 
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' AND goods_id IN ("${links}") 
            GROUP BY goods_id) s ON s.goods_id = a.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = a.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) AND 
                (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) 
            AND (d.product_stage NOT IN ('起', '未起') OR d.product_stage IS NULL) 
        WHERE a.promotion_amount * a.cost_amount < a.sale_amount * 
                (2.67 * a.promotion_amount + 2 * a.cost_amount - 1.34 * a.sale_amount) 
             AND d.volume_target IS NOT NULL
        GROUP BY IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
            s.goods_id, d.volume_target) a1 GROUP BY type, volume_target`
    const result = await query(sql)
    return result
}

/**
 * jd low roi count without unsalable link 
 * s = sale_amount, c = cost_amount, p = promotion_amount, p1 = profit, rs = real_sale_amount
 * normal jd: s / p < s / (0.67 * s - c) + 0.5 ===> s * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 *            ===> p * c < s * (2.67 * p + 2 * c - 1.34 * s) 
 * jdzy: s / p < rs / (p + p1 - 0.15 * rs) + 0.5 
 *       ===> s * (2 * p1 + 2 * p - 0.3 * rs) < p * (1.85 * rs + p1 + p)
 * @param {*} links 
 * @param {*} links1 
 * @returns 
 */
goodsSaleInfoRepo.getLowROIByLinksAndTime2 = async (links, links1) => {
    let sql = `SELECT COUNT(DISTINCT a.goods_id) AS count FROM (
            SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)  
                AND shop_name IN ("${links}")
            GROUP BY goods_id) a 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = a.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销' 
                OR d.product_stage IN ('起', '未起')) 
        WHERE a.promotion_amount * a.cost_amount < a.sale_amount * 
                (2.67 * a.promotion_amount + 2 * a.cost_amount - 1.34 * a.sale_amount) 
            AND d.id IS NULL`
    if (links1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND (product_stage NOT IN ('起', '未起') OR product_stage IS NULL)) s JOIN (
                SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                    IFNULL(SUM(real_sale_amount), 0) AS real_sale_amount, 
                    IFNULL(SUM(profit), 0) AS profit, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                    AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
                    AND shop_name IN ("${links1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE a.sale_amount * (2 * a.profit + 2 * a.promotion_amount - 0.3 * a.real_sale_amount) < 
                a.promotion_amount * (1.85 * a.real_sale_amount + a.profit + a.promotion_amount)) c`
    }
    const result = await query(sql)
    return result
}

/**
 * child jd low roi count without unsalable link 
 * s = sale_amount, c = cost_amount, p = promotion_amount, p1 = profit, rs = real_sale_amount
 * normal jd: s / p < s / (0.67 * s - c) + 0.5 ===> s * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 *            ===> p * c < s * (2.67 * p + 2 * c - 1.34 * s) 
 * jdzy: s / p < rs / (p - 0.15) + 0.5 ===> s * (2 * p1 - 0.3) < p * (rs + p1 - 0.15)
 * @param {*} links 
 * @param {*} shopNames1 
 * @returns 
 */
goodsSaleInfoRepo.getChildLowROIByShopNamesAndTime2 = async (links, links1) => {
    let sql = `SELECT COUNT(1) AS count, type, volume_target FROM (
        SELECT IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
            s.goods_id, d.volume_target FROM (
            SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND goods_id IN ("${links}")
            GROUP BY goods_id) a LEFT JOIN (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' AND goods_id IN ("${links}") 
            GROUP BY goods_id) s ON s.goods_id = a.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = a.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) AND 
                (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) 
            AND (d.product_stage NOT IN ('起', '未起') OR d.product_stage IS NULL) 
        WHERE a.promotion_amount * a.cost_amount < a.sale_amount * 
                (2.67 * a.promotion_amount + 2 * a.cost_amount - 1.34 * a.sale_amount) 
             AND d.volume_target IS NOT NULL
        GROUP BY IF(s.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
            s.goods_id, d.volume_target) a1 GROUP BY type, volume_target`
    if (links1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(1) AS count, type, volume_target FROM (
                SELECT IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品') AS type, 
                    s.goods_id, s.volume_target FROM (
                SELECT brief_name AS goods_id, onsale_date, volume_target FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND (product_stage NOT IN ('起', '未起') OR product_stage IS NULL) 
                    AND volume_target IS NOT NULL) s JOIN (
                SELECT IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                    IFNULL(SUM(real_sale_amount), 0) AS real_sale_amount, 
                    IFNULL(SUM(profit), 0) AS profit, goods_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                    AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND goods_id IN ("${links1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id 
            WHERE a.sale_amount * (2 * a.profit - 0.3) < a.promotion_amount * 
                    (a.real_sale_amount + a.profit - 0.15) 
            GROUP BY IF(s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '老品', '新品'), 
                s.goods_id, s.volume_target) b1 GROUP BY type, volume_target) c GROUP BY type, volume_target`
    }
    const result = await query(sql)
    return result
}

/**
 * tmall low plan roi count without unsalable link
 * s = sale_amount, c = cost_amount, p = pay_amount, t = trans_amount
 * old: t / p < s / (0.67 * s - c) + 0.5 ===> t * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 *      ===> 1.34 * t * s + p * c < 2 * s * p + 0.67 * p * c + 2 * t * c 
 * new: t / p < c / (s - c) ===> t * (s - c) < p * c ===> t * s < c * (p + t)
 * @param {*} shopNames 
 * @param {*} days1 
 * @param {*} days2 
 * @returns 
 */
goodsSaleInfoRepo.getLowPlanROIByShopNamesAndTime = async (shopNames, days1, days2) => {
    const sql = `SELECT SUM(count) AS count FROM (
        SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, promotion_name, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id, promotion_name) s 
        JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s1 ON s.goods_id = s1.goods_id
        WHERE s1.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            AND 1.34 * s.trans_amount * a.sale_amount + s.pay_amount * a.cost_amount < 
                2 * a.sale_amount * s.pay_amount + 0.67 * s.pay_amount * a.cost_amount + 
                    0.67 * s.trans_amount * a.cost_amount AND d.id IS NULL 
        UNION ALL
        SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, promotion_name, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id, promotion_name) s 
        JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
            AND d.product_stage IN ('稳', '控') 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s1 ON s.goods_id = s1.goods_id 
        JOIN (SELECT MIN(date) AS date, goods_id, promotion_name FROM goods_promotion_plan 
            WHERE pay_amount > 0 GROUP BY goods_id, promotion_name) p ON p.goods_id = s.goods_id 
            AND p.promotion_name = s.promotion_name 
            AND p.date <= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)
        WHERE s1.create_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            AND s.trans_amount * a.sale_amount < a.cost_amount * (s.pay_amount + s.trans_amount)
            AND d.id IS NULL) b`
    const result = await query(sql)
    return result
}

/**
 * child tmall low plan roi count without unsalable link
 * s = sale_amount, c = cost_amount, p = pay_amount, t = trans_amount
 * old: t / p < s / (0.67 * s - c) + 0.5 ===> t * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 *      ===> 1.34 * t * s + p * c < 2 * s * p + 0.67 * p * c + 2 * t * c 
 * new: t / p < c / (s - c) ===> t * (s - c) < p * c ===> t * s < c * (p + t)
 * @param {*} shopNames 
 * @param {*} days1 
 * @param {*} days2 
 * @returns 
 */
goodsSaleInfoRepo.getChildLowPlanROIByShopNamesAndTime = async (shopNames, days1, days2) => {
    const sql = `SELECT SUM(count) AS count, type, volume_target FROM (
        SELECT COUNT(1) AS count, type, volume_target FROM (
            SELECT '老品' AS type, s.goods_id, d.volume_target FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, promotion_name, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id, promotion_name) s 
        JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) 
                AND (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s1 ON s.goods_id = s1.goods_id
        WHERE s1.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            AND 1.34 * s.trans_amount * a.sale_amount + s.pay_amount * a.cost_amount < 
                2 * a.sale_amount * s.pay_amount + 0.67 * s.pay_amount * a.cost_amount + 
                    0.67 * s.trans_amount * a.cost_amount AND d.volume_target IS NOT NULL 
        GROUP BY s.goods_id, d.volume_target) a1 GROUP BY volume_target, type
        UNION ALL
        SELECT COUNT(1) AS count, type, volume_target FROM (
            SELECT '新品' AS type, s.goods_id, d.volume_target FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, promotion_name, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id, promotion_name) s 
        JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) 
                AND (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) AND d.product_stage IN ('稳', '控') 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s1 ON s.goods_id = s1.goods_id 
        JOIN (SELECT MIN(date) AS date, goods_id, promotion_name FROM goods_promotion_plan 
            WHERE pay_amount > 0 GROUP BY goods_id, promotion_name) p ON p.goods_id = s.goods_id 
            AND p.promotion_name = s.promotion_name 
            AND p.date <= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)
        WHERE s1.create_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            AND s.trans_amount * a.sale_amount < a.cost_amount * (s.pay_amount + s.trans_amount)
            AND d.volume_target IS NOT NULL
        GROUP BY s.goods_id, d.volume_target) b1 GROUP BY volume_target, type) b GROUP BY volume_target, type`
    const result = await query(sql)
    return result
}

/**
 * pdd low plan roi count without unsalable link
 * s = sale_amount, c = cost_amount, p = pay_amount, t = trans_amount
 * t / p < s / (0.67 * s - c) + 0.5 ===> t * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 * ===> 1.34 * t * s + p * c < 2 * s * p + 0.67 * p * c + 2 * t * c 
 * @param {*} shopNames 
 * @param {*} days1 
 * @param {*} days2 
 * @returns 
 */
goodsSaleInfoRepo.getLowPlanROIByShopNamesAndTime1 = async (shopNames, days1, days2) => {
    const sql = `SELECT SUM(count) AS count FROM (
        SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, promotion_name, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id, promotion_name) s 
        JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s1 ON s.goods_id = s1.goods_id
        WHERE s1.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            AND 1.34 * s.trans_amount * a.sale_amount + s.pay_amount * a.cost_amount < 
                2 * a.sale_amount * s.pay_amount + 0.67 * s.pay_amount * a.cost_amount + 
                    0.67 * s.trans_amount * a.cost_amount AND d.id IS NULL 
        UNION ALL
        SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, promotion_name, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id, promotion_name) s 
        JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销')
            AND d.product_stage IN ('稳', '控') 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s1 ON s.goods_id = s1.goods_id 
        JOIN (SELECT MIN(date) AS date, goods_id, promotion_name FROM goods_promotion_plan 
            WHERE pay_amount > 0 GROUP BY goods_id, promotion_name) p ON p.goods_id = s.goods_id 
            AND p.promotion_name = s.promotion_name 
            AND p.date <= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)
        WHERE s1.create_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            AND 1.34 * s.trans_amount * a.sale_amount + s.pay_amount * a.cost_amount < 
                2 * a.sale_amount * s.pay_amount + 0.67 * s.pay_amount * a.cost_amount + 
                    0.67 * s.trans_amount * a.cost_amount AND d.id IS NULL) b`
    const result = await query(sql)
    return result
}

/**
 * child pdd low plan roi count without unsalable link
 * s = sale_amount, c = cost_amount, p = pay_amount, t = trans_amount
 * t / p < s / (0.67 * s - c) + 0.5 ===> t * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 * ===> 1.34 * t * s + p * c < 2 * s * p + 0.67 * p * c + 2 * t * c 
 * @param {*} shopNames 
 * @param {*} days1 
 * @param {*} days2 
 * @returns 
 */
goodsSaleInfoRepo.getChildLowPlanROIByShopNamesAndTime1 = async (shopNames, days1, days2) => {
    const sql = `SELECT SUM(count) AS count, type, volume_target FROM (
        SELECT COUNT(1) AS count, type, volume_target FROM (
            SELECT '老品' AS type, s.goods_id, d.volume_target FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, promotion_name, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id, promotion_name) s 
        JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) 
                AND (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s1 ON s.goods_id = s1.goods_id
        WHERE s1.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            AND 1.34 * s.trans_amount * a.sale_amount + s.pay_amount * a.cost_amount < 
                2 * a.sale_amount * s.pay_amount + 0.67 * s.pay_amount * a.cost_amount + 
                    0.67 * s.trans_amount * a.cost_amount AND d.volume_target IS NOT NULL 
        GROUP BY s.goods_id, d.volume_target) a1 GROUP BY volume_target, type 
        UNION ALL
        SELECT COUNT(1) AS count, type, volume_target FROM (
            SELECT '新品' AS type, s.goods_id, d.volume_target FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, promotion_name, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id, promotion_name) s 
        JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) 
                AND (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) AND d.product_stage IN ('稳', '控') 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s1 ON s.goods_id = s1.goods_id 
        JOIN (SELECT MIN(date) AS date, goods_id, promotion_name FROM goods_promotion_plan 
            WHERE pay_amount > 0 GROUP BY goods_id, promotion_name) p ON p.goods_id = s.goods_id 
            AND p.promotion_name = s.promotion_name 
            AND p.date <= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)
        WHERE s1.create_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            AND 1.34 * s.trans_amount * a.sale_amount + s.pay_amount * a.cost_amount < 
                2 * a.sale_amount * s.pay_amount + 0.67 * s.pay_amount * a.cost_amount + 
                    0.67 * s.trans_amount * a.cost_amount AND d.volume_target IS NOT NULL
        GROUP BY s.goods_id, d.volume_target) b1 GROUP BY volume_target, type) b GROUP BY volume_target, type`
    const result = await query(sql)
    return result
}

/**
 * jd low plan roi count without unsalable link
 * s = sale_amount, c = cost_amount, p = pay_amount, t = trans_amount, rs = real_sale_amount, 
 * p1 = profit, p2 = promotion_amount 
 * normal: t / p < s / (0.67 * s - c) + 0.5 ===> t * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 *         ===> 1.34 * t * s + p * c < 2 * s * p + 0.67 * p * c + 2 * t * c 
 * jdzy qz: t / p < rs / (p1 + p2 - 0.15 * rs) + 0.5 
 *          ===> t * (2 * p1 + 2 * p2 - 0.3 * rs) < p * (1.85 * rs + p1 + p2)
 * jdzy other: t / p < rs / (p1 + p2) + 0.5 
 *             ===> t * (p1 + p2) < p * (rs + 0.5 * p1 + 0.5 * p2)
 * @param {*} shopNames 
 * @param {*} days1 
 * @param {*} days2 
 * @param {*} shopNames1 
 * @returns 
 */
goodsSaleInfoRepo.getLowPlanROIByShopNamesAndTime2 = async (shopNames, days1, days2, shopNames1) => {
    let sql = `SELECT SUM(count) AS count FROM (
        SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, promotion_name, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id, promotion_name) s 
        JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s1 ON s.goods_id = s1.goods_id
        WHERE s1.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            AND 1.34 * s.trans_amount * a.sale_amount + s.pay_amount * a.cost_amount < 
                2 * a.sale_amount * s.pay_amount + 0.67 * s.pay_amount * a.cost_amount + 
                    0.67 * s.trans_amount * a.cost_amount AND d.id IS NULL 
        UNION ALL
        SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, promotion_name, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id, promotion_name) s 
        JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销')
            AND d.product_stage IN ('稳', '控') 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s1 ON s.goods_id = s1.goods_id 
        JOIN (SELECT MIN(date) AS date, goods_id, promotion_name FROM goods_promotion_plan 
            WHERE pay_amount > 0 GROUP BY goods_id, promotion_name) p ON p.goods_id = s.goods_id 
            AND p.promotion_name = s.promotion_name 
            AND p.date <= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY) 
        WHERE s1.create_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            AND 1.34 * s.trans_amount * a.sale_amount + s.pay_amount * a.cost_amount < 
                2 * a.sale_amount * s.pay_amount + 0.67 * s.pay_amount * a.cost_amount + 
                    0.67 * s.trans_amount * a.cost_amount AND d.id IS NULL`
    if (shopNames1) {
        sql = `${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, sku_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY)) s JOIN (
                SELECT IFNULL(SUM(real_sale_amount), 0) AS real_sale_amount, 
                    IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(profit), 0) AS profit, goods_id, sku_id 
                FROM goods_sale_info WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                    AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames1}") 
                GROUP BY goods_id, sku_id) a ON a.goods_id = s.goods_id AND a.sku_id = s.sku_id 
                LEFT JOIN (SELECT IFNULL(SUM(trans_amount), 0) AS trans_amount, promotion_name, 
                        IFNULL(SUM(pay_amount), 0) AS pay_amount, goods_id, sku_id 
                    FROM goods_promotion_plan WHERE date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                        AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames1}")
                    GROUP BY promotion_name, goods_id, sku_id) p 
                    ON p.goods_id = s.goods_id AND p.sku_id = s.sku_id
            WHERE IF(p.promotion_name = '全站营销', p.trans_amount * (2 * a.profit + 
                    2 * a.promotion_amount - 0.3 * a.real_sale_amount) < p.pay_amount * (
                    1.85 * a.real_sale_amount + a.profit + a.promotion_amount), 
                    p.trans_amount * (a.profit + a.promotion_amount) < p.pay_amount * ( 
                    a.real_sale_amount + 0.5 * a.profit + 0.5 * a.promotion_amount)) 
                AND s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            UNION ALL
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, sku_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND product_stage IN ('稳', '控') 
                    AND onsale_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY)) s JOIN (
                SELECT IFNULL(SUM(real_sale_amount), 0) AS real_sale_amount, 
                    IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(profit), 0) AS profit, goods_id, sku_id 
                FROM goods_sale_info WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                    AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id, sku_id) a ON a.goods_id = s.goods_id AND a.sku_id = s.sku_id 
                LEFT JOIN (SELECT IFNULL(SUM(trans_amount), 0) AS trans_amount, promotion_name, 
                        IFNULL(SUM(pay_amount), 0) AS pay_amount, goods_id, sku_id 
                    FROM goods_promotion_plan WHERE date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                        AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames1}")
                    GROUP BY promotion_name, goods_id, sku_id) p 
                    ON p.goods_id = s.goods_id AND p.sku_id = s.sku_id 
                JOIN (SELECT MIN(date) AS date, goods_id, sku_id, promotion_name FROM goods_promotion_plan 
                    WHERE pay_amount > 0 GROUP BY goods_id, sku_id, promotion_name) p1 
                    ON p1.goods_id = p.goods_id AND p1.sku_id = p.sku_id 
                    AND p1.promotion_name = p.promotion_name 
                    AND p1.date <= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)
            WHERE IF(p.promotion_name = '全站营销', p.trans_amount * (2 * a.profit + 
                    2 * a.promotion_amount - 0.3 * a.real_sale_amount) < p.pay_amount * (
                    1.85 * a.real_sale_amount + a.profit + a.promotion_amount), 
                    p.trans_amount * (a.profit + a.promotion_amount) < p.pay_amount * ( 
                    a.real_sale_amount + 0.5 * a.profit + 0.5 * a.promotion_amount)) 
                AND s.onsale_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY)) b`
    } else {
        sql = `${sql}) b`
    }
    const result = await query(sql)
    return result
}

/**
 * jd low plan roi count without unsalable link
 * s = sale_amount, c = cost_amount, p = pay_amount, t = trans_amount, rs = real_sale_amount, 
 * p1 = profit, p2 = promotion_amount 
 * normal: t / p < s / (0.67 * s - c) + 0.5 ===> t * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 *         ===> 1.34 * t * s + p * c < 2 * s * p + 0.67 * p * c + 2 * t * c 
 * jdzy qz: t / p < rs / (p1 + p2 - 0.15 * rs) + 0.5 
 *          ===> t * (2 * p1 + 2 * p2 - 0.3 * rs) < p * (1.85 * rs + p1 + p2)
 * jdzy other: t / p < rs / (p1 + p2) + 0.5 
 *             ===> t * (p1 + p2) < p * (rs + 0.5 * p1 + 0.5 * p2)
 * @param {*} shopNames 
 * @param {*} days1 
 * @param {*} days2 
 * @param {*} shopNames1 
 * @returns 
 */
goodsSaleInfoRepo.getChildLowPlanROIByShopNamesAndTime2 = async (shopNames, days1, days2, shopNames1) => {
    let sql = `SELECT SUM(count) AS count, type, volume_target FROM (
        SELECT COUNT(1) AS count, type, volume_target FROM (
            SELECT '老品' AS type, s.goods_id, d.volume_target FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, promotion_name, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id, promotion_name) s 
        JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) 
                AND (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s1 ON s.goods_id = s1.goods_id
        WHERE s1.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            AND 1.34 * s.trans_amount * a.sale_amount + s.pay_amount * a.cost_amount < 
                2 * a.sale_amount * s.pay_amount + 0.67 * s.pay_amount * a.cost_amount + 
                    0.67 * s.trans_amount * a.cost_amount AND d.volume_target IS NOT NULL 
        GROUP BY s.goods_id, d.volume_target) a1 GROUP BY volume_target, type 
        UNION ALL
        SELECT COUNT(1) AS count, type, volume_target FROM (
            SELECT '新品' AS type, s.goods_id, d.volume_target FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, promotion_name, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id, promotion_name) s 
        JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) AND (d.userDef7 = '滞销' OR d.userDef7 IS NULL) 
                AND (d.link_attribute = '滞销' OR d.link_attribute IS NULL)) AND d.product_stage IN ('稳', '控') 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s1 ON s.goods_id = s1.goods_id 
        JOIN (SELECT MIN(date) AS date, goods_id, promotion_name FROM goods_promotion_plan 
            WHERE pay_amount > 0 GROUP BY goods_id, promotion_name) p ON p.goods_id = s.goods_id 
            AND p.promotion_name = s.promotion_name 
            AND p.date <= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY) 
        WHERE s1.create_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            AND 1.34 * s.trans_amount * a.sale_amount + s.pay_amount * a.cost_amount < 
                2 * a.sale_amount * s.pay_amount + 0.67 * s.pay_amount * a.cost_amount + 
                    0.67 * s.trans_amount * a.cost_amount AND d.volume_target IS NOT NULL
        GROUP BY s.goods_id, d.volume_target) b1 GROUP BY volume_target, type`
    if (shopNames1) {
        sql = `${sql}
            UNION ALL 
            SELECT COUNT(1) AS count, type, volume_target FROM (
            SELECT '老品' AS type, s.goods_id, s.volume_target FROM (
                SELECT brief_name AS goods_id, sku_id, onsale_date, volume_target FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) AND volume_target IS NOT NULL) s 
                JOIN (SELECT IFNULL(SUM(real_sale_amount), 0) AS real_sale_amount, 
                    IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(profit), 0) AS profit, goods_id, sku_id 
                FROM goods_sale_info WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                    AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames1}") 
                GROUP BY goods_id, sku_id) a ON a.goods_id = s.goods_id AND a.sku_id = s.sku_id 
                LEFT JOIN (SELECT IFNULL(SUM(trans_amount), 0) AS trans_amount, promotion_name, 
                        IFNULL(SUM(pay_amount), 0) AS pay_amount, goods_id, sku_id 
                    FROM goods_promotion_plan WHERE date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                        AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames1}")
                    GROUP BY promotion_name, goods_id, sku_id) p 
                    ON p.goods_id = s.goods_id AND p.sku_id = s.sku_id
            WHERE IF(p.promotion_name = '全站营销', p.trans_amount * (2 * a.profit + 
                    2 * a.promotion_amount - 0.3 * a.real_sale_amount) < p.pay_amount * (
                    1.85 * a.real_sale_amount + a.profit + a.promotion_amount), 
                    p.trans_amount * (a.profit + a.promotion_amount) < p.pay_amount * ( 
                    a.real_sale_amount + 0.5 * a.profit + 0.5 * a.promotion_amount)) 
                AND s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            GROUP BY s.goods_id, s.volume_target) a1 GROUP BY volume_target, type 
            UNION ALL
            SELECT COUNT(1) AS count, type, volume_target FROM (
            SELECT '老品' AS type, s.goods_id, s.volume_target FROM (
                SELECT brief_name AS goods_id, sku_id, onsale_date, volume_target FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND product_stage IN ('稳', '控') AND volume_target IS NOT NULL 
                    AND onsale_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY)) s JOIN (
                SELECT IFNULL(SUM(real_sale_amount), 0) AS real_sale_amount, 
                    IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
                    IFNULL(SUM(profit), 0) AS profit, goods_id, sku_id 
                FROM goods_sale_info WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                    AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames1}")
                GROUP BY goods_id, sku_id) a ON a.goods_id = s.goods_id AND a.sku_id = s.sku_id 
                LEFT JOIN (SELECT IFNULL(SUM(trans_amount), 0) AS trans_amount, promotion_name, 
                        IFNULL(SUM(pay_amount), 0) AS pay_amount, goods_id, sku_id 
                    FROM goods_promotion_plan WHERE date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                        AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND shop_name IN ("${shopNames1}")
                    GROUP BY promotion_name, goods_id, sku_id) p 
                    ON p.goods_id = s.goods_id AND p.sku_id = s.sku_id 
                JOIN (SELECT MIN(date) AS date, goods_id, sku_id, promotion_name FROM goods_promotion_plan 
                    WHERE pay_amount > 0 GROUP BY goods_id, sku_id, promotion_name) p1 
                    ON p1.goods_id = p.goods_id AND p1.sku_id = p.sku_id 
                    AND p1.promotion_name = p.promotion_name 
                    AND p1.date <= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)
            WHERE IF(p.promotion_name = '全站营销', p.trans_amount * (2 * a.profit + 
                    2 * a.promotion_amount - 0.3 * a.real_sale_amount) < p.pay_amount * (
                    1.85 * a.real_sale_amount + a.profit + a.promotion_amount), 
                    p.trans_amount * (a.profit + a.promotion_amount) < p.pay_amount * ( 
                    a.real_sale_amount + 0.5 * a.profit + 0.5 * a.promotion_amount)) 
                AND s.onsale_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY)
            GROUP BY s.goods_id, s.volume_target) b1 GROUP BY volume_target, type) b GROUP BY volume_target, type`
    } else {
        sql = `${sql}) b GROUP BY volume_target, type`
    }
    const result = await query(sql)
    return result
}

/**
 * tmall low plan roi count without unsalable link
 * s = sale_amount, c = cost_amount, p = pay_amount, t = trans_amount
 * old: t / p < s / (0.67 * s - c) + 0.5 ===> t * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 *      ===> 1.34 * t * s + p * c < 2 * s * p + 0.67 * p * c + 2 * t * c 
 * new: t / p < c / (s - c) ===> t * (s - c) < p * c ===> t * s < c * (p + t)
 * @param {*} links 
 * @param {*} days1 
 * @param {*} days2 
 * @returns 
 */
goodsSaleInfoRepo.getLowPlanROIByLinksAndTime = async (links, days1, days2) => {
    const sql = `SELECT SUM(count) AS count FROM (
        SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, promotion_name, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
                AND goods_id IN ("${links}") GROUP BY goods_id, promotion_name) s 
        JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND goods_id IN ("${links}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s1 ON s.goods_id = s1.goods_id
        WHERE s1.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            AND 1.34 * s.trans_amount * a.sale_amount + s.pay_amount * a.cost_amount < 
                2 * a.sale_amount * s.pay_amount + 0.67 * s.pay_amount * a.cost_amount + 
                    0.67 * s.trans_amount * a.cost_amount AND d.id IS NULL 
        UNION ALL
        SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, promotion_name, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
                AND goods_id IN ("${links}") GROUP BY goods_id, promotion_name) s 
        JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND goods_id IN ("${links}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
            AND d.product_stage IN ('稳', '控') 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s1 ON s.goods_id = s1.goods_id 
        JOIN (SELECT MIN(date) AS date, goods_id, promotion_name FROM goods_promotion_plan 
            WHERE pay_amount > 0 GROUP BY goods_id, promotion_name) p ON p.goods_id = s.goods_id 
            AND p.promotion_name = s.promotion_name 
            AND p.date <= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)
        WHERE s1.create_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            AND s.trans_amount * a.sale_amount < a.cost_amount * (s.pay_amount + s.trans_amount)
            AND d.id IS NULL) b`
    const result = await query(sql)
    return result
}

/**
 * pdd low plan roi count without unsalable link
 * s = sale_amount, c = cost_amount, p = pay_amount, t = trans_amount
 * t / p < s / (0.67 * s - c) + 0.5 ===> t * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 * ===> 1.34 * t * s + p * c < 2 * s * p + 0.67 * p * c + 2 * t * c 
 * @param {*} links 
 * @param {*} days1 
 * @param {*} days2 
 * @returns 
 */
goodsSaleInfoRepo.getLowPlanROIByLinksAndTime1 = async (links, days1, days2) => {
    const sql = `SELECT SUM(count) AS count FROM (
        SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, promotion_name, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
                AND goods_id IN ("${links}") GROUP BY goods_id, promotion_name) s 
        JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND goods_id IN ("${links}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s1 ON s.goods_id = s1.goods_id
        WHERE s1.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            AND 1.34 * s.trans_amount * a.sale_amount + s.pay_amount * a.cost_amount < 
                2 * a.sale_amount * s.pay_amount + 0.67 * s.pay_amount * a.cost_amount + 
                    0.67 * s.trans_amount * a.cost_amount AND d.id IS NULL 
        UNION ALL
        SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, promotion_name, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
                AND goods_id IN ("${links}") GROUP BY goods_id, promotion_name) s 
        JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND goods_id IN ("${links}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销')
            AND d.product_stage IN ('稳', '控') 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s1 ON s.goods_id = s1.goods_id 
        JOIN (SELECT MIN(date) AS date, goods_id, promotion_name FROM goods_promotion_plan 
            WHERE pay_amount > 0 GROUP BY goods_id, promotion_name) p ON p.goods_id = s.goods_id 
            AND p.promotion_name = s.promotion_name 
            AND p.date <= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)
        WHERE s1.create_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            AND 1.34 * s.trans_amount * a.sale_amount + s.pay_amount * a.cost_amount < 
                2 * a.sale_amount * s.pay_amount + 0.67 * s.pay_amount * a.cost_amount + 
                    0.67 * s.trans_amount * a.cost_amount AND d.id IS NULL) b`
    const result = await query(sql)
    return result
}

/**
 * jd low plan roi count without unsalable link
 * s = sale_amount, c = cost_amount, p = pay_amount, t = trans_amount, rs = real_sale_amount, p1 = profit
 * normal: t / p < s / (0.67 * s - c) + 0.5 ===> t * (0.67 * s - c) < s * p + 0.5 * p * (0.67 * s - c)
 *         ===> 1.34 * t * s + p * c < 2 * s * p + 0.67 * p * c + 2 * t * c 
 * jdzy qz: t / p < rs / (p1 + p2 - 0.15 * rs) + 0.5 
 *          ===> t * (2 * p1 + 2 * p2 - 0.3 * rs) < p * (1.85 * rs + p1 + p2)
 * jdzy other: t / p < rs / (p1 + p2) + 0.5 
 *             ===> t * (p1 + p2) < p * (rs + 0.5 * p1 + 0.5 * p2)
 * @param {*} links 
 * @param {*} days1 
 * @param {*} days2 
 * @param {*} links1 
 * @returns 
 */
goodsSaleInfoRepo.getLowPlanROIByLinksAndTime2 = async (links, days1, days2, links1) => {
    let sql = `SELECT SUM(count) AS count FROM (
        SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, promotion_name, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
                AND goods_id IN ("${links}") GROUP BY goods_id, promotion_name) s 
        JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND goods_id IN ("${links}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销') 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s1 ON s.goods_id = s1.goods_id
        WHERE s1.create_time < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            AND 1.34 * s.trans_amount * a.sale_amount + s.pay_amount * a.cost_amount < 
                2 * a.sale_amount * s.pay_amount + 0.67 * s.pay_amount * a.cost_amount + 
                    0.67 * s.trans_amount * a.cost_amount AND d.id IS NULL 
        UNION ALL
        SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT IFNULL(SUM(pay_amount), 0) AS pay_amount, promotion_name, 
                IFNULL(SUM(trans_amount), 0) AS trans_amount, goods_id FROM goods_promotion_plan 
            WHERE \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
                AND goods_id IN ("${links}") GROUP BY goods_id, promotion_name) s 
        JOIN (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(cost_amount), 0) AS cost_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND goods_id IN ("${links}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
        LEFT JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
            AND (d.userDef1 = '滞销' OR d.userDef7 = '滞销' OR d.link_attribute = '滞销')
            AND d.product_stage IN ('稳', '控') 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s1 ON s.goods_id = s1.goods_id 
        JOIN (SELECT MIN(date) AS date, goods_id, promotion_name FROM goods_promotion_plan 
            WHERE pay_amount > 0 GROUP BY goods_id, promotion_name) p ON p.goods_id = s.goods_id 
            AND p.promotion_name = s.promotion_name 
            AND p.date <= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)
        WHERE s1.create_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            AND 1.34 * s.trans_amount * a.sale_amount + s.pay_amount * a.cost_amount < 
                2 * a.sale_amount * s.pay_amount + 0.67 * s.pay_amount * a.cost_amount + 
                    0.67 * s.trans_amount * a.cost_amount AND d.id IS NULL`
    if (links1) {
        sql = `${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, sku_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND product_stage IN ('稳', '控') 
                    AND onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY)) s JOIN (
                SELECT IFNULL(SUM(real_sale_amount), 0) AS real_sale_amount, 
                    IFNULL(SUM(profit), 0) AS profit, goods_id, sku_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                    AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND goods_id IN ("${links1}") 
                GROUP BY goods_id, sku_id) a ON a.goods_id = s.goods_id AND a.sku_id = s.sku_id 
                LEFT JOIN (SELECT IFNULL(SUM(trans_amount), 0) AS trans_amount, promotion_name, 
                        IFNULL(SUM(pay_amount), 0) AS pay_amount, goods_id, sku_id 
                    FROM goods_promotion_plan WHERE date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days2} DAY) 
                        AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND goods_id IN ("${links1}")
                    GROUP BY promotion_name, goods_id, sku_id) p 
                    ON p.goods_id = s.goods_id AND p.sku_id = s.sku_id
            WHERE IF(p.promotion_name = '全站营销', p.trans_amount * (2 * a.profit + 
                    2 * a.promotion_amount - 0.3 * a.real_sale_amount) < p.pay_amount * (
                    1.85 * a.real_sale_amount + p.profit + a.promotion_amount), 
                    p.trans_amount * (a.profit + a.promotion_amount) < p.pay_amount * ( 
                    a.real_sale_amount + 0.5 * a.profit + 0.5 * a.promotion_amount)) 
                AND s.onsale_date < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) 
            UNION ALL
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
                SELECT brief_name AS goods_id, sku_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND product_stage IN ('稳', '控') 
                    AND onsale_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY)) s JOIN (
                SELECT IFNULL(SUM(real_sale_amount), 0) AS real_sale_amount, 
                    IFNULL(SUM(profit), 0) AS profit, goods_id, sku_id 
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                    AND \`date\` BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                    AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND goods_id IN ("${links1}")
                GROUP BY goods_id) a ON a.goods_id = s.goods_id AND a.sku_id = s.sku_id 
                LEFT JOIN (SELECT IFNULL(SUM(trans_amount), 0) AS trans_amount, promotion_name, 
                        IFNULL(SUM(pay_amount), 0) AS pay_amount, goods_id, sku_id 
                    FROM goods_promotion_plan WHERE date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${days1} DAY) 
                        AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND goods_id IN ("${links1}")
                    GROUP BY promotion_name, goods_id, sku_id) p 
                    ON p.goods_id = s.goods_id AND p.sku_id = s.sku_id
                JOIN (SELECT MIN(date) AS date, goods_id, sku_id, promotion_name FROM goods_promotion_plan 
                    WHERE pay_amount > 0 GROUP BY goods_id, sku_id, promotion_name) p1 
                    ON p1.goods_id = p.goods_id AND p1.sku_id = p.sku_id 
                    AND p1.promotion_name = p.promotion_name 
                    AND p1.date <= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)
            WHERE IF(p.promotion_name = '全站营销', p.trans_amount * (2 * a.profit + 
                    2 * a.promotion_amount - 0.3 * a.real_sale_amount) < p.pay_amount * (
                    1.85 * a.real_sale_amount + p.profit + a.promotion_amount), 
                    p.trans_amount * (a.profit + a.promotion_amount) < p.pay_amount * ( 
                    a.real_sale_amount + 0.5 * a.profit + 0.5 * a.promotion_amount)) 
                AND s.onsale_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY)) b`
    } else {
        sql = `${sql}) b`
    }
    const result = await query(sql)
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
goodsSaleInfoRepo.getGoalNotAchieveByShopNameAndTime = async (shopNames, months, start, end, sale_amount, profit_rate) => {
    let presql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s 
        JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
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
goodsSaleInfoRepo.getGoalNotAchieveByLinksAndTime = async (links, months, start, end, sale_amount, profit_rate) => {
    let presql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s 
        JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
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
goodsSaleInfoRepo.getGoalNotAchieveByShopNameAndTime1 = async (shopNames, start, end, sale_amount, profit_rate, shopNames1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s 
        JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
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
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
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
goodsSaleInfoRepo.getGoalNotAchieveByLinksAndTime1 = async (links, start, end, sale_amount, profit_rate, links1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM (
            SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s 
        JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
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
                FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
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
 * @param {*} start 
 * @param {*} end 
 * @param {*} shopNames1 
 * @returns 
 */
goodsSaleInfoRepo.getInvalidByShopNamesAndTime = async (shopNames, start, end, shopNames1) => {
    let sql = `SELECT COUNT(DISTINCT s1.goods_id) AS count, IFNULL(SUM(s1.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(s1.profit), 0) AS profit FROM (
            SELECT s.goods_id, MIN(s.create_time) AS create_time, a.sale_amount, a.profit 
            FROM (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
                WHERE create_time IS NOT NULL AND is_shelf = '是' 
                    AND shop_name IN ("${shopNames}") GROUP BY goods_id) s LEFT JOIN (
                SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                    FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                        AND date BETWEEN ? AND ? 
                        AND shop_name IN ("${shopNames}") 
                    GROUP BY goods_id) a ON a.goods_id = s.goods_id 
                JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
                    AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) 
                        OR (d.userDef7 != '滞销' OR d.userDef7 IS NULL) 
                        OR (d.link_attribute != '滞销' OR d.link_attribute IS NULL)) 
                    AND d.is_price_comparison IS NOT NULL 
                GROUP BY s.goods_id, a.sale_amount, a.profit) s1`
    let params = [start, end]
    if (shopNames1) {
        sql = `SELECT SUM(count) AS count, SUM(sale_amount) AS sale_amount, SUM(profit) AS profit FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count, IFNULL(SUM(a.sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(a.profit), 0) AS profit FROM (
                SELECT brief_name AS goods_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND is_price_comparison IS NOT NULL 
                GROUP BY brief_name, onsale_date) s LEFT JOIN (
                SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                    FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                        AND date BETWEEN ? AND ? 
                        AND shop_name IN ("${shopNames1}") 
                    GROUP BY goods_id) a ON a.goods_id = s.goods_id 
                GROUP BY s.goods_id, a.sale_amount, a.profit) c`
        params.push(start, end)
    }
    const result = await query(sql, params)
    return result
}

/**
 * invalid count without unsalable link
 * @param {*} links 
 * @param {*} start 
 * @param {*} end 
 * @param {*} links1 
 * @returns 
 */
goodsSaleInfoRepo.getInvalidByLinksAndTime = async (links, start, end, links1) => {
    let sql = `SELECT COUNT(DISTINCT s1.goods_id) AS count, IFNULL(SUM(s1.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(s1.profit), 0) AS profit FROM (
            SELECT s.goods_id, MIN(s.create_time) AS create_time, a.sale_amount, a.profit 
            FROM (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
                WHERE create_time IS NOT NULL AND is_shelf = '是' 
                    AND goods_id IN ("${links}") GROUP BY goods_id) s LEFT JOIN (
                SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                    FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                        AND date BETWEEN ? AND ? 
                        AND goods_id IN ("${links}") 
                    GROUP BY goods_id) a ON a.goods_id = s.goods_id 
                JOIN dianshang_operation_attribute d ON d.goods_id = s.goods_id 
                    AND ((d.userDef1 != '滞销' OR d.userDef1 IS NULL) 
                        OR (d.userDef7 != '滞销' OR d.userDef7 IS NULL) 
                        OR (d.link_attribute != '滞销' OR d.link_attribute IS NULL)) 
                    AND d.is_price_comparison IS NOT NULL 
                GROUP BY s.goods_id, a.sale_amount, a.profit) s1`
    let params = [start, end]
    if (links1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s1.goods_id) AS count, IFNULL(SUM(s1.sale_amount), 0) AS sale_amount, 
                IFNULL(SUM(s1.profit), 0) AS profit FROM (
                SELECT brief_name AS goods_id, onsale_date FROM dianshang_operation_attribute 
                WHERE platform = '自营' AND (userDef1 != '滞销' OR userDef1 IS NULL) 
                    AND is_price_comparison IS NOT NULL 
                GROUP BY brief_name, onsale_date) s LEFT JOIN (
                SELECT IFNULL(SUM(profit), 0) AS profit, 
                    IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
                    FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                        AND date BETWEEN ? AND ? 
                        AND goods_id IN ("${links}") 
                    GROUP BY goods_id) a ON a.goods_id = s.goods_id 
                GROUP BY s.goods_id, a.sale_amount, a.profit) c`
        params.push(start, end)
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
goodsSaleInfoRepo.getImportByShopNames = async (shopNames) => {
    const sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM dianshang_operation_attribute d 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s ON d.goods_id = s.goods_id 
        WHERE d.userDef7 IN ('打仗', '爆款', '自定义') AND d.shop_name IN ("${shopNames}")`
    const result = await query(sql)
    return result
}

/**
 * tmall important link count
 * userDef7
 * @param {*} links 
 * @returns 
 */
goodsSaleInfoRepo.getImportByLinks = async (links) => {
    const sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM dianshang_operation_attribute d 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s ON d.goods_id = s.goods_id 
        WHERE d.userDef7 IN ('打仗', '爆款', '自定义') AND d.goods_id IN ("${links}")`
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
goodsSaleInfoRepo.getImportByShopNames1 = async (shopNames, shopNames1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM dianshang_operation_attribute d 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s ON d.goods_id = s.goods_id 
        WHERE (d.userDef1 IN ('打仗', '爆款', '自定义') OR d.link_attribute IN ('打仗', '爆款', '自定义'))
            AND d.shop_name IN ("${shopNames}")`
    if (shopNames1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM dianshang_operation_attribute s 
            WHERE s.userDef1 IN ('打仗', '爆款', '自定义') AND s.shop_name IN ("${shopNames1}")) c`
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
goodsSaleInfoRepo.getImportByLinks1 = async (links, links1) => {
    let sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM dianshang_operation_attribute d 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s ON d.goods_id = s.goods_id 
        WHERE (d.userDef1 IN ('打仗', '爆款', '自定义') OR d.link_attribute IN ('打仗', '爆款', '自定义'))
            AND d.goods_id IN ("${links}")`
    if (links1) {
        sql = `SELECT SUM(count) AS count FROM (
            ${sql}
            UNION ALL 
            SELECT COUNT(DISTINCT s.goods_id) AS count FROM dianshang_operation_attribute s 
            WHERE s.userDef1 IN ('打仗', '爆款', '自定义') AND s.goods_id IN ("${links1}")) c`
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
goodsSaleInfoRepo.getImportByShopNames2 = async (shopNames) => {
    const sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM dianshang_operation_attribute d 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND shop_name IN ("${shopNames}") GROUP BY goods_id) s ON d.goods_id = s.goods_id 
        WHERE d.link_attribute IN ('打仗', '爆款', '自定义') AND d.shop_name IN ("${shopNames}")`
    const result = await query(sql)
    return result
}

/**
 * pdd important link count
 * linkAttribute
 * @param {*} links 
 * @returns 
 */
goodsSaleInfoRepo.getImportByLinks2 = async (links) => {
    const sql = `SELECT COUNT(DISTINCT s.goods_id) AS count FROM dianshang_operation_attribute d 
        JOIN (SELECT MIN(create_time) AS create_time, goods_id FROM jst_goods_sku
            WHERE create_time IS NOT NULL AND is_shelf = '是' 
                AND goods_id IN ("${links}") GROUP BY goods_id) s ON d.goods_id = s.goods_id 
        WHERE d.link_attribute IN ('打仗', '爆款', '自定义') AND d.goods_id IN ("${links}")`
    const result = await query(sql)
    return result
}

/**
 * unsalable code count
 * @param {*} shopNames 
 * @param {*} start 
 * @param {*} end 
 * @param {*} shopNames1 
 * @returns 
 */
goodsSaleInfoRepo.getUnsalableCodeByShopNames = async (shopNames, start, end, shopNames1) => {
    let sql = `SELECT IFNULL(SUM(cost_amount), 0) AS cost_amount, IFNULL(SUM(sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(profit), 0) AS profit 
        FROM (SELECT IFNULL(c.\`商品编码\`, s.sys_sku_id) AS sku_id, s.goods_id FROM (
            SELECT sys_sku_id, goods_id FROM jst_goods_sku 
            WHERE is_shelf = '是' AND shop_name IN ("${shopNames}")) s 
        LEFT JOIN danpin.combination_product_code c ON c.\`组合商品编码\` = s.sys_sku_id 
        GROUP BY IFNULL(c.\`商品编码\`, s.sys_sku_id), s.goods_id) a 
        JOIN danpin.goods_info g ON g.\`商品编码\` = a.sku_id AND g.\`备注标签\` IN ('滞销', '销完下架')
        JOIN (SELECT SUM(cost_amount) AS cost_amount, SUM(sale_amount) AS sale_amount, 
                SUM(profit) AS profit, goods_id, sku_code 
            FROM goods_sale_info WHERE date BETWEEN ? AND ? AND shop_name IN ("${shopNames}") 
            GROUP BY goods_id, sku_code) b ON a.goods_id = b.goods_id AND a.sku_id = b.sku_code`
    let params = [start, end]
    if (shopNames1) {
        sql = `SELECT SUM(cost_amount) AS cost_amount, SUM(sale_amount) AS sale_amount, SUM(profit) AS profit 
            FROM (${sql}
                UNION ALL
                SELECT IFNULL(SUM(cost_amount), 0) * rate AS cost_amount, 
                    IFNULL(SUM(sale_amount), 0) * rate AS sale_amount, 
                    IFNULL(SUM(profit), 0) * rate AS profit 
                FROM (SELECT s.sku_id, s.goods_id, IFNULL(c.\`商品编码\`, s.code) AS code, 
                        IF(c.\`商品编码\` IS NULL, 1, (c.\`子商品成本价\` * c.\`数量\` / c.\`组合成本价\`)) AS rate 
                    FROM (SELECT code, sku_id, cost_price, brief_name AS goods_id FROM dianshang_operation_attribute 
                    WHERE shop_name IN ("${shopNames1}") group by code, sku_id, brief_name, cost_price) s 
                LEFT JOIN danpin.combination_product_code c ON c.\`组合商品编码\` = s.code 
                GROUP BY IFNULL(c.\`商品编码\`, s.code), s.sku_id, s.goods_id, 
                    IF(c.\`商品编码\` IS NULL, 1, (c.\`子商品成本价\` * c.\`数量\` / c.\`组合成本价\`))) a 
                JOIN danpin.goods_info g ON g.\`商品编码\` = a.code AND g.\`备注标签\` IN ('滞销', '销完下架')
                JOIN (SELECT SUM(cost_amount) AS cost_amount, SUM(sale_amount) AS sale_amount, 
                        SUM(profit) AS profit, goods_id, sku_id 
                    FROM goods_sale_info WHERE date BETWEEN ? AND ? AND shop_name IN ("${shopNames1}") 
                    GROUP BY goods_id, sku_id) b ON a.goods_id = b.goods_id AND a.sku_id = b.sku_id
                GROUP BY a.goods_id, a.sku_id, a.rate) k`
        params.push(start, end)
    }
    const result = await query(sql, params)
    let sql1 = `SELECT IFNULL(SUM(amount), 0) AS amount FROM (
            SELECT g.\`成本价\` * k.\`可用数\` AS amount FROM danpin.goods_info g 
        JOIN (SELECT IFNULL(c.\`商品编码\`, s.sys_sku_id) AS sku_id, s.goods_id FROM (
            SELECT sys_sku_id, goods_id FROM jst_goods_sku 
            WHERE is_shelf = '是' AND shop_name IN ("${shopNames}")) s 
        LEFT JOIN danpin.combination_product_code c ON c.\`组合商品编码\` = s.sys_sku_id 
        GROUP BY IFNULL(c.\`商品编码\`, s.sys_sku_id), s.goods_id) a ON g.\`商品编码\` = a.sku_id 
        LEFT JOIN danpin.goods_kucun k ON g.\`商品编码\` = k.\`商品编码\` 
             AND k.\`统计日期\` = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
        WHERE g.\`备注标签\` IN ('滞销', '销完下架') AND k.\`可用数\` > 0) a`
    if (shopNames1) {
        sql1 = `SELECT SUM(amount) AS amount FROM (
                ${sql1}
                UNION ALL
                SELECT g.\`成本价\` * k.\`全国现货库存\` AS amount FROM danpin.goods_info g 
                LEFT JOIN (SELECT s.sku_id, s.goods_id, IFNULL(c.\`商品编码\`, s.code) AS code 
                    FROM (SELECT code, sku_id, cost_price, brief_name AS goods_id 
                    FROM dianshang_operation_attribute WHERE shop_name IN ("${shopNames1}") 
                    group by code, sku_id, brief_name, cost_price) s 
                LEFT JOIN danpin.combination_product_code c ON c.\`组合商品编码\` = s.code 
                GROUP BY IFNULL(c.\`商品编码\`, s.code), s.sku_id, s.goods_id) a ON a.code = g.\`商品编码\`
                JOIN danpin.inventory_jdzz k ON a.sku_id = k.SKU 
                    AND k.\`时间\` = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
                WHERE g.\`备注标签\` IN ('滞销', '销完下架') AND k.\`全国现货库存\` > 0) i`
    }
    const result1 = await query(sql1)
    return {...result[0], ...result1[0]}
}

/**
 * unsalable code count
 * @param {*} links 
 * @param {*} start 
 * @param {*} end 
 * @returns 
 */
goodsSaleInfoRepo.getUnsalableCodeByLinks = async (links, start, end, links1) => {
    let sql = `SELECT IFNULL(SUM(cost_amount), 0) AS cost_amount, IFNULL(SUM(sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(profit), 0) AS profit 
        FROM (SELECT IFNULL(c.\`商品编码\`, s.sys_sku_id) AS sku_id, s.goods_id FROM (
            SELECT sys_sku_id, goods_id FROM jst_goods_sku 
            WHERE is_shelf = '是' AND goods_id IN ("${links}")) s 
        LEFT JOIN danpin.combination_product_code c ON c.\`组合商品编码\` = s.sys_sku_id 
        GROUP BY IFNULL(c.\`商品编码\`, s.sys_sku_id), s.goods_id) a 
        JOIN danpin.goods_info g on g.\`商品编码\` = a.sku_id AND g.\`备注标签\` IN ('滞销', '销完下架')
        JOIN (SELECT SUM(cost_amount) AS cost_amount, SUM(sale_amount) AS sale_amount, 
                SUM(profit) AS profit, goods_id, sku_code 
            FROM goods_sale_info WHERE date BETWEEN ? AND ? AND shop_name IN ("${links}") 
            GROUP BY goods_id, sku_code) b ON a.goods_id = b.goods_id AND a.sku_id = b.sku_code`
    let params = [start, end]
    if (links1) {
        sql = `SELECT SUM(cost_amount) AS cost_amount, SUM(sale_amount) AS sale_amount, SUM(profit) AS profit 
            FROM (${sql}
                UNION ALL
                SELECT IFNULL(SUM(cost_amount), 0) * rate AS cost_amount, 
                    IFNULL(SUM(sale_amount), 0) * rate AS sale_amount, 
                    IFNULL(SUM(profit), 0) * rate AS profit 
                FROM (SELECT s.sku_id, s.goods_id, IFNULL(c.\`商品编码\`, s.code) AS code, 
                        IF(c.\`商品编码\` IS NULL, 1, (c.\`子商品成本价\` * c.\`数量\` / c.\`组合成本价\`)) AS rate 
                    FROM (SELECT code, sku_id, cost_price, brief_name AS goods_id FROM dianshang_operation_attribute 
                    WHERE brief_name IN ("${links1}") group by code, sku_id, brief_name, cost_price) s 
                LEFT JOIN danpin.combination_product_code c ON c.\`组合商品编码\` = s.code 
                GROUP BY IFNULL(c.\`商品编码\`, s.code), s.sku_id, s.goods_id, 
                    IF(c.\`商品编码\` IS NULL, 1, (c.\`子商品成本价\` * c.\`数量\` / c.\`组合成本价\`))) a 
                JOIN danpin.goods_info g ON g.\`商品编码\` = a.code AND g.\`备注标签\` IN ('滞销', '销完下架')
                JOIN (SELECT SUM(cost_amount) AS cost_amount, SUM(sale_amount) AS sale_amount, 
                        SUM(profit) AS profit, goods_id, sku_id 
                    FROM goods_sale_info WHERE date BETWEEN ? AND ? AND goods_id IN ("${links1}") 
                    GROUP BY goods_id, sku_id) b ON a.goods_id = b.goods_id AND a.sku_id = b.sku_id
                GROUP BY a.goods_id, a.sku_id, a.rate) k`
        params.push(start, end)
    }
    const result = await query(sql, [start, end])
    let sql1 = `SELECT IFNULL(SUM(amount), 0) AS amount FROM (
            SELECT g.\`成本价\` * k.\`可用数\` AS amount FROM danpin.goods_info g
        LEFT JOIN danpin.goods_kucun k ON g.\`商品编码\` = k.\`商品编码\`
        WHERE g.\`备注标签\` IN ('滞销', '销完下架') AND k.\`统计日期\` = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
            AND k.\`可用数\` > 0) a`
    if (links1) {
        sql1 = `SELECT SUM(amount) AS amount FROM (
                ${sql1}
                UNION ALL
                SELECT g.\`成本价\` * k.\`全国现货库存\` AS amount FROM danpin.goods_info g 
                LEFT JOIN (SELECT s.sku_id, s.goods_id, IFNULL(c.\`商品编码\`, s.code) AS code 
                    FROM (SELECT code, sku_id, cost_price, brief_name AS goods_id 
                    FROM dianshang_operation_attribute WHERE brief_name IN ("${links1}") 
                    group by code, sku_id, brief_name, cost_price) s 
                LEFT JOIN danpin.combination_product_code c ON c.\`组合商品编码\` = s.code 
                GROUP BY IFNULL(c.\`商品编码\`, s.code), s.sku_id, s.goods_id) a ON a.code = g.\`商品编码\`
                JOIN danpin.inventory_jdzz k ON a.sku_id = k.SKU 
                    AND k.\`时间\` = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
                WHERE g.\`备注标签\` IN ('滞销', '销完下架') AND k.\`全国现货库存\` > 0) i`
    }
    const result1 = await query(sql1)
    return {...result[0], ...result1[0]}
}

/**
 * ip link count
 * @param {*} shopNames 
 * @param {*} months 
 * @param {*} start 
 * @param {*} end 
 * @returns 
 */
goodsSaleInfoRepo.getIpByShopNames = async (shopNames, months, start, end) => {
    let presql = `SELECT COUNT(a.sale_amount < t.amount) AS count, IFNULL(SUM(a.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(a.profit), 0) AS profit, IFNULL(SUM(t.amount), 0) AS amount FROM (
        SELECT IF(d.platform = '自营', d.brief_name, d.goods_id) AS goods_id 
            FROM dianshang_operation_attribute d 
            WHERE d.is_ip = '是' AND d.shop_name IN ("${shopNames}") 
            GROUP BY IF(d.platform = '自营', d.brief_name, d.goods_id)) s 
        JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND date BETWEEN ? AND ? AND shop_name IN ("${shopNames}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
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
            ON t.goods_id = s.goods_id`
    let result = await query(search, [start, end])
    return result
}

/**
 * ip link count
 * @param {*} links 
 * @param {*} months 
 * @param {*} start 
 * @param {*} end 
 * @param {*} links1 
 * @returns 
 */
goodsSaleInfoRepo.getIpByLinks = async (links, months, start, end, links1) => {
    let presql = `SELECT COUNT(a.sale_amount < t.amount) AS count, IFNULL(SUM(a.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(a.profit), 0) AS profit, IFNULL(SUM(t.amount), 0) AS amount FROM (
        SELECT IF(d.platform = '自营', d.brief_name, d.goods_id) AS goods_id 
            FROM dianshang_operation_attribute d 
            WHERE d.is_ip = '是' AND (d.goods_id IN ("${links}") OR d.brief_name IN ("${links1}")) 
            GROUP BY IF(d.platform = '自营', d.brief_name, d.goods_id)) s 
        JOIN (SELECT IFNULL(SUM(profit), 0) AS profit, 
                IFNULL(SUM(sale_amount), 0) AS sale_amount, goods_id 
            FROM goods_sales WHERE goods_id NOT IN ('', '【无法匹配到商品】') 
                AND date BETWEEN ? AND ? AND goods_id IN ("${links}")
            GROUP BY goods_id) a ON a.goods_id = s.goods_id 
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
            ON t.goods_id = s.goods_id`
    let result = await query(search, [start, end])
    return result
}

/**
 * unsalable link count
 * @param {*} shopNames 
 * @returns 
 */
goodsSaleInfoRepo.getUnsalableByShopNames = async (shopNames) => {
    const sql = `SELECT COUNT(1) AS count FROM (
        SELECT IF(d.platform = '自营', d.brief_name, d.goods_id), d.volume_target 
            FROM dianshang_operation_attribute d 
            WHERE (d.userDef7 = '滞销' OR d.userDef1 = '滞销' OR d.link_attribute = '滞销')
                AND d.shop_name IN ("${shopNames}") 
            GROUP BY IF(d.platform = '自营', d.brief_name, d.goods_id), d.volume_target) b`
    const result = await query(sql)
    return result
}

/**
 * unsalable link count 
 * @param {*} links 
 * @param {*} links1 
 * @returns 
 */
goodsSaleInfoRepo.getUnsalableByLinks = async (links, links1) => {
    const subsql = links1 ? `OR d.brief_name IN ("${links1}")` : ''
    const sql = `SELECT COUNT(1) AS count FROM (
        SELECT IF(d.platform = '自营', d.brief_name, d.goods_id), d.volume_target 
            FROM dianshang_operation_attribute d 
            WHERE (d.userDef7 = '滞销' OR d.userDef1 = '滞销' OR d.link_attribute = '滞销')
                AND (d.goods_id IN ("${links}") ${subsql})
            GROUP BY IF(d.platform = '自营', d.brief_name, d.goods_id), d.volume_target) b`
    const result = await query(sql)
    return result
}

module.exports = goodsSaleInfoRepo