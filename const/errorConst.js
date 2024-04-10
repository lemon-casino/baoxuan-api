const errorMessages = {
    "common": "服务器处理异常",
    "notFound": "未找到您要的资源",
    "unauthorized": "身份认证失败"
}

const errorCodes = {
    "commonError": 500,
    "parameterError": 510,
    "userError": 520,
    "notFound": 530, // http 先关的
    "sqlError": 590,
}

const errorNames = {

}

module.exports = {
    errorCodes,
    errorMessages
}