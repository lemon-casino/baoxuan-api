const { query } = require('../../model/dbConn')
const goodsInventoryRepo = {}

goodsInventoryRepo.delete = async (date) => {
    let sql = `DELETE FROM jst_goods_inventory WHERE date = '${date}'`
    const result = await query(sql)
    console.log(result)
    return result?.affectedRows ? true : false
}
goodsInventoryRepo.batchInsert = async (data,count) => {
    let sql = `INSERT INTO jst_goods_inventory(
        sku_code, 
        transit,
        orders_num,
        main_inventory,
        stock_num,
        date) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

module.exports = goodsInventoryRepo