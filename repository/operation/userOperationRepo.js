const { query } = require('../../model/dbConn')
const userOperationRepo = {}
const moment = require('moment')
userOperationRepo.getPermission = async (user_id) => {
    const sql = `SELECT * FROM user_operation WHERE user_id = ? ORDER BY type`
    const result = await query(sql, user_id)
    return result || []
}

userOperationRepo.getGoodsLine = async (start, end, params, shopNames, userNames, stats) => {
    let table = stats == 'verified' ? 'goods_sale_verified' : 'goods_sale_info'
    let presql = `SELECT COUNT(1) AS count`
    let presql1 = `SELECT doa.goods_id, IFNULL(SUM(gsi.sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(gsi.promotion_amount), 0) AS promotion_amount, 
            IFNULL(SUM(gsi.express_fee), 0) AS express_fee, 
            IFNULL(SUM(gsi.operation_amount), 0) AS operation_amount, 
            IFNULL(SUM(goi.words_market_vol), 0) AS words_market_vol, 
            IFNULL(SUM(goi.words_vol), 0) AS words_vol, 
            FORMAT(IFNULL(SUM(goi.dsr), 0) / COUNT(1), 2) AS dsr, 
            IFNULL(SUM(gsi.real_sale_qty), 0) AS real_sale_qty, 
            IFNULL(SUM(gsi.refund_qty), 0) AS refund_qty, 
            FORMAT(IF(IFNULL(SUM(gsi.sale_amount), 0) > 0, 
                IFNULL(SUM(gsi.operation_amount), 0) / SUM(gsi.sale_amount) * 100, 
                0), 2) AS operation_rate, 
            FORMAT(IF(IFNULL(SUM(gsi.promotion_amount), 0) > 0, 
                IFNULL(SUM(gsi.sale_amount), 0) / SUM(gsi.promotion_amount), 
                0), 2) AS roi, 
            FORMAT(IF(IFNULL(SUM(goi.words_market_vol), 0) > 0, 
                IFNULL(SUM(goi.words_vol), 0) / SUM(goi.words_market_vol) * 100, 
                0), 2) AS market_rate, 
            FORMAT(IF(IFNULL(SUM(gsi.real_sale_qty), 0) > 0, 
                IFNULL(SUM(gsi.refund_qty), 0) / SUM(gsi.real_sale_qty) * 100, 
                0), 2) AS refund_rate, 
            IFNULL(SUM(gsi.profit), 0) AS profit, 
            IF(IFNULL(SUM(gsi.sale_amount), 0) > 0, 
                FORMAT(IFNULL(SUM(gsi.profit), 0) / SUM(gsi.sale_amount), 2), 
            0) * 100 AS profit_rate`
    let sql = ` FROM dianshang_operation_attribute doa
        JOIN ${table} gsi ON gsi.goods_id = doa.goods_id 
        LEFT JOIN goods_other_info goi ON gsi.goods_id = goi.goods_id 
            AND gsi.date = goi.date` 
    let subsql = ` WHERE gsi.date >= ? AND gsi.date <= ?`, p = [start, end]
    for (let i = 0; i < params.search.length; i++) {
        if (params.search[i].field_id == 'operation_rate') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.operation_amount), 0) AS operation_amount, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM ${table} a2
                        WHERE a2.date >= ? AND a2.date <= ? 
                            AND gsi.goods_id = a2.goods_id 
                    ) b WHERE b.operation_amount * 100 >= ${params.search[i].min} * b.sale_amount
                        AND b.operation_amount * 100 <= ${params.search[i].max} * b.sale_amount
                )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'roi') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.promotion_amount), 0) AS promotion_amount, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM ${table} a2 
                        WHERE a2.date >= ? AND a2.date <= ? 
                            AND gsi.goods_id = a2.goods_id 
                    ) b WHERE b.sale_amount >= ${params.search[i].min} * b.promotion_amount 
                        AND b.sale_amount <= ${params.search[i].max} * b.promotion_amount 
                )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'market_rate') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.words_market_vol), 0) AS words_market_vol, 
                            IFNULL(SUM(a2.words_vol), 0) AS words_vol FROM ${table} a2 
                        WHERE a2.date >= ? AND a2.date <= ? 
                            AND gsi.goods_id = a2.goods_id 
                    ) b WHERE b.words_vol * 100 >= ${params.search[i].min} * b.words_market_vol
                        AND b.words_vol * 100 <= ${params.search[i].max} * b.words_market_vol
                )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'refund_rate') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.real_sale_qty), 0) AS real_sale_qty, 
                            IFNULL(SUM(a2.refund_qty), 0) AS refund_qty FROM ${table} a2 
                        WHERE a2.date >= ? AND a2.date <= ? 
                            AND gsi.goods_id = a2.goods_id 
                    ) b WHERE b.refund_qty * 100 >= ${params.search[i].min} * b.real_sale_qty
                        AND b.refund_qty * 100 <= ${params.search[i].max} * b.real_sale_qty
                )`
            p.push(start, end)
        } else if (params.search[i].field_id == 'profit_rate') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.profit), 0) AS profit, 
                            IFNULL(SUM(a2.sale_amount), 0) AS sale_amount FROM ${table} a2 
                        WHERE a2.date >= ? AND a2.date <= ? 
                            AND gsi.goods_id = a2.goods_id 
                    ) b WHERE b.profit * 100 >= ${params.search[i].min} * b.sale_amount
                        AND b.profit * 100 <= ${params.search[i].max} * b.sale_amount
                )`
            p.push(start, end)
        } else if (['first_category', 'second_category', 'level_3_category', 'brief_product_line', 
                'product_definition', 'stock_structure', 'product_rank', 'product_design_attr', 
                'seasons', 'brand', 'targets', 'exploit_director', 'purchase_director', 
                'line_manager', 'operator', 'line_director', 'onsale_date'
            ].includes(params.search[i].field_id)) {
            subsql = `${subsql} AND doa.${params.search[i].field_id} LIKE '%${params.search[i].value}%'`
        } else if (params.search[i].field_id == 'sku_id') {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT a2.sku_code FROM ${table} a2 WHERE 
                            a2.goods_id = gsi.goods_id AND a2.date BETWEEN ? AND ? 
                        GROUP BY a2.sku_code 
                        ORDER BY IFNULL(SUM(a2.sale_amount), 0) DESC LIMIT 1 
                    ) a3 WHERE a3.sku_code LIKE '%${params.search[i].value}%')`
            p.push(start, end)
        } else if (params.search[i].field_id == 'project_name') {
            subsql = `${subsql} AND EXISTS(
                    SELECT pi.project_name FROM project_info pi LEFT JOIN shop_info si 
                    ON pi.id = si.project_id WHERE si.shop_name = doa.shop_name 
                        AND pi.project_name LIKE '%${params.search[i].value}%')`
        } else if (['sale_amount', 'promotion_amount', 'express_fee', 'profit'].includes(params.search[i].field_id)) {
            subsql = `${subsql} AND EXISTS(
                    SELECT * FROM (
                        SELECT IFNULL(SUM(a2.${params.search[i].field_id}), 0) AS val FROM 
                        ${table} a2 WHERE a2.date >= ? AND a2.date <= ? 
                            AND gsi.goods_id = a2.goods_id 
                    ) b WHERE b.val >= ${params.search[i].min} 
                        AND b.val <= ${params.search[i].max}
                )`
            p.push(start, end)
        } else {
            subsql = `${subsql} AND EXISTS(
                SELECT * FROM (
                    SELECT IFNULL(SUM(a2.${params.search[i].field_id}), 0) AS val FROM 
                    goods_other_info a2 WHERE a2.date >= ? AND a2.date <= ? 
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
    let search = `${presql} FROM (
            SELECT doa.goods_id${sql}${subsql} GROUP BY doa.goods_id) a`, result = {
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
            doa1.line_manager, doa1.operator, doa1.line_director, doa1.onsale_date FROM  
            (${presql1}${sql}${subsql} GROUP BY doa.goods_id LIMIT ${offset}, ${size}) a
            JOIN dianshang_operation_attribute doa1 ON a.goods_id = doa1.goods_id 
            JOIN shop_info si ON si.shop_name = doa1.shop_name 
            JOIN project_info pi ON pi.id = si.project_id`
        info = await query(search, p)
        if (info?.length) {
            for (let i = 0; i < info.length; i++) {
                sql = `SELECT sku_code FROM ${table} WHERE goods_id = ? 
                        AND \`date\` >= ? AND \`date\` <= ?
                    GROUP BY sku_code ORDER BY SUM(sale_amount) DESC LIMIT 1`
                let row1 = await query(sql, [info[i].goods_id, start, end])
                info[i].sku_id = row1[0].sku_code
                info[i].hasChild = false
                info[i].id = info[i].goods_id
                info[i].parent_id = null
            }
            result.data = info
        }
    }
    return result
}

