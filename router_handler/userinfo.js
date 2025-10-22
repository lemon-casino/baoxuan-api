// 处理图片文件中间件
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
// 导入加密模块
const bcrypt = require("bcryptjs");
// 导入模型
const UsersModel = require("../model/users");
const RolesModel = require("../model/roles");
const MenusModel = require("../model/menus");
const RolesMenusModel = require("../model/roles-menus");
const usersTagsService = require("@/service/usersTagsService")
const dd = require("../core/dingDingReq/yiDaReq");
// 引入封装好的redis
const redisUtil = require("../utils/redisUtil.js");
const dd_data = require("../service/dingDingService.js");
// 管理人员白名单
const whiteList = require("../config/whiteList");
const {redisKeys} = require("../const/redisConst")
const globalGetter = require("../global/getter")
const departmentService = require("../service/departmentService")
const biResponse = require("../utils/biResponse")

// 部门数据集合
const dep_list = [
    {
        dept_id: 482254100,
        name: "运营部",
        parent_id: 0,
        leader: true,
    },
    {
        dept_id: 55751338,
        name: "客服部",
        parent_id: 0,
        leader: true,
    },
    {
        dept_id: 59831246,
        name: "物流部",
        parent_id: 0,
        leader: true,
    },
    {
        dept_id: 60067028,
        leader: true,
        name: "财务部",
        parent_id: 0,
    },
    {
        dept_id: 111487146,
        leader: true,
        name: "人事部",
        parent_id: 0,
    },
    {
        dept_id: 482162119,
        leader: true,
        name: "视觉部",
        parent_id: 0,
    },
    {
        dept_id: 902515853,
        leader: true,
        name: "执行中台",
        parent_id: 0,
    },
    {
        dept_id: 902643613,
        leader: true,
        name: "管理中台",
        parent_id: 0,
    },
    {
        dept_id: 902880862,
        leader: true,
        name: "产品部",
        parent_id: 0,
    },
    {
        dept_id: 916291839,
        leader: true,
        name: "数据中台",
        parent_id: 0,
    },
];
// 获取token
const getToken = async () => {
    const reply = await redisUtil.get(redisKeys.DDToken);
    return JSON.parse(reply);
};
// 导入需要的验证规则对象
const {
    update_userinfo_schema,
    update_password_schema,
} = require("../schema/userinfo");
const e = require("express");

// 获取角色资源的方法
const getResource = async (role_id) => {
    // 所有按钮的父id集合（重复）
    let all_parent_ids = [];
    // 所有按钮的父id（去除重复）
    let parent_ids = [];
    // 返回的按钮集合 按钮项格式为{menu_id:xx,btns:[xx,xx]}
    const buttons = [];
    // 获取角色菜单表中此角色id的所有记录
    const roleResource = await RolesMenusModel.findAll({
        where: {role_id: role_id},
    });
    // 获得此角色id的拥有权限id
    let all_menu_ids = roleResource.map((resource) => {
        return resource.menu_id;
    });
    // 将权限id数组去重
    all_menu_ids = Array.from(new Set(all_menu_ids));
    // 从菜单表获取此角色id拥有权限详细信息
    const all_menus = await MenusModel.findAll({
        where: {menu_id: all_menu_ids},
        attributes: ["menu_id", "parent_id", "type", "permission"],
    });
    // 获取目录及菜单的id数组
    const menu__arr = all_menus.filter((menu) => menu.type === "M");
    const menu_ids = menu__arr.map((menu) => menu.menu_id);
    // 将获取的按钮数组转化为对应的格式
    const btn_arr = all_menus.filter((menu) => menu.type === "B");
    btn_arr.forEach((button) => {
        all_parent_ids.push(button.parent_id);
    });
    parent_ids = Array.from(new Set(all_parent_ids));
    parent_ids.forEach((item) => {
        buttons.push({menu_id: item, btns: []});
    });
    btn_arr.forEach((button) => {
        parent_ids.forEach((parent) => {
            if (button.parent_id === parent) {
                buttons.forEach((item) => {
                    if (item.menu_id === parent) item.btns.push(button.permission);
                });
            }
        });
    });
    return {
        menu_ids,
        buttons,
    };
};

