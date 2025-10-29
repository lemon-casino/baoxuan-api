const { query } = require('../../model/dbConn')
const processTasksRepo = {}

processTasksRepo.getSuccessTasksByProcessIdAndTitle = async (process_id, title) => {
    const sql = `SELECT * FROM process_tasks WHERE process_id = ? AND title IN ("${title}") AND \`status\` = 2`
    const result = await query(sql, [process_id])
    return result || []
}

module.exports = processTasksRepo