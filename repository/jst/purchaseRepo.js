const { query } = require('../../model/dbConn')
const purchaseRepo = {}

purchaseRepo.batchInsert = async (data, count) => {
    let sql = `INSERT INTO jst_purchase_info(
        po_id,
        io_date,
        warehouse,
        io_id,
        sku_code,
        goods_code,
        io_qty,
        io_amount) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

purchaseRepo.get = async (po_id, io_id, goods_code) => {
    let sql = `SELECT * FROM jst_purchase_info 
        WHERE po_id = ? AND io_id = ? AND sku_code = ?`
    const result = await query(sql, [po_id, io_id, goods_code])
    return result || []
}

purchaseRepo.getBySkuCode = async (sku_code) => {
    let sql = `SELECT sku_code, MIN(io_date) as io_date FROM jst_purchase_info 
        WHERE sku_code IN ("${sku_code}") GROUP BY sku_code`
    const result = await query(sql)
    return result || []
}

purchaseRepo.update = async (data) => {
    let sql = `UPDATE jst_purchase_info SET io_date = ?, warehouse = ?, 
        goods_code = ?, io_qty = ?, io_amount = ? 
        WHERE po_id = ? AND io_id = ? AND sku_code = ?
        `
    const result = await query(sql, data)
    return result?.affectedRows ? true:false
}

purchaseRepo.getOrderBySkuCode = async (sku_code) => {
    let sql = `SELECT sku_id, MIN(confirm_date) AS create_time FROM jst_purchase_order 
        WHERE sku_id IN ("${sku_code}") AND confirm_date IS NOT NULL GROUP BY sku_id`
    const result = await query(sql)
    return result || []
}

purchaseRepo.getOrderingBySkuCode = async (sku_code) => {
    let sql = `SELECT sku_id, MIN(confirm_date) AS create_time FROM jst_purchase_order 
        WHERE sku_id IN ("${sku_code}") AND confirm_date IS NOT NULL 
            AND finish_time IS NULL GROUP BY sku_id`
    const result = await query(sql)
    return result || []
}

purchaseRepo.getShelfingBySkuCode = async (sku_code) => {
    let sql = `SELECT sku_code, MIN(io_date) as io_date FROM jst_purchase_info 
        WHERE sku_code IN ("${sku_code}") AND NOT EXISTS(
            SELECT * FROM jst_goods_sku s 
            LEFT JOIN danpin.combination_product_code pc ON pc.\`组合商品编码\` = s.sys_sku_id
            WHERE (s.sys_sku_id IN ("${sku_code}") OR pc.\`商品编码\` IN ("${sku_code}")) 
                AND s.is_shelf = '是'
        ) GROUP BY sku_code`
    const result = await query(sql)
    return result || []
}

purchaseRepo.getSkuCostInfo = async() =>{
    let sql = `select 商品编码 as sku_code
			,供应商名称 as seller
			,周转员 as turnover
			,开发员 as developer
			,采购价 as purchase_price
			,link
			,qty 
			,amount
			,IF(link is not NULL,'是','') as is_process
			,IF(DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY) <= io_date ,'三个月内新品' ,'老品') AS create_info
			,(CASE 
				WHEN count=1 THEN '已优化过第一轮'
				WHEN count=2 THEN '已优化过第二轮'
				ELSE '' END) as '优化状态'
    from (
        select a.商品编码,a.供应商名称,a.周转员,a.开发员,a.采购价,b.count,b.link,c.*,d.*
        from danpin.goods_info as a
        LEFT JOIN (
            select COUNT(DISTINCT process_id) as count
                        ,商品编码
                        ,GROUP_CONCAT(process_id SEPARATOR '</br>') as link 
            from (
                SELECT CONCAT('http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=',t.process_id) as process_id,
                            b.start_time,
                            JSON_UNQUOTE(JSON_EXTRACT(t.content, CONCAT('$[', n.seq, ']."商品编码"'))) AS 商品编码
                FROM process_info t
                LEFT JOIN processes as b
                ON t.process_id=b.process_id
                JOIN (
                    SELECT 0 AS seq UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
                ) n ON n.seq < JSON_LENGTH(t.content)
                WHERE t.field ='Frz7mdy8j3fvabc'
                AND t.content IS NOT NULL AND b.status != 4
            ) as a GROUP BY 商品编码
        ) as b
        on UPPER(a.商品编码) = UPPER(b.商品编码)
        LEFT JOIN(
            select sku_id,SUM(qty) as qty
                        ,SUM(qty*price) as amount 
            from jst_purchase_order 
            WHERE DATE_FORMAT(po_date,'%Y-%m-%d') >= DATE_SUB(CURRENT_DATE,INTERVAL 30 DAY) 
            GROUP BY sku_id
        ) as c
        on UPPER(a.商品编码) = UPPER(c.sku_id)
        LEFT JOIN(
            select sku_code,min(io_date) as io_date 
            from jst_purchase_info 
            GROUP BY sku_code
        ) as d
        ON UPPER(a.商品编码) = UPPER(d.sku_code)
    ) as a WHERE link is not null OR qty >=1000`
    const result = await query(sql)
    return result
}

purchaseRepo.getCostOptimize = async() =>{
    let sql = `SELECT a.link,a.start_time,a.end_time,a.initiator,a.executor,a.sku_code,
            IF(a.old_purchase_price REGEXP '[0-9]+(\\.[0-9]+)?',REGEXP_SUBSTR(a.old_purchase_price, '[0-9]+(\\.[0-9]+)?'),a.old_purchase_price) AS old_purchase_price,
			IF(a.new_purchase_price REGEXP '[0-9]+(\\.[0-9]+)?',REGEXP_SUBSTR(a.new_purchase_price, '[0-9]+(\\.[0-9]+)?'),a.new_purchase_price) AS new_purchase_price,
            b.采购价 AS now_purchase_price,IF(new_purchase_price = b.采购价,'是','否') AS is_modify 
        FROM(
            SELECT CONCAT('http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=',t.process_id) as link,
                            DATE_FORMAT(b.start_time,'%Y-%m-%d') as start_time,
                            DATE_FORMAT(b.end_time,'%Y-%m-%d') as end_time,
                            b.username AS initiator,
                            c.username as executor,
                JSON_UNQUOTE(JSON_EXTRACT(t.content, CONCAT('$[', n.seq, ']."商品编码"'))) AS sku_code,
                COALESCE(JSON_UNQUOTE(JSON_EXTRACT(t.content, CONCAT('$[', n.seq, ']."原成本价"'))), '0')  AS old_purchase_price,
                COALESCE(JSON_UNQUOTE(JSON_EXTRACT(t.content, CONCAT('$[', n.seq, ']."优化后成本价"'))),0) AS new_purchase_price
            FROM process_info t
            LEFT JOIN processes as b
            ON t.process_id=b.process_id
            LEFT JOIN process_tasks as c
            ON t.process_id=c.process_id AND c.title = '填写询价结果' AND c.status NOT IN(3,4,5)
            JOIN (
                SELECT 0 AS seq UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
            ) n ON n.seq < JSON_LENGTH(t.content)
            WHERE t.field ='Frz7mdy8j3fvabc'
            AND t.content IS NOT NULL AND b.status != 4) as a
            LEFT JOIN danpin.goods_info as b
            ON a.sku_code = b.商品编码`
    const result = await query(sql)
    for (i=0;i<result.length-1;i++){
        let sql1 = `SELECT price 
            FROM jst_purchase_order 
            WHERE sku_id = '${result[i].sku_code}' AND po_date > '${result[i].start_time}' 
            ORDER BY po_date limit 1`
        
        let row1 = await query(sql1)
        if(row1?.length){
            result[i].purchase_price = row1[0].price
        }
        
        let sql2 = `SELECT AVG(price) AS price
            FROM jst_purchase_order
            WHERE sku_id = '${result[i].sku_code}' AND po_date > '${result[i].start_time}'`
        let row2 = await query(sql2)
        let sql3 = `SELECT SUM(sale_qty) AS sale_qty_30
            FROM goods_sale_info 
            WHERE date BETWEEN DATE_SUB('${result[i].start_time}',INTERVAL 30 DAY) AND '${result[i].start_time}' 
            AND sku_code = '${result[i].sku_code}'`
        let row3 = await query(sql3)
        let sql4 = `SELECT SUM(sale_qty) AS real_sale_qty_30
            FROM goods_sale_info WHERE date BETWEEN '${result[i].start_time}' AND DATE_SUB('${result[i].start_time}',INTERVAL -30 DAY) 
            AND sku_code ='${result[i].sku_code}'`
        let row4 = await query(sql4) 
        result[i].estimate_cost = (row3[0].sale_qty_30 *(result[i].old_purchase_price-result[i].new_purchase_price)).toFixed(2)
        result[i].actual_cost = (row4[0].real_sale_qty_30 *(result[i].old_purchase_price-row2[0].price)).toFixed(2)
    }
    return result
}
module.exports = purchaseRepo