const biResponse = require("../utils/biResponse")
const singleItemTaoBaoService = require("../service/singleItemTaoBaoService")
const userService = require("../service/userService")

/**
 * 获取链接操作数(个人、部门)
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const getLinkOperationCount = async (req, res, next) => {
    try {
        const status = req.params.status
        const ddUserId = await userService.getDingDingUserId(req.user.id)
        const result = await singleItemTaoBaoService.getLinkOperationCount(ddUserId, status)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}
//
// /**
//  * 获取部门链接操作数
//  * @param req
//  * @param res
//  * @param next
//  * @returns {Promise<*>}
//  */
// const getDeptLinkOperationCount = async (req, res, next) => {
//     try {
//         const status = req.params.status
//         const ddUserId = await userService.getDingDingUserId(req.user.id)
//         const result = await singleItemTaoBaoService.getDeptLinkOperationCount(ddUserId, status)
//         return res.send(biResponse.success(result))
//     } catch (e) {
//         next(e)
//     }
// }

/**
 * 获取链接问题处理数据
 * @returns {Promise<void>}
 */
const getErrorLinkCount = async (req, res, next) => {
    try {
        const status = req.params.status
        const ddUserId = await userService.getDingDingUserId(req.user.id)
        const result = await singleItemTaoBaoService.getErrorLinkOperationCount(ddUserId, status)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getLinkOperationCount,
    getErrorLinkCount
}