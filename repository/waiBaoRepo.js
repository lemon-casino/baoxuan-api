const models = require('../model')

const getDetails = async (where) => {
    const details = await models.waiBaoModel.findOne({
        where
    })
    return details.get({plain: true})
}

module.exports = {
    getDetails
}