const express = require('express');
const router = express.Router();
const hrRecruit = require('../router_handler/Hr_Recruit');

router.get("/RecruitmentDepartmentPositions", hrRecruit.recruitmentDepartment)
router.get("/RecruitmentTalentDynamic", hrRecruit.recruitmentTalent)
router.get("/progressMap", hrRecruit.progressMap)
// 人事 员工管理
router.get("/employeeManagement", hrRecruit.employeeManagement)
//人事 展示
router.get("/show", hrRecruit.showTalent)

module.exports = router