const extractDataValues = (result) => {
    if (result instanceof Array) {
        return result.map(item => {
            if (item.get && typeof item.get === "function") {
                return item.get({plain: true})
            }
            return item
        })
    }

    if (result.get && typeof result.get === "function") {
        return result.get({plain: true})
    }
    return result
}

const getSqlFieldQuery = (field, operator, value) => {
    return {field, operator, value}
}

module.exports = {
    extractDataValues,
    getSqlFieldQuery
}