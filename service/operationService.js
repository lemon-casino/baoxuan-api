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
    workTypeList,
    columnList,
    optimizeFlowUUid,
    optimizeUser,
    platformMap,
    optimizeFieldMap
} = require('../const/operationConst')
const settlementRepo = require('../repository/settlementRepo')
const newFormsRepo = require('../repository/newFormsRepo')
const goodsOtherInfoRepo = require('../repository/operation/goodsOtherInfoRepo')
const goodsPayInfoRepo = require('../repository/operation/goodsPayInfoRepo')
const goodsPromotionRepo = require('../repository/operation/goodsPromotionRepo')
const goodsBillRepo = require('../repository/operation/goodsBillRepo')
const goodsCompositeRepo = require('../repository/operation/goodsCompositeRepo')
const goodsOrdersRepo = require('../repository/operation/goodsOrdersRepo')
const userSettingRepo = require('../repository/userSettingRepo')
const goodsGrossProfit = require('../repository/operation/goodsGrossProfit')
const redisRepo = require("../repository/redisRepo")
const { redisKeys } = require('../const/redisConst')
const redisUtil = require("../utils/redisUtil")
const crypto = require('crypto')
const goodsOptimizeSetting = require('../repository/operation/goodsOptimizeSetting')
const { createProcess } =  require('./dingDingService')
const fs = require('fs')
const goodsSaleVerifiedRepo = require('../repository/operation/goodsSaleVerifiedRepo')

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
    let result = {}
    let info = `${id}-${start}-${end}-${JSON.stringify(params)}`
    let key = crypto.createHash('md5').update(info).digest('hex')
    key = `${redisKeys.operation}:${params.stats}:${key}`
    result = await redisUtil.get(key)
    if (result) return JSON.parse(result)
    result = JSON.parse(JSON.stringify(operationDefaultItem))
    let func = params.stats == 'verified' ? goodsSaleVerifiedRepo : goodsSaleInfoRepo
    let sale_amount = 0, promotion_amount = 0, express_fee = 0, profit = 0, 
        oriType, type = '', except = false, operation_amount = 0, 
        words_market_vol = 0, words_vol = 0, order_num = 0, refund_num = 0,
        children = [], warning = 0
    let columnInfo = JSON.parse(JSON.stringify(columnList))
    if (params.stats == 'verified') columnInfo[1].label = '核销金额'
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
                result = await queryShopInfo(shops, result, typeValue, start, end, func)
            }
            if (users.length) {
                result = await queryUserInfo(users, result, typeValue, start, end, func)
            }
            result[typeValue].column = columnInfo
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
                result = await queryShopInfo(shops, result, typeValue, start, end, func)
            }
            if (users.length) {
                result = await queryUserInfo(users, result, typeValue, start, end, func)
            }
            result[typeValue].column = columnInfo
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
        order_num += parseFloat(result[type].data[i].order_num)
        refund_num += parseFloat(result[type].data[i].refund_num)
        express_fee += parseFloat(result[type].data[i].express_fee)
        profit += parseFloat(result[type].data[i].profit)
        if (type == typeList.project.value && result[type].data[i].name == projectNameList.coupang) continue
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
        if (result[type].data[i].warning) warning = 1
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
    result.total.data[0].order_num = order_num.toFixed(2)
    result.total.data[0].refund_num = refund_num.toFixed(2)
    result.total.data[0].roi = promotion_amount > 0 ? (sale_amount / promotion_amount).toFixed(2) : '0.00'
    result.total.data[0].market_rate = words_market_vol > 0 ? (words_vol / words_market_vol * 100).toFixed(2) : '0.00'
    result.total.data[0].refund_rate = order_num > 0 ? (refund_num / order_num * 100).toFixed(2) : '0.00'
    result.total.column = JSON.parse(JSON.stringify(result[type].column))
    result.total.column[0].is_link = false
    result.total.data[0].sale_amount = sale_amount.toFixed(2)
    result.total.data[0].promotion_amount = promotion_amount.toFixed(2)
    result.total.data[0].express_fee = express_fee.toFixed(2)
    result.total.data[0].profit = profit.toFixed(2)
    result.total.data[0].children = children.filter(item => item.id)
    result.total.data[0].warning = warning
    redisUtil.set(key, JSON.stringify(result), 3600)
    return result
}

const getDataStatsDetail = async (type, name, column, start, end, stats, user) => {
    let result = [], shops = [], users = []
    switch(type) {
        case 'total':
            const permissions = await userOperationRepo.getPermission(user.id)
            if (!(permissions?.length)) break
            switch(permissions[0].type) {
                case 1:
                    for (let i = 0; i < permissions.length; i++) {
                        if (permissions[i].type > 1) break
                        let tmp = await divisionInfoRepo.getShopNameById(permissions[i].detail_id)
                        if (tmp?.length) shops = shops.concat(tmp)
                    }
                    except = true
                    break
                case 2:
                    for (let i = 0; i < permissions.length; i++) {
                        if (permissions[i].type > 2) break
                        let tmp = await projectInfoRepo.getShopNameById(permissions[i].detail_id)
                        if (tmp?.length) shops = shops.concat(tmp)
                    }
                    except = true
                    break
                case 3:
                    for (let i = 0; i < permissions.length; i++) {
                        if (permissions[i].type > 3) break
                        let tmp = await shopInfoRepo.getShopNameById(permissions[i].detail_id)
                        if (tmp?.length) shops = shops.concat(tmp)
                    }
                    break
                case 4:
                    for (let i = 0; i < permissions.length; i++) {
                        if (permissions[i].type > 4) break
                        let tmp = await teamInfoRepo.getUserNameByTeamId(permissions[i].detail_id)
                        if (tmp?.length) users = users.concat(tmp)
                    }
                    break                
                case 5:
                    for (let i = 0; i < permissions.length; i++) {
                        let tmp = await userOperationRepo.getUserById(permissions[i].detail_id)
                        if (tmp?.length) users = users.concat(tmp)
                    }
                    break
                default:
            }
            break
        case 'division':
            shops = await divisionInfoRepo.getShopNameByName(name)
            except = true
            break
        case 'project':
            shops = await projectInfoRepo.getShopNameByName(name)
            except = true
            break
        case 'shop':
            shops = await shopInfoRepo.getShopNameByName(name)
            break
        case 'team':
            users = await teamInfoRepo.getUserNameByTeamName(name)
            break
        case 'user':
            users = [{nickname: name, name}]
            break
        default:
    }
    let func = stats == 'verified' ? goodsSaleVerifiedRepo : goodsSaleInfoRepo
    if (shops?.length) {
        let shopNames = ''
        for (let i = 0; i < shops.length; i++) {
            shopNames = `${shopNames}${shops[i].shop_name}","`
        }
        shopNames = shopNames.substring(0, shopNames.length - 3)
        if (['sale_amount', 'promotion_amount', 'express_fee', 'profit', 'operation_amount', 'order_num', 'refund_num'].includes(column))
            result = await func.getDetailByShopNamesAndTme(shopNames, column, start, end)
        else if (column == 'operation_rate')
            result = await func.getRateByShopNamesAndTme(shopNames, 'sale_amount', 'promotion_amount', column, start, end, 100)
        else if (column == 'roi')
            result = await func.getRateByShopNamesAndTme(shopNames, 'promotion_amount', 'sale_amount', column, start, end, 1)
        else if (column == 'refund_rate')
            result = await func.getRateByShopNamesAndTme(shopNames, 'order_num', 'refund_num', column, start, end, 100)
        else if (column == 'profit_rate')
            result = await func.getRateByShopNamesAndTme(shopNames, 'sale_amount', 'profit', column, start, end, 100)
        else if (['words_vol', 'words_market_vol'].includes(column))
            result = await goodsOtherInfoRepo.getDetailByShopNamesAndTme(shopNames, column, start, end)
        else if (column == 'market_rate')
            result = await goodsOtherInfoRepo.getRateByShopNamesAndTme(shopNames, 'words_market_vol', 'words_vol', column, start, end, 100)
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
        if (['sale_amount', 'promotion_amount', 'express_fee', 'profit', 'operation_amount', 'order_num', 'refund_num'].includes(column))
            result = await func.getDetailByLinkIdsAndTme(linkIds, column, start, end)
        else if (column == 'operation_rate')
            result = await func.getRateByLinkIdsAndTme(linkIds, 'sale_amount', 'promotion_amount', column, start, end, 100)
        else if (column == 'roi')
            result = await func.getRateByLinkIdsAndTme(linkIds, 'promotion_amount', 'sale_amount', column, start, end, 1)
        else if (column == 'refund_rate')
            result = await func.getRateByLinkIdsAndTme(linkIds, 'order_num', 'refund_num', column, start, end, 100)
        else if (column == 'profit_rate')
            result = await func.getRateByLinkIdsAndTme(linkIds, 'sale_amount', 'profit', column, start, end, 100)
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

const queryShopInfo = async (shops, result, type, start, end, func) => {
    let sale_amount = 0, info, promotion_amount = 0, 
        express_fee = 0, profit = 0, profit_rate = 0, operation_rate = 0, 
        roi = 0, market_rate = 0, refund_rate = 0, operation_amount = 0,
        order_num = 0, refund_num = 0, words_market_vol = 0, words_vol = 0
    let shopName = [], j = -1, except = false
    if (typeList[type].key < 3) except = true
    for (let i = 0; i < shops.length; i++) {
        if (i == 0 || shops[i].name != shops[i-1].name) {
            shopName.push({
                shop_name: shops[i].shop_name,
                name: shops[i].name, 
                has_promotion: shops[i].has_promotion
            })
            j = j+1
        } else {
            shopName[j].shop_name = `${shopName[j].shop_name}","${shops[i].shop_name}`
            if (shops[i].has_promotion) shopName[j].has_promotion = 1
        }
    }
    for (let i = 0; i < shopName.length; i++) {
        info = await func.getPaymentByShopNamesAndTime(shopName[i].shop_name, start, end)
        let children = await func.getChildPaymentByShopNamesAndTime(shopName[i].shop_name, start, end)
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
            order_num = parseFloat(info[0].order_num || 0).toFixed(2)
            refund_num = parseFloat(info[0].refund_num || 0).toFixed(2)
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
        let warning = 0
        if (shopName[i].has_promotion) warning = await func.getNullPromotionByTime(shopName[i].shop_name, start, end)
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
            operation_amount,
            order_num,
            refund_num,
            words_market_vol,
            words_vol,
            children,
            warning
        })           
    }
    return result
}

