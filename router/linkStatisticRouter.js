const express = require('express')
const router = express.Router()
const linkStatisticApi = require('../router_handler/linkStatisticApi')

/**
 * 链接操作数据路由
 * status： waiting-on（待上架）、do（操作）、waiting-out（待转出）、fighting（打仗链接）、error（异常链接）
 */
router.get('/self-operation-count/:status', linkStatisticApi.getSelfLinkOperationCount);

module.exports = router;