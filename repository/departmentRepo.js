const models = require('@/model')
const _ = require("lodash")
const globalGetter = require("@/global/getter")
const algorithmUtil = require("@/utils/algorithmUtil")

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
const saveDepartmentToDb = async (dept) => {
    return await models.deptsModel.create({
        deptId: dept.dept_id, deptName: dept.name, parentId: dept.parent_id
    })
}

/**
 * 获取数据中部门下的人员信息
 *
 * @param deptId
 */
const getDbDeptUsers = async (deptId) => {
    const deptUsers = await models.deptsUsersModel.findAll({
        where: {deptId}
    })
    const userIds = deptUsers.map(item => item.userId)
    const users = await models.usersModel.findAll({
        where: {dingdingUserId: {$in: userIds}}
    })
    return users.map(user => user.get({plain: true}))
}

module.exports = {
    getDbDeptUsers,
    getDepartmentDetails,
    getDepartmentUsers,
    getDepartments: getDepartmentsFromRedis,
    saveDepartmentToDb
}