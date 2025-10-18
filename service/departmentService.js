const whiteList = require("@/config/whiteList")
const redisRepo = require("@/repository/redisRepo")
const departmentUsersRepo = require("@/repository/departmentUsersRepo")
const algorithmUtil = require("@/utils/algorithmUtil")
const globalGetter = require("@/global/getter")
const NotFoundError = require("@/error/http/notFoundError")

/**
 * 获取指定部门(parentDeptId)的所有子部门和人员信息
 *
 * @param deps
 * @param parentDeptId
 * @returns {Promise<*[]>}
 */
const getSubDepsOfDeptLeader = async (deps, parentDeptId) => {
    const res = []
    const parentDep = algorithmUtil.getJsonFromUnionFormattedJsonArr(deps, "dep_chil", "dept_id", parentDeptId) // deps.filter((item) => item.dept_id == parentDeptId)
    if (!parentDep) {
        return res
    }
    if (!parentDep.dep_chil || parentDep.dep_chil.length === 0) {
        return res
    }
    for (const childDept of parentDep.dep_chil) {
        const children = await getSubDepsOfDeptLeader(parentDep.dep_chil, childDept.dept_id);
        res.push({
            dep_name: childDept.name,
            dept_id: childDept.dept_id,
            parent_id: childDept.parent_id,
            dep_child: children,
            // 部门主管在子部门下也是leader
            leader: true
        })
    }
    return res
}

/**
 * 获取用户完整的用户信息：补充上用户所在部门是leader时所有的下级部门信息
 *
 * @param ddAccessToken
 * @param ddUserId
 * @returns {Promise<*|*[]>}
 */
const getUserCompletedDeps = async (ddAccessToken, ddUserId) => {
    const userDetails = await redisRepo.getAllUsersDetail();
    // 返回用户详情
    const userInfo = userDetails.filter((item) => item.userid === ddUserId);
    if (userInfo.length === 0) {
        return []
    }
    // 用户所属子部门
    const subDepartmentsOfUser = userInfo[0].leader_in_dept;
    // 获取部门详情
    let newSubDepartmentsDetails = [];
    for (const dept of subDepartmentsOfUser) {
        newSubDepartmentsDetails.push({
            ...dept.dep_detail,
            leader: dept.leader,
        });
    }
    // 部门层级数据结构
    const treeFormatDeps = refactorFlatteningDepsToTree(await Promise.all(newSubDepartmentsDetails));

    // 递归判断当前身份在哪个部门下是主管 获取是主管身份下的所有子部门包括人员信息
    async function fillChildDepsByLeaderTag(deps, sourceDeps) {
        for (let dept of deps) {
            if (dept.leader) {
                dept.dep_child = (await getSubDepsOfDeptLeader(sourceDeps, dept.dept_id)) || []
            }
            if (dept.dep_child.length > 0) {
                dept = await fillChildDepsByLeaderTag(dept.dep_child, sourceDeps)
            }
        }
        return deps
    }

    const allDeps = await globalGetter.getDepartments()
    return (await fillChildDepsByLeaderTag(treeFormatDeps, allDeps))
}

/**
 * 将扁平化的deps 根据结构中的parent_id 转成tree的结构
 *
 * @param deps
 * @returns {*[]}
 */
const refactorFlatteningDepsToTree = (deps) => {
    const uniqueDeps = {}
    for (let i = 0; i < deps.length; i += 1) {
        uniqueDeps[deps[i].dept_id] = i;
        deps[i].dep_child = [];
    }

    const treeFormatDeps = []
    for (let i = 0; i < deps.length; i += 1) {
        const currDep = deps[i];
        const currDepHasValidParent = currDep.parent_id && uniqueDeps[currDep.parent_id]
        if (currDepHasValidParent) {
            const parentNodeIndex = uniqueDeps[currDep.parent_id]
            deps[parentNodeIndex].dep_child.push(currDep);
        } else {
            treeFormatDeps.push(currDep)
        }
    }
    return treeFormatDeps;
};

