const Joi = require("joi")
const ParameterError = require("../error/parameterError")

const joiErrorMessages = {
    "any.required": "为必传参数",
    "any.empty": "内容不能为空",
    "string.empty": "内容不能为空",
    "string.alphanum": "必须为0或正整数",
    "date.base": "日期格式不正确"
}

const commonJoiSchemas = {
    required: Joi.required(),
    strRequired: Joi.string().required(),
    numberRequired: Joi.number().min(0).required(),
    dateRequired: Joi.date().required(),
    arrayRequired: Joi.array().required(),
    funcRequired: Joi.func().required()
}

const commonArgsSchemas = {
    id: commonJoiSchemas.required,
    page: commonJoiSchemas.numberRequired,
    pageIndex: commonJoiSchemas.numberRequired,
    pageSize: Joi.string().alphanum().min(1).required(),
    startDate: commonJoiSchemas.dateRequired,
    endDate: commonJoiSchemas.dateRequired
}

/**
 *
 * @param items {}
 */
const validate = (items) => {
    // schema查找优先级： 自定义-commonRepo.js-无
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
        for (const commonArg of Object.keys(commonArgsSchemas)) {
            if (commonArg === key) {
                hasCommonSchema = true
                tmpSchemas[key] = commonArgsSchemas[commonArg]
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
        throw new ParameterError(`${error.message}(${type})`)
    }
}

module.exports = {
    validate,
    commonJoiSchemas
}