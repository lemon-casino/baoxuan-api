const sequelize = require('../model/init');
const get_ocFileCache = require("../model/ocFilecache")
const ocFileCache = get_ocFileCache(sequelize)
const pagingUtil = require("@/utils/pagingUtil")



const getoc_filecache = async (pageIndex, pageSize, where = {}) => {
    pageIndex = parseInt(pageIndex)
    pageSize = parseInt(pageSize)

    const result = await ocFileCache.findAndCountAll({
        where,
        offset: pageIndex * pageSize,
        limit: pageSize,
        raw: true
    })
    return pagingUtil.defaultPaging(result, pageSize)
}

module.exports = {
    getoc_filecache
}