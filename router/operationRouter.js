const express = require('express')
// 创建路由对象
const router = express.Router()
const operationApi = require('../router_handler/operationApi')

// 数据面板
router.get('/data-pannel', operationApi.getDataStats)
router.get('/data-pannel-detail/:column', operationApi.getDataStatsDetail)
router.get('/goods-info', operationApi.getGoodsInfo)
router.get('/goods-line-info', operationApi.getGoodsLineInfo)
router.get('/goods-info-detail', operationApi.getGoodsInfoDetailTotal)
router.get('/goods-info-detail/:column', operationApi.getGoodsInfoDetail)
router.get('/goods-info-sub-detail', operationApi.getGoodsInfoSubDetail)
router.post('/goods-info/import', operationApi.importGoodsInfo)
router.post('/goods-order-stat/import', operationApi.importGoodsOrderStat)
router.post('/goods-key-words/import', operationApi.importGoodsKeyWords)
router.post('/goods-dsr/import', operationApi.importGoodsDSR)
router.post('/goods-pay-info/import', operationApi.importGoodsPayInfo)
router.post('/goods-composite-info/import', operationApi.importGoodsCompositeInfo)
router.post('/goods-sycm-info/import', operationApi.importGoodsSYCMInfo)
router.post('/goods-xhs-info/import', operationApi.importGoodsXHSInfo)
router.post('/goods-brushing-info/import', operationApi.importGoodsBrushingInfo)
router.post('/goods-pdd-info/import', operationApi.importGoodsPDDInfo)
router.post('/goods-orders/import', operationApi.importGoodsOrderInfo)
router.post('/goods-verified/import', operationApi.importGoodsVerified)
router.post('/goods-order-verified-stat/import', operationApi.importGoodsOrderVerifiedStat)
router.post('/shop-promotion-log', operationApi.createShopPromotionLog)
/**
 * 京东自营
 */
router.post('/jdzz-info/import', operationApi.importJDZYInfo)
router.post('/jdzz-promotion-info/import', operationApi.importJDZYPromotionInfo)

// 工作面板
router.get('/work-pannel', operationApi.getWorkStats)
router.get('/new-on-sale', operationApi.getNewOnSaleInfo)
router.get('/optimize', operationApi.getOptimizeInfo)

//表单配置
router.post('/pannel-setting', operationApi.setPannelSetting)

//测试优化
router.post('/check-optimize', operationApi.checkOperationOptimize)

module.exports = router