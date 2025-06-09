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

actHiProcinstRepo.getFtInfo = async (userNames, start, end) => {
    let sql = `SELECT IF(v.TEXT_ = '3', 2, IF(v1.TEXT_ = '2', 1, 0)) AS \`status\`, 
            v2.TEXT_ AS task_status, COUNT(1) AS count 
        FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v.NAME_ = 'PROCESS_STATUS'
            AND v.TEXT_ NOT IN ('-1', '4')
        JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_
            AND t.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到')
            AND IF(t.END_TIME_ IS NULL, 1, t.END_TIME_ = (
                SELECT MAX(t1.END_TIME_) FROM ACT_HI_TASKINST t1 WHERE t1.PROC_INST_ID_ = p.PROC_INST_ID_
                    AND t1.NAME_ = t.NAME_
            ))
        LEFT JOIN ACT_HI_TASKINST t2 ON t2.PROC_INST_ID_ = p.PROC_INST_ID_
            AND t2.NAME_ = '反选运营确认样品是否选中'
        LEFT JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v1.NAME_ = 'TASK_STATUS' AND v1.TASK_ID_ = t2.ID_ 
        LEFT JOIN ACT_HI_VARINST v2 ON v2.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v2.NAME_ = 'Fy6xma3jakboekc' AND v2.TASK_ID_ = t2.ID_ 
        JOIN system_users u ON u.id = t.ASSIGNEE_ AND u.nickname in ("${userNames}") 
        WHERE d.KEY_ = 'fttplc' AND p.START_TIME_ BETWEEN ? AND ? 
        GROUP BY IF(v.TEXT_ = '3', 2, IF(v1.TEXT_ = '2', 1, 0)), v2.TEXT_`
    let result = await query(sql, [start, end])
    return result
}

actHiProcinstRepo.getGysInfo = async (userNames, start, end) => {
    let sql = `SELECT IF(v.TEXT_ = '3', 2, IF(v1.TEXT_ IS NULL OR v2.TEXT_ IS NULL OR v3.TEXT_ IS NULL, 0, 1)) 
            AS \`status\`, COUNT(1) AS count  
        FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v.NAME_ = 'PROCESS_STATUS' 
            AND v.TEXT_ NOT IN ('-1', '4') 
        LEFT JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND t.NAME_ = '事业部一提交市场分析' 
            AND t.START_TIME_ = ( 
                SELECT MAX(tt.START_TIME_) FROM ACT_HI_TASKINST tt WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND tt.NAME_ = t.NAME_ 
            )
        LEFT JOIN ACT_HI_TASKINST t1 ON t1.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND t1.NAME_ = '事业部二提交市场分析' 
            AND t1.START_TIME_ = ( 
                SELECT MAX(tt.START_TIME_) FROM ACT_HI_TASKINST tt WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND tt.NAME_ = t1.NAME_ 
            )
        LEFT JOIN ACT_HI_TASKINST t2 ON t2.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND t2.NAME_ = '事业部三提交市场分析' 
            AND t2.START_TIME_ = ( 
                SELECT MAX(tt.START_TIME_) FROM ACT_HI_TASKINST tt WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND tt.NAME_ = t2.NAME_ 
            )
        LEFT JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v1.TASK_ID_ IS NULL 
            AND v1.NAME_ = 'Fmtama25a3lrcwc' 
        LEFT JOIN ACT_HI_VARINST v2 ON v2.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v2.TASK_ID_ IS NULL 
            AND v2.NAME_ = 'Fkyuma25az2ud8c' 
        LEFT JOIN ACT_HI_VARINST v3 ON v3.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v3.TASK_ID_ IS NULL 
            AND v3.NAME_ = 'Fiaama25b6zidec' 
        JOIN system_users u ON u.id = p.START_USER_ID_ AND u.nickname in ("${userNames}") 
        WHERE d.KEY_ = 'gystplc' AND p.START_TIME_ BETWEEN ? AND ? 
        GROUP BY IF(v.TEXT_ = '3', 2, IF(v1.TEXT_ IS NULL OR v2.TEXT_ IS NULL OR v3.TEXT_ IS NULL, 0, 1))`
    let result = await query(sql, [start, end])
    return result
}

