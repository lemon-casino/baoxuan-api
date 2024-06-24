const extractDataValues = (result) => {
    if (result instanceof Array) {
        const data = []
        for (const item of result) {
            data.push(item.dataValues)
        }
        return data
    }
    return result.dataValues

}

const getSqlFieldQuery = (field, operator, value) => {
    return {field, operator, value}
}

module.exports = {
    extractDataValues,
    getSqlFieldQuery
}