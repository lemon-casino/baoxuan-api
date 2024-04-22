const formReviewRepo = require("../repository/formReviewRepo")
const flowFormRepo = require("../repository/flowFormRepo")
const dingDingReq = require("../core/dingDingReq")
const redisService = require("../service/redisService")
const sha256 = require("sha256")
const formImportantItems = require("../const/tmp/formImportantItems")

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
    }
    return await flowFormRepo.getAllForms(statusWhere);
}

/**
 *  根据重要性获取form和审核节点信息
 * @param isImportant
 * @returns {Promise<*>}
 */
const getFormsWithReviewItemsByImportance = async (isImportant) => {
    const forms = await getFormsByImportance(isImportant)
    for (const form of forms) {
        const formReviews = await formReviewRepo.getFormReviewByFormId(form.flowFormId);
        if (formReviews && formReviews.length > 0)
            form.reviewItmes = formReviews[0].formReview;
    }
    return forms;
}

/**
 * 同步钉钉的form信息
 * @returns {Promise<boolean>}
 */
const syncFormsFromDingDing = async () => {
    const userId = "073105202321093148";
    const tokenObj = await redisService.getToken()
    const token = tokenObj.access_token
    const allFormsInDB = await flowFormRepo.getAllForms({})
    // 获取钉钉的form信息
    const allFormsInDingDing = await dingDingReq.getAllForms(token, userId)

    for (const form of allFormsInDingDing) {
        let formsInDB = allFormsInDB.filter((item) => {
            return item.flowFormId === form.formUuid
        })
        const formDetailsResult = await dingDingReq.getFormFields(form.formUuid, userId, token)
        const hashOfDetails = sha256(JSON.stringify(formDetailsResult.result))

        // 老的 form 判断内容是否修改，是就同步
        if (formsInDB.length > 0) {
            const formInDB = formsInDB[0]
            if (hashOfDetails === formInDB.detailsHash) {
                continue
            }
            // form 还没有详细信息
            if (!formInDB.detailsHash) {
                formInDB.detailsVersion = 1
            }
            // 详情有变化
            else {
                formInDB.detailsVersion = formInDB.detailsVersion + 1
            }
            formInDB.detailsHash = hashOfDetails
            const flowFormsDetails = []
            for (const details of formDetailsResult.result) {
                flowFormsDetails.push({
                    formId: formInDB.flowFormId,
                    fieldName: details.label.zh_CN,
                    fieldId: details.fieldId,
                    props: JSON.stringify(details.props),
                    behavior: details.behavior,
                    version: formInDB.detailsVersion
                })
            }
            // 更新form、保存form的详细信息
            await flowFormRepo.updateFormAndAddDetails(formInDB, flowFormsDetails)
        }
        // 新的 form 需要入库
        else {
            const detailsVersion = 1
            const flowForm = {
                flowFormId: form.formUuid,
                flowFormName: form.title.zhCN,
                creator: form.creator,
                status: 2,
                createTime: form.gmtCreate,
                detailsHash: hashOfDetails,
                detailsVersion: detailsVersion
            }
            const flowFormsDetails = []
            for (const details of formDetailsResult.result) {
                flowFormsDetails.push({
                    formId: form.formUuid,
                    fieldName: details.label.zh_CN,
                    fieldId: details.fieldId,
                    props: JSON.stringify(details.props),
                    behavior: details.behavior,
                    version: detailsVersion
                })
            }
            await flowFormRepo.saveFormAndDetails(flowForm, flowFormsDetails)
        }
    }
    return true
}

/**
 * 根据部门和重要性筛选流程表单
 * @param deptId
 * @param isImportant
 * @returns {Promise<[]|*>}
 */
const getFlowFormsByDeptIdAndImportant = async (deptId, isImportant) => {
    let where = {};
    if (isImportant.toString() === "true") {
        where.status = 1
    } else if (isImportant.toString() === "false") {
        where.status = 2
    }
    if (deptId) {
        where.dept_id = {$like: `%${deptId}%`}
    }
    return await flowFormRepo.getAllForms(where);
}

/**
 * 获取所有的表流程表单
 * @returns {Promise<*[]|*>}
 */
const getAllForms = async () => {
    return flowFormRepo.getAllForms({})
}

/**
 * 获取表单的需要紧急显示的节点
 * @param formId
 * @returns {Promise<[string]|*[]>}
 */
const getFormEmergencyItems = async (formId) => {
    const form = formImportantItems.filter(item => item.formId === formId)
    if (form.length > 0) {
        return form[0].items
    }
    return []
}

module.exports = {
    getAllForms,
    getFormsByImportance,
    getFormsWithReviewItemsByImportance,
    syncFormsFromDingDing,
    getFlowFormsByDeptIdAndImportant,
    getFormEmergencyItems
}