/**
 * 在这里定义和用户相关的路由处理函数，供 /router/user.js 模块进行调用
 */
// 引入用户模型
const UsersModel = require("../model/users");
const RolesModel = require("../model/roles");
const userLogService = require("../service/userLogService")
const userService = require("../service/userService")
const tokenUtil = require("../utils/token")
const UserError = require("../error/userError")
const HttpError = require("../error/http/httpError")
const ParameterError = require("../error/parameterError")

const {Op} = require("sequelize");
// 引入加密模块
const bcrypt = require("bcryptjs");
const Uuid = require("uuid");
// 1. 导入验证表单数据的中间件
let joi = require("joi");
// 2. 导入需要的验证规则对象
const {
    user_login_schema,
    add_user_schema,
    get_list,
    update_user_schema,
    edit_password_schema,
    get_userInfoById_schema,
    delete_user_schema,
} = require("../schema/user");
// 引入生成图形验证码库
const svgCaptcha = require("svg-captcha");
// 引入封装好的redis
const redis = require("../utils/redisUtil.js");
// 引入封装好的token模块和配置信息
const {generateToken, decodedToken, verifyToken} = require("../utils/token");
const tokenConfig = require("../config/index").tokenConfig;
const biResponse = require("../utils/biResponse")
const {redisKeys} = require("../const/redisConst");


/**
 * 获取图形验证码
 */
exports.getCheckCode = async (req, res, next) => {

    try {
        // 生成验证码，获取catcha，有{data,text}两个属性，data为svg格式图片、text为验证码
        const captcha = svgCaptcha.create({
            size: 4, ignoreChars: "0o1lpaqd", color: true, noise: 6, background: "#aead5b", height: 32, width: 100,
        });
        // 验证码键和缓存时间
        const uuid = Uuid.v4();
        const effectTime = 10 * 60;

        // 存入redis
        const result = await redis.setValue(`${redisKeys.QRCodes}:${uuid}`, captcha.text.toLowerCase(), effectTime);
        if (result) {
            res.send({
                code: 200, uuid, textCode: captcha.text, message: "获取验证码成功", data: captcha.data,
            });
        } else {
            throw new HttpError("验证码获取失败")
        }
    } catch (e) {
        next(e)
    }
};
/**
 * 登录路由
 */
exports.login = async (req, res, next) => {
    try {
        const {error, value} = user_login_schema.validate(req.body);
        if (error) {
            throw new HttpError(error)
        }
        // 验证验证码
        const {username, password, checkCode, uuid} = value;
        // const captcha = await redis.getValue(`${redisKeys.QRCodes}:${uuid}`);
        // if (!captcha) {
        //     throw new HttpError("图形验证码已过期，请点击图片刷新")
        // }
        // if (checkCode.toLowerCase() !== captcha.toLowerCase()) {
        //     throw new HttpError("图形验证码不正确，请重新输入")
        // }
        // todo: 先保留
        const user = {
            token: null, refreshToken: null, brief: null, permissions: null, departments: null
        }

        const {token, refreshToken} = await getTokenAndRefreshToken(username, password)

        // 用户基本信息
        const brief = await UsersModel.findOne({
            where: {username: username},
        });
        //
        // if (!brief) {
        //     return res.send(biResponse.format(0, "用户不存在"));
        // }
        // if (brief.status.toString() === "0") {
        //     return res.send(biResponse.format(0, "帐号已停用"));
        // }
        //
        // const compareResult = bcrypt.compareSync(password, brief.password);
        // if (!compareResult) {
        //     return res.send(biResponse.format(1, "密码错误"));
        // }
        //
        // const userDetails = brief.dataValues
        // user.brief = userDetails
        // user.token = "Bearer " + generateToken(
        //     {id: brief.user_id, username: brief.username},
        //     tokenConfig.jwtSecretKey,
        //     tokenConfig.secretKeyExpire
        // )
        //
        // user.refreshToken = generateToken(
        //     {id: brief.user_id, username: brief.username},
        //     tokenConfig.jwtRefrechSecretKey,
        //     tokenConfig.refreshSerectKeyExpire
        // );
        // // 用户角色信息
        // const userRoles = await userRoleRepo.getRoleByUserId(userDetails.user_id)
        //
        // // 权限 菜单和操作
        // const permissions = {menuIds: [], permIds: []}
        // for (const userRole of userRoles) {
        //     const rolePermission = await RolesModel.getResource(userRole.roleId)
        //     permissions.menuIds = permissions.menuIds.concat(rolePermission.menu_ids)
        //     permissions.permIds = permissions.permIds.concat(rolePermission.permIds)
        // }
        // user.permissions = permissions
        //
        // const departments = await departmentService.getDepartments()
        // // todo: 先保留，需要进行排序
        // const departmentsOfUser = await departmentService.getDepartmentOfUser(brief.dingding_user_id)
        // //根据deptId进行升序排序，可避免子部门出现在一级部门前面，而出现汇总问题
        // const sortedDepartmentsOfUser = departmentsOfUser.sort((cur, next) => cur.dept_id - next.dept_id)
        //
        // const departmentsTemplate = []
        // for (const dept of departmentsOfUser) {
        //
        //     // 找到该节点的详情
        //     let curDeptDetails = null;
        //     for (const department of departments) {
        //         curDeptDetails = departmentService.findMatchedDepartmentFromRoot(dept.dept_id, department);
        //         if (curDeptDetails) {
        //             break;
        //         }
        //     }
        //
        //     const departmentTemplate = {}
        //     departmentTemplate.deptId = dept.dept_id
        //     departmentTemplate.deptName = dept.dep_detail.name
        //     departmentTemplate.isLeader = dept.leader
        //
        //     if (dept.leader) {
        //         let subDepts = []
        //         const {dep_chil: dep_chils} = curDeptDetails
        //         for (const depChil of dep_chils) {
        //             const tmpDept = {}
        //             tmpDept.leader = true
        //             tmpDept.deptId = depChil.dept_id
        //             tmpDept.deptName = depChil.name
        //             tmpDept.parentId = dept.dept_id
        //             subDepts.push(tmpDept)
        //         }
        //         departmentTemplate.subDepts = subDepts
        //     }
        //
        //     // 添加或者合并信息
        //     if (departmentsTemplate.length == 0) {
        //         departmentsTemplate.push(departmentTemplate)
        //         continue;
        //     }
        //     for (let i = 0; i < departmentsTemplate.length; i++) {
        //         if (curDeptDetails.parent_id === departmentsTemplate[i].deptId) {
        //             departmentTemplate.subDepts.push(departmentTemplate)
        //             break;
        //         }
        //         if (i === departmentsTemplate.length - 1) {
        //             departmentsTemplate.push(departmentTemplate)
        //             break;
        //         }
        //     }
        // }
        // user.departments = departmentsTemplate

        return res.send(biResponse.success({token, refreshToken}));
    } catch (e) {
        next(e)
    }
};

