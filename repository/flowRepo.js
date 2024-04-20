const sequelize = require('../model/init');
const getProcessModel = require("../model/processModel")
const processModel = getProcessModel(sequelize)

const getProcessByIds = async (ids) => {
    const processes = await processModel.findAll({
        where: {
            processInstanceId: ids
        }
    })
    return processes;
}

const getAllProcesses = async () => {
    const allProcesses = await processModel.findAll()
    return allProcesses
}

const updateProcess = async (process) => {
    await processModel.update(
        {...process},
        {
            where: {processInstanceId: process.processInstanceId}
        })
    return true
}

module.exports = {
    getProcessByIds,
    getAllProcesses,
    updateProcess
}
