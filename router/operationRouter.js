const express = require('express')
// 创建路由对象
const router = express.Router()
const operationApi = require('../router_handler/operationApi')

// 数据面板
router.get('/data-pannel', operationApi.getDataStats)
router.get('/goods-info', operationApi.getGoodsInfo)
router.get('/goods-line-info', operationApi.getGoodsLineInfo)
router.post('/goods-info/import', operationApi.importGoodsInfo)
// 工作面板
router.get('/work-pannel', operationApi.getWorkStats)

module.exports = router