const goodsSaleInfoRepo = require('../repository/operation/goodsSaleInfoRepo')
const userOperationRepo = require('../repository/operation/userOperationRepo')
const divisionInfoRepo = require('../repository/operation/divisionInfoRepo')
const projectInfoRepo = require('../repository/operation/projectInfoRepo')
const shopInfoRepo = require('../repository/operation/shopInfoRepo')
const teamInfoRepo = require('../repository/operation/teamInfoRepo')
const {
    typeList, 
    operationDefaultItem, 
    statItem, 
    workItemList, 
    workItemMap, 
    projectNameList, 
    workTypeList 
} = require('../const/operationConst')
const settlementRepo = require('../repository/settlementRepo')
const newFormsRepo = require('../repository/newFormsRepo')
const goodsOtherInfoRepo = require('../repository/operation/goodsOtherInfoRepo')
const goodsPromotionRepo = require('../repository/operation/goodsPromotionRepo')
const moment = require('moment')

/**
 * get operation data pannel data stats
 * division > project > shop / team > user
 * @param {*} id 
 * @param {*} start 
 * @param {*} end 
 * @param {*} params 
 * @returns 
 */
const getDataStats = async (id, start, end, params) => {
    let result = JSON.parse(JSON.stringify(operationDefaultItem))
    let sale_amount = 0, promotion_amount = 0, express_fee = 0, profit = 0, 
        invoice = 0, oriType, type = '', except = false, operation_amount = 0, 
        words_market_vol = 0, words_vol = 0, real_sale_qty = 0, refund_qty = 0,
        children = []
    if (params.type) {
        // jump permission, high level => low level
        oriType = typeList[params.type].map[0]
        for (let i = 0; i < typeList[params.type].map.length; i++) {
            const { shops, users, typeValue } = await getQueryInfo(
                typeList[params.type].map[i], 
                typeList[params.type].key, 
                0, 
                params.name, 
            )
            if (shops.length) {
                result = await queryShopInfo(shops, result, typeValue, start, end)
            }
            if (users.length) {
                result = await queryUserInfo(users, result, typeValue, start, end)
            }
            result[typeValue].column = typeList[typeValue].item
        }
    } else {
        // user permission
        const permissions = await userOperationRepo.getPermission(id)
        if (permissions.length == 0) return []
        oriType = permissions[0].type
        if ([typeList.division.key, typeList.project.key].includes(oriType)) except = true
        for (let i = 0; i < permissions.length; i++) {
            const { shops, users, typeValue } = await getQueryInfo(
                permissions[i].type, 
                null, 
                permissions[i].detail_id, 
                null,
            )
            if (shops.length) {
                result = await queryShopInfo(shops, result, typeValue, start, end)
            }
            if (users.length) {
                result = await queryUserInfo(users, result, typeValue, start, end)
            }
            result[typeValue].column = typeList[typeValue].item
        }
    }
    // get total stats calc level
    switch(oriType) {
        case typeList.division.key:
            type = typeList.division.value
            break
        case typeList.project.key:
            type = typeList.project.value
            break
        case typeList.shop.key:
            type = typeList.shop.value
            break
        case typeList.team.key:
            type = typeList.team.value
            break
        case typeList.user.key:
            type = typeList.user.value
            break
        default:
    }
    for (let i = 0; i < result[type].data.length; i++) {
        sale_amount += parseFloat(result[type].data[i].sale_amount)
        promotion_amount += parseFloat(result[type].data[i].promotion_amount)
        operation_amount += parseFloat(result[type].data[i].operation_amount)
        words_market_vol += parseFloat(result[type].data[i].words_market_vol)
        words_vol += parseFloat(result[type].data[i].words_vol)
        real_sale_qty += parseFloat(result[type].data[i].real_sale_qty)
        refund_qty += parseFloat(result[type].data[i].refund_qty)
        express_fee += parseFloat(result[type].data[i].express_fee)
        profit += parseFloat(result[type].data[i].profit)
        if (type == typeList.project.value && result[type].data[i].name == projectNameList.coupang) continue
        invoice += parseFloat(result[type].data[i].invoice)
        for (let j = 0; j < result[type].data[i].children.length; j++) {
            if (!children[result[type].data[i].children[j].type]) {
                let tmp = JSON.parse(JSON.stringify(result[type].data[i].children[j]))
                tmp.id = 11 + j
                tmp.closed = true
                children[result[type].data[i].children[j].type] = tmp
            } else {
                for (let k in children[j]) {
                    if (!['id', 'name', 'closed'].includes(k))
                        children[result[type].data[i].children[j].type][k] = parseFloat(children[result[type].data[i].children[j].type][k]) + 
                            parseFloat(result[type].data[i].children[j][k])
                }
            }
        }
    }
    for (let j = 0; j < children.length; j++) {
        for (let k in children[j]) {
            if (!['id', 'name', 'closed'].includes(k))
                children[j][k] = parseFloat(children[j][k]).toFixed(2)
        }
    }
    result.total.data[0].id = 10
    result.total.data[0].profit_rate = sale_amount > 0 ? (profit / sale_amount * 100).toFixed(2) : '0.00'
    result.total.data[0].operation_rate = sale_amount > 0 ? (operation_amount / sale_amount * 100).toFixed(2) : '0.00'
    result.total.data[0].operation_amount = operation_amount.toFixed(2)
    result.total.data[0].words_market_vol = words_market_vol.toFixed(2)
    result.total.data[0].words_vol = words_vol.toFixed(2)
    result.total.data[0].real_sale_qty = real_sale_qty.toFixed(2)
    result.total.data[0].refund_qty = refund_qty.toFixed(2)
    result.total.data[0].roi = promotion_amount > 0 ? (sale_amount / promotion_amount).toFixed(2) : '0.00'
    result.total.data[0].market_rate = words_market_vol > 0 ? (words_vol / words_market_vol * 100).toFixed(2) : '0.00'
    result.total.data[0].refund_rate = real_sale_qty > 0 ? (refund_qty / real_sale_qty * 100).toFixed(2) : '0.00'
    result.total.column = JSON.parse(JSON.stringify(result[type].column))
    result.total.column[0].is_link = false
    result.total.data[0].sale_amount = sale_amount.toFixed(2)
    result.total.data[0].promotion_amount = promotion_amount.toFixed(2)
    result.total.data[0].express_fee = express_fee.toFixed(2)
    result.total.data[0].profit = profit.toFixed(2)
    result.total.data[0].invoice = invoice.toFixed(2)
    result.total.data[0].children = children.filter(item => item.id)
    return result
}

