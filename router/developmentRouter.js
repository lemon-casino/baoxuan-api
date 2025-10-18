const express = require('express')
const router = express.Router()
const  procurement = require('@/router_handler/procurementSelectionEetingApi')


router.get("/all", procurement.returnsTheQueryConditionInformation)
router.get("/filter", procurement.ReturnFilterEetingInformation)

router.get("/the-time-of-the-latest-day", procurement.theTimeOfTheLatestDay)
//返回组员信息
router.get("/group-member-information", procurement.groupMemberInformation)

//类型正反推统计
router.get("/type-statistics", procurement.typeStatistics)
module.exports = router