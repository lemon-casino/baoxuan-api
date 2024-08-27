const express = require('express')
const router = express.Router()
const  procurement = require('@/router_handler/procurementSelectionEetingApi')


router.get("/all", procurement.returnsTheQueryConditionInformation)


module.exports = router