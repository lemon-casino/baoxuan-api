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
                originator: item.originator.split(','),
                productName: item.productName.split(','),
                vendorName: item.vendorName.split(','),
                selectionAttributes: item.selectionAttributes.split(','),
                productAttributes: item.productAttributes.split(','),
                pushProductLine: item.pushProductLine.split(',')
            }
        })

}


module.exports = {
    bulkCreate,
    bulkUpdate,
    getExistProcessInstanceId,
    returnsTheQueryConditionInformation
}