const models = require('../model')
const flowFormDetailsRepo = require("../repository/flowFormDetailsRepo")
const dateUtil = require("../utils/dateUtil")
const uuidUtil = require("../utils/uuidUtil")

const getLatestModifiedProcess = async () => {
    const latestProcess = await models.processModel.findOne({
        order: [["doneTime", "desc"]]
    })
    if (latestProcess) {
        return latestProcess.dataValues
    }
    return latestProcess
}

const saveProcess = async (process) => {
    const transaction = await models.sequelize.transaction()
    try {
        const originator = process.originator
        process.originatorName = originator.name.nameInChinese
        process.originatorId = originator.userId
        process.createTime = dateUtil.formatGMT(process.createTimeGMT)
        process.doneTime = dateUtil.formatGMT(process.modifiedTimeGMT)
        process.stockedTime = new Date()
        await models.processModel.create(process, {transaction})

        const reviewItems = process.overallprocessflow
        for (let i = 0; i < reviewItems.length; i++) {
            reviewItems[i].id = uuidUtil.getId()
            reviewItems[i].orderIndex = i
            reviewItems[i].taskHoldTime = reviewItems[i].taskHoldTimeGMT
            reviewItems[i].doneTime = dateUtil.formatGMT2Str(reviewItems[i].operateTimeGMT)
            await models.processReviewModel.create(reviewItems[i], {transaction})
        }
        const flowFormDetails = await flowFormDetailsRepo.getFormDetailsByFormId(process.formUuid)

        const data = process.data
        for (const key of Object.keys(data)) {
            const fieldDetails = flowFormDetails.filter((item) => item.fieldId === key)
            const fieldValue = data[key] instanceof Array ? JSON.stringify(data[key]) : data[key]
            const details = {
                id: uuidUtil.getId(),
                processInstanceId: process.processInstanceId,
                fieldId: key,
                fieldName: fieldDetails && fieldDetails.length > 0 ? fieldDetails[0].fieldName : "",
                fieldValue
            }
            await models.processDetailsModel.create(details, {transaction})
        }
        await transaction.commit()
        return true
    } catch (e) {
        await transaction.rollback()
        throw e
    }
}

const getProcessByProcessInstanceId = async (processInstanceId) => {
    const result = await models.processModel.findOne({
        where: {
            processInstanceId
        }
    })
    if (result) {
        return result.dataValues
    }
    return null
}

/**
 * 将流程表中data和overallprocessflow为字符串的数据改为json
 * @returns {Promise<void>}
 */
const correctStrFieldToJson = async () => {
    // 修正流程表中data、overallprocessflow 字符串为json

    const flowsOfIncorrectFormatData = await models.processModel.findAll({
        where: {
            data: {$like: models.Sequelize.literal(`'"%'`)}
        }
    })
    for (const flow of flowsOfIncorrectFormatData) {
        const result = await models.processModel.update({
            data: JSON.parse(flow.data)
        }, {
            where: {
                processInstanceId: flow.processInstanceId
            }
        })
    }
    const flowsOfIncorrectFormatOverallProcessFlow = await models.processModel.findAll({
        where: {
            overallprocessflow: {$like: models.Sequelize.literal(`'"%'`)}
        }
    })
    for (const flow of flowsOfIncorrectFormatOverallProcessFlow) {
        await models.processModel.update({
            overallprocessflow: JSON.parse(flow.overallprocessflow)
        }, {
            where: {
                processInstanceId: flow.processInstanceId
            }
        })
    }
}

module.exports = {
    getLatestModifiedProcess,
    saveProcess,
    correctStrFieldToJson,
    getProcessByProcessInstanceId
}