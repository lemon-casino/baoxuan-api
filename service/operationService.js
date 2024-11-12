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
    let payment = 0, promotion_amount = 0, express_fee = 0, profit = 0, 
        invoice = 0, oriType, type = '', except = false
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
        payment += parseFloat(result[type].data[i].payment)
        promotion_amount += parseFloat(result[type].data[i].promotion_amount)
        express_fee += parseFloat(result[type].data[i].express_fee)
        profit += parseFloat(result[type].data[i].profit)
        if (type == typeList.project.value && result[type].data[i].name == projectNameList.coupang) continue
        invoice += parseFloat(result[type].data[i].invoice)
    }
    result.total.data[0].profit_rate = payment > 0 ? (profit / payment * 100).toFixed(2) : '0.00'
    result.total.column = JSON.parse(JSON.stringify(result[type].column))
    result.total.column[0].is_link = false
    result.total.data[0].payment = payment.toFixed(2)
    result.total.data[0].promotion_amount = promotion_amount.toFixed(2)
    result.total.data[0].express_fee = express_fee.toFixed(2)
    result.total.data[0].profit = profit.toFixed(2)
    result.total.data[0].invoice = invoice.toFixed(2)
    return result
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
            else users = await teamInfoRepo.getUserNameByTeamName(oriName)
            typeValue = typeList.user.value
            break
        default:
    }
    return {users, shops, typeValue}
}

const queryShopInfo = async (shops, result, type, start, end) => {
    let payment = 0, invoice = 0, info, promotion_amount = 0, 
        express_fee = 0, profit = 0, profit_rate = 0
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
        if (info?.length) {
            payment = parseFloat(info[0].sale_amount || 0).toFixed(2)
            promotion_amount = parseFloat(info[0].promotion_amount || 0).toFixed(2)
            express_fee = parseFloat(info[0].express_fee || 0).toFixed(2)
            profit = parseFloat(info[0].profit || 0).toFixed(2)
            profit_rate = parseFloat(info[0].profit_rate || 0).toFixed(2)
        }
        if (typeList[type].key < 3) {
            info = await settlementRepo.getAmount(start, end + ' 23:59:59', shopName[i].shop_name, except)
            if (info?.length) invoice = parseFloat(info[0].amount || 0).toFixed(2)
        }
        result[type].data.push({
            name: shopName[i].name,
            payment,
            promotion_amount,
            express_fee,
            profit,
            profit_rate,
            invoice
        })           
    }
    return result
}

const queryUserInfo = async (users, result, type, start, end) => {
    let payment = 0, invoice = 0, info, links, promotion_amount = 0, 
        express_fee = 0, profit = 0, profit_rate = 0
    let userName = [], j = -1
    for (let i = 0; i < users.length; i++) {
        if (i == 0 || users[i].name != users[i-1].name) {
            userName.push({
                nickname: users[i].nickname,
                name: users[i].name
            })
            j = j+1
        } else {
            userName[j].nickname = `${userName[j].nickname}","${users[i].nickname}`
        }
    }
    for (let i = 0; i < userName.length; i++) {
        links = await userOperationRepo.getLinkIdsByUserNames(userName[i].nickname)
        let linkIds = links.map((item) => item.goods_id).join('","')
        info = await goodsSaleInfoRepo.getPaymentByLinkIdsAndTime(linkIds, start, end)
        if (info?.length) {
            payment = parseFloat(info[0].sale_amount || 0).toFixed(2)
            promotion_amount = parseFloat(info[0].promotion_amount || 0).toFixed(2)
            express_fee = parseFloat(info[0].express_fee || 0).toFixed(2)
            profit = parseFloat(info[0].profit || 0).toFixed(2)
            profit_rate = parseFloat(info[0].profit_rate || 0).toFixed(2)
        }
        result[type].data.push({
            name: userName[i].name,
            payment,
            promotion_amount,
            express_fee,
            profit,
            profit_rate,
            invoice
        })        
    }
    return result
}

