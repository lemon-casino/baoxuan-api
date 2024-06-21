const dianShangOperationAttributeRepo = require("../repository/dianShangOperationAttributeRepo")

const getPagingOperateAttributes = async (deptId,
                                          pageIndex,
                                          pageSize,
                                          productLine,
                                          operatorName,
                                          linkId,
                                          platform,
                                          shopName,
                                          skuId) => {
    const result = await dianShangOperationAttributeRepo.getOperateAttributes(
        deptId,
        pageIndex,
        pageSize,
        productLine,
        operatorName,
        linkId,
        platform,
        shopName,
        skuId)

    return result
}

const getProductAttrDetails = async (id) => {
    return await dianShangOperationAttributeRepo.getProductAttrDetails(id)
}

const updateProductAttrDetails = async (details) => {
    return await dianShangOperationAttributeRepo.updateProductAttrDetails(details, details.id)
}

const saveProductAttr = async (details) => {
    return await dianShangOperationAttributeRepo.saveProductAttr(details)
}

const deleteProductAttr = async (id) => {
    return await dianShangOperationAttributeRepo.deleteProductAttr(id)
}

module.exports = {
    getPagingOperateAttributes,
    getProductAttrDetails,
    updateProductAttrDetails,
    saveProductAttr,
    deleteProductAttr
}