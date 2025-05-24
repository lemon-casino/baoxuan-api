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



actHiVarinstRepo.getProjectSkuInfo = async (time) => {
    let sql = `SELECT (SELECT u.nickname FROM system_users u WHERE p.START_USER_ID_ = u.id) 
            AS username, b.BYTES_ AS content FROM ACT_HI_VARINST v 
        LEFT JOIN ACT_HI_PROCINST p ON p.PROC_INST_ID_ = v.PROC_INST_ID_ 
        LEFT JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_
        LEFT JOIN ACT_GE_BYTEARRAY b ON b.ID_ = v.BYTEARRAY_ID_
        WHERE d.KEY_ = 'sctgtplc' AND v.NAME_ = 'F6gkma3pfcjfd1c' 
            AND p.START_TIME_ < ?
        ORDER BY p.START_USER_ID_ DESC`
    let result = await query(sql, [time])
    return result
}

actHiVarinstRepo.getSelfSkuInfo = async (time) => {
    let sql = `SELECT (SELECT u.nickname FROM system_users u WHERE p.START_USER_ID_ = u.id) 
            AS username, b.BYTES_ AS content FROM ACT_HI_VARINST v 
        LEFT JOIN ACT_HI_PROCINST p ON p.PROC_INST_ID_ = v.PROC_INST_ID_ 
        LEFT JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_
        LEFT JOIN ACT_GE_BYTEARRAY b ON b.ID_ = v.BYTEARRAY_ID_
        WHERE d.KEY_ = 'zytplc' AND v.NAME_ = 'F6gkma3pfcjfd1c' 
            AND p.START_TIME_ < ? AND p.START_USER_ID_ IN (177,186,207,243)
        ORDER BY p.START_USER_ID_ DESC`
    let result = await query(sql, [time])
    return result
}

actHiVarinstRepo.getIpSkuInfo = async (time) => {
    let sql = `SELECT (SELECT u.nickname FROM system_users u WHERE p.START_USER_ID_ = u.id) 
            AS username, b.BYTES_ AS content FROM ACT_HI_VARINST v 
        LEFT JOIN ACT_HI_PROCINST p ON p.PROC_INST_ID_ = v.PROC_INST_ID_ 
        LEFT JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_
        LEFT JOIN ACT_GE_BYTEARRAY b ON b.ID_ = v.BYTEARRAY_ID_
        WHERE d.KEY_ = 'iptplc' AND v.NAME_ = 'F6gkma3pfcjfd1c' 
            AND p.START_TIME_ < ? AND p.START_USER_ID_ IN (177,186,207,243)
        ORDER BY p.START_USER_ID_ DESC`
    let result = await query(sql, [time])
    return result
}

actHiVarinstRepo.getOperatorSkuInfo = async (time) => {
    let sql = `SELECT (SELECT u.nickname FROM system_users u WHERE v.TEXT_ = u.id) 
            AS username, b.BYTES_ AS content FROM ACT_HI_VARINST v 
        LEFT JOIN ACT_HI_PROCINST p ON p.PROC_INST_ID_ = v.PROC_INST_ID_ 
        LEFT JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
        LEFT JOIN ACT_GE_BYTEARRAY b ON b.ID_ = v.BYTEARRAY_ID_ 
        LEFT JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = v.PROC_INST_ID_ 
			AND v1.NAME_ = 'Fm06ma3kixpkj7c' 
        WHERE d.KEY_ = 'fttplc' AND v.NAME_ IN 
            ('Cfidcvooh9jnf', 'Cfidvu2osk3k9', 'Cfidzncsybu0e', 'Cfid1wglixgnx') 
            AND p.START_TIME_ < ? AND v1.TEXT_ IS NULL
        ORDER BY v.TEXT_ DESC`
    let result = await query(sql, [time])
    return result
}

actHiVarinstRepo.getSupplierSkuInfo = async (time) => {
    let sql = `SELECT (SELECT u.nickname FROM system_users u WHERE p.START_USER_ID_ = u.id) 
            AS username, b.BYTES_ AS content FROM ACT_HI_VARINST v 
        LEFT JOIN ACT_HI_PROCINST p ON p.PROC_INST_ID_ = v.PROC_INST_ID_ 
        LEFT JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_
        LEFT JOIN ACT_GE_BYTEARRAY b ON b.ID_ = v.BYTEARRAY_ID_
        WHERE d.KEY_ = 'gystplc' AND v.NAME_ = 'Fig2ma24zzz9brc' 
            AND p.START_TIME_ < ? AND p.START_USER_ID_ IN (177,186,207,243) 
        ORDER BY p.START_USER_ID_ DESC`
    let result = await query(sql, [time])
    return result
}

module.exports = actHiVarinstRepo