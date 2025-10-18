const express = require("express")
const router = express.Router()
const formHandler = require("@/router_handler/formHandler")

router.get("/all", formHandler.getFormsByImportance);
// 确定前端不使用了，删掉
router.get("/:deptId", formHandler.getFlowFormsByDeptIdAndImportant)
router.get("/dept", formHandler.getDeptFlowFormsWithCoreTag)

module.exports = router;