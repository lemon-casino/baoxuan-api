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

module.exports = {
    extractDataValues
}