const moment = require('moment')
const dianShangOperationAttributeRepo = require("../repository/dianShangOperationAttributeRepo")
const userOperationRepo = require('../repository/operation/userOperationRepo')
const dianshangOperationAttributeModel = require('../model/dianshangOperationAttributeModel')
const getPagingOperateAttributes = async (deptId,
                                          pageIndex,
                                          pageSize,
                                          productLine,
                                          operatorName,
                                          linkId,
                                          platform,
                                          shopName,
                                          skuId,
                                          code) => {
    const result = await dianShangOperationAttributeRepo.getOperateAttributes(
        deptId,
        pageIndex,
        pageSize,
        productLine,
        operatorName,
        linkId,
        platform,
        shopName,
        skuId,
        code)

    return result
}

const getProductAttrDetails = async (id) => {
    return await dianShangOperationAttributeRepo.getProductAttrDetails(id)
}

const getGoods = async (id) => {
    return await dianShangOperationAttributeRepo.getgoodsId(id)
}

const getShopNameAttrDetails = async (id) => {
    return await dianShangOperationAttributeRepo.getShopNameAttrDetails(id)
}

const updateProductAttrDetails = async (details) => {
    return await dianShangOperationAttributeRepo.updateProductAttrDetails(details, details.id)
}

const savelog = async (old,body,user) => {
    const changes = []
    let result = await userOperationRepo.getUserById(user)
    let name = result[0].nickname
    if(old){
        changes.push({
            goods_id: old.goodsId ? old.goodsId : old.briefName, 
            sku_id:old.skuId ? old.skuId : null,
            type:'delete',
            subtype: null, 
            oldValue: JSON.stringify(old), 
            newValue: null,
            source: '商品属性维护删除',
            old_json:JSON.stringify(old),
            new_json:null,
            user:name,
            date:moment().format('YYYY-MM-DD HH:mm:ss')
            })
    }else if(body){
        changes.push({
            goods_id: body.goodsId ? body.goodsId : body.briefName, 
            sku_id:body.skuId ? body.skuId : null,
            type:'insert',
            subtype: null, 
            oldValue: null, 
            newValue: JSON.stringify(body),
            source: '商品属性维护添加',
            old_json:null,
            new_json:JSON.stringify(body),
            user:name,
            date:moment().format('YYYY-MM-DD HH:mm:ss')
            })
    }
    return await Insertlog(changes)
}

const saveupdatelog = async (oldbody,body,user) => {
    let result = await userOperationRepo.getUserById(user)
    let name = result[0].nickname
    if (oldbody.deptId == 902768824 ){
        tag = 4
    }else if(oldbody.deptId == 902897720){
        if (oldbody.goodsId) {
            tag = 6
        }else{
            tag = 5 
        }
    }else{
        tag = 2
    }
    const changes = []
    const allKeys = new Set([...Object.keys(oldbody), ...Object.keys(body)])
    for (const key of allKeys) {
        // 忽略第二个对象新增的 _X_ROW_KEY
        if (['_X_ROW_KEY','deptId'].includes(key)) continue;
        let value = await dianShangOperationAttributeRepo.getTitle(key,tag)
        const val1 = oldbody[key];
        const val2 = body[key];
        // 比较其他属性
        if (val1 !== val2) {
            changes.push({
            goods_id: oldbody['goodsId'] ? oldbody['goodsId'] : oldbody['briefName'], 
            sku_id:oldbody['skuId'] ? oldbody['skuId'] : null,
            type:'update',
            subtype: value[0].title, 
            oldValue: val1, 
            newValue: val2,
            source: '商品属性维护编辑',
            old_json:JSON.stringify(oldbody),
            new_json:JSON.stringify(body),
            user:name,
            date:moment().format('YYYY-MM-DD HH:mm:ss')
            })
        }
    }
    return await Insertlog(changes)
}

const saveProductAttr = async (details) => {
    return await dianShangOperationAttributeRepo.saveProductAttr(details)
}

