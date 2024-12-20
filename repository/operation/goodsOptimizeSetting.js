const { query } = require('../../model/dbConn')
const goodsOptimizeSetting = {}

goodsOptimizeSetting.getByTitle = async (titles) => {
    let sql = `SELECT * FROM goods_optimize_setting WHERE title IN (${titles}) 
        AND parent_id = 0`
    let result = await query(sql)
    for (let i = 0; i < result.length; i++) {
        sql = `SELECT * FROM goods_optimize_setting WHERE parent_id = ?`
        let rows = await query(sql, [result[i].id])
        result[i].children = []
        if (rows?.length) result[i].children = rows
    }
    return result || []
}

goodsOptimizeSetting.getInfo = async () => {
    let sql = `SELECT * FROM goods_optimize_setting WHERE parent_id = 0`
    let result = await query(sql)
    for (let i = 0; i < result.length; i++) {
        sql = `SELECT * FROM goods_optimize_setting WHERE parent_id = ?`
        let rows = await query(sql, [result[i].id])
        result[i].children = []
        if (rows?.length) result[i].children = rows
    }
    return result || []
}

module.exports = goodsOptimizeSetting