const sequelize = require('../model/init');
const gettmallCompetitorModel = require("../model/tmallCompetitor");
const tmallCompetitorModel = gettmallCompetitorModel(sequelize);

const uploadSingleIteTaoBaoCompetitorTable = async (data) => {
    // 批量插入数据  {ignoreDuplicates: true} 忽略重复数据
    try {
        return await tmallCompetitorModel.bulkCreate(data, );
    } catch (e) {
        console.error('向 tmallCompetitorModel 插入数据时出错：', e);
        throw e; // 记录错误后重新抛出错误
    }
};

module.exports = {
    uploadSingleIteTaoBaoCompetitorTable
};
