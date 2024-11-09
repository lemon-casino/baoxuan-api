const { query } = require('../../model/dbConn')

const goodsSaleInfoRepo = {}

goodsSaleInfoRepo.getPaymentByShopNamesAndTime = async (shopNames, start, end) => {
    const sql = `SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(express_fee), 0) AS express_fee, 
            IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
            IFNULL(SUM(profit), 0) AS profit, 
            FORMAT(IF(IFNULL(SUM(sale_amount), 0) > 0, 
                IFNULL(SUM(profit), 0) / SUM(sale_amount) * 100, 
                0), 2) AS profit_rate FROM goods_sale_info 
        WHERE shop_name IN ("${shopNames}") 
            AND \`date\` >= ?
            AND \`date\` <= ?`
    const result = await query(sql, [start, end])
    return result || []
}

goodsSaleInfoRepo.getPaymentByLinkIdsAndTime = async (linkIds, start, end) => {
    const sql = `SELECT IFNULL(SUM(sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(express_fee), 0) AS express_fee, 
            IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
            IFNULL(SUM(profit), 0) AS profit, 
            FORMAT(IF(IFNULL(SUM(sale_amount), 0) > 0, 
                IFNULL(SUM(profit), 0) / SUM(sale_amount) * 100, 
                0), 2) AS profit_rate FROM goods_sale_info 
        WHERE goods_id IN ("${linkIds}") 
            AND \`date\` >= ?
            AND \`date\` <= ?`
    const result = await query(sql, [start, end])
    return result || []
}

goodsSaleInfoRepo.getData = async (start, end, params, shopNames, linkIds) => {
    let page = parseInt(params.currentPage)
    let size = parseInt(params.pageSize)
    let offset = (page - 1) * size
    let result = {
        currentPage: params.currentPage,
        pageSize: params.pageSize,
        data: [],
        total: 0,
        sum: 0
    }
    let sql = `SELECT SUM(sale_amount) AS sale_amount FROM goods_sale_info`
    subsql = ` WHERE \`date\` >= ? AND \`date\` <= ?`
    for (let index in params.search) {
        if (index) {
            subsql = `${subsql} 
                AND ${index} LIKE "%${params.search[index]}%"`
        }
    }
    if (shopNames != null) {
        if (shopNames.length == 0) return result
        subsql = `${subsql}
                AND shop_name IN ("${shopNames}")`
    }
    if (linkIds != null) {
        if (linkIds.length == 0) return result
        subsql = `${subsql}
                AND goods_id IN ("${linkIds}")`
    }
    subsql = `${subsql} 
        GROUP BY goods_id, sku_id, shop_name, shop_id, goods_name`
    sql = `SELECT COUNT(1) AS count, SUM(sale_amount) AS sale_amount 
        FROM (${sql}${subsql}) a`
    let row = await query(sql, [start, end])
    if (row?.length && row[0].count) {
        result.total = row[0].count
        result.sum = row[0].sale_amount        
        sql = `SELECT goods_id, sku_id, shop_name, shop_id, goods_name, 
            IFNULL(SUM(sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(express_fee), 0) AS express_fee, 
            IFNULL(SUM(promotion_amount), 0) AS promotion_amount, 
            IFNULL(SUM(profit), 0) AS profit, 
            FORMAT(IF(IFNULL(SUM(sale_amount), 0) > 0, 
                IFNULL(SUM(profit), 0) / SUM(sale_amount) * 100, 
                0), 2) AS profit_rate 
            FROM goods_sale_info`
        sql = `${sql}${subsql} LIMIT ${offset}, ${size}`
        row = await query(sql, [start, end])
        if (row?.length) result.data = row
    }
    return result
}

goodsSaleInfoRepo.batchInsert = async (count, data) => {
    let sql = `INSERT INTO goods_sale_info(
            goods_id, 
            sku_id, 
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
            express_fee) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

goodsSaleInfoRepo.deleteByDate = async (date) => {
    let sql = `DELETE FROM goods_sale_info WHERE \`date\` = ?`
    const result = await query(sql, date)
    return result?.affectedRows ? true : false
}

module.exports = goodsSaleInfoRepo