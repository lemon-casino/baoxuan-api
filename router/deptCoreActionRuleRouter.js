const express = require('express');
const router = express.Router();
const deptCoreActionRuleConfigApi = require('../router_handler/deptCoreActionRuleConfigApi');

router.get("/", deptCoreActionRuleConfigApi.getDeptCoreActionRulesConfig)
router.post("/", deptCoreActionRuleConfigApi.save)
router.delete("/", deptCoreActionRuleConfigApi.delCoreActionRuleConfig)

module.exports = router