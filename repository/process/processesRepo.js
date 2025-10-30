const { query } = require('../../model/dbConn')
const processesRepo = {}

const DEVELOPMENT_UID_FIELD = 'Fk0lmgyqg4d4abc'

processesRepo.getProcessNodeCount = async (typeList, start, end) => {
    let sql = '', params = [], result = [] 
    for (let i = 0; i < typeList.length; i++) {
        switch (typeList[i]) {
            case 'total': 
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.process_id) AS count, 'total' AS type, 
                        (CASE WHEN p.process_code IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN p.process_code IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN p.process_code IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                            WHEN p.username = '刘海涛' THEN '事业一部' 
                            WHEN p.username = '王洪彬' THEN '事业三部' 
                            WHEN p.username = '郑艳艳' THEN '企划部' 
                            WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' 
                                OR p.dept LIKE '%小红书%' THEN '事业三部' 
                            WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                                OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                            WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(vx.content, IF(p.process_code IN ('fttplc', 'fantuituipin'), '', p.username)) AS developer 
                    FROM processes p LEFT JOIN process_tasks tx ON tx.process_id = p.process_id 
                        AND tx.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND tx.end_time = (
                            SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                            AND tt.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))
                    LEFT JOIN process_info vx ON vx.process_id = p.process_id 
                        AND vx.field IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                    WHERE p.process_code IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND p.start_time BETWEEN "${start}" AND "${end}"
                    GROUP BY vx.content, p.username, p.process_code, p.dept  
                    UNION ALL`
                break
            case 'choose':                
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.process_id) AS count, 'choose' AS type, 
                        (CASE WHEN p.process_code IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN p.process_code IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN p.process_code IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                            WHEN p.username = '刘海涛' THEN '事业一部' 
                            WHEN p.username = '王洪彬' THEN '事业三部' 
                            WHEN p.username = '郑艳艳' THEN '企划部' 
                            WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' 
                                OR p.dept LIKE '%小红书%' THEN '事业三部' 
                            WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                                OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                            WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(vx.content, IF(p.process_code IN ('fttplc', 'fantuituipin'), '', p.username)) AS developer 
                    FROM processes p JOIN process_info v ON v.process_id = p.process_id
	                    AND v.field IN (
                            'Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 
                            'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 
                            'Fy6xma3jakboekc', 'F2lmma3petqpcwc', 
                            'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 
                            'Fnixma3nox6onmc', 'F34mma3pf0egd0c', 
                            'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc')
                        AND v.content IN ('是', '选中') 
                    LEFT JOIN process_tasks tx ON tx.process_id = p.process_id 
                        AND tx.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND tx.end_time = (
                            SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                            AND tt.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))
                    LEFT JOIN process_info vx ON vx.process_id = p.process_id 
                        AND vx.field IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                    WHERE p.process_code IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND p.start_time BETWEEN "${start}" AND "${end}" 
                    GROUP BY vx.content, p.username, p.process_code, p.dept  
                    UNION ALL`
                break
            case 'reject':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.process_id) AS count, 'reject' AS type, 
                        (CASE WHEN p.process_code IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN p.process_code IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN p.process_code IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                            WHEN p.username = '刘海涛' THEN '事业一部' 
                            WHEN p.username = '王洪彬' THEN '事业三部' 
                            WHEN p.username = '郑艳艳' THEN '企划部' 
                            WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' 
                                OR p.dept LIKE '%小红书%' THEN '事业三部' 
                            WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                                OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                            WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(vx.content, IF(p.process_code IN ('fttplc', 'fantuituipin'), '', p.username)) AS developer 
                    FROM processes p LEFT JOIN process_tasks tx ON tx.process_id = p.process_id 
                        AND tx.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND tx.end_time = (
                            SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                            AND tt.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))
                    LEFT JOIN process_info vx ON vx.process_id = p.process_id 
                        AND vx.field IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                    WHERE p.process_code IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') AND p.status IN (3,4)
	                    AND p.start_time BETWEEN "${start}" AND "${end}" 
                    GROUP BY vx.content, p.username, p.process_code, p.dept  
                    UNION ALL`
                break
            case 'select':
                sql = `${sql}
                    SELECT COUNT(1) AS count, 'select' AS type, 
                        (CASE WHEN p.process_code IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN p.process_code IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN p.process_code IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                            WHEN p.username = '刘海涛' THEN '事业一部' 
                            WHEN p.username = '王洪彬' THEN '事业三部' 
                            WHEN p.username = '郑艳艳' THEN '企划部' 
                            WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' 
                                OR p.dept LIKE '%小红书%' THEN '事业三部' 
                            WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                                OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                            WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' 
                                THEN '事业一部'
                            WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                            ELSE '未拉取到部门' END) AS division, 
                        IFNULL(vx.content, IF(p.process_code IN ('fttplc', 'fantuituipin'), '', p.username)) AS developer 
                    FROM processes p LEFT JOIN process_tasks t ON t.process_id = p.process_id 
	                    AND t.title IN (
                            '建立聚水潭信息并填写商品编码', '建立聚水潭信息并填写商品编码1', 
                            '建立聚水潭信息并填写商品编码2', '开发建立聚水潭信息填写预计销量表子表单', 
                            '聚水潭建立商品信息并填写商品编码') 
                        AND t.end_time = (
                            SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                                AND tt.title IN (
                                    '建立聚水潭信息并填写商品编码', '建立聚水潭信息并填写商品编码1', 
                                    '建立聚水潭信息并填写商品编码2', '开发建立聚水潭信息填写预计销量表子表单', 
                                    '聚水潭建立商品信息并填写商品编码')) 
                    LEFT JOIN process_tasks tx ON tx.process_id = p.process_id 
                        AND tx.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND tx.end_time = (
                            SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                            AND tt.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))
                    LEFT JOIN process_info vx ON vx.process_id = p.process_id 
                        AND vx.field IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                    WHERE p.process_code IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') AND p.status = 1                     
	                    AND t.id IS NULL AND p.start_time BETWEEN "${start}" AND "${end}" 
                    GROUP BY vx.content, p.username, p.process_code, p.dept 
                    UNION ALL`
                break
            case 'ip_review':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.process_id) AS count, 'ip_review' AS type, 
                        (CASE WHEN p.process_code IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN p.process_code IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN p.process_code IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                            WHEN p.username = '刘海涛' THEN '事业一部' 
                            WHEN p.username = '王洪彬' THEN '事业三部' 
                            WHEN p.username = '郑艳艳' THEN '企划部' 
                            WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' 
                                OR p.dept LIKE '%小红书%' THEN '事业三部' 
                            WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                                OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                            WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(vx.content, IF(p.process_code IN ('fttplc', 'fantuituipin'), '', p.username)) AS developer 
                    FROM processes p JOIN process_tasks t ON t.process_id = p.process_id 
	                    AND t.title IN ('IP设计监修', '设计监修通过并上传链图云') AND t.status = 1 
                        AND t.start_time = (
                            SELECT MAX(tt.start_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                                AND tt.title IN ('IP设计监修', '设计监修通过并上传链图云')) 
                    LEFT JOIN process_info vx ON vx.process_id = p.process_id 
                        AND vx.field IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                    WHERE p.process_code IN ('iptplc', 'iptplcxb') 
	                    AND p.start_time BETWEEN "${start}" AND "${end}" 
                    GROUP BY vx.content, p.username, p.process_code, p.dept  
                    UNION ALL`
                break
            case 'ip_design':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.process_id) AS count, 'ip_design' AS type, 
                        (CASE WHEN p.process_code IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN p.process_code IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN p.process_code IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                            WHEN p.username = '刘海涛' THEN '事业一部' 
                            WHEN p.username = '王洪彬' THEN '事业三部' 
                            WHEN p.username = '郑艳艳' THEN '企划部' 
                            WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' 
                                OR p.dept LIKE '%小红书%' THEN '事业三部' 
                            WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                                OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                            WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(vx.content, IF(p.process_code IN ('fttplc', 'fantuituipin'), '', p.username)) AS developer 
                    FROM processes p JOIN process_tasks t ON t.process_id = p.process_id AND t.status = 1 
                        AND t.title IN ('上传设计草图1', '上传设计草图', '北京上传设计草图', '杭州上传设计草图') 
                        AND t.start_time = (
                            SELECT MAX(tt.start_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                                AND tt.title IN ('上传设计草图1', '上传设计草图', '北京上传设计草图', '杭州上传设计草图')) 
                    LEFT JOIN process_info vx ON vx.process_id = p.process_id 
                        AND vx.field IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                    WHERE p.process_code IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin') 
	                    AND p.start_time BETWEEN "${start}" AND "${end}" 
                    GROUP BY vx.content, p.username, p.process_code, p.dept  
                    UNION ALL`
                break
            case 'sample':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.process_id) AS count, 'sample' AS type, 
                        (CASE WHEN p.process_code IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN p.process_code IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN p.process_code IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                            WHEN p.username = '刘海涛' THEN '事业一部' 
                            WHEN p.username = '王洪彬' THEN '事业三部' 
                            WHEN p.username = '郑艳艳' THEN '企划部' 
                            WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' 
                                OR p.dept LIKE '%小红书%' THEN '事业三部' 
                            WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                                OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                            WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(vx.content, IF(p.process_code IN ('fttplc', 'fantuituipin'), '', p.username)) AS developer 
                    FROM processes p JOIN process_tasks t ON t.process_id = p.process_id AND t.status = 1 
                        AND t.title IN ('工厂打样', '开发工厂打样起始时间2', '开发工厂打样起始时间') 
                        AND t.start_time = (
                            SELECT MAX(tt.start_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                                AND tt.title IN ('工厂打样', '开发工厂打样起始时间2', '开发工厂打样起始时间')) 
                    LEFT JOIN process_info vx ON vx.process_id = p.process_id 
                        AND vx.field IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                    WHERE p.process_code IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin') 
	                    AND p.start_time BETWEEN "${start}" AND "${end}" 
                    GROUP BY vx.content, p.username, p.process_code, p.dept  
                    UNION ALL`
                break
            case 'preorder':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.process_id) AS count, 'preorder' AS type, 
                        (CASE WHEN p.process_code IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN p.process_code IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN p.process_code IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                            WHEN p.username = '刘海涛' THEN '事业一部' 
                            WHEN p.username = '王洪彬' THEN '事业三部' 
                            WHEN p.username = '郑艳艳' THEN '企划部' 
                            WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' 
                                OR p.dept LIKE '%小红书%' THEN '事业三部' 
                            WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                                OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                            WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(vx.content, IF(p.process_code IN ('fttplc', 'fantuituipin'), '', p.username)) AS developer 
                    FROM processes p JOIN process_tasks t ON t.process_id = p.process_id AND t.status = 1
	                    AND IF(p.process_code IN ('iptplc', 'iptplcxb'), 
                            t.title IN ('事业部1是否订货', '事业部2是否订货', '事业部3是否订货'), 
		                    IF(p.process_code IN ('zytplc', 'ziyantuipin'), 
                                t.title IN ('事业部一是否订货', '事业部二是否订货', '事业部三是否订货'), 
			                    IF(p.process_code IN ('sctgtplc', 'shichangfenxituipin'), 
                                    t.title IN (
                                        '事业部一是否订货1', '事业部一是否订货2', 
                                        '事业部二是否订货1', '事业部二是否订货2', 
                                        '事业部三是否订货1', '事业部三是否订货2'), 
				                    IF(p.process_code IN ('gystplc', 'gongyingshangtuipin'), 
                                        t.title IN (
                                            '事业部一填写预计订货量', 
                                            '事业部二填写预计订货量', 
                                            '事业部三填写预计订货量'), 
					                    t.title IN (
                                            '事业部一填写订货量', '事业部一是否加单', 
                                            '事业部二填写订货量', '事业部二是否加单', 
                                            '事业部三填写订货量', '事业部三是否加单'))))) 
                        AND t.start_time = (
                            SELECT MAX(tt.start_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                                AND tt.title IN ('事业部1是否订货', '事业部2是否订货', '事业部3是否订货', 
                                    '事业部一是否订货1', '事业部一是否订货2', '事业部二是否订货1', 
                                    '事业部二是否订货2', '事业部三是否订货1', '事业部三是否订货2', 
                                    '事业部一填写预计订货量', '事业部二填写预计订货量', '事业部三填写预计订货量', 
                                    '事业部一填写订货量', '事业部一是否加单', '事业部二填写订货量', 
                                    '事业部二是否加单', '事业部三填写订货量', '事业部三是否加单')) 
                    LEFT JOIN process_tasks tx ON tx.process_id = p.process_id 
                        AND tx.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND tx.end_time = (
                            SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                            AND tt.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))
                    LEFT JOIN process_info vx ON vx.process_id = p.process_id 
                        AND vx.field IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                    WHERE p.process_code IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND p.start_time BETWEEN "${start}" AND "${end}" 
                    GROUP BY vx.content, p.username, p.process_code, p.dept  
                    UNION ALL`
                break
            case 'order':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.process_id) AS count, 'order' AS type, 
                        (CASE WHEN p.process_code IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN p.process_code IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN p.process_code IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                            WHEN p.username = '刘海涛' THEN '事业一部' 
                            WHEN p.username = '王洪彬' THEN '事业三部' 
                            WHEN p.username = '郑艳艳' THEN '企划部' 
                            WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' 
                                OR p.dept LIKE '%小红书%' THEN '事业三部' 
                            WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                                OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                            WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(vx.content, IF(p.process_code IN ('fttplc', 'fantuituipin'), '', p.username)) AS developer 
                    FROM processes p JOIN process_tasks t ON t.process_id = p.process_id AND t.status = 1
	                    AND t.title IN (
                            '货品汇总并判断订货量', '货品汇总判断订货量', 
                            '货品汇总判断订货量1', '货品汇总判断订货量2', 
                            '货品汇总判断订货量以及分配采购执行人', 
                            '货品汇总并判断订货量以及分配采购执行人', 
                            '货品汇总判断订货量以及分配采购执行人1', '货品汇总判断订货量以及分配采购执行人2') 
                        AND t.start_time = (
                            SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                            AND tt.title = t.title)
                    LEFT JOIN process_tasks tx ON tx.process_id = p.process_id 
                        AND tx.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND tx.end_time = (
                            SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                            AND tt.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))
                    LEFT JOIN process_info vx ON vx.process_id = p.process_id 
                        AND vx.field IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                    WHERE p.process_code IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND p.start_time BETWEEN "${start}" AND "${end}" 
                    GROUP BY vx.content, p.username, p.process_code, p.dept  
                    UNION ALL`
                break
            case 'purchase_order':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.process_id) AS count, 'purchase_order' AS type, 
                        (CASE WHEN p.process_code IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN p.process_code IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN p.process_code IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                            WHEN p.username = '刘海涛' THEN '事业一部' 
                            WHEN p.username = '王洪彬' THEN '事业三部' 
                            WHEN p.username = '郑艳艳' THEN '企划部' 
                            WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' 
                                OR p.dept LIKE '%小红书%' THEN '事业三部' 
                            WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                                OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                            WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(vx.content, IF(p.process_code IN ('fttplc', 'fantuituipin'), '', p.username)) AS developer 
                    FROM processes p JOIN process_tasks t ON t.process_id = p.process_id AND t.status = 1
	                    AND t.title IN (
                            '上传订货合同及填写预计到货时间', 
                            '填写订货合同1', '填写订货合同2', 
                            '填写订货合同' ,'填写合同', '采购执行人签订周转合同') 
                        AND t.start_time = (
                            SELECT MAX(tt.start_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                            AND tt.title = t.title)
                    LEFT JOIN process_tasks tx ON tx.process_id = p.process_id 
                        AND tx.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND tx.end_time = (
                            SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                            AND tt.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))
                    LEFT JOIN process_info vx ON vx.process_id = p.process_id 
                        AND vx.field IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                    WHERE p.process_code IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND p.start_time BETWEEN "${start}" AND "${end}" 
                    GROUP BY vx.content, p.username, p.process_code, p.dept  
                    UNION ALL`
                break
            case 'pre_vision':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.process_id) AS count, 'pre_vision' AS type, 
                        (CASE WHEN p.process_code IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN p.process_code IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN p.process_code IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                            WHEN p.username = '刘海涛' THEN '事业一部' 
                            WHEN p.username = '王洪彬' THEN '事业三部' 
                            WHEN p.username = '郑艳艳' THEN '企划部' 
                            WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' 
                                OR p.dept LIKE '%小红书%' THEN '事业三部' 
                            WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                                OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                            WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(vx.content, IF(p.process_code IN ('fttplc', 'fantuituipin'), '', p.username)) AS developer 
                    FROM processes p JOIN process_info v ON v.process_id = p.process_id 
	                    AND v.field IN (
                            'Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 
                            'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 
                            'Fy6xma3jakboekc', 'F2lmma3petqpcwc', 
                            'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 
                            'Fnixma3nox6onmc', 'F34mma3pf0egd0c', 
                            'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc')
                        AND v.content IN ('是', '选中')
                    LEFT JOIN process_info v1 ON v1.field IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc')
	                    AND v1.content = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.process_id)
                        AND EXISTS(
                            SELECT * FROM processes p1 WHERE p1.process_id = v1.process_id 
                                AND p1.process_code IN ('xbsjlc', 'form-110')) 
                    LEFT JOIN process_tasks tx ON tx.process_id = p.process_id 
                        AND tx.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND tx.end_time = (
                            SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                            AND tt.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))
                    LEFT JOIN process_info vx ON vx.process_id = p.process_id 
                        AND vx.field IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                    WHERE p.process_code IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND v1.id IS NULL AND p.start_time BETWEEN "${start}" AND "${end}" 
                    GROUP BY vx.content, p.username, p.process_code, p.dept  
                    UNION ALL`
                break
            case 'vision_running':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.process_id) AS count, 'vision_running' AS type, 
                        (CASE WHEN p.process_code IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN p.process_code IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN p.process_code IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                            WHEN p.username = '刘海涛' THEN '事业一部' 
                            WHEN p.username = '王洪彬' THEN '事业三部' 
                            WHEN p.username = '郑艳艳' THEN '企划部' 
                            WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' 
                                OR p.dept LIKE '%小红书%' THEN '事业三部' 
                            WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                                OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                            WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(vx.content, IF(p.process_code IN ('fttplc', 'fantuituipin'), '', p.username)) AS developer 
                    FROM processes p JOIN process_info v ON v.process_id = p.process_id 
	                    AND v.field IN (
                            'Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 
                            'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 
                            'Fy6xma3jakboekc', 'F2lmma3petqpcwc', 
                            'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 
                            'Fnixma3nox6onmc', 'F34mma3pf0egd0c', 
                            'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc')
                        AND v.content IN ('是', '选中') 
                    LEFT JOIN process_tasks tx ON tx.process_id = p.process_id 
                        AND tx.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND tx.end_time = (
                            SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                            AND tt.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))
                    LEFT JOIN process_info vx ON vx.process_id = p.process_id 
                        AND vx.field IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                    WHERE p.process_code IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND p.start_time BETWEEN "${start}" AND "${end}"                          
                        AND NOT EXISTS(SELECT * FROM process_info v1 
                            JOIN processes vv ON vv.process_id = v1.process_id AND vv.status = 2
                            WHERE v1.field IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc') AND v1.content = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.process_id))						
                        AND EXISTS(SELECT * FROM process_info v1 
                            JOIN processes vv ON vv.process_id = v1.process_id AND vv.status = 1
                            WHERE v1.field IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc') AND v1.content = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.process_id))
                    GROUP BY vx.content, p.username, p.process_code, p.dept  
                    UNION ALL`
                break
            case 'vision_completed':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.process_id) AS count, 'vision_completed' AS type, 
                        (CASE WHEN p.process_code IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN p.process_code IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN p.process_code IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                            WHEN p.username = '刘海涛' THEN '事业一部' 
                            WHEN p.username = '王洪彬' THEN '事业三部' 
                            WHEN p.username = '郑艳艳' THEN '企划部' 
                            WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' 
                                OR p.dept LIKE '%小红书%' THEN '事业三部' 
                            WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                                OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                            WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(vx.content, IF(p.process_code IN ('fttplc', 'fantuituipin'), '', p.username)) AS developer 
                    FROM processes p JOIN process_info v ON v.process_id = p.process_id 
	                    AND v.field IN (
                            'Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 
                            'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 
                            'Fy6xma3jakboekc', 'F2lmma3petqpcwc', 
                            'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 
                            'Fnixma3nox6onmc', 'F34mma3pf0egd0c', 
                            'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc')
                        AND v.content IN ('是', '选中') 
                    LEFT JOIN process_info v1 ON v1.field IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc')
	                    AND v1.content = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.process_id) 
                    LEFT JOIN process_tasks tx ON tx.process_id = p.process_id 
                        AND tx.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND tx.end_time = (
                            SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                            AND tt.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))
                    LEFT JOIN process_info vx ON vx.process_id = p.process_id 
                        AND vx.field IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                    WHERE p.process_code IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND p.start_time BETWEEN "${start}" AND "${end}"                          
                        AND EXISTS(SELECT * FROM process_info v1 
                            JOIN processes vv ON vv.process_id = v1.process_id AND vv.status = 2
                            WHERE v1.field IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc') AND v1.content = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.process_id)) 
                    GROUP BY vx.content, p.username, p.process_code, p.dept  
                    UNION ALL`
                break
            case 'plan_running':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.process_id) AS count, 'plan_running' AS type, 
                        (CASE WHEN p.process_code IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN p.process_code IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN p.process_code IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                            WHEN p.username = '刘海涛' THEN '事业一部' 
                            WHEN p.username = '王洪彬' THEN '事业三部' 
                            WHEN p.username = '郑艳艳' THEN '企划部' 
                            WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' 
                                OR p.dept LIKE '%小红书%' THEN '事业三部' 
                            WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                                OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                            WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(vx.content, IF(p.process_code IN ('fttplc', 'fantuituipin'), '', p.username)) AS developer 
                    FROM processes p JOIN process_info v ON v.process_id = p.process_id 
	                    AND v.field IN (
                            'Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 
                            'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 
                            'Fy6xma3jakboekc', 'F2lmma3petqpcwc', 
                            'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 
                            'Fnixma3nox6onmc', 'F34mma3pf0egd0c', 
                            'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc')
                        AND v.content IN ('是', '选中') 
                    LEFT JOIN process_tasks tx ON tx.process_id = p.process_id 
                        AND tx.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND tx.end_time = (
                            SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                            AND tt.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))
                    LEFT JOIN process_info vx ON vx.process_id = p.process_id 
                        AND vx.field IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                    WHERE p.process_code IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND p.start_time BETWEEN "${start}" AND "${end}"                          
                        AND NOT EXISTS(SELECT * FROM process_info v1 
                            JOIN processes vv ON vv.process_id = v1.process_id AND vv.status = 2
                            WHERE v1.field IN ('Frd7mdi5wj7jabc', 'Fci7mdcgb38yfcc') AND v1.content = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.process_id))						
                        AND EXISTS(SELECT * FROM process_info v1 
                            JOIN processes vv ON vv.process_id = v1.process_id AND vv.status = 1
                            WHERE v1.field IN ('Frd7mdi5wj7jabc', 'Fci7mdcgb38yfcc') AND v1.content = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.process_id))
                    GROUP BY vx.content, p.username, p.process_code, p.dept  
                    UNION ALL`
                break
            case 'plan_completed':
                sql = `${sql}
                    SELECT COUNT(DISTINCT p.process_id) AS count, 'plan_completed' AS type, 
                        (CASE WHEN p.process_code IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                            WHEN p.process_code IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                            WHEN p.process_code IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                            WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                            ELSE '反推推品' END) AS develop_type, 
                        (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                            WHEN p.username = '刘海涛' THEN '事业一部' 
                            WHEN p.username = '王洪彬' THEN '事业三部' 
                            WHEN p.username = '郑艳艳' THEN '企划部' 
                            WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' 
                                OR p.dept LIKE '%小红书%' THEN '事业三部' 
                            WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                                OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                            WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' 
                                THEN '事业一部'
                             WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                             ELSE '未拉取到部门' END) AS division, 
                        IFNULL(vx.content, IF(p.process_code IN ('fttplc', 'fantuituipin'), '', p.username)) AS developer 
                    FROM processes p JOIN process_info v ON v.process_id = p.process_id 
	                    AND v.field IN (
                            'Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 
                            'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 
                            'Fy6xma3jakboekc', 'F2lmma3petqpcwc', 
                            'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 
                            'Fnixma3nox6onmc', 'F34mma3pf0egd0c', 
                            'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc')
                        AND v.content IN ('是', '选中') 
                    LEFT JOIN process_tasks tx ON tx.process_id = p.process_id 
                        AND tx.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
                        AND tx.end_time = (
                            SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                            AND tt.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))
                    LEFT JOIN process_info vx ON vx.process_id = p.process_id 
                        AND vx.field IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
                    WHERE p.process_code IN ('sctgtplc', 'shichangfenxituipin', 
                        'iptplc', 'iptplcxb', 
                        'zytplc', 'ziyantuipin', 
                        'gystplc', 'gongyingshangtuipin', 
                        'fttplc', 'fantuituipin') 
	                    AND p.start_time BETWEEN "${start}" AND "${end}"                          
                        AND EXISTS(SELECT * FROM process_info v1 
                            JOIN processes vv ON vv.process_id = v1.process_id AND vv.status = 2
                            WHERE v1.field IN ('Frd7mdi5wj7jabc', 'Fci7mdcgb38yfcc') AND v1.content = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.process_id))
                    GROUP BY vx.content, p.username, p.process_code, p.dept  
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

