const express = require('express')
const router = express.Router()
const procurement = require('@/router_handler/procurementSelectionEetingApi')
const developmentApi = require('../router_handler/developmentApi')


router.get("/all", procurement.returnsTheQueryConditionInformation)
router.get("/filter", procurement.ReturnFilterEetingInformation)

router.get("/the-time-of-the-latest-day", procurement.theTimeOfTheLatestDay)
//返回组员信息
router.get("/group-member-information", procurement.groupMemberInformation)

//类型正反推统计
router.get("/type-statistics", procurement.typeStatistics)

//工作面板
router.get("/work-pannel", developmentApi.getWorkPannel)
//数据面板
router.get('/data-pannel', developmentApi.getDataPannel)
router.get('/data-pannel-detail', developmentApi.getDataPannelDetail)

module.exports = router