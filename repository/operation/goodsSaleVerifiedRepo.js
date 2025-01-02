const { query } = require('../../model/dbConn')
const moment = require('moment')

const goodsSaleVerifiedRepo = {}

goodsSaleVerifiedRepo.getPaymentByShopNamesAndTime = async (shopNames, start, end) => {
    const sql = `SELECT IFNULL(SUM(A1.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(a1.express_fee), 0) AS express_fee, 
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
                0), 2) AS profit_rate FROM goods_sale_verified a1
        LEFT JOIN goods_other_info a2 ON a1.goods_id = a2.goods_id
            AND a1.date = a2.date
        WHERE a1.shop_name IN ("${shopNames}") 
            AND a1.date >= ?
            AND a1.date <= ?`
    const result = await query(sql, [start, end])
    return result || []
}

goodsSaleVerifiedRepo.getNullPromotionByTime = async (shopNames, start, end) => {
    let sql = `SELECT a1.shop_name FROM goods_sale_verified a1 LEFT JOIN shop_info si
            ON a1.shop_name = si.shop_name
        WHERE a1.shop_name IN ("${shopNames}") AND a1.date >= ? 
            AND a1.date <= ? 
            AND si.has_promotion = 1 
        GROUP BY a1.shop_name, a1.date HAVING SUM(a1.promotion_amount) = 0`
    let result = await query(sql, [start, end])
    return result?.length ? true:false
}

goodsSaleVerifiedRepo.getDetailByShopNamesAndTme = async (shopNames, column, start, end) => {
    let sql = `SELECT IFNULL(SUM(${column}), 0) AS ${column}, \`date\` FROM goods_sale_verified 
        WHERE \`date\` >= ? AND \`date\` <= ? AND shop_name IN ("${shopNames}") 
        GROUP BY \`date\``
    let result = await query(sql, [start, end])
    return  result || []
}

goodsSaleVerifiedRepo.getRateByShopNamesAndTme = async (shopNames, col1, col2, column, start, end, percent) => {
    let sql = `SELECT FORMAT(IF(IFNULL(SUM(${col1}), 0) > 0, 
                IFNULL(SUM(${col2}), 0) / SUM(${col1}) * ${percent}, 0), 2) AS ${column}, \`date\` 
        FROM goods_sale_verified 
        WHERE \`date\` >= ? AND \`date\` <= ? AND shop_name IN ("${shopNames}") 
        GROUP BY \`date\``
    let result = await query(sql, [start, end])
    return  result || []
}

goodsSaleVerifiedRepo.getChildPaymentByShopNamesAndTime = async (shopNames, start, end) => {
    const sql = `SELECT IFNULL(SUM(A1.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(a1.express_fee), 0) AS express_fee, 
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
				ELSE 2 END) AS type FROM goods_sale_verified a1
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

goodsSaleVerifiedRepo.getPaymentByLinkIdsAndTime = async (linkIds, start, end) => {
    const sql = `SELECT IFNULL(SUM(a1.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(a1.express_fee), 0) AS express_fee, 
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
                0), 2) AS profit_rate FROM goods_sale_verified a1 
        LEFT JOIN goods_other_info a2 ON a1.goods_id = a2.goods_id
            AND a1.date = a2.date
        WHERE a1.goods_id IN ("${linkIds}") 
            AND a1.date >= ?
            AND a1.date <= ?`
    const result = await query(sql, [start, end])
    return result || []
}

goodsSaleVerifiedRepo.getDetailByLinkIdsAndTme = async (linkIds, column, start, end) => {
    let sql = `SELECT IFNULL(SUM(${column}), 0) AS ${column}, \`date\` FROM goods_sale_verified 
        WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id IN ("${linkIds}") 
        GROUP BY \`date\``
    let result = await query(sql, [start, end])
    return  result || []
}

goodsSaleVerifiedRepo.getRateByLinkIdsAndTme = async (linkIds, col1, col2, column, start, end, percent) => {
    let sql = `SELECT FORMAT(IF(IFNULL(SUM(${col1}), 0) > 0, 
                IFNULL(SUM(${col2}), 0) / SUM(${col1}) * ${percent}, 0), 2) AS ${column}, \`date\` 
        FROM goods_sale_verified 
        WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id IN ("${linkIds}") 
        GROUP BY \`date\``
    let result = await query(sql, [start, end])
    return  result || []
}

