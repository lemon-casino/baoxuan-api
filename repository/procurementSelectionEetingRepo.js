const getprocurementSelectionEeting = require("../model/procurementSelectionEeting");
const sequelize = require("@/model/init");
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

module.exports = {
    bulkCreate,
    bulkUpdate,
    getExistProcessInstanceId
}