const getDataStatsDetail = async (type, name, column, start, end) => {
    let result = [], shops = [], users = []
    if (type == 'total') {
        shops = await shopInfoRepo.getInfo()
    } else {
        let res = await getQueryInfo(
            typeList[type].map[0], 
            typeList[type].key, 
            0, 
            name, 
        )
        shops = res.shops
        users = res.users
    }
    if (shops?.length) {
        let shopNames = ''
        for (let i = 0; i < shops.length; i++) {
            shopNames = `${shopNames}${shops[i].shop_name}","`
        }
        shopNames = shopNames.substring(0, shopNames.length - 3)
        if (['sale_amount', 'promotion_amount', 'express_fee', 'profit', 'operation_amount', 'real_sale_qty', 'refund_qty'].includes(column))
            result = await goodsSaleInfoRepo.getDetailByShopNamesAndTme(shopNames, column, start, end)
        else if (column == 'operation_rate')
            result = await goodsSaleInfoRepo.getRateByShopNamesAndTme(shopNames, 'sale_amount', 'promotion_amount', column, start, end, 100)
        else if (column == 'roi')
            result = await goodsSaleInfoRepo.getRateByShopNamesAndTme(shopNames, 'promotion_amount', 'sale_amount', column, start, end, 1)
        else if (column == 'refund_rate')
            result = await goodsSaleInfoRepo.getRateByShopNamesAndTme(shopNames, 'real_sale_qty', 'refund_qty', column, start, end, 100)
        else if (column == 'profit_rate')
            result = await goodsSaleInfoRepo.getRateByShopNamesAndTme(shopNames, 'sale_amount', 'profit', column, start, end, 100)
        else if (['words_vol', 'words_market_vol'].includes(column))
            result = await goodsOtherInfoRepo.getDetailByShopNamesAndTme(shopNames, column, start, end)
        else if (column == 'market_rate')
            result = await goodsOtherInfoRepo.getRateByShopNamesAndTme(shopNames, 'words_market_vol', 'words_vol', column, start, end, 100)
        else if (column == 'invoice')
            result = await settlementRepo.getAmountDetailByShopNames(start, end + ' 23:59:59', shopNames)
    }
    if (users?.length) {
        let userNames = '', shopNames = ''
        for (let i = 0; i < users.length; i++) {
            userNames = `${userNames}${users[i].nickname}","`
            if (users[i].shop_name) shopNames = `${shopNames}${users[i].shop_name.split(',').join('","')}","`
        }
        if (shopNames?.length) shopNames = shopNames.substring(0, shopNames.length - 3)
        userNames = userNames.substring(0, userNames.length - 3)
        let links = await userOperationRepo.getLinkIdsByUserNames(userNames, shopNames)
        let linkIds = links.map((item) => item.goods_id).join('","')
        if (['sale_amount', 'promotion_amount', 'express_fee', 'profit', 'operation_amount', 'real_sale_qty', 'refund_qty'].includes(column))
            result = await goodsSaleInfoRepo.getDetailByLinkIdsAndTme(linkIds, column, start, end)
        else if (column == 'operation_rate')
            result = await goodsSaleInfoRepo.getRateByLinkIdsAndTme(linkIds, 'sale_amount', 'promotion_amount', column, start, end, 100)
        else if (column == 'roi')
            result = await goodsSaleInfoRepo.getRateByLinkIdsAndTme(linkIds, 'promotion_amount', 'sale_amount', column, start, end, 1)
        else if (column == 'refund_rate')
            result = await goodsSaleInfoRepo.getRateByLinkIdsAndTme(linkIds, 'real_sale_qty', 'refund_qty', column, start, end, 100)
        else if (column == 'profit_rate')
            result = await goodsSaleInfoRepo.getRateByLinkIdsAndTme(linkIds, 'sale_amount', 'profit', column, start, end, 100)
        else if (['words_vol', 'words_market_vol'].includes(column))
            result = await goodsOtherInfoRepo.getDetailByLinkIdsAndTme(linkIds, column, start, end)
        else if (column == 'market_rate')
            result = await goodsOtherInfoRepo.getRateByLinkIdsAndTme(linkIds, 'words_market_vol', 'words_vol', column, start, end, 100)
    }
    return result || []
}

