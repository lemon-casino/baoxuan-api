const sequelize = require('@/model/init');
const getWorkingDayModel = require("@/model/workingDayModel")
const workingDayModel = getWorkingDayModel(sequelize)
const sequelizeUtil = require("@/utils/sequelizeUtil")

/**
 * 某天是否是工作日
 * @param date
 * @returns {Promise<boolean>}
 */
const isWorkingDayOf = async (date) => {
    const result = await workingDayModel.findAll({
        where: {workingDate: date}
    })
    return sequelizeUtil.extractDataValues(result).length > 0
}

/**
 * 保存工作日日期数据
 * @param date
 * @returns {Promise<*>}
 */
const saveWorkingDay = async (date) => {
    const result = await workingDayModel.create({
        workingDate: date
    })
    return sequelizeUtil.extractDataValues(result)
}

/**
 * 获取指定范围内的日期数据
 * @param startDate
 * @param endDate
 * @returns {Promise<*>}
 */
const getWorkingDayByRange = async (startDate, endDate) => {
    const where = {}
    if (startDate) {
        where.workingDay = {$gte: startDate}
    }
    if (endDate) {
        where.workingDay = {$lte: endDate}
    }
    const result = await workingDayModel.findAll({where})
    return sequelizeUtil.extractDataValues(result)
}


module.exports = {
    saveWorkingDay,
    getWorkingDayByRange,
    isWorkingDayOf
}