const { query } = require('../../model/bpmDbConn')
const actHiProcinstRepo = {}

actHiProcinstRepo.getRunning = async (start, end) => {
    let sql = `SELECT D.NAME_ AS title, P.NAME_ AS name, P.START_TIME_ AS create_time, 
            CONCAT('http://bpm.pakchoice.cn:8848/bpm/process-instance/detail\?id=', P.ID_) AS link,
            T.NAME_ AS node, U.nickname AS operator
        FROM ACT_HI_PROCINST P LEFT JOIN ACT_RE_PROCDEF D ON P.PROC_DEF_ID_ = D.ID_
        JOIN ACT_HI_TASKINST T ON T.PROC_INST_ID_ = P.PROC_INST_ID_ AND T.STATE_ = 'created'
        LEFT JOIN system_users U ON U.id = T.ASSIGNEE_
        WHERE D.KEY_ IN ('gystplc', 'fttplc', 'sctgtplc', 
                'fantuituipin', 'iptplcxb', 'ziyantuipin', 'gongyingshangtuipin', 'shichangfenxituipin') 
            AND P.START_TIME_ BETWEEN "${start}" AND "${end}" 
            AND D.CATEGORY_ != 'ceshi'`
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
            AND V.NAME_ = 'PROCESS_STATUS' AND V.TEXT_ IN ('2','3','4')
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
        WHERE D.KEY_ IN ('gystplc', 'fttplc', 'sctgtplc', 
                'fantuituipin', 'iptplcxb', 'ziyantuipin', 'gongyingshangtuipin', 'shichangfenxituipin') 
            AND P.START_TIME_ BETWEEN "${start}" AND "${end}"
            AND D.CATEGORY_ != 'ceshi'`
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
            AND t2.NAME_ IN ('反选运营确认样品是否选中', '事业部一样品是否选中', '事业部二样品是否选中', '事业部三样品是否选中')
        LEFT JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v1.NAME_ = 'TASK_STATUS' AND v1.TASK_ID_ = t2.ID_ 
        LEFT JOIN ACT_HI_VARINST v2 ON v2.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v2.NAME_ = 'Fy6xma3jakboekc' AND v2.TASK_ID_ = t2.ID_ 
        JOIN system_users u ON u.id = t.ASSIGNEE_ AND u.nickname in ("${userNames}") 
        WHERE d.KEY_ IN ('fttplc', 'fantuituipin') AND p.START_TIME_ BETWEEN ? AND ? 
            AND d.CATEGORY_ != 'ceshi'
        GROUP BY IF(v.TEXT_ = '3', 2, IF(v1.TEXT_ = '2', 1, 0)), v2.TEXT_`
    let result = await query(sql, [start, end])
    return result
}