const getQueryInfo = async (type, oriType, id, oriName) => {
    let shops = [], users = [], typeValue = ''
    switch(type) {
        case typeList.division.key:
            shops = await divisionInfoRepo.getShopNameById(id)
            typeValue = typeList.division.value         
            break
        case typeList.project.key:
            if (id) shops = await projectInfoRepo.getShopNameById(id)
            else shops = await divisionInfoRepo.getShopNameByName(oriName)
            typeValue = typeList.project.value
            break
        case typeList.shop.key:
            if (id) shops = await shopInfoRepo.getShopNameById(id)
            else shops = await projectInfoRepo.getShopNameByName(oriName)
            typeValue = typeList.shop.value
            break
        case typeList.team.key:
            if (id) users = await teamInfoRepo.getUserNameByTeamId(id)
            else users = await teamInfoRepo.getUserNameByProjectName(oriName)
            typeValue = typeList.team.value
            break
        case typeList.user.key:
            if (id) users = await userOperationRepo.getUserById(id)
            else if (oriType == typeList.project.key) users = await userOperationRepo.getUsersByProjectName(oriName)
            else if (oriType == typeList.shop.key) users = await userOperationRepo.getUsersByShopName(oriName)
            else if (type != oriType) users = await teamInfoRepo.getUserNameByTeamName(oriName)
            else users = [{nickname: oriName, name: oriName}]
            typeValue = typeList.user.value
            break
        default:
    }
    return {users, shops, typeValue}
}

const queryShopInfo = async (shops, result, type, start, end) => {
    let sale_amount = 0, invoice = 0, info, promotion_amount = 0, 
        express_fee = 0, profit = 0, profit_rate = 0, operation_rate = 0, 
        roi = 0, market_rate = 0, refund_rate = 0, operation_amount = 0,
        real_sale_qty = 0, refund_qty = 0, words_market_vol = 0, words_vol = 0
    let shopName = [], j = -1, except = false
    if (typeList.division.value == type) except = true
    for (let i = 0; i < shops.length; i++) {
        if (i == 0 || shops[i].name != shops[i-1].name) {
            shopName.push({
                shop_name: shops[i].shop_name,
                name: shops[i].name
            })
            j = j+1
        } else {
            shopName[j].shop_name = `${shopName[j].shop_name}","${shops[i].shop_name}`
        }
    }
    for (let i = 0; i < shopName.length; i++) {
        info = await goodsSaleInfoRepo.getPaymentByShopNamesAndTime(shopName[i].shop_name, start, end)
        let children = await goodsSaleInfoRepo.getChildPaymentByShopNamesAndTime(shopName[i].shop_name, start, end)
        if (info?.length) {
            sale_amount = parseFloat(info[0].sale_amount || 0).toFixed(2)
            promotion_amount = parseFloat(info[0].promotion_amount || 0).toFixed(2)
            operation_rate = parseFloat(info[0].operation_rate || 0).toFixed(2)
            roi = parseFloat(info[0].roi || 0).toFixed(2)
            market_rate = parseFloat(info[0].market_rate || 0).toFixed(2)
            refund_rate = parseFloat(info[0].refund_rate || 0).toFixed(2)
            express_fee = parseFloat(info[0].express_fee || 0).toFixed(2)
            profit = parseFloat(info[0].profit || 0).toFixed(2)
            profit_rate = parseFloat(info[0].profit_rate || 0).toFixed(2)
            operation_amount = parseFloat(info[0].operation_amount || 0).toFixed(2)
            real_sale_qty = parseFloat(info[0].real_sale_qty || 0).toFixed(2)
            refund_qty = parseFloat(info[0].refund_qty || 0).toFixed(2)
            words_market_vol = parseFloat(info[0].words_market_vol || 0).toFixed(2)
            words_vol = parseFloat(info[0].words_vol || 0).toFixed(2)
        }
        for (let j = 0; j < children.length; j++) {
            children[j].id = (typeList[type].key + i) * 20 + 1 + j
            children[j].closed = true
            if (children[j].type == 0) children[j].name = '无操作'
            else if (children[j].type == 1) children[j].name = '新品'
            else children[j].name = '老品'
        }
        if (typeList[type].key < 3) {
            info = await settlementRepo.getAmount(start, end + ' 23:59:59', shopName[i].shop_name, except)
            if (info?.length) invoice = parseFloat(info[0].amount || 0).toFixed(2)
        }
        result[type].data.push({
            id: (typeList[type].key + i) * 20,
            name: shopName[i].name,
            sale_amount,
            promotion_amount,
            operation_rate,
            roi,
            market_rate,
            refund_rate,
            express_fee,
            profit,
            profit_rate,
            invoice,
            operation_amount,
            real_sale_qty,
            refund_qty,
            words_market_vol,
            words_vol,
            children
        })           
    }
    return result
}

