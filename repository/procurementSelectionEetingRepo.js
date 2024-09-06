const getprocurementSelectionEeting = require("../model/procurementSelectionEeting");
const sequelize = require("@/model/init");
const { Sequelize, QueryTypes, col,fn,literal } = require("sequelize");
const {log} = require("winston");
const procurementSelectionEeting = getprocurementSelectionEeting(sequelize)

//批量创建

const bulkCreate = async (process) => {
    await procurementSelectionEeting.bulkCreate(process)
        .then(
            ( ) => {
                console.log("批量创建成功")
                return true;
            },
        )
        .catch(err => {
        console.error("批量创建失败:", err);
        return false;
    }
    );
}
// 批量更新
const bulkUpdate = async (process) => {
     await  procurementSelectionEeting.update(process, {
        where: {
            processInstanceId: process.processInstanceId,
        },
        raw: true,
    });
}
// 查询数据是否存在
const getExistProcessInstanceId = async (processInstanceId) => {
    return procurementSelectionEeting.findAll({
        attributes: ['processInstanceId'],
        where: {
            processInstanceId
        },
        raw: true
    });
}
const returnsTheQueryConditionInformation = async () => {
  const  rest= await procurementSelectionEeting.findAll({
        attributes: [
            [Sequelize.fn('group_concat', Sequelize.fn('distinct', Sequelize.col('originator'))), 'originator'],
            [Sequelize.fn('group_concat', Sequelize.fn('distinct', Sequelize.col('productName'))), 'productName'],
            [Sequelize.fn('group_concat', Sequelize.fn('distinct', Sequelize.col('vendorName'))), 'vendorName'],
            [Sequelize.fn('group_concat', Sequelize.fn('distinct', Sequelize.col('selectionAttributes'))), 'selectionAttributes'],
            [Sequelize.fn('group_concat', Sequelize.fn('distinct', Sequelize.col('productAttributes'))), 'productAttributes'],
            [Sequelize.fn('group_concat', Sequelize.fn('distinct', Sequelize.col('pushProductLine'))), 'pushProductLine']
        ],
        raw: true,
        logging: true
    });

        return rest.map(item => {
            return {
                originator: item.originator ? item.originator.split(',') : [],
                productName: item.productName ? item.productName.split(',') : [],
                vendorName: item.vendorName ? item.vendorName.split(',') : [],
                selectionAttributes: item.selectionAttributes ? item.selectionAttributes.split(',') : [],
                productAttributes: item.productAttributes ? item.productAttributes.split(',') : [],
                pushProductLine: item.pushProductLine ? item.pushProductLine.split(',') : []
            }
        })

}



