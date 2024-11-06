const express = require("express");
const router = express.Router();

const selfJoinTodayHandler = require("@/router_handler/flow_handler/statistic_today/selfJoinTodayHandler")
const selfLaunchTodayHandler = require("@/router_handler/flow_handler/statistic_today/selfLaunchTodayHandler")
const deptJoinTodayHandler = require("@/router_handler/flow_handler/statistic_today/deptJoinTodayHandler")
const deptLaunchTodayHandler = require("@/router_handler/flow_handler/statistic_today/deptLaunchTodayHandler")
const flowHandler = require("@/router_handler/flow_handler/flowHandler")
const selfTodaySumHandler = require("@/router_handler/flow_handler/statistic_today/selfTodaySumHandler")
const deptTodaySumHandler = require("@/router_handler/flow_handler/statistic_today/deptTodaySumHandler")

// url不准确需要调整
router.post("/list/today", flowHandler.getFlowsByIds)

router.get("/statistic/self-joined-today/:status", selfJoinTodayHandler.todaySelfJoinedFlowsStatisticHub)
router.get("/statistic/self-launched-today/:status", selfLaunchTodayHandler.todaySelfLaunchedFlowsStatisticHub)
router.get("/statistic/self-today-sum", selfTodaySumHandler.getSelfTodaySum)

router.get("/statistic/dept-joined-today/:status", deptJoinTodayHandler.todayDeptJoinedFlowsStatisticHub)
router.get("/statistic/dept-launched-today/:status", deptLaunchTodayHandler.todayDeptLaunchedFlowsStatisticHub)
router.get("/statistic/dept-today-sum", deptTodaySumHandler.getDeptTodaySum)
// 参数表单的ids可能会较多
router.post("/statistic/all-review-items", flowHandler.getFormsFlowsActivitiesStat)

router.put("/running", flowHandler.updateRunningFlowEmergency)

// router.post("/vision-core-action-stat", flowHandler.getVisionCoreActionStat)

router.post("/vision-core-action-stat", flowHandler.getVisionUsersStat)

router.post("/tm-core-action-stat", flowHandler.getUniversalCoreActionStat)
router.post("/execution-core-action-stat", flowHandler.getUniversalCoreActionStat)
router.post("/turnover-core-action-stat", flowHandler.getTurnoverCoreActionStat)

router.get("/all-overdue-running-flows", flowHandler.getAllOverDueRunningFlows)
/**
 * 流程表单管理
 */
router.get('/forms', flowHandler.getFlows)
router.get('/forms-process', flowHandler.getFlowsProcessByIds)
router.get('/forms-process/actions', flowHandler.getFlowProcessActions)
router.post('/forms-process/export', flowHandler.exportFlowsProcess)
/**
 * 视觉预审
 */
router.get("/vision-review", flowHandler.getVisionReview)
/**
 * 视觉方案
 */
router.get("/vision-plan", flowHandler.getVisionPlan)
router.get("/vision-action-details", flowHandler.getVisionUsersDetails)
/**
 * 运营选品池
 */
router.get("/operate-selection", flowHandler.getOperateSelection)
router.get("/operate-selection-header", flowHandler.getOperateSelectionHeader)
router.post("/operate-analysis/create", flowHandler.createOperateAnalysis)

module.exports = router;