actHiProcinstRepo.getNewFtInfo = async (start, end) => {
    let sql = `SELECT p.PROC_INST_ID_ AS id, u.nickname, du.name AS dept, 
            IF(v.TEXT_ = '1' AND v1.ID_ IS NULL, 1, 0) AS running,
	        IF((v1.ID_ IS NOT NULL AND vv.TEXT_ != '找到') OR (v.TEXT_ IN ('2', '3') AND v1.ID_ IS NULL), 1, 0) AS reject, 
            IF(v1.ID_ IS NOT NULL AND vv.TEXT_ = '找到', 1, 0) AS selected, 
            IF(v1.LAST_UPDATED_TIME_ IS NOT NULL, 
                DATEDIFF(v1.LAST_UPDATED_TIME_, p.START_TIME_), 0) AS selected_time, 
            b.BYTES_ AS info, u1.nickname AS director, 
            v5.LAST_UPDATED_TIME_ AS purchase_date, 
            IF(v5.LAST_UPDATED_TIME_ IS NOT NULL, 
                DATEDIFF(v5.LAST_UPDATED_TIME_, v1.LAST_UPDATED_TIME_), 0) AS purchase_time 
        FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v.NAME_ = 'PROCESS_STATUS'
            AND v.TEXT_ NOT IN ('-1', '4')
        JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_
            AND t.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到')
            AND IF(t.END_TIME_ IS NULL, 1, t.END_TIME_ = (
                SELECT MAX(t1.END_TIME_) FROM ACT_HI_TASKINST t1 WHERE t1.PROC_INST_ID_ = p.PROC_INST_ID_
                    AND t1.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到')
            ))
        LEFT JOIN ACT_HI_VARINST vv ON vv.PROC_INST_ID_ = p.PROC_INST_ID_
            AND vv.NAME_ = (CASE t.NAME_ WHEN '反选1是否找到' THEN 'Fsaqma2et04janc'
                WHEN '反选2是否找到' THEN 'Fd94ma3j5t4me4c' 
                WHEN '反选3是否找到' THEN 'Fuusma3kfq9tinc'
                ELSE 'F2e7ma3l2n9vk8c' END)
            AND vv.LAST_UPDATED_TIME_ = (
                SELECT MAX(vx.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vx 
                WHERE vx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND vv.NAME_ = vx.NAME_ 
            )
		JOIN system_users u ON u.id = p.START_USER_ID_ 
        JOIN system_users u1 ON u1.id = t.ASSIGNEE_ 
        JOIN system_dept du ON du.id = u.dept_id 
        LEFT JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_
			AND v1.NAME_ IN ('Fxfrma3j75fse7c', 'F6c5mbuidfzfqjc', 'F64jmbuie9olqmc', 'Fxkxmbuiecz2qpc', 'Fy6xma3jakboekc')
            AND v1.TEXT_ = '选中'
            AND v1.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND vv.NAME_ IN ('Fxfrma3j75fse7c', 'F6c5mbuidfzfqjc', 'F64jmbuie9olqmc', 'Fxkxmbuiecz2qpc', 'Fy6xma3jakboekc') 
            )
        LEFT JOIN ACT_HI_VARINST v2 ON v2.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v2.NAME_ = 'F6gkma3pfcjfd1c' 
            AND v2.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND vv.NAME_ = 'F6gkma3pfcjfd1c' 
            )
        LEFT JOIN ACT_GE_BYTEARRAY b ON b.ID_ = v2.BYTEARRAY_ID_ 
		LEFT JOIN ACT_HI_TASKINST t1 ON t1.PROC_INST_ID_ = p.PROC_INST_ID_ 
			AND t1.NAME_ IN ('填写合同', '代发确认')
            AND t1.LAST_UPDATED_TIME_ = (
				SELECT MIN(tt.LAST_UPDATED_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.NAME_ = t1.NAME_ AND tt.PROC_INST_ID_ = p.PROC_INST_ID_
            )
		LEFT JOIN ACT_HI_VARINST v5 ON v5.PROC_INST_ID_ = p.PROC_INST_ID_
			AND v5.TASK_ID_ = t1.ID_ 
            AND v5.NAME_ = 'TASK_STATUS'
            AND v5.TEXT_ = '2'
        WHERE d.KEY_ IN ('fttplc', 'fantuituipin') AND p.START_TIME_ BETWEEN ? AND ?
            AND d.CATEGORY_ != 'ceshi'`
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
        WHERE d.KEY_ IN ('gystplc', 'gongyingshangtuipin') AND p.START_TIME_ BETWEEN ? AND ? 
            AND d.CATEGORY_ != 'ceshi'
        GROUP BY IF(v.TEXT_ = '3', 2, IF(v1.TEXT_ IS NULL OR v2.TEXT_ IS NULL OR v3.TEXT_ IS NULL, 0, 1))`
    let result = await query(sql, [start, end])
    return result
}

actHiProcinstRepo.getNewGysInfo = async (start, end) => {
    let sql = `SELECT p.PROC_INST_ID_ AS id, u.nickname, du.name AS dept, 
            IF(v.TEXT_ = '1' AND v1.ID_ IS NULL, 1, 0) AS running,
	        IF(v.TEXT_ = '3', 1, 0) AS reject, IF(v1.ID_ IS NOT NULL, 1, 0) AS selected, 
            IF(v1.LAST_UPDATED_TIME_ IS NOT NULL, 
                DATEDIFF(v1.LAST_UPDATED_TIME_, p.START_TIME_), 0) AS selected_time, 
            b.BYTES_ AS info, v4.LAST_UPDATED_TIME_ AS purchase_date, 
            IF(v4.LAST_UPDATED_TIME_ IS NOT NULL, 
                DATEDIFF(v4.LAST_UPDATED_TIME_, v1.LAST_UPDATED_TIME_), 0) AS purchase_time  
        FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v.NAME_ = 'PROCESS_STATUS'
            AND v.TEXT_ NOT IN ('-1', '4')
		JOIN system_users u on u.id = p.START_USER_ID_ 
        JOIN system_dept du ON du.id = u.dept_id 
        LEFT JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_
			AND v1.NAME_ IN ('Fmtama25a3lrcwc', 'Fkyuma25az2ud8c', 'Fiaama25b6zidec')
            AND v1.TEXT_ = '选中'
            AND v1.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND vv.NAME_ IN ('Fmtama25a3lrcwc', 'Fkyuma25az2ud8c', 'Fiaama25b6zidec') 
            )
        LEFT JOIN ACT_HI_VARINST v2 ON v2.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v2.NAME_ = 'F6gkma3pfcjfd1c' 
            AND v2.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND vv.NAME_ = 'F6gkma3pfcjfd1c' 
            )
        LEFT JOIN ACT_GE_BYTEARRAY b ON b.ID_ = v2.BYTEARRAY_ID_ 
		LEFT JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_ 
			AND t.NAME_ IN ('代发确认', '采购执行人签订周转合同')
            AND t.LAST_UPDATED_TIME_ = (
				SELECT MIN(tt.LAST_UPDATED_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.NAME_ = t.NAME_ AND tt.PROC_INST_ID_ = p.PROC_INST_ID_
            )
		LEFT JOIN ACT_HI_VARINST v4 ON v4.PROC_INST_ID_ = p.PROC_INST_ID_
			AND v4.TASK_ID_ = t.ID_ AND v4.TEXT_ = '2'
        WHERE d.KEY_ IN ('gystplc', 'gongyingshangtuipin') AND p.START_TIME_ BETWEEN ? AND ?
            AND d.CATEGORY_ != 'ceshi'`
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
        WHERE d.KEY_ IN ('zytplc', 'ziyantuipin') AND p.START_TIME_ BETWEEN ? AND ? 
            AND d.CATEGORY_ != 'ceshi'
        GROUP BY IF(v.TEXT_ = '3', 2, IF(v.TEXT_ = '2', 1, 0))`
    let result = await query(sql, [start, end])
    return result
}

