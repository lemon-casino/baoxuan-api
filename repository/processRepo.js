const Sequelize = require('sequelize')
const sequelize = require('../model/init');
const getProcessModel = require("../model/processModel")
const processModel = getProcessModel(sequelize)
const {logger} = require("../utils/log")

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

/**
 * 将流程表中data和overallprocessflow为字符串的数据改为json
 * @returns {Promise<void>}
 */
const correctStrFieldToJson = async () => {
    // 修正流程表中data、overallprocessflow 字符串为json
    try {
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
    } catch (e) {
        logger.error(e.message)
        throw new Error(e.message)
    }

}

module.exports = {
    getLatestModifiedProcess,
    saveProcess,
    correctStrFieldToJson
}