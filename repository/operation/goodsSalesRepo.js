const { query, transaction } = require('../../model/dbConn')
const goodsSalesRepo = {}
const moment = require('moment')

goodsSalesRepo.batchInsert = async (date) => {
    let sqls = [], params = []
    sqls.push(`DELETE FROM goods_sales WHERE \`date\` = ?`)
    params.push([date])
    let sql = `SELECT goods_id, shop_name, shop_id,
            IFNULL(SUM(sale_qty), 0) AS sale_qty, 
            IFNULL(SUM(sale_amount), 0) AS sale_amount, 
            IFNULL(SUM(cost_amount), 0) AS cost_amount,
            IFNULL(SUM(gross_profit), 0) AS gross_profit,
            IFNULL(SUM(profit), 0) AS profit,
            IFNULL(SUM(promotion_amount), 0) AS promotion_amount,
            IFNULL(SUM(express_fee), 0) AS express_fee,
            IFNULL(SUM(operation_amount), 0) AS operation_amount,
            IFNULL(SUM(real_sale_qty), 0) AS real_sale_qty,
            IFNULL(SUM(refund_qty), 0) AS refund_qty,
            IFNULL(SUM(real_sale_amount), 0) AS real_sale_amount,
            IFNULL(SUM(packing_fee), 0) AS packing_fee,
            IFNULL(SUM(real_gross_profit), 0) AS real_gross_profit,
            IFNULL(SUM(bill_amount), 0) AS bill_amount,
            IFNULL(SUM(order_num), 0) AS order_num,
            IFNULL(SUM(refund_num), 0) AS refund_num
        FROM goods_sale_info WHERE date = ? GROUP BY goods_id, shop_name, shop_id`
    let rows = await query(sql, [date]), data = []
    if (!rows?.length) return false
    sql = `INSERT INTO goods_sales(
            goods_id, 
            shop_name, 
            shop_id, 
            \`date\`, 
            sale_qty,
            sale_amount, 
            cost_amount, 
            gross_profit, 
            profit, 
            promotion_amount, 
            express_fee, 
            operation_amount, 
            real_sale_qty, 
            refund_qty, 
            real_sale_amount, 
            packing_fee, 
            real_gross_profit, 
            bill_amount, 
            order_num, 
            refund_num) VALUES`
    for (let i = 0; i < rows.length; i++) {
        sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
        data.push(
            rows[i].goods_id, 
            rows[i].shop_name, 
            rows[i].shop_id, 
            date, 
            rows[i].sale_qty,
            rows[i].sale_amount, 
            rows[i].cost_amount, 
            rows[i].gross_profit, 
            rows[i].profit, 
            rows[i].promotion_amount, 
            rows[i].express_fee, 
            rows[i].operation_amount, 
            rows[i].real_sale_qty, 
            rows[i].refund_qty, 
            rows[i].real_sale_amount, 
            rows[i].packing_fee, 
            rows[i].real_gross_profit, 
            rows[i].bill_amount, 
            rows[i].order_num, 
            rows[i].refund_num
        )
    }
    sql = sql.substring(0, sql.length - 1)
    sqls.push(sql)
    params.push(data)
    const result = await transaction(sqls, params)
    return result
}