actHiProcinstRepo.getNewZyInfo = async (start, end) => {
    let sql = `SELECT p.PROC_INST_ID_ AS id, u.nickname, du.name AS dept, 
            IF(v.TEXT_ = '1' AND v1.ID_ IS NULL, 1, 0) AS running,
	        IF(v.TEXT_ = '3', 1, 0) AS reject, IF(v1.ID_ IS NOT NULL, 1, 0) AS selected, 
            IF(v1.LAST_UPDATED_TIME_ IS NOT NULL, 
                DATEDIFF(v1.LAST_UPDATED_TIME_, p.START_TIME_), 0) AS selected_time, 
            b.BYTES_ AS info, u1.nickname AS director, 
            v5.LAST_UPDATED_TIME_ AS purchase_date, 
            IF(v5.LAST_UPDATED_TIME_ IS NOT NULL, 
                DATEDIFF(v5.LAST_UPDATED_TIME_, v1.LAST_UPDATED_TIME_), 0) AS purchase_time 
        FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v.NAME_ = 'PROCESS_STATUS'
            AND v.TEXT_ NOT IN ('-1', '4')
		JOIN system_users u ON u.id = p.START_USER_ID_ 
        JOIN system_dept du ON du.id = u.dept_id 
        LEFT JOIN ACT_HI_VARINST v4 ON v4.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v4.NAME_ = 'Cfidbw9ff40k6' 
            AND v4.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND vv.NAME_ = 'Cfidbw9ff40k6' 
            )
        LEFT JOIN system_users u1 ON u1.id = v4.TEXT_ 
        LEFT JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_
			AND v1.NAME_ IN ('Fzmjma3pe3tnclc', 'F2lmma3petqpcwc', 'F34mma3pf0egd0c')
            AND v1.TEXT_ = '是'
            AND v1.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND vv.NAME_ IN ('Fzmjma3pe3tnclc', 'F2lmma3petqpcwc', 'F34mma3pf0egd0c') 
            )
        LEFT JOIN ACT_HI_VARINST v2 ON v2.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v2.NAME_ = 'F6gkma3pfcjfd1c' 
            AND v2.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND vv.NAME_ = 'F6gkma3pfcjfd1c' 
            )
        LEFT JOIN ACT_GE_BYTEARRAY b ON b.ID_ = v2.BYTEARRAY_ID_ 
		LEFT JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_ 
			AND t.NAME_ = '填写订货合同'
            AND t.LAST_UPDATED_TIME_ = (
				SELECT MIN(tt.LAST_UPDATED_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.NAME_ = t.NAME_ AND tt.PROC_INST_ID_ = p.PROC_INST_ID_
            )
		LEFT JOIN ACT_HI_VARINST v5 ON v5.PROC_INST_ID_ = p.PROC_INST_ID_
			AND v5.TASK_ID_ = t.ID_ AND v5.TEXT_ = '2'
        WHERE d.KEY_ IN ('zytplc', 'ziyantuipin') AND p.START_TIME_ BETWEEN ? AND ?
            AND d.CATEGORY_ != 'ceshi'`
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
        WHERE d.KEY_ IN ('iptplc', 'iptplcxb') AND p.START_TIME_ BETWEEN ? AND ? 
            AND d.CATEGORY_ != 'ceshi'
        GROUP BY IF(v.TEXT_ = '3', 2, IF(v.TEXT_ = '2', 1, 0))`
    let result = await query(sql, [start, end])
    return result
}

actHiProcinstRepo.getNewIpInfo = async (start, end) => {
    let sql = `SELECT p.PROC_INST_ID_ AS id, u.nickname, du.name AS dept, 
            IF(v.TEXT_ = '1' AND v1.ID_ IS NULL, 1, 0) AS running,
	        IF(v.TEXT_ = '3', 1, 0) AS reject, IF(v1.ID_ IS NOT NULL, 1, 0) AS selected, 
            IF(v1.LAST_UPDATED_TIME_ IS NOT NULL, 
                DATEDIFF(v1.LAST_UPDATED_TIME_, p.START_TIME_), 0) AS selected_time, 
            b.BYTES_ AS info, u1.nickname AS director, 
            v5.LAST_UPDATED_TIME_ AS purchase_date, 
            IF(v5.LAST_UPDATED_TIME_ IS NOT NULL, 
                DATEDIFF(v5.LAST_UPDATED_TIME_, v1.LAST_UPDATED_TIME_), 0) AS purchase_time 
        FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v.NAME_ = 'PROCESS_STATUS'
            AND v.TEXT_ NOT IN ('-1', '4')
		JOIN system_users u ON u.id = p.START_USER_ID_ 
        JOIN system_dept du ON du.id = u.dept_id 
        LEFT JOIN ACT_HI_VARINST v4 ON v4.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v4.NAME_ = 'Cfidaq7mz3963' 
            AND v4.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND vv.NAME_ = 'Cfidaq7mz3963' 
            )
        LEFT JOIN system_users u1 ON u1.id = v4.TEXT_ 
        LEFT JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_
			AND v1.NAME_ IN ('Fzmjma3pe3tnclc', 'F2lmma3petqpcwc', 'F34mma3pf0egd0c')
            AND v1.TEXT_ = '是'
            AND v1.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND vv.NAME_ IN ('Fzmjma3pe3tnclc', 'F2lmma3petqpcwc', 'F34mma3pf0egd0c') 
            )
        LEFT JOIN ACT_HI_VARINST v2 ON v2.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v2.NAME_ = 'F6gkma3pfcjfd1c' 
            AND v2.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND vv.NAME_ = 'F6gkma3pfcjfd1c' 
            )
        LEFT JOIN ACT_GE_BYTEARRAY b ON b.ID_ = v2.BYTEARRAY_ID_ 
		LEFT JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_ 
			AND t.NAME_ IN ('填写订货量及订货合同', '上传订货合同及填写预计到货时间')
            AND t.LAST_UPDATED_TIME_ = (
				SELECT MIN(tt.LAST_UPDATED_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.NAME_ = t.NAME_ AND tt.PROC_INST_ID_ = p.PROC_INST_ID_
            )
		LEFT JOIN ACT_HI_VARINST v5 ON v5.PROC_INST_ID_ = p.PROC_INST_ID_
			AND v5.TASK_ID_ = t.ID_ AND v5.TEXT_ = '2'
        WHERE d.KEY_ IN ('iptplc', 'iptplcxb') AND p.START_TIME_ BETWEEN ? AND ?
            AND d.CATEGORY_ != 'ceshi'`
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
        WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') AND p.START_TIME_ BETWEEN ? AND ? 
            AND d.CATEGORY_ != 'ceshi'
        GROUP BY IF(v.TEXT_ = '3', 2, IF(v.TEXT_ = '2', 1, 0))`
    let result = await query(sql, [start, end])
    return result
}

