const { query } = require('../../model/dbConn')
const developmentRepo = {}

developmentRepo.getById = async (id) => {
    let sql = `SELECT * FROM development_process WHERE uid = ?`
    const result = await query(sql, [id])
    return result
}

module.exports = developmentRepo