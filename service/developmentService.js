const newFormsRepo = require('../repository/newFormsRepo')
const userRepo = require('../repository/userRepo')
const producerPlanRepo = require('../repository/producerPlanRepo')
const userOperationRepo = require('../repository/operation/userOperationRepo')
const { redisKeys } = require('../const/redisConst')
const redisUtil = require("../utils/redisUtil")
const crypto = require('crypto')
const { developmentItem, developmentType, developmentWorkType, developmentWorkProblem } = require('../const/newFormConst')
const moment = require('moment')
const developmentService = {}
const { createProcess } =  require('./dingDingService')
const { productManageFlowUUid } = require("../const/operationConst")
const goodsCategoryRepo = require('@/repository/goodsCategoryRepo')
const projectService = require('./development/projectService')
const selfService = require('./development/selfService')
const ipService = require('./development/ipService')
const supplierService = require('./development/supplierService')
const operatorService = require('./development/operatorService')
const systemUsersRepo = require('@/repository/bpm/systemUsersRepo')
const commonReq = require('@/core/bpmReq/commonReq')
const actReProcdefRepo = require('@/repository/bpm/actReProcdefRepo')
const defaultConst = require('../const/development/defaultConst')
const goodsSkuRepo = require('@/repository/jst/goodsSkuRepo')
const actHiVarinstRepo = require('@/repository/bpm/actHiVarinstRepo')
const { ObjectInputStream  } = require('java-object-serialization')
const goodsSaleVerifiedRepo = require('@/repository/operation/goodsSaleVerifiedRepo')
const actHiProcinstRepo = require('@/repository/bpm/actHiProcinstRepo')

developmentService.getDataStats = async (type, start, end, month, timeType, project, process) => {
    let result = []
    // let info = `${type}-${start}-${end}-${month}`
    // let key = crypto.createHash('md5').update(info).digest('hex')
    // key = `${redisKeys.development}:${key}`
    // result = await redisUtil.get(key)
    // if (result) return JSON.parse(result)
    switch(type) {
        case '1':
            result = await developmentService.getFlows(start, end)
            break
        case '2': 
            result = await developmentService.getProduct(start, end, timeType, project, process)
            break
        case '3':
            result = await developmentService.getWorks(start, end)
            break
        case '4':
            result = await developmentService.getProblems(start, end)
            break
        case '5':
            result = await developmentService.getPlans(month)
            break
        default:

    }
    // redisUtil.set(key, JSON.stringify(result), 3600)
    return result
}

developmentService.getWorkDetail = async (start, end, id) => {
    let users = await userRepo.getUserByDeptName('产品开发部')
    let userNames = '', result = [], data = []
    users = users.filter((item) => item['nickname'] != '崔竹')
    userNames = users.map((item) => item['nickname']).join('","')
    userNames = `${userNames}","孙旭东`
    let status = ''
    if (id == '1') status = '1,3,4'
    else status = id
    data = await newFormsRepo.getDevelopmentDetail(userNames, start, end, status)
    if (data?.length) {
        let defaultTmp = {status: '', ch: {}}
        for (let i in developmentType) {
            defaultTmp.ch[developmentType[i]] = []
            defaultTmp[developmentType[i]] = 0
        }
        for (let i = 0; i < data.length; i++) {
            if (i == 0 || (data[i].operator_name != data[i-1].operator_name)) {
                let tmp = JSON.parse(JSON.stringify(defaultTmp))
                tmp.parent_id = id
                tmp[developmentType[data[i].type]] = data[i].count
                tmp['id'] = id + result.length.toString()
                tmp['status'] = data[i].operator_name
                tmp['parent_id'] = id
                tmp['hasChild'] = false
                result.push(tmp)
            } else if (data[i].status < 3) {
                result[result.length - 1][developmentType[data[i].type]] = data[i].count
            } else if (data[i].status == 3 && data[i].count > 0) {
                result[result.length - 1].ch[developmentType[data[i].type]].push({
                    selected: data[i].count,
                    rejected: 0
                })
            } else if (data[i].count > 0) {
                if (result[result.length - 1].ch[developmentType[data[i].type]]?.length)
                    result[result.length - 1].ch[developmentType[data[i].type]][0]['rejected'] = data[i].count
                else
                    result[result.length - 1].ch[developmentType[data[i].type]].push({
                        rejected: data[i].count,
                        selected: 0
                    })
            }
        }
    }
    return result
}