userOperationRepo.getUsersByShopName = async (shopName) => {
    const sql = `SELECT doa.operator AS nickname, doa.operator AS name, 
            GROUP_CONCAT(DISTINCT doa.shop_name) AS shop_name 
        FROM dianshang_operation_attribute doa 
        JOIN users u ON u.nickname = doa.operator AND u.is_resign = 0 
        WHERE doa.shop_name = ? 
            GROUP BY doa.operator`
        const result = await query(sql, shopName)
    return result || []
}

userOperationRepo.getUsersByProjectName = async (projectName) => {
    const sql = `SELECT doa.operator AS nickname, doa.operator AS name, 
            GROUP_CONCAT(DISTINCT doa.shop_name) AS shop_name 
        FROM dianshang_operation_attribute doa 
        JOIN users u ON u.nickname = doa.operator AND u.is_resign = 0 
        JOIN shop_info si ON si.shop_name = doa.shop_name 
        JOIN project_info pi ON pi.id = si.project_id
        WHERE pi.project_name = ? 
            GROUP BY doa.operator`
        const result = await query(sql, projectName)
    return result || []
}

userOperationRepo.getUserById = async (id) => {
    const sql = `SELECT nickname AS nickname, nickname AS name 
        FROM users WHERE user_id = ? AND is_resign = 0`
        const result = await query(sql, id)
    return result || []
}

