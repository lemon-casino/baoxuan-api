const { query } = require('../../model/dbConn')
const userOperationRepo = {}
const moment = require('moment')

userOperationRepo.getPermission = async (user_id) => {
    const sql = `SELECT * FROM user_operation WHERE user_id = ? ORDER BY type`
    const result = await query(sql, user_id)
    return result || []
}

userOperationRepo.getGoodsLine = async (start, end, params, shopNames, userNames) => {
    let presql = `SELECT COUNT(1) AS count`
    let presql1 = `SELECT doa.goods_id, IFNULL(SUM(gsi.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(gsi.promotion_amount), 0) AS promotion_amount, 
            IFNULL(SUM(gsi.express_fee), 0) AS express_fee, 
            IFNULL(SUM(gsi.operation_amount), 0) AS operation_amount, 
            IFNULL(SUM(goi.words_market_vol), 0) AS words_market_vol, 
            IFNULL(SUM(goi.words_vol), 0) AS words_vol, 
            IFNULL(SUM(gsi.real_sale_qty), 0) AS real_sale_qty, 
            IFNULL(SUM(gsi.refund_qty), 0) AS refund_qty, 
            FORMAT(IF(IFNULL(SUM(gsi.sale_amount), 0) > 0, 
                IFNULL(SUM(gsi.operation_amount), 0) / SUM(gsi.sale_amount) * 100, 
                0), 2) AS operation_rate, 
            FORMAT(IF(IFNULL(SUM(gsi.promotion_amount), 0) > 0, 
                IFNULL(SUM(gsi.sale_amount), 0) / SUM(gsi.promotion_amount), 
                0), 2) AS roi, 
            FORMAT(IF(IFNULL(SUM(goi.words_market_vol), 0) > 0, 
                IFNULL(SUM(goi.words_vol), 0) / SUM(goi.words_market_vol), 
                0), 2) AS market_rate, 
            FORMAT(IF(IFNULL(SUM(gsi.real_sale_qty), 0) > 0, 
                IFNULL(SUM(gsi.refund_qty), 0) / SUM(gsi.real_sale_qty), 
                0), 2) AS refund_rate, 
            IFNULL(SUM(gsi.profit), 0) AS profit, 
            IF(IFNULL(SUM(gsi.sale_amount), 0) > 0, 
                FORMAT(IFNULL(SUM(gsi.profit), 0) / SUM(gsi.sale_amount), 2), 
            0) * 100 AS profit_rate`
    let sql = ` FROM dianshang_operation_attribute doa
        JOIN goods_sale_info gsi ON gsi.goods_id = doa.goods_id 
        LEFT JOIN goods_other_info goi ON gsi.goods_id = goi.goods_id 
            AND gsi.date = goi.date` 
    let subsql = ` WHERE gsi.date >= ? AND gsi.date <= ?`, p = [start, end]
    for (let i = 0; i < params.search.length; i++) {
        if (params.search[i].key == 'operation_rate') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.operation_amount), 0) AS operation_amount, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_sale_info a2
                        WHERE a2.date >= ? AND a2.date <= ? 
                            AND gsi.goods_id = a2.goods_id 
                    ) b WHERE b.operation_amount * 100 >= ${params.search[i].min} * b.sale_amount
                        AND b.operation_amount * 100 <= ${params.search[i].max} * b.sale_amount
                )`
            p.push(start, end)
        } else if (params.search[i].key == 'roi') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.promotion_amount), 0) AS promotion_amount, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_sale_info a2 
                        WHERE a2.date >= ? AND a2.date <= ? 
                            AND gsi.goods_id = a2.goods_id 
                    ) b WHERE b.sale_amount >= ${params.search[i].min} * b.promotion_amount 
                        AND b.sale_amount <= ${params.search[i].max} * b.promotion_amount 
                )`
            p.push(start, end)
        } else if (params.search[i].key == 'market_rate') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.words_market_vol), 0) AS words_market_vol, 
                            IFNULL(SUM(a2.words_vol), 0) AS words_vol FROM goods_sale_info a2 
                        WHERE a2.date >= ? AND a2.date <= ? 
                            AND gsi.goods_id = a2.goods_id 
                    ) b WHERE b.words_vol * 100 >= ${params.search[i].min} * b.words_market_vol
                        AND b.words_vol * 100 <= ${params.search[i].max} * b.words_market_vol
                )`
            p.push(start, end)
        } else if (params.search[i].key == 'refund_rate') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.real_sale_qty), 0) AS real_sale_qty, 
                            IFNULL(SUM(a2.refund_qty), 0) AS refund_qty FROM goods_sale_info a2 
                        WHERE a2.date >= ? AND a2.date <= ? 
                            AND gsi.goods_id = a2.goods_id 
                    ) b WHERE b.refund_qty * 100 >= ${params.search[i].min} * b.real_sale_qty
                        AND b.refund_qty * 100 <= ${params.search[i].max} * b.real_sale_qty
                )`
            p.push(start, end)
        } else if (params.search[i].key == 'profit_rate') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.profit), 0) AS profit, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM goods_sale_info a2 
                        WHERE a2.date >= ? AND a2.date <= ? 
                            AND gsi.goods_id = a2.goods_id 
                    ) b WHERE b.profit * 100 >= ${params.search[i].min} * b.sale_amount
                        AND b.profit * 100 <= ${params.search[i].max} * b.sale_amount
                )`
            p.push(start, end)
        } else {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.${params.search[i].key}), 0) AS val FROM 
                        goods_sale_info a2 WHERE a2.date >= ? AND a2.date <= ? 
                            AND gsi.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max}
                )`
            p.push(start, end)
        }
    }
    if (shopNames) {
        subsql = `${subsql} 
            AND doa.shop_name IN ("${shopNames}")`
    }
    if (userNames) {
        subsql = `${subsql} 
            AND doa.operator IN ("${userNames}")`
    }
    let size = parseInt(params.pageSize)
    let page = parseInt(params.currentPage)
    let offset = (page - 1) * size
    let search = `${presql}${sql}${subsql} GROUP BY doa.goods_id`, result = {
        total: 0,
        data: [],
        sum: 0
    }
    let info = await query(search, p)
    if (info?.length && info[0].count > 0) {
        result.total = info[0].count
        search = `SELECT IFNULL(SUM(gsi.sale_amount), 0) AS sum
            ${sql}${subsql}`
        info = await query(search, p)
        if (info?.length) result.sum = info[0].sum
        search = `SELECT a.*, pi.project_name, doa1.first_category, 
            doa1.second_category, doa1.level_3_category, doa1.brief_product_line, 
            doa1.sku_id, doa1.product_definition, doa1.stock_structure, 
            doa1.product_rank, doa1.product_design_attr, doa1.seasons, doa1.brand, 
            doa1.targets, doa1.exploit_director, doa1.purchase_director, 
            doa1.line_manager, doa1.operator, doa1.onsale_date FROM  
            (${presql1}${sql}${subsql} GROUP BY doa.goods_id LIMIT ${offset}, ${size}) a
            JOIN dianshang_operation_attribute doa1 ON a.goods_id = doa1.goods_id 
            JOIN shop_info si ON si.shop_name = doa1.shop_name 
            JOIN project_info pi ON pi.id = si.project_id`
        info = await query(search, p)
        if (info?.length) result.data = info
    }
    return result
}

