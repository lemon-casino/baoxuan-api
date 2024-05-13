// log.js
const {createLogger, format, transports} = require("winston");
const path = require("path");
const DailyRotateFile = require("winston-daily-rotate-file")

// 创建日志文件夹如果不存在
const logDirectory = path.join("logs");
const fs = require("fs");
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

const commonOptions = {
    datePattern: 'YYYY-MM-DD',
    prepend: true,
    maxSize: '300m',
    maxFiles: '7d',
}

const logger = createLogger({
    defaultMeta: {service: "bi"},
    transports: [
        new DailyRotateFile({
            ...commonOptions,
            maxFiles: '2d',
            level: "info",
            filename: path.join(`${logDirectory}/info`, `%DATE%.log`),
            format: format.combine(
                format.timestamp({
                    format: "YYYY-MM-DD HH:mm:ss.SSS",
                }),
                format.splat(),
                format.json(),
                format.printf((log) =>
                    log.level === "info" ? JSON.stringify(log) : ""
                )
            )
        }),
        new DailyRotateFile({
            ...commonOptions,
            level: "warn",
            filename: path.join(`${logDirectory}/warn`, `%DATE%.log`),
            format: format.combine(
                format.timestamp({
                    format: "YYYY-MM-DD HH:mm:ss.SSS",
                }),
                format.splat(),
                format.json(),
                format.printf((log) =>
                    log.level === "warn" ? JSON.stringify(log) : ""
                )
            )
        }),
        new DailyRotateFile({
            ...commonOptions,
            level: "error",
            filename: path.join(`${logDirectory}/error`, `%DATE%.log`),
            format: format.combine(
                format.timestamp({
                    format: "YYYY-MM-DD HH:mm:ss.SSS",
                }),
                format.errors({stack: true}),
                format.splat(),
                format.json()
            )
        }),
    ],
});

// 创建一个流对象，morgan会使用它来写入日志到winston
const stream = {
    write: (message) => {
    },
};

// 处理未捕获的异常和未处理的Promise拒绝
process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
})

process.on("unhandledRejection", (reason, promise) => {
    // 检查 `reason` 是否为错误对象，如果是，则获取其堆栈信息；如果不是，直接转换为字符串
    const message = reason instanceof Error ? reason.stack : reason.toString();
    logger.error(`Unhandled Rejection at: ${promise}. Reason: ${message}`);
});
global.logger = logger

module.exports = {logger, stream};
