const singleItemPddRepo = require("../repository/singleItemPddRepo")

/**
 * 获取分页的拼多多单品表数据
 * @param pageIndex
 * @param pageSize
 * @param startTime
 * @param endTime
 * @returns {Promise<{pageCount: *, total: *, data: *}>}
 */
const getPagingPddSingleItems = async (pageIndex, pageSize, startDate, endDate) => {
    return singleItemPddRepo.getPagingPddSingleItems(pageIndex, pageSize, startDate, endDate)
}

module.exports = {getPagingPddSingleItems}