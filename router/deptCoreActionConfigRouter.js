const express = require('express');
const router = express.Router();
const deptCoreActionConfigApi = require('../router_handler/deptCoreActionConfigApi');

router.get("/", deptCoreActionConfigApi.getDeptCoreActionsConfig)
router.post("/", deptCoreActionConfigApi.save)
router.delete("/", deptCoreActionConfigApi.delDeptCoreActionConfig)

module.exports = router