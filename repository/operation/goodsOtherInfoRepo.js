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

module.exports = goodsOtherInfoRepo