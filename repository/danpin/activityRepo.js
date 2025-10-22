const { query } = require('../../model/danpinDbConn')
const activityRepo = {}

activityRepo.getByIds = async (ids) => {
    const sql = `SELECT goods_id FROM activity WHERE goods_id IN (${ids}) 
        AND \`date\` = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) GROUP BY goods_id`
    const result = await query(sql)
    return result || []
}

module.exports = activityRepo