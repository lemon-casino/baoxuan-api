const express = require('express');
const router = express.Router();
const deptCoreActionRuleApi = require('../router_handler/deptCoreActionFormRuleApi')

router.post("/", deptCoreActionRuleApi.saveFormRule)

module.exports = router