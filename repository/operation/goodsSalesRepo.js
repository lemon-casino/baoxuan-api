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

goodsSalesRepo.updatemonth6 = async (day,type,column) =>{
    let result1
    let sql = `select sku_code,SUM(sale_qty) as sale_qty  from (
            SELECT sku_code,SUM(sale_qty) as sale_qty  
            FROM goods_sale_info 
            WHERE date >= DATE_SUB(DATE(NOW()),INTERVAL ${day} ${type}) 
            AND shop_name not in ('京东自营-厨具' ,'京东自营-日用')
            GROUP BY sku_code  
            UNION ALL
            select a.商品编码 as sku_code ,SUM(a.数量) as sale_qty  from (
            select IFNULL(c.商品编码,a.编码) as '商品编码'
                ,IF(c.数量 is not NULL,a.数量*c.数量,a.数量) as '数量' 
            from (
                select 编码 ,成交商品件数 as '数量',时间 from danpin.jb_ziying 
                where 时间  >= DATE_SUB(DATE(NOW()),INTERVAL ${day} ${type})
                UNION ALL
                select 编码 ,成交商品件数 as '数量',时间 from danpin.jb_ziying_everday
                where 时间  >= DATE_SUB(DATE(NOW()),INTERVAL ${day} ${type})
            ) as a
            LEFT JOIN
            (select 组合商品编码,商品编码,数量,(数量*子商品成本价)/组合成本价 as '占比' from danpin.combination_product_code) as c
            on a.编码 = c.组合商品编码
            )as a
            where a.商品编码 is not null  and 数量 is not null
            GROUP BY a.商品编码
        )as a GROUP BY sku_code`
    const result = await query(sql)
    for (i=0;i<=result.length -1;i++){
        sql = `UPDATE inventory_attributes 
        SET ${column} = ${result[i].sale_qty},update_time = CURRENT_TIMESTAMP 
        where upper(sku_code) = upper('${result[i].sku_code}')`
        result1 = await query(sql)
    }
    return result1
}


goodsSalesRepo.updateNJsaleqty = async (day,column) =>{
    let result1
    let sql = `SELECT sku_code,SUM(sale_qty) as sale_qty  
        FROM goods_sale_info 
        WHERE date >= DATE_SUB(DATE(NOW()),INTERVAL ? DAY) 
        AND shop_name not in ('京东自营-厨具' ,'京东自营-日用')
        GROUP BY sku_code`
    const result = await query(sql,[day])
    for (i=0;i<=result.length -1;i++){
        sql = `UPDATE inventory_attributes 
        SET ${column} = ${result[i].sale_qty},update_time = CURRENT_TIMESTAMP
        where upper(sku_code) = upper('${result[i].sku_code}')`
        result1 = await query(sql)
    }
    return result
}

goodsSalesRepo.updateJDsaleqty = async (day,column) =>{
    let result1
    let sql = `select a.商品编码 as sku_code ,SUM(a.数量) as sale_qty  from (
        select IFNULL(c.商品编码,a.编码) as '商品编码'
                ,IF(c.数量 is not NULL,a.数量*c.数量,a.数量) as '数量' 
        from (
                select 编码 ,成交商品件数 as '数量',时间 from danpin.jb_ziying 
                where 时间  >= DATE_SUB(DATE(NOW()),INTERVAL ? DAY)
                UNION ALL
                select 编码 ,成交商品件数 as '数量',时间 from danpin.jb_ziying_everday
                where 时间  >= DATE_SUB(DATE(NOW()),INTERVAL ? DAY)
        ) as a
        LEFT JOIN
        (select 组合商品编码,商品编码,数量,(数量*子商品成本价)/组合成本价 as '占比' from danpin.combination_product_code) as c
        on a.编码 = c.组合商品编码
        )as a
        where a.商品编码 is not null  and 数量 is not null
        GROUP BY a.商品编码`
    const result = await query(sql,[day,day])
    for (i=0;i<=result.length -1;i++){
        sql = `UPDATE inventory_attributes 
        SET ${column} = ${result[i].sale_qty},update_time = CURRENT_TIMESTAMP 
        where upper(sku_code) = upper('${result[i].sku_code}')`
        result1 = await query(sql)
    }
    return result1
}

