const newFormsRepo = require('../repository/newFormsRepo')
const userRepo = require('../repository/userRepo')
const producerPlanRepo = require('../repository/producerPlanRepo')
const userOperationRepo = require('../repository/operation/userOperationRepo')
const { redisKeys } = require('../const/redisConst')
const redisUtil = require("../utils/redisUtil")
const crypto = require('crypto')
const { developmentItem, developmentType, developmentWorkType, developmentWorkProblem, platformList } = require('../const/newFormConst')
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
const goodsInfoRepo = require('@/repository/danpin/goodsInfoRepo')
const purchaseRepo = require('@/repository/jst/purchaseRepo')
const goodsSaleInfoRepo = require('@/repository/operation/goodsSaleInfoRepo')
const goodsSalesRepo = require('@/repository/operation/goodsSalesRepo')
const combinationProductCodeRepo = require('@/repository/danpin/combinationProductCodeRepo')

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
    let userNames = '', result = [], data = [], nameMap = {}
    users = users.filter((item) => !['崔竹', '鲁红旺'].includes(item['nickname']))
    userNames = users.map((item) => item['nickname']).join('","')
    userNames = `${userNames}","孙旭东`
    let status = ''
    if (id == '1') status = '1,3,4'
    else status = id
    data = await newFormsRepo.getDevelopmentDetail(userNames, start, end, status)
    let defaultTmp = {status: '', ch: {}, supplier_num: 0, re_num: 0, ip_num: 0, create_num: 0, self_num: 0}
    if (data?.length) {
        for (let i in developmentType) {
            defaultTmp.ch[developmentType[i]] = []
            defaultTmp[developmentType[i]] = 0
        }
        for (let i = 0; i < data.length; i++) {
            if (i == 0 || (data[i].operator_name != data[i-1].operator_name)) {
                let tmp = JSON.parse(JSON.stringify(defaultTmp))
                tmp.parent_id = id
                tmp[developmentType[data[i].type]] = parseInt(data[i].count)
                tmp['id'] = id + result.length.toString()
                tmp['status'] = data[i].operator_name
                tmp['parent_id'] = id
                tmp['hasChild'] = false
                if (nameMap[data[i].operator_name] == undefined) nameMap[data[i].operator_name] = result.length
                result.push(tmp)
            } else if (data[i].status < 3) {
                result[result.length - 1][developmentType[data[i].type]] = parseInt(data[i].count)
            } else if (data[i].status == 3 && data[i].count > 0) {
                result[result.length - 1].ch[developmentType[data[i].type]].push({
                    selected: parseInt(data[i].count),
                    rejected: 0
                })
            } else if (parseInt(data[i].count) > 0) {
                if (result[result.length - 1].ch[developmentType[data[i].type]]?.length)
                    result[result.length - 1].ch[developmentType[data[i].type]][0]['rejected'] = parseInt(data[i].count)
                else
                    result[result.length - 1].ch[developmentType[data[i].type]].push({
                        rejected: parseInt(data[i].count),
                        selected: 0
                    })
            }
        }
    }
    let reInfo = await actHiProcinstRepo.getFtDetail(status, userNames, start, end)
    for (let i = 0; i < reInfo?.length; i++) {
        if (nameMap[reInfo[i].nickname] == undefined) {
            let tmp = JSON.parse(JSON.stringify(defaultTmp))
            tmp.parent_id = id
            tmp['id'] = id + result.length.toString()
            tmp['status'] = reInfo[i].nickname
            tmp['parent_id'] = id
            tmp['hasChild'] = false
            nameMap[reInfo[i].nickname] = result.length
            result.push(tmp)
        }
        result[nameMap[reInfo[i].nickname]]['re_num'] += parseInt(reInfo[i]['count'])
        if (id == '1') {
            if (result[nameMap[reInfo[i].nickname]]['ch']['re_num'].length == 0) {
                result[nameMap[reInfo[i].nickname]]['ch']['re_num'].push({
                    reject: 0,
                    selected: 0
                })
            }
            if (reInfo[i]['task_status'] == '选中') {
                result[nameMap[reInfo[i].nickname]]['ch']['re_num'][0]['selected'] += parseInt(reInfo[i]['count'])
            } else {
                result[nameMap[reInfo[i].nickname]]['ch']['re_num'][0]['rejected'] += parseInt(reInfo[i]['count'])
            }
        } 
    }
    let supplierInfo = await actHiProcinstRepo.getGysDetail(status, userNames, start, end)
    for (let i = 0; i < supplierInfo?.length; i++) {
        if (nameMap[supplierInfo[i].nickname] == undefined) {
            let tmp = JSON.parse(JSON.stringify(defaultTmp))
            tmp.parent_id = id
            tmp['id'] = id + result.length.toString()
            tmp['status'] = supplierInfo[i].nickname
            tmp['parent_id'] = id
            tmp['hasChild'] = false
            nameMap[supplierInfo[i].nickname] = result.length
            result.push(tmp)
        }
        result[nameMap[supplierInfo[i].nickname]]['supplier_num'] += parseInt(supplierInfo[i]['count'])
    }
    let selfInfo = await actHiProcinstRepo.getSctgDetail(status, userNames, start, end)
    for (let i = 0; i < selfInfo?.length; i++) {
        if (nameMap[selfInfo[i].nickname] == undefined) {
            let tmp = JSON.parse(JSON.stringify(defaultTmp))
            tmp.parent_id = id
            tmp['id'] = id + result.length.toString()
            tmp['status'] = selfInfo[i].nickname
            tmp['parent_id'] = id
            tmp['hasChild'] = false
            nameMap[selfInfo[i].nickname] = result.length
            result.push(tmp)
        }
        result[nameMap[selfInfo[i].nickname]]['self_num'] += parseInt(selfInfo[i]['count'])
    }
    let ipInfo = await actHiProcinstRepo.getIpDetail(status, userNames, start, end)
    for (let i = 0; i < ipInfo?.length; i++) {
        if (nameMap[ipInfo[i].nickname] == undefined) {
            let tmp = JSON.parse(JSON.stringify(defaultTmp))
            tmp.parent_id = id
            tmp['id'] = id + result.length.toString()
            tmp['status'] = ipInfo[i].nickname
            tmp['parent_id'] = id
            tmp['hasChild'] = false
            nameMap[ipInfo[i].nickname] = result.length
            result.push(tmp)
        }
        result[nameMap[ipInfo[i].nickname]]['ip_num'] += parseInt(ipInfo[i]['count'])
    }
    let createInfo = await actHiProcinstRepo.getZyDetail(status, userNames, start, end)
    for (let i = 0; i < createInfo?.length; i++) {
        if (nameMap[createInfo[i].nickname] == undefined) {
            let tmp = JSON.parse(JSON.stringify(defaultTmp))
            tmp.parent_id = id
            tmp['id'] = id + result.length.toString()
            tmp['status'] = createInfo[i].nickname
            tmp['parent_id'] = id
            tmp['hasChild'] = false
            nameMap[createInfo[i].nickname] = result.length
            result.push(tmp)
        }
        result[nameMap[createInfo[i].nickname]]['create_num'] += parseInt(createInfo[i]['count'])
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
    let result = [], data = [], userNames = ''
    let users = await userRepo.getUserByDeptName('产品开发部')
    users = users.filter((item) => !['崔竹', '鲁红旺'].includes(item['nickname']))
    userNames = users.map((item) => item['nickname']).join('","')
    userNames = `${userNames}","孙旭东`
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
                tmp[developmentType[data[i].type]] = parseInt(data[i].count)
                tmp['id'] = result.length.toString()
                tmp['parent_id'] = null
                tmp['hasChild'] = true
                result.push(tmp)
            } else if (data[i].status < 3) {
                result[result.length - 1][developmentType[data[i].type]] = parseInt(data[i].count)
            } else if (data[i].status == 3 && data[i].count > 0) {
                result[1].ch[developmentType[data[i].type]].push({
                    selected: parseInt(data[i].count),
                    rejected: 0
                })
            } else if (data[i].count > 0) {
                if (result[1].ch[developmentType[data[i].type]]?.length)
                    result[1].ch[developmentType[data[i].type]][0]['rejected'] = parseInt(data[i].count)
                else
                    result[1].ch[developmentType[data[i].type]].push({
                        rejected: parseInt(data[i].count),
                        selected: 0
                    })
            }
        }
        let reInfo = await actHiProcinstRepo.getFtInfo(userNames, start, end)
        for (let i = 0; i < reInfo.length; i++) {
            result[reInfo[i]['status']]['re_num'] += parseInt(reInfo[i]['count'])
            if (reInfo[i]['count'] > 0 && reInfo[i]['status'] == '1') {
                if (result[reInfo[i]['status']]['ch']['re_num'].length == 0) {
                    result[reInfo[i]['status']]['ch']['re_num'].push({
                        reject: 0,
                        selected: 0
                    })
                }
                if (reInfo[i]['task_status'] == '选中') {
                    result[reInfo[i]['status']]['ch']['re_num'][0]['selected'] += parseInt(reInfo[i]['count'])
                } else {
                    result[reInfo[i]['status']]['ch']['re_num'][0]['rejected'] += parseInt(reInfo[i]['count'])
                }
            } 
        }
        let supplierInfo = await actHiProcinstRepo.getGysInfo(userNames, start, end)
        for (let i = 0; i < supplierInfo.length; i++) {
            result[supplierInfo[i]['status']]['supplier_num'] += parseInt(supplierInfo[i]['count'])
        }
        let selfInfo = await actHiProcinstRepo.getSctgInfo(userNames, start, end)
        for (let i = 0; i < selfInfo.length; i++) {
            result[selfInfo[i]['status']]['self_num'] += parseInt(selfInfo[i]['count'])
        }
        let ipInfo = await actHiProcinstRepo.getIpInfo(userNames, start, end)
        for (let i = 0; i < ipInfo.length; i++) {
            result[ipInfo[i]['status']]['ip_num'] += parseInt(ipInfo[i]['count'])
        }
        let createInfo = await actHiProcinstRepo.getZyInfo(userNames, start, end)
        for (let i = 0; i < createInfo.length; i++) {
            result[createInfo[i]['status']]['create_num'] += parseInt(createInfo[i]['count'])
        }
    }
    return result
}

