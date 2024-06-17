const models = require('../model')
const oaProcessTemplateModel = models.oaProcessTemplateModel

const save = async (model) => {
    await oaProcessTemplateModel.create(model)
}

const update = async (model, processCode) => {
    await oaProcessTemplateModel.update(model, {where: {processCode}})
}

module.exports = {
    save,
    update
}