goodsSalesRepo.updateinventory = async(day,num,total_num) =>{
    let result1
    let sql = `select 商品编码,SUM(在仓库存) as '在仓库存',SUM(总库存) as '总库存' from (
        SELECT a.商品编码
            ,IFNULL(a.主仓实际库存数,0) - IFNULL(a.订单占有数,0)- IFNULL(a.进货仓库存,0) - IFNULL(c.南京仓京东自备,0) 
            - IFNULL(c.\`COUPANG/猫超南京仓\`,0)  as '在仓库存'
            ,IFNULL(a.主仓实际库存数,0) - IFNULL(a.订单占有数,0)- IFNULL(a.进货仓库存,0) - IFNULL(c.南京仓京东自备,0) 
            - IFNULL(c.\`COUPANG/猫超南京仓\`,0) + IFNULL(a.采购在途数,0) as '总库存'
        FROM (
        select 商品编码
            ,SUM(主仓实际库存数) as '主仓实际库存数'
            ,SUM(公有可用数) as '公有可用数'
            ,sum(采购在途数) as '采购在途数'
            ,sum(调拨在途数)as '调拨在途数'
            ,SUM(订单占有数) as '订单占有数'
            ,SUM(进货仓库存) as '进货仓库存'
        from danpin.goods_kucun 
        where 统计日期 =  DATE_SUB(DATE(NOW()),INTERVAL ? DAY) and 仓储方='北京超速树懒科技有限公司'
        GROUP BY 商品编码
        )as a
        LEFT JOIN(
        select 商品编码
            ,sum(IF(运营云仓名称='南京仓京东自备',运营云仓可用数,0)) as '南京仓京东自备'
            ,sum(IF(运营云仓名称='事业三部（天猫/小红书/TEOTM)',运营云仓可用数,0)) as '事业三部'
            ,sum(IF(运营云仓名称='事业一部（PDD/淘工厂/猫超/COUPANG）',运营云仓可用数,0)) AS '事业一部'
            ,sum(IF(运营云仓名称='事业二部（京东/抖音/唯品会/得物/1688）',运营云仓可用数,0)) AS '事业二部'
            ,sum(IF(运营云仓名称='COUPANG/猫超南京仓',运营云仓可用数,0)) AS 'COUPANG/猫超南京仓'
        FROM danpin.goods_kucun_fen WHERE 统计日期 =  DATE_SUB(DATE(NOW()),INTERVAL ? DAY)
        GROUP BY 商品编码
        ) as c
        on a.商品编码=c.商品编码
        union ALL
        select a.商品编码
            ,sum(京东仓库存) as '在仓库存'
            ,sum(京东仓库存) + sum(京东在途库存) as '总库存' 
        from(
            select IFNULL(c.商品编码,a.商品编码) as '商品编码'
                ,IFNULL(IF(c.数量 is NULL,a.京东仓库存,a.京东仓库存*c.数量),0) as '京东仓库存'
                ,IFNULL(IF(c.数量 is NULL,a.京东在途库存,a.京东在途库存*c.数量),0) as '京东在途库存' from (
                select b.code as '商品编码',a.* FROM(
                    select SKU
                        ,全国现货库存 as '京东仓库存'
                        ,全国采购在途数量 as '京东在途库存' 
                    from danpin.inventory_jdzz 
                    where 时间 =  DATE_SUB(DATE(NOW()),INTERVAL ? DAY)
                    ) as a
                LEFT JOIN bi_serve.dianshang_operation_attribute as b
                on a.SKU=b.sku_id
            ) as a
            LEFT JOIN danpin.combination_product_code as c
            on a.商品编码 = c.组合商品编码
            WHERE a.商品编码 is not null
        ) as a
        where a.商品编码 is not null
        GROUP BY a.商品编码
        ) as a GROUP BY 商品编码`
    const result = await query(sql,[day,day,day])
    for (i=0;i<=result.length -1;i++){
        sql = `UPDATE inventory_attributes 
        SET ${num} = ${result[i].在仓库存} , 
        ${total_num}= ${result[i].在仓库存} ,update_time = CURRENT_TIMESTAMP
        where upper(sku_code) = upper('${result[i].商品编码}')`
        result1 = await query(sql)
    }
    return result1
}

