const biResponse = require("../utils/biResponse")
const singleItemTaoBaoService = require("../service/singleItemTaoBaoService")
const userService = require("../service/userService")

/**
 * 获取本人链接操作数
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const getSelfLinkOperationCount = async (req, res, next) => {
    try {
        const status = req.params.status
        const ddUserId = await userService.getDingDingUserId(req.user.id)
        const username = req.user.username;
        const result = await singleItemTaoBaoService.getSelfLinkOperationCount(ddUserId, username, status)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

/**
 * 获取部门链接操作数
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const getDeptLinkOperationCount = async (req, res, next) => {
    try {
        const status = req.params.status
        const ddUserId = await userService.getDingDingUserId(req.user.id)
        const result = await singleItemTaoBaoService.getDeptLinkOperationCount(ddUserId, status)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}


module.exports = {
    getSelfLinkOperationCount,
    getDeptLinkOperationCount
}