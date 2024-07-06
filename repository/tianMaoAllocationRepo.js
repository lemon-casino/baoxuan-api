const sequelize = require("../model/init");
const getAllocationeModel = require('../model/allocation');
const AllocationeModel = getAllocationeModel(sequelize);

const exceptionLinks = async (id) => {
    try {

        return await AllocationeModel.findAll(
            {

                attributes: {exclude: ["typeParameters"]},
                // attributes: {exclude: ["typeParameters", "field", "operator", "lessThan", "value", "comparator"]},
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
const putExceptionLinks = async (body) => {
    try {
        const transformed = body.exclude.map(item => ({
            "field": item.field,
            "comparator": item.comparator,
            "name": item.name,
            "value": item.value
        }));
        // transformed 转字符串

        await AllocationeModel.update(
            {
                field: body.field,
                lessThan: body.lessThan,
                value: body.value,
                comparator: body.comparator,
                exclude: JSON.stringify(transformed)
            },
            {
                where: {
                    id: body.id
                }
            }
        )
        return transformed;
    } catch (error) {
        throw new Error('更新用户数据失败');
    }

}

const delExceptionLinks = async (id) => {
    try {
        await AllocationeModel.destroy({
            where: {
                id: id
            }
        })
        return '删除成功';
    } catch (error) {
        throw new Error('删除用户数据失败');
    }

}
const addExceptionLinksExclude = async (body) => {
    try {

        const {name, field, comparator, type: typeParameters, operator, lessThan, value} = body;

        const query = `
    INSERT INTO allocation (name, field, comparator, type, operator, lessThan, value)
    VALUES (:name, :field, :comparator, :typeParameters , :operator, :lessThan, :value)
`;

        await sequelize.query(query, {
            replacements: {name, field, comparator, typeParameters},
            type: sequelize.QueryTypes.INSERT,
            logging: console.log // Enable logging for this query
        });


        return '添加成功';
    } catch (error) {
        throw new Error('添加用户数据失败');
    }


}

module.exports = {
    exceptionLinks,
    putExceptionLinks,
    delExceptionLinks,
    addExceptionLinksExclude

};