const queryUserInfo = async (users, result, type, start, end, func) => {
    let sale_amount = 0, info, links, promotion_amount = 0, 
        express_fee = 0, profit = 0, profit_rate = 0, operation_rate = 0, 
        roi = 0, market_rate = 0, refund_rate = 0, operation_amount = 0,
        order_num = 0, refund_num = 0, words_market_vol = 0, words_vol = 0
    let userName = [], j = -1, except = false
    if (typeList[type].key < 3) except = true
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
        info = await func.getPaymentByLinkIdsAndTime(linkIds, start, end)
        let children = await func.getChildPaymentByLinkIdsAndTime(linkIds, start, end)
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
            order_num = parseFloat(info[0].order_num || 0).toFixed(2)
            refund_num = parseFloat(info[0].refund_num || 0).toFixed(2)
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
            operation_amount,
            order_num,
            refund_num,
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
            {title: '链接ID', field_id: 'goods_id', type: 'input', show: true},
            {title: '订价毛利', field_id: '', show: true, sub: [
                {
                    title: '定价毛利', field_id: 'gross_profit', show: true, 
                    hasChild: true, type: 'number', min: 0, max: 100
                },
                {title: '主销编码', field_id: 'sku_id', type: 'input', show: true},
                {title: '次销编码', field_id: 'sku_sid', type: 'input', show: true}
            ]},
            {title: '店铺名称', field_id: 'shop_name', type: 'input', show: true},
            {title: '店铺编码', field_id: 'shop_id', type: 'input', show: true},
            {title: '商品名称', field_id: 'goods_name', type: 'input', show: true},
            {title: '商品简称', field_id: 'brief_name', type: 'input', show: true},
            {title: '运营负责人', field_id: 'operator', type: 'input', show: true},
            {title: '产品线简称', field_id: 'brief_product_line', type: 'input', show: true},
            {title: '产品线负责人', field_id: 'line_director', type: 'input', show: true},
            {title: '采购负责人', field_id: 'purchase_director', type: 'input', show: true},
            {title: '上架日期', field_id: 'onsale_date', type: 'date', show: true},
            {title: '上架信息', field_id: 'onsale_info', type: 'select', select: [
                {key: '30', value: '新品30'},
                {key: '60', value: '新品60'},
                {key: '90', value: '新品90'},
                {key: 'old', value: '老品'}
            ], show: true},
            {title: '链接属性', field_id: 'link_attribute', type: 'input', show: true},
            {title: '链接属性2', field_id: 'important_attribute', type: 'input', show: true},
            {title: '一级类目', field_id: 'first_category', type: 'input', show: true},
            {title: '二级类目', field_id: 'second_category', type: 'input', show: true},
            {title: '坑产目标', field_id: 'pit_target', type: 'input', show: true},
            {
                title: params.stats == 'verified' ? '核销金额' : '发货金额', 
                field_id: 'sale_amount', type: 'number', min: 0, max: 100, show: true
            }, {
                title: '支付金额', field_id: 'pay_amount', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '刷单金额', field_id: 'brushing_amount', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '刷单笔数', field_id: 'brushing_qty', type: 'number', 
                min: 0, max: 10, show: true
            }, {
                title: '实际支付金额', field_id: 'real_pay_amount', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '支付运费', field_id: 'pay_express_fee', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '费用', field_id: 'operation_amount', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '费比(%)', field_id: 'operation_rate', type: 'number', 
                min: 80, max: 100, show: true
            }, {
                title: '利润', field_id: 'profit', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '利润率(%)', field_id: 'profit_rate', type: 'number', 
                min: 0, max: 15, show: true
            }, {
                title: '扣点(账单费用)', field_id: 'bill', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '成本', field_id: 'cost_amount', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '推广费', field_id: 'promotion_amount', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '推广费环比(%)', field_id: 'promotion_amount_qoq', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: 'ROI', field_id: 'roi', type: 'number', 
                min: 1, max: 3, show: true
            }, {
                title: '市占率(%)', field_id: 'market_rate', type: 'number', 
                min: 0, max: 10, show: true
            }, {
                title: '退货率(%)', field_id: 'refund_rate', type: 'number', 
                min: 10, max: 30, show: true
            }, {
                title: 'DSR评分', field_id: 'dsr', type: 'number', 
                min: 0, max: 90, show: true
            }, {
                title: '运费', field_id: 'express_fee', type: 'number', 
                min: 0, max: 100, show: true
            }, 
            {title: '操作', field_id: 'operate', show: true}
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
    result.setting = []
    let setting = await userSettingRepo.getByType(id, 1)
    if (setting?.length) result.setting = JSON.parse(setting[0].attributes)
    let func = params.stats == 'verified' ? goodsSaleVerifiedRepo : goodsSaleInfoRepo
    result.data = await func.getData(startDate, endDate, params, shopNames, linkIds)
    return result
}

