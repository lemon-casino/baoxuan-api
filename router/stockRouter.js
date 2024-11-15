const express = require('express')
// 创建路由对象
const router = express.Router()
const stockApi = require('../router_handler/stockApi')

// 数据面板
router.post('/get-week-stats', stockApi.getWeekStats)
router.post('/sync-order', stockApi.syncOrder)

module.exports = router