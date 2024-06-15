const express = require("express");
const router = express.Router();
const formHandler = require("../router_handler/formHandler");
const handler = require("../router_handler/flowFormApi");

router.get("/all", formHandler.getFormsByImportance);
// 确定前端不使用了，删掉
router.get("/:deptId", formHandler.getFlowFormsByDeptIdAndImportant)
router.get("/dept", handler.getDeptFlowFormsWithCore)

module.exports = router;