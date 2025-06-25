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
    optimizeFieldMap,
    goodsIsOldMap,
    goodsRankMap,
    optimizeRankMap,
    optimizeBpmProcessKey,
    optimizeBpmProcessName
} = require('../const/operationConst')
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
const shopPromotionLog = require('../repository/operation/shopPromotionLog')
const ordersGoodsSalesRepo = require('../repository/operation/ordersGoodsSalesRepo')
const ordersGoodsVerifiedsRepo = require('../repository/operation/ordersGoodsVerifiedsRepo')
const goodsSalesStats = require('@/repository/operation/goodsSalesStats')
const goodsVerifiedsStats = require('@/repository/operation/goodsVerifiedsStats')
const moment = require('moment')
const goodsSalesRepo = require('@/repository/operation/goodsSalesRepo')
const goodsVerifiedsRepo = require('@/repository/operation/goodsVerifiedsRepo')
const goodsPaymentsRepo = require('@/repository/operation/goodsPaymentsRepo')
const clickFarmingRepo = require('../repository/operation/clickFarmingRepo')
const actHiProcinstRepo = require('@/repository/bpm/actHiProcinstRepo')
const systemUsersRepo = require('@/repository/bpm/systemUsersRepo')
const commonReq = require('@/core/bpmReq/commonReq')
const actReProcdefRepo = require('@/repository/bpm/actReProcdefRepo')
const credentialsReq = require("@/core/dingDingReq/credentialsReq")
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
    let setting = await userSettingRepo.getByType(id, 3)
    if (result) {
        result = JSON.parse(result)
        if (setting.length > 0) {
            setting = JSON.parse(setting[0].attributes || '[]')
            result.total.setting = setting
        }
        return result
    }
    result = JSON.parse(JSON.stringify(operationDefaultItem))
    let func = params.stats == 'verified' ? goodsSaleVerifiedRepo : goodsSaleInfoRepo
    let sale_amount = 0, promotion_amount = 0, express_fee = 0, profit = 0, 
        oriType, type = '', except = false, operation_amount = 0, 
        words_market_vol = 0, words_vol = 0, order_num = 0, refund_num = 0,
        children = [{}, {}, {}], warning = 0, packing_fee = 0
    let month_duration = parseInt(moment(end).format('YYYYMM')) - parseInt(moment(start).format('YYYYMM')) + 1
    let months = [], timeline = '', start1 = start
    for (let i = 0; i < month_duration; i++) {
        let tmp = i+1 < month_duration ? 
            moment(start1).add(i + 1, 'months').format('YYYY-MM') + '-01' : 
            moment(end).add(1, 'days').format('YYYY-MM-DD')
        months.push({start: start1, end: tmp})
        let rate = ((moment(tmp).diff(start1, 'days')) / moment(start1).daysInMonth() * 100).toFixed(2)    
        timeline = `${timeline}${moment(start1).format('YYYYMM')}: ${rate}% \n`
        start1 = tmp
    }
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
                result = await queryShopInfo(shops, result, typeValue, start, end, months, timeline, func)
            }
            if (users.length) {
                result = await queryUserInfo(users, result, typeValue, start, end, months, timeline, func)
            }
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
                result = await queryShopInfo(shops, result, typeValue, start, end, months, timeline, func)
            }
            if (users.length) {
                result = await queryUserInfo(users, result, typeValue, start, end, months, timeline, func)
            }
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
    let targets_info = {}
    for (let i = 0; i < result[type].data.length; i++) {
        // if (result[type].data[i].name == 'COUPANG') continue
        sale_amount += parseFloat(result[type].data[i].sale_amount)
        promotion_amount += parseFloat(result[type].data[i].promotion_amount)
        operation_amount += parseFloat(result[type].data[i].operation_amount)
        words_market_vol += parseFloat(result[type].data[i].words_market_vol)
        words_vol += parseFloat(result[type].data[i].words_vol)
        order_num += parseFloat(result[type].data[i].order_num)
        refund_num += parseFloat(result[type].data[i].refund_num)
        express_fee += parseFloat(result[type].data[i].express_fee)
        packing_fee += parseFloat(result[type].data[i].packing_fee)
        profit += parseFloat(result[type].data[i].profit)
        for (let j = 0; j < result[type].data[i].targets_info.length; j++) {
            if (!targets_info[result[type].data[i].targets_info[j].month]) {
                targets_info[result[type].data[i].targets_info[j].month] = {
                    amount1: parseFloat(result[type].data[i].targets_info[j].amount1),
                    amount2: parseFloat(result[type].data[i].targets_info[j].amount2)
                }
            } else {
                targets_info[result[type].data[i].targets_info[j].month].amount1 += parseFloat(result[type].data[i].targets_info[j].amount1)
                targets_info[result[type].data[i].targets_info[j].month].amount2 += parseFloat(result[type].data[i].targets_info[j].amount2)
            }            
        }
        if (type == typeList.project.value && result[type].data[i].name == projectNameList.coupang) continue
        for (let j = 0; j < result[type].data[i].children.length; j++) {
            result[type].data[i].children[j]['timeline'] = timeline
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
        if (children[j]) children[j]['timeline'] = timeline
        for (let k in children[j]) {
            if (!['id', 'name', 'closed', 'timeline', 'targets'].includes(k))
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
    result.total.column = columnInfo
    result.total.data[0].sale_amount = sale_amount.toFixed(2)
    result.total.data[0].promotion_amount = promotion_amount.toFixed(2)
    result.total.data[0].express_fee = express_fee.toFixed(2)
    result.total.data[0].packing_fee = packing_fee.toFixed(2)
    result.total.data[0].profit = profit.toFixed(2)
    result.total.data[0].children = children.filter(item => item.id)
    result.total.data[0].warning = warning
    result.total.data[0].timeline = timeline
    result.total.data[0].targets = ''
    result.total.data[0].goal = ''
    for (let i in targets_info) {
        let rate = (targets_info[i].amount1 / targets_info[i].amount2 * 100).toFixed(2)
        result.total.data[0].targets = `${result.total.data[0].targets}${i}: ${rate}%\n`
        result.total.data[0].goal = `${result.total.data[0].goal}${i}: ${targets_info[i].amount2.toFixed(2)}\n`
    }
    if (setting.length > 0) {
        setting = JSON.parse(setting[0].attributes || '[]')
        result.total.setting = setting
    }
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
        if (['sale_amount', 'promotion_amount', 'express_fee', 'packing_fee', 'profit', 'operation_amount', 'order_num', 'refund_num'].includes(column))
            result = await func.getDetailByShopNamesAndTme(shopNames, column, start, end)
        else if (column == 'operation_rate')
            result = await func.getRateByShopNamesAndTme(shopNames, 'sale_amount', 'operation_amount', column, start, end, 100)
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
        if (['sale_amount', 'promotion_amount', 'express_fee', 'packing_fee', 'profit', 'operation_amount', 'order_num', 'refund_num'].includes(column))
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

const queryShopInfo = async (shops, result, type, start, end, months, timeline, func) => {
    let sale_amount = 0, info, promotion_amount = 0, packing_fee = 0, 
        express_fee = 0, profit = 0, profit_rate = 0, operation_rate = 0, 
        roi = 0, market_rate = 0, refund_rate = 0, operation_amount = 0,
        order_num = 0, refund_num = 0, words_market_vol = 0, words_vol = 0
    let shopName = [], j = -1, except = false
    if (typeList[type].key < 2) except = true
    for (let i = 0; i < shops.length; i++) {        
        // let isCoupang = await shopInfoRepo.isCoupang(shops[i].shop_name)
        // if (except && isCoupang) continue
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
        let info1 = await func.getTargetsByShopNames(shopName[i].shop_name, months), targets = '', goal = ''
        for (let j = 0; j < info1.length; j++) {
            targets = `${targets}${info1[j].month}: ${info1[j].target}%\n`
            goal = `${goal}${info1[j].month}: ${parseFloat(info1[j].amount2).toFixed(2)}\n`
        }
        if (info?.length) {
            sale_amount = parseFloat(info[0].sale_amount || 0).toFixed(2)
            promotion_amount = parseFloat(info[0].promotion_amount || 0).toFixed(2)
            operation_rate = parseFloat(info[0].operation_rate || 0).toFixed(2)
            roi = parseFloat(info[0].roi || 0).toFixed(2)
            market_rate = parseFloat(info[0].market_rate || 0).toFixed(2)
            refund_rate = parseFloat(info[0].refund_rate || 0).toFixed(2)
            express_fee = parseFloat(info[0].express_fee || 0).toFixed(2)
            packing_fee = parseFloat(info[0].packing_fee || 0).toFixed(2)
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
            children[j].timeline = timeline
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
            packing_fee,
            profit,
            profit_rate,
            operation_amount,
            order_num,
            refund_num,
            words_market_vol,
            words_vol,
            children,
            warning,
            targets,
            goal,
            targets_info: info1,
            timeline
        })           
    }
    return result
}

const queryUserInfo = async (users, result, type, start, end, months, timeline, func) => {
    let sale_amount = 0, info, links, promotion_amount = 0, packing_fee = 0, 
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
        let info1 = await func.getTargetsByLinkIds(linkIds, months), targets = '', goal = ''
        for (let j = 0; j < info1.length; j++) {
            targets = `${targets}${info1[j].month}: ${info1[j].target}%\n`
            goal = `${goal}${info1[j].month}: ${parseFloat(info1[j].amount2).toFixed(2)}\n`
        }
        let children = await func.getChildPaymentByLinkIdsAndTime(linkIds, start, end)
        if (info?.length) {
            sale_amount = parseFloat(info[0].sale_amount || 0).toFixed(2)
            promotion_amount = parseFloat(info[0].promotion_amount || 0).toFixed(2)            
            operation_rate = parseFloat(info[0].operation_rate || 0).toFixed(2)
            roi = parseFloat(info[0].roi || 0).toFixed(2)
            market_rate = parseFloat(info[0].market_rate || 0).toFixed(2)
            refund_rate = parseFloat(info[0].refund_rate || 0).toFixed(2)
            express_fee = parseFloat(info[0].express_fee || 0).toFixed(2)
            packing_fee = parseFloat(info[0].packing_fee || 0).toFixed(2)
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
            children[j].timeline = timeline
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
            packing_fee,
            profit,
            profit_rate,
            operation_amount,
            order_num,
            refund_num,
            words_market_vol,
            words_vol,
            children,
            targets,
            goal,
            targets_info: info1,
            timeline
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
                title: params.stats == 'verified' ? '核销金额' : '发货金额(总供货价)', 
                field_id: 'sale_amount', type: 'number', min: 0, max: 100, show: true
            }, {
                title: '发货商品件数', field_id: 'real_sale_qty', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '京仓发货金额', field_id: 'real_sale_amount', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '日销目标', field_id: 'pit_target_day', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '综毛标准', field_id: 'gross_standard', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '实际综毛', field_id: 'real_gross_profit', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '需补综毛', field_id: 'other_cost', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '日销目标达成率(%)', field_id: 'sale_amount_profit_day', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '月销目标', field_id: 'pit_target_month', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '月销目标达成率(%)', field_id: 'sale_amount_profit_month', type: 'number', 
                min: 0, max: 100, show: true
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
                title: '退款', field_id: 'refund_amount', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '实际支付金额环比(%)', field_id: 'real_pay_amount_qoq', type: 'number', 
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
                title: '利润额', field_id: 'profit', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '利润率(供货价)(%)', field_id: 'profit_rate', type: 'number', 
                min: 0, max: 15, show: true
            }, {
                title: '利润率(gmv)(%)', field_id: 'profit_rate_gmv', type: 'number', 
                min: 0, max: 15, show: true
            }, {
                title: '扣点(账单费用)', field_id: 'bill', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '总成本', field_id: 'cost_amount', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '全站推广', field_id: 'full_site_promotion', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '全站推广ROI', field_id: 'full_site_promotion_roi', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '多目标直投', field_id: 'multi_objective_promotion', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '多目标直投ROI', field_id: 'multi_objective_promotion_roi', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '精准人群推广', field_id: 'targeted_audience_promotion', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '精准人群推广ROI', field_id: 'targeted_audience_promotion_roi', type: 'number', 
                min: 0, max: 100, show: true
            },  {
                title: '货品运营', field_id: 'product_operation_promotion', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '货品运营ROI', field_id: 'product_operation_promotion_roi', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '关键词推广', field_id: 'keyword_promotion', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '关键词推广ROI', field_id: 'keyword_promotion_roi', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '日常推广', field_id: 'daily_promotion', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '场景推广', field_id: 'scene_promotion', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '京东快车', field_id: 'jd_express_promotion', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '全站营销', field_id: 'total_promotion', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '推广合计', field_id: 'promotion_amount', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '搜索访客数', field_id: 'users_num', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '搜索支付买家数', field_id: 'trans_users_num', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '真实转化率', field_id: 'real_pay_rate', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '总支付买家数', field_id: 'total_trans_users_num', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '总访客数', field_id: 'total_users_num', type: 'number', 
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
            }, {
                title: '销售目标', field_id: 'goal', type: 'text', show: true
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
    // let optimize = await goodsOptimizeSetting.getInfo()
    // for (let i = 0; i < result.data?.data.length; i++) {
    //     if (['无操作', '非操作'].includes(result.data.data[i].operator)) continue
    //     for (let j = 0; j < optimize.length; j++) {
    //         let info = await goodsSaleInfoRepo.getOptimizeResult(
    //             result.data.data[i].goods_id,
    //             null,
    //             [optimize[j]]
    //         )
    //         if (info?.length && info[0].count) {
    //             result.data.data[i][`${optimize[j].column}_warn`] = 1
    //         }
    //     }
    // }
    return result
}

const getGoodsInfoDetail = async (column, goods_id, shop_name, start, end, stats, id) => {
    let result={}
    let data=[]
    let setting = []
    let func = stats == 'verified' ? goodsSaleVerifiedRepo : goodsSaleInfoRepo
    if (['sale_amount', 'cost_amount', 'operation_amount', 'promotion_amount', 'express_fee', 'profit','real_sale_amount','real_sale_qty','real_gross_profit'].includes(column))
        data = await func.getDataDetailByTime(column, goods_id, start, end)
    else if (column == 'operation_rate')
        data = await func.getDataRateByTime('sale_amount', 'operation_amount', column, goods_id, start, end, 100)
    else if (column == 'roi')
        data = await func.getDataRateByTime('promotion_amount', 'sale_amount', column, goods_id, start, end, 1)
    else if (column == 'refund_rate')
        data = await func.getDataRateByTime('order_num', 'refund_num', column, goods_id, start, end, 100)
    else if (['profit_rate','profit_rate_gmv'].includes(column))
        data = await func.getDataRateByTime('sale_amount', 'profit', column, goods_id, start, end, 100)
    else if (column == 'dsr')
        data = await goodsOtherInfoRepo.getDataDetailByTime(column, goods_id, start, end)
    else if (column == 'market_rate')
        data = await goodsOtherInfoRepo.getDataRateByTime('words_market_vol', 'words_vol', column, goods_id, start, end, 100)
    else if (column == 'gross_profit')
        data = await func.getDataGrossProfitByTime(goods_id, start, end)
    else if (['pay_amount', 'brushing_amount', 'brushing_qty', 'refund_amount', 'bill'].includes(column))
        data = await goodsPayInfoRepo.getDataDetailByTime(column, goods_id, start, end)
    else if (column == 'pay_express_fee')
        data = await goodsPayInfoRepo.getExpressFeeByTime(goods_id, start, end)
    else if (column == 'real_pay_amount')
        data = await goodsPayInfoRepo.getRealPayAmountByTime(goods_id, start, end)
    else if (column == 'real_pay_amount_qoq')
        data = await goodsPayInfoRepo.getRealPayAmountQOQByTime(goods_id, start, end)
    else if (column == 'composite_info'){
        data = await goodsCompositeRepo.getDataDetailByTime(goods_id, start, end)
        setting = await userSettingRepo.getByType(id, 4)
    }
    else if (column == 'promotion_info') {
        data = await goodsPromotionRepo.getDataDetailByTime(goods_id, shop_name, start, end)
        setting = await userSettingRepo.getByType(id, 5)
    }
    else if (column == 'bill_info'){
        data = await goodsBillRepo.getDataDetailByTime(goods_id, start, end)
        setting = await userSettingRepo.getByType(id, 6)
    }
    else if (['gross_standard','other_cost'].includes(column)){
        data = await func.getGrossStandardByTime(column,goods_id, start, end)
    }
    else if(['full_site_promotion','multi_objective_promotion','targeted_audience_promotion','product_operation_promotion',
        'keyword_promotion','daily_promotion','scene_promotion','jd_express_promotion','total_promotion'].includes(column)){
            data = await func.getpromotionByTime(column,goods_id, start, end)
    }else if(['full_site_promotion_roi','multi_objective_promotion_roi','targeted_audience_promotion_roi',
        'product_operation_promotion_roi','keyword_promotion_roi',].includes(column)){
            data = await func.getpromotionroiByTime(column,goods_id, start, end)
    }
    else if (column == 'promotion_amount_qoq')
        result = await func.getDataPromotionQOQByTime(goods_id, start, end)
    result.data = data
    if (setting?.length) result.setting = JSON.parse(setting[0].attributes) || []
    return result
}

const getJDskuInfoDetail = async (goods_id, start, end, stats,id) => {
    let result={}
    let data=[]
    let setting = []
    data = await goodsSaleInfoRepo.getJDskuInfoDetail(goods_id, start, end, stats)
    setting = await userSettingRepo.getByType(id, 7)
    result.data = data
    if (setting?.length) result.setting = JSON.parse(setting[0].attributes) || []
    return result 
}

const getGoodsInfoDetailTotal = async (goods_id, start, end, stats) => {
    let result = [], info = []
    let func = stats == 'verified' ? goodsSaleVerifiedRepo : goodsSaleInfoRepo
    info = await func.getDataDetailTotalByTime(goods_id, start, end)
    let dateMap = {}
    for (let i = 0; i < info.length; i++) {
        result.push({
            id: `${goods_id}${i}`,
            goods_id: info[i].date,
            parent_id: goods_id,
            shop_name: info[i].shop_name,
            sale_amount: info[i].sale_amount,
            cost_amount: info[i].cost_amount,
            operation_amount: info[i].operation_amount,
            promotion_amount: info[i].promotion_amount,
            express_fee: info[i].express_fee,
            profit: info[i].profit,
            operation_rate: info[i].operation_rate,
            roi: info[i].roi,
            refund_rate: info[i].refund_rate,
            profit_rate: info[i].profit_rate,
            gross_profit: info[i].gross_profit, 
            real_sale_qty: info[i].real_sale_qty,
            real_sale_amount: info[i].real_sale_amount,
            real_gross_profit: info[i].real_gross_profit,
            gross_standard: info[i].gross_standard,
            other_cost: info[i].other_cost,
            profit_rate_gmv: info[i].profit_rate_gmv,
            targeted_audience_promotion: info[i].targeted_audience_promotion,
            full_site_promotion: info[i].full_site_promotion,
            targeted_audience_promotion: info[i].targeted_audience_promotion,
            keyword_promotion: info[i].keyword_promotion,
            product_operation_promotion: info[i].product_operation_promotion,
            daily_promotion: info[i].daily_promotion,
            scene_promotion: info[i].scene_promotion,
            jd_express_promotion: info[i].jd_express_promotion,
            total_promotion: info[i].total_promotion,
            targeted_audience_promotion_roi: info[i].targeted_audience_promotion_roi,
            full_site_promotion_roi: info[i].full_site_promotion_roi,
            targeted_audience_promotion_roi: info[i].targeted_audience_promotion_roi,
            keyword_promotion_roi: info[i].keyword_promotion_roi,
            product_operation_promotion_roi: info[i].product_operation_promotion_roi,
            hasChild: false
        })
        dateMap[info[i].date] = i
    }
    info = []
    info = await func.getDataPromotionQOQByTime(goods_id, start, end)
    for (let i = 0; i < info.length; i++) {
        if (!result[dateMap[info[i].date]]) result[dateMap[info[i].date]] = {}
        result[dateMap[info[i].date]]['promotion_amount_qoq'] = info[i].promotion_amount_qoq
    }
    info = []
    info = await goodsOtherInfoRepo.getDataDetailTotalByTime(goods_id, start, end)
    for (let i = 0; i < info.length; i++) {
        if (!result[dateMap[info[i].date]]) result[dateMap[info[i].date]] = {}
        result[dateMap[info[i].date]]['dsr'] = info[i].dsr
        result[dateMap[info[i].date]]['market_rate'] = info[i].market_rate
    }
    info = []
    info = await goodsPayInfoRepo.getDataDetailTotalByTime(goods_id, start, end)
    for (let i = 0; i < info.length; i++) {
        if (!result[dateMap[info[i].date]]) result[dateMap[info[i].date]] = {}
        result[dateMap[info[i].date]]['pay_amount'] = info[i].pay_amount
        result[dateMap[info[i].date]]['brushing_amount'] = info[i].brushing_amount
        result[dateMap[info[i].date]]['brushing_qty'] = info[i].brushing_qty
        result[dateMap[info[i].date]]['refund_amount'] = info[i].refund_amount
        result[dateMap[info[i].date]]['bill'] = info[i].bill
        result[dateMap[info[i].date]]['pay_express_fee'] = info[i].pay_express_fee
        result[dateMap[info[i].date]]['real_pay_amount'] = info[i].real_pay_amount
    }
    return result
}

const getskuInfoDetailTotal = async (sku_id, start, end, stats) => {
    let result = [], info = []
    info = await goodsSaleInfoRepo.getskuDetailTotalByTime(sku_id, start, end)
    let dateMap = {}
    for (let i = 0; i < info.length; i++) {
        result.push({
            id: `${sku_id}${i}`,
            sku_id: info[i].date,
            parent_id: sku_id,
            total_users_num: info[i].total_users_num,
            trans_users_num: info[i].trans_users_num,
            real_pay_rate: info[i].real_pay_rate,
            real_sale_qty: info[i].real_sale_qty,
            real_sale_amount: info[i].real_sale_amount,
            daily_promotion: info[i].daily_promotion,
            scene_promotion: info[i].scene_promotion,
            total_promotion: info[i].total_promotion,
            promotion_amount: info[i].promotion_amount,
            operation_rate: info[i].operation_rate,
            cost_amount: info[i].cost_amount,
            sale_amount: info[i].sale_amount,
            gross_standard: info[i].gross_standard,
            real_gross_profit: info[i].real_gross_profit,
            other_cost: info[i].other_cost,
            profit: info[i].profit,
            bill_name: info[i].bill_name,
            profit_rate: info[i].profit_rate,
            profit_rate_gmv: info[i].profit_rate_gmv,
            hasChild: false
        })
        dateMap[info[i].date] = i
    }
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
        bill_amount_row = null,
        sale_qty_row = null
    for (let i = 1; i <= columns.length; i++) {
        if (columns[i] == '店铺款式编码') {goods_id_row = i; continue}
        if (columns[i] == '款式编码(参考)') {sku_id_row = i; continue}
        if (columns[i] == '商品款号') {goods_code_row = i; continue}
        if (columns[i] == '商品编码') {sku_code_row = i; continue}
        if (columns[i] == '店铺名称') {shop_name_row = i; continue}
        if (columns[i] == '店铺编码') {shop_id_row = i; continue}
        if (columns[i] == '商品名称') {goods_name_row = i; continue}
        if (columns[i] == '利润-销售数量(扣退)') {sale_qty_row = i; continue}
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
        amount += parseFloat(rows[i].getCell(sale_amount_row).value)
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
            rows[i].getCell(sale_qty_row).value,
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
        saveAmount += parseFloat(rows[i].getCell(sale_amount_row).value)
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
    await batchInsertGoodsSales(time)
    return result
}

const batchInsertGoodsSales = async (date) => {
    let result = await goodsSalesRepo.batchInsert(date)
    logger.info(`[聚水潭发货数据刷新]：时间:${date}, ${result}`)
    if (result) await batchInsertGoodsSalesStats(date)
}

const batchInsertJDGoodsSales = async (date) => {
    let result = await goodsSalesRepo.batchInsert(date)
    logger.info(`[京东发货数据刷新]：时间:${date}, ${result}`)
    if (result) await batchInsertJDGoodsSalesStats(date)
}

const batchInsertJDGoodsSalesStats = async (date) => {
    let result = await goodsSalesStats.batchInsertJD(date)
    logger.info(`[京东发货单品表数据刷新]：时间:${date}, ${result}`)
}

const batchInsertGoodsSalesStats = async (date) => {
    let result = await goodsSalesStats.batchInsert(date)
    logger.info(`[聚水潭发货单品表数据刷新]：时间:${date}, ${result}`)
}

const SalesupdateSalemonth = async (date) => {
    let result= await goodsSalesStats.updateSalemonth(date)
    logger.info(`[聚水潭发货月销售额数据刷新]：时间:${date}, ${result}`)
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
            updateGoodsStatsVol(goods_id, total, base, time)
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
            updateGoodsStatsVol(goods_id, total, base, time)
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
    let count = 0, data = [], result = true
    let goods_id = typeof(rows[1].getCell(2).value) == 'string' ? 
        rows[1].getCell(2).value.trim() : 
        rows[1].getCell(2).value, goodsMap = {}
    for (let i = 0; i < rows.length; i++) {
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
        let info = await goodsOtherInfoRepo.search(goods_id, time)
        if (info?.length) {
            await goodsOtherInfoRepo.updateDSR([dsr, goods_id, time])
        } else {
            if (!goodsMap[goods_id]) {
                data.push(
                    goods_id,
                    dsr,
                    null,
                    null,
                    null,
                    time
                )
                count += 1
                goodsMap[goods_id] = true
            }
        }
    }
    if (count > 0) {
        result = await goodsOtherInfoRepo.batchInsert(count, data)
    }
    await updateGoodsStatsDSR(time)
    if (result) redisRepo.batchDelete(`${redisKeys.operation}:*`)
    return result
}

const updateGoodsStatsVol = async (goods_id, total, base, date) => {
    await goodsSalesStats.updateVol(goods_id, total, base, date)
}

const updateGoodsStatsDSR = async (date) => {
    let result = await goodsSalesStats.updateDSR(date)
    logger.info(`[单品表DSR数据刷新]：时间:${date}, ${result}`)
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
                title: '利润额', field_id: 'profit', type: 'number', 
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
    params.names = []
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
            let userNames = '', names = ''
            for (let j = 0; j < userList.length; j++) {
                if (userList[j].nickname != '赵天鹏') {
                    userNames = `${userNames}"${userList[j].nickname}",`
                    names = `${names}'["${userList[j].nickname}"]',`
                }
            }
            userNames = userNames.substring(0, userNames.length - 1)
            names = names.substring(0, names.length - 1)
            params.userNames.push(userNames)
            params.names.push(names)
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
        if (i == 5) tmp.children.map(item => {
            item.children[item.children.length - 1]['faild'] = 0
            let child = JSON.parse(JSON.stringify(statItem))
            child.actionName = '已拒绝'
            item.children.push(child)
        })
        result.push(tmp)
    }
    let info = await newFormsRepo.getOperationWork(start, end, params)
    let optimize = await newFormsRepo.getOperationOptimizeRate(start, end, params)
    for (let i = 0; i < optimize.length; i++) {
        let opt = await goodsOptimizeSetting.getByTitle(
            optimize[i].opt.substring(1, optimize[i].opt.length - 1))
        let faild = await goodsSaleInfoRepo.getOptimizeResult(
            optimize[i].goods_id,
            optimize[i].time,
            opt
        )
        if (faild?.length) {
            result[workItemMap[optimize[i].operate_type]]
                .children[optimize[i].user_type]
                .children[optimize[i].type].faild += parseInt(faild[0].count)
        }
    }
    for (let i = 0; i < info.length; i++) {
        result[workItemMap[info[i].operate_type]]
            .children[info[i].user_type].sum += parseInt(info[i].count)
        result[workItemMap[info[i].operate_type]]
            .children[info[i].user_type]
            .children[info[i].type].sum += parseInt(info[i].count)
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
        item.sum = parseInt(info[i].count)
        result[workItemMap[info[i].operate_type]]
            .children[info[i].user_type]
            .children[info[i].type]
            .children.push(item)
        if (result[workItemMap[info[i].operate_type]]
            .children[info[i].user_type]
            .children[info[i].type].faild != undefined) {
            let child = JSON.parse(JSON.stringify(statItem))
            child.actionName = '优化成功率'
            child.sum = ((1 - result[workItemMap[info[i].operate_type]]
                .children[info[i].user_type]
                .children[info[i].type].faild / result[workItemMap[info[i].operate_type]]
                .children[info[i].user_type]
                .children[info[i].type].sum) * 100).toFixed(2) + '%'
            result[workItemMap[info[i].operate_type]]
                .children[info[i].user_type]
                .children[info[i].type]
                .children.push(child)
        }
    }
    return result
}

const importGoodsPayInfo = async (rows, time) => {
    let count = 0, count1 = 0, count2 = 0, dataMap = {}
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
        dataMap[goods_id] = true
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
    await updateGoodsPayments(date)
    return result
}

const updateGoodsPayments = async (date) => {
    let result = await goodsPaymentsRepo.batchInsert(date)
    logger.info(`[单品表支付数据刷新]：时间:${date}, ${result}`)
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
        result = await goodsCompositeRepo.batchInsertDefault(count, data)
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
        if (columns[i] == '商品编号' || columns[i] == '商品ID') {
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
        amount += parseFloat(rows[i].getCell(sale_amount_row).value)
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
        //总成本
        let cost_amount = (cost_price + 0.8 + 1.4) * qty
        //京东销售额
        let supplier_amount = parseFloat(rows[i].getCell(supplier_amount_row).value || 0)
        //税点
        let tax = sale_amount * 0.07
        //综毛标准
        let jd_gross_profit_std = supplier_amount * 0.28
        //实际棕毛
        let real_gross_profit = parseFloat(rows[i].getCell(gross_profit_row).value || 0)
        // let real_jd_gross_profit = real_gross_profit < 0 ? 0 : real_gross_profit
        //需补综毛
        let other_cost =jd_gross_profit_std - real_gross_profit
        let profit = other_cost>0 ? sale_amount - cost_amount - tax - other_cost : sale_amount - cost_amount - tax
        data.push(
            goods_id,
            sku_id,
            null,
            null,
            shop_name,
            shop_id,
            null,
            date,
            qty,
            sale_amount,
            cost_amount,
            sale_amount - cost_amount,
            sale_amount ? (sale_amount - cost_amount) / sale_amount : 0,
            profit,
            sale_amount ? profit / sale_amount : 0,
            0,
            null,
            other_cost>0? tax + other_cost : tax,
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
        saveAmount += parseFloat(rows[i].getCell(sale_amount_row).value)
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
        if (promotion_name=='场景推广' || promotion_name=='日常推广'){
            if (columns[i] == 'SKUID') {
                sku_id_row = i
                continue
            }
        } else if(promotion_name=='京东快车1' || promotion_name=='京东快车2' || promotion_name=='京东快车3' ){
            if (columns[i] == '商品SKU') {
                sku_id_row = i
                continue
            }
        } else if(promotion_name=='全站营销' || promotion_name=='新品全站营销' ){
            if (columns[i] == 'ID') {
                sku_id_row = i
                continue
            }
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
        await goodsSaleInfoRepo.selectFee(sku_id, date, goods_id)
        await goodsSaleInfoRepo.updateFee(sku_id, amount, date)
        count += 1
    }
    logger.info(`[京东自营推广数据导入]：时间:${date}, 总计数量:${count}`)
    if (count > 0) {
        await goodsPromotionRepo.deleteByDate(date, promotion_name)
        result = await goodsPromotionRepo.batchInsert(count, data)
    }
    await batchInsertJDGoodsSales(date)
    return result
}

const importJDZYcompositeInfo = async (rows, time) => {
    let count = 0, data = [], result = false
    let columns = rows[0].values,
        sku_id_row = null,
        date = time,
        total_click_num_row = null,
        total_cart_num_row = null,
        users_num_row = null,
        trans_num_row = null,
        trans_qty_row = null,
        trans_users_num_row = null
    for (let i in columns) {
        if (columns[i] == 'SKU') {sku_id_row = i;  continue}
        if (columns[i] == '访客数') {users_num_row = i; continue}
        if (columns[i] == '浏览量') {total_click_num_row = i; continue}
        if (columns[i] == '加购商品件数') {total_cart_num_row = i; continue}
        if (columns[i] == '成交单量') {trans_num_row = i; continue}
        if (columns[i] == '成交商品件数') {trans_qty_row = i; continue}
        if (columns[i] == '成交人数') {trans_users_num_row = i; continue}
    }
    for (let i = 1; i < rows.length; i++) {
        let sku_id = sku_id_row ? (typeof(rows[i].getCell([sku_id_row]).value) == 'string' ? 
            rows[i].getCell([sku_id_row]).value.trim() : 
            rows[i].getCell([sku_id_row]).value) : null, goods_id = null
        if (sku_id) {
            let info = await userOperationRepo.getDetailBySkuId(sku_id)
            if (info?.length) goods_id = info[0].brief_name
        }
        data.push(
            goods_id,
            rows[i].getCell([sku_id_row]).value,
            date,
            rows[i].getCell([users_num_row]).value,
            rows[i].getCell([users_num_row]).value,
            rows[i].getCell([total_click_num_row]).value,
            rows[i].getCell([total_cart_num_row]).value,
            rows[i].getCell([trans_num_row]).value,
            rows[i].getCell([trans_qty_row]).value,
            rows[i].getCell([trans_users_num_row]).value,
            rows[i].getCell([trans_users_num_row]).value
        )
        count += 1
    }
    logger.info(`[京东自营]：时间:${date}, 总计数量:${count}`)
    if (count > 0) {
        await goodsCompositeRepo.deleteByDate(date, '京东自营')
        result = await goodsCompositeRepo.batchInsertJDZY(count, data)
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
        date = time,
        amount_row = null
    for (let i = 1; i < columns.length; i++) {
        if (columns[i] == 'SPUID') {goods_id_row = i;  continue}
        if (columns[i] == '金额') {amount_row = i; continue}
    }
    for (let i = 1; i < rows.length; i++) {
        if (!rows[i].getCell(1).value) continue
        let goods_id = goods_id_row ? (typeof(rows[i].getCell(goods_id_row).value) == 'string' ? 
            rows[i].getCell(goods_id_row).value.trim() : 
            rows[i].getCell(goods_id_row).value) : null
        data.push(
            goods_id,
            null,
            'pakchoice旗舰店（天猫）',
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
    let result = false, count = 0, dataMap = {}
    let columns = rows[0].values,
        goods_id_row = null,
        sku_code_row = null,
        order_row = null,
        date = time,
        goods_id_info = {},
        order_id_info = {}
    for (let i = 1; i < columns.length; i++) {
        if (columns[i] == '店铺款式编码') {goods_id_row = i;  continue}
        if (columns[i] == '商品编码') {sku_code_row = i;  continue}
        if (columns[i] == '线上订单号') {order_row = i; continue}
    }
    await goodsPayInfoRepo.resetBrushingQty(date)
    for (let i = 1; i < rows.length; i++) {
        if (!rows[i].getCell(1).value) continue
        let goods_id = goods_id_row ? (typeof(rows[i].getCell(goods_id_row).value) == 'string' ? 
            rows[i].getCell(goods_id_row).value.trim() : 
            rows[i].getCell(goods_id_row).value) : null
        let sku_code = sku_code_row ? (typeof(rows[i].getCell(sku_code_row).value) == 'string' ? 
            rows[i].getCell(sku_code_row).value.trim() : 
            rows[i].getCell(sku_code_row).value) : null 
        let order = order_row ? (typeof(rows[i].getCell(order_row).value) == 'string' ? 
            rows[i].getCell(order_row).value.trim() : 
            rows[i].getCell(order_row).value) : null
        let info = goods_id.concat('_',sku_code)
        if (!order_id_info[order]) {
            if (!goods_id_info[info]) goods_id_info[info] = 1
            else goods_id_info[info] += 1
            order_id_info[order] = true
        }
        dataMap[goods_id] = true
    }
    for (let index in goods_id_info) {
        goods_id = index.split('_')[0]
        sku_code = index.split('_')[1]
        result = await goodsPayInfoRepo.updateBrushingQty(goods_id, sku_code, goods_id_info[index], date)
        if (!result) {
            result = await goodsPayInfoRepo.insertBrushingInfo([
                goods_id,
                sku_code,
                date,
                goods_id_info[index]
            ])
        }
        count += 1
    }
    await updateGoodsPayments(date)
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
        if (columns[i] == '成交件数') {trans_qty_row = i; continue}
        if (columns[i] == '成交买家数') {trans_users_num_row = i; continue}
        if (columns[i] == '成交订单数') {trans_num_row = i; continue}
        if (columns[i] == '成交金额(元)') {trans_amount_row = i; continue}
        if (columns[i] == '成交转化率') {pay_rate_row = i; continue}
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
            data[tmp[goods_id][sku_code]].cost_amount += parseFloat(cost_amount)
            data[tmp[goods_id][sku_code]].qty += parseInt(qty)
            data[tmp[goods_id][sku_code]].sale_amount += parseFloat(sale_amount)
            data[tmp[goods_id][sku_code]].express_fee += parseFloat(express_fee)
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

const getOptimizeInfo = async (params, user) => {
    let permissions = []
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
    if (permissions.length == 0) return []
    let users = [] 
    for (let i = 0; i < permissions.length; i++) {
        if (i > 0 && permissions[i].type != permissions[i-1].type) break
        let userList = []
        switch (permissions[i].type) {
            case typeList.division.key:
                userList = await divisionInfoRepo.getUsersById(permissions[i].detail_id)
                break
            case typeList.project.key:
                userList = await projectInfoRepo.getUsersById(permissions[i].detail_id) 
                break
            case typeList.team.key:
                userList = await teamInfoRepo.getUsersById(permissions[i].detail_id)
                break
            case typeList.user.key:
                userList = await userOperationRepo.getUserById(permissions[i].detail_id)
                break
            default:
        }
        if (userList?.length) users = users.concat(userList)
    }
    params.userNames = ''
    if (params.user) params.userNames = `'["${params.user}"]',`
    else
        for (let i = 0; i < users.length; i++) {
            params.userNames = `${params.userNames}'["${users[i].nickname}"]',`
        }
    if (params.userNames?.length) params.userNames = params.userNames.substring(0, params.userNames.length - 1)
    let result = await newFormsRepo.getOperationOptimizeInfo(params)
    result.users = users
    for (let i = 0; i < result.data.length; i++) {
        result.data[i].name = result.data[i].name.replace(/[\[\]\"]/g, '')
        let optimize_info = result.data[i].optimize_info.replace(/[\[\]]/g, '')
        result.data[i].optimize_info = result.data[i].optimize_info.replace(/[\[\]\"]/g, '')
        let optimize = await goodsOptimizeSetting.getByTitle(optimize_info)
        result.data[i].success_rate = 0
        let total = result.data[i].children.length, failed = 0
        if (optimize?.length)
            for (let j = 0; j < result.data[i].children.length; j++) {
                let info = await goodsSaleInfoRepo.getOptimizeResult(
                    result.data[i].children[j].goods_id,
                    result.data[i].children[j].time,
                    optimize
                )
                if (info?.length) {
                    failed += info[0].count
                }
            }
        if (total > 0) result.data[i].success_rate = ((total - failed) / total * 100).toFixed(2)
    }
    return result
}

const getReportInfo = async (lstart, lend,preStart,preEnd,goodsinfo) =>{
    let data ={
            columns:[
            { header: "日期", key: 'date' },
            { header: "组", key: 'team_name' },
            { header: "产品线负责人", key: 'line_director' },
            { header: "运营负责人", key: 'operator' },
            { header: "链接ID", key: 'goods' },
            { header: "实际发货金额", key: 'sale_amount' },
            { header: "利润额", key: 'profit' },
            { header: "核销金额", key: 'verified_amount' },
            { header: "核销利润额", key: 'verified_profit' },
            { header: "快递费", key: 'express' },
            { header: "扣点", key: 'bill_amount' },
            { header: "推广", key: 'promotion_amount' },
            { header: "推广费比", key: 'promotion_rate' },
            { header: "平台刷单", key: 'erlei_shuadan' },
            { header: "小红书刷单", key: 'xhs_shuadan' },
            { header: "售后赔偿", key: 'after_sales_compensation' },
            { header: "退换率", key: 'refund_rate' },
            { header: "质量分", key: 'dsr' },
            { header: "汇总费比", key: 'bill_rate' },
            { header: "组内人效", key: 'group_effectiveness' },
            { header: "利润率", key: 'profit_rate' },
            { header: "核销利润率", key: 'verified_profit_rate' },
            { header: "组金额占比", key: 'team_saleamount_rate' },
    ]}
    let week =[]
    if(goodsinfo=='汇总'){
        week = await goodsSaleInfoRepo.getweeklyreport(lstart, lend,preStart,preEnd,goodsinfo)
    } else{
        week = await goodsSaleInfoRepo.getinfoweeklyreport(lstart, lend,preStart,preEnd,goodsinfo)
    }
    
    const groupedData = week.reduce((acc, item) => {
        if (!acc[item.team_name]) {
            acc[item.team_name] = []
        }
        acc[item.team_name].push(item)
        return acc
    }, {})
    // 2. 计算环比
    const calculateChainRatio = (currentWeek, lastWeek) => {
    if (lastWeek === 0 || lastWeek==null) return 0 // 避免除零错误
    return ((currentWeek - lastWeek) / lastWeek) * 100
    }
    
    // 3. 添加周数据和汇总数据
    const result = Object.keys(groupedData).map(teamName => {
        const teamData = groupedData[teamName]
        // 分离上周和上上周的数据
        const lastWeekData = teamData.filter(item => item.date === "上周")
        const lastLastWeekData = teamData.filter(item => item.date === "上上周")

        // 计算汇总数据
        const sumData = (data, key) => data.reduce((sum, item) => sum + parseFloat(item[key] || 0), 0)
        const averageData = (data, key) => {
            const sum = sumData(data, key) // 先计算总和
            const count = data.length // 数据条数
            return count === 0 ? 0 : sum / count // 避免除零错误
        };
        const lastWeekSummary = {
            line_director: teamName+'汇总',
            team_name: teamName+'汇总',
            date: "上周",
            operator: teamName+'汇总',
            goods:sumData(lastWeekData, "goods"),
            sale_amount: sumData(lastWeekData, "sale_amount").toFixed(2),
            profit: sumData(lastWeekData, "profit").toFixed(2),
            profit_rate: (sumData(lastWeekData, "profit")/sumData(lastWeekData, "sale_amount")*100).toFixed(2),
            promotion_amount: sumData(lastWeekData, "promotion_amount").toFixed(2),
            promotion_rate: (sumData(lastWeekData, "promotion_amount")/sumData(lastWeekData, "sale_amount")*100).toFixed(2),
            bill_amount: sumData(lastWeekData, "bill_amount").toFixed(2),
            order_num: sumData(lastWeekData, "order_num").toFixed(2),
            refund_num: sumData(lastWeekData, "refund_num").toFixed(2),
            refund_rate: (sumData(lastWeekData, "refund_num")/sumData(lastWeekData, "order_num")*100).toFixed(2),
            express: sumData(lastWeekData, "express").toFixed(2),
            verified_amount: sumData(lastWeekData, "verified_amount").toFixed(2),
            verified_profit: sumData(lastWeekData, "verified_profit").toFixed(2),
            verified_profit_rate: (sumData(lastWeekData, "verified_profit")/sumData(lastWeekData, "verified_amount")*100).toFixed(2),
            after_sales_compensation: sumData(lastWeekData, "after_sales_compensation").toFixed(2),
            dsr: averageData(lastWeekData, "dsr").toFixed(2),
            xhs_shuadan: sumData(lastWeekData, "xhs_shuadan").toFixed(2),
            erlei_shuadan: sumData(lastWeekData, "erlei_shuadan").toFixed(2),
            bill: sumData(lastWeekData, "bill").toFixed(2),
            bill_rate: (sumData(lastWeekData, "bill")/sumData(lastWeekData, "sale_amount")*100).toFixed(2),
            group_effectiveness:averageData(lastWeekData,"group_effectiveness"),
            total_sale_amount:sumData(lastWeekData, "total_sale_amount").toFixed(2),
            team_saleamount_rate:(sumData(lastWeekData, "total_sale_amount")/sumData(lastWeekData, "sale_amount")).toFixed(2)
            // 其他字段可以根据需要添加
        }

        const lastLastWeekSummary = {
            line_director: teamName+'汇总',
            team_name: teamName+'汇总',
            date: "上上周",
            operator: teamName+'汇总',
            goods:sumData(lastLastWeekData, "goods"),
            sale_amount: sumData(lastLastWeekData, "sale_amount").toFixed(2),
            profit: sumData(lastLastWeekData, "profit").toFixed(2),
            profit_rate: (sumData(lastLastWeekData, "profit")/sumData(lastLastWeekData, "sale_amount")*100).toFixed(2),
            promotion_amount: sumData(lastLastWeekData, "promotion_amount").toFixed(2),
            promotion_rate: (sumData(lastLastWeekData, "promotion_amount")/sumData(lastLastWeekData, "sale_amount")*100).toFixed(2),
            bill_amount: sumData(lastLastWeekData, "bill_amount").toFixed(2),
            order_num: sumData(lastLastWeekData, "order_num").toFixed(2),
            refund_num: sumData(lastLastWeekData, "refund_num").toFixed(2),
            refund_rate: (sumData(lastLastWeekData, "refund_num")/sumData(lastLastWeekData, "order_num")*100).toFixed(2),
            express: sumData(lastLastWeekData, "express").toFixed(2),
            verified_amount: sumData(lastLastWeekData, "verified_amount").toFixed(2),
            verified_profit: sumData(lastLastWeekData, "verified_profit").toFixed(2),
            verified_profit_rate: (sumData(lastLastWeekData, "verified_profit")/sumData(lastLastWeekData, "verified_amount")*100).toFixed(2),
            after_sales_compensation: sumData(lastLastWeekData, "after_sales_compensation").toFixed(2),
            dsr: averageData(lastWeekData, "dsr").toFixed(2),
            xhs_shuadan: sumData(lastLastWeekData, "xhs_shuadan").toFixed(2),
            erlei_shuadan: sumData(lastLastWeekData, "erlei_shuadan").toFixed(2),
            bill: sumData(lastLastWeekData, "bill").toFixed(2),
            bill_rate: (sumData(lastLastWeekData, "bill")/sumData(lastLastWeekData, "sale_amount")*100).toFixed(2),
            group_effectiveness:averageData(lastLastWeekData,"group_effectiveness"),
            total_sale_amount:sumData(lastLastWeekData, "total_sale_amount"),
            team_saleamount_rate:(sumData(lastLastWeekData, "total_sale_amount")/sumData(lastLastWeekData, "sale_amount")).toFixed(2)
            // 其他字段可以根据需要添加
        }

        // 计算环比
        const chainRatioData = {
            line_director: teamName+'环比',
            team_name: teamName+'环比',
            date: teamName+'环比',
            operator: teamName+'环比',
            goods: calculateChainRatio(lastWeekSummary.goods, lastLastWeekSummary.goods).toFixed(2) + "%",
            sale_amount: calculateChainRatio(lastWeekSummary.sale_amount, lastLastWeekSummary.sale_amount).toFixed(2) + "%",
            profit: calculateChainRatio(lastWeekSummary.profit, lastLastWeekSummary.profit).toFixed(2) + "%",
            profit_rate: calculateChainRatio(lastWeekSummary.profit_rate, lastLastWeekSummary.profit_rate).toFixed(2),
            promotion_amount: calculateChainRatio(lastWeekSummary.promotion_amount, lastLastWeekSummary.promotion_amount).toFixed(2) + "%",
            promotion_rate: calculateChainRatio(lastWeekSummary.promotion_rate, lastLastWeekSummary.promotion_rate).toFixed(2),
            bill_amount: calculateChainRatio(lastWeekSummary.bill_amount, lastLastWeekSummary.bill_amount).toFixed(2) + "%",
            order_num: calculateChainRatio(lastWeekSummary.order_num, lastLastWeekSummary.order_num).toFixed(2) + "%",
            refund_num: calculateChainRatio(lastWeekSummary.refund_num, lastLastWeekSummary.refund_num).toFixed(2) + "%",
            refund_rate: calculateChainRatio(lastWeekSummary.refund_rate, lastLastWeekSummary.refund_rate).toFixed(2),
            express: calculateChainRatio(lastWeekSummary.express, lastLastWeekSummary.express).toFixed(2) + "%",
            verified_amount: calculateChainRatio(lastWeekSummary.verified_amount, lastLastWeekSummary.verified_amount).toFixed(2) + "%",
            verified_profit: calculateChainRatio(lastWeekSummary.verified_profit, lastLastWeekSummary.verified_profit).toFixed(2) + "%",
            verified_profit_rate: calculateChainRatio(lastWeekSummary.verified_profit_rate, lastLastWeekSummary.verified_profit_rate).toFixed(2),
            after_sales_compensation: calculateChainRatio(lastWeekSummary.after_sales_compensation, lastLastWeekSummary.after_sales_compensation).toFixed(2) + "%",
            dsr: calculateChainRatio(lastWeekSummary.dsr, lastLastWeekSummary.dsr).toFixed(2) + "%",
            xhs_shuadan: calculateChainRatio(lastWeekSummary.xhs_shuadan, lastLastWeekSummary.xhs_shuadan).toFixed(2) + "%",
            erlei_shuadan: calculateChainRatio(lastWeekSummary.erlei_shuadan, lastLastWeekSummary.erlei_shuadan).toFixed(2) + "%",
            bill: calculateChainRatio(lastWeekSummary.bill, lastLastWeekSummary.bill).toFixed(2) + "%",
            bill_rate: calculateChainRatio(lastWeekSummary.bill_rate, lastLastWeekSummary.bill_rate).toFixed(2),
            group_effectiveness:calculateChainRatio(lastWeekSummary.group_effectiveness, lastLastWeekSummary.group_effectiveness).toFixed(2) + "%",
            team_saleamount_rate:calculateChainRatio(lastWeekSummary.team_saleamount_rate, lastLastWeekSummary.team_saleamount_rate).toFixed(2),
        }
        // 构建结果
        return [
            ...lastLastWeekData,
            lastLastWeekSummary,
            ...lastWeekData,
            lastWeekSummary,
            chainRatioData,
        ]
    }).flat()
    // 组内人效=组发货金额/人数
    // 租金额占比=个人发货金额/汇总发货金额
    const sortOrder = {
        "一组": 1,
        "二组": 2,
        "三组": 3,
        "四组": 4,
        "无操作": 5 
    }
    
    // 提取组别名称
    const extractGroupName = (teamName) => {
        if (teamName.includes("一组")) return "一组";
        if (teamName.includes("二组")) return "二组";
        if (teamName.includes("三组")) return "三组";
        if (teamName.includes("四组")) return "四组";
        return "无操作" // 默认返回 "无操作"
    }
    
    // 排序函数
    const sortedData = result.sort((a, b) => {
        const groupA = extractGroupName(a.team_name)
        const groupB = extractGroupName(b.team_name)
        return sortOrder[groupA] - sortOrder[groupB]
    })
    const filteredData = sortedData.filter(item => !["无操作汇总", "总计汇总"].some(group => item.team_name.includes(group)))
    data.data = []
    data.data = filteredData
    return data
}

const getTMPromotioninfo = async (lstart, lend) =>{
    let data ={
        columns:[
        { header: "链接ID", key: 'goods_id' },
        { header: "简称", key: 'brief_name' },
        { header: "产品线负责人", key: 'line_director' },
        { header: "运营负责人", key: 'operator' },
        { header: "超级短视频", key: 'super_short_video' },
        { header: "超级短视频ROI", key: 'super_short_video_roi' },
        { header: "全站推广", key: 'full_site_promotion' },
        { header: "全站推广ROI", key: 'full_site_promotion_roi' },
        { header: "精准人群推广", key: 'targeted_audience_promotion' },
        { header: "精准人群推广ROI", key: 'targeted_audience_promotion_roi' },
        { header: "关键词推广", key: 'keyword_promotion' },
        { header: "关键词推广ROI", key: 'keyword_promotion_roi' },
        { header: "多目标直投", key: 'multi_objective_promotion' },
        { header: "多目标直投ROI", key: 'multi_objective_promotion_roi' },
        { header: "货品运营", key: 'product_operation_promotion' },
        { header: "货品运营ROI", key: 'product_operation_promotion_roi' },
        { header: "推广汇总金额", key: 'promotion_amount' },
        { header: "推广汇总ROI", key: 'roi' },
        { header: "实际发货金额", key: 'sale_amount' },
        { header: "发货ROI", key: 'sale_amount_roi' }
    ]}
    let resutl = await goodsSaleInfoRepo.getTMPromotioninfo(lstart, lend)
    data.data = []
    data.data = resutl
    return data
}

const getTMPromotion = async (lstart, lend) =>{
    let data ={
        columns:[
        { header: "组", key: 'team_name' },
        { header: "产品线负责人", key: 'line_director' },
        { header: "运营负责人", key: 'operator' },
        { header: "超级短视频", key: 'super_short_video' },
        { header: "超级短视频ROI", key: 'super_short_video_roi' },
        { header: "全站推广", key: 'full_site_promotion' },
        { header: "全站推广ROI", key: 'full_site_promotion_roi' },
        { header: "精准人群推广", key: 'targeted_audience_promotion' },
        { header: "精准人群推广ROI", key: 'targeted_audience_promotion_roi' },
        { header: "关键词推广", key: 'keyword_promotion' },
        { header: "关键词推广ROI", key: 'keyword_promotion_roi' },
        { header: "多目标直投", key: 'multi_objective_promotion' },
        { header: "多目标直投ROI", key: 'multi_objective_promotion_roi' },
        { header: "货品运营", key: 'product_operation_promotion' },
        { header: "货品运营ROI", key: 'product_operation_promotion_roi' },
        { header: "推广汇总金额", key: 'promotion_amount' },
        { header: "推广汇总ROI", key: 'roi' }
    ]}
    let result = await goodsSaleInfoRepo.getTMPromotion(lstart, lend)
    const sortOrder = {
        "一组": 1,
        "二组": 2,
        "三组": 3,
        "四组": 4,
        "无操作": 5 
    }
    // 提取组别名称
    const extractGroupName = (teamName) => {
        if (teamName.includes("一组")) return "一组";
        if (teamName.includes("二组")) return "二组";
        if (teamName.includes("三组")) return "三组";
        if (teamName.includes("四组")) return "四组";
        return "无操作" // 默认返回 "无操作"
    }
    // 排序函数
    const sortedData = result.sort((a, b) => {
        const groupA = extractGroupName(a.team_name)
        const groupB = extractGroupName(b.team_name)
        return sortOrder[groupA] - sortOrder[groupB]
    })
    const filteredData = sortedData.filter(item => !["无操作汇总"].some(group => item.team_name.includes(group)))
    data.data = []
    data.data = filteredData
    return data
}

const checkOperationOptimize = async () => {
    let optimize = await goodsOptimizeSetting.getInfo()
    let goods_info = await userOperationRepo.getLinkIds()
    let refresh_token = await credentialsReq.getBpmgAccessToken()
    for (let i = 0; i < goods_info.length; i++) {
        for (let j = 0; j < optimize.length; j++) {
            if (optimize[j].optimize_type == '费比高') continue
            let info = await goodsSaleInfoRepo.getOptimizeResult(
                goods_info[i].goods_id,
                null,
                [optimize[j]]
            )
            if (info?.length && info[0].count) {
                optimize_title = optimize[j].title
                if (optimize[j].column == 'channel_roi') 
                    optimize_title = optimize[j].value + optimize[j].title
                info = await actHiProcinstRepo.checkOptimize(goods_info[i].goods_id, optimize_title, optimize[j].days)
                if (!info?.length) {
                    let params = {}
                    let user = await systemUsersRepo.getID(goods_info[i].operator)
                    if (!user.length) continue
                    params[optimizeFieldMap.optimize_rank] = optimizeRankMap[0]
                    if (moment(goods_info[i].onsale_date).add(60, 'day').valueOf() >= moment().valueOf()) {
                        params[optimizeFieldMap.is_old] = goodsIsOldMap[0]
                        params[optimizeFieldMap.optimize_rank] = optimizeRankMap[1]
                    } else {
                        params[optimizeFieldMap.is_old] = goodsIsOldMap[1]
                    }
                    switch (goods_info[i].product_rank.replace(' ', '')) {
                        case 'S:1万':
                        case 'S(月销20w以上)':
                            params[optimizeFieldMap.rank] = goodsRankMap.S
                            params[optimizeFieldMap.optimize_rank] = optimizeRankMap[1]
                            break
                        case 'A:5千':
                        case 'A(月销10-20w)':
                            params[optimizeFieldMap.rank] = goodsRankMap.A
                            break
                        case 'B:2千':
                        case 'B(月销3-10w)':
                            params[optimizeFieldMap.rank] = goodsRankMap.B
                            break
                        case 'C:1千':
                        case 'C(月销3w以下)':
                            params[optimizeFieldMap.rank] = goodsRankMap.C
                            break
                        default:
                    }
                    // console.log(goods_info[i].product_rank, params[optimizeFieldMap.rank])
                    params[optimizeFieldMap.name] = goods_info[i].brief_name
                    params[optimizeFieldMap.operator] = user[0].id
                    params[optimizeFieldMap.goods_id] = goods_info[i].goods_id
                    params[optimizeFieldMap.platform] = platformMap[goods_info[i].platform]
                    params[optimizeFieldMap.type] = optimize[j].optimize_type
                    params[optimizeFieldMap.content] = optimize_title
                    // fs.writeFileSync('./public/info.json', JSON.stringify(params) + '\n', {flag: 'a'})
                    let processDefinitionId = await actReProcdefRepo.getProcessDefinitionId(
                        optimizeBpmProcessName,
                        optimizeBpmProcessKey
                    )
                    await commonReq.createJDProcess(269, processDefinitionId, params, refresh_token.data.accessToken)
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
        bill_amount_row = null,
        sale_qty_row = null
    for (let i = 1; i <= columns.length; i++) {
        if (columns[i] == '店铺款式编码') {goods_id_row = i; continue}
        if (columns[i] == '商品编码') {sku_code_row = i; continue}
        if (columns[i] == '店铺名称') {shop_name_row = i; continue}
        if (columns[i] == '利润-销售数量(扣退)') {sale_qty_row = i; continue}
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
        amount += parseFloat(rows[i].getCell(sale_amount_row).value)
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
            rows[i].getCell(sale_qty_row).value,
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
        saveAmount += parseFloat(rows[i].getCell(sale_amount_row).value)
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
    await batchInsertGoodsVerifieds(time)
    return result
}

const batchInsertGoodsVerifieds = async (date) => {
    let result = await goodsVerifiedsRepo.batchInsert(date)
    logger.info(`[核销数据刷新]：时间:${date}, ${result}`)
    if (result) await batchInsertGoodsVerifiedsStats(date)
}

const batchInsertGoodsVerifiedsStats = async (date) => {
    let result = await goodsVerifiedsStats.batchInsert(date)
    logger.info(`[核销单品表数据刷新]：时间:${date}, ${result}`)
}

const VerifiedsupdateSalemonth = async (date) => {
    let result= await goodsVerifiedsStats.updateSalemonth(date)
    logger.info(`[核销月销售额数据刷新]：时间:${date}, ${result}`)
}

const createShopPromotionLog = async (date, shop_name) => {
    const result = await shopPromotionLog.create(date, shop_name)
    return result
}

const importOrdersGoods = async (rows, date) => {
    let orderMap = {}, dataMap = {}, data = [], count = 0, result = false
    let columns = rows[0].values,
        order_code_row = null,
        shop_name_row = null,
        shop_id_row = null, 
        sku_code_row = null,
        goods_id_row = null,
        sku_id_row = null,
        sale_amount_row = null,
        cost_amount_row = null,
        express_fee_row = null,
        packing_fee_row = null,
        bill_amount_row = null,
        quantity_row = null
    for (let i = 1; i <= columns.length; i++) {
        if (columns[i] == '店铺') {shop_name_row = i; continue}
        if (columns[i] == '店铺编码') {shop_id_row = i; continue}
        if (columns[i] == '线上单号') {order_code_row = i; continue}
        if (columns[i] == '商品编码') {sku_code_row = i; continue}
        if (columns[i] == '收入-商品销售金额(扣退)') {sale_amount_row = i; continue}
        if (columns[i] == '成本-商品销售成本(扣退)') {cost_amount_row = i; continue}
        if (columns[i] == '费用-快递费') {express_fee_row = i; continue}
        if (columns[i] == '费用-包材费') {packing_fee_row = i; continue}
        if (columns[i] == '费用-账单费用') {bill_amount_row = i; continue}
        if (columns[i] == '店铺商品编码') {sku_id_row = i; continue}
        if (columns[i] == '店铺款式编码') {goods_id_row = i; continue}
        if (columns[i] == '数量-销售数量(扣退)') {quantity_row = i; continue}
    }
    for (let i = 1; i < rows.length; i++) {
        let order_code = typeof(rows[i].getCell(order_code_row).value) == 'string' ? 
            rows[i].getCell(order_code_row).value.trim() : 
            rows[i].getCell(order_code_row).value
        let shop_name = typeof(rows[i].getCell(shop_name_row).value) == 'string' ? 
            rows[i].getCell(shop_name_row).value.trim() : 
            rows[i].getCell(shop_name_row).value
        let shop_id = typeof(rows[i].getCell(shop_id_row).value) == 'string' ? 
            rows[i].getCell(shop_id_row).value.trim() : 
            rows[i].getCell(shop_id_row).value
        let sku_code = typeof(rows[i].getCell(sku_code_row).value) == 'string' ? 
            rows[i].getCell(sku_code_row).value.trim() : 
            rows[i].getCell(sku_code_row).value
        let goods_id = typeof(rows[i].getCell(goods_id_row).value) == 'string' ? 
            rows[i].getCell(goods_id_row).value.trim() : 
            rows[i].getCell(goods_id_row).value
        let sku_id = typeof(rows[i].getCell(sku_id_row).value) == 'string' ? 
            rows[i].getCell(sku_id_row).value.trim() : 
            rows[i].getCell(sku_id_row).value
        let sale_amount = rows[i].getCell(sale_amount_row).value
        let cost_amount = rows[i].getCell(cost_amount_row).value
        let express_fee = rows[i].getCell(express_fee_row).value
        let packing_fee = rows[i].getCell(packing_fee_row).value
        let bill_amount = rows[i].getCell(bill_amount_row).value
        let quantity = rows[i].getCell(quantity_row).value
        if (sale_amount <= 0) continue
        if (orderMap[order_code] != undefined) { 
            orderMap[order_code].total_amount += parseFloat(sale_amount)
        } else {
            orderMap[order_code] = {
                shop_id,
                shop_name,
                total_amount: parseFloat(sale_amount)
            }
        }
        dataMap[`${order_code}_${goods_id || ''}_${sku_id || ''}_${sku_code}`] = {
            sale_amount: parseFloat(sale_amount),
            cost_amount: parseFloat(cost_amount),
            express_fee: parseFloat(express_fee),
            packing_fee: parseFloat(packing_fee),
            bill_amount: parseFloat(bill_amount),
            quantity: parseInt(quantity)
        }
    }
    logger.info(`[订单利润-发货导入]：时间:${date}`)
    await ordersGoodsSalesRepo.deleteByDate(date)
    for(let info in dataMap) {
        let values = info.split('_')
        data.push(
            values[0],
            date,
            orderMap[values[0]].shop_id,
            orderMap[values[0]].shop_name,
            values[1]?.length ? values[1] : null,
            values[2]?.length ? values[2] : null,
            values[3],
            dataMap[info].sale_amount,
            orderMap[values[0]].total_amount,
            orderMap[values[0]].total_amount > 0 ? 
                (dataMap[info].sale_amount / orderMap[values[0]].total_amount).toFixed(2) : 0,
            dataMap[info].cost_amount,
            dataMap[info].express_fee,
            dataMap[info].packing_fee,
            dataMap[info].bill_amount,
            dataMap[info].quantity
        )
        count += 1
    }
    result = await ordersGoodsSalesRepo.batchInsert(count, data)
    await updateOrderGoods(date)
    return result
}

const importErleiShuadan = async (rows, date) => {
    let data = [], count = 0, result = false,name='二类'
    let columns = rows[0].values,
    order_id_row = null,
    commission_row = null,
    sho_name_row = null,
    sale_amount_row = null,
    goods_id_row = null
    for(let i=0;i<=columns.length;i++){
        if(columns[i] == '线上单号'){
            order_id_row = i
        }else if(columns[i]=='佣金'){
            commission_row = i
        }else if(columns[i]=='ID'){
            goods_id_row = i
        }else if(columns[i]=='店铺'){
            sho_name_row = i
        }else if(columns[i]=='实付金额'){
            sale_amount_row = i
        }
    }
    for(let i = 1;i < rows.length;i++){
        let order_id=rows[i].getCell(order_id_row).value
        let q = await ordersGoodsSalesRepo.getByordercode(order_id)
        let shop_id = q?.length ? q[0].shop_id :null
        let sale_amount = q?.length ? q[0].sale_amount : rows[i].getCell(sale_amount_row).value
        let goods_id = q?.length ? q[0].goods_id : rows[i].getCell(goods_id_row).value
        let shop_name = q?.length ? q[0].shop_name : rows[i].getCell(sho_name_row).value
        data.push(
            order_id,
            rows[i].getCell(commission_row).value,
            shop_id,
            sale_amount,
            goods_id,
            shop_name,
            date,
            name
        )
        count += 1
    }
    await clickFarmingRepo.deleteByName(date,name)
    result = await clickFarmingRepo.InsertErlei(data,count)
    return result
}

const importXhsShuadan = async (rows, date) => {
    let data = [], count = 0, result = false,name='小红书返款'
    let columns = rows[0].values,
    order_id_row = null,
    sale_amount_row = null,
    goods_id_row = null
    for(let i=1;i<columns.length;i++){
        if(columns[i] == '订单ID'){
            order_id_row = i
        }else if(columns[i]=='金额'){
            sale_amount_row = i
        }else if(columns[i] == 'SPUID'){
            goods_id_row = i
        }
    }
    for(let i=1;i<rows.length;i++){
        let order_id=rows[i].getCell(order_id_row).value
        data.push(
            order_id,
            '15545775',
            rows[i].getCell(sale_amount_row).value,
            rows[i].getCell(goods_id_row).value,
            'pakchoice旗舰店（天猫）',
            date,
            '小红书返款'
        )
        count += 1
    }
    await clickFarmingRepo.deleteByName(date,name)
    result = await clickFarmingRepo.InsertXhs(data,count)
    return result
}

const updateOrderGoods = async (date) => {
    let result = await goodsSalesStats.updateLaborCost(date)
    logger.info(`[发货人工费刷新]：时间:${date}, ${result}`)
}

const importOrdersGoodsVerified = async (rows, date) => {
    let orderMap = {}, dataMap = {}, data = [], count = 0, result = false
    let columns = rows[0].values,
        shop_name_row = null, 
        shop_id_row = null, 
        order_code_row = null,
        sku_code_row = null,
        goods_id_row = null,
        sku_id_row = null,
        sale_amount_row = null,
        cost_amount_row = null,
        express_fee_row = null,
        packing_fee_row = null,
        bill_amount_row = null,
        quantity_row = null
    for (let i = 1; i <= columns.length; i++) {  
        if (columns[i] == '店铺') {shop_name_row = i; continue}      
        if (columns[i] == '店铺编码') {shop_id_row = i; continue}
        if (columns[i] == '线上单号') {order_code_row = i; continue}
        if (columns[i] == '商品编码') {sku_code_row = i; continue}
        if (columns[i] == '收入-商品销售金额(扣退)') {sale_amount_row = i; continue}
        if (columns[i] == '成本-商品销售成本(扣退)') {cost_amount_row = i; continue}
        if (columns[i] == '费用-快递费') {express_fee_row = i; continue}
        if (columns[i] == '费用-包材费') {packing_fee_row = i; continue}
        if (columns[i] == '费用-账单费用') {bill_amount_row = i; continue}
        if (columns[i] == '店铺商品编码') {sku_id_row = i; continue}
        if (columns[i] == '店铺款式编码') {goods_id_row = i; continue}
        if (columns[i] == '数量-销售数量(扣退)') {quantity_row = i; continue}
    }
    for (let i = 1; i < rows.length; i++) {
        let shop_id = typeof(rows[i].getCell(shop_id_row).value) == 'string' ? 
            rows[i].getCell(shop_id_row).value.trim() : 
            rows[i].getCell(shop_id_row).value
        let shop_name = typeof(rows[i].getCell(shop_name_row).value) == 'string' ? 
            rows[i].getCell(shop_name_row).value.trim() : 
            rows[i].getCell(shop_name_row).value
        let order_code = typeof(rows[i].getCell(order_code_row).value) == 'string' ? 
            rows[i].getCell(order_code_row).value.trim() : 
            rows[i].getCell(order_code_row).value
        let sku_code = typeof(rows[i].getCell(sku_code_row).value) == 'string' ? 
            rows[i].getCell(sku_code_row).value.trim() : 
            rows[i].getCell(sku_code_row).value
        let goods_id = typeof(rows[i].getCell(goods_id_row).value) == 'string' ? 
            rows[i].getCell(goods_id_row).value.trim() : 
            rows[i].getCell(goods_id_row).value
        let sku_id = typeof(rows[i].getCell(sku_id_row).value) == 'string' ? 
            rows[i].getCell(sku_id_row).value.trim() : 
            rows[i].getCell(sku_id_row).value
        let sale_amount = rows[i].getCell(sale_amount_row).value
        let cost_amount = rows[i].getCell(cost_amount_row).value
        let express_fee = rows[i].getCell(express_fee_row).value
        let packing_fee = rows[i].getCell(packing_fee_row).value
        let bill_amount = rows[i].getCell(bill_amount_row).value
        let quantity = rows[i].getCell(quantity_row).value
        if (sale_amount <= 0) continue
        if (orderMap[order_code] != undefined) { 
            orderMap[order_code].total_amount += parseFloat(sale_amount)
        } else {
            orderMap[order_code] = {
                shop_id,
                shop_name,
                total_amount: parseFloat(sale_amount)
            }
        }
        dataMap[`${order_code}_${goods_id || ''}_${sku_id || ''}_${sku_code}`] = {
            sale_amount: parseFloat(sale_amount),
            cost_amount: parseFloat(cost_amount),
            express_fee: parseFloat(express_fee),
            packing_fee: parseFloat(packing_fee),
            bill_amount: parseFloat(bill_amount),
            quantity: parseInt(quantity)
        }
    }
    logger.info(`[订单利润-核销导入]：时间:${date}`)
    await ordersGoodsVerifiedsRepo.deleteByDate(date)
    for(let info in dataMap) {
        let values = info.split('_')
        data.push(
            values[0],
            date,
            orderMap[values[0]].shop_id,
            orderMap[values[0]].shop_name,
            values[1]?.length ? values[1] : null,
            values[2]?.length ? values[2] : null,
            values[3],
            dataMap[info].sale_amount,
            orderMap[values[0]].total_amount,
            orderMap[values[0]].total_amount > 0 ? 
                (dataMap[info].sale_amount / orderMap[values[0]].total_amount).toFixed(2) : 0,
            dataMap[info].cost_amount,
            dataMap[info].express_fee,
            dataMap[info].packing_fee,
            dataMap[info].bill_amount,
            dataMap[info].quantity
        )
        count += 1
    }
    result = true
    result = await ordersGoodsVerifiedsRepo.batchInsert(count, data)
    await updateOrderGoodsVerified(date)
    return result
}

const updateOrderGoodsVerified = async (date) => {
    let result = await goodsVerifiedsStats.updateLaborCost(date)
    logger.info(`[核销人工费刷新]：时间:${date}, ${result}`)
}


const importTmallpromotioninfo = async (rows,shopname, paytime, day, date) => {
    let summaryMap = {};
    let columns = rows[0].values,
        promotion_name_row = null, 
        goods_id_row = null, 
        direct_amount_row = null,
        indirect_amount_row = null,
        trans_amount_row = null,
        trans_num_row = null,
        direct_num_row = null,
        indirect_num_row = null,
        trans_users_num_row = null,
        total_cart_num_row = null,
        exposure_row = null,
        click_num_row = null,
        pay_amount_row = null;
    for (let i = 1; i <= columns.length; i++) {  
        if (columns[i] == '场景名字') {promotion_name_row = i; continue}      
        if (columns[i] == '主体ID') {goods_id_row = i; continue}
        if (columns[i] == '直接成交金额') {direct_amount_row = i; continue}
        if (columns[i] == '间接成交金额') {indirect_amount_row = i; continue}
        if (columns[i] == '总成交金额') {trans_amount_row = i; continue}
        if (columns[i] == '总成交笔数') {trans_num_row = i; continue}
        if (columns[i] == '直接成交笔数') {direct_num_row = i; continue}
        if (columns[i] == '间接成交笔数') {indirect_num_row = i; continue}
        if (columns[i] == '成交人数') {trans_users_num_row = i; continue}
        if (columns[i] == '总购物车数') {total_cart_num_row = i; continue}
        if (columns[i] == '展现量') {exposure_row = i; continue}
        if (columns[i] == '点击量') {click_num_row = i; continue}
        if (columns[i] == '花费') {pay_amount_row = i; continue}
    }
    for(let i = 1; i < rows.length; i++) {
        const promotionName = rows[i].getCell(promotion_name_row).value
        const goodsId = rows[i].getCell(goods_id_row).value
        const directAmount = parseFloat(rows[i].getCell(direct_amount_row).value) || 0
        const indirectAmount = parseFloat(rows[i].getCell(indirect_amount_row).value) || 0
        const transAmount = parseFloat(rows[i].getCell(trans_amount_row).value) || 0
        const transNum = parseInt(rows[i].getCell(trans_num_row).value) || 0
        const directNum = parseInt(rows[i].getCell(direct_num_row).value) || 0
        const indirectNum = parseInt(rows[i].getCell(indirect_num_row).value) || 0
        const transUsersNum = parseInt(rows[i].getCell(trans_users_num_row).value) || 0
        const totalCartNum = parseInt(rows[i].getCell(total_cart_num_row).value) || 0
        const exposure = parseInt(rows[i].getCell(exposure_row).value) || 0
        const clickNum = parseInt(rows[i].getCell(click_num_row).value) || 0
        const payAmount = parseFloat(rows[i].getCell(pay_amount_row).value) || 0

        const key = `${goodsId}-${promotionName}`;
        if (!summaryMap[key]) {
            summaryMap[key] = {
                goodsId: goodsId,
                promotionName: promotionName,
                directAmount: 0,
                indirectAmount: 0,
                transAmount: 0,
                transNum: 0,
                directNum: 0,
                indirectNum: 0,
                transUsersNum: 0,
                totalCartNum: 0,
                exposure: 0,
                clickNum: 0,
                payAmount: 0,
            };
        }

        summaryMap[key].directAmount += directAmount
        summaryMap[key].indirectAmount += indirectAmount
        summaryMap[key].transAmount += transAmount
        summaryMap[key].transNum += transNum
        summaryMap[key].directNum += directNum
        summaryMap[key].indirectNum += indirectNum
        summaryMap[key].transUsersNum += transUsersNum
        summaryMap[key].totalCartNum += totalCartNum
        summaryMap[key].exposure += exposure
        summaryMap[key].clickNum += clickNum
        summaryMap[key].payAmount += payAmount
    }
    
    let summaryData = Object.values(summaryMap).map(item => ({
        promotionName: item.promotionName,
        goodsId: item.goodsId,
        directAmount: item.directAmount,
        indirectAmount: item.indirectAmount,
        transAmount: item.transAmount,
        transNum: item.transNum,
        directNum: item.directNum,
        indirectNum: item.indirectNum,
        transUsersNum: item.transUsersNum,
        totalCartNum: item.totalCartNum,
        exposure: item.exposure,
        clickNum: item.clickNum,
        payAmount: item.payAmount,
        period: day,
        payTime: paytime,
        date: date,
        ROI: item.payAmount > 0 ? Number((item.transAmount / item.payAmount).toFixed(2)) : 0,
        shopName: shopname
        
    }))

    let data = summaryData.map(item => ([
        item.promotionName,
        item.goodsId,
        item.directAmount,
        item.indirectAmount,
        item.transAmount,
        item.transNum,
        item.directNum,
        item.indirectNum,
        item.transUsersNum,
        item.totalCartNum,
        item.exposure,
        item.clickNum,
        item.payAmount,
        item.period,
        item.payTime,
        item.date,
        item.ROI ,
        item.shopName
    ]))
    await goodsPromotionRepo.deletetmallpromotion(shopname, paytime, day)
    let result = await goodsPromotionRepo.Inserttmallpromotion(data)
    return result
}

const getSaleData = async(lstart,lend,preStart,preEnd,value,name) => {
    let data = await goodsSaleInfoRepo.getSaleData(lstart,lend,preStart,preEnd,value,name)
    const result = []; // 初始化一个空数组用于存储转换后的数据
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const { name: divisionName, "本期销售额": currentSales, "上期销售额": previousSales,
             "本期销售数量": currentQuantity, "上期销售数量": previousQuantity, "销售额环比": salesIncrease,
              "销售数量环比": quantityIncrease } = item;

        // 创建事业部对象
        const division = {
            actionName: divisionName,
            actionCode: i,
            sum: 0, // 根据实际需求设置
            children: [
                {
                    actionName: "销售金额",
                    children: [
                        {
                            actionName: "本期",
                            actionCode: 0,
                            sum: parseFloat(currentSales),
                            children: []
                        },
                        {
                            actionName: "上期",
                            actionCode: 0,
                            sum: parseFloat(previousSales),
                            children: []
                        },
                        {
                            actionName: "环比",
                            actionCode: 0,
                            sum: salesIncrease,
                            children: []
                        }
                    ]
                },
                {
                    actionName: "销售数量",
                    actionCode: 0,
                    sum: 0,
                    children: [
                        {
                            actionName: "本期",
                            actionCode: 0,
                            sum: parseInt(currentQuantity),
                            children: []
                        },
                        {
                            actionName: "上期",
                            actionCode: 0,
                            sum: parseInt(previousQuantity),
                            children: []
                        },
                        {
                            actionName: "环比",
                            actionCode: 0,
                            sum: quantityIncrease,
                            children: []
                        }
                    ]
                }
            ]
        }

        // 将转换后的对象插入到 transformed 数组中
        result.push(division);
    }
    return result
}

const getInventoryData = async(day,day7,day30,day31) => {
    let result = [{current_inventory_cost:null,total_inventory_cost:null,stock_sale7:null
        ,stock_sale30:null,sell_through_rate:null,inventory_turnover:null,gross_margin7:null
        ,gross_margin30:null}]
    // 前一天00点库存
    let data1 = await goodsSaleInfoRepo.getInventoryData(day)
    // 前31天00点库存
    let data2 = await goodsSaleInfoRepo.getInventoryData(day31)
    // 7天日均销售成本,7天销售额
    let data3 = await goodsSaleInfoRepo.getInventoryCostData(day7,day,7)
    // 30天日均销售成本,30天销售额
    let data4 = await goodsSaleInfoRepo.getInventoryCostData(day30,day,30)
    // 30天销售数量
    let data5 = await goodsSaleInfoRepo.getInventorysaleqtyData(day30,day)
    result[0].current_inventory_cost=(data1[0].Current_inventory_cost/10000).toFixed(1)
    result[0].total_inventory_cost=(data1[0].total_inventory_cost/10000).toFixed(1)
    result[0].stock_sale7=(data1[0].Current_inventory_cost/data3[0].cost_avg).toFixed(0)
    result[0].stock_sale30=(data1[0].Current_inventory_cost/data4[0].cost_avg).toFixed(0)
    result[0].sell_through_rate=(data5[0].sale_qty/(parseInt(data1[0].Total_inventory)+data5[0].sale_qty)*100).toFixed(1)
    result[0].inventory_turnover=(data4[0].cost/(data1[0].Current_inventory_cost+data2[0].Current_inventory_cost)*100).toFixed(1)
    result[0].gross_margin7=((data3[0].sale-data3[0].cost)/data3[0].sale*100).toFixed(1)
    result[0].gross_margin30=((data4[0].sale-data4[0].cost)/data4[0].sale*100).toFixed(1)
    return result
}

const getDivisionSaleData = async(day,day7,day30,day31) => {
    let data = await goodsSaleInfoRepo.getDivisionSaleData()
    const groupedData = data.reduce((acc, item) => {
        if (!acc[item.division]) {
            acc[item.division] = [];
        }
        acc[item.division].push(item);
        return acc;
    }, {});
    const calculateChainRatio = (thisyear, lastyaer) => {
        if (lastyaer === 0 || lastyaer==null) return 0 // 避免除零错误
        return ((thisyear - lastyaer) / lastyaer) * 100
    }
    // 3. 添加周数据和汇总数据
    const result = Object.keys(groupedData).map(division => {
        const teamData = groupedData[division]
        const thisyear = teamData.filter(item => item.year === "2025")
        const lastyaer = teamData.filter(item => item.year === "2024")
        // 计算环比
        const chainRatioData = {
            year: '同比',
            division: division,
            one: calculateChainRatio(thisyear[0].one, lastyaer[0].one).toFixed(2) + "%",
            two: calculateChainRatio(thisyear[0].two, lastyaer[0].two).toFixed(2) + "%",
            three: calculateChainRatio(thisyear[0].three, lastyaer[0].three).toFixed(2) + "%",
            four: calculateChainRatio(thisyear[0].four, lastyaer[0].four).toFixed(2) + "%",
            five: calculateChainRatio(thisyear[0].five, lastyaer[0].five).toFixed(2) + "%",
            six: calculateChainRatio(thisyear[0].six, lastyaer[0].six).toFixed(2) + "%",
            seven: calculateChainRatio(thisyear[0].seven, lastyaer[0].seven).toFixed(2) + "%",
            eight: calculateChainRatio(thisyear[0].eight, lastyaer[0].eight).toFixed(2) + "%",
            nine: calculateChainRatio(thisyear[0].nine, lastyaer[0].nine).toFixed(2) + "%",
            ten: calculateChainRatio(thisyear[0].ten, lastyaer[0].ten).toFixed(2) + "%",
            eleven: calculateChainRatio(thisyear[0].eleven, lastyaer[0].eleven).toFixed(2) + "%",
            twelve: calculateChainRatio(thisyear[0].twelve, lastyaer[0].twelve).toFixed(2) + "%",
            sum: calculateChainRatio(thisyear[0].sum, lastyaer[0].sum).toFixed(2) + "%",
        }
        // 构建结果
        return [
            ...lastyaer,
            ...thisyear,
            chainRatioData
        ]
    }).flat()
    const sortOrder = {
        "刘海涛部":1,
        "陆瑶部":2,
        "王洪彬部":3,
        "累计":4
    }
    const sortedData = result.sort((a, b) => {
        const groupA = a.division
        const groupB = b.division
        return sortOrder[groupA] - sortOrder[groupB]
    })
    return sortedData
}

const getDivisionSaleQtyData = async(day,day7,day30,day31) => {
    let data = await goodsSaleInfoRepo.getDivisionSaleQtyData()
    const groupedData = data.reduce((acc, item) => {
        if (!acc[item.division]) {
            acc[item.division] = [];
        }
        acc[item.division].push(item);
        return acc;
    }, {});
    const calculateChainRatio = (thisyear, lastyaer) => {
        if (lastyaer === 0 || lastyaer==null) return 0 // 避免除零错误
        return ((thisyear - lastyaer) / lastyaer) * 100
    }
    // 3. 添加周数据和汇总数据
    const result = Object.keys(groupedData).map(division => {
        const teamData = groupedData[division]
        const thisyear = teamData.filter(item => item.year === "2025")
        const lastyaer = teamData.filter(item => item.year === "2024")
        // 计算环比
        const chainRatioData = {
            year: '同比',
            division: division,
            one: calculateChainRatio(thisyear[0].one, lastyaer[0].one).toFixed(2) + "%",
            two: calculateChainRatio(thisyear[0].two, lastyaer[0].two).toFixed(2) + "%",
            three: calculateChainRatio(thisyear[0].three, lastyaer[0].three).toFixed(2) + "%",
            four: calculateChainRatio(thisyear[0].four, lastyaer[0].four).toFixed(2) + "%",
            five: calculateChainRatio(thisyear[0].five, lastyaer[0].five).toFixed(2) + "%",
            six: calculateChainRatio(thisyear[0].six, lastyaer[0].six).toFixed(2) + "%",
            seven: calculateChainRatio(thisyear[0].seven, lastyaer[0].seven).toFixed(2) + "%",
            eight: calculateChainRatio(thisyear[0].eight, lastyaer[0].eight).toFixed(2) + "%",
            nine: calculateChainRatio(thisyear[0].nine, lastyaer[0].nine).toFixed(2) + "%",
            ten: calculateChainRatio(thisyear[0].ten, lastyaer[0].ten).toFixed(2) + "%",
            eleven: calculateChainRatio(thisyear[0].eleven, lastyaer[0].eleven).toFixed(2) + "%",
            twelve: calculateChainRatio(thisyear[0].twelve, lastyaer[0].twelve).toFixed(2) + "%",
            sum: calculateChainRatio(thisyear[0].sum, lastyaer[0].sum).toFixed(2) + "%",
        }
        // 构建结果
        return [
            ...lastyaer,
            ...thisyear,
            chainRatioData
        ]
    }).flat()
    const sortOrder = {
        "刘海涛部":1,
        "陆瑶部":2,
        "王洪彬部":3,
        "累计":4
    }
    const sortedData = result.sort((a, b) => {
        const groupA = a.division
        const groupB = b.division
        return sortOrder[groupA] - sortOrder[groupB]
    })
    return sortedData
}

const getProjectSaleData = async(day,day7,day30,day31) => {
    let data = await goodsSaleInfoRepo.getProjectSaleData()
    const groupedData = data.reduce((acc, item) => {
        if (!acc[item.project]) {
            acc[item.project] = [];
        }
        acc[item.project].push(item);
        return acc;
    }, {});
    
    const calculateChainRatio = (thisyear, lastyaer) => {
        if (lastyaer === 0 || lastyaer==null) return 0 // 避免除零错误
        return ((thisyear - lastyaer) / lastyaer) * 100
    }
    // 3. 添加周数据和汇总数据
    const result = Object.keys(groupedData).map(project => {
        const teamData = groupedData[project]
        const thisyear = teamData.filter(item => item.year === "2025")
        const lastyaer = teamData.filter(item => item.year === "2024")
        // 计算环比
        const chainRatioData = {
            year: '同比',
            project: project,
            one: calculateChainRatio(thisyear[0].one, lastyaer[0].one).toFixed(2) + "%",
            two: calculateChainRatio(thisyear[0].two, lastyaer[0].two).toFixed(2) + "%",
            three: calculateChainRatio(thisyear[0].three, lastyaer[0].three).toFixed(2) + "%",
            four: calculateChainRatio(thisyear[0].four, lastyaer[0].four).toFixed(2) + "%",
            five: calculateChainRatio(thisyear[0].five, lastyaer[0].five).toFixed(2) + "%",
            six: calculateChainRatio(thisyear[0].six, lastyaer[0].six).toFixed(2) + "%",
            seven: calculateChainRatio(thisyear[0].seven, lastyaer[0].seven).toFixed(2) + "%",
            eight: calculateChainRatio(thisyear[0].eight, lastyaer[0].eight).toFixed(2) + "%",
            nine: calculateChainRatio(thisyear[0].nine, lastyaer[0].nine).toFixed(2) + "%",
            ten: calculateChainRatio(thisyear[0].ten, lastyaer[0].ten).toFixed(2) + "%",
            eleven: calculateChainRatio(thisyear[0].eleven, lastyaer[0].eleven).toFixed(2) + "%",
            twelve: calculateChainRatio(thisyear[0].twelve, lastyaer[0].twelve).toFixed(2) + "%",
        }
        // 构建结果
        return [
            ...lastyaer,
            ...thisyear,
            chainRatioData
        ]
    }).flat()
    const sortOrder = {
        "天猫":1,
        "京东自营":2,
        "拼多多":3,
        "抖音":4,
        "淘工厂":5,
        "POP":6,
        "其他":7,
        "累计":8,
    }
    const sortedData = result.sort((a, b) => {
        const groupA = a.project
        const groupB = b.project
        return sortOrder[groupA] - sortOrder[groupB]
    })
    return sortedData
}

const getShopSaleData = async(day,day7,day30,day31) => {
    let data = await goodsSaleInfoRepo.getShopSaleData()
    const groupedData = data.reduce((acc, item) => {
        if (!acc[item.shop_name]) {
            acc[item.shop_name] = [];
        }
        acc[item.shop_name].push(item);
        return acc;
    }, {});
    const calculateChainRatio = (thisyear, lastyaer) => {
        if (lastyaer === 0 || lastyaer==null) return 0 // 避免除零错误
        return ((thisyear - lastyaer) / lastyaer) * 100
    }
    // 3. 添加周数据和汇总数据
    const result = Object.keys(groupedData).map(shop_name => {
        const teamData = groupedData[shop_name]
        const thisyear = teamData.filter(item => item.year === "2025")
        const lastyaer = teamData.filter(item => item.year === "2024")
        if (thisyear.length ===0){
            thisyear[0]={year: '2025',shop_name: shop_name,one: 0,two: 0,three: 0,four: 0,
                five: 0,six: 0,seven: 0,eight: 0,nine: 0,ten: 0,eleven: 0,twelve: 0,sum: 0}
        }
        if (lastyaer.length ===0){
            lastyaer[0]={year: '2024',shop_name: shop_name,one: 0,two: 0,three: 0,four: 0,
                five: 0,six: 0,seven: 0,eight: 0,nine: 0,ten: 0,eleven: 0,twelve: 0,sum: 0}
        }
        // 计算环比
        const chainRatioData = {
            shop_name: shop_name,
            year: '同比',
            one: calculateChainRatio(thisyear[0].one, lastyaer[0].one).toFixed(2) + "%",
            two: calculateChainRatio(thisyear[0].two, lastyaer[0].two).toFixed(2) + "%",
            three: calculateChainRatio(thisyear[0].three, lastyaer[0].three).toFixed(2) + "%",
            four: calculateChainRatio(thisyear[0].four, lastyaer[0].four).toFixed(2) + "%",
            five: calculateChainRatio(thisyear[0].five, lastyaer[0].five).toFixed(2) + "%",
            six: calculateChainRatio(thisyear[0].six, lastyaer[0].six).toFixed(2) + "%",
            seven: calculateChainRatio(thisyear[0].seven, lastyaer[0].seven).toFixed(2) + "%",
            eight: calculateChainRatio(thisyear[0].eight, lastyaer[0].eight).toFixed(2) + "%",
            nine: calculateChainRatio(thisyear[0].nine, lastyaer[0].nine).toFixed(2) + "%",
            ten: calculateChainRatio(thisyear[0].ten, lastyaer[0].ten).toFixed(2) + "%",
            eleven: calculateChainRatio(thisyear[0].eleven, lastyaer[0].eleven).toFixed(2) + "%",
            twelve: calculateChainRatio(thisyear[0].twelve, lastyaer[0].twelve).toFixed(2) + "%",
        }
        // 构建结果
        return [
            ...lastyaer,
            ...thisyear,
            chainRatioData
        ]
    }).flat()
    return result
}

const getProjectSaleQtyData = async(day,day7,day30,day31) => {
    let data = await goodsSaleInfoRepo.getProjectSaleQtyData()
    const groupedData = data.reduce((acc, item) => {
        if (!acc[item.project]) {
            acc[item.project] = [];
        }
        acc[item.project].push(item);
        return acc;
    }, {});
    
    const calculateChainRatio = (thisyear, lastyaer) => {
        if (lastyaer === 0 || lastyaer==null) return 0 // 避免除零错误
        return ((thisyear - lastyaer) / lastyaer) * 100
    }
    // 3. 添加周数据和汇总数据
    const result = Object.keys(groupedData).map(project => {
        const teamData = groupedData[project]
        const thisyear = teamData.filter(item => item.year === "2025")
        const lastyaer = teamData.filter(item => item.year === "2024")
        // 计算环比
        const chainRatioData = {
            year: '同比',
            project: project,
            one: calculateChainRatio(thisyear[0].one, lastyaer[0].one).toFixed(2) + "%",
            two: calculateChainRatio(thisyear[0].two, lastyaer[0].two).toFixed(2) + "%",
            three: calculateChainRatio(thisyear[0].three, lastyaer[0].three).toFixed(2) + "%",
            four: calculateChainRatio(thisyear[0].four, lastyaer[0].four).toFixed(2) + "%",
            five: calculateChainRatio(thisyear[0].five, lastyaer[0].five).toFixed(2) + "%",
            six: calculateChainRatio(thisyear[0].six, lastyaer[0].six).toFixed(2) + "%",
            seven: calculateChainRatio(thisyear[0].seven, lastyaer[0].seven).toFixed(2) + "%",
            eight: calculateChainRatio(thisyear[0].eight, lastyaer[0].eight).toFixed(2) + "%",
            nine: calculateChainRatio(thisyear[0].nine, lastyaer[0].nine).toFixed(2) + "%",
            ten: calculateChainRatio(thisyear[0].ten, lastyaer[0].ten).toFixed(2) + "%",
            eleven: calculateChainRatio(thisyear[0].eleven, lastyaer[0].eleven).toFixed(2) + "%",
            twelve: calculateChainRatio(thisyear[0].twelve, lastyaer[0].twelve).toFixed(2) + "%",
        }
        // 构建结果
        return [
            ...lastyaer,
            ...thisyear,
            chainRatioData
        ]
    }).flat()
    const sortOrder = {
        "天猫":1,
        "京东自营":2,
        "拼多多":3,
        "抖音":4,
        "淘工厂":5,
        "POP":6,
        "其他":7,
        "累计":8,
    }
    const sortedData = result.sort((a, b) => {
        const groupA = a.project
        const groupB = b.project
        return sortOrder[groupA] - sortOrder[groupB]
    })
    return sortedData
}

const getShopSaleQtyData = async(day,day7,day30,day31) => {
    let data = await goodsSaleInfoRepo.getShopSaleQtyData()
    const groupedData = data.reduce((acc, item) => {
        if (!acc[item.shop_name]) {
            acc[item.shop_name] = [];
        }
        acc[item.shop_name].push(item);
        return acc;
    }, {});
    
    const calculateChainRatio = (thisyear, lastyaer) => {
        if (lastyaer === 0 || lastyaer==null) return 0 // 避免除零错误
        return ((thisyear - lastyaer) / lastyaer) * 100
    }
    // 3. 添加周数据和汇总数据
    const result = Object.keys(groupedData).map(shop_name => {
        const teamData = groupedData[shop_name]
        const thisyear = teamData.filter(item => item.year === "2025")
        const lastyaer = teamData.filter(item => item.year === "2024")
        if (thisyear.length ===0){
            thisyear[0]={year: '2025',shop_name: shop_name,one: 0,two: 0,three: 0,four: 0,
                five: 0,six: 0,seven: 0,eight: 0,nine: 0,ten: 0,eleven: 0,twelve: 0,sum: 0}
        }
        if (lastyaer.length ===0){
            lastyaer[0]={year: '2024',shop_name: shop_name,one: 0,two: 0,three: 0,four: 0,
                five: 0,six: 0,seven: 0,eight: 0,nine: 0,ten: 0,eleven: 0,twelve: 0,sum: 0}
        }
        // 计算环比
        const chainRatioData = {
            shop_name: shop_name,
            year: '同比',
            one: calculateChainRatio(thisyear[0].one, lastyaer[0].one).toFixed(2) + "%",
            two: calculateChainRatio(thisyear[0].two, lastyaer[0].two).toFixed(2) + "%",
            three: calculateChainRatio(thisyear[0].three, lastyaer[0].three).toFixed(2) + "%",
            four: calculateChainRatio(thisyear[0].four, lastyaer[0].four).toFixed(2) + "%",
            five: calculateChainRatio(thisyear[0].five, lastyaer[0].five).toFixed(2) + "%",
            six: calculateChainRatio(thisyear[0].six, lastyaer[0].six).toFixed(2) + "%",
            seven: calculateChainRatio(thisyear[0].seven, lastyaer[0].seven).toFixed(2) + "%",
            eight: calculateChainRatio(thisyear[0].eight, lastyaer[0].eight).toFixed(2) + "%",
            nine: calculateChainRatio(thisyear[0].nine, lastyaer[0].nine).toFixed(2) + "%",
            ten: calculateChainRatio(thisyear[0].ten, lastyaer[0].ten).toFixed(2) + "%",
            eleven: calculateChainRatio(thisyear[0].eleven, lastyaer[0].eleven).toFixed(2) + "%",
            twelve: calculateChainRatio(thisyear[0].twelve, lastyaer[0].twelve).toFixed(2) + "%",
        }
        // 构建结果
        return [
            ...lastyaer,
            ...thisyear,
            chainRatioData
        ]
    }).flat()
    
    return result
}

const importGhyxpromotioninfo = async (rows, time, promotion_name) => {
    let count = 0, data = [], result = false,data1=[],
        result1 = false,data2=[],result2 = false
    let columns = rows[0].values,
        amount_row = null, 
        shop_name = '淘工厂国货严选店',
        sku_id = null,
        date = time
    console.log(columns)
    if (promotion_name == '充值加码消耗') {
        goods_id = '123456789'
    } else if(promotion_name == '预算消耗') {
        goods_id = '123456781'
    }
    for (let i = 1; i < columns.length; i++) {
        if (columns[i] == '金额') {
            amount_row = i
            continue
        }
    }
    for (let i = 1; i < rows.length; i++) {
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
        data1.push(
            goods_id,
            null,
            promotion_name,
            promotion_name,
            shop_name,
            17931539,
            promotion_name,
            date,
            0,0,0,0,0,
            0-amount,0,
            amount,0,
            amount,0,
            0,0,0,0,0
        )
        data2.push(
            goods_id,
            null,
            shop_name,
            date,
            0,0,0,0,0-amount,
            amount,0,amount,0,0,
            0,0,0
        )
        count += 1
    }
    logger.info(`[国货严选推广数据导入]：时间:${date}, 总计数量:${count}`)

    if (count > 0) {
        await goodsPromotionRepo.deleteByDate(date, promotion_name)
        result1 = await goodsPromotionRepo.batchInsert(count, data)
        await goodsSaleInfoRepo.deleteByDateId(date,goods_id)
        result = await goodsSaleInfoRepo.batchInsert(count,data1)
        await goodsSaleVerifiedRepo.deleteByDateId(date,goods_id)
        result2 = await goodsSaleVerifiedRepo.batchInsert(count,data2)
    }
    
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
    getGoodsInfoDetailTotal,
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
    importGoodsOrderVerifiedStat,
    createShopPromotionLog,
    importOrdersGoods,
    importOrdersGoodsVerified,
    batchInsertGoodsSales,
    batchInsertGoodsVerifieds,
    updateOrderGoods,
    updateOrderGoodsVerified,
    updateGoodsPayments,
    importJDZYcompositeInfo,
    getJDskuInfoDetail,
    getskuInfoDetailTotal,
    getReportInfo,
    batchInsertJDGoodsSales,
    batchInsertJDGoodsSalesStats,
    SalesupdateSalemonth,
    VerifiedsupdateSalemonth,
    importErleiShuadan,
    importXhsShuadan,
    getTMPromotion,
    getTMPromotioninfo,
    importTmallpromotioninfo,
    getSaleData,
    getInventoryData,
    getDivisionSaleData,
    getDivisionSaleQtyData,
    getProjectSaleData,
    getProjectSaleQtyData,
    getShopSaleData,
    getShopSaleQtyData,
    importGhyxpromotioninfo
}