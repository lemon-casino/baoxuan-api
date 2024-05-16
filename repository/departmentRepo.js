const globalGetter = require("../global/getter")
const algorithmUtil = require("../utils/algorithmUtil")

/**
 * 查找部门详情
 * @param deptId
 * @returns {Promise<*>}
 */
const getDepartmentDetails = async (deptId) => {
    const departments = await globalGetter.getDepartments()
    return algorithmUtil.recursionJsonArr(departments, "dep_chil", "dept_id", deptId)
}

/**
 * 查找部门下的员工
 * @param deptId
 * @returns {Promise<void>}
 */
const getDepartmentUsers = async (deptId) => {
    const departmentsUsers = await globalGetter.getUsersOfDepartments()
    const departmentUsers = algorithmUtil.recursionJsonArr(departmentsUsers, "dep_chil", "dept_id", deptId)
    return departmentUsers && departmentUsers.dep_user || []
}

module.exports = {
    getDepartmentDetails,
    getDepartmentUsers
}