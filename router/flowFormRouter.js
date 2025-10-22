const express = require("express")
// 创建路由对象
const router = express.Router()
const handler = require("@/router_handler/flowFormApi")

// 获取流程表单列表
router.get("/getFlowFormList", handler.getFlowFormList)
// 更新流程表单数据
router.post("/updateFlowForm", handler.updateFlowForm)
router.get("/", handler.getAllFlowForms)

module.exports = router;
