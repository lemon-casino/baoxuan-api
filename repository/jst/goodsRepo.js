const { query } = require('../../model/localDbConn')
const goodsRepo = {}

goodsRepo.create = async (data, count) => {
    let sql = `INSERT INTO jst_goods_info(i_id, co_id, name, c_id, c_name, 
        s_price, c_price, remark, pic, created, modified, brand, weight, 
        market_price, vc_name, item_type, l, w, h, shelf_life) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result
}

goodsRepo.getByIId = async (i_id) => {
    let sql = `SELECT * FROM jst_goods_info WHERE i_id = ?`
    const result = await query(sql, [i_id])
    return result || []
}

goodsRepo.getMaxCreateTime = async () => {
    const sql = `SELECT MAX(created) AS created FROM jst_goods_info`
    const result = await query(sql)
    return result || []
}

goodsRepo.updateById = async (data) => {
    let sql = `UPDATE jst_goods_info SET name = ?, c_id = ?, c_name = ?, 
        s_price = ?, c_price = ?, remark = ?, pic = ?, modified = ?, brand = ?, 
        weight = ?, market_price = ?, vc_name = ?, item_type = ?, l = ?, w = ?, 
        h = ?, shelf_life = ? WHERE i_id = ?`
    const result = await query(sql, data)
    return result?.affectedRows ? true:false
}

module.exports = goodsRepo