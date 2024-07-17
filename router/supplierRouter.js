const express = require('express')
const router = express.Router()
const wechatApi = require('@/router_handler/supplierApi')
// 查询供应商列表
router.post("/list",wechatApi.getPagingList)

module.exports = router