developmentService.getProjectData = async (limit, offset, params, type, user_id) => {
    let columns = [], data = [], total = 0, result
    if (params) {
        params = JSON.parse(params)
    } else {
        params = []
    }
    switch (type) {
        case defaultConst.SELF: 
            columns = await selfService.getColumn()
            result = await selfService.getData(limit, offset, params, user_id)
            break;
        case defaultConst.IP: 
            columns = await ipService.getColumn()
            result = await ipService.getData(limit, offset, params, user_id)
            break;
        case defaultConst.SUPPLIER: 
            columns = await supplierService.getColumn()
            result = await supplierService.getData(limit, offset, params, user_id)
            break;
        case defaultConst.OPERATOR: 
            columns = await operatorService.getColumn()
            result = await operatorService.getData(limit, offset, params, user_id)
            break;
        default:
            columns = await projectService.getColumn()
            result = await projectService.getData(limit, offset, params, user_id) 
    }
    data = result.data
    total = result.total
    return {data, columns, total}
}

developmentService.createProjectData = async (user_id, params, type) => {
    let result = false
    switch (type) {
        case defaultConst.SELF: 
            result = await selfService.create(user_id, params)
            break;
        case defaultConst.IP: 
            result = await ipService.create(user_id, params)
            break;
        case defaultConst.SUPPLIER: 
            result = await supplierService.create(user_id, params)
            break;
        case defaultConst.OPERATOR: 
            result = await operatorService.create(user_id, params)
            break;
        default:
            result = await projectService.create(user_id, params) 
    }
    return result
}

developmentService.updateProjectData = async (user_id, id, params, type) => {
    let result = false
    switch (type) {
        case defaultConst.SELF: 
            result = await selfService.update(user_id, id, params)
            break;
        case defaultConst.IP: 
            result = await ipService.update(user_id, id, params)
            break;
        case defaultConst.SUPPLIER: 
            result = await supplierService.update(user_id, id, params)
            break;
        case defaultConst.OPERATOR: 
            result = await operatorService.update(user_id, id, params)
            break;
        default:
            result = await projectService.update(user_id, id, params) 
    }
    return result
}

developmentService.start = async (type, id, user_id) => {
    let mobile = await userRepo.getMobileByUserId(user_id)
    if (!mobile) return false
    let token = await systemUsersRepo.getRefreshToken(mobile)
    if (!token?.length) return false
    let refresh_token = token[0].refresh_token
    let goods = {}, updateFunc, updateStatusFunc, processDefinitionId
    switch (type) {
        case defaultConst.SELF: 
            goods = await selfService.getById(id)
            goods['category'] = []
            if (goods.first_category) goods['category'].push(goods.first_category)
            if (goods.second_category) goods['category'].push(goods.second_category)
            if (goods.third_category) goods['category'].push(goods.third_category)
            goods.product_info = goods.product_info?.length ? goods.product_info.split(',') : null
            goods.analysis_link = goods.analysis_link?.length ? goods.analysis_link.split(',') : null
            goods.product_img = goods.product_img?.length ? goods.product_img.split(',') : null
            updateFunc = selfService.updateLink
            updateStatusFunc = selfService.updateLinkStatus
            processDefinitionId = await actReProcdefRepo.getProcessDefinitionId(
                defaultConst.self_title,
                defaultConst.self_key
            )
            break;
        case defaultConst.IP: 
            goods = await ipService.getById(id)
            goods['category'] = []
            if (goods.first_category) goods['category'].push(goods.first_category)
            if (goods.second_category) goods['category'].push(goods.second_category)
            if (goods.third_category) goods['category'].push(goods.third_category)
            goods.product_info = goods.product_info?.length ? goods.product_info.split(',') : null
            goods.analysis_link = goods.analysis_link?.length ? goods.analysis_link.split(',') : null
            goods.product_img = goods.product_img?.length ? goods.product_img.split(',') : null
            updateFunc = ipService.updateLink
            updateStatusFunc = ipService.updateLinkStatus
            processDefinitionId = await actReProcdefRepo.getProcessDefinitionId(
                defaultConst.ip_title,
                defaultConst.ip_key
            )
            break;
        case defaultConst.SUPPLIER: 
            goods = await supplierService.getById(id)
            goods['category'] = []
            if (goods.first_category) goods['category'].push(goods.first_category)
            if (goods.second_category) goods['category'].push(goods.second_category)
            if (goods.third_category) goods['category'].push(goods.third_category)
            goods.product_info = goods.product_info?.length ? goods.product_info.split(',') : null
            goods.analysis_link = goods.analysis_link?.length ? goods.analysis_link.split(',') : null
            updateFunc = supplierService.updateLink
            updateStatusFunc = supplierService.updateLinkStatus
            processDefinitionId = await actReProcdefRepo.getProcessDefinitionId(
                defaultConst.supplier_title,
                defaultConst.supplier_key
            )
            break;
        case defaultConst.OPERATOR: 
            goods = await operatorService.getById(id)
            goods['category'] = []
            if (goods.first_category) goods['category'].push(goods.first_category)
            if (goods.second_category) goods['category'].push(goods.second_category)
            if (goods.third_category) goods['category'].push(goods.third_category)
            goods.analysis_link = goods.analysis_link?.length ? goods.analysis_link.split(',') : null
            goods['user_id'] = refresh_token
            updateFunc = operatorService.updateLink
            updateStatusFunc = operatorService.updateLinkStatus
            processDefinitionId = await actReProcdefRepo.getProcessDefinitionId(
                defaultConst.operator_title,
                defaultConst.operator_key
            )
            break;
        default:
            goods = await projectService.getById(id)
            goods['category'] = []
            if (goods.first_category) goods['category'].push(goods.first_category)
            if (goods.second_category) goods['category'].push(goods.second_category)
            if (goods.third_category) goods['category'].push(goods.third_category)
            goods.product_info = goods.product_info?.length ? goods.product_info.split(',') : null
            goods.analysis_link = goods.analysis_link?.length ? goods.analysis_link.split(',') : null
            goods.product_img = goods.product_img?.length ? goods.product_img.split(',') : null
            updateFunc = projectService.updateLink
            updateStatusFunc = projectService.updateLinkStatus
            processDefinitionId = await actReProcdefRepo.getProcessDefinitionId(
                defaultConst.project_title,
                defaultConst.project_key
            )
    }
    if (!goods) return false
    if (!processDefinitionId) return false
    let result = await commonReq.createProcessInstance(refresh_token, processDefinitionId, type, goods)
    if (result) {
        await updateFunc(user_id, id, result)
        await updateStatusFunc(user_id, id, null, defaultConst.link_status.RUNNING)
    }
    return result
}

