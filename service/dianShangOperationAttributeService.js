const dianShangOperationAttributeRepo = require("../repository/dianShangOperationAttributeRepo")

const getPagingOperateAttributes = async (pageIndex,
                                          pageSize,
                                          productLine,
                                          operatorName,
                                          linkId) => {
    const result = await dianShangOperationAttributeRepo.getOperateAttributes(pageIndex,
        pageSize,
        productLine,
        operatorName,
        linkId)

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