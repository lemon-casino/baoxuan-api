const models = require('../model')
const pagingUtil = require("../utils/pagingUtil")

const getOperateAttributes = async (deptId,
                                    pageIndex,
                                    pageSize,
                                    productLine,
                                    operatorName,
                                    linkId,
                                    platform,
                                    shopName) => {
    const where = {deptId, platform}
    if (productLine) {
        where.goodName = {$like: `%${productLine}%`}
    }
    if (operatorName) {
        where.operator = operatorName
    }
    if (linkId) {
        where.goodsId = {$like: `%${linkId}%`}
    }
    if (shopName) {
        where.shopName = {$like: `%${shopName}%`}
    }

    const result = await models.dianshangOperationAttributeModel.findAndCountAll({
        where,
        offset: pageIndex * pageSize,
        limit: pageSize,
        order: [["createTime", "desc"]]
    })

    return pagingUtil.paging(Math.ceil(result.count / pageSize), result.count, result.rows)
}

const getProductAttrDetails = async (id) => {
    const details = await models.dianshangOperationAttributeModel.findOne({
        where: {id}
    })
    return details.get({plain: true})
}

const updateProductAttrDetails = async (details, id) => {
    return await models.dianshangOperationAttributeModel.update(details, {where: {id}})
}

const saveProductAttr = async (details) => {
    return await models.dianshangOperationAttributeModel.create(details)
}

const deleteProductAttr = async (id) => {
    await models.dianshangOperationAttributeModel.destroy({
        where: {id}
    })
    return true
}

module.exports = {
    getProductAttrDetails,
    getOperateAttributes,
    saveProductAttr,
    updateProductAttrDetails,
    deleteProductAttr
}