actHiProcinstRepo.getNewSctgInfo = async (start, end) => {
    let sql = `SELECT p.PROC_INST_ID_ AS id, u.nickname, du.name AS dept, 
            IF(v.TEXT_ = '1' AND v1.ID_ IS NULL, 1, 0) AS running,
	        IF(v.TEXT_ = '3', 1, 0) AS reject, IF(v1.ID_ IS NOT NULL, 1, 0) AS selected, 
            IF(v1.LAST_UPDATED_TIME_ IS NOT NULL, 
                DATEDIFF(v1.LAST_UPDATED_TIME_, p.START_TIME_), 0) AS selected_time, 
            b.BYTES_ AS info, v4.LAST_UPDATED_TIME_ AS purchase_date, 
            IF(v4.LAST_UPDATED_TIME_ IS NOT NULL, 
                DATEDIFF(v4.LAST_UPDATED_TIME_, v1.LAST_UPDATED_TIME_), 0) AS purchase_time 
        FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v.NAME_ = 'PROCESS_STATUS'
            AND v.TEXT_ NOT IN ('-1', '4')
		JOIN system_users u ON u.id = p.START_USER_ID_ 
        JOIN system_dept du ON du.id = u.dept_id 
        LEFT JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_
			AND v1.NAME_ IN ('Fzmjma3pe3tnclc', 'F2lmma3petqpcwc', 'F34mma3pf0egd0c')
            AND v1.TEXT_ = '是'
            AND v1.LAST_UPDATED_TIME_ = (
                SELECT MAX(v2.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST v2 
                WHERE v2.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND v2.NAME_ IN ('Fzmjma3pe3tnclc', 'F2lmma3petqpcwc', 'F34mma3pf0egd0c') 
            )
        LEFT JOIN ACT_HI_VARINST v2 ON v2.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v2.NAME_ = 'F6gkma3pfcjfd1c' 
            AND v2.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND vv.NAME_ = 'F6gkma3pfcjfd1c' 
            )
        LEFT JOIN ACT_GE_BYTEARRAY b ON b.ID_ = v2.BYTEARRAY_ID_ 
		LEFT JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_ 
			AND t.NAME_ IN ('填写订货合同1', '填写订货合同2', '填写订货合同3')
            AND t.LAST_UPDATED_TIME_ = (
				SELECT MIN(tt.LAST_UPDATED_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.NAME_ = t.NAME_ AND tt.PROC_INST_ID_ = p.PROC_INST_ID_
            )
		LEFT JOIN ACT_HI_VARINST v4 ON v4.PROC_INST_ID_ = p.PROC_INST_ID_
			AND v4.TASK_ID_ = t.ID_ AND v4.TEXT_ = '2'
        WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') AND p.START_TIME_ BETWEEN ? AND ?
            AND d.CATEGORY_ != 'ceshi'`
    let result = await query(sql, [start, end])
    return result
}

