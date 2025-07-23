const express = require('express')
const router = express.Router()
const dianShangOperationAttributeApi = require('../router_handler/dianShangOperationAttributeApi')
const {createUploader} = require("@/utils/uploadUtils");
const competitorApi = require("@/router_handler/competitorApi");
const path = require("path");
const fs = require("fs");

router.get("/", dianShangOperationAttributeApi.getPagingOperateAttributes)
router.post("/", dianShangOperationAttributeApi.saveProductAttrDetails)
router.put("/", dianShangOperationAttributeApi.updateProductAttrDetails)
router.delete("/", dianShangOperationAttributeApi.deleteProductAttr)
router.get("/shopname", dianShangOperationAttributeApi.getShopNameAttrDetails)
const uploadDirectory = 'file/excel/causality';
const uploadFileName = '商品属性维护.xlsx';
// 设置存储位置和文件命名
// 使用公共模块创建上传实例
const upload = createUploader(uploadDirectory);

router.post("/upload", upload.single('file'),dianShangOperationAttributeApi.uploadTable)
router.post("/upload-tm", upload.single('file'),dianShangOperationAttributeApi.uploadtmTable)
router.post("/upload-pdd", upload.single('file'),dianShangOperationAttributeApi.uploadpddTable)

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

// 链接月度销售目标导入
router.post('/goods-monthly-sales-target/import', dianShangOperationAttributeApi.importGoodsMonthlySalesTarget)
router.get('/goods-monthly-sales-target', dianShangOperationAttributeApi.getGoodsMonthlySalesTarget)
router.post('/goods-monthly-sales-target/export', dianShangOperationAttributeApi.exportGoodsMonthlySalesTarget)
router.post('/goods-monthly-sales-update',dianShangOperationAttributeApi.updatetGoodsMonthlySalesTarget)
module.exports = router