processesRepo.getProcessInfo = async (removeCoupang, start, end, type, selectType, info, selectType1, info1) => {
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
            subsql = 'AND v4.id IS NOT NULL'
            break
        case 'reject':
            subsql = 'AND p.status IN (3,4)'
            break
        case 'select':
            subsql = 'AND t4.id IS NULL AND p.status = 1'
            break
        case 'ip_review':
            subsql = 'AND t5.id IS NOT NULL'
            break
        case 'ip_design':
            subsql = 'AND t6.id IS NOT NULL'
            break
        case 'sample':
            subsql = 'AND t7.id IS NOT NULL'
            break
        case 'preorder':
            subsql = 'AND t8.id IS NOT NULL'
            break
        case 'order':
            subsql = 'AND t9.id IS NOT NULL'
            break
        case 'purchase_order':
            subsql = 'AND t10.id IS NOT NULL'
            break
    }
    if (removeCoupang) subsql = `${subsql} AND p.dept NOT LIKE '%跨境%'`
    if (selectType == 'developer') {
        subsql = `${subsql} 
                AND IFNULL(tx.username, IF(p.process_code IN ('fttplc', 'fantuituipin'), '', p.username)) = "${info}"`
    } 
    if (selectType == 'division' || selectType1 == 'division') {
        subsql = `${subsql} 
                AND (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                    WHEN p.username = '刘海涛' THEN '事业一部' 
                    WHEN p.username = '王洪彬' THEN '事业三部' 
                    WHEN p.username = '郑艳艳' THEN '企划部' 
                    WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' 
                        OR p.dept LIKE '%小红书%' THEN '事业三部' 
                    WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                        OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                    WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' 
                        THEN '事业一部'
                        WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                        ELSE '' END) = "${selectType == 'division' ? info : info1}"`
    } 
    if (selectType == 'develop_type' || selectType1 == 'develop_type') {
        subsql = `${subsql} 
                AND (CASE WHEN p.process_code IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                    WHEN p.process_code IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                    WHEN p.process_code IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                    WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                    ELSE '反推推品' END) = "${selectType == 'develop_type' ? info : info1}"`
    }
    if (selectType == 'select_division') {
        subsql = `${subsql} 
                AND p.process_id IN ("${info}")`
    }
    let sql = `SELECT p.title, p.process_id AS id, v16.content AS image, IFNULL(v15.content, '') AS spu, 
            CASE WHEN p.process_code IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                WHEN p.process_code IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                WHEN p.process_code IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                ELSE '反推推品' END AS type, 
            IFNULL(tx.username, IF(p.process_code IN ('fttplc', 'fantuituipin'), '', p.username)) as developer, 
            p.username, IFNULL(v12.content, '') AS platform, 
            (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                WHEN p.username = '刘海涛' THEN '事业一部' 
                WHEN p.username = '王洪彬' THEN '事业三部' 
                WHEN p.username = '郑艳艳' THEN '企划部' 
                WHEN p.username = '鲁红旺' THEN '货品部' 
                WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' OR p.dept LIKE '%小红书%' THEN '事业三部' 
                WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                    OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' THEN '事业一部' 
                WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                ELSE '' END) AS dept, p.status AS process_status, 
            t.end_time AS first_time, 
            t1.end_time AS second_time, 
            t2.end_time AS third_time, 
            v3.content AS info, (
                SELECT vv1.status FROM process_info vv JOIN processes vv1 ON vv.process_id = vv1.process_id 
                WHERE vv.field IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc')
	                AND vv.content = CONCAT('http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', 
                        p.process_id) 
                ORDER BY vv1.status DESC LIMIT 1 
            ) AS vision_status, IFNULL(t3.title, '') AS node, 
            (CASE WHEN t3.username = '陆瑶' THEN '事业二部' 
                WHEN t3.username = '刘海涛' THEN '事业一部' 
                WHEN t3.username = '王洪彬' THEN '事业三部' 
                WHEN t3.username = '郑艳艳' THEN '企划部' 
                WHEN t3.username = '鲁红旺' THEN '货品部' 
                WHEN t3.dept LIKE '%天猫%' OR t3.dept LIKE '%淘工厂%' OR t3.dept LIKE '%小红书%' THEN '事业三部' 
                WHEN t3.dept LIKE '%京东%' OR t3.dept LIKE '%抖音%' OR t3.dept LIKE '%1688%' 
                    OR t3.dept LIKE '%唯品会%' OR t3.dept LIKE '%得物%' THEN '事业二部' 
                WHEN t3.dept LIKE '%拼多多%' OR t3.dept LIKE '%跨境%' OR t3.dept LIKE '%猫超%' THEN '事业一部' 
                WHEN t3.dept LIKE '%开发%' OR t3.dept LIKE '%企划%' OR t3.dept LIKE '%市场%' THEN '企划部' 
                WHEN t3.dept LIKE '%采购%' OR t3.dept LIKE '%物流%' OR t3.dept LIKE '%库房%' 
                    OR t3.dept LIKE '%品控%' THEN '货品部' 
                WHEN t3.dept LIKE '%客服%' THEN '客服部' WHEN t3.dept LIKE '%摄影%' OR t3.dept LIKE '%视觉%' 
                    OR t3.dept LIKE '%设计%' THEN '视觉部' 
                WHEN t3.dept LIKE '%人事%' THEN '人事部' 
                WHEN t3.dept LIKE '%数据%' THEN '数据中台' 
                WHEN t3.dept LIKE '%财务%' THEN '财务部' 
                ELSE '' END) AS node_dept, IFNULL(t3.username, '') AS user, 
            t3.start_time AS due_start, p.start_time, IF(p.status IN (2, 3, 4), 
                (SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id), 
                null) AS end_time
        FROM processes p LEFT JOIN process_tasks tx ON tx.process_id = p.process_id 
            AND tx.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
            AND tx.end_time = (SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                AND tt.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))
        LEFT JOIN process_info v1 ON v1.process_id = p.process_id 
            AND v1.field IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
        LEFT JOIN process_tasks t ON t.process_id = p.process_id AND t.status = 2 
            AND IF(p.process_code IN ('iptplc', 'iptplcxb'), t.title = '事业部1是否订货', 
                IF(p.process_code IN ('zytplc', 'ziyantuipin'), t.title = '事业部一是否订货', 
                    IF(p.process_code IN ('sctgtplc', 'shichangfenxituipin'), 
                        t.title IN ('事业部一是否订货1', '事业部一是否订货2'), 
                        IF(p.process_code IN ('gystplc', 'gongyingshangtuipin'), t.title = '事业部一审核市场分析', 
                            t.title IN ('事业部一是否选中', '事业部一是否加单', '事业部一样品是否选中') 
                                OR ((p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%') 
                                    AND t.title IN ('运营是否选中', '反选运营确认样品是否选中')))))) 
            AND t.end_time = (
                SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                AND (tt.title IN ('事业部1是否订货', '事业部一是否订货', '事业部一是否订货1', 
                    '事业部一是否订货2', '事业部一审核市场分析', '事业部一是否选中', 
                    '事业部一是否加单', '事业部一样品是否选中') OR (
                    (p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%') 
                    AND tt.title IN ('运营是否选中', '反选运营确认样品是否选中'))))
        LEFT JOIN process_tasks t1 ON t1.process_id = p.process_id AND t1.status = 2 
            AND IF(p.process_code IN ('iptplc', 'iptplcxb'), t1.title = '事业部2是否订货', 
                IF(p.process_code IN ('zytplc', 'ziyantuipin'), t1.title = '事业部二是否订货', 
                    IF(p.process_code IN ('sctgtplc', 'shichangfenxituipin'), 
                        t1.title IN ('事业部二是否订货1', '事业部二是否订货2'), 
                        IF(p.process_code IN ('gystplc', 'gongyingshangtuipin'), t1.title = '事业部二审核市场分析', 
                            t1.title IN ('事业部二是否选中', '事业部二是否加单', '事业部二样品是否选中') 
                                OR ((p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                                    OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%') 
                                    AND t1.title IN ('运营是否选中', '反选运营确认样品是否选中')))))) 
            AND t1.end_time = (
                SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                AND (tt.title IN ('事业部2是否订货', '事业部二是否订货', '事业部二是否订货1', 
                    '事业部二是否订货2', '事业部二审核市场分析', '事业部二是否选中', 
                    '事业部二是否加单', '事业部二样品是否选中') OR (
                    (p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                        OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%') 
                    AND tt.title IN ('运营是否选中', '反选运营确认样品是否选中'))))
        LEFT JOIN process_tasks t2 on t2.process_id = p.process_id AND t2.status = 2 
            AND IF(p.process_code IN ('iptplc', 'iptplcxb'), t2.title = '事业部3是否订货', 
                IF(p.process_code IN ('zytplc', 'ziyantuipin'), t2.title = '事业部三是否订货', 
                    IF(p.process_code IN ('sctgtplc', 'shichangfenxituipin'), 
                        t2.title IN ('事业部三是否订货1', '事业部三是否订货2'), 
                        IF(p.process_code IN ('gystplc', 'gongyingshangtuipin'), t2.title = '事业部三审核市场分析', 
                            t2.title IN ('事业部三是否选中', '事业部三是否加单', '事业部三样品是否选中') 
                            OR ((p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' OR p.dept LIKE '%小红书%') 
                                AND t2.title IN ('运营是否选中', '反选运营确认样品是否选中')))))) 
            AND t2.end_time = (
                SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                AND (tt.title IN ('事业部3是否订货', '事业部三是否订货', '事业部三是否订货1', 
                    '事业部三是否订货2', '事业部三审核市场分析', '事业部三是否选中', 
                    '事业部三是否加单', '事业部三样品是否选中') OR (
                    (p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' OR p.dept LIKE '%小红书%') 
                    AND tt.title IN ('运营是否选中', '反选运营确认样品是否选中'))))
        LEFT JOIN process_tasks t3 ON t3.process_id = p.process_id AND t3.status = 1 
        LEFT JOIN process_tasks t4 ON t4.process_id = p.process_id 
            AND t4.title IN (
                '建立聚水潭信息并填写商品编码', '建立聚水潭信息并填写商品编码1', 
                '建立聚水潭信息并填写商品编码2', '开发建立聚水潭信息填写预计销量表子表单', 
                '聚水潭建立商品信息并填写商品编码') 
            AND t4.end_time = (
                SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                AND tt.title = t4.title)
        LEFT JOIN process_info v3 ON v3.process_id = p.process_id
            AND v3.field IN ('Fyf1ma3jfyi7fuc', 'Fnt5ma3psjitfcc', 'Fo5uma263lluhdc') 
        LEFT JOIN process_info v4 ON v4.process_id = p.process_id
            AND v4.field IN (
                'Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 
                'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 
                'Fy6xma3jakboekc', 'F2lmma3petqpcwc', 
                'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 
                'Fnixma3nox6onmc', 'F34mma3pf0egd0c', 
                'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc')
            AND v4.content IN ('是', '选中')      
        LEFT JOIN process_tasks t5 ON t5.process_id = p.process_id AND t5.status = 1 
            AND t5.title IN ('IP设计监修', '设计监修通过并上传链图云') 
            AND t5.start_time = (
                SELECT MAX(tt.start_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                AND tt.title = t5.title)
        LEFT JOIN process_tasks t6 ON t6.process_id = p.process_id AND t6.status = 1 
            AND t6.title IN ('上传设计草图1', '上传设计草图', '北京上传设计草图', '杭州上传设计草图') 
            AND t6.start_time = (
                SELECT MAX(tt.start_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                AND tt.title = t6.title)
        LEFT JOIN process_tasks t7 ON t7.process_id = p.process_id AND t7.status = 1 
            AND t7.title IN ('工厂打样', '开发工厂打样起始时间2', '开发工厂打样起始时间') 
            AND t7.start_time = (
                SELECT MAX(tt.start_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                AND tt.title = t7.title)
        LEFT JOIN process_tasks t8 ON t8.process_id = p.process_id AND t8.status = 1
            AND IF(p.process_code IN ('iptplc', 'iptplcxb'), 
                t8.title IN ('事业部1是否订货', '事业部2是否订货', '事业部3是否订货'), 
                IF(p.process_code IN ('zytplc', 'ziyantuipin'), 
                    t8.title IN ('事业部一是否订货', '事业部二是否订货', '事业部三是否订货'), 
                    IF(p.process_code IN ('sctgtplc', 'shichangfenxituipin'), 
                        t8.title IN (
                            '事业部一是否订货1', '事业部一是否订货2', 
                            '事业部二是否订货1', '事业部二是否订货2', 
                            '事业部三是否订货1', '事业部三是否订货2'), 
                        IF(p.process_code IN ('gystplc', 'gongyingshangtuipin'), 
                            t8.title IN (
                                '事业部一填写预计订货量', 
                                '事业部二填写预计订货量', 
                                '事业部三填写预计订货量'), 
                            t8.title IN (
                                '事业部一填写订货量', '事业部一是否加单', 
                                '事业部二填写订货量', '事业部二是否加单', 
                                '事业部三填写订货量', '事业部三是否加单'))))) 
        LEFT JOIN process_tasks t9 ON t9.process_id = p.process_id AND t9.status = 1
            AND t9.title IN (
                '货品汇总并判断订货量', '货品汇总判断订货量', 
                '货品汇总判断订货量1', '货品汇总判断订货量2', 
                '货品汇总判断订货量以及分配采购执行人', 
                '货品汇总并判断订货量以及分配采购执行人', 
                '货品汇总判断订货量以及分配采购执行人1', '货品汇总判断订货量以及分配采购执行人2') 
        LEFT JOIN process_tasks t10 ON t10.process_id = p.process_id AND t10.status = 1
            AND t10.title IN (
                '上传订货合同及填写预计到货时间', 
                '填写订货合同1', '填写订货合同2', 
                '填写订货合同' ,'填写合同', '采购执行人签订周转合同') 
        LEFT JOIN process_info v12 ON v12.process_id = p.process_id 
            AND v12.field = 'Fj1ama2csbpoabc' 
        LEFT JOIN process_info v15 ON v15.process_id = p.process_id 
            AND v15.field IN (
                'F0fpmc8rlpolpbc', 'Frwsmc8rphh2rsc', 'Fylnmc8v515dm8c', 'Fwyzmc8v5dpdnxc', 'F6mfmc8v5qefpmc') 
        LEFT JOIN process_info v16 ON v16.process_id = p.process_id 
            AND v16.field IN ('Cfidpl3a7e5tm', 'Cfidpj2f10qqm', 'Cfidv84ga4ncy') 
            AND v16.content IS NOT NULL
        WHERE p.process_code IN ('sctgtplc', 'shichangfenxituipin', 
            'iptplc', 'iptplcxb', 
            'zytplc', 'ziyantuipin', 
            'gystplc', 'gongyingshangtuipin', 
            'fttplc', 'fantuituipin') 
            AND p.start_time BETWEEN "${start}" AND "${end}" `
    if (subsql?.length) {
        sql = `${sql}
                ${subsql} `
    }
    sql = `${sql}           
            ORDER BY p.start_time, t.start_time`
    const result = await query(sql)
    return result
}

