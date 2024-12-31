const express = require('express');
// 创建路由对象
const router = express.Router();
const dingdingHandler = require('../router_handler/dingding');

// 获取dingding用户信息
router.get('/getddUserList', dingdingHandler.getddUserList);
// 获取dingding流程列表
router.get('/getLiuChengList', dingdingHandler.getLiuChengList);
// 根据钉钉user_id获取部门列表
router.get('/getDpList', dingdingHandler.getDpList);
// 根据钉钉部门详情
router.get('/getDpInfo', dingdingHandler.getDpInfo);

// 获取dingding 登录 config
router.get('/dingding-config', dingdingHandler.getDDConfig)

module.exports = router;
