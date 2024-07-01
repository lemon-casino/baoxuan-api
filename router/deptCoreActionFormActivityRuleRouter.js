const express = require('express')
const router = express.Router()
const deptCoreActionFormActivityRuleApi = require("@/router_handler/deptCoreActionFormActivityRuleApi")

router.get("/", deptCoreActionFormActivityRuleApi.getFormActivityRules)
router.post("/", deptCoreActionFormActivityRuleApi.saveFormActivityRule)
router.put("/", deptCoreActionFormActivityRuleApi.updateFormActivityRule)
router.delete("/", deptCoreActionFormActivityRuleApi.deleteFormActivityRule)

module.exports = router