const queryUserInfo = async (users, result, type, start, end) => {
    let sale_amount = 0, invoice = 0, info, links, promotion_amount = 0, 
        express_fee = 0, profit = 0, profit_rate = 0, operation_rate = 0, 
        roi = 0, market_rate = 0, refund_rate = 0, operation_amount = 0,
        real_sale_qty = 0, refund_qty = 0, words_market_vol = 0, words_vol = 0
    let userName = [], j = -1
    for (let i = 0; i < users.length; i++) {
        if (i == 0 || users[i].name != users[i-1].name) {
            userName.push({
                nickname: users[i].nickname,
                name: users[i].name,
                shops: users[i].shop_name ? [...users[i].shop_name.split(',')] : []
            })
            j = j+1
        } else {
            userName[j].nickname = `${userName[j].nickname}","${users[i].nickname}`
            userName[j].shops = users[i].shop_name ? 
                userName[j].shops.push(...users[i].shop_name.split(',')) :
                userName[j].shops
        }
    }
    for (let i = 0; i < userName.length; i++) {
        if (userName[i].shops.length) {
            let shops = [], exists = {}
            userName[i].shops.forEach(item => {
                if (!exists[item] && item != '') {
                    exists[item] = true
                    shops.push(item)
                }
            })
            userName[i].shopNames = shops.join('","')
        }
        links = await userOperationRepo.getLinkIdsByUserNames(userName[i].nickname, userName[i].shopNames)
        let linkIds = links.map((item) => item.goods_id).join('","')
        info = await goodsSaleInfoRepo.getPaymentByLinkIdsAndTime(linkIds, start, end)
        let children = await goodsSaleInfoRepo.getChildPaymentByLinkIdsAndTime(linkIds, start, end)
        if (info?.length) {
            sale_amount = parseFloat(info[0].sale_amount || 0).toFixed(2)
            promotion_amount = parseFloat(info[0].promotion_amount || 0).toFixed(2)            
            operation_rate = parseFloat(info[0].operation_rate || 0).toFixed(2)
            roi = parseFloat(info[0].roi || 0).toFixed(2)
            market_rate = parseFloat(info[0].market_rate || 0).toFixed(2)
            refund_rate = parseFloat(info[0].refund_rate || 0).toFixed(2)
            express_fee = parseFloat(info[0].express_fee || 0).toFixed(2)
            profit = parseFloat(info[0].profit || 0).toFixed(2)
            profit_rate = parseFloat(info[0].profit_rate || 0).toFixed(2)
            operation_amount = parseFloat(info[0].operation_amount || 0).toFixed(2)
            real_sale_qty = parseFloat(info[0].real_sale_qty || 0).toFixed(2)
            refund_qty = parseFloat(info[0].refund_qty || 0).toFixed(2)
            words_market_vol = parseFloat(info[0].words_market_vol || 0).toFixed(2)
            words_vol = parseFloat(info[0].words_vol || 0).toFixed(2)
        }
        for (let j = 0; j < children.length; j++) {
            children[j].id = (typeList[type].key + i) * 20 + 1 + j
            children[j].closed = true
            if (children[j].type == 0) children[j].name = '无操作'
            else if (children[j].type == 1) children[j].name = '新品'
            else children[j].name = '老品'
        }
        result[type].data.push({
            id: (typeList[type].key + i) * 20,
            name: userName[i].name,
            sale_amount,
            promotion_amount,
            operation_rate,
            roi,
            market_rate,
            refund_rate,
            express_fee,
            profit,
            profit_rate,
            invoice,
            operation_amount,
            real_sale_qty,
            refund_qty,
            words_market_vol,
            words_vol,
            children
        })        
    }
    return result
}

const getGoodsInfo = async (startDate, endDate, params, id) => {
    let result = {
        column: [
            {title: '链接ID', field_id: 'goods_id'},
            {title: '主销编码', field_id: 'sku_id'},
            {title: '店铺名称', field_id: 'shop_name'},
            {title: '店铺编码', field_id: 'shop_id'},
            {title: '商品名称', field_id: 'goods_name'},
            {title: '发货金额', field_id: 'sale_amount', show: true},
            {title: '推广费', field_id: 'promotion_amount', show: true},
            {title: '费比(%)', field_id: 'operation_rate', show: true},
            {title: 'ROI', field_id: 'roi', show: true},
            {title: '市占率(%)', field_id: 'market_rate', show: true},
            {title: '退货率(%)', field_id: 'refund_rate', show: true},
            {title: 'DSR评分', field_id: 'dsr', show: true},
            {title: '运费', field_id: 'express_fee', show: true},
            {title: '利润', field_id: 'profit', show: true},
            {title: '利润率(%)', field_id: 'profit_rate', show: true},
        ],
        data: {}
    }
    let userNames = null, shopNames = null, linkIds = null, shopInfo = [], userInfo = []
    if (params.type) {
        const { shops, users } = await getQueryInfo(
            typeList[params.type].map[0],
            typeList[params.type].key,
            0,
            params.name
        )
        shopInfo = shops
        userInfo = users
    } else {
        const permissions = await userOperationRepo.getPermission(id)
        if (permissions.length == 0) return []
        for (let i = 0; i < permissions.length; i++) {
            if (i > 0 && permissions[i].type != permissions[i-1].type) break
            const { shops, users } = await getQueryInfo(
                permissions[0].type, 
                null, 
                permissions[i].detail_id, 
                null,
            )
            shopInfo.push(...shops)
            userInfo.push(...users)
        }
    }
    if (params.type == typeList.shop.value) {
        shopInfo.push({shop_name: params.name})
    }
    if (shopInfo?.length) shopNames = shopInfo.map((item) => item.shop_name).join('","')
    if (userInfo?.length) {
        userNames = userInfo.map((item) => item.nickname).join('","')
        let links = await userOperationRepo.getLinkIdsByUserNames(userNames, shopNames)
        linkIds = links.map((item) => item.goods_id).join('","')
    }    
    params.search = JSON.parse(params.search)
    result.data = await goodsSaleInfoRepo.getData(startDate, endDate, params, shopNames, linkIds)
    return result
}

const getGoodsInfoDetail = async (column, goods_id, start, end) => {
    let result = []
    if (['sale_amount', 'promotion_amount', 'express_fee', 'profit'].includes(column))
        result = await goodsSaleInfoRepo.getDataDetailByTime(column, goods_id, start, end)
    else if (column == 'operation_rate')
        result = await goodsSaleInfoRepo.getDataRateByTime('sale_amount', 'promotion_amount', column, goods_id, start, end, 100)
    else if (column == 'roi')
        result = await goodsSaleInfoRepo.getDataRateByTime('promotion_amount', 'sale_amount', column, goods_id, start, end, 1)
    else if (column == 'refund_rate')
        result = await goodsSaleInfoRepo.getDataRateByTime('real_sale_qty', 'refund_qty', column, goods_id, start, end, 100)
    else if (column == 'profit_rate')
        result = await goodsSaleInfoRepo.getDataRateByTime('sale_amount', 'profit', column, goods_id, start, end, 100)
    else if (column == 'dsr')
        result = await goodsOtherInfoRepo.getDataDetailByTime(column, goods_id, start, end)
    else if (column == 'market_rate')
        result = await goodsOtherInfoRepo.getDataRateByTime('words_market_vol', 'words_vol', column, goods_id, start, end, 100)
    return result
}

