const extractDataValues = (result) => {
    if (result instanceof String) {
        return result.dataValues
    }
    const data = []
    for (const item of result) {
        data.push(item.dataValues)
    }
    return data
}

module.exports = {
    extractDataValues
}