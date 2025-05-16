const { query } = require('../../model/bpmDbConn')
const actHiVarinstRepo = {}

actHiVarinstRepo.getValue = async (instanceId, keys) => {
    let sql = `SELECT (CASE VAR_TYPE_ WHEN 'serializable' THEN 0 ELSE 1 END) AS type, 
            (CASE VAR_TYPE_ WHEN 'serializable' THEN BYTEARRAY_ID_ 
            WHEN 'string' THEN TEXT_ ELSE LONG_ END) AS value FROM ACT_HI_VARINST 
        WHERE PROC_INST_ID_ = "${instanceId}" AND NAME_ IN ("${keys.join('","')}")`
    let result = await query(sql)
    return result?.length ? result[0].ID_ : null
}

actHiVarinstRepo.getStatusInfo = async (instanceId, keys) => {
    let sql = `SELECT TEXT_ as value FROM ACT_HI_VARINST 
        WHERE PROC_INST_ID_ = "${instanceId}" AND NAME_ IN ("${keys.join('","')}")`
    let result = await query(sql)
    return result
}

actHiVarinstRepo.getStatus = async (instanceId) => {
    let sql = `SELECT * FROM ACT_HI_VARINST WHERE PROC_INST_ID_ = "${instanceId}" 
        AND NAME_ = "PROCESS_STATUS"`
    let result = await query(sql)
    // console.log(instanceId, 'PROCESS_STATUS result:', result)
    return result?.length ? result[0].LONG_ : null
}

actHiVarinstRepo.getTaskStatus = async (instanceId, nodes) => {
    let sql = `SELECT v.* FROM ACT_HI_TASKINST t 
        LEFT JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = t.PROC_INST_ID_ 
            AND v.NAME_ = "TASK_STATUS" 
        WHERE t.PROC_INST_ID_ = "${instanceId}" 
            AND t.NAME_ IN ("${nodes.join('","')}")
        ORDER BY t.START_TIME_ DESC, t.END_TIME_ DESC LIMIT 1`
    let result = await query(sql)
    // console.log(instanceId, nodes, 'TASK_STATUS result:', result)
    return result?.length ? result[0].LONG_ : null
}

module.exports = actHiVarinstRepo