function buildWhereClause(content) {
    const {
        originator,
        productName,
        vendorName,
        productAttributes,
        selectionAttributes,
        pushProductLine,
        startTime,
        endTime,
        platform,
        reciprocaltype,
        whetherTmallIsSelected,
        uncheckedAlibaba,
        whetherTheTaoFactoryIsSelected,
        whetherJDIsSelected,
        pinduoduoIsSelected,
        whetherTmallSupermarketIsSelected,
        dewuVipshopWillBeSelected,
        tmallVerticalStoreXiaohongshuIsSelected,
        whetherOrNotCoupangIsSelected,
        douyinKuaishouIsSelected,
        whetherToChooseTheJDOperationSample,
        whetherTheTmallOperationSampleIsSelected,
        whetherThePinduoduoOperationSampleIsSelected,
        tmallSupermarketOperationSampleIsNotSelected,
        TaoFactorOperationSampleWhetherChoose,
        gainsVipshopWhetherToChooseTheOperationSample,
        tmallVerticalStoreLittleRedBook,
        coupangOperationSampleIsSelected,
        tikTokWhetherTheKuaishouOperationSampleIsSelected,
        whetherOrNotToChooseAnOperationSa,

    } = content;

    const where = {};

    // 创建时间区间条件
    if (startTime && endTime) {
        where.creationTime = { $between: [startTime, endTime] };
    }

    // 添加其他条件
    if (originator) where.originator = { $in: Array.isArray(originator) ? originator : [originator] };
    if (productName) where.productName = { $in: Array.isArray(productName) ? productName : [productName] };
    if (vendorName) where.vendorName = { $in: Array.isArray(vendorName) ? vendorName : [vendorName] };
    if (selectionAttributes) where.selectionAttributes = { $in: Array.isArray(selectionAttributes) ? selectionAttributes : [selectionAttributes] };
    if (productAttributes) where.productAttributes = { $in: Array.isArray(productAttributes) ? productAttributes : [productAttributes] };
    if (pushProductLine) where.pushProductLine = { $in: Array.isArray(pushProductLine) ? pushProductLine : [pushProductLine] };
    if (reciprocaltype !== undefined) where.reciprocaltype = { $eq: reciprocaltype };
    if (whetherTmallIsSelected) where.whetherTmallIsSelected = { $eq: whetherTmallIsSelected };
    if (whetherTheTaoFactoryIsSelected) where.whetherTheTaoFactoryIsSelected = { $eq: whetherTheTaoFactoryIsSelected };
    if (whetherJDIsSelected) where.whetherJDIsSelected = { $eq: whetherJDIsSelected };
    if (pinduoduoIsSelected) where.pinduoduoIsSelected = { $eq: pinduoduoIsSelected };
    if (whetherTmallSupermarketIsSelected) where.whetherTmallSupermarketIsSelected = { $eq: whetherTmallSupermarketIsSelected };
    if (dewuVipshopWillBeSelected) where.dewuVipshopWillBeSelected = { $eq: dewuVipshopWillBeSelected };
    if (tmallVerticalStoreXiaohongshuIsSelected) where.tmallVerticalStoreXiaohongshuIsSelected = { $eq: tmallVerticalStoreXiaohongshuIsSelected };
    if (whetherOrNotCoupangIsSelected) where.whetherOrNotCoupangIsSelected = { $eq: whetherOrNotCoupangIsSelected };
    if (douyinKuaishouIsSelected) where.douyinKuaishouIsSelected = { $eq: douyinKuaishouIsSelected };
    if (whetherToChooseTheJDOperationSample) where.whetherToChooseTheJDOperationSample = { $eq: whetherToChooseTheJDOperationSample };
    if (whetherTheTmallOperationSampleIsSelected) where.whetherTheTmallOperationSampleIsSelected = { $eq: whetherTheTmallOperationSampleIsSelected };
    if (whetherThePinduoduoOperationSampleIsSelected) where.whetherThePinduoduoOperationSampleIsSelected = { $eq: whetherThePinduoduoOperationSampleIsSelected };
    if (tmallSupermarketOperationSampleIsNotSelected) where.tmallSupermarketOperationSampleIsNotSelected = { $eq: tmallSupermarketOperationSampleIsNotSelected };
    if (TaoFactorOperationSampleWhetherChoose) where.TaoFactorOperationSampleWhetherChoose = { $eq: TaoFactorOperationSampleWhetherChoose };
    if (gainsVipshopWhetherToChooseTheOperationSample) where.gainsVipshopWhetherToChooseTheOperationSample = { $eq: gainsVipshopWhetherToChooseTheOperationSample };
    if (tmallVerticalStoreLittleRedBook) where.tmallVerticalStoreLittleRedBook = { $eq: tmallVerticalStoreLittleRedBook };
    if (coupangOperationSampleIsSelected) where.coupangOperationSampleIsSelected = { $eq: coupangOperationSampleIsSelected };
    if (uncheckedAlibaba) where.uncheckedAlibaba = { $eq: uncheckedAlibaba };
    if (tikTokWhetherTheKuaishouOperationSampleIsSelected) where.tikTokWhetherTheKuaishouOperationSampleIsSelected = { $eq: tikTokWhetherTheKuaishouOperationSampleIsSelected };
    if (whetherOrNotToChooseAnOperationSa) where.whetherOrNotToChooseAnOperationSa = { $eq: whetherOrNotToChooseAnOperationSa };
    if (platform) where.platform = { $eq: platform };

    return where;
}





