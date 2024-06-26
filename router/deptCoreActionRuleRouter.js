const express = require('express');
const router = express.Router();
const deptCoreActionRuleConfigApi = require('../router_handler/deptCoreActionRuleConfigApi');

router.get("/id", deptCoreActionRuleConfigApi.getDeptCoreActionRulesConfig)
router.post("/", deptCoreActionRuleConfigApi.save)
router.delete("/", deptCoreActionRuleConfigApi.delCoreActionRuleConfigById)

module.exports = router