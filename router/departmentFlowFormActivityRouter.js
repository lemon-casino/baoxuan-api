const express = require('express');
const router = express.Router();
const departmentFlowFormActivityApi = require('../router_handler/departmentFlowFormActivityApi');

router.get("/", departmentFlowFormActivityApi.getDeptFlowFormActivities)
router.post("/", departmentFlowFormActivityApi.saveDepartmentFlowForm)
router.delete("/", departmentFlowFormActivityApi.deleteDeptFlowFormActivity)

module.exports = router