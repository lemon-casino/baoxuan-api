const express = require('express')
const router = express.Router()
const competitorApi = require('../router_handler/competitorApi')
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const biResponse = require("@/utils/biResponse");
const {createUploader} = require("@/utils/uploadUtils");
const uploadDirectory = 'file/excel/tianmao';
const uploadFileName = '天猫竞品表.xlsx';
// 设置存储位置和文件命名
// 使用公共模块创建上传实例
const upload = createUploader(uploadDirectory);

router.post("/upload", upload.single('file'),competitorApi.uploadSingleIteTaoBaoCompetitorTable)

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

// 查询天猫竞品表

router.get("/search",competitorApi.searchSingleIteTaoBaoCompetitorTable)
router.get("/conditionalFiltering",competitorApi.conditionalFiltering)
module.exports = router;