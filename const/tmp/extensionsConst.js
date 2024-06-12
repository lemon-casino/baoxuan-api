/**
 * 扩展Redis中users中的部门信息：用于统计
 *
 * 也可为用户添加的虚拟部门
 * 如：天鹏在执行中台，会为视觉部分配外包美编任务，并将工作量统计到视觉部
 *
 * @type {{}}
 */
const userDeptExtensions = [
    {
        userId: "0625414814781392",
        userName: "张杰",
        attachValues: {multiDeptStat: true},
        // 实际所跨部门的扩展
        depsExtensions: [
            {
                deptId: "925489891",
                deptName: "产品设计部",
                statForms: [
                    {formId: "FORM-2529762FC54F44849153E5564C1628FAHFKN", formName: "开发新品设计流程"},
                    {formId: "FORM-CC0B476071F24581B129A24835910B81AK56", formName: "宝可梦新品开发流程"},
                    {formId: "FORM-A4E422EFCDB643A6B21648BFE79FC13DPKZO", formName: "包装设计流程"}
                ]
            },
            {
                deptId: "482162119",
                deptName: "视觉部",
                statForms: [
                    {formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1", formName: "天猫链接上架流程"},
                    {formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3", formName: "运营新品流程"},
                    {formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1", formName: "运营拍摄流程"},
                    {formId: "FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS", formName: "美编任务运营发布"}
                ]
            }
        ]
    },
    {
        userId: "281338354935548795",
        userName: "赵天鹏",
        attachValues: {multiDeptStat: true},
        virtualDeps: [
            {
                "isVirtual": true,
                "dept_id": 482162119,
                "leader": false,
                "dep_detail": {
                    "auto_add_user": true,
                    "auto_approve_apply": false,
                    "brief": "",
                    "create_dept_group": true,
                    "dept_group_chat_id": "chat18c9c1f81e56406e96a1bbf5a60564ec",
                    "dept_id": 482162119,
                    "dept_manager_userid_list": [
                        "0625414814781392"
                    ],
                    "dept_permits": [],
                    "emp_apply_join_dept": false,
                    "extention": "{\"faceCount\":\"47\"}",
                    "group_contain_sub_dept": false,
                    "hide_dept": false,
                    "hide_scene_config": {
                        "active": false,
                        "chatbox_subtitle": true,
                        "node_list": true,
                        "profile": true,
                        "search": true
                    },
                    "name": "视觉部",
                    "order": 5,
                    "org_dept_owner": "013732072734966745",
                    "outer_dept": false,
                    "outer_permit_depts": [],
                    "outer_permit_users": [],
                    "outer_scene_config": {
                        "active": false,
                        "chatbox_subtitle": true,
                        "node_list": true,
                        "profile": true,
                        "search": true
                    },
                    "parent_id": 1,
                    "user_permits": []
                },
                "statForms": [
                    {formId: "FORM-30500E23B9C44712A5EBBC5622D3D1C4TL18", formName: "外包拍摄视觉流程"},
                    {formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV", formName: "外包修图视觉流程"}
                ]
            }
        ]
    },
    {
        userId: "01622516570029465425",
        userName: "王耀庆",
        attachValues: {multiDeptStat: true},
        virtualDeps: [
            {
                "isVirtual": true,
                "dept_id": 482162119,
                "leader": false,
                "dep_detail": {
                    "auto_add_user": true,
                    "auto_approve_apply": false,
                    "brief": "",
                    "create_dept_group": true,
                    "dept_group_chat_id": "chat18c9c1f81e56406e96a1bbf5a60564ec",
                    "dept_id": 482162119,
                    "dept_manager_userid_list": [
                        "0625414814781392"
                    ],
                    "dept_permits": [],
                    "emp_apply_join_dept": false,
                    "extention": "{\"faceCount\":\"47\"}",
                    "group_contain_sub_dept": false,
                    "hide_dept": false,
                    "hide_scene_config": {
                        "active": false,
                        "chatbox_subtitle": true,
                        "node_list": true,
                        "profile": true,
                        "search": true
                    },
                    "name": "视觉部",
                    "order": 5,
                    "org_dept_owner": "013732072734966745",
                    "outer_dept": false,
                    "outer_permit_depts": [],
                    "outer_permit_users": [],
                    "outer_scene_config": {
                        "active": false,
                        "chatbox_subtitle": true,
                        "node_list": true,
                        "profile": true,
                        "search": true
                    },
                    "parent_id": 1,
                    "user_permits": []
                },
                "statForms": [
                    {formId: "FORM-30500E23B9C44712A5EBBC5622D3D1C4TL18", formName: "外包拍摄视觉流程"},
                    {formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV", formName: "外包修图视觉流程"}
                ]
            }
        ]
    }
]

/**
 * 获取扩展的数据
 *
 * @returns {{}}
 */
const getExtensions = () => {
    return userDeptExtensions
}

/**
 * 获取配置了指定虚拟部门的用户
 *
 * @param deptId
 * @returns {*[]}
 */
const getUsersHaveVirtualTargetDept = (deptId) => {
    const users = []
    const usersWithVirtualDeps = userDeptExtensions.filter(item => item.virtualDeps)
    for (const userDeps of usersWithVirtualDeps) {
        const hasTargetVirtualDept = userDeps.virtualDeps.filter(item => item.dept_id.toString() === deptId.toString()).length > 0
        if (hasTargetVirtualDept) {
            users.push({userId: userDeps.userId, userName: userDeps.userName})
        }
    }
    return users
}

/**
 * 获取用户的extension信息
 *
 * @param userId
 * @returns {*}
 */
const getUserExtensions = (userId) => {
    return userDeptExtensions.filter(item => item.userId === userId)
}

/**
 * 获取用户的虚拟部门信息
 *
 * @param userId
 * @returns {[{leader: boolean, statForms: [{formId: string, formName: string},{formId: string, formName: string}], isVirtual: boolean, dept_id: number, dep_detail: {brief: string, dept_permits: [], extention: string, hide_scene_config: {search: boolean, chatbox_subtitle: boolean, profile: boolean, active: boolean, node_list: boolean}, outer_permit_users: [], emp_apply_join_dept: boolean, org_dept_owner: string, outer_dept: boolean, auto_approve_apply: boolean, dept_group_chat_id: string, outer_scene_config: {search: boolean, chatbox_subtitle: boolean, profile: boolean, active: boolean, node_list: boolean}, group_contain_sub_dept: boolean, auto_add_user: boolean, dept_manager_userid_list: [string], parent_id: number, hide_dept: boolean, name: string, outer_permit_depts: [], user_permits: [], dept_id: number, create_dept_group: boolean, order: number}}]|*[]}
 */
const getUserVirtualDeps = (userId) => {
    const tmpUsers = getUserExtensions(userId)
    if (tmpUsers.length === 0) {
        return []
    }
    return tmpUsers[0].virtualDeps || []
}

/**
 * 获取用户的部门扩展信息
 *
 * @param userId
 * @returns {[{deptName: string, deptId: string, statForms: [{formId: string, formName: string},{formId: string, formName: string},{formId: string, formName: string}]},{deptName: string, deptId: string, statForms: [{formId: string, formName: string},{formId: string, formName: string},{formId: string, formName: string},{formId: string, formName: string}]}]|*[]}
 */
const getUserDepsExtensions = (userId) => {
    const tmpUsers = getUserExtensions(userId)
    if (tmpUsers.length === 0) {
        return []
    }
    return tmpUsers[0].depsExtensions || []
}

module.exports = {
    userDeptExtensions,
    getExtensions,
    getUserVirtualDeps,
    getUserDepsExtensions,
    getUsersHaveVirtualTargetDept
}