const userService = require("../../../service/userService")

const convert = async (selfJoinedStatusProcessorMap, userId, importance, status) => {
    if (status && Object.keys(selfJoinedStatusProcessorMap).includes(status.toLowerCase())) {
        // todo: 需要返回前端直接从user中取
        const ddUserId = await userService.getDingDingUserId(userId);
        if (importance) {
            importance = JSON.parse(importance)
        }

        const processorMap = selfJoinedStatusProcessorMap[status]
        const realStatus = processorMap.mapStatus
        let result = null;
        if (realStatus) {
            result = await processorMap.processor(ddUserId, realStatus, importance)
        } else {
            result = await processorMap.processor(ddUserId, importance)
        }
        return result
    }
    return null
}

module.exports = {
    convert
}