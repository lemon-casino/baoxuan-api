const shopInfoRepo = require('../../repository/operation/shopInfoRepo')
const { getOrderByShopId } = require('../../core/jstReq/inReq')
const outOrderRepo = require('../../repository/jst/outOrderRepo')
const outSubOrderRepo = require('../../repository/jst/outSubOrderRepo')
const goodsSkuRepo = require('../../repository/jst/goodsSkuRepo')
const moment = require('moment')
const purchaseRepo = require('@/repository/jst/purchaseRepo')
const returnRepo = require('@/repository/jst/returnRepo')
const oriSkuRepo = require('@/repository/jst/oriSkuRepo')

const syncOrder = async (start, end) => {
    let shops = await shopInfoRepo.getInfo(), 
    orders = [], result
    let start_time = moment().weekday(-7).format('YYYY-MM-DD') + ' 00:00:00'
    if (start) start_time = start
    let end_time = moment().weekday(0).format('YYYY-MM-DD') + ' 00:00:00'
    if (end) end_time = end
    let order_data = [], order_count = 0, sub_order_data = [], sub_order_count = 0
    for (let i = 0; i < shops.length; i++) {
        order_data = [] 
        order_count = 0 
        sub_order_data = [] 
        sub_order_count = 0
        if (shops[i].shop_id) orders = await getOrderByShopId(shops[i].shop_id, start_time, end_time, 1)
        logger.info(`jst order sync: ${shops[i].shop_id}, count: ${orders.length}`)
        for (let j = 0; j < orders.length; j++) {
            let info = await outOrderRepo.getByIoId(orders[j].io_id);
            if (info?.length) continue
            await outOrderRepo.create([
                orders[j].co_id, 
                orders[j].shop_id, 
                orders[j].io_id, 
                orders[j].o_id, 
                orders[j].so_id, 
                orders[j].created, 
                orders[j].modified, 
                orders[j].status, 
                orders[j].order_type, 
                orders[j].invoice_title, 
                orders[j].shop_buyer_id, 
                orders[j].open_id, 
                orders[j].receiver_country, 
                orders[j].receiver_state, 
                orders[j].receiver_city, 
                orders[j].receiver_district, 
                orders[j].receiver_town, 
                orders[j].receiver_address, 
                orders[j].receiver_name, 
                orders[j].receiver_phone, 
                orders[j].receiver_mobile, 
                orders[j].buyer_message, 
                orders[j].remark, 
                orders[j].is_cod, 
                orders[j].pay_amount, 
                orders[j].l_id, 
                orders[j].io_date, 
                orders[j].lc_id, 
                orders[j].stock_enabled, 
                orders[j].drp_co_id_from, 
                orders[j].labels, 
                orders[j].paid_amount, 
                orders[j].free_amount, 
                orders[j].freight, 
                orders[j].weight, 
                orders[j].f_weight, 
                orders[j].merge_so_id, 
                orders[j].wms_co_id, 
                orders[j].business_staff, 
                orders[j].currency, 
                orders[j].pay_date, 
                orders[j].logistics_company, 
                orders[j].wave_id, 
                orders[j].seller_flag, 
                orders[j].order_staff_id, 
                orders[j].order_staff_name, 
                orders[j].node
            ], 1)
            for (let k = 0; k < orders[j]['items'].length; k++) {
                let info1 = await outSubOrderRepo.getByIoIdAndIoiId(orders[j].io_id, orders[j]['items'][k].ioi_id)
                if (info1?.length) continue
                await outSubOrderRepo.create([
                    orders[j].shop_id,
                    orders[j].io_id,
                    orders[j]['items'][k].ioi_id, 
                    orders[j]['items'][k].pic, 
                    orders[j]['items'][k].sku_id, 
                    orders[j]['items'][k].qty, 
                    orders[j]['items'][k].name, 
                    orders[j]['items'][k].properties_value, 
                    orders[j]['items'][k].sale_price, 
                    orders[j]['items'][k].oi_id, 
                    orders[j]['items'][k].sale_amount, 
                    orders[j]['items'][k].i_id, 
                    orders[j]['items'][k].unit, 
                    orders[j]['items'][k].sale_base_price, 
                    orders[j]['items'][k].combine_sku_id, 
                    orders[j]['items'][k].is_gift, 
                    orders[j]['items'][k].outer_oi_id, 
                    orders[j]['items'][k].raw_so_id, 
                    orders[j]['items'][k].batch_id, 
                    orders[j]['items'][k].product_date, 
                    orders[j]['items'][k].supplier_id, 
                    orders[j]['items'][k].expiration_date
                ], 1)
            }
        }
        // if (order_count) {
        //     result = await outOrderRepo.create(order_data, order_count)
        //     if (result?.affectedRows) logger.info(`sync jst out order shop_id: ${shops[i].shop_id} rows: ${result.affectedRows}`)
        //     result = await outSubOrderRepo.create(sub_order_data, sub_order_count)
        //     if (result?.affectedRows) logger.info(`sync jst out sub order shop_id: ${shops[i].shop_id} rows: ${result.affectedRows}`)
        // }
        orders = []
        // if (shops[i].shop_id) orders = await getOrderByShopId(shops[i].shop_id, start_time, end_time)
        // for (let j = 0; j < orders.length; j++) {
        //     result =  await outOrderRepo.updateByIdAndShopId([
        //         orders[j].modified, 
        //         orders[j].status, 
        //         orders[j].invoice_title, 
        //         orders[j].shop_buyer_id, 
        //         orders[j].open_id, 
        //         orders[j].receiver_country, 
        //         orders[j].receiver_state, 
        //         orders[j].receiver_city, 
        //         orders[j].receiver_district, 
        //         orders[j].receiver_town, 
        //         orders[j].receiver_address, 
        //         orders[j].receiver_name, 
        //         orders[j].receiver_phone, 
        //         orders[j].receiver_mobile, 
        //         orders[j].buyer_message, 
        //         orders[j].remark, 
        //         orders[j].l_id, 
        //         orders[j].io_date, 
        //         orders[j].lc_id, 
        //         orders[j].stock_enabled, 
        //         orders[j].drp_co_id_from, 
        //         orders[j].labels, 
        //         orders[j].weight, 
        //         orders[j].f_weight, 
        //         orders[j].merge_so_id, 
        //         orders[j].business_staff,
        //         orders[j].logistics_company, 
        //         orders[j].wave_id, 
        //         orders[j].seller_flag, 
        //         orders[j].order_staff_id, 
        //         orders[j].order_staff_name, 
        //         orders[j].node,
        //         orders[j].io_id, 
        //         orders[j].shop_id, 
        //     ])
        //     // if (result) logger.info(`sync jst out order: ${orders[j].io_id} ${orders[j].shop_id}`)
        //     for (let k = 0; k < orders[j]['items'].length; k++) {
        //         result =  await outSubOrderRepo.updateByIdAndShopId([
        //             orders[j]['items'][k].ioi_id,
        //             orders[j]['items'][k].pic, 
        //             orders[j]['items'][k].sku_id, 
        //             orders[j]['items'][k].qty, 
        //             orders[j]['items'][k].name, 
        //             orders[j]['items'][k].properties_value, 
        //             orders[j]['items'][k].sale_price, 
        //             orders[j]['items'][k].oi_id, 
        //             orders[j]['items'][k].sale_amount, 
        //             orders[j]['items'][k].i_id, 
        //             orders[j]['items'][k].unit, 
        //             orders[j]['items'][k].sale_base_price, 
        //             orders[j]['items'][k].combine_sku_id, 
        //             orders[j]['items'][k].is_gift, 
        //             orders[j]['items'][k].raw_so_id, 
        //             orders[j]['items'][k].batch_id, 
        //             orders[j]['items'][k].product_date, 
        //             orders[j]['items'][k].supplier_id, 
        //             orders[j]['items'][k].expiration_date,
        //             orders[j]['items'][k].outer_oi_id,
        //             orders[j].shop_id,
        //         ])
        //         // if (result) logger.info(`sync jst out sub order: ${orders[j]['items'][k].outer_oi_id}`)
        //     }
        // }
        // orders = []
    }
}

