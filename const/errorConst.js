const errorMessages = {
    "common": "服务器处理异常",
    "notFound": "未找到您要的资源",
    "forbidden": "拒绝使用",
    "unauthorized": "身份认证失败",
    "createFailed": "数据添加失败"
}

const errorCodes = {
    "commonError": 500,
    "parameterError": 510,
    "forbiddenError": 511,
    "userError": 520,
    "notFound": 530, // http 先关的
    "sqlError": 590,
    "remoteError": 600 // 调用钉钉接口异常返回的错误码
}

const errorNames = {}

module.exports = {
    errorCodes,
    errorMessages
}