const express = require('express');
const router = express.Router();
const deptCoreActionFormRuleApi = require('@/router_handler/deptCoreActionFormRuleApi')

router.post("/", deptCoreActionFormRuleApi.saveFormRule)

module.exports = router