const getGoodsInfoDetail = async (column, goods_id, start, end, stats) => {
    let result = []
    let func = stats == 'verified' ? goodsSaleVerifiedRepo : goodsSaleInfoRepo
    if (['sale_amount', 'cost_amount', 'operation_amount', 'promotion_amount', 'express_fee', 'profit'].includes(column))
        result = await func.getDataDetailByTime(column, goods_id, start, end)
    else if (column == 'operation_rate')
        result = await func.getDataRateByTime('sale_amount', 'operation_amount', column, goods_id, start, end, 100)
    else if (column == 'roi')
        result = await func.getDataRateByTime('promotion_amount', 'sale_amount', column, goods_id, start, end, 1)
    else if (column == 'refund_rate')
        result = await func.getDataRateByTime('order_num', 'refund_num', column, goods_id, start, end, 100)
    else if (column == 'profit_rate')
        result = await func.getDataRateByTime('sale_amount', 'profit', column, goods_id, start, end, 100)
    else if (column == 'dsr')
        result = await goodsOtherInfoRepo.getDataDetailByTime(column, goods_id, start, end)
    else if (column == 'market_rate')
        result = await goodsOtherInfoRepo.getDataRateByTime('words_market_vol', 'words_vol', column, goods_id, start, end, 100)
    else if (column == 'gross_profit')
        result = await func.getDataGrossProfitByTime(goods_id, start, end)
    else if (['pay_amount', 'brushing_amount', 'brushing_qty', 'refund_amount', 'bill'].includes(column))
        result = await goodsPayInfoRepo.getDataDetailByTime(column, goods_id, start, end)
    else if (column == 'pay_express_fee')
        result = await goodsPayInfoRepo.getExpressFeeByTime(goods_id, start, end)
    else if (column == 'real_pay_amount')
        result = await goodsPayInfoRepo.getRealPayAmountByTime(goods_id, start, end)
    else if (column == 'composite_info')
        result = await goodsCompositeRepo.getDataDetailByTime(goods_id, start, end)
    else if (column == 'promotion_info')
        result = await goodsPromotionRepo.getDataDetailByTime(goods_id, start, end)
    else if (column == 'bill_info')
        result = await goodsBillRepo.getDataDetailByTime(goods_id, start, end)
    else if (column == 'promotion_amount_qoq')
        result = await func.getDataPromotionQOQByTime(goods_id, start, end)
    return result
}

