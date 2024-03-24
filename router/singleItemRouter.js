const express = require('express')
const router = express.Router()
const singleItemApi = require('../router_handler/singleItemApi')

router.post('/taobao', singleItemApi.saveSingleItemTaoBao);
router.delete("/taobao", singleItemApi.deleteSingleIteTaoBaoByBatchId)

module.exports = router;