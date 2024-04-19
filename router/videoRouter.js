const express = require('express');
const router = express.Router();
const videoService = require('../service/videoService');
const {success} = require("../utils/biResponse");

// 提取出来的处理日期范围的函数
const handleDateRange = (start_endDate) => {
    if (start_endDate === undefined) {
        const now = new Date();
        const endDate = now.toISOString().split('T')[0] + ' 23:59:59';
        now.setDate(now.getDate() - 1);
        const startDate = now.toISOString().split('T')[0] + ' 00:00:00';
        start_endDate = JSON.stringify([startDate, endDate]);
    }
    return JSON.parse(start_endDate);
};

router.get('/duan', async (req, res) => {
    try {
        let { start_endDate } = req.query;
        start_endDate = handleDateRange(start_endDate);

        const videos = await videoService.getVideosByDateRange(start_endDate);
        return res.send(success(videos));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/zhibo', async (req, res) => {
    try {
        let { start_endDate } = req.query;

        start_endDate = handleDateRange(start_endDate);
        console.log(start_endDate);
        const videos = await videoService.getzhiboByDateRange(start_endDate);
        return res.send(success(videos));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;