processesRepo.getProcessInfo1 = async (removeCoupang, type, ids) => {
    let subsql = ''
    if (removeCoupang) subsql = `AND p.dept NOT LIKE '%跨境%'`
    if (type == 'vision_running') 
        subsql = `${subsql} AND NOT EXISTS(SELECT * FROM process_info v1 
                            JOIN processes vv ON vv.process_id = v1.process_id AND vv.status = 2
                            WHERE v1.field IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc') AND v1.content = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.process_id))						
                        AND EXISTS(SELECT * FROM process_info v1 
                            JOIN processes vv ON vv.process_id = v1.process_id AND vv.status = 1
                            WHERE v1.field IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc') AND v1.content = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.process_id))`
    else subsql = `${subsql} AND EXISTS(SELECT * FROM process_info v1 
                            JOIN processes vv ON vv.process_id = v1.process_id AND vv.status = 2
                            WHERE v1.field IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc') AND v1.content = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.process_id)) `
    let sql = `SELECT p.title, CONCAT('http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', 
                p.process_id) AS link, CONCAT(
                'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p1.process_id) 
            AS vision_link, v16.content AS image, IFNULL(v15.content, '') AS spu, 
            p1.username, (CASE WHEN p1.dept LIKE '%天猫%' THEN '王洪彬事业部-天猫' 
                WHEN p1.dept LIKE '%淘工厂%' THEN '王洪彬事业部-淘工厂' 
                WHEN p1.dept LIKE '%小红书%' THEN '王洪彬事业部-天猫垂类店、小红书' 
                WHEN p1.dept LIKE '%京东%' THEN '陆瑶事业部-京东' 
                WHEN p1.dept LIKE '%抖音%' THEN '陆瑶事业部-抖音、快手' 
                WHEN p1.dept LIKE '%1688%' THEN '陆瑶事业部-1688' 
                WHEN p1.dept LIKE '%唯品会%' OR p1.dept LIKE '%得物%' THEN '陆瑶事业部-得物、唯品会' 
                WHEN p1.dept LIKE '%拼多多%' THEN '刘海涛事业部-拼多多' 
                WHEN p1.dept LIKE '%跨境%' THEN '刘海涛事业部-coupang' 
                WHEN p1.dept LIKE '%猫超%' THEN '刘海涛事业部-天猫超市' ELSE '' END) AS platform, 
            (CASE WHEN p1.dept LIKE '%天猫%' OR p1.dept LIKE '%淘工厂%' OR p1.dept LIKE '%小红书%' THEN '事业三部' 
                WHEN p1.dept LIKE '%京东%' OR p1.dept LIKE '%抖音%' OR p1.dept LIKE '%1688%' 
                    OR p1.dept LIKE '%唯品会%' OR p1.dept LIKE '%得物%' THEN '事业二部' 
                WHEN p1.dept LIKE '%拼多多%' OR p1.dept LIKE '%跨境%' OR p1.dept LIKE '%猫超%' THEN '事业一部' 
                ELSE '' END) AS dept, (CASE p1.status WHEN 1 THEN '审批中' WHEN 2 THEN '审批通过' 
                    WHEN 3 THEN '审批不通过' WHEN 4 THEN '取消' ELSE '未发起' END) AS process_status, 
            IFNULL(t.title, '') AS node, 
            (CASE WHEN t.username = '陆瑶' THEN '事业二部' 
                WHEN t.username = '刘海涛' THEN '事业一部' 
                WHEN t.username = '王洪彬' THEN '事业三部' 
                WHEN t.dept LIKE '%天猫%' OR t.dept LIKE '%淘工厂%' OR t.dept LIKE '%小红书%' THEN '事业三部' 
                WHEN t.dept LIKE '%京东%' OR t.dept LIKE '%抖音%' OR t.dept LIKE '%1688%' 
                    OR t.dept LIKE '%唯品会%' OR t.dept LIKE '%得物%' THEN '事业二部' 
                WHEN t.dept LIKE '%拼多多%' OR t.dept LIKE '%跨境%' OR t.dept LIKE '%猫超%' THEN '事业一部' 
                WHEN t.dept LIKE '%摄影%' OR t.dept LIKE '%视觉%' OR t.dept LIKE '%设计%' THEN '视觉部' 
                ELSE '' END) AS node_dept, IFNULL(t.username, '') AS user, 
            t.start_time AS due_start, p1.start_time, p1.end_time 
        FROM processes p JOIN process_info v1 ON v1.field IN ('Fyj3mbotfsegk0c', 'F7o7mdpdu8lmjvc')
            AND v1.content = CONCAT(
                'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.process_id) 
        JOIN processes p1 ON p1.process_id = v1.process_id 
        LEFT JOIN process_tasks t ON t.process_id = p1.process_id AND t.status = 1 
        LEFT JOIN process_info v15 ON v15.process_id = p.process_id 
            AND v15.field IN (
                'F0fpmc8rlpolpbc', 'Frwsmc8rphh2rsc', 'Fylnmc8v515dm8c', 'Fwyzmc8v5dpdnxc', 'F6mfmc8v5qefpmc') 
        LEFT JOIN process_info v16 ON v16.process_id = p.process_id 
            AND v16.field IN ('Cfidpl3a7e5tm', 'Cfidpj2f10qqm', 'Cfidv84ga4ncy') 
            AND v16.content IS NOT NULL 
        LEFT JOIN process_tasks tx ON tx.process_id = p.process_id 
            AND tx.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
            AND tx.end_time = (SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                AND tt.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))
        LEFT JOIN process_info vx ON vx.process_id = p.process_id 
            AND vx.field IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
        WHERE v1.id IS NOT NULL AND p.process_id IN ("${ids}")`
    sql = `${sql}
            ${subsql}`
    const result = await query(sql)
    return result
}

