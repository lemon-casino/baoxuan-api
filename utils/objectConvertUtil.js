const map = (data, fieldsMap) => {
    if (!(data instanceof Array) && data instanceof Object) {
        data = [data]
    }

    for (const item of data) {
        for (const oldKey of Object.keys(fieldsMap)) {
            const newKey = fieldsMap[oldKey]
            item[newKey] = item[oldKey]
            delete item[oldKey]
        }
    }
}

module.exports = {
    map
}