const singleItemTaoBaoRepo = require("../repository/singleItemTaoBaoRepo")
const {taoBaoSingleItemMap} = require("../const/singleItemMap")
const {logger} = require("../utils/log")
const dateUtil = require("../utils/dateUtil")
const linkTypeConst = require("../const/linkTypeConst")

/**
 * 根据中文获取真实的数据库字段
 * @param chineseName
 * @returns {string|null}
 */
const getRealKey = (chineseName) => {
    for (const key of Object.keys(taoBaoSingleItemMap)) {
        if (taoBaoSingleItemMap[key] === chineseName) {
            return key
        }
    }
    return null
}

/**
 * 保存单品表
 * @param item
 * @returns {Promise<*|null>}
 */
const saveSingleItemTaoBao = async (item) => {
    // 白少雄那边传来的key是中文（好认），转化下
    let validChineseKeys = []
    for (const key of Object.keys(taoBaoSingleItemMap)) {
        validChineseKeys.push(taoBaoSingleItemMap[key])
    }

    // 数据处理
    // 1. 将空白的数据删除，使用数据库默认字段
    // 2. 去掉%， 将字符串数字转成数字
    const newItem = {};
    for (const key of Object.keys(item)) {
        if (!validChineseKeys.includes(key)) {
            const errMsg = `当前单品数据中的${key}后端无法处理`
            logger.error(errMsg)
            throw new Error(errMsg)
        }
        let value = item[key]
        if (!value) {
            continue
        }
        if (value.indexOf("%")) {
            value = value.replace("%", "").trim()
            if (/^[0-9]+\.*[0-9]+$/.test(value)) {
                value = parseFloat(value)
            }
        }
        const realKey = getRealKey(key)
        newItem[realKey] = value;
    }
    // 必须包含 batchId，便于异常时删除同一批数据
    if (!newItem.batchId) {
        throw new Error("必须包含batchId信息，保证数据的保存完成性")
    }

    const result = await singleItemTaoBaoRepo.saveSingleItemTaoBao(newItem)
    return result
}

/**
 * 根据batchId 和 linkId删除数据
 * @param batchId
 * @param linkId
 * @returns {Promise<*|null>}
 */
const deleteSingleIteTaoBaoByBatchIdAndLinkId = async (batchId, linkId) => {
    if (!batchId || !linkId) {
        throw new Error("参数：batchId, linkId 不能为空")
    }
    return singleItemTaoBaoRepo.deleteSingleIteTaoBaoByBatchIdAndLinkId(batchId, linkId)
}

/**
 * 获取本人不同装填的的链接操作数
 * @param username
 * @param status
 * @returns {Promise<*[]>}
 */
const getSelfLinkOperationCount = async (username, status) => {
    if (status === "do") {
        const result = await getSelfALLDoSingleItemLinkOperationCount(username)
        return result
    }
    throw new Error(`${status}还不支持`)
}

/**
 * 获取本人所有链接操作数据（操作）
 * @param username
 * @returns {Promise<*[]>}
 */
const getSelfALLDoSingleItemLinkOperationCount = async (username) => {
    const timeRange = [dateUtil.earliestDate, dateUtil.endOfToday()]
    const result = await getSelfDoSingleItemLinkOperationCount(username, timeRange)
    return result
}

/**
 * 获取本人链接操作数据（操作）
 * @param username 运营主管姓名
 * @param timeRange 时间范围
 * @returns {Promise<*[]>}
 */
const getSelfDoSingleItemLinkOperationCount = async (username, timeRange) => {
    const result = []
    for (const key of Object.keys(linkTypeConst)) {
        const resultOfLinkType = await singleItemTaoBaoRepo.getSingleItemByOperationLeaderLinkTypeTimeRange(
            username,
            linkTypeConst[key],
            timeRange)

        result.push({
            linkTypeName: key,
            linkTypeValue: linkTypeConst[key],
            count: resultOfLinkType.length
        })
    }
    return result
}

/**
 * 获取本人链接操作数据（待上架）
 * @returns {Promise<void>}
 */
const getSelfWaitingOnSingleItemLinkOperationCount = async () => {

}

/**
 * 获取本人链接操作数据（待转出）
 * @returns {Promise<void>}
 */
const getSelfWaitingOutSingleItemLinkOperationCount = async () => {

}

/**
 * 获取本人链接操作数据（打仗链接）
 * @returns {Promise<void>}
 */
const getSelfFightingSingleItemLinkOperationCount = async () => {

}

/**
 * 获取本人链接操作数据（异常数据）
 * @returns {Promise<void>}
 */
const getSelfErrorSingleItemLinkOperationCount = async () => {

}


module.exports = {
    saveSingleItemTaoBao,
    deleteSingleIteTaoBaoByBatchIdAndLinkId,
    getSelfLinkOperationCount,
    getSelfDoSingleItemLinkOperationCount,
    getSelfALLDoSingleItemLinkOperationCount
}