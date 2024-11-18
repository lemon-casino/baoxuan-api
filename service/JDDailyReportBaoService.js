const JDDailyReportBaoRepo = require("../repository/JDDailyReportBaoRepo")
const {theJDProcessIsCompletedInThreeDays, theJDProcessIsProblemLinkThreeDays} = require("@/repository/processDetailsRepo");
const {getTodaySplitFlowsByFormIdAndFlowStatus} = require("@/service/flowService");
const {flowStatusConst} = require("@/const/flowConst");
const {link_properties} = require("@/repository/dianshangOperationAttribute");
const JDLinkExceptionFlowFormId = "FORM-KW766OD1UJ0E80US7YISQ9TMNX5X36QZ18AMLW"


// 查询今天的数据
const getInquiryTodayjdDailyReport = async () => {

    await JDDailyReportBaoRepo.updateFluxForYesterday()
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




            return questionType.length > 0 ? { linkId: item.sku, questionType,listingInfo: item.listingInfo,operationsLeader : item.operationsLeader,code: item.code} : null;
        })
        .filter(item => item !== null);

    // 京东问题链接 三天内 单选数据
    const  singleChoiceDataWithinThreeDays =await theJDProcessIsCompletedInThreeDays()
    // 京东问题链接三天内 多选数据
    const  jingdongProblemLinkThreeDays =await theJDProcessIsProblemLinkThreeDays()

    // 查询 Redis  中 京东问题连接优化的 数据

    const transformCompletedData = (data, parseJson = false) => {
        return data.map(entry => {
            let questionType = entry.questionType || ''; // 默认值为空字符串

            // 如果需要解析JSON，尝试解析
            if (parseJson) {
                try {
                    questionType = JSON.parse(questionType);
                } catch (error) {
                    console.error(`Error parsing JSON for linkId: ${entry.linkId}`, error);
                    questionType = []; // 解析失败时默认空数组
                }
            }

            return {
                linkId: entry.linkId, // 保留 linkId 键
                questionType: Array.isArray(questionType) ? questionType : [questionType]
            };
        });
    };
// 合并两个数据集的函数，并去重
    const mergeDataSets = (dataSet1, dataSet2) => {
        const mergedMap = new Map();

        // 处理空数据集的情况
        if (dataSet1.length === 0) return dataSet2;
        if (dataSet2.length === 0) return dataSet1;

        // 遍历第一个数据集
        dataSet1.forEach(entry => {
            if (!mergedMap.has(entry.linkId)) {
                mergedMap.set(entry.linkId, new Set(entry.questionType)); // 使用 Set 来去重
            }
        });

        // 遍历第二个数据集，合并 questionType
        dataSet2.forEach(entry => {
            if (mergedMap.has(entry.linkId)) {
                const existingSet = mergedMap.get(entry.linkId);
                entry.questionType.forEach(qt => existingSet.add(qt)); // 合并去重
            } else {
                mergedMap.set(entry.linkId, new Set(entry.questionType)); // 如果不存在则直接添加
            }
        });

        // 转换 Set 为数组并返回最终结果
        return Array.from(mergedMap.entries()).map(([linkId, questionTypeSet]) => ({
            linkId,
            questionType: Array.from(questionTypeSet) // 将 Set 转为数组
        }));
    };
    // 转换两个数据集
    const transformedSingleChoice = transformCompletedData(singleChoiceDataWithinThreeDays);
    const transformedJingdongProblem = transformCompletedData(jingdongProblemLinkThreeDays, true);

// 合并并去重 已经存在的数据
    const mergedResult = mergeDataSets(transformedSingleChoice, transformedJingdongProblem);

    // 三天内 已发起的异常
    //console.log(mergedResult);

    // 当天异常  - 三天内已发起的异常 - Redis  中存在的异常 = 要发起的流程
       // redis  中存在的异常
    const runningFightingFlows = await getTodaySplitFlowsByFormIdAndFlowStatus(JDLinkExceptionFlowFormId, flowStatusConst.RUNNING,`flows:today:form:${JDLinkExceptionFlowFormId.replace("FORM-", "")}`)

    //链接id +

    const  redisPresenceToday=[]

    for (const runningFightingFlow of runningFightingFlows) {
        //链接id textField_lma827oe
        if (runningFightingFlow.data['checkboxField_m11r277t']!==undefined){
            redisPresenceToday.push({linkId:runningFightingFlow.data["textField_lma827oe"], questionType:runningFightingFlow.data['checkboxField_m11r277t'] })
        }
    }


// 创建一个Map方便快速查找mergedResult中的linkId
    const mergedMap = new Map();
    mergedResult.forEach(item => mergedMap.set(item.linkId, item));

// 遍历redisPresenceToday
    redisPresenceToday.forEach(redisItem => {
        const existingMergedItem = mergedMap.get(redisItem.linkId);

        if (existingMergedItem) {
            // 如果linkId相同，合并questionType并去重
            const mergedTypes = new Set([...existingMergedItem.questionType, ...redisItem.questionType]);
            existingMergedItem.questionType = Array.from(mergedTypes);
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
            const mergedItem = mergedResult.find(mergedItem => mergedItem.linkId === filteredItem.linkId);
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

        if (judgment === '市场低利润') {
            // Remove '利润率小于15%' if it exists
            filteredResult.questionType = filteredResult.questionType.filter(type => type !== '利润率小于10%');
        }
        else if (judgment === '新品上攻' || judgment === '老品打仗') {
            // Remove '利润率小于15%', '利润为负', and '推广费比大于12%'
            filteredResult.questionType = filteredResult.questionType.filter(type =>
                type !== '利润率小于10%' && type !== '利润为负' && type !== '推广费比大于12%'
            );
        }
        else if (judgment === '销完下架') {
            // Keep only '费比大于12%' or '利润为负', remove others
            filteredResult.questionType = filteredResult.questionType.filter(type =>
                type === '费比大于12%' || type === '利润为负'
            );
        }else if (judgment==="下柜"){
            filteredResult.questionType=filteredResult.questionType.filter(type=>type==="利润为负")
        }
        // If the questionType array is empty, remove the filteredResult from filteredResults
        if (filteredResult.questionType.length === 0) {
            filteredResults.splice(i, 1);
        }
    }
    return filteredResults
}



module.exports = {
    getInquiryTodayjdDailyReport
}