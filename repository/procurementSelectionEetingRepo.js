const getprocurementSelectionEeting = require("../model/procurementSelectionEeting");
const sequelize = require("@/model/init");
const { Sequelize, QueryTypes, col,fn,literal } = require("sequelize");
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

const FilterEetingInformation = async (content) => {
    const {
        pageIndex,
        pageSize,
        originator,
        productName,
        vendorName,
        productAttributes,
        selectionAttributes,
        pushProductLine,
        startTime,
        endTime
    } = content;

    const where = {
        creationTime: { $between: [startTime, endTime] }
    };

    if (originator) where.originator = { $in: Array.isArray(originator) ? originator : [originator] };
    if (productName) where.productName = { $in: Array.isArray(productName) ? productName : [productName] };
    if (vendorName) where.vendorName = { $in: Array.isArray(vendorName) ? vendorName : [vendorName] };
    if (selectionAttributes) where.selectionAttributes = { $in: Array.isArray(selectionAttributes) ? selectionAttributes : [selectionAttributes] };
    if (productAttributes) where.productAttributes = { $in: Array.isArray(productAttributes) ? productAttributes : [productAttributes] };
    if (pushProductLine) where.pushProductLine = { $in: Array.isArray(pushProductLine) ? pushProductLine : [pushProductLine] };

    console.log(where);

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
const forwardAndBackwardThrust = async (content, type) => {
    const baseQuery = `
        SELECT :reason AS Reason,
            (COALESCE(SUM(CASE WHEN tmallRefused LIKE :likeClause THEN 1 ELSE 0 END), 0) +
             COALESCE(SUM(CASE WHEN jdComRefused LIKE :likeClause THEN 1 ELSE 0 END), 0) +
             COALESCE(SUM(CASE WHEN pinduoduoRefused LIKE :likeClause THEN 1 ELSE 0 END), 0) +
             COALESCE(SUM(CASE WHEN tmallSupermarketRefused LIKE :likeClause THEN 1 ELSE 0 END), 0) +
             COALESCE(SUM(CASE WHEN theTaoFactoryRefused LIKE :likeClause THEN 1 ELSE 0 END), 0) +
             COALESCE(SUM(CASE WHEN dewuVipshopWillRefuse LIKE :likeClause THEN 1 ELSE 0 END), 0) +
             COALESCE(SUM(CASE WHEN tmallVerticalShopXiaohongshuRefuses LIKE :likeClause THEN 1 ELSE 0 END), 0) +
             COALESCE(SUM(CASE WHEN coupang_Refuse LIKE :likeClause THEN 1 ELSE 0 END), 0) +
             COALESCE(SUM(CASE WHEN deniedAlibaba LIKE :likeClause THEN 1 ELSE 0 END), 0) +
             COALESCE(SUM(CASE WHEN tmallDevelopmentRejection LIKE :likeClause THEN 1 ELSE 0 END), 0) +
             COALESCE(SUM(CASE WHEN developmentRejection LIKE :likeClause THEN 1 ELSE 0 END), 0)
            ) AS Count
        FROM procurement_selection_eeting 
        WHERE reciprocaltype = :type
    `;

    const unionQueries = content.map(reason => {
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

const whetherForwardPushAndReversePushIsSelected = async (type) => {
    const baseQuery = `
        SELECT
            COUNT(CASE WHEN \`{{columnName}}\` = '{{selectedValue}}' THEN 1 END) AS \`{{columnName}}\`
        FROM procurement_selection_eeting 
        WHERE reciprocaltype = :type
    `;

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

        const unionQueries = columnNames.map(columnName => {
            // Replace the placeholders with the actual column name and selected value
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





const categoryStatistics = async (processInstanceId) => {
    /*select  pushProductLine ,sum(1) from  procurement_selection_eeting  where reciprocaltype=1 group by pushProductLine*/
    return procurementSelectionEeting.findAll({
        attributes: ['pushProductLine', [fn('SUM', literal(1)), 'count']], // 使用 literal(1) 作为值
        where: {
            reciprocaltype: processInstanceId
        },
        group: ['pushProductLine'],
        logging:false,
        raw: true,
    });
}
// 平台 统计
const platformStatistics = async (processInstanceId) => {
    return procurementSelectionEeting.findAll({
        attributes: ['platform', [fn('SUM', literal(1)), 'count']], // 使用 literal(1) 作为值
        where: {
            reciprocaltype: processInstanceId
        },
        group: ['platform'],
        logging:false,
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