const { query } = require('../../model/dbConn')

const goodsOtherInfoRepo = {}

goodsOtherInfoRepo.batchInsert = async (count, data) => {
    let sql = `INSERT INTO goods_other_info(
            goods_id, 
            dsr, 
            words_market_vol, 
            words_vol, 
            words, 
            \`date\`) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

goodsOtherInfoRepo.search = async (goods_id, date) => {
    let sql = `SELECT id FROM goods_other_info WHERE goods_id = ?
        AND \`date\` = ?`
    const result = await query(sql, [goods_id, date])
    return result || []
}

goodsOtherInfoRepo.updateKeyWords = async (info) => {
    let sql = `UPDATE goods_other_info SET words_market_vol = ?, 
        words_vol = ?, words = ? WHERE goods_id = ? AND \`date\` = ?`
    const result = await query(sql, info)
    return result?.affectedRows ? true : false
}

goodsOtherInfoRepo.updateDSR = async (info) => {
    let sql = `UPDATE goods_other_info SET dsr = ? WHERE goods_id = ? 
        AND \`date\` = ?`
    const result = await query(sql, info)
    return result?.affectedRows ? true : false
}

goodsOtherInfoRepo.getDataDetailByTime = async(column, goods_id, start, end) => {
    const sql = `SELECT IFNULL(SUM(${column}), 0) AS ${column}, \`date\` 
        FROM goods_other_info WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id = ?
        GROUP BY \`date\``
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsOtherInfoRepo.getDataRateByTime = async(col1, col2, column, goods_id, start, end, percent) => {
    const sql = `SELECT FORMAT(IF(IFNULL(SUM(${col1}), 0) > 0, 
                IFNULL(SUM(${col2}), 0) / SUM(${col1}), 0) * ${percent}, 2) AS ${column}, 
            \`date\` FROM goods_other_info WHERE \`date\` >= ? AND \`date\` <= ? 
            AND goods_id = ?
        GROUP BY \`date\``
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsOtherInfoRepo.getDetailByShopNamesAndTme = async (shopNames, column, start, end) => {
    let sql = `SELECT IFNULL(SUM(${column}), 0) AS ${column}, \`date\` FROM goods_other_info 
        WHERE \`date\` >= ? AND \`date\` <= ? AND shop_name IN ("${shopNames}") 
        GROUP BY \`date\``
    let result = await query(sql, [start, end])
    return  result || []
}

goodsOtherInfoRepo.getRateByShopNamesAndTme = async (shopNames, col1, col2, column, start, end, percent) => {
    let sql = `SELECT FORMAT(IF(IFNULL(SUM(${col1}), 0) > 0, 
                IFNULL(SUM(${col2}), 0) / SUM(${col1}) * ${percent}, 0), 2) AS ${column}, \`date\` 
        FROM goods_other_info 
        WHERE \`date\` >= ? AND \`date\` <= ? AND shop_name IN ("${shopNames}") 
        GROUP BY \`date\``
    let result = await query(sql, [start, end])
    return  result || []
}

goodsOtherInfoRepo.getDetailByLinkIdsAndTme = async (linkIds, column, start, end) => {
    let sql = `SELECT IFNULL(SUM(${column}), 0) AS ${column}, \`date\` FROM goods_other_info 
        WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id IN ("${linkIds}") 
        GROUP BY \`date\``
    let result = await query(sql, [start, end])
    return  result || []
}

goodsOtherInfoRepo.getRateByLinkIdsAndTme = async (linkIds, col1, col2, column, start, end, percent) => {
    let sql = `SELECT FORMAT(IF(IFNULL(SUM(${col1}), 0) > 0, 
                IFNULL(SUM(${col2}), 0) / SUM(${col1}) * ${percent}, 0), 2) AS ${column}, \`date\` 
        FROM goods_other_info 
        WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id IN ("${linkIds}") 
        GROUP BY \`date\``
    let result = await query(sql, [start, end])
    return  result || []
}

module.exports = goodsOtherInfoRepo