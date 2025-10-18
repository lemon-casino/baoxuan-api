const sequelize = require('@/model/init');
const getSupplierModel = require("@/model/supplier")
const supplierModel = getSupplierModel(sequelize)
const pagingUtil = require("@/utils/pagingUtil");

/**
 * 查询供应商列表
 * @param date
 * @returns {Promise<boolean>}
 */
const getPagingList = async (pageIndex,pageSize,
                             where,order) => {

    const satisfiedCount = await supplierModel.count({
        where
    })
    let data = await supplierModel.findAll({
        offset: pageIndex==1?0:(pageIndex * pageSize)-1,
        limit: pageSize,
        where,
        order
    })
    return pagingUtil.paging(Math.ceil(satisfiedCount / pageSize), satisfiedCount, data)
}


module.exports = {
    getPagingList
}