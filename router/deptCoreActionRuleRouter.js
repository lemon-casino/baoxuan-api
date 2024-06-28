const express = require('express');
const router = express.Router();
const deptCoreActionRuleConfigApi = require('../router_handler/deptCoreActionRuleConfigApi');

router.get("/form", deptCoreActionRuleConfigApi.getDeptCoreActionFormRules)
router.post("/form", deptCoreActionRuleConfigApi.saveFormRule)
router.delete("/form", deptCoreActionRuleConfigApi.delCoreActionFormRule)

module.exports = router