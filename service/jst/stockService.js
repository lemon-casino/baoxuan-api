const stockRepo = require('../../repository/jst/stockRepo')
const { getStockBySkuIds } = require('../../core/jstReq/stockReq')
const skuRepo = require('../../repository/jst/skuRepo')
const { syncOrder } = require('./orderService')
const { syncGoods } = require('./goodsService')

const syncStock = async () => {
    let skuCount = await skuRepo.count(), 
        skuInfo = [], size = 50, offset = 0, sku_ids = '', 
        stockCount = 0, data = []
    skuCount = skuCount[0].count
    for (let i = 0; i < Math.ceil(skuCount / 50); i++) {
        offset = i * size
        sku_ids = ''
        skuInfo = await skuRepo.get(size, offset)
        for (let j = 0; j < skuInfo.length; j++) {
            sku_ids = `${sku_ids}${skuInfo[j].sku_id},`
        }
        sku_ids = sku_ids.substring(0, sku_ids.length - 1)
        let res = await getStockBySkuIds(sku_ids)
        for (let j = 0; j < res.length; j++) {
            data.push(
                res[j].sku_id, 
                res[j].ts, 
                res[j].i_id, 
                res[j].qty, 
                res[j].order_lock, 
                res[j].pick_lock, 
                res[j].virtual_qty, 
                res[j].purchase_qty, 
                res[j].return_qty, 
                res[j].in_qty, 
                res[j].defective_qty, 
                res[j].modified, 
                res[j].min_qty, 
                res[j].max_qty, 
                res[j].lock_qty, 
                res[j].name, 
                res[j].customize_qty_1, 
                res[j].customize_qty_2, 
                res[j].customize_qty_3, 
                res[j].allocate_qty, 
                res[j].sale_refund_qty
            )
        }
        stockCount += res.length
    }
    await stockRepo.truncate()
    let result = await stockRepo.create(data, stockCount)
    if (result?.affectedRows) logger.info(`sync jst goods stock rows: ${result.affectedRows}`)
}

const getStockStats = async () => {
    let data = []
    await syncGoods()
    await syncOrder()
    await syncStock()
    let info = await stockRepo.getStockSales()
    if (info?.length) data = info
    return data
}

module.exports = {
    syncStock,
    getStockStats
}