userOperationRepo.getPermissionLimit = async (user_id) => {
    const sql = `SELECT uo.type, uo.detail_id, (CASE uo.type WHEN 1 THEN 
            (SELECT di.division_name FROM division_info di 
            WHERE di.id = uo.detail_id) WHEN 2 THEN 
            (SELECT pi.project_name FROM project_info pi 
            WHERE pi.id = uo.detail_id) WHEN 4 THEN 
            (SELECT ti.team_name FROM team_info ti 
            WHERE ti.id = uo.detail_id) ELSE 
            (SELECT u.nickname FROM users u 
            WHERE u.user_id = uo.detail_id) END) AS name FROM user_operation uo 
        WHERE uo.user_id = ? AND uo.type != 3 ORDER BY uo.type`
    const result = await query(sql, user_id)
    return result || []
}

userOperationRepo.getLinkIdsByUserNames = async (userNames, shopNames) => {
    let sql = `SELECT IFNULL(goods_id,brief_name) AS goods_id FROM dianshang_operation_attribute 
        WHERE operator IN ("${userNames}")`
    if (shopNames?.length) sql = `${sql} AND shop_name IN ("${shopNames}")`
    const result = await query(sql)
    return result || []
}

userOperationRepo.getDetailBySkuId = async (sku_id) => {
    let sql = `SELECT * FROM dianshang_operation_attribute WHERE sku_id = ?`
    const result = await query(sql, [sku_id])
    return result || []
}

userOperationRepo.getDetailByGoodsId = async (goods_id) => {
    let sql = `SELECT * FROM dianshang_operation_attribute WHERE goods_id = ?`
    const result = await query(sql, [goods_id])
    return result || []
}

userOperationRepo.getLinkIds = async () => {
    let sql = `SELECT doa.*, u.dingding_user_id FROM dianshang_operation_attribute doa 
        JOIN users u ON u.nickname = doa.operator WHERE u.is_resign = 0 
            AND doa.operator != '无操作' 
            AND doa.operator != '非操作' 
            AND doa.platform = '天猫部'`
    const result = await query(sql)
    return result || []
}

userOperationRepo.getUserByName = async (name) => {
    let sql = `SELECT nickname AS name, 5 AS type, user_id AS detail_id 
        FROM users WHERE nickname = ?`
    const result = await query(sql, [name])
    return result || []
}

userOperationRepo.getProjectById = async (id) => {
    let sql = `SELECT pi.project_name FROM team_info ti 
        JOIN team_member tm ON tm.team_id = ti.id
        JOIN project_info pi ON pi.id = ti.project_id WHERE tm.user_id = ? 
        UNION ALL
        SELECT pi.project_name FROM user_operation uo JOIN shop_info si 
        ON uo.detail_id = si.id AND uo.type = 3 
        JOIN project_info pi ON pi.id = si.project_id WHERE uo.user_id = ?`
    const result = await query(sql, [id, id])
    return result || []
}

