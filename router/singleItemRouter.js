const express = require('express')
const router = express.Router()
const singleItemApi = require('../router_handler/singleItemApi')
const singleItemPddApi = require("../router_handler/singleItemPddApi")
const multer = require('multer');
const path = require('path');
const fs = require('fs');
router.get("/taobao/search-data", singleItemApi.getSearchDataTaoBaoSingleItem)
router.get("/taobao/ids", singleItemApi.getidsSatisfiedSingleItems)
router.get("/taobao/:state", singleItemApi.getTaoBaoSingleItemsWithStatistic)
router.get("/taobao/:id", singleItemApi.getSingleItemDetails)
router.get("/latest-date", singleItemApi.getLatest)
router.put("/tm/single", singleItemApi.updateSingleItemTaoBao)
router.post('/taobao', singleItemApi.saveSingleItemTaoBao)
router.delete("/taobao", singleItemApi.deleteSingleIteTaoBaoByBatchIdAndLinkId)
router.get('/pdd', singleItemPddApi.getPagingPddSingleItems)

module.exports = router;