const getDepartmentsOfUser = async (ddUserId, ddAccessToken, parentDepartmentId, subDepartmentId) => {
    let dep_info = [];
    if (whiteList.pepArr().includes(ddUserId)) {
        const allDeps = await globalGetter.getDepartments();
        const subDepartments = await getSubDepsOfDeptLeader(allDeps, parentDepartmentId)
        if (subDepartments.length === 0) {
            const parentDepartmentDetails = allDeps.filter((item) => item.dept_id == parentDepartmentId);
            parentDepartmentDetails.forEach((element) => {
                element.leader = true;
            });
            dep_info = parentDepartmentDetails;
        } else {
            dep_info = subDepartments.filter((item) => item.dept_id == subDepartmentId);
        }
    } else {
        // 返回用户详情
        const lev_dep_list = await getUserCompletedDeps(ddAccessToken, ddUserId);
        const lev_dep_lists = lev_dep_list.filter(
            (item) => item.dept_id == parentDepartmentId
        );
        // 如果子部门为空
        if (lev_dep_lists[0].dep_child.length === 0) {
            dep_info = lev_dep_lists;
        } else {
            dep_info = lev_dep_list.filter((item) => item.dept_id == parentDepartmentId);
        }
        // 判断当前用户是否是管理员
        if (dep_info[0].dep_child.length > 0) {
            const c_dep = dep_info[0].dep_child.filter(
                (item) => item.dept_id === subDepartmentId
            );
            dep_info = c_dep;
        }
    }
    return dep_info
}

// 部门去重
const mergeDataByDeptId = (data) => {
    return data.reduce((acc, cur) => {
        let existingIndex = acc.findIndex((item) => item.dept_id === cur.dept_id);

        if (existingIndex === -1) {
            acc.push(cur);
        } else {
            acc[existingIndex].liuchengdata = [
                ...acc[existingIndex].liuchengdata,
                ...cur.liuchengdata,
            ];
        }
        return acc;
    }, []);
};

/**
 * 获取用户所在的部门-项目组-是否leader 信息
 * @param userId
 * @returns {Promise<*[]>}
 */
const getDepartmentOfUser = async (userId) => {
    let departmentsOfCurrentUser = []
    let allUsersDetail = await globalGetter.getUsers()
    if (!allUsersDetail || allUsersDetail.length === 0) {
        allUsersDetail = await redisRepo.getAllUsersDetail()
    }
    if (allUsersDetail && allUsersDetail.length > 0) {
        for (const item of allUsersDetail) {
            if (item.userid === userId) {
                departmentsOfCurrentUser = departmentsOfCurrentUser.concat(item.leader_in_dept)
            }
        }
    }
    return departmentsOfCurrentUser
}

/**
 * 根据deptId， 从department 中找到与之相同的节点
 * @param deptId
 * @param department
 * @returns {null|*}
 */
const findMatchedDepartmentFromRoot = (deptId, department) => {
    const {dept_id, dep_chil} = department
    if (!dept_id) {
        return null
    }
    if (dept_id.toString() === deptId.toString()) {
        return department
    }
    if (dep_chil && dep_chil.length > 0) {
        for (const subDep of dep_chil) {
            const deptDetails = findMatchedDepartmentFromRoot(deptId.toString(), subDep)
            if (deptDetails) {
                return deptDetails
            }
        }
        return null
    }
}

const getDepartmentByDeptName = (deptName, department) => {
    const {name, dep_chil} = department
    if (!name) {
        return null
    }
    if (name === deptName) {
        return department
    }
    if (dep_chil && dep_chil.length > 0) {
        for (const subDep of dep_chil) {
            const deptDetails = getDepartmentByDeptName(deptName, subDep)
            if (deptDetails) {
                return deptDetails
            }
        }
        return null
    }
}


/**
 * 从节点和其子节点中根据部门分类获取用户数据
 * @param department 原始的department结构
 * @returns {{deptName: "", deptUsers: [], depChil:[]}}
 */