const getGoodsInfoSubDetail = async (goods_id, start, end, stats) => {
    let func = stats == 'verified' ? goodsSaleVerifiedRepo : goodsSaleInfoRepo
    let result = await func.getDataGrossProfitDetailByTime(goods_id, start, end)
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
        real_sale_amount_row = null,
        cost_amount_row = null, 
        gross_profit_row = null, 
        gross_profit_rate_row = null, 
        profit_row = null, 
        profit_rate_row = null, 
        promotion_amount_row = null, 
        express_fee_row = null,
        operation_amount_row = null,
        real_sale_qty_row = null,
        refund_qty_row = null,
        packing_fee_row = null,
        bill_amount_row = null
    for (let i = 1; i <= columns.length; i++) {
        if (columns[i] == '店铺款式编码') {goods_id_row = i; continue}
        if (columns[i] == '款式编码(参考)') {sku_id_row = i; continue}
        if (columns[i] == '商品款号') {goods_code_row = i; continue}
        if (columns[i] == '商品编码') {sku_code_row = i; continue}
        if (columns[i] == '店铺名称') {shop_name_row = i; continue}
        if (columns[i] == '店铺编码') {shop_id_row = i; continue}
        if (columns[i] == '商品名称') {goods_name_row = i; continue}
        if (columns[i] == '利润-销售金额(扣退)') {sale_amount_row = i; continue}
        if (columns[i] == '利润-销售成本(扣退)') {cost_amount_row = i; continue}
        if (columns[i] == '利润-毛利') {gross_profit_row = i; continue}
        if (columns[i] == '利润-毛利率') {gross_profit_rate_row = i; continue}
        if (columns[i] == '利润-利润') {profit_row = i; continue}
        if (columns[i] == '利润-利润率') {profit_rate_row = i; continue}
        if (columns[i] == '利润-其中：推广费') {promotion_amount_row = i; continue}
        if (columns[i] == '订单费用-快递费（自动匹配）') {express_fee_row = i; continue}
        if (columns[i] == '利润-费用') {operation_amount_row = i; continue}
        if (columns[i] == '商品数据-商品数量') {real_sale_qty_row = i; continue}
        if (columns[i] == '退款合计-退款数量合计') {refund_qty_row = i; continue}
        if (columns[i] == '商品数据-实发金额') {real_sale_amount_row = i; continue}
        if (columns[i] == '订单费用-包材费（自动匹配）') {packing_fee_row = i; continue}
        if (columns[i] == '订单费用-账单费用（自动匹配）') {bill_amount_row = i; continue}
    }
    let amount = 0, saveAmount = 0
    for (let i = 1; i < rows.length; i++) {
        amount += rows[i].getCell(sale_amount_row).value
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
            rows[i].getCell(real_sale_amount_row).value,
            rows[i].getCell(packing_fee_row).value,
            rows[i].getCell(bill_amount_row).value,
            null,
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
    if (result) redisRepo.batchDelete(`${redisKeys.operation}:info:*`)
    return result
}

const importGoodsOrderStat = async (rows, time) => {
    let dataMap = {}, dataMap2 = {}, result = false
    let columns = rows[0].values,
        goods_id_row = null, 
        sku_code_row = null,
        shop_name_row = null, 
        refund_order_row = null, 
        date = time
    for (let i = 1; i <= columns.length; i++) {
        if (columns[i] == '店铺款式编码') {goods_id_row = i; continue}
        if (columns[i] == '商品编码') {sku_code_row = i; continue}
        if (columns[i] == '售后单号') {refund_order_row = i; continue}
        if (columns[i] == '店铺名称') {shop_name_row = i; continue}
    }
    for (let i = 1; i < rows.length; i++) {
        let shop_name = typeof(rows[i].getCell(shop_name_row).value) == 'string' ? 
            rows[i].getCell(shop_name_row).value.trim() : 
            rows[i].getCell(shop_name_row).value
        if (shop_name == '京东自营旗舰店') continue
        let goods_id = typeof(rows[i].getCell(goods_id_row).value) == 'string' ? 
            rows[i].getCell(goods_id_row).value.trim() : 
            rows[i].getCell(goods_id_row).value
        let sku_code = typeof(rows[i].getCell(sku_code_row).value) == 'string' ? 
            rows[i].getCell(sku_code_row).value.trim() : 
            rows[i].getCell(sku_code_row).value
        let refund_order = typeof(rows[i].getCell(refund_order_row).value) == 'string' ? 
            rows[i].getCell(refund_order_row).value.trim() : 
            rows[i].getCell(refund_order_row).value
        if (!goods_id || (typeof(goods_id) == 'string' && goods_id.length == 0)) {
            if (dataMap2[sku_code] == undefined) 
                dataMap2[sku_code] = {shop_name, order_num: 0, refund_num: 0}
            if (!refund_order) dataMap2[sku_code].order_num += 1
            else dataMap2[sku_code].refund_num += 1
        } else if (dataMap[goods_id] == undefined) {
            dataMap[goods_id] = {}
            if (dataMap[goods_id][sku_code] == undefined) 
                dataMap[goods_id][sku_code] = {shop_name, order_num: 0, refund_num: 0}
            if (!refund_order) dataMap[goods_id][sku_code].order_num += 1
            else dataMap[goods_id][sku_code].refund_num += 1
        } else {
            if (dataMap[goods_id][sku_code] == undefined) 
                dataMap[goods_id][sku_code] = {shop_name, order_num: 0, refund_num: 0}
            if (!refund_order) dataMap[goods_id][sku_code].order_num += 1
            else dataMap[goods_id][sku_code].refund_num += 1
        }
    }
    logger.info(`[发货订单数据导入]：时间:${time}`)
    for(let id in dataMap) {
        for(let code in dataMap[id]) {
            result = await goodsSaleInfoRepo.updateOrder({
                date, goods_id: id, sku_code: code, ...dataMap[id][code]})
        }
    }
    for (let code in dataMap2) {
        result = await goodsSaleInfoRepo.updateOrder({
            date, goods_id: null, sku_code: code, ...dataMap2[code]})
    }
    if (result) redisRepo.batchDelete(`${redisKeys.operation}:info:*`)
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
    if (result) redisRepo.batchDelete(`${redisKeys.operation}:*`)
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
    if (result) redisRepo.batchDelete(`${redisKeys.operation}:*`)
    return result
}

const getGoodsLineInfo = async (startDate, endDate, params, id) => {
    let result = {
        column: [
            {title: '链接ID', field_id: 'goods_id', type: 'input', show: true},
            {title: '项目', field_id: 'project_name', type: 'input', show: true},
            {title: '一级类目', field_id: 'first_category', type: 'input', show: true},
            {title: '二级类目', field_id: 'second_category', type: 'input', show: true},
            {title: '三级类目', field_id: 'level_3_category', type: 'input', show: true},
            {title: '产品线简称', field_id: 'brief_product_line', type: 'input', show: true},
            {
                title: params.stats == 'verified' ? '核销金额' : '发货金额', 
                field_id: 'sale_amount', type: 'number', min: 0, max: 100, show: true
            }, {
                title: '推广费', field_id: 'promotion_amount', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '费比(%)', field_id: 'operation_rate', type: 'number', 
                min: 80, max: 100, show: true
            }, {
                title: 'ROI', field_id: 'roi', type: 'number', 
                min: 1, max: 3, show: true
            }, {
                title: '市占率(%)', field_id: 'market_rate', type: 'number', 
                min: 0, max: 10, show: true
            }, {
                title: '退货率(%)', field_id: 'refund_rate', type: 'number', 
                min: 10, max: 30, show: true
            }, {
                title: 'DSR评分', field_id: 'dsr', type: 'number', 
                min: 0, max: 90, show: true
            }, {
                title: '运费', field_id: 'express_fee', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '利润', field_id: 'profit', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '利润率(%)', field_id: 'profit_rate', type: 'number', 
                min: 0, max: 15, show: true
            },
            {title: '主销编码', field_id: 'sku_id', type: 'input', show: true},
            {title: '产品定义', field_id: 'product_definition', type: 'input', show: true},
            {title: '库存结构', field_id: 'stock_structure', type: 'input', show: true},
            {title: '产品等级', field_id: 'product_rank', type: 'input', show: true},
            {title: '产品设计属性', field_id: 'product_design_attr', type: 'input', show: true},
            {title: '季节', field_id: 'seasons', type: 'input', show: true},
            {title: '品牌', field_id: 'brand', type: 'input', show: true},
            {title: '销售目标', field_id: 'targets', type: 'input', show: true},
            {title: '开发负责人', field_id: 'exploit_director', type: 'input', show: true},
            {title: '采购负责人', field_id: 'purchase_director', type: 'input', show: true},
            {title: '产品线管理人', field_id: 'line_manager', type: 'input', show: true},
            {title: '运营负责人', field_id: 'operator', type: 'input', show: true},
            {title: '产品线负责人', field_id: 'line_director', type: 'input', show: true},
            {title: '上架时间', field_id: 'onsale_date', type: 'input', show: true},
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
    result.data = await userOperationRepo.getGoodsLine(startDate, endDate, params, shopNames, userNames, params.stats)
    return result
}

const getWorkStats = async (user, start, end, params) => {
    let result = [], childInfo = []
    params.user_type = 1
    let permissions = [], project_name = '', project_info
    params.userNames = []
    if (params.type) {
        switch (parseInt(params.type)) {
            case typeList.division.key:
                permissions = await divisionInfoRepo.getProjectByDivisionName(params.name)
                break
            case typeList.project.key:
                permissions = await projectInfoRepo.getTeamByProjectName(params.name)
                if (!permissions?.length)
                    permissions = await projectInfoRepo.getUserByProjectName(params.name)
                break
            case typeList.team.key:
                permissions = await teamInfoRepo.getUserByTeamName(params.name)
                break
            case typeList.user.key:
                permissions = await userOperationRepo.getUserByName(params.name)
                break
            default:
        }
    } else {
        permissions = await userOperationRepo.getPermissionLimit(user.id)
    }
    if (permissions.length == 0) return result
    for (let i = 0; i < permissions.length; i++) {
        if (i > 0 && permissions[i].type != permissions[i-1].type) break
        let userList = []
        switch (permissions[i].type) {
            case typeList.division.key:
                userList = await divisionInfoRepo.getUsersById(permissions[i].detail_id)
                break
            case typeList.project.key:
                userList = await projectInfoRepo.getUsersById(permissions[i].detail_id) 
                project_name = params.name
                break
            case typeList.team.key:
                userList = await teamInfoRepo.getUsersById(permissions[i].detail_id)
                project_info = await teamInfoRepo.getProjectById(permissions[i].detail_id)
                if (project_info?.length) project_name = project_info[0].project_name
                break
            case typeList.user.key:
                userList = await userOperationRepo.getUserById(permissions[i].detail_id)
                project_info = await userOperationRepo.getProjectById(permissions[i].detail_id)
                if (project_info?.length) project_name = project_info[0].project_name
                break
            default:
        }
        if (userList?.length) {
            let userNames = ''
            for (let j = 0; j < userList.length; j++) {
                userNames = `${userNames}"${userList[j].nickname}",`
            }
            userNames = userNames.substring(0, userNames.length - 1)
            params.userNames.push(userNames)
            let item = JSON.parse(JSON.stringify(statItem))
            item.actionCode = permissions[i].type
            item.actionName = permissions[i].name
            for (let j = 0; j < workTypeList.length; j++) {
                let child = JSON.parse(JSON.stringify(statItem))
                child.actionName = workTypeList[j]
                item.children.push(child)
            }
            childInfo.push(item)
        }
    }
    if (params.userNames.length == 0) return result
    for (let i = 0; i < workItemList.length; i++) {
        let tmp = JSON.parse(JSON.stringify(statItem))
        tmp.children = JSON.parse(JSON.stringify(childInfo))
        result.push(tmp)
    }
    let info = await newFormsRepo.getOperationWork(start, end, params)
    for (let i = 0; i < info.length; i++) {
        result[workItemMap[info[i].operate_type]]
            .children[info[i].user_type].sum += info[i].count
        result[workItemMap[info[i].operate_type]]
            .children[info[i].user_type]
            .children[info[i].type].sum += info[i].count
        result[workItemMap[info[i].operate_type]]
            .children[info[i].user_type]
            .children[info[i].type]
            .actionCode = `${result[workItemMap[info[i].operate_type]]
                .children[info[i].user_type]
                .children[info[i].type]
                .actionCode
            }${info[i].form_id},`
        let item = JSON.parse(JSON.stringify(statItem))
        item.actionName = info[i].title
        item.actionCode = info[i].form_id
        item.sum = info[i].count
        result[workItemMap[info[i].operate_type]]
            .children[info[i].user_type]
            .children[info[i].type]
            .children.push(item)
    }
    return result
}

const importGoodsPayInfo = async (rows, time) => {
    let count = 0, count1 = 0, count2 = 0, 
        data = [], data1 = [], data2 = [], result = false
    let columns = rows[0].values,
        goods_id_row = null, 
        sku_id_row = null, 
        sku_code_row = null, 
        shop_name_row = null,
        shop_id_row = null,
        date = time
        promotion_row_array = [],
        bill_row_array = [],
        pay_amount_row = null,
        brushing_amount_row = null,
        refund_amount_row = null,
        express_fee_row = null,
        bill_row = null
    for (let i = 1; i < columns.length; i++) {
        if (columns[i] == '店铺款式编码') {
            goods_id_row = i
            continue
        }
        if (columns[i] == '款式编码(参考)') {
            sku_id_row = i
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
        if (columns[i] == '商品数据-付款金额') {
            pay_amount_row = i
            continue
        }
        if (columns[i] == '商品销售数据(其中分类单)-分类单销售金额(扣退)') {
            brushing_amount_row = i
            continue
        }
        if (columns[i] == '退款合计-退款金额合计') {
            refund_amount_row = i
            continue
        }
        if (columns[i] == '订单费用-快递费（自动匹配）') {
            express_fee_row = i
            continue
        }
        if (columns[i] == '订单费用-账单费用（自动匹配）') {
            bill_row = i
            continue
        }
        if ((columns[i].indexOf('6003') == 0 && 
                columns[i].indexOf('6003012') == -1)) {
            promotion_row_array.push(i)
            continue
        }
        if (columns[i].indexOf('6001') == 0 || 
            columns[i].indexOf('6003012') == 0 || 
            columns[i].indexOf('6008') == 0) {
            bill_row_array.push(i)
            continue
        }
    }
    for (let i = 1; i < rows.length; i++) {
        if (!rows[i].getCell(1).value) continue
        let shop_name = typeof(rows[i].getCell(shop_name_row).value) == 'string' ? 
            rows[i].getCell(shop_name_row).value.trim() : 
            rows[i].getCell(shop_name_row).value
        if (shop_name == '京东自营旗舰店') continue
        let goods_id = goods_id_row ? (typeof(rows[i].getCell(goods_id_row).value) == 'string' ? 
                rows[i].getCell(goods_id_row).value.trim() : 
                rows[i].getCell(goods_id_row).value) : null
        let sku_id = sku_id_row ? (typeof(rows[i].getCell(sku_id_row).value) == 'string' ? 
            rows[i].getCell(sku_id_row).value.trim() : 
            rows[i].getCell(sku_id_row).value) : null
        let sku_code = sku_code_row ? (typeof(rows[i].getCell(sku_code_row).value) == 'string' ? 
            rows[i].getCell(sku_code_row).value.trim() : 
            rows[i].getCell(sku_code_row).value) : null
        let shop_id = typeof(rows[i].getCell(shop_id_row).value) == 'string' ? 
            rows[i].getCell(shop_id_row).value.trim() : 
            rows[i].getCell(shop_id_row).value
        let pay_amount = rows[i].getCell(pay_amount_row).value
        let brushing_amount = rows[i].getCell(brushing_amount_row).value
        let refund_amount = rows[i].getCell(refund_amount_row).value
        let express_fee = rows[i].getCell(express_fee_row).value
        let bill = rows[i].getCell(bill_row).value
        for (let j = 0; j < promotion_row_array.length; j++) {
            let amount = rows[i].getCell(promotion_row_array[j]).value
            if (!amount) continue
            let promotion_name = typeof(columns[promotion_row_array[j]]) == 'string' ? 
                columns[promotion_row_array[j]].trim() : 
                columns[promotion_row_array[j]]
            data1.push(
                goods_id,
                sku_id,
                shop_name,
                promotion_name,
                amount,
                date,
            )   
            count1 += 1                    
        }
        for (let j = 0; j < bill_row_array.length; j++) {
            let amount = rows[i].getCell(bill_row_array[j]).value
            if (!amount) continue
            let bill_name = typeof(columns[bill_row_array[j]]) == 'string' ? 
                columns[bill_row_array[j]].trim() : 
                columns[bill_row_array[j]]
            data2.push(
                goods_id,
                sku_id,
                shop_name,
                bill_name,
                amount,
                date,
            )
            count2 += 1                    
        }
        count += 1   
        data.push(
            goods_id,
            sku_id,
            sku_code,
            shop_name,
            shop_id,
            date,
            pay_amount,
            brushing_amount,
            refund_amount,
            express_fee,
            bill
        )
    }
    logger.info(`[支付数据导入]：时间:${date}, 总计数量:${count}, 推广数据:${count1}, 账单数据:${count2}`)
    if (count > 0) {
        await goodsPayInfoRepo.deleteByDate(date)
        result = await goodsPayInfoRepo.batchInsert(count, data)
        if (count1 > 0) {
            await goodsPromotionRepo.deleteByDate(date)
            await goodsPromotionRepo.batchInsert(count1, data1)
        }
        if (count2 > 0) {
            await goodsBillRepo.deleteByDate(date)
            await goodsBillRepo.batchInsert(count2, data2)
        }
    }
    return result
}

const importGoodsCompositeInfo = async (rows, time) => {
    let count = 0, data = [], result = false
    let columns = rows[1].values,
        header = rows[0].values,
        goods_id_row = null, 
        shop_name_row = null, 
        date = time, 
        composite_row = {}
    for (let i = 1; i < header.length; i++) {
        if (header[i]?.indexOf('广告-') == 0 && composite_row[header[i]] == undefined) {
            composite_row[header[i]] = {}
        }
    }
    for (let i = 1; i < columns.length; i++) {
        if (columns[i] == '店铺款式编码') {goods_id_row = i; continue}
        if (columns[i] == '店铺') {shop_name_row = i; continue}
        if (columns[i] == '曝光量') {composite_row[header[i]][1] = i; continue}
        if (columns[i] == '点击量') {composite_row[header[i]][2] = i; continue}
        if (columns[i] == '点击率') {composite_row[header[i]][3] = i; continue}
        if (columns[i] == '投入产出比（ROI）') {composite_row[header[i]][4] = i; continue}
        if (columns[i] == '花费') {composite_row[header[i]][5] = i; continue}
        if (columns[i] == '交易额') {composite_row[header[i]][6] = i; continue}
        if (columns[i] == '直接交易额') {composite_row[header[i]][7] = i; continue}
        if (columns[i] == '间接交易额') {composite_row[header[i]][8] = i; continue}
        if (columns[i] == '成交笔数') {composite_row[header[i]][9] = i; continue}
        if (columns[i] == '直接成交笔数') {composite_row[header[i]][10] = i; continue}
        if (columns[i] == '间接成交笔数') {composite_row[header[i]][11] = i; continue}
        if (columns[i] == '每笔成交花费') {composite_row[header[i]][12] = i; continue}
        if (columns[i] == '每笔成交金额') {composite_row[header[i]][13] = i; continue}
        if (columns[i] == '每笔直接成交金额') {composite_row[header[i]][14] = i; continue}
        if (columns[i] == '每笔间接成交金额') {composite_row[header[i]][15] = i; continue}
        if (columns[i] == '推广费占比') {composite_row[header[i]][16] = i; continue}
        if (columns[i] == '点击转化率') {composite_row[header[i]][17] = i; continue}
    }
    for (let i = 2; i < rows.length; i++) {
        if (!rows[i].getCell(1).value) continue
        let shop_name = typeof(rows[i].getCell(shop_name_row).value) == 'string' ? 
            rows[i].getCell(shop_name_row).value.trim() : 
            rows[i].getCell(shop_name_row).value
        if (shop_name == '京东自营旗舰店') continue
        let goods_id = typeof(rows[i].getCell(goods_id_row).value) == 'string' ? 
            rows[i].getCell(goods_id_row).value.trim() : 
            rows[i].getCell(goods_id_row).value
        for (let name in composite_row) {
            let flag = 0
            let item = [goods_id, shop_name, date, name]
            for (let j = 1; j <= 17; j++) {
                if (composite_row[name][j] != undefined) {
                    let info = rows[i].getCell(composite_row[name][j]).value
                    if (info) {
                        info = typeof(info) == 'string' ? info.replace('%', '') : info
                        item.push(info)
                        flag = 1
                    } else item.push(null)
                } else item.push(null)
            }
            if (flag) {
                data.push(...item)
                count += 1
            }
        }
    }
    logger.info(`[综合数据导入]：时间:${date}, 总计数量:${count}`)
    if (count > 0) {
        await goodsCompositeRepo.deleteByDate(date, '聚水潭-商品综合')
        result = goodsCompositeRepo.batchInsertDefault(count, data)
    }
    return result
}

const importJDZYInfo = async (rows, time) => {
    let count = 0, data = [], data2 = [], result = false
    let columns = rows[0].values,
        shop_name = '京东自营旗舰店',
        shop_id = '16314655',
        sku_id_row = null,
        date = time,
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
                cost_price = parseFloat(info[0].cost_price)
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
        let real_gross_profit = parseFloat(rows[i].getCell(gross_profit_row).value || 0)
        real_jd_gross_profit = real_gross_profit < 0 ? 0 : real_gross_profit
        //需补综毛
        let other_cost =jd_gross_profit_std - real_jd_gross_profit
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
            supplier_amount,
            null,
            null,
            real_gross_profit
        )
        data2.push(
            goods_id,
            sku_id,
            shop_name,
            '扣点',
            tax,
            date
        )
        count += 1
        saveAmount += rows[i].getCell(sale_amount_row).value
    }
    logger.info(`[京东自营发货数据导入]：时间:${date}, 总计金额:${amount}, 存储金额:${saveAmount}`)
    if (count > 0) {
        await goodsSaleInfoRepo.deleteByDate(date, 'goods_code', 1)
        result = await goodsSaleInfoRepo.batchInsert(count, data)
        await goodsBillRepo.deleteByDate2(date)
        await goodsBillRepo.batchInsert(count, data2)
    }
    return result
}

const importJDZYPromotionInfo = async (rows, name, time) => {
    let count = 0, data = [], result = false
    let columns = rows[0].values,
        sku_id_row = null, 
        amount_row = null, 
        shop_name = '京东自营旗舰店',
        date = time,
        way_row = null,
        promotion_name = '';
    if (name.indexOf('宝选快车') != -1) {
        promotion_name = '京东快车1'
    } else if(name.indexOf('快车单日计划') != -1) {
        promotion_name = '京东快车2'
    } else if(name.indexOf('茶具快车') != -1) {
        promotion_name = '京东快车3'
    } else if(name.indexOf('场景单日计划') != -1) {
        promotion_name = '场景推广'
    } else if(name.indexOf('海投单日计划') != -1) {
        promotion_name = '日常推广'
    } else if(name.indexOf('全站推广') != -1) {
        promotion_name = '全站营销'
    }else if(name.indexOf('新品全站营销') != -1) {
        promotion_name = '新品全站营销'
    }
    for (let i = 1; i < columns.length; i++) {
        if (columns[i] == 'SKUID' || columns[i] == '商品SKU' || columns[i] =='ID') {
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

const importGoodsSYCMInfo = async (rows, time) => {
    let count = 0, data = [], result = false
    let columns = rows[1],
        goods_id_row = null,
        date = time,
        total_users_num_row = null,
        total_click_num_row = null,
        total_cart_num_row = null,
        total_trans_users_num_row = null,
        trans_amount_row = null,
        refund_amount_row = null,
        users_num_row = null,
        trans_users_num_row = null
    for (let i in columns) {
        if (columns[i] == '商品ID') {goods_id_row = i;  continue}
        if (columns[i] == '商品访客数') {total_users_num_row = i; continue}
        if (columns[i] == '商品浏览量') {total_click_num_row = i; continue}
        if (columns[i] == '商品加购件数') {total_cart_num_row = i; continue}
        if (columns[i] == '支付买家数') {total_trans_users_num_row = i; continue}
        if (columns[i] == '支付金额') {trans_amount_row = i; continue}
        if (columns[i] == '成功退款金额') {refund_amount_row = i; continue}
        if (columns[i] == '搜索引导访客数') {users_num_row = i; continue}
        if (columns[i] == '搜索引导支付买家数') {trans_users_num_row = i; continue}
    }
    for (let i = 2; i < rows.length; i++) {
        let goods_id = goods_id_row ? (typeof(rows[i][goods_id_row]) == 'string' ? 
            rows[i][goods_id_row].trim() : 
            rows[i][goods_id_row]) : null, shop_name = null
        if (goods_id) {
            let info = await userOperationRepo.getDetailByGoodsId(goods_id)
            if (info?.length) {
                shop_name = info[0].shop_name
            }
        }
        data.push(
            goods_id,
            shop_name,
            date,
            rows[i][total_users_num_row].replace(',', ''),
            rows[i][total_click_num_row].replace(',', ''),
            rows[i][total_cart_num_row].replace(',', ''),
            rows[i][total_trans_users_num_row].replace(',', ''),
            rows[i][trans_amount_row].replace(',', ''),
            rows[i][refund_amount_row].replace(',', ''),
            rows[i][users_num_row].replace(',', ''),
            rows[i][trans_users_num_row].replace(',', '')
        )
        count += 1
    }
    logger.info(`[生意参谋数据导入]：时间:${date}, 总计数量:${count}`)
    if (count > 0) {
        await goodsCompositeRepo.deleteByDate(date, '生意参谋')
        result = await goodsCompositeRepo.batchInsertSYCM(count, data)
    }
    return result
}

const importGoodsXHSInfo = async (rows, time) => {
    let count = 0, data = [], result = false
    let columns = rows[0].values,
        goods_id_row = null,
        shop_name_row = null,
        date = time,
        amount_row = null
    for (let i = 1; i < columns.length; i++) {
        if (columns[i] == '商品信息') {goods_id_row = i;  continue}
        if (columns[i] == '店铺名称') {shop_name_row = i; continue}
        if (columns[i] == '打款金额') {amount_row = i; continue}
    }
    for (let i = 1; i < rows.length; i++) {
        if (!rows[i].getCell(1).value) continue
        let goods_id = goods_id_row ? (typeof(rows[i].getCell(goods_id_row).value) == 'string' ? 
            rows[i].getCell(goods_id_row).value.trim() : 
            rows[i].getCell(goods_id_row).value) : null
        let shop_name = shop_name_row ? (typeof(rows[i].getCell(shop_name_row).value) == 'string' ? 
            rows[i].getCell(shop_name_row).value.trim() : 
            rows[i].getCell(shop_name_row).value) : null
        data.push(
            goods_id,
            null,
            shop_name,
            '小红书返款',
            rows[i].getCell(amount_row).value,
            date
        )
        count += 1
    }
    logger.info(`[小红书刷单数据导入]：时间:${date}, 总计数量:${count}`)
    if (count > 0) {
        await goodsBillRepo.deleteByDate3(date)
        result = await goodsBillRepo.batchInsert(count, data)
    }
    return result
}

const importGoodsBrushingInfo = async (rows, time) => {
    let result = false, count = 0
    let columns = rows[0].values,
        goods_id_row = null,
        order_row = null,
        date = time,
        goods_id_info = {},
        order_id_info = {}
    for (let i = 1; i < columns.length; i++) {
        if (columns[i] == '店铺款式编码') {goods_id_row = i;  continue}
        if (columns[i] == '线上订单号') {order_row = i; continue}
    }
    await goodsPayInfoRepo.resetBrushingQty(date)
    for (let i = 1; i < rows.length; i++) {
        if (!rows[i].getCell(1).value) continue
        let goods_id = goods_id_row ? (typeof(rows[i].getCell(goods_id_row).value) == 'string' ? 
            rows[i].getCell(goods_id_row).value.trim() : 
            rows[i].getCell(goods_id_row).value) : null
        let order = order_row ? (typeof(rows[i].getCell(order_row).value) == 'string' ? 
            rows[i].getCell(order_row).value.trim() : 
            rows[i].getCell(order_row).value) : null
        if (!order_id_info[order]) {
            if (!goods_id_info[goods_id]) goods_id_info[goods_id] = 1
            else goods_id_info[goods_id] += 1
            order_id_info[order]
        }
    }
    for (let index in goods_id_info) {
        result = await goodsPayInfoRepo.updateBrushingQty(index, goods_id_info[index], date)
        if (!result) {
            result = await goodsPayInfoRepo.insertBrushingInfo([
                index,
                date,
                goods_id_info[index]
            ])
        }
        count += 1
    }
    logger.info(`[刷单数据导入]：时间:${date}, 总计数量:${count}`)
    return result
}

const importGoodsPDDInfo = async (rows, time) => {
    let result = false, count = 0, data = []
    let columns = rows[0].values,
        goods_id_row = null,
        shop_name_row = null,
        date = time,
        user_num_row = null,
        click_num_row = null,
        trans_qty_row = null,
        trans_users_num_row = null,
        trans_num_row = null,
        trans_amount_row = null,
        pay_rate_row = null
    for (let i = 1; i < columns.length; i++) {
        if (columns[i] == '商品ID') {goods_id_row = i;  continue}
        if (columns[i] == '店铺') {shop_name_row = i; continue}
        if (columns[i] == '商品访客数') {user_num_row = i; continue}
        if (columns[i] == '商品浏览量') {click_num_row = i; continue}
        if (columns[i] == '支付件数') {trans_qty_row = i; continue}
        if (columns[i] == '支付买家数') {trans_users_num_row = i; continue}
        if (columns[i] == '支付订单数') {trans_num_row = i; continue}
        if (columns[i] == '成交额(元)') {trans_amount_row = i; continue}
        if (columns[i] == '支付转化率') {pay_rate_row = i; continue}
    }
    for (let i = 1; i < rows.length; i++) {
        if (!rows[i].getCell(1).value) continue
        data.push(
            typeof(rows[i].getCell(goods_id_row).value) == 'string' ? 
                rows[i].getCell(goods_id_row).value.trim() : 
                rows[i].getCell(goods_id_row).value,
            typeof(rows[i].getCell(shop_name_row).value) == 'string' ? 
                rows[i].getCell(shop_name_row).value.trim() : 
                rows[i].getCell(shop_name_row).value,
            date,
            rows[i].getCell(user_num_row).value,
            rows[i].getCell(user_num_row).value,
            rows[i].getCell(click_num_row).value,
            rows[i].getCell(trans_qty_row).value,
            rows[i].getCell(trans_users_num_row).value,
            rows[i].getCell(trans_users_num_row).value,
            rows[i].getCell(trans_num_row).value,
            rows[i].getCell(trans_amount_row).value,
            (rows[i].getCell(pay_rate_row).value ? rows[i].getCell(pay_rate_row).value * 100 : 0)
        )
        count += 1
    }
    result = await goodsCompositeRepo.batchInsertPDD(count, data)
    logger.info(`[拼多多商品明细导入]：时间:${date}, 总计数量:${count}`)
    return result
}

const importGoodsOrderInfo = async (rows, time) => {
    let result = false, count = 0, data = [], tmp = {}, real_data = []
    let columns = rows[0].values,
        goods_id_row = null,
        sku_id_row = null,
        shop_name_row = null,
        sku_code_row = null,
        cost_amount_row = null,
        qty_row = null,
        sale_amount_row = null,
        express_fee_row = null,
        wms_row = null,
        date = time
    for (let i = 1; i < columns.length; i++) {
        if (columns[i] == '实发数量') {qty_row = i; continue}
        if (columns[i] == '店铺名称') {shop_name_row = i; continue}
        if (columns[i] == '商品编码') {sku_code_row = i; continue}
        if (columns[i] == '店铺款式编码') {goods_id_row = i; continue}
        if (columns[i] == '店铺商品编码') {sku_id_row = i; continue}
        if (columns[i] == '商家运费') {express_fee_row = i; continue}
        if (columns[i] == '实发金额') {sale_amount_row = i; continue}
        if (columns[i] == '成交成本') {cost_amount_row = i; continue}
        if (columns[i] == '发货仓库') {wms_row = i; continue}
    }
    for (let i = 1; i < rows.length; i++) {
        if (!rows[i].getCell(1).value) continue
        let goods_id = typeof(rows[i].getCell(goods_id_row).value) == 'string' ?
            rows[i].getCell(goods_id_row).value.trim() :
            rows[i].getCell(goods_id_row).value
        if (!goods_id) continue
        let sku_id = typeof(rows[i].getCell(sku_id_row).value) == 'string' ?
            rows[i].getCell(sku_id_row).value.trim() :
            rows[i].getCell(sku_id_row).value
        if (!sku_id) continue     
        let shop_name = typeof(rows[i].getCell(shop_name_row).value) == 'string' ?
            rows[i].getCell(shop_name_row).value.trim() :
            rows[i].getCell(shop_name_row).value
        let sku_code = typeof(rows[i].getCell(sku_code_row).value) == 'string' ?
            rows[i].getCell(sku_code_row).value.trim() :
            rows[i].getCell(sku_code_row).value
        let cost_amount = rows[i].getCell(cost_amount_row).value
        let qty = rows[i].getCell(qty_row).value
        let sale_amount = rows[i].getCell(sale_amount_row).value
        let wms = typeof(rows[i].getCell(wms_row).value) == 'string' ? 
            rows[i].getCell(wms_row).value.trim() :
            rows[i].getCell(wms_row).value
        let express_fee = (wms == '北京超速树懒科技有限公司') ?  
            (rows[i].getCell(express_fee_row).value || 2.9) + 1 : 0
        if (!sale_amount) continue
        if (qty != 1) continue
        if (!tmp[goods_id]) tmp[goods_id] = {}
        if (!tmp[goods_id][sku_code]) {
            tmp[goods_id][sku_code] = data.length
            data.push({
                sku_id, 
                shop_name,
                cost_amount,
                qty,
                sale_amount,
                express_fee
            })
        } else {
            data[tmp[goods_id][sku_code]].cost_amount += cost_amount
            data[tmp[goods_id][sku_code]].qty += qty
            data[tmp[goods_id][sku_code]].sale_amount += sale_amount
            data[tmp[goods_id][sku_code]].express_fee += express_fee
        }
    }
    for (let id in tmp) {
        for (let code in tmp[id]) {
            real_data.push(
                id,
                data[tmp[id][code]].sku_id,
                data[tmp[id][code]].shop_name,
                code,
                data[tmp[id][code]].sale_amount,
                data[tmp[id][code]].cost_amount,
                data[tmp[id][code]].express_fee,
                data[tmp[id][code]].qty,
                date
            )
            count += 1
        }
    }
    if (count > 0) {
        // let delete_time = moment(date).subtract(7, 'day').format('YYYY-MM-DD')
        await goodsOrdersRepo.deleteByDate(date)
        result = await goodsOrdersRepo.batchInsert(count, real_data)
        insertGrossProfit(date)
        logger.info(`[商品订单数据导入]：总计数量:${count}`)
    }
    return result
}

const insertGrossProfit = async (date) => {
    await goodsGrossProfit.deleteByDate(date)
    let info = await goodsOrdersRepo.getByTime(date), data = []
    for (let i = 0; i < info.length; i++) {
        data.push(
            info[i].goods_id,
            info[i].sku_code,
            info[i].sale_amount,
            info[i].sale_qty,
            info[i].cost_amount,
            info[i].express_fee,
            info[i].settle_amount,
            info[i].bill_amount,
            info[i].order_time
        )
    }
    if (info?.length) await goodsGrossProfit.batchInsert(info.length, data)
}

const setPannelSetting = async (user_id, type, attribute) => {
    let setting = await userSettingRepo.getByType(user_id, type), result = false
    if (setting?.length) {
        result = await userSettingRepo.updateByUserIdAndType(user_id, type, attribute)
    } else result = await userSettingRepo.insert(user_id, type, attribute)
    return result
}

const getNewOnSaleInfo = async (sale_date, start, end, limit, offset) => {
    const result = await goodsSaleInfoRepo.getNewOnSaleInfo(sale_date, start, end, limit, offset)
    return result
}

const getOptimizeInfo = async (start, end, limit, offset) => {
    let result = await newFormsRepo.getOperationOptimizeInfo(start, end, limit, offset)
    for (let i = 0; i < result.data.length; i++) {
        result.data[i].goods_id = result.data[i].goods_id.replace(/\"/g, '')
        let optimize_info = result.data[i].optimize_info.replace(/[\[\]]/g, '')
        result.data[i].optimize_info = result.data[i].optimize_info.replace(/[\[\]\"]/g, '')
        let optimize = await goodsOptimizeSetting.getByTitle(optimize_info)
        result.data[i].success_rate = 0
        let total = result.data[i].children.length, failed = 0
        if (optimize?.length)
            for (let j = 0; j < result.data[i].children.length; j++) {
                if (j == 0 || 
                    result.data[i].children[j].time != result.data[i].children[j-1].time) {
                    let info = await goodsSaleInfoRepo.getOptimizeResult(
                        result.data[i].goods_id,
                        result.data[i].children[j].time,
                        optimize
                    )
                    if (info?.length) {
                        failed += info[0].count
                    }
                }
            }
        if (total > 0) result.data[i].success_rate = ((total - failed) / total * 100).toFixed(2)
    }
    return result
}

const checkOperationOptimize = async () => {
    let optimize = await goodsOptimizeSetting.getInfo()
    let goods_info = await userOperationRepo.getLinkIds()
    for (let i = 0; i < goods_info.length; i++) {
        for (let j = 0; j < optimize.length; j++) {
            let info = await goodsSaleInfoRepo.getOptimizeResult(
                goods_info[i].goods_id,
                null,
                [optimize[j]]
            )
            if (info?.length && info[0].count) {
                info = await newFormsRepo.checkOptimize(goods_info[i].goods_id, optimize[j].title, optimize[j].days)
                if (!info?.length) {
                    let params = {}
                    params[optimizeFieldMap.name] = goods_info[i].brief_name
                    params[optimizeFieldMap.operator] = [goods_info[i].dingding_user_id]
                    params[optimizeFieldMap.goods_id] = goods_info[i].goods_id
                    params[optimizeFieldMap.platform] = platformMap[goods_info[i].platform]
                    params[optimizeFieldMap.type] = optimize[j].optimize_type
                    params[optimizeFieldMap.content] = [optimize[j].title]
                    // fs.writeFileSync('./public/info.json', JSON.stringify(params) + '\n', {flag: 'a'})
                    await createProcess(
                        optimizeFlowUUid,
                        optimizeUser,
                        null,
                        JSON.stringify(params)
                    )
                }
            }
        }
    }
    return true
}

const importGoodsVerified = async (rows, time) => {
    let count = 0, data = [], result = false
    let columns = rows[0].values,
        goods_id_row = null, 
        sku_code_row = null,
        shop_name_row = null, 
        date = time, 
        sale_amount_row = null, 
        real_sale_amount_row = null,
        cost_amount_row = null, 
        gross_profit_row = null, 
        profit_row = null, 
        promotion_amount_row = null, 
        express_fee_row = null,
        operation_amount_row = null,
        real_sale_qty_row = null,
        refund_qty_row = null,
        packing_fee_row = null,
        bill_amount_row = null
    for (let i = 1; i <= columns.length; i++) {
        if (columns[i] == '店铺款式编码') {goods_id_row = i; continue}
        if (columns[i] == '商品编码') {sku_code_row = i; continue}
        if (columns[i] == '店铺名称') {shop_name_row = i; continue}
        if (columns[i] == '利润-销售金额(扣退)') {sale_amount_row = i; continue}
        if (columns[i] == '利润-销售成本(扣退)') {cost_amount_row = i; continue}
        if (columns[i] == '利润-毛利') {gross_profit_row = i; continue}
        if (columns[i] == '利润-利润') {profit_row = i; continue}
        if (columns[i] == '利润-其中：推广费') {promotion_amount_row = i; continue}
        if (columns[i] == '订单费用-快递费（自动匹配）') {express_fee_row = i; continue}
        if (columns[i] == '利润-费用') {operation_amount_row = i; continue}
        if (columns[i] == '商品数据-商品数量') {real_sale_qty_row = i; continue}
        if (columns[i] == '退款合计-退款数量合计') {refund_qty_row = i; continue}
        if (columns[i] == '商品数据-实发金额') {real_sale_amount_row = i; continue}
        if (columns[i] == '订单费用-包材费（自动匹配）') {packing_fee_row = i; continue}
        if (columns[i] == '订单费用-账单费用（自动匹配）') {bill_amount_row = i; continue}
    }
    let amount = 0, saveAmount = 0
    for (let i = 1; i < rows.length; i++) {
        amount += rows[i].getCell(sale_amount_row).value
        let shop_name = typeof(rows[i].getCell(shop_name_row).value) == 'string' ? 
            rows[i].getCell(shop_name_row).value.trim() : 
            rows[i].getCell(shop_name_row).value
        data.push(
            goods_id_row ? (typeof(rows[i].getCell(goods_id_row).value) == 'string' ? 
                rows[i].getCell(goods_id_row).value.trim() : 
                rows[i].getCell(goods_id_row).value) : null,
            sku_code_row ? (typeof(rows[i].getCell(sku_code_row).value) == 'string' ? 
                rows[i].getCell(sku_code_row).value.trim() : 
                rows[i].getCell(sku_code_row).value) : null,
            shop_name,
            date,
            rows[i].getCell(sale_amount_row).value,
            rows[i].getCell(cost_amount_row).value,
            rows[i].getCell(gross_profit_row).value,
            rows[i].getCell(profit_row).value,
            rows[i].getCell(promotion_amount_row).value,
            rows[i].getCell(express_fee_row).value,
            rows[i].getCell(operation_amount_row).value,
            rows[i].getCell(real_sale_qty_row).value,
            rows[i].getCell(refund_qty_row).value,
            rows[i].getCell(real_sale_amount_row).value,
            rows[i].getCell(packing_fee_row).value,
            rows[i].getCell(bill_amount_row).value
        )
        count += 1
        saveAmount += rows[i].getCell(sale_amount_row).value
    }
    logger.info(`[核销数据导入]：时间:${time}, 总计金额:${amount}, 存储金额:${saveAmount}`)
    if (count > 0) {
        await goodsSaleVerifiedRepo.deleteByDate(time)
        result = await goodsSaleVerifiedRepo.batchInsert(count, data)
    }
    if (result) redisRepo.batchDelete(`${redisKeys.operation}:verified:*`)
    return result
}

const importGoodsOrderVerifiedStat = async (rows, time) => {
    let dataMap = {}, dataMap2 = {}, result = false
    let columns = rows[0].values,
        goods_id_row = null, 
        sku_code_row = null,
        shop_name_row = null, 
        refund_order_row = null, 
        date = time
    for (let i = 1; i <= columns.length; i++) {
        if (columns[i] == '店铺款式编码') {goods_id_row = i; continue}
        if (columns[i] == '商品编码') {sku_code_row = i; continue}
        if (columns[i] == '售后单号') {refund_order_row = i; continue}
        if (columns[i] == '店铺名称') {shop_name_row = i; continue}
    }
    for (let i = 1; i < rows.length; i++) {
        let shop_name = typeof(rows[i].getCell(shop_name_row).value) == 'string' ? 
            rows[i].getCell(shop_name_row).value.trim() : 
            rows[i].getCell(shop_name_row).value
        let goods_id = typeof(rows[i].getCell(goods_id_row).value) == 'string' ? 
            rows[i].getCell(goods_id_row).value.trim() : 
            rows[i].getCell(goods_id_row).value
        let sku_code = typeof(rows[i].getCell(sku_code_row).value) == 'string' ? 
            rows[i].getCell(sku_code_row).value.trim() : 
            rows[i].getCell(sku_code_row).value
        let refund_order = typeof(rows[i].getCell(refund_order_row).value) == 'string' ? 
            rows[i].getCell(refund_order_row).value.trim() : 
            rows[i].getCell(refund_order_row).value
        if (!goods_id || (typeof(goods_id) == 'string' && goods_id.length == 0)) {
            if (dataMap2[sku_code] == undefined) 
                dataMap2[sku_code] = {shop_name, order_num: 0, refund_num: 0}
            if (!refund_order) dataMap2[sku_code].order_num += 1
            else dataMap2[sku_code].refund_num += 1
        } else if (dataMap[goods_id] == undefined) {
            dataMap[goods_id] = {}
            if (dataMap[goods_id][sku_code] == undefined) 
                dataMap[goods_id][sku_code] = {shop_name, order_num: 0, refund_num: 0}
            if (!refund_order) dataMap[goods_id][sku_code].order_num += 1
            else dataMap[goods_id][sku_code].refund_num += 1
        } else {
            if (dataMap[goods_id][sku_code] == undefined) 
                dataMap[goods_id][sku_code] = {shop_name, order_num: 0, refund_num: 0}
            if (!refund_order) dataMap[goods_id][sku_code].order_num += 1
            else dataMap[goods_id][sku_code].refund_num += 1
        }
    }
    logger.info(`[核销订单数据导入]：时间:${time}`)
    for(let id in dataMap) {
        for(let code in dataMap[id]) {
            result = await goodsSaleVerifiedRepo.updateOrder({
                date, goods_id: id, sku_code: code, ...dataMap[id][code]})
        }
    }
    for (let code in dataMap2) {
        result = await goodsSaleVerifiedRepo.updateOrder({
            date, goods_id: null, sku_code: code, ...dataMap2[code]})
    }
    if (result) redisRepo.batchDelete(`${redisKeys.operation}:verified:*`)
    return result
}

module.exports = {
    getDataStats,
    getDataStatsDetail,
    getGoodsInfo,
    importGoodsInfo,
    importGoodsOrderStat,
    importGoodsKeyWords,
    importGoodsDSR,
    getGoodsLineInfo,
    getGoodsInfoDetail,
    getGoodsInfoSubDetail,
    getWorkStats,
    importGoodsPayInfo,
    importGoodsCompositeInfo,
    importGoodsSYCMInfo,
    importGoodsXHSInfo,
    importGoodsBrushingInfo,
    importJDZYInfo,
    importJDZYPromotionInfo,
    importGoodsPDDInfo,
    importGoodsOrderInfo,
    setPannelSetting,
    getNewOnSaleInfo,
    getOptimizeInfo,
    checkOperationOptimize,
    importGoodsVerified,
    importGoodsOrderVerifiedStat
}