goodsSalesRepo.updateinventory1 = async()=>{
    let result1
    let sql = `select a.商品编码
			,sum(京东仓库存) as '在仓库存'
			,sum(京东仓库存) + sum(京东在途库存) as '总库存'
			,sum(京东在途库存) as '在途库存'
        from(
        select IFNULL(c.商品编码,a.商品编码) as '商品编码'
                ,IFNULL(IF(c.数量 is NULL,a.京东仓库存,a.京东仓库存*c.数量),0) as '京东仓库存'
                ,IFNULL(IF(c.数量 is NULL,a.京东在途库存,a.京东在途库存*c.数量),0) as '京东在途库存' from (
                select b.code as '商品编码',a.* FROM(
                        select SKU
                                ,全国现货库存 as '京东仓库存'
                                ,全国采购在途数量 as '京东在途库存' 
                        from danpin.inventory_jdzz 
                        where 时间 =  DATE_SUB(DATE(NOW()),INTERVAL 1 DAY)
                        ) as a
                        LEFT JOIN bi_serve.dianshang_operation_attribute as b
                        on a.SKU=b.sku_id
                ) as a
                LEFT JOIN danpin.combination_product_code as c
                on a.商品编码 = c.组合商品编码
                WHERE a.商品编码 is not null
        ) as a
        where a.商品编码 is not null
        GROUP BY a.商品编码`
    const result = await query(sql)
    for (i=0;i<=result.length -1;i++){
        sql = `UPDATE inventory_attributes 
        SET jd_num = ${result[i].在仓库存},jd_transit = ${result[i].在途库存},update_time = CURRENT_TIMESTAMP
        where upper(sku_code) = upper('${result[i].商品编码}')`
        result1 = await query(sql)
    }
    return result1
}