goodsSalesRepo.delete = async (date) => {
    const sql = `DELETE FROM goods_sales WHERE \`date\` = ?`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

goodsSalesRepo.getSalesByDivision = async (start, end, type, addSales) => {
    let subsql = ''
    if (type == '1') {
        subsql = `${subsql} and date_add(s.create_time, interval 90 day) < now()`
    } else if (type == '2') {
        subsql = `${subsql} and date_add(s.create_time, interval 90 day) >= now() and date_add(s.create_time, interval 60 day) < now()`
    } else if (type == '3') {
        subsql = `${subsql} and date_add(s.create_time, interval 60 day) >= now() and date_add(s.create_time, interval 30 day) < now()`
    } else if (type == '4') {
        subsql = `${subsql} and date_add(s.create_time, interval 30 day) >= now() and date_add(s.create_time, interval 14 day) < now()`
    } else if (type == '5') {
        subsql = `${subsql} and date_add(s.create_time, interval 14 day) >= now() and date_add(s.create_time, interval 7 day) < now()`
    } else if (type == '6') {
        subsql = `${subsql} and date_add(s.create_time, interval 7 day) >= now()`
    }
    if (addSales == '0') {
        subsql = `${subsql} and a.date > date_add(s.create_time, interval 14 day)`
    }
    const sql = `select di.division_name, ifnull(sum(a.sale_qty), 0) as sale_qty,
            ifnull(sum(a.sale_amount), 0) as sale_amount,
            ifnull(sum(a.gross_profit), 0) as gross_profit,
            if(ifnull(sum(a.sale_amount), 0) > 0, 
                (ifnull(sum(a.gross_profit), 0) - sum(a.sale_amount)) / sum(a.sale_amount) * 100,
            0) as gross_margin,
            ifnull(sum(a.profit), 0) as profit,
            if(ifnull(sum(a.sale_amount), 0) > 0, 
                (ifnull(sum(a.profit), 0) - sum(a.sale_amount)) / sum(a.sale_amount) * 100,
            0) as profit_margin
        from goods_sales1 a 
        join shop_info si on si.shop_name = a.shop_name
        join project_info pi on pi.id = si.project_id 
        join division_info di on di.id = pi.division_id
        join jst_goods_sku s on s.sys_sku_id = a.sku_code
        where a.date between ? and ? ${subsql}
        group by di.division_name order by di.division_name`
    const result = await query(sql, [start, end])
    const sql1 = `select di.division_name, ifnull(sum(a.sale_amount), 0) as sale_amount
        from goods_sales1 a 
        join shop_info si on si.shop_name = a.shop_name 
        join project_info pi on pi.id = si.project_id 
        join division_info di on di.id = pi.division_id
        join jst_goods_sku s on s.sys_sku_id = a.sku_code
        where a.date between ? and ? ${subsql}
        group by di.division_name order by di.division_name`
    const yearStart = moment(start).subtract(1, 'year').format('YYYY-MM-DD')
    const yearEnd = moment(end).subtract(1, 'year').format('YYYY-MM-DD')
    const monthStart = moment(start).subtract(1, 'month').format('YYYY-MM-DD')
    const monthEnd = moment(end).subtract(1, 'month').format('YYYY-MM-DD')
    let result1 = await query(sql1, [yearStart, yearEnd])
    let result2 = await query(sql1, [monthStart, monthEnd])
    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result1.length; j++) {
            if (result[i].division_name == result1[j].division_name) {
                result[i]['sale_amount_yoy'] = result1[j].sale_amount > 0 ? 
                    ((result[i].sale_amount - result1[j].sale_amount) / result1[j].sale_amount * 100).toFixed(2) : 0
                result1.splice(j, 1)
                break
            }
        }
        for (let j = 0; j < result2.length; j++) {
            if (result[i].division_name == result2[j].division_name) {
                result[i]['sale_amount_qoq'] = result2[j].sale_amount > 0 ? 
                    ((result[i].sale_amount - result2[j].sale_amount) / result2[j].sale_amount * 100).toFixed(2) : 0
                result2.splice(j, 1)
                break
            }
        }
    }
    return result
}

goodsSalesRepo.getSalesByProject = async (start, end, type, addSales) => {
    let subsql = ''
    if (type == '1') {
        subsql = `${subsql} and date_add(s.create_time, interval 90 day) < now()`
    } else if (type == '2') {
        subsql = `${subsql} and date_add(s.create_time, interval 90 day) >= now() and date_add(s.create_time, interval 60 day) < now()`
    } else if (type == '3') {
        subsql = `${subsql} and date_add(s.create_time, interval 60 day) >= now() and date_add(s.create_time, interval 30 day) < now()`
    } else if (type == '4') {
        subsql = `${subsql} and date_add(s.create_time, interval 30 day) >= now() and date_add(s.create_time, interval 14 day) < now()`
    } else if (type == '5') {
        subsql = `${subsql} and date_add(s.create_time, interval 14 day) >= now() and date_add(s.create_time, interval 7 day) < now()`
    } else if (type == '6') {
        subsql = `${subsql} and date_add(s.create_time, interval 7 day) >= now()`
    }
    if (addSales == '0') {
        subsql = `${subsql} and a.date > date_add(s.create_time, interval 14 day)`
    }
    const sql = `select pi.project_name, ifnull(sum(a.sale_qty), 0) as sale_qty,
            ifnull(sum(a.sale_amount), 0) as sale_amount,
            ifnull(sum(a.gross_profit), 0) as gross_profit,
            if(ifnull(sum(a.sale_amount), 0) > 0, 
                (ifnull(sum(a.gross_profit), 0) - sum(a.sale_amount)) / sum(a.sale_amount) * 100,
            0) as gross_margin,
            ifnull(sum(a.profit), 0) as profit,
            if(ifnull(sum(a.sale_amount), 0) > 0, 
                (ifnull(sum(a.profit), 0) - sum(a.sale_amount)) / sum(a.sale_amount) * 100,
            0) as profit_margin
        from goods_sales1 a 
        join shop_info si on si.shop_name = a.shop_name
        join project_info pi on pi.id = si.project_id 
        join jst_goods_sku s on s.sys_sku_id = a.sku_code
        where a.date between ? and ? ${subsql}
        group by pi.project_name order by pi.project_name`
    const result = await query(sql, [start, end])
    const sql1 = `select pi.project_name, ifnull(sum(a.sale_amount), 0) as sale_amount
        from goods_sales1 a 
        join shop_info si on si.shop_name = a.shop_name 
        join project_info pi on pi.id = si.project_id 
        join jst_goods_sku s on s.sys_sku_id = a.sku_code
        where a.date between ? and ? ${subsql}
        group by pi.project_name order by pi.project_name`
    const yearStart = moment(start).subtract(1, 'year').format('YYYY-MM-DD')
    const yearEnd = moment(end).subtract(1, 'year').format('YYYY-MM-DD')
    const monthStart = moment(start).subtract(1, 'month').format('YYYY-MM-DD')
    const monthEnd = moment(end).subtract(1, 'month').format('YYYY-MM-DD')
    let result1 = await query(sql1, [yearStart, yearEnd])
    let result2 = await query(sql1, [monthStart, monthEnd])
    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result1.length; j++) {
            if (result[i].project_name == result1[j].project_name) {
                result[i]['sale_amount_yoy'] = result1[j].sale_amount > 0 ? 
                    ((result[i].sale_amount - result1[j].sale_amount) / result1[j].sale_amount * 100).toFixed(2) : 0
                result1.splice(j, 1)
                break
            }
        }
        for (let j = 0; j < result2.length; j++) {
            if (result[i].project_name == result2[j].project_name) {
                result[i]['sale_amount_qoq'] = result2[j].sale_amount > 0 ? 
                    ((result[i].sale_amount - result2[j].sale_amount) / result2[j].sale_amount * 100).toFixed(2) : 0
                result2.splice(j, 1)
                break
            }
        }
    }
    return result
}