developmentService.getCategoryList = async (parent_id) => {
    let result = await goodsCategoryRepo.get(parent_id)
    return result;
}

developmentService.getFlows = async (start, end) => {
    let result = [], data = []
    data = await newFormsRepo.getDevelopmentType(start, end)
    if (data?.length) {
        let defaultTmp = {status: '', ch: {}}
        for (let i in developmentType) {
            defaultTmp.ch[developmentType[i]] = []
            defaultTmp[developmentType[i]] = 0
        }
        for (let i = 0; i < data.length; i++) {
            if (i == 0 || (data[i].status != data[i-1].status && data[i].status < 3)) {
                let tmp = JSON.parse(JSON.stringify(defaultTmp))
                tmp.status = developmentItem[data[i].status].name
                tmp[developmentType[data[i].type]] = data[i].count
                tmp['id'] = result.length.toString()
                tmp['parent_id'] = null
                tmp['hasChild'] = true
                result.push(tmp)
            } else if (data[i].status < 3) {
                result[result.length - 1][developmentType[data[i].type]] = data[i].count
            } else if (data[i].status == 3 && data[i].count > 0) {
                result[1].ch[developmentType[data[i].type]].push({
                    selected: data[i].count,
                    rejected: 0
                })
            } else if (data[i].count > 0) {
                if (result[1].ch[developmentType[data[i].type]]?.length)
                    result[1].ch[developmentType[data[i].type]][0]['rejected'] = data[i].count
                else
                    result[1].ch[developmentType[data[i].type]].push({
                        rejected: data[i].count,
                        selected: 0
                    })
            }
        }
    }
    return result
}

developmentService.getWorks = async (start, end) => {
    let users = await userRepo.getUserByDeptName('产品开发部')
    let userNames = '', userIds = '', userInfo = {}, userMap = {}, result = []
    for (let i = 0; i < users.length; i++) {
        if (users[i].nickname != '崔竹') {
            userNames = `${userNames}"${users[i].nickname}",`
            userIds = `${userIds}"${users[i].dingding_user_id}",`
            userInfo[users[i].dingding_user_id] = users[i].nickname
            let tmp = {name: users[i].nickname}
            for (let item in developmentWorkType) {
                tmp[developmentWorkType[item]] = 0
            }
            userMap[users[i].nickname] = result.length
            result.push(tmp)
        }
    }
    if (userNames?.length) userNames = userNames.substring(0, userNames.length - 1)
    else return result
    userIds = userIds.substring(0, userIds.length - 1)
    let data = await newFormsRepo.getDevelopmentWork(userNames, userIds, start, end)
    for (let i = 0; i < data.length; i++) {
        let name = data[i].name == '' ? userInfo[data[i].id] : data[i].name
        result[userMap[name]][developmentWorkType[data[i].type]] = parseInt(data[i].count)
    }
    return result
}

