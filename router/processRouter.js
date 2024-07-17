const express = require('express')
const router = express.Router()
const processApi = require('@/router_handler/processApi')
// 查询流程信息
router.post("/getProcurementProcessStatistics",processApi.getProcurementProcessStatistics)
// 查询完成流程信息
router.post("/getProcessIdsData",processApi.getProcessIdsData)
// 查询进行中流程数据
router.post("/getProcessIdsTmpData",processApi.getProcessIdsTmpData)
// 查询进行中和和已完成表数据
router.post("/getProcessMergeIdsData",processApi.getProcessMergeIdsData)

module.exports = router