const express = require('express')
const router = express.Router()
const userLogApi = require('../router_handler/userLogApi')

router.get("/", userLogApi.getUserLogs)

module.exports =  router