userOperationRepo.getProductLine = async (type, month, limit, offset, sort) => {
    let table_name = type == 'verified' ? 'goods_verifieds_stats' : 'goods_sales_stats'
    let sql = `SELECT COUNT(1) AS count FROM (
        SELECT a.brief_product_line FROM (SELECT brief_product_line FROM 
        dianshang_operation_attribute WHERE platform = '天猫部' GROUP BY brief_product_line) a 
        LEFT JOIN dianshang_operation_attribute b ON a.brief_product_line = b.brief_product_line
        LEFT JOIN ${table_name} a1 ON b.goods_id = a1.goods_id 
            AND DATE_FORMAT(a1.date, '%Y-%m') = ? GROUP BY a.brief_product_line) aa`
    let row = await query(sql, [month])
    let total = 0, data = []
    if (row?.length) total = row[0].count
    else return {data, total}
    sql = `SELECT * FROM (SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
            FORMAT(IF(IFNULL(SUM(sale_amount), 0) > 0, IFNULL(SUM(operation_amount), 0) / 
                SUM(sale_amount), 0) * 100, 2) AS operation_rate, 
            FORMAT(IF(IFNULL(SUM(promotion_amount), 0) > 0, IFNULL(SUM(sale_amount), 0) / 
                SUM(promotion_amount), 0) * 100, 2) AS roi,
            FORMAT(IF(IFNULL(SUM(words_market_vol), 0) > 0, IFNULL(SUM(words_vol), 0) / 
                SUM(words_market_vol), 0) * 100, 2) AS market_rate,
            FORMAT(IF(IFNULL(SUM(order_num), 0) > 0, IFNULL(SUM(refund_num), 0) / 
                SUM(order_num), 0) * 100, 2) AS refund_rate,
            FORMAT(IFNULL(SUM(dsr), 0) / COUNT(1), 2) AS dsr, 
            IFNULL(SUM(express_fee), 0) AS express_fee, 
            IFNULL(SUM(packing_fee), 0) AS packing_fee, 
            IFNULL(SUM(labor_cost), 0) AS labor_cost, 
            IFNULL(SUM(profit), 0) AS profit, 
            FORMAT(IF(IFNULL(SUM(sale_amount), 0) > 0, IFNULL(SUM(profit), 0) / 
                SUM(sale_amount), 0) * 100, 2) AS profit_rate, 
            a.brief_product_line 
        FROM (SELECT brief_product_line FROM dianshang_operation_attribute 
        WHERE platform = '天猫部' GROUP BY brief_product_line) a 
        LEFT JOIN dianshang_operation_attribute b ON a.brief_product_line = b.brief_product_line
        LEFT JOIN ${table_name} a1 ON b.goods_id = a1.goods_id 
            AND DATE_FORMAT(a1.date, '%Y-%m') = ? GROUP BY a.brief_product_line) aa `
    if (sort) sql = `${sql} ORDER BY aa.${sort} LIMIT ?, ?`
    else sql = `${sql} LIMIT ?, ?`
    data = await query(sql, [month, offset, limit]) || []
    for (let i = 0; i < data.length; i++) {
        data[i]['id'] = data[i].brief_product_line || ''
        data[i]['parent_id'] = null
        data[i]['hasChild'] = true
    }
    return { data, total }
}

userOperationRepo.getProductLineProject = async (type, month, brief_product_line) => {
    let table_name = type == 'verified' ? 'goods_verifieds_stats' : 'goods_sales_stats'
    let sql = `SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
            FORMAT(IF(IFNULL(SUM(sale_amount), 0) > 0, IFNULL(SUM(operation_amount), 0) / 
                SUM(sale_amount), 0) * 100, 2) AS operation_rate, 
            FORMAT(IF(IFNULL(SUM(promotion_amount), 0) > 0, IFNULL(SUM(sale_amount), 0) / 
                SUM(promotion_amount), 0) * 100, 2) AS roi,
            FORMAT(IF(IFNULL(SUM(words_market_vol), 0) > 0, IFNULL(SUM(words_vol), 0) / 
                SUM(words_market_vol), 0) * 100, 2) AS market_rate,
            FORMAT(IF(IFNULL(SUM(order_num), 0) > 0, IFNULL(SUM(refund_num), 0) / 
                SUM(order_num), 0) * 100, 2) AS refund_rate,
            FORMAT(IFNULL(SUM(dsr), 0) / COUNT(1), 2) AS dsr, 
            IFNULL(SUM(express_fee), 0) AS express_fee, 
            IFNULL(SUM(packing_fee), 0) AS packing_fee, 
            IFNULL(SUM(labor_cost), 0) AS labor_cost, 
            IFNULL(SUM(profit), 0) AS profit, 
            FORMAT(IF(IFNULL(SUM(sale_amount), 0) > 0, IFNULL(SUM(profit), 0) / 
                SUM(sale_amount), 0) * 100, 2) AS profit_rate, 
            pi.project_name AS brief_product_line 
        FROM dianshang_operation_attribute a
        JOIN shop_info si ON a.shop_name = si.shop_name
        JOIN project_info pi ON si.project_id = pi.id
        LEFT JOIN ${table_name} a1 ON a.goods_id = a1.goods_id 
            AND DATE_FORMAT(a1.date, '%Y-%m') = ?
		WHERE a.brief_product_line = ? 
        GROUP BY pi.project_name`
    let result = await query(sql, [month, brief_product_line]) || []
    for (let i = 0; i < result.length; i++) {
        result[i]['id'] = result[i].brief_product_line
        result[i]['parent_id'] = brief_product_line
        result[i]['hasChild'] = false
    }
    return result || []
}

