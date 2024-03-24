const singleItemTaoBaoRepo = require("../repository/singleItemTaoBaoRepo")
const {taoBaoSingleItemMap} = require("../const/singleItemMap")
const {logger} = require("../utils/log")

const getRealKey = (chineseName) => {
    for (const key of Object.keys(taoBaoSingleItemMap)) {
        if (taoBaoSingleItemMap[key] === chineseName) {
            return key
        }
    }
    return null
}

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

const deleteSingleIteTaoBaoByBatchId = async (batchId) => {
    if (!batchId) {
        throw new Error("参数：batchId 不能为空")
    }
    return singleItemTaoBaoRepo.deleteSingleIteTaoBaoByBatchId(batchId)
}

module.exports = {
    saveSingleItemTaoBao,
    deleteSingleIteTaoBaoByBatchId
}