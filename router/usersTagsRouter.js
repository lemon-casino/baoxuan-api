const express = require('express')
const router = express.Router()
const usersTagsApi = require('@/router_handler/usersTagsApi')

router.post("/", usersTagsApi.saveUserTag)
router.delete("/:id", usersTagsApi.deleteUserTag)

module.exports = router