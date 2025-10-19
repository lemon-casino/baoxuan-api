const { query } = require('../../model/dbConn')
const goodsOtherInfoRepo = {}

goodsOtherInfoRepo.batchInsert = async (count, data) => {
    let sql = `INSERT INTO goods_other_info(
            goods_id, 
            dsr, 
            words_market_vol, 
            words_vol, 
            words, 
            \`date\`) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

goodsOtherInfoRepo.search = async (goods_id, date) => {
    let sql = `SELECT id FROM goods_other_info WHERE goods_id = ?
        AND \`date\` = ?`
    const result = await query(sql, [goods_id, date])
    return result || []
}

goodsOtherInfoRepo.updateKeyWords = async (info) => {
    let sql = `UPDATE goods_other_info SET words_market_vol = ?, 
        words_vol = ?, words = ? WHERE goods_id = ? AND \`date\` = ?`
    const result = await query(sql, info)
    return result?.affectedRows ? true : false
}

goodsOtherInfoRepo.updateDSR = async (info) => {
    let sql = `UPDATE goods_other_info SET dsr = ? WHERE goods_id = ? 
        AND \`date\` = ?`
    const result = await query(sql, info)
    return result?.affectedRows ? true : false
}

goodsOtherInfoRepo.getDataDetailByTime = async(column, goods_id, start, end) => {
    const sql = `SELECT IFNULL(SUM(${column}), 0) AS ${column}, \`date\` 
        FROM goods_other_info WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id = ?
        GROUP BY \`date\``
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsOtherInfoRepo.getDataDetailTotalByTime = async(goods_id, start, end) => {
    const sql = `SELECT IFNULL(SUM(dsr), 0) AS dsr, 
            FORMAT(IF(IFNULL(SUM(words_market_vol), 0) > 0, 
                IFNULL(SUM(words_vol), 0) / SUM(words_market_vol), 0) * 100, 
            2) AS market_rate, DATE_FORMAT(\`date\`, '%Y-%m-%d') as \`date\` 
        FROM goods_other_info WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id = ?
        GROUP BY \`date\``
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsOtherInfoRepo.getDataRateByTime = async(col1, col2, column, goods_id, start, end, percent) => {
    const sql = `SELECT FORMAT(IF(IFNULL(SUM(${col1}), 0) > 0, 
                IFNULL(SUM(${col2}), 0) / SUM(${col1}), 0) * ${percent}, 2) AS ${column}, 
            \`date\` FROM goods_other_info WHERE \`date\` >= ? AND \`date\` <= ? 
            AND goods_id = ?
        GROUP BY \`date\``
    const result = await query(sql, [start, end, goods_id])
    return result || []
}

goodsOtherInfoRepo.getDetailByShopNamesAndTme = async (shopNames, column, start, end) => {
    let sql = `SELECT IFNULL(SUM(o.${column}), 0) AS o.${column}, o.date FROM goods_other_info o 
        JOIN dianshang_operation_attribute g on o.goods_id = g.goods_id 
        WHERE o.date >= ? AND o.date <= ? AND g.shop_name IN ("${shopNames}") 
        GROUP BY o.date`
    let result = await query(sql, [start, end])
    return  result || []
}

goodsOtherInfoRepo.getRateByShopNamesAndTme = async (shopNames, col1, col2, column, start, end, percent) => {
    let sql = `SELECT FORMAT(IF(IFNULL(SUM(o.${col1}), 0) > 0, 
                IFNULL(SUM(o.${col2}), 0) / SUM(o.${col1}) * ${percent}, 0), 2) AS o.${column}, o.date 
        FROM goods_other_info o JOIN dianshang_operation_attribute g ON g.goods_id = o.goods_id 
        WHERE o.date >= ? AND o.date <= ? AND g.shop_name IN ("${shopNames}") 
        GROUP BY o.date`
    let result = await query(sql, [start, end])
    return  result || []
}

goodsOtherInfoRepo.getDetailByLinkIdsAndTme = async (linkIds, column, start, end) => {
    let sql = `SELECT IFNULL(SUM(${column}), 0) AS ${column}, \`date\` FROM goods_other_info 
        WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id IN ("${linkIds}") 
        GROUP BY \`date\``
    let result = await query(sql, [start, end])
    return  result || []
}

goodsOtherInfoRepo.getRateByLinkIdsAndTme = async (linkIds, col1, col2, column, start, end, percent) => {
    let sql = `SELECT FORMAT(IF(IFNULL(SUM(${col1}), 0) > 0, 
                IFNULL(SUM(${col2}), 0) / SUM(${col1}) * ${percent}, 0), 2) AS ${column}, \`date\` 
        FROM goods_other_info 
        WHERE \`date\` >= ? AND \`date\` <= ? AND goods_id IN ("${linkIds}") 
        GROUP BY \`date\``
    let result = await query(sql, [start, end])
    return  result || []
}

goodsOtherInfoRepo.goodslog = async (goods_id, start, end) =>{
    let sql = `SELECT date,GROUP_CONCAT(log SEPARATOR '</br>') AS log FROM (
        SELECT '${goods_id}' AS goods_id
            ,CONCAT('http://bpm.pakchoice.cn:8848/bpm/process-instance/detail\?id=',process_id) AS source
            ,DATE_FORMAT(min(create_time),'%Y-%m-%d') AS date
            ,CONCAT('优化流程</br>',GROUP_CONCAT(CONCAT(title,'：',content) SEPARATOR '</br>')) AS log
        FROM process_info 
        WHERE field IN ('checkboxField_m11r277t','textareaField_m11spnq2')
        AND process_id IN (
            SELECT DISTINCT process_id
            FROM process_info
            WHERE field ='textField_lma827od'
            AND content  = '${goods_id}' 
            AND create_time BETWEEN '${start}' AND '${end}'
        )
        GROUP BY process_id
        UNION ALL
        SELECT '${goods_id}' AS goods_id
            ,CONCAT('http://bpm.pakchoice.cn:8848/bpm/process-instance/detail\?id=',process_id) AS source
            ,DATE_FORMAT(min(create_time),'%Y-%m-%d')
            ,CONCAT('优化流程</br>',GROUP_CONCAT(CONCAT(title,'：',content) SEPARATOR '</br>')) AS log
        FROM process_info 
        WHERE field IN ('radioField_lx30hv7y','radioField_lwuecm6c','employeeField_lx30qkbt','textareaField_lx30jx3p','selectField_liihs7kz',
        'multiSelectField_lwufb7oy','textareaField_m6072fua','dateField_m6072fu9','imageField_liihs7l2','textareaField_lxmkr1u0')
        AND process_id IN (
            SELECT DISTINCT process_id
            FROM process_info
            WHERE field ='textField_liihs7kw'
            AND content  = '${goods_id}'
            AND create_time BETWEEN '${start}' AND '${end}'
        )
        GROUP BY process_id
        UNION ALL
        SELECT DISTINCT * FROM (
        SELECT goods_id
            ,source
            ,date_format(operate_date,'%Y-%m-%d') AS date
            ,CONCAT('操作日志</br>',IFNULL(subtype,'(空)'),':',IFNULL(old_value,'(空)'),'->',IFNULL(new_value,'(空)'),'(',IFNULL(user,'无'),')') AS log
        FROM operate_log
        WHERE operate_date BETWEEN '${start}' AND '${end}' AND source != '数据面板操作日志'
        AND goods_id ='${goods_id}'
        UNION ALL
        SELECT goods_id
            ,source
            ,operate_date
            ,CONCAT('操作日志</br>',subtype,'(',IFNULL(user,'无'),')') AS log
        FROM operate_log
        WHERE operate_date BETWEEN '${start}' AND '${end}' AND source = '数据面板操作日志'
        AND goods_id ='${goods_id}'
        )AS a
    )AS a
    GROUP BY date`
    let result = await query(sql)
    return result
}
module.exports = goodsOtherInfoRepo