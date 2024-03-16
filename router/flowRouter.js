const express = require("express");
const router = express.Router();

const selfJoinTodayHandler = require("../router_handler/flow_handler/statistic_today/selfJoinTodayHandler")
const selfLaunchTodayHandler = require("../router_handler/flow_handler/statistic_today/selfLaunchTodayHandler")
const flowHandler = require("../router_handler/flow_handler/flowHandler")

/**,
 * @swagger
 * /flow/statistic/self-joined-today/{status}:
 *    get:
 *      tags:
 *      - 本人参与统计
 *      summary: 根据状态获取本人参与的流程统计数据
 *      produces:
 *      - application/json
 *      parameters:
 *      - name: Authorization
 *        in: header
 *        description: bearer token
 *        required: true
 *        schema:
 *          type: string
 *      - name: status
 *        in: path
 *        description: doing(进行中)、waiting(待转入)、completed(已完成)、overdue(已逾期)、error(异常)、terminated(终止)
 *        required: true
 *        schema:
 *          type: string
 *      - name: importance
 *        in: query
 *        description: 参数格式： {"isImportant":false,"forms":[],"items":[]}  说明：【isImportant：是否重要  forms：form的id集合  items：form下选中项的code集合】【全部-不用传该参数】【选到重要：forms和items可以不用传】【选到form：items可以不用传】
 *      responses:
 *        200:
 *          description: {"code": 200, "message": "成功", "data": {"sum": 0, "departments": [{"deptName": "", "sum":0, "ids": []}]}}
 * */
router.get("/statistic/self-joined-today/:status", selfJoinTodayHandler.todaySelfJoinedFlowsStatisticHub)

/**,
 * @swagger
 * /flow/statistic/self-launched-today/{status}:
 *    get:
 *      tags:
 *      - 本人发起统计
 *      summary: 根据状态获取本人发起的流程统计数据
 *      produces:
 *      - application/json
 *      parameters:
 *      - name: Authorization
 *        in: header
 *        description: bearer token
 *        required: true
 *        schema:
 *          type: string
 *      - name: status
 *        in: path
 *        description: doing(进行中)、waiting(待转入)、completed(已完成)、overdue(已逾期)、error(异常)、terminated(终止)
 *        required: true
 *        schema:
 *          type: string
 *      - name: importance
 *        in: query
 *        description: 参数格式： {"isImportant":false,"forms":[],"items":[]}  说明：【isImportant：是否重要  forms：form的id集合  items：form下选中项的code集合】【全部-不用传该参数】【选到重要：forms和items可以不用传】【选到form：items可以不用传】
 *      responses:
 *        200:
 *          description: {"code": 200, "message": "成功", "data": {"sum": 0, "departments": [{"deptName": "", "sum":0, "ids": []}]}}
 * */
router.get("/statistic/self-launched-today/:status", selfLaunchTodayHandler.todaySelfLaunchedFlowsStatisticHub)

/**,
 * @swagger
 * /flow/list/today:
 *    get:
 *      tags:
 *      - 流程
 *      summary: 根据流程的ids从缓存中获取流程详情
 *      produces:
 *      - application/json
 *      parameters:
 *      - name: Authorization
 *        in: header
 *        description: bearer token
 *        required: true
 *        schema:
 *          type: string
 *      - name: ids
 *        in: query
 *        description:  参数格式：["", ""]
 *      responses:
 *        200:
 *          description: {"code": 200, "message": "成功", "data": [{},{}]}
 * */
router.get("/list/today", flowHandler.getTodayFlowsByIds)
module.exports = router;