processesRepo.getProcessInfo2 = async (removeCoupang, type, ids) => {
    let subsql = ''
    if (removeCoupang) subsql = `AND p.dept NOT LIKE '%跨境%'`
    if (type == 'plan_running') 
        subsql = `${subsql} AND NOT EXISTS(SELECT * FROM process_info v1 
                            JOIN processes vv ON vv.process_id = v1.process_id AND vv.status = 2
                            WHERE v1.field IN ('Frd7mdi5wj7jabc', 'Fci7mdcgb38yfcc') AND v1.content = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.process_id))						
                        AND EXISTS(SELECT * FROM process_info v1 
                            JOIN processes vv ON vv.process_id = v1.process_id AND vv.status = 1
                            WHERE v1.field IN ('Frd7mdi5wj7jabc', 'Fci7mdcgb38yfcc') AND v1.content = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.process_id))`
    else subsql = `${subsql} AND EXISTS(SELECT * FROM process_info v1 
                            JOIN processes vv ON vv.process_id = v1.process_id AND vv.status = 2
                            WHERE v1.field IN ('Frd7mdi5wj7jabc', 'Fci7mdcgb38yfcc') AND v1.content = CONCAT(
                            'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.process_id))`
    let sql = `SELECT p.title, CONCAT('http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', 
                p.process_id) AS link, CONCAT(
                'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p1.process_id) 
            AS plan_link, v16.content AS image, IFNULL(v15.content, '') AS spu,             
            v4.content AS division, IF(v5.content IS NOT NULL, (
                SELECT nickname FROM system_users WHERE id = v5.content), '') AS operator, 
            (CASE p1.status WHEN 1 THEN '审批中' WHEN 2 THEN '审批通过' WHEN 3 THEN '审批不通过' 
                WHEN 4 THEN '取消' ELSE '未发起' END) AS process_status, IFNULL(t.NAME_, '') AS node, 
            (CASE WHEN t.username = '陆瑶' THEN '事业二部' 
                WHEN t.username = '刘海涛' THEN '事业一部' 
                WHEN t.username = '王洪彬' THEN '事业三部' 
                WHEN t.dept LIKE '%天猫%' OR t.dept LIKE '%淘工厂%' OR t.dept LIKE '%小红书%' THEN '事业三部' 
                WHEN t.dept LIKE '%京东%' OR t.dept LIKE '%抖音%' OR t.dept LIKE '%1688%' 
                    OR t.dept LIKE '%唯品会%' OR t.dept LIKE '%得物%' THEN '事业二部' 
                WHEN t.dept LIKE '%拼多多%' OR t.dept LIKE '%跨境%' OR t.dept LIKE '%猫超%' THEN '事业一部' 
                WHEN t.dept LIKE '%摄影%' OR t.dept LIKE '%视觉%' OR t.dept LIKE '%设计%' THEN '视觉部' 
                ELSE '' END) AS node_dept, IFNULL(t.username, '') AS user, 
            t.start_time AS due_start, p1.start_time, p1.end_time AS end_time 
        FROM processes p JOIN process_info v1 ON v1.field IN ('Frd7mdi5wj7jabc', 'Fci7mdcgb38yfcc')
            AND v1.content = CONCAT(
                'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=', p.process_id)
        JOIN processes p1 ON p1.process_id = v1.process_id 
        JOIN process_info v4 ON v4.process_id = p1.process_id 
            AND v4.field = 'Fdmmmdcgbkkwffc' 
        LEFT JOIN process_info v5 ON v5.process_id = p1.process_id 
            AND v5.field = 'Cfidn1wi51uek' 
        LEFT JOIN process_tasks t ON t.process_id = p1.process_id AND t.status = 1 
        LEFT JOIN process_info v15 ON v15.process_id = p.process_id 
            AND v15.field IN (
                'F0fpmc8rlpolpbc', 'Frwsmc8rphh2rsc', 'Fylnmc8v515dm8c', 'Fwyzmc8v5dpdnxc', 'F6mfmc8v5qefpmc') 
        LEFT JOIN process_info v16 ON v16.process_id = p.process_id 
            AND v16.field IN ('Cfidpl3a7e5tm', 'Cfidpj2f10qqm', 'Cfidv84ga4ncy') 
            AND v16.content IS NOT NULL 
        LEFT JOIN process_tasks tx ON tx.process_id = p.process_id 
            AND tx.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
            AND tx.end_time = (SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                AND tt.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))
        LEFT JOIN process_info vx ON vx.process_id = p.process_id 
            AND vx.field IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
        WHERE v1.id IS NOT NULL AND p.process_id IN ("${ids}")`
    sql = `${sql}
            ${subsql}`
    const result = await query(sql)
    return result
}

processesRepo.getProcessSelectedCount = async (start, end, removeCoupang) => {
    let subsql = ''
    if (removeCoupang) subsql = `AND p.dept NOT LIKE '%跨境%'`
    const sql = `SELECT id, type FROM (SELECT id, (CASE WHEN name IN (
            'Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c') THEN 1 
        WHEN name IN ('F2lmma3petqpcwc', 'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 'Fnixma3nox6onmc') THEN 2 
        WHEN name IN ('F34mma3pf0egd0c', 'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc') THEN 3 
        ELSE (CASE division WHEN '事业一部' THEN 1 WHEN '事业二部' THEN 2 ELSE 3 END) END) AS type FROM (
            SELECT p.process_id AS id, (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                    WHEN p.username = '刘海涛' THEN '事业一部' 
                    WHEN p.username = '王洪彬' THEN '事业三部' 
                    WHEN p.username = '郑艳艳' THEN '企划部' 
                    WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' 
                        OR p.dept LIKE '%小红书%' THEN '事业三部' 
                    WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                        OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                    WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' 
                        THEN '事业一部'
                        WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                        ELSE '' END) AS division, v.field AS name
            FROM processes p JOIN process_info v ON v.process_id = p.process_id
                AND v.field IN ('Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 
                    'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 
                    'Fy6xma3jakboekc', 
                    'F2lmma3petqpcwc', 
                    'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 
                    'Fnixma3nox6onmc', 
                    'F34mma3pf0egd0c', 
                    'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc')
                AND v.content IN ('是', '选中') 
            WHERE p.process_code IN ('sctgtplc', 'shichangfenxituipin', 
                'iptplc', 'iptplcxb', 
                'zytplc', 'ziyantuipin', 
                'gystplc', 'gongyingshangtuipin', 
                'fttplc', 'fantuituipin') 
                AND p.start_time BETWEEN ? AND ? ${subsql}) a 
            ORDER BY id) b GROUP BY id, type ORDER BY id, type`
    const result = await query(sql, [start, end])
    return result
}

processesRepo.getSelectedProcessSkuInfo = async (removeCoupang, start, end, selectType, info) => {
    let subsql = ''
    if (removeCoupang) subsql = `AND p.dept NOT LIKE '%跨境%'`
    let sql = `SELECT p.process_id AS id, v1.content AS info, 
            (CASE WHEN p.process_code IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                WHEN p.process_code IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                WHEN p.process_code IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                ELSE '反推推品' END) AS develop_type, 
            (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                WHEN p.username = '刘海涛' THEN '事业一部' 
                WHEN p.username = '王洪彬' THEN '事业三部' 
                WHEN p.username = '郑艳艳' THEN '企划部' 
                WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' 
                    OR p.dept LIKE '%小红书%' THEN '事业三部' 
                WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                    OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' 
                    THEN '事业一部'
                    WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                    ELSE '' END) AS division, 
            IFNULL(vx.content, IF(p.process_code IN ('fttplc', 'fantuituipin'), '', p.username)) AS developer 
        FROM processes p JOIN process_info v ON v.process_id = p.process_id
            AND v.field IN ('Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 
                'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 
                'Fy6xma3jakboekc', 'F2lmma3petqpcwc', 
                'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 
                'Fnixma3nox6onmc', 'F34mma3pf0egd0c', 
                'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc')
            AND v.content IN ('是', '选中') 
        LEFT JOIN process_info v1 ON v1.process_id = p.process_id 
            AND v1.field IN ('Fyf1ma3jfyi7fuc', 'Fnt5ma3psjitfcc', 'Fo5uma263lluhdc')
            AND v1.content IS NOT NULL  
        LEFT JOIN process_tasks tx ON tx.process_id = p.process_id 
            AND tx.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
            AND tx.end_time = (SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.process_id = p.process_id 
                AND tt.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到'))
        LEFT JOIN process_info vx ON vx.process_id = p.process_id 
            AND vx.field IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
        WHERE p.process_code IN ('sctgtplc', 'shichangfenxituipin', 
            'iptplc', 'iptplcxb', 
            'zytplc', 'ziyantuipin', 
            'gystplc', 'gongyingshangtuipin', 
            'fttplc', 'fantuituipin') 
            AND p.start_time BETWEEN ? AND ? ${subsql}`
    if (selectType == 'developer') {
        sql = `${sql} 
                AND IFNULL(vx.content, IF(p.process_code IN ('fttplc', 'fantuituipin'), '', p.username)) = "${info}"`
    }
    if (selectType == 'division') {
        sql = `${sql} 
                AND (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                    WHEN p.username = '刘海涛' THEN '事业一部' 
                    WHEN p.username = '王洪彬' THEN '事业三部' 
                    WHEN p.username = '郑艳艳' THEN '企划部' 
                    WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' 
                        OR p.dept LIKE '%小红书%' THEN '事业三部' 
                    WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                        OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                    WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' 
                        THEN '事业一部'
                        WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                        ELSE '' END) = "${info}"`
    }
    if (selectType == 'develop_type') {
        sql = `${sql} 
                AND (CASE WHEN p.process_code IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                    WHEN p.process_code IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                    WHEN p.process_code IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                    WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                    ELSE '反推推品' END) = "${info}"`
    }
    const result = await query(sql, [start, end])
    return result
}

processesRepo.getGoodsOptimizeInfo = async (shopNames, userNames, is_new) => {
    let subsql = shopNames?.length ? `AND d.shop_name IN (${shopNames})` : `AND d.operator IN (${userNames})`
    subsql = is_new ? `${subsql} 
        AND IFNULL(s.create_time, d.onsale_date) >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY)` : 
        `${subsql} 
        AND IFNULL(s.create_time, d.onsale_date) < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY)`
    const sql = `SELECT IFNULL(SUM(count), 0) AS count, product_stage, type FROM (
        SELECT COUNT(1) AS count, IF(d.is_circulation = '是', '流转', d.product_stage) AS product_stage, 
            'running_num' AS type FROM processes p 
        JOIN process_tasks t ON t.process_id = p.process_id AND t.title = '天猫优化动作完成确认' AND t.status = 1
        JOIN process_info pi ON pi.process_id = p.process_id AND pi.field = 'textField_liihs7kw'
        JOIN dianshang_operation_attribute d ON d.goods_id = pi.content 
            AND d.platform = '天猫部' AND d.goods_id IS NOT NULL
            AND (d.link_state != '下架' OR d.link_state IS NULL)
        LEFT JOIN (SELECT goods_id, MIN(create_time) AS create_time 
            FROM jst_goods_sku WHERE is_shelf = '是' GROUP BY goods_id) s ON s.goods_id = d.goods_id
        WHERE p.process_code = 'form-86' ${subsql} 
            AND p.start_time BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY) AND NOW() 
        GROUP BY IF(d.is_circulation = '是', '流转', d.product_stage)
        UNION ALL
        SELECT COUNT(1) AS count, IF(d.is_circulation = '是', '流转', d.product_stage) AS product_stage, 
            'success_num' AS type FROM processes p 
        JOIN process_tasks t ON t.process_id = p.process_id AND t.title = '天猫项目负责人审核' AND t.status = 2 
        JOIN process_info pi ON pi.process_id = p.process_id AND pi.field = 'textField_liihs7kw'
        JOIN dianshang_operation_attribute d ON d.goods_id = pi.content
            AND d.platform = '天猫部' AND d.goods_id IS NOT NULL
            AND (d.link_state != '下架' OR d.link_state IS NULL)
        LEFT JOIN (SELECT goods_id, MIN(create_time) AS create_time 
            FROM jst_goods_sku WHERE is_shelf = '是' GROUP BY goods_id) s ON s.goods_id = d.goods_id
        WHERE p.process_code = 'form-86' ${subsql} 
            AND p.start_time BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY) AND NOW()
        GROUP BY IF(d.is_circulation = '是', '流转', d.product_stage)
        UNION ALL 
        SELECT COUNT(1) AS count, IF(d.is_circulation = '是', '流转', d.product_stage) AS product_stage, 
            'failed_num' AS type FROM processes p
        JOIN process_tasks t ON t.process_id = p.process_id AND t.title = '天猫项目负责人审核' AND t.status IN (3,5)
        JOIN process_info pi ON pi.process_id = p.process_id AND pi.field = 'textField_liihs7kw'
        JOIN dianshang_operation_attribute d ON d.goods_id = pi.content
            AND d.platform = '天猫部' AND d.goods_id IS NOT NULL
            AND (d.link_state != '下架' OR d.link_state IS NULL)
        LEFT JOIN (SELECT goods_id, MIN(create_time) AS create_time 
            FROM jst_goods_sku WHERE is_shelf = '是' GROUP BY goods_id) s ON s.goods_id = d.goods_id
        WHERE p.process_code = 'form-86' ${subsql}
            AND p.start_time BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY) AND NOW()
        GROUP BY IF(d.is_circulation = '是', '流转', d.product_stage)
        UNION ALL
        SELECT COUNT(1) AS count, IF(d.is_circulation = '是', '流转', d.product_stage) AS product_stage, 
            'running_num' AS type FROM processes p 
        JOIN process_tasks t ON t.process_id = p.process_id AND t.title = '审批人' AND t.status = 1
        JOIN process_info pi ON pi.process_id = p.process_id AND pi.field = 'textField_lma827od'
        JOIN dianshang_operation_attribute d ON d.brief_name = pi.content
            AND platform = '自营' AND d.brief_name IS NOT NULL
            AND (d.userDef1 != '下柜' OR d.userDef1 IS NULL)
        LEFT JOIN (SELECT goods_id, MIN(create_time) AS create_time 
            FROM jst_goods_sku WHERE is_shelf = '是' GROUP BY goods_id) s ON s.goods_id = d.brief_name
        WHERE p.process_code = 'form-42' ${subsql}
            AND p.start_time BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY) AND NOW()
        GROUP BY IF(d.is_circulation = '是', '流转', d.product_stage)
        UNION ALL
        SELECT COUNT(1) AS count, product_stage, 'success_num' AS type FROM (
            SELECT pi.content, pi2.content AS content1, IF(d.is_circulation = '是', '流转', d.product_stage) 
                AS product_stage, MIN(p.start_time) AS start_time FROM processes p 
            JOIN process_info pi ON pi.process_id = p.process_id AND pi.field = 'textField_lma827od'
            JOIN dianshang_operation_attribute d ON d.brief_name = pi.content
                AND platform = '自营' AND d.brief_name IS NOT NULL
                AND (d.userDef1 != '下柜' OR d.userDef1 IS NULL)
            LEFT JOIN (SELECT goods_id, MIN(create_time) AS create_time 
                FROM jst_goods_sku WHERE is_shelf = '是' GROUP BY goods_id) s ON s.goods_id = d.brief_name
            JOIN process_info pi1 ON pi1.process_id = p.process_id AND pi1.field = 'radioField_m11ru702'
                AND pi1.content = '是'
            JOIN process_info pi2 ON pi2.process_id = p.process_id AND pi2.field = 'checkboxField_m11r277t' 
            JOIN process_tasks t ON t.process_id = p.process_id AND t.title = '审批人' AND t.status = 2
            WHERE p.process_code = 'form-42' ${subsql}
                AND p.start_time BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY) AND NOW()
            GROUP BY IF(d.is_circulation = '是', '流转', d.product_stage), pi.content, pi2.content HAVING COUNT(1) = 1
        ) a WHERE start_time <= DATE_SUB(NOW(), INTERVAL 4 DAY) GROUP BY product_stage
        UNION ALL
        SELECT COUNT(1) AS count, product_stage, 'failed_num' AS type FROM (
            SELECT pi.content, pi2.content AS content1, IF(d.is_circulation = '是', '流转', d.product_stage) 
                AS product_stage FROM processes p 
            JOIN process_info pi ON pi.process_id = p.process_id AND pi.field = 'textField_lma827od'
            JOIN dianshang_operation_attribute d ON d.goods_id = pi.content
                AND platform = '自营' AND d.brief_name IS NOT NULL
                AND (d.userDef1 != '下柜' OR d.userDef1 IS NULL)
            LEFT JOIN (SELECT goods_id, MIN(create_time) AS create_time 
                FROM jst_goods_sku WHERE is_shelf = '是' GROUP BY goods_id) s ON s.goods_id = d.brief_name
            JOIN process_info pi1 ON pi1.process_id = p.process_id AND pi1.field = 'radioField_m11ru702'
                AND pi1.content = '是'
            JOIN process_info pi2 ON pi2.process_id = p.process_id AND pi2.field = 'checkboxField_m11r277t' 
            JOIN process_tasks t ON t.process_id = p.process_id AND t.title = '审批人' AND t.status = 2
            WHERE p.process_code = 'form-42' ${subsql}
                AND p.start_time BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY) AND NOW()
            GROUP BY IF(d.is_circulation = '是', '流转', d.product_stage), pi.content, pi2.content 
            HAVING COUNT(1) > 1) a GROUP BY product_stage) b GROUP BY type, product_stage`
    const result = await query(sql)
    return result
}

