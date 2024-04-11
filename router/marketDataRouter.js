const express = require('express')
const router = express.Router()
const marketDataTmApi = require('../router_handler/marketDataTmApi')

router.get('/tm', marketDataTmApi.getPagingMarketDataTmData)

module.exports = router;