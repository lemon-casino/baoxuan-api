const express = require('express')
const router = express.Router()
const linkStatisticApi = require('../router_handler/linkStatisticApi')

/**
 * 链接操作数据路由
 * status：
 *    waiting-on（待上架）：
 *       -- 新品： 统计" running的 运营新品流程"
 *       -- 老品： 统计" running的 老品重新流程"
 *       -- 滞销： 暂无
 *    do（操作）：天猫下的产品线负责人
 *    waiting-out（待转出）：暂无
 *    fighting（打仗链接）： 天猫打仗链接
 *    error（异常链接）：
 *       -- 利润率低于15%
 *       -- 费比超过15%
 *       -- 市场占比下降
 *       -- 流量未起
 *       -- 新品负利率
 *       -- 投产低于2
 */
router.get('/self-operation-count/:status', linkStatisticApi.getSelfLinkOperationCount)
router.get('/dept-operation-count/:status', linkStatisticApi.getDeptLinkOperationCount)

module.exports = router;