const importGoodsInfo = async (rows, time) => {
    let count = 0, data = [], result = false
    let columns = rows[0].values,
        goods_id_row = null, 
        sku_id_row = null, 
        goods_code_row = null,
        sku_code_row = null,
        shop_name_row = null, 
        shop_id_row = null, 
        goods_name_row = null,
        date = time, 
        sale_amount_row = null, 
        cost_amount_row = null, 
        gross_profit_row = null, 
        gross_profit_rate_row = null, 
        profit_row = null, 
        profit_rate_row = null, 
        promotion_amount_row = null, 
        express_fee_row = null,
        operation_amount_row = null,
        real_sale_qty_row = null,
        refund_qty_row = null;
    for (let i = 1; i <= columns.length; i++) {
        if (columns[i] == '店铺款式编码') {
            goods_id_row = i
            continue
        }
        if (columns[i] == '款式编码(参考)') {
            sku_id_row = i
            continue
        }
        if (columns[i] == '商品款号') {
            goods_code_row = i
            continue
        }
        if (columns[i] == '商品编码') {
            sku_code_row = i
            continue
        }
        if (columns[i] == '店铺名称') {
            shop_name_row = i
            continue
        }
        if (columns[i] == '店铺编码') {
            shop_id_row = i
            continue
        }
        if (columns[i] == '商品名称') {
            goods_name_row = i
            continue
        }
        if (columns[i] == '利润-销售金额(扣退)') {
            sale_amount_row = i
            continue
        }
        if (columns[i] == '利润-销售成本(扣退)') {
            cost_amount_row = i
            continue
        }
        if (columns[i] == '利润-毛利') {
            gross_profit_row = i
            continue
        }
        if (columns[i] == '利润-毛利率') {
            gross_profit_rate_row = i
            continue
        }
        if (columns[i] == '利润-利润') {
            profit_row = i
            continue
        }
        if (columns[i] == '利润-利润率') {
            profit_rate_row = i
            continue
        }
        if (columns[i] == '利润-其中：推广费') {
            promotion_amount_row = i
            continue
        }
        if (columns[i] == '订单费用-快递费（自动匹配）') {
            express_fee_row = i
            continue
        }
        if (columns[i] == '利润-费用') {
            operation_amount_row = i
            continue
        }
        if (columns[i] == '商品数据-商品数量') {
            real_sale_qty_row = i
            continue
        }
        if (columns[i] == '退款合计-退款数量合计') {
            refund_qty_row = i
            continue
        }
    }
    let amount = 0, saveAmount = 0
    for (let i = 1; i < rows.length; i++) {
        amount += rows[i].getCell(sale_amount_row).value
        if (!rows[i].getCell(1).value) continue
        let shop_name = typeof(rows[i].getCell(shop_name_row).value) == 'string' ? 
            rows[i].getCell(shop_name_row).value.trim() : 
            rows[i].getCell(shop_name_row).value
        if (shop_name == '京东自营旗舰店') continue
        data.push(
            goods_id_row ? (typeof(rows[i].getCell(goods_id_row).value) == 'string' ? 
                rows[i].getCell(goods_id_row).value.trim() : 
                rows[i].getCell(goods_id_row).value) : null,
            sku_id_row ? (typeof(rows[i].getCell(sku_id_row).value) == 'string' ? 
                rows[i].getCell(sku_id_row).value.trim() : 
                rows[i].getCell(sku_id_row).value) : null,
            goods_code_row ? (typeof(rows[i].getCell(goods_code_row).value) == 'string' ? 
                rows[i].getCell(goods_code_row).value.trim() : 
                rows[i].getCell(goods_code_row).value) : null,
            sku_code_row ? (typeof(rows[i].getCell(sku_code_row).value) == 'string' ? 
                rows[i].getCell(sku_code_row).value.trim() : 
                rows[i].getCell(sku_code_row).value) : null,
            shop_name,
            rows[i].getCell(shop_id_row).value,
            typeof(rows[i].getCell(goods_name_row).value) == 'string' ? 
                rows[i].getCell(goods_name_row).value.trim() : 
                rows[i].getCell(goods_name_row).value,
            date,
            rows[i].getCell(sale_amount_row).value,
            rows[i].getCell(cost_amount_row).value,
            rows[i].getCell(gross_profit_row).value,
            typeof(rows[i].getCell(gross_profit_rate_row).value) == 'string' ? 
                rows[i].getCell(gross_profit_rate_row).value.replace(/%/g, '') : 
                rows[i].getCell(gross_profit_rate_row).value,
            rows[i].getCell(profit_row).value,
            typeof(rows[i].getCell(profit_rate_row).value) == 'string' ? 
                rows[i].getCell(profit_rate_row).value.replace(/%/g, '') : 
                rows[i].getCell(profit_rate_row).value,
            rows[i].getCell(promotion_amount_row).value,
            rows[i].getCell(express_fee_row).value,
            rows[i].getCell(operation_amount_row).value,
            rows[i].getCell(real_sale_qty_row).value,
            rows[i].getCell(refund_qty_row).value,
        )
        count += 1
        saveAmount += rows[i].getCell(sale_amount_row).value
    }
    logger.info(`[发货数据导入]：时间:${time}, 总计金额:${amount}, 存储金额:${saveAmount}`)
    if (count > 0) {
        if (goods_id_row) await goodsSaleInfoRepo.deleteByDate(time, 'goods_code')
        else await goodsSaleInfoRepo.deleteByDate(time, 'goods_id')
        result = await goodsSaleInfoRepo.batchInsert(count, data)
    }
    return result
}

