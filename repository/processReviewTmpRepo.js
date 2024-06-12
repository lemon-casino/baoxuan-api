const models = require('../model')

const truncate = async () => {
    await models.processReviewTmpModel.truncate()
}

module.exports = {
    truncate
}