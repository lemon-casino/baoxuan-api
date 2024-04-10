const flowFormDetailsRepo = require("../repository/flowFormDetailsRepo")

const getFormDetailsByFormId = async (formId) => {
    return await flowFormDetailsRepo.getFormDetailsByFormId(formId)
}

module.exports = {
    getFormDetailsByFormId
}