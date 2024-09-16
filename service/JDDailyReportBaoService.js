const JDDailyReportBaoRepo = require("../repository/JDDailyReportBaoRepo")
const {theJDProcessIsCompletedInThreeDays, theJDProcessIsProblemLinkThreeDays} = require("@/repository/processDetailsRepo");
const {getTodaySplitFlowsByFormIdAndFlowStatus} = require("@/service/flowService");
const {flowStatusConst} = require("@/const/flowConst");
const JDLinkExceptionFlowFormId = "FORM-KW766OD1UJ0E80US7YISQ9TMNX5X36QZ18AMLW"


// 查询今天的数据
const getInquiryTodayjdDailyReport = async () => {

    // 查询当天的数据
    const  data  =await JDDailyReportBaoRepo.inquiryTodayjdDailyReport();


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

// 合并并去重
    const mergedResult = mergeDataSets(transformedSingleChoice, transformedJingdongProblem);



    // 三天内 已发起的异常


    //console.log(mergedResult);

    // 当天异常  - 三天内已发起的异常 - Redis  中存在的异常 = 要发起的流程
       // redis  中存在的异常
    const runningFightingFlows = await getTodaySplitFlowsByFormIdAndFlowStatus(JDLinkExceptionFlowFormId, flowStatusConst.RUNNING,`flows:today:form:${JDLinkExceptionFlowFormId.replace("FORM-", "")}`)

    console.log(runningFightingFlows)
}



module.exports = {
    getInquiryTodayjdDailyReport
}