const getSaleStats = async () => {
    let start = moment().subtract(30, 'day').format('YYYY-MM-DD')
    let end = moment().format('YYYY-MM-DD')
    let data = await outOrderRepo.getSalesByTime(start, end)
    return data || []
}

const importGoodsSku = async (rows) => {
    let count = 0, data = [], result = false
    let columns = rows[0].values,
        shop_id_row = null, 
        shop_name_row = null, 
        goods_id_row = null,
        sku_id_row = null,
        on_goods_id_row = null,
        on_sku_id_row = null, 
        or_sku_id_row = null,
        on_sku_code_row = null, 
        sys_goods_id_row = null, 
        sys_sku_id_row = null, 
        on_sku_name_row = null,
        is_shelf_row = null, 
        create_time_row = null
    for (let i = 1; i <= columns.length; i++) {
        if (columns[i] == '店铺编号') {shop_id_row = i; continue}
        if (columns[i] == '店铺名称') {shop_name_row = i; continue}
        if (columns[i] == '平台店铺款式编码') {goods_id_row = i; continue}
        if (columns[i] == '平台店铺商品编码') {sku_id_row = i; continue}
        if (columns[i] == '线上款式编码') {on_goods_id_row = i; continue}
        if (columns[i] == '线上商品编码') {on_sku_id_row = i; continue}
        if (columns[i] == '原始商品编码') {or_sku_id_row = i; continue}
        if (columns[i] == '线上颜色规格') {on_sku_code_row = i; continue}
        if (columns[i] == '系统款式编码') {sys_goods_id_row = i; continue}
        if (columns[i] == '系统商品编码') {sys_sku_id_row = i; continue}
        if (columns[i] == '线上商品名称') {on_sku_name_row = i; continue}
        if (columns[i] == '是否上架') {is_shelf_row = i; continue}
        if (columns[i] == '创建时间') {create_time_row = i; continue}
    }
    for (let i = 1; i < rows.length; i++) {
        let shop_id = typeof(rows[i].getCell(shop_id_row).value) == 'string' ? 
            rows[i].getCell(shop_id_row).value.trim() : 
            rows[i].getCell(shop_id_row).value
        let shop_name = typeof(rows[i].getCell(shop_name_row).value) == 'string' ? 
            rows[i].getCell(shop_name_row).value.trim() : 
            rows[i].getCell(shop_name_row).value
        let goods_id = typeof(rows[i].getCell(goods_id_row).value) == 'string' ? 
            rows[i].getCell(goods_id_row).value.trim() : 
            rows[i].getCell(goods_id_row).value
        let sku_id = typeof(rows[i].getCell(sku_id_row).value) == 'string' ? 
            rows[i].getCell(sku_id_row).value.trim() : 
            rows[i].getCell(sku_id_row).value
        let on_goods_id = typeof(rows[i].getCell(on_goods_id_row).value) == 'string' ? 
            rows[i].getCell(on_goods_id_row).value.trim().replace(/_x([0-9A-F]{4})_/g, (m, hex) => {
            return String.fromCharCode(parseInt(hex, 16));
          }) : 
            rows[i].getCell(on_goods_id_row).value
        let on_sku_id = typeof(rows[i].getCell(on_sku_id_row).value) == 'string' ? 
            rows[i].getCell(on_sku_id_row).value.trim().replace(/_x([0-9A-F]{4})_/g, (m, hex) => {
            return String.fromCharCode(parseInt(hex, 16));
          }) : 
            rows[i].getCell(on_sku_id_row).value
        let or_sku_id = typeof(rows[i].getCell(or_sku_id_row).value) == 'string' ? 
            rows[i].getCell(or_sku_id_row).value.trim().replace(/_x([0-9A-F]{4})_/g, (m, hex) => {
            return String.fromCharCode(parseInt(hex, 16));
          }) : 
            rows[i].getCell(or_sku_id_row).value
        let on_sku_code = typeof(rows[i].getCell(on_sku_code_row).value) == 'string' ? 
            rows[i].getCell(on_sku_code_row).value.trim().replace(/_x([0-9A-F]{4})_/g, (m, hex) => {
            return String.fromCharCode(parseInt(hex, 16));
          }) : 
            rows[i].getCell(on_sku_code_row).value        
        let sys_goods_id = typeof(rows[i].getCell(sys_goods_id_row).value) == 'string' ? 
            rows[i].getCell(sys_goods_id_row).value.trim().replace(/_x([0-9A-F]{4})_/g, (m, hex) => {
            return String.fromCharCode(parseInt(hex, 16));
          }) : 
            rows[i].getCell(sys_goods_id_row).value       
        let sys_sku_id = typeof(rows[i].getCell(sys_sku_id_row).value) == 'string' ? 
            rows[i].getCell(sys_sku_id_row).value.trim().replace(/_x([0-9A-F]{4})_/g, (m, hex) => {
            return String.fromCharCode(parseInt(hex, 16));
          }) : 
            rows[i].getCell(sys_sku_id_row).value
        let on_sku_name = typeof(rows[i].getCell(on_sku_name_row).value) == 'string' ? 
            rows[i].getCell(on_sku_name_row).value.trim().replace(/_x([0-9A-F]{4})_/g, (m, hex) => {
            return String.fromCharCode(parseInt(hex, 16));
          }) : 
            rows[i].getCell(on_sku_name_row).value   
        let is_shelf = typeof(rows[i].getCell(is_shelf_row).value) == 'string' ? 
            rows[i].getCell(is_shelf_row).value.trim() : 
            rows[i].getCell(is_shelf_row).value        
        let create_time = typeof(rows[i].getCell(create_time_row).value) == 'string' ? 
            rows[i].getCell(create_time_row).value.trim() : 
            rows[i].getCell(create_time_row).value
        let goods = await goodsSkuRepo.get(goods_id, sku_id)
        if (goods?.length) {
            result = await goodsSkuRepo.update([
                on_goods_id,
                on_sku_id,
                or_sku_id,
                on_sku_code,
                sys_goods_id,
                sys_sku_id,
                is_shelf,
                create_time,
                shop_name,
                on_sku_name,
                goods_id,
                sku_id,
            ])
        } else {
            data.push(
                shop_id, 
                shop_name,
                goods_id,
                sku_id,
                on_goods_id,
                on_sku_id,
                or_sku_id,
                on_sku_code,
                sys_goods_id,
                sys_sku_id,
                on_sku_name,
                is_shelf,
                create_time
            )
            count += 1
        }
    }
    logger.info(`[店铺商品资料导入]`)
    if (count > 0) {
        result = await goodsSkuRepo.batchInsert(data, count)
    }
    return result
}

