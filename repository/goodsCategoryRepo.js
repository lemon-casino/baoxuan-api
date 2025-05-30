const { query } = require('../model/dbConn')
const goodsCategoryRepo = {}

goodsCategoryRepo.get = async (parent_id) => {
    let sql = `SELECT * FROM goods_category WHERE parent_id = ?`
    const result = await query(sql, [parent_id])
    return result
}

module.exports = goodsCategoryRepo