developmentService.getWorks = async (start, end) => {
    let users = await userRepo.getUserByDeptName('产品开发部')
    let userNames = '', userIds = '', userInfo = {}, userMap = {}, result = []
    for (let i = 0; i < users.length; i++) {
        if (!['崔竹', '鲁红旺'].includes(users[i].nickname)) {
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
        if (!['崔竹', '鲁红旺'].includes(users[i].nickname)) {
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

developmentService.getProductDevelopInfo = async (start, end, director) => {
    start = moment(start).format('YYYY-MM-DD')
    end = moment(end).format('YYYY-MM-DD') + ' 23:59:59'
    let users = await userRepo.getUserByDeptName('产品开发部')
    let userIds = '', userMap = {}, result = [], resultMap = {}, user1Map = {}
    for (let i = 0; i < users.length; i++) {
        if (!['崔竹', '鲁红旺'].includes(users[i].nickname)) {
            if (!(!director || (director && director == users[i].nickname))) continue
            userIds = `${userIds}"${users[i].dingding_user_id}",`
            userMap[users[i].dingding_user_id] = users[i].nickname
            user1Map[users[i].nickname] = users[i].dingding_user_id
            resultMap[users[i].nickname] = result.length + 5
            let typeList = ['市场分析推品', '自研推品', 'IP推品', '反推推品', '供应商推品']
            for (let j = 0; j < typeList.length; j++) {                
                result.push({
                    director: users[i].nickname,
                    type: typeList[j],
                    create_num: 0,
                    running_num: 0,
                    reject_num: 0,
                    selected_num: 0,
                    selected_percent: 0,
                    children: {
                        create: [],
                        runing: [],
                        reject: [],
                        selected: []
                    }
                })
            }
        }
    }
    let scInfo = await actHiProcinstRepo.getNewSctgInfo(start, end)
    for (let i = 0; i < scInfo.length; i++) {
        if (resultMap[scInfo[i].nickname] == undefined) continue
        let index = resultMap[scInfo[i].nickname] - 5
        result[index].create_num += 1
        result[index].running_num += scInfo[i].running
        result[index].reject_num += scInfo[i].reject
        result[index].selected_num += scInfo[i].selected
    }
    let zyInfo = await actHiProcinstRepo.getNewZyInfo(start, end)
    for (let i = 0; i < zyInfo.length; i++) {
        if (resultMap[zyInfo[i].nickname] == undefined) continue
        let index = resultMap[zyInfo[i].nickname] - 4
        result[index].create_num += 1
        result[index].running_num += zyInfo[i].running
        result[index].reject_num += zyInfo[i].reject
        result[index].selected_num += zyInfo[i].selected
    }
    let ipInfo = await newFormsRepo.getIpInfo(start, end)
    for (let i = 0; i < ipInfo.length; i++) {
        let index = resultMap[userMap[ipInfo[i].creator]] - 3
        result[index].create_num += 1
        result[index].running_num += ipInfo[i].running
        result[index].reject_num += ipInfo[i].reject
        result[index].selected_num += ipInfo[i].selected
    }
    ipInfo = await actHiProcinstRepo.getNewIpInfo(start, end)
    for (let i = 0; i < ipInfo.length; i++) {
        if (resultMap[ipInfo[i].nickname] == undefined) continue
        let index = resultMap[ipInfo[i].nickname] - 3
        result[index].create_num += 1
        result[index].running_num += ipInfo[i].running
        result[index].reject_num += ipInfo[i].reject
        result[index].selected_num += ipInfo[i].selected
    }
    let ztInfo = await newFormsRepo.getZtInfo(start, end)
    for (let i = 0; i < ztInfo.length; i++) {
        let index = resultMap[userMap[ztInfo[i].creator]] - 2
        result[index].create_num += 1
        result[index].running_num += ztInfo[i].running
        result[index].reject_num += ztInfo[i].reject
        result[index].selected_num += ztInfo[i].selected
    }
    ztInfo = await actHiProcinstRepo.getNewGysInfo(start, end)
    for (let i = 0; i < ztInfo.length; i++) {
        if (resultMap[ztInfo[i].nickname] == undefined) continue
        let index = resultMap[ztInfo[i].nickname] - 2
        result[index].create_num += 1
        result[index].running_num += ztInfo[i].running
        result[index].reject_num += ztInfo[i].reject
        result[index].selected_num += ztInfo[i].selected
    }
    let ftInfo = await newFormsRepo.getFtInfo(start, end)
    for (let i = 0; i < ftInfo.length; i++) {
        let index = resultMap[ftInfo[i].operator_name] - 1
        result[index].create_num += 1
        result[index].running_num += ftInfo[i].running
        result[index].reject_num += ftInfo[i].reject
        result[index].selected_num += ftInfo[i].selected
    }
    ftInfo = await actHiProcinstRepo.getNewFtInfo(start, end)
    for (let i = 0; i < ftInfo.length; i++) {
        if (resultMap[ftInfo[i].nickname] == undefined) continue
        let index = resultMap[ftInfo[i].nickname] - 1
        result[index].create_num += 1
        result[index].running_num += ftInfo[i].running
        result[index].reject_num += ftInfo[i].reject
        result[index].selected_num += ftInfo[i].selected
    }
    for (let i = 0; i < result.length; i++) {
        if (result[i].create_num > 0)
            result[i].selected_percent = (result[i].selected_num / result[i].create_num * 100).toFixed(2)
    }
    return result
}

developmentService.getProductDevelopFirst = async (start, end, type, addSales) => {    
    let users = await userRepo.getUserByDeptName('产品开发部')
    let userIds = '', userMap = {}, result = [], resultMap = {}, user1Map = {}
    for (let i = 0; i < users.length; i++) {
        if (!['崔竹', '鲁红旺'].includes(users[i].nickname)) {
            userIds = `${userIds}"${users[i].dingding_user_id}",`
            userMap[users[i].dingding_user_id] = users[i].nickname
            user1Map[users[i].nickname] = users[i].dingding_user_id
            resultMap[users[i].nickname] = result.length
            let process_num = 0
            let num = await newFormsRepo.getProductDeveloper(start, end, type, users[i].dingding_user_id, users[i].nickname)
            if (num?.length) process_num += num[0].count
            num = await actHiProcinstRepo.getProductDeveloper(start, end, type, users[i].nickname)
            if (num?.length) process_num += num[0].count
            result.push({
                director: users[i].nickname,
                process_num,
                selected_num: 0,
                purchase_time: 0.00,
                out_purchase_time_num: 0,
                shelf_num: 0,
                shelf_link_num: 0,
                shelf_time: 0.00,
                out_shelf_time_num: 0,
                sale_amount: 0.00,
                profit: 0.00
            })
        }
    }
    let info = [], info1 = []
    if (['0', '3', '4', '5'].includes(type)) {
        info = await newFormsRepo.getProductDevelopInfo(start, end, type, 1)
    }
    info1 = await actHiProcinstRepo.getProductDevelopInfo(start, end, type, 1)
    for (let i = 0; i < info1.length; i++) {
        let content = new ObjectInputStream(info1[i].info)
        content = content.readObject()
        content?.annotations.splice(0, 1)
        content = content?.annotations
        for (let j = 0; j < content.length; j++) {
            content[j].annotations.splice(0, 1)
            for (let k = 0; k < content[j].annotations.length; k = k+2) {
                if (['Fo4qma3c22cic3c', 'Fwb8makvcyibm9c', 'Ferjmade1tm0axc'].includes(content[j].annotations[k]))
                    info1[i]['platform'] = content[j].annotations[k+1]
                else if (['F1ujma2exiosbcc', 'Fssama252xmjbzc', 'Fxx1ma3pg5efdec'].includes(content[j].annotations[k]))
                    info1[i]['sku_id'] = content[j].annotations[k+1]
            }
        }
        info1[i].director = user1Map[info1[i].nickname]
    }
    if (info1?.length) {
        info = (info || []).concat(info1).sort((a, b) => a.director.localeCompare(b.director, 'zh-Hans-CN'))
    }
    let skuids = [], infoMap = {}
    for (let i = 0; i < info.length; i++) {
        if (userMap[info[i].director]) {
            let index = resultMap[userMap[info[i].director]]
            result[index].selected_num += 1
            infoMap[info[i].sku_id] = info[i].operate_time
            if (i == 0) {
                skuids = [info[i].sku_id]
            } else if (info[i].director != info[i-1].director) {
                index = resultMap[userMap[info[i-1].director]]
                let goodsInfo = await goodsInfoRepo.get(skuids.join('","'))
                let purchaseInfo = await purchaseRepo.getBySkuCode(skuids.join('","'))
                let shelfInfo = await goodsSkuRepo.getBySysSkuId(skuids.join('","'))
                let shelfInfo1 = await combinationProductCodeRepo.get(skuids.join('","'))
                for (let j = 0; j < shelfInfo1.length; j++) {
                    let tmp = await goodsSkuRepo.getBySysSkuId(shelfInfo1[j].sku_id)
                    if (tmp?.length) shelfInfo = shelfInfo.concat(tmp)
                }
                let salesInfo = await goodsSaleInfoRepo.getProductSaleInfo(skuids.join('","'), addSales)
                let time = 0, out_num = 0, outMap = {}, shelf_time = 0, out_shelf_num = 0, outShelfMap = {}
                for (let j = 0; j < purchaseInfo?.length; j++) {
                    time += moment(purchaseInfo[j].io_date).diff(infoMap[purchaseInfo[j].sku_code], 'day')
                    for (let k = 0; k < goodsInfo.length; k++) {
                        if (outMap[goodsInfo[k].sku_id] == undefined && goodsInfo[k].sku_id == purchaseInfo[j].sku_code) {
                            if (goodsInfo[k].purchase_time < moment(purchaseInfo[j].io_date).diff(infoMap[purchaseInfo[j].sku_code], 'day')) {
                                out_num += 1
                                outMap[goodsInfo[k].sku_id] = true
                            }
                            break
                        }
                    }
                }
                if (purchaseInfo?.length) time = time/purchaseInfo.length
                result[index].purchase_time = time
                result[index].out_purchase_time_num = out_num
                let shelf_link_num = 0, shelfMap = {}
                for (let j = 0; j < shelfInfo.length; j++) {
                    if (!shelfMap[shelfInfo[j].sku_id]) {
                        result[index].shelf_num += 1
                        shelfMap[shelfInfo[j].sku_id] = true
                    }
                    if (j == 0 || shelfInfo[j].goods_id != shelfInfo[j-1].goods_id) shelf_link_num += 1
                    for (let k = 0; k < purchaseInfo.length; k++) {
                        if (purchaseInfo[k].sku_code == shelfInfo[j].sku_id) {
                            shelf_time += moment(shelfInfo[j].create_time).diff(purchaseInfo[k].io_date, 'day')
                            if (outShelfMap[shelfInfo[j].sku_id] == undefined && moment(shelfInfo[j].create_time).diff(purchaseInfo[k].io_date, 'day') > 7) {
                                out_shelf_num += 1
                                outShelfMap[shelfInfo[j].sku_id] = true
                            }
                            break
                        }
                    }
                }
                result[index].shelf_link_num = shelf_link_num
                result[index].shelf_time = shelf_time
                result[index].out_shelf_time_num = out_shelf_num
                if (salesInfo?.length) {
                    result[index].sale_amount = parseFloat(salesInfo[0].sale_amount / 10000)
                    result[index].profit = parseFloat(salesInfo[0].profit / 10000)
                }
                skuids = [info[i].sku_id]
            } else {
                skuids.push(info[i].sku_id)
            }
        }
    }
    if (skuids?.length) {
        let index = resultMap[userMap[info[info.length-1].director]]
        let goodsInfo = await goodsInfoRepo.get(skuids.join('","'))
        let purchaseInfo = await purchaseRepo.getBySkuCode(skuids.join('","'))
        let shelfInfo = await goodsSkuRepo.getBySysSkuId(skuids.join('","'))
        let shelfInfo1 = await combinationProductCodeRepo.get(skuids.join('","'))
        for (let j = 0; j < shelfInfo1.length; j++) {
            let tmp = await goodsSkuRepo.getBySysSkuId(shelfInfo1[j].sku_id)
            if (tmp?.length) shelfInfo = shelfInfo.concat(tmp)
        }
        let salesInfo = await goodsSaleInfoRepo.getProductSaleInfo(skuids.join('","'), addSales)
        let time = 0, out_num = 0, outMap = {}, shelf_time = 0, out_shelf_num = 0, outShelfMap = {}
        for (let j = 0; j < purchaseInfo?.length; j++) {
            time += moment(purchaseInfo[j].io_date).diff(infoMap[purchaseInfo[j].sku_code], 'day')
            for (let k = 0; k < goodsInfo.length; k++) {
                if (outMap[purchaseInfo[j].sku_code] == undefined && goodsInfo[k].sku_id == purchaseInfo[j].sku_code) {
                    if (goodsInfo[k].purchase_time < moment(purchaseInfo[j].io_date).diff(infoMap[purchaseInfo[j].sku_code], 'day')) {
                        out_num += 1
                        outMap[purchaseInfo[j].sku_code] = true
                    }
                    break
                }
            }
        }
        if (purchaseInfo?.length) time = time/purchaseInfo.length
        result[index].purchase_time = time
        result[index].out_purchase_time_num = out_num
        let shelf_link_num = 0, shelfMap = {}
        for (let j = 0; j < shelfInfo.length; j++) {
            if (!shelfMap[shelfInfo[j].sku_id]) {
                result[index].shelf_num += 1
                shelfMap[shelfInfo[j].sku_id] = true
            }
            if (j == 0 || shelfInfo[j].goods_id != shelfInfo[j-1].goods_id) shelf_link_num += 1
            for (let k = 0; k < purchaseInfo.length; k++) {
                if (purchaseInfo[k].sku_code == shelfInfo[j].sku_id) {
                    shelf_time += moment(shelfInfo[j].create_time).diff(purchaseInfo[k].io_date, 'day')
                    if (outShelfMap[shelfInfo[j].sku_id] == undefined && moment(shelfInfo[j].create_time).diff(purchaseInfo[k].io_date, 'day') > 7) {
                        out_shelf_num += 1
                        outShelfMap[shelfInfo[j].sku_id] = true
                    }
                    break
                }
            }
        }
        result[index].shelf_link_num = shelf_link_num
        if (shelfInfo?.length) shelf_time = shelf_time/shelfInfo.length
        result[index].shelf_time = shelf_time
        result[index].out_shelf_time_num = out_shelf_num
        if (salesInfo?.length) {
            result[index].sale_amount = parseFloat(salesInfo[0].sale_amount / 10000)
            result[index].profit = parseFloat(salesInfo[0].profit / 10000)
        }
        let total = {
            director: '总计',
            process_num: 0,
            selected_num: 0,
            purchase_time: 0,
            out_purchase_time_num: 0,
            shelf_num: 0,
            shelf_link_num: 0,
            shelf_time: 0,
            out_shelf_time_num: 0,
            sale_amount: 0,
            profit: 0
        }
        for (let i = 0; i < result.length; i++) {
            total.process_num += result[i].process_num
            total.selected_num += result[i].selected_num
            total.purchase_time += result[i].purchase_time
            total.out_purchase_time_num += result[i].out_purchase_time_num
            total.shelf_num += result[i].shelf_num
            total.shelf_link_num += result[i].shelf_link_num
            total.shelf_time += result[i].shelf_time
            total.out_shelf_time_num += result[i].out_shelf_time_num
            total.sale_amount += result[i].sale_amount
            total.profit += result[i].profit
        }
        result = [total].concat(result)
    }
    return result
}

developmentService.getProductDevelopSecond = async (start, end, type, addSales, platform) => {
    let result = [], resultMap = {}
    for (let i = 0; i < platformList.length; i++) {
        if (!platform || (platform && platformList[i] == platform)) {
            resultMap[platformList[i]] = result.length
            result.push({
                platform: platformList[i],
                selected_num: 0,
                purchase_time: 0.00,
                out_purchase_time_num: 0,
                shelf_num: 0,
                shelf_link_num: 0,
                shelf_time: 0.00,
                out_shelf_time_num: 0,
                sale_amount: 0.00,
                profit: 0.00,
            })
        }
    }
    let info = [], info1 = []
    if (['0', '3', '4', '5'].includes(type)) {
        info = await newFormsRepo.getProductDevelopInfo(start, end, type, 2)
    }
    info1 = await actHiProcinstRepo.getProductDevelopInfo(start, end, type)
    for (let i = 0; i < info1.length; i++) {
        let content = new ObjectInputStream(info1[i].info)
        content = content.readObject()
        content?.annotations.splice(0, 1)
        content = content?.annotations
        for (let j = 0; j < content.length; j++) {
            content[j].annotations.splice(0, 1)
            for (let k = 0; k < content[j].annotations.length; k = k+2) {
                if (['Fo4qma3c22cic3c', 'Fwb8makvcyibm9c', 'Ferjmade1tm0axc'].includes(content[j].annotations[k])) {
                    info1[i]['platform'] = content[j].annotations[k+1]
                } else if (['F1ujma2exiosbcc', 'Fssama252xmjbzc', 'Fxx1ma3pg5efdec'].includes(content[j].annotations[k]))
                    info1[i]['sku_id'] = content[j].annotations[k+1]
            }
        }
    }
    if (info1?.length) {
        info = (info || []).concat(info1).map((item) => {
            if ('得物、唯品会'.indexOf(item['platform']) != -1) {
                item['platform'] = '得物、唯品会'
            } else if ('抖音、快手'.indexOf(item['platform']) != -1) {
                item['platform'] = '抖音、快手'
            } else if (item['platform'] == 'Coupang') {
                item['platform'] = 'coupang'
            }
            return item
        }).sort((a, b) => a.platform.localeCompare(b.platform, 'zh-Hans-CN'))
    }
    let skuids = [], infoMap = {}
    for (let i = 0; i < info.length; i++) {
        let index = resultMap[info[i].platform]
        if (index == undefined) continue
        result[index].selected_num += 1
        infoMap[info[i].sku_id] = info[i].operate_time
        if (i == 0) {
            skuids = [info[i].sku_id]
        } else if (info[i].platform != info[i-1].platform) {
            index = resultMap[info[i-1].platform]
            let goodsInfo = await goodsInfoRepo.get(skuids.join('","'))
            let purchaseInfo = await purchaseRepo.getBySkuCode(skuids.join('","'))
            let shelfInfo = await goodsSkuRepo.getBySysSkuId(skuids.join('","'))
            let shelfInfo1 = await combinationProductCodeRepo.get(skuids.join('","'))
            for (let j = 0; j < shelfInfo1.length; j++) {
                let tmp = await goodsSkuRepo.getBySysSkuId(shelfInfo1[j].sku_id)
                if (tmp?.length) shelfInfo = shelfInfo.concat(tmp)
            }
            let salesInfo = await goodsSaleInfoRepo.getProductSaleInfo(skuids.join('","'), addSales)
            let time = 0, out_num = 0, outMap = {}, shelf_time = 0, out_shelf_num = 0, outShelfMap = {}
            for (let j = 0; j < purchaseInfo?.length; j++) {
                time += moment(purchaseInfo[j].io_date).diff(infoMap[purchaseInfo[j].sku_code], 'day')
                for (let k = 0; k < goodsInfo.length; k++) {
                    if (outMap[purchaseInfo[j].sku_code] == undefined && goodsInfo[k].sku_id == purchaseInfo[j].sku_code) {
                        if (goodsInfo[k].purchase_time < moment(purchaseInfo[j].io_date).diff(infoMap[purchaseInfo[j].sku_code], 'day')) {
                            out_num += 1
                            outMap[purchaseInfo[j].sku_code] = true
                        }
                        break
                    }
                }
            }
            if (purchaseInfo?.length) time = time/purchaseInfo.length
            result[index].purchase_time = time
            result[index].out_purchase_time_num = out_num
            let shelf_link_num = 0, shelfMap = {}
            for (let j = 0; j < shelfInfo.length; j++) {
                if (!shelfMap[shelfInfo[j].sku_id]) {
                    result[index].shelf_num += 1
                    shelfMap[shelfInfo[j].sku_id] = true
                }
                if (j == 0 || shelfInfo[j].goods_id != shelfInfo[j-1].goods_id) shelf_link_num += 1
                for (let k = 0; k < purchaseInfo.length; k++) {
                    if (purchaseInfo[k].sku_code == shelfInfo[j].sku_id) {
                        shelf_time += moment(shelfInfo[j].create_time).diff(purchaseInfo[k].io_date, 'day')
                        if (outShelfMap[shelfInfo[j].sku_id] == undefined && moment(shelfInfo[j].create_time).diff(purchaseInfo[k].io_date, 'day') > 7) {
                            out_shelf_num += 1
                            outShelfMap[shelfInfo[j].sku_id] = true
                        }
                        break
                    }
                }
            }
            result[index].shelf_link_num = shelf_link_num
            if (shelfInfo?.length) shelf_time = shelf_time/shelfInfo.length
            result[index].shelf_time = shelf_time
            result[index].out_shelf_time_num = out_shelf_num
            if (salesInfo?.length) {
                result[index].sale_amount = parseFloat(salesInfo[0].sale_amount / 10000)
                result[index].profit = parseFloat(salesInfo[0].profit / 10000)
            }
            skuids = [info[i].sku_id]
        } else {
            skuids.push(info[i].sku_id)
        }
    }
    if (skuids?.length) {
        let index = result?.length - 1
        let goodsInfo = await goodsInfoRepo.get(skuids.join('","'))
        let purchaseInfo = await purchaseRepo.getBySkuCode(skuids.join('","'))
        let shelfInfo = await goodsSkuRepo.getBySysSkuId(skuids.join('","'))
        let shelfInfo1 = await combinationProductCodeRepo.get(skuids.join('","'))
        for (let j = 0; j < shelfInfo1.length; j++) {
            let tmp = await goodsSkuRepo.getBySysSkuId(shelfInfo1[j].sku_id)
            if (tmp?.length) shelfInfo = shelfInfo.concat(tmp)
        }
        let salesInfo = await goodsSaleInfoRepo.getProductSaleInfo(skuids.join('","'), addSales)
        let time = 0, out_num = 0, outMap = {}, shelf_time = 0, out_shelf_num = 0, outShelfMap = {}
        for (let j = 0; j < purchaseInfo?.length; j++) {
            time += moment(purchaseInfo[j].io_date).diff(infoMap[purchaseInfo[j].sku_code], 'day')
            for (let k = 0; k < goodsInfo.length; k++) {
                if (outMap[purchaseInfo[j].sku_code] == undefined && goodsInfo[k].sku_id == purchaseInfo[j].sku_code) {
                    if (goodsInfo[k].purchase_time < moment(purchaseInfo[j].io_date).diff(infoMap[purchaseInfo[j].sku_code], 'day')) {
                        out_num += 1
                        outMap[purchaseInfo[j].sku_code] = true
                    }
                    break
                }
            }
        }
        if (purchaseInfo?.length) time = time/purchaseInfo.length
        result[index].purchase_time = time
        result[index].out_purchase_time_num = out_num
        let shelf_link_num = 0, shelfMap = {}
        for (let j = 0; j < shelfInfo.length; j++) {
            if (!shelfMap[shelfInfo[j].sku_id]) {
                result[index].shelf_num += 1
                shelfMap[shelfInfo[j].sku_id] = true
            }
            if (j == 0 || shelfInfo[j].goods_id != shelfInfo[j-1].goods_id) shelf_link_num += 1
            for (let k = 0; k < purchaseInfo.length; k++) {
                if (purchaseInfo[k].sku_code == shelfInfo[j].sku_id) {
                    shelf_time += moment(shelfInfo[j].create_time).diff(purchaseInfo[k].io_date, 'day')
                    if (outShelfMap[shelfInfo[j].sku_id] == undefined && moment(shelfInfo[j].create_time).diff(purchaseInfo[k].io_date, 'day') > 7) {
                        out_shelf_num += 1
                        outShelfMap[shelfInfo[j].sku_id] = true
                    }
                    break
                }
            }
        }
        result[index].shelf_link_num = shelf_link_num
        if (shelfInfo?.length) shelf_time = shelf_time/shelfInfo.length
        result[index].shelf_time = shelf_time
        result[index].out_shelf_time_num = out_shelf_num
        if (salesInfo?.length) {
            result[index].sale_amount = parseFloat(salesInfo[0].sale_amount / 10000)
            result[index].profit = parseFloat(salesInfo[0].profit / 10000)
        }
        let total = {
            platform: '总计',
            selected_num: 0,
            purchase_time: 0.00,
            out_purchase_time_num: 0,
            shelf_num: 0,
            shelf_link_num: 0,
            shelf_time: 0.00,
            out_shelf_time_num: 0,
            sale_amount: 0.00,
            profit: 0.00
        }
        for (let i = 0; i < result.length; i++) {
            total.selected_num += result[i].selected_num
            total.purchase_time += result[i].purchase_time
            total.out_purchase_time_num += result[i].out_purchase_time_num
            total.shelf_num += result[i].shelf_num
            total.shelf_link_num += result[i].shelf_link_num
            total.shelf_time += result[i].shelf_time
            total.out_shelf_time_num += result[i].out_shelf_time_num
            total.sale_amount += result[i].sale_amount
            total.profit += result[i].profit
        }
        result = [total].concat(result)
    }
    return result
}

developmentService.getProductDevelopThird = async (start, end, type, addSales, spu) => {
    let result = [], resultMap = {}
    let defaultInfo = {
        spu: '',
        line_brief_name: '',
        category: '',
        selected_num: 0,
        time: 0.00,
        purchase_time: 0.00,
        out_purchase_time_num: 0,
        shelf_num: 0,
        shelf_link_num: 0,
        shelf_time: 0.00,
        out_shelf_time_num: 0,
        sale_amount: 0.00,
        profit: 0.00,
    }
    let info = [], info1 = []
    if (['0', '3', '4', '5'].includes(type)) {
        info = await newFormsRepo.getProductDevelopInfo(start, end, type, 3)
    }
    info1 = await actHiProcinstRepo.getProductDevelopInfo(start, end, type)
    for (let i = 0; i < info1.length; i++) {
        let content = new ObjectInputStream(info1[i].info)
        content = content.readObject()
        content?.annotations.splice(0, 1)
        content = content?.annotations
        for (let j = 0; j < content.length; j++) {
            content[j].annotations.splice(0, 1)
            for (let k = 0; k < content[j].annotations.length; k = k+2) {
                if (['Fo4qma3c22cic3c', 'Fwb8makvcyibm9c', 'Ferjmade1tm0axc'].includes(content[j].annotations[k]))
                    info1[i]['platform'] = content[j].annotations[k+1]
                else if (['F1ujma2exiosbcc', 'Fssama252xmjbzc', 'Fxx1ma3pg5efdec'].includes(content[j].annotations[k]))
                    info1[i]['sku_id'] = content[j].annotations[k+1]
            }
        }
    }
    if (info1?.length) {
        info = (info || []).concat(info1).sort((a, b) => a.sku_id.localeCompare(b.sku_id, 'zh-Hans-CN'))
    }
    let skuids = [], infoMap = {}, dateMap = {}, skuInfo = [], resultCount = {}, shelfCount = {}, lineMap = {}
    for (let i = 0; i < info.length; i++) {
        skuids.push(info[i].sku_id)
        dateMap[info[i].sku_id] = info[i].operate_time
        lineMap[info[i].sku_id] = info[i].line_brief_name
    }
    if (skuids?.length) {
        let goodsInfo = await goodsInfoRepo.get(skuids.join('","'))
        let purchaseInfo = await purchaseRepo.getBySkuCode(skuids.join('","'))
        let shelfInfo = await goodsSkuRepo.getBySysSkuId(skuids.join('","'))
        let shelfInfo1 = await combinationProductCodeRepo.get(skuids.join('","'))
        for (let j = 0; j < shelfInfo1.length; j++) {
            let tmp = await goodsSkuRepo.getBySysSkuId(shelfInfo1[j].sku_id)
            if (tmp?.length) shelfInfo = shelfInfo.concat(tmp)
        }
        for (let i = 0; i < goodsInfo.length; i++) {
            infoMap[goodsInfo[i].sku_id] = goodsInfo[i].purchase_time
            if (!spu || (spu && goodsInfo[i].spu && goodsInfo[i].spu.indexOf(spu) !=-1)) {                
                if (i == 0 || goodsInfo[i].spu != goodsInfo[i-1].spu) {
                    resultMap[goodsInfo[i].sku_id] = result?.length
                    let tmp = JSON.parse(JSON.stringify(defaultInfo))
                    tmp.spu = goodsInfo[i].spu
                    tmp.category = goodsInfo[i].category
                    if (lineMap[goodsInfo[i].sku_id]) tmp.line_brief_name = lineMap[goodsInfo[i].sku_id]
                    tmp.selected_num += 1
                    result.push(tmp)
                    resultCount[result?.length-1] = 0
                    shelfCount[result?.length-1] = 0
                    skuInfo.push([goodsInfo[i].sku_id])
                } else {
                    resultMap[goodsInfo[i].sku_id] = result?.length-1
                    result[result?.length-1].selected_num += 1
                    if (lineMap[goodsInfo[i].sku_id] && result[result?.length-1].line_brief_name.length == 0)
                        result[result?.length-1].line_brief_name = lineMap[goodsInfo[i].sku_id]
                    skuInfo[result?.length-1].push(goodsInfo[i-1].sku_id)
                }
            }
        }
        let purchaseMap = {}
        for (let i = 0; i < purchaseInfo.length; i++) {
            purchaseMap[purchaseInfo[i].sku_code] = purchaseInfo[i].io_date
            if (resultMap[purchaseInfo[i].sku_code] != undefined) {
                let index = resultMap[purchaseInfo[i].sku_code]
                result[index].time += moment(purchaseInfo[i].io_date).diff(dateMap[purchaseInfo[i].sku_code], 'day')
                resultCount[index] += 1
                if (moment(purchaseInfo[i].io_date).diff(dateMap[purchaseInfo[i].sku_code], 'day') > infoMap[purchaseInfo[i].sku_code]) {
                    result[index].out_purchase_time_num += 1
                }
            }
        }
        let shelfMap = {}
        for (let i = 0; i < shelfInfo.length; i++) {
            if (resultMap[shelfInfo[i].sku_id] != undefined) {
                let index = resultMap[shelfInfo[i].sku_id]
                if (shelfMap[index] == undefined) {
                    result[index].shelf_num += 1
                    shelfMap[index] = {}
                } else if (shelfMap[index][shelfInfo[i].sku_id] == undefined) {
                    result[index].shelf_num += 1
                }
                shelfMap[index][shelfInfo[i].sku_id] = true
                if (i == 0 || shelfInfo[i].goods_id != shelfInfo[i-1].goods_id) {
                    result[index].shelf_link_num += 1
                }
                result[index].shelf_time += moment(shelfInfo[i].create_time).diff(purchaseMap[shelfInfo[i].sku_id], 'day')
                shelfCount[index] += 1
                if (moment(shelfInfo[i].create_time).diff(purchaseMap[shelfInfo[i].sku_id], 'day') > 7) {
                    result[index].out_shelf_time_num += 1
                }
            }
        }
    }
    let total = {
        spu: '总计',
        line_brief_name: '',
        category: '',
        selected_num: 0,
        time: 0.00,
        purchase_time: 0.00,
        out_purchase_time_num: 0,
        shelf_num: 0,
        shelf_link_num: 0,
        shelf_time: 0.00,
        out_shelf_time_num: 0,
        sale_amount: 0.00,
        profit: 0.00
    }
    for (let i = 0; i < result.length; i++) {
        let salesInfo = await goodsSaleInfoRepo.getProductSaleInfo(skuInfo[i].join('","'), addSales)
        if (salesInfo?.length) {
            result[i].sale_amount = parseFloat(salesInfo[0].sale_amount / 10000)
            result[i].profit = parseFloat(salesInfo[0].profit / 10000)
        }
        if (resultCount[i]) result[i].time = result[i].time/resultCount[i]
        if (shelfCount[i]) result[i].shelf_time = result[i].shelf_time/shelfCount[i]
        total.selected_num += result[i].selected_num
        total.purchase_time += result[i].purchase_time
        total.out_purchase_time_num += result[i].out_purchase_time_num
        total.shelf_num += result[i].shelf_num
        total.shelf_link_num += result[i].shelf_link_num
        total.shelf_time += result[i].shelf_time
        total.out_shelf_time_num += result[i].out_shelf_time_num
        total.sale_amount += result[i].sale_amount
        total.profit += result[i].profit
    }
    result = [total].concat(result)
    return result
}

developmentService.getProductSalesFirst = async (start, end, type, productType, addSales) => {
    let result = [], skuids = '', skuMap = {}, resultMap = {}, result1 = [], result2 = []
    let division = await goodsSalesRepo.getSalesByDivision(start, end, productType, addSales)     
    const yearStart = moment(start).subtract(1, 'year').format('YYYY-MM-DD')
    const yearEnd = moment(end).subtract(1, 'year').format('YYYY-MM-DD')
    const monthStart = moment(start).subtract(1, 'month').format('YYYY-MM-DD')
    const monthEnd = moment(end).subtract(1, 'month').format('YYYY-MM-DD')
    if (type != '0') {
        for (let i = 0; i < division.length; i++) {
            if (!skuMap[division[i].sku_code]) {
                skuids = `${skuids}","`
            }
        }
        let skuInfo1 = [], skuInfo2 = [], skuInfo = ''
        if (['3', '4', '5'].includes(type)) {
            skuInfo1 = await newFormsRepo.getProductSkuId(skuids, type)
        }
        if (skuInfo1?.length) skuInfo = `${skuInfo}"${skuInfo1[0].skuids}",`
        skuInfo2 = await actHiProcinstRepo.getProductSkuId(start, type)
        for (let i = 0; i < skuInfo2.length; i++) {
            let content = new ObjectInputStream(skuInfo2[i].info)
            content = content.readObject()
            content?.annotations.splice(0, 1)
            content = content?.annotations
            for (let j = 0; j < content.length; j++) {
                content[j].annotations.splice(0, 1)
                for (let k = 0; k < content[j].annotations.length; k = k+2) {
                    if (['F1ujma2exiosbcc', 'Fssama252xmjbzc', 'Fxx1ma3pg5efdec'].includes(content[j].annotations[k]))
                        skuInfo = `${skuInfo}"${content[j].annotations[k+1]}",`
                }
            }
        }
        skuInfo = skuInfo?.length ? skuInfo.substring(0, skuInfo.length - 1) : skuInfo
        for (let i = 0; i < division.length; i++) {
            if (skuInfo.indexOf(`"${division[i].sku_code}"`) != -1) {
                if (resultMap[division[i].division_name] == undefined) {
                    result.push({
                        division_name: division[i].division_name,
                        sale_qty: 0,
                        sale_amount: 0,
                        gross_profit: 0,
                        profit: 0
                    })
                    resultMap[division[i].division_name] = result.length - 1
                }
                result[resultMap[division[i].division_name]].sale_qty += parseInt(division[i].sale_qty)
                result[resultMap[division[i].division_name]].sale_amount += parseFloat(division[i].sale_amount)
                result[resultMap[division[i].division_name]].gross_profit += parseFloat(division[i].gross_profit)
                result[resultMap[division[i].division_name]].profit += parseFloat(division[i].profit)
            }
        }
        result1 = await goodsSalesRepo.getSalesByDivisionAndSkuId(yearStart, yearEnd, productType, addSales, skuInfo)
        result2 = await goodsSalesRepo.getSalesByDivisionAndSkuId(monthStart, monthEnd, productType, addSales, skuInfo)
    } else {
        for (let i = 0; i < division.length; i++) {
            if (resultMap[division[i].division_name] == undefined) {
                result.push({
                    division_name: division[i].division_name,
                    sale_qty: 0,
                    sale_amount: 0,
                    gross_profit: 0,
                    profit: 0
                })
                resultMap[division[i].division_name] = result.length - 1
            }
            result[resultMap[division[i].division_name]].sale_qty += parseInt(division[i].sale_qty)
            result[resultMap[division[i].division_name]].sale_amount += parseFloat(division[i].sale_amount)
            result[resultMap[division[i].division_name]].gross_profit += parseFloat(division[i].gross_profit)
            result[resultMap[division[i].division_name]].profit += parseFloat(division[i].profit)
        }
        result1 = await goodsSalesRepo.getSalesByDivisionAndSkuId(yearStart, yearEnd, productType, addSales)
        result2 = await goodsSalesRepo.getSalesByDivisionAndSkuId(monthStart, monthEnd, productType, addSales)
    }
    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result1.length; j++) {
            if (result[i].division_name == result1[j].division_name) {
                result[i]['sale_amount_yoy'] = result1[j].sale_amount > 0 ? 
                    ((result[i].sale_amount - result1[j].sale_amount) / result1[j].sale_amount * 100).toFixed(2) : 0
                result1.splice(j, 1)
                break
            }
        }
        for (let j = 0; j < result2.length; j++) {
            if (result[i].division_name == result2[j].division_name) {
                result[i]['sale_amount_qoq'] = result2[j].sale_amount > 0 ? 
                    ((result[i].sale_amount - result2[j].sale_amount) / result2[j].sale_amount * 100).toFixed(2) : 0
                result2.splice(j, 1)
                break
            }
        }
        result[i].gross_margin = result[i].sale_amount > 0 ? 
            (result[i].gross_profit / result[i].sale_amount * 100).toFixed(2) : 0
        result[i].profit_margin = result[i].sale_amount > 0 ? 
            (result[i].profit / result[i].sale_amount * 100).toFixed(2) : 0
        result[i].sale_amount = (result[i].sale_amount / 10000).toFixed(2)
        result[i].gross_profit = (result[i].gross_profit / 10000).toFixed(2)
        result[i].profit = (result[i].profit / 10000).toFixed(2)
    }
    return result
}

developmentService.getProductSalesSecond = async (start, end, type, productType, addSales) => {    
    let result = [], skuids = '', skuMap = {}, resultMap = {}, result1 = [], result2 = []
    let project = await goodsSalesRepo.getSalesByProject(start, end, productType, addSales)
    const yearStart = moment(start).subtract(1, 'year').format('YYYY-MM-DD')
    const yearEnd = moment(end).subtract(1, 'year').format('YYYY-MM-DD')
    const monthStart = moment(start).subtract(1, 'month').format('YYYY-MM-DD')
    const monthEnd = moment(end).subtract(1, 'month').format('YYYY-MM-DD')
    if (type != '0') {
        for (let i = 0; i < project.length; i++) {
            if (!skuMap[project[i].sku_code]) {
                skuids = `${skuids}","`
            }
        }
        let skuInfo1 = [], skuInfo2 = [], skuInfo = ''
        if (['3', '4', '5'].includes(type)) {
            skuInfo1 = await newFormsRepo.getProductSkuId(skuids, type)
        }
        if (skuInfo1?.length) skuInfo = `${skuInfo}"${skuInfo1[0].skuids}",`
        skuInfo2 = await actHiProcinstRepo.getProductSkuId(start, type)
        for (let i = 0; i < skuInfo2.length; i++) {
            let content = new ObjectInputStream(skuInfo2[i].info)
            content = content.readObject()
            content?.annotations.splice(0, 1)
            content = content?.annotations
            for (let j = 0; j < content.length; j++) {
                content[j].annotations.splice(0, 1)
                for (let k = 0; k < content[j].annotations.length; k = k+2) {
                    if (['F1ujma2exiosbcc', 'Fssama252xmjbzc', 'Fxx1ma3pg5efdec'].includes(content[j].annotations[k]))
                        skuInfo = `${skuInfo}"${content[j].annotations[k+1]}",`
                }
            }
        }
        skuInfo = skuInfo?.length ? skuInfo.substring(0, skuInfo.length - 1) : skuInfo
        for (let i = 0; i < project.length; i++) {
            if (skuInfo.indexOf(`"${project[i].sku_code}"`) != -1) {
                if (resultMap[project[i].project_name] == undefined) {
                    result.push({
                        project_name: project[i].project_name,
                        sale_qty: 0,
                        sale_amount: 0,
                        gross_profit: 0,
                        profit: 0
                    })
                    resultMap[project[i].project_name] = result.length - 1
                }
                result[resultMap[project[i].project_name]].sale_qty += parseInt(project[i].sale_qty)
                result[resultMap[project[i].project_name]].sale_amount += parseFloat(project[i].sale_amount)
                result[resultMap[project[i].project_name]].gross_profit += parseFloat(project[i].gross_profit)
                result[resultMap[project[i].project_name]].profit += parseFloat(project[i].profit)
            }
        }
        result1 = await goodsSalesRepo.getSalesByProjectAndSkuId(yearStart, yearEnd, productType, addSales, skuInfo)
        result2 = await goodsSalesRepo.getSalesByProjectAndSkuId(monthStart, monthEnd, productType, addSales, skuInfo)
    } else {
        for (let i = 0; i < project?.length; i++) {
            if (resultMap[project[i].project_name] == undefined) {
                result.push({
                    project_name: project[i].project_name,
                    sale_qty: 0,
                    sale_amount: 0,
                    gross_profit: 0,
                    profit: 0
                })
                resultMap[project[i].project_name] = result.length - 1
            }
            result[resultMap[project[i].project_name]].sale_qty += parseInt(project[i].sale_qty)
            result[resultMap[project[i].project_name]].sale_amount += parseFloat(project[i].sale_amount)
            result[resultMap[project[i].project_name]].gross_profit += parseFloat(project[i].gross_profit)
            result[resultMap[project[i].project_name]].profit += parseFloat(project[i].profit)
        }
        result1 = await goodsSalesRepo.getSalesByProjectAndSkuId(yearStart, yearEnd, productType, addSales)
        result2 = await goodsSalesRepo.getSalesByProjectAndSkuId(monthStart, monthEnd, productType, addSales)
    }
    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result1.length; j++) {
            if (result[i].project_name == result1[j].project_name) {
                result[i]['sale_amount_yoy'] = result1[j].sale_amount > 0 ? 
                    ((result[i].sale_amount - result1[j].sale_amount) / result1[j].sale_amount * 100).toFixed(2) : 0
                result1.splice(j, 1)
                break
            }
        }
        for (let j = 0; j < result2.length; j++) {
            if (result[i].project_name == result2[j].project_name) {
                result[i]['sale_amount_qoq'] = result2[j].sale_amount > 0 ? 
                    ((result[i].sale_amount - result2[j].sale_amount) / result2[j].sale_amount * 100).toFixed(2) : 0
                result2.splice(j, 1)
                break
            }
        }
        result[i].gross_margin = result[i].sale_amount > 0 ? 
            (result[i].gross_profit / result[i].sale_amount * 100).toFixed(2) : 0
        result[i].profit_margin = result[i].sale_amount > 0 ? 
            (result[i].profit / result[i].sale_amount * 100).toFixed(2) : 0
        result[i].sale_amount = (result[i].sale_amount / 10000).toFixed(2)
        result[i].gross_profit = (result[i].gross_profit / 10000).toFixed(2)
        result[i].profit = (result[i].profit / 10000).toFixed(2)
    }
    return result
}

