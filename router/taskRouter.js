const express = require('express')
const router = express.Router()
const taskApi = require('@/router_handler/taskApi')

router.post('/working-day', taskApi.syncWorkingDay)
router.post('/today-flows', taskApi.syncTodayRunningAndFinishedFlows)
router.post('/unsaved-finished-flows', taskApi.syncMissingCompletedFlows)
router.post('/dd-token', taskApi.syncDingDingToken)
router.post('/departments', taskApi.syncDepartment)
router.post('/departments-with-users', taskApi.syncDepartmentWithUser)
router.post('/users-with-departments', taskApi.syncUserWithDepartment)
router.post('/forms', taskApi.syncForm)

module.exports = router;