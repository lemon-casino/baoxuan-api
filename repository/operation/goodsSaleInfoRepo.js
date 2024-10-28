const { query } = require('../../model/dbConn')

const goodsSaleInfoRepo = {}

goodsSaleInfoRepo.getPaymentByShopNamesAndTime = async (shopNames, start, end) => {
    const sql = `SELECT IFNULL(SUM(amount), 0) AS amount FROM goods_sale_info 
        WHERE shop_name IN ("${shopNames}") 
            AND \`date\` >= ?
            AND \`date\` <= ?`
    const result = await query(sql, [start, end])
    return result || []
}

goodsSaleInfoRepo.getPaymentByLinkIdsAndTime = async (linkIds, start, end) => {
    const sql = `SELECT IFNULL(SUM(amount), 0) AS amount FROM goods_sale_info 
        WHERE link_id IN ("${linkIds}") 
            AND \`date\` >= ?
            AND \`date\` <= ?`
    const result = await query(sql, [start, end])
    return result || []
}

goodsSaleInfoRepo.getData = async (start, end, params, shopNames, linkIds) => {
    let result = {
        currentPage: params.currentPage,
        pageSize: params.pageSize,
        data: [],
        total: 0,
        sum: 0
    }
    let sql = `SELECT SUM(amount) AS amount FROM goods_sale_info`
    subsql = ` WHERE \`date\` >= ? AND \`date\` <= ?`
    if (params.shop_name) {
        subsql = `${subsql} 
                AND shop_name like "%${params.shop_name}%"`
    }
    if (params.goods_name) {
        subsql = `${subsql}
                AND shop_name like "%${params.goods_name}%"`
    }
    if (shopNames != null) {
        if (shopNames.length == 0) return result
        subsql = `${subsql}
                AND shop_name IN ("${shopNames}")`
    }
    if (linkIds != null) {
        if (linkIds.length == 0) return result
        subsql = `${subsql}
                AND link_id IN ("${linkIds}")`
    }
    subsql = `${subsql} 
        GROUP BY link_id, sku_id, shop_name, shop_id, goods_name`
    sql = `SELECT COUNT(1) AS count, SUM(amount) AS amount FROM (${sql}${subsql}) a`
    let row = await query(sql, [start, end])
    if (row?.length && row[0].count) {
        result.total = row[0].count
        result.sum = row[0].amount        
        sql = `SELECT link_id, sku_id, shop_name, shop_id, goods_name, SUM(amount) AS amount 
        FROM goods_sale_info`
        let limit = (parseInt(params.currentPage) - 1) * parseInt(params.pageSize)
        sql = `${sql}${subsql} LIMIT ${limit}, ${params.pageSize}`
        row = await query(sql, [start, end])
        if (row?.length) result.data = row
    }
    return result
}

goodsSaleInfoRepo.batchInsert = async (count, data) => {
    let sql = `INSERT INTO goods_sale_info(link_id, sku_id, shop_name, shop_id, 
        goods_name, date, amount) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

module.exports = goodsSaleInfoRepo