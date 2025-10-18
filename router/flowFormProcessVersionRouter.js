const express = require('express')
const router = express.Router()
const flowFormProcessVersionApi = require('@/router_handler/flowFormProcessVersionApi')

router.post("/", flowFormProcessVersionApi.save)

module.exports = router