const express = require('express');
const router = express.Router();
const departmentFlowFormActivityApi = require('@/router_handler/departmentFlowFormActivityApi');

router.get("/", departmentFlowFormActivityApi.getDeptFlowFormActivities)
router.post("/", departmentFlowFormActivityApi.saveDepartmentFlowFormActivity)
router.delete("/", departmentFlowFormActivityApi.deleteDeptFlowFormActivity)

module.exports = router