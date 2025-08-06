const { query } = require('../../model/bpmDbConn')
const actHiProcinstRepo = {}

actHiProcinstRepo.getRunning = async (start, end) => {
    let sql = `SELECT p.START_TIME_ AS create_time, p.NAME_ AS title,  
            CONCAT('http://bpm.pakchoice.cn:8848/bpm/process-instance/detail\?id=', p.ID_) AS link,
            t.NAME_ AS node, u.nickname AS operator, u1.nickname, 
            (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                WHEN u.nickname = '刘海涛' THEN '事业一部' 
                WHEN u.nickname = '王洪彬' THEN '事业三部' 
                WHEN u.nickname = '郑艳艳' THEN '企划部' 
                WHEN u.nickname = '鲁红旺' THEN '货品部' 
                WHEN u.nickname = '杨利强' THEN '货品部' 
                WHEN u.nickname IN ('郑河', '崔竹') THEN '管理中台' 
                WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' OR dp.name LIKE '%小红书%' THEN '事业三部' 
                WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' THEN '事业一部' 
                WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部' 
                WHEN dp.name LIKE '%采购%' OR dp.name LIKE '%物流%' OR dp.name LIKE '%库房%' OR dp.name LIKE '%品控%' THEN '货品部' 
                WHEN dp.name LIKE '%客服%' THEN '客服部' 
                WHEN dp.name LIKE '%摄影%' OR dp.name LIKE '%视觉%' OR dp.name LIKE '%设计%' THEN '视觉部' 
                WHEN dp.name LIKE '%人事%' THEN '人事部' 
                WHEN dp.name LIKE '%数据%' THEN '数据中台' 
                WHEN dp.name LIKE '%财务%' THEN '财务部' ELSE '未拉取到部门' END) AS dept, 
            IFNULL(u2.nickname, IF(d.KEY_ IN ('fttplc', 'fantuituipin'), '', u1.nickname)) AS developer, 
            CASE WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                ELSE '反推推品' END AS type, t.START_TIME_ AS start_time, 
            IFNULL(v2.TEXT_, '') AS task_reason, '审批中' AS task_status, IFNULL(v3.TEXT_, '') AS platform, 
            DATEDIFF(NOW(), t.START_TIME_) AS due_date 
        FROM ACT_HI_PROCINST p LEFT JOIN ACT_RE_PROCDEF d ON p.PROC_DEF_ID_ = d.ID_ 
        JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND EXISTS(SELECT * FROM ACT_HI_VARINST v WHERE v.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND v.NAME_ = 'TASK_STATUS' AND v.TASK_ID_ = t.ID_ AND v.LONG_ = 1)
        LEFT JOIN system_users u ON u.id = t.ASSIGNEE_ 
        LEFT JOIN system_dept dp ON dp.id = u.dept_id 
        JOIN system_users u1 ON u1.id = p.START_USER_ID_ 
        LEFT JOIN ACT_HI_TASKINST tx ON tx.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND tx.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
            AND IF(tx.END_TIME_ IS NULL, 1, tx.END_TIME_ = (
                SELECT MAX(tt.END_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND tt.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))) 
        LEFT JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v1.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
            AND v1.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND vv.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963'))         
        LEFT JOIN ACT_HI_VARINST v3 ON v3.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v3.NAME_ = 'Fj1ama2csbpoabc' 
            AND v3.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ AND vv.NAME_ = v3.NAME_) 
        LEFT JOIN system_users u2 ON u2.id = IFNULL(tx.ASSIGNEE_, v1.TEXT_) 
        LEFT JOIN ACT_HI_VARINST v2 ON v2.PROC_INST_ID_ = p.PROC_INST_ID_ AND v2.TASK_ID_ = t.ID_ 
            AND v2.NAME_ = 'TASK_REASON' AND v2.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ AND vv.TASK_ID_ = t.ID_ AND vv.NAME_ = v2.NAME_)
        WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin', 
            'iptplc', 'iptplcxb', 
            'zytplc', 'ziyantuipin', 
            'gystplc', 'gongyingshangtuipin', 
            'fttplc', 'fantuituipin') 
            AND p.START_TIME_ BETWEEN "${start}" AND "${end}" 
            AND d.CATEGORY_ != 'ceshi'`
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
        JOIN system_users u ON u.id = t.ASSIGNEE_ AND u.nickname IN ("${userNames}") 
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
        LEFT JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_
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
			AND v1.NAME_ IN ('Fxfrma3j75fse7c', 'Ffwtma3nntxjn9c', 'Fnixma3nox6onmc', 'Fwtjma3np5o0nuc', 
            'Fy6xma3jakboekc', 'Flp9mbuigrxjqsc', 'Fexembuihiymqvc', 'F8y4mbuii8dtqyc')
            AND (v1.TEXT_ = '选中' OR v1.TEXT_ = '是') 
            AND v1.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND (vv.TEXT_ = '选中' OR v1.TEXT_ = '是') 
                AND vv.NAME_ IN ('Fxfrma3j75fse7c', 'Ffwtma3nntxjn9c', 'Fnixma3nox6onmc', 'Fwtjma3np5o0nuc', 
                'Fy6xma3jakboekc', 'Flp9mbuigrxjqsc', 'Fexembuihiymqvc', 'F8y4mbuii8dtqyc') 
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
        JOIN system_users u ON u.id = p.START_USER_ID_ AND u.nickname IN ("${userNames}") 
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
		JOIN system_users u ON u.id = p.START_USER_ID_ 
        JOIN system_dept du ON du.id = u.dept_id 
        LEFT JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_
			AND v1.NAME_ IN ('Fmtama25a3lrcwc', 'Fkyuma25az2ud8c', 'Fiaama25b6zidec')
            AND v1.TEXT_ = '选中'
            AND v1.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND vv.TEXT_ = '选中' 
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
        JOIN system_users u ON u.id = v1.TEXT_ AND u.nickname IN ("${userNames}") 
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
                AND vv.TEXT_ = '是'
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
        JOIN system_users u ON u.id = v1.TEXT_ AND u.nickname IN ("${userNames}") 
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
                AND vv.TEXT_ = '是'
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
        JOIN system_users u ON u.id = p.START_USER_ID_ AND u.nickname IN ("${userNames}") 
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
                AND v2.TEXT_ = '是'
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
                'Fmtama25a3lrcwc', 'Fkyuma25az2ud8c', 'Fiaama25b6zidec', 
                'Fxfrma3j75fse7c', 'Ffwtma3nntxjn9c', 'Fnixma3nox6onmc', 'Fwtjma3np5o0nuc', 
                'Fy6xma3jakboekc', 'Flp9mbuigrxjqsc', 'Fexembuihiymqvc', 'F8y4mbuii8dtqyc')
            AND (v1.TEXT_ = '是' OR v1.TEXT_ = '选中')
            AND v1.LAST_UPDATED_TIME_ = (
                SELECT MAX(v2.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST v2 
                WHERE v2.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND (v2.TEXT_ = '是' OR v2.TEXT_ = '选中')
                AND v2.NAME_ IN ('Fzmjma3pe3tnclc', 'F2lmma3petqpcwc', 'F34mma3pf0egd0c', 
                    'Fmtama25a3lrcwc', 'Fkyuma25az2ud8c', 'Fiaama25b6zidec', 
                    'Fxfrma3j75fse7c', 'Ffwtma3nntxjn9c', 'Fnixma3nox6onmc', 'Fwtjma3np5o0nuc', 
                    'Fy6xma3jakboekc', 'Flp9mbuigrxjqsc', 'Fexembuihiymqvc', 'F8y4mbuii8dtqyc') 
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

actHiProcinstRepo.getInfoByDateAndType = async (type, start, end) => {
    let keys = ''
    switch (type) {
        case '1':
            keys = "'sctgtplc', 'shichangfenxituipin'"
            break
        case '2':
            keys = "'zytplc', 'ziyantuipin'"
            break
        case '3':
            keys = "'iptplc', 'iptplcxb'"
            break
        case '4':
            keys = "'fttplc', 'fantuituipin'"
            break
        case '5':
            keys = "'gystplc', 'gongyingshangtuipin'"
            break
        default:
            return []
    }
    const sql = `SELECT b.BYTES_ AS info 
        FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
		LEFT JOIN ACT_HI_VARINST v3 ON v3.PROC_INST_ID_ = p.PROC_INST_ID_
			AND v3.NAME_ IN ('F6gkma3pfcjfd1c', 'Fcilma2exazkb7c', 'Fig2ma24zzz9brc')
            AND v3.LAST_UPDATED_TIME_ = (
				SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.NAME_ = v3.NAME_ AND vv.PROC_INST_ID_ = p.PROC_INST_ID_
            )
		LEFT JOIN ACT_GE_BYTEARRAY b ON b.ID_ = v3.BYTEARRAY_ID_ 
        WHERE d.KEY_ IN (${keys}) 
            AND p.START_TIME_ BETWEEN ? AND ?`
    const result = await query(sql, [start, end])
    return result
}

actHiProcinstRepo.getCreateInfo = async (start, end) => {
    const sql = `SELECT IFNULL(u1.nickname, u.nickname) AS director, COUNT(1) AS count 
        FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_         
		JOIN system_users u ON u.id = p.START_USER_ID_ 
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v.NAME_ = 'PROCESS_STATUS'
            AND v.TEXT_ NOT IN ('-1', '4')
        LEFT JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v1.NAME_ IN ('Cfidaq7mz3963', 'Cfidbw9ff40k6') 
            AND v1.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND vv.NAME_ IN ('Cfidaq7mz3963', 'Cfidbw9ff40k6') 
            )
		LEFT JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_
            AND t.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到')
            AND IF(t.END_TIME_ IS NULL, 1, t.END_TIME_ = (
                SELECT MAX(t1.END_TIME_) FROM ACT_HI_TASKINST t1 WHERE t1.PROC_INST_ID_ = p.PROC_INST_ID_
                    AND t1.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到')
            ))
        LEFT JOIN system_users u1 ON (u1.id = v1.TEXT_ OR u1.id = t.ASSIGNEE_)
        WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin', 'iptplc', 'iptplcxb', 
            'zytplc', 'ziyantuipin', 'gystplc', 'gongyingshangtuipin', 'fttplc', 'fantuituipin') 
            AND p.START_TIME_ BETWEEN ? AND ? 
		GROUP by IFNULL(u1.nickname, u.nickname)`
    const result = await query(sql, [start, end])
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
        JOIN system_users u ON u.id = t.ASSIGNEE_ AND u.nickname IN ("${userNames}") 
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
        JOIN system_users u ON u.id = p.START_USER_ID_ AND u.nickname IN ("${userNames}") 
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
        JOIN system_users u ON u.id = v1.TEXT_ AND u.nickname IN ("${userNames}") 
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
        JOIN system_users u ON u.id = v1.TEXT_ AND u.nickname IN ("${userNames}") 
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
        JOIN system_users u ON u.id = p.START_USER_ID_ AND u.nickname IN ("${userNames}") 
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
        JOIN ACT_HI_TASKINST ON t.PROC_INST_ID_ = p.PROC_INST_ID_
            AND t.NAME_ IN ('分配采购执行人', '分配采购执行人1', '分配采购执行人2', '分配采购执行人3') 
            AND t.STATE_ = 'completed' 
            AND t.LAST_UPDATED_TIME_ = (
                SELECT MAX(t1.LAST_UPDATED_TIME_) FROM ACT_HI_TASKINST t1 
                WHERE t1.PROC_INST_ID_ = p.PROC_INST_ID_ AND t1.NAME_ = t.NAME_ AND t.ASSIGNEE_ IS NOT NULL 
            ) AND t.LAST_UPDATED_TIME_ BETWEEN '${start}' AND '${end}'
        JOIN ACT_HI_TASKINST t2 ON t2.PROC_INST_ID_ = p.PROC_INST_ID_
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
        JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_
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
                WHEN dp.name LIKE '%数据%' THEN '数据中台' 
                WHEN dp.name LIKE '%财务%' THEN '财务部' ELSE '未拉取到部门' END) AS adviser_dept, 
            u1.nickname AS solver, u2.nickname AS director, 
            (CASE WHEN v1.TEXT_ IN ('天猫', '小红书', '淘工厂-国货严选', '天猫垂类店', '天猫中台') THEN '事业三部'
                WHEN v1.TEXT_ IN ('拼多多', '天猫超市', 'Coupang') THEN '事业一部' 
                WHEN v1.TEXT_ IN ('京东', '唯品会', '得物', '抖音快手', '1688') THEN '事业二部' 
                WHEN v1.TEXT_ = '开发' THEN '企划部' 
                WHEN v1.TEXT_ IN ('采购', '库房', '品控') THEN '货品部' 
                WHEN v1.TEXT_ = '客服' THEN '客服部' 
                WHEN v1.TEXT_ = '人事' THEN '人事部' 
                WHEN v1.TEXT_ = '数据中台' THEN '数据中台' 
                WHEN v1.TEXT_ = '视觉' THEN '视觉部' 
                WHEN v1.TEXT_ = '财务' THEN '财务部' ELSE '其他' end) AS solver_dept, 
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
        LEFT JOIN ACT_HI_VARINST v5 ON v5.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v5.NAME_ = 'Cfiddehtmhesb'
        JOIN system_users u ON u.id = p.START_USER_ID_
        JOIN system_dept dp ON u.dept_id = dp.id
        JOIN system_users u1 ON u1.id = v2.TEXT_
        LEFT JOIN system_users u2 ON u2.id = v5.TEXT_
        WHERE d.KEY_ = 'yijianxiang' AND p.START_TIME_ BETWEEN ? AND ?`
    let result = await query(sql, [start, end])
    for (let i = 0; i < result?.length; i++) {
        if (!result[i].director) {
            switch (result[i].solver_dept) {
                case '事业一部':
                    result[i].director = '刘海涛'
                    break
                case '事业二部':
                    result[i].director = '陆瑶'
                    break
                case '事业三部':
                    result[i].director = '王洪彬'
                    break
                case '企划部':
                    result[i].director = '郑艳艳'
                    break
                case '货品部':
                    result[i].director = '鲁红旺'
                    break
                case '客服部':
                    result[i].director = '郑友'
                    break
                case '视觉部':
                    result[i].director = '黄成'
                    break
                case '人事部':
                    result[i].director = '叶依梦'
                    break
                case '数据中台':
                    result[i].director = '林超超'
                    break
                case '财务部':
                    result[i].director = '高昂'
                    break
                default:
                    result[i].director = ''
            }
        }
    }
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

//推品全流程抓取节点信息
actHiProcinstRepo.getProcessNodeCount = async (typeList, start, end) => {
    let sql = '', params = [], result = [] 
    for (let i = 0; i < typeList.length; i++) {
        switch (typeList[i]) {
            case 'total': 
                sql = `${sql}
                    SELECT COUNT(p.PROC_INST_ID_) AS count, 'total' AS type, 
                        (CASE WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                            WHEN u.nickname = '刘海涛' THEN '事业一部' 
                            WHEN u.nickname = '王洪彬' THEN '事业三部' 
                            WHEN u.nickname = '郑艳艳' THEN '企划部' 
                            WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' 
                                OR dp.name LIKE '%小红书%' THEN '事业三部' 
                            WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                                OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                            WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(u1.nickname, IF(d.KEY_ IN ('fttplc', 'fantuituipin'), '', u.nickname)) AS developer 
                    FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
                    JOIN system_users u ON u.id = p.START_USER_ID_ 
                    JOIN system_dept dp ON dp.id = u.dept_id 
                    LEFT JOIN ACT_HI_TASKINST tx ON tx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND tx.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND IF(tx.END_TIME_ IS NULL, 1, tx.END_TIME_ = (
                            SELECT MAX(tt.END_TIME_) FROM ACT_HI_TASKINST tt 
                            WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND tt.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))) 
                    LEFT JOIN ACT_HI_VARINST vx ON vx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND vx.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                        AND vx.LAST_UPDATED_TIME_ = (
                            SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                            WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND vv.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963')) 
                    LEFT JOIN system_users u1 ON u1.id = IFNULL(tx.ASSIGNEE_, vx.TEXT_) 
                    WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND p.START_TIME_ BETWEEN "${start}" AND "${end}" AND d.CATEGORY_ != 'ceshi'
                    GROUP BY u1.nickname, u.nickname, d.KEY_, dp.name  
                    UNION ALL`
                break
            case 'choose':                
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.PROC_INST_ID_) AS count, 'choose' AS type, 
                        (CASE WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                            WHEN u.nickname = '刘海涛' THEN '事业一部' 
                            WHEN u.nickname = '王洪彬' THEN '事业三部' 
                            WHEN u.nickname = '郑艳艳' THEN '企划部' 
                            WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' 
                                OR dp.name LIKE '%小红书%' THEN '事业三部' 
                            WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                                OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                            WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(u1.nickname, IF(d.KEY_ IN ('fttplc', 'fantuituipin'), '', u.nickname)) AS developer 
                    FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
                    JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_
	                    AND v.NAME_ IN (
                            'Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 
                            'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 
                            'Fy6xma3jakboekc', 'F2lmma3petqpcwc', 
                            'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 
                            'Fnixma3nox6onmc', 'F34mma3pf0egd0c', 
                            'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc')
                        AND v.TEXT_ IN ('是', '选中') 
                    JOIN system_users u ON u.id = p.START_USER_ID_ 
                    JOIN system_dept dp ON dp.id = u.dept_id 
                    LEFT JOIN ACT_HI_TASKINST tx ON tx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND tx.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND IF(tx.END_TIME_ IS NULL, 1, tx.END_TIME_ = (
                            SELECT MAX(tt.END_TIME_) FROM ACT_HI_TASKINST tt 
                            WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND tt.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))) 
                    LEFT JOIN ACT_HI_VARINST vx ON vx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND vx.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                        AND vx.LAST_UPDATED_TIME_ = (
                            SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                            WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND vv.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963')) 
                    LEFT JOIN system_users u1 ON u1.id = IFNULL(tx.ASSIGNEE_, vx.TEXT_) 
                    WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND p.START_TIME_ BETWEEN "${start}" AND "${end}" AND d.CATEGORY_ != 'ceshi'
                    GROUP BY u1.nickname, u.nickname, d.KEY_, dp.name  
                    UNION ALL`
                break
            case 'reject':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.PROC_INST_ID_) AS count, 'reject' AS type, 
                        (CASE WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                            WHEN u.nickname = '刘海涛' THEN '事业一部' 
                            WHEN u.nickname = '王洪彬' THEN '事业三部' 
                            WHEN u.nickname = '郑艳艳' THEN '企划部' 
                            WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' 
                                OR dp.name LIKE '%小红书%' THEN '事业三部' 
                            WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                                OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                            WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(u1.nickname, IF(d.KEY_ IN ('fttplc', 'fantuituipin'), '', u.nickname)) AS developer 
                    FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
                    JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_ 
	                    AND v.NAME_ = 'PROCESS_STATUS' AND v.LONG_ IN (3, 4) 
                    JOIN system_users u ON u.id = p.START_USER_ID_ 
                    JOIN system_dept dp ON dp.id = u.dept_id 
                    LEFT JOIN ACT_HI_TASKINST tx ON tx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND tx.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND IF(tx.END_TIME_ IS NULL, 1, tx.END_TIME_ = (
                            SELECT MAX(tt.END_TIME_) FROM ACT_HI_TASKINST tt 
                            WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND tt.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))) 
                    LEFT JOIN ACT_HI_VARINST vx ON vx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND vx.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                        AND vx.LAST_UPDATED_TIME_ = (
                            SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                            WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND vv.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963')) 
                    LEFT JOIN system_users u1 ON u1.id = IFNULL(tx.ASSIGNEE_, vx.TEXT_) 
                    WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND p.START_TIME_ BETWEEN "${start}" AND "${end}" AND d.CATEGORY_ != 'ceshi'
                    GROUP BY u1.nickname, u.nickname, d.KEY_, dp.name  
                    UNION ALL`
                break
            case 'select':
                sql = `${sql}
                    SELECT COUNT(1) AS count, 'select' AS type, 
                        (CASE WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                            WHEN u.nickname = '刘海涛' THEN '事业一部' 
                            WHEN u.nickname = '王洪彬' THEN '事业三部' 
                            WHEN u.nickname = '郑艳艳' THEN '企划部' 
                            WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' 
                                OR dp.name LIKE '%小红书%' THEN '事业三部' 
                            WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                                OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                            WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(u1.nickname, IF(d.KEY_ IN ('fttplc', 'fantuituipin'), '', u.nickname)) AS developer 
                    FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_  
                    JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND v.NAME_ = 'PROCESS_STATUS' AND v.LONG_ = 1 
                        AND v.LAST_UPDATED_TIME_ = (
                            SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                            WHERE vv.PROC_INST_ID_ = v.PROC_INST_ID_ AND vv.NAME_ = v.NAME_)
                    LEFT JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_ 
	                    AND t.NAME_ IN (
                            '建立聚水潭信息并填写商品编码', '建立聚水潭信息并填写商品编码1', 
                            '建立聚水潭信息并填写商品编码2', '开发建立聚水潭信息填写预计销量表子表单', 
                            '聚水潭建立商品信息并填写商品编码')
                    JOIN system_users u ON u.id = p.START_USER_ID_ 
                    JOIN system_dept dp ON dp.id = u.dept_id 
                    LEFT JOIN ACT_HI_TASKINST tx ON tx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND tx.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND IF(tx.END_TIME_ IS NULL, 1, tx.END_TIME_ = (
                            SELECT MAX(tt.END_TIME_) FROM ACT_HI_TASKINST tt 
                            WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND tt.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))) 
                    LEFT JOIN ACT_HI_VARINST vx ON vx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND vx.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                        AND vx.LAST_UPDATED_TIME_ = (
                            SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                            WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND vv.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963')) 
                    LEFT JOIN system_users u1 ON u1.id = IFNULL(tx.ASSIGNEE_, vx.TEXT_) 
                    WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 	                    
	                    AND t.ID_ IS NULL AND p.START_TIME_ BETWEEN "${start}" AND "${end}" 
                        AND d.CATEGORY_ != 'ceshi'
                    GROUP BY u1.nickname, u.nickname, d.KEY_, dp.name  
                    UNION ALL`
                break
            case 'ip_review':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.PROC_INST_ID_) AS count, 'ip_review' AS type, 
                        (CASE WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                            WHEN u.nickname = '刘海涛' THEN '事业一部' 
                            WHEN u.nickname = '王洪彬' THEN '事业三部' 
                            WHEN u.nickname = '郑艳艳' THEN '企划部' 
                            WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' 
                                OR dp.name LIKE '%小红书%' THEN '事业三部' 
                            WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                                OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                            WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(u1.nickname, IF(d.KEY_ IN ('fttplc', 'fantuituipin'), '', u.nickname)) AS developer 
                    FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
                    JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_ 
	                    AND t.STATE_ = 'created' 
	                    AND t.NAME_ IN ('IP设计监修', '设计监修通过并上传链图云')
                    JOIN system_users u ON u.id = p.START_USER_ID_ 
                    JOIN system_dept dp ON dp.id = u.dept_id  
                    LEFT JOIN ACT_HI_VARINST vx ON vx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND vx.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                        AND vx.LAST_UPDATED_TIME_ = (
                            SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                            WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND vv.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963')) 
                    LEFT JOIN system_users u1 ON u1.id = vx.TEXT_ 
                    WHERE d.KEY_ IN ('iptplc', 'iptplcxb') 
	                    AND p.START_TIME_ BETWEEN "${start}" AND "${end}" AND d.CATEGORY_ != 'ceshi'
                    GROUP BY u1.nickname, u.nickname, d.KEY_, dp.name  
                    UNION ALL`
                break
            case 'ip_design':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.PROC_INST_ID_) AS count, 'ip_design' AS type, 
                        (CASE WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                            WHEN u.nickname = '刘海涛' THEN '事业一部' 
                            WHEN u.nickname = '王洪彬' THEN '事业三部' 
                            WHEN u.nickname = '郑艳艳' THEN '企划部' 
                            WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' 
                                OR dp.name LIKE '%小红书%' THEN '事业三部' 
                            WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                                OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                            WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(u1.nickname, IF(d.KEY_ IN ('fttplc', 'fantuituipin'), '', u.nickname)) AS developer 
                    FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
                    JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_ 
	                    AND t.STATE_ = 'created' 
	                    AND t.NAME_ IN ('上传设计草图1', '上传设计草图', '北京上传设计草图', '杭州上传设计草图')
                    JOIN system_users u ON u.id = p.START_USER_ID_ 
                    JOIN system_dept dp ON dp.id = u.dept_id 
                    LEFT JOIN ACT_HI_VARINST vx ON vx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND vx.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                        AND vx.LAST_UPDATED_TIME_ = (
                            SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                            WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND vv.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963')) 
                    LEFT JOIN system_users u1 ON u1.id = vx.TEXT_ 
                    WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin') 
	                    AND p.START_TIME_ BETWEEN "${start}" AND "${end}" AND d.CATEGORY_ != 'ceshi'
                    GROUP BY u1.nickname, u.nickname, d.KEY_, dp.name  
                    UNION ALL`
                break
            case 'sample':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.PROC_INST_ID_) AS count, 'sample' AS type, 
                        (CASE WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                            WHEN u.nickname = '刘海涛' THEN '事业一部' 
                            WHEN u.nickname = '王洪彬' THEN '事业三部' 
                            WHEN u.nickname = '郑艳艳' THEN '企划部' 
                            WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' 
                                OR dp.name LIKE '%小红书%' THEN '事业三部' 
                            WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                                OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                            WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(u1.nickname, IF(d.KEY_ IN ('fttplc', 'fantuituipin'), '', u.nickname)) AS developer 
                    FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
                    JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_
                        AND t.STATE_ = 'created' 
                        AND t.NAME_ IN ('工厂打样', '开发工厂打样起始时间2', '开发工厂打样起始时间')
                    JOIN system_users u ON u.id = p.START_USER_ID_ 
                    JOIN system_dept dp ON dp.id = u.dept_id 
                    LEFT JOIN ACT_HI_VARINST vx ON vx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND vx.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                        AND vx.LAST_UPDATED_TIME_ = (
                            SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                            WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND vv.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963')) 
                    LEFT JOIN system_users u1 ON u1.id = vx.TEXT_ 
                    WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin') 
	                    AND p.START_TIME_ BETWEEN "${start}" AND "${end}" AND d.CATEGORY_ != 'ceshi'
                    GROUP BY u1.nickname, u.nickname, d.KEY_, dp.name  
                    UNION ALL`
                break
            case 'preorder':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.PROC_INST_ID_) AS count, 'preorder' AS type, 
                        (CASE WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                            WHEN u.nickname = '刘海涛' THEN '事业一部' 
                            WHEN u.nickname = '王洪彬' THEN '事业三部' 
                            WHEN u.nickname = '郑艳艳' THEN '企划部' 
                            WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' 
                                OR dp.name LIKE '%小红书%' THEN '事业三部' 
                            WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                                OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                            WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(u1.nickname, IF(d.KEY_ IN ('fttplc', 'fantuituipin'), '', u.nickname)) AS developer 
                    FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
                    JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_ 
	                    AND t.STATE_ = 'created'
	                    AND IF(d.KEY_ IN ('iptplc', 'iptplcxb'), 
                            t.NAME_ IN ('事业部1是否订货', '事业部2是否订货', '事业部3是否订货'), 
		                    IF(d.KEY_ IN ('zytplc', 'ziyantuipin'), 
                                t.NAME_ IN ('事业部一是否订货', '事业部二是否订货', '事业部三是否订货'), 
			                    IF(d.KEY_ IN ('sctgtplc', 'shichangfenxituipin'), 
                                    t.NAME_ IN (
                                        '事业部一是否订货1', '事业部一是否订货2', 
                                        '事业部二是否订货1', '事业部二是否订货2', 
                                        '事业部三是否订货1', '事业部三是否订货2'), 
				                    IF(d.KEY_ IN ('gystplc', 'gongyingshangtuipin'), 
                                        t.NAME_ IN (
                                            '事业部一填写预计订货量', 
                                            '事业部二填写预计订货量', 
                                            '事业部三填写预计订货量'), 
					                    t.NAME_ IN (
                                            '事业部一填写订货量', '事业部一是否加单', 
                                            '事业部二填写订货量', '事业部二是否加单', 
                                            '事业部三填写订货量', '事业部三是否加单'))))) 
                    JOIN system_users u ON u.id = p.START_USER_ID_ 
                    JOIN system_dept dp ON dp.id = u.dept_id 
                    LEFT JOIN ACT_HI_TASKINST tx ON tx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND tx.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND IF(tx.END_TIME_ IS NULL, 1, tx.END_TIME_ = (
                            SELECT MAX(tt.END_TIME_) FROM ACT_HI_TASKINST tt 
                            WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND tt.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))) 
                    LEFT JOIN ACT_HI_VARINST vx ON vx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND vx.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                        AND vx.LAST_UPDATED_TIME_ = (
                            SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                            WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND vv.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963')) 
                    LEFT JOIN system_users u1 ON u1.id = IFNULL(tx.ASSIGNEE_, vx.TEXT_) 
                    WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND p.START_TIME_ BETWEEN "${start}" AND "${end}" AND d.CATEGORY_ != 'ceshi'
                    GROUP BY u1.nickname, u.nickname, d.KEY_, dp.name  
                    UNION ALL`
                break
            case 'order':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.PROC_INST_ID_) AS count, 'order' AS type, 
                        (CASE WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                            WHEN u.nickname = '刘海涛' THEN '事业一部' 
                            WHEN u.nickname = '王洪彬' THEN '事业三部' 
                            WHEN u.nickname = '郑艳艳' THEN '企划部' 
                            WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' 
                                OR dp.name LIKE '%小红书%' THEN '事业三部' 
                            WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                                OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                            WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(u1.nickname, IF(d.KEY_ IN ('fttplc', 'fantuituipin'), '', u.nickname)) AS developer 
                    FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
                    JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_ 
	                    AND t.STATE_ = 'created'
	                    AND t.NAME_ IN (
                            '货品汇总并判断订货量', '货品汇总判断订货量', 
                            '货品汇总判断订货量1', '货品汇总判断订货量2', 
                            '货品汇总判断订货量以及分配采购执行人', 
                            '货品汇总并判断订货量以及分配采购执行人', 
                            '货品汇总判断订货量以及分配采购执行人1', '货品汇总判断订货量以及分配采购执行人2')
                    JOIN system_users u ON u.id = p.START_USER_ID_ 
                    JOIN system_dept dp ON dp.id = u.dept_id 
                    LEFT JOIN ACT_HI_TASKINST tx ON tx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND tx.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND IF(tx.END_TIME_ IS NULL, 1, tx.END_TIME_ = (
                            SELECT MAX(tt.END_TIME_) FROM ACT_HI_TASKINST tt 
                            WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND tt.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))) 
                    LEFT JOIN ACT_HI_VARINST vx ON vx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND vx.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                        AND vx.LAST_UPDATED_TIME_ = (
                            SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                            WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND vv.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963')) 
                    LEFT JOIN system_users u1 ON u1.id = IFNULL(tx.ASSIGNEE_, vx.TEXT_) 
                    WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND p.START_TIME_ BETWEEN "${start}" AND "${end}" AND d.CATEGORY_ != 'ceshi'
                    GROUP BY u1.nickname, u.nickname, d.KEY_, dp.name  
                    UNION ALL`
                break
            case 'purchase_order':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.PROC_INST_ID_) AS count, 'purchase_order' AS type, 
                        (CASE WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                            WHEN u.nickname = '刘海涛' THEN '事业一部' 
                            WHEN u.nickname = '王洪彬' THEN '事业三部' 
                            WHEN u.nickname = '郑艳艳' THEN '企划部' 
                            WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' 
                                OR dp.name LIKE '%小红书%' THEN '事业三部' 
                            WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                                OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                            WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(u1.nickname, IF(d.KEY_ IN ('fttplc', 'fantuituipin'), '', u.nickname)) AS developer 
                    FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
                    JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p.PROC_INST_ID_ 
	                    AND t.STATE_ = 'created'
	                    AND t.NAME_ IN (
                            '上传订货合同及填写预计到货时间', 
                            '填写订货合同1', '填写订货合同2', 
                            '填写订货合同' ,'填写合同', '采购执行人签订周转合同')
                    JOIN system_users u ON u.id = p.START_USER_ID_ 
                    JOIN system_dept dp ON dp.id = u.dept_id 
                    LEFT JOIN ACT_HI_TASKINST tx ON tx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND tx.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND IF(tx.END_TIME_ IS NULL, 1, tx.END_TIME_ = (
                            SELECT MAX(tt.END_TIME_) FROM ACT_HI_TASKINST tt 
                            WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND tt.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))) 
                    LEFT JOIN ACT_HI_VARINST vx ON vx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND vx.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                        AND vx.LAST_UPDATED_TIME_ = (
                            SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                            WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND vv.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963')) 
                    LEFT JOIN system_users u1 ON u1.id = IFNULL(tx.ASSIGNEE_, vx.TEXT_) 
                    WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND p.START_TIME_ BETWEEN "${start}" AND "${end}" AND d.CATEGORY_ != 'ceshi'
                    GROUP BY u1.nickname, u.nickname, d.KEY_, dp.name  
                    UNION ALL`
                break
            case 'pre_vision':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.PROC_INST_ID_) AS count, 'pre_vision' AS type, 
                        (CASE WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                            WHEN u.nickname = '刘海涛' THEN '事业一部' 
                            WHEN u.nickname = '王洪彬' THEN '事业三部' 
                            WHEN u.nickname = '郑艳艳' THEN '企划部' 
                            WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' 
                                OR dp.name LIKE '%小红书%' THEN '事业三部' 
                            WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                                OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                            WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(u1.nickname, IF(d.KEY_ IN ('fttplc', 'fantuituipin'), '', u.nickname)) AS developer 
                    FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
                    JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_ 
	                    AND v.NAME_ IN (
                            'Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 
                            'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 
                            'Fy6xma3jakboekc', 'F2lmma3petqpcwc', 
                            'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 
                            'Fnixma3nox6onmc', 'F34mma3pf0egd0c', 
                            'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc')
                        AND v.TEXT_ IN ('是', '选中')
                    LEFT JOIN ACT_HI_VARINST v1 ON v1.NAME_ IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc')
	                    AND v1.TEXT_ = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.PROC_INST_ID_)
                        AND EXISTS(
                            SELECT * FROM ACT_HI_PROCINST p1 LEFT JOIN ACT_RE_PROCDEF d1 
                                ON d1.ID_ = p1.PROC_DEF_ID_ AND d1.KEY_ IN ('xbsjlc', 'form-110')
                            WHERE p1.PROC_INST_ID_ = v1.PROC_INST_ID_)
                    JOIN system_users u ON u.id = p.START_USER_ID_ 
                    JOIN system_dept dp ON dp.id = u.dept_id 
                    LEFT JOIN ACT_HI_TASKINST tx ON tx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND tx.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND IF(tx.END_TIME_ IS NULL, 1, tx.END_TIME_ = (
                            SELECT MAX(tt.END_TIME_) FROM ACT_HI_TASKINST tt 
                            WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND tt.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))) 
                    LEFT JOIN ACT_HI_VARINST vx ON vx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND vx.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                        AND vx.LAST_UPDATED_TIME_ = (
                            SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                            WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND vv.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963')) 
                    LEFT JOIN system_users u1 ON u1.id = IFNULL(tx.ASSIGNEE_, vx.TEXT_) 
                    WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND v1.ID_ IS NULL AND p.START_TIME_ BETWEEN "${start}" AND "${end}" 
                        AND d.CATEGORY_ != 'ceshi'
                    GROUP BY u1.nickname, u.nickname, d.KEY_, dp.name  
                    UNION ALL`
                break
            case 'vision_running':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.PROC_INST_ID_) AS count, 'vision_running' AS type, 
                        (CASE WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                            WHEN u.nickname = '刘海涛' THEN '事业一部' 
                            WHEN u.nickname = '王洪彬' THEN '事业三部' 
                            WHEN u.nickname = '郑艳艳' THEN '企划部' 
                            WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' 
                                OR dp.name LIKE '%小红书%' THEN '事业三部' 
                            WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                                OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                            WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(u1.nickname, IF(d.KEY_ IN ('fttplc', 'fantuituipin'), '', u.nickname)) AS developer 
                    FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
                    JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_ 
	                    AND v.NAME_ IN (
                            'Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 
                            'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 
                            'Fy6xma3jakboekc', 'F2lmma3petqpcwc', 
                            'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 
                            'Fnixma3nox6onmc', 'F34mma3pf0egd0c', 
                            'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc')
                        AND v.TEXT_ IN ('是', '选中') 
                    JOIN system_users u ON u.id = p.START_USER_ID_ 
                    JOIN system_dept dp ON dp.id = u.dept_id 
                    LEFT JOIN ACT_HI_TASKINST tx ON tx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND tx.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND IF(tx.END_TIME_ IS NULL, 1, tx.END_TIME_ = (
                            SELECT MAX(tt.END_TIME_) FROM ACT_HI_TASKINST tt 
                            WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND tt.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))) 
                    LEFT JOIN ACT_HI_VARINST vx ON vx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND vx.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                        AND vx.LAST_UPDATED_TIME_ = (
                            SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                            WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND vv.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963')) 
                    LEFT JOIN system_users u1 ON u1.id = IFNULL(tx.ASSIGNEE_, vx.TEXT_) 
                    WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND p.START_TIME_ BETWEEN "${start}" AND "${end}" 
                        AND d.CATEGORY_ != 'ceshi' 
                        AND NOT EXISTS(SELECT * FROM ACT_HI_VARINST v1 
                            JOIN ACT_HI_VARINST vv ON vv.PROC_INST_ID_ = v1.PROC_INST_ID_ 
                                AND vv.NAME_ = 'PROCESS_STATUS' AND vv.LONG_ = 2
                            WHERE v1.NAME_ IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc') AND v1.TEXT_ = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.PROC_INST_ID_))						
                        AND EXISTS(SELECT * FROM ACT_HI_VARINST v1 
                            JOIN ACT_HI_VARINST vv ON vv.PROC_INST_ID_ = v1.PROC_INST_ID_ 
                                AND vv.NAME_ = 'PROCESS_STATUS' AND vv.LONG_ = 1
                            WHERE v1.NAME_ IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc') AND v1.TEXT_ = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.PROC_INST_ID_))
                    GROUP BY u1.nickname, u.nickname, d.KEY_, dp.name  
                    UNION ALL`
                break
            case 'vision_completed':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.PROC_INST_ID_) AS count, 'vision_completed' AS type, 
                        (CASE WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                            WHEN u.nickname = '刘海涛' THEN '事业一部' 
                            WHEN u.nickname = '王洪彬' THEN '事业三部' 
                            WHEN u.nickname = '郑艳艳' THEN '企划部' 
                            WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' 
                                OR dp.name LIKE '%小红书%' THEN '事业三部' 
                            WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                                OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                            WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(u1.nickname, IF(d.KEY_ IN ('fttplc', 'fantuituipin'), '', u.nickname)) AS developer 
                    FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
                    JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_ 
	                    AND v.NAME_ IN (
                            'Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 
                            'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 
                            'Fy6xma3jakboekc', 'F2lmma3petqpcwc', 
                            'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 
                            'Fnixma3nox6onmc', 'F34mma3pf0egd0c', 
                            'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc')
                        AND v.TEXT_ IN ('是', '选中') 
                    LEFT JOIN ACT_HI_VARINST v1 ON v1.NAME_ IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc')
	                    AND v1.TEXT_ = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.PROC_INST_ID_) 
                        AND v1.LAST_UPDATED_TIME_ = (SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                            WHERE vv.PROC_INST_ID_ = v1.PROC_INST_ID_ 
                                AND vv.NAME_ IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc'))
                    JOIN system_users u ON u.id = p.START_USER_ID_ 
                    JOIN system_dept dp ON dp.id = u.dept_id 
                    LEFT JOIN ACT_HI_TASKINST tx ON tx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND tx.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND IF(tx.END_TIME_ IS NULL, 1, tx.END_TIME_ = (
                            SELECT MAX(tt.END_TIME_) FROM ACT_HI_TASKINST tt 
                            WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND tt.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))) 
                    LEFT JOIN ACT_HI_VARINST vx ON vx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND vx.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                        AND vx.LAST_UPDATED_TIME_ = (
                            SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                            WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND vv.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963')) 
                    LEFT JOIN system_users u1 ON u1.id = IFNULL(tx.ASSIGNEE_, vx.TEXT_) 
                    WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND p.START_TIME_ BETWEEN "${start}" AND "${end}" 
                        AND d.CATEGORY_ != 'ceshi' 
                        AND EXISTS(SELECT * FROM ACT_HI_VARINST v1 
                            JOIN ACT_HI_VARINST vv ON vv.PROC_INST_ID_ = v1.PROC_INST_ID_ 
                                AND vv.NAME_ = 'PROCESS_STATUS' AND vv.LONG_ = 2
                            WHERE v1.NAME_ IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc') AND v1.TEXT_ = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.PROC_INST_ID_)) 
                    GROUP BY u1.nickname, u.nickname, d.KEY_, dp.name  
                    UNION ALL`
                break
            case 'plan_running':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.PROC_INST_ID_) AS count, 'plan_running' AS type, 
                        (CASE WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                            WHEN u.nickname = '刘海涛' THEN '事业一部' 
                            WHEN u.nickname = '王洪彬' THEN '事业三部' 
                            WHEN u.nickname = '郑艳艳' THEN '企划部' 
                            WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' 
                                OR dp.name LIKE '%小红书%' THEN '事业三部' 
                            WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                                OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                            WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(u1.nickname, IF(d.KEY_ IN ('fttplc', 'fantuituipin'), '', u.nickname)) AS developer 
                    FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
                    JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_ 
	                    AND v.NAME_ IN (
                            'Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 
                            'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 
                            'Fy6xma3jakboekc', 'F2lmma3petqpcwc', 
                            'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 
                            'Fnixma3nox6onmc', 'F34mma3pf0egd0c', 
                            'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc')
                        AND v.TEXT_ IN ('是', '选中') 
                    JOIN system_users u ON u.id = p.START_USER_ID_ 
                    JOIN system_dept dp ON dp.id = u.dept_id 
                    LEFT JOIN ACT_HI_TASKINST tx ON tx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND tx.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND IF(tx.END_TIME_ IS NULL, 1, tx.END_TIME_ = (
                            SELECT MAX(tt.END_TIME_) FROM ACT_HI_TASKINST tt 
                            WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND tt.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))) 
                    LEFT JOIN ACT_HI_VARINST vx ON vx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND vx.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                        AND vx.LAST_UPDATED_TIME_ = (
                            SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                            WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND vv.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963')) 
                    LEFT JOIN system_users u1 ON u1.id = IFNULL(tx.ASSIGNEE_, vx.TEXT_) 
                    WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND p.START_TIME_ BETWEEN "${start}" AND "${end}" 
                        AND d.CATEGORY_ != 'ceshi' 
                        AND NOT EXISTS(SELECT * FROM ACT_HI_VARINST v1 
                            JOIN ACT_HI_VARINST vv ON vv.PROC_INST_ID_ = v1.PROC_INST_ID_ 
                                AND vv.NAME_ = 'PROCESS_STATUS' AND vv.LONG_ = 2
                            WHERE v1.NAME_ IN ('Frd7mdi5wj7jabc', 'Fci7mdcgb38yfcc') AND v1.TEXT_ = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.PROC_INST_ID_))						
                        AND EXISTS(SELECT * FROM ACT_HI_VARINST v1 
                            JOIN ACT_HI_VARINST vv ON vv.PROC_INST_ID_ = v1.PROC_INST_ID_ 
                                AND vv.NAME_ = 'PROCESS_STATUS' AND vv.LONG_ = 1
                            WHERE v1.NAME_ IN ('Frd7mdi5wj7jabc', 'Fci7mdcgb38yfcc') AND v1.TEXT_ = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.PROC_INST_ID_))
                    GROUP BY u1.nickname, u.nickname, d.KEY_, dp.name  
                    UNION ALL`
                break
            case 'plan_completed':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.PROC_INST_ID_) AS count, 'plan_completed' AS type, 
                        (CASE WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                            WHEN u.nickname = '刘海涛' THEN '事业一部' 
                            WHEN u.nickname = '王洪彬' THEN '事业三部' 
                            WHEN u.nickname = '郑艳艳' THEN '企划部' 
                            WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' 
                                OR dp.name LIKE '%小红书%' THEN '事业三部' 
                            WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                                OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                            WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(u1.nickname, IF(d.KEY_ IN ('fttplc', 'fantuituipin'), '', u.nickname)) AS developer 
                    FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
                    JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_ 
	                    AND v.NAME_ IN (
                            'Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 
                            'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 
                            'Fy6xma3jakboekc', 'F2lmma3petqpcwc', 
                            'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 
                            'Fnixma3nox6onmc', 'F34mma3pf0egd0c', 
                            'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc')
                        AND v.TEXT_ IN ('是', '选中') 
                    JOIN system_users u ON u.id = p.START_USER_ID_ 
                    JOIN system_dept dp ON dp.id = u.dept_id 
                    LEFT JOIN ACT_HI_TASKINST tx ON tx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND tx.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND IF(tx.END_TIME_ IS NULL, 1, tx.END_TIME_ = (
                            SELECT MAX(tt.END_TIME_) FROM ACT_HI_TASKINST tt 
                            WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND tt.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))) 
                    LEFT JOIN ACT_HI_VARINST vx ON vx.PROC_INST_ID_ = p.PROC_INST_ID_ 
                        AND vx.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                        AND vx.LAST_UPDATED_TIME_ = (
                            SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                            WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                                AND vv.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963')) 
                    LEFT JOIN system_users u1 ON u1.id = IFNULL(tx.ASSIGNEE_, vx.TEXT_) 
                    WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND p.START_TIME_ BETWEEN "${start}" AND "${end}" 
                        AND d.CATEGORY_ != 'ceshi' 
                        AND EXISTS(SELECT * FROM ACT_HI_VARINST v1 
                            JOIN ACT_HI_VARINST vv ON vv.PROC_INST_ID_ = v1.PROC_INST_ID_ 
                                AND vv.NAME_ = 'PROCESS_STATUS' AND vv.LONG_ = 2
                            WHERE v1.NAME_ IN ('Frd7mdi5wj7jabc', 'Fci7mdcgb38yfcc') AND v1.TEXT_ = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.PROC_INST_ID_))
                    GROUP BY u1.nickname, u.nickname, d.KEY_, dp.name  
                    UNION ALL`
                break
            default:
        }
    }
    if (sql?.length) {
        sql = sql.substring(0, sql.length - 9)
        result = await query(sql, params)
    }
    return result
}

//get selected process sku
actHiProcinstRepo.getSelectedProcessSkuInfo = async (start, end, selectType, info) => {
    let sql = `SELECT p.PROC_INST_ID_ AS id, b.BYTES_ AS info, 
            (CASE WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                ELSE '反推推品' END) AS develop_type, 
            (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                WHEN u.nickname = '刘海涛' THEN '事业一部' 
                WHEN u.nickname = '王洪彬' THEN '事业三部' 
                WHEN u.nickname = '郑艳艳' THEN '企划部' 
                WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' 
                    OR dp.name LIKE '%小红书%' THEN '事业三部' 
                WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                    OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' 
                    THEN '事业一部'
                    WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部' 
                    ELSE '' END) AS division, 
            IFNULL(u1.nickname, IF(d.KEY_ IN ('fttplc', 'fantuituipin'), '', u.nickname)) AS developer 
        FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v.NAME_ IN ('Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 
                'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 
                'Fy6xma3jakboekc', 'F2lmma3petqpcwc', 
                'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 
                'Fnixma3nox6onmc', 'F34mma3pf0egd0c', 
                'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc')
            AND v.TEXT_ IN ('是', '选中') 
            AND v.LAST_UPDATED_TIME_ = (SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND vv.NAME_ IN (
                    'Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 
                    'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 
                    'Fy6xma3jakboekc', 'F2lmma3petqpcwc', 
                    'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 
                    'Fnixma3nox6onmc', 'F34mma3pf0egd0c', 
                    'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc') 
                AND vv.TEXT_ IN ('是', '选中'))
        JOIN system_users u ON u.id = p.START_USER_ID_ 
        JOIN system_dept dp ON dp.id = u.dept_id 
        LEFT JOIN ACT_HI_TASKINST tx ON tx.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND tx.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
            AND IF(tx.END_TIME_ IS NULL, 1, tx.END_TIME_ = (
                SELECT MAX(tt.END_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND tt.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))) 
        LEFT JOIN ACT_HI_VARINST vx ON vx.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND vx.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
            AND vx.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND vv.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963')) 
        LEFT JOIN system_users u1 ON u1.id = IFNULL(tx.ASSIGNEE_, vx.TEXT_) 
		LEFT JOIN ACT_GE_BYTEARRAY b ON b.ID_ = v.BYTEARRAY_ID_
        WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin', 
            'iptplc', 'iptplcxb', 
            'zytplc', 'ziyantuipin', 
            'gystplc', 'gongyingshangtuipin', 
            'fttplc', 'fantuituipin') 
            AND p.START_TIME_ BETWEEN ? AND ? AND d.CATEGORY_ != 'ceshi'`
    if (selectType == 'developer') {
        sql = `${sql} 
                AND IFNULL(u1.nickname, IF(d.KEY_ IN ('fttplc', 'fantuituipin'), '', u.nickname)) = "${info}"`
    }
    if (selectType == 'division') {
        sql = `${sql} 
                AND (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                    WHEN u.nickname = '刘海涛' THEN '事业一部' 
                    WHEN u.nickname = '王洪彬' THEN '事业三部' 
                    WHEN u.nickname = '郑艳艳' THEN '企划部' 
                    WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' 
                        OR dp.name LIKE '%小红书%' THEN '事业三部' 
                    WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                        OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                    WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' 
                        THEN '事业一部'
                        WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部' 
                        ELSE '' END) = "${info}"`
    }
    if (selectType == 'develop_type') {
        sql = `${sql} 
                AND (CASE WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                    WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                    WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                    WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                    ELSE '反推推品' END) = "${info}"`
    }
    const result = await query(sql, [start, end])
    return result
}

//get select count
actHiProcinstRepo.getProcessSelectedCount = async (start, end) => {
    const sql = `SELECT id, type FROM (SELECT id, (CASE WHEN name IN (
            'Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c') THEN 1 
        WHEN name IN ('F2lmma3petqpcwc', 'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 'Fnixma3nox6onmc') THEN 2 
        WHEN name IN ('F34mma3pf0egd0c', 'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc') THEN 3 
        ELSE (CASE division WHEN '事业一部' THEN 1 WHEN '事业二部' THEN 2 ELSE 3 END) END) AS type FROM (
            SELECT p.PROC_INST_ID_ AS id, (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                    WHEN u.nickname = '刘海涛' THEN '事业一部' 
                    WHEN u.nickname = '王洪彬' THEN '事业三部' 
                    WHEN u.nickname = '郑艳艳' THEN '企划部' 
                    WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' 
                        OR dp.name LIKE '%小红书%' THEN '事业三部' 
                    WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                        OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                    WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' 
                        THEN '事业一部'
                        WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部' 
                        ELSE '' END) AS division, v.NAME_ AS name
            FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
            JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_
                AND v.NAME_ IN ('Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 
                    'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 
                    'Fy6xma3jakboekc', 
                    'F2lmma3petqpcwc', 
                    'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 
                    'Fnixma3nox6onmc', 
                    'F34mma3pf0egd0c', 
                    'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc')
                AND v.TEXT_ IN ('是', '选中') 
                AND v.LAST_UPDATED_TIME_ = (SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ AND vv.NAME_ = v.NAME_)
            JOIN system_users u ON u.id = p.START_USER_ID_ 
            JOIN system_dept dp ON dp.id = u.dept_id 
            WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin', 
                'iptplc', 'iptplcxb', 
                'zytplc', 'ziyantuipin', 
                'gystplc', 'gongyingshangtuipin', 
                'fttplc', 'fantuituipin') 
                AND p.START_TIME_ BETWEEN ? AND ? AND d.CATEGORY_ != 'ceshi') a 
            ORDER BY id) b GROUP BY id, type ORDER BY id, type`
    const result = await query(sql, [start, end])
    return result
}

//get process info
actHiProcinstRepo.getProcessInfo = async (start, end, type, selectType, info, selectType1, info1) => {
    let subsql = ''
    switch (type) {
        case 'choose':
        case 'purchase':
        case 'vision_running':
        case 'vision_completed':
        case 'plan_running':
        case 'plan_completed':
        case 'warehouse':
        case 'shelfing':
        case 'shelf':
            subsql = 'AND v4.ID_ IS NOT NULL'
            break
        case 'reject':
            subsql = 'AND v.LONG_ IN (3,4)'
            break
        case 'select':
            subsql = 'AND t4.ID_ IS NULL AND v.LONG_ = 1'
            break
        case 'ip_review':
            subsql = 'AND t5.ID_ IS NOT NULL'
            break
        case 'ip_design':
            subsql = 'AND t6.ID_ IS NOT NULL'
            break
        case 'sample':
            subsql = 'AND t7.ID_ IS NOT NULL'
            break
        case 'preorder':
            subsql = 'AND t8.ID_ IS NOT NULL'
            break
        case 'order':
            subsql = 'AND t9.ID_ IS NOT NULL'
            break
        case 'purchase_order':
            subsql = 'AND t10.ID_ IS NOT NULL'
            break
    }
    if (selectType == 'developer') {
        subsql = `${subsql} 
                AND IFNULL(u1.nickname, IF(d.KEY_ IN ('fttplc', 'fantuituipin'), '', u.nickname)) = "${info}"`
    } 
    if (selectType == 'division' || selectType1 == 'division') {
        subsql = `${subsql} 
                AND (CASE WHEN u.nickname = '陆瑶' THEN '事业二部' 
                    WHEN u.nickname = '刘海涛' THEN '事业一部' 
                    WHEN u.nickname = '王洪彬' THEN '事业三部' 
                    WHEN u.nickname = '郑艳艳' THEN '企划部' 
                    WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' 
                        OR dp.name LIKE '%小红书%' THEN '事业三部' 
                    WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                        OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                    WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' 
                        THEN '事业一部'
                        WHEN dp.name LIKE '%开发%' OR dp.name LIKE '%企划%' OR dp.name LIKE '%市场%' THEN '企划部' 
                        ELSE '' END) = "${selectType == 'division' ? info : info1}"`
    } 
    if (selectType == 'develop_type' || selectType1 == 'develop_type') {
        subsql = `${subsql} 
                AND (CASE WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                    WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                    WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                    WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                    ELSE '反推推品' END) = "${selectType == 'develop_type' ? info : info1}"`
    }
    if (selectType == 'select_division') {
        subsql = `${subsql} 
                AND p.PROC_INST_ID_ IN ("${info}")`
    }
    let sql = `SELECT p.NAME_ AS title, p.PROC_INST_ID_ AS id, v16.TEXT_ AS image, 
            b1.BYTES_ AS info1, IFNULL(v15.TEXT_, '') AS spu, 
            CASE WHEN d.KEY_ IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                WHEN d.KEY_ IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                WHEN d.KEY_ IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                WHEN d.KEY_ IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                ELSE '反推推品' END AS type, 
            IFNULL(u1.nickname, IF(d.KEY_ IN ('fttplc', 'fantuituipin'), '', u.nickname)) as developer, 
            u.nickname, IFNULL(v12.TEXT_, '') AS platform, 
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
                ELSE '' END) AS dept, v.LONG_ AS process_status, 
            t.LAST_UPDATED_TIME_ AS first_time, 
            t1.LAST_UPDATED_TIME_ AS second_time, 
            t2.LAST_UPDATED_TIME_ AS third_time, 
            b.BYTES_ AS info, (
                SELECT vv1.LONG_ FROM ACT_HI_VARINST vv JOIN ACT_HI_VARINST vv1 
                    ON vv.PROC_INST_ID_ = vv1.PROC_INST_ID_ 
                WHERE vv1.NAME_ = 'PROCESS_STATUS' AND vv.NAME_ IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc')
	                AND vv.TEXT_ = CONCAT('http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', 
                        p.PROC_INST_ID_) 
                ORDER BY vv1.LONG_ DESC LIMIT 1 
            ) AS vision_status, IFNULL(t3.NAME_, '') AS node, 
            (CASE WHEN u2.nickname = '陆瑶' THEN '事业二部' 
                WHEN u2.nickname = '刘海涛' THEN '事业一部' 
                WHEN u2.nickname = '王洪彬' THEN '事业三部' 
                WHEN u2.nickname = '郑艳艳' THEN '企划部' 
                WHEN u2.nickname = '鲁红旺' THEN '货品部' 
                WHEN dp2.name LIKE '%天猫%' OR dp2.name LIKE '%国货%' OR dp2.name LIKE '%小红书%' THEN '事业三部' 
                WHEN dp2.name LIKE '%京东%' OR dp2.name LIKE '%抖音%' OR dp2.name LIKE '%1688%' 
                    OR dp2.name LIKE '%唯品会%' OR dp2.name LIKE '%得物%' THEN '事业二部' 
                WHEN dp2.name LIKE '%拼多多%' OR dp2.name LIKE '%跨境%' OR dp2.name LIKE '%猫超%' THEN '事业一部' 
                WHEN dp2.name LIKE '%开发%' OR dp2.name LIKE '%企划%' OR dp2.name LIKE '%市场%' THEN '企划部' 
                WHEN dp2.name LIKE '%采购%' OR dp2.name LIKE '%物流%' OR dp2.name LIKE '%库房%' 
                    OR dp2.name LIKE '%品控%' THEN '货品部' 
                WHEN dp2.name LIKE '%客服%' THEN '客服部' WHEN dp2.name LIKE '%摄影%' OR dp2.name LIKE '%视觉%' 
                    OR dp2.name LIKE '%设计%' THEN '视觉部' 
                WHEN dp2.name LIKE '%人事%' THEN '人事部' 
                WHEN dp2.name LIKE '%数据%' THEN '数据中台' 
                WHEN dp2.name LIKE '%财务%' THEN '财务部' 
                ELSE '' END) AS node_dept, IFNULL(u2.nickname, '') AS user, 
            t3.START_TIME_ AS due_start, p.START_TIME_ AS start_time, IF(v.TEXT_ IN ('2', '3', '4'), 
                (SELECT MAX(tt.END_TIME_) FROM ACT_HI_TASKINST tt WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_), 
                null) AS end_time
        FROM ACT_HI_PROCINST p JOIN ACT_RE_PROCDEF d ON d.ID_ = p.PROC_DEF_ID_ 
        JOIN system_users u ON u.id = p.START_USER_ID_ 
        JOIN system_dept dp ON dp.id = u.dept_id 
        JOIN ACT_HI_VARINST v ON v.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v.NAME_ = 'PROCESS_STATUS' 
            AND v.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ AND vv.NAME_ = v.NAME_) 
        LEFT JOIN ACT_HI_TASKINST tx ON tx.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND tx.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
            AND IF(tx.END_TIME_ IS NULL, 1, tx.END_TIME_ = (
                SELECT MAX(tt.END_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND tt.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))) 
        LEFT JOIN ACT_HI_VARINST v1 ON v1.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v1.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
            AND v1.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND vv.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963')) 
        LEFT JOIN system_users u1 ON u1.id = IFNULL(tx.ASSIGNEE_, v1.TEXT_) 
        LEFT JOIN ACT_HI_TASKINST t on t.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND t.STATE_ = 'completed' 
            AND IF(d.KEY_ IN ('iptplc', 'iptplcxb'), t.NAME_ = '事业部1是否订货', 
                IF(d.KEY_ IN ('zytplc', 'ziyantuipin'), t.NAME_ = '事业部一是否订货', 
                    IF(d.KEY_ IN ('sctgtplc', 'shichangfenxituipin'), 
                        t.NAME_ IN ('事业部一是否订货1', '事业部一是否订货2'), 
                        IF(d.KEY_ IN ('gystplc', 'gongyingshangtuipin'), t.NAME_ = '事业部一审核市场分析', 
                            t.NAME_ IN ('事业部一是否选中', '事业部一是否加单', '事业部一样品是否选中') 
                                OR ((dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%') 
                                    AND t.NAME_ IN ('运营是否选中', '反选运营确认样品是否选中')))))) 
            AND t.LAST_UPDATED_TIME_ = (
                SELECT MAX(tt.LAST_UPDATED_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.STATE_ = 'completed' AND tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND IF(d.KEY_ IN ('iptplc', 'iptplcxb'), tt.NAME_ = '事业部1是否订货', 
                        IF(d.KEY_ IN ('zytplc', 'ziyantuipin'), tt.NAME_ = '事业部一是否订货', 
                            IF(d.KEY_ IN ('sctgtplc', 'shichangfenxituipin'), 
                                tt.NAME_ IN ('事业部一是否订货1', '事业部一是否订货2'), 
                                IF(d.KEY_ IN ('gystplc', 'gongyingshangtuipin'), tt.NAME_ = '事业部一审核市场分析', 
                                    tt.NAME_ IN ('事业部一是否选中', '事业部一是否加单', '事业部一样品是否选中') 
                                        OR ((dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%') 
                                            AND tt.NAME_ IN ('运营是否选中', '反选运营确认样品是否选中'))))))) 
        LEFT JOIN ACT_HI_TASKINST t1 on t1.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND t1.STATE_ = 'completed' 
            AND IF(d.KEY_ IN ('iptplc', 'iptplcxb'), t1.NAME_ = '事业部2是否订货', 
                IF(d.KEY_ IN ('zytplc', 'ziyantuipin'), t1.NAME_ = '事业部二是否订货', 
                    IF(d.KEY_ IN ('sctgtplc', 'shichangfenxituipin'), 
                        t1.NAME_ IN ('事业部二是否订货1', '事业部二是否订货2'), 
                        IF(d.KEY_ IN ('gystplc', 'gongyingshangtuipin'), t1.NAME_ = '事业部二审核市场分析', 
                            t1.NAME_ IN ('事业部二是否选中', '事业部二是否加单', '事业部二样品是否选中') 
                                OR ((dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                                    OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%') 
                                    AND t1.NAME_ IN ('运营是否选中', '反选运营确认样品是否选中')))))) 
            AND t1.LAST_UPDATED_TIME_ = (
                SELECT MAX(tt.LAST_UPDATED_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.STATE_ = 'completed' AND tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND IF(d.KEY_ IN ('iptplc', 'iptplcxb'), tt.NAME_ = '事业部2是否订货', 
                        IF(d.KEY_ IN ('zytplc', 'ziyantuipin'), tt.NAME_ = '事业部二是否订货', 
                            IF(d.KEY_ IN ('sctgtplc', 'shichangfenxituipin'), 
                                tt.NAME_ IN ('事业部二是否订货1', '事业部二是否订货2'), 
                                IF(d.KEY_ IN ('gystplc', 'gongyingshangtuipin'), tt.NAME_ = '事业部二审核市场分析', 
                                    tt.NAME_ IN ('事业部二是否选中', '事业部二是否加单', '事业部二样品是否选中') 
                                        OR ((dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                                            OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%') 
                                            AND tt.NAME_ IN ('运营是否选中', '反选运营确认样品是否选中'))))))) 
        LEFT JOIN ACT_HI_TASKINST t2 on t2.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND t2.STATE_ = 'completed' 
            AND IF(d.KEY_ IN ('iptplc', 'iptplcxb'), t2.NAME_ = '事业部3是否订货', 
                IF(d.KEY_ IN ('zytplc', 'ziyantuipin'), t2.NAME_ = '事业部三是否订货', 
                    IF(d.KEY_ IN ('sctgtplc', 'shichangfenxituipin'), 
                        t2.NAME_ IN ('事业部三是否订货1', '事业部三是否订货2'), 
                        IF(d.KEY_ IN ('gystplc', 'gongyingshangtuipin'), t2.NAME_ = '事业部三审核市场分析', 
                            t2.NAME_ IN ('事业部三是否选中', '事业部三是否加单', '事业部三样品是否选中') 
                            OR ((dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' OR dp.name LIKE '%小红书%') 
                                AND t2.NAME_ IN ('运营是否选中', '反选运营确认样品是否选中')))))) 
            AND t2.LAST_UPDATED_TIME_ = (
                SELECT MAX(tt.LAST_UPDATED_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.STATE_ = 'completed' AND tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND IF(d.KEY_ IN ('iptplc', 'iptplcxb'), tt.NAME_ = '事业部3是否订货', 
                        IF(d.KEY_ IN ('zytplc', 'ziyantuipin'), tt.NAME_ = '事业部三是否订货', 
                            IF(d.KEY_ IN ('sctgtplc', 'shichangfenxituipin'), 
                                tt.NAME_ IN ('事业部三是否订货1', '事业部三是否订货2'), 
                                IF(d.KEY_ IN ('gystplc', 'gongyingshangtuipin'), tt.NAME_ = '事业部三审核市场分析', 
                                    tt.NAME_ IN ('事业部三是否选中', '事业部三是否加单', '事业部三样品是否选中') 
                                        OR ((dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' OR dp.name LIKE '%小红书%') 
                                            AND tt.NAME_ IN ('运营是否选中', '反选运营确认样品是否选中'))))))) 
        LEFT JOIN ACT_HI_VARINST v2 on v2.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v2.NAME_ = 'TASK_STATUS' AND v2.TEXT_ = '1' 
        LEFT JOIN ACT_HI_TASKINST t3 ON t3.PROC_INST_ID_ = p.PROC_INST_ID_ AND v2.TASK_ID_ = t3.ID_ 
        LEFT JOIN system_users u2 on u2.id = t3.ASSIGNEE_ 
        LEFT JOIN system_dept dp2 on u2.dept_id = dp2.id 
        LEFT JOIN ACT_HI_TASKINST t4 ON t4.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND t4.NAME_ IN (
                '建立聚水潭信息并填写商品编码', '建立聚水潭信息并填写商品编码1', 
                '建立聚水潭信息并填写商品编码2', '开发建立聚水潭信息填写预计销量表子表单', 
                '聚水潭建立商品信息并填写商品编码') AND t4.LAST_UPDATED_TIME_ = (
                SELECT MAX(tt.LAST_UPDATED_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ AND tt.NAME_ IN (
                    '建立聚水潭信息并填写商品编码', '建立聚水潭信息并填写商品编码1', 
                    '建立聚水潭信息并填写商品编码2', '开发建立聚水潭信息填写预计销量表子表单', 
                    '聚水潭建立商品信息并填写商品编码'))
        LEFT JOIN ACT_HI_VARINST v3 ON v3.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v3.NAME_ IN ('Fyf1ma3jfyi7fuc', 'Fnt5ma3psjitfcc', 'Fo5uma263lluhdc') 
            AND v3.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND vv.NAME_ IN ('Fyf1ma3jfyi7fuc', 'Fnt5ma3psjitfcc', 'Fo5uma263lluhdc')) 
        LEFT JOIN ACT_HI_VARINST v4 ON v4.PROC_INST_ID_ = p.PROC_INST_ID_
            AND v4.NAME_ IN (
                'Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 
                'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 
                'Fy6xma3jakboekc', 'F2lmma3petqpcwc', 
                'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 
                'Fnixma3nox6onmc', 'F34mma3pf0egd0c', 
                'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc')
            AND v4.TEXT_ IN ('是', '选中') 
            AND v4.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ AND vv.NAME_ IN (
                        'Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 
                        'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 
                        'Fy6xma3jakboekc', 'F2lmma3petqpcwc', 
                        'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 
                        'Fnixma3nox6onmc', 'F34mma3pf0egd0c', 
                        'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc') 
                    AND vv.TEXT_ IN ('是', '选中')) 
        LEFT JOIN ACT_GE_BYTEARRAY b ON b.ID_ = v3.BYTEARRAY_ID_         
        LEFT JOIN ACT_HI_TASKINST t5 ON t5.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND t5.STATE_ = 'created' 
            AND t5.NAME_ IN ('IP设计监修', '设计监修通过并上传链图云') 
            AND t5.LAST_UPDATED_TIME_ = (
                SELECT MAX(tt.LAST_UPDATED_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ AND tt.NAME_ IN (
                    'IP设计监修', '设计监修通过并上传链图云'))
        LEFT JOIN ACT_HI_TASKINST t6 ON t6.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND t6.STATE_ = 'created' 
            AND t6.NAME_ IN ('上传设计草图1', '上传设计草图', '北京上传设计草图', '杭州上传设计草图') 
            AND t6.LAST_UPDATED_TIME_ = (
                SELECT MAX(tt.LAST_UPDATED_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ AND tt.NAME_ IN (
                    '上传设计草图1', '上传设计草图', '北京上传设计草图', '杭州上传设计草图'))
        LEFT JOIN ACT_HI_TASKINST t7 ON t7.PROC_INST_ID_ = p.PROC_INST_ID_
            AND t7.STATE_ = 'created' 
            AND t7.NAME_ IN ('工厂打样', '开发工厂打样起始时间2', '开发工厂打样起始时间') 
            AND t7.LAST_UPDATED_TIME_ = (
                SELECT MAX(tt.LAST_UPDATED_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ AND tt.NAME_ IN (
                    '工厂打样', '开发工厂打样起始时间2', '开发工厂打样起始时间'))
        LEFT JOIN ACT_HI_TASKINST t8 ON t8.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND t8.STATE_ = 'created'
            AND IF(d.KEY_ IN ('iptplc', 'iptplcxb'), 
                t8.NAME_ IN ('事业部1是否订货', '事业部2是否订货', '事业部3是否订货'), 
                IF(d.KEY_ IN ('zytplc', 'ziyantuipin'), 
                    t8.NAME_ IN ('事业部一是否订货', '事业部二是否订货', '事业部三是否订货'), 
                    IF(d.KEY_ IN ('sctgtplc', 'shichangfenxituipin'), 
                        t8.NAME_ IN (
                            '事业部一是否订货1', '事业部一是否订货2', 
                            '事业部二是否订货1', '事业部二是否订货2', 
                            '事业部三是否订货1', '事业部三是否订货2'), 
                        IF(d.KEY_ IN ('gystplc', 'gongyingshangtuipin'), 
                            t8.NAME_ IN (
                                '事业部一填写预计订货量', 
                                '事业部二填写预计订货量', 
                                '事业部三填写预计订货量'), 
                            t8.NAME_ IN (
                                '事业部一填写订货量', '事业部一是否加单', 
                                '事业部二填写订货量', '事业部二是否加单', 
                                '事业部三填写订货量', '事业部三是否加单'))))) 
            AND t8.LAST_UPDATED_TIME_ = (
                SELECT MAX(tt.LAST_UPDATED_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                AND IF(d.KEY_ IN ('iptplc', 'iptplcxb'), 
                    tt.NAME_ IN ('事业部1是否订货', '事业部2是否订货', '事业部3是否订货'), 
                    IF(d.KEY_ IN ('zytplc', 'ziyantuipin'), 
                        tt.NAME_ IN ('事业部一是否订货', '事业部二是否订货', '事业部三是否订货'), 
                        IF(d.KEY_ IN ('sctgtplc', 'shichangfenxituipin'), 
                            tt.NAME_ IN (
                                '事业部一是否订货1', '事业部一是否订货2', 
                                '事业部二是否订货1', '事业部二是否订货2', 
                                '事业部三是否订货1', '事业部三是否订货2'), 
                            IF(d.KEY_ IN ('gystplc', 'gongyingshangtuipin'), 
                                tt.NAME_ IN (
                                    '事业部一填写预计订货量', 
                                    '事业部二填写预计订货量', 
                                    '事业部三填写预计订货量'), 
                                tt.NAME_ IN (
                                    '事业部一填写订货量', '事业部一是否加单', 
                                    '事业部二填写订货量', '事业部二是否加单', 
                                    '事业部三填写订货量', '事业部三是否加单'))))))
        LEFT JOIN ACT_HI_TASKINST t9 ON t9.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND t9.STATE_ = 'created'
            AND t9.NAME_ IN (
                '货品汇总并判断订货量', '货品汇总判断订货量', 
                '货品汇总判断订货量1', '货品汇总判断订货量2', 
                '货品汇总判断订货量以及分配采购执行人', 
                '货品汇总并判断订货量以及分配采购执行人', 
                '货品汇总判断订货量以及分配采购执行人1', '货品汇总判断订货量以及分配采购执行人2') 
            AND t9.LAST_UPDATED_TIME_ = (
                SELECT MAX(tt.LAST_UPDATED_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ AND tt.NAME_ IN (
                    '货品汇总并判断订货量', '货品汇总判断订货量', 
                    '货品汇总判断订货量1', '货品汇总判断订货量2', 
                    '货品汇总判断订货量以及分配采购执行人', 
                    '货品汇总并判断订货量以及分配采购执行人', 
                    '货品汇总判断订货量以及分配采购执行人1', '货品汇总判断订货量以及分配采购执行人2')) 
        LEFT JOIN ACT_HI_TASKINST t10 ON t10.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND t10.STATE_ = 'created'
            AND t10.NAME_ IN (
                '上传订货合同及填写预计到货时间', 
                '填写订货合同1', '填写订货合同2', 
                '填写订货合同' ,'填写合同', '采购执行人签订周转合同') 
            AND t10.LAST_UPDATED_TIME_ = (
                SELECT MAX(tt.LAST_UPDATED_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ AND tt.NAME_ IN (
                    '上传订货合同及填写预计到货时间', 
                    '填写订货合同1', '填写订货合同2', 
                    '填写订货合同' ,'填写合同', '采购执行人签订周转合同')) 
        LEFT JOIN ACT_HI_VARINST v12 ON v12.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v12.NAME_ = 'Fj1ama2csbpoabc' 
            AND v12.LAST_UPDATED_TIME_ = (SELECT MAX(v2.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST v2 
                WHERE v2.PROC_INST_ID_ = p.PROC_INST_ID_ AND v2.NAME_ = v12.NAME_) 
        LEFT JOIN ACT_HI_VARINST v15 ON v15.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v15.NAME_ IN (
                'F0fpmc8rlpolpbc', 'Frwsmc8rphh2rsc', 'Fylnmc8v515dm8c', 'Fwyzmc8v5dpdnxc', 'F6mfmc8v5qefpmc') 
            AND v15.LAST_UPDATED_TIME_ = (
                SELECT MAX(v2.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST v2 
                WHERE v2.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    and v2.NAME_ = v15.NAME_) 
        LEFT JOIN ACT_HI_VARINST v16 ON v16.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v16.NAME_ IN ('Cfidpl3a7e5tm', 'Cfidpj2f10qqm', 'Cfidv84ga4ncy') 
            AND v16.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND vv.NAME_ = v16.NAME_)         
        LEFT JOIN ACT_GE_BYTEARRAY b1 ON b1.ID_ = v16.BYTEARRAY_ID_ 
        WHERE d.KEY_ IN ('sctgtplc', 'shichangfenxituipin', 
            'iptplc', 'iptplcxb', 
            'zytplc', 'ziyantuipin', 
            'gystplc', 'gongyingshangtuipin', 
            'fttplc', 'fantuituipin') 
            AND p.START_TIME_ BETWEEN "${start}" AND "${end}" AND d.CATEGORY_ != 'ceshi' `
    if (subsql?.length) {
        sql = `${sql}
                ${subsql} `
    }
    sql = `${sql}           
            ORDER BY p.START_TIME_, t.START_TIME_`
    const result = await query(sql)
    return result
}

//vision
actHiProcinstRepo.getProcessInfo1 = async (type, ids) => {
    let subsql = ''
    if (type == 'vision_running') 
        subsql = `AND NOT EXISTS(SELECT * FROM ACT_HI_VARINST v1 
                            JOIN ACT_HI_VARINST vv ON vv.PROC_INST_ID_ = v1.PROC_INST_ID_ 
                                AND vv.NAME_ = 'PROCESS_STATUS' AND vv.LONG_ = 2
                            WHERE v1.NAME_ IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc') AND v1.TEXT_ = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.PROC_INST_ID_))						
                        AND EXISTS(SELECT * FROM ACT_HI_VARINST v1 
                            JOIN ACT_HI_VARINST vv ON vv.PROC_INST_ID_ = v1.PROC_INST_ID_ 
                                AND vv.NAME_ = 'PROCESS_STATUS' AND vv.LONG_ = 1
                            WHERE v1.NAME_ IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc') AND v1.TEXT_ = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.PROC_INST_ID_))`
    else subsql = `AND EXISTS(SELECT * FROM ACT_HI_VARINST v1 
                            JOIN ACT_HI_VARINST vv ON vv.PROC_INST_ID_ = v1.PROC_INST_ID_ 
                                AND vv.NAME_ = 'PROCESS_STATUS' AND vv.LONG_ = 2
                            WHERE v1.NAME_ IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc') AND v1.TEXT_ = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.PROC_INST_ID_)) `
    let sql = `SELECT p.NAME_ AS title, CONCAT('http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', 
                p.PROC_INST_ID_) AS link, CONCAT(
                'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p1.PROC_INST_ID_) 
            AS vision_link, v16.TEXT_ AS image, b1.BYTES_ AS info1, IFNULL(v15.TEXT_, '') AS spu, 
            u.nickname, (CASE WHEN dp.name LIKE '%天猫%' THEN '王洪彬事业部-天猫' 
                WHEN dp.name LIKE '%国货%' THEN '王洪彬事业部-淘工厂' 
                WHEN dp.name LIKE '%小红书%' THEN '王洪彬事业部-天猫垂类店、小红书' 
                WHEN dp.name LIKE '%京东%' THEN '陆瑶事业部-京东' 
                WHEN dp.name LIKE '%抖音%' THEN '陆瑶事业部-抖音、快手' 
                WHEN dp.name LIKE '%1688%' THEN '陆瑶事业部-1688' 
                WHEN dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '陆瑶事业部-得物、唯品会' 
                WHEN dp.name LIKE '%拼多多%' THEN '刘海涛事业部-拼多多' 
                WHEN dp.name LIKE '%跨境%' THEN '刘海涛事业部-coupang' 
                WHEN dp.name LIKE '%猫超%' THEN '刘海涛事业部-天猫超市' ELSE '' END) AS platform, 
            (CASE WHEN dp.name LIKE '%天猫%' OR dp.name LIKE '%国货%' OR dp.name LIKE '%小红书%' THEN '事业三部' 
                WHEN dp.name LIKE '%京东%' OR dp.name LIKE '%抖音%' OR dp.name LIKE '%1688%' 
                    OR dp.name LIKE '%唯品会%' OR dp.name LIKE '%得物%' THEN '事业二部' 
                WHEN dp.name LIKE '%拼多多%' OR dp.name LIKE '%跨境%' OR dp.name LIKE '%猫超%' THEN '事业一部' 
                ELSE '' END) AS dept, (CASE v2.LONG_ WHEN 1 THEN '审批中' WHEN 2 THEN '审批通过' 
                    WHEN 3 THEN '审批不通过' WHEN 4 THEN '取消' ELSE '未发起' END) AS process_status, 
            IFNULL(t.NAME_, '') AS node, 
            (CASE WHEN u1.nickname = '陆瑶' THEN '事业二部' 
                WHEN u1.nickname = '刘海涛' THEN '事业一部' 
                WHEN u1.nickname = '王洪彬' THEN '事业三部' 
                WHEN dp1.name LIKE '%天猫%' OR dp1.name LIKE '%国货%' OR dp1.name LIKE '%小红书%' THEN '事业三部' 
                WHEN dp1.name LIKE '%京东%' OR dp1.name LIKE '%抖音%' OR dp1.name LIKE '%1688%' 
                    OR dp1.name LIKE '%唯品会%' OR dp1.name LIKE '%得物%' THEN '事业二部' 
                WHEN dp1.name LIKE '%拼多多%' OR dp1.name LIKE '%跨境%' OR dp1.name LIKE '%猫超%' THEN '事业一部' 
                WHEN dp1.name LIKE '%摄影%' OR dp1.name LIKE '%视觉%' OR dp1.name LIKE '%设计%' THEN '视觉部' 
                ELSE '' END) AS node_dept, IFNULL(u1.nickname, '') AS user, 
            t.START_TIME_ AS due_start, p1.START_TIME_ AS start_time, p1.END_TIME_ AS end_time 
        FROM ACT_HI_PROCINST p JOIN ACT_HI_VARINST v1 ON v1.NAME_ IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc')
            AND v1.TEXT_ = CONCAT(
                'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.PROC_INST_ID_) 
            AND v1.LAST_UPDATED_TIME_ = (SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = v1.PROC_INST_ID_ 
                    AND vv.NAME_ IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc'))
        JOIN ACT_HI_PROCINST p1 ON p1.PROC_INST_ID_ = v1.PROC_INST_ID_ 
        JOIN ACT_HI_VARINST v2 ON v2.PROC_INST_ID_ = v1.PROC_INST_ID_ 
            AND v2.NAME_ = 'PROCESS_STATUS' 
            AND v2.LAST_UPDATED_TIME_ = (SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p1.PROC_INST_ID_ AND vv.NAME_ = 'PROCESS_STATUS')
        JOIN ACT_HI_VARINST v3 ON v3.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v3.NAME_ = 'PROCESS_STATUS' 
            AND v3.LAST_UPDATED_TIME_ = (SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ AND vv.NAME_ = 'PROCESS_STATUS')
        JOIN system_users u ON u.id = p1.START_USER_ID_ 
        JOIN system_dept dp ON dp.id = u.dept_id 
        LEFT JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p1.PROC_INST_ID_ 
            AND EXISTS(SELECT vv.ID_ FROM ACT_HI_VARINST vv WHERE vv.TASK_ID_ = t.ID_ 
                AND vv.NAME_ = 'TASK_STATUS' AND vv.LONG_ = 1) 
        LEFT JOIN system_users u1 ON u1.id = t.ASSIGNEE_ 
        LEFT JOIN system_dept dp1 ON dp1.id = u1.dept_id 
        LEFT JOIN ACT_HI_VARINST v15 ON v15.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v15.NAME_ IN (
                'F0fpmc8rlpolpbc', 'Frwsmc8rphh2rsc', 'Fylnmc8v515dm8c', 'Fwyzmc8v5dpdnxc', 'F6mfmc8v5qefpmc') 
            AND v15.LAST_UPDATED_TIME_ = (
                SELECT MAX(v2.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST v2 
                WHERE v2.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    and v2.NAME_ = v15.NAME_)    
        LEFT JOIN ACT_HI_VARINST v16 ON v16.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v16.NAME_ IN ('Cfidpl3a7e5tm', 'Cfidpj2f10qqm', 'Cfidv84ga4ncy') 
            AND v16.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND vv.NAME_ = v16.NAME_) 
        LEFT JOIN ACT_GE_BYTEARRAY b1 ON b1.ID_ = v16.BYTEARRAY_ID_ 
        JOIN system_users u2 ON u2.id = p.START_USER_ID_ 
        JOIN system_dept dp2 ON dp2.id = u2.dept_id 
        LEFT JOIN ACT_HI_TASKINST tx ON tx.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND tx.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
            AND IF(tx.END_TIME_ IS NULL, 1, tx.END_TIME_ = (
                SELECT MAX(tt.END_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND tt.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))) 
        LEFT JOIN ACT_HI_VARINST vx ON vx.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND vx.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
            AND vx.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND vv.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963')) 
        LEFT JOIN system_users u3 ON u3.id = IFNULL(tx.ASSIGNEE_, vx.TEXT_)
        WHERE v1.ID_ IS NOT NULL AND p.PROC_INST_ID_ IN ("${ids}")`
    sql = `${sql}
            ${subsql}`
    const result = await query(sql)
    return result
}

//plan
actHiProcinstRepo.getProcessInfo2 = async (type, ids) => {
    let subsql = ''
    if (type == 'plan_running') 
        subsql = `AND NOT EXISTS(SELECT * FROM ACT_HI_VARINST v1 
                            JOIN ACT_HI_VARINST vv ON vv.PROC_INST_ID_ = v1.PROC_INST_ID_ 
                                AND vv.NAME_ = 'PROCESS_STATUS' AND vv.LONG_ = 2
                            WHERE v1.NAME_ IN ('Frd7mdi5wj7jabc', 'Fci7mdcgb38yfcc') AND v1.TEXT_ = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.PROC_INST_ID_))						
                        AND EXISTS(SELECT * FROM ACT_HI_VARINST v1 
                            JOIN ACT_HI_VARINST vv ON vv.PROC_INST_ID_ = v1.PROC_INST_ID_ 
                                AND vv.NAME_ = 'PROCESS_STATUS' AND vv.LONG_ = 1
                            WHERE v1.NAME_ IN ('Frd7mdi5wj7jabc', 'Fci7mdcgb38yfcc') AND v1.TEXT_ = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.PROC_INST_ID_))`
    else subsql = `AND EXISTS(SELECT * FROM ACT_HI_VARINST v1 
                            JOIN ACT_HI_VARINST vv ON vv.PROC_INST_ID_ = v1.PROC_INST_ID_ 
                                AND vv.NAME_ = 'PROCESS_STATUS' AND vv.LONG_ = 2
                            WHERE v1.NAME_ IN ('Frd7mdi5wj7jabc', 'Fci7mdcgb38yfcc') AND v1.TEXT_ = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.PROC_INST_ID_))`
    let sql = `SELECT p.NAME_ AS title, CONCAT('http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', 
                p.PROC_INST_ID_) AS link, CONCAT(
                'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p1.PROC_INST_ID_) 
            AS plan_link, v16.TEXT_ AS image, b1.BYTES_ AS info1, IFNULL(v15.TEXT_, '') AS spu,             
            v4.TEXT_ AS division, IF(v5.TEXT_ IS NOT NULL, (
                SELECT nickname FROM system_users WHERE id = v5.TEXT_), '') AS operator, 
            (CASE v2.LONG_ WHEN 1 THEN '审批中' WHEN 2 THEN '审批通过' WHEN 3 THEN '审批不通过' 
                WHEN 4 THEN '取消' ELSE '未发起' END) AS process_status, IFNULL(t.NAME_, '') AS node, 
            (CASE WHEN u1.nickname = '陆瑶' THEN '事业二部' 
                WHEN u1.nickname = '刘海涛' THEN '事业一部' 
                WHEN u1.nickname = '王洪彬' THEN '事业三部' 
                WHEN dp1.name LIKE '%天猫%' OR dp1.name LIKE '%国货%' OR dp1.name LIKE '%小红书%' THEN '事业三部' 
                WHEN dp1.name LIKE '%京东%' OR dp1.name LIKE '%抖音%' OR dp1.name LIKE '%1688%' 
                    OR dp1.name LIKE '%唯品会%' OR dp1.name LIKE '%得物%' THEN '事业二部' 
                WHEN dp1.name LIKE '%拼多多%' OR dp1.name LIKE '%跨境%' OR dp1.name LIKE '%猫超%' THEN '事业一部' 
                WHEN dp1.name LIKE '%摄影%' OR dp1.name LIKE '%视觉%' OR dp1.name LIKE '%设计%' THEN '视觉部' 
                ELSE '' END) AS node_dept, IFNULL(u1.nickname, '') AS user, 
            t.START_TIME_ AS due_start, p1.START_TIME_ AS start_time, p1.END_TIME_ AS end_time 
        FROM ACT_HI_PROCINST p JOIN ACT_HI_VARINST v1 ON v1.NAME_ IN ('Frd7mdi5wj7jabc', 'Fci7mdcgb38yfcc')
            AND v1.TEXT_ = CONCAT(
                'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.PROC_INST_ID_)
            AND v1.LAST_UPDATED_TIME_ = (SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = v1.PROC_INST_ID_ 
                    AND vv.NAME_ IN ('Frd7mdi5wj7jabc', 'Fci7mdcgb38yfcc')) 
        JOIN ACT_HI_PROCINST p1 ON p1.PROC_INST_ID_ = v1.PROC_INST_ID_ 
        JOIN ACT_HI_VARINST v2 ON v2.PROC_INST_ID_ = p1.PROC_INST_ID_ 
            AND v2.NAME_ = 'PROCESS_STATUS' 
            AND v2.LAST_UPDATED_TIME_ = (SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p1.PROC_INST_ID_ AND vv.NAME_ = 'PROCESS_STATUS')
        JOIN ACT_HI_VARINST v3 ON v3.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v3.NAME_ = 'PROCESS_STATUS' 
            AND v3.LAST_UPDATED_TIME_ = (SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ AND vv.NAME_ = 'PROCESS_STATUS') 
        JOIN ACT_HI_VARINST v4 ON v4.PROC_INST_ID_ = p1.PROC_INST_ID_ 
            AND v4.NAME_ = 'Fdmmmdcgbkkwffc' 
            AND v4.LAST_UPDATED_TIME_ = (SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p1.PROC_INST_ID_ AND vv.NAME_ = v4.NAME_) 
        LEFT JOIN ACT_HI_VARINST v5 ON v5.PROC_INST_ID_ = p1.PROC_INST_ID_ 
            AND v5.NAME_ = 'Cfidn1wi51uek' 
            AND v5.LAST_UPDATED_TIME_ = (SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p1.PROC_INST_ID_ AND vv.NAME_ = v5.NAME_) 
        LEFT JOIN ACT_HI_TASKINST t ON t.PROC_INST_ID_ = p1.PROC_INST_ID_ 
            AND EXISTS(SELECT vv.ID_ FROM ACT_HI_VARINST vv WHERE vv.TASK_ID_ = t.ID_ 
                AND vv.NAME_ = 'TASK_STATUS' AND vv.LONG_ = 1) 
        LEFT JOIN system_users u1 ON u1.id = t.ASSIGNEE_ 
        LEFT JOIN system_dept dp1 ON dp1.id = u1.dept_id 
        LEFT JOIN ACT_HI_VARINST v15 ON v15.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v15.NAME_ IN (
                'F0fpmc8rlpolpbc', 'Frwsmc8rphh2rsc', 'Fylnmc8v515dm8c', 'Fwyzmc8v5dpdnxc', 'F6mfmc8v5qefpmc') 
            AND v15.LAST_UPDATED_TIME_ = (
                SELECT MAX(v2.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST v2 
                WHERE v2.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    and v2.NAME_ = v15.NAME_)    
        LEFT JOIN ACT_HI_VARINST v16 ON v16.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND v16.NAME_ IN ('Cfidpl3a7e5tm', 'Cfidpj2f10qqm', 'Cfidv84ga4ncy') 
            AND v16.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND vv.NAME_ = v16.NAME_) 
        LEFT JOIN ACT_GE_BYTEARRAY b1 ON b1.ID_ = v16.BYTEARRAY_ID_ 
        JOIN system_users u2 ON u2.id = p.START_USER_ID_ 
        JOIN system_dept dp2 ON dp2.id = u2.dept_id 
        LEFT JOIN ACT_HI_TASKINST tx ON tx.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND tx.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
            AND IF(tx.END_TIME_ IS NULL, 1, tx.END_TIME_ = (
                SELECT MAX(tt.END_TIME_) FROM ACT_HI_TASKINST tt 
                WHERE tt.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND tt.NAME_ IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))) 
        LEFT JOIN ACT_HI_VARINST vx ON vx.PROC_INST_ID_ = p.PROC_INST_ID_ 
            AND vx.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
            AND vx.LAST_UPDATED_TIME_ = (
                SELECT MAX(vv.LAST_UPDATED_TIME_) FROM ACT_HI_VARINST vv 
                WHERE vv.PROC_INST_ID_ = p.PROC_INST_ID_ 
                    AND vv.NAME_ IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963')) 
        LEFT JOIN system_users u3 ON u3.id = IFNULL(tx.ASSIGNEE_, vx.TEXT_)
        WHERE v1.ID_ IS NOT NULL AND p.PROC_INST_ID_ IN ("${ids}")`
    sql = `${sql}
            ${subsql}`
    const result = await query(sql)
    return result
}

actHiProcinstRepo.getFirstSelect = async (id) => {
    const sql = `SELECT v.TEXT_ AS val, v.NAME_ AS k FROM ACT_HI_VARINST v 
        WHERE v.PROC_INST_ID_ = ? AND (v.NAME_ IN (
                'Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c') 
            OR (v.NAME_ = 'F6c5mbuidfzfqjc' AND v.TEXT_ = '未选中'))`
    const result = await query(sql, [id])
    return result
}

actHiProcinstRepo.getFirstSelect1 = async (id) => {
    const sql = `SELECT v.TEXT_ AS val, v.NAME_ AS k FROM ACT_HI_VARINST v 
        WHERE v.PROC_INST_ID_ = ? AND (v.NAME_ IN (
                'Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 'Fy6xma3jakboekc') 
            OR (v.NAME_ IN ('Fxfrma3j75fse7c', 'F6c5mbuidfzfqjc') AND v.TEXT_ = '未选中'))`
    const result = await query(sql, [id])
    return result
}

actHiProcinstRepo.getSecondSelect = async (id) => {
    const sql = `SELECT v.TEXT_ AS val, v.NAME_ AS k FROM ACT_HI_VARINST v 
        WHERE v.PROC_INST_ID_ = ? AND (v.NAME_ IN (
                'F2lmma3petqpcwc', 'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 'Fnixma3nox6onmc') 
            OR (v.NAME_ = 'F64jmbuie9olqmc' AND v.TEXT_ = '未选中'))`
    const result = await query(sql, [id])
    return result
}

actHiProcinstRepo.getSecondSelect1 = async (id) => {
    const sql = `SELECT v.TEXT_ AS val, v.NAME_ AS k FROM ACT_HI_VARINST v 
        WHERE v.PROC_INST_ID_ = ? AND (v.NAME_ IN (
                'F2lmma3petqpcwc', 'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 'Fnixma3nox6onmc', 'Fy6xma3jakboekc') 
            OR (v.NAME_ IN ('Fxfrma3j75fse7c', 'F64jmbuie9olqmc') AND v.TEXT_ = '未选中'))`
    const result = await query(sql, [id])
    return result
}

actHiProcinstRepo.getThirdSelect = async (id) => {
    const sql = `SELECT v.TEXT_ AS val, v.NAME_ AS k FROM ACT_HI_VARINST v 
        WHERE v.PROC_INST_ID_ = ? AND (v.NAME_ IN (
                'F34mma3pf0egd0c', 'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc') 
            OR (v.NAME_ = 'Fxkxmbuiecz2qpc' AND v.TEXT_ = '未选中'))`
    const result = await query(sql, [id])
    return result
}

actHiProcinstRepo.getThirdSelect1 = async (id) => {
    const sql = `SELECT v.TEXT_ AS val, v.NAME_ AS k FROM ACT_HI_VARINST v 
        WHERE v.PROC_INST_ID_ = ? AND (v.NAME_ IN (
                'F34mma3pf0egd0c', 'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc', 'Fy6xma3jakboekc') 
            OR (v.NAME_ IN ('Fxfrma3j75fse7c', 'Fxkxmbuiecz2qpc') AND v.TEXT_ = '未选中'))`
    const result = await query(sql, [id])
    return result
}

module.exports = actHiProcinstRepo