processesRepo.getGoodsOptimizeDetail = async (shopNames, userNames, is_new, product_stage, type) => {
    let subsql = shopNames?.length ? `AND d.shop_name IN (${shopNames})` : `AND d.operator IN (${userNames})`
    subsql = is_new == '1' ? `${subsql} 
        AND IFNULL(s.create_time, d.onsale_date) >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY)` : 
        `${subsql} 
        AND IFNULL(s.create_time, d.onsale_date) < DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY)`
    subsql = product_stage != '流转' ? `${subsql} 
        AND d.product_stage = "${product_stage}" AND (d.is_circulation = '否' OR d.is_circulation IS NULL)` : 
        `${subsql} 
        AND d.is_circualtion = '是'`
    let sql = ''
    switch (type) {
        case 'running_num':
            sql = `SELECT p.title, p.process_id, p.start_time, p.status, p.username, p.dept, t.title AS task, 
                    t.username AS user, t.dept AS user_dept FROM processes p 
                JOIN process_tasks t ON t.process_id = p.process_id AND t.title = '天猫优化动作完成确认' AND t.status = 1
                JOIN process_info pi ON pi.process_id = p.process_id AND pi.field = 'textField_liihs7kw'
                JOIN dianshang_operation_attribute d ON d.goods_id = pi.content 
                    AND d.platform = '天猫部' AND d.goods_id IS NOT NULL
                    AND (d.link_state != '下架' OR d.link_state IS NULL)
                LEFT JOIN (SELECT goods_id, MIN(create_time) AS create_time 
                    FROM jst_goods_sku WHERE is_shelf = '是' GROUP BY goods_id) s ON s.goods_id = d.goods_id
                WHERE p.process_code = 'form-86' ${subsql} 
                    AND p.start_time BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY) AND NOW() 
                UNION ALL
                SELECT p.title, p.process_id, p.start_time, p.status, p.username, p.dept, t.title AS task, 
                    t.username AS user, t.dept AS user_dept FROM processes p 
                JOIN process_tasks t ON t.process_id = p.process_id AND t.title = '审批人' AND t.status = 1
                JOIN process_info pi ON pi.process_id = p.process_id AND pi.field = 'textField_lma827od'
                JOIN dianshang_operation_attribute d ON d.brief_name = pi.content
                    AND platform = '自营' AND d.brief_name IS NOT NULL
                    AND (d.userDef1 != '下柜' OR d.userDef1 IS NULL)
                LEFT JOIN (SELECT goods_id, MIN(create_time) AS create_time 
                    FROM jst_goods_sku WHERE is_shelf = '是' GROUP BY goods_id) s ON s.goods_id = d.brief_name
                WHERE p.process_code = 'form-42' ${subsql} 
                    AND p.start_time BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY) AND NOW()`
            break
        case 'success_num':
            sql = `SELECT p.title, p.process_id, p.start_time, p.status, p.username, p.dept, t1.title AS task, 
                    t1.username AS user, t1.dept AS user_dept FROM processes p 
                JOIN process_tasks t ON t.process_id = p.process_id AND t.title = '天猫项目负责人审核' AND t.status = 2 
                LEFT JOIN process_tasks t1 ON t1.process_id = p.process_id AND t1.status = 1
                JOIN process_info pi ON pi.process_id = p.process_id AND pi.field = 'textField_liihs7kw'
                JOIN dianshang_operation_attribute d ON d.goods_id = pi.content
                    AND d.platform = '天猫部' AND d.goods_id IS NOT NULL
                    AND (d.link_state != '下架' OR d.link_state IS NULL)
                LEFT JOIN (SELECT goods_id, MIN(create_time) AS create_time 
                    FROM jst_goods_sku WHERE is_shelf = '是' GROUP BY goods_id) s ON s.goods_id = d.goods_id
                WHERE p.process_code = 'form-86' ${subsql} 
                    AND p.start_time BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY) AND NOW()
                UNION ALL
                SELECT title, process_id, start_time, status, username, dept, task, user, user_dept FROM (
                    SELECT pi.content, pi2.content AS content1, p.title, p.process_id, p.status, p.username, p.dept, 
                        t1.title AS task, t1.username AS user, t1.dept AS user_dept, MIN(p.start_time) AS start_time 
                    FROM processes p JOIN process_info pi ON pi.process_id = p.process_id AND pi.field = 'textField_lma827od'
                    JOIN dianshang_operation_attribute d ON d.brief_name = pi.content
                        AND platform = '自营' AND d.brief_name IS NOT NULL
                        AND (d.userDef1 != '下柜' OR d.userDef1 IS NULL)
                    LEFT JOIN (SELECT goods_id, MIN(create_time) AS create_time 
                        FROM jst_goods_sku WHERE is_shelf = '是' GROUP BY goods_id) s ON s.goods_id = d.brief_name
                    JOIN process_info pi1 ON pi1.process_id = p.process_id AND pi1.field = 'radioField_m11ru702'
                        AND pi1.content = '是'
                    JOIN process_info pi2 ON pi2.process_id = p.process_id AND pi2.field = 'checkboxField_m11r277t'     
                    JOIN process_tasks t ON t.process_id = p.process_id AND t.title = '审批人' AND t.status = 2
                    LEFT JOIN process_tasks t1 ON t1.process_id = p.process_id and t1.status = 1
                    WHERE p.process_code = 'form-42' ${subsql} 
                        AND p.start_time BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY) AND NOW()
                    GROUP BY pi.content, pi2.content, p.title, p.process_id, p.status, p.username, p.dept, t1.title, 
                        t1.username, t1.dept HAVING COUNT(1) = 1) a WHERE start_time <= DATE_SUB(NOW(), INTERVAL 4 DAY)`
            break
        case 'failed_num':
            sql = `SELECT p.title, p.process_id, p.start_time, p.status, p.username, p.dept, t1.title AS task, 
                    t1.username AS user, t1.dept AS user_dept FROM processes p
                JOIN process_tasks t ON t.process_id = p.process_id AND t.title = '天猫项目负责人审核' AND t.status IN (3,5)
                LEFT JOIN process_tasks t1 ON t1.process_id = p.process_id AND t1.status = 1
                JOIN process_info pi ON pi.process_id = p.process_id AND pi.field = 'textField_liihs7kw'
                JOIN dianshang_operation_attribute d ON d.goods_id = pi.content
                    AND d.platform = '天猫部' AND d.goods_id IS NOT NULL
                    AND (d.link_state != '下架' OR d.link_state IS NULL)
                LEFT JOIN (SELECT goods_id, MIN(create_time) AS create_time 
                    FROM jst_goods_sku WHERE is_shelf = '是' GROUP BY goods_id) s ON s.goods_id = d.goods_id
                WHERE p.process_code = 'form-86' ${subsql} 
                    AND p.start_time BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY) AND NOW()
                UNION ALL
                SELECT title, process_id, start_time, status, username, dept, task, user, user_dept FROM (
                    SELECT pi.content, pi2.content AS content1, p.title, p.process_id, p.status, p.username, p.dept, 
                        t1.title AS task, t1.username AS user, t1.dept AS user_dept, p.start_time FROM processes p 
                    JOIN process_info pi ON pi.process_id = p.process_id AND pi.field = 'textField_lma827od'
                    JOIN dianshang_operation_attribute d ON d.goods_id = pi.content
                        AND platform = '自营' AND d.brief_name IS NOT NULL
                        AND (d.userDef1 != '下柜' OR d.userDef1 IS NULL)
                    LEFT JOIN (SELECT goods_id, MIN(create_time) AS create_time 
                        FROM jst_goods_sku WHERE is_shelf = '是' GROUP BY goods_id) s ON s.goods_id = d.brief_name
                    JOIN process_info pi1 ON pi1.process_id = p.process_id AND pi1.field = 'radioField_m11ru702'
                        AND pi1.content = '是'
                    JOIN process_info pi2 ON pi2.process_id = p.process_id AND pi2.field = 'checkboxField_m11r277t' 
                    JOIN process_tasks t ON t.process_id = p.process_id AND t.title = '审批人' AND t.status = 2
                    LEFT JOIN process_tasks t1 ON t1.process_id = p.process_id and t1.status = 1
                    WHERE p.process_code = 'form-42' ${subsql} 
                        AND p.start_time BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY) AND NOW()
                    GROUP BY pi.content, pi2.content, p.title, p.process_id, p.status, p.username, p.dept, t1.title, 
                        t1.username, t1.dept, p.start_time HAVING COUNT(1) > 1) a`
            break
        default:
    }
    const result = await query(sql)
    return result
}

processesRepo.getVisionDetail = async (start, end) => {
    const sql = `SELECT pi2.content AS vision_type, (CASE pi.field WHEN 'tableField_m4mikq2r' 
                THEN '原创-店铺+创意+全套' WHEN 'Faazmbrscjtcfac' THEN '原创-全套' 
            WHEN 'tableField_m4mikq2h' THEN '原创-全套详情' WHEN 'tableField_m4mikq3b' THEN '半原创' 
            WHEN 'tableField_m72psn81' THEN '基础修改' WHEN 'tableField_m4mikq31' THEN '摄影' 
            ELSE '视频剪辑' END) AS previous, pi.content, pi1.content AS platform, p.process_id, 
            IFNULL(t1.username, IF(p.username = '机器人', pi3.content, p.username)) AS start, 
            (CASE p.process_code WHEN 'form-108' THEN '新版视觉爆款全平台流程' WHEN 'form-110' 
            THEN '新版运营美编修图流程' ELSE '新版-视觉流程' END) AS form_title, p.title AS process_title 
        FROM processes p LEFT JOIN process_tasks t ON t.process_id = p.process_id AND t.status = 2 
            AND t.title IN ('拍摄图片', '拍摄视频', '视频剪辑', '项目负责人填写视觉作图信息', '基础修改') 
            AND t.end_time = (SELECT MAX(tt.end_time) FROM process_tasks tt 
                WHERE tt.title = t.title AND tt.process_id = p.process_id) 
        LEFT JOIN process_info pi ON pi.process_id = p.process_id 
            AND (CASE WHEN t.title IN ('项目负责人填写视觉作图信息', '基础修改') 
                THEN pi.field IN ('tableField_m4mikq2r', 'tableField_m4mikq2h', 'tableField_m4mikq3b', 
                    'tableField_m72psn81', 'Faazmbrscjtcfac') WHEN t.title IN ('拍摄图片', '拍摄视频') 
                THEN pi.field = 'tableField_m4mikq31' ELSE pi.field = 'Fnnsmauybz1o14pc' END) 
        LEFT JOIN process_info pi1 ON pi1.process_id = p.process_id 
            AND pi1.field IN ('radioField_lxkb9f93', 'radioField_lx5phs8j') 
        LEFT JOIN process_info pi2 ON pi2.process_id = p.process_id AND pi2.field = 'F4rzmbrlo5rsjqc'
        LEFT JOIN process_info pi3 ON pi3.process_id = p.process_id 
            AND pi3.field IN ('Cfidvgpftflr5', 'Cfidclaxyqgv7') 
        LEFT JOIN process_tasks t1 ON t1.process_id = p.process_id AND t1.title IN ('运营收图', '发起人收图') 
            AND t1.start_time = (SELECT MAX(tt.start_time) FROM process_tasks tt 
                WHERE tt.title = t1.title AND tt.process_id = p.process_id) 
        WHERE p.process_code IN ('form-108', 'form-110', 'xbsjlc') AND p.status IN (1,2)
            AND t.end_time BETWEEN ? AND ? AND pi.content IS NOT NULL 
        GROUP BY pi.field, pi.content, pi1.content, p.process_id, p.username, pi2.content, t1.username, 
            pi3.content, p.process_code, p.title`
    const result = await query(sql, [start, end])
    return result
}

