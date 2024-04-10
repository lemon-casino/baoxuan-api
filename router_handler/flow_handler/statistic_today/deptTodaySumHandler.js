const biResponse = require("../../../utils/biResponse")
const selfJoinTodayHandler = require("./selfJoinTodayHandler")
const selfLaunchTodayHandler = require("./selfLaunchTodayHandler")
const deptLaunchTodayHandler = require("./deptLaunchTodayHandler")
const deptJoinTodayHandler = require("./deptJoinTodayHandler")

const getDeptTodaySum = async (req, res) => {
    const {type, statuses} = req.query

    const originalResult = []
    const statusArr = JSON.parse(statuses)
    for (const status of statusArr) {
        let result = null
        switch (type) {
            case "dept-joined":
                result = await deptJoinTodayHandler.getDeptJoinedResult(req.query.deptId, status, req.query.importance)
                break;
            case "dept-launched":
                result = await deptLaunchTodayHandler.getDeptLaunchedResult(req.query.deptId, status, req.query.importance)
                break;
        }
        originalResult.push(result)
    }

    // 逾期的拆开提出来
    const newOriginalResult = []
    for (const result of originalResult) {
        if (result && result.doing) {
            newOriginalResult.push(result.doing)
            newOriginalResult.push(result.done)
            continue
        }
        newOriginalResult.push(result)
    }

    // 对多个状态的数据按照部门-人的级别关系进行汇总
    let mergedResult = {sum: 0, departments: []}
    for (const result of newOriginalResult) {
        // 初始化时，首节点直接赋值
        if (mergedResult.sum === 0) {
            mergedResult = result
            continue
        }

        // 部门开始判断
        const unMergedDepartments = result.departments
        for (const unMergedDepartment of unMergedDepartments) {
            // 跟已经处理过的统计数据进行对比，判断进行合并
            for (let i = 0; i < mergedResult.departments.length; i++) {
                const hasMergedDepartment = mergedResult.departments[i]
                // 如果部门名称相同-则需要进行合并操作
                if (unMergedDepartment.deptName === hasMergedDepartment.deptName) {
                    const unMergedUsers = unMergedDepartment.users
                    const mergedUsers = hasMergedDepartment.users
                    for (let k = 0; k < unMergedUsers.length; k++) {
                        for (let j = 0; j < mergedUsers.length; j++) {
                            // 用户名相同，则需要进行ids和sum的合并
                            if (unMergedUsers[k].userName === mergedUsers[j].userName) {
                                const unMergedIds = unMergedUsers[k].ids
                                const mergedIds = mergedUsers[j].ids
                                // 已经保存的id 不需要重复保存
                                for (const unMergedId of unMergedIds) {
                                    const isHasMerged = mergedIds.filter((id) => id === unMergedId).length > 0
                                    if (isHasMerged) {
                                        continue
                                    }
                                    // 保存新的id
                                    mergedUsers[j].ids.push(unMergedId)
                                    // 同步更新 users-departments- result的 sum
                                    mergedUsers[j].sum = mergedUsers[j].sum + 1
                                    hasMergedDepartment.sum = hasMergedDepartment.sum + 1
                                    mergedResult.sum = mergedResult.sum + 1
                                }
                                break;
                            }
                            // 如果是新用户的统计数据，则直接保存
                            if (j === mergedUsers.length - 1) {
                                hasMergedDepartment.users.push(unMergedUsers[k])
                                // 同步更新 departments- result的 sum
                                hasMergedDepartment.sum = hasMergedDepartment.sum + unMergedUsers[k].sum
                                mergedResult.sum = mergedResult.sum + unMergedUsers[k].sum
                                break
                            }
                        }
                    }
                    break
                }
                // 新的统计数据，则直接保存
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
    getDeptTodaySum
}