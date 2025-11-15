const { query, transaction } = require('../../model/dbConn')
const goodsSalesRepo = {}
const moment = require('moment')
goodsSalesRepo.batchInsert = async (date) => {
    let sqls = [], params = []
    sqls.push(`DELETE FROM goods_sales WHERE \`date\` = ? AND shop_name !='京东自营-厨具' AND shop_name !='京东自营-日用'` )
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
            IFNULL(SUM(refund_num), 0) AS refund_num,
            IFNULL(SUM(gross_standard), 0) AS gross_standard,
            IFNULL(SUM(IF(other_cost>0,other_cost,0)),0) AS other_cost
        FROM goods_sale_info WHERE date = ? AND shop_name !='京东自营-厨具' AND shop_name !='京东自营-日用'
        GROUP BY goods_id, shop_name, shop_id`
    let rows = await query(sql, [date]), data = []
    if (!rows?.length) return false
    let chunk = Math.ceil(rows.length / 500)
    for (let i = 0; i < chunk; i++) {
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
            refund_num,
            gross_standard,
            other_cost) VALUES`, start = i * 500, data = [], 
            end = (i + 1) * 500 <= rows.length ? (i + 1) * 500 : rows.length
        for (let j = start; j < end; j++) {
            sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
            data.push(
                rows[j].goods_id, 
                rows[j].shop_name, 
                rows[j].shop_id, 
                date, 
                rows[j].sale_qty,
                rows[j].sale_amount, 
                rows[j].cost_amount, 
                rows[j].gross_profit, 
                rows[j].profit, 
                rows[j].promotion_amount, 
                rows[j].express_fee, 
                rows[j].operation_amount, 
                rows[j].real_sale_qty, 
                rows[j].refund_qty, 
                rows[j].real_sale_amount, 
                rows[j].packing_fee, 
                rows[j].real_gross_profit, 
                rows[j].bill_amount, 
                rows[j].order_num, 
                rows[j].refund_num,
                rows[j].gross_standard,
                rows[j].other_cost
            )
        }
        sql = sql.substring(0, sql.length - 1)
        sqls.push(sql)
        params.push(data)
    }
    const result = await transaction(sqls, params)
    return result
}

goodsSalesRepo.batchInsertJD = async (date) => {
    let sqls = [], params = []
    sqls.push(`DELETE FROM goods_sales WHERE \`date\` = ? AND shop_name IN ('京东自营-厨具','京东自营-日用')` )
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
            IFNULL(SUM(refund_num), 0) AS refund_num,
            IFNULL(SUM(gross_standard), 0) AS gross_standard,
            IFNULL(SUM(IF(other_cost>0,other_cost,0)),0) AS other_cost
        FROM goods_sale_info WHERE date = ? AND shop_name IN ('京东自营-厨具','京东自营-日用')
        GROUP BY goods_id, shop_name, shop_id`
    let rows = await query(sql, [date]), data = []
    if (!rows?.length) return false
    let chunk = Math.ceil(rows.length / 500)
    for (let i = 0; i < chunk; i++) {
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
            refund_num,
            gross_standard,
            other_cost) VALUES`, start = i * 500, data = [], 
            end = (i + 1) * 500 <= rows.length ? (i + 1) * 500 : rows.length
        for (let j = start; j < end; j++) {
            sql = `${sql}(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),`
            data.push(
                rows[j].goods_id, 
                rows[j].shop_name, 
                rows[j].shop_id, 
                date, 
                rows[j].sale_qty,
                rows[j].sale_amount, 
                rows[j].cost_amount, 
                rows[j].gross_profit, 
                rows[j].profit, 
                rows[j].promotion_amount, 
                rows[j].express_fee, 
                rows[j].operation_amount, 
                rows[j].real_sale_qty, 
                rows[j].refund_qty, 
                rows[j].real_sale_amount, 
                rows[j].packing_fee, 
                rows[j].real_gross_profit, 
                rows[j].bill_amount, 
                rows[j].order_num, 
                rows[j].refund_num,
                rows[j].gross_standard,
                rows[j].other_cost
            )
        }
        sql = sql.substring(0, sql.length - 1)
        sqls.push(sql)
        params.push(data)
    }
    const result = await transaction(sqls, params)
    return result
}

goodsSalesRepo.delete = async (date) => {
    const sql = `DELETE FROM goods_sales WHERE \`date\` = ?`
    const result = await query(sql, [date])
    return result?.affectedRows ? true : false
}

goodsSalesRepo.getSalesByDivision = async (start, end, productType, addSales) => {
    let subsql = ''
    if (productType == '1') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 90 day) < now()`
    } else if (productType == '2') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 90 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 60 day) < now()`
    } else if (productType == '3') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 60 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 30 day) < now()`
    } else if (productType == '4') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 30 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day) < now()`
    } else if (productType == '5') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 7 day) < now()`
    } else if (productType == '6') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 7 day) >= now()`
    }
    if (addSales == '0') {
        subsql = `${subsql} and a.date > date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day)`
    }
    const sql = `select di.division_name, a.sku_code, ifnull(sum(a.sale_qty), 0) as sale_qty,
            ifnull(sum(a.sale_amount), 0) as sale_amount,
            ifnull(sum(a.gross_profit), 0) as gross_profit,
            ifnull(sum(a.profit), 0) as profit 
        from goods_sale_info a join shop_info si on si.shop_name = a.shop_name
        join project_info pi on pi.id = si.project_id 
        join division_info di on di.id = pi.division_id
        where a.date between ? and ? ${subsql}
        group by di.division_name, a.sku_code order by di.division_name`
    const result = await query(sql, [start, end])    
    return result
}

