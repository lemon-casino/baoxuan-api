const dianShangOperationAttributeService = require("../service/dianShangOperationAttributeService")
const joiUtil = require("../utils/joiUtil")
const biResponse = require("../utils/biResponse")
const XLSX = require("xlsx");
const tmallCompetitorService = require("@/service/tmallCompetitorService");

const getPagingOperateAttributes = async (req, res, next) => {
    try {
        const {
            deptId,
            // 前端页码从1开始好处理
            page,
            pageSize,
            goodsName: productLine,
            operator: operatorName,
            goodsId: linkId,
            platform,
            shopName,
            skuId
        } = req.query
        joiUtil.validate({
            page, pageSize,
            deptId: {value: deptId, schema: joiUtil.commonJoiSchemas.required},
            platform: {value: platform, schema: joiUtil.commonJoiSchemas.required}
        })
        const result = await dianShangOperationAttributeService.getPagingOperateAttributes(
            deptId,
            Math.max(parseInt(page) - 1, 0),
            parseInt(pageSize),
            productLine,
            operatorName,
            linkId,
            platform,
            shopName,
            skuId)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getProductAttrDetails = async (req, res, next) => {
    try {
        const {id} = req.query
        joiUtil.validate({id})
        const result = await dianShangOperationAttributeService.getProductAttrDetails(id)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const updateProductAttrDetails = async (req, res, next) => {
    try {
        const body = req.body
        await dianShangOperationAttributeService.updateProductAttrDetails(body)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const saveProductAttrDetails = async (req, res, next) => {
    try {
        const body = req.body
        await dianShangOperationAttributeService.saveProductAttr(body)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const deleteProductAttr = async (req, res, next) => {
    try {
        const {id} = req.query
        joiUtil.validate({id})
        await dianShangOperationAttributeService.deleteProductAttr(id)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const uploadTable = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.send(biResponse.canTFindIt('没有上传文件！'));
        }

        // 读取Excel文件
        const filePath = req.file.path;
        const workbook = XLSX.readFile(filePath);

        function excelDateToJSDate(excelDate) {
            const date = new Date(1900, 0, excelDate);
            return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }

        // Required fields mapping
        const requiredKeyMapping = {
            '商品简称': 'briefName',
            'skuId': 'skuId',
            '编码': 'code',
            '商品属性': 'linkAttribute',
            '开发负责人': 'exploitDirector',
            '运营负责人': 'operator',
            '维护负责人': 'maintenanceLeader',
            '成本价': 'costPrice',
            '供货价': 'supplyPrice',
            '上架日期': 'onsaleDate',
            '坑产目标': 'pitTarget',
            '一级类目': 'firstCategory',
            '二级类目': 'secondCategory',
            '三级类目': 'level3Category'
        };

        // Optional fields mapping
        const optionalKeyMapping = {
            '自定义1': 'userDef1',
            '自定义2': 'userDef2',
            '自定义3': 'userDef3',
            '自定义4': 'userDef4',
            '自定义5': 'userDef5',
            '自定义6': 'userDef6',
            '自定义7': 'userDef7',
            '自定义8': 'userDef8',
            '自定义9': 'userDef9',
            '自定义10': 'userDef10'
        };

        // 循环遍历每个工作表
        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];

            // 使用sheet_to_json并可选择保留原始行号
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

            // 数据提取标题（第一行）
            const headers = data[0];

            //循环遍历每行数据（从第二行开始）
            const translatedData = [];
            for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
                const row = data[rowIndex];
                const translatedItem = {};

                // 检查必填字段
                for (const [key, value] of Object.entries(requiredKeyMapping)) {
                    const columnIndex = headers.indexOf(key);

                    if (columnIndex === -1 || row[columnIndex] === '') {
                        // 如果缺少必填字段，则返回包含行和列信息的错误
                        return res.send(biResponse.canTFindIt(`缺少必填字段: ${key} 在第${rowIndex + 1}行, 第${columnIndex + 1}列`));
                    } else {
                        if (key === '上架日期') {
                            translatedItem[value] = excelDateToJSDate(row[columnIndex]); // 将 Excel 日期转换为 JS 日期
                        } else {
                            translatedItem[value] = row[columnIndex];
                        }
                    }
                }

                // 添加可选字段（如果存在）
                for (const [key, value] of Object.entries(optionalKeyMapping)) {
                    const columnIndex = headers.indexOf(key);
                    if (columnIndex !== -1 && row[columnIndex] !== '') {
                        translatedItem[value] = row[columnIndex];
                    }
                }

                //translatedItem['headOfProductLine'] = sheetName;
                translatedData.push(translatedItem);
            }

            console.log(translatedData);

             await dianShangOperationAttributeService.uploadBulkUploadsTable(translatedData)
                 .then(() => {
                     console.log(`Sheet ${sheetName} uploaded successfully`);
                 })
                 .catch((e) => {
                     return res.send(biResponse.canTFindIt('文件解析失败', e));
                 });
        }

        return res.send(biResponse.success({ code: 200, data: "文件上传并解析成功!" }));
    } catch (e) {
        next(e);
    }
};


module.exports = {
    getPagingOperateAttributes,
    getProductAttrDetails,
    saveProductAttrDetails,
    updateProductAttrDetails,
    deleteProductAttr,
    uploadTable
}