const express = require('express')
const router = express.Router()
const deptCoreActionFormDetailsRuleApi = require("@/router_handler/deptCoreActionFormDetailsRuleApi")

router.get("/", deptCoreActionFormDetailsRuleApi.getFormDetailsRules)
router.get("/unsettled-fields", deptCoreActionFormDetailsRuleApi.getUnSettledFormFields)
router.post("/", deptCoreActionFormDetailsRuleApi.saveFormDetailsRule)
router.put("/", deptCoreActionFormDetailsRuleApi.updateFormDetailsRule)
router.delete("/", deptCoreActionFormDetailsRuleApi.deleteFormDetailsRule)

module.exports = router