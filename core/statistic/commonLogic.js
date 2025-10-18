const formReviewRepo = require("@/repository/formReviewRepo")

/*
* 统计相关的通用逻辑
*/

/**
 * 将 processInstanceId 统计到 resultNode中key=value的ids中
 *
 * @param processInstanceId
 * @param key 过滤的键
 * @param value 过滤的值
 * @param resultNode 统计到的结果节点
 */
const statFlowToResultNode = (processInstanceId, key, value, resultNode) => {
    const alreadyCount = resultNode.children.filter(item => item[[key]] === value)
    if (alreadyCount.length > 0) {
        const alreadyObj = alreadyCount[0]
        if (!alreadyObj.ids.includes(processInstanceId)) {
            alreadyObj.ids.push(processInstanceId)
            alreadyObj.sum = alreadyObj.ids.length
        }
    } else {
        resultNode.children.push({
            [key]: value,
            sum: 1,
            ids: [processInstanceId]
        })
    }
}

/**
 * 根据reviewId获取审核流程信息
 *
 * @param reviewId 审核信息的id
 * @param formsReviewCache  表单审核缓存
 * @returns {Promise<*>}
 */
const getFormReview = async (reviewId, formsReviewCache) => {
    const flowFormReviews = formsReviewCache[reviewId] || []
    if (flowFormReviews.length === 0) {
        const formReview = await formReviewRepo.getDetailsById(reviewId)
        if (!formReview) {
            formsReviewCache[reviewId] = []
        } else {
            formsReviewCache[reviewId] = formReview.formReview
        }
    }
    return formsReviewCache[reviewId]
}

module.exports = {
    statFlowToResultNode,
    getFormReview
}