const { query } = require('../model/dbConn')
const producerPlanRepo = {}

producerPlanRepo.getByMonth = async (months) => {
    const sql = `SELECT p.*, CONCAT(p.year, '-', p.month) AS months, u.nickname 
        FROM producer_plan p LEFT JOIN users u ON p.user_id = u.user_id 
        WHERE CONCAT(p.year, '-', p.month) IN (${months})
            ORDER BY p.user_id`
    const result = await query(sql)
    return result || []
}

producerPlanRepo.batchInsert = async (count, data) => {
    let sql = `INSERT INTO producer_plan(
        year, 
        month, 
        user_id, 
        first_category,
        second_category,
        third_category,
        plan_min,
        plan_max) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

module.exports = producerPlanRepo