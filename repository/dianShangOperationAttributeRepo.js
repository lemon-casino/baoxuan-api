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
        logging:true,
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

const getShopNameAttrDetails = async (id) => {
    const sql=`SELECT shop_name AS value,shop_name AS label FROM  shop_info WHERE project_id IN (
    SELECT id FROM project_info WHERE dept_id =?)`
    let result = await query(sql,id)
    console.log(result)
    return  result || []
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
            goodsId: {$ne: null},
            platform:'天猫部'
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
    getOperateAttributesMaintainer
}

