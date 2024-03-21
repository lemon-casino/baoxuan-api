const processRepo = require("../repository/processRepo")


const getLatestModifiedProcess = async () => {
    return await processRepo.getLatestModifiedProcess();
}

const saveProcess = async (process) => {
    return await processRepo.saveProcess(process)
}

module.exports = {
    getLatestModifiedProcess,
    saveProcess
}