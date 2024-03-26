const extractDataValues = (result) => {
    if (result instanceof String) {
        return result.dataValues
    }
    const results = []
    for (const item of result) {
        results.push(item.dataValues)
    }
    return result
}

module.exports = {
    extractDataValues
}