userOperationRepo.getUsersByShopName = async (shopName) => {
    const sql = `SELECT doa.operator AS nickname, doa.operator AS name 
        FROM dianshang_operation_attribute doa 
        JOIN goods_sale_info gsi ON doa.goods_id = gsi.goods_id 
        WHERE gsi.shop_name = ? 
            GROUP BY doa.operator`
        const result = await query(sql, shopName)
    return result || []
}

userOperationRepo.getUsersByProjectName = async (projectName) => {
    const sql = `SELECT doa.operator AS nickname, doa.operator AS name 
        FROM dianshang_operation_attribute doa 
        JOIN goods_sale_info gsi ON doa.goods_id = gsi.goods_id 
        JOIN shop_info si ON si.shop_name = gsi.shop_name 
        JOIN project_info pi ON pi.id = si.project_id
        WHERE pi.project_name = ? 
            GROUP BY doa.operator`
        const result = await query(sql, projectName)
    return result || []
}

userOperationRepo.getUserById = async (id) => {
    const sql = `SELECT nickname AS nickname, nickname AS name 
        FROM users WHERE user_id = ?`
        const result = await query(sql, id)
    return result || []
}

userOperationRepo.getPermissionLimit = async (user_id) => {
    const sql = `SELECT * FROM user_operation WHERE user_id = ? ORDER BY type LIMIT 1`
    const result = await query(sql, user_id)
    return result || []
}

userOperationRepo.getLinkIdsByUserNames = async (userNames) => {
    const sql = `SELECT goods_id FROM dianshang_operation_attribute 
        WHERE operator IN ("${userNames}")`
    const result = await query(sql)
    return result || []
}

module.exports = userOperationRepo