const express = require('express')
const router = express.Router()
const attendanceApi = require('@/router_handler/attendanceApi')

router.get("/", attendanceApi.getAttendances)

module.exports = router