processesRepo.getDevelopProcess = async (start, end) => {
    const sql = `SELECT p.process_id, p.username AS start, p.start_time, MONTH(p.start_time) AS month, 
            v16.content AS image, v17.content AS categories, 
            (CASE WHEN p.process_code IN ('sctgtplc', 'shichangfenxituipin') THEN '市场分析推品' 
                WHEN p.process_code IN ('iptplc', 'iptplcxb') THEN 'IP推品' 
                WHEN p.process_code IN ('zytplc', 'ziyantuipin') THEN '自研推品' 
                WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                ELSE '反推推品' END) AS type,  IFNULL(v15.content, '') AS spu, 
            IFNULL(t.username, IF(p.process_code IN ('fttplc', 'fantuituipin'), '', p.username)) AS developer, 
            IFNULL(v12.content, '') AS project, (CASE WHEN p.username = '陆瑶' THEN '事业二部' 
                WHEN p.username = '刘海涛' THEN '事业一部' WHEN p.username = '王洪彬' THEN '事业三部' 
                WHEN p.username = '郑艳艳' THEN '企划部' WHEN p.username = '鲁红旺' THEN '货品部' 
                WHEN p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' OR p.dept LIKE '%小红书%' THEN '事业三部' 
                WHEN p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                    OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%' THEN '事业二部' 
                WHEN p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%' THEN '事业一部' 
                WHEN p.dept LIKE '%开发%' OR p.dept LIKE '%企划%' OR p.dept LIKE '%市场%' THEN '企划部' 
                WHEN p.dept LIKE '%采购%' OR p.dept LIKE '%物流%' THEN '采购部' 
                WHEN p.dept LIKE '%库房%' OR p.dept LIKE '%品控%' THEN '货品部' 
                WHEN p.dept LIKE '%客服%' THEN '客服部' WHEN p.dept LIKE '%摄影%' OR p.dept LIKE '%视觉%' 
                    OR p.dept LIKE '%设计%' THEN '视觉部' WHEN p.dept LIKE '%人事%' THEN '人事部' 
                WHEN p.dept LIKE '%数据%' THEN '数据中台' ELSE '' END) AS dept, 
            (CASE p.status WHEN -1 THEN '未开始' WHEN 1 THEN '审批中' WHEN 2 THEN '审批通过' 
                WHEN 3 THEN '审批不通过' ELSE '已取消' END) AS process_status, 
            t0.end_time AS first_time, t1.end_time AS second_time, t2.end_time AS third_time, 
            IFNULL(t5.end_time, '') AS first_shelf_time, IFNULL(t6.end_time, '') AS second_shelf_time, 
            IFNULL(t7.end_time, '') AS third_shelf_time, IFNULL(t4.username, '') AS user, IFNULL(t4.title, '') AS node, 
            (CASE WHEN t4.username = '陆瑶' THEN '事业二部' WHEN t4.username = '刘海涛' THEN '事业一部' 
                WHEN t4.username = '王洪彬' THEN '事业三部' WHEN t4.username = '郑艳艳' THEN '企划部' 
                WHEN t4.username = '鲁红旺' THEN '货品部' WHEN t4.dept LIKE '%天猫%' OR t4.dept LIKE '%淘工厂%' 
                    OR t4.dept LIKE '%小红书%' THEN '事业三部' WHEN t4.dept LIKE '%京东%' OR t4.dept LIKE '%抖音%' 
                    OR t4.dept LIKE '%1688%' OR t4.dept LIKE '%唯品会%' OR t4.dept LIKE '%得物%' THEN '事业二部' 
                WHEN t4.dept LIKE '%拼多多%' OR t4.dept LIKE '%跨境%' OR t4.dept LIKE '%猫超%' THEN '事业一部' 
                WHEN t4.dept LIKE '%开发%' OR t4.dept LIKE '%企划%' OR t4.dept LIKE '%市场%' THEN '企划部' 
                WHEN t4.dept LIKE '%采购%' OR t4.dept LIKE '%物流%' THEN '采购部' 
                WHEN t4.dept LIKE '%库房%' OR t4.dept LIKE '%品控%' THEN '货品部' 
                WHEN t4.dept LIKE '%客服%' THEN '客服部' WHEN t4.dept LIKE '%摄影%' OR t4.dept LIKE '%视觉%' 
                    OR t4.dept LIKE '%设计%' THEN '视觉部' WHEN t4.dept LIKE '%人事%' THEN '人事部' 
                WHEN t4.dept LIKE '%数据%' THEN '数据中台' ELSE '' END) AS node_dept, 
            DATEDIFF(DATE_ADD(NOW(), INTERVAL 8 HOUR), t4.start_time) AS duration,
            IF(p.status IN (2,3,4), DATEDIFF(p.end_time, p.start_time), '') AS total_duration 
        FROM processes p LEFT JOIN process_tasks t ON t.process_id = p.process_id 
            AND t.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到') 
            AND t.start_time = (SELECT MAX(t1.start_time) FROM process_tasks t1 WHERE t1.process_id = p.process_id 
                AND t1.title IN ('反选1是否找到', '反选2是否找到', '反选3是否找到', '反选4是否找到')) 
        LEFT JOIN process_info v1 ON v1.process_id = p.process_id AND v1.field IN ('Cfidbw9ff40k6', 'Cfidaq7mz3963') 
        LEFT JOIN process_info v12 ON v12.process_id = p.process_id AND v12.field = 'Fj1ama2csbpoabc' 
        LEFT JOIN process_tasks t0 ON t0.process_id = p.process_id AND t0.status = 2 
            AND IF(p.process_code IN ('iptplc', 'iptplcxb'), t0.title = '事业部1是否订货', 
                IF(p.process_code IN ('zytplc', 'ziyantuipin'), t0.title = '事业部一是否订货', 
                    IF(p.process_code IN ('sctgtplc', 'shichangfenxituipin'), 
                        t0.title IN ('事业部一是否订货1', '事业部一是否订货2'), 
                        IF(p.process_code IN ('gystplc', 'gongyingshangtuipin'), t0.title = '事业部一审核市场分析', 
                            t0.title IN ('事业部一是否选中', '事业部一是否加单', '事业部一样品是否选中') 
                            OR ((p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%') 
                            AND t0.title IN ('运营是否选中', '反选运营确认样品是否选中')))))) 
            AND t0.end_time = (SELECT MAX(tt.end_time) FROM process_tasks tt WHERE tt.status = 2 
                AND tt.process_id = p.process_id AND IF(p.process_code IN ('iptplc', 'iptplcxb'), 
                    tt.title = '事业部1是否订货', IF(p.process_code IN ('zytplc', 'ziyantuipin'), 
                        tt.title = '事业部一是否订货', IF(p.process_code IN ('sctgtplc', 'shichangfenxituipin'), 
                            tt.title IN ('事业部一是否订货1', '事业部一是否订货2'), 
                            IF(p.process_code IN ('gystplc', 'gongyingshangtuipin'), tt.title = '事业部一审核市场分析', 
                                tt.title IN ('事业部一是否选中', '事业部一是否加单', '事业部一样品是否选中') 
                                OR ((p.dept LIKE '%拼多多%' OR p.dept LIKE '%跨境%' OR p.dept LIKE '%猫超%') 
                                AND tt.title IN ('运营是否选中', '反选运营确认样品是否选中'))))))) 
        LEFT JOIN process_tasks t1 ON t1.process_id = p.process_id AND t1.status = 2 
            AND IF(p.process_code IN ('iptplc', 'iptplcxb'), t1.title = '事业部2是否订货', 
                IF(p.process_code IN ('zytplc', 'ziyantuipin'), t1.title = '事业部二是否订货', 
                    IF(p.process_code IN ('sctgtplc', 'shichangfenxituipin'), 
                        t1.title IN ('事业部二是否订货1', '事业部二是否订货2'), 
                        IF(p.process_code IN ('gystplc', 'gongyingshangtuipin'), t1.title = '事业部二审核市场分析', 
                            t1.title IN ('事业部二是否选中', '事业部二是否加单', '事业部二样品是否选中') 
                            OR ((p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                                OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%') 
                            AND t1.title IN ('运营是否选中', '反选运营确认样品是否选中')))))) 
            AND t1.end_time = (SELECT MAX(tt.end_time) FROM process_tasks tt 
                WHERE tt.status = 2 AND tt.process_id = p.process_id 
                    AND IF(p.process_code IN ('iptplc', 'iptplcxb'), tt.title = '事业部2是否订货', 
                        IF(p.process_code IN ('zytplc', 'ziyantuipin'), tt.title = '事业部二是否订货', 
                            IF(p.process_code IN ('sctgtplc', 'shichangfenxituipin'), 
                                tt.title IN ('事业部二是否订货1', '事业部二是否订货2'), 
                                IF(p.process_code IN ('gystplc', 'gongyingshangtuipin'), 
                                    tt.title = '事业部二审核市场分析', 
                                    tt.title IN ('事业部二是否选中', '事业部二是否加单', '事业部二样品是否选中') 
                                    OR ((p.dept LIKE '%京东%' OR p.dept LIKE '%抖音%' OR p.dept LIKE '%1688%' 
                                        OR p.dept LIKE '%唯品会%' OR p.dept LIKE '%得物%') 
                                    AND tt.title IN ('运营是否选中', '反选运营确认样品是否选中'))))))) 
        LEFT JOIN process_tasks t2 ON t2.process_id = p.process_id AND t2.status = 2 
            AND IF(p.process_code IN ('iptplc', 'iptplcxb'), t2.title = '事业部3是否订货', 
                IF(p.process_code IN ('zytplc', 'ziyantuipin'), t2.title = '事业部三是否订货', 
                    IF(p.process_code IN ('sctgtplc', 'shichangfenxituipin'), 
                        t2.title IN ('事业部三是否订货1', '事业部三是否订货2'), 
                        IF(p.process_code IN ('gystplc', 'gongyingshangtuipin'), t2.title = '事业部三审核市场分析', 
                            t2.title IN ('事业部三是否选中', '事业部三是否加单', '事业部三样品是否选中') 
                            OR ((p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' OR p.dept LIKE '%小红书%') 
                            AND t2.title IN ('运营是否选中', '反选运营确认样品是否选中')))))) 
            AND t2.end_time = (SELECT MAX(tt.end_time) FROM process_tasks tt 
                WHERE tt.status = 2 AND tt.process_id = p.process_id 
                AND IF(p.process_code IN ('iptplc', 'iptplcxb'), tt.title = '事业部3是否订货', 
                    IF(p.process_code IN ('zytplc', 'ziyantuipin'), tt.title = '事业部三是否订货', 
                        IF(p.process_code IN ('sctgtplc', 'shichangfenxituipin'), 
                            tt.title IN ('事业部三是否订货1', '事业部三是否订货2'), 
                            IF(p.process_code IN ('gystplc', 'gongyingshangtuipin'), tt.title = '事业部三审核市场分析', 
                                tt.title IN ('事业部三是否选中', '事业部三是否加单', '事业部三样品是否选中') 
                                OR ((p.dept LIKE '%天猫%' OR p.dept LIKE '%淘工厂%' OR p.dept LIKE '%小红书%') 
                                AND tt.title IN ('运营是否选中', '反选运营确认样品是否选中'))))))) 
        LEFT JOIN process_tasks t4 ON t4.process_id = p.process_id AND  t4.status = 1 
        LEFT JOIN process_tasks t5 ON t5.process_id = p.process_id AND t5.status = 2 
            AND t5.title IN ('事业部1填写上架ID', '事业部一负责人填写上架链接', '事业部一填写上架ID', 
                '事业部一填写上架链接ID', '事业部一填写上架ID1', '事业部一填写上架ID2') 
            AND t5.end_time = (SELECT MAX(tt.end_time) FROM process_tasks tt 
                WHERE tt.process_id = p.process_id AND tt.title = t5.title AND tt.status = 2) 
        LEFT JOIN process_tasks t6 ON t6.process_id = p.process_id AND t6.status = 2
            AND t6.title IN ('事业部2填写上架ID', '事业部二负责人填写上架ID', '事业部二填写上架ID', '事业部二填写上架ID1', 
                '事业部二填写上架ID2') 
            AND t6.end_time = (SELECT MAX(tt.end_time) FROM process_tasks tt 
                WHERE tt.process_id = p.process_id AND tt.title = t6.title AND tt.status = 2) 
        LEFT JOIN process_tasks t7 ON t7.process_id = p.process_id AND t7.status = 2
            AND t7.title IN ('事业部3填写上架ID', '事业部三负责人填写上架ID', '事业部三填写上架ID', '事业部三填写上架ID1', 
                '事业部三填写上架ID2') 
            AND t7.end_time = (SELECT MAX(tt.end_time) FROM process_tasks tt 
                WHERE tt.process_id = p.process_id AND tt.title = t7.title AND tt.status = 2) 
        LEFT JOIN process_info v15 on v15.process_id = p.process_id 
            AND v15.field IN ('F0fpmc8rlpolpbc', 'Frwsmc8rphh2rsc', 'Fylnmc8v515dm8c', 'Fwyzmc8v5dpdnxc', 
                'F6mfmc8v5qefpmc') 
        LEFT JOIN process_info v16 ON v16.process_id = p.process_id 
            AND v16.field IN ('Cfidpl3a7e5tm', 'Cfidpj2f10qqm', 'Cfidv84ga4ncy') 
        LEFT JOIN process_info v17 ON v17.process_id = p.process_id AND v17.field IN ('Foaomaknt8tlbec') 
        WHERE p.process_code IN ('sctgtplc', 'shichangfenxituipin', 'iptplc', 'iptplcxb', 'zytplc', 'ziyantuipin', 
            'gystplc', 'gongyingshangtuipin', 'fttplc', 'fantuituipin') 
            AND p.start_time BETWEEN ? AND ? AND p.title NOT LIKE '%测试%' 
        GROUP BY p.process_id, p.username, p.start_time, v16.content, v17.content, p.process_code, v15.content, 
            t.username, v12.content, p.dept, p.status, t0.end_time, t1.end_time, t2.end_time, t5.end_time, 
            t6.end_time, t7.end_time, t4.title, t4.username, t4.dept, t4.start_time, p.end_time, t.start_time 
        ORDER BY p.start_time, t.start_time`
    const result = await query(sql, [start, end])
    return result || []
}

processesRepo.getFirstDivisionSelection = async (id) => {
    const sql = `SELECT content, field FROM process_info WHERE process_id = ? 
        AND (field IN ('Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c') 
            OR (field = 'F6c5mbuidfzfqjc' AND content = '未选中'))`
    const result = await query(sql, [id])
    return result || []
}

processesRepo.getFirstDivisionSelection1 = async (id) => {
    const sql = `SELECT content, field FROM process_info WHERE process_id = ? 
        AND (field IN ('Fzmjma3pe3tnclc', 'Fmtama25a3lrcwc', 'Flp9mbuigrxjqsc', 'Ffwtma3nntxjn9c', 'Fy6xma3jakboekc') 
            OR (field IN ('Fxfrma3j75fse7c', 'F6c5mbuidfzfqjc') AND content = '未选中'))`
    const result = await query(sql, [id])
    return result || []
}

processesRepo.getSecondDivisionSelection = async (id) => {
    const sql = `SELECT content, field FROM process_info WHERE process_id = ? 
        AND (field IN ('F2lmma3petqpcwc', 'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 'Fnixma3nox6onmc') 
            OR (field = 'F64jmbuie9olqmc' AND content = '未选中'))`
    const result = await query(sql, [id])
    return result || []
}

processesRepo.getSecondDivisionSelection1 = async (id) => {
    const sql = `SELECT content, field FROM process_info WHERE process_id = ? 
        AND (field IN ('F2lmma3petqpcwc', 'Fkyuma25az2ud8c', 'Fexembuihiymqvc', 'Fnixma3nox6onmc', 'Fy6xma3jakboekc') 
            OR (field IN ('Fxfrma3j75fse7c', 'F64jmbuie9olqmc') AND content = '未选中'))`
    const result = await query(sql, [id])
    return result || []
}

processesRepo.getThirdDivisionSelection = async (id) => {
    const sql = `SELECT content, field FROM process_info WHERE process_id = ? 
        AND (field IN ('F34mma3pf0egd0c', 'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc') 
            OR (field = 'Fxkxmbuiecz2qpc' AND content = '未选中'))`
    const result = await query(sql, [id])
    return result || []
}

processesRepo.getThirdDivisionSelection1 = async (id) => {
    const sql = `SELECT content, field FROM process_info WHERE process_id = ? 
        AND (field IN ('F34mma3pf0egd0c', 'Fiaama25b6zidec', 'F8y4mbuii8dtqyc', 'Fwtjma3np5o0nuc', 'Fy6xma3jakboekc') 
            OR (field IN ('Fxfrma3j75fse7c', 'Fxkxmbuiecz2qpc') AND content = '未选中'))`
    const result = await query(sql, [id])
    return result || []
}

processesRepo.getTmallInfo = async (start, end) => {
    const sql = `SELECT p.process_id, p.title, p.username AS start, pi.content AS user, 
            (CASE WHEN p.process_code IN ('gystplc', 'gongyingshangtuipin') THEN '供应商推品' 
                WHEN p.process_code IN ('fantuituipin', 'fttplc') THEN '反推推品' 
                WHEN p.process_code = 'form-40' THEN '天猫运营执行流程'
                ELSE '新版-视觉流程' END) AS type, pi1.content AS brief_name1, 
            (CASE p.status WHEN 1 THEN '运行中' ELSE '已通过' END) AS process_status, 
            pi2.content AS division, pi3.content AS brief_name2, pi4.content AS start1,
            pi5.content AS user1, pi6.content AS project, pi7.content AS task_name, pi8.content AS operator
        FROM processes p LEFT JOIN process_info pi ON pi.process_id = p.process_id AND pi.field = 'Cfidrocr4b21o'
        LEFT JOIN process_info pi1 ON pi1.process_id = p.process_id AND pi1.field = 'Fncjma23ezl8aec'
        LEFT JOIN process_info pi2 ON pi2.process_id = p.process_id AND pi2.field = 'Fj1ama2csbpoabc'
        LEFT JOIN process_info pi3 ON pi3.process_id = p.process_id AND pi3.field = 'F6w0ma2d2mnxakc'
        LEFT JOIN process_info pi4 ON pi4.process_id = p.process_id AND pi4.field = 'Cfidbxyi2vqjo'
        LEFT JOIN process_info pi5 ON pi5.process_id = p.process_id AND pi5.field = 'selectField_liigx7wc'
        LEFT JOIN process_info pi6 ON pi6.process_id = p.process_id AND pi6.field = 'textField_lxkb9f8v'
        LEFT JOIN process_info pi7 ON pi7.process_id = p.process_id AND pi7.field = 'radioField_lxkb9f93'
        LEFT JOIN process_info pi8 ON pi8.process_id = p.process_id AND pi8.field = 'employeeField_liigx7wd'
        WHERE p.status IN (1,2,3) AND p.start_time BETWEEN ? AND ? 
            AND p.process_code IN ('gystplc', 'gongyingshangtuipin', 'fantuituipin', 'fttplc', 'form-40', 'xbsjlc') 
        ORDER BY p.start_time DESC`
    const result = await query(sql, [start, end])
    return result || []
}


module.exports = processesRepo

const getDevelopmentProcessDateColumn = () => 'dp.create_time'

const formatDateTimeParam = (value, fallbackTime) => {
    if (!value) {
        return value
    }
    const normalized = value.trim().replace('T', ' ').replace(/Z$/i, '')
    if (/\d{2}:\d{2}/.test(normalized)) {
        return normalized
    }
    return `${normalized} ${fallbackTime}`
}

const appendDateRangeClauses = (clauses, params, column, start, end) => {
    if (start && end) {
        clauses.push(`${column} BETWEEN ? AND ?`)
        params.push(formatDateTimeParam(start, '00:00:00'))
        params.push(formatDateTimeParam(end, '23:59:59'))
    } else if (start) {
        clauses.push(`${column} >= ?`)
        params.push(formatDateTimeParam(start, '00:00:00'))
    } else if (end) {
        clauses.push(`${column} <= ?`)
        params.push(formatDateTimeParam(end, '23:59:59'))
    }
}

const extractCount = (rows) => Number(rows && rows[0] && rows[0].total) || 0

const toArray = (value) => (Array.isArray(value) ? value : [value])

const buildInPlaceholders = (values) => values.map(() => '?').join(', ')

