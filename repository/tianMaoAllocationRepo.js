const sequelize = require("../model/init");
const getAllocationeModel = require('../model/allocation');
const AllocationeModel = getAllocationeModel(sequelize);

const exceptionLinks = async (id) => {
    try {

        return await AllocationeModel.findAll(
            {
                attributes: {exclude: ["typeParameters", "field", "operator", "lessThan", "value", "comparator"]},
                where: {
                    typeParameters: id,
                },
                raw: true,
                logging: false
            }
        )

    } catch (error) {
        throw new Error('查询用户数据失败');
    }
};

module.exports = {
    exceptionLinks,

};