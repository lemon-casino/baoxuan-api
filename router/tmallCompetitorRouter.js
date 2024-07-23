const express = require('express')
const router = express.Router()
const singleItemApi = require('../router_handler/singleItemApi')
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const biResponse = require("@/utils/biResponse");
const uploadDirectory = 'file/excel/tianmao';
const uploadFileName = '天猫竞品表.xlsx';
// 设置存储位置和文件命名
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(uploadDirectory)) {
            fs.mkdirSync(uploadDirectory, { recursive: true });
        }
        cb(null, uploadDirectory);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // 在文件名后添加当前时间戳以避免文件名冲突
    },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single('file'),singleItemApi.uploadSingleIteTaoBaoCompetitorTable)

router.get('/download', (req, res) => {
    const filePath = path.join(uploadDirectory, 'template', uploadFileName);
    if (fs.existsSync(filePath)) {
        res.download(filePath, uploadFileName, (err) => {
            if (err) {
                console.error('文件下载失败:', err);
                res.status(500).send('文件下载失败');
            }
        });
    } else {
        res.status(404).send('文件未找到');
    }
});


module.exports = router;