goodsSaleVerifiedRepo.getChildPaymentByLinkIdsAndTime = async (linkIds, start, end) => {
    const sql = `SELECT IFNULL(SUM(a1.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(a1.express_fee), 0) AS express_fee, 
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
				ELSE 2 END) AS type FROM goods_sale_verified a1 
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

goodsSaleVerifiedRepo.getData = async (start, end, params, shopNames, linkIds) => {
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
    let lastStart = moment(start).subtract(8, 'day').format('YYYY-MM-DD')
    let lastEnd = moment(start).subtract(2, 'day').format('YYYY-MM-DD')
    let sql = `SELECT SUM(a1.sale_amount) AS sale_amount, a1.goods_id FROM goods_verifieds a1`
    subsql = ` WHERE a1.date BETWEEN ? AND ?`
    p.push(start, end)
    let hasChild = start == end ? false : true
    for (let i =0; i < params.search.length; i++) {
        if (params.search[i].field_id == 'operation_rate') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.operation_amount), 0) AS operation_amount, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_verifieds a2
                        WHERE a2.date BETWEEN ? AND ? AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.operation_amount * 100 >= ${params.search[i].min} * b.sale_amount
                        AND b.operation_amount * 100 <= ${params.search[i].max} * b.sale_amount)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'roi') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.promotion_amount), 0) AS promotion_amount, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_verifieds a2 
                        WHERE a2.date BETWEEN ? AND ? AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.sale_amount >= ${params.search[i].min} * b.promotion_amount 
                        AND b.sale_amount <= ${params.search[i].max} * b.promotion_amount)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'market_rate') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a3.words_market_vol), 0) AS words_market_vol, 
                            IFNULL(SUM(a3.words_vol), 0) AS words_vol FROM goods_verifieds a3 
                        WHERE a3.date BETWEEN ? AND ? AND a1.goods_id = a3.goods_id 
                    ) b WHERE b.words_vol * 100 >= ${params.search[i].min} * b.words_market_vol
                        AND b.words_vol * 100 <= ${params.search[i].max} * b.words_market_vol)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'refund_rate') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.order_num), 0) AS order_num, 
                            IFNULL(SUM(a2.refund_num), 0) AS refund_num FROM goods_verifieds a2 
                        WHERE a2.date BETWEEN ? AND ? AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.refund_num * 100 >= ${params.search[i].min} * b.order_num
                        AND b.refund_num * 100 <= ${params.search[i].max} * b.order_num)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'profit_rate') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.profit), 0) AS profit, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_verifieds a2 
                        WHERE a2.date BETWEEN ? AND ? AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.profit * 100 >= ${params.search[i].min} * b.sale_amount
                        AND b.profit * 100 <= ${params.search[i].max} * b.sale_amount)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'gross_profit') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IF(IFNULL(SUM(a2.sale_amount), 0) > 0 
                        AND IFNULL(SUM(a2.sale_qty), 0) > 0 
                        AND IFNULL(SUM(a2.settle_amount), 0) > 0, 
                            FORMAT((1 - IFNULL(SUM(a2.bill_amount), 0) / SUM(a2.settle_amount) 
                                - (IFNULL(SUM(a2.express_fee), 0) + IFNULL(SUM(a2.cost_amount), 0)) /
                                    IFNULL(SUM(a2.sale_amount), 0) 
                        ) * 100, 2), 0) AS val FROM goods_gross_rate a2 
                        WHERE a2.goods_id = a1.goods_id AND a2.order_time BETWEEN ? AND ? 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(lastStart, lastEnd)
        } else if (['pay_amount', 'brushing_amount', 'brushing_qty', 'refund_amount', 'bill', 'pay_express_fee'].includes(params.search[i].field_id)) {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.${params.search[i].field_id}), 0) AS val FROM 
                        goods_payments a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max})`
            p.push(start, end)
        } else if (params.search[i].field_id == 'real_pay_amount') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.pay_amount), 0) - IFNULL(SUM(a2.brushing_amount), 0) - IFNULL(SUM(a2.refund_amount), 0) 
                        AS val FROM goods_payments a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (['words_market_vol', 'words_vol'].includes(params.search[i].field_id)) {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.${params.search[i].field_id}), 0) AS val 
                        FROM goods_other_info a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'dsr') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT FORMAT(IFNULL(SUM(a2.dsr), 0) / COUNT(1), 2) AS val 
                        FROM goods_other_info a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'promotion_amount_qoq') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT FORMAT(IF(IFNULL(SUM(a2.promotion_amount), 0) > 0, 
                            (IFNULL(SUM(a1.promotion_amount), 0) - SUM(a2.promotion_amount)) /
                            SUM(a2.promotion_amount) * 100, 0 
                        ), 2) AS val FROM goods_verifieds a2 WHERE a2.date BETWEEN ? AND ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(preStart, preEnd)
        } else if (params.search[i].field_id == 'is_goods_id') {
            if (params.search[i].value == 0)
                subsql = `${subsql} AND a1.goods_id IS NULL`
            else subsql = `${subsql} AND a1.goods_id IS NOT NULL`
        } else if (params.search[i].field_id == 'onsale_info') {
            if (params.search[i].value != 'old') {
                let tStart = moment().subtract(params.search[i].value, 'day').format('YYYY-MM-DD')
                let tEnd = moment().subtract(params.search[i].value, 'day').format('YYYY-MM-DD')
                subsql = `${subsql} AND EXISTS(
                        SELECT a2.goods_id FROM goods_verifieds a2 
                        WHERE a2.onsale_date BETWEEN ? AND ? AND a1.goods_id = a2.goods_id)`
                p.push(tStart, tEnd)
            } else
                subsql = `${subsql} AND EXISTS(
                    SELECT a2.goods_id FROM goods_verifieds a2 WHERE 
                        (a2.onsale_date < DATE_SUB(NOW(), INTERVAL 90 DAY) OR 
                            a2.onsale_date IS NULL
                        ) AND a1.goods_id = a2.goods_id)`
        } else if (params.search[i].field_id == 'goods_id') {
            subsql = `${subsql} AND a1.goods_id LIKE '%${params.search[i].value}%'`
        } else if (params.search[i].field_id == 'sku_id') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT a2.sku_code FROM goods_sale_verified a2 WHERE 
                            a2.goods_id = a1.goods_id AND a2.date BETWEEN ? AND ? 
                        GROUP BY a2.sku_code 
                        ORDER BY IFNULL(SUM(a2.sale_amount), 0) DESC LIMIT 1 
                    ) a3 WHERE a3.sku_code LIKE '%${params.search[i].value}%')`
            p.push(start, end)
        } else if (params.search[i].field_id == 'sku_sid') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (SELECT * FROM (
                        SELECT a2.sku_code, IFNULL(SUM(a2.sale_amount), 0) AS amount 
                        FROM goods_sale_verified a2 WHERE a2.goods_id = a1.goods_id 
                            AND a2.date BETWEEN ? AND ? GROUP BY a2.sku_code 
                        ORDER BY IFNULL(SUM(a2.sale_amount), 0) DESC LIMIT 2 
                    ) a3 ORDER BY amount LIMIT 1) a4 
                    WHERE a4.sku_code LIKE '%${params.search[i].value}%')`
            p.push(start, end)
        } else if (params.search[i].type == 'number') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.${params.search[i].field_id}), 0) AS val FROM 
                        goods_verifieds a2 WHERE a2.date BETWEEN ? AND ? 
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
    let sql1 = `GROUP BY a1.goods_id, a1.shop_name`
    sql = `SELECT COUNT(1) AS count, SUM(sale_amount) AS sale_amount FROM(
        ${sql}${subsql} GROUP BY a1.goods_id) aa`
    let row = await query(sql, p)
    if (row?.length && row[0].count) {
        result.total = row[0].count
        result.sum = row[0].sale_amount        
        sql = `SELECT a1.goods_id, a1.shop_name, 
            IFNULL(SUM(a3.pay_amount), 0) AS pay_amount, 
            IFNULL(SUM(a3.brushing_amount), 0) AS brushing_amount, 
            IFNULL(SUM(a3.brushing_qty), 0) AS brushing_qty, 
            IFNULL(SUM(a3.refund_amount), 0) AS refund_amount, 
            IFNULL(SUM(a3.pay_express_fee), 0) AS pay_express_fee, 
            IFNULL(SUM(a3.pay_amount), 0) - IFNULL(SUM(a3.brushing_amount), 0) 
                - IFNULL(SUM(a3.refund_amount), 0) AS real_pay_amount, 
            IFNULL(SUM(a3.bill), 0) AS bill,
            IFNULL(SUM(a1.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(a1.cost_amount), 0) AS cost_amount, 
            IFNULL(SUM(a1.express_fee), 0) AS express_fee, 
            IFNULL(SUM(a1.promotion_amount), 0) AS promotion_amount, 
            FORMAT(IF(IFNULL(SUM(a8.promotion_amount), 0) > 0, 
                (IFNULL(SUM(a1.promotion_amount), 0) - SUM(a8.promotion_amount)) /
                SUM(a8.promotion_amount) * 100, 0 
            ), 2) AS promotion_amount_qoq,
            IFNULL(SUM(a1.operation_amount), 0) AS operation_amount, 
            IFNULL(SUM(a4.words_market_vol), 0) AS words_market_vol, 
            IFNULL(SUM(a4.words_vol), 0) AS words_vol, 
            FORMAT(IFNULL(SUM(a4.dsr), 0) / COUNT(1), 2) AS dsr, 
            IFNULL(SUM(a1.order_num), 0) AS order_num, 
            IFNULL(SUM(a1.refund_num), 0) AS refund_num, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.operation_amount), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS operation_rate, 
            FORMAT(IF(IFNULL(SUM(a1.promotion_amount), 0) > 0, 
                IFNULL(SUM(a1.sale_amount), 0) / SUM(a1.promotion_amount), 
                0), 2) AS roi, 
            FORMAT(IF(IFNULL(SUM(a4.words_market_vol), 0) > 0, 
                IFNULL(SUM(a4.words_vol), 0) / SUM(a4.words_market_vol) * 100, 
                0), 2) AS market_rate, 
            FORMAT(IF(IFNULL(SUM(a1.order_num), 0) > 0, 
                IFNULL(SUM(a1.refund_num), 0) / SUM(a1.order_num) * 100, 
                0), 2) AS refund_rate, 
            IFNULL(SUM(a1.profit), 0) AS profit, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.profit), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS profit_rate 
            FROM goods_verifieds a1 LEFT JOIN goods_other_info a4 
                ON a4.goods_id = a1.goods_id 
                    AND a4.date = a1.date
            LEFT JOIN goods_payments a3 ON a1.goods_id = a3.goods_id 
                AND a1.date = a3.date
            LEFT JOIN goods_verifieds a8 ON a8.goods_id = a1.goods_id 
                AND a8.date = DATE_SUB(a1.date, INTERVAL 1 DAY)`
        sql1 = `GROUP BY a1.goods_id, a1.shop_name`
        sql = `SELECT aa.* FROM (${sql}${subsql}${sql1}) aa`
        if (params.sort) sql = `${sql} ORDER BY aa.${params.sort}`
        if (!params.export)
            sql = `${sql}
                LIMIT ${offset}, ${size}`
        row = await query(sql, p)
        if (row?.length) {
            for (let i = 0; i < row.length; i++) {
                row[i].sku_id = ''
                row[i].sku_sid = ''                
                row[i].hasChild = hasChild
                row[i].id = row[i].goods_id
                row[i].parent_id = null
                if (row[i].goods_id) {
                    sql = `SELECT goods_name, brief_name, operator, brief_product_line, 
                            line_director, purchase_director, onsale_date, link_attribute, 
                            important_attribute, first_category, second_category, pit_target, 
                            (CASE WHEN DATE_SUB(NOW(), INTERVAL 30 DAY) <= onsale_date 
                                THEN '新品30' 
                            WHEN DATE_SUB(NOW(), INTERVAL 60 DAY) <= onsale_date 
                                THEN '新品60' 
                            WHEN DATE_SUB(NOW(), INTERVAL 90 DAY) <= onsale_date 
                                THEN '新品90' 
                            ELSE '老品' END) AS onsale_info FROM
                        dianshang_operation_attribute d WHERE goods_id = ?`
                    let row1 = await query(sql, [row[i].goods_id])
                    if (row1?.length) {
                        row[i].goods_name = row1[0].goods_name
                        row[i].brief_name = row1[0].brief_name
                        row[i].operator = row1[0].operator
                        row[i].brief_product_line = row1[0].brief_product_line
                        row[i].line_director = row1[0].line_director
                        row[i].purchase_director = row1[0].purchase_director
                        row[i].onsale_date = row1[0].onsale_date
                        row[i].link_attribute = row1[0].link_attribute
                        row[i].important_attribute = row1[0].important_attribute
                        row[i].first_category = row1[0].first_category
                        row[i].second_category = row1[0].second_category
                        row[i].pit_target = row1[0].pit_target
                        row[i].onsale_info = row1[0].onsale_info
                    }
                    sql = `SELECT sku_code FROM goods_sale_verified WHERE goods_id = ? 
                            AND \`date\` >= ? AND \`date\` <= ?
                        GROUP BY sku_code ORDER BY IFNULL(SUM(sale_amount), 0) DESC LIMIT 2`
                    row1 = await query(sql, [row[i].goods_id, start, end])
                    if (row1?.length) row[i].sku_id = row1[0].sku_code
                    if (row1?.length > 1) row[i].sku_sid = row1[1].sku_code

                    sql = `SELECT IF(IFNULL(SUM(sale_amount), 0) > 0 
                        AND IFNULL(SUM(sale_qty), 0) > 0 
                        AND IFNULL(SUM(settle_amount), 0) > 0, 
                            FORMAT((1 - IFNULL(SUM(bill_amount), 0) / SUM(settle_amount) 
                                - (IFNULL(SUM(express_fee), 0) + IFNULL(SUM(cost_amount), 0)) /
                                    IFNULL(SUM(sale_amount), 0) 
                        ) * 100, 2), 0) AS gross_profit FROM goods_gross_rate 
                        WHERE goods_id = ? AND order_time BETWEEN ? AND ?`
                    row1 = await query(sql, [row[i].goods_id, lastStart, lastEnd])
                    if (row1?.length) row[i].gross_profit = row1[0].gross_profit
                }
            }
            result.data = row
        }
    }
    return result
}

