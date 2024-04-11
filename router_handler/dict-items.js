const DictItemModel = require('../model/dict-items')
const biResponse = require("../utils/biResponse")

// 导入需要的验证规则对象
const {
    add_dictItem_schema,
    edit_dictItem_schema,
    delete_dictItem_schema,
    get_dictItem_schema
} = require('../schema/dict-items')
const {errorCodes, errorMessages} = require("../const/errorConst")

// 添加字典项接口
exports.addDictItem = (req, res, next) => {
    const {value, error} = add_dictItem_schema.validate(req.body)
    if (error) {
        return next(error)
    }
    value.create_by = req.user.username
    DictItemModel.create(value).then(function (dictItem) {
        if (!dictItem) {
            return res.send(biResponse.format(errorCodes.commonError, errorMessages.createFailed))
        }
        return res.send(biResponse.success())
    })
}
// 编辑字典项接口
exports.editDictItem = (req, res, next) => {
    const {value, error} = edit_dictItem_schema.validate(req.body)
    if (error) {
        return next(error)
    }
    value.update_time = new Date()
    DictItemModel.update(value, {
        where: req.query
    }).then(function (dictItem) {
        if (!dictItem) {
            return res.send(biResponse.serverError("修改失败"))
        }
        return res.send(biResponse.success(dictItem))
    })
}
// 删除字典项接口
exports.deleteDictItem = (req, res, next) => {
    const {value, error} = delete_dictItem_schema.validate(req.body)
    if (error) {
        return next(error)
    }
    const id = value.id
    DictItemModel.destroy({
        where: {id: id}
    }).then(function (dictItem) {
        if (!dictItem) {
            return res.send(biResponse.serverError("删除失败"))
        }
        return res.send(biResponse.simpleSuccess("删除成功"))
    })
}
// 获取单字典项接口
exports.getOneDictItem = (req, res, next) => {
    const {value, error} = get_dictItem_schema.validate(req.query)
    if (error) {
        return next(error)
    }
    DictItemModel.findOne({
        where: value
    }).then(function (dictItem) {
        return res.send(biResponse.success(dictItem))
    })
}
