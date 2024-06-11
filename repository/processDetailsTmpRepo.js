const models = require('../model')

const truncate = async () => {
    await models.processDetailsTmpModel.truncate()
}

module.exports = {
    truncate
}