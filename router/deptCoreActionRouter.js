const express = require('express');
const router = express.Router();
const deptCoreActionApi = require('../router_handler/deptCoreActionApi');

router.get("/", deptCoreActionApi.getDeptCoreActionsConfig)
router.post("/", deptCoreActionApi.save)
router.delete("/", deptCoreActionApi.delDeptCoreActionConfig)

module.exports = router