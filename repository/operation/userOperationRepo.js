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
            IFNULL(SUM(gsi.profit), 0) AS profit, 
            IF(IFNULL(SUM(gsi.sale_amount), 0) > 0, 
                FORMAT(IFNULL(SUM(gsi.profit), 0) / SUM(gsi.sale_amount), 2), 
            0) * 100 AS profit_rate`
    let sql = ` FROM dianshang_operation_attribute doa
        JOIN goods_sale_info gsi ON gsi.goods_id = doa.goods_id` 
    let subsql = ` WHERE gsi.date >= ? AND gsi.date <= ?`
    for (let index in params.search) {
        if (index) {
            if (index == 'project_name') {
                subsql = `${subsql} 
                    AND pi.${index} LIKE "%${params.search[index]}%"`
            } else if (index == 'onsale_date') {
                subsql = `${subsql} 
                    AND doa.${index} = "${moment(params.search[index]).format('YYYY-MM-DD')}"`
            } else {
                subsql = `${subsql} 
                    AND doa.${index} LIKE "%${params.search[index]}%"`
            }
        }
    }
    if (shopNames) {
        subsql = `${subsql} 
            AND doa.shop_name IN ("${shopNames}")`
    }
    if (userNames) {
        subsql = `${subsql} 
            AND doa.line_director IN ("${userNames}")`
    }
    let size = parseInt(params.pageSize)
    let page = parseInt(params.currentPage)
    let offset = (page - 1) * size
    let search = `${presql}${sql}${subsql} GROUP BY doa.goods_id`, result = {
        total: 0,
        data: [],
        sum: 0
    }
    let info = await query(search, [start, end])
    if (info?.length && info[0].count > 0) {
        result.total = info[0].count
        search = `SELECT IFNULL(SUM(gsi.sale_amount), 0) AS sum
            ${sql}${subsql}`
        info = await query(search, [start, end])
        if (info?.length) result.sum = info[0].sum
        search = `SELECT a.*, pi.project_name, doa1.first_category, 
            doa1.second_category, doa1.level_3_category, doa1.brief_product_line, 
            doa1.sku_id, doa1.product_definition, doa1.stock_structure, 
            doa1.product_rank, doa1.product_design_attr, doa1.seasons, doa1.brand, 
            doa1.targets, doa1.exploit_director, doa1.purchase_director, 
            doa1.line_manager, doa1.line_director, doa1.onsale_date FROM  
            (${presql1}${sql}${subsql} GROUP BY doa.goods_id LIMIT ${offset}, ${size}) a
            JOIN dianshang_operation_attribute doa1 ON a.goods_id = doa1.goods_id 
            JOIN shop_info si ON si.shop_name = doa1.shop_name 
            JOIN project_info pi ON pi.id = si.project_id`
        info = await query(search, [start, end])
        if (info?.length) result.data = info
    }
    return result
}

userOperationRepo.getUsersByShopName = async (shopName) => {
    const sql = `SELECT doa.line_director AS nickname, doa.line_director AS name 
        FROM dianshang_operation_attribute doa 
        JOIN goods_sale_info gsi ON doa.goods_id = gsi.goods_id 
        WHERE gsi.shop_name = ? 
            GROUP BY doa.line_director`
        const result = await query(sql, shopName)
    return result || []
}

userOperationRepo.getUsersByProjectName = async (projectName) => {
    const sql = `SELECT doa.line_director AS nickname, doa.line_director AS name 
        FROM dianshang_operation_attribute doa 
        JOIN goods_sale_info gsi ON doa.goods_id = gsi.goods_id 
        JOIN shop_info si ON si.shop_name = gsi.shop_name 
        JOIN project_info pi ON pi.id = si.project_id
        WHERE pi.project_name = ? 
            GROUP BY doa.line_director`
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
        WHERE line_director IN ("${userNames}")`
    const result = await query(sql)
    return result || []
}

module.exports = userOperationRepo