goodsSaleVerifiedRepo.batchInsert = async (count, data) => {
    let sql = `INSERT INTO goods_sale_verified(
            goods_id, 
            sku_code, 
            shop_name, 
            \`date\`, 
            sale_amount, 
            cost_amount, 
            gross_profit, 
            profit,  
            promotion_amount, 
            express_fee,
            operation_amount,
            real_sale_qty,
            refund_qty,
            real_sale_amount,
            packing_fee,
            bill_amount) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

goodsSaleVerifiedRepo.updateOrder = async ({
    date, goods_id, sku_code, shop_name, order_num, refund_num
}) => {
    let sql = `UPDATE goods_sale_verified SET order_num = ?, refund_num = ? 
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

goodsSaleVerifiedRepo.deleteByDate = async (date) => {
    let sql = `DELETE FROM goods_sale_verified WHERE \`date\` = ?`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

goodsSaleVerifiedRepo.getDataDetailByTime = async(column, goods_id, start, end) => {
    const sql = `SELECT IFNULL(SUM(${column}), 0) AS ${column}, \`date\` 
        FROM goods_sale_verified WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id = ?
        GROUP BY \`date\``
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsSaleVerifiedRepo.getDataDetailTotalByTime = async(goods_id, start, end) => {
    const sql = `SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(cost_amount), 0) AS cost_amount, 
            IFNULL(SUM(operation_amount), 0) AS operation_amount, 
            IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
            IFNULL(SUM(express_fee), 0) AS express_fee, 
            IFNULL(SUM(profit), 0) AS profit, 
            FORMAT(IF(IFNULL(SUM(sale_amount), 0) > 0, 
                IFNULL(SUM(operation_amount), 0) / SUM(sale_amount), 0) * 100, 
            2) AS operation_rate, 
            FORMAT(IF(IFNULL(SUM(promotion_amount), 0) > 0, 
                IFNULL(SUM(sale_amount), 0) / SUM(promotion_amount), 0),  
            2) AS roi, 
            FORMAT(IF(IFNULL(SUM(order_num), 0) > 0, 
                IFNULL(SUM(refund_num), 0) / SUM(order_num), 0) * 100,  
            2) AS refund_rate, 
            FORMAT(IF(IFNULL(SUM(sale_amount), 0) > 0, 
                IFNULL(SUM(profit), 0) / SUM(sale_amount), 0) * 100,  
            2) AS profit_rate, DATE_FORMAT(\`date\`, '%Y-%m-%d') as \`date\` 
        FROM goods_sale_verified WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id = ?
        GROUP BY \`date\``
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsSaleVerifiedRepo.getDataRateByTime = async(col1, col2, column, goods_id, start, end, percent) => {
    const sql = `SELECT FORMAT(IF(IFNULL(SUM(${col1}), 0) > 0, 
            IFNULL(SUM(${col2}), 0) / SUM(${col1}), 0) * ${percent}, 2) AS ${column}, 
            \`date\` FROM goods_sale_verified WHERE \`date\` >= ? AND \`date\` <= ? 
            AND goods_id = ?
        GROUP BY \`date\``
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsSaleVerifiedRepo.getDataGrossProfitByTime = async(goods_id, start, end) => {
    let days = moment(end).diff(moment(start), 'day'), params = []
    let sql = `SELECT IF(IFNULL(SUM(sale_amount), 0) > 0 AND IFNULL(SUM(sale_qty), 0) > 0 
                AND IFNULL(SUM(settle_amount), 0) > 0, 
                    FORMAT((1 - IFNULL(SUM(bill_amount), 0) / SUM(settle_amount) 
                        - (IFNULL(SUM(express_fee), 0) + IFNULL(SUM(cost_amount), 0)) /
                            IFNULL(SUM(sale_amount), 0) 
                ) * 100, 2), 0) AS gross_profit, ? AS \`date\`
        FROM goods_gross_profit WHERE order_time BETWEEN ? AND ? AND goods_id = ? 
        UNION ALL `
    let search = ''
    for (let i = days; i >= 0; i--) {
        search = `${search}${sql}`
        let time = moment(end).subtract(i, 'day').format('YYYY-MM-DD')
        let tstart = moment(end).subtract(i + 8, 'day').format('YYYY-MM-DD')
        let tend = moment(end).subtract(i + 2, 'day').format('YYYY-MM-DD')
        params.push(
            time,
            tstart,
            tend,
            goods_id
        )
    }
    search = search.substring(0, search.length - 10)
    const result = await query(search, params)
    return result || []
}

goodsSaleVerifiedRepo.getDataPromotionQOQByTime = async(goods_id, start, end) => {
    const sql = `SELECT FORMAT(IF(IFNULL(SUM(a2.promotion_amount), 0) > 0, 
                (IFNULL(SUM(a1.promotion_amount), 0) - SUM(a2.promotion_amount)) / 
                SUM(a2.promotion_amount), 0), 2) AS promotion_amount_qoq, 
            DATE_FORMAT(a1.date, '%Y-%m-%d') as \`date\` 
        FROM goods_sale_verified a1 LEFT JOIN goods_sale_verified a2 ON a1.goods_id = a2.goods_id
            AND a1.sku_code = a2.sku_code 
            AND a1.date = DATE_ADD(a2.date, INTERVAL 1 DAY)
        WHERE a1.date >= ? AND a1.date <= ? AND a1.goods_id = ?
        GROUP BY a1.date`
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsSaleVerifiedRepo.getDataGrossProfitDetailByTime = async(goods_id, start, end) => {
    const sql = `SELECT IF(IFNULL(SUM(sale_amount), 0) > 0 AND IFNULL(SUM(sale_qty), 0) > 0 
            AND IFNULL(SUM(settle_amount), 0) > 0, 
                FORMAT((1 - IFNULL(SUM(bill_amount), 0) / SUM(settle_amount) 
                    - (IFNULL(SUM(express_fee), 0) + IFNULL(SUM(cost_amount), 0)) /
                        IFNULL(SUM(sale_amount), 0) 
            ) * 100, 2), 0) AS gross_profit, sku_code FROM goods_gross_profit WHERE 
            order_time BETWEEN ? AND ? AND goods_id = ? GROUP BY sku_code`
    let tstart = moment(start).subtract(8, 'day').format('YYYY-MM-DD')
    let tend = moment(start).subtract(2, 'day').format('YYYY-MM-DD')
    const result = await query(sql, [tstart, tend, goods_id])
    return result || []
}

goodsSaleVerifiedRepo.getNewOnSaleInfo = async (sale_date, start, end, limit, offset) => {
    let result = {
        data: [],
        total: 0
    }
    let presql = `SELECT COUNT(1) AS count FROM (SELECT doa.goods_id, doa.onsale_date `
    const sql = `FROM dianshang_operation_attribute doa
        LEFT JOIN goods_sale_verified gsi ON doa.goods_id = gsi.goods_id
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

goodsSaleVerifiedRepo.getOptimizeResult = async (goods_id, time, optimize) => {
    let sql = `SELECT COUNT(1) AS count FROM dianshang_operation_attribute a 
        WHERE a.goods_id = "${goods_id}"`, start, end
    for (let i = 0; i < optimize.length; i++) {
        if (!time) {
            end = moment().subtract(1, 'day').format('YYYY-MM-DD')
            start = moment().subtract(optimize[i].days, 'day').format('YYYY-MM-DD')
        } else {
            start = moment(time).add(1, 'day').format('YYYY-MM-DD')
            end = moment(time).add(optimize[i].days, 'day').format('YYYY-MM-DD')
        }
        switch (optimize[i].column) {
            case 'profit_rate':
                sql = `${sql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a1.sale_amount), 0) AS sale_amount, 
                            IFNULL(SUM(a1.profit), 0) AS profit FROM goods_sale_verified a1 
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
                        FROM goods_sale_verified a1 WHERE a1.goods_id = "${goods_id}" 
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
                    let start1 = moment(start).subtract(8, 'day').format('YYYY-MM-DD')
                    let end1 = moment(start).subtract(2, 'day').format('YYYY-MM-DD')
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
                                SELECT  * FROM (SELECT IFNULL(SUM(a2.sale_amount), 0) AS sale_amount, 
                                    IFNULL(SUM(a2.sale_qty), 0) AS sale_qty, 
                                    IFNULL(SUM(a2.settle_amount), 0) AS settle_amount, 
                                    IFNULL(SUM(a2.bill_amount), 0) AS bill_amount, 
                                    IFNULL(SUM(a2.express_fee), 0) AS express_fee, 
                                    IFNULL(SUM(a2.cost_amount), 0) AS cost_amount, 
                                    a2.goods_id FROM goods_gross_profit a2 
                                WHERE a2.goods_id = "${goods_id}" 
                                    AND a2.order_time BETWEEN "${start1}" AND "${end1}") aa WHERE 
                                    goods_id IS NOT NULL AND 
                                    IF(sale_amount > 0 AND sale_qty > 0 AND settle_amount > 0, 
                                        (1 - bill_amount / settle_amount - 
                                            (express_fee + cost_amount) / sale_amount) * 100`
                            if (optimize[i].children[j].min != null && optimize[i].children[j].max != null) {
                                sql = `${sql} >= ${optimize[i].children[j].min} 
                                        AND (1 - bill_amount / settle_amount - 
                                            (express_fee + cost_amount) / sale_amount) * 100 < 
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
                        FROM goods_sale_verified a1 WHERE a1.goods_id = "${goods_id}" 
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
            default:
        }
    }
    let result = await query(sql)
    return result|| []
}


module.exports = goodsSaleVerifiedRepo