const importGoodsKeyWords = async (rows, time) => {
    let count = 0, data = [], result = false
    let goods_id = typeof(rows[1].getCell(1).value) == 'string' ? 
        rows[1].getCell(1).value.trim() : 
        rows[1].getCell(1).value
    let info = await goodsOtherInfoRepo.search(goods_id, time)
    if (info?.length) {
        for (let i = 1; i < rows.length; i++) {
            if (!rows[i].getCell(1).value) continue
            goods_id = typeof(rows[i].getCell(1).value) == 'string' ? 
                rows[i].getCell(1).value.trim() : 
                rows[i].getCell(1).value
            let j = 0, words = '', total = 0, base = 0
            while(rows[i].getCell(j * 4 + 2).value) {
                words = `${words}${rows[i].getCell(j * 4 + 2).value},`
                let info = rows[i].getCell(j * 4 + 3).value
                if (typeof(info) == 'string' && info.indexOf('万') != -1) {
                    info = info.replace('万', '')
                    info = parseInt(info) * 10000
                } else info = parseInt(info)
                let prt = typeof(rows[i].getCell(j * 4 + 4).value) == 'number' ?
                    rows[i].getCell(j * 4 + 4).value : 0
                prt = prt + 1
                total += parseInt(info * prt)
                base += parseInt(rows[i].getCell(j * 4 + 5).value)
                j++
            }
            await goodsOtherInfoRepo.updateKeyWords([total, base, words, goods_id, time])
        }
        result = true
    } else {
        for (let i = 1; i < rows.length; i++) {
            if (!rows[i].getCell(1).value) continue
            goods_id = typeof(rows[i].getCell(1).value) == 'string' ? 
                rows[i].getCell(1).value.trim() : 
                rows[i].getCell(1).value
            let j = 0, words = '', total = 0, base = 0
            while(rows[i].getCell(j * 4 + 2).value) {
                words = `${words}${rows[i].getCell(j * 4 + 2).value},`
                let info = rows[i].getCell(j * 4 + 3).value
                if (typeof(info) == 'string' && info.indexOf('万') != -1) {
                    info = info.replace('万', '')
                    info = parseInt(info) * 10000
                } else info = parseInt(info)
                let prt = typeof(rows[i].getCell(j * 4 + 4).value) == 'number' ?
                    rows[i].getCell(j * 4 + 4).value : 0
                prt = prt + 1
                total += parseInt(info * prt)
                base += parseInt(rows[i].getCell(j * 4 + 5).value)
                j++
            }
            data.push(
                goods_id,
                null,
                total,
                base,
                words,
                time
            )
            count += 1
        }
        if (count > 0) {
            result = await goodsOtherInfoRepo.batchInsert(count, data)
        }
    }
    return result
}

const importGoodsDSR = async (rows, time) => {
    let count = 0, data = [], result = false
    let goods_id = typeof(rows[1].getCell(2).value) == 'string' ? 
        rows[1].getCell(2).value.trim() : 
        rows[1].getCell(2).value
    let info = await goodsOtherInfoRepo.search(goods_id, time)
    if (info?.length) {
        for (let i = 1; i < rows.length; i++) {
            if (!rows[i].getCell(1).value) continue
            goods_id = typeof(rows[i].getCell(2).value) == 'string' ? 
                rows[i].getCell(2).value.trim() : 
                rows[i].getCell(2).value
            let dsr = rows[i].getCell(6).value
            if (typeof(dsr) == 'string' && dsr.indexOf('分') != -1) {
                dsr = dsr.replace('分', '')
            } else if (typeof(dsr) == 'string' && dsr.indexOf('未诊断') != -1) {
                dsr = 0
            }
            dsr = parseInt(dsr)
            await goodsOtherInfoRepo.updateDSR([dsr, goods_id, time])
        }
        result = true
    } else {
        for (let i = 1; i < rows.length; i++) {
            if (!rows[i].getCell(1).value) continue
            goods_id = typeof(rows[i].getCell(2).value) == 'string' ? 
                rows[i].getCell(2).value.trim() : 
                rows[i].getCell(2).value
            let dsr = rows[i].getCell(6).value
            if (typeof(dsr) == 'string' && dsr.indexOf('分') != -1) {
                dsr = parseInt(dsr.replace('分', ''))
            } else if (typeof(dsr) == 'string' && dsr.indexOf('未诊断') != -1) {
                dsr = 0
            }
            data.push(
                goods_id,
                dsr,
                null,
                null,
                null,
                time
            )
            count += 1
        }
        if (count > 0) {
            result = await goodsOtherInfoRepo.batchInsert(count, data)
        }
    }
    return result
}

