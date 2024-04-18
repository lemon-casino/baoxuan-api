const getSqlFieldQuery = (field, operator, value) => {
    return {field, operator, value}
}

module.exports = {
    getSqlFieldQuery
}