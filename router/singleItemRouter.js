const express = require('express')
const router = express.Router()
const singleItemApi = require('../router_handler/singleItemApi')

router.post('/taobao', singleItemApi.saveSingleItemTaoBao);
router.delete("/taobao", singleItemApi.deleteSingleIteTaoBaoByBatchIdAndLinkId)
router.get("/taobao", singleItemApi.getTaoBaoSingleItemsWithStatistic)
router.get("/taobao/search-data", singleItemApi.getSearchDataTaoBaoSingleItem)
router.get("/taobao/:id", singleItemApi.getSingleItemDetails)
router.get("/latest-date", singleItemApi.getLatest)


module.exports = router;