exports.getTokens = async (req, res, next) => {
    try {
        const {userName, password} = req.body;
        const tokens = await getTokenAndRefreshToken(userName, password);
        return res.send(biResponse.success(tokens))
    } catch (e) {
        next(e)
    }
}

const getTokenAndRefreshToken = async (userName, password) => {
    const brief = await UsersModel.findOne({
        where: {username: userName},
    });

    if (!brief) {
        throw new UserError("用户不存在")
    }

    if (brief.status.toString() === "0") {
        throw new UserError("帐号已停用")
    }

    const compareResult = bcrypt.compareSync(password, brief.password);
    if (!compareResult) {
        throw new UserError("密码错误")
    }


    const token = "Bearer " + generateToken({
        id: brief.user_id,
        userId: brief.dingding_user_id,
        username: brief.username
    }, tokenConfig.jwtSecretKey, tokenConfig.secretKeyExpire)

    const refreshToken = generateToken({
        id: brief.user_id,
        userId: brief.dingding_user_id,
        username: brief.username
    }, tokenConfig.jwtRefrechSecretKey, tokenConfig.refreshSerectKeyExpire);
    return {token, refreshToken}
}

const checkCode = async (req, res) => {
    const {username, password} = req.body


    return res.send(biResponse.success({token: user.token, refreshToken: user.refreshToken}));
}
/**
 * 添加用户
 */
exports.addUser = (req, res, next) => {
    // 验证入参，错误时抛出以捕获
    const {error, value} = add_user_schema.validate(req.body);
    if (error) {
        return next(error);
    }
    // 查询是否存在相同用户名
    UsersModel.findAll({
        where: {
            username: value.username,
        },
    }).then(async (result) => {
        if (result && result.length) return res.send(biResponse.serverError("用户名被占用，请更换后重试！")); else {
            // const password = 'admin123';
            const password = value.password;
            // 加密
            value.password = bcrypt.hashSync(password, 10);
            const result = await UsersModel.addUser(value);
            // 比较明文密码和加密密码
            const compareResult = bcrypt.compareSync(password, result.password);
            if (compareResult) {
                // 用浏览器可识别的固定格式生成token
                const token = "Bearer " + generateToken({
                    id: result.user_id,
                    username: result.username
                }, tokenConfig.jwtSecretKey, tokenConfig.secretKeyExpire);
                // 生成长时refreshToken
                const refreshToken = generateToken({
                    id: result.user_id,
                    username: result.username
                }, tokenConfig.jwtRefrechSecretKey, tokenConfig.refreshSerectKeyExpire);
                return res.send(biResponse.success({
                    token, refreshToken,
                }));
            }
        }
    });
};

/**
 * 刷新token
 */
