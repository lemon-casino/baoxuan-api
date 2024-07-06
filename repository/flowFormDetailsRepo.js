const models = require('@/model')
const flowFormDetailsModel = models.flowFormDetailsModel
const flowFormsModel = models.flowfromsModel
const sequelizeUtil = require("@/utils/sequelizeUtil")

const saveFormDetails = async (details, transaction) => {
    const result = await flowFormDetailsModel.create(details, {transaction})
    return result
}

const getFormDetailsByFormId = async (formId) => {
    const formDetails = await flowFormDetailsModel.findAll({
        where: {
            formId
        }
    })
    return sequelizeUtil.extractDataValues(formDetails);
}

const getFormDifferentVersionsDetails = async (formId) => {
    let formDetails = await flowFormDetailsModel.findAll({
        where: {
            formId
        }
    })
    formDetails = sequelizeUtil.extractDataValues(formDetails)
    formDetails = formDetails.sort((curr, next) => next.id - curr.id)
    const differentVersionsDetails = []
    while (formDetails.length > 0) {
        const version = formDetails[0].version
        let sameVersionDetails = formDetails.filter(item => item.version === version)
        sameVersionDetails = sameVersionDetails.sort((curr, next) => curr.id - next.id)
        differentVersionsDetails.push({title: `表单版本${version}`, details: sameVersionDetails})
        const hasCountedIds = sameVersionDetails.map(item => item.id)
        formDetails = formDetails.filter(item => !hasCountedIds.includes(item.id))
    }
    return differentVersionsDetails
}


const getFormLatestDetailsByFormId = async (formId) => {
    const formProfile = await flowFormsModel.findAll(
        {
            where: {
                flowFormId: formId
            },
            order: [["detailsVersion", "desc"]]
        }
    )
    if (formProfile.length > 0) {
        const formDetails = await flowFormDetailsModel.findAll({
            where: {
                formId,
                version: formProfile[0].detailsVersion
            }
        })
        return sequelizeUtil.extractDataValues(formDetails);
    }
    return []
}

const getAllFormsDetails = async () => {
    const result = await flowFormDetailsModel.findAll({})
    return sequelizeUtil.extractDataValues(result)
}

module.exports = {
    getAllFormsDetails,
    saveFormDetails,
    getFormDetailsByFormId,
    getFormLatestDetailsByFormId,
    getFormDifferentVersionsDetails
}