const settlementRepo = require('../repository/settlementRepo')
const { projectNameList } = require('../const/operationConst')
const moment = require('moment')

const batchInsert = async (sheet, projectName, shopName, time, extra) => {
    let result = false
    let func = getFuncByProjectName(projectName)
    let params = {sheet, shopName, time, extra}
    let {count, data} = await func(params)
    if (count > 0) result = await settlementRepo.batchInsert(count, data)
    return result
}

const getFuncByProjectName = (name) => {
    switch(name) {
        case projectNameList.pdd:
            return getPDDInfo
        case projectNameList.tgc:
            return getTGCInfo
        case projectNameList.tmmart:
            return getTMMartInfo
        case projectNameList.coupang:
            return getCoupangInfo
        case projectNameList.jd:
            return getJDInfo
        case projectNameList.jdss:
            return getJDSSInfo
        case projectNameList.jdssp:
            return getJDSSPInfo
        case projectNameList.dy:
            return getDYInfo
        case projectNameList.wxvideo:
            return getWXVideoInfo
        case projectNameList.vip:
            return getVIPInfo
        case projectNameList['1688']:
            return get1688Info
        case projectNameList.xy:
            return getXYInfo
        case projectNameList.dw:
            return getDWInfo
        case projectNameList.ks:
            return getKSInfo
        case projectNameList.xhs:
            return getXHSInfo
        case projectNameList.tm:
            return getTMInfo
        default:
    }
}

