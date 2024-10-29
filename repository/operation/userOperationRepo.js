const { query } = require('../../model/dbConn')
const userOperationRepo = {}

userOperationRepo.getPermission = async (user_id) => {
    const sql = `SELECT * FROM user_operation WHERE user_id = ? ORDER BY type`
    const result = await query(sql, user_id)
    return result || []
}

userOperationRepo.getGoodsLine = async (start, end, params, shopNames, userNames) => {
    let presql = `SELECT COUNT(1) AS count`
    let presql1 = `SELECT doa.goods_id, pi.project_name, doa.first_category, 
            doa.second_category, doa.level_3_category, doa.brief_product_line, 
            doa.sku_id, doa.product_definition, doa.stock_structure, 
            doa.product_rank, doa.product_design_attr, doa.seasons, doa.brand, 
            doa.targets, doa.exploit_director, doa.purchase_director, 
            doa.line_manager, doa.line_director, doa.onsale_date, (
                SELECT IFNULL(SUM(gsi.sale_amount), 0) FROM goods_sale_info gsi 
                WHERE gsi.goods_id = doa.goods_id 
                    AND gsi.sku_id = doa.sku_id
            ) AS sale_amount, (
                SELECT IFNULL(SUM(gsi.promotion_amount), 0) FROM goods_sale_info gsi 
                WHERE gsi.goods_id = doa.goods_id 
                    AND gsi.sku_id = doa.sku_id
            ) AS promotion_amount, (
                SELECT IFNULL(SUM(gsi.express_fee), 0) FROM goods_sale_info gsi 
                WHERE gsi.goods_id = doa.goods_id 
                    AND gsi.sku_id = doa.sku_id
            ) AS express_fee, (
                SELECT IFNULL(SUM(gsi.profit), 0) FROM goods_sale_info gsi 
                WHERE gsi.goods_id = doa.goods_id 
                    AND gsi.sku_id = doa.sku_id
            ) AS profit, (
                SELECT IF(IFNULL(SUM(gsi.sale_amount), 0) > 0, 
                    FORMAT(IFNULL(SUM(gsi.profit), 0) / SUM(gsi.sale_amount), 2), 
                    0) * 100 FROM goods_sale_info gsi 
                WHERE gsi.goods_id = doa.goods_id 
                    AND gsi.sku_id = doa.sku_id
            ) AS profit_rate`
    let sql = ` FROM dianshang_operation_attribute doa
        JOIN shop_info si ON si.shop_name = doa.shop_name 
        JOIN project_info pi ON pi.id = si.project_id 
        WHERE onsale_date >= ? AND onsale_date <= ?`
    if (params.goods_id) {
        sql = `${sql} 
            AND doa.goods_id LIKE '%${params.goods_id}%'`
    }
    if (params.shop_name) {
        sql = `${sql} 
            AND doa.shop_name LIKE '%${params.shop_name}%'`
    }
    if (shopNames) {
        sql = `${sql} 
            AND doa.shop_name IN ("${shopNames}")`
    }
    if (userNames) {
        sql = `${sql} 
            AND doa.operator IN ("${userNames}")`
    }
    let size = parseInt(params.pageSize)
    let page = parseInt(params.currentPage)
    let offset = (page - 1) * size
    let search = `${presql}${sql}`, result = {
        total: 0,
        data: [],
        sum: 0
    }
    let info = await query(search, [start, end])
    if (info?.length && info[0].count > 0) {
        result.total = info[0].count
        search = `${presql1}${sql} LIMIT ${offset}, ${size}`
        info = await query(search, [start, end])
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