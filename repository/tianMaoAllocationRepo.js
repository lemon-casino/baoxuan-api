const sequelize = require("../model/init");
const getAllocationeModel = require('../model/allocation');
const AllocationeModel = getAllocationeModel(sequelize);

const exceptionLinks = async (type) => {
    try {
        return await AllocationeModel.findAll({
            where: {type},
            raw: true
        });
    } catch (error) {
        throw new Error('查询用户数据失败');
    }
};

const putExceptionLinks = async (body) => {
    try {

        const {name, field, comparator, type, operator, lessThan, value, exclude, id} = body;
        const existingAllocation = await AllocationeModel.findOne(
            {
                attributes: ['exclude'],
                where: {id: id},
                raw: true
            });

        const allocationData = {
            name: name,
            // 只在传递了 field 值时才设置 field 字段
            ...(field !== undefined ? {field: field} : {}),
            // 只在传递了 comparator 值时才设置 comparator 字段
            ...(comparator !== undefined ? {comparator: comparator} : {}),
            ...(type !== undefined ? {type: type} : {}),
            ...(operator !== undefined ? {operator: operator} : {}),
            ...(lessThan !== undefined ? {lessThan: lessThan} : {}),
            ...(value !== undefined ? {value: value} : {}),
            ...(exclude !== undefined ? {exclude: existingAllocation.exclude + "," + exclude.join(',')} : "")

        };
        return await AllocationeModel.update(allocationData, {where: {id: id}, loading: true});
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

        const {name, field, comparator, type, operator, lessThan, value} = body;
        const allocationData = {
            name: name,
            // 只在传递了 field 值时才设置 field 字段
            ...(field !== undefined ? {field: field} : {}),
            // 只在传递了 comparator 值时才设置 comparator 字段
            ...(comparator !== undefined ? {comparator: comparator} : {}),
            ...(type !== undefined ? {type: type} : {}),
            ...(operator !== undefined ? {operator: operator} : {}),
            ...(lessThan !== undefined ? {lessThan: lessThan} : {}),
            ...(value !== undefined ? {value: value} : {})
        };


        const newAllocation = await AllocationeModel.create(allocationData);
        return '添加成功';
    } catch (error) {
        throw new Error('添加用户数据失败');
    }


}


const exceptionexcludeLinks = async (body) => {
    try {

        const {id, exclude_id} = body;

        const existingAllocation = await AllocationeModel.findOne(
            {
                attributes: ['exclude'],
                where: {id: id},
                raw: true
            });

        const excludeArray = existingAllocation.exclude.split(',');
        const indexToRemove = excludeArray.indexOf(exclude_id);
        if (indexToRemove !== -1) {
            excludeArray.splice(indexToRemove, 1);
        }
        const updatedExclude = excludeArray.join(',');


        return await AllocationeModel.update({exclude: updatedExclude}, {where: {id: id}});
    } catch (error) {
        throw new Error('删除数据失败');
    }


}


module.exports = {
    exceptionLinks,
    putExceptionLinks,
    delExceptionLinks,
    addExceptionLinksExclude,
    exceptionexcludeLinks

};