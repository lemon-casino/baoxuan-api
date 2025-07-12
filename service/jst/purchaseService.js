const { getPurchaseOrderByDate } = require('../../core/jstReq/purchaseReq')
const purchaseOrderRepo = require('../../repository/jst/purchaseOrderRepo')
const moment = require('moment')

const syncPurchase = async (start, end) => {
    start = start || moment().subtract(3, 'hour').format('YYYY-MM-DD HH:mm:ss')
    end = end || moment().format('YYYY-MM-DD HH:mm:ss')
    let result = await getPurchaseOrderByDate(start, end)
    let data = [], count = 0
    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i]['items'].length; j++) {
            let info = await purchaseOrderRepo.getBySkuCodeAndDate(
                result[i]['items'][j]['sku_id'], result[i]['po_date'])
            if (info?.length) {
                purchaseOrderRepo.update([
                    result[i]['items'][j]['remark'], 
                    result[i]['status'], 
                    result[i]['confirm_date'], 
                    result[i]['finish_time'], 
                    result[i]['modified'], 
                    result[i]['po_id'],
                    result[i]['items'][j]['sku_id']
                ])
            } else {
                data.push(
                    result[i]['po_date'],
                    result[i]['po_id'],
                    result[i]['so_id'],
                    result[i]['items'][j]['remark'],
                    result[i]['status'],
                    result[i]['supplier_id'],
                    result[i]['seller'],
                    result[i]['purchaser_name'],
                    result[i]['items'][j]['sku_id'],
                    result[i]['items'][j]['i_id'],
                    result[i]['items'][j]['qty'],
                    result[i]['items'][j]['plan_arrive_qty'],
                    result[i]['items'][j]['price'],
                    result[i]['items'][j]['delivery_date'],
                    result[i]['confirm_date'],
                    result[i]['finish_time'],
                    result[i]['modified'],
                )
                count++
            }
        }
    }
    if (count > 0) await purchaseOrderRepo.batchInsert(data, count)
}

module.exports = {
    syncPurchase,
}