const importPurchaseInfo = async (rows) => {
    let count = 0, data = [], result = false
    let columns = rows[0].values,
        po_id_row = null, 
        io_date_row = null, 
        warehouse_row = null,
        io_id_row = null,
        sku_code_row = null,
        goods_code_row = null,
        io_qty_row = null,
        io_amount_row = null
    for (let i = 1; i <= columns.length; i++) {
        if (columns[i] == '采购单号') {po_id_row = i; continue}
        if (columns[i] == '入库日期') {io_date_row = i; continue}
        if (columns[i] == '仓库') {warehouse_row = i; continue}
        if (columns[i] == '入仓单号') {io_id_row = i; continue}
        if (columns[i] == '商品编码') {sku_code_row = i; continue}
        if (columns[i] == '款式编号') {goods_code_row = i; continue}
        if (columns[i] == '数量') {io_qty_row = i; continue}
        if (columns[i] == '金额') {io_amount_row = i; continue}
    }
    for (let i = 1; i < rows.length; i++) {
        let po_id = typeof(rows[i].getCell(po_id_row).value) == 'string' ? 
            rows[i].getCell(po_id_row).value.trim() : 
            rows[i].getCell(po_id_row).value
        let io_date = typeof(rows[i].getCell(io_date_row).value) == 'string' ? 
            rows[i].getCell(io_date_row).value.trim() : 
            rows[i].getCell(io_date_row).value
        let warehouse = typeof(rows[i].getCell(warehouse_row).value) == 'string' ? 
            rows[i].getCell(warehouse_row).value.trim() : 
            rows[i].getCell(warehouse_row).value
        let io_id = typeof(rows[i].getCell(io_id_row).value) == 'string' ? 
            rows[i].getCell(io_id_row).value.trim() : 
            rows[i].getCell(io_id_row).value
        let sku_code = typeof(rows[i].getCell(sku_code_row).value) == 'string' ? 
            rows[i].getCell(sku_code_row).value.trim().replace(/_x([0-9A-F]{4})_/g, (m, hex) => {
            return String.fromCharCode(parseInt(hex, 16));
          }) : 
            rows[i].getCell(sys_sku_id_row).value    
        let goods_code = typeof(rows[i].getCell(goods_code_row).value) == 'string' ? 
            rows[i].getCell(goods_code_row).value.trim().replace(/_x([0-9A-F]{4})_/g, (m, hex) => {
            return String.fromCharCode(parseInt(hex, 16));
            }) : 
            rows[i].getCell(goods_code_row).value
        let io_qty = rows[i].getCell(io_qty_row).value
        let io_amount = rows[i].getCell(io_amount_row).value
        let purchase = await purchaseRepo.get(po_id, io_id, sku_code)
        if (purchase?.length) {
            result = await purchaseRepo.update([
                io_date,
                warehouse,
                goods_code,
                io_qty,
                io_amount,
                po_id,
                io_id,
                sku_code
            ])
        } else {
            data.push(
                po_id,
                io_date,
                warehouse,
                io_id,
                sku_code,
                goods_code,
                io_qty,
                io_amount
            )
            count += 1
        }
    }
    logger.info(`[采购入库导入]`)
    if (count > 0) {
        result = await purchaseRepo.batchInsert(data, count)
    }
    return result
}

