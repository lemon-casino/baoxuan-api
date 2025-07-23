const dianShangOperationAttributeService = require("../service/dianShangOperationAttributeService")
const joiUtil = require("../utils/joiUtil")
const biResponse = require("../utils/biResponse")
const XLSX = require("xlsx")
const moment = require('moment')
const tmallCompetitorService = require("@/service/tmallCompetitorService")
const ExcelJS = require('exceljs')
const formidable = require("formidable")
const fs = require('fs')
const goodsMonthlySalesTargetService = require("../service/goodsMonthlySalesTargetService")

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
            skuId,
            code
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
            skuId,
            code)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getShopNameAttrDetails = async (req, res, next) => {
    try {
        const {id} = req.query
        joiUtil.validate({id})
        const result = await dianShangOperationAttributeService.getShopNameAttrDetails(id)
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
        if (body.goodsId !== undefined && body.goodsId !== null) {
            body.goodsId = body.goodsId.trim()
        } else {
            body.skuId = body.skuId.trim()
        }
        const result = await dianShangOperationAttributeService.getProductAttrDetails(body.id)
        await dianShangOperationAttributeService.updateProductAttrDetails(body)
        const userId = req.user.userId
        const user = req.user.id
        const username = req.user.username
        const currentTime = moment(req._startTime).format('YYYY-MM-DD HH:mm:ss')
        const type='updete'
        await dianShangOperationAttributeService.saveupdatelog(result,body,userId,user,username,currentTime,type)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const saveProductAttrDetails = async (req, res, next) => {
    try {
        const body = req.body
        if (body.goodsId !== undefined && body.goodsId !== null) {
            body.goodsId = body.goodsId.trim()
        } else {
            body.skuId = body.skuId.trim()
        }
        await dianShangOperationAttributeService.saveProductAttr(body)
        const userId = req.user.userId
        const user = req.user.id
        const username = req.user.username
        const currentTime = moment(req._startTime).format('YYYY-MM-DD HH:mm:ss')
        const type='insert'
        const old = null
        const jsonString = JSON.stringify(body);
        await dianShangOperationAttributeService.savelog(old,jsonString,userId,user,username,currentTime,type)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const deleteProductAttr = async (req, res, next) => {
    try {
        const {id} = req.query
        joiUtil.validate({id})
        const result = await dianShangOperationAttributeService.getProductAttrDetails(id)
        const userId = req.user.userId
        const user = req.user.id
        const username = req.user.username
        const currentTime = moment(req._startTime).format('YYYY-MM-DD HH:mm:ss')
        const type='delete'
        const old = JSON.stringify(result)
        await dianShangOperationAttributeService.savelog(old,id,userId,user,username,currentTime,type)
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

        // Excel日期转换函数
        function excelDateToJSDate(excelDate) {
            if (typeof excelDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(excelDate)) {
                return excelDate;
            }
            if (typeof excelDate !== 'number' || isNaN(excelDate)) {
                console.error(`Invalid excelDate value: ${excelDate}`);
                return '';
            }
            const excelEpochOffset = 25567;
            const jsTimestamp = (excelDate - excelEpochOffset) * 86400 * 1000;
            const date = new Date(jsTimestamp);
            if (isNaN(date.getTime())) {
                console.error(`Invalid JS Date generated from excelDate: ${excelDate}`);
                return '';
            }
            return date.toISOString().split('T')[0];
        }

        // 必填字段映射
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
            '三级类目': 'level3Category',
            '产品线简称': 'briefProductLine'
        };

        // 可选字段映射
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

        // 错误收集数组
        let errorMessages = [];

        // 循环遍历每个工作表
        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];

            if (sheetName !== '自营') {
                errorMessages.push(`目前只支持京东自营 后续批量添加与新增 会在工作流审核处理后续 将关闭修改 ,删除 ,新增功能`);
                continue; // 继续处理下一个工作表
            }

            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
            const headers = data[0]; // 标题行
            const translatedData = [];

            // 循环遍历每行数据（从第二行开始）
            for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
                const row = data[rowIndex];
                const translatedItem = {};

                // 检查必填字段
                for (const [key, value] of Object.entries(requiredKeyMapping)) {
                    const columnIndex = headers.indexOf(key);

                    if (columnIndex === -1 || row[columnIndex] === '') {
                        errorMessages.push(`缺少必填字段: ${key} 在第${rowIndex + 1}行, 第${columnIndex + 1}列`);
                        continue; // 继续处理下一行
                    } else {
                        if (key === 'skuId') {
                            translatedItem[value] = parseInt(row[columnIndex]);
                        } else if (key === '上架日期') {
                            translatedItem[value] = excelDateToJSDate(row[columnIndex]);
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

                translatedItem['deptId'] = 902897720;
                translatedItem['platform'] = sheetName;
                translatedData.push(translatedItem);
            }

            // 上传数据，使用 Promise.all 等待所有上传完成
            try {
                await dianShangOperationAttributeService.uploadBulkUploadsTable(translatedData);
                console.log(`Sheet ${sheetName} uploaded successfully`);
            } catch (e) {
                errorMessages.push(`文件解析失败: ${e.message}`);
            }
        }

        // 如果有错误，返回错误信息
        if (errorMessages.length > 0) {
            return res.send(biResponse.canTFindIt(errorMessages.join('; ')));
        }

        // 所有操作成功后，返回成功响应
        return res.send(biResponse.success({ code: 200, data: "文件上传并解析成功!" }));

    } catch (e) {
        next(e);
    }
};

const uploadtmTable = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.send(biResponse.canTFindIt('没有上传文件！'));
        }

        // 读取Excel文件
        const filePath = req.file.path;
        const workbook = XLSX.readFile(filePath);

        // Excel日期转换函数
        function excelDateToJSDate(excelDate) {
            if (typeof excelDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(excelDate)) {
                return excelDate;
            }
            if (typeof excelDate !== 'number' || isNaN(excelDate)) {
                console.error(`Invalid excelDate value: ${excelDate}`);
                return '';
            }
            const excelEpochOffset = 25567;
            const jsTimestamp = (excelDate - excelEpochOffset) * 86400 * 1000;
            const date = new Date(jsTimestamp);
            if (isNaN(date.getTime())) {
                console.error(`Invalid JS Date generated from excelDate: ${excelDate}`);
                return '';
            }
            return date.toISOString().split('T')[0];
        }

        // 必填字段映射
        const requiredKeyMapping = {
            '链接ID':'goodsId',
            '店铺名称':'shopName',
            '链接属性':'linkAttribute',
            '产品线':'goodsName',
            '商品简称':'briefName',
            '产品线负责人':'lineDirector',
            '运营负责人':'operator',
            '开发负责人':'exploitDirector',
            '采购负责人':'purchaseDirector',
            '访客数目标':'targets',
            '手淘搜索目标':'searchTarget',
            '单日坑产目标':'pitTarget',
            '上架日期':'onsaleDate',
            '产品线简称':'briefProductLine',
            '产品定义':'productDefinition',
            '产品等级':'productRank',
            '季节':'seasons',
            '一级类目':'firstCategory',
            '二级类目':'secondCategory',
            '转正天数':'userDef4',
            '链接定义':'userDef5',

        };

        // 可选字段映射
        const optionalKeyMapping = {
            '链接属性2':'importantAttribute',
            '维护负责人':'maintenanceLeader',
            '利润目标':'profitTarget',
            '产品线1':'goodsLine1',
            '产品线2':'goodsLine2',
            '链接类型':'userDef1',
            '实时状态':'userDef2',
            '自定义3':'userDef3',
            '自定义6':'userDef6',
            '自定义7':'userDef7',
            '自定义8':'userDef8',
            '自定义9':'userDef9',
            '自定义10':'userDef10',
            '库存结构':'stockStructure',
            '产品设计属性':'productDesignAttr',
            '品牌':'brand',
            '产品线管理人':'lineManager',
            '款式编码(参考)':'code'

        };

        // 错误收集数组
        let errorMessages = [];

        // 循环遍历每个工作表
        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];

            if (sheetName !== '天猫部') {
                errorMessages.push(`目前只支持京东自营,天猫 后续批量添加与新增 会在工作流审核处理后续 将关闭修改 ,删除 ,新增功能`);
                continue; // 继续处理下一个工作表
            }

            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
            const headers = data[0]; // 标题行
            const translatedData = [];

            // 循环遍历每行数据（从第二行开始）
            for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
                const row = data[rowIndex];
                const translatedItem = {};

                // 检查必填字段
                for (const [key, value] of Object.entries(requiredKeyMapping)) {
                    const columnIndex = headers.indexOf(key);

                    if (columnIndex === -1 || row[columnIndex] === '') {
                        errorMessages.push(`缺少必填字段: ${key} 在第${rowIndex + 1}行, 第${columnIndex + 1}列`);
                        continue; // 继续处理下一行
                    } else {
                        if (key === 'goodsID') {
                            translatedItem[value] = parseInt(row[columnIndex]);
                        } else if (key === '上架日期') {
                            translatedItem[value] = excelDateToJSDate(row[columnIndex]);
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

                translatedItem['deptId'] = 903075138;
                translatedItem['platform'] = sheetName;
                translatedData.push(translatedItem);
            }

            // 上传数据，使用 Promise.all 等待所有上传完成
            try {
                await dianShangOperationAttributeService.uploadtmBulkUploadsTable(translatedData);
                console.log(`Sheet ${sheetName} uploaded successfully`);
            } catch (e) {
                errorMessages.push(`文件解析失败: ${e.message}`);
            }
        }

        // 如果有错误，返回错误信息
        if (errorMessages.length > 0) {
            return res.send(biResponse.canTFindIt(errorMessages.join('; ')));
        }

        // 所有操作成功后，返回成功响应
        return res.send(biResponse.success({ code: 200, data: "文件上传并解析成功!" }));

    } catch (e) {
        next(e);
    }
}