actHiProcinstRepo.getZyInfo = async (userNames, start, end) => {
    let sql = `SELECT IF(v.TEXT_ = '3', 2, IF(v.TEXT_ = '2', 1, 0)) AS \`status\`, 
            COUNT(1) AS count FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v.NAME_ = 'PROCESS_STATUS' 
            AND v.TEXT_ NOT IN ('-1', '4') 
        JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v1.NAME_ = 'Cfidbw9ff40k6' 
        JOIN system_users u ON u.id = v1.TEXT_ AND u.nickname in ("${userNames}") 
        WHERE d.KEY_ = 'zytplc' AND p.START_TIME_ BETWEEN ? AND ? 
        GROUP BY IF(v.TEXT_ = '3', 2, IF(v.TEXT_ = '2', 1, 0))`
    let result = await query(sql, [start, end])
    return result
}

actHiProcinstRepo.getIpInfo = async (userNames, start, end) => {
    let sql = `SELECT IF(v.TEXT_ = '3', 2, IF(v.TEXT_ = '2', 1, 0)) AS \`status\`, 
            COUNT(1) AS count FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v.NAME_ = 'PROCESS_STATUS' 
            AND v.TEXT_ NOT IN ('-1', '4') 
        JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v1.NAME_ = 'Cfidaq7mz3963' 
        JOIN system_users u ON u.id = v1.TEXT_ AND u.nickname in ("${userNames}") 
        WHERE d.KEY_ = 'iptplc' AND p.START_TIME_ BETWEEN ? AND ? 
        GROUP BY IF(v.TEXT_ = '3', 2, IF(v.TEXT_ = '2', 1, 0))`
    let result = await query(sql, [start, end])
    return result
}

actHiProcinstRepo.getSctgInfo = async (userNames, start, end) => {
    let sql = `SELECT IF(v.TEXT_ = '3', 2, IF(v.TEXT_ = '2', 1, 0)) AS \`status\`, 
            COUNT(1) AS count FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v.NAME_ = 'PROCESS_STATUS' 
            AND v.TEXT_ NOT IN ('-1', '4') 
        JOIN system_users u ON u.id = p.START_USER_ID_ AND u.nickname in ("${userNames}") 
        WHERE d.KEY_ = 'sctgtplc' AND p.START_TIME_ BETWEEN ? AND ? 
        GROUP BY IF(v.TEXT_ = '3', 2, IF(v.TEXT_ = '2', 1, 0))`
    let result = await query(sql, [start, end])
    return result
}

actHiProcinstRepo.getFtDetail = async (status, userNames, start, end) => {
    let sql = `SELECT u.nickname, v2.TEXT_ AS task_status, COUNT(1) AS count 
        FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v.NAME_ = 'PROCESS_STATUS'
            AND v.TEXT_ NOT IN ('-1', '4')
        JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_
            AND t.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到')
            AND IF(t.END_TIME_ IS NULL, 1, t.END_TIME_ = (
                SELECT MAX(t1.END_TIME_) FROM ACT_HI_TASKINST t1 WHERE t1.PROC_INST_ID_ = p.PROC_INST_ID_
                    AND t1.NAME_ = t.NAME_
            ))
        LEFT JOIN ACT_HI_TASKINST t2 ON t2.PROC_INST_ID_ = p.PROC_INST_ID_
            AND t2.NAME_ = '反选运营确认样品是否选中'
        LEFT JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v1.NAME_ = 'TASK_STATUS' AND v1.TASK_ID_ = t2.ID_ 
        LEFT JOIN ACT_HI_VARINST v2 ON v2.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v2.NAME_ = 'Fy6xma3jakboekc' AND v2.TASK_ID_ = t2.ID_
        JOIN system_users u ON u.id = t.ASSIGNEE_ AND u.nickname in ("${userNames}") 
        WHERE d.KEY_ = 'fttplc' AND p.START_TIME_ BETWEEN ? AND ? 
            AND IF(v.TEXT_ = '3', 2, IF(v1.TEXT_ = '2', 1, 0)) = ?
        GROUP BY u.nickname, v2.TEXT_`
    let result = await query(sql, [start, end, status])
    return result
}

