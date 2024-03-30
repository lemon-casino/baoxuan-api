const express = require('express')
const router = express.Router()
const singleItemApi = require('../router_handler/singleItemApi')

router.post('/taobao', singleItemApi.saveSingleItemTaoBao);
router.delete("/taobao", singleItemApi.deleteSingleIteTaoBaoByBatchIdAndLinkId)
router.get("/taobao", singleItemApi.getTaoBaoSingleItems)
router.get("/taobao/search-data", singleItemApi.getSearchDataTaoBaoSingleItem)
router.get("/taobao/:id", singleItemApi.getSingleItemDetails)


module.exports = router;