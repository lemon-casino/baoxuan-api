const express = require("express")
const router = express.Router()
const confirmationNoticeServiceApi = require("../service/notice/confirmationNoticeService")


// 天猫
router.get("/confirmNotice", confirmationNoticeServiceApi.confirmNotice)


module.exports = router
