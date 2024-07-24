const express = require('express')
const router = express.Router()
const deptCoreActionApi = require('@/router_handler/deptCoreActionApi')

router.get("/", deptCoreActionApi.getDeptCoreActions)
router.get("/forms", deptCoreActionApi.getDeptCoreActionForms)
router.post("/", deptCoreActionApi.saveDeptCoreAction)
router.put("/", deptCoreActionApi.updateDeptCoreAction)
router.delete("/", deptCoreActionApi.delDeptCoreAction)
router.post("/sync", deptCoreActionApi.syncDeptCoreActionsRules)
router.post("/copy", deptCoreActionApi.copyActionRules)

module.exports = router