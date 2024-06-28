const express = require('express');
const router = express.Router();
const deptCoreActionRuleApi = require('../router_handler/deptCoreActionRuleApi')
const deptCoreActionFormDetailsRuleApi = require("../router_handler/deptCoreActionFormDetailsRuleApi")

router.get("/form", deptCoreActionRuleApi.getDeptCoreActionFormRules)
router.post("/form", deptCoreActionRuleApi.saveFormRule)
router.delete("/form", deptCoreActionRuleApi.delCoreActionFormRule)

router.get("/form-details", deptCoreActionFormDetailsRuleApi.getFormDetailsRule)
router.post("/form-details", deptCoreActionFormDetailsRuleApi.saveFormDetailsRule)
router.put("/form-details", deptCoreActionFormDetailsRuleApi.updateFormDetailsRule)
router.delete("/form-details", deptCoreActionFormDetailsRuleApi.deleteFormDetailsRule)

module.exports = router