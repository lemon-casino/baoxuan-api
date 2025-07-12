const express = require('express')
// 创建路由对象
const router = express.Router()
const stockApi = require('../router_handler/stockApi')

// 数据面板
router.post('/get-week-stats', stockApi.getWeekStats)
router.post('/sync-order', stockApi.syncOrder)
router.post('/goods-sku/import', stockApi.importGoodsSku)
router.post('/purchase-info/import', stockApi.importPurchaseInfo)
router.post('/ori-sku-info/import', stockApi.importOriSkuInfo)
router.post('/sync-purchase-order', stockApi.syncPurchaseOrder)

module.exports = router