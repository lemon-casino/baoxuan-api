const express = require("express");
const router = express.Router();

const selfJoinTodayHandler = require("../router_handler/flow_handler/statistic_today/selfJoinTodayHandler")
const selfLaunchTodayHandler = require("../router_handler/flow_handler/statistic_today/selfLaunchTodayHandler")
const deptJoinTodayHandler = require("../router_handler/flow_handler/statistic_today/deptJoinTodayHandler")
const deptLaunchTodayHandler = require("../router_handler/flow_handler/statistic_today/deptLaunchTodayHandler")
const flowHandler = require("../router_handler/flow_handler/flowHandler")
const selfTodaySumHandler = require("../router_handler/flow_handler/statistic_today/selfTodaySumHandler")
const deptTodaySumHandler = require("../router_handler/flow_handler/statistic_today/deptTodaySumHandler")

router.post("/list/today", flowHandler.getTodayFlowsByIds)

router.get("/statistic/self-joined-today/:status", selfJoinTodayHandler.todaySelfJoinedFlowsStatisticHub)
router.get("/statistic/self-launched-today/:status", selfLaunchTodayHandler.todaySelfLaunchedFlowsStatisticHub)
router.get("/statistic/self-today-sum", selfTodaySumHandler.getSelfTodaySum)

router.get("/statistic/dept-joined-today/:status", deptJoinTodayHandler.todayDeptJoinedFlowsStatisticHub)
router.get("/statistic/dept-launched-today/:status", deptLaunchTodayHandler.todayDeptLaunchedFlowsStatisticHub)
router.get("/statistic/dept-today-sum", deptTodaySumHandler.getDeptTodaySum)

router.put("/running", flowHandler.updateRunningFlowEmergency)

router.get("/core-action", flowHandler.getCoreActionData)

module.exports = router;