developmentService.getProductSalesThird = async (start, end, type, productType, addSales, shop_name) => {
    let result = [], skuids = '', skuMap = {}, resultMap = {}, result1 = [], result2 = []
    let shop = await goodsSalesRepo.getSalesByShop(start, end, productType, addSales, shop_name)
    const yearStart = moment(start).subtract(1, 'year').format('YYYY-MM-DD')
    const yearEnd = moment(end).subtract(1, 'year').format('YYYY-MM-DD')
    const monthStart = moment(start).subtract(1, 'month').format('YYYY-MM-DD')
    const monthEnd = moment(end).subtract(1, 'month').format('YYYY-MM-DD')
    if (type != '0') {
        for (let i = 0; i < shop.length; i++) {
            if (!skuMap[shop[i].sku_code]) {
                skuids = `${skuids}","`
            }
        }
        let skuInfo1 = [], skuInfo2 = [], skuInfo = ''
        if (['3', '4', '5'].includes(type)) {
            skuInfo1 = await newFormsRepo.getProductSkuId(skuids, type)
        }
        if (skuInfo1?.length) skuInfo = `${skuInfo}"${skuInfo1[0].skuids}",`
        skuInfo2 = await actHiProcinstRepo.getProductSkuId(start, type)
        for (let i = 0; i < skuInfo2.length; i++) {
            let content = new ObjectInputStream(skuInfo2[i].info)
            content = content.readObject()
            content?.annotations.splice(0, 1)
            content = content?.annotations
            for (let j = 0; j < content.length; j++) {
                content[j].annotations.splice(0, 1)
                for (let k = 0; k < content[j].annotations.length; k = k+2) {
                    if (['F1ujma2exiosbcc', 'Fssama252xmjbzc', 'Fxx1ma3pg5efdec'].includes(content[j].annotations[k]))
                        skuInfo = `${skuInfo}"${content[j].annotations[k+1]}",`
                }
            }
        }
        skuInfo = skuInfo?.length ? skuInfo.substring(0, skuInfo.length - 1) : skuInfo
        for (let i = 0; i < shop.length; i++) {
            if (skuInfo.indexOf(`"${shop[i].sku_code}"`) != -1) {
                if (resultMap[shop[i].shop_name] == undefined) {
                    result.push({
                        shop_name: shop[i].shop_name,
                        sale_qty: 0,
                        sale_amount: 0,
                        gross_profit: 0,
                        profit: 0
                    })
                    resultMap[shop[i].shop_name] = result.length - 1
                }
                result[resultMap[shop[i].shop_name]].sale_qty += parseInt(shop[i].sale_qty)
                result[resultMap[shop[i].shop_name]].sale_amount += parseFloat(shop[i].sale_amount)
                result[resultMap[shop[i].shop_name]].gross_profit += parseFloat(shop[i].gross_profit)
                result[resultMap[shop[i].shop_name]].profit += parseFloat(shop[i].profit)
            }
        }
        result1 = await goodsSalesRepo.getSalesByShopAndSkuId(yearStart, yearEnd, productType, addSales, shop_name, skuInfo)
        result2 = await goodsSalesRepo.getSalesByShopAndSkuId(monthStart, monthEnd, productType, addSales, shop_name, skuInfo)
    } else {
        for (let i = 0; i < shop.length; i++) {
            if (resultMap[shop[i].shop_name] == undefined) {
                result.push({
                    shop_name: shop[i].shop_name,
                    sale_qty: 0,
                    sale_amount: 0,
                    gross_profit: 0,
                    profit: 0
                })
                resultMap[shop[i].shop_name] = result.length - 1
            }
            result[resultMap[shop[i].shop_name]].sale_qty += parseInt(shop[i].sale_qty)
            result[resultMap[shop[i].shop_name]].sale_amount += parseFloat(shop[i].sale_amount)
            result[resultMap[shop[i].shop_name]].gross_profit += parseFloat(shop[i].gross_profit)
            result[resultMap[shop[i].shop_name]].profit += parseFloat(shop[i].profit)
        }
        result1 = await goodsSalesRepo.getSalesByShopAndSkuId(yearStart, yearEnd, productType, shop_name, addSales)
        result2 = await goodsSalesRepo.getSalesByShopAndSkuId(monthStart, monthEnd, productType, shop_name, addSales)
    }
    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result1.length; j++) {
            if (result[i].shop_name == result1[j].shop_name) {
                result[i]['sale_amount_yoy'] = result1[j].sale_amount > 0 ? 
                    ((result[i].sale_amount - result1[j].sale_amount) / result1[j].sale_amount * 100).toFixed(2) : 0
                result1.splice(j, 1)
                break
            }
        }
        for (let j = 0; j < result2.length; j++) {
            if (result[i].shop_name == result2[j].shop_name) {
                result[i]['sale_amount_qoq'] = result2[j].sale_amount > 0 ? 
                    ((result[i].sale_amount - result2[j].sale_amount) / result2[j].sale_amount * 100).toFixed(2) : 0
                result2.splice(j, 1)
                break
            }
        }
        result[i].gross_margin = result[i].sale_amount > 0 ? 
            (result[i].gross_profit / result[i].sale_amount * 100).toFixed(2) : 0
        result[i].profit_margin = result[i].sale_amount > 0 ? 
            (result[i].profit / result[i].sale_amount * 100).toFixed(2) : 0
        result[i].sale_amount = (result[i].sale_amount / 10000).toFixed(2)
        result[i].gross_profit = (result[i].gross_profit / 10000).toFixed(2)
        result[i].profit = (result[i].profit / 10000).toFixed(2)
    }
    return result
}