goodsSalesRepo.updateinventory2 = async()=>{
    let result1
    let sql = ` SELECT a.商品编码
            ,IFNULL(a.主仓实际库存数,0) - IFNULL(a.订单占有数,0)- IFNULL(a.进货仓库存,0)- IFNULL(c.\`COUPANG/猫超南京仓\`,0)  as '在仓库存'
            , IFNULL(a.采购在途数,0) as '采购在途'
            ,IFNULL(c.南京仓京东自备,0) as '京东云仓'
        FROM (
        select 商品编码
            ,SUM(主仓实际库存数) as '主仓实际库存数'
            ,SUM(公有可用数) as '公有可用数'
            ,sum(采购在途数) as '采购在途数'
            ,sum(调拨在途数)as '调拨在途数'
            ,SUM(订单占有数) as '订单占有数'
            ,SUM(进货仓库存) as '进货仓库存'
        from danpin.goods_kucun 
        where 统计日期 =  DATE_SUB(DATE(NOW()),INTERVAL 1 DAY) and 仓储方='北京超速树懒科技有限公司'
        GROUP BY 商品编码
        )as a
        LEFT JOIN(
        select 商品编码
            ,sum(IF(运营云仓名称='南京仓京东自备',运营云仓可用数,0)) as '南京仓京东自备'
            ,sum(IF(运营云仓名称='事业三部（天猫/小红书/TEOTM)',运营云仓可用数,0)) as '事业三部'
            ,sum(IF(运营云仓名称='事业一部（PDD/淘工厂/猫超/COUPANG）',运营云仓可用数,0)) AS '事业一部'
            ,sum(IF(运营云仓名称='事业二部（京东/抖音/唯品会/得物/1688）',运营云仓可用数,0)) AS '事业二部'
            ,sum(IF(运营云仓名称='COUPANG/猫超南京仓',运营云仓可用数,0)) AS 'COUPANG/猫超南京仓'
        FROM danpin.goods_kucun_fen WHERE 统计日期 =  DATE_SUB(DATE(NOW()),INTERVAL 1 DAY)
        GROUP BY 商品编码
        ) as c
        on a.商品编码=c.商品编码`
    const result = await query(sql)
    for (i=0;i<=result.length -1 ;i++){
        sql = `UPDATE inventory_attributes 
        SET nj_transit = ${result[i].采购在途},nj_num = ${result[i].在仓库存},jd_colud = ${result[i].在仓库存}, update_time = CURRENT_TIMESTAMP
        where upper(sku_code) = upper('${result[i].商品编码}')`
        result1 = await query(sql)
    }
    return result1
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
    const sql1 =`UPDATE inventory_attributes SET sale_days = IF(day30_sale_qty!=0,ROUND(num/(day30_sale_qty/30),0),0),update_time = CURRENT_TIMESTAMP WHERE day30_sale_qty != 0`
    const result1 = await query(sql1)
    const sql2 = `UPDATE inventory_attributes set tags = (CASE 
                WHEN day30_sale_qty <=0 THEN '30天内零动销'
                WHEN sale_days > 90 THEN '支撑大于90天'
                WHEN sale_days >= 60 and sale_days <=90 THEN '支撑60-90天'
                WHEN sale_days >= 30 and sale_days <60 THEN '支撑30-60天'
                WHEN sale_days >= 15 and sale_days <30 THEN '支撑15-30天'
                ELSE '支撑小于15天' END ),update_time = CURRENT_TIMESTAMP`
    const result2 = await query(sql2)
    const sql3 = `UPDATE inventory_attributes a LEFT join (
            select sku_code,SUM(qty) as qty 
            from jst_purchase_return 
            WHERE DATE_FORMAT(return_date,'%Y-%m-%d') BETWEEN DATE_SUB(DATE(NOW()),INTERVAL 30 day) and DATE_SUB(DATE(NOW()),INTERVAL 1 day) 
            GROUP BY sku_code) as b
            on a.sku_code = b.sku_code 
            set a.fund_num = IF(b.qty is not null,b.qty,0),a.update_time = CURRENT_TIMESTAMP`
    const result3 = await query(sql3)
    const sql4 = `UPDATE inventory_attributes a LEFT join danpin.goods_info as b
            on a.sku_code = b.商品编码 
            set a.ps = b.备注标签,a.first_category = b.一级类目,
            a.second_category = b.二级类目,a.third_category = b.三级类目,
            a.spu_name=b.spu简称,a.update_time = CURRENT_TIMESTAMP`
    const result4 = await query(sql4)
    const sql5 = `UPDATE inventory_attributes as a LEFT JOIN(
                select sku_code,min(onsale_date) as onsale_date from (
                select IFNULL(b.商品编码,a.code) as sku_code,min(onsale_date) as onsale_date  from dianshang_operation_attribute AS a
                LEFT JOIN danpin.combination_product_code as b
                ON upper(a.code)=upper(b.组合商品编码) 	GROUP BY sku_code
                UNION ALL 
                select sys_sku_id,min(create_time) from jst_goods_sku GROUP BY sys_sku_id
                ) as a GROUP BY sku_code) as b
                on upper(a.sku_code) = upper(b.sku_code)
                SET a.create_time = b.onsale_date 
                WHERE a.create_time is null`
    const result5 = await query(sql5)
    return result3
}