const deleteProductAttr = async (id) => {
    return await dianShangOperationAttributeRepo.deleteProductAttr(id)
}
const uploadBulkUploadsTable = async (translatedData,user) => {
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
    let result = await userOperationRepo.getUserById(user)
    let name = result[0].nickname
    // 执行更新操作

    if (updates.length > 0) {
        const changes = []
        for (let i =0;i<updates.length;i++){
            let body = updates[i]
            let data = await dianShangOperationAttributeRepo.getskuId(updates[i].skuId)
            let oldbody = data[0].dataValues
            const allKeys = new Set([...Object.keys(body)])
            for (const key of allKeys) {
                // 忽略第二个对象新增的 _X_ROW_KEY
                if (['_X_ROW_KEY','deptId'].includes(key)) continue
                if (oldbody.goodsId) {tag = 6} else {tag = 5 }
                let value = await dianShangOperationAttributeRepo.getTitle(key,tag)
                let val1 = oldbody[key]
                let val2 = body[key]
                if (key == 'skuId') val2 = val2.toString()
                // 比较其他属性
                if (val1 !== val2) {
                    changes.push({
                    goods_id: oldbody['briefName'], 
                    sku_id:oldbody['skuId'],
                    type:'update',
                    subtype: value[0].title, 
                    oldValue: val1, 
                    newValue: val2,
                    source: '商品属性维护导入',
                    old_json:JSON.stringify(oldbody),
                    new_json:JSON.stringify(body),
                    user:name,
                    date:moment().format('YYYY-MM-DD HH:mm:ss')
                    })
                }
            }
        }
        await Insertlog(changes)
        await dianShangOperationAttributeRepo.updateskuIdAttrDetails(updates);
    }
    // 执行插入操作
    //如何inserts 不为空
    if (inserts.length > 0) {
        const changes = []
        for (let i =0;i<inserts.length;i++){
            let body = inserts[i]
            changes.push({
                goods_id: body['briefName'], 
                sku_id:body['skuId'],
                type:'insert',
                subtype: null, 
                oldValue: null, 
                newValue: '新增简称:'+body['briefName']+'下SKU:'+body['skuId'],
                source: '商品属性维护导入',
                old_json:null,
                new_json:JSON.stringify(body),
                user:name,
                date:moment().format('YYYY-MM-DD HH:mm:ss')
            })
        }
        await Insertlog(changes)
        // 执行批量插入操作
        await dianShangOperationAttributeRepo.bulkCreateTable(inserts);
    }

};
const uploadtmBulkUploadsTable = async (translatedData,user) => {
    // 提取 translatedData 中的 goodsId，并使用 Map 关联 goodsId 与对应的对象
    const translatedDataMap = new Map(translatedData.map(item => [item.goodsId, item]));
    // 获取数据库中的所有 goodsId，并转换为 Set 以便于快速查找
    const dbData = await dianShangOperationAttributeRepo.getAllGoodsAttrDetails();
    const dbDataSet = new Set(dbData);
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
    let name = null
    if(user){
        let result = await userOperationRepo.getUserById(user)
        name = result[0].nickname
    }else{
        name = 'rpa抓取'
    }
    if (updates.length > 0) {
        const changes = []
        for (let i =0;i<updates.length;i++){
            let body = updates[i]
            let data = await dianShangOperationAttributeRepo.getgoodsId(updates[i].goodsId)
            let oldbody = data[0].dataValues
            const allKeys = new Set([...Object.keys(body)])
            for (const key of allKeys) {
                // 忽略第二个对象新增的 _X_ROW_KEY
                if (oldbody.deptId == 902768824 ){ tag = 4 }else{ tag = 2 }
                if (['_X_ROW_KEY','deptId'].includes(key)) continue
                let value = await dianShangOperationAttributeRepo.getTitle(key,tag)
                let val1 = oldbody[key]
                let val2 = body[key]
                if (key == 'skuId') val2 = val2.toString()
                // 比较其他属性
                if (val1 !== val2) {
                    changes.push({ 
                    goods_id: updates[i].goodsId,
                    sku_id: null,
                    type:'update',
                    subtype: value[0].title, 
                    oldValue: val1, 
                    newValue: val2,
                    source: '商品属性维护导入',
                    old_json:JSON.stringify(oldbody),
                    new_json:JSON.stringify(body),
                    date:moment().format('YYYY-MM-DD HH:mm:ss'),
                    user:name
                    })
                }
            }
        }
        await Insertlog(changes)
        await dianShangOperationAttributeRepo.updategoodsIdAttrDetails(updates);
    }
    // 执行插入操作
    //如何inserts 不为空
    if (inserts.length > 0) {
        const changes = []
        for (let i =0;i<inserts.length;i++){
            let body = inserts[i]
            changes.push({
                goods_id: inserts[i].goodsId, 
                sku_id:null,
                type:'insert',
                subtype: null, 
                oldValue: null, 
                newValue: '新增链接:'+inserts[i].goodsId,
                source: '商品属性维护导入',
                old_json:null,
                new_json:JSON.stringify(body),
                user:name,
                date:moment().format('YYYY-MM-DD HH:mm:ss')
            })
        }
        await Insertlog(changes)
        // 执行批量插入操作
        await dianShangOperationAttributeRepo.bulkCreateTable(inserts);
    }

};