const importPurchaseReturn = async (rows) => {
    let count = 0, data = [], result = false
    let columns = rows[0].values,
        return_id_row = null, 
        return_date_row = null, 
        warehouse_row = null,
        supplier_row = null,
        sku_code_row = null,
        goods_code_row = null,
        qty_row = null,
        amount_row = null
    for (let i = 1; i <= columns.length; i++) {
        if (columns[i] == '退货单号') {return_id_row = i; continue}
        if (columns[i] == '退货日期') {return_date_row = i; continue}
        if (columns[i] == '仓库') {warehouse_row = i; continue}
        if (columns[i] == '供应商') {supplier_row = i; continue}
        if (columns[i] == '商品编码') {sku_code_row = i; continue}
        if (columns[i] == '款式编号') {goods_code_row = i; continue}
        if (columns[i] == '退货数量') {qty_row = i; continue}
        if (columns[i] == '金额') {amount_row = i; continue}
    }
    for (let i = 1; i < rows.length; i++) {
        let return_id = typeof(rows[i].getCell(return_id_row).value) == 'string' ? 
            rows[i].getCell(return_id_row).value.trim() : 
            rows[i].getCell(return_id_row).value

        let return_date = typeof(rows[i].getCell(return_date_row).value) == 'string' ? 
            rows[i].getCell(return_date_row).value.trim() : 
            rows[i].getCell(return_date_row).value
        let warehouse = typeof(rows[i].getCell(warehouse_row).value) == 'string' ? 
            rows[i].getCell(warehouse_row).value.trim() : 
            rows[i].getCell(warehouse_row).value
        let supplier = typeof(rows[i].getCell(supplier_row).value) == 'string' ? 
            rows[i].getCell(supplier_row).value.trim() : 
            rows[i].getCell(supplier_row).value
        let sku_code = typeof(rows[i].getCell(sku_code_row).value) == 'string' ? 
            rows[i].getCell(sku_code_row).value.trim() : 
            rows[i].getCell(sku_code_row).value
        let goods_code = typeof(rows[i].getCell(goods_code_row).value) == 'string' ? 
            rows[i].getCell(goods_code_row).value.trim() : 
            rows[i].getCell(goods_code_row).value
        let qty = rows[i].getCell(qty_row).value
        let amount = rows[i].getCell(amount_row).value
        let purchase = await returnRepo.get(return_id, sku_code)
        if (purchase?.length) {
            result = await returnRepo.update([
                return_date,
                warehouse,
                supplier,
                qty,
                amount,
                goods_code,
                return_id,
                sku_code
            ])
        } else {
            data.push(
                return_id,
                return_date,
                warehouse,
                supplier,
                sku_code,
                goods_code,
                qty,
                amount
            )
            count += 1
        }
    }
    logger.info(`[采购退货导入]`)
    if (count > 0) {
        result = await returnRepo.batchInsert(data, count)
    }
    return result
}