const countDevelopmentByTaskStatus = async (processCodes, taskTitles, statuses, start, end) => {
    const codes = toArray(processCodes)
    const titles = toArray(taskTitles)
    const statusList = toArray(statuses)
    const params = [...codes, ...titles, ...statusList]
    const conditions = [
        `p.process_code IN (${buildInPlaceholders(codes)})`,
        `pt.title IN (${buildInPlaceholders(titles)})`,
        `pt.status IN (${buildInPlaceholders(statusList)})`
    ]
    appendDateRangeClauses(conditions, params, 'dp.create_time', start, end)
    const sql = `SELECT COUNT(DISTINCT dp.uid) AS total
        FROM development_process dp
        JOIN process_info pi_id ON pi_id.title = '推品ID' AND pi_id.content = dp.uid
        JOIN processes p ON p.process_id = pi_id.process_id
        JOIN process_tasks pt ON pt.process_id = p.process_id
        WHERE ${conditions.join(' AND ')}`
    const result = await query(sql, params)
    return extractCount(result)
}

const countDevelopmentByProcessStatus = async (processCodes, statuses, start, end) => {
    const codes = toArray(processCodes)
    const statusList = toArray(statuses)
    const params = [...codes, ...statusList]
    const conditions = [
        `p.process_code IN (${buildInPlaceholders(codes)})`,
        `p.status IN (${buildInPlaceholders(statusList)})`
    ]
    appendDateRangeClauses(conditions, params, 'dp.create_time', start, end)
    const sql = `SELECT COUNT(DISTINCT dp.uid) AS total
        FROM development_process dp
        JOIN process_info pi_id ON pi_id.title = '推品ID' AND pi_id.content = dp.uid
        JOIN processes p ON p.process_id = pi_id.process_id
        WHERE ${conditions.join(' AND ')}`
    const result = await query(sql, params)
    return extractCount(result)
}

processesRepo.getDevelopmentProcessTotal = async (start, end) => {
    const params = []
    const clauses = []
    appendDateRangeClauses(clauses, params, getDevelopmentProcessDateColumn(), start, end)
    const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
    const sql = `SELECT dp.type, COUNT(DISTINCT dp.uid) AS total
        FROM development_process dp
        ${whereClause}
        GROUP BY dp.type`
    const result = await query(sql, params)
    return result || []
}

processesRepo.getDevelopmentProcessRunning = async () => {
    const sql = `SELECT dp.type, COUNT(DISTINCT dp.uid) AS total
        FROM development_process dp
        JOIN process_info pi ON pi.content = dp.uid
            AND (pi.field = '${DEVELOPMENT_UID_FIELD}' OR pi.title = '推品ID')
        JOIN processes p ON p.process_id = pi.process_id AND p.status = 1
        GROUP BY dp.type`
    const result = await query(sql)
    return result || []
}

const DEVELOPMENT_LIST_SELECT = `SELECT DATE_FORMAT(dp.create_time, '%Y-%m-%d') AS \`date\`,
    dp.sort, dp.name, dp.spu, dp.sku_code, dp.type, dp.image, dp.developer, dp.starter,
    dp.\`status\`, dp.is_select, dp.jd_status, dp.jd_is_select, dp.first_select, dp.second_select,
    dp.third_select, dp.order_type, dp.vision_type, dp.jd_vision_type, dp.select_project,
    dp.order_num, dp.jd_order_num, dp.operator, dp.jd_operator, dp.running_node,
    dp.jd_running_node, dp.first_goods_id, dp.second_goods_id, dp.third_goods_id
    FROM development_process dp`

const appendRunningJoins = (joins) => {
    joins.push(`JOIN process_info pi ON pi.content = dp.uid AND (pi.field = '${DEVELOPMENT_UID_FIELD}' OR pi.title = '推品ID')`)
    joins.push('JOIN processes p ON p.process_id = pi.process_id')
}

processesRepo.getDevelopmentProcessList = async ({ developmentType, isRunningMode, start, end }) => {
    if (!developmentType) {
        return []
    }
    const params = [developmentType]
    const conditions = ['dp.type = ?']
    const joins = []
    if (isRunningMode) {
        appendRunningJoins(joins)
        conditions.push('p.status = 1')
    } else {
        appendDateRangeClauses(conditions, params, 'dp.create_time', start, end)
    }
    const joinSql = joins.length ? ` ${joins.join('\n    ')}` : ''
    const whereSql = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : ''
    const sql = `${DEVELOPMENT_LIST_SELECT}${joinSql}${whereSql}
        ORDER BY dp.create_time DESC, dp.sort ASC`
    const rows = await query(sql, params)
    return rows || []
}

/**
 * 查询反推询价不同状态下的推品明细
 * @param {object} options 查询参数
 * @param {'running'|'success'|'fail'} options.status 目标状态
 * @param {boolean} options.isRunningMode 是否为待办模式
 * @param {string|undefined} options.start 发起模式下的开始时间
 * @param {string|undefined} options.end 发起模式下的结束时间
 * @returns {Promise<Array<object>>} 推品列表
 */
processesRepo.getOperatorInquiryList = async ({ status, isRunningMode, start, end }) => {
    if (!status || (isRunningMode && status !== 'running')) {
        return []
    }
    const existsCondition = buildOperatorInquiryExistsCondition(status)
    if (!existsCondition) {
        return []
    }
    const params = []
    const conditions = ["dp.type = '反推推品'", existsCondition]
    if (!isRunningMode) {
        appendDateRangeClauses(conditions, params, 'dp.create_time', start, end)
    }
    const whereSql = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : ''
    const sql = `${DEVELOPMENT_LIST_SELECT}${whereSql}
        ORDER BY dp.create_time DESC, dp.sort ASC`
    const rows = await query(sql, params)
    return rows || []
}

processesRepo.getProcessByUidAndColumn = async (uid, key, field, value) => {
    const sql = `SELECT p.* FROM development_process d LEFT JOIN process_info pi ON d.uid = pi.content 
            AND pi.title = '推品ID' LEFT JOIN processes p ON p.process_id = pi.process_id 
        WHERE d.uid = ? AND p.process_code = ? AND EXISTS(
            SELECT * FROM process_info p1 WHERE p1.process_id = p.process_id AND p1.field = ? 
                AND p1.content = ?)`
    const result = await query(sql, [uid, key, field, value])
    return result || []
}

processesRepo.getFirstShelfProcess = async (uid, key) => {
    const sql = `SELECT p.* FROM development_process d LEFT JOIN process_info pi ON d.uid = pi.content 
            AND pi.title = '推品ID' LEFT JOIN processes p ON p.process_id = pi.process_id 
        WHERE d.uid = ? AND p.process_code = ? AND EXISTS(
            SELECT * FROM process_info p1 WHERE p1.process_id = p.process_id AND p1.title = '上架平台' 
                AND (p1.content LIKE '%拼多多%' OR p1.content LIKE '%天猫超市%' OR p1.content LIKE '%Coupang%'))`
    const result = await query(sql, [uid, key])
    return result || []
}

processesRepo.getSecondShelfProcess = async (uid, key) => {
    const sql = `SELECT p.* FROM development_process d LEFT JOIN process_info pi ON d.uid = pi.content 
            AND pi.title = '推品ID' LEFT JOIN processes p ON p.process_id = pi.process_id 
        WHERE d.uid = ? AND p.process_code = ? AND EXISTS(
            SELECT * FROM process_info p1 WHERE p1.process_id = p.process_id AND p1.title = '上架平台' 
                AND (p1.content LIKE '%抖音%' OR p1.content LIKE '%快手%' OR p1.content LIKE '%得物%' 
                    OR p1.content LIKE '%唯品会%' OR p1.content LIKE '%1688%'))`
    const result = await query(sql, [uid, key])
    return result || []
}

processesRepo.getJDShelfProcess = async (uid, key) => {
    const sql = `SELECT p.* FROM development_process d LEFT JOIN process_info pi ON d.uid = pi.content 
            AND pi.title = '推品ID' LEFT JOIN processes p ON p.process_id = pi.process_id 
        WHERE d.uid = ? AND p.process_code = ? AND EXISTS(
            SELECT * FROM process_info p1 WHERE p1.process_id = p.process_id AND p1.title = '上架平台' 
                AND (p1.content LIKE '%京东%'))`
    const result = await query(sql, [uid, key])
    return result || []
}

processesRepo.getThirdShelfProcess = async (uid, key) => {
    const sql = `SELECT p.* FROM development_process d LEFT JOIN process_info pi ON d.uid = pi.content 
            AND pi.title = '推品ID' LEFT JOIN processes p ON p.process_id = pi.process_id 
        WHERE d.uid = ? AND p.process_code = ? AND EXISTS(
            SELECT * FROM process_info p1 WHERE p1.process_id = p.process_id AND p1.title = '上架平台' 
                AND (p1.content LIKE '%天猫%' OR p1.content LIKE '%淘工厂%' OR p1.content LIKE '%小红书%'))`
    const result = await query(sql, [uid, key])
    return result || []
}

/**
 * 统计反推询价在不同状态下的数量
 * @param {string|undefined} start 开始日期
 * @param {string|undefined} end 结束日期
 * @returns {Promise<{running: number, success: number, fail: number}>}
 */
processesRepo.getOperatorInquiryStats = async (start, end) => {
    const params = []
    const dateClauses = []
    appendDateRangeClauses(dateClauses, params, 'dp.create_time', start, end)
    const dateCondition = dateClauses.length ? ` AND ${dateClauses.join(' AND ')}` : ''
    const baseJoin = `FROM development_process dp
        JOIN process_info pi_id ON pi_id.title = '推品ID' AND pi_id.content = dp.uid
        JOIN processes p ON p.process_id = pi_id.process_id`
    const baseWhere = `dp.type = '反推推品' AND p.process_code = '${OPERATOR_PROCESS_CODE}'`
    const runningSql = `SELECT COUNT(DISTINCT dp.uid) AS total
        ${baseJoin}
        WHERE ${baseWhere} AND p.status = 1${dateCondition}`
    const runningResult = await query(runningSql, params.slice())
    const successSql = `SELECT COUNT(DISTINCT dp.uid) AS total
        ${baseJoin}
        LEFT JOIN process_info pi_success ON pi_success.process_id = p.process_id
            AND pi_success.title IN ('反推进度1', '反推进度2', '反推进度3', '寻源结果')
            AND pi_success.content = '${OPERATOR_PROGRESS_SUCCESS_VALUE}'
        WHERE ${baseWhere} AND p.status = 2${dateCondition} AND pi_success.id IS NOT NULL`
    const successResult = await query(successSql, params.slice())
    const failSql = `SELECT COUNT(DISTINCT dp.uid) AS total
        ${baseJoin}
        LEFT JOIN process_info pi_success ON pi_success.process_id = p.process_id
            AND pi_success.title IN ('反推进度1', '反推进度2', '反推进度3', '寻源结果')
            AND pi_success.content = '${OPERATOR_PROGRESS_SUCCESS_VALUE}'
        WHERE ${baseWhere} AND p.status = 2${dateCondition} AND pi_success.id IS NULL`
    const failResult = await query(failSql, params.slice())
    return {
        running: extractCount(runningResult),
        success: extractCount(successResult),
        fail: extractCount(failResult)
    }
}

const DESIGN_UPLOAD_TITLES = ['北京上传设计草图', '杭州上传设计草图']
const DESIGN_SUPERVISION_TITLE = ['IP设计监修']
const SAMPLE_SUPERVISION_TITLE = ['设计报样品IP监修']
const VISION_SUPERVISION_TITLE = ['开始视觉监修']
const PRODUCT_SUPERVISION_TITLE = ['设计报大货设计监修']
const SAMPLE_DELIVERY_TITLE = ['确认到货']
const YANGPIN_PROCESS_CODES = ['yangpinqueren']
const DELIVERY_PROCESS_CODES = ['jingdongdhlc', 'kjdinghuo']
const PLAN_PROCESS_CODES = ['baokuanliuchengxb_copyceshi']
const SELECTION_PROCESS_CODES = ['jingdongdandulc', 'syybyycl']
const MARKET_ANALYSIS_TITLES = ['运营1上传市场分析', '运营2上传市场分析', '运营上传市场分析']
const SELECTION_REVIEW_TITLES = ['负责人审核', '事业一部负责人审核', '事业二部负责人审核', '事业三部负责人审核']
const SELECTION_RESULT_TITLES = ['京东是否选中', '事业一部是否选中', '事业二部是否选中', '事业三部是否选中']
const SELECTION_VALUE_CHOOSE = '选中'
const SELECTION_VALUE_UNCHOOSE = '未选中'
const ORDER_TASK_TITLES = ['采购审批', '审批合同', '代发确认']
const WAREHOUSING_TASK_TITLES = ['周转确认到仓', '仓库质检并确认样品与大货一致']
const SHELF_PROCESS_CODES = ['sjlcqpt_copy']
const SHELF_PLATFORM_TITLE = '上架平台'
const SHELF_DIVISION_PLATFORMS = {
    division1: ['拼多多', '天猫超市', 'Coupang'],
    division2: ['京东', '得物', '唯品会', '抖音', '快手', '1688'],
    division3: ['天猫', '天猫垂类店', '淘工厂', '小红书']
}
const OPERATOR_PROCESS_CODE = 'tpkfsh'
const OPERATOR_PROGRESS_TITLES = ['反推进度1', '反推进度2', '反推进度3', '寻源结果']
const OPERATOR_PROGRESS_SUCCESS_VALUE = '找到'
const VISION_PROCESS_CODES = ['xbsjmblc_copy']
const VISION_DEVELOPMENT_TYPES = {
    supplier: '供应商推品',
    operator: '反推推品',
    ip: 'IP推品',
    self: '自研推品'
}
const VISION_CREATIVE_TYPES = {
    original: '原创',
    semi_original: '半原创',
    unoriginal: '非原创'
}
const VISION_STATUS_VALUES = [1, 2, 3, 4]

const VISION_TYPE_FIELD_MAP = Object.entries(VISION_DEVELOPMENT_TYPES).reduce((acc, [key, value]) => {
    acc[value] = key
    return acc
}, {})

const VISION_CREATIVE_FIELD_MAP = Object.entries(VISION_CREATIVE_TYPES).reduce((acc, [key, value]) => {
    acc[value] = key
    return acc
}, {})

