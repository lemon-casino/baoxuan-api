const express = require('express')
const router = express.Router()
const dianShangOperationAttributeApi = require('../router_handler/dianShangOperationAttributeApi')

router.get("/", dianShangOperationAttributeApi.getPagingOperateAttributes)
router.post("/", dianShangOperationAttributeApi.saveProductAttrDetails)
router.put("/", dianShangOperationAttributeApi.updateProductAttrDetails)
router.delete("/", dianShangOperationAttributeApi.deleteProductAttr)

module.exports = router