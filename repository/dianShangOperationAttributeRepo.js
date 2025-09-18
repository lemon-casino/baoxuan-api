const models = require('../model')
const dianShangOperationAttributeModel = models.dianshangOperationAttributeModel
const pagingUtil = require("../utils/pagingUtil")
const sequelize = require('../model/init')
const {Sequelize} = require("sequelize");
const { query } = require('../model/dbConn')
const moment = require('moment')
const getOperateAttributes = async (deptId,
                                    pageIndex,
                                    pageSize,
                                    productLine,
                                    operatorName,
                                    linkId,
                                    platform,
                                    shopName,
                                    skuId,
                                    code) => {

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
    }if (code) {
        andGroup.push({code: {$like: `%${code}%`}})
    }

    const result = await dianShangOperationAttributeModel.findAndCountAll({
        where: {
            $or: orGroup,
            $and: andGroup
        },
        logging:true,
        offset: pageIndex * pageSize,
        limit: pageSize,
        order: [["createTime", "desc"]]
    })

    return pagingUtil.paging(Math.ceil(result.count / pageSize), result.count, result.rows)
}

const getskuId = async(skuId) => {
    const result = await dianShangOperationAttributeModel.findAll({
        where: { skuId: skuId },
        logging:true
    })
    return result 
}

const getgoodsId = async(goodsId) => {
    const result = await dianShangOperationAttributeModel.findAll({
        where: { goodsId: goodsId },
        logging:true
    })
    return result 
}

const getProductAttrDetails = async (id) => {
    const details = await dianShangOperationAttributeModel.findOne({
        where: {id}
    })
    return details.get({plain: true})
}

const getShopNameAttrDetails = async (id) => {
    const sql=`SELECT shop_name AS value,shop_name AS label FROM  shop_info WHERE project_id IN (
    SELECT id FROM project_info WHERE dept_id =?)`
    let result = await query(sql,id)
    return  result || []
}

const savelog = async (old,body,userId,user,username,currentTime,type) => {
    const sql=`INSERT INTO attribute_user_log (old_value,new_value,userId,users,username,create_time,type)VALUES (?,?,?,?,?,?,?)`
    let result = await query(sql,[old,body,userId,user,username,currentTime,type])
    return result
}

