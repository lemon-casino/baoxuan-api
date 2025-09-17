const { query } = require('../../model/dbConn')
const tmallNewActivityRepo = {}

tmallNewActivityRepo.get = async (date) => {
    const sql = `SELECT * FROM tmall_new_activity WHERE date = ?`
    const result = await query(sql, [date])
    return result || []
}

tmallNewActivityRepo.batchInsert = async (count, data) => {
    let sql = `INSERT INTO tmall_new_activity(
            goods_id, 
            shop_name, 
            \`date\`, 
            \`status\`) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

tmallNewActivityRepo.deleteByDateAndShopName = async (dates, shopNames) => {
    const sql = `DELETE FROM tmall_new_activity WHERE \`date\` IN (${dates}) AND shop_name IN (${shopNames})`
    const result = await query(sql)
    return result?.affectedRows ? true : false
}

module.exports = tmallNewActivityRepo