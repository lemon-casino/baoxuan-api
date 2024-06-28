const express = require('express')
const router = express.Router()
const deptCoreActionApi = require('../router_handler/deptCoreActionApi')

router.get("/", deptCoreActionApi.getDeptCoreActions)
router.post("/", deptCoreActionApi.saveDeptCoreAction)
router.put("/", deptCoreActionApi.updateDeptCoreAction)
router.delete("/", deptCoreActionApi.delDeptCoreAction)

module.exports = router