userOperationRepo.getProductLineDetail = async (type, month, brief_product_line) => {
    let table_name = type == 'verified' ? 'goods_verifieds_stats' : 'goods_sales_stats'
    let sql = `SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
            FORMAT(IF(IFNULL(SUM(sale_amount), 0) > 0, IFNULL(SUM(operation_amount), 0) / 
                SUM(sale_amount), 0) * 100, 2) AS operation_rate, 
            FORMAT(IF(IFNULL(SUM(promotion_amount), 0) > 0, IFNULL(SUM(sale_amount), 0) / 
                SUM(promotion_amount), 0) * 100, 2) AS roi,
            FORMAT(IF(IFNULL(SUM(words_market_vol), 0) > 0, IFNULL(SUM(words_vol), 0) / 
                SUM(words_market_vol), 0) * 100, 2) AS market_rate,
            FORMAT(IF(IFNULL(SUM(order_num), 0) > 0, IFNULL(SUM(refund_num), 0) / 
                SUM(order_num), 0) * 100, 2) AS refund_rate,
            FORMAT(IFNULL(SUM(dsr), 0) / COUNT(1), 2) AS dsr, 
            IFNULL(SUM(express_fee), 0) AS express_fee, 
            IFNULL(SUM(packing_fee), 0) AS packing_fee, 
            IFNULL(SUM(labor_cost), 0) AS labor_cost, 
            IFNULL(SUM(profit), 0) AS profit, 
            FORMAT(IF(IFNULL(SUM(sale_amount), 0) > 0, IFNULL(SUM(profit), 0) / 
                SUM(sale_amount), 0) * 100, 2) AS profit_rate, 
            a.brief_product_line,
            pi.project_name,
            a.goods_id,
            first_category,
            second_category,
            level_3_category,
            product_rank,
            product_definition,
            stock_structure,
            product_rank,
            product_design_attr,
            seasons,
            brand,
            exploit_director,
            purchase_director,
            line_manager,
            operator,
            line_director,
            onsale_date
        FROM dianshang_operation_attribute a
        JOIN shop_info si ON a.shop_name = si.shop_name
        JOIN project_info pi ON si.project_id = pi.id
        LEFT JOIN ${table_name} a1 ON a.goods_id = a1.goods_id 
            AND DATE_FORMAT(a1.date, '%Y-%m') = ?
		WHERE a.brief_product_line = ?
        GROUP BY pi.project_name, a.goods_id, first_category,
            second_category,
            level_3_category,
            product_rank,
            product_definition,
            stock_structure,
            product_rank,
            product_design_attr,
            seasons,
            brand,
            exploit_director,
            purchase_director,
            line_manager,
            operator,
            line_director,
            onsale_date`
    let result = await query(sql, [month, brief_product_line]) || []
    for (let i = 0; i < result.length; i++) {
        sql = `SELECT sku_code FROM goods_sale_info WHERE goods_id = ? 
                AND DATE_FORMAT(\`date\`, '%Y-%m') = ?
            GROUP BY sku_code ORDER BY IFNULL(SUM(sale_amount), 0) DESC LIMIT 1`
        let row = await query(sql, [result[i].goods_id, month])
        result[i].sku_id = ''
        if (row?.length) result[i].sku_id = row[0].sku_code
    }
    return result
}

userOperationRepo.getDetailBycategory = async (sku_id) => {
    let sql = `SELECT second_category FROM dianshang_operation_attribute WHERE sku_id = ?`
    const result = await query(sql, [sku_id])
    return result || []
}

module.exports = userOperationRepo