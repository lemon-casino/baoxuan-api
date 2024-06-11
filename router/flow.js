const express = require("express");
// 创建路由对象
const router = express.Router();
const flowpathHandler = require("../router_handler/flowpath");

// 获取子部门信息
router.get("/get_yd_department", flowpathHandler.getdepartment);

// 根据状态获取流程数据
// router.get('/listflowpath', flowpathHandler.listflowpath)
// 获取所有状态总览数据
router.get("/get_yd_overview", flowpathHandler.getoverview);

router.get("/selfLaunchFlowsStatistic", flowpathHandler.getSelfLaunchDoingFlowsStatistic)

router.get("/departmentLaunchFlowsStatistic", flowpathHandler.getDepartmentLaunchDoingFlowsStatistic)

router.get("/departmentJoinFlowsStatistic", flowpathHandler.getDepartmentJoinDoingFlowsStatistic)

// 获取筛选状态，子部门，类型
// router.get('/getfilter', flowpathHandler.getfilter)

// 获取流程表单的审核进度模版
router.get("/getliuchenglist", flowpathHandler.createExcel);

// 获取流程表单
router.get("/getprocessformlist", flowpathHandler.getprocessformlist);
// 修改流程表单
router.get("/editprocessformlist", flowpathHandler.editprocessformobj);
// 导出所有oa流程
router.get("/getoaallprocess", flowpathHandler.getOaAllProcess);
// 同步影刀过来的表单数据
router.post("/getprocessAuditing", flowpathHandler.getprocessAuditing);

module.exports = router;
