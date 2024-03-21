const sequelize = require('../model/init');
const getProcessModel = require("../model/processModel")
const processModel = getProcessModel(sequelize)

const getLatestModifiedProcess = async () => {
    const latestProcess = await processModel.findOne({
        order: "modifiedTimeGMT desc"
    })
    if (latestProcess) {
        return latestProcess.dataValues
    }
    return latestProcess
}

const saveProcess = async (process) => {
    const result = await processModel.create(process);
    return result
}

module.exports = {
    getLatestModifiedProcess,
    saveProcess
}