const { query } = require('../../model/dbConn')
const oriSkuRepo = {}

oriSkuRepo.batchInsert = async (data, count) => {
    let sql = `INSERT INTO jst_ori_sku_info(
        goods_code, 
        sku_code,
        spu_short_name) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

oriSkuRepo.get = async (goods_code, sku_code) => {
    let sql = `SELECT * FROM jst_ori_sku_info WHERE goods_code = ? AND sku_code = ?`
    const result = await query(sql, [goods_code, sku_code])
    return result || []
}

oriSkuRepo.update = async (data) => {
    let sql = `UPDATE jst_ori_sku_info SET spu_short_name = ? 
        WHERE goods_code = ? AND sku_code = ?`
    const result = await query(sql, data)
    return result?.affectedRows ? true:false
}

module.exports = oriSkuRepo