const uploadpddTable = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.send(biResponse.canTFindIt('没有上传文件！'));
        }

        // 读取Excel文件
        const filePath = req.file.path;
        const workbook = XLSX.readFile(filePath);

        // Excel日期转换函数
        function excelDateToJSDate(excelDate) {
            if (typeof excelDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(excelDate)) {
                return excelDate;
            }
            if (typeof excelDate !== 'number' || isNaN(excelDate)) {
                console.error(`Invalid excelDate value: ${excelDate}`);
                return '';
            }
            const excelEpochOffset = 25569;
            const jsTimestamp = (excelDate - excelEpochOffset) * 86400 * 1000;
            const date = new Date(jsTimestamp);
            if (isNaN(date.getTime())) {
                console.error(`Invalid JS Date generated from excelDate: ${excelDate}`);
                return '';
            }
            return date.toISOString().split('T')[0];
        }

        // 必填字段映射
        const requiredKeyMapping = {
            '链接ID':'goodsId',
            '店铺名称':'shopName',
            '商品简称':'briefName',
            '产品线负责人':'lineDirector',
            '运营负责人':'operator',
            '上架日期':'onsaleDate',
            '一级类目':'firstCategory',
            '二级类目':'secondCategory'

        };

        // 可选字段映射
        const optionalKeyMapping = {
            '链接属性2':'importantAttribute',
            '维护负责人':'maintenanceLeader',
            '利润目标':'profitTarget',
            '产品线1':'goodsLine1',
            '产品线2':'goodsLine2',
            '链接类型':'userDef1',
            '实时状态':'userDef2',
            '自定义3':'userDef3',
            '自定义4':'userDef4',
            '自定义5':'userDef5',
            '自定义6':'userDef6',
            '自定义7':'userDef7',
            '自定义8':'userDef8',
            '自定义9':'userDef9',
            '自定义10':'userDef10',
            '库存结构':'stockStructure',
            '产品设计属性':'productDesignAttr',
            '品牌':'brand',
            '产品线管理人':'lineManager',
            '款式编码(参考)':'code'

        };

        // 错误收集数组
        let errorMessages = [];

        // 循环遍历每个工作表
        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];

            if (sheetName !== '拼多多部') {
                errorMessages.push(`sheet名请换成平台（拼多多部）`);
                continue; // 继续处理下一个工作表
            }

            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
            const headers = data[0]; // 标题行
            const translatedData = [];

            // 循环遍历每行数据（从第二行开始）
            for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
                const row = data[rowIndex];
                const translatedItem = {};

                // 检查必填字段
                for (const [key, value] of Object.entries(requiredKeyMapping)) {
                    const columnIndex = headers.indexOf(key);

                    if (columnIndex === -1 || row[columnIndex] === '') {
                        errorMessages.push(`缺少必填字段: ${key} 在第${rowIndex + 1}行, 第${columnIndex + 1}列`);
                        continue; // 继续处理下一行
                    } else {
                        if (key === 'goodsID') {
                            translatedItem[value] = parseInt(row[columnIndex]);
                        } else if (key === '上架日期') {
                            translatedItem[value] = excelDateToJSDate(row[columnIndex]);
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

                translatedItem['deptId'] = 902768824;
                translatedItem['platform'] = sheetName;
                translatedData.push(translatedItem);
            }

            // 上传数据，使用 Promise.all 等待所有上传完成
            try {
                await dianShangOperationAttributeService.uploadtmBulkUploadsTable(translatedData);
                console.log(`Sheet ${sheetName} uploaded successfully`);
            } catch (e) {
                errorMessages.push(`文件解析失败: ${e.message}`);
            }
        }

        // 如果有错误，返回错误信息
        if (errorMessages.length > 0) {
            return res.send(biResponse.canTFindIt(errorMessages.join('; ')));
        }

        // 所有操作成功后，返回成功响应
        return res.send(biResponse.success({ code: 200, data: "文件上传并解析成功!" }));

    } catch (e) {
        next(e);
    }
}

