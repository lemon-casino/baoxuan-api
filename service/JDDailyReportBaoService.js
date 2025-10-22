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
    // 查询当天的数据
    const  data  =await JDDailyReportBaoRepo.inquiryTodayjdDailyReport();
    let filteredResults = data
        .map(item => {
            const questionType = [];
            if (item.promotion_amount <= 0 && item.listing_Info!=="老品") {
                questionType.push('新品无推广');
            }
            if (item.profit < 0 && item.listing_Info==="新品60" ) {
                questionType.push('新品60负利润');
            }
            if (item.huanbi < -20 && item.listing_Info==="老品" ) {
                questionType.push('老品坑产下降20%');
            }
           //如果 (item.listingInfo==="老品" 或者 item.listingInfo==="新品60" ) && item.flux < 20
            if (item.profit < 15 && item.listing_Info==="老品" && item.userDef1!=='销完下架') {
                questionType.push('老品低利润（利润率低于15%）');
            }
            if (item.profit < 0 && item.listing_Info==="老品") {
                questionType.push('老品负利润');
            }
            return questionType.length > 0 ? { linkId: item.sku, questionType,listing_Info: item.listing_Info,operationsLeader : item.operator,code: item.code} : null;
        })
        .filter(item => item !== null);
     // 去掉questionType为空的项
    // filteredResults = filteredResults
    //     .map(filteredItem => {
    //         // 查找 mergedResult 中是否有相同的 linkId
    //         const mergedItem = mergedResult.find(mergedItem => mergedItem.code === filteredItem.code);
    //         if (mergedItem) {
    //             // 如果找到了 mergedItem，过滤掉 filteredItem 中与 mergedItem 相同的 questionType
    //             const newQuestionType = filteredItem.questionType.filter(q => !mergedItem.questionType.includes(q));
    //             if (newQuestionType.length > 0) {
    //                 return {
    //                     linkId: filteredItem.linkId,
    //                     questionType: newQuestionType.length > 0 ? newQuestionType : null,
    //                     listingInfo: filteredItem.listingInfo,
    //                     operationsLeader: filteredItem.operationsLeader,
    //                     code: filteredItem.code
    //                 };
    //             }
    //             return null; // 如果没有新的 questionType，排除该 filteredItem
    //         } else {
    //             // 如果没有找到相同的 mergedItem，直接返回 filteredItem
    //             return {
    //                 linkId: filteredItem.linkId,
    //                 questionType: filteredItem.questionType,
    //                 listingInfo: filteredItem.listingInfo,
    //                 operationsLeader: filteredItem.operationsLeader,
    //                 code: filteredItem.code
    //             };
    //         }
    //     })
    //     .filter(item => item !== null && item.questionType !== null); // 过滤掉 questionType 为空或为 null 的项
    logger.info(filteredResults)
    return filteredResults
}



module.exports = {
    getInquiryTodayjdDailyReport
}