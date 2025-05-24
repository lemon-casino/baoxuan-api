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
router.get('/work-detail', developmentApi.getWorkDetail)
//立项管理
router.get('/project-data/:type', developmentApi.getProjectData)
router.post('/project-data/create/:type', developmentApi.createProjectData)
router.put('/project-data/update/:type/:id', developmentApi.updateProjectData)
router.post('/project-data/start/:type/:id', developmentApi.start)
//数据面板
router.get('/data-pannel', developmentApi.getDataPannel)
router.get('/data-pannel-project', developmentApi.getDataPannelProject)
router.get('/data-pannel-detail', developmentApi.getDataPannelDetail)
//三级类目
router.get('/category', developmentApi.getCategoryList)

router.get('/running-process', developmentApi.getRunningProcessInfo)
router.get('/finish-process', developmentApi.getFinishProcessInfo)

module.exports = router