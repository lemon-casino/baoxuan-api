const models = require('../model')
const dianShangOperationAttributeModel = models.dianshangOperationAttributeModel
const pagingUtil = require("../utils/pagingUtil")

const getOperateAttributes = async (deptId,
                                    pageIndex,
                                    pageSize,
                                    productLine,
                                    operatorName,
                                    linkId,
                                    platform,
                                    shopName,
                                    skuId) => {

    const andGroup = []
    const orGroup = [{deptId, platform}]
    if (productLine) {
        andGroup.push({goodsName: {$like: `%${productLine}%`}})
    }
    if (operatorName) {
        andGroup.push({operator: {$like: `%${operatorName}%`}})
    }
    if (linkId) {
        andGroup.push({goodsId: {$like: `%${linkId}%`}})
        orGroup.push({lineDirector: '无操作'})
    }
    if (shopName) {
        andGroup.push({shopName: {$like: `%${shopName}%`}})
    }
    if (skuId) {
        andGroup.push({skuId: {$like: `%${skuId}%`}})
    }

    const result = await dianShangOperationAttributeModel.findAndCountAll({
        where: {
            $or: orGroup,
            $and: andGroup
        },
        offset: pageIndex * pageSize,
        limit: pageSize,
        order: [["createTime", "desc"]]
    })

    return pagingUtil.paging(Math.ceil(result.count / pageSize), result.count, result.rows)
}

const getProductAttrDetails = async (id) => {
    const details = await dianShangOperationAttributeModel.findOne({
        where: {id}
    })
    return details.get({plain: true})
}

const updateProductAttrDetails = async (details, id) => {
    return await dianShangOperationAttributeModel.update(details, {where: {id}})
}

const saveProductAttr = async (details) => {
    return (await dianShangOperationAttributeModel.create(details))
}

const deleteProductAttr = async (id) => {
    await dianShangOperationAttributeModel.destroy({
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