const updateAttribute = async()=>{
    let date = moment().format('YYYY-MM-DD HH:mm:ss')
    let changes = []
    // let result = await dianShangOperationAttributeRepo.updateAttribute()
    let result1 = await dianShangOperationAttributeRepo.getTMLinkAttribute()
    for (i=0;i<result1.length;i++){
        changes.push({
            goods_id: result1[i].goods_id, 
            sku_id:null,
            type:'update',
            subtype: '链接属性', 
            oldValue: result1[i].link_attribute, 
            newValue: result1[i].attribute,
            source: '自动更新',
            old_json:null,
            new_json:null,
            user:null,
            date:moment().format('YYYY-MM-DD HH:mm:ss')
        })
        await dianShangOperationAttributeRepo.updateAttribute('link_attribute',result1[i].attribute,'天猫部','goods_id',result1[i].goods_id)
    }
    let result2 = await dianShangOperationAttributeRepo.getTMUserDef5()
    for (i=0;i<result2.length;i++){
        changes.push({
            goods_id: result2[i].goods_id, 
            sku_id:null,
            type:'update',
            subtype: '链接定义', 
            oldValue: result2[i].userDef5, 
            newValue: result2[i].duserDef5,
            source: '自动更新',
            old_json:null,
            new_json:null,
            user:null,
            date:moment().format('YYYY-MM-DD HH:mm:ss')
        })
        await dianShangOperationAttributeRepo.updateAttribute('userDef5',result2[i].duserDef5,'天猫部','goods_id',result2[i].goods_id)
    }
    let result3 = await dianShangOperationAttributeRepo.getTMUserDef7()
    for (i=0;i<result3.length;i++){
        changes.push({
            goods_id: result3[i].goods_id, 
            sku_id:null,
            type:'update',
            subtype: '链接定义', 
            oldValue: result3[i].userDef7, 
            newValue: '计划打爆',
            source: '自动更新',
            old_json:null,
            new_json:null,
            user:null,
            date:moment().format('YYYY-MM-DD HH:mm:ss')
        })
        await dianShangOperationAttributeRepo.updateAttribute('userDef5','计划打爆','天猫部','goods_id',result3[i].goods_id)
    }
    let result4 =await dianShangOperationAttributeRepo.getjdzzUserDef1()
    for (i=0;i<result4.length;i++){
        changes.push({
            goods_id: result4[i].brief_name, 
            sku_id: result4[i].sku_id,
            type:'update',
            subtype: '链接定义', 
            oldValue: result4[i].userDef1, 
            newValue: '下柜',
            source: '自动更新',
            old_json:null,
            new_json:null,
            user:null,
            date:moment().format('YYYY-MM-DD HH:mm:ss')
        })
        await dianShangOperationAttributeRepo.updateAttribute('userDef1','下柜','自营','sku_id',result4[i].sku_id)
    }
    await Insertlog(changes)
    logger.info(`${date}商品属性维护刷新成功`)
    return result1
}

const Insertlog = async(data)=>{
    let result = false
    for(let i=0;i<data.length;i++){
        result = await dianShangOperationAttributeRepo.Insertlog(data[i])
    }
    return result
}

const Insertcalculate = async(data,id)=>{
    let result = await userOperationRepo.getUserById(id)
    let name = result[0].nickname
    for(let i=0;i<data.length;i++){
        data[i].date = moment().format('YYYY-MM-DD HH:mm:ss')
        data[i].user = name
        result = await dianShangOperationAttributeRepo.Insertcalculate(data[i])
    }
    return result
}

const getspiral = async(goods_id)=>{
    result = await dianShangOperationAttributeRepo.getspiral(goods_id)
    return result
}

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
    saveupdatelog,
    updateAttribute,
    Insertlog,
    Insertcalculate,
    getspiral,
    getGoods
}