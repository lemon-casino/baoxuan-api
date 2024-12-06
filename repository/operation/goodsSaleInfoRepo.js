const { query } = require('../../model/dbConn')
const moment = require('moment')

const goodsSaleInfoRepo = {}

goodsSaleInfoRepo.getPaymentByShopNamesAndTime = async (shopNames, start, end) => {
    const sql = `SELECT IFNULL(SUM(A1.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(a1.express_fee), 0) AS express_fee, 
            IFNULL(SUM(a1.promotion_amount), 0) AS promotion_amount, 
            IFNULL(SUM(a1.operation_amount), 0) AS operation_amount, 
            IFNULL(SUM(a2.words_market_vol), 0) AS words_market_vol, 
            IFNULL(SUM(a2.words_vol), 0) AS words_vol, 
            IFNULL(SUM(a1.real_sale_qty), 0) AS real_sale_qty, 
            IFNULL(SUM(a1.refund_qty), 0) AS refund_qty, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.operation_amount), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS operation_rate, 
            FORMAT(IF(IFNULL(SUM(a1.promotion_amount), 0) > 0, 
                IFNULL(SUM(a1.sale_amount), 0) / SUM(a1.promotion_amount), 
                0), 2) AS roi, 
            FORMAT(IF(IFNULL(SUM(a2.words_market_vol), 0) > 0, 
                IFNULL(SUM(a2.words_vol), 0) / SUM(a2.words_market_vol) * 100, 
                0), 2) AS market_rate, 
            FORMAT(IF(IFNULL(SUM(a1.real_sale_qty), 0) > 0, 
                IFNULL(SUM(a1.refund_qty), 0) / SUM(a1.real_sale_qty) * 100, 
                0), 2) AS refund_rate, 
            IFNULL(SUM(a1.profit), 0) AS profit, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.profit), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS profit_rate FROM goods_sale_info a1
        LEFT JOIN goods_other_info a2 ON a1.goods_id = a2.goods_id
            AND a1.date = a2.date
        WHERE a1.shop_name IN ("${shopNames}") 
            AND a1.date >= ?
            AND a1.date <= ?`
    const result = await query(sql, [start, end])
    return result || []
}

