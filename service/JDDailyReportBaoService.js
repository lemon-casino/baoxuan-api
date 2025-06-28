const JDDailyReportBaoRepo = require("../repository/JDDailyReportBaoRepo")
const {theJDProcessIsProblemLinkThreeDays} = require("@/repository/processDetailsRepo");
const {getTodaySplitFlowsByFormIdAndFlowStatus} = require("@/service/flowService");
const {flowStatusConst} = require("@/const/flowConst");
const {link_properties} = require("@/repository/dianshangOperationAttribute");
const JDLinkExceptionFlowFormId = "FORM-KW766OD1UJ0E80US7YISQ9TMNX5X36QZ18AMLW"
const actHiProcinstRepo = require('@/repository/bpm/actHiProcinstRepo')
const { ObjectInputStream  } = require('java-object-serialization')
// 查询今天的数据
const getInquiryTodayjdDailyReport = async () => {

        await JDDailyReportBaoRepo.updateFluxForYesterday()
    const firstDayOfTheWeek=new Date().getDay() === 1;
    if (firstDayOfTheWeek) {
    const  weeklist=await JDDailyReportBaoRepo.updateWeeklyTrafficChange()
        await JDDailyReportBaoRepo.updateWeeklyTraffic(weeklist)
        await  JDDailyReportBaoRepo.updateWeeklyProfit()
     }
    // 查询当天的数据
    const  data  =await JDDailyReportBaoRepo.inquiryTodayjdDailyReport();
    let filteredResults = data
        .map(item => {
            const questionType = [];
            if (item.profitMargin < 10 && item.listingInfo==="老品") {
                questionType.push('利润率小于10%');
            }
            if (item.costRatio > 0.12 && item.listingInfo==="老品" ) {
                questionType.push('推广费比大于12%');
            }
            
            if (item.flux > 20 && item.listingInfo==="老品" ) {
                questionType.push('流量下降');
            }
           //如果 (item.listingInfo==="老品" 或者 item.listingInfo==="新品60" ) && item.flux < 20
            if (item.profit < 0 && (item.listingInfo==="老品" || item.listingInfo==="新品60")) {
                questionType.push('利润为负');
            }
            if (item.weeklyTraffic !== null && item.weeklyTraffic > 20) {
                questionType.push('周流量下降20%');
            }
            if (item.weeklyProfitMargin !== null && item.weeklyProfitMargin < 10) {
                questionType.push('周利润率小于10%');
            }
            if (item.weeklyProfit !== null && item.weeklyProfit  < 0) {
                questionType.push('周利润为负');
            }



            return questionType.length > 0 ? { linkId: item.sku, questionType,listingInfo: item.listingInfo,operationsLeader : item.operationsLeader,code: item.code} : null;
        })
        .filter(item => item !== null);
    // 京东问题链接三天内 多选数据
    const bpmdata = await actHiProcinstRepo.getJDLinkOptimization()
    for (let i = 0; i < bpmdata.length; i++) {
        if (bpmdata[i].questionType) {
            let questionType = new ObjectInputStream(bpmdata[i].questionType)
            questionType = questionType.readObject()
            questionType?.annotations.splice(0, 1)
            bpmdata[i].questionType = []
            bpmdata[i].questionType = questionType?.annotations
            
        }
    }
    const mergeDataSets = (dataSet) => {
        const mergedMap = new Map();
        dataSet.forEach(entry => {
            if (mergedMap.has(entry.code)) {
                const existingSet = mergedMap.get(entry.code);
                entry.questionType.forEach(qt => existingSet.add(qt)); // 合并去重
            } else {
                mergedMap.set(entry.code, new Set(entry.questionType)); // 如果不存在则直接添加
            }
        });

        // 转换 Set 为数组并返回最终结果
        return Array.from(mergedMap.entries()).map(([code, questionTypeSet]) => ({
            code,
            questionType: Array.from(questionTypeSet) // 将 Set 转为数组
        }));
    };
    const mergedResult = mergeDataSets(bpmdata);

// 创建一个Map方便快速查找mergedResult中的linkId
    const mergedMap = new Map();
    mergedResult.forEach(item => mergedMap.set(item.code, item));

    // 这是最终的 filteredResults -mergedResult（三天内已发起的异常） = 要发起的流程
     // 去掉questionType为空的项
    filteredResults = filteredResults
        .map(filteredItem => {
            // 查找 mergedResult 中是否有相同的 linkId
            const mergedItem = mergedResult.find(mergedItem => mergedItem.code === filteredItem.code);
            if (mergedItem) {
                // 如果找到了 mergedItem，过滤掉 filteredItem 中与 mergedItem 相同的 questionType
                const newQuestionType = filteredItem.questionType.filter(q => !mergedItem.questionType.includes(q));
                if (newQuestionType.length > 0) {
                    return {
                        linkId: filteredItem.linkId,
                        questionType: newQuestionType.length > 0 ? newQuestionType : null,
                        listingInfo: filteredItem.listingInfo,
                        operationsLeader: filteredItem.operationsLeader,
                        code: filteredItem.code
                    };
                }
                return null; // 如果没有新的 questionType，排除该 filteredItem
            } else {
                // 如果没有找到相同的 mergedItem，直接返回 filteredItem
                return {
                    linkId: filteredItem.linkId,
                    questionType: filteredItem.questionType,
                    listingInfo: filteredItem.listingInfo,
                    operationsLeader: filteredItem.operationsLeader,
                    code: filteredItem.code
                };
            }
        })
        .filter(item => item !== null && item.questionType !== null); // 过滤掉 questionType 为空或为 null 的项

    for (let i = filteredResults.length - 1; i >= 0; i--) {
        const filteredResult = filteredResults[i];
        const judgment = await link_properties(filteredResult.linkId);
        switch (judgment) {
            case '市场低利润':
                filteredResult.questionType = filteredResult.questionType.filter(type => type !== '利润率小于10%');
                break;
            case '新品上攻':
            case '老品打仗':
                // Remove '利润率小于10%', '利润为负', and '推广费比大于12%'
                filteredResult.questionType = filteredResult.questionType.filter(type =>
                    type !== '利润率小于10%' && type !== '利润为负' && type !== '推广费比大于12%'
                );
                break;
            case '销完下架':
                if (firstDayOfTheWeek) {
                    filteredResult.questionType = filteredResult.questionType.filter(type =>
                        type === '周流量下降20%' || type === ' 周利润为负'
                    );
                    filteredResult.questionType = Array.from(new Set(filteredResult.questionType.map(type => type.replace('周', ''))));
                } else {
                    filteredResult.questionType = [];
                }
                break;
            case '动销':
                if (firstDayOfTheWeek) {
                    filteredResult.questionType = filteredResult.questionType.filter(type =>
                        type === '周流量下降20%' || type === '周利润率小于10%' || type === '周利润为负'
                    );
                    filteredResult.questionType = Array.from(new Set(filteredResult.questionType.map(type => type.replace('周', ''))));
                } else {
                    filteredResult.questionType = [];
                }
                break;
            case '下柜':
                filteredResult.questionType = filteredResult.questionType.filter(type => type === '利润为负');
                break;
            case '高付费模型':
                filteredResult.questionType = filteredResult.questionType.filter(type => type !== '推广费比大于12%');
                break;
        }
        filteredResult.questionType = filteredResult.questionType.filter(type => !type.startsWith('周'));
        if (filteredResult.questionType.length === 0) {
            filteredResults.splice(i, 1);
        }
    }
    logger.info(filteredResults)
    return filteredResults
}



module.exports = {
    getInquiryTodayjdDailyReport
}