const getprocurementSelectionEeting = require("../model/procurementSelectionEeting");
const sequelize = require("@/model/init");
const { Sequelize} = require("sequelize");
const procurementSelectionEeting = getprocurementSelectionEeting(sequelize)

//批量创建

const bulkCreate = async (process) => {
    await procurementSelectionEeting.bulkCreate(process);
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

module.exports = {
    bulkCreate,
    bulkUpdate,
    getExistProcessInstanceId,
    returnsTheQueryConditionInformation,
    FilterEetingInformation,
    theTimeOfTheLatestDay
}