// 获取用户基本信息的处理函数
exports.getUserinfo = async (req, res) => {
    const user_id = req.user.id

    const user_roles = await UsersModel.findOne({
        attributes: {exclude: ["password"]},
        include: [
            {model: RolesModel, attributes: ["role_id", "role_name", "status"]}
        ],
        where: {
            user_id: user_id,
        },
    })

    const ddUserId = req.user.userId

    let departmentsOfUser = await departmentService.getDepartmentOfUser(ddUserId)

    let departments = await globalGetter.getDepartments()
    if (whiteList.pepArr().includes(ddUserId)) {
        if (departments && departments.length > 0) {
            // 顾虑掉外部的部门
            const outDepartments = ["114410517"]
            departments = departments.filter((depart) => !outDepartments.includes(depart.dept_id.toString()))
            departmentsOfUser = departments.map((depart) => {
                return {
                    dept_id: depart.dept_id,
                    leader: true,
                    dep_detail: {
                        name: depart.name
                    }
                }
            })
        }
    }

    // 根据deptId进行升序排序，可避免子部门出现在一级部门前面，而出现汇总问题
    departmentsOfUser.sort((cur, next) => cur.dept_id - next.dept_id)

    const departmentsTemplate = []
    for (const dept of departmentsOfUser) {
        // 找到该节点的详情
        let curDeptDetails = null;
        for (const department of departments) {
            curDeptDetails = departmentService.findMatchedDepartmentFromRoot(dept.dept_id, department);
            if (curDeptDetails) {
                break;
            }
        }

        const departmentTemplate = {}
        departmentTemplate.dept_id = dept.dept_id
        departmentTemplate.name = dept.dep_detail?.name
        logger.info(dept.dep_detail?.name)
        departmentTemplate.leader = dept.leader
        departmentTemplate.parent_id = curDeptDetails?.parent_id

        if (dept.leader) {
            const dep_chils = curDeptDetails.dep_chil
            let subDepts = []
            if (dep_chils) {
                for (const depChil of dep_chils) {
                    const tmpDept = {}
                    tmpDept.leader = true
                    tmpDept.dept_id = depChil.dept_id
                    tmpDept.name = depChil.name
                    tmpDept.parent_id = dept.dept_id
                    subDepts.push(tmpDept)
                }
                departmentTemplate.subDepts = subDepts
            }
        }

        // 添加或者合并信息
        if (departmentsTemplate.length == 0) {
            departmentsTemplate.push(departmentTemplate)
            continue;
        }
        for (let i = 0; i < departmentsTemplate.length; i++) {
            if (curDeptDetails.parent_id === departmentsTemplate[i].dept_id) {
                if (!departmentsTemplate[i].subDepts) {
                    departmentsTemplate[i].subDepts = []
                }
                departmentsTemplate[i].subDepts.push(departmentTemplate)
                break;
            }
            if (i === departmentsTemplate.length - 1) {
                departmentsTemplate.push(departmentTemplate)
                break;
            }
        }
    }

    // 若无用户信息提示错误
    if (!user_roles) {
        return res.send(biResponse.serverError("帐号未分配角色"));
    }
    let role_ids = [];
    let role_names = [];
    let buttons = [];
    // 获取该用户所拥有的角色
    user_roles.roles.forEach(function (item) {
        if (item.status) {
            role_ids.push(item.role_id);
            role_names.push(item.role_name);
        }
    });
    // 根据角色id数组获取权限
    const resource = await getResource(role_ids);
    // 将btns合并buttons数组
    resource.buttons.forEach((button) => {
        buttons = buttons.concat(button.btns);
    });
    // 根据菜单id数组获取菜单详细信息
    const menus = await MenusModel.getListTree({menu_id: resource.menu_ids});

    // 获取用户的tags
    const userTags = await usersTagsService.getUserTags(ddUserId)
    return res.send(biResponse.success({
            roles: role_names,
            user_id: user_id,
            name: user_roles.username,
            nickname: user_roles.nickname,
            email: user_roles.email,
            avatar: user_roles.user_pic,
            menus: menus,
            buttons: buttons,
            dep_list: departmentsTemplate,
            admin: whiteList.pepArr().includes(ddUserId),
            tags: userTags
        }
    ))
};
// 更新用户基本信息的处理函数
exports.updateUserInfo = (req, res, next) => {
    const {value, error} = update_userinfo_schema.validate(req.body);
    if (error) {
        return next(error);
    }
    const user_id = req.user.id;
    const result = UsersModel.update(value, {
        where: {
            user_id: user_id,
        },
    });
    result.then(function (ret) {
        if (ret) {
            return res.send(biResponse.success(ret));
        } else {
            return res.send(biResponse.serverError(ret));
        }
    });
};
// 重置密码接口处理函数
exports.updatepwd = (req, res, next) => {
    const {value, error} = update_password_schema.validate(req.body);
    if (error) {
        return next(error);
    }
    if (value.password !== value.repassword) {
        return res.send(biResponse.serverError("两次密码输入不一致"));
    }
    const user_id = req.user.id;
    const old_password = value.old_password;
    UsersModel.findOne({where: {user_id: user_id}}).then(function (user) {
        if (!user) {
            return res.send(biResponse.serverError("用户不存在"));
        }
        // 判断密码是否与数据库密码一致
        const compareResult = bcrypt.compareSync(old_password, user.password);
        if (!compareResult) {
            return res.send(biResponse.serverError("原密码不正确"));
        }
        const data = {
            password: bcrypt.hashSync(value.password, 10),
            update_time: new Date(),
        };
        const result = UsersModel.update(data, {
            where: {
                user_id: user_id,
            },
        });
        result.then(function (ret) {
            if (ret) {
                return res.send(biResponse.success(ret));
            } else {
                return res.send(biResponse.serverError(ret));
            }
        });
    });
};
// 更新用户头像接口
exports.updateAvatar = (req, res) => {
    // 获取登录用户的id
    let user_id = req.user.id;
    let info = {};
    // 初始化处理文件对象
    let form = new formidable.IncomingForm();
    form.uploadDir = "./public/avatar"; // 指定解析对象（图片）存放的目录
    form.keepExtensions = true; //保留后缀名

    form.parse(req, function (error, fields, files) {
        if (error) {
            info.code = 1;
            info.message = "上传头像失败";
            info.data = null;
            res.send(info);
        }
        // fields 除了图片外的信息
        // files 图片信息
        console.dir(fields);
        console.dir(files);
        const generateFilename = (originalFilename, path) => {
            let names = originalFilename.split(".");
            path = path.replace("invalid-name", "");
            return `${path}${names[0]}_${req.user.id}.${names[1]}`;
        };
        const file = files.file ?? files.avatar;
        // 通过fs更改文件名
        const newFilePath = generateFilename(file.originalFilename, file.filepath);
        fs.rename(file.filepath, newFilePath, (err) => {
            if (err) {
                console.log("重命名失败");
                console.log(err);
            } else {
                console.log(
                    `已经保存为${generateFilename(
                        file.newFilename,
                        file.originalFilename,
                        file.filepath
                    )}`
                );
            }
        });
        const result = UsersModel.update(
            {user_pic: newFilePath},
            {
                where: {
                    user_id: user_id,
                },
            }
        );
        result.then(function (ret) {
            if (ret) {
                return res.send(biResponse.success({srcUrl: newFilePath}));
            } else {
                return res.send(biResponse.serverError(ret));
            }
        });
    });
};