developmentService.getProductSalesFourth = async (start, end, type, productType, addSales, spu_name) => {
    let result = [], skuids = '', skuMap = {}, resultMap = {}, result1 = [], result2 = []
    let spu = await goodsSalesRepo.getSalesBySpu(start, end, productType, addSales, spu_name)
    const yearStart = moment(start).subtract(1, 'year').format('YYYY-MM-DD')
    const yearEnd = moment(end).subtract(1, 'year').format('YYYY-MM-DD')
    const monthStart = moment(start).subtract(1, 'month').format('YYYY-MM-DD')
    const monthEnd = moment(end).subtract(1, 'month').format('YYYY-MM-DD')
    if (type != '0') {
        for (let i = 0; i < spu.length; i++) {
            if (!skuMap[spu[i].sku_code]) {
                skuids = `${skuids}","`
            }
        }
        let skuInfo1 = [], skuInfo2 = [], skuInfo = ''
        if (['3', '4', '5'].includes(type)) {
            skuInfo1 = await newFormsRepo.getProductSkuId(skuids, type)
        }
        if (skuInfo1?.length) skuInfo = `${skuInfo}"${skuInfo1[0].skuids}",`
        skuInfo2 = await actHiProcinstRepo.getProductSkuId(start, type)
        for (let i = 0; i < skuInfo2.length; i++) {
            let content = new ObjectInputStream(skuInfo2[i].info)
            content = content.readObject()
            content?.annotations.splice(0, 1)
            content = content?.annotations
            for (let j = 0; j < content.length; j++) {
                content[j].annotations.splice(0, 1)
                for (let k = 0; k < content[j].annotations.length; k = k+2) {
                    if (['F1ujma2exiosbcc', 'Fssama252xmjbzc', 'Fxx1ma3pg5efdec'].includes(content[j].annotations[k]))
                        skuInfo = `${skuInfo}"${content[j].annotations[k+1]}",`
                }
            }
        }
        skuInfo = skuInfo?.length ? skuInfo.substring(0, skuInfo.length - 1) : skuInfo
        for (let i = 0; i < spu.length; i++) {
            if (skuInfo.indexOf(`"${project[i].sku_code}"`) != -1) {
                if (resultMap[project[i].spu] == undefined) {
                    result.push({
                        spu: spu[i].spu,
                        sale_qty: 0,
                        sale_amount: 0,
                        gross_profit: 0,
                        profit: 0
                    })
                    resultMap[spu[i].spu] = result.length - 1
                }
                result[resultMap[spu[i].spu]].sale_qty += parseInt(spu[i].sale_qty)
                result[resultMap[spu[i].spu]].sale_amount += parseFloat(spu[i].sale_amount)
                result[resultMap[spu[i].spu]].gross_profit += parseFloat(spu[i].gross_profit)
                result[resultMap[spu[i].spu]].profit += parseFloat(spu[i].profit)
            }
        }
        result1 = await goodsSalesRepo.getSalesBySpuAndSkuId(yearStart, yearEnd, productType, addSales, spu_name, skuInfo)
        result2 = await goodsSalesRepo.getSalesBySpuAndSkuId(monthStart, monthEnd, productType, spu_name, addSales, skuInfo)
    } else {
        for (let i = 0; i < spu.length; i++) {
            if (resultMap[spu[i].spu] == undefined) {
                result.push({
                    spu: spu[i].spu,
                    sale_qty: 0,
                    sale_amount: 0,
                    gross_profit: 0,
                    profit: 0
                })
                resultMap[spu[i].spu] = result.length - 1
            }
            result[resultMap[spu[i].spu]].sale_qty += parseInt(spu[i].sale_qty)
            result[resultMap[spu[i].spu]].sale_amount += parseFloat(spu[i].sale_amount)
            result[resultMap[spu[i].spu]].gross_profit += parseFloat(spu[i].gross_profit)
            result[resultMap[spu[i].spu]].profit += parseFloat(spu[i].profit)
        }
        result1 = await goodsSalesRepo.getSalesBySpuAndSkuId(yearStart, yearEnd, productType, addSales)
        result2 = await goodsSalesRepo.getSalesBySpuAndSkuId(monthStart, monthEnd, productType, addSales)
    }
    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result1.length; j++) {
            if (result[i].spu == result1[j].spu) {
                result[i]['sale_amount_yoy'] = result1[j].sale_amount > 0 ? 
                    ((result[i].sale_amount - result1[j].sale_amount) / result1[j].sale_amount * 100).toFixed(2) : 0
                result1.splice(j, 1)
                break
            }
        }
        for (let j = 0; j < result2.length; j++) {
            if (result[i].spu == result2[j].spu) {
                result[i]['sale_amount_qoq'] = result2[j].sale_amount > 0 ? 
                    ((result[i].sale_amount - result2[j].sale_amount) / result2[j].sale_amount * 100).toFixed(2) : 0
                result2.splice(j, 1)
                break
            }
        }
        result[i].gross_margin = result[i].sale_amount > 0 ? 
            (result[i].gross_profit / result[i].sale_amount * 100).toFixed(2) : 0
        result[i].profit_margin = result[i].sale_amount > 0 ? 
            (result[i].profit / result[i].sale_amount * 100).toFixed(2) : 0
        result[i].sale_amount = (result[i].sale_amount / 10000).toFixed(2)
        result[i].gross_profit = (result[i].gross_profit / 10000).toFixed(2)
        result[i].profit = (result[i].profit / 10000).toFixed(2)
    }
    return result
}

module.exports = developmentService