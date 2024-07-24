const sequelize = require('../model/init');
const gettmallCompetitorModel = require("../model/tmallCompetitor");
const {Sequelize} = require("sequelize");
const tmallCompetitorModel = gettmallCompetitorModel(sequelize);

const uploadSingleIteTaoBaoCompetitorTable = async (data) => {
    // 批量插入数据  忽略重复数据
    try {
        return await tmallCompetitorModel.bulkCreate(data );
    } catch (e) {
        console.error('向 tmallCompetitorModel 插入数据时出错：', e);
        throw e; // 记录错误后重新抛出错误
    }
};

const searchSingleIteTaoBaoCompetitorTable = async (data) => {
    try {
        return await tmallCompetitorModel.findAll({
            where: data,
            raw: true,
            logging: true
        });
    } catch (e) {
        throw e;
    }
};
const conditionalFiltering = async () => {
    try {
        return await tmallCompetitorModel.findAll({
            attributes: [
                'link_id',
                'headOf_operations',
                'headOf_productLine',
                'store_name',
                'competitors_name',
                'competitor_id'
            ],
            group: [
                'link_id',
                'headOf_operations',
                'headOf_productLine',
                'store_name',
                'competitors_name',
                'competitor_id'
            ],
            raw: true,
            logging: true
        });
    } catch (e) {
        throw e;
    }
};


module.exports = {
    uploadSingleIteTaoBaoCompetitorTable,
    searchSingleIteTaoBaoCompetitorTable,
    conditionalFiltering
};
