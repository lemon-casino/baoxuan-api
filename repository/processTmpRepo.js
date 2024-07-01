const models = require('@/model')
const dateUtil = require("@/utils/dateUtil");
const uuidUtil = require("@/utils/uuidUtil");
const flowFormDetailsRepo = require("./flowFormDetailsRepo");

const truncate = async () => {
    await models.processTmpModel.truncate()
}

/**
 * 同processRepo中的逻辑有重复
 *
 * @param process
 * @returns {Promise<boolean>}
 */
const save = async (process) => {
    const transaction = await models.sequelize.transaction()
    try {
        const originator = process.originator
        process.originatorName = originator.name.nameInChinese
        process.originatorId = originator.userId
        process.createTime = dateUtil.formatGMT(process.createTimeGMT)
        process.stockedTime = new Date()
        await models.processTmpModel.create(process, {transaction})

        const reviewItems = process.overallprocessflow
        for (let i = 0; i < reviewItems.length; i++) {
            reviewItems[i].id = uuidUtil.getId()
            reviewItems[i].orderIndex = i
            reviewItems[i].processInstanceId = process.processInstanceId
            reviewItems[i].operateTime = reviewItems[i].operateTimeGMT && dateUtil.formatGMT2Str(reviewItems[i].operateTimeGMT)
            await models.processReviewTmpModel.create(reviewItems[i], {transaction})
        }
        const flowFormDetails = await flowFormDetailsRepo.getFormDetailsByFormId(process.formUuid)

        const data = process.data
        for (const key of Object.keys(data)) {
            const fieldDetails = flowFormDetails.filter((item) => key.includes(item.fieldId))
            const fieldValue = data[key] instanceof Array ? JSON.stringify(data[key]) : data[key]
            const details = {
                id: uuidUtil.getId(),
                processInstanceId: process.processInstanceId,
                fieldId: key,
                fieldName: fieldDetails && fieldDetails.length > 0 ? fieldDetails[0].fieldName : "",
                fieldValue
            }
            await models.processDetailsTmpModel.create(details, {transaction})
        }
        await transaction.commit()
        return true
    } catch (e) {
        await transaction.rollback()
        throw e
    }
}

module.exports = {
    truncate,
    save
}