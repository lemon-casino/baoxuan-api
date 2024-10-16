const express = require("express")
const router = express.Router()
const workflowApi = require("../service/purchaseworkflow")


// 天猫
router.get("/purchase-workflow", workflowApi.getpurchaseworkflow)


module.exports = router
