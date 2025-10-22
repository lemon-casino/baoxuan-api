const express = require('express')
const router = express.Router()
const tagsApi = require('@/router_handler/tagsApi')

router.get("/", tagsApi.getPagingTags)
router.post("/", tagsApi.saveTag)
router.delete("/:tagCode", tagsApi.deleteTag)

module.exports = router