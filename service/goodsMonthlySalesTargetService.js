const goodsMonthSalesTarget = require('@/repository/operation/goodsMonthlySalesTarget')
const moment = require('moment')
const goodsMonthSalesTargetService = {}

goodsMonthSalesTargetService.import = async (rows) => {
    let result = false, count = 0, data = []
    let columns = rows[0].values,
        goods_id_row = null,
        month_row = null,
        amount_row = null
    for (let i = 1; i < columns.length; i++) {
        if (columns[i] == '链接ID') {goods_id_row = i;  continue}
        if (columns[i] == '年月') {month_row = i; continue}
        if (columns[i] == '目标') {amount_row = i; continue}
    }
    for (let i = 1; i < rows.length; i++) {
        if (!rows[i].getCell(1).value) continue
        let goods_id = typeof(rows[i].getCell(goods_id_row).value) == 'string' ? 
            rows[i].getCell(goods_id_row).value.trim() : 
            rows[i].getCell(goods_id_row).value
        let month = typeof(rows[i].getCell(month_row).value) == 'string' ? 
            rows[i].getCell(month_row).value.trim() : 
            rows[i].getCell(month_row).value
        let amount = rows[i].getCell(amount_row).value
        let info = await goodsMonthSalesTarget.getInfo(goods_id, month)
        if (info?.length) {
            result = await goodsMonthSalesTarget.update(goods_id, month, amount)
            logger.info(`[销售目标更新], 链接ID:${goods_id}, 年月:${month}, 原目标:${info[0].amount}, 现目标:${amount}`)
        } else {
            data.push(
                goods_id,
                month,
                amount
            )
            count += 1
        }
    }
    if (count > 0)
        result = await goodsMonthSalesTarget.batchInsert(count, data)
    logger.info(`[销售目标导入], 总计数量:${count}`)
    return result
}

goodsMonthSalesTargetService.goodsUpdate = async (goods_id,month,amount) => {
    let result= null,data = []
    let info = await goodsMonthSalesTarget.getInfo(goods_id,month)
    if (info?.length){
        result = await goodsMonthSalesTarget.update(goods_id, month, amount)
    }else{
        data.push(
            goods_id,
            month,
            amount
        )
        count = 1
        result = await goodsMonthSalesTarget.batchInsert(count, data)
    }
    return result
}

goodsMonthSalesTargetService.get = async (params) => {
    let page = parseInt(params.currentPage)
    let limit = parseInt(params.pageSize)
    let offset = (page - 1) * limit
    let start = params.start ? moment(params.start).format('YYYYMM') : null
    let end = params.end ? moment(params.end).format('YYYYMM') : null
    let result = await goodsMonthSalesTarget.getByMonth(params.goods_id, offset, limit, start, end)
    return result
}

goodsMonthSalesTargetService.getByDate = async (params) => {
    let start = moment(params.startDate).format('YYYYMM')
    let end = moment(params.endDate).format('YYYYMM')
    let result = await goodsMonthSalesTarget.getDetailByMonth(start, end, params.department)
    return result
}

module.exports = goodsMonthSalesTargetService