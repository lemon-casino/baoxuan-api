const biResponse = require("../utils/biResponse")
const formService = require("../service/flowFormService")

exports.getFormsByImportance = async (req, res) => {
    const {isImportant} = req.query
    const forms = await formService.getFormsWithReviewItemsByImportance(isImportant)
    return res.send(biResponse.success(forms))
};