const { query } = require('../../model/bpmDbConn')
const actHiTaskinstRepo = {}

actHiTaskinstRepo.getNodeTime = async (instanceId, keys) => {
    let sql = `SELECT STATE_, END_TIME_ FROM ACT_HI_TASKINST 
        WHERE PROC_INST_ID_ = "${instanceId}" AND NAME_ IN ("${keys.join('","')}")
            ORDER BY START_TIME_ DESC, END_TIME_ DESC LIMIT 1`
    let result = await query(sql)
    // console.log(instanceId, keys, 'node_time result:', result)
    return result?.length && result[0].STATE_ == 'completed' ? result[0].END_TIME_ : null
}

module.exports = actHiTaskinstRepo