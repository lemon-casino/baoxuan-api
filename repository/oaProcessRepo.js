const models = require('@/model')
const oaProcessModel = models.oaProcessModel
const oaProcessDetailsModel = models.oaProcessDetailsModel
const oaProcessOperateRecordModel = models.oaProcessOperateRecordModel
const oaProcessTaskModel = models.oaProcessTaskModel
const uuidUtil = require("@/utils/uuidUtil")

const save = async (model) => {
    const transaction = await models.sequelize.transaction()
    try {
        const {formComponentValues, operationRecords, tasks} = model
        model.stockedTime = new Date()
        await oaProcessModel.create(model, {transaction})

        for (const details of formComponentValues) {
            details.id = uuidUtil.getId()
            details.processInstanceId = model.processInstanceId
            await oaProcessDetailsModel.create(details, {transaction})
        }

        for (const record of operationRecords) {
            record.id = uuidUtil.getId()
            record.processInstanceId = model.processInstanceId
            await oaProcessOperateRecordModel.create(record, {transaction})
        }

        for (const task of tasks) {
            task.id = uuidUtil.getId()
            task.processInstanceId = model.processInstanceId
            await oaProcessTaskModel.create(task, {transaction})
        }
        transaction.commit()
        return true
    } catch (e) {
        transaction.rollback()
        throw e
    }
}

const getOAFormLatestDoneTime = async (processCode) => {
    const latestDoneProcess = await oaProcessModel.findOne({
        where: {processCode},
        order: [["finishTime", "desc"]]
    })
    if (latestDoneProcess) {
        return latestDoneProcess.finishTime
    }
    return null
}

module.exports = {
    save,
    getOAFormLatestDoneTime
}
