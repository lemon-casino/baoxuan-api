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

module.exports = {
    getProcessByIds
}
