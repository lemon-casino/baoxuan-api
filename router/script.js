const express = require('express')
// 创建路由对象
const router = express.Router()
const roleHandler = require('../router_handler/script')

// 获取所有脚本数据
router.get('/listscript', roleHandler.getListScript)
// 操作excel脚本
router.post('/excelscript', roleHandler.getExcelScript)
// 汇总脚本
router.get('/summaryscript', roleHandler.getrs)

module.exports = router