goodsSaleInfoRepo.getNullPromotionByTime = async (shopNames, start, end) => {
    let sql = `SELECT a1.shop_name FROM goods_sale_info a1 LEFT JOIN shop_info si
            ON a1.shop_name = si.shop_name
        WHERE a1.shop_name IN ("${shopNames}") AND a1.date >= ? 
            AND a1.date <= ? 
            AND si.has_promotion = 1 
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
            IFNULL(SUM(a1.promotion_amount), 0) AS promotion_amount, 
            IFNULL(SUM(a1.operation_amount), 0) AS operation_amount, 
            IFNULL(SUM(a2.words_market_vol), 0) AS words_market_vol, 
            IFNULL(SUM(a2.words_vol), 0) AS words_vol, 
            IFNULL(SUM(a1.real_sale_qty), 0) AS real_sale_qty, 
            IFNULL(SUM(a1.refund_qty), 0) AS refund_qty, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.operation_amount), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS operation_rate, 
            FORMAT(IF(IFNULL(SUM(a1.promotion_amount), 0) > 0, 
                IFNULL(SUM(a1.sale_amount), 0) / SUM(a1.promotion_amount), 
                0), 2) AS roi, 
            FORMAT(IF(IFNULL(SUM(a2.words_market_vol), 0) > 0, 
                IFNULL(SUM(a2.words_vol), 0) / SUM(a2.words_market_vol), 
                0), 2) AS market_rate, 
            FORMAT(IF(IFNULL(SUM(a1.real_sale_qty), 0) > 0, 
                IFNULL(SUM(a1.refund_qty), 0) / SUM(a1.real_sale_qty), 
                0), 2) AS refund_rate, 
            IFNULL(SUM(a1.profit), 0) AS profit, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.profit), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS profit_rate, 
            (CASE WHEN doa.onsale_date IS NULL OR 
					doa.operator IN ('无操作', '非操作') THEN 0
				WHEN DATE_SUB(NOW(), INTERVAL 60 DAY) <= doa.onsale_date THEN 1
				ELSE 2 END) AS type FROM goods_sale_info a1
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
            IFNULL(SUM(a1.promotion_amount), 0) AS promotion_amount, 
            IFNULL(SUM(a1.operation_amount), 0) AS operation_amount, 
            IFNULL(SUM(a2.words_market_vol), 0) AS words_market_vol, 
            IFNULL(SUM(a2.words_vol), 0) AS words_vol, 
            IFNULL(SUM(a1.real_sale_qty), 0) AS real_sale_qty, 
            IFNULL(SUM(a1.refund_qty), 0) AS refund_qty, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.operation_amount), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS operation_rate, 
            FORMAT(IF(IFNULL(SUM(a1.promotion_amount), 0) > 0, 
                IFNULL(SUM(a1.sale_amount), 0) / SUM(a1.promotion_amount), 
                0), 2) AS roi, 
            FORMAT(IF(IFNULL(SUM(a2.words_market_vol), 0) > 0, 
                IFNULL(SUM(a2.words_vol), 0) / SUM(a2.words_market_vol) * 100, 
                0), 2) AS market_rate, 
            FORMAT(IF(IFNULL(SUM(a1.real_sale_qty), 0) > 0, 
                IFNULL(SUM(a1.refund_qty), 0) / SUM(a1.real_sale_qty) * 100, 
                0), 2) AS refund_rate, 
            IFNULL(SUM(a1.profit), 0) AS profit, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.profit), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS profit_rate FROM goods_sale_info a1 
        LEFT JOIN goods_other_info a2 ON a1.goods_id = a2.goods_id
            AND a1.date = a2.date
        WHERE a1.goods_id IN ("${linkIds}") 
            AND a1.date >= ?
            AND a1.date <= ?`
    const result = await query(sql, [start, end])
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
            IFNULL(SUM(a1.promotion_amount), 0) AS promotion_amount, 
            IFNULL(SUM(a1.operation_amount), 0) AS operation_amount, 
            IFNULL(SUM(a2.words_market_vol), 0) AS words_market_vol, 
            IFNULL(SUM(a2.words_vol), 0) AS words_vol, 
            IFNULL(SUM(a1.real_sale_qty), 0) AS real_sale_qty, 
            IFNULL(SUM(a1.refund_qty), 0) AS refund_qty, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.operation_amount), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS operation_rate, 
            FORMAT(IF(IFNULL(SUM(a1.promotion_amount), 0) > 0, 
                IFNULL(SUM(a1.sale_amount), 0) / SUM(a1.promotion_amount), 
                0), 2) AS roi, 
            FORMAT(IF(IFNULL(SUM(a2.words_market_vol), 0) > 0, 
                IFNULL(SUM(a2.words_vol), 0) / SUM(a2.words_market_vol) * 100, 
                0), 2) AS market_rate, 
            FORMAT(IF(IFNULL(SUM(a1.real_sale_qty), 0) > 0, 
                IFNULL(SUM(a1.refund_qty), 0) / SUM(a1.real_sale_qty) * 100, 
                0), 2) AS refund_rate, 
            IFNULL(SUM(a1.profit), 0) AS profit, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.profit), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS profit_rate, 
            (CASE WHEN doa.onsale_date IS NULL OR 
					doa.operator IN ('无操作', '非操作') THEN 0
				WHEN DATE_SUB(NOW(), INTERVAL 60 DAY) <= doa.onsale_date THEN 1
				ELSE 2 END) AS type FROM goods_sale_info a1 
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

