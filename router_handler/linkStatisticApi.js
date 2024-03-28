const biResponse = require("../utils/biResponse")
const singleItemTaoBaoService = require("../service/singleItemTaoBaoService")

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
        const result = await singleItemTaoBaoService.getSelfLinkOperationCount(req.user.username, status)
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
    const status = req.params.status
    // 校验用户是否有访问权限
    let result = null
    try {
        switch (status) {
            case "do":
                result = singleItemTaoBaoService.getSelfALLDoSingleItemLinkOperationCount(req.user.username)
                break
        }
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}


module.exports = {
    getSelfLinkOperationCount
}