goodsSalesRepo.getSalesByDivisionAndSkuId = async (start, end, productType, addSales, skuids) => {
    let subsql = ''
    if (productType == '1') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 90 day) < now()`
    } else if (productType == '2') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 90 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 60 day) < now()`
    } else if (productType == '3') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 60 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 30 day) < now()`
    } else if (productType == '4') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 30 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day) < now()`
    } else if (productType == '5') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 7 day) < now()`
    } else if (productType == '6') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 7 day) >= now()`
    }
    if (addSales == '0') {
        subsql = `${subsql} and a.date > date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day)`
    }
    if (skuids) {
        subsql = `${subsql} and a.sku_code in (${skuids})`
    }
    const sql = `select di.division_name, ifnull(sum(a.sale_amount), 0) as sale_amount 
        from goods_sale_info a join shop_info si on si.shop_name = a.shop_name
        join project_info pi on pi.id = si.project_id 
        join division_info di on di.id = pi.division_id
        where a.date between ? and ? ${subsql}
        group by di.division_name order by di.division_name`
    const result = await query(sql, [start, end])    
    return result
}

goodsSalesRepo.getSalesByProject = async (start, end, productType, addSales) => {
    let subsql = ''
    if (productType == '1') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 90 day) < now()`
    } else if (productType == '2') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 90 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 60 day) < now()`
    } else if (productType == '3') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 60 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 30 day) < now()`
    } else if (productType == '4') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 30 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day) < now()`
    } else if (productType == '5') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 7 day) < now()`
    } else if (productType == '6') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 7 day) >= now()`
    }
    if (addSales == '0') {
        subsql = `${subsql} and a.date > date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day)`
    }
    const sql = `select pi.project_name, a.sku_code, ifnull(sum(a.sale_qty), 0) as sale_qty,
            ifnull(sum(a.sale_amount), 0) as sale_amount,
            ifnull(sum(a.gross_profit), 0) as gross_profit,
            ifnull(sum(a.profit), 0) as profit 
        from goods_sale_info a join shop_info si on si.shop_name = a.shop_name
        join project_info pi on pi.id = si.project_id 
        where a.date between ? and ? ${subsql}
        group by pi.project_name, a.sku_code order by pi.project_name`
    const result = await query(sql, [start, end])
    return result
}

goodsSalesRepo.getSalesByProjectAndSkuId = async (start, end, productType, addSales, skuids) => {
    let subsql = ''
    if (productType == '1') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 90 day) < now()`
    } else if (productType == '2') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 90 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 60 day) < now()`
    } else if (productType == '3') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 60 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 30 day) < now()`
    } else if (productType == '4') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 30 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day) < now()`
    } else if (productType == '5') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 7 day) < now()`
    } else if (productType == '6') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 7 day) >= now()`
    }
    if (addSales == '0') {
        subsql = `${subsql} and a.date > date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day)`
    }
    if (skuids) {
        subsql = `${subsql} and a.sku_code in (${skuids})`
    }
    const sql = `select pi.project_name, ifnull(sum(a.sale_amount), 0) as sale_amount 
        from goods_sale_info a join shop_info si on si.shop_name = a.shop_name
        join project_info pi on pi.id = si.project_id 
        where a.date between ? and ? ${subsql}
        group by pi.project_name order by pi.project_name`
    const result = await query(sql, [start, end])
    return result
}

goodsSalesRepo.getSalesByShop = async (start, end, productType, addSales, shop_name) => {
    let subsql = ''
    if (shop_name) subsql = `and a.shop_name like '%${shop_name}%'`
    if (productType == '1') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 90 day) < now()`
    } else if (productType == '2') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 90 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 60 day) < now()`
    } else if (productType == '3') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 60 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 30 day) < now()`
    } else if (productType == '4') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 30 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day) < now()`
    } else if (productType == '5') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 7 day) < now()`
    } else if (productType == '6') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 7 day) >= now()`
    }
    if (addSales == '0') {
        subsql = `${subsql} and a.date > date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day)`
    }
    const sql = `select a.shop_name, a.sku_code, ifnull(sum(a.sale_qty), 0) as sale_qty,
            ifnull(sum(a.sale_amount), 0) as sale_amount,
            ifnull(sum(a.gross_profit), 0) as gross_profit,
            ifnull(sum(a.profit), 0) as profit 
        from goods_sale_info a where a.date between ? and ? ${subsql}
        group by a.shop_name, a.sku_code order by a.shop_name`
    const result = await query(sql, [start, end])
    return result
}

goodsSalesRepo.getSalesByShopAndSkuId = async (start, end, productType, addSales, shop_name, skuids) => {
    let subsql = ''
    if (shop_name) subsql = `and a.shop_name like '%${shop_name}%'`
    if (productType == '1') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 90 day) < now()`
    } else if (productType == '2') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 90 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 60 day) < now()`
    } else if (productType == '3') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 60 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 30 day) < now()`
    } else if (productType == '4') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 30 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day) < now()`
    } else if (productType == '5') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 7 day) < now()`
    } else if (productType == '6') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 7 day) >= now()`
    }
    if (addSales == '0') {
        subsql = `${subsql} and a.date > date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day)`
    }
    if (skuids) {
        subsql = `${subsql} and a.sku_code in (${skuids})`
    }
    const sql = `select a.shop_name, ifnull(sum(a.sale_amount), 0) as sale_amount 
        from goods_sale_info a where a.date between ? and ? ${subsql}
        group by a.shop_name order by a.shop_name`
    const result = await query(sql, [start, end])
    return result
}

