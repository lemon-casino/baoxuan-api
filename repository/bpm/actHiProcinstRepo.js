const { query } = require('../../model/bpmDbConn')
const actHiProcinstRepo = {}

actHiProcinstRepo.getRunning = async (start, end) => {
    let sql = `SELECT D.NAME_ AS title, P.NAME_ AS name, P.START_TIME_ AS create_time, 
            CONCAT('http://bpm.pakchoice.cn:8848/bpm/process-instance/detail\?id=', P.ID_) AS link,
            T.NAME_ AS node, U.nickname AS operator
        FROM ACT_HI_PROCINST P LEFT JOIN ACT_RE_PROCDEF D ON P.PROC_DEF_ID_ = D.ID_
        JOIN ACT_HI_TASKINST T ON T.PROC_INST_ID_ = P.PROC_INST_ID_ AND T.STATE_ = 'created'
        LEFT JOIN system_users U ON U.id = T.ASSIGNEE_
        WHERE D.KEY_ IN ('gystplc', 'fttplc', 'sctgtplc') 
            AND P.START_TIME_ BETWEEN "${start}" AND "${end}"`
    let result = await query(sql)
    return result
}

actHiProcinstRepo.getFinish = async (start, end) => {
    let sql = `SELECT D.NAME_ AS name, P.NAME_ AS title, P.START_TIME_ AS create_time, 
            CONCAT('http://bpm.pakchoice.cn:8848/bpm/process-instance/detail\?id=', P.ID_) AS link,
            (CASE V.TEXT_ WHEN '2' THEN '完成' ELSE '终止' END) AS \`status\`, 
            IF(V3.TEXT_, V3.TEXT_, V2.TEXT_) AS reason
        FROM ACT_HI_PROCINST P LEFT JOIN ACT_RE_PROCDEF D ON P.PROC_DEF_ID_ = D.ID_
        JOIN ACT_HI_VARINST V ON P.PROC_INST_ID_ = V.PROC_INST_ID_ 
            AND V.NAME_ = 'PROCESS_STATUS' AND V.TEXT_ IN ('2','4')
        LEFT JOIN ACT_HI_VARINST V1 ON V1.PROC_INST_ID_ = P.PROC_INST_ID_
            AND V1.NAME_ IN ('Cfidcvooh9jnf', 'Cfidvu2osk3k9', 'Cfidzncsybu0e', 'Cfid1wglixgnx')
            AND V1.CREATE_TIME_ = (
                SELECT MAX(VV.CREATE_TIME_) FROM ACT_HI_VARINST VV WHERE VV.PROC_INST_ID_ = P.PROC_INST_ID_
                    AND VV.NAME_ IN ('Cfidcvooh9jnf', 'Cfidvu2osk3k9', 'Cfidzncsybu0e', 'Cfid1wglixgnx')
            )
        LEFT JOIN ACT_HI_VARINST V2 ON V2.PROC_INST_ID_ = P.PROC_INST_ID_
            AND V2.NAME_ = (
                CASE V1.NAME_ WHEN 'Cfidcvooh9jnf' THEN 'Fsaqma2et04janc'
                WHEN 'Cfidvu2osk3k9' THEN 'Fd94ma3j5t4me4c'
                WHEN 'Cfidzncsybu0e' THEN 'Fuusma3kfq9tinc'
                ELSE 'F2e7ma3l2n9vk8c' END
            )
        LEFT JOIN ACT_HI_VARINST V3 ON V3.PROC_INST_ID_ = P.PROC_INST_ID_
            AND V3.NAME_ = 'Fm06ma3kixpkj7c'
        WHERE D.KEY_ IN ('gystplc', 'fttplc', 'sctgtplc') 
            AND P.START_TIME_ BETWEEN "${start}" AND "${end}"`
    let result = await query(sql)
    return result
}

module.exports = actHiProcinstRepo