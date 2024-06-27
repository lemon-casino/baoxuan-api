const models = require('../model')
const sequelizeUtil = require("../utils/sequelizeUtil")

const saveFormDetails = async (details, transaction) => {
    const result = await models.flowFormDetailsModel.create(details, {transaction})
    return result
}

const getFormDetailsByFormId = async (formId) => {
    const formDetails = await models.flowFormDetailsModel.findAll({
        where: {
            formId
        }
    })
    return sequelizeUtil.extractDataValues(formDetails);
}

const getFormDifferentVersionsDetails = async (formId) => {
    let formDetails = await models.flowFormDetailsModel.findAll({
        where: {
            formId
        }
    })

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
    const formProfile = await models.flowfromsModel.findAll(
        {
            where: {
                flowFormId: formId
            },
            order: [["detailsVersion", "desc"]]
        }
    )
    if (formProfile.length > 0) {
        const formDetails = await models.flowFormDetailsModel.findAll({
            where: {
                formId,
                version: formProfile[0].detailsVersion
            }
        })
        return sequelizeUtil.extractDataValues(formDetails);
    }
    return []
}

module.exports = {
    saveFormDetails,
    getFormDetailsByFormId,
    getFormLatestDetailsByFormId,
    getFormDifferentVersionsDetails
}