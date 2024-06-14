const models = require('../model')
const _ = require("lodash")
const globalGetter = require("../global/getter")
const algorithmUtil = require("../utils/algorithmUtil")

/**
 * 查找部门详情
 * @param deptId
 * @returns {Promise<*>}
 */
const getDepartmentDetails = async (deptId) => {
    const departments = await globalGetter.getDepartments()
    return algorithmUtil.getJsonFromUnionFormattedJsonArr(departments, "dep_chil", "dept_id", deptId)
}

/**
 * 查找部门下的员工
 * @param deptId
 * @returns {Promise<void>}
 */
const getDepartmentUsers = async (deptId) => {
    const departmentsUsers = await globalGetter.getUsersOfDepartments()
    const departmentUsers = algorithmUtil.getJsonFromUnionFormattedJsonArr(_.cloneDeep(departmentsUsers), "dep_chil", "dept_id", deptId)
    return departmentUsers && departmentUsers.dep_user || []
}

/**
 * 获取部门数据
 * @returns {Promise<void>}
 */
const getDepartmentsFromRedis = async () => {
    const departments = await globalGetter.getDepartments()
    return departments
}

/**
 * 同步部门数据到数据库(忽略存在的情况)
 *
 * @returns {Promise<void>}
 */
const saveDepartmentToDbIgnoreExist = async (depts) => {
    const loopSaveDept = async (depts) => {
        for (const dept of depts) {
            try {
                await models.deptsModel.create({
                    deptId: dept.dept_id, deptName: dept.name, parentId: dept.parent_id
                })
            } catch (e) {
                if (e.original.code !== "ER_DUP_ENTRY") {
                    throw e
                }
            }

            if (dept.dep_chil && dept.dep_chil.length > 0) {
                await loopSaveDept(dept.dep_chil)
            }
        }
    }
    await loopSaveDept(depts)
}

module.exports = {
    getDepartmentDetails,
    getDepartmentUsers,
    getDepartments: getDepartmentsFromRedis,
    saveDepartmentToDbIgnoreExist
}