const MenusModel = require('../model/menus')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const biResponse = require("../utils/biResponse")
// 导入需要的验证规则对象
const {add_menu_schema, edit_menu_schema, delete_menu_schema, get_menu_schema} = require('../schema/menu')

// 将菜单格式化为{value,label}的形式
function filterRoutes(routes) {
    const res = []
    routes.forEach((item) => {
        // 目录、菜单是否存在孩子
        if (item.children) {
            // 检测菜单孩子是否存在按钮
            if (item.children.some((item) => item.type === 'B')) {
                const perms = []
                const children = []
                // 若是按钮的用perm数组存储、是菜单的用children存储
                item.children.forEach((_item) => {
                    if (_item.type === 'B') {
                        perms.push({
                            value: _item.menu_id,
                            label: _item.title,
                            permission: _item.permission
                        })
                    } else {
                        children.push(_item)
                    }
                })
                const menuItem = {
                    value: item.menu_id,
                    label: item.title,
                    children: children || undefined,
                    perms: perms || undefined
                }
                // 继续递归判断菜单之下是否还有孩子
                if (menuItem.children && menuItem.children.length) {
                    menuItem.children = filterRoutes(menuItem.children)
                }
                res.push(menuItem)
            } else {
                const menuItem = {
                    value: item.menu_id,
                    label: item.title,
                    children: item.children || undefined
                }
                // 继续递归判断菜单之下是否还有孩子
                if (menuItem.children && menuItem.children.length) {
                    menuItem.children = filterRoutes(menuItem.children)
                }
                res.push(menuItem)
            }
        } else {
            const menuItem = {
                value: item.menu_id,
                label: item.title
            }

            res.push(menuItem)
        }
    })
    return res
}

function filterAuthTree(tree) {
    return tree.map((item) => {
        return {
            key: item.menu_id,
            title: item.title,
            children: item.children && item.children.length ? filterAuthTree(item.children) : undefined
        }
    })
}

exports.getMenuList = (req, res) => {
    MenusModel.getListTree(req.query).then(function (menuTree) {
        return res.send(biResponse.success(menuTree || []))
    })
}

exports.getMenuOptions = (req, res) => {
    MenusModel.getListTree(req.query).then(function (menuTree) {
        const filterTree = filterRoutes(menuTree)
        return res.send(biResponse.success(filterTree || []))
    })
}

exports.getAuthOptions = (req, res) => {
    MenusModel.getListTree(req.query).then(function (anthTree) {
        const filterTree = filterAuthTree(anthTree)
        return res.send(biResponse.success(filterTree || []))
    })
}

exports.addMenu = (req, res, next) => {
    // 校验入参
    const {value, error} = add_menu_schema.validate(req.body)
    if (error) {
        return next(error)
    }
    // 创建数据库条目
    MenusModel.create(value).then(function (menu) {
        if (!menu) {
            return res.send(biResponse.serverError("创建失败"))
        }
        return res.send(biResponse.success(menu.menu_id))
    })
}

exports.editMenu = (req, res, next) => {
    const {value, error} = edit_menu_schema.validate(req.body)
    console.log('editMenu',error)
    if (error) {
        return next(error)
    }
    // delete value.menu_id
    value.update_time = new Date()
    MenusModel.update(value, {
        where: {
            menu_id: value.menu_id || 0
        }
    }).then(function (menu) {
        if (!menu) {
            return res.send(biResponse.serverError("修改失败"))
        }
        return res.send(biResponse.success(menu))
    })
}

exports.deleteMenu = (req, res, next) => {
    const {value, error} = delete_menu_schema.validate(req.body)
    if (error) {
        return next(error)
    }
    MenusModel.deleteMenu(value.menu_id).then(function (menu) {
        if (menu === true) {
            return res.send(biResponse.simpleSuccess("删除成功"))
        } else {
            return res.send(biResponse.serverError("删除失败"))
        }
    })
}

exports.getOneMenu = (req, res, next) => {
    const {value, error} = get_menu_schema.validate(req.query)
    if (error) {
        return next(error)
    }
    MenusModel.findOne({
        where: {
            menu_id: value.menu_id
        }
    }).then(function (menu) {
        if (!menu)
            return res.send(biResponse.serverError("获取失败"))
        return res.send(biResponse.success(menu))
    })
}
