const express = require('express');
const router = express.Router();
const departmentFlowFormApi = require('../router_handler/departmentFlowFormApi');

router.post("/", departmentFlowFormApi.saveDepartmentFlowForm)
router.get("/", departmentFlowFormApi.getDepartmentFlowForms)
router.delete("/", departmentFlowFormApi.deleteDepartmentFlowForm)

module.exports = router