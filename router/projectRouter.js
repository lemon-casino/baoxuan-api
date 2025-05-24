const express = require('express')
// 创建路由对象
const router = express.Router()
const projectApi = require('../router_handler/projectApi')

router.get('/list', projectApi.getList)

module.exports = router