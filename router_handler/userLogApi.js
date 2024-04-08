const userLogService = require("../service/userLogService")
const biResponse = require("../utils/biResponse")
const dateUtil = require("../utils/dateUtil")
const Joi = require("joi")
const {joiErrorMessages, commonJoiSchemas} = require("../const/joiConst")
const joiUtil = require("../utils/joiUtil")

const getUserLogs = async (req, res, next) => {
    try {
        const {pageIndex, pageSize, userId, startDate, endDate} = req.query
        const validateSchemas = {pageIndex: Joi.required(), pageSize, startDate, endDate}
        joiUtil.validate(validateSchemas)

        const userLogSchema = Joi.object({
            pageIndex: commonJoiSchemas.pageIndex,
            pageSize: commonJoiSchemas.pageSize,
            startDate: commonJoiSchemas.startDate,
            endDate: commonJoiSchemas.endDate
        })
        const error = userLogSchema.validate({pageIndex, pageSize, startDate, endDate}).error

        if (error) {
            const {type, context: {label, key}} = error.details[0]
            const errorMsg = joiErrorMessages[type]
            if (errorMsg) {
                throw new Error(`参数：${key} ${errorMsg}`)
            }
            throw new Error(error.message)
        }

        const data = await userLogService.getUserLogs(pageIndex, pageSize, userId,
            [dateUtil.startOfDay(startDate), dateUtil.endOfDay(endDate)])
        return res.send(biResponse.success(data))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getUserLogs
}