goodsSalesRepo.getSalesBySpu = async (start, end, productType, addSales, spu) => {
    let subsql = ''
    if (spu) subsql = `and si.spu_short_name like '%${spu}%'`
    if (productType == '1') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 90 day) < now()`
    } else if (productType == '2') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 90 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 60 day) < now()`
    } else if (productType == '3') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 60 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 30 day) < now()`
    } else if (productType == '4') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 30 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day) < now()`
    } else if (productType == '5') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 7 day) < now()`
    } else if (productType == '6') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 7 day) >= now()`
    }
    if (addSales == '0') {
        subsql = `${subsql} and a.date > date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day)`
    }
    const sql = `select si.spu_short_name as spu, a.sku_code, ifnull(sum(a.sale_qty), 0) as sale_qty,
            ifnull(sum(a.sale_amount), 0) as sale_amount,
            ifnull(sum(a.gross_profit), 0) as gross_profit,
            ifnull(sum(a.profit), 0) as profit 
        from goods_sale_info a join jst_ori_sku_info si on a.sku_code = si.sku_code 
        where a.date between ? and ? ${subsql}
        group by si.spu_short_name, a.sku_code order by si.spu_short_name`
    const result = await query(sql, [start, end])
    return result
}

goodsSalesRepo.getSalesBySpuAndSkuId = async (start, end, productType, addSales, spu, skuids) => {
    let subsql = ''
    if (spu) subsql = `and si.spu_short_name like '%${spu}%'`
    if (productType == '1') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 90 day) < now()`
    } else if (productType == '2') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 90 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 60 day) < now()`
    } else if (productType == '3') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 60 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 30 day) < now()`
    } else if (productType == '4') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 30 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day) < now()`
    } else if (productType == '5') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day) >= now() 
            and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 7 day) < now()`
    } else if (productType == '6') {
        subsql = `${subsql} and date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 7 day) >= now()`
    }
    if (addSales == '0') {
        subsql = `${subsql} and a.date > date_add(
            (select min(s.create_time) from jst_goods_sku s where 
                (a.sku_code = s.sys_sku_id or s.sys_sku_id in (
                    select c.组合商品编码 from danpin.combination_product_code c where c.商品编码 = a.sku_code
                )) and a.goods_id = s.goods_id), interval 14 day)`
    }
    if (skuids) {
        subsql = `${subsql} and a.sku_code in (${skuids})`
    }
    const sql = `select si.spu_short_name as spu, ifnull(sum(a.sale_amount), 0) as sale_amount 
        from goods_sale_info a join jst_ori_sku_info si on a.sku_code = si.sku_code 
        where a.date between ? and ? ${subsql}
        group by si.spu_short_name order by si.spu_short_name`
    const result = await query(sql, [start, end])
    return result
}

goodsSalesRepo.InsertInventory = async () =>{
    let sql = `DELETE from inventory_attributes`
    let result = await query(sql)
    sql = `INSERT INTO inventory_attributes (sku_code,spu_name,first_category,second_category,third_category,
        cost_price,ps,image,create_time,turnover_officer,nj30_sale_qty,nj7_sale_qty,nj_transit,nj_num,jd_colud,
        goods_info,sku_id,jd30_sale_qty,jd7_sale_qty,jd_num,jd_transit)
        SELECT a.商品编码 AS sku_code,a.spu简称,a.一级类目,a.二级类目,a.三级类目,IFNULL( a.成本价, a.采购价 ),
            a.备注标签,a.图片,a.创建时间,a.周转员,IFNULL( b.nj30_sale_qty, 0 ),IFNULL( c.nj7_sale_qty, 0 ),
            IFNULL( d.nj_transit, 0 ),IFNULL( d.nj_num, 0 ),IFNULL( d.jd_colud, 0 ),a.商品属性,a.款式编码,
            IFNULL( e.sale_qty, 0 ) AS jd30_sale_qty,IFNULL( f.sale_qty, 0 ) AS jd7_sale_qty,
            IFNULL( g.jd_num, 0 ) AS jd_num,IFNULL( g.jd_transit, 0 ) AS jd_transit 
        FROM danpin.goods_info AS a
        LEFT JOIN (
            SELECT sku_code,SUM( sale_qty ) AS nj30_sale_qty 
            FROM goods_sale_info 
            WHERE DATE BETWEEN DATE_SUB( DATE ( NOW()), INTERVAL 30 DAY ) 
                AND DATE_SUB( DATE ( NOW()), INTERVAL 1 DAY ) 
                AND shop_name NOT IN ( '京东自营-厨具', '京东自营-日用' ) 
            GROUP BY sku_code 
            ) AS b ON UPPER( a.商品编码 ) = UPPER( b.sku_code )
            LEFT JOIN (
            SELECT sku_code,SUM( sale_qty ) AS nj7_sale_qty 
            FROM goods_sale_info 
            WHERE DATE BETWEEN DATE_SUB( DATE ( NOW()), INTERVAL 7 DAY ) 
                AND DATE_SUB( DATE ( NOW()), INTERVAL 1 DAY ) 
                AND shop_name NOT IN ( '京东自营-厨具', '京东自营-日用' ) 
            GROUP BY sku_code 
            ) AS c ON UPPER( a.商品编码 ) = UPPER( c.sku_code )
            LEFT JOIN (
            SELECT a.sku_code,a.transit AS nj_transit,
                a.main_inventory - a.orders_num + a.stock_num - IFNULL( b.jd_colud, 0 ) - IFNULL( b.COUPANG, 0 ) AS nj_num,
                IFNULL( b.jd_colud, 0 ) AS jd_colud 
            FROM jst_goods_inventory AS a
                LEFT JOIN (
                SELECT
                    商品编码,
                    sum(IF(运营云仓名称= '南京仓京东自备',运营云仓可用数, 0 )) AS jd_colud,
                    sum(IF(运营云仓名称= 'COUPANG/猫超南京仓',运营云仓可用数, 0 )) AS 'COUPANG' 
                FROM danpin.goods_kucun_fen 
                WHERE 运营云仓名称 IN ( '南京仓京东自备', 'COUPANG/猫超南京仓' ) 
                    AND 统计日期 = DATE_SUB( DATE ( NOW()), INTERVAL 1 DAY ) 
                GROUP BY 商品编码 
                ) AS b ON a.sku_code = b.商品编码 
            WHERE a.DATE = DATE_SUB( DATE ( NOW()), INTERVAL 1 DAY ) 
            ) AS d ON UPPER( a.商品编码 ) = UPPER( d.sku_code )
        LEFT JOIN (
        SELECT a.商品编码 AS sku_code,SUM( a.数量 ) AS sale_qty 
        FROM(
            SELECT IFNULL( c.商品编码, a.编码 ) AS '商品编码',
            IF( c.数量 IS NOT NULL, a.数量 * c.数量, a.数量 ) AS '数量' 
            FROM(
                SELECT
                    编码,发货商品件数 AS '数量',时间 
                FROM danpin.jb_ziying 
                WHERE 时间 >= DATE_SUB( DATE ( NOW()), INTERVAL 30 DAY )
                UNION ALL
                SELECT 编码,发货商品件数 AS '数量',时间 
                FROM danpin.jb_ziying_everday 
                WHERE 时间 >= DATE_SUB( DATE ( NOW()), INTERVAL 30 DAY ) 
                ) AS a
            LEFT JOIN ( 
                SELECT 组合商品编码,商品编码,数量,(数量*子商品成本价)/组合成本价 AS '占比' 
                FROM danpin.combination_product_code 
            ) AS c ON a.编码 = c.组合商品编码 
        ) AS a 
        WHERE a.商品编码 IS NOT NULL AND 数量 IS NOT NULL 
        GROUP BY a.商品编码 
        ) AS e ON UPPER( a.商品编码 ) = UPPER( e.sku_code )
        LEFT JOIN (
        SELECT
            a.商品编码 AS sku_code,SUM( a.数量 ) AS sale_qty 
        FROM(
            SELECT IFNULL( c.商品编码, a.编码 ) AS '商品编码',
            IF( c.数量 IS NOT NULL, a.数量 * c.数量, a.数量 ) AS '数量' 
            FROM(
                SELECT 编码,发货商品件数 AS '数量',时间 
                FROM danpin.jb_ziying 
                WHERE 时间 >= DATE_SUB( DATE ( NOW()), INTERVAL 7 DAY )
                UNION ALL
                SELECT 编码,发货商品件数 AS '数量',时间 
                FROM danpin.jb_ziying_everday 
                WHERE 时间 >= DATE_SUB( DATE ( NOW()), INTERVAL 7 DAY ) 
            ) AS a
            LEFT JOIN (
                SELECT 组合商品编码,商品编码,数量,(数量*子商品成本价)/组合成本价 AS '占比' 
                FROM danpin.combination_product_code 
            ) AS c ON a.编码 = c.组合商品编码 
        ) AS a 
        WHERE a.商品编码 IS NOT NULL AND 数量 IS NOT NULL 
        GROUP BY a.商品编码 
        ) AS f ON UPPER( a.商品编码 ) = UPPER( f.sku_code )
        LEFT JOIN (
        SELECT a.商品编码 AS sku_code,sum(京东仓库存) AS jd_num,sum(京东在途库存) AS jd_transit 
        FROM(
            SELECT IFNULL( c.商品编码, a.商品编码 ) AS '商品编码',
                IFNULL( IF ( c.数量 IS NULL, a.京东仓库存, a.京东仓库存 * c.数量 ), 0 ) AS '京东仓库存',
                IFNULL( IF ( c.数量 IS NULL, a.京东在途库存, a.京东在途库存 * c.数量 ), 0 ) AS '京东在途库存' 
            FROM(
                SELECT b.CODE AS '商品编码',a.* 
                FROM(
                    SELECT SKU,全国现货库存 AS '京东仓库存',全国采购在途数量 AS '京东在途库存' 
                    FROM danpin.inventory_jdzz 
                    WHERE 时间 = DATE_SUB( DATE ( NOW()), INTERVAL 1 DAY ) 
                ) AS a
                LEFT JOIN bi_serve.dianshang_operation_attribute AS b ON a.SKU = b.sku_id 
            ) AS a
                LEFT JOIN danpin.combination_product_code AS c ON a.商品编码 = c.组合商品编码 
            WHERE a.商品编码 IS NOT NULL 
            ) AS a 
        WHERE a.商品编码 IS NOT NULL 
        GROUP BY a.商品编码 
        ) AS g ON UPPER( a.商品编码 ) = UPPER(g.sku_code)`
    result = await query(sql)
    return result
}

goodsSalesRepo.updateTags = async() =>{
    const sql = `UPDATE inventory_attributes a LEFT join (
            select sku_code,SUM(io_qty) as io_qty 
            from jst_purchase_info 
            WHERE DATE_FORMAT(io_date,'%Y-%m-%d') BETWEEN DATE_SUB(DATE(NOW()),INTERVAL 30 day) and DATE_SUB(DATE(NOW()),INTERVAL 1 day) 
            GROUP BY sku_code) as b
            on a.sku_code = b.sku_code 
            set a.io_qty = IF(b.io_qty is not null,b.io_qty,0),a.update_time = CURRENT_TIMESTAMP`
    const result = await query(sql)   
    const sql1 =`UPDATE inventory_attributes a LEFT JOIN (
            SELECT sku_code,MIN(io_date) AS io_date
                FROM jst_purchase_info 
                GROUP BY sku_code
            ) AS b
            ON a.sku_code = b.sku_code 
            SET a.io_date = b.io_date,a.update_time = CURRENT_TIMESTAMP`
    const result1 = await query(sql1)
    const sql2 = `UPDATE inventory_attributes a LEFT join (
            select sku_code,SUM(qty) as qty 
            from jst_purchase_return 
            WHERE DATE_FORMAT(return_date,'%Y-%m-%d') BETWEEN DATE_SUB(DATE(NOW()),INTERVAL 30 day) and DATE_SUB(DATE(NOW()),INTERVAL 1 day) 
            GROUP BY sku_code) as b
            on a.sku_code = b.sku_code 
            set a.fund_num = IF(b.qty is not null,b.qty,0),a.update_time = CURRENT_TIMESTAMP`
    const result2 = await query(sql2)
    const sql3 = `UPDATE inventory_attributes as a LEFT JOIN(
                select sku_code,min(onsale_date) as onsale_date from (
                select IFNULL(b.商品编码,a.code) as sku_code,min(onsale_date) as onsale_date  from dianshang_operation_attribute AS a
                LEFT JOIN danpin.combination_product_code as b
                ON upper(a.code)=upper(b.组合商品编码) 	GROUP BY sku_code
                UNION ALL 
                select sys_sku_id,min(create_time) from jst_goods_sku GROUP BY sys_sku_id
                ) as a GROUP BY sku_code) as b
                on upper(a.sku_code) = upper(b.sku_code)
                SET a.onsale_date = b.onsale_date 
                WHERE a.onsale_date is null`
    const result3 = await query(sql3)
    return result3
}

goodsSalesRepo.getsputags = async() =>{
    let sql = `SELECT '库存成本' as label
			,ROUND(SUM((IFNULL(nj_num,0)+IFNULL(nj_transit,0))*cost_price),0) as nj_total_cost
			,ROUND(SUM(IFNULL(nj_num,0)*cost_price),0) as nj_cost
			,ROUND(SUM((IFNULL(jd_num,0)+IFNULL(jd_transit,0)+IFNULL(jd_colud,0))*cost_price),0) as jd_cost
        FROM inventory_attributes
        WHERE IFNULL(ps,'') NOT REGEXP '配件|零件' AND goods_info != '包材'
        UNION ALL
        SELECT '7天日均销售成本可支撑天数' as label
			,ROUND(SUM((IFNULL(nj_num,0)+IFNULL(nj_transit,0))*cost_price)/SUM(IFNULL(nj7_sale_qty,0)*cost_price/7),0) as nj_total_cost
			,ROUND(SUM(IFNULL(nj_num,0)*cost_price)/SUM(IFNULL(nj7_sale_qty,0)*cost_price/7),0) as nj_cost
			,ROUND(SUM((IFNULL(jd_num,0)+IFNULL(jd_transit,0)+IFNULL(jd_colud,0))*cost_price)/SUM(IFNULL(jd7_sale_qty,0)*cost_price/7),0) as jd_cost
        FROM inventory_attributes
        WHERE IFNULL(ps,'') NOT REGEXP '配件|零件' AND goods_info != '包材'
        UNION ALL
        SELECT '30天日均销售成本可支撑天数' as label
			,ROUND(SUM((IFNULL(nj_num,0)+IFNULL(nj_transit,0))*cost_price)/SUM(IFNULL(nj30_sale_qty,0)*cost_price/30),0) as nj_total_cost
			,ROUND(SUM(IFNULL(nj_num,0)*cost_price)/SUM(IFNULL(nj30_sale_qty,0)*cost_price/30),0) as nj_cost
			,ROUND(SUM((IFNULL(jd_num,0)+IFNULL(jd_transit,0)+IFNULL(jd_colud,0))*cost_price)/SUM(IFNULL(jd30_sale_qty,0)*cost_price/30),0) as jd_cost
        FROM inventory_attributes
        WHERE IFNULL(ps,'') NOT REGEXP '配件|零件' AND goods_info != '包材'
        UNION ALL
        SELECT '配件/零件库存成本' as label
			,ROUND(SUM((IFNULL(nj_num,0)+IFNULL(nj_transit,0))*cost_price),0) as nj_total_cost
			,ROUND(SUM(IFNULL(nj_num,0)*cost_price),0) as nj_cost
			,ROUND(SUM((IFNULL(jd_num,0)+IFNULL(jd_transit,0)+IFNULL(jd_colud,0))*cost_price),0) as jd_cost
        FROM inventory_attributes
        WHERE IFNULL(ps,'') REGEXP '配件|零件' AND goods_info != '包材'
        UNION ALL
        SELECT '包材库存成本' as label
			,ROUND(SUM((IFNULL(nj_num,0)+IFNULL(nj_transit,0))*cost_price),0) as nj_total_cost
			,ROUND(SUM(IFNULL(nj_num,0)*cost_price),0) as nj_cost
			,ROUND(SUM((IFNULL(jd_num,0)+IFNULL(jd_transit,0)+IFNULL(jd_colud,0))*cost_price),0) as jd_cost
        FROM inventory_attributes
        WHERE goods_info = '包材' `
    const result = await query(sql)
    return result
}

goodsSalesRepo.getsputags1 = async(params) =>{
    let page = parseInt(params.currentPage)
    let size = parseInt(params.pageSize)
    let offset = (page - 1) * size
    let result = {
        currentPage: params.currentPage,
        pageSize: params.pageSize,
        data: []
    }
    let sql = `SELECT second_category
			,third_category
			,spu_name
			,sku_code
			,cost_price
			,IFNULL(nj_num,0)+IFNULL(nj_transit,0) as nj_total_num
			,ROUND((IFNULL(nj_num,0)+IFNULL(nj_transit,0))*cost_price,2) as nj_total_cost
			,ROUND((IFNULL(nj_num,0)+IFNULL(nj_transit,0))*cost_price/(IFNULL(nj7_sale_qty,0)*cost_price/7),0) as nj7_total_sale_days
			,ROUND((IFNULL(nj_num,0)+IFNULL(nj_transit,0))*cost_price/(IFNULL(nj30_sale_qty,0)*cost_price/30),0) as nj30_total_sale_days
			,IFNULL(nj_num,0) as nj_num
			,ROUND(IFNULL(nj_num,0)*cost_price,2) as nj_cost
			,ROUND(IFNULL(nj_num,0)*cost_price/(IFNULL(nj7_sale_qty,0)*cost_price/7),0) as nj7_sale_days
			,ROUND(IFNULL(nj_num,0)*cost_price/(IFNULL(nj30_sale_qty,0)*cost_price/30),0) as nj30_sale_days
			,IFNULL(jd_num,0)+IFNULL(jd_transit,0)+IFNULL(jd_colud,0) as jd_num
			,ROUND((IFNULL(jd_num,0)+IFNULL(jd_transit,0)+IFNULL(jd_colud,0))*cost_price,2) as jd_cost
			,ROUND((IFNULL(jd_num,0)+IFNULL(jd_transit,0)+IFNULL(jd_colud,0))*cost_price/(IFNULL(jd7_sale_qty,0)*cost_price)/7,0) as jd7_sale_days
			,ROUND((IFNULL(jd_num,0)+IFNULL(jd_transit,0)+IFNULL(jd_colud,0))*cost_price/(IFNULL(jd30_sale_qty,0)*cost_price)/30,0) as jd30_sale_days
			,turnover_officer
        FROM inventory_attributes`
    let sql1= `select count(1) as count from (${sql} )as a `
    let data1 = await query(sql1)
    result.total = data1[0].count
    sql = `${sql} LIMIT ${offset}, ${size}`
    let data = await query(sql)
    result.data = data
    return result
}

goodsSalesRepo.getfirst = async(type) =>{
    let subsql = ''
    if (type == 1){
        subsql = `WHERE shipping_attributes is null`
    }
    let sql = `SELECT IFNULL(first_category,'无类目') as first_category
                ,'' as second_category
                ,'' as third_category
                ,IFNULL(ROUND(sum(num*cost_price)/10000,1),0) as cost
                ,IFNULL(ROUND(SUM(total_num*cost_price)/10000,1),0) as total_cost
                ,IFNULL(ROUND(SUM(num)/(SUM(day7_sale_qty)/7),0),0) as stock_sale7
                ,IFNULL(ROUND(SUM(num)/(SUM(day30_sale_qty)/30),0),0) as stock_sale30
                ,IFNULL(ROUND(SUM(day30_sale_qty)/(SUM(num30)+SUM(io_qty)-IFNULL(SUM(fund_num),0))*100,2),0) as sell_through_rate
                ,IFNULL(ROUND(SUM(day30_sale_qty*cost_price)/((sum(num30*cost_price)+sum(num*cost_price))*2)*100,2),0) as inventory_turnover
                ,IFNULL(SUM(month6_sale_qty),0) as month6_sale_qty
				,IFNULL(SUM(day30_sale_qty),0) as day30_sale_qty
                ,MAX(ps) as ps
            from inventory_attributes ${subsql}
            GROUP BY first_category
            ORDER BY first_category`
    let sql1 = `select *,(CASE
                WHEN (stock_sale30 >90 and month6_sale_qty<=10) OR day30_sale_qty <= 10 THEN '零动销'
                WHEN (stock_sale30 >90 and month6_sale_qty>10) OR ps like '%滞销%' OR ps like '%销完下架%' THEN '滞销'
                WHEN stock_sale30 >60 and stock_sale30 <= 90 THEN '低周转'
                WHEN stock_sale30 >30 and stock_sale30 <= 60  THEN '正常周转'
                WHEN stock_sale30 <=30 THEN '高周转'
                END) as attribute from ( ${sql})as a`
    const result = await query(sql1)
    for (let i=0;i<result.length;i++){
        if(result[i].first_category != '无类目'){
            result[i].hasChild=true
        }else{
            result[i].hasChild=false
        }
        result[i].parent_id=null
    }
    return result
}

goodsSalesRepo.getfirstInfo  =async(type,first,second,third) =>{
    let sql = ``
    if (type == 1){
        subsql = `AND shipping_attributes is null`
    }
    if(first !=1){
        sql = `SELECT '${first}' as parent_id
        ,second_category as second_category
        ,'' as third_category
        ,IFNULL(ROUND(sum(num*cost_price)/10000,1),0) as cost
        ,IFNULL(ROUND(SUM(total_num*cost_price)/10000,1),0) as total_cost
        ,IFNULL(ROUND(SUM(num)/(SUM(day7_sale_qty)/7),0),0) as stock_sale7
        ,IFNULL(ROUND(SUM(num)/(SUM(day30_sale_qty)/30),0),0) as stock_sale30
        ,IFNULL(ROUND(SUM(day30_sale_qty)/(SUM(num30)+SUM(io_qty)-IFNULL(SUM(fund_num),0))*100,2),0) as sell_through_rate
        ,IFNULL(ROUND(SUM(day30_sale_qty*cost_price)/((sum(num30*cost_price)+sum(num*cost_price))*2)*100,2),0) as inventory_turnover
        ,IFNULL(SUM(month6_sale_qty),0) as month6_sale_qty
		,IFNULL(SUM(day30_sale_qty),0) as day30_sale_qty
        ,MAX(ps) as ps
    from inventory_attributes WHERE first_category = '${first}' ${subsql}
    GROUP BY second_category
    ORDER BY second_category`
    }else if (first==1&&second!=1){
        sql = `SELECT '${second}' as parent_id
                ,third_category as third_category
                ,IFNULL(ROUND(sum(num*cost_price)/10000,1),0) as cost
                ,IFNULL(ROUND(SUM(total_num*cost_price)/10000,1),0) as total_cost
                ,IFNULL(ROUND(SUM(num)/(SUM(day7_sale_qty)/7),0),0) as stock_sale7
                ,IFNULL(ROUND(SUM(num)/(SUM(day30_sale_qty)/30),0),0) as stock_sale30
                ,IFNULL(ROUND(SUM(day30_sale_qty)/(SUM(num30)+SUM(io_qty)-IFNULL(SUM(fund_num),0))*100,2),0) as sell_through_rate
                ,IFNULL(ROUND(SUM(day30_sale_qty*cost_price)/((sum(num30*cost_price)+sum(num*cost_price))*2)*100,2),0) as inventory_turnover
                ,IFNULL(SUM(month6_sale_qty),0) as month6_sale_qty
				,IFNULL(SUM(day30_sale_qty),0) as day30_sale_qty
                ,MAX(ps) as ps
            from inventory_attributes WHERE second_category = '${second}' ${subsql}
            GROUP BY third_category
            ORDER BY third_category`
    }
    else if (first==1&&second ==1){
        sql = `SELECT '${third}' as parent_id
                ,spu_name as spu_name
                ,IFNULL(ROUND(sum(num*cost_price)/10000,1),0) as cost
                ,IFNULL(ROUND(SUM(total_num*cost_price)/10000,1),0) as total_cost
                ,IFNULL(ROUND(SUM(num)/(SUM(day7_sale_qty)/7),0),0) as stock_sale7
                ,IFNULL(ROUND(SUM(num)/(SUM(day30_sale_qty)/30),0),0) as stock_sale30
                ,IFNULL(ROUND(SUM(day30_sale_qty)/(SUM(num30)+SUM(io_qty)-IFNULL(SUM(fund_num),0))*100,2),0) as sell_through_rate
                ,IFNULL(ROUND(SUM(day30_sale_qty*cost_price)/((sum(num30*cost_price)+sum(num*cost_price))*2)*100,2),0) as inventory_turnover
                ,IFNULL(SUM(month6_sale_qty),0) as month6_sale_qty
				,IFNULL(SUM(day30_sale_qty),0) as day30_sale_qty
                ,MAX(ps) as ps
            from inventory_attributes WHERE third_category = '${third}' ${subsql}
            GROUP BY spu_name
            ORDER BY spu_name`
    }
    let sql1 = `select *,(CASE
                WHEN (stock_sale30 >90 and month6_sale_qty<=10) OR day30_sale_qty <= 10 THEN '零动销'
                WHEN (stock_sale30 >90 and month6_sale_qty>10) OR ps like '%滞销%' OR ps like '%销完下架%' THEN '滞销'
                WHEN stock_sale30 >60 and stock_sale30 <= 90 THEN '低周转'
                WHEN stock_sale30 >30 and stock_sale30 <= 60  THEN '正常周转'
                WHEN stock_sale30 <=30 THEN '高周转'
                END) as attribute from ( ${sql})as a`
    const result = await query(sql1)
    for (let i=0;i<result.length;i++){
        if(result[i].second_category != null || result[i].third_category != null){
            result[i].hasChild=true
        }else{
            result[i].hasChild=false
        }
        result[i].parent_id=null
    }
    return result
}

goodsSalesRepo.getnegativeProfit =async(goods_id) =>{
    const sql = `SELECT DATE_FORMAT(date,'%Y-%m-%d') AS date
			,sale_amount
			,promotion_amount
			,operation_amount
			,cost_amount
			,profit
			,profit
			,CONCAT(ROUND(profit/sale_amount*100,2),'%') as profit_rate
        FROM goods_sales
        WHERE profit<0 AND goods_id = ?
        AND date BETWEEN DATE_SUB(CURRENT_DATE,INTERVAL 30 DAY) and DATE_SUB(CURRENT_DATE,INTERVAL 1 DAY)`
    const result = await query(sql,[goods_id])
    return result
}

goodsSalesRepo.getNotList = async() =>{
    let sql = `select * FROM(
        SELECT a.link
            ,a.商品编码 AS sku_code
            ,a.first_order_num
            ,a.second_order_num
            ,a.third_order_num
            ,a.\`first\`
            ,a.\`second\`
            ,a.third
            ,DATE_FORMAT(b.io_date,"%Y-%m-%d") AS io_date
            ,DATE_FORMAT(c.first_onsale_date,"%Y-%m-%d") AS first_onsale_date
            ,DATE_FORMAT(c.second_onsale_date,"%Y-%m-%d") AS second_onsale_date
            ,DATE_FORMAT(c.third_onsale_date,"%Y-%m-%d") AS third_onsale_date
            ,(CASE 
            WHEN a.\`first\` ='选中' AND  first_onsale_date is not NULL THEN '上架'
            WHEN a.\`first\` ='未选中' AND  first_onsale_date is NULL THEN '上架'
            WHEN a.\`first\` ='未选中' AND  first_onsale_date is not NULL THEN '上架'
            ELSE '未上架'END) as first_info
            ,(CASE 
            WHEN a.\`second\` ='选中' AND  second_onsale_date is not NULL THEN '上架'
            WHEN a.\`second\` ='未选中' AND  second_onsale_date is NULL THEN '上架'
            WHEN a.\`second\` ='未选中' AND  second_onsale_date is not NULL THEN '上架'
            ELSE '未上架'END) as second_info
            ,(CASE 
            WHEN a.\`third\` ='选中' AND  third_onsale_date is not NULL THEN '上架'
            WHEN a.\`third\` ='未选中' AND  third_onsale_date is NULL THEN '上架'
            WHEN a.\`third\` ='未选中' AND  third_onsale_date is not NULL THEN '上架'
            ELSE '未上架'END) as third_info
            ,yi,er,san
        FROM (
            SELECT CONCAT('http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=',process_id) AS link
                    ,商品编码
                    ,IF(first_order_num REGEXP '^[0-9]+$',first_order_num,0) AS first_order_num
                    ,IF(second_order_num REGEXP '^[0-9]+$',second_order_num,0) AS second_order_num
                    ,IF(third_order_num REGEXP '^[0-9]+$',third_order_num,0) AS third_order_num
                    ,IF(first_order_num = '未选中' OR first_order_num = '0' OR TRIM(first_order_num) = '' OR first_order_num = '0.','未选中','选中') as first
                    ,IF(second_order_num = '未选中' OR second_order_num = '0' OR TRIM(second_order_num) = '' OR second_order_num = '0.','未选中','选中') as second
                    ,IF(third_order_num = '未选中' OR third_order_num = '0' OR TRIM(third_order_num) = '' OR third_order_num = '0.','未选中','选中') as third
                    ,first_order_num as yi,second_order_num as er,third_order_num as san
            FROM (
            SELECT t.process_id,
                    JSON_UNQUOTE(JSON_EXTRACT(t.content, CONCAT('$[', n.seq, ']."商品编码"'))) AS 商品编码,
                    COALESCE(JSON_UNQUOTE(JSON_EXTRACT(t.content, CONCAT('$[', n.seq, ']."事业部一订货量"'))), '0')  AS first_order_num,
                    COALESCE(JSON_UNQUOTE(JSON_EXTRACT(t.content, CONCAT('$[', n.seq, ']."事业部二订货量"'))), '0') AS second_order_num,
                    COALESCE(JSON_UNQUOTE(JSON_EXTRACT(t.content, CONCAT('$[', n.seq, ']."事业部三订货量"'))), '0') AS third_order_num
            FROM process_info t
            LEFT JOIN processes as b
            ON t.process_id = b.process_id
            JOIN (
                SELECT 0 AS seq UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
                UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11  UNION SELECT 12 UNION SELECT 13
                UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
            ) n ON n.seq < JSON_LENGTH(t.content)
            WHERE t.field IN ('Fnt5ma3psjitfcc','Fyf1ma3jfyi7fuc','Fnt5ma3psjitfcc','Fo5uma263lluhdc','Fz3jma3psq0dfhc') 
            AND t.content IS NOT NULL AND t.process_id IN (SELECT process_id FROM processes WHERE title LIKE '%推品%' 
            AND process_id NOT IN(select process_id from process_info WHERE title = '运营事业部' and content = '刘海涛事业部-coupang'))
            AND b.status != 4 AND b.status != 3
            ) AS a 
            WHERE first_order_num !=0 OR second_order_num !=0 OR third_order_num !=0
            )as a
            LEFT JOIN (select sku_code,min(io_date) as io_date FROM jst_purchase_info GROUP BY sku_code) as b
            ON a.商品编码 = b.sku_code
            LEFT JOIN  sku_onsale_date  as c ON a.商品编码 = c.sku_code
            WHERE b.sku_code IS NOT NULL ) as a WHERE  sku_code NOT IN ('女神便携钛杯粉色','咖啡豆塞上明珠125g','咖啡豆青柚小雏菊125G','咖啡豆香草威士忌125g') 
            AND (first_info ='未上架' OR second_info ='未上架' OR third_info ='未上架')`
    let result = await query(sql)
    for (i =0;i<result.length-1;i++){
        let sql1 = `SELECT sku_code
			,spu_name
			,first_category
			,second_category
			,third_category
			,image
			,ps
			,DATE_FORMAT(create_time,"%Y-%m-%d") AS create_time
			,IF(DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY) <= create_time ,'新品' ,'老品') AS create_info
			,(CASE 
			WHEN \`year\` is not null THEN \`year\`
			WHEN \`year\` is NULL AND create_time >='2025-04-01'  THEN '25年4月以后新品'
			ELSE '2024'
			END) AS 'year'
			,IFNULL(jd_colud,0) AS jd_colud
			,IFNULL(nj_num,0) AS nj_num
			,IFNULL(jd_num,0) AS jd_num
			,IFNULL(jd_transit,0) AS jd_transit
			,IFNULL(nj_num,0)+IFNULL(jd_num,0) AS num
			,IFNULL(jd_transit,0)+IFNULL(nj_transit,0) AS transit
			,IFNULL(nj_num,0)+IFNULL(jd_num,0)+IFNULL(jd_transit,0)+IFNULL(nj_transit,0) AS total_num
            FROM inventory_attributes
            WHERE sku_code = '${result[i].sku_code}'`
        let row = await query(sql1)
        if(row?.length){
            result[i].spu_name =  row[0].spu_name  ? row[0].spu_name : null
            result[i].first_category =  row[0].first_category ? row[0].first_category : null
            result[i].second_category =  row[0].second_category ? row[0].second_category : null
            result[i].third_category =  row[0].third_category ? row[0].third_category : null
            result[i].image =  row[0].image ? row[0].image : null
            result[i].ps =  row[0].ps ? row[0].ps : null
            result[i].create_time =  row[0].create_time ? row[0].create_time : null
            result[i].create_info =  row[0].create_info ? row[0].create_info : null
            result[i].year =  row[0].year ? row[0].year : null
            result[i].jd_colud =  row[0].jd_colud ? row[0].jd_colud : null
            result[i].nj_num =  row[0].nj_num ? row[0].nj_num : null
            result[i].jd_num =  row[0].jd_num ? row[0].jd_num : null
            result[i].jd_transit =  row[0].jd_transit ? row[0].jd_transit : null
            result[i].num =  row[0].num ? row[0].num : null
            result[i].transit =  row[0].transit ? row[0].transit : null
            result[i].total_num =  row[0].total_num ? row[0].total_num : null
        }
    }
    return result
}
module.exports = goodsSalesRepo