const getGoodsLineInfo = async (startDate, endDate, params, id) => {
    let result = {
        column: [
            {title: '链接ID', field_id: 'goods_id'},
            {title: '项目', field_id: 'project_name'},
            {title: '一级类目', field_id: 'first_category'},
            {title: '二级类目', field_id: 'second_category'},
            {title: '三级类目', field_id: 'level_3_category'},
            {title: '产品线简称', field_id: 'brief_product_line'},
            {title: '发货金额', field_id: 'sale_amount', show: true},
            {title: '推广费', field_id: 'promotion_amount', show: true},
            {title: '费比(%)', field_id: 'operation_rate', show: true},
            {title: 'ROI', field_id: 'roi', show: true},
            {title: '市占率(%)', field_id: 'market_rate', show: true},
            {title: '退货率(%)', field_id: 'refund_rate', show: true},
            {title: 'DSR评分', field_id: 'dsr', show: true},
            {title: '运费', field_id: 'express_fee', show: true},
            {title: '利润', field_id: 'profit', show: true},
            {title: '利润率(%)', field_id: 'profit_rate', show: true},
            {title: '主销编码', field_id: 'sku_id'},
            {title: '产品定义', field_id: 'product_definition'},
            {title: '库存结构', field_id: 'stock_structure'},
            {title: '产品等级', field_id: 'product_rank'},
            {title: '产品设计属性', field_id: 'product_design_attr'},
            {title: '季节', field_id: 'seasons'},
            {title: '品牌', field_id: 'brand'},
            {title: '销售目标', field_id: 'targets'},
            {title: '开发负责人', field_id: 'exploit_director'},
            {title: '采购负责人', field_id: 'purchase_director'},
            {title: '产品线管理人', field_id: 'line_manager'},
            {title: '运营负责人', field_id: 'operator'},
            {title: '产品线负责人', field_id: 'line_director'},
            {title: '上架时间', field_id: 'onsale_date'},
        ],
        data: {}
    }
    let userNames = null, shopNames = null, shopInfo = [], userInfo = []
    if (params.type) {
        const { shops, users } = await getQueryInfo(
            typeList[params.type].map[0],
            typeList[params.type].key,
            0,
            params.name
        )
        shopInfo = shops
        userInfo = users
    } else {
        const permissions = await userOperationRepo.getPermission(id)
        if (permissions.length == 0) return []
        for (let i = 0; i < permissions.length; i++) {
            if (i > 0 && permissions[i].type != permissions[i-1].type) break
            const { shops, users } = await getQueryInfo(
                permissions[0].type, 
                null, 
                permissions[i].detail_id, 
                null,
            )
            shopInfo.push(...shops)
            userInfo.push(...users)
        }
    }
    if (params.type == typeList.shop.value) {
        shopInfo.push({shop_name: params.name})
    }
    if (shopInfo?.length) shopNames = shopInfo.map((item) => item.shop_name).join('","')
    if (userInfo?.length) userNames = userInfo.map((item) => item.nickname).join('","')
        
    params.search = JSON.parse(params.search)
    result.data = await userOperationRepo.getGoodsLine(startDate, endDate, params, shopNames, userNames)
    return result
}

const getWorkStats = async (user, start, end, params) => {
    let result = []
    for (let i = 0; i < workItemList.length; i++) {
        let item = JSON.parse(JSON.stringify(statItem))
        item.actionName = workItemList[i].name
        for (let j = 0; j < workTypeList.length; j++) {
            let child = JSON.parse(JSON.stringify(statItem))
            child.actionName = workTypeList[j]
            item.children.push(child)
        }
        result.push(item)
    }
    params.type = 0
    const permissions = await userOperationRepo.getPermissionLimit(user.id)
    if (permissions.length == 0) return result
    if (permissions[0].type != typeList.division.key) {
        params.name = user.nickname
        params.type = 1
    }
    let info = await newFormsRepo.getOperationWork(start, end, params)
    for (let i = 0; i < info.length; i++) {
        result[workItemMap[info[i].operate_type]].children[info[i].type].sum += info[i].count
        result[workItemMap[info[i].operate_type]]
            .children[info[i].type]
            .actionCode = `${result[workItemMap[info[i].operate_type]]
                .children[info[i].type]
                .actionCode
            }${info[i].form_id},`
        let item = JSON.parse(JSON.stringify(statItem))
        item.actionName = info[i].title
        item.actionCode = info[i].form_id
        item.sum = info[i].count
        result[workItemMap[info[i].operate_type]]
            .children[info[i].type]
            .children.push(item)
    }
    return result
}

const importGoodsPromotionInfo = async (rows, time) => {
    let count = 0, data = [], result = false
    let columns = rows[0].values,
        goods_id_row = null, 
        sku_id_row = null, 
        shop_name_row = null,
        date = time
        promotion_row_array = [];
    for (let i = 1; i < columns.length; i++) {
        if (columns[i] == '店铺款式编码') {
            goods_id_row = i
            continue
        }
        if (columns[i] == '商品编码') {
            sku_id_row = i
            continue
        }
        if (columns[i] == '店铺名称') {
            shop_name_row = i
            continue
        }
        if (columns[i].indexOf('600') != -1) {
            promotion_row_array.push(i)
        }
    }
    for (let i = 1; i < rows.length; i++) {
        if (!rows[i].getCell(1).value) continue
        for (let j = 0; j < promotion_row_array.length; j++) {
            let amount = rows[i].getCell(promotion_row_array[j]).value
            if (!amount) continue
            data.push(
                goods_id_row ? (typeof(rows[i].getCell(goods_id_row).value) == 'string' ? 
                    rows[i].getCell(goods_id_row).value.trim() : 
                    rows[i].getCell(goods_id_row).value) : null,
                sku_id_row ? (typeof(rows[i].getCell(sku_id_row).value) == 'string' ? 
                    rows[i].getCell(sku_id_row).value.trim() : 
                    rows[i].getCell(sku_id_row).value) : null,
                typeof(rows[i].getCell(shop_name_row).value) == 'string' ? 
                    rows[i].getCell(shop_name_row).value.trim() : 
                    rows[i].getCell(shop_name_row).value,
                typeof(columns[promotion_row_array[j]]) == 'string' ? 
                    columns[promotion_row_array[j]].trim() : 
                    columns[promotion_row_array[j]],
                amount,
                date,
            )
            count += 1                        
        }
    }
    logger.info(`[推广数据导入]：时间:${time}, 总计数量:${count}`)
    if (count > 0) {
        await goodsPromotionRepo.deleteByDate(time)
        result = await goodsPromotionRepo.batchInsert(count, data)
    }
    return result
}