const importGoodsMonthlySalesTarget = async (req, res, next) => {
    try {
        let form = new formidable.IncomingForm()
        form.uploadDir = "./public/excel"
        fs.mkdirSync(form.uploadDir, { recursive: true })
        form.keepExtensions = true
        form.parse(req, async function (error, fields, files) {
            if (error) {
                return res.send(biResponse.canTFindIt)
            }
            
            const file = files.file
            const newPath = `${form.uploadDir}/${moment().valueOf()}-${file.originalFilename}`
            fs.renameSync(file.filepath, newPath, (err) => {  
                if (err) throw err
            })
            const workbook = new ExcelJS.Workbook()
            let readRes = await workbook.xlsx.readFile(newPath)
            if (readRes) {
                const worksheet = workbook.getWorksheet(1)
                let rows = worksheet.getRows(1, worksheet.rowCount)
                let result = await goodsMonthlySalesTargetService.import(rows)
                if (result) {
                    fs.rmSync(newPath)
                } else {
                    return res.send(biResponse.createFailed())
                }
            }
            return res.send(biResponse.success({ code: 200, data: "文件上传并解析成功!" }))
        })
    } catch (e) {
        next(e)
    }
}

const updatetGoodsMonthlySalesTarget = async (req, res, next) => {
    try {
        const {goods_id,month,amount} = req.query
        joiUtil.validate({
            goods_id: {value: goods_id, schema: joiUtil.commonJoiSchemas.strNumRequired},
            month: {value: month, schema: joiUtil.commonJoiSchemas.strNumRequired},
            amount: {value: amount, schema: joiUtil.commonJoiSchemas.strNumRequired}
        })
        const result = await goodsMonthlySalesTargetService.goodsUpdate (goods_id,month,amount)
        if (result) return res.send(biResponse.success(result))
        return res.send(biResponse.createFailed())
    } catch (e) {
        next(e)
    }
}

