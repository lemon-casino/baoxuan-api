const flowFormDetailsRepo = require("../repository/flowFormDetailsRepo")

const getFormDetailsByFormId = async (formId) => {
    return await flowFormDetailsRepo.getFormDetailsByFormId(formId)
}

const getDataKeyDetails = async (flow) => {
    const formDetails = await flowFormDetailsRepo.getFormLatestDetailsByFormId(flow.formUuid)
    const newData = {}

    for (const item of formDetails) {
        newData[item.fieldId] = item.fieldName
    }
    return newData
}

module.exports = {
    getFormDetailsByFormId,
    getDataKeyDetails
}