/**
 *
 * @param statusProcessorMap
 * @param id  userId 、deptId
 * @param status
 * @param importance
 * @returns {Promise<*|null>}
 */
const convert = async (statusProcessorMap, id, status, importance) => {
    if (status && Object.keys(statusProcessorMap).includes(status.toLowerCase())) {
        if (importance) {
            importance = JSON.parse(importance)
        }

        const processorMap = statusProcessorMap[status]
        const realStatus = processorMap.mapStatus
        let result = null;
        if (realStatus) {
            result = await processorMap.processor(id, realStatus, importance)
        } else {
            result = await processorMap.processor(id, importance)
        }
        return result
    }
    return null
}

module.exports = {
    convert
}