actHiProcinstRepo.getGysDetail = async (status, userNames, start, end) => {
    let sql = `SELECT u.nickname, COUNT(1) AS count 
        FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v.NAME_ = 'PROCESS_STATUS' 
            AND v.TEXT_ NOT IN ('-1', '4') 
        LEFT JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND t.NAME_ = '事业部一提交市场分析' 
            AND t.START_TIME_ = ( 
                SELECT MAX(tt.START_TIME_) FROM ACT_HI_TASKINST tt WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND tt.NAME_ = t.NAME_ 
            )
        LEFT JOIN ACT_HI_TASKINST t1 ON t1.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND t1.NAME_ = '事业部二提交市场分析' 
            AND t1.START_TIME_ = ( 
                SELECT MAX(tt.START_TIME_) FROM ACT_HI_TASKINST tt WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND tt.NAME_ = t1.NAME_ 
            )
        LEFT JOIN ACT_HI_TASKINST t2 ON t2.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND t2.NAME_ = '事业部三提交市场分析' 
            AND t2.START_TIME_ = ( 
                SELECT MAX(tt.START_TIME_) FROM ACT_HI_TASKINST tt WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND tt.NAME_ = t2.NAME_ 
            )
        LEFT JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v1.TASK_ID_ IS NULL 
            AND v1.NAME_ = 'Fmtama25a3lrcwc' 
        LEFT JOIN ACT_HI_VARINST v2 ON v2.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v2.TASK_ID_ IS NULL 
            AND v2.NAME_ = 'Fkyuma25az2ud8c' 
        LEFT JOIN ACT_HI_VARINST v3 ON v3.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v3.TASK_ID_ IS NULL 
            AND v3.NAME_ = 'Fiaama25b6zidec' 
        JOIN system_users u ON u.id = p.START_USER_ID_ AND u.nickname in ("${userNames}") 
        WHERE d.KEY_ = 'gystplc' AND p.START_TIME_ BETWEEN ? AND ? 
            AND IF(v.TEXT_ = '3', 2, IF(v1.TEXT_ IS NULL OR v2.TEXT_ IS NULL OR v3.TEXT_ IS NULL, 0, 1)) = ? 
        GROUP BY u.nickname`
    let result = await query(sql, [start, end, status])
    return result
}

actHiProcinstRepo.getZyDetail = async (status, userNames, start, end) => {
    let sql = `SELECT u.nickname, COUNT(1) AS count 
        FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v.NAME_ = 'PROCESS_STATUS' 
            AND v.TEXT_ NOT IN ('-1', '4') 
        JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v1.NAME_ = 'Cfidbw9ff40k6' 
        JOIN system_users u ON u.id = v1.TEXT_ AND u.nickname in ("${userNames}") 
        WHERE d.KEY_ = 'zytplc' AND p.START_TIME_ BETWEEN ? AND ? 
            AND IF(v.TEXT_ = '3', 2, IF(v.TEXT_ = '2', 1, 0)) = ? 
        GROUP BY v1.TEXT_`
    let result = await query(sql, [start, end, status])
    return result
}

actHiProcinstRepo.getIpDetail = async (status, userNames, start, end) => {
    let sql = `SELECT u.nickname, COUNT(1) AS count 
        FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v.NAME_ = 'PROCESS_STATUS' 
            AND v.TEXT_ NOT IN ('-1', '4') 
        JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v1.NAME_ = 'Cfidaq7mz3963' 
        JOIN system_users u ON u.id = v1.TEXT_ AND u.nickname in ("${userNames}") 
        WHERE d.KEY_ = 'iptplc' AND p.START_TIME_ BETWEEN ? AND ? 
            AND IF(v.TEXT_ = '3', 2, IF(v.TEXT_ = '2', 1, 0)) = ? 
        GROUP BY v1.TEXT_`
    let result = await query(sql, [start, end, status])
    return result
}