const importJDZYInfo = async (rows) => {
    let count = 0, data = [], result = false
    let columns = rows[0].values,
        shop_name = '京东自营旗舰店',
        shop_id = '16314655',
        sku_id_row = null,
        date = moment().subtract(1, 'day').format('YYYY-MM-DD'),
        real_sale_qty_row = null,
        supplier_amount_row = null,
        sale_amount_row = null,
        gross_profit_row = null
    for (let i = 1; i < columns.length; i++) {
        if (columns[i] == '商品编号') {
            sku_id_row = i
            continue
        }
        if (columns[i] == '财务销量') {
            real_sale_qty_row = i
            continue
        }
        if (columns[i] == '收入') {
            supplier_amount_row = i
            continue
        }
        if (columns[i] == '成本') {
            sale_amount_row = i
            continue
        }
        if (columns[i] == '毛利') {
            gross_profit_row = i
            continue
        }
    }
    let amount = 0, saveAmount = 0
    for (let i = 1; i < rows.length; i++) {
        amount += rows[i].getCell(sale_amount_row).value
        if (!rows[i].getCell(1).value) continue
        let sku_id = sku_id_row ? (typeof(rows[i].getCell(sku_id_row).value) == 'string' ? 
            rows[i].getCell(sku_id_row).value.trim() : 
            rows[i].getCell(sku_id_row).value) : null, goods_id = null, cost_price = 0
        if (sku_id) {
            let info = await userOperationRepo.getDetailBySkuId(sku_id)
            if (info?.length) {
                goods_id = info[0].brief_name
                cost_price = parseInt(info[0].cost_price)
            }
        }
        //供货金额
        let sale_amount = parseFloat(rows[i].getCell(sale_amount_row).value || 0)
        let qty = parseInt(rows[i].getCell(real_sale_qty_row).value || 0)
        let cost_amount = (cost_price + 0.8 + 1.4) * qty
        //京东销售额
        let supplier_amount = parseFloat(rows[i].getCell(supplier_amount_row).value || 0)
        let tax = sale_amount * 0.07
        //综毛标准
        let jd_gross_profit_std = supplier_amount * 0.28
        //实际棕毛
        let real_jd_gross_profit = parseFloat(rows[i].getCell(gross_profit_row).value || 0)
        //需补综毛
        let other_cost = real_jd_gross_profit >= jd_gross_profit_std ? 0 :
            jd_gross_profit_std - real_jd_gross_profit
        let profit = sale_amount - cost_amount - tax - other_cost
        data.push(
            goods_id,
            sku_id,
            null,
            null,
            shop_name,
            shop_id,
            null,
            date,
            sale_amount,
            cost_amount,
            sale_amount - cost_amount,
            sale_amount ? (sale_amount - cost_amount) / sale_amount : 0,
            profit,
            sale_amount ? profit / sale_amount : 0,
            0,
            null,
            tax + other_cost,
            qty,
            null,
        )
        count += 1
        saveAmount += rows[i].getCell(sale_amount_row).value
    }
    logger.info(`[京东自营发货数据导入]：时间:${date}, 总计金额:${amount}, 存储金额:${saveAmount}`)
    if (count > 0) {
        await goodsSaleInfoRepo.deleteByDate(date, 'goods_code', 1)
        result = await goodsSaleInfoRepo.batchInsert(count, data)
    }
    return result
}

const importJDZYPromotionInfo = async (rows, name) => {
    let count = 0, data = [], result = false
    let columns = rows[0].values,
        sku_id_row = null, 
        amount_row = null, 
        shop_name = '京东自营旗舰店',
        date = moment().subtract(1, 'day').format('YYYY-MM-DD'),
        way_row = null,
        promotion_name = '';
    if (name.indexOf('宝选_快车') != -1) {
        promotion_name = '京东快车1'
    } else if(name.indexOf('快车单日计划') != -1) {
        promotion_name = '京东快车2'
    } else if(name.indexOf('茶具_快车') != -1) {
        promotion_name = '京东快车3'
    } else if(name.indexOf('场景单日计划') != -1) {
        promotion_name = '日常推广'
    } else if(name.indexOf('海投单日计划') != -1) {
        promotion_name = '场景推广'
    }
    for (let i = 1; i < columns.length; i++) {
        if (columns[i] == 'SKUID' || columns[i] == '商品SKU') {
            sku_id_row = i
            continue
        }
        if (columns[i] == '花费') {
            amount_row = i
            continue
        }
        if (columns[i] == '定向方式') {
            way_row = i
            continue
        }
    }
    for (let i = 1; i < rows.length; i++) {
        if (!rows[i].getCell(1).value) continue
        if (way_row && rows[i].getCell(way_row).value.indexOf('汇总') == -1) continue
        let sku_id = sku_id_row ? (typeof(rows[i].getCell(sku_id_row).value) == 'string' ? 
            rows[i].getCell(sku_id_row).value.trim() : 
            rows[i].getCell(sku_id_row).value) : null, goods_id = null
        if (sku_id) {
            let info = await userOperationRepo.getDetailBySkuId(sku_id)
            if (info?.length) goods_id = info[0].brief_name
        }
        let amount = parseFloat(rows[i].getCell(amount_row).value || 0)
        if (amount == 0) continue
        data.push(
            goods_id,
            sku_id,
            shop_name,
            promotion_name,
            amount,
            date
        )
        await goodsSaleInfoRepo.updateFee(sku_id, amount, date)
        count += 1
    }
    logger.info(`[京东自营推广数据导入]：时间:${date}, 总计数量:${count}`)
    if (count > 0) {
        await goodsPromotionRepo.deleteByDate(date, promotion_name)
        result = await goodsPromotionRepo.batchInsert(count, data)
    }
    return result
}

module.exports = {
    getDataStats,
    getDataStatsDetail,
    getGoodsInfo,
    importGoodsInfo,
    importGoodsKeyWords,
    importGoodsDSR,
    getGoodsLineInfo,
    getGoodsInfoDetail,
    getWorkStats,
    importGoodsPromotionInfo,
    importJDZYInfo,
    importJDZYPromotionInfo
}