const simplifiedUsersOfDepartment = (department) => {
    const satisfiedUsers = {}
    const {dep_user, dep_chil} = department;
    if (dep_user && dep_user.length > 0) {
        satisfiedUsers["deptName"] = department.name
        satisfiedUsers["deptUsers"] = dep_user
    }
    if (dep_chil && dep_chil.length > 0) {
        satisfiedUsers["depChil"] = []
        for (const dep of dep_chil) {
            if (dep.dep_user && dep.dep_user.length > 0) {
                satisfiedUsers["depChil"].push(simplifiedUsersOfDepartment(dep))
            }
        }
    }
    return satisfiedUsers
}


/**
 * 根据deptId获取节点原始数据
 * @param deptId
 * @returns {null}
 */
const getDepartmentWithUsers = async (deptId) => {
    const usersOfDepartments = await globalGetter.getUsersOfDepartments()
    let requiredDepartment = null
    for (const usersOfDepartment of usersOfDepartments) {
        requiredDepartment = findMatchedDepartmentFromRoot(deptId, usersOfDepartment)
        if (requiredDepartment) {
            break;
        }
    }
    return requiredDepartment;
}

const getNewStructureDeps = (deps) => {
    const newDeps = []
    for (const dep of deps) {
        const newDep = {
            deptId: dep.dept_id,
            deptName: dep.name || dep.dep_detail.name,
            isLeader: dep.leader,
            children: []
        }
        if (dep.dep_chil && dep.dep_chil.length > 0) {
            newDep.children = getNewStructureDeps(dep.dep_chil)
        }
        newDeps.push(newDep)
    }
    return newDeps
}

const getDepartments = async (userId) => {
    const hasMaxDataAuth = whiteList.pepArr().includes(userId)

    let userDeps = []
    if (hasMaxDataAuth) {
        userDeps = await globalGetter.getDepartments()
    } else {
        userDeps = await getDepartmentOfUser(userId)
    }

    const newUserDeps = getNewStructureDeps(userDeps)

    for (const userDep of newUserDeps) {
        let newSubDeps = []
        // 获取该部门下的所有子部门
        if (userDep.leader) {
            const allDeps = await globalGetter.getDepartments()
            const subDeps = algorithmUtil.getJsonFromUnionFormattedJsonArr(allDeps, "dep_chil", "parent_id", userDep.dept_id)
            newSubDeps = getNewStructureDeps(subDeps)
        }

        newUserDeps.children = newSubDeps
    }
    return newUserDeps
}

const hasMatchedDeptName = (deptName, department) => {
    if (department.name === deptName) {
        return true
    }
    if (department.dep_chil) {
        for (const subDept of department.dep_chil) {
            const result = hasMatchedDeptName(deptName, subDept)
            if (result) {
                return true
            }
        }
    }
    return false
}

/**
 * 获取部门下的用户信息
 * @param deptId
 * @returns {Promise<*>}
 */
const getUsersOfDepartment = async (deptId) => {
    const departmentsWithUser = await globalGetter.getUsersOfDepartments()
    let satisfiedDepartment = null
    for (const department of departmentsWithUser) {
        satisfiedDepartment = findMatchedDepartmentFromRoot(deptId, department)
        if (satisfiedDepartment) {
            break
        }
    }
    if (satisfiedDepartment) {
        return satisfiedDepartment.dep_user
    }
    throw new NotFoundError(`未找到部门${deptId}的信息`)
}

const getAllUsers = async () => {
    const allUsers = []
    const userIds = {}
    const departmentUsers = await globalGetter.getUsersOfDepartments()
    for (const departmentUser of departmentUsers) {
        const users = departmentUser.dep_user
        for (const user of users) {
            if (!Object.keys(userIds).includes(user.userid)) {
                allUsers.push(user)
                userIds[user.userid] = 1
            }
        }
    }
    return allUsers
}

module.exports = {
    getDepartments,
    getDepartmentsOfUser,
    getUserCompletedDeps,
    getSubDepsOfDeptLeader,
    mergeDataByDeptId,
    getDepartmentOfUser,
    getUsersOfDepartment,
    findMatchedDepartmentFromRoot,
    getDepartmentByDeptName,
    simplifiedUsersOfDepartment,
    getDepartmentWithUsers,
    hasMatchedDeptName,
    getAllUsers
}