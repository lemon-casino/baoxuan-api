const express = require('express');
const router = express.Router();
const hrRecruit = require('../router_handler/Hr_Recruit');
const curriculumVitaeHandler = require('../router_handler/curriculumVitae');

router.get("/RecruitmentDepartmentPositions", hrRecruit.recruitmentDepartment);
router.get("/RecruitmentTalentDynamic", hrRecruit.recruitmentTalent);
router.get("/progressMap", hrRecruit.progressMap);

// 人事 员工管理
router.get("/employeeManagement", hrRecruit.employeeManagement);
//人事 展示
router.get("/show", hrRecruit.showTalent);

//人事 履历
router.get("/curriculumVitae", hrRecruit.curriculumVitae);

// 简历管理
router.get("/curriculumVitae/records", curriculumVitaeHandler.listCurriculumVitae);
router.post("/curriculumVitae/records", curriculumVitaeHandler.createCurriculumVitae);
router.get("/curriculumVitae/records/:id", curriculumVitaeHandler.getCurriculumVitae);
router.put("/curriculumVitae/records/:id", curriculumVitaeHandler.updateCurriculumVitae);
router.delete("/curriculumVitae/records/:id", curriculumVitaeHandler.removeCurriculumVitae);
//高级筛选 用户后面的数据分析
router.get("/curriculumVitae/filters", curriculumVitaeHandler.getCurriculumVitaeFilters);
// 根据用户名 模糊比配
router.get("/name", hrRecruit.curriculumVitaelikename);

// 员工结构分布
router.get("/employeeFiles", hrRecruit.employeeFiles);

//月度入离职查询
router.get("/entryAndResignation", hrRecruit.entryAndResignation);

//月度异动查询

// 月度转正查询

//月度试用期查询

// 人力成本分析

//员工离职档案查询

// 劳动合同管理

module.exports = router;
router.get('/advise-output', hrRecruit.dailyAdviseOutput)
module.exports = router