exports.refreshToken = (req, res) => {
    const {refreshToken} = req.body;
    // 验证 refreshToken 1:通过
    let _res = verifyToken(refreshToken);
    if (_res === 1) {
        // 对refreshToken进行解码获得id、username
        let {id, username} = decodedToken(refreshToken);
        // 续签生成新的token
        const token = "Bearer " + generateToken({id, username}, tokenConfig.jwtSecretKey, tokenConfig.secretKeyExpire);
        // 续签长时token
        const newRefreshToken = generateToken({
            id,
            username
        }, tokenConfig.jwtRefrechSecretKey, tokenConfig.refreshSerectKeyExpire);
        res.send(biResponse.success({
            token, refreshToken: newRefreshToken,
        }));
    } else {
        res.send(biResponse.serverError(_res.message));
    }
};
/**
 * 获取用户列表
 */
exports.getList = (req, res, next) => {
    const {value, error} = get_list.validate(req.query);
    if (error) {
        throw new ParameterError(error.message)
    }
    // 接收前端参数
    let {pageSize, currentPage} = req.query;
    // 默认值
    limit = pageSize ? Number(pageSize) : 10;
    offset = currentPage ? Number(currentPage) : 1;
    offset = (offset - 1) * pageSize;
    const {username, nickname, email, status} = value;
    let where = {};
    if (username) where.username = {[Op.like]: `%${username}%`};
    if (nickname) where.nickname = nickname;
    if (email) where.email = email;
    if (status === "0" || status === "1") where.status = {[Op.eq]: status};

    UsersModel.findAndCountAll({
        attributes: {exclude: ["password"]}, include: [{model: RolesModel}], // 预先加载角色模型
        distinct: true, offset: offset, limit: limit, where: where,
    }).then(function (users) {
        return res.send(biResponse.success(users));
    });
};
/**
 * 修改用户
 */
exports.editUser = (req, res, next) => {
    const {value, error} = update_user_schema.validate(req.body);
    const user_id = value.user_id;
    if (error) {
        return next(error);
    }
    UsersModel.findAll({
        where: {
            [Op.and]: {
                user_id: {
                    [Op.ne]: user_id,
                }, username: {
                    [Op.eq]: value.username,
                },
            },
        },
    }).then((result) => {
        if (result && result.length) return res.send(biResponse.serverError("用户名被占用，请更换后重试！")); else {
            const result = UsersModel.updateUser(user_id, req.body);
            result.then(function (ret) {
                if (ret === true) {
                    return res.send(biResponse.success(ret));
                } else {
                    return res.send(biResponse.serverError(ret));
                }
            });
        }
    });
};
/**
 * 删除用户
 */
exports.deleteUser = (req, res, next) => {
    const {value, error} = delete_user_schema.validate(req.body);
    if (error) {
        return next(error);
    }
    const user_ids = value.user_ids;
    UsersModel.delUser(user_ids || []).then(function (user) {
        if (user !== true) {
            return res.send(biResponse.serverError("删除失败"));
        }
        return res.send(biResponse.success(user));
    });
};
/**
 * 重置密码
 */
exports.editPassword = (req, res, next) => {
    const {value, error} = edit_password_schema.validate(req.body);
    if (error) {
        return next(error);
    }
    if (value.password !== value.repassword) {
        return res.send(biResponse.serverError("两次密码输入不一致"));
    }
    const user_id = value.user_id;
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
            password: bcrypt.hashSync(value.password, 10), update_time: new Date(),
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
/**
 * 根据id获取用户信息接口
 */
exports.getUserinfoById = (req, res, next) => {
    const {value, error} = get_userInfoById_schema.validate(req.params);
    if (error) {
        return next(error);
    }
    let user_id = value.user_id;
    UsersModel.findOne({
        attributes: {exclude: ["password"]}, include: [{model: RolesModel}], // 预先加载角色模型
        where: {
            user_id: user_id,
        },
    }).then((user) => {
        if (!user) {
            res.send(biResponse.serverError("用户不存在"));
        } else {
            res.send(biResponse.success(user));
        }
    })
}

/**
 * 获取天猫成员的内部组的划分结构
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
exports.getTMInnerGroups = async (req, res, next) => {
    try {
        const tmInnerGroups = await userService.getTMInnerGroups(req.user.id)
        res.send(biResponse.success(tmInnerGroups))
    } catch (e) {
        next(e)
    }
}

exports.getVisionInnerGroups = async (req, res, next) => {
    try {
        const tmInnerGroups = await userService.getVisionInnerGroups(req.user.id)
        res.send(biResponse.success(tmInnerGroups))
    } catch (e) {
        next(e)
    }
}

exports.getUsersOfDepartment = async (req, res, next) => {
    try {
        const {deptId} = req.query
        const usersOfDepartment = await userService.getUsersOfDepartment(deptId)
        res.send(biResponse.success(usersOfDepartment))
    } catch (e) {
        next(e)
    }
}

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getEnabledUsers()
        res.send(biResponse.success(users))
    } catch (e) {
        next(e)
    }
}