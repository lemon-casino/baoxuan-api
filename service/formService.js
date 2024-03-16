const FormModel = require("../model/flowfrom")
const formReviewRepo = require("../repository/formReviewRepo")

/**
 * 根据重要性获取form  默认：普通
 * @param isImportant  1: 重要   2：普通
 * @returns {Promise<*>}
 */
const getFormsByImportance = async (isImportant) => {
    let statusWhere = {};
    if (isImportant.toString() === "true") {
        statusWhere.status = 1
    } else if (isImportant.toString() === "false") {
        statusWhere.status = 2
    } else {
        statusWhere = null;
    }
    return await FormModel.getFlowFormList(statusWhere);
}

/**
 *  根据重要性获取form和审核节点信息
 * @param isImportant
 * @returns {Promise<*>}
 */
const getFormsWithReviewItemsByImportance = async (isImportant) => {
    const forms = await getFormsByImportance(isImportant)
    for (const form of forms) {
        const formReviews = await formReviewRepo.getFormReviewByFormId(form.flow_form_id);
        if (formReviews && formReviews.length > 0)
            form.reviewItmes = formReviews[0].formReview;
    }
    return forms;
}


module.exports = {
    getFormsByImportance,
    getFormsWithReviewItemsByImportance
}