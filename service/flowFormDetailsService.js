const flowFormDetailsRepo = require("../repository/flowFormDetailsRepo")

const getFormDetailsByFormId = async (formId) => {
    return await flowFormDetailsRepo.getFormDetailsByFormId(formId)
}

const formatDataWithTitle = async (flow) => {
    const formDetails = await getFormDetailsByFormId(flow.formUuid)
    const newData = {}
    for (const key of Object.keys(flow.data)) {
        // 钉钉返回的流程的data 数据有的filedId后面会加"_id"故使用includes()
        const fieldNames = formDetails.filter(detail => key.includes(detail.fieldId))
        if (fieldNames.length > 0) {
            newData[fieldNames[0].fieldName] = flow.data[key]
        } else {
            newData[key] = flow.data[key]
        }
    }
    return newData
}

module.exports = {
    getFormDetailsByFormId,
    formatDataWithTitle
}