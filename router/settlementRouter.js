const express = require('express')
// 创建路由对象
const router = express.Router()
const settlementApi = require('../router_handler/settlementApi')

router.post('/data/import', settlementApi.importData)

module.exports = router