const express = require("express")
const router = express.Router()
const formHandler = require("../router_handler/formHandler")
const flowFormDetailsApi = require("../router_handler/flowFormDetailsApi")

router.get("/all", formHandler.getFormsByImportance);
// 确定前端不使用了，删掉
router.get("/:deptId", formHandler.getFlowFormsByDeptIdAndImportant)
router.get("/dept", formHandler.getDeptFlowFormsWithCoreTag)
router.get("/:formId/diff-versions-details", flowFormDetailsApi.getFormDifferentVersionDetails)

module.exports = router;