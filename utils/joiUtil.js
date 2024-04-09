const Joi = require("joi")
const ParameterError = require("../error/parameterError")
const {commonJoiSchemas, joiErrorMessages} = require("../const/joiConst")

const validate = (items) => {
    // schema查找优先级： 自定义-common-无
    let tmpSchemas = {}
    let tmpValues = {}
    for (const key of Object.keys(items)) {
        // 使用自定义的校验规则
        const item = items[key]
        if (item && item.schema && Joi.isSchema(item.schema)) {
            tmpSchemas = {
                ...tmpSchemas,
                [key]: item.schema
            }
            tmpValues = {
                ...tmpValues,
                [key]: item.value
            }
            continue
        }
        // 查找通用的校验规则
        let hasCommonSchema = false
        for (const commonKey of Object.keys(commonJoiSchemas)) {
            if (commonKey === key) {
                hasCommonSchema = true
                tmpSchemas[key] = commonJoiSchemas[commonKey]
                break
            }
        }
        if (hasCommonSchema) {
            tmpValues = {
                ...tmpValues,
                [key]: item
            }
        }
    }

    const schemas = Joi.object(tmpSchemas)
    const error = schemas.validate(tmpValues).error

    if (error) {
        const {type, context: {label, key}} = error.details[0]
        const errorMsg = joiErrorMessages[type]
        if (errorMsg) {
            throw new ParameterError(`参数：${key} ${errorMsg}`)
        }
        throw new ParameterError(error.message)
    }
}

module.exports = {
    validate
}