goodsSalesRepo.getsputags = async(type) =>{
    let subsql = ''
    if (type == 1){
        subsql = `WHERE shipping_attributes is null`
    }
    let sql = `SELECT attribute
			,COUNT(spu_name) as spu_num
			,ROUND(SUM(cost)/10000,1) as cost
			,ROUND(SUM(cost)/max(total_cost)*100,2) as cost_proportion
			,ROUND(SUM(num)/(SUM(day7_sale_qty)/7),0) as stock_sale7
            ,ROUND(SUM(num)/(SUM(day30_sale_qty)/30),0) as stock_sale30
			,ROUND(SUM(day30_sale_qty)/(SUM(num30)+SUM(io_qty)-IFNULL(SUM(fund_num),0))*100,2) as sell_through_rate
			,ROUND(SUM(day30_cost)/((sum(cost30)+sum(cost))*2)*100,2) as inventory_turnover
        FROM(
                SELECT spu_name,(CASE
                WHEN (sale_days >90 and month6_sale_qty<=10) OR day30_sale_qty <= 10 THEN '零动销'
                WHEN (sale_days >90 and month6_sale_qty>10) OR ps like '%滞销%' OR ps like '%销完下架%' THEN '滞销'
                WHEN sale_days >60 and sale_days <= 90 THEN '低周转'
                WHEN sale_days >30 and sale_days <= 60  THEN '正常周转'
                WHEN sale_days <=30 THEN '高周转'
                END) as attribute,a.cost,b.total_cost,a.sale_days,a.month6_sale_qty,a.day7_sale_qty,a.day30_sale_qty,a.num,a.num30,a.io_qty,a.fund_num,a.cost30,a.day30_cost
                FROM (
                    SELECT spu_name
                        ,IF(SUM(day30_sale_qty)!=0,ROUND(SUM(num)/(SUM(day30_sale_qty)/30),0),0) as sale_days
                        ,SUM(month6_sale_qty) as month6_sale_qty
                        ,SUM(num) as num
                        ,SUM(day7_sale_qty) as day7_sale_qty
                        ,SUM(day30_sale_qty) as day30_sale_qty
                        ,SUM(day30_sale_qty*cost_price) as day30_cost
                        ,SUM(cost_price*num) as cost 
                        ,SUM(num30) as num30
                        ,SUM(cost_price*num30) as cost30
                        ,SUM(fund_num) as fund_num
                        ,SUM(io_qty) as io_qty
                        ,MAX(ps) as ps
                    from inventory_attributes ${subsql}
                    GROUP BY spu_name 
                ) as a
                LEFT JOIN (SELECT SUM(cost_price*num) as total_cost from inventory_attributes ) as b 
                on 1=1
        ) as a 
        GROUP BY attribute`
    const result = await query(sql)
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
    let sql = `SELECT a.link
			,a.商品编码 AS sku_code
			,a.first_order_num
			,a.second_order_num
			,a.third_order_num
			,b.io_date
			,c.first_onsale_date
			,c.second_onsale_date
			,c.third_onsale_date
        FROM (
            SELECT CONCAT('http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=',process_id) AS link
                        ,商品编码
                        ,IF(first_order_num REGEXP '^[0-9]+$',first_order_num,0) AS first_order_num
                        ,IF(second_order_num REGEXP '^[0-9]+$',second_order_num,0) AS second_order_num
                        ,IF(third_order_num REGEXP '^[0-9]+$',third_order_num,0) AS third_order_num
            FROM (
                SELECT 
                        t.process_id,
                        JSON_UNQUOTE(JSON_EXTRACT(t.content, CONCAT('$[', n.seq, ']."商品编码"'))) AS 商品编码,
                        COALESCE(JSON_UNQUOTE(JSON_EXTRACT(t.content, CONCAT('$[', n.seq, ']."事业部二订货量"'))), '0')  AS first_order_num,
                        COALESCE(JSON_UNQUOTE(JSON_EXTRACT(t.content, CONCAT('$[', n.seq, ']."事业部二订货量(Frhbma3pulstg5c)"')))) AS second_order_num,
                        COALESCE(JSON_UNQUOTE(JSON_EXTRACT(t.content, CONCAT('$[', n.seq, ']."事业部三订货量"'))), '0') AS third_order_num
                FROM process_info t
                JOIN (
                        SELECT 0 AS seq UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
                ) n ON n.seq < JSON_LENGTH(t.content)
                WHERE t.field IN ('Fnt5ma3psjitfcc','Fyf1ma3jfyi7fuc','Fnt5ma3psjitfcc','Fo5uma263lluhdc','Fz3jma3psq0dfhc') 
                AND t.content IS NOT NULL AND t.process_id IN('030e1938-50ba-11f0-a2a8-2ee6f9618836','07e0ba63-50bb-11f0-a2a8-2ee6f9618836',
                '10468942-5d6a-11f0-ac83-36752c98d096','85ae191c-4dc9-11f0-bdcb-425a51682946','f5b90e4f-5d5e-11f0-ac83-36752c98d096')
                UNION ALL
                SELECT 
                        t.process_id,
                        JSON_UNQUOTE(JSON_EXTRACT(t.content, CONCAT('$[', n.seq, ']."商品编码"'))) AS 商品编码,
                        COALESCE(JSON_UNQUOTE(JSON_EXTRACT(t.content, CONCAT('$[', n.seq, ']."事业部一订货量"'))), '0')  AS first_order_num,
                        COALESCE(JSON_UNQUOTE(JSON_EXTRACT(t.content, CONCAT('$[', n.seq, ']."事业部二订货量"'))), '0') AS second_order_num,
                        COALESCE(JSON_UNQUOTE(JSON_EXTRACT(t.content, CONCAT('$[', n.seq, ']."事业部三订货量"'))), '0') AS third_order_num
                FROM process_info t
                JOIN (
                        SELECT 0 AS seq UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
                ) n ON n.seq < JSON_LENGTH(t.content)
                WHERE t.field IN ('Fnt5ma3psjitfcc','Fyf1ma3jfyi7fuc','Fnt5ma3psjitfcc','Fo5uma263lluhdc','Fz3jma3psq0dfhc') 
                AND t.content IS NOT NULL AND t.process_id IN (SELECT process_id FROM processes WHERE title LIKE '%推品%' 
                AND process_id NOT IN('030e1938-50ba-11f0-a2a8-2ee6f9618836','07e0ba63-50bb-11f0-a2a8-2ee6f9618836',
                '10468942-5d6a-11f0-ac83-36752c98d096','85ae191c-4dc9-11f0-bdcb-425a51682946','f5b90e4f-5d5e-11f0-ac83-36752c98d096'))
            ) AS a 
            WHERE first_order_num !=0 OR second_order_num !=0 OR third_order_num !=0
        ) AS a 
        LEFT JOIN (select sku_code,min(io_date) as io_date FROM jst_purchase_info GROUP BY sku_code) as b
        ON a.商品编码 = b.sku_code
        LEFT JOIN(
            SELECT sys_sku_id
                        ,max(IF(division_name='事业部1',onsale_date,NULL)) AS first_onsale_date
                        ,max(IF(division_name='事业部2',onsale_date,NULL)) AS second_onsale_date
                        ,max(IF(division_name='事业部3',onsale_date,NULL)) AS third_onsale_date
            FROM(
                SELECT b.division_name,a.sys_sku_id,min(a.create_time) AS onsale_date FROM(
                    SELECT IFNULL(pc.商品编码, s.sys_sku_id) AS sys_sku_id
                                    ,s.shop_name
                                    ,create_time
                    FROM jst_goods_sku s 
                    LEFT JOIN danpin.combination_product_code pc 
                    ON pc.组合商品编码 = s.sys_sku_id
                    ) AS a
                LEFT JOIN (
                    SELECT s.shop_name
                            ,d.division_name
                FROM shop_info AS s 
                LEFT JOIN project_info AS p 
                ON s.project_id=p.id
                LEFT JOIN division_info AS d 
                ON p.division_id=d.id
                ) AS b
                ON a.shop_name=b.shop_name
                GROUP BY b.division_name,a.sys_sku_id
            ) AS a 
            GROUP BY sys_sku_id
        ) AS c
        ON a.商品编码 = c.sys_sku_id
        WHERE b.sku_code IS NOT NULL AND (c.sys_sku_id IS NULL OR c.first_onsale_date IS NULL 
        OR c.second_onsale_date IS NULL OR c.third_onsale_date IS NULL )`
    let result = await query(sql)
    for (i =0;i<result.length-1;i++){
        let sql1 = `SELECT sku_code
			,spu_name
			,first_category
			,second_category
			,third_category
			,image
			,ps
			,create_time
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