goodsSaleInfoRepo.  getData = async (start, end, params, shopNames, linkIds) => {
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
    let sql = `SELECT SUM(a1.sale_amount) AS sale_amount, a1.goods_id, a1.shop_name, 
            a1.shop_id FROM goods_sale_info a1`
    subsql = ` WHERE a1.date >= ? AND a1.date <= ?`
    p.push(start, end)
    for (let i =0; i < params.search.length; i++) {
        if (params.search[i].field_id == 'operation_rate') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.operation_amount), 0) AS operation_amount, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_sale_info a2
                        WHERE a2.date >= ? AND a2.date <= ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.operation_amount * 100 >= ${params.search[i].min} * b.sale_amount
                        AND b.operation_amount * 100 <= ${params.search[i].max} * b.sale_amount)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'roi') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.promotion_amount), 0) AS promotion_amount, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_sale_info a2 
                        WHERE a2.date >= ? AND a2.date <= ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.sale_amount >= ${params.search[i].min} * b.promotion_amount 
                        AND b.sale_amount <= ${params.search[i].max} * b.promotion_amount )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'market_rate') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a3.words_market_vol), 0) AS words_market_vol, 
                            IFNULL(SUM(a3.words_vol), 0) AS words_vol FROM goods_sale_info a3 
                        WHERE a3.date >= ? AND a3.date <= ? 
                            AND a1.goods_id = a3.goods_id 
                    ) b WHERE b.words_vol * 100 >= ${params.search[i].min} * b.words_market_vol
                        AND b.words_vol * 100 <= ${params.search[i].max} * b.words_market_vol)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'refund_rate') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.real_sale_qty), 0) AS real_sale_qty, 
                            IFNULL(SUM(a2.refund_qty), 0) AS refund_qty FROM goods_sale_info a2 
                        WHERE a2.date >= ? AND a2.date <= ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.refund_qty * 100 >= ${params.search[i].min} * b.real_sale_qty
                        AND b.refund_qty * 100 <= ${params.search[i].max} * b.real_sale_qty)`
            p.push(start, end)
        } else if (params.search[i].field_id == 'profit_rate') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.profit), 0) AS profit, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_sale_info a2 
                        WHERE a2.date >= ? AND a2.date <= ? 
                            AND a1.goods_id = a2.goods_id 
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
                                    IFNULL(SUM(a2.sale_amount), 0) / IFNULL(SUM(a2.sale_qty), 0)
                        ) * 100, 2), 0) AS val FROM goods_gross_profit a2 
                        WHERE a2.goods_id = a1.goods_id 
                            AND a2.order_time >= DATE_SUB(?, INTERVAL WEEKDAY(?) + 7 DAY) 
                            AND a2.order_time <= DATE_SUB(?, INTERVAL WEEKDAY(?) + 1 DAY) 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, start, start, start)
        } else if (['pay_amount', 'brushing_amount', 'brushing_qty', 'refund_amount', 'bill'].includes(params.search[i].field_id)) {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.${params.search[i].field_id}), 0) AS val FROM 
                        goods_pay_info a2 WHERE a2.date >= ? AND a2.date <= ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'pay_express_fee') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.express_fee), 0) AS val FROM 
                        goods_pay_info a2 WHERE a2.date >= ? AND a2.date <= ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'real_pay_amount') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.pay_amount), 0) - IFNULL(SUM(a2.brushing_amount), 0) 
                        AS val FROM goods_pay_info a2 WHERE a2.date >= ? AND a2.date <= ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (['words_market_vol', 'words_vol'].includes(params.search[i].field_id)) {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.${params.search[i].field_id}), 0) AS val 
                        FROM goods_other_info a2 WHERE a2.date >= ? AND a2.date <= ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'dsr') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT FORMAT(IFNULL(SUM(a2.dsr), 0) / COUNT(1), 2) AS val 
                        FROM goods_other_info a2 WHERE a2.date >= ? AND a2.date <= ? 
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
                        ), 2) AS val FROM goods_sale_info a2 WHERE 
                            a2.date >= DATE_SUB(?, INTERVAL 1 DAY) 
                            AND a2.date <= DATE_SUB(?, INTERVAL 1 DAY)
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max} )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'is_goods_id') {
            if (params.search[i].value == 0)
                subsql = `${subsql} AND a1.goods_id IS NULL`
            else subsql = `${subsql} AND a1.goods_id IS NOT NULL`
        } else if (params.search[i].field_id == 'onsale_info') {
            if (params.search[i].value != 'old')
                subsql = `${subsql} AND EXISTS(
                        SELECT a2.goods_id FROM goods_sale_info a2 WHERE 
                            a2.onsale_date >= DATE_SUB(NOW(), INTERVAL ${params.search[i].value} DAY) 
                            AND a1.goods_id = a2.goods_id)`
            else
                subsql = `${subsql} AND EXISTS(
                    SELECT a2.goods_id FROM goods_sale_info a2 WHERE 
                        (a2.onsale_date < DATE_SUB(NOW(), INTERVAL 90 DAY) OR 
                            a2.onsale_date IS NULL
                        ) AND a1.goods_id = a2.goods_id)`
        } else if (params.search[i].field_id == 'goods_id') {
            subsql = `${subsql} AND a1.goods_id LIKE '%${params.search[i].value}%'`
        } else if (params.search[i].field_id == 'sku_id') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT a2.sku_code FROM goods_sale_info a2 WHERE 
                            a2.goods_id = a1.goods_id 
                            AND a2.date >= ? AND a2.date <= ? 
                        GROUP BY a2.sku_code 
                        ORDER BY IFNULL(SUM(a2.sale_amount), 0) LIMIT 1 
                    ) a3 WHERE a3.sku_code LIKE '%${params.search[i].value}%')`
            p.push(start, end)
        } else if (params.search[i].field_id == 'sku_sid') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (SELECT * FROM (
                        SELECT a2.sku_code, IFNULL(SUM(a2.sale_amount), 0) AS amount 
                        FROM goods_sale_info a2 WHERE a2.goods_id = a1.goods_id 
                            AND a2.date >= ? AND a2.date <= ? 
                        GROUP BY a2.sku_code 
                        ORDER BY IFNULL(SUM(a2.sale_amount), 0) LIMIT 2 
                    ) a3 ORDER BY amount LIMIT 1) a4 
                    WHERE a4.sku_code LIKE '%${params.search[i].value}%')`
            p.push(start, end)
        } else if (params.search[i].type == 'number') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.${params.search[i].field_id}), 0) AS val FROM 
                        goods_sale_info a2 WHERE a2.date >= ? AND a2.date <= ? 
                            AND a1.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max})`
            p.push(start, end)
        } else if (params.search[i].type == 'date' && params.search[i].time) {
            subsql = `${subsql} AND EXISTS(
                    SELECT a2.goods_id AS val FROM dianshang_operation_attribute a2 
                    WHERE a1.goods_id = a2.goods_id 
                        AND a2.${params.search[i].field_id} >= '${params.search[i].time[0]}'
                        AND a2.${params.search[i].field_id} <= '${params.search[i].time[1]}')`
            p.push(start, end)
        } else if (params.search[i].type == 'input' && params.search[i].value) {
            subsql = `${subsql} AND EXISTS(
                    SELECT a2.goods_id AS val FROM dianshang_operation_attribute a2 
                    WHERE a1.goods_id = a2.goods_id 
                        AND a2.${params.search[i].field_id} LIKE '%${params.search[i].value}%')`
            p.push(start, end)
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
    let sql1 = `GROUP BY a1.goods_id, a1.shop_name, a1.shop_id`
    sql = `SELECT COUNT(1) AS count, SUM(sale_amount) AS sale_amount 
        FROM (${sql}${subsql}${sql1}) a`
    let row = await query(sql, p)
    if (row?.length && row[0].count) {
        result.total = row[0].count
        result.sum = row[0].sale_amount        
        sql = `SELECT a1.goods_id, a1.shop_name, a1.shop_id, 
            IFNULL(SUM(a3.pay_amount), 0) AS pay_amount, 
            IFNULL(SUM(a3.brushing_amount), 0) AS brushing_amount, 
            IFNULL(SUM(a3.brushing_qty), 0) AS brushing_qty, 
            IFNULL(SUM(a3.refund_amount), 0) AS refund_amount, 
            IFNULL(SUM(a3.express_fee), 0) AS pay_express_fee, 
            IFNULL(SUM(a3.pay_amount), 0) - IFNULL(SUM(a3.brushing_amount), 0) 
            AS real_pay_amount, IFNULL(SUM(a3.bill), 0) AS bill,
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
            IFNULL(SUM(a1.real_sale_qty), 0) AS real_sale_qty, 
            IFNULL(SUM(a1.refund_qty), 0) AS refund_qty, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.operation_amount), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS operation_rate, 
            FORMAT(IF(IFNULL(SUM(a1.promotion_amount), 0) > 0, 
                IFNULL(SUM(a1.sale_amount), 0) / SUM(a1.promotion_amount), 
                0), 2) AS roi, 
            FORMAT(IF(IFNULL(SUM(a4.words_market_vol), 0) > 0, 
                IFNULL(SUM(a4.words_vol), 0) / SUM(a4.words_market_vol) * 100, 
                0), 2) AS market_rate, 
            FORMAT(IF(IFNULL(SUM(a1.real_sale_qty), 0) > 0, 
                IFNULL(SUM(a1.refund_qty), 0) / SUM(a1.real_sale_qty) * 100, 
                0), 2) AS refund_rate, 
            IFNULL(SUM(a1.profit), 0) AS profit, 
            FORMAT(IF(IFNULL(SUM(a1.sale_amount), 0) > 0, 
                IFNULL(SUM(a1.profit), 0) / SUM(a1.sale_amount) * 100, 
                0), 2) AS profit_rate 
            FROM goods_sale_info a1 LEFT JOIN goods_other_info a4 
                ON a4.goods_id = a1.goods_id 
                    AND a4.date = a1.date
            LEFT JOIN goods_pay_info a3 ON a1.goods_id = a3.goods_id 
                AND a1.date = a3.date
            LEFT JOIN goods_sale_info a8 ON a8.goods_id = a1.goods_id 
                AND a8.date >= DATE_SUB("${start}", INTERVAL 1 DAY)
                AND a8.date <= DATE_SUB("${end}", INTERVAL 1 DAY)`
        sql1 = `GROUP BY a1.goods_id, a1.shop_name, a1.shop_id`
        sql = `SELECT aa.* FROM (${sql}${subsql}${sql1}) aa`
        if (params.sort) sql = `${sql} ORDER BY aa.${params.sort}`
        sql = `${sql}
            LIMIT ${offset}, ${size}`
        row = await query(sql, p)
        if (row?.length) {
            for (let i = 0; i < row.length; i++) {
                row[i].sku_id = ''
                row[i].sku_sid = ''
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
                    sql = `SELECT sku_code FROM goods_sale_info WHERE goods_id = ? 
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
                                    IFNULL(SUM(sale_amount), 0) / IFNULL(SUM(sale_qty), 0)
                        ) * 100, 2), 0) AS gross_profit FROM goods_gross_profit 
                        WHERE goods_id = ? 
                            AND order_time >= DATE_SUB(?, INTERVAL WEEKDAY(?) + 7 DAY) 
                            AND order_time <= DATE_SUB(?, INTERVAL WEEKDAY(?) + 1 DAY)`
                    row1 = await query(sql, [row[i].goods_id, start, start, start, start])
                    if (row1?.length) row[i].gross_profit = row1[0].gross_profit
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
            real_gross_profit) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

goodsSaleInfoRepo.deleteByDate = async (date, column, except) => {
    let sql = `DELETE FROM goods_sale_info WHERE \`date\` = ? 
        AND ${column} IS NULL`
    if (except) sql = `${sql} AND shop_name = '京东自营旗舰店'`
    else sql = `${sql} AND shop_name != '京东自营旗舰店'`
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

goodsSaleInfoRepo.getDataRateByTime = async(col1, col2, column, goods_id, start, end, percent) => {
    const sql = `SELECT FORMAT(IF(IFNULL(SUM(${col1}), 0) > 0, 
            IFNULL(SUM(${col2}), 0) / SUM(${col1}), 0) * ${percent}, 2) AS ${column}, 
            \`date\` FROM goods_sale_info WHERE \`date\` >= ? AND \`date\` <= ? 
            AND goods_id = ?
        GROUP BY \`date\``
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsSaleInfoRepo.getDataGrossProfitByTime = async(goods_id, start, end) => {
    let days = moment(end).diff(moment(start), 'day'), params = []
    let sql = `SELECT IF(IFNULL(SUM(sale_amount), 0) > 0 AND IFNULL(SUM(sale_qty), 0) > 0 
                AND IFNULL(SUM(settle_amount), 0) > 0, 
                    FORMAT((1 - IFNULL(SUM(bill_amount), 0) / SUM(settle_amount) 
                        - (IFNULL(SUM(express_fee), 0) + IFNULL(SUM(cost_amount), 0)) /
                            IFNULL(SUM(sale_amount), 0) / IFNULL(SUM(sale_qty), 0)
                ) * 100, 2), 0) AS gross_profit, ? AS \`date\`
        FROM goods_gross_profit WHERE order_time >= DATE_SUB(?, INTERVAL WEEKDAY(?) + 7 DAY) 
            AND order_time <= DATE_SUB(?, INTERVAL WEEKDAY(?) + 1 DAY) 
            AND goods_id = ? 
        UNION ALL `
    let search = ''
    for (let i = days; i >= 0; i--) {
        search = `${search}${sql}`
        let time = moment(end).subtract(i, 'day').format('YYYY-MM-DD')
        params.push(
            time,
            time,
            time,
            time,
            time,
            goods_id
        )
    }
    search = search.substring(0, search.length - 10)
    const result = await query(search, params)
    return result || []
}

goodsSaleInfoRepo.getDataPromotionQOQByTime = async(goods_id, start, end) => {
    const sql = `SELECT FORMAT(IF(IFNULL(SUM(a2.promotion_amount), 0) > 0, 
                (IFNULL(SUM(a1.promotion_amount), 0) - SUM(a2.promotion_amount)) / 
                SUM(a2.promotion_amount), 0), 2) AS promotion_amount_qoq, a1.date 
        FROM goods_sale_info a1 LEFT JOIN goods_sale_info a2 ON a1.goods_id = a2.goods_id
            AND a1.sku_code = a2.sku_code 
            AND a1.date = DATE_ADD(a2.date, INTERVAL 1 DAY)
        WHERE a1.date >= ? AND a1.date <= ? AND a1.goods_id = ?
        GROUP BY a1.date`
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsSaleInfoRepo.getDataGrossProfitDetailByTime = async(goods_id, start, end) => {
    const sql = `SELECT IF(IFNULL(SUM(sale_amount), 0) > 0 AND IFNULL(SUM(sale_qty), 0) > 0 
            AND IFNULL(SUM(settle_amount), 0) > 0, 
                FORMAT((1 - IFNULL(SUM(bill_amount), 0) / SUM(settle_amount) 
                    - (IFNULL(SUM(express_fee), 0) + IFNULL(SUM(cost_amount), 0)) /
                        IFNULL(SUM(sale_amount), 0) / IFNULL(SUM(sale_qty), 0)
            ) * 100, 2), 0) AS gross_profit, sku_code FROM goods_gross_profit WHERE 
            order_time >= DATE_SUB(?, INTERVAL WEEKDAY(?) + 7 DAY) 
            AND order_time <= DATE_SUB(?, INTERVAL WEEKDAY(?) + 1 DAY)
            AND goods_id = ? GROUP BY sku_code`
    const result = await query(sql, [start, start, start, start, goods_id])
    return result || []
}

goodsSaleInfoRepo.updateFee = async(sku_id, promotion_amount, date) => {
    const sql = `UPDATE goods_sale_info SET promotion_amount = promotion_amount + ?, 
        operation_amount = operation_amount + ?, profit = profit - ?, 
        profit_rate = IF(sale_amount, (profit - ?) / sale_amount, 0) WHERE sku_id = ?
            AND shop_name = '京东自营旗舰店' 
            AND \`date\` = ?`
    const result = await query(sql, [
        promotion_amount, 
        promotion_amount, 
        promotion_amount, 
        promotion_amount,
        sku_id.toString(),
        date
    ])
    return result?.affectedRows ? true : false
}

module.exports = goodsSaleInfoRepo