const escapeSingleQuote = (value = '') => String(value).replace(/'/g, "''")

const formatTitleList = (titles) => titles.map((title) => `'${escapeSingleQuote(title)}'`).join(', ')

const buildOperatorInquiryExistsCondition = (status) => {
    const progressTitles = formatTitleList(OPERATOR_PROGRESS_TITLES)
    const base = `SELECT 1
        FROM process_info pi_id
        JOIN processes p ON p.process_id = pi_id.process_id
        WHERE pi_id.title = '推品ID'
            AND pi_id.content = dp.uid
            AND p.process_code = '${OPERATOR_PROCESS_CODE}'`
    if (status === 'running') {
        return `EXISTS (${base}
            AND p.status = 1
        )`
    }
    if (status === 'success') {
        return `EXISTS (${base}
            AND p.status = 2
            AND EXISTS (
                SELECT 1
                FROM process_info pi_success
                WHERE pi_success.process_id = p.process_id
                    AND pi_success.title IN (${progressTitles})
                    AND pi_success.content = '${OPERATOR_PROGRESS_SUCCESS_VALUE}'
            )
        )`
    }
    if (status === 'fail') {
        return `EXISTS (${base}
            AND p.status = 2
            AND NOT EXISTS (
                SELECT 1
                FROM process_info pi_success
                WHERE pi_success.process_id = p.process_id
                    AND pi_success.title IN (${progressTitles})
                    AND pi_success.content = '${OPERATOR_PROGRESS_SUCCESS_VALUE}'
            )
        )`
    }
    return ''
}

const SELECTION_TITLE_SQL = formatTitleList(SELECTION_RESULT_TITLES)

/**
 * 统计设计监修各阶段的数量
 * @param {string|undefined} start 开始日期
 * @param {string|undefined} end 结束日期
 * @returns {Promise<object>} 设计与监修阶段数量
 */
processesRepo.getDesignSupervisionStats = async (start, end) => {
    const [
        designRunning,
        designFinish,
        sketchRunning,
        sketchFinish,
        sampleRunning,
        sampleFinish,
        visionRunning,
        visionFinish,
        productRunning,
        productFinish
    ] = await Promise.all([
        countDevelopmentByTaskStatus(YANGPIN_PROCESS_CODES, DESIGN_UPLOAD_TITLES, 1, start, end),
        countDevelopmentByTaskStatus(YANGPIN_PROCESS_CODES, DESIGN_UPLOAD_TITLES, [2, 3], start, end),
        countDevelopmentByTaskStatus(YANGPIN_PROCESS_CODES, DESIGN_SUPERVISION_TITLE, 1, start, end),
        countDevelopmentByTaskStatus(YANGPIN_PROCESS_CODES, DESIGN_SUPERVISION_TITLE, [2, 3], start, end),
        countDevelopmentByTaskStatus(DELIVERY_PROCESS_CODES, SAMPLE_SUPERVISION_TITLE, 1, start, end),
        countDevelopmentByTaskStatus(DELIVERY_PROCESS_CODES, SAMPLE_SUPERVISION_TITLE, [2, 3], start, end),
        countDevelopmentByTaskStatus(DELIVERY_PROCESS_CODES, VISION_SUPERVISION_TITLE, 1, start, end),
        countDevelopmentByTaskStatus(DELIVERY_PROCESS_CODES, VISION_SUPERVISION_TITLE, [2, 3], start, end),
        countDevelopmentByTaskStatus(DELIVERY_PROCESS_CODES, PRODUCT_SUPERVISION_TITLE, 1, start, end),
        countDevelopmentByTaskStatus(DELIVERY_PROCESS_CODES, PRODUCT_SUPERVISION_TITLE, [2, 3], start, end)
    ])
    return {
        design: { running: designRunning, finish: designFinish },
        sketch: { running: sketchRunning, finish: sketchFinish },
        sample: { running: sampleRunning, finish: sampleFinish },
        vision: { running: visionRunning, finish: visionFinish },
        product: { running: productRunning, finish: productFinish }
    }
}

/**
 * 统计寄样环节在途与签收数量
 * @param {string|undefined} start 开始日期
 * @param {string|undefined} end 结束日期
 * @returns {Promise<{inTransit: number, receive: number}>}
 */
processesRepo.getSampleDeliveryStats = async (start, end) => {
    const [inTransit, receive] = await Promise.all([
        countDevelopmentByTaskStatus(YANGPIN_PROCESS_CODES, SAMPLE_DELIVERY_TITLE, 1, start, end),
        countDevelopmentByTaskStatus(YANGPIN_PROCESS_CODES, SAMPLE_DELIVERY_TITLE, 2, start, end)
    ])
    return {
        inTransit,
        receive
    }
}

/**
 * 统计方案流程在不同状态下的数量
 * @param {string|undefined} start 开始日期
 * @param {string|undefined} end 结束日期
 * @returns {Promise<{running: number, finish: number}>}
 */
processesRepo.getPlanStats = async (start, end) => {
    const running = await countDevelopmentByProcessStatus(PLAN_PROCESS_CODES, 1, start, end)
    const finish = await countDevelopmentByProcessStatus(PLAN_PROCESS_CODES, [2, 3, 4], start, end)
    return {
        running,
        finish
    }
}

const buildPurchaseQuery = (taskTitles, { finished }, start, end) => {
    const codes = toArray(DELIVERY_PROCESS_CODES)
    const tasks = toArray(taskTitles)
    const params = [...codes]
    const conditions = [`p.process_code IN (${buildInPlaceholders(codes)})`]
    if (!finished) {
        conditions.push('p.status = 1')
    }
    appendDateRangeClauses(conditions, params, 'dp.create_time', start, end)
    const taskPlaceholders = buildInPlaceholders(tasks)
    if (finished) {
        conditions.push(`EXISTS (SELECT 1 FROM process_tasks pt_done WHERE pt_done.process_id = p.process_id
            AND pt_done.title IN (${taskPlaceholders}) AND pt_done.status = 2)`)
        params.push(...tasks)
    } else {
        conditions.push(`EXISTS (SELECT 1 FROM process_tasks pt_active WHERE pt_active.process_id = p.process_id
            AND pt_active.title IN (${taskPlaceholders}) AND IFNULL(pt_active.status, 0) <> 2)`)
        params.push(...tasks)
        conditions.push(`NOT EXISTS (SELECT 1 FROM process_tasks pt_finish WHERE pt_finish.process_id = p.process_id
            AND pt_finish.title IN (${taskPlaceholders}) AND pt_finish.status = 2)`)
        params.push(...tasks)
    }
    const sql = `SELECT COUNT(DISTINCT dp.uid) AS total
        FROM development_process dp
        JOIN process_info pi_id ON pi_id.title = '推品ID' AND pi_id.content = dp.uid
        JOIN processes p ON p.process_id = pi_id.process_id
        WHERE ${conditions.join(' AND ')}`
    return { sql, params }
}

const countPurchaseProgress = async (taskTitles, options, start, end) => {
    const { sql, params } = buildPurchaseQuery(taskTitles, options, start, end)
    const result = await query(sql, params)
    return extractCount(result)
}

const countShelfProgress = async (statuses, platforms, start, end) => {
    const codes = toArray(SHELF_PROCESS_CODES)
    const statusList = toArray(statuses)
    const platformList = toArray(platforms)
    const params = []
    const conditions = []
    conditions.push(`p.process_code IN (${buildInPlaceholders(codes)})`)
    params.push(...codes)
    conditions.push(`p.status IN (${buildInPlaceholders(statusList)})`)
    params.push(...statusList)
    conditions.push('pi_platform.title = ?')
    params.push(SHELF_PLATFORM_TITLE)
    conditions.push(`pi_platform.content IN (${buildInPlaceholders(platformList)})`)
    params.push(...platformList)
    appendDateRangeClauses(conditions, params, 'dp.create_time', start, end)
    const sql = `SELECT COUNT(DISTINCT dp.uid) AS total
        FROM development_process dp
        JOIN process_info pi_id ON pi_id.title = '推品ID' AND pi_id.content = dp.uid
        JOIN processes p ON p.process_id = pi_id.process_id
        JOIN process_info pi_platform ON pi_platform.process_id = p.process_id
        WHERE ${conditions.join(' AND ')}`
    const result = await query(sql, params)
    return extractCount(result)
}

const countShelfByStatus = async (statuses, start, end) => {
    const entries = await Promise.all(
        Object.entries(SHELF_DIVISION_PLATFORMS).map(async ([division, platforms]) => {
            const total = await countShelfProgress(statuses, platforms, start, end)
            return { division, total }
        })
    )
    return entries.reduce((acc, { division, total }) => {
        acc[division] = total
        return acc
    }, {})
}

/**
 * 统计采购环节的订货与仓库到货数量
 * @param {string|undefined} start 开始日期
 * @param {string|undefined} end 结束日期
 * @returns {Promise<object>} 采购统计数据
 */
processesRepo.getPurchaseStats = async (start, end) => {
    const [
        orderRunning,
        orderFinish,
        warehousingRunning,
        warehousingFinish
    ] = await Promise.all([
        countPurchaseProgress(ORDER_TASK_TITLES, { finished: false }, start, end),
        countPurchaseProgress(ORDER_TASK_TITLES, { finished: true }, start, end),
        countPurchaseProgress(WAREHOUSING_TASK_TITLES, { finished: false }, start, end),
        countPurchaseProgress(WAREHOUSING_TASK_TITLES, { finished: true }, start, end)
    ])
    return {
        order: { running: orderRunning, finish: orderFinish },
        warehousing: { running: warehousingRunning, finish: warehousingFinish }
    }
}

/**
 * 统计上架环节的未上架与已上架数量
 * @param {string|undefined} start 开始日期
 * @param {string|undefined} end 结束日期
 * @returns {Promise<object>} 上架统计数据
 */
processesRepo.getShelfStats = async (start, end) => {
    const [unshelf, shelfed] = await Promise.all([
        countShelfByStatus(1, start, end),
        countShelfByStatus(2, start, end)
    ])
    return {
        unshelf,
        shelfed
    }
}

const buildSelectionBase = (statuses) => {
    const codes = toArray(SELECTION_PROCESS_CODES)
    const titles = toArray(SELECTION_REVIEW_TITLES)
    const statusList = toArray(statuses)
    const params = [...codes, ...titles, ...statusList]
    const conditions = [
        `p.process_code IN (${buildInPlaceholders(codes)})`,
        `pt.title IN (${buildInPlaceholders(titles)})`,
        `pt.status IN (${buildInPlaceholders(statusList)})`
    ]
    return { params, conditions }
}

const appendSelectionConditions = (conditions, params, start, end) => {
    appendDateRangeClauses(conditions, params, 'dp.create_time', start, end)
}

const buildSelectionQuery = (conditions) => `SELECT COUNT(DISTINCT dp.uid) AS total
    FROM development_process dp
    JOIN process_info pi_id ON pi_id.title = '推品ID' AND pi_id.content = dp.uid
    JOIN processes p ON p.process_id = pi_id.process_id
    JOIN process_tasks pt ON pt.process_id = p.process_id
    WHERE ${conditions.join(' AND ')}`

const createEmptyVisionCategory = () => ({
    original: { running: 0, finish: 0 },
    semi_original: { running: 0, finish: 0 },
    unoriginal: { running: 0, finish: 0 }
})

const createEmptyVisionStats = () => ({
    supplier: createEmptyVisionCategory(),
    operator: createEmptyVisionCategory(),
    ip: createEmptyVisionCategory(),
    self: createEmptyVisionCategory()
})

const addSelectionExistsClauses = (conditions, params, { requireChoose, requireUnchoose, excludeChoose }) => {
    if (excludeChoose) {
        conditions.push(`NOT EXISTS (SELECT 1 FROM process_info pi_sel WHERE pi_sel.process_id = p.process_id
            AND pi_sel.title IN (${SELECTION_TITLE_SQL}) AND pi_sel.content = ?)`)
        params.push(SELECTION_VALUE_CHOOSE)
    }
    if (requireChoose) {
        conditions.push(`EXISTS (SELECT 1 FROM process_info pi_sel WHERE pi_sel.process_id = p.process_id
            AND pi_sel.title IN (${SELECTION_TITLE_SQL}) AND pi_sel.content = ?)`)
        params.push(SELECTION_VALUE_CHOOSE)
    }
    if (requireUnchoose) {
        conditions.push(`EXISTS (SELECT 1 FROM process_info pi_sel WHERE pi_sel.process_id = p.process_id
            AND pi_sel.title IN (${SELECTION_TITLE_SQL}) AND pi_sel.content = ?)`)
        params.push(SELECTION_VALUE_UNCHOOSE)
    }
}

/**
 * 统计选品审核节点在指定状态下的推品数量
 * @param {number|Array<number>} statuses 需要统计的任务状态
 * @param {object} options 附加筛选条件
 * @param {boolean} [options.requireChoose] 是否要求存在选中结果
 * @param {boolean} [options.requireUnchoose] 是否要求存在未选中结果
 * @param {boolean} [options.excludeChoose] 是否排除已选中结果
 * @param {string|undefined} start 开始日期
 * @param {string|undefined} end 结束日期
 * @returns {Promise<number>} 满足条件的推品数量
 */
const countSelectionReview = async (statuses, options = {}, start, end) => {
    const { params, conditions } = buildSelectionBase(statuses)
    appendSelectionConditions(conditions, params, start, end)
    addSelectionExistsClauses(conditions, params, options)
    const sql = buildSelectionQuery(conditions)
    const result = await query(sql, params)
    return extractCount(result)
}

/**
 * 统计选品环节的市场分析与选中结果数据
 * @param {string|undefined} start 开始日期
 * @param {string|undefined} end 结束日期
 * @returns {Promise<object>} 选品阶段的统计结果
 */
processesRepo.getSelectionStats = async (start, end) => {
    const analysisRunning = await countDevelopmentByTaskStatus(
        SELECTION_PROCESS_CODES,
        MARKET_ANALYSIS_TITLES,
        1,
        start,
        end
    )
    const analysisFinish = await countDevelopmentByTaskStatus(
        SELECTION_PROCESS_CODES,
        MARKET_ANALYSIS_TITLES,
        [2, 3],
        start,
        end
    )
    const selectRunning = await countSelectionReview(1, { excludeChoose: true }, start, end)
    const choose = await countSelectionReview([2, 3], { requireChoose: true }, start, end)
    const unchoose = await countSelectionReview([2, 3], { requireUnchoose: true, excludeChoose: true }, start, end)
    return {
        analysis: {
            running: analysisRunning,
            finish: analysisFinish
        },
        result: {
            running: selectRunning,
            choose,
            unchoose
        }
    }
}

/**
 * 统计视觉流程在不同创意类型与流程状态下的推品数量
 * @param {string|undefined} start 开始日期
 * @param {string|undefined} end 结束日期
 * @returns {Promise<object>} 视觉流程统计数据
 */
processesRepo.getVisionStats = async (start, end) => {
    const codes = toArray(VISION_PROCESS_CODES)
    const typeValues = Object.values(VISION_DEVELOPMENT_TYPES)
    const creativeValues = Object.values(VISION_CREATIVE_TYPES)
    const statusValues = toArray(VISION_STATUS_VALUES)
    const params = [...codes, ...typeValues, ...creativeValues, ...statusValues]
    const conditions = [
        `p.process_code IN (${buildInPlaceholders(codes)})`,
        `dp.type IN (${buildInPlaceholders(typeValues)})`,
        `dp.vision_type IN (${buildInPlaceholders(creativeValues)})`,
        `p.status IN (${buildInPlaceholders(statusValues)})`
    ]
    appendDateRangeClauses(conditions, params, 'dp.create_time', start, end)
    const sql = `SELECT dp.type, dp.vision_type,` +
        " CASE WHEN p.status = 1 THEN 'running' ELSE 'finish' END AS stage," +
        ' COUNT(DISTINCT dp.uid) AS total' +
        ' FROM development_process dp' +
        " JOIN process_info pi_id ON pi_id.title = '推品ID' AND pi_id.content = dp.uid" +
        ' JOIN processes p ON p.process_id = pi_id.process_id' +
        ` WHERE ${conditions.join(' AND ')}` +
        ' GROUP BY dp.type, dp.vision_type, stage'
    const rows = await query(sql, params)
    const stats = createEmptyVisionStats()
    rows.forEach((row) => {
        const categoryKey = VISION_TYPE_FIELD_MAP[row.type]
        const creativeKey = VISION_CREATIVE_FIELD_MAP[row.vision_type]
        if (!categoryKey || !creativeKey) {
            return
        }
        const stageKey = row.stage === 'running' ? 'running' : 'finish'
        const value = Number(row.total) || 0
        stats[categoryKey][creativeKey][stageKey] += value
    })
    return stats
}

/**
 * 统计日常询价在不同状态下的数量
 * @param {string|undefined} start 开始日期
 * @param {string|undefined} end 结束日期
 * @returns {Promise<{running: number, finish: number}>}
 */
processesRepo.getDailyInquiryStats = async (start, end) => {
    const conditions = ["p.process_code = 'cpxjsq'"]
    const params = []
    appendDateRangeClauses(conditions, params, 'p.start_time', start, end)
    const runningSql = `SELECT COUNT(DISTINCT p.process_id) AS total
        FROM processes p
        WHERE ${conditions.concat('p.status = 1').join(' AND ')}`
    const runningResult = await query(runningSql, params.slice())
    const finishSql = `SELECT COUNT(DISTINCT p.process_id) AS total
        FROM processes p
        WHERE ${conditions.concat('p.status IN (2,3,4)').join(' AND ')}`
    const finishResult = await query(finishSql, params.slice())
    return {
        running: extractCount(runningResult),
        finish: extractCount(finishResult)
    }
}

module.exports = processesRepo
