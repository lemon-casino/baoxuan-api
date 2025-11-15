const { query } = require('../../model/dbConn')
const processTasksRepo = {}

processTasksRepo.getSuccessTasksByProcessIdAndTitle = async (process_id, title) => {
    const sql = `SELECT * FROM process_tasks WHERE process_id = ? AND title IN ("${title}") AND \`status\` = 2`
    const result = await query(sql, [process_id])
    return result || []
}

processTasksRepo.getRunningTasksByProcessId = async (process_ids) => {
    const sql = `SELECT t.*, p.title AS process_title FROM process_tasks t 
        JOIN processes p ON p.process_id = t.process_id 
        WHERE t.process_id IN ("${process_ids}") AND t.status = 1`
    const result = await query(sql)
    return result || []
}

module.exports = processTasksRepo