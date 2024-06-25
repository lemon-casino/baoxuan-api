const _ = require("lodash")
const Joi = require("joi")
const ParameterError = require("../error/parameterError")

const joiErrorMessages = {
    "any.required": "为必传参数",
    "any.empty": "内容不能为空",
    "string.empty": "内容不能为空",
    "string.alphanum": "必须为0或正整数",
    "date.base": "日期格式不正确",
    "number.min": (min) => {
        return `不能小于${min}`
    }
}

const commonJoiSchemas = {
    required: Joi.required(),
    strRequired: Joi.string().required(),
    positiveIntegerRequired: Joi.number().min(1).required(),
    numberRequired: Joi.number().min(0).required(),
    dateRequired: Joi.date().required(),
    arrayRequired: Joi.array().required(),
    funcRequired: Joi.func().required()
}

const commonArgsSchemas = {
    id: commonJoiSchemas.required,
    page: commonJoiSchemas.positiveIntegerRequired,
    pageIndex: commonJoiSchemas.numberRequired,
    pageSize: commonJoiSchemas.positiveIntegerRequired,
    startDate: commonJoiSchemas.dateRequired,
    endDate: commonJoiSchemas.dateRequired
}

const clarityValidate = (schema, data) => {
    _validate(schema, data)
}

/**
 *
 * @param items {}
 */
const mixedValidate = (items) => {
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
    _validate(tmpSchemas, tmpValues)
}

const _validate = (schema, data) => {
    const error = Joi.object(schema).validate(data).error
    if (error) {
        const {type, context: {label, key, limit, value}} = error.details[0]
        let errorMsg = joiErrorMessages[type]
        if (errorMsg) {
            if (_.isFunction(errorMsg)) {
                errorMsg = errorMsg(limit)
            }

            throw new ParameterError(`参数：${key} ${errorMsg}`)
        }
        throw new ParameterError(`${error.message}(${type})`)
    }
}

module.exports = {
    clarityValidate,
    validate: mixedValidate,
    commonJoiSchemas
}