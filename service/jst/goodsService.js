const skuRepo = require('../../repository/jst/skuRepo')
const goodsRepo = require('../../repository/jst/goodsRepo')
const { getGoodsByTime } = require('../../core/jstReq/goodsReq')
const moment = require('moment')

const syncGoods = async () => {
    let start_time = await goodsRepo.getMaxCreateTime()
    start_time = moment(start_time[0].created).format('YYYY-MM-DD HH:mm:ss')
    let end_time = moment(start_time).subtract(-7, 'day').format('YYYY-MM-DD HH:mm:ss')
    let goods = await getGoodsByTime(start_time, end_time, 1)
    let goods_data = [], goods_count = 0, sku_data = [], sku_count = 0
    for (let i = 0; i < goods.length; i++) {
        let goodsInfo = await goodsRepo.getByIId(goods[i].i_id)
        if (goodsInfo?.length) {
            await goodsRepo.updateById([
                goods[i].name,
                goods[i].c_id,
                goods[i].c_name,
                goods[i].s_price,
                goods[i].c_price,
                goods[i].remark,
                goods[i].pic,
                goods[i].modified,
                goods[i].brand,
                goods[i].weight,
                goods[i].market_price,
                goods[i].vc_name,
                goods[i].item_type,
                goods[i].l,
                goods[i].w,
                goods[i].h,
                goods[i].shelf_life,
                goods[i].i_id
            ])
            logger.info(`sync jst goods: ${goods[i].i_id}`)
        } else {
            goods_count += 1
            goods_data.push(
                goods[i].i_id,
                goods[i].co_id,
                goods[i].name,
                goods[i].c_id,
                goods[i].c_name,
                goods[i].s_price,
                goods[i].c_price,
                goods[i].remark,
                goods[i].pic,
                goods[i].created,
                goods[i].modified,
                goods[i].brand,
                goods[i].weight,
                goods[i].market_price,
                goods[i].vc_name,
                goods[i].item_type,
                goods[i].l,
                goods[i].w,
                goods[i].h,
                goods[i].shelf_life,
            )
        }
        for (let j = 0; j < goods[i]['skus'].length; j++) {
            let skuInfo = await skuRepo.getByIId(goods[i]['skus'][j].sku_id)
            if (skuInfo?.length) {
                await skuRepo.updateById([
                    goods[i]['skus'][j].name, 
                    goods[i]['skus'][j].c_id, 
                    goods[i]['skus'][j].brand, 
                    goods[i]['skus'][j].market_price, 
                    goods[i]['skus'][j].sale_price, 
                    goods[i]['skus'][j].cost_price, 
                    goods[i]['skus'][j].enabled, 
                    goods[i]['skus'][j].category,
                    goods[i]['skus'][j].creator, 
                    goods[i]['skus'][j].modifier, 
                    goods[i]['skus'][j].creator_name, 
                    goods[i]['skus'][j].modifier_name, 
                    goods[i]['skus'][j].properties_value, 
                    goods[i]['skus'][j].sku_code, 
                    goods[i]['skus'][j].purchase_price, 
                    goods[i]['skus'][j].pic, 
                    goods[i]['skus'][j].pic_big, 
                    goods[i]['skus'][j].weight, 
                    goods[i]['skus'][j].short_name, 
                    goods[i]['skus'][j].item_type, 
                    goods[i]['skus'][j].supplier_id, 
                    goods[i]['skus'][j].supplier_name, 
                    goods[i]['skus'][j].supplier_sku_id, 
                    goods[i]['skus'][j].supplier_i_id, 
                    goods[i]['skus'][j].remark, 
                    goods[i]['skus'][j].vc_name, 
                    goods[i]['skus'][j].l, 
                    goods[i]['skus'][j].w, 
                    goods[i]['skus'][j].h, 
                    goods[i]['skus'][j].other_price_1, 
                    goods[i]['skus'][j].other_price_2, 
                    goods[i]['skus'][j].other_price_3, 
                    goods[i]['skus'][j].other_price_4, 
                    goods[i]['skus'][j].other_price_5, 
                    goods[i]['skus'][j].labels, 
                    goods[i]['skus'][j].other_1, 
                    goods[i]['skus'][j].other_2, 
                    goods[i]['skus'][j].other_3, 
                    goods[i]['skus'][j].other_4, 
                    goods[i]['skus'][j].other_5, 
                    goods[i]['skus'][j].unit, 
                    goods[i]['skus'][j].shelf_life, 
                    goods[i]['skus'][j].productionbatch_format, 
                    goods[i]['skus'][j].production_licence, 
                    goods[i]['skus'][j].drp_co_id_to,
                    goods[i]['skus'][j].sku_id
                ])
                logger.info(`sync jst sku: ${goods[i]['skus'][j].sku_id}`)
            } else {
                sku_count += 1
                sku_data.push(
                    goods[i]['skus'][j].co_id, 
                    goods[i]['skus'][j].sku_id, 
                    goods[i]['skus'][j].i_id, 
                    goods[i]['skus'][j].name, 
                    goods[i]['skus'][j].c_id, 
                    goods[i]['skus'][j].brand, 
                    goods[i]['skus'][j].market_price, 
                    goods[i]['skus'][j].sale_price, 
                    goods[i]['skus'][j].cost_price, 
                    goods[i]['skus'][j].enabled, 
                    goods[i]['skus'][j].category, 
                    goods[i]['skus'][j].creator, 
                    goods[i]['skus'][j].modifier, 
                    goods[i]['skus'][j].creator_name, 
                    goods[i]['skus'][j].modifier_name, 
                    goods[i]['skus'][j].properties_value, 
                    goods[i]['skus'][j].sku_code, 
                    goods[i]['skus'][j].purchase_price, 
                    goods[i]['skus'][j].pic, 
                    goods[i]['skus'][j].pic_big, 
                    goods[i]['skus'][j].weight, 
                    goods[i]['skus'][j].short_name, 
                    goods[i]['skus'][j].item_type, 
                    goods[i]['skus'][j].supplier_id, 
                    goods[i]['skus'][j].supplier_name, 
                    goods[i]['skus'][j].supplier_sku_id, 
                    goods[i]['skus'][j].supplier_i_id, 
                    goods[i]['skus'][j].remark, 
                    goods[i]['skus'][j].vc_name, 
                    goods[i]['skus'][j].l, 
                    goods[i]['skus'][j].w, 
                    goods[i]['skus'][j].h, 
                    goods[i]['skus'][j].other_price_1, 
                    goods[i]['skus'][j].other_price_2, 
                    goods[i]['skus'][j].other_price_3, 
                    goods[i]['skus'][j].other_price_4, 
                    goods[i]['skus'][j].other_price_5, 
                    goods[i]['skus'][j].labels, 
                    goods[i]['skus'][j].other_1, 
                    goods[i]['skus'][j].other_2, 
                    goods[i]['skus'][j].other_3, 
                    goods[i]['skus'][j].other_4, 
                    goods[i]['skus'][j].other_5, 
                    goods[i]['skus'][j].unit, 
                    goods[i]['skus'][j].shelf_life, 
                    goods[i]['skus'][j].productionbatch_format, 
                    goods[i]['skus'][j].production_licence, 
                    goods[i]['skus'][j].drp_co_id_to
                )
            }        
        }
    }

    let result
    if (goods_count) {
        result = await goodsRepo.create(goods_data, goods_count)
        if (result?.affectedRows) logger.info(`sync jst goods info rows: ${result.affectedRows}`)
    }
    if (sku_count) {
        result = await skuRepo.create(sku_data, sku_count)
        if (result?.affectedRows) logger.info(`sync jst sku info rows: ${result.affectedRows}`)
    }
    // goods = await getGoodsByTime(start_time, end_time)
    // for (let i = 0; i < goods.length; i++) {
    //     result = await goodsRepo.updateById([
    //         goods[i].name,
    //         goods[i].c_id,
    //         goods[i].c_name,
    //         goods[i].s_price,
    //         goods[i].c_price,
    //         goods[i].remark,
    //         goods[i].pic,
    //         goods[i].modified,
    //         goods[i].brand,
    //         goods[i].weight,
    //         goods[i].market_price,
    //         goods[i].vc_name,
    //         goods[i].item_type,
    //         goods[i].l,
    //         goods[i].w,
    //         goods[i].h,
    //         goods[i].shelf_life,
    //         goods[i].i_id
    //     ])
    //     if (result) logger.info(`sync jst goods: ${goods[i].i_id}`)
    //     for (let j = 0; j < goods[i]['skus'].length; j++) {
    //         result = await skuRepo.updateById([
    //             goods[i]['skus'][j].name, 
    //             goods[i]['skus'][j].c_id, 
    //             goods[i]['skus'][j].brand, 
    //             goods[i]['skus'][j].market_price, 
    //             goods[i]['skus'][j].sale_price, 
    //             goods[i]['skus'][j].cost_price, 
    //             goods[i]['skus'][j].enabled, 
    //             goods[i]['skus'][j].category,
    //             goods[i]['skus'][j].creator, 
    //             goods[i]['skus'][j].modifier, 
    //             goods[i]['skus'][j].creator_name, 
    //             goods[i]['skus'][j].modifier_name, 
    //             goods[i]['skus'][j].properties_value, 
    //             goods[i]['skus'][j].sku_code, 
    //             goods[i]['skus'][j].purchase_price, 
    //             goods[i]['skus'][j].pic, 
    //             goods[i]['skus'][j].pic_big, 
    //             goods[i]['skus'][j].weight, 
    //             goods[i]['skus'][j].short_name, 
    //             goods[i]['skus'][j].item_type, 
    //             goods[i]['skus'][j].supplier_id, 
    //             goods[i]['skus'][j].supplier_name, 
    //             goods[i]['skus'][j].supplier_sku_id, 
    //             goods[i]['skus'][j].supplier_i_id, 
    //             goods[i]['skus'][j].remark, 
    //             goods[i]['skus'][j].vc_name, 
    //             goods[i]['skus'][j].l, 
    //             goods[i]['skus'][j].w, 
    //             goods[i]['skus'][j].h, 
    //             goods[i]['skus'][j].other_price_1, 
    //             goods[i]['skus'][j].other_price_2, 
    //             goods[i]['skus'][j].other_price_3, 
    //             goods[i]['skus'][j].other_price_4, 
    //             goods[i]['skus'][j].other_price_5, 
    //             goods[i]['skus'][j].labels, 
    //             goods[i]['skus'][j].other_1, 
    //             goods[i]['skus'][j].other_2, 
    //             goods[i]['skus'][j].other_3, 
    //             goods[i]['skus'][j].other_4, 
    //             goods[i]['skus'][j].other_5, 
    //             goods[i]['skus'][j].unit, 
    //             goods[i]['skus'][j].shelf_life, 
    //             goods[i]['skus'][j].productionbatch_format, 
    //             goods[i]['skus'][j].production_licence, 
    //             goods[i]['skus'][j].drp_co_id_to,
    //             goods[i]['skus'][j].sku_id
    //         ])
    //         if (result) logger.info(`sync jst sku: ${goods[i]['skus'][j].sku_id}`)
    //     }
    // }
}

module.exports = {
    syncGoods
}