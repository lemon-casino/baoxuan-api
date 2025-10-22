/*
 * @Author: 陈晓飞 481617494@qq.com
 * @Date: 2024-02-28 16:35:04
 * @LastEditors: 陈晓飞 481617494@qq.com
 * @LastEditTime: 2024-03-06 17:03:16
 * @FilePath: /Bi-serve/router/flow-formReviewService.js-review.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const express = require("express");
// 创建路由对象
const router = express.Router();
const handler = require("../router_handler/flowformreview");


// 存储流程审核流模版
router.get("/saveFlowFormReview", handler.saveFlowFormReview);
// 获取流程审核流
router.get("/getFlowFormReviewList", handler.getFlowFormReviewList);
// 更新流程审核流
router.post("/updateFlowFormReview", handler.updateFlowFormReview);

module.exports = router;
