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

const getShopNameAttrDetails = async (id) => {
    return await dianShangOperationAttributeRepo.getShopNameAttrDetails(id)
}

const updateProductAttrDetails = async (details) => {
    return await dianShangOperationAttributeRepo.updateProductAttrDetails(details, details.id)
}

const savelog = async (old,body,userId,user,username,currentTime,type) => {
    return await dianShangOperationAttributeRepo.savelog(old,body,userId,user,username,currentTime,type)
}

const saveupdatelog = async (oldbody,body,userId,user,username,currentTime,type) => {
    let oldbriefName = null,
    newbriefName = null,
    oldoperator = null,
    newoperator = null,
    oldlineDirector = null,
    newlineDirector = null,
    oldgoodsId = oldbody.goodsId,
    newgoodsId = body.goodsId
    if(oldbody.briefName!=body.briefName){
        oldbriefName=oldbody.briefName
        newbriefName=body.briefName
    }
    if(oldbody.operator!=body.operator){
        oldoperator=oldbody.operator
        newoperator=body.operator
    }
    if(oldbody.lineDirector!=body.lineDirector){
        oldlineDirector=oldbody.lineDirector
        newlineDirector=body.lineDirector
    }
    let old=JSON.stringify(oldbody)
    let newbody=JSON.stringify(body)
    return await dianShangOperationAttributeRepo.saveupdatelog(old,newbody,oldgoodsId,newgoodsId,oldbriefName,newbriefName,oldoperator,newoperator,oldlineDirector,newlineDirector,userId,user,username,currentTime,type)
}

const saveProductAttr = async (details) => {
    return await dianShangOperationAttributeRepo.saveProductAttr(details)
}

const deleteProductAttr = async (id) => {
    return await dianShangOperationAttributeRepo.deleteProductAttr(id)
}
const uploadBulkUploadsTable = async (translatedData) => {
    // 提取 translatedData 中的 SKU ID，并使用 Map 关联 SKU ID 与对应的对象
    const translatedDataMap = new Map(translatedData.map(item => [item.skuId, item]));

    // 获取数据库中的所有 SKU ID，并转换为 Set 以便于快速查找
    const dbData = await dianShangOperationAttributeRepo.getAllProductAttrDetails();
    const dbDataSet = new Set(dbData);
    // 分类数据，区分为需要更新和需要插入的数据
    const updates = [];
    const inserts = [];

    for (const [skuId, obj] of translatedDataMap.entries()) {
        if (dbDataSet.has(skuId)) {
            updates.push(obj);  // 如果 SKU ID 存在，放入更新列表
        } else {
            inserts.push(obj);  // 如果 SKU ID 不存在，放入插入列表
        }
    }

    // 执行更新操作

    if (updates.length > 0) {
        await dianShangOperationAttributeRepo.updateskuIdAttrDetails(updates);
    }
    // 执行插入操作
    //如何inserts 不为空
    if (inserts.length > 0) {
        // 执行批量插入操作
        await dianShangOperationAttributeRepo.bulkCreateTable(inserts);
    }

};
const uploadtmBulkUploadsTable = async (translatedData) => {
    // 提取 translatedData 中的 goodsId，并使用 Map 关联 goodsId 与对应的对象
    const translatedDataMap = new Map(translatedData.map(item => [item.goodsId, item]));
    console.log(translatedDataMap)
    // 获取数据库中的所有 goodsId，并转换为 Set 以便于快速查找
    const dbData = await dianShangOperationAttributeRepo.getAllGoodsAttrDetails();
    const dbDataSet = new Set(dbData);
    console.log(dbDataSet)
    // 分类数据，区分为需要更新和需要插入的数据
    const updates = [];
    const inserts = [];

    for (const [goodsId, obj] of translatedDataMap.entries()) {
        if (dbDataSet.has(goodsId)) {
            updates.push(obj);  // 如果 goodsId 存在，放入更新列表
        } else {
            inserts.push(obj);  // 如果 goodsId 不存在，放入插入列表
        }
    }

    // 执行更新操作

    if (updates.length > 0) {
        await dianShangOperationAttributeRepo.updategoodsIdAttrDetails(updates);
    }
    // 执行插入操作
    //如何inserts 不为空
    if (inserts.length > 0) {
        // 执行批量插入操作
        await dianShangOperationAttributeRepo.bulkCreateTable(inserts);
    }

};

module.exports = {
    getPagingOperateAttributes,
    getProductAttrDetails,
    getShopNameAttrDetails,
    updateProductAttrDetails,
    saveProductAttr,
    deleteProductAttr,
    uploadBulkUploadsTable,
    uploadtmBulkUploadsTable,
    savelog,
    saveupdatelog
}