goodsSalesRepo.getSalesByShop = async (start, end, type, addSales, shop_name) => {
    let subsql = ''
    if (shop_name) subsql = `and a.shop_name like '%${shop_name}%'`
    else if (type == '1') {
        subsql = `${subsql} and date_add(s.create_time, interval 90 day) < now()`
    } else if (type == '2') {
        subsql = `${subsql} and date_add(s.create_time, interval 90 day) >= now() and date_add(s.create_time, interval 60 day) < now()`
    } else if (type == '3') {
        subsql = `${subsql} and date_add(s.create_time, interval 60 day) >= now() and date_add(s.create_time, interval 30 day) < now()`
    } else if (type == '4') {
        subsql = `${subsql} and date_add(s.create_time, interval 30 day) >= now() and date_add(s.create_time, interval 14 day) < now()`
    } else if (type == '5') {
        subsql = `${subsql} and date_add(s.create_time, interval 14 day) >= now() and date_add(s.create_time, interval 7 day) < now()`
    } else if (type == '6') {
        subsql = `${subsql} and date_add(s.create_time, interval 7 day) >= now()`
    }
    if (addSales == '0') {
        subsql = `${subsql} and a.date > date_add(s.create_time, interval 14 day)`
    }
    const sql = `select a.shop_name, ifnull(sum(a.sale_qty), 0) as sale_qty,
            ifnull(sum(a.sale_amount), 0) as sale_amount,
            ifnull(sum(a.gross_profit), 0) as gross_profit,
            if(ifnull(sum(a.sale_amount), 0) > 0, 
                (ifnull(sum(a.gross_profit), 0) - sum(a.sale_amount)) / sum(a.sale_amount) * 100,
            0) as gross_margin,
            ifnull(sum(a.profit), 0) as profit,
            if(ifnull(sum(a.sale_amount), 0) > 0, 
                (ifnull(sum(a.profit), 0) - sum(a.sale_amount)) / sum(a.sale_amount) * 100,
            0) as profit_margin
        from goods_sales1 a 
        join jst_goods_sku s on s.sys_sku_id = a.sku_code
        where a.date between ? and ? ${subsql}
        group by a.shop_name order by a.shop_name`
    const result = await query(sql, [start, end])
    const sql1 = `select a.shop_name, ifnull(sum(a.sale_amount), 0) as sale_amount
        from goods_sales1 a 
        join jst_goods_sku s on s.sys_sku_id = a.sku_code
        where a.date between ? and ? ${subsql}
        group by a.shop_name order by a.shop_name`
    const yearStart = moment(start).subtract(1, 'year').format('YYYY-MM-DD')
    const yearEnd = moment(end).subtract(1, 'year').format('YYYY-MM-DD')
    const monthStart = moment(start).subtract(1, 'month').format('YYYY-MM-DD')
    const monthEnd = moment(end).subtract(1, 'month').format('YYYY-MM-DD')
    let result1 = await query(sql1, [yearStart, yearEnd])
    let result2 = await query(sql1, [monthStart, monthEnd])
    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result1.length; j++) {
            if (result[i].shop_name == result1[j].shop_name) {
                result[i]['sale_amount_yoy'] = result1[j].sale_amount > 0 ? 
                    ((result[i].sale_amount - result1[j].sale_amount) / result1[j].sale_amount * 100).toFixed(2) : 0
                result1.splice(j, 1)
                break
            }
        }
        for (let j = 0; j < result2.length; j++) {
            if (result[i].shop_name == result2[j].shop_name) {
                result[i]['sale_amount_qoq'] = result2[j].sale_amount > 0 ? 
                    ((result[i].sale_amount - result2[j].sale_amount) / result2[j].sale_amount * 100).toFixed(2) : 0
                result2.splice(j, 1)
                break
            }
        }
    }
    return result
}

