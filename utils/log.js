// log.js
const { createLogger, format, transports } = require("winston");
const path = require("path");

// 创建日志文件夹如果不存在
const logDirectory = path.join("logs");
const fs = require("fs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }), // 以便记录错误堆栈
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "your-service-name" },
  transports: [
    //
    // - 将所有日志写入 'combined.log'
    // - 将所有错误写入 'error.log'
    //
    new transports.File({
      filename: path.join(logDirectory, "error.log"),
      level: "error",
    }),
    new transports.File({ filename: path.join(logDirectory, "access.log") }),
  ],
});

// 创建一个流对象，morgan会使用它来写入日志到winston
const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// 处理未捕获的异常和未处理的Promise拒绝
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  // 检查 `reason` 是否为错误对象，如果是，则获取其堆栈信息；如果不是，直接转换为字符串
  const message = reason instanceof Error ? reason.stack : reason.toString();
  logger.error(`Unhandled Rejection at: ${promise}. Reason: ${message}`);
});
module.exports = { logger, stream };
