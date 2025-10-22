const express = require('express');
const router = express.Router();
const recruitmentStatisticHandler = require('../router_handler/recruitmentStatistic');

router.get('/ship', recruitmentStatisticHandler.getCurriculumVitaeShipStatistics);

module.exports = router;