goodsSalesRepo.getSalesBySpu = async (start, end, type, addSales, spu) => {
    let subsql = ''
    if (spu) subsql = `and si.spu_short_name like '%${spu}%'`
    else if (type == '1') {
        subsql = `${subsql} and date_add(s.create_time, interval 90 day) < now()`
    } else if (type == '2') {
        subsql = `${subsql} and date_add(s.create_time, interval 90 day) >= now() and date_add(s.create_time, interval 60 day) < now()`
    } else if (type == '3') {
        subsql = `${subsql} and date_add(s.create_time, interval 60 day) >= now() and date_add(s.create_time, interval 30 day) < now()`
    } else if (type == '4') {
        subsql = `${subsql} and date_add(s.create_time, interval 30 day) >= now() and date_add(s.create_time, interval 14 day) < now()`
    } else if (type == '5') {
        subsql = `${subsql} and date_add(s.create_time, interval 14 day) >= now() and date_add(s.create_time, interval 7 day) < now()`
    } else if (type == '6') {
        subsql = `${subsql} and date_add(s.create_time, interval 7 day) >= now()`
    }
    if (addSales == '0') {
        subsql = `${subsql} and a.date > date_add(s.create_time, interval 14 day)`
    }
    const sql = `select si.spu_short_name as spu, ifnull(sum(a.sale_qty), 0) as sale_qty,
            ifnull(sum(a.sale_amount), 0) as sale_amount,
            ifnull(sum(a.gross_profit), 0) as gross_profit,
            if(ifnull(sum(a.sale_amount), 0) > 0, 
                (ifnull(sum(a.gross_profit), 0) - sum(a.sale_amount)) / sum(a.sale_amount) * 100,
            0) as gross_margin,
            ifnull(sum(a.profit), 0) as profit,
            if(ifnull(sum(a.sale_amount), 0) > 0, 
                (ifnull(sum(a.profit), 0) - sum(a.sale_amount)) / sum(a.sale_amount) * 100,
            0) as profit_margin
        from goods_sales1 a 
        join jst_ori_sku_info si on a.sku_code = si.sku_code
        join jst_goods_sku s on s.sys_sku_id = a.sku_code
        where a.date between ? and ? ${subsql}
        group by si.spu_short_name order by si.spu_short_name`
    const result = await query(sql, [start, end])
    const sql1 = `select si.spu_short_name as spu, ifnull(sum(a.sale_amount), 0) as sale_amount
        from goods_sales1 a 
        join jst_ori_sku_info si on a.sku_code = si.sku_code
        join jst_goods_sku s on s.sys_sku_id = a.sku_code
        where a.date between ? and ? ${subsql}
        group by si.spu_short_name order by si.spu_short_name`
    const yearStart = moment(start).subtract(1, 'year').format('YYYY-MM-DD')
    const yearEnd = moment(end).subtract(1, 'year').format('YYYY-MM-DD')
    const monthStart = moment(start).subtract(1, 'month').format('YYYY-MM-DD')
    const monthEnd = moment(end).subtract(1, 'month').format('YYYY-MM-DD')
    let result1 = await query(sql1, [yearStart, yearEnd])
    let result2 = await query(sql1, [monthStart, monthEnd])
    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result1.length; j++) {
            if (result[i].spu == result1[j].spu) {
                result[i]['sale_amount_yoy'] = result1[j].sale_amount > 0 ? 
                    ((result[i].sale_amount - result1[j].sale_amount) / result1[j].sale_amount * 100).toFixed(2) : 0
                result1.splice(j, 1)
                break
            }
        }
        for (let j = 0; j < result2.length; j++) {
            if (result[i].spu == result2[j].spu) {
                result[i]['sale_amount_qoq'] = result2[j].sale_amount > 0 ? 
                    ((result[i].sale_amount - result2[j].sale_amount) / result2[j].sale_amount * 100).toFixed(2) : 0
                result2.splice(j, 1)
                break
            }
        }
    }
    return result
}

module.exports = goodsSalesRepo