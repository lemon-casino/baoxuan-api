const JDDailyReportBaoRepo = require("../repository/JDDailyReportBaoRepo")
const {theJDProcessIsProblemLinkThreeDays} = require("@/repository/processDetailsRepo");
const {getTodaySplitFlowsByFormIdAndFlowStatus} = require("@/service/flowService");
const {flowStatusConst} = require("@/const/flowConst");
const {link_properties} = require("@/repository/dianshangOperationAttribute");
const JDLinkExceptionFlowFormId = "FORM-KW766OD1UJ0E80US7YISQ9TMNX5X36QZ18AMLW"


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
    const  jingdongProblemLinkThreeDays =await theJDProcessIsProblemLinkThreeDays()

    // 查询 Redis  中 京东问题连接优化的 数据
    const transformCompletedData = (data) => {
        return data.map(entry => {
            let questionType = entry.questionType || ''; // 默认值为空字符串

            // 如果需要解析JSON，尝试解析

                try {
                    questionType = JSON.parse(questionType);
                } catch (error) {
                    console.error(`Error parsing JSON for linkId: ${entry.code}`, error);
                    questionType = []; // 解析失败时默认空数组
                }


            return {
                code: entry.code, // 保留 code 键
                questionType: Array.isArray(questionType) ? questionType : [questionType]
            };
        });
    };

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
    // 转换两个数据集
    const transformedJingdongProblem = transformCompletedData(jingdongProblemLinkThreeDays);

// 合并并去重 已经存在的数据
    const mergedResult = mergeDataSets( transformedJingdongProblem);

    // 三天内 已发起的异常
    //console.log(mergedResult);

    // 当天异常  - 三天内已发起的异常 - Redis  中存在的异常 = 要发起的流程
       // redis  中存在的异常
    const runningFightingFlows = await getTodaySplitFlowsByFormIdAndFlowStatus(JDLinkExceptionFlowFormId, flowStatusConst.RUNNING,`flows:today:form:${JDLinkExceptionFlowFormId.replace("FORM-", "")}`)

    //链接id + code 异常

    const  redisPresenceToday=[]

    for (const runningFightingFlow of runningFightingFlows) {
        //链接id textField_lma827od
        if (runningFightingFlow.data['checkboxField_m11r277t']!==undefined){
            redisPresenceToday.push({code:runningFightingFlow.data["textField_lma827od"], questionType:runningFightingFlow.data['checkboxField_m11r277t'] })
        }
    }


// 创建一个Map方便快速查找mergedResult中的linkId
    const mergedMap = new Map();
    mergedResult.forEach(item => mergedMap.set(item.code, item));

// 遍历redisPresenceToday
    redisPresenceToday.forEach(redisItem => {
        const existingMergedItem = mergedMap.get(redisItem.code);

        if (existingMergedItem) {
            // 如果code相同，合并questionType并去重
            const mergedTypes = new Set([...existingMergedItem.questionType, ...redisItem.questionType]);
            existingMergedItem.questionType = Array.from(mergedTypes);
            mergedResult.push(existingMergedItem);
        } else {
            // 如果mergedResult中没有此linkId，则直接添加
            mergedResult.push(redisItem);
        }
    });
    // 这是最终的 filteredResults -mergedResult（三天内+ 已发起的异常 + Redis  中存在的异常） = 要发起的流程
  //  console.log(mergedResult);
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