const Joi = require("joi")
const {commonJoiSchemas, joiErrorMessages} = require("../const/joiConst")

const validate = (items) => {
    // schema查找优先级： 自定义-common-无
    let tmpSchemas = {}
    for (const key of Object.keys(items)) {
        // 使用自定义的校验规则
        if ((items[key]) instanceof String) {
            tmpSchemas = {...tmpSchemas, ...key}
            continue
        }
        // 查找通用的校验规则
        for (const commonKey of Object.keys(commonJoiSchemas)) {
            if (commonKey === key) {
                tmpSchemas[key] = commonJoiSchemas[commonKey]
                continue
            }
        }
    }

    const schemas = Joi.object(tmpSchemas)
    const error = schemas.validate(schemas).error

    if (error) {
        const {type, context: {label, key}} = error.details[0]
        const errorMsg = joiErrorMessages[type]
        if (errorMsg) {
            throw new Error(`参数：${key} ${errorMsg}`)
        }
        throw new Error(error.message)
    }
}

module.exports = {
    validate
}