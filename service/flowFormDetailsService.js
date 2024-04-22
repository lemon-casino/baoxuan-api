const flowFormDetailsRepo = require("../repository/flowFormDetailsRepo")

const getFormDetailsByFormId = async (formId) => {
    return await flowFormDetailsRepo.getFormDetailsByFormId(formId)
}

const getDataKeyDetails = async (flow) => {
    const formDetails = await flowFormDetailsRepo.getFormLatestDetailsByFormId(flow.formUuid)
    const newData = {}

    if (formDetails.length > 0) {
        for (const item of formDetails) {
            newData[item.fieldId] = item.fieldName
        }
    }

    //
    // for (const key of Object.keys(flow.data)) {
    //     // 钉钉返回的流程的data 数据有的filedId后面会加"_id"故使用includes()
    //     const fieldNames = formDetails.filter(detail => key.includes(detail.fieldId))
    //     if (fieldNames.length > 0) {
    //         newData[key] = fieldNames[0].fieldName
    //     } else {
    //         newData[key] = newData[key]
    //     }
    // }
    return newData
}

module.exports = {
    getFormDetailsByFormId,
    getDataKeyDetails
}