const importOriSkuInfo = async (rows) => {
    let count = 0, data = [], result = false
    let columns = rows[0].values,
        goods_code_row = null, 
        sku_code_row = null, 
        spu_short_name_row = null
    for (let i = 1; i <= columns.length; i++) {
        if (columns[i] == '款式编码') {goods_code_row = i; continue}
        if (columns[i] == '商品编码') {sku_code_row = i; continue}
        if (columns[i] == 'spu简称') {spu_short_name_row = i; continue}
    }
    for (let i = 1; i < rows.length; i++) {
        let goods_code = typeof(rows[i].getCell(goods_code_row).value) == 'string' ? 
            rows[i].getCell(goods_code_row).value.trim() : 
            rows[i].getCell(goods_code_row).value
        let sku_code = typeof(rows[i].getCell(sku_code_row).value) == 'string' ? 
            rows[i].getCell(sku_code_row).value.trim() : 
            rows[i].getCell(sku_code_row).value
        let spu_short_name = typeof(rows[i].getCell(spu_short_name_row).value) == 'string' ? 
            rows[i].getCell(spu_short_name_row).value.trim() : 
            rows[i].getCell(spu_short_name_row).value
        let goods = await oriSkuRepo.get(goods_code, sku_code)
        if (goods?.length) {
            result = await oriSkuRepo.update([
                spu_short_name,
                goods_code,
                sku_code
            ])
        } else {
            data.push(
                goods_code, 
                sku_code,
                spu_short_name
            )
            count += 1
        }
    }
    logger.info(`[普通商品资料导入]`)
    if (count > 0) {
        result = await oriSkuRepo.batchInsert(data, count)
    }
    return result
}

module.exports = {
    syncOrder,
    getSaleStats,
    importGoodsSku,
    importPurchaseInfo,
    importOriSkuInfo,
    importPurchaseReturn
}