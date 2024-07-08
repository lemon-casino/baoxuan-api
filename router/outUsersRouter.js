const express = require('express')
const router = express.Router()
const outUsersApi = require('@/router_handler/outUsersApi')

router.get("/", outUsersApi.getOutUsers)
router.get("/paging", outUsersApi.getPagingOutUsers)
router.get("/tags", outUsersApi.getOutUsersWithTags)
router.put("/:id", outUsersApi.updateOutUsers)

module.exports = router