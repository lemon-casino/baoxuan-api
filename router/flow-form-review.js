const express = require("express");
// 创建路由对象
const router = express.Router();
const handler = require("../router_handler/flowformreview");


// 存储流程审核流模版
router.get("/saveFlowFormReview", handler.saveFlowFormReview);
// 获取流程审核流
router.get("/getFlowFormReviewList", handler.getFlowFormReviewList);
// 更新流程审核流
// router.get("/getFlowFormReviewList", handler.getFlowFormReviewList);

module.exports = router;
