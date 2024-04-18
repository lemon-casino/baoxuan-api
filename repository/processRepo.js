const Sequelize = require('sequelize')
const sequelize = require('../model/init');
const getProcessModel = require("../model/processModel")
const processModel = getProcessModel(sequelize)
const processReviewRepo = require("../repository/processReviewRepo")
const processDetailsRepo = require("../repository/processDetailsRepo")
const flowFormDetailsRepo = require("../repository/flowFormDetailsRepo")
const {logger} = require("../utils/log")
const dateUtil = require("../utils/dateUtil")

const getLatestModifiedProcess = async () => {
    const latestProcess = await processModel.findOne({
        order: [["doneTime", "desc"]]
    })
    if (latestProcess) {
        return latestProcess.dataValues
    }
    return latestProcess
}

const saveProcess = async (process) => {
    const transaction = await sequelize.transaction();
    try {
        const reviewItems = process.overallprocessflow
        const data = process.data
        const originator = process.originator

        process.originatorName = originator.name.nameInChinese
        process.originatorId = originator.userId
        process.overallprocessflow = null
        process.data = null
        process.originator = null
        process.createTime = dateUtil.formatGMT(process.createTimeGMT)
        process.doneTime = dateUtil.formatGMT(process.modifiedTimeGMT)
        process.stockedTime = new Date()
        await processModel.create(process, {transaction})

        for (let i = 0; i < reviewItems.length; i++) {
            reviewItems[i].orderIndex = i
            await processReviewRepo.saveProcessReview(reviewItems[i], transaction)
        }
        const flowFormDetails = await flowFormDetailsRepo.getFormDetailsByFormId(process.formUuid)
        const detailsArr = []
        for (const key of Object.keys(data)) {
            const fieldDetails = flowFormDetails.filter((item) => item.fieldId === key)
            detailsArr.push({
                processInstanceId: process.processInstanceId,
                fieldId: key,
                fieldName: fieldDetails && fieldDetails.length > 0 ? fieldDetails[0].fieldName : "",
                fieldValue: JSON.stringify(data[key])
            })
        }
        await processDetailsRepo.saveProcessDetailsArrWithOutTrans(detailsArr, transaction)
        await transaction.commit()
        return true
    } catch (e) {
        await transaction.rollback()
        throw e
    }
}

const getProcessByProcessInstanceId = async (processInstanceId) => {
    const result = await processModel.findOne({
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

    const flowsOfIncorrectFormatData = await processModel.findAll({
        where: {
            data: {$like: Sequelize.literal(`'"%'`)}
        }
    })
    for (const flow of flowsOfIncorrectFormatData) {
        const result = await processModel.update({
            data: JSON.parse(flow.data)
        }, {
            where: {
                processInstanceId: flow.processInstanceId
            }
        })
    }
    const flowsOfIncorrectFormatOverallProcessFlow = await processModel.findAll({
        where: {
            overallprocessflow: {$like: Sequelize.literal(`'"%'`)}
        }
    })
    for (const flow of flowsOfIncorrectFormatOverallProcessFlow) {
        await processModel.update({
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