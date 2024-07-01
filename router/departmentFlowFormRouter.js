const express = require('express')
const router = express.Router()
const departmentFlowFormApi = require('@/router_handler/departmentFlowFormApi')

router.get("/", departmentFlowFormApi.getDepartmentFlowForms)
router.post("/", departmentFlowFormApi.saveDepartmentFlowForm)
router.delete("/", departmentFlowFormApi.deleteDepartmentFlowForm)

module.exports = router