const FilterEetingInformation = async (content) => {

    const {
        pageIndex,
        pageSize,
    } = content;
    const where = buildWhereClause(content);

    console.log("筛选：",where)
    return procurementSelectionEeting.findAndCountAll({
        where,
        limit: parseInt(pageSize, 10),
        offset: (parseInt(pageIndex, 10) - 1) * parseInt(pageSize, 10),
        order: [['creationTime', 'DESC']],
        raw: true,
    });
};
// 返回表中最新一天的时间
const theTimeOfTheLatestDay = async () => {
    return procurementSelectionEeting.findOne({
        attributes: ['creationTime'],
        order: [['creationTime', 'DESC']],
        raw: true,
    });
}
const forwardAndBackwardThrust = async (reasons, type, content) => {
    // 构建 where 条件
    const where = buildWhereClause(content);
    if (type !== undefined) where.reciprocaltype = { $eq: type };

    // 动态生成 WHERE 条件
    const whereConditions = Object.entries(where)
        .map(([key, value]) => {
            if (value.$in) {
                return `${key} IN (${value.$in.map(v => `'${v}'`).join(', ')})`;
            } else if (value.$between) {
                return `${key} BETWEEN '${value.$between[0]}' AND '${value.$between[1]}'`;
            } else if (value.$eq !== undefined) {
                return `${key} = '${value.$eq}'`;
            }
            return '';
        })
        .filter(Boolean)
        .join(' AND ');

    // 如果有 WHERE 条件，添加到查询语句
    let baseQuery = `
        SELECT :reason AS Reason,
            (COALESCE(SUM(CASE WHEN tmallRefused LIKE :likeClause THEN 1 ELSE 0 END), 0) +
             COALESCE(SUM(CASE WHEN jdComRefused LIKE :likeClause THEN 1 ELSE 0 END), 0) +
             COALESCE(SUM(CASE WHEN pinduoduoRefused LIKE :likeClause THEN 1 ELSE 0 END), 0) +
             COALESCE(SUM(CASE WHEN tmallSupermarketRefused LIKE :likeClause THEN 1 ELSE 0 END), 0) +
             COALESCE(SUM(CASE WHEN theTaoFactoryRefused LIKE :likeClause THEN 1 ELSE 0 END), 0) +
             COALESCE(SUM(CASE WHEN dewuVipshopWillRefuse LIKE :likeClause THEN 1 ELSE 0 END), 0) +
             COALESCE(SUM(CASE WHEN tmallVerticalShopXiaohongshuRefuses LIKE :likeClause THEN 1 ELSE 0 END), 0) +
             COALESCE(SUM(CASE WHEN coupangRefuse LIKE :likeClause THEN 1 ELSE 0 END), 0) +
             COALESCE(SUM(CASE WHEN deniedAlibaba LIKE :likeClause THEN 1 ELSE 0 END), 0) +
             COALESCE(SUM(CASE WHEN tmallDevelopmentRejection LIKE :likeClause THEN 1 ELSE 0 END), 0) +
             COALESCE(SUM(CASE WHEN developmentRejection LIKE :likeClause THEN 1 ELSE 0 END), 0)
            ) AS Count
        FROM procurement_selection_eeting
    `;

    if (whereConditions) {
        baseQuery += ` WHERE ${whereConditions}`;
    }

    // 执行 SQL 查询
    const unionQueries = reasons.map(reason => {
        return procurementSelectionEeting.sequelize.query(baseQuery, {
            replacements: {
                reason: reason,
                likeClause: `%${reason}%`,
                type: type
            },
            type: QueryTypes.SELECT
        });
    });

    try {
        const results = await Promise.all(unionQueries);
        return results.flat(); // 将嵌套数组展平，返回一个完整的结果数组
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
};

const whetherForwardPushAndReversePushIsSelected = async (type, content) => {
    // 构建 where 条件
    const where = buildWhereClause(content);
    if (type !== undefined) where.reciprocaltype = { $eq: type };

    // 构建 baseQuery 的基础部分
    let baseQuery = `
        SELECT
            COUNT(CASE WHEN \`{{columnName}}\` = '{{selectedValue}}' THEN 1 END) AS \`{{columnName}}\`
        FROM procurement_selection_eeting
    `;

    // 动态生成 WHERE 条件
    const whereConditions = Object.entries(where)
        .map(([key, value]) => {
            if (value.$in) {
                return `${key} IN (${value.$in.map(v => `'${v}'`).join(', ')})`;
            } else if (value.$between) {
                return `${key} BETWEEN '${value.$between[0]}' AND '${value.$between[1]}'`;
            } else if (value.$eq !== undefined) {
                return `${key} = '${value.$eq}'`;
            }
            return '';
        })
        .filter(Boolean)
        .join(' AND ');

    // 如果有条件则加入 WHERE 子句
    if (whereConditions) {
        baseQuery += ` WHERE ${whereConditions}`;
    }

    const columnNames = [
        'whetherTmallIsSelected', 'whetherJDIsSelected', 'pinduoduoIsSelected', 'whetherTmallSupermarketIsSelected',
        'dewuVipshopWillBeSelected', 'tmallVerticalStoreXiaohongshuIsSelected', 'whetherOrNotCoupangIsSelected',
        'douyinKuaishouIsSelected', 'uncheckedAlibaba', 'whetherToChooseTheJDOperationSample', 'whetherTheTmallOperationSampleIsSelected',
        'whetherThePinduoduoOperationSampleIsSelected', 'tmallSupermarketOperationSampleIsNotSelected', 'TaoFactorOperationSampleWhetherChoose',
        'gainsVipshopWhetherToChooseTheOperationSample', 'tmallVerticalStoreLittleRedBook', 'coupangOperationSampleIsSelected',
        'tikTokWhetherTheKuaishouOperationSampleIsSelected', 'whetherOrNotToChooseAnOperationSa'
    ];

    try {
        const selectedValue = type === 1 ? '是' : '选中'; // 根据 type 设置条件值

        // 构建每个列的查询语句，并替换占位符
        const unionQueries = columnNames.map(columnName => {
            const query = baseQuery
                .replace(/{{columnName}}/g, columnName)
                .replace(/{{selectedValue}}/g, selectedValue);

            return procurementSelectionEeting.sequelize.query(query, {
                replacements: {
                    type: type
                },
                logging: false,
                type: QueryTypes.SELECT
            });
        });

        const results = await Promise.all(unionQueries);
        return results.flat(); // 将嵌套数组展平，返回一个完整的结果数组
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
};




const categoryStatistics = async (processInstanceId,content) => {

    const  where=buildWhereClause(content)
    where.reciprocaltype= { $eq:processInstanceId };

    return procurementSelectionEeting.findAll({
        attributes: ['pushProductLine', [fn('SUM', literal(1)), 'count']], // 使用 literal(1) 作为值
        where,
        group: ['pushProductLine'],
        logging:false,
        raw: true,
    });
}
// 平台 统计
const platformStatistics = async (processInstanceId,content) => {
    const {startTime,endTime} =content
    const  where=buildWhereClause(content)
    where.reciprocaltype= { $eq:processInstanceId };

     where.creationTime=
         { $between: [startTime, endTime] };
    return procurementSelectionEeting.findAll({
        attributes: ['platform', [fn('SUM', literal(1)), 'count']], // 使用 literal(1) 作为值
        where,
        group: ['platform'],
        logging:true,
        raw: true,
    });
};

module.exports = {
    bulkCreate,
    bulkUpdate,
    getExistProcessInstanceId,
    returnsTheQueryConditionInformation,
    FilterEetingInformation,
    theTimeOfTheLatestDay,
    forwardAndBackwardThrust,
    whetherForwardPushAndReversePushIsSelected,
    categoryStatistics,
    platformStatistics
}