developmentService.getProblems = async (start, end) => {
    let users = await userRepo.getUserByDeptName('产品开发部')
    let userNames = '', userIds = '', userInfo = {}, userMap = {}, result = []
    for (let i = 0; i < users.length; i++) {
        if (users[i].nickname != '崔竹') {
            userNames = `${userNames}"${users[i].nickname}",`
            userIds = `${userIds}"${users[i].dingding_user_id}",`
            userInfo[users[i].dingding_user_id] = users[i].nickname
            let tmp = {name: users[i].nickname, children: {}}
            for (let item in developmentWorkProblem) {
                tmp[developmentWorkProblem[item]] = 0
                tmp.children[[developmentWorkProblem[item]]] = []
            }
            userMap[users[i].nickname] = result.length
            result.push(tmp)
        }
    }
    if (userNames?.length) userNames = userNames.substring(0, userNames.length - 1)
    else return result
    userIds = userIds.substring(0, userIds.length - 1)
    let {data, children} = await newFormsRepo.getDevelopmentProblem(userNames, userIds, start, end)
    for (let i = 0; i < data.length; i++) {
        let name = data[i].name == '' ? userInfo[data[i].id] : data[i].name
        result[userMap[name]][developmentWorkProblem[data[i].type]] = parseInt(data[i].count)
        for (let j = 0; j < children?.length; j++) {
            if (data[i].type == 1 && data[i].name == children[j].name) {
                result[userMap[name]].children['nexts'].push({
                    title: children[j].title,
                    name: children[j].show_name,
                    count: children[j].count,
                    time: children[j].hours
                })
            }            
        }
    }
    return result
}