const saveupdatelog = async (oldbody,body,oldgoodsId,newgoodsId,oldbriefName,newbriefName,oldoperator,newoperator,oldlineDirector,newlineDirector,userId,user,username,currentTime,type) => {
    const sql=`INSERT INTO attribute_user_log (old_value,new_value,old_goods_id,new_goods_id,old_brief_name,new_brief_name,
    old_operator,new_operator,old_line_director,new_line_director,userId,users,username,create_time,type)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    let result = await query(sql,[oldbody,body,oldgoodsId,newgoodsId,oldbriefName,newbriefName,oldoperator,newoperator,oldlineDirector,newlineDirector,userId,user,username,currentTime,type])
    return result
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


const getAllProductAttrDetails = async () => {
    // 只返回 skuId 列表  raw: true, sku_id is not null
    return dianShangOperationAttributeModel.findAll({
        attributes: ['skuId'],
        where: {
            skuId: {$ne: null}
        },
        raw: true
    }).then(res => {
        // 返回转为数字
        res.forEach(item => item.skuId = parseInt(item.skuId))
        return res.map(item => item.skuId)
    })

}

const getAllGoodsAttrDetails = async () => {
    // 只返回 goods_id 列表  raw: true, sku_id is not null
    return dianShangOperationAttributeModel.findAll({
        attributes: ['goodsId'],
        where: {
            goodsId: {$ne: null}
        },
        raw: true
    }).then(res => {
        // 返回转为数字
        res.forEach(item => item.goodsId = String(item.goodsId))
        return res.map(item => item.goodsId)
    })

}

function excelDateToJSDate(excelDate) {
    if (typeof excelDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(excelDate)) {
        return excelDate;
    }
    if (typeof excelDate !== 'number' || isNaN(excelDate)) {
        console.error(`Invalid excelDate value: ${excelDate}`);
        return '';
    }
    const excelEpochOffset = 25567;
    const jsTimestamp = (excelDate - excelEpochOffset) * 86400 * 1000;
    const date = new Date(jsTimestamp);
    if (isNaN(date.getTime())) {
        console.error(`Invalid JS Date generated from excelDate: ${excelDate}`);
        return '';
    }
    return date.toISOString().split('T')[0];
}
function transformRow(row) {
    return {
        id: row.id || null,
        goodsId: row.goodsId ? String(row.goodsId).slice(0, 32) : null,
        linkAttribute: row.linkAttribute ? String(row.linkAttribute).slice(0, 255) : null,
        importantAttribute: row.importantAttribute ? String(row.importantAttribute).slice(0, 255) : null,
        goodsName: row.goodsName ? String(row.goodsName).slice(0, 255) : null,
        briefName: row.briefName ? String(row.briefName).slice(0, 64) : null,
        briefProductLine: row.briefProductLine ? String(row.briefProductLine).slice(0, 64) : null,
        productDefinition: row.productDefinition ? String(row.productDefinition).slice(0, 64) : null,
        productRank: row.productRank ? String(row.productRank).slice(0, 64) : null,
        lineDirector: row.lineDirector ? String(row.lineDirector).slice(0, 32) : null,
        operator: row.operator ? String(row.operator).slice(0, 32) : null,
        purchaseDirector: row.purchaseDirector ? String(row.purchaseDirector).slice(0, 32) : null,
        maintenanceLeader: row.maintenanceLeader ? String(row.maintenanceLeader).slice(0, 30) : null,
        targets: row.targets ? String(row.targets).slice(0, 32) : null,
        profitTarget: row.profitTarget ? String(row.profitTarget).slice(0, 255) : null,
        searchTarget: row.searchTarget ? String(row.searchTarget).slice(0, 255) : null,
        pitTarget: row.pitTarget ? String(row.pitTarget).slice(0, 255) : null,
        seasons: row.seasons ? String(row.seasons).slice(0, 255) : null,

        // 日期字段转换
        onsaleDate: row.onsaleDate ? excelDateToJSDate(row.onsaleDate) : null,

        firstCategory: row.firstCategory ? String(row.firstCategory).slice(0, 255) : null,
        secondCategory: row.secondCategory ? String(row.secondCategory).slice(0, 255) : null,
        goodsLine1: row.goodsLine1 ? String(row.goodsLine1).slice(0, 255) : null,
        goodsLine2: row.goodsLine2 ? String(row.goodsLine2).slice(0, 255) : null,

        // 日期字段处理
        createTime: row.createTime ? excelDateToJSDate(row.createTime) : null,
        updateTime: row.updateTime ? excelDateToJSDate(row.updateTime) : null,

        deptId: row.deptId ? String(row.deptId).slice(0, 30) : null,
        deptName: row.deptName ? String(row.deptName).slice(0, 30) : null,
        skuId: row.skuId ? String(row.skuId).slice(0, 50) : null,
        code: row.code ? String(row.code).slice(0, 50) : null,

        // 数字类型转换
        costPrice: row.costPrice ? parseFloat(row.costPrice) : null,
        supplyPrice: row.supplyPrice ? parseFloat(row.supplyPrice) : null,

        level3Category: row.level3Category ? String(row.level3Category).slice(0, 50) : null,
        shopName: row.shopName ? String(row.shopName).slice(0, 255) : null,
        platform: row.platform ? String(row.platform).slice(0, 20) : null,

        // 整数类型转换
        visitorTarget: row.visitorTarget ? parseInt(row.visitorTarget, 10) : 0,

        exploitDirector: row.exploitDirector ? String(row.exploitDirector).slice(0, 30) : null,

        // 处理 userDef1 到 userDef10 字段
        userDef1: row.userDef1 ? String(row.userDef1).slice(0, 255) : null,
        userDef2: row.userDef2 ? String(row.userDef2).slice(0, 255) : null,
        userDef3: row.userDef3 ? String(row.userDef3).slice(0, 255) : null,
        userDef4: row.userDef4 ? String(row.userDef4).slice(0, 255) : null,
        userDef5: row.userDef5 ? String(row.userDef5).slice(0, 255) : null,
        userDef6: row.userDef6 ? String(row.userDef6).slice(0, 255) : null,
        userDef7: row.userDef7 ? String(row.userDef7).slice(0, 255) : null,
        userDef8: row.userDef8 ? String(row.userDef8).slice(0, 255) : null,
        userDef9: row.userDef9 ? String(row.userDef9).slice(0, 255) : null,
        userDef10: row.userDef10 ? String(row.userDef10).slice(0, 255) : null
    };
}


// 批量更新方法
const updateskuIdAttrDetails = async (updates) => {
    // 开启事务
    const transaction = await sequelize.transaction();

    try {
        for (const details of updates) {
            // 单条更新操作可以并入事务中进行
            await dianShangOperationAttributeModel.update(details, {
                where: { skuId: details.skuId },
                transaction // 使用事务
            });
        }

        // 提交事务
        await transaction.commit();
    } catch (error) {
        // 如果有错误，回滚事务
        await transaction.rollback();
        throw error;
    }
};

// 批量创建方法
const bulkCreateTable = async (data) => {
    const transformedData = data.map(transformRow);
    try {
		await dianShangOperationAttributeModel.bulkCreate(transformedData, {
			validate: true,
		})
		console.log("Data uploaded successfully")
	} catch (error) {
		console.error("Error uploading data:", error)
		throw error
	}
};

const updategoodsIdAttrDetails = async (updates) => {
    // 开启事务
    const transaction = await sequelize.transaction();

    try {
        for (const details of updates) {
            // 单条更新操作可以并入事务中进行
            await dianShangOperationAttributeModel.update(details, {
                where: { goodsId: details.goodsId },
                transaction // 使用事务
            });
        }

        // 提交事务
        await transaction.commit();
    } catch (error) {
        // 如果有错误，回滚事务
        await transaction.rollback();
        throw error;
    }
};

// 查询京东自营 对应的维护人信息
const getOperateAttributesMaintainer = async (skuId) => {
    try {
        return await dianShangOperationAttributeModel.findOne({
            attributes: ['maintenanceLeader'],
            where: {
                skuId: skuId,
                deptId: '902897720',
                platform: '自营'
            },
            raw: true
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

const updateAttribute = async(column,value,dept,column1,goods_id)=>{
    let sql = `UPDATE dianshang_operation_attribute set ${column} = ? where platform = ? and ${column1} = ?`
    const result  = await query(sql,[value,dept,goods_id])
    return result
}

const getTMLinkAttribute = async()=>{
    const sql = `SELECT goods_id,(CASE WHEN DATE_SUB(DATE(NOW()), INTERVAL 60 DAY) <= onsale_date THEN '新品' ELSE '老品' END) AS attribute,link_attribute
    FROM dianshang_operation_attribute WHERE platform ='天猫部' HAVING attribute!=link_attribute`
    const result  = await query(sql)
    return result
}

const getTMUserDef5 = async()=>{
    const sql = `SELECT a.goods_id
			,a.userDef5
            ,(case 
            WHEN b.tag >=1500 THEN '爆款'	
            WHEN b.tag <1500 AND b.tag>=400 THEN '动销以上'
            WHEN b.tag <400  THEN '动销以下' 
            END) AS duserDef5
        FROM dianshang_operation_attribute a 
        LEFT JOIN(
        SELECT goods_id,sum(sale_amount)/7 AS tag 
        FROM goods_sales_stats 
        WHERE date BETWEEN DATE_SUB(DATE(NOW()), INTERVAL 7 DAY) AND DATE_SUB(DATE(NOW()), INTERVAL 1 DAY) 
        AND shop_name = 'pakchoice旗舰店（天猫）' 
        GROUP BY goods_id ) b
        ON a.goods_id = b.goods_id
        HAVING duserDef5 != userDef5`
    const result  = await query(sql)
    return result
}

const getTMUserDef7 = async()=>{
    const sql = `SELECT goods_id,userDef7 FROM dianshang_operation_attribute WHERE platform = '天猫部' 
    AND (userDef5 ='动销以上' OR link_attribute ='新品') HAVING userDef7 != '计划打爆'`
    const result  = await query(sql)
    return result
}

const getjdzzUserDef1 = async() =>{
    const sql = `SELECT brief_name,sku_id,userDef1 FROM dianshang_operation_attribute
	WHERE sku_id in (
			SELECT SKU FROM danpin.inventory_jdzz 
			WHERE 时间 = DATE_SUB(DATE(NOW()), INTERVAL 1 DAY) AND 上下柜状态='下柜' AND 全国现货库存 = 0
	) AND userDef1 = '销完下架'`
    const result  = await query(sql)
    return result
}
const Insertlog = async(data)=>{
    const sql = `INSERT INTO operate_log (goods_id,sku_id,type,subtype,old_value,new_value,source,old_json,new_json,user,operate_date) 
                VALUES(?,?,?,?,?,?,?,?,?,?,?)`
    const result = query(sql,[data.goods_id,data.sku_id,data.type,data.subtype,
        data.oldValue,data.newValue,data.source,data.old_json,data.new_json,
        data.user,data.date])
    return result
}

const getTitle = async(field,tag)=>{
    const sql = `SELECT title FROM user_table_structure WHERE field = ? AND tableType = ?`
    const result = query(sql,[field,tag])
    return result
}

const Insertcalculate = async(data)=>{
    let sql = `INSERT INTO spiral_target (goods_id,day,sale_amount,sale_num,order_num,num,date,user) 
                VALUES(?,?,?,?,?,?,?,?)`
    const result = query(sql,[data.goods_id,data.day,data.sale_amount,data.num1,
        data.sale_qty,data.num2,data.date,data.user])
    return result
}

const getspiral = async(goods_id)=>{
    let sql = `SELECT goods_id,day,sale_amount,sale_num as num1,order_num as sale_qty,num as num2 FROM spiral_target WHERE goods_id = ?`
    const result = query(sql,[goods_id])
    return result
}

const batchUpdate = async (column, ids, value) => {
    const sql = `UPDATE dianshang_operation_attribute SET ${column} = ? WHERE goods_id IN (${ids})`
    const result = await query(sql, [value])
    return result
}

const getTMLinkStage = async () => {
    const sql = `SELECT goods_id, link_stage FROM dianshang_operation_attribute WHERE platform = '天猫部'`
    const result = await query(sql)
    return result
}

module.exports = {
    getProductAttrDetails,
    getShopNameAttrDetails,
    getOperateAttributes,
    saveProductAttr,
    updateProductAttrDetails,
    updategoodsIdAttrDetails,
    deleteProductAttr,
    getAllProductAttrDetails,
    getAllGoodsAttrDetails,
    updateskuIdAttrDetails,
    bulkCreateTable,
    getOperateAttributesMaintainer,
    savelog,
    saveupdatelog,
    updateAttribute,
    getskuId,
    getgoodsId,
    Insertlog,
    getTitle,
    getTMLinkAttribute,
    getTMUserDef5,
    getTMUserDef7,
    getjdzzUserDef1,
    updateAttribute,
    Insertcalculate,
    getspiral,
    batchUpdate,
    getTMLinkStage
}

