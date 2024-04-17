const joi = require("joi")
const biResponse = require("../utils/biResponse")
const formService = require("../service/flowFormService")
const joiUtil = require("../utils/joiUtil")

const getFormsByImportance = async (req, res, next) => {
    try {
        const {isImportant} = req.query
        const forms = await formService.getFormsWithReviewItemsByImportance(isImportant)
        return res.send(biResponse.success(forms))
    } catch (e) {
        next(e)
    }
}

const getFlowFormsByDeptIdAndImportant = async (req, res, next) => {
    try {
        const {deptId} = req.params
        const {isImportant} = req.query

        joiUtil.validate([{deptId: {value: deptId, schema: joi.required()}},
            {isImportant: {value: isImportant, schema: joi.required()}}])

        const forms = await formService.getFlowFormsByDeptIdAndImportant(deptId, isImportant)
        return res.send(biResponse.success(forms))
    } catch (e) {
        next(e)
    }

}

module.exports = {
    getFormsByImportance,
    getFlowFormsByDeptIdAndImportant
}