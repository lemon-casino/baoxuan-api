const Joi = require("joi")

const joiErrorMessages = {
    "any.required": "为必传参数",
    "any.empty": "内容不能为空",
    "string.empty": "内容不能为空",
    "string.alphanum": "必须为0或正整数",
    "date.base": "日期格式不正确"
}

const commonJoiSchemas = {
    id: Joi.required(),
    pageIndex: Joi.string().alphanum().min(0).required(),
    pageSize: Joi.string().alphanum().min(1).required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required()
}

module.exports = {
    joiErrorMessages,
    commonJoiSchemas
}