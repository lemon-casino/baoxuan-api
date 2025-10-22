const express = require('express')
const router = express.Router()
const userLogApi = require('@/router_handler/userLogApi')

router.get("/config", userLogApi.getOnlineCheckConfig)
router.get("/i-am-online", userLogApi.iAmOnline)
router.get("/statistic", userLogApi.durationStatistic)
router.get("/", userLogApi.getUserLogs)

module.exports = router