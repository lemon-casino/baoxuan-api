const globalGetter = require("../global/getter")
const departmentService = require("../service/departmentService")

/**
 * 对结果数据去掉结果中不在deptId所指部门的信息
 * @param statistic {sum: 0, departments: []}
 * @param deptId
 * @returns {Promise<*>}
 */
const removeUnsatisfiedDeptStatistic = async (statistic, deptId) => {
    // 用户存在多部门的情况，不要根据deptId过滤需要的部门信息
    const departments = await globalGetter.getDepartments();
    let departmentDetails = null
    for (const department of departments) {
        departmentDetails = departmentService.findMatchedDepartmentFromRoot(deptId, department)
        if (departmentDetails) {
            break;
        }
    }

    const filteredDeptStatistic = statistic.departments.filter((item) => {
        return departmentService.hasMatchedDeptName(item.deptName, departmentDetails)
    })

    const result = {ids: [], sum: 0, departments: filteredDeptStatistic}
    result.sum = 0
    for (const dept of filteredDeptStatistic) {
        result.sum = result.sum + dept.sum
        result.ids = result.ids.concat()
    }
    return result;
}

module.exports = {
    removeUnsatisfiedDeptStatistic,
}