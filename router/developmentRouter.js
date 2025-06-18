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

router.get('/product-develop/first', developmentApi.getProductDevelopFirst)
router.get('/product-develop/second', developmentApi.getProductDevelopSecond)
router.get('/product-develop/third', developmentApi.getProductDevelopThird)

router.get('/product-sales/first', developmentApi.getProductSalesFirst)
router.get('/product-sales/second', developmentApi.getProductSalesSecond)
router.get('/product-sales/third', developmentApi.getProductSalesThird)
router.get('/product-sales/fourth', developmentApi.getProductSalesFourth)

router.get('/product-develop/info', developmentApi.getProductDevelopInfo)
router.get('/product-develop/detail', developmentApi.getProductDevelopDetail)

module.exports = router