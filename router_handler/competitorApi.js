const tmallCompetitorService = require('../service/tmallCompetitorService')
const biResponse = require("../utils/biResponse")
const XLSX = require('xlsx');
const {canTFindIt} = require("@/utils/biResponse");



const uploadSingleIteTaoBaoCompetitorTable = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.send(biResponse.canTFindIt('没有上传文件！'));
        }

        // 读取Excel文件
        const filePath = req.file.path;
        const workbook = XLSX.readFile(filePath);

        function excelDateToJSDate(excelDate) {
            const date = new Date(1900, 0, excelDate - 1); // Excel date base is 1900-01-01
            return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }
        const keyMapping = {
            '链接ID': 'linkId',
            '维护人': 'headOfOperations',
            '店铺名称': 'storeName',
            '产品名称': 'productName',
            '竞品ID': 'competitorId',
            '类别': 'category',
            '日期': 'date',
            '搜索': 'search',
            '搜索人数': 'numberSearches',
        };
        //循环读取每个sheet
        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);

            const translatedData = data
                .filter(item => typeof item['链接ID'] === 'number' && !isNaN(item['链接ID'])) //  过滤掉链接ID不是数字的数据
                .map(item => {
                    const translatedItem = {};
                    for (const [key, value] of Object.entries(keyMapping)) {
                        if (item[key] !== undefined) {
                            if (key === '日期') {
                                translatedItem[value] = excelDateToJSDate(item[key]); // Convert Excel date to JS date
                            }
                            else if (key === '搜索') {
                                translatedItem[value] = (item[key] === '' || isNaN(item[key])) ? 0 : parseFloat(item[key]); // Validate and set default for search
                            }
                            else {
                                translatedItem[value] = item[key];
                            }
                        }
                    }
                    translatedItem['headOfProductLine'] = sheetName;
                    return translatedItem;
                });
            await tmallCompetitorService.uploadSingleIteTaoBaoCompetitorTable(translatedData).then(() => {
                console.log(`Sheet ${sheetName} uploaded successfully`);
            }).catch((e) => {
                    return res.send(canTFindIt.success('文件解析失败',e ))
            }
            );
        }

        return res.send(biResponse.success({code:200,data:"文件上传并解析成功!"}))
    } catch (e) {
        next(e);
    }
};

module.exports = {
    uploadSingleIteTaoBaoCompetitorTable
}