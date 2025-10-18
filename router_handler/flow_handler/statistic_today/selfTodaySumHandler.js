const biResponse = require("@/utils/biResponse")
const selfJoinTodayHandler = require("./selfJoinTodayHandler")
const selfLaunchTodayHandler = require("./selfLaunchTodayHandler")

const getSelfTodaySum = async (req, res) => {
    const {type, statuses} = req.query

    const originalResult = []
    const statusArr = JSON.parse(statuses)
    for (const status of statusArr) {
        let result = null
        switch (type) {
            case "self-joined":
                result = await selfJoinTodayHandler.getSelfJoinedResult(req.user.id, status, req.query.importance);
                break;
            case "self-launched":
                result = await selfLaunchTodayHandler.getSelfLaunchedResult(req.user.id, status, req.query.importance);
                break;
        }
        originalResult.push(result)
    }
    const mergedResult = {sum: 0, departments: []}
    // 逾期的拆开提出来
    const newOriginalResult = []
    for (const result of originalResult) {
        if (result.doing) {
            newOriginalResult.push(result.doing)
            newOriginalResult.push(result.done)
            continue
        }
        newOriginalResult.push(result)
    }

    for (const result of newOriginalResult) {
        const unMergedDepartments = result.departments

        for (const unMergedDepartment of unMergedDepartments) {
            if (!unMergedDepartment) {
                continue
            }
            if (mergedResult.departments.length === 0) {
                mergedResult.sum = mergedResult.sum + unMergedDepartment.sum
                mergedResult.departments.push(unMergedDepartment)
                continue
            }
            for (let i = 0; i < mergedResult.departments.length; i++) {
                const hasMergedDepartment = mergedResult.departments[i]
                if (unMergedDepartment.deptName === hasMergedDepartment.deptName) {
                    // 去掉重复流程
                    const unMergedIds = unMergedDepartment.ids
                    const mergedIds = hasMergedDepartment.ids
                    for (const unMergedId of unMergedIds) {
                        const isHasMerged = mergedIds.filter((id) => id === unMergedId).length > 0
                        if (isHasMerged) {
                            continue
                        }
                        hasMergedDepartment.sum = hasMergedDepartment.sum + 1
                        mergedResult.sum = mergedResult.sum + 1
                        hasMergedDepartment.ids.push(unMergedId)
                    }
                    break
                }
                if (i === mergedResult.departments.length - 1) {
                    mergedResult.sum = mergedResult.sum + unMergedDepartment.sum
                    mergedResult.departments.push(unMergedDepartment)
                    break;
                }
            }
        }
    }

    return res.send(biResponse.success(mergedResult))
}

module.exports = {
    getSelfTodaySum
}