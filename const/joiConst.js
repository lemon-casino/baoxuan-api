const Joi = require("joi")

const joiErrorMessages = {
    "any.required": "不能为空",
    "any.empty": "不能为空",
    "date.base": "日期格式不正确"
}

const commonJoiSchemas = {
    id: Joi.required(),
    pageIndex: Joi.string().alphanum().required(),
    pageSize: Joi.string().alphanum().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required()
}

module.exports = {
    joiErrorMessages,
    commonJoiSchemas
}