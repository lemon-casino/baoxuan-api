const { query } = require('../../model/dbConn')
const processesRepo = {}

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

module.exports = processesRepo