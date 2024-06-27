const express = require('express');
const router = express.Router();
const TM_StoreDataService = require('../service/TM_StoreDataService');
const {success} = require("../utils/biResponse");

// 提取出来的处理日期范围的函数
const handleDateRange = (timeRange) => {
    if (timeRange === undefined) {
        const now = new Date();
        const endDate = now.toISOString().split('T')[0] + ' 23:59:59';
        now.setDate(now.getDate() - 1);
        const startDate = now.toISOString().split('T')[0] + ' 00:00:00';
        timeRange = JSON.stringify([startDate, endDate]);
    }
    return JSON.parse(timeRange);
};

router.get('/storedata', async (req, res) => {
    try {
        let {timeRange} = req.query;
        const {page, pageSize} = req.query;
        timeRange = handleDateRange(timeRange);
        // 增加 分页功能
        const videos = await TM_StoreDataService.getVideosByDateRange(timeRange, page, pageSize);
        return res.send(success(videos));
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});


module.exports = router;