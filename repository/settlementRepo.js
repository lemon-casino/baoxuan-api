const { query } = require('../model/dbConn')
const settlementRepo = {}

settlementRepo.getAmount = async (start, end, shopNames, except) => {
    let sql = `SELECT IFNULL(SUM(amount), 0) AS amount FROM settlement WHERE 1=1 `
    let params = []
    if (start) {
        sql = `${sql}
            AND settle_time >= ?`
        params.push(start)
    }
    if (end) {
        sql = `${sql}
            AND settle_time <= ?`
        params.push(end)
    }
    if (shopNames) {
        sql = `${sql}
            AND shop_name in ("${shopNames}")`
        if (except) {
            sql = `${sql}
                AND NOT EXISTS (
                    SELECT si.id FROM shop_info si WHERE si.project_id = 4 
                        AND si.shop_name = settlement.shop_name
                )`
        }
    }
    let result = await query(sql, params)
    return result || []
}

settlementRepo.batchInsert = async (count, info) => {
    let sql = `INSERT INTO settlement(
        settle_time,
        order_id,
        sub_order_id,
        settle_order_id, 
        amount,
        type,
        shop_name,
        goods_id,
        sku_id) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, info)
    return result?.affectedRows ? true : false
}

settlementRepo.delete = async (shop_name, type, settle_time) => {
    let sql = `DELETE FROM settlement WHERE shop_name = ? 
        AND type >= ? 
        AND settle_time >= ?`
    const result = await query(sql, [shop_name, type, settle_time])
    return result?.affectedRows ? true : false
}

module.exports = settlementRepo