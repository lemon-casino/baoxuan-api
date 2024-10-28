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
    let payment = 0, invoice = 0, oriType, type = '', except = false
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
        if (type == typeList.project.value && result[type].data[i].name == projectNameList.coupang) continue
        invoice += parseFloat(result[type].data[i].invoice)
    }
    result.total.column = JSON.parse(JSON.stringify(result[type].column))
    result.total.column[0].is_link = false
    result.total.data[0].payment = payment.toFixed(2)
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
    let payment = 0, invoice = 0, info
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
        if (info?.length) payment = parseFloat(info[0].amount || 0).toFixed(2)
        if (typeList[type].key < 3) {
            info = await settlementRepo.getAmount(start, end + ' 23:59:59', shopName[i].shop_name, except)
            if (info?.length) invoice = parseFloat(info[0].amount || 0).toFixed(2)
        }
        result[type].data.push({
            name: shopName[i].name,
            payment,
            invoice
        })           
    }
    return result
}

const queryUserInfo = async (users, result, type, start, end) => {
    let payment = 0, invoice = 0, info, links
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
        if (info?.length) payment = parseFloat(info[0].amount || 0).toFixed(2)
        result[type].data.push({
            name: userName[i].name,
            payment,
            invoice
        })        
    }
    return result
}

const getGoodsInfo = async (startDate, endDate, params, id) => {
    let result = {
        column: [
            {title: '链接ID', field_id: 'link_id'},
            {title: '主销编码', field_id: 'sku_id'},
            {title: '店铺名称', field_id: 'shop_name'},
            {title: '店铺编码', field_id: 'shop_id'},
            {title: '商品名称', field_id: 'goods_name'},
            {title: '发货金额', field_id: 'amount'},
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
    result.data = await goodsSaleInfoRepo.getData(startDate, endDate, params, shopNames, linkIds)
    return result
}

const importGoodsInfo = async (count, data) => {
    let result = await goodsSaleInfoRepo.batchInsert(count, data)
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
            {title: '产品线运营人', field_id: 'line_director'},
            {title: '上架时间', field_id: 'shelf_time'},
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
    if (userInfo?.length) userNames = userInfo.map((item) => item.nickname).join('","')
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