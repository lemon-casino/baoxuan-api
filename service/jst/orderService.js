const shopInfoRepo = require('../../repository/operation/shopInfoRepo')
const { getOrderByShopId } = require('../../core/jstReq/inReq')
const outOrderRepo = require('../../repository/jst/outOrderRepo')
const outSubOrderRepo = require('../../repository/jst/outSubOrderRepo')
const moment = require('moment')

const syncOrder = async (start, end) => {
    let shops = await shopInfoRepo.getInfo(), orders = [], result
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
        for (let j = 0; j < orders.length; j++) {
            order_count += 1
            order_data.push(
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
            )
            for (let k = 0; k < orders[j]['items'].length; k++) {
                sub_order_count += 1
                sub_order_data.push(
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
                )
            }
        }
        if (order_count) {
            result = await outOrderRepo.create(order_data, order_count)
            if (result?.affectedRows) logger.info(`sync jst out order shop_id: ${shops[i].shop_id} rows: ${result.affectedRows}`)
            result = await outSubOrderRepo.create(sub_order_data, sub_order_count)
            if (result?.affectedRows) logger.info(`sync jst out sub order shop_id: ${shops[i].shop_id} rows: ${result.affectedRows}`)
        }
        orders = []
        if (shops[i].shop_id) orders = await getOrderByShopId(shops[i].shop_id, start_time, end_time)
        for (let j = 0; j < orders.length; j++) {
            result =  await outOrderRepo.updateByIdAndShopId([
                orders[j].modified, 
                orders[j].status, 
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
                orders[j].l_id, 
                orders[j].io_date, 
                orders[j].lc_id, 
                orders[j].stock_enabled, 
                orders[j].drp_co_id_from, 
                orders[j].labels, 
                orders[j].weight, 
                orders[j].f_weight, 
                orders[j].merge_so_id, 
                orders[j].business_staff,
                orders[j].logistics_company, 
                orders[j].wave_id, 
                orders[j].seller_flag, 
                orders[j].order_staff_id, 
                orders[j].order_staff_name, 
                orders[j].node,
                orders[j].io_id, 
                orders[j].shop_id, 
            ])
            // if (result) logger.info(`sync jst out order: ${orders[j].io_id} ${orders[j].shop_id}`)
            for (let k = 0; k < orders[j]['items'].length; k++) {
                result =  await outSubOrderRepo.updateByIdAndShopId([
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
                    orders[j]['items'][k].raw_so_id, 
                    orders[j]['items'][k].batch_id, 
                    orders[j]['items'][k].product_date, 
                    orders[j]['items'][k].supplier_id, 
                    orders[j]['items'][k].expiration_date,
                    orders[j]['items'][k].outer_oi_id,
                    orders[j].shop_id,
                ])
                // if (result) logger.info(`sync jst out sub order: ${orders[j]['items'][k].outer_oi_id}`)
            }
        }
        orders = []
    }
}

const getSaleStats = async () => {
    let start = moment().subtract(30, 'day').format('YYYY-MM-DD')
    let end = moment().format('YYYY-MM-DD')
    let data = await outOrderRepo.getSalesByTime(start, end)
    return data || []
}

module.exports = {
    syncOrder,
    getSaleStats
}