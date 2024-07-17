const express = require('express')
const router = express.Router()
const wechatApi = require('@/router_handler/wechatApi')
// 查询微信聊天统计
router.post("/chatStatistics",wechatApi.chatStatistics)

module.exports = router