actHiProcinstRepo.getSctgDetail = async (status, userNames, start, end) => {
    let sql = `SELECT u.nickname, COUNT(1) AS count 
        FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v.NAME_ = 'PROCESS_STATUS' 
            AND v.TEXT_ NOT IN ('-1', '4') 
        JOIN system_users u ON u.id = p.START_USER_ID_ AND u.nickname in ("${userNames}") 
        WHERE d.KEY_ = 'sctgtplc' AND p.START_TIME_ BETWEEN ? AND ? 
            AND IF(v.TEXT_ = '3', 2, IF(v.TEXT_ = '2', 1, 0)) = ? 
        GROUP BY p.START_USER_ID_`
    let result = await query(sql, [start, end, status])
    return result
}

actHiProcinstRepo.getProductDevelopInfo = async (start, end, type, order) => {
    let order_info = 'p.ID_', keys = "'gystplc', 'fttplc', 'sctgtplc', 'zytplc', 'iptpc'"
    if (type == '1') keys = "'sctgtplc'"
    else if (type == '2') keys = "'zytplc'"
    else if (type == '3') keys = "'iptpc'"
    else if (type == '4') keys = "'fttplc'"
    else if (type == '5') keys = "'gystplc'"
    if (order == 1) order_info = 't2.ASSIGNEE_'
    let sql = `SELECT p.ID_ AS id, t.LAST_UPDATED_TIME_ as operate_time, b.BYTES_ AS info, 
            (SELECT nickname FROM system_users WHERE t2.ASSIGNEE_ = id) AS nickname 
        FROM ACT_HI_PROCINST p LEFT JOIN ACT_RE_PROCDEF d ON p.PROC_DEF_ID_ = d.ID_
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v.NAME_ IN ('Fcilma2exazkb7c', 'Fig2ma24zzz9brc', 'F6gkma3pfcjfd1c')
            AND v.LAST_UPDATED_TIME_ = (
                SELECT MAX(v1.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST v1 
                WHERE v1.PROC_INST_ID_ = p.PROC_INST_ID_ AND v1.NAME_ = v.NAME_ 
            )
        JOIN ACT_GE_BYTEARRAY b ON b.ID_ = v.BYTEARRAY_ID_
        JOIN ACT_HI_TASKINST t on t.PROC_INST_ID_ = p.PROC_INST_ID_
            AND t.NAME_ IN ('分配采购执行人', '分配采购执行人1', '分配采购执行人2', '分配采购执行人3') 
            AND t.STATE_ = 'completed' 
            AND t.LAST_UPDATED_TIME_ = (
                SELECT MAX(t1.LAST_UPDATED_TIME_) FROM ACT_HI_TASKINST t1 
                WHERE t1.PROC_INST_ID_ = p.PROC_INST_ID_ AND t1.NAME_ = t.NAME_ AND t.ASSIGNEE_ IS NOT NULL 
            ) AND t.LAST_UPDATED_TIME_ BETWEEN '${start}' AND '${end}'
        JOIN ACT_HI_TASKINST t2 on t2.PROC_INST_ID_ = p.PROC_INST_ID_
            AND t2.NAME_ LIKE '%寄样%' 
            AND t2.STATE_ = 'completed' 
            AND t2.LAST_UPDATED_TIME_ = (
                SELECT MAX(t1.LAST_UPDATED_TIME_) FROM ACT_HI_TASKINST t1 
                    WHERE t1.PROC_INST_ID_ = p.PROC_INST_ID_ AND t1.NAME_ = t2.NAME_ AND t2.ASSIGNEE_ IS NOT NULL 
            )
        JOIN ACT_HI_VARINST v2 ON v2.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v2.NAME_ = 'PROCESS_STATUS' AND v2.TEXT_ IN ('1', '2')
        WHERE d.KEY_ IN (${keys}) 
        ORDER BY ${order_info}`
    let result = await query(sql)
    return result
}


module.exports = actHiProcinstRepo