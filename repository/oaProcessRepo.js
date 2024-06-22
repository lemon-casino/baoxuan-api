const models = require('../model')
const oaProcessModel = models.oaProcessModel
const oaProcessDetailsModel = models.oaProcessDetailsModel
const oaProcessOperateRecordModel = models.oaProcessOperateRecordModel
const oaProcessTaskModel = models.oaProcessTaskModel

const save = async (model) => {
    const transaction = models.sequelize.transaction
    try {
        const {formComponentValues, operationRecords, tasks} = model
        await oaProcessModel.create(model, {transaction})

        for (const details of formComponentValues) {
            oaProcessDetailsModel.create(formComponentValues, {transaction})
        }

        for (const record of operationRecords) {
            oaProcessOperateRecordModel.create(record, {transaction})
        }

        for (const task of tasks) {
            oaProcessTaskModel.create(task, {transaction})
        }

        transaction.commit()
    } catch (e) {
        transaction.rollback()
    }
}

const getOAFormLatestDoneTime = async (processCode) => {
    const latestDoneProcess = await oaProcessModel.findOne({
        where: {processCode},
        order: [["doneTime", "desc"]]
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
