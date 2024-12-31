const express = require('express')
const router = express.Router()
const downloadInfoApi = require('../router_handler/downloadInfoApi')
router.get("/info", downloadInfoApi.getInfo)
router.get("/export", downloadInfoApi.exportFile)

module.exports = router