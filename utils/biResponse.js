const format = (code, message, data) => {
    return {code, message, data}
}

const success = (data) => {
    return format(200, "成功", data)
}

const serverError = () => {
    return format(500, "服务器异常")
}

module.exports = {
    format,
    success,
    serverError
}