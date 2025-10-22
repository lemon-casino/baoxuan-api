/*
 * @Author: 陈晓飞 481617494@qq.com
 * @Date: 2024-01-08 19:53:47
 * @LastEditors: 陈晓飞 481617494@qq.com
 * @LastEditTime: 2024-03-04 13:35:53
 * @FilePath: /Bi-serve/router/dict.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const express = require('express');
// 创建路由对象
const router = express.Router();
const dictHandler = require('../router_handler/dict');

// 分页获取字典列表
router.get('/listDict', dictHandler.getList);
// 添加字典
router.post('/addDict', dictHandler.addDict);
// 修改字典
router.post('/editDict', dictHandler.editDict);
// 删除字典
router.post('/delDict', dictHandler.deleteDict);
// 根据id获取字典信息接口
router.get('/getDict', dictHandler.getOneDict);
// 根据名称获取字典信息接口
router.get('/getDictByName', dictHandler.getDictByName);
module.exports = router;