//pdd
const getPDDInfo = async (params) => {
    let count = 0, data = []
    let rows = params.sheet[0].getRows(6, params.sheet[0].rowCount - 5)
    for (let i = 0; i < params.sheet[0].rowCount - 5; i++) {
        let row = rows[i]
        if (!row.getCell(2).value) break
        let settle_time = row.getCell(2).value, order_id = '', 
        sub_order_id = '', settle_order_id = '', amount = 0, type = '', 
        shop_name = params.shopName, goods_id = '', sku_id = ''
        if (row.getCell(1).value) settle_order_id = row.getCell(1).value
        if (row.getCell(3).value != 0) amount = row.getCell(3).value
        if (row.getCell(4).value != 0) amount = row.getCell(4).value
        if (row.getCell(5).value) type = row.getCell(5).value
        if (amount == 0) continue
        count += 1
        data.push(
            settle_time,
            order_id,
            sub_order_id,
            settle_order_id,
            amount,
            type,
            shop_name,
            goods_id,
            sku_id
        )
    }
    return {count, data}
}
//tgc
const getTGCInfo = async (params) => {
    let count = 0, data = []
    let columns = params.sheet[0].getRow(1).values
    let settle_time_row = null, order_id_row = null, sub_order_id_row = null, 
        settle_order_id_row = null, amount_row = 0, goods_id_row = null, 
        sku_id_row = null, update_time = false, minus = false, 
        min_settle_time = moment().format('YYYY-MM-DD HH:mm:ss'), type = params.extra, 
        shop_name = params.shopName
    for (let i = 1; i <= columns.length; i++) {
        if (['扣款时间', '结算时间'].includes(columns[i])) {
            settle_time_row = i
        } else if (columns[i] == '结算日期') {
            settle_time_row = i
            update_time = true
        } else if (['主订单单号', '订单号', '交易主单'].includes(columns[i])) {
            order_id_row = i
        } else if (['子订单单号', '子订单号', '交易子单'].includes(columns[i])) {
            sub_order_id_row = i
        } else if (['商户订单号', '支付宝流水号', '支付宝商户订单号'].includes(columns[i])) {
            settle_order_id_row = i
        } else if (['结算金额(元)', '推广费用'].includes(columns[i])) {
            amount_row = i
            minus = true
        } else if (columns[i] == '总结算金额') {
            amount_row = i
        } else if (columns[i] == '商品id') {
            goods_id_row = i
        } else if (['skuid', 'skuId'].includes(columns[i])) {
            sku_id_row = i
        }
    }
    let rows = params.sheet[0].getRows(2, params.sheet[0].rowCount - 1)
    for (let i = 0; i < params.sheet[0].rowCount - 1; i++) {
        let row = rows[i]
        if (!row.getCell(1).value) break
        let settle_time = '', order_id = '', sub_order_id = '', 
        settle_order_id = '', amount = 0, goods_id = '', sku_id = ''
        if (update_time && settle_time_row) {
            let time = row.getCell(settle_time_row).value
            settle_time = `${time.substring(0, 4)}-${time.substring(4, 6)}-${time.substring(6, 8)}`
        } else if (settle_time_row) settle_time = row.getCell(settle_time_row).value
        if (order_id_row) order_id = row.getCell(order_id_row).value
        if (sub_order_id_row) sub_order_id = row.getCell(sub_order_id_row).value
        if (settle_order_id_row) settle_order_id = row.getCell(settle_order_id_row).value
        if (amount_row) {
            amount = row.getCell(amount_row).value
            if (minus) amount = - amount
        }
        if (goods_id_row) goods_id = row.getCell(goods_id_row).value
        if (sku_id_row) 
            sku_id = row.getCell(sku_id_row).value != '-' ? row.getCell(sku_id_row).value : ''
        if (amount == 0) continue
        count += 1
        if (moment(settle_time).valueOf() < moment(min_settle_time).valueOf())
            min_settle_time = settle_time
        data.push(
            settle_time,
            order_id,
            sub_order_id,
            settle_order_id, 
            amount,
            type,
            shop_name,
            goods_id,
            sku_id
        )
    }
    await settlementRepo.delete(params.shopName, type, min_settle_time)
    return {count, data}
}
//tm-mart
const getTMMartInfo = async (params) => {
    let count = 0, data = []
    let rows = params.sheet[0].getRows(2, params.sheet[0].rowCount - 1)
    for (let i = 0; i < params.sheet[0].rowCount - 1; i++) {
        let row = rows[i]
        if (!row.getCell(1).value) break
        let settle_time = '', order_id = '', sub_order_id = '', 
        settle_order_id = '', amount = 0, type = '', 
        shop_name = params.shopName, goods_id = '', sku_id = ''
        if (row.getCell(27).value) settle_order_id = row.getCell(27).value
        if (row.getCell(2).value) settle_time = row.getCell(2).value
        if (row.getCell(5).value) order_id = row.getCell(5).value
        if (row.getCell(6).value) sub_order_id = row.getCell(6).value
        if (row.getCell(15).value) amount = row.getCell(15).value
        if (row.getCell(10).value) type = row.getCell(10).value
        if (row.getCell(19).value) goods_id = row.getCell(19).value
        if (amount == 0) continue
        count += 1
        data.push(
            settle_time,
            order_id,
            sub_order_id,
            settle_order_id,
            amount,
            type,
            shop_name,
            goods_id,
            sku_id
        )
    }
    return {count, data}
}
//coupang
const getCoupangInfo = async (params) => {
    let count = 0, data = []
    let rows = params.sheet[0].getRows(2, params.sheet[0].rowCount - 1)
    for (let i = 0; i < params.sheet[0].rowCount - 1; i++) {
        let row = rows[i]
        if (!row.getCell(1).value) break
        let settle_time = '', order_id = settle_order_id = row.getCell(1).value, 
        sub_order_id = '', amount = 0, type = '', shop_name = params.shopName, 
        goods_id = '', sku_id = ''
        if (row.getCell(25).value) settle_time = row.getCell(25).value
        if (row.getCell(18).value) amount = row.getCell(18).value
        if (row.getCell(2).value) type = row.getCell(2).value
        if (row.getCell(3).value) goods_id = row.getCell(3).value
        if (row.getCell(5).value) sku_id = row.getCell(5).value
        if (amount == 0) continue
        count += 1
        data.push(
            settle_time,
            order_id,
            sub_order_id,
            settle_order_id,
            amount,
            type,
            shop_name,
            goods_id,
            sku_id
        )
    }
    return {count, data}
}
//jd
const getJDInfo = async (params) => {
    let count = 0, data = []
    let rows = params.sheet[0].getRows(2, params.sheet[0].rowCount - 1)
    for (let i = 0; i < params.sheet[0].rowCount - 1; i++) {
        let row = rows[i]
        if (!row.getCell(1).value) break
        let settle_time = '', order_id = '', sub_order_id = '', 
        settle_order_id = '', amount = 0, type = '', 
        shop_name = params.shopName, goods_id = '', sku_id = ''
        if (row.getCell(5).value) 
            settle_order_id = row.getCell(5).value.replace(/"/g,'').replace(/=/, '')
        if (row.getCell(10).value) settle_time = row.getCell(10).value
        if (row.getCell(1).value) 
            order_id = row.getCell(1).value.replace(/"/g,'').replace(/=/, '')
        if (row.getCell(12).value) amount = row.getCell(12).value
        if (row.getCell(11).value) type = row.getCell(11).value
        if (row.getCell(4).value) 
            goods_id = row.getCell(4).value.replace(/"/g,'').replace(/=/, '')
        if (amount == 0) continue
        count += 1
        data.push(
            settle_time,
            order_id,
            sub_order_id,
            settle_order_id,
            amount,
            type,
            shop_name,
            goods_id,
            sku_id
        )
    }
    return {count, data}
}
//jd-ss
const getJDSSInfo = async (params) => {
    let count = 0, data = []
    let rows = params.sheet[0].getRows(2, params.sheet[0].rowCount - 1)
    let total = 0, max_settle_time
    for (let i = 0; i < params.sheet[0].rowCount - 1; i++) {
        let row = rows[i]
        if (!row.getCell(1).value) break
        let settle_time = '', order_id = '', sub_order_id = '', 
        settle_order_id = row.getCell(1).value, amount = 0, type = '', 
        shop_name = params.shopName, goods_id = '', sku_id = ''
        if (row.getCell(6).value) settle_order_id = `${settle_order_id}-${row.getCell(6).value}`
        if (row.getCell(8).value) settle_time = row.getCell(8).value
        if (row.getCell(17).value) order_id = row.getCell(17).value
        if (row.getCell(16).value) amount = row.getCell(16).value
        if (row.getCell(5).value) type = row.getCell(5).value
        if (row.getCell(12).value) goods_id = row.getCell(12).value
        if (row.getCell(13).value) sku_id = row.getCell(13).value
        if (amount == 0) continue
        count += 1
        data.push(
            settle_time,
            order_id,
            sub_order_id,
            settle_order_id,
            amount,
            type,
            shop_name,
            goods_id,
            sku_id
        )
        total += amount
        if (!settle_time || 
            moment(max_settle_time).valueOf() < moment(settle_time).valueOf())
            max_settle_time = settle_time
    }
    if (total > 0) {
        count += 1
        data.push(
            settle_time,
            null,
            null,
            null,
            total * 0.07,
            '税点',
            params.shopName,
            null,
            null
        )
    }
    return {count, data}
}
//jd-ss-p
const getJDSSPInfo = async (params) => {
    let count = 0, data = []
    // let rows = params.sheet[0].getRows(2, params.sheet[0].rowCount - 1)
    // let total = 0
    // for (let i = 0; i < params.sheet[0].rowCount - 1; i++) {
    //     let row = rows[i]
    //     if (!row.getCell(1).value) break
    //     let settle_time = '', order_id = '', sub_order_id = '', 
    //     settle_order_id = row.getCell(1).value, amount = 0, type = '', 
    //     shop_name = params.shopName, goods_id = '', sku_id = ''
    //     if (row.getCell(6).value) settle_order_id = `${settle_order_id}-${row.getCell(6).value}`
    //     if (row.getCell(8).value) settle_time = row.getCell(8).value
    //     if (row.getCell(17).value) order_id = row.getCell(17).value
    //     if (row.getCell(16).value) amount = row.getCell(16).value
    //     if (row.getCell(5).value) type = row.getCell(5).value
    //     if (row.getCell(12).value) goods_id = row.getCell(12).value
    //     if (row.getCell(13).value) sku_id = row.getCell(13).value
    //     if (amount == 0) continue
    //     count += 1
    //     data.push(
    //         settle_time,
    //         order_id,
    //         sub_order_id,
    //         settle_order_id,
    //         amount,
    //         type,
    //         shop_name,
    //         goods_id,
    //         sku_id
    //     )
    // }
    return {count, data}
}
//dy
const getDYInfo = async (params) => {
    let count = 0, data = []
    let rows = params.sheet[0].getRows(2, params.sheet[0].rowCount - 1)
    for (let i = 0; i < params.sheet[0].rowCount - 1; i++) {
        let row = rows[i]
        if (!row.getCell(1).value) break
        let settle_time = row.getCell(1).value, order_id = '', 
        sub_order_id = '', settle_order_id = '', amount = 0, type = '', 
        shop_name = params.shopName, goods_id = '', sku_id = ''
        if (row.getCell(11).value) settle_time = row.getCell(11).value
        if (row.getCell(8).value) sub_order_id = row.getCell(8).value.replace(/'/g,'')
        if (row.getCell(9).value) order_id = row.getCell(9).value.replace(/'/g,'')
        if (row.getCell(2).value) settle_order_id = row.getCell(2).value.replace(/'/g,'')
        if (row.getCell(3).value == '入账') amount = row.getCell(4).value
        else amount = - row.getCell(4).value
        if (row.getCell(6).value) type = row.getCell(6).value
        if (row.getCell(12).value) goods_id = row.getCell(12).value.replace(/'/g,'')
        if (amount == 0) continue
        count += 1
        data.push(
            settle_time,
            order_id,
            sub_order_id,
            settle_order_id, 
            amount,
            type,
            shop_name,
            goods_id,
            sku_id
        )
    }
    return {count, data}
}
//wx-video
const getWXVideoInfo = async (params) => {
    let count = 0, data = []
    let rows = params.sheet[0].getRows(2, params.sheet[0].rowCount - 1)
    for (let i = 0; i < params.sheet[0].rowCount - 1; i++) {
        let row = rows[i]
        if (!row.getCell(1).value) break
        let settle_time = '', order_id = row.getCell(1).value, 
        sub_order_id = '', settle_order_id = '', amount = 0, type = '', 
        shop_name = params.shopName, goods_id = '', sku_id = ''
        if (row.getCell(1).value) settle_order_id = row.getCell(1).value
        if (row.getCell(7).value) order_id = row.getCell(7).value
        if (row.getCell(2).value) settle_time = row.getCell(2).value
        if (row.getCell(4).value == '收入') amount = row.getCell(5).value
        else amount = - row.getCell(5).value
        if (row.getCell(3).value) type = row.getCell(3).value
        if (amount == 0) continue
        count += 1
        data.push(
            settle_time,
            order_id,
            sub_order_id,
            settle_order_id, 
            amount,
            type,
            shop_name,
            goods_id,
            sku_id
        )
    }
    return {count, data}
}
//vip
const getVIPInfo = async (params) => {
    let count = 0, data = []
    let rows = params.sheet[0].getRows(2, params.sheet[0].rowCount - 1)
    for (let i = 0; i < params.sheet[0].rowCount - 1; i++) {
        let row = rows[i]
        if (!row.getCell(1).value) break
        let settle_time = '', order_id = '', sub_order_id = '', 
        settle_order_id = row.getCell(1).value, amount = 0, type = '', 
        shop_name = params.shopName, goods_id = '', sku_id = ''
        if (row.getCell(4).value) settle_time = row.getCell(4).value
        if (row.getCell(9).value) order_id = row.getCell(9).value
        if (row.getCell(27).value) amount = row.getCell(27).value
        if (row.getCell(5).value) type = row.getCell(5).value
        if (row.getCell(10).value) sku_id = row.getCell(10).value
        if (amount == 0) continue
        count += 1
        data.push(
            settle_time,
            order_id,
            sub_order_id,
            settle_order_id,
            amount,
            type,
            shop_name,
            goods_id,
            sku_id
        )
    }
    return {count, data}
}
//1688
const get1688Info = async (params) => {
    let count = 0, data = []
    let rows = params.sheet[0].getRows(2, params.sheet[0].rowCount - 1)
    for (let i = 0; i < params.sheet[0].rowCount - 1; i++) {
        let row = rows[i]
        if (!row.getCell(1).value) break
        let settle_time = '', order_id = settle_order_id = row.getCell(1).value, 
        sub_order_id = '', amount = 0, type = '', shop_name = params.shopName, 
        goods_id = '', sku_id = ''
        if (row.getCell(6).value) settle_time = row.getCell(6).value
        if (row.getCell(5).value) amount = row.getCell(5).value
        if (row.getCell(10).value) type = row.getCell(10).value
        if (amount == 0) continue
        count += 1
        data.push(
            settle_time,
            order_id,
            sub_order_id,
            settle_order_id,
            amount,
            type,
            shop_name,
            goods_id,
            sku_id
        )
    }
    return {count, data}
}
//xy
const getXYInfo = async (params) => {
    let count = 0, data = []
    return {count, data}
}
//dw
const getDWInfo = async (params) => {
    let count = 0, data = [], settle_order_id = ''
    for (let i = 0; i < params.sheet.length; i++) {
        if (params.sheet[i].name == '账单总览') {
            settle_order_id = params.sheet[i].getRow(4).getCell(1).value
            break
        }
    }
    for (let i = 0; i < params.sheet.length; i++) {
        if (params.sheet[i].name == '账单总览') continue
        let rows = params.sheet[i].getRows(1, params.sheet[i].rowCount)
        let start = 0
        for (let j = 0; j < params.sheet[i].rowCount; j++) {
            let row = rows[j]
            if (['订单号', '费用类型', '账单编号'].includes(row.getCell(1).value)) {
                start = j + 1
                break
            }
        }

        let columns = params.sheet[i].getRow(start).values
        let settle_time_row = null, order_id_row = null, sub_order_id_row = null, 
            amount_row = 0
        for (let j = 1; j <= columns.length; j++) {
            if (['发货时间', '退货创建时间'].includes(columns[j])) {
                settle_time_row = j
            } else if ('订单号' == columns[j]) {
                order_id_row = j
            } else if ('退货订单号' == columns[j]) {
                sub_order_id_row = j
            } else if (['应结金额', '结算金额', '偿还总金额'].includes(columns[j])) {
                amount_row = j
            }
        }
        for (let j = start; j < params.sheet[i].rowCount - start && start > 0; j++) {
            let row = rows[j]
            if (['订单号', '费用类型', '账单编号'].includes(row.getCell(1).value)) continue
            let settle_time = params.time, order_id = '', 
            sub_order_id = '', amount = 0, type = params.sheet[i].name, 
            shop_name = params.shopName, goods_id = '', sku_id = ''
            if (settle_time_row) settle_time = row.getCell(settle_time_row).value
            if (order_id_row) order_id = row.getCell(order_id_row).value
            if (sub_order_id_row) sub_order_id = row.getCell(sub_order_id_row).value
            if (amount_row) amount = row.getCell(amount_row).value
            if (amount == 0) continue
            count += 1
            data.push(
                settle_time,
                order_id,
                sub_order_id,
                settle_order_id, 
                amount,
                type,
                shop_name,
                goods_id,
                sku_id
            )
        }
    }
    return {count, data}
}
//ks
const getKSInfo = async (params) => {
    let count = 0, data = []
    let rows = params.sheet[0].getRows(2, params.sheet[0].rowCount - 1)
    for (let i = 0; i < params.sheet[0].rowCount - 1; i++) {
        let row = rows[i]
        if (!row.getCell(1).value) break
        let settle_time = '', order_id = '', sub_order_id = '', 
        settle_order_id = '', amount = 0, type = '订单', 
        shop_name = params.shopName, goods_id = '', sku_id = ''
        if (row.getCell(32).value) settle_time = row.getCell(32).value
        if (row.getCell(2).value) 
            settle_order_id = order_id = row.getCell(2).value
        if (row.getCell(31).value) amount = row.getCell(31).value
        if (row.getCell(3).value) goods_id = row.getCell(3).value
        if (amount == 0) continue
        count += 1
        data.push(
            settle_time,
            order_id,
            sub_order_id,
            settle_order_id, 
            amount,
            type,
            shop_name,
            goods_id,
            sku_id
        )
    }
    return {count, data}
}
//xhs
const getXHSInfo = async (params) => {
    let count = 0, data = []
    for (let i = 0; i < params.sheet.length; i++) {
        if (params.sheet[i].name == '总览') continue
        let rows = params.sheet[i].getRows(1, params.sheet[i].rowCount)
        let start = 0
        for (let j = 0; j < params.sheet[i].rowCount; j++) {
            let row = rows[j]
            if (['结算时间', '时间'].includes(row.getCell(1).value)) {
                start = j + 1
                break
            }
        }

        let columns = params.sheet[i].getRow(start).values
        let settle_time_row = null, order_id_row = null, sub_order_id_row = null, 
            amount_row = 0
        for (let j = 1; j <= columns.length; j++) {
            if (['结算时间', '时间'].includes(columns[j])) {
                settle_time_row = j
            } else if ('订单号' == columns[j]) {
                order_id_row = j
            } else if ('售后单号' == columns[j]) {
                sub_order_id_row = j
            } else if (['收入金额', '支出总额', '金额', '结算金额', '动账金额'].includes(columns[j])) {
                amount_row = j
            }
        }
        
        for (let j = start; j < params.sheet[i].rowCount - start && start > 0; j++) {
            let row = rows[j]
            if (['结算时间', '时间'].includes(row.getCell(1).value)) continue
            let settle_time = '', order_id = '', 
            sub_order_id = '', amount = 0, type = params.sheet[i].name, 
            shop_name = params.shopName, goods_id = '', sku_id = ''
            if (settle_time_row) settle_time = row.getCell(settle_time_row).value
            if (order_id_row) {
                settle_order_id = order_id = row.getCell(order_id_row).value
            }
            if (sub_order_id_row) sub_order_id = row.getCell(sub_order_id).value
            if (amount_row) amount = row.getCell(amount_row).value
            if (amount == 0) continue
            count += 1
            data.push(
                settle_time,
                order_id,
                sub_order_id,
                settle_order_id, 
                amount,
                type,
                shop_name,
                goods_id,
                sku_id
            )
        }
    }
    return {count, data}
}
//tm
const getTMInfo = async (params) => {
    let count = 0, data = []
    let columns = params.sheet[0].getRow(1).values
    let settle_time_row = null, order_id_row = null, sub_order_id_row = null, 
    settle_order_id_row = null, amount_row = 0, type_row = null, goods_id_row = null, 
    sku_id_row = null, minus = false, refund_row = null
    for (let i = 1; i <= columns.length; i++) {
        if (columns[i] == '扣费日期') {
            minus = true
        } else if (['订单号', '交易主订单号'].includes(columns[i])) {
            order_id_row = i
        } else if (['子订单号', '交易子订单号'].includes(columns[i])) {
            sub_order_id_row = i
        } else if (['商户订单号', '支付宝商户订单号', '支付宝商户订单号(新增)'].includes(columns[i])) {
            if (!settle_order_id_row) settle_order_id_row = i
        } else if (['订单实际金额（元）', '支出金额（元）', '扣费金额'].includes(columns[i])) {
            amount_row = i
            if (columns[i] == '扣费金额') minus = true
        } else if (columns[i] == '业务大类') {
            type_row = i
        } else if (columns[i] == '商品ID') {
            goods_id_row = i
        } else if (columns[i] == 'sku') {
            sku_id_row = i
        } else if (columns[i] == '退款金额（元）') {
            refund_row = i
        } else if (columns[i] == '打款时间') {
            settle_order_id_row = i
        }
    }
    let rows = params.sheet[0].getRows(2, params.sheet[0].rowCount - 1)
    for (let i = 0; i < params.sheet[0].rowCount - 1; i++) {
        let row = rows[i]
        if (!row.getCell(1).value) break
        let settle_time = params.time, order_id = '', sub_order_id = '', 
        settle_order_id = '', amount = 0, type = params.extra, 
        shop_name = params.shopName, goods_id = '', sku_id = ''
        if (settle_time_row) settle_time = row.getCell(settle_time_row).value
        if (order_id_row) order_id = row.getCell(order_id_row).value
        if (sub_order_id_row) sub_order_id = row.getCell(sub_order_id_row).value
        if (settle_order_id_row) settle_order_id = row.getCell(settle_order_id_row).value
        if (amount_row) {
            amount = row.getCell(amount_row).value
            if (minus) amount = - amount
        }
        if (type_row) {
            if (typeof(row.getCell(type_row).value) == 'string' && 
            row.getCell(type_row).value.trim() == '交易货款' &&
            row.getCell(refund_row).value && 
            row.getCell(refund_row).value > 0)
                amount = - row.getCell(refund_row).value
        }
        if (goods_id_row) goods_id = row.getCell(goods_id_row).value
        if (sku_id_row) sku_id = row.getCell(sku_id_row).value
        if (amount == 0) continue
        count += 1
        data.push(
            settle_time,
            order_id,
            sub_order_id,
            settle_order_id, 
            amount,
            type,
            shop_name,
            goods_id,
            sku_id
        )
    }
    return {count, data}
}

module.exports = {
    batchInsert
}