developmentService.getPlans = async (month) => {
    let months = ''
    for (let i = 0; i < month.length; i++) {
        let time = moment(month[i]).format('YYYY-MM')
        months = `${months}"${time}",`
    }
    months = months.substring(0, months.length - 1)
    let users = await userRepo.getUserByDeptName('产品开发部')
    let userIds = '', userMap = {}, result = [], resultMap = {}
    for (let i = 0; i < users.length; i++) {
        if (users[i].nickname != '崔竹') {
            userIds = `${userIds}"${users[i].dingding_user_id}",`
            userMap[users[i].dingding_user_id] = users[i].nickname
            resultMap[users[i].nickname] = result.length
            result.push({
                nickname: users[i].nickname,
                months: months.replace(/\"/g, ''),
                plan: 0,
                value: 0,
                children: []
            })
        }
    }
    if (userIds?.length) userIds = userIds.substring(0, userIds.length - 1)
    else return result
    let plans = await producerPlanRepo.getByMonth(months)
    let data = await newFormsRepo.getPlanStats(userIds, months)
    for (let i = 0; i < plans.length; i++) {
        result[resultMap[plans[i].nickname]].plan += parseInt(plans[i].plan_max)
        let flag = 1
        for (let j = 0; j < data.length; j++) {
            if (data[j].categories == plans[i].categories &&
                userMap[data[j].id] == plans[i].nickname &&
                data[j].month == plans[i].months
            ) {
                result[resultMap[plans[i].nickname]].value += parseInt(data[j].count)
                result[resultMap[plans[i].nickname]].children.push({
                    months: data[j].month,
                    categories: data[j].categories,
                    plan: plans[i].plan_max,
                    value: data[j].count
                })
                flag = 0
                break
            }
        }
        if (flag) {
            result[resultMap[plans[i].nickname]].children.push({
                months: plans[i].months,
                categories: plans[i].categories,
                plan: plans[i].plan_max,
                value: 0
            })
        }
    }
    for (let i = 0; i < data.length; i++) {
        result[resultMap[userMap[data[i].id]]].value += parseInt(data[i].count)
        result[resultMap[userMap[data[i].id]]].children.push({
            months: data[i].month,
            categories: data[i].categories,
            plan: 0,
            value: data[i].count
        })
    }
    for (let i = 0; i < result.length; i++) {
        result[i].children.sort((a, b) => moment(b.months).valueOf() - moment(a.months).valueOf())
    }
    return result
}

developmentService.getSaleStats = async (type, month, limit, offset, sort) => {
    let result = {
        column: [
            {title: '产品线简称', field_id: 'brief_product_line', type: 'input', show: true},
            {
                title: type == 'verified' ? '核销金额' : '发货金额', 
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
                title: '包材费', field_id: 'packing_fee', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '人工费', field_id: 'labor_cost', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '利润额', field_id: 'profit', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '利润率(%)', field_id: 'profit_rate', type: 'number', 
                min: 0, max: 15, show: true
            },
            {title: '操作', field_id: 'operate', show: true}
        ],
        data: {}
    }
    const {data, total} = await userOperationRepo.getProductLine(type, month, limit, offset, sort)
    result.data = data
    result.total = total
    return result
}

developmentService.getSaleStatsPoject = async (type, month, brief_product_line) => {
    let result = await userOperationRepo.getProductLineProject(type, month, brief_product_line)
    return result
}

developmentService.getSaleStatsDetail = async (type, month, brief_product_line) => {
    let result = {
        column: [
            {title: '产品线简称', field_id: 'brief_product_line', type: 'input', show: true},
            {
                title: type == 'verified' ? '核销金额' : '发货金额', 
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
                title: '包材费', field_id: 'packing_fee', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '人工费', field_id: 'labor_cost', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '利润额', field_id: 'profit', type: 'number', 
                min: 0, max: 100, show: true
            }, {
                title: '利润率(%)', field_id: 'profit_rate', type: 'number', 
                min: 0, max: 15, show: true
            },
            {title: '主销编码', field_id: 'sku_id', type: 'input', show: true},
            {title: '项目', field_id: 'project_name', type: 'input', show: true, default: null},
            {title: '链接ID', field_id: 'goods_id', type: 'input', show: true, default: null},
            {title: '一级类目', field_id: 'first_category', type: 'input', show: true, default: null},
            {title: '二级类目', field_id: 'second_category', type: 'input', show: true, default: null},
            {title: '三级类目', field_id: 'level_3_category', type: 'input', show: true, default: null},
            {title: '销售目标', field_id: 'product_rank', type: 'input', show: true, default: null},
            {title: '产品定义', field_id: 'product_definition', type: 'input', show: true, default: null},
            {title: '库存结构', field_id: 'stock_structure', type: 'input', show: true, default: null},
            {title: '产品等级', field_id: 'product_rank', type: 'input', show: true, default: null},
            {title: '产品设计属性', field_id: 'product_design_attr', type: 'input', show: true, default: null},
            {title: '季节', field_id: 'seasons', type: 'input', show: true, default: null},
            {title: '品牌', field_id: 'brand', type: 'input', show: true, default: null},
            {title: '开发负责人', field_id: 'exploit_director', type: 'input', show: true, default: null},
            {title: '采购负责人', field_id: 'purchase_director', type: 'input', show: true, default: null},
            {title: '产品线管理人', field_id: 'line_manager', type: 'input', show: true, default: null},
            {title: '运营负责人', field_id: 'operator', type: 'input', show: true, default: null},
            {title: '产品线负责人', field_id: 'line_director', type: 'input', show: true, default: null},
            {title: '上架时间', field_id: 'onsale_date', type: 'input', show: true, default: null},
        ],
        data: {}
    }
    result.data = await userOperationRepo.getProductLineDetail(type, month, brief_product_line)
    return result
}


developmentService.getProduct = async (start, end, timeType, project, process) => {
    let result = [], project_info = [], project_info1 = [], userMap = {}, resultMap = {}
    let sku_info = await goodsSkuRepo.getProcessInfoByTime(start, end, project)
    switch (process) {
        case '1': //市场分析推品
            project_info = await actHiVarinstRepo.getProjectSkuInfo(end)
            for (let i = 0; i < project_info.length; i++) {
                if (!userMap[project_info[i].username]) {
                    userMap[project_info[i].username] = []
                }
                if (project_info[i].content) {
                    let content = new ObjectInputStream(project_info[i].content)
                    content = content.readObject()
                    content?.annotations.splice(0, 1)
                    content = content?.annotations
                    project_info[i].content = []
                    for (let j = 0; j < content.length; j++) {
                        content[j].annotations.splice(0, 1)
                        userMap[project_info[i].username] = userMap[project_info[i].username].concat(content[j].annotations)
                    }
                }
            }
            break
        case '2': //自研推品
            project_info = await actHiVarinstRepo.getSelfSkuInfo(end)
            for (let i = 0; i < project_info.length; i++) {
                if (!userMap[project_info[i].username]) {
                    userMap[project_info[i].username] = []
                }
                if (project_info[i].content) {
                    let content = new ObjectInputStream(project_info[i].content)
                    content = content.readObject()
                    content?.annotations.splice(0, 1)
                    content = content?.annotations
                    project_info[i].content = []
                    for (let j = 0; j < content.length; j++) {
                        content[j].annotations.splice(0, 1)
                        userMap[project_info[i].username] = userMap[project_info[i].username].concat(content[j].annotations)
                    }
                }
            }
            project_info1 = await newFormsRepo.getDevelopmentOtherInfo(5, end)
            for (let i = 0; i < project_info1.length; i++) {
                let director = ''
                if (project_info1[i].director) {
                    director = project_info1[i].director
                } else {
                    director = await userRepo.getUserByDingdingUserId(project_info1[i].creator)
                    director = director?.length ? director[0].nickname : null
                }
                if (!userMap[director]) {
                    userMap[director] = []
                }
                userMap[director].push(project_info1[i].content)
            }
            break
        case '3': //IP推品
            project_info = await actHiVarinstRepo.getIpSkuInfo(end)
            for (let i = 0; i < project_info.length; i++) {
                if (!userMap[project_info[i].username]) {
                    userMap[project_info[i].username] = []
                }
                if (project_info[i].content) {
                    let content = new ObjectInputStream(project_info[i].content)
                    content = content.readObject()
                    content?.annotations.splice(0, 1)
                    content = content?.annotations
                    project_info[i].content = []
                    for (let j = 0; j < content.length; j++) {
                        content[j].annotations.splice(0, 1)
                        userMap[project_info[i].username] = userMap[project_info[i].username].concat(content[j].annotations)
                    }
                }
            }
            project_info1 = await newFormsRepo.getDevelopmentOtherInfo(4, end)
            for (let i = 0; i < project_info1.length; i++) {
                let director = ''
                if (project_info1[i].director) {
                    director = project_info1[i].director
                } else {
                    director = await userRepo.getUserByDingdingUserId(project_info1[i].creator)
                    director = director?.length ? director[0].nickname : null
                }
                if (!userMap[director]) {
                    userMap[director] = []
                }
                userMap[director].push(project_info1[i].content)
            }
            break
        case '4': //反推推品
            project_info = await actHiVarinstRepo.getOperatorSkuInfo(end)
            for (let i = 0; i < project_info.length; i++) {
                if (!userMap[project_info[i].username]) {
                    userMap[project_info[i].username] = []
                }
                if (project_info[i].content) {
                    let content = new ObjectInputStream(project_info[i].content)
                    content = content.readObject()
                    content?.annotations.splice(0, 1)
                    content = content?.annotations
                    project_info[i].content = []
                    for (let j = 0; j < content.length; j++) {
                        content[j].annotations.splice(0, 1)
                        userMap[project_info[i].username] = userMap[project_info[i].username].concat(content[j].annotations)
                    }
                }
            }
            project_info1 = await newFormsRepo.getDevelopmentOtherInfo(2, end)
            for (let i = 0; i < project_info1.length; i++) {
                let director = ''
                if (project_info1[i].director) {
                    director = project_info1[i].director
                } else {
                    director = await userRepo.getUserByDingdingUserId(project_info1[i].creator)
                    director = director?.length ? director[0].nickname : null
                }
                if (!userMap[director]) {
                    userMap[director] = []
                }
                userMap[director].push(project_info1[i].content)
            }
            break
        case '5': //供应商推品
            project_info = await actHiVarinstRepo.getSupplierSkuInfo(end)
            for (let i = 0; i < project_info.length; i++) {
                if (!userMap[project_info[i].username]) {
                    userMap[project_info[i].username] = []
                }
                if (project_info[i].content) {
                    let content = new ObjectInputStream(project_info[i].content)
                    content = content.readObject()
                    content?.annotations.splice(0, 1)
                    content = content?.annotations
                    for (let j = 0; j < content.length; j++) {
                        content[j].annotations.splice(0, 1)
                        userMap[project_info[i].username] = userMap[project_info[i].username].concat(content[j].annotations)
                    }
                }
            }
            project_info1 = await newFormsRepo.getDevelopmentOtherInfo(1, end)
            for (let i = 0; i < project_info1.length; i++) {
                let director = ''
                if (project_info1[i].director) {
                    director = project_info1[i].director
                } else {
                    director = await userRepo.getUserByDingdingUserId(project_info1[i].creator)
                    director = director?.length ? director[0].nickname : null
                }
                if (!userMap[director]) {
                    userMap[director] = []
                }
                userMap[director].push(project_info1[i].content)
            }
            break
        default:
            return result
    }
    let goodsMap = {}
    for (let i = 0; i < sku_info?.length; i++) {
        for (let index in userMap) {
            if (userMap[index].includes(sku_info[i].sys_sku_id)) {
                sku_info[i]['director'] = index
                break
            }
        }
        if (!sku_info[i]['director']) {
            sku_info.splice(i, 1)
            i--
            continue
        }
        if (timeType == '2') {
            let info = await goodsSaleVerifiedRepo.sumSaleAmountAndProfitBySkuCode(sku_info[i].sys_sku_id)
            sku_info[i]['sale_amount'] = info?.sale_amount || 0
            sku_info[i]['profit'] = info?.profit || 0
        }
        if (!goodsMap[sku_info[i].on_goods_id]) {
            goodsMap[sku_info[i].on_goods_id] = sku_info[i].director
        }
    }
    if (timeType == '1') {
        for (let index in goodsMap) {
            sku_info = await goodsSkuRepo.getProcessInfoByGoodsId(index, project)
            let amount = await goodsSaleVerifiedRepo.sumSaleAmountAndProfitByGoodsId(index)
            let goodsTmp
            if (resultMap[goodsMap[index]] == undefined) {
                resultMap[goodsMap[index]] = result?.length
                result.push({
                    director: goodsMap[index],
                    spu_short_name: [],
                    operator: [],
                    io_date: [],
                    create_time: [],
                    shop_name: [],
                    sys_goods_id: [],
                    num: 0,
                    sale_amount: 0,
                    profit: 0
                })
            }
            for (let i = 0; i < sku_info.length; i++) {
                let id = resultMap[goodsMap[index]]
                if (!result[id].spu_short_name.includes(sku_info[i].spu_short_name) && sku_info[i].spu_short_name)
                    result[id].spu_short_name.push(sku_info[i].spu_short_name)
                if (!result[id].operator.includes(sku_info[i].operator) && sku_info[i].operator)
                    result[id].operator.push(sku_info[i].operator)
                if (!result[id].io_date.includes(sku_info[i].io_date) && sku_info[i].io_date)
                    result[id].io_date.push(sku_info[i].io_date)
                if (!result[id].create_time.includes(sku_info[i].create_time) && sku_info[i].create_time)
                    result[id].create_time.push(sku_info[i].create_time)
                if (!result[id].shop_name.includes(sku_info[i].shop_name) && sku_info[i].shop_name)
                    result[id].shop_name.push(sku_info[i].shop_name)
                if (!result[id].sys_goods_id.includes(sku_info[i].sys_goods_id) && sku_info[i].sys_goods_id)
                    result[id].sys_goods_id.push(sku_info[i].sys_goods_id)
                if (result[id][`shop_name${sku_info[i].id}`] == undefined) {
                    result[id][`shop_name${sku_info[i].id}`] = [sku_info[i].shop_name]
                } else {
                    result[id][`shop_name${sku_info[i].id}`].push(sku_info[i].shop_name)
                }
                if (result[id][`sys_goods_id${sku_info[i].id}`] == undefined) {
                    result[id][`sys_goods_id${sku_info[i].id}`] = [sku_info[i].sys_goods_id]
                } else {
                    result[id][`sys_goods_id${sku_info[i].id}`].push(sku_info[i].sys_goods_id)
                }
                if (result[id][`num${sku_info[i].id}`] == undefined) {
                    result[id][`num${sku_info[i].id}`] = 1
                } else {
                    result[id][`num${sku_info[i].id}`] += 1
                }
                goodsTmp = sku_info[i].id
                result[id].num += 1
            }
            if (result[resultMap[goodsMap[index]]][`sale_amount${goodsTmp}`] == undefined)
                result[resultMap[goodsMap[index]]][`sale_amount${goodsTmp}`] = 0
            else
                result[resultMap[goodsMap[index]]][`sale_amount${goodsTmp}`] += parseFloat(amount.sale_amount)
            if (result[resultMap[goodsMap[index]]][`profit${goodsTmp}`] == undefined)
                result[resultMap[goodsMap[index]]][`profit${goodsTmp}`] = 0
            else
                result[resultMap[goodsMap[index]]][`profit${goodsTmp}`] += parseFloat(amount.profit)
            result[resultMap[goodsMap[index]]].sale_amount += parseFloat(amount.sale_amount)
            result[resultMap[goodsMap[index]]].profit += parseFloat(amount.profit)
        }
    } else {
        for (let i = 0; i < sku_info?.length; i++) {
            if (resultMap[sku_info[i].director] == undefined) {
                resultMap[sku_info[i].director] = result.length
                let info = {
                    director: sku_info[i].director,
                    spu_short_name: [],
                    operator: [],
                    io_date: [],
                    create_time: [],
                    shop_name: [],
                    sys_goods_id: [],
                    num: 1,
                    sale_amount: parseFloat(sku_info[i].sale_amount),
                    profit: parseFloat(sku_info[i].profit)
                }
                if (sku_info[i].spu_short_name) info.spu_short_name.push(sku_info[i].spu_short_name)
                if (sku_info[i].operator) info.operator.push(sku_info[i].operator)
                if (sku_info[i].io_date) info.io_date.push(sku_info[i].io_date)
                if (sku_info[i].create_time) info.create_time.push(sku_info[i].create_time)
                if (sku_info[i].shop_name) info.shop_name.push(sku_info[i].shop_name)
                if (sku_info[i].sys_goods_id) info.sys_goods_id.push(sku_info[i].sys_goods_id)
                info[`shop_name${sku_info[i].id}`] = [sku_info[i].shop_name]
                info[`sys_goods_id${sku_info[i].id}`] = [sku_info[i].sys_goods_id]
                info[`num${sku_info[i].id}`] = 1
                info[`sale_amount${sku_info[i].id}`] = parseFloat(sku_info[i].sale_amount)
                info[`profit${sku_info[i].id}`] = parseFloat(sku_info[i].profit)
                result.push(info)
            } else {
                let id = resultMap[sku_info[i].director]
                if (!result[id].spu_short_name.includes(sku_info[i].spu_short_name) && sku_info[i].spu_short_name)
                    result[id].spu_short_name.push(sku_info[i].spu_short_name)
                if (!result[id].operator.includes(sku_info[i].operator) && sku_info[i].operator)
                    result[id].operator.push(sku_info[i].operator)
                if (!result[id].io_date.includes(sku_info[i].io_date) && sku_info[i].io_date)
                    result[id].io_date.push(sku_info[i].io_date)
                if (!result[id].create_time.includes(sku_info[i].create_time) && sku_info[i].create_time)
                    result[id].create_time.push(sku_info[i].create_time)
                if (!result[id].shop_name.includes(sku_info[i].shop_name) && sku_info[i].shop_name)
                    result[id].shop_name.push(sku_info[i].shop_name)
                if (!result[id].sys_goods_id.includes(sku_info[i].sys_goods_id) && sku_info[i].sys_goods_id)
                    result[id].sys_goods_id.push(sku_info[i].sys_goods_id)
                if (result[id][`shop_name${sku_info[i].id}`] == undefined) {
                    result[id][`shop_name${sku_info[i].id}`] = [sku_info[i].shop_name]
                } else {
                    result[id][`shop_name${sku_info[i].id}`].push(sku_info[i].shop_name)
                }
                if (result[id][`sys_goods_id${sku_info[i].id}`] == undefined) {
                    result[id][`sys_goods_id${sku_info[i].id}`] = [sku_info[i].sys_goods_id]
                } else {
                    result[id][`sys_goods_id${sku_info[i].id}`].push(sku_info[i].sys_goods_id)
                }
                if (result[id][`num${sku_info[i].id}`] == undefined) {
                    result[id][`num${sku_info[i].id}`] = 1
                } else {
                    result[id][`num${sku_info[i].id}`] += 1
                }
                if (result[id][`sale_amount${sku_info[i].id}`] == undefined) {
                    result[id][`sale_amount${sku_info[i].id}`] = parseFloat(sku_info[i].sale_amount)
                } else {
                    result[id][`sale_amount${sku_info[i].id}`] += parseFloat(sku_info[i].sale_amount)
                }
                if (result[id][`profit${sku_info[i].id}`] == undefined) {
                    result[id][`profit${sku_info[i].id}`] = parseFloat(sku_info[i].profit)
                } else {
                    result[id][`profit${sku_info[i].id}`] += parseFloat(sku_info[i].profit)
                }
                result[id].num += 1
                result[id].sale_amount += parseFloat(sku_info[i].sale_amount)
                result[id].profit += parseFloat(sku_info[i].profit)
            }
        }
    }
    return result
}

developmentService.getRunningProcessInfo = async () => {
    let start = moment().subtract(14, 'day').format('YYYY-MM-DD')
    let end = moment().format('YYYY-MM-DD')
    let result = []
    let project_info = await newFormsRepo.getDevelopmentRunning(start, end)
    if (project_info?.length) result = result.concat(project_info)
    let project_info1 = await actHiProcinstRepo.getRunning(start, end)
    if (project_info1?.length) result = result.concat(project_info1)
    return result
}

developmentService.getFinishProcessInfo = async () => {
    let start = moment().subtract(14, 'day').format('YYYY-MM-DD')
    let end = moment().format('YYYY-MM-DD')
    let result = []
    let project_info = await newFormsRepo.getDevelopmentFinish(start, end)
    if (project_info?.length) result = result.concat(project_info)
    let project_info1 = await actHiProcinstRepo.getFinish(start, end)
    if (project_info1?.length) result = result.concat(project_info1)
    return result
}

module.exports = developmentService