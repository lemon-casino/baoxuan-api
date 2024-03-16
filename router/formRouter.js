const express = require("express");
// 创建路由对象
const router = express.Router();
const formHandler = require("../router_handler/formHandler");

/**,
 * @swagger
 * /form/all:
 *    get:
 *      tags:
 *      - 流程表单
 *      summary:
 *      produces:
 *      - application/json
 *      parameters:
 *      - name: Authorization
 *        in: header
 *        description: bearer token
 *        required: true
 *        schema:
 *          type: string
 *      - name: isImportant
 *        in: query
 *        description: true、false
 *      responses:
 *        200:
 *          description: successful operation
 *          schema:
 *            ref: #/definitions/Order
 * */
router.get("/all", formHandler.getFormsByImportance);

module.exports = router;