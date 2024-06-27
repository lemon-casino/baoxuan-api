const flowFormDetailsRepo = require("../repository/flowFormDetailsRepo")
const formDetailsRepo = require("../repository/flowFormDetailsRepo");

const getFormDetailsByFormId = async (formId) => {
    return await flowFormDetailsRepo.getFormDetailsByFormId(formId)
}

const getFormDifferentVersionsDetails = async (formId) => {
    return await flowFormDetailsRepo.getFormDifferentVersionsDetails(formId)
}

const getDataKeyDetails = async (flow) => {
    const formDetails = await flowFormDetailsRepo.getFormLatestDetailsByFormId(flow.formUuid)
    const newData = {}

    for (const item of formDetails) {
        newData[item.fieldId] = item.fieldName
    }
    return newData
}

const saveFormDetails = async (details) => {
    return formDetailsRepo.saveFormDetails(details)
}

module.exports = {
    getFormDetailsByFormId,
    getDataKeyDetails,
    getFormDifferentVersionsDetails,
    saveFormDetails
}