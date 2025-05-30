const { query } = require('../../model/bpmDbConn')
const actReProcdefRepo = {}

actReProcdefRepo.getProcessDefinitionId = async (title, key) => {
    let sql = `SELECT ID_ FROM ACT_RE_PROCDEF WHERE NAME_ = ? AND KEY_ = ? 
        AND SUSPENSION_STATE_ = 1`
    let result = await query(sql, [title, key])
    return result?.length ? result[0].ID_ : null
}

module.exports = actReProcdefRepo