const getGoodsMonthlySalesTarget = async (req, res, next) => {
    try {
        const {goods_id, currentPage, pageSize} = req.query
        joiUtil.validate({
            goods_id: {value: goods_id, schema: joiUtil.commonJoiSchemas.strNumRequired},
            currentPage: {value: currentPage, schema: joiUtil.commonJoiSchemas.strRequired},
            pageSize: {value: pageSize, schema: joiUtil.commonJoiSchemas.strRequired}
        })
        const result = await goodsMonthlySalesTargetService.get(req.query)
        if (result) return res.send(biResponse.success(result))
        return res.send(biResponse.createFailed())
    } catch (e) {
        next(e)
    }
}

const exportGoodsMonthlySalesTarget = async (req, res, next) => {
    try {
        const {startDate, endDate, department} = req.body
        joiUtil.validate({
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.strRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.strRequired},
            department: {value: department, schema: joiUtil.commonJoiSchemas.numberRequired},
        })
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet(`销售目标`)
        worksheet.columns = [
            { header: '链接ID', key: 'goods_id', isDefault: true },
            { header: '产品简称', key: 'brief_name', isDefault: true }, 
            { header: '产品线简称', key: 'brief_product_line', isDefault: true },
            { header: '运营负责人', key: 'operator', isDefault: true },
            { header: '月份', key: 'month', isDefault: true },
            { header: '销售目标', key: 'amount', isDefault: true }
        ]
        let data = await goodsMonthlySalesTargetService.getByDate({startDate, endDate, department})

        for (let i = 0; i < data.length; i++) {
            worksheet.addRow({...data[i]})
        }

        const buffer = await workbook.xlsx.writeBuffer()
        res.setHeader('Content-Disposition', `attachment; filename="goods-monthly-sales-target.xlsx"`)
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')        
        return res.send(buffer)
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getPagingOperateAttributes,
    getProductAttrDetails,
    getShopNameAttrDetails,
    saveProductAttrDetails,
    updateProductAttrDetails,
    deleteProductAttr,
    uploadTable,
    uploadtmTable,
    uploadpddTable,
    importGoodsMonthlySalesTarget,
    getGoodsMonthlySalesTarget,
    exportGoodsMonthlySalesTarget,
    updatetGoodsMonthlySalesTarget
}