const { query } = require('../../model/dbConn')
const pmEditLogRepo = {}

pmEditLogRepo.insert = async (data) => {
    let sql = `INSERT INTO develop_pm_edit_log(
            type, 
            project_type, 
            user_id, 
            old_value, 
            new_value) VALUES(?,?,?,?,?)`
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

module.exports = pmEditLogRepo