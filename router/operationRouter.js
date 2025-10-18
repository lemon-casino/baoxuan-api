const express = require('express')
// 创建路由对象
const router = express.Router()
const operationApi = require('../router_handler/operationApi')

// 数据面板
router.get('/data-pannel', operationApi.getDataStats)
router.get('/data-pannel-detail/:column', operationApi.getDataStatsDetail)
router.get('/goods-info', operationApi.getGoodsInfo)
router.get('/goods-line-info', operationApi.getGoodsLineInfo)
router.post('/goods-info/import', operationApi.importGoodsInfo)
router.post('/goods-key-words/import', operationApi.importGoodsKeyWords)
router.post('/goods-dsr/import', operationApi.importGoodsDSR)
router.post('/goods-promotion-info/import', operationApi.importGoodsPromotionInfo)
router.post('/jdzz-info/import', operationApi.importJDZYInfo)
router.post('/jdzz-promotion-info/import', operationApi.importJDZYPromotionInfo)
router.get('/goods-info-detail/:column', operationApi.getGoodsInfoDetail)
// 工作面板
router.get('/work-pannel', operationApi.getWorkStats)

module.exports = router