actHiProcinstRepo.getNewDetail = async (id) => {
    const sql = `SELECT p.NAME_ AS title, IF(v1.ID_ IS NOT NULL, 1, IF(v.TEXT_ = '1', 0, -1)) AS is_selected, 
	        IF(v2.ID_ IS NOT NULL, 1, 0) AS is_purchase, b.BYTES_ AS info, b1.BYTES_ AS info1 
        FROM ACT_HI_PROCINST p LEFT JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_
			AND v1.NAME_ IN ('Fzmjma3pe3tnclc', 'F2lmma3petqpcwc', 'F34mma3pf0egd0c', 
                'Fxfrma3j75fse7c', 'F6c5mbuidfzfqjc', 'F64jmbuie9olqmc', 'Fxkxmbuiecz2qpc', 'Fy6xma3jakboekc')
            AND (v1.TEXT_ = '是' OR v1.TEXT_ = '选中')
            AND v1.LAST_UPDATED_TIME_ = (
                SELECT MAX(v2.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST v2 
                WHERE v2.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND v2.NAME_ IN ('Fzmjma3pe3tnclc', 'F2lmma3petqpcwc', 'F34mma3pf0egd0c', 
                    'Fxfrma3j75fse7c', 'F6c5mbuidfzfqjc', 'F64jmbuie9olqmc', 'Fxkxmbuiecz2qpc', 'Fy6xma3jakboekc') 
            )
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v.NAME_ = 'PROCESS_STATUS'
		LEFT JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_ 
			AND t.NAME_ IN ('填写订货合同', '填写订货量及订货合同', '上传订货合同及填写预计到货时间', 
                '填写合同', '代发确认', '填写订货合同1', '填写订货合同2', '填写订货合同3', '采购执行人签订周转合同')
            AND t.LAST_UPDATED_TIME_ = (
				SELECT MIN(tt.LAST_UPDATED_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.NAME_ = t.NAME_ AND tt.PROC_INST_ID_ = p.PROC_INST_ID_
            )
		LEFT JOIN ACT_HI_VARINST v2 ON v2.PROC_INST_ID_ = p.PROC_INST_ID_
			AND v2.TASK_ID_ = t.ID_ 
            AND v2.NAME_ = 'TASK_STATUS'
            AND v2.TEXT_ = '2'
		LEFT JOIN ACT_HI_VARINST v3 ON v3.PROC_INST_ID_ = p.PROC_INST_ID_
			AND v3.NAME_ IN ('F6gkma3pfcjfd1c', 'Fcilma2exazkb7c', 'Fig2ma24zzz9brc')
            AND v3.LAST_UPDATED_TIME_ = (
				SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.NAME_ = v3.NAME_ AND vv.PROC_INST_ID_ = p.PROC_INST_ID_
            )
		LEFT JOIN ACT_GE_BYTEARRAY b ON b.ID_ = v3.BYTEARRAY_ID_
        LEFT JOIN ACT_HI_VARINST v4 ON v4.PROC_INST_ID_ = p.PROC_INST_ID_
			AND v4.NAME_ = 'Foaomaknt8tlbec' 
            AND v4.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND vv.NAME_ = 'Foaomaknt8tlbec' 
            )
		LEFT JOIN ACT_GE_BYTEARRAY b1 ON b1.ID_ = v4.BYTEARRAY_ID_ 
        WHERE p.PROC_INST_ID_ = ?`
    const result = await query(sql, [id])
    return result
}


