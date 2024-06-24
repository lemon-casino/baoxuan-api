const extractDataValues = (result) => {
    if (result instanceof Array) {
        return result.map(item => item.get({plain: true}))
    }
    return result.get({plain: true})
}

const getSqlFieldQuery = (field, operator, value) => {
    return {field, operator, value}
}

module.exports = {
    extractDataValues,
    getSqlFieldQuery
}