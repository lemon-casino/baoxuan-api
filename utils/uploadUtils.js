// uploadUtils.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 默认的上传目录
const defaultUploadDirectory = 'file/excel/tianmao';

// 文件存储配置函数
const createMulterStorage = (uploadDirectory = defaultUploadDirectory) => {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            // 检查并创建目标文件夹
            const logsPath = path.join(uploadDirectory, 'logs');
            if (!fs.existsSync(logsPath)) {
                fs.mkdirSync(logsPath, { recursive: true });
            }
            cb(null, logsPath);
        },
        filename: function (req, file, cb) {
            // 使用时间戳避免文件名冲突
            cb(null, Date.now() + path.extname(file.originalname));
        },
    });
};

// 创建上传实例
const createUploader = (uploadDirectory = defaultUploadDirectory) => {
    const storage = createMulterStorage(uploadDirectory);
    return multer({ storage: storage });
};

module.exports = {
    createUploader
};