actHiProcinstRepo.getSelectedInfo = async (start, end) => {
    const sql = `SELECT b.BYTES_ AS info, CASE 
            WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品'
            WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
            WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
            WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品'  
            ELSE '反推推品' END AS type FROM ACT_HI_PROCINST p 
        JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v.NAME_ = 'PROCESS_STATUS'
            AND v.TEXT_ NOT IN ('-1', '4')
        JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_
			AND v1.NAME_ IN ('F6gkma3pfcjfd1c', 'Fcilma2exazkb7c', 'Fig2ma24zzz9brc')
            AND v1.LAST_UPDATED_TIME_ = (
				SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.NAME_ = v1.NAME_ AND vv.PROC_INST_ID_ = p.PROC_INST_ID_
            )
		JOIN ACT_GE_BYTEARRAY b ON b.ID_ = v1.BYTEARRAY_ID_
        WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin', 'iptplc', 'iptplcxb', 
            'zytplc', 'ziyantuipin', 'gystplc', 'gongyingshangtuipin', 'fttplc', 'fantuituipin') 
            AND p.START_TIME_ BETWEEN ? AND ?`
    const result = await query(sql, [start, end])
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
        WHERE d.KEY_ IN ('fttplc', 'fantuituipin') AND p.START_TIME_ BETWEEN ? AND ? 
            AND IF(v.TEXT_ = '3', 2, IF(v1.TEXT_ = '2', 1, 0)) = ?
            AND d.CATEGORY_ != 'ceshi'
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
        WHERE d.KEY_ IN ('gystplc', 'gongyingshangtuipin') AND p.START_TIME_ BETWEEN ? AND ? 
            AND IF(v.TEXT_ = '3', 2, IF(v1.TEXT_ IS NULL OR v2.TEXT_ IS NULL OR v3.TEXT_ IS NULL, 0, 1)) = ? 
            AND d.CATEGORY_ != 'ceshi'
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
        WHERE d.KEY_ IN ('zytplc', 'ziyantuipin') AND p.START_TIME_ BETWEEN ? AND ? 
            AND IF(v.TEXT_ = '3', 2, IF(v.TEXT_ = '2', 1, 0)) = ? 
            AND d.CATEGORY_ != 'ceshi'
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
        WHERE d.KEY_ IN ('iptplc', 'iptplcxb') AND p.START_TIME_ BETWEEN ? AND ? 
            AND IF(v.TEXT_ = '3', 2, IF(v.TEXT_ = '2', 1, 0)) = ? 
            AND d.CATEGORY_ != 'ceshi'
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
        WHERE d.KEY_ IN ('sctgtplc', 'gongyingshangtuipin') AND p.START_TIME_ BETWEEN ? AND ? 
            AND IF(v.TEXT_ = '3', 2, IF(v.TEXT_ = '2', 1, 0)) = ? 
            AND d.CATEGORY_ != 'ceshi'
        GROUP BY p.START_USER_ID_`
    let result = await query(sql, [start, end, status])
    return result
}

actHiProcinstRepo.getProductDevelopInfo = async (start, end, type, order) => {
    let order_info = 'p.ID_', keys = "'gystplc', 'fttplc', 'sctgtplc', 'zytplc', 'iptpc', 'fantuituipin', 'iptplcxb', 'ziyantuipin', 'gongyingshangtuipin', 'shichangfenxituipin'"
    if (type == '1') keys = "'sctgtplc', 'shichangfenxituipin'"
    else if (type == '2') keys = "'zytplc', 'ziyantuipin'"
    else if (type == '3') keys = "'iptpc', 'iptplcxb'"
    else if (type == '4') keys = "'fttplc', 'fantuituipin'"
    else if (type == '5') keys = "'gystplc', 'gongyingshangtuipin'"
    if (order == 1) order_info = 't2.ASSIGNEE_'
    let sql = `SELECT p.ID_ AS id, t.LAST_UPDATED_TIME_ AS operate_time, b.BYTES_ AS info, 
            (SELECT nickname FROM system_users WHERE t2.ASSIGNEE_ = id) AS nickname, v3.TEXT_ AS line_brief_name, 
            CONCAT('http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.PROC_INST_ID_) AS link 
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
        JOIN ACT_HI_VARINST v3 ON v3.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v3.NAME_ IN ('Fj0jma3p8evsc0c', 'Fncjma23ezl8aec', 'F6w0ma2d2mnxakc') 
            AND v3.LAST_UPDATED_TIME_ = (
                SELECT MAX(v1.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST v1 
                WHERE v1.PROC_INST_ID_ = p.PROC_INST_ID_ AND v1.NAME_ = v3.NAME_ 
            )
        WHERE d.KEY_ IN (${keys}) AND d.CATEGORY_ != 'ceshi'
        ORDER BY ${order_info}`
    let result = await query(sql)
    return result
}

actHiProcinstRepo.getProductSkuId = async (start, type) => {
    let keys = "'gystplc', 'fttplc', 'sctgtplc', 'zytplc', 'iptpc', 'fantuituipin', 'iptplcxb', 'ziyantuipin', 'gongyingshangtuipin', 'shichangfenxituipin'"
    if (type == '1') keys = "'sctgtplc', 'shichangfenxituipin'"
    else if (type == '2') keys = "'zytplc', 'ziyantuipin'"
    else if (type == '3') keys = "'iptpc', 'iptplcxb'"
    else if (type == '4') keys = "'fttplc', 'fantuituipin'"
    else if (type == '5') keys = "'gystplc', 'gongyingshangtuipin'"
    let sql = `SELECT b.BYTES_ AS info FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON p.PROC_DEF_ID_ = d.ID_
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
            ) AND t.LAST_UPDATED_TIME_ <= '${start}'
        WHERE d.KEY_ IN (${keys}) AND d.CATEGORY_ != 'ceshi'`
    let result = await query(sql)
    return result
}

actHiProcinstRepo.getProductDeveloper = async (start, end, type, name) => {
    let keys = "'gystplc', 'fttplc', 'sctgtplc', 'zytplc', 'iptpc', 'fantuituipin', 'iptplcxb', 'ziyantuipin', 'gongyingshangtuipin', 'shichangfenxituipin'"
    if (type == '1') keys = "'sctgtplc', 'shichangfenxituipin'"
    else if (type == '2') keys = "'zytplc', 'ziyantuipin'"
    else if (type == '3') keys = "'iptpc', 'iptplcxb'"
    else if (type == '4') keys = "'fttplc', 'fantuituipin'"
    else if (type == '5') keys = "'gystplc', 'gongyingshangtuipin'"
    let sql = `SELECT COUNT(1) AS count FROM ACT_HI_PROCINST p LEFT JOIN ACT_RE_PROCDEF d ON p.PROC_DEF_ID_ = d.ID_
        LEFT JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v.NAME_ IN (
                'Cfidbw9ff40k6', 
                'Cfidaq7mz3963', 
                'Cfidcvooh9jnf', 
                'Cfidvu2osk3k9', 
                'Cfidzncsybu0e', 
                'Cfid1wglixgnx'
            ) AND v.LAST_UPDATED_TIME_ = (
                SELECT MAX(v1.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST v1 
                WHERE v1.PROC_INST_ID_ = p.PROC_INST_ID_ AND v1.NAME_ = v.NAME_ 
            ) AND IF(v.NAME_ = 'Cfidcvooh9jnf', EXISTS(
				SELECT t.ID_ FROM ACT_HI_TASKINST t WHERE t.PROC_INST_ID_ = p.PROC_INST_ID_ 
					AND t.NAME_ LIKE '%反推承接人1%' AND t.START_TIME_ BETWEEN '${start}' AND '${end}' 
                    AND t.START_TIME_ = (
                        SELECT MAX(tt.START_TIME_) FROM ACT_HI_TASKINST tt 
                        WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ AND tt.NAME_ = t.NAME_)), 
                IF(v.NAME_ = 'Cfidvu2osk3k9', EXISTS(
				    SELECT t.ID_ FROM ACT_HI_TASKINST t WHERE t.PROC_INST_ID_ = p.PROC_INST_ID_ 
					    AND t.NAME_ LIKE '%反推承接人2%' AND t.START_TIME_ BETWEEN '${start}' AND '${end}'
                        AND t.START_TIME_ = (
                            SELECT MAX(tt.START_TIME_) FROM ACT_HI_TASKINST tt 
                            WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ AND tt.NAME_ = t.NAME_)), 
                    IF(v.NAME_ = 'Cfidzncsybu0e', EXISTS(
				        SELECT t.ID_ FROM ACT_HI_TASKINST t WHERE t.PROC_INST_ID_ = p.PROC_INST_ID_ 
					        AND t.NAME_ LIKE '%反推承接人3%' AND t.START_TIME_ BETWEEN '${start}' AND '${end}'
                            AND t.START_TIME_ = (
                                SELECT MAX(tt.START_TIME_) FROM ACT_HI_TASKINST tt 
                                WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ AND tt.NAME_ = t.NAME_)), 
                        IF(v.NAME_ = 'Cfid1wglixgnx', EXISTS(
				            SELECT t.ID_ FROM ACT_HI_TASKINST t WHERE t.PROC_INST_ID_ = p.PROC_INST_ID_ 
					            AND t.NAME_ LIKE '%反推承接人4%' AND t.START_TIME_ BETWEEN '${start}' AND '${end}'
                                AND t.START_TIME_ = (
                                    SELECT MAX(tt.START_TIME_) FROM ACT_HI_TASKINST tt 
                                    WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ AND tt.NAME_ = t.NAME_)), 1))))
        WHERE d.KEY_ IN (${keys}) AND IF(d.KEY_ IN ('fttplc', 'fantuituipin'), v.TEXT_ IS NOT NULL, 
				IF(d.KEY_ IN ('gystplc', 'sctgtplc', 'gongyingshangtuipin', 'shichangfenxituipin'), v.TEXT_ IS NOT NULL, 1) 
                AND p.START_TIME_ BETWEEN '${start}' AND '${end}') AND d.CATEGORY_ != 'ceshi'
			AND (SELECT u.nickname FROM system_users u 
                WHERE u.id = IF(v.TEXT_ IS NOT NULL, v.TEXT_, p.START_USER_ID_)) = '${name}'`
    let result = await query(sql)
    return result
}

actHiProcinstRepo.getAdviseInfo = async (start, end) => {
    const sql = `SELECT DATE_FORMAT(p.START_TIME_, '%Y-%m-%d') AS time, u.nickname AS adviser, 
            (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                WHEN u.nickname = '刘海涛' THEN '事业一部' 
                WHEN u.nickname = '王洪彬' THEN '事业三部' 
                WHEN u.nickname = '郑艳艳' THEN '企划部' 
                WHEN u.nickname = '鲁红旺' THEN '货品部' 
                WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' OR dp.name LIKE '%小红书%' THEN '事业三部' 
                WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                    OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' THEN '事业一部' 
                WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部'
                WHEN dp.name LIKE '%采购%' OR dp.name LIKE '%物流%' OR dp.name LIKE '%库房%' 
                    OR dp.name LIKE '%品控%' THEN '货品部'
                WHEN dp.name LIKE '%客服%' THEN '客服部' 
                WHEN dp.name LIKE '%摄影%' OR dp.name LIKE '%视觉%' OR dp.name LIKE '%设计%' THEN '视觉部' 
                WHEN dp.name LIKE '%人事%' THEN '人事部' 
                WHEN dp.name LIKE '%数据%' THEN '数据中台' ELSE '未拉取到部门' END) AS adviser_dept, 
            u1.nickname AS solver, u2.nickname AS director, 
            (CASE WHEN v1.TEXT_ IN ('天猫', '小红书', '淘工厂-国货严选', '天猫垂类店', '天猫中台') THEN '事业三部'
                WHEN v1.TEXT_ IN ('拼多多', '天猫超市', 'Coupang') THEN '事业一部' 
                WHEN v1.TEXT_ IN ('京东', '唯品会', '得物', '抖音快手', '1688') THEN '事业二部' 
                WHEN v1.TEXT_ = '开发' THEN '企划部' 
                WHEN v1.TEXT_ IN ('采购', '库房', '品控') THEN '货品部' 
                WHEN v1.TEXT_ = '客服' THEN '客服部' 
                WHEN v1.TEXT_ = '人事' THEN '人事部' 
                WHEN v1.TEXT_ = '数据中台' THEN '数据中台' 
                WHEN v1.TEXT_ = '视觉' THEN '视觉部' ELSE '其他' end) AS solver_dept, 
            v3.TEXT_ AS problem, v4.TEXT_ AS detail 
        FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON p.PROC_DEF_ID_ = d.ID_
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v.NAME_ = 'PROCESS_STATUS'
            AND v.TEXT_ NOT IN ('-1', '4')
        JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v1.NAME_ = 'F0w0m99bi3h6abc'
        JOIN ACT_HI_VARINST v2 ON v2.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v2.NAME_ = 'F9uym9c732e1abc'
        JOIN ACT_HI_VARINST v3 ON v3.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v3.NAME_ = 'Fkuym99bs5byagc'
        JOIN ACT_HI_VARINST v4 ON v4.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v4.NAME_ = 'F944m99bui80apc'
        JOIN ACT_HI_VARINST v5 ON v5.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v5.NAME_ = 'Cfiddehtmhesb'
        JOIN system_users u ON u.id = p.START_USER_ID_
        JOIN system_dept dp ON u.dept_id = dp.id
        JOIN system_users u1 ON u1.id = v2.TEXT_
        JOIN system_users u2 ON u2.id = v5.TEXT_
        WHERE d.KEY_ = 'yijianxiang' AND p.START_TIME_ BETWEEN ? AND ?`
    const result = await query(sql, [start, end])
    return result
}

actHiProcinstRepo.getJDLinkOptimization = async() =>{
    let sql = `select v2.TEXT_ as code ,b.BYTES_ as questionType from ACT_HI_PROCINST as p
        LEFT JOIN ACT_RE_PROCDEF as d
        on p.PROC_DEF_ID_ = d.ID_ 
        left join ACT_HI_VARINST v1 
        on v1.PROC_INST_ID_ = p.PROC_INST_ID_ AND v1.NAME_ ='checkboxField_m11r277t'
        left join ACT_HI_VARINST v2
        on v2.PROC_INST_ID_ = p.PROC_INST_ID_ AND v2.NAME_ ='textField_lma827od'
		left join ACT_HI_VARINST v3
        on v3.PROC_INST_ID_ = p.PROC_INST_ID_ AND v3.NAME_ ='PROCESS_STATUS'
        join ACT_GE_BYTEARRAY b on b.ID_ = v1.BYTEARRAY_ID_ 
        WHERE d.KEY_ ='form-42' and p.START_TIME_ >= DATE_SUB(DATE(NOW()),INTERVAL 3 day) and v3.TEXT_ != "4"`
    let result = await query(sql)
    return result
}

actHiProcinstRepo.checkOptimize = async (goods_id, title, days) => {
    const sql = `SELECT p.PROC_INST_ID_ FROM ACT_HI_PROCINST p 
        JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v.NAME_ = 'multiSelectField_lwufb7oy' 
            AND v.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ AND vv.NAME_ = v.NAME_ 
            )
        JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v1.NAME_ = 'textField_liihs7kw' 
            AND v1.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ AND vv.NAME_ = v1.NAME_ 
            )
        JOIN ACT_HI_VARINST v2 ON v2.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v2.NAME_ = 'PROCESS_STATUS' 
            AND v2.TEXT_ IN ('1', '2') 
        WHERE d.KEY_ = 'form-86' 
            AND (DATE_SUB(NOW(), INTERVAL ${days} DAY) < (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_
            ) OR v2.TEXT_ = '1') AND v.TEXT_ = '${title}' AND v1.TEXT_ = '${goods_id}' LIMIT 1`
    const result = await query(sql)
    return result || []
}

module.exports = actHiProcinstRepo