const getGoodsInfo = async (startDate, endDate, params, id) => {
    let result = {
        column: [
            {title: '链接ID', field_id: 'goods_id', search: true, type: 'input'},
            {title: '主销编码', field_id: 'sku_id', search: true, type: 'input'},
            {title: '店铺名称', field_id: 'shop_name', search: false},
            {title: '店铺编码', field_id: 'shop_id', search: true, type: 'input'},
            {title: '商品名称', field_id: 'goods_name', search: true, type: 'input'},
            {title: '发货金额', field_id: 'sale_amount', search: false},
            {title: '推广费', field_id: 'promotion_amount', search: false},
            {title: '运费', field_id: 'express_fee', search: false},
            {title: '利润', field_id: 'profit', search: false},
            {title: '利润率(%)', field_id: 'profit_rate', search: false},
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
    if (shopInfo?.length) shopNames = shopInfo.map((item) => item.shop_name).join('","')
    if (userInfo?.length) {
        userNames = userInfo.map((item) => item.nickname).join('","')
        let links = await userOperationRepo.getLinkIdsByUserNames(userNames)
        linkIds = links.map((item) => item.goods_id).join('","')
    }    
    params.search = JSON.parse(params.search)
    result.data = await goodsSaleInfoRepo.getData(startDate, endDate, params, shopNames, linkIds)
    return result
}

const importGoodsInfo = async (rows, time) => {
    let count = 0, data = [], result = false
    let columns = rows[0].values,
        goods_id_row = null, 
        sku_id_row = null, 
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
        express_fee_row = null;
    for (let i = 1; i <= columns.length; i++) {
        if (columns[i] == '店铺款式编码') {
            goods_id_row = i
            continue
        }
        if (columns[i] == '款式编码(参考)') {
            sku_id_row = i
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
    }
    let amount = 0, saveAmount = 0
    for (let i = 1; i < rows.length; i++) {
        amount += rows[i].getCell(sale_amount_row).value
        if (!rows[i].getCell(1).value) continue
        data.push(
            typeof(rows[i].getCell(goods_id_row).value) == 'string' ? 
                rows[i].getCell(goods_id_row).value.trim() : 
                rows[i].getCell(goods_id_row).value,
            typeof(rows[i].getCell(sku_id_row).value) == 'string' ? 
                rows[i].getCell(sku_id_row).value.trim() : 
                rows[i].getCell(sku_id_row).value,
            typeof(rows[i].getCell(shop_name_row).value) == 'string' ? 
                rows[i].getCell(shop_name_row).value.trim() : 
                rows[i].getCell(shop_name_row).value,
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
        )
        count += 1
        saveAmount += rows[i].getCell(sale_amount_row).value
    }
    logger.info(`[发货数据导入]：时间:${time}, 总计金额:${amount}, 存储金额:${saveAmount}`)
    if (count > 0) {
        await goodsSaleInfoRepo.deleteByDate(time)
        result = await goodsSaleInfoRepo.batchInsert(count, data)
    }
    return result
}

const getGoodsLineInfo = async (startDate, endDate, params, id) => {
    let result = {
        column: [
            {title: '链接ID', field_id: 'goods_id', search: true, type: 'input'},
            {title: '项目', field_id: 'project_name', search: true, type: 'input'},
            {title: '一级类目', field_id: 'first_category', search: true, type: 'input'},
            {title: '二级类目', field_id: 'second_category', search: true, type: 'input'},
            {title: '三级类目', field_id: 'level_3_category', search: true, type: 'input'},
            {title: '产品线简称', field_id: 'brief_product_line', search: true, type: 'input'},
            {title: '发货金额', field_id: 'sale_amount', search: false},
            {title: '推广费', field_id: 'promotion_amount', search: false},
            {title: '运费', field_id: 'express_fee', search: false},
            {title: '利润', field_id: 'profit', search: false},
            {title: '利润率(%)', field_id: 'profit_rate', search: false},
            {title: '主销编码', field_id: 'sku_id', search: true, type: 'input'},
            {title: '产品定义', field_id: 'product_definition', search: true, type: 'input'},
            {title: '库存结构', field_id: 'stock_structure', search: true, type: 'input'},
            {title: '产品等级', field_id: 'product_rank', search: true, type: 'input'},
            {title: '产品设计属性', field_id: 'product_design_attr', search: true, type: 'input'},
            {title: '季节', field_id: 'seasons', search: true, type: 'input'},
            {title: '品牌', field_id: 'brand', search: true, type: 'input'},
            {title: '销售目标', field_id: 'targets', search: false},
            {title: '开发负责人', field_id: 'exploit_director', search: true, type: 'input'},
            {title: '采购负责人', field_id: 'purchase_director', search: true, type: 'input'},
            {title: '产品线管理人', field_id: 'line_manager', search: true, type: 'input'},
            {title: '产品线运营人', field_id: 'operator', search: true, type: 'input'},
            {title: '上架时间', field_id: 'onsale_date', search: true, type: 'date'},
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

module.exports = {
    getDataStats,
    getGoodsInfo,
    importGoodsInfo,
    getGoodsLineInfo,
    getWorkStats
}