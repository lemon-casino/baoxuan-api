const { query } = require('../../model/dbConn')
const goodsCompositeRepo = {}
goodsCompositeRepo.deleteByDate = async (date, source) => {
    let sql = `DELETE FROM goods_composite_info WHERE \`date\` = ?
        AND source = ?`
    const result = await query(sql, [date, source])
    return result?.affectedRows ? true : false
}

goodsCompositeRepo.batchInsertDefault = async (count, data) => {
    let sql = `INSERT INTO goods_composite_info(
            goods_id, 
            shop_name,
            source,
            \`date\`,
            composite_name,
            exposure,
            click_num,
            click_rate,
            roi,
            pay_amount,
            trans_amount,
            direct_amount,
            indirect_amount,
            trans_num,
            direct_num,
            indirect_num,
            per_cost,
            per_trans_amount,
            per_direct_ammount,
            per_indirect_amount,
            promotion_rate,
            conversion_rate) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?, '聚水潭-商品综合',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

goodsCompositeRepo.batchInsertSYCM = async (count, data) => {
    let sql = `INSERT INTO goods_composite_info(
            goods_id, 
            shop_name,
            source,
            \`date\`,
            composite_name,
            total_users_num,
            total_click_num,
            total_cart_num,
            total_trans_users_num,
            trans_amount,
            refund_amount,
            users_num,
            trans_users_num) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?, '生意参谋',?, '生意参谋',?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

goodsCompositeRepo.batchInsertJDZY = async (count, data) => {
    let sql = `INSERT INTO goods_composite_info(
            goods_id,
            sku_id, 
            shop_name,
            source,
            \`date\`,
            composite_name,
            users_num,
            total_users_num,
            total_click_num,
            total_cart_num,
            trans_num,
            trans_qty,
            trans_users_num,
            total_trans_users_num) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?,'京东自营-厨具', '京东自营',?, '经营状况-商品明细数据',?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

goodsCompositeRepo.batchInsertPDD = async (count, data) => {
    let sql = `INSERT INTO goods_composite_info(
            goods_id, 
            shop_name,
            source,
            \`date\`,
            composite_name,
            users_num,
            total_users_num,
            click_num,
            trans_qty,
            trans_users_num,
            total_trans_users_num,
            trans_num,
            trans_amount,
            pay_rate) VALUES`
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?, '拼多多',?, '拼多多商品明细',?,?,?,?,?,?,?,?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

goodsCompositeRepo.getDataDetailByTime = async (goods_id, start, end) => {
    let sql = `SELECT IFNULL(SUM(a1.click_num), 0) AS click_num, 
            IFNULL(SUM(a1.users_num), 0) AS users_num, 
            IFNULL(SUM(a1.trans_users_num), 0) AS trans_users_num,
            IF(IFNULL(SUM(a1.users_num), 0) > 0, FORMAT(
                (IFNULL(SUM(a1.trans_users_num), 0) - 
                    IFNULL(SUM(a2.brushing_qty), 0)) / 
                IFNULL(SUM(a1.users_num), 0) * 100, 2), 0) AS real_pay_rate,
            IFNULL(SUM(a1.total_users_num), 0) AS total_users_num, 
            IFNULL(SUM(a1.total_trans_users_num), 0) AS total_trans_users_num, 
            IF(IFNULL(SUM(a1.total_users_num), 0) > 0, FORMAT(
                IFNULL(SUM(a1.total_trans_users_num), 0) / 
                IFNULL(SUM(a1.total_users_num), 0) * 100, 2), 0) AS total_pay_rate, 
            IF(IFNULL(SUM(a1.total_users_num), 0) > 0, FORMAT(
                (IFNULL(SUM(a1.total_trans_users_num), 0) - 
                    IFNULL(SUM(a2.brushing_qty), 0)) / 
                IFNULL(SUM(a1.total_users_num), 0) * 100, 2), 0) AS total_real_pay_rate, 
            FORMAT(IF(IFNULL(SUM(a3.click_num), 0) > 0, (
                IFNULL(SUM(a1.click_num), 0) - SUM(a3.click_num)) / 
                SUM(a3.click_num) * 100, 0), 2) AS click_num_qoq, 
            FORMAT(IF(IFNULL(SUM(a3.users_num), 0) > 0, (
                IFNULL(SUM(a1.users_num), 0) - SUM(a3.users_num)) / 
                SUM(a3.users_num) * 100, 0), 2) AS users_num_qoq, 
            FORMAT(IF(IFNULL(SUM(a3.trans_users_num), 0) > 0, (
                IFNULL(SUM(a1.trans_users_num), 0) - SUM(a3.trans_users_num)) / 
                SUM(a3.trans_users_num) * 100, 0), 2) AS trans_users_num_qoq, 
            FORMAT(IF(IFNULL(SUM(a3.trans_amount), 0) > 0, (
                IFNULL(SUM(a1.trans_amount), 0) - SUM(a3.trans_amount)) / 
                SUM(a3.trans_amount) * 100, 0), 2) AS trans_amount_qoq, 
            FORMAT(IF(IFNULL(SUM(a3.trans_users_num), 0) > 0 && 
                IFNULL(SUM(a3.users_num), 0) > 0 && 
                IFNULL(SUM(a1.users_num), 0) > 0, 
                IFNULL(SUM(a1.trans_users_num), 0) * SUM(a3.users_num) / 
                SUM(a3.users_num) / SUM(a3.trans_users_num) * 100, 0), 2) 
            AS pay_rate_qoq, a1.composite_name
        FROM goods_composite_info a1 LEFT JOIN goods_pay_info a2 
            ON a1.goods_id = a2.goods_id AND a1.date = a2.date 
        LEFT JOIN (
            SELECT SUM(click_num) AS click_num, SUM(users_num) AS users_num, 
                SUM(trans_users_num) AS trans_users_num, 
                SUM(trans_amount) AS trans_amount, goods_id FROM goods_composite_info 
            WHERE \`date\` >= DATE_SUB("${start}", INTERVAL 1 DAY) 
                AND \`date\` <= DATE_SUB("${end}", INTERVAL 1 DAY)
            GROUP BY goods_id
        ) a3 ON a1.goods_id = a3.goods_id
        WHERE a1.goods_id = ? AND a1.date >= ? AND a1.date <= ?
        GROUP BY a1.composite_name`
    const result = await query(sql, [goods_id, start, end])
    return result || []
}

module.exports = goodsCompositeRepo