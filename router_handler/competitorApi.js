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
            '本品店铺名称': 'storeName',
            '竞品所在店铺名称': 'competitorsName',
            '竞品店铺名称': 'theAmeOfTheCompetitorsStore',
            '产品名称': 'productName',
            '竞品ID': 'competitorId',
            '类别': 'category',
            '日期': 'date',
            '搜索': 'search',
            '搜索人数': 'numberSearches',
        };
        function roundToTwoDecimalPlaces(number) {
            return Math.round(number * 100) / 100;
        }
        //循环读取每个sheet
        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
            const translatedData = data
                .filter(item => typeof item['链接ID'] === 'number' && !isNaN(item['链接ID'])) //  过滤掉链接ID不是数字的数据
                .filter(item => item['搜索'] !== undefined && item['搜索'] !== '' && !isNaN(item['搜索']))  //过滤搜索为空的数据 或者没有搜索的数据
                .map(item => {
                    const translatedItem = {};
                    for (const [key, value] of Object.entries(keyMapping)) {
                        if (item[key] !== undefined) {
                            if (key === '日期') {
                                translatedItem[value] = excelDateToJSDate(item[key]); // Convert Excel date to JS date
                            }
                            else if (key === '搜索') {
                                translatedItem[value] = (item[key] === '' || isNaN(item[key])) ? 0 : roundToTwoDecimalPlaces(parseFloat(item[key])); // Validate and set default for search
                            }
                            else {
                                translatedItem[value] = item[key];
                            }
                        }
                    }
                    translatedItem['headOfProductLine'] = sheetName;
                    return translatedItem;
                });
            console.log('translatedData',translatedData)
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
const searchSingleIteTaoBaoCompetitorTable = async (req, res, next) => {
    try {
      // 删除 req.query 中的空值
        for (let key in req.query) {
            if (req.query[key] === '' || req.query[key] === undefined) {
                delete req.query[key];
            }
        }

        const  rest= await tmallCompetitorService.searchSingleIteTaoBaoCompetitorTable(req.query)
        return res.send(biResponse.success(rest))
    } catch (e) {
        next(e);
    }
};
const conditionalFiltering = async (req, res, next) => {
    try {
        let result={
            link_id:[],
            competitors_id:[],
            headOf_operations:[],
            competitors_name:[],
            category:[],
            headOf_productLine:[],
            store_name:[]
        }
        result= await tmallCompetitorService.conditionalFiltering(result)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e);
    }
};
module.exports = {
    uploadSingleIteTaoBaoCompetitorTable,
    searchSingleIteTaoBaoCompetitorTable,
    conditionalFiltering
}