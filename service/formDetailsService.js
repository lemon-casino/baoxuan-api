const formDetailsRepo = require("../repository/flowFormDetailsRepo")

const saveFormDetails = async (details) => {
    return formDetailsRepo.saveFormDetails(details)
}

module.exports = {
    saveFormDetails
}