const { query } = require('../../model/dbConn')
const userOperationRepo = {}

userOperationRepo.getPermission = async (user_id) => {
    const sql = `SELECT * FROM user_operation WHERE user_id = ? ORDER BY type`
    const result = await query(sql, user_id)
    return result || []
}

userOperationRepo.getGoodsLine = async (start, end, params, shopNames, userNames) => {
    let sql = `SELECT doa.goods_id, pi.project_name, doa.first_category, 
            doa.second_category, doa.level_3_category, doa.brief_product_line, 
            doa.sku_id, doa.product_definition, doa.stock_structure, 
            doa.product_rank, doa.product_design_attr, doa.seasons, doa.brand, 
            doa.targets, doa.exploit_director, doa.purchase_director, 
            doa.line_manager, doa.line_director, doa.onsale_date 
        FROM dianshang_operation_attribute doa
        JOIN shop_info si ON si.shop_name = doa.shop_name 
        JOIN project_info pi ON pi.id = si.project_id
        WHERE onsale_date >= ? AND onsale_date <= ?`
    if (params.goods_id) {
        sql = `${sql} 
            AND goods_id LIKE '%${params.goods_id}%'`
    }
    if (params.shop_name) {
        sql = `${sql} 
            AND shop_name LIKE '%${params.shop_name}%'`
    }
    sql = `${sql} 
            AND shop_name IN ("${shopNames}")
            AND operator IN ("${userNames}")`
    const result = await query(sql, [start, end])
    return result || []
}

userOperationRepo.getUsersByShopName = async (shopName) => {
    const sql = `SELECT doa.operator AS nickname, doa.operator AS name 
        FROM dianshang_operation_attribute doa 
        JOIN goods_sale_info gsi ON doa.goods_id = gsi.link_id 
        WHERE gsi.shop_name = ? 
            GROUP BY doa.operator`
        const result = await query(sql, shopName)
    return result || []
}

userOperationRepo.getUsersByProjectName = async (projectName) => {
    const sql = `SELECT doa.operator AS nickname, doa.operator AS name 
        FROM dianshang_operation_attribute doa 
        JOIN goods_sale_info gsi ON doa.goods_id = gsi.link_id 
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

module.exports = userOperationRepo