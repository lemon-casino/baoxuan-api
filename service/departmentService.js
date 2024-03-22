const whiteList = require("../config/whiteList");
const redisService = require("../service/redisService")
const dateUtil = require("../utils/dateUtil")
const globalGetter = require("../global/getter")

// 获取指定部门Id的所有子部门和人员信息
const getSubDeptLev = async (depLists, dept_id) => {
    const res = [];
    const depInfo = depLists.filter((item) => item.dept_id == dept_id);
    for (const dept of depInfo) {
        if (dept.dep_chil && dept.dep_chil.length > 0) {
            for (const dept_c of dept.dep_chil) {
                const children = await getSubDeptLev(dept.dep_chil, dept_c.dept_id);
                res.push({
                    dep_name: dept_c.name,
                    dept_id: dept_c.dept_id,
                    parent_id: dept_c.parent_id,
                    dep_child: children,
                    leader: true,
                });
            }
        }
    }
    return res;
};

// 返回用户部门层级
const getDepLev = async (ddAccessToken, ddUserId) => {
    const userDetails = await redisService.getAllUsersDetail();
    // 返回用户详情
    const userInfo = userDetails.filter((item) => item.userid === ddUserId);
    if (userInfo.length > 0) {
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
        const subDepartmentsOfTree = listToTree(await Promise.all(newSubDepartmentsDetails));

        // 递归判断当前身份在哪个部门下是主管 获取是主管身份下的所有子部门包括人员信息
        async function dg_dep(dep_list) {
            for (const item of dep_list) {
                if (item.leader) {
                    await dateUtil.delay(50);
                    item.dep_child =
                        (await getSubDeptLev(await globalGetter.getDepartments(), item.dept_id)) || [];
                }
                if (item.dep_child.length > 0) {
                    await dg_dep(item.dep_child);
                }
            }
        }

        await dg_dep(subDepartmentsOfTree);
        return subDepartmentsOfTree;
    } else {
        return [];
    }
};

// 获取部门层级数据结构
const listToTree = (list) => {
    const map = {};
    let node;
    const roots = [];
    for (let i = 0; i < list.length; i += 1) {
        map[list[i].dept_id] = i;
        list[i].dep_child = [];
    }
    for (let i = 0; i < list.length; i += 1) {
        node = list[i];
        if (node.parent_id !== undefined && map[node.parent_id] !== undefined) {
            list[map[node.parent_id]].dep_child.push(list[i]);
        } else {
            roots.push(list[i]);
        }
    }
    return roots;
};

const getDepartmentsOfUser = async (ddUserId, ddAccessToken, parentDepartmentId, subDepartmentId) => {
    let dep_info = [];
    if (whiteList.pepArr().includes(ddUserId)) {
        const allDepts = await globalGetter.getDepartments();
        const subDepartments = await getSubDeptLev(allDepts, parentDepartmentId)
        if (subDepartments.length === 0) {
            const parentDepartmentDetails = allDepts.filter((item) => item.dept_id == parentDepartmentId);
            parentDepartmentDetails.forEach((element) => {
                element.leader = true;
            });
            dep_info = parentDepartmentDetails;
        } else {
            dep_info = subDepartments.filter((item) => item.dept_id == subDepartmentId);
        }
    } else {
        // 返回用户详情
        const lev_dep_list = await getDepLev(ddAccessToken, ddUserId);
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


// 获取部门人员信息
// const getDeptUserLists = async (access_token, dept_id) => {
//     const user_info = [];
//     const cursor = 0;
//     const size = 100;
//
//     const dep_userList = await redisService.getUsersWithJoinLaunchDataUnderDepartment();
//     const diguiDep = async (depList, dept_id) => {
//         const inf = depList.filter((item) => item.dept_id == dept_id);
//         if (inf.length > 0) {
//             for (const userItem of inf[0].dep_user) {
//                 user_info.push({
//                     name: userItem?.name,
//                     userid: userItem?.userid,
//                 });
//             }
//         }
//         for (const item of depList) {
//             if (item.dep_chil && item.dep_chil.length > 0) {
//                 diguiDep(item.dep_chil, dept_id);
//             }
//         }
//     };
//     await diguiDep(dep_userList, dept_id);
//     return user_info;
// };


/**
 * 获取用户所在的部门-项目组-是否leader 信息
 * @param userId
 * @returns {Promise<*[]>}
 */
const getDepartmentOfUser = async (userId) => {
    let departmentsOfCurrentUser = []
    let allUsersDetail = await globalGetter.getUsers()
    if (!allUsersDetail || allUsersDetail.length === 0) {
        allUsersDetail = await redisService.getAllUsersDetail();
    }
    if (allUsersDetail && allUsersDetail.length > 0) {
        for (const item of allUsersDetail) {
            if (item.userid === userId) {
                departmentsOfCurrentUser = departmentsOfCurrentUser.concat(item.leader_in_dept)
            }
        }
    }
    return departmentsOfCurrentUser;
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

const getDepartments = async () => {
    let departments = await globalGetter.getDepartments()
    return departments
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


module.exports = {
    getDepartments,
    getDepartmentsOfUser,
    getDepLev,
    getSubDeptLev,
    mergeDataByDeptId,
    getDepartmentOfUser,
    findMatchedDepartmentFromRoot,
    simplifiedUsersOfDepartment,
    getDepartmentWithUsers,
    hasMatchedDeptName
}