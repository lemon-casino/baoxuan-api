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
const { getRealDepartment, getRealProject } = require('@/service/departmentService')
const userSettingRepo = require('@/repository/userSettingRepo')
const processesRepo = require('@/repository/process/processesRepo')

developmentService.getDataStats = async (type, start, end, month, timeType, project, process) => {
    let result = []
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

developmentService.getRunningProcessInfo = async (params) => {
    if (!params.start_time) return []
    let start = moment(params.start_time).format('YYYY-MM-DD')
    let end = moment(params.end_time).format('YYYY-MM-DD') + ' 23:59:59'
    let result = await actHiProcinstRepo.getRunning(start, end)
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

developmentService.getProductDevelopInfo = async (params, id) => {
    let start = moment(params.start).format('YYYY-MM-DD')
    let end = moment(params.end).format('YYYY-MM-DD') + ' 23:59:59'
    let columns = [], indexGoodsMap = {}
    if (params.infoType == 0) {        
        let defautColumns = await userSettingRepo.getByType(id, 8)
        if (defautColumns?.length) columns = JSON.parse(defautColumns[0].attributes)
        else
            columns = [
                { label: '开发性质', field_id: 'type', visible: true },
                { label: '开发人', field_id: 'director', visible: true },
                { label: '推品数量', field_id: 'create_num', visible: true },
                { label: '流程中的数量', field_id: 'running_num', visible: true },
                { label: '拒绝数量', field_id: 'reject_num', visible: true },
                { label: '选中SPU数量', field_id: 'selected_num', visible: true },
                { label: '推品到选中平均时长', field_id: 'selected_time', visible: true },
                { label: '采购SPU数量', field_id: 'purchase_num', visible: true },
                { label: '选中到采购平均时长', field_id: 'purchase_time', visible: true },
                { label: '选中到采购时长超时SPU数量', field_id: 'out_purchase_num', visible: true, info: '从选中到下采购单3天' },
                { label: '上架SPU数量', field_id: 'shelf_num', visible: true },
                { label: '采购到入仓平均时长', field_id: 'warehousing_time', visible: true, info: '以实际SKU入仓时间计算时长' },
                { label: '采购到入仓时长超时SPU量', field_id: 'out_warehousing_num', visible: true, info: '只要有一个SKU超时，即显示超时' },
                { label: '入仓到上架平均时长', field_id: 'shelf_time', visible: true, info: '上架时间以店铺商品信息创建时间为准' },
                { label: '上架时长超时SPU量', field_id: 'out_shelf_num', visible: true, info: '以一个SKU超时即为超时，限制天数为1天（自然日）' },
                { label: '选中率(%)', field_id: 'selected_percent', visible: true, info: '选中数量/推品数量*100%，以SPU为维度计算' },
                { label: '推品采购率(%)', field_id: 'purchase_percent', visible: true, info: '采购数量/推品数量*100%，以SPU为准' },
                { label: '上架链接数量', field_id: 'shelf_link_num', visible: true, info: '以聚水潭店铺商品信息为准' },
                { label: '上架率(%)', field_id: 'shelf_percent', visible: true, info: '上架率=上架数量/入仓数量' }
            ]
    } else {
        let defautColumns = await userSettingRepo.getByType(id, 9)
        if (defautColumns?.length) columns = JSON.parse(defautColumns[0].attributes)
        else
            columns = [
                { label: '事业部', field_id: 'division', visible: true, info: '发起人所在部门' },
                { label: '平台', field_id: 'project', visible: true },
                { label: '开发人', field_id: 'director', visible: true },
                { label: '推品数量', field_id: 'create_num', visible: true },
                { label: '流程中的数量', field_id: 'running_num', visible: true },
                { label: '拒绝数量', field_id: 'reject_num', visible: true },
                { label: '选中SPU数量', field_id: 'selected_num', visible: true },
                { label: '推品到选中平均时长', field_id: 'selected_time', visible: true },
                { label: '采购SPU数量', field_id: 'purchase_num', visible: true },
                { label: '选中到采购平均时长', field_id: 'purchase_time', visible: true },
                { label: '选中到采购时长超时SPU数量', field_id: 'out_purchase_num', visible: true, info: '从选中到下采购单3天' },
                { label: '上架SPU数量', field_id: 'shelf_num', visible: true },
                { label: '采购到入仓平均时长', field_id: 'warehousing_time', visible: true, info: '以实际SKU入仓时间计算时长' },
                { label: '采购到入仓时长超时SPU量', field_id: 'out_warehousing_num', visible: true, info: '只要有一个SKU超时，即显示超时' },
                { label: '入仓到上架平均时长', field_id: 'shelf_time', visible: true, info: '上架时间以店铺商品信息创建时间为准' },
                { label: '上架时长超时SPU量', field_id: 'out_shelf_num', visible: true, info: '以一个SKU超时即为超时，限制天数为1天（自然日）' },
                { label: '选中率(%)', field_id: 'selected_percent', visible: true, info: '选中数量/推品数量*100%，以SPU为维度计算' },
                { label: '推品采购率(%)', field_id: 'purchase_percent', visible: true, info: '采购数量/推品数量*100%，以SPU为准' },
                { label: '上架链接数量', field_id: 'shelf_link_num', visible: true, info: '以聚水潭店铺商品信息为准' },
                { label: '上架率(%)', field_id: 'shelf_percent', visible: true, info: '上架率=上架数量/入仓数量' }
            ]
    }
    let defaultTmp = {
        children: {
            create: {bpm: [], yida: []},
            running: {bpm: [], yida: []},
            reject: {bpm: [], yida: []},
            selected: {bpm: [], yida: []},
        }
    }, result = [], resultMap = {}
    for (let i = 0; i < columns.length; i++) {
        defaultTmp[columns[i].field_id] = columns[i].field_id.indexOf('num') != -1 || 
            columns[i].field_id.indexOf('percent') != -1 || 
            columns[i].field_id.indexOf('time') != -1 ? 0 : null
    }
    let ftInfo = await newFormsRepo.getFtInfo(start, end)
    for (let i = 0; i < ftInfo.length; i++) {
        let tmp = JSON.parse(JSON.stringify(defaultTmp)), index
        let user = await userRepo.getUserWithDeptByDingdingUserId(ftInfo[i].creator)
        if (params.infoType == 0) {
            if (resultMap[`4_${ftInfo[i].director}___`] == undefined) {
                tmp.type = '反推推品'
                tmp.director = ftInfo[i].director
                tmp.warehousing_sku_num = 0
                tmp.shelf_sku_num = 0
                index = result.length
                result.push(tmp)
                resultMap[`4_${ftInfo[i].director}___`] = index
            } else {
                index = resultMap[`4_${ftInfo[i].director}___`]
            }
        } else {
            let dept = getRealDepartment(user.dept_name, user.nickname)
            let project = getRealProject(user.dept_name)
            if (params.project != undefined && project != params.project) continue
            if (resultMap[`${dept}_${project}_${ftInfo[i].director}___`] == undefined) {
                tmp.division = dept
                tmp.project = project
                tmp.director = ftInfo[i].director
                tmp.warehousing_sku_num = 0
                tmp.shelf_sku_num = 0
                index = result.length
                result.push(tmp)
                resultMap[`${dept}_${project}_${ftInfo[i].director}___`] = index
            } else {
                index = resultMap[`${dept}_${project}_${ftInfo[i].director}___`]
            }
        }
        if (ftInfo[i].skuids != null) {
            let skuids = ftInfo[i].skuids
            let info1 = await purchaseRepo.getBySkuCode(skuids)
            let info2 = await goodsInfoRepo.get(skuids)
            let out_warehousing = 0, out_shelf = 0
            if (info1?.length && ftInfo[i].purchase_date != null) {
                for (let j = 0; j < info1.length; j++) {
                    result[index].warehousing_time += moment(info1[j].io_date).diff(moment(ftInfo[i].purchase_date), 'day')
                    result[index].warehousing_sku_num += 1
                    for (let k = 0; k < info2.length; k++) {
                        if (info1[j].sku_code == info2[k].sku_id) {
                            if (result[index].warehousing_time > info2[k].purchase_time) out_warehousing = 1
                            break
                        }
                    }
                }
            }
            if (out_warehousing) result[index].out_warehousing_num += 1
            let info3 = await goodsSkuRepo.getBySysSkuId(skuids)
            if (info3?.length) {
                result[index].shelf_num += 1
                for (let j = 0; j < info3.length; j++) {
                    result[index].shelf_sku_num += 1
                    for (let k = 0; k < info1.length; k++) {
                        if (info1[k].sku_code == info3[j].sku_id) {
                            let time = moment(info3[j].create_time).diff(moment(info1[k].io_date), 'day')
                            result[index].shelf_time += time
                            if (time > 1) out_shelf = 1
                            break
                        }
                    }
                    if (indexGoodsMap[`${index}_${info3[j].goods_id}`] == undefined) {
                        result[index].shelf_link_num += 1
                        indexGoodsMap[`${index}_${info3[j].goods_id}`] = true
                    }
                }
            }
            if (out_shelf) result[index].out_shelf_num += 1
        }
        result[index].create_num += 1
        result[index].running_num += ftInfo[i].running
        result[index].reject_num += ftInfo[i].reject
        result[index].selected_num += ftInfo[i].selected
        result[index].selected_time += (ftInfo[i].selected && ftInfo[i].selected_time != null) ? 
            ftInfo[i].selected_time : 0
        result[index].purchase_num += ftInfo[i].purchase_date ? 1:0
        result[index].purchase_time += ftInfo[i].purchase_time || 0
        result[index].out_purchase_num += ftInfo[i].purchase_time > 3 ? 1:0
        result[index].children['create'].yida.push(ftInfo[i].id)
        if (ftInfo[i].running)
            result[index].children['running'].yida.push(ftInfo[i].id)
        if (ftInfo[i].reject)
            result[index].children['reject'].yida.push(ftInfo[i].id)
        if (ftInfo[i].selected)
            result[index].children['selected'].yida.push(ftInfo[i].id)
    }
    ftInfo = await actHiProcinstRepo.getNewFtInfo(start, end)
    for (let i = 0; i < ftInfo.length; i++) {
        let tmp = JSON.parse(JSON.stringify(defaultTmp)), index
        if (params.infoType == 0) {
            if (resultMap[`4_${ftInfo[i].director}`] == undefined) {
                tmp.type = '反推推品'
                tmp.director = ftInfo[i].director
                tmp.warehousing_sku_num = 0
                tmp.shelf_sku_num = 0
                index = result.length
                result.push(tmp)
                resultMap[`4_${ftInfo[i].director}`] = index
            } else {
                index = resultMap[`4_${ftInfo[i].director}`]
            }
        } else {
            let dept = getRealDepartment(ftInfo[i].dept, ftInfo[i].nickname)
            let project = getRealProject(ftInfo[i].dept)
            if (params.project != undefined && project != params.project) continue
            if (resultMap[`${dept}_${project}_${ftInfo[i].director}`] == undefined) {
                tmp.division = dept
                tmp.project = project
                tmp.director = ftInfo[i].director
                tmp.warehousing_sku_num = 0
                tmp.shelf_sku_num = 0
                index = result.length
                result.push(tmp)
                resultMap[`${dept}_${project}_${ftInfo[i].director}`] = index
            } else {
                index = resultMap[`${dept}_${project}_${ftInfo[i].director}`]
            }
        }
        if (ftInfo[i].info != null) {
            let content = new ObjectInputStream(ftInfo[i].info), skuids = ''
            content = content.readObject()
            content?.annotations.splice(0, 1)
            content = content?.annotations
            for (let j = 0; j < content?.length; j++) {
                for (let k = 0; k < content[j].annotations.length; k++) {
                    if (['Fxx1ma3pg5efdec', 'F1ujma2exiosbcc', 'Fssama252xmjbzc'].includes(content[j].annotations[k])) {
                        skuids = `${skuids}${content[j].annotations[k+1]}","`
                    }
                }
            }
            if (skuids?.length) skuids = skuids.substring(0, skuids.length - 3)
            let info1 = await purchaseRepo.getBySkuCode(skuids)
            let info2 = await goodsInfoRepo.get(skuids)
            let out_warehousing = 0, out_shelf = 0
            if (info1?.length && ftInfo[i].purchase_date != null) {
                for (let j = 0; j < info1.length; j++) {
                    result[index].warehousing_time += moment(info1[j].io_date).diff(moment(ftInfo[i].purchase_date), 'day')
                    result[index].warehousing_sku_num += 1
                    for (let k = 0; k < info2.length; k++) {
                        if (info1[j].sku_code == info2[k].sku_id) {
                            if (result[index].warehousing_time > info2[k].purchase_time) out_warehousing = 1
                            break
                        }
                    }
                }
            }
            if (out_warehousing) result[index].out_warehousing_num += 1
            let info3 = await goodsSkuRepo.getBySysSkuId(skuids)
            if (info3?.length) {
                result[index].shelf_num += 1
                for (let j = 0; j < info3.length; j++) {
                    result[index].shelf_sku_num += 1
                    for (let k = 0; k < info1.length; k++) {
                        if (info1[k].sku_code == info3[j].sku_id) {
                            let time = moment(info3[j].create_time).diff(moment(info1[k].io_date), 'day')
                            result[index].shelf_time += time
                            if (time > 1) out_shelf = 1
                            break
                        }
                    }
                    if (indexGoodsMap[`${index}_${info3[j].goods_id}`] == undefined) {
                        result[index].shelf_link_num += 1
                        indexGoodsMap[`${index}_${info3[j].goods_id}`] = true
                    }
                }
            }
            if (out_shelf) result[index].out_shelf_num += 1
        }
        result[index].create_num += 1
        result[index].running_num += ftInfo[i].running
        result[index].reject_num += ftInfo[i].reject
        result[index].selected_num += ftInfo[i].selected
        result[index].selected_time += (ftInfo[i].selected && ftInfo[i].selected_time != null) ?
            ftInfo[i].selected_time : 0
        result[index].purchase_num += ftInfo[i].purchase_date ? 1:0
        result[index].purchase_time += ftInfo[i].purchase_time || 0
        result[index].out_purchase_num += ftInfo[i].purchase_time > 3 ? 1:0
        result[index].children['create'].bpm.push(ftInfo[i].id)
        if (ftInfo[i].running)
            result[index].children['running'].bpm.push(ftInfo[i].id)
        if (ftInfo[i].reject)
            result[index].children['reject'].bpm.push(ftInfo[i].id)
        if (ftInfo[i].selected)
            result[index].children['selected'].bpm.push(ftInfo[i].id)
    }
    let ztInfo = await newFormsRepo.getZtInfo(start, end)
    for (let i = 0; i < ztInfo.length; i++) {
        let tmp = JSON.parse(JSON.stringify(defaultTmp)), index
        let user = await userRepo.getUserWithDeptByDingdingUserId(ztInfo[i].creator)
        if (params.infoType == 0) {
            if (resultMap[`3_${user.nickname}___`] == undefined) {
                tmp.type = '供应商推品'
                tmp.director = user.nickname
                tmp.warehousing_sku_num = 0
                tmp.shelf_sku_num = 0
                index = result.length
                result.push(tmp)
                resultMap[`3_${user.nickname}___`] = index
            } else {
                index = resultMap[`3_${user.nickname}___`]
            }
        } else {
            let dept = getRealDepartment(user.dept_name, user.nickname)
            let project = getRealProject(user.dept_name)
            if (params.project != undefined && project != params.project) continue
            if (resultMap[`${dept}_${project}_${user.nickname}___`] == undefined) {
                tmp.division = dept
                tmp.project = project
                tmp.director = user.nickname
                tmp.warehousing_sku_num = 0
                tmp.shelf_sku_num = 0
                index = result.length
                result.push(tmp)
                resultMap[`${dept}_${project}_${user.nickname}___`] = index
            } else {
                index = resultMap[`${dept}_${project}_${user.nickname}___`]
            }
        }
        if (ztInfo[i].skuids != null) {
            let skuids = ztInfo[i].skuids
            let info1 = await purchaseRepo.getBySkuCode(skuids)
            let info2 = await goodsInfoRepo.get(skuids)
            let out_warehousing = 0, out_shelf = 0
            if (info1?.length && ztInfo[i].purchase_date != null) {
                for (let j = 0; j < info1.length; j++) {
                    result[index].warehousing_time += moment(info1[j].io_date).diff(moment(ztInfo[i].purchase_date), 'day')
                    result[index].warehousing_sku_num += 1
                    for (let k = 0; k < info2.length; k++) {
                        if (info1[j].sku_code == info2[k].sku_id) {
                            if (result[index].warehousing_time > info2[k].purchase_time) out_warehousing = 1
                            break
                        }
                    }
                }
            }
            if (out_warehousing) result[index].out_warehousing_num += 1
            let info3 = await goodsSkuRepo.getBySysSkuId(skuids)
            if (info3?.length) {
                result[index].shelf_num += 1
                for (let j = 0; j < info3.length; j++) {
                    result[index].shelf_sku_num += 1
                    for (let k = 0; k < info1.length; k++) {
                        if (info1[k].sku_code == info3[j].sku_id) {
                            let time = moment(info3[j].create_time).diff(moment(info1[k].io_date), 'day')
                            result[index].shelf_time += time
                            if (time > 1) out_shelf = 1
                            break
                        }
                    }
                    if (indexGoodsMap[`${index}_${info3[j].goods_id}`] == undefined) {
                        result[index].shelf_link_num += 1
                        indexGoodsMap[`${index}_${info3[j].goods_id}`] = true
                    }
                }
            }
            if (out_shelf) result[index].out_shelf_num += 1
        }
        result[index].create_num += 1
        result[index].running_num += ztInfo[i].running
        result[index].reject_num += ztInfo[i].reject
        result[index].selected_num += ztInfo[i].selected
        result[index].selected_time += (ztInfo[i].selected && ztInfo[i].selected_time != null) ? 
            ztInfo[i].selected_time : 0
        result[index].purchase_num += ztInfo[i].purchase_date ? 1:0
        result[index].purchase_time += ztInfo[i].purchase_time || 0
        result[index].out_purchase_num += ztInfo[i].purchase_time > 3 ? 1:0
        result[index].children['create'].yida.push(ztInfo[i].id)
        if (ztInfo[i].running)
            result[index].children['running'].yida.push(ztInfo[i].id)
        if (ztInfo[i].reject)
            result[index].children['reject'].yida.push(ztInfo[i].id)
        if (ztInfo[i].selected)
            result[index].children['selected'].yida.push(ztInfo[i].id)
    }
    ztInfo = await actHiProcinstRepo.getNewGysInfo(start, end)
    for (let i = 0; i < ztInfo.length; i++) {
        let tmp = JSON.parse(JSON.stringify(defaultTmp)), index
        if (params.infoType == 0) {
            if (resultMap[`3_${ztInfo[i].nickname}`] == undefined) {
                tmp.type = '供应商推品'
                tmp.director = ztInfo[i].nickname
                tmp.warehousing_sku_num = 0
                tmp.shelf_sku_num = 0
                index = result.length
                result.push(tmp)
                resultMap[`3_${ztInfo[i].nickname}`] = index
            } else {
                index = resultMap[`3_${ztInfo[i].nickname}`]
            }
        } else {
            let dept = getRealDepartment(ztInfo[i].dept, ztInfo[i].nickname)
            let project = getRealProject(ztInfo[i].dept)
            if (params.project != undefined && project != params.project) continue
            if (resultMap[`${dept}_${project}_${ztInfo[i].nickname}`] == undefined) {
                tmp.division = dept
                tmp.project = project
                tmp.director = ztInfo[i].nickname
                tmp.warehousing_sku_num = 0
                tmp.shelf_sku_num = 0
                index = result.length
                result.push(tmp)
                resultMap[`${dept}_${project}_${ztInfo[i].nickname}`] = index
            } else {
                index = resultMap[`${dept}_${project}_${ztInfo[i].nickname}`]
            }
        }
        if (ztInfo[i].info != null) {
            let content = new ObjectInputStream(ztInfo[i].info), skuids = ''
            content = content.readObject()
            content?.annotations.splice(0, 1)
            content = content?.annotations
            for (let j = 0; j < content?.length; j++) {
                for (let k = 0; k < content[j].annotations.length; k++) {
                    if (['Fxx1ma3pg5efdec', 'F1ujma2exiosbcc', 'Fssama252xmjbzc'].includes(content[j].annotations[k])) {
                        skuids = `${skuids}${content[j].annotations[k+1]}","`
                    }
                }
            }
            if (skuids?.length) skuids = skuids.substring(0, skuids.length - 3)
            let info1 = await purchaseRepo.getBySkuCode(skuids)
            let info2 = await goodsInfoRepo.get(skuids)
            let out_warehousing = 0, out_shelf = 0
            if (info1?.length && ztInfo[i].purchase_date != null) {
                for (let j = 0; j < info1.length; j++) {
                    result[index].warehousing_time += moment(info1[j].io_date).diff(moment(ztInfo[i].purchase_date), 'day')
                    result[index].warehousing_sku_num += 1
                    for (let k = 0; k < info2.length; k++) {
                        if (info1[j].sku_code == info2[k].sku_id) {
                            if (result[index].warehousing_time > info2[k].purchase_time) out_warehousing = 1
                            break
                        }
                    }
                }
            }
            if (out_warehousing) result[index].out_warehousing_num += 1
            let info3 = await goodsSkuRepo.getBySysSkuId(skuids)
            if (info3?.length) {
                result[index].shelf_num += 1
                for (let j = 0; j < info3.length; j++) {
                    result[index].shelf_sku_num += 1
                    for (let k = 0; k < info1.length; k++) {
                        if (info1[k].sku_code == info3[j].sku_id) {
                            let time = moment(info3[j].create_time).diff(moment(info1[k].io_date), 'day')
                            result[index].shelf_time += time
                            if (time > 1) out_shelf = 1
                            break
                        }
                    }
                    if (indexGoodsMap[`${index}_${info3[j].goods_id}`] == undefined) {
                        result[index].shelf_link_num += 1
                        indexGoodsMap[`${index}_${info3[j].goods_id}`] = true
                    }
                }
            }
            if (out_shelf) result[index].out_shelf_num += 1
        }
        result[index].create_num += 1
        result[index].running_num += ztInfo[i].running
        result[index].reject_num += ztInfo[i].reject
        result[index].selected_num += ztInfo[i].selected
        result[index].selected_time += (ztInfo[i].selected && ztInfo[i].selected_time != null) ? 
            ztInfo[i].selected_time : 0
        result[index].purchase_num += ztInfo[i].purchase_date ? 1:0
        result[index].purchase_time += ztInfo[i].purchase_time || 0
        result[index].out_purchase_num += ztInfo[i].purchase_time > 3 ? 1:0
        result[index].children['create'].bpm.push(ztInfo[i].id)
        if (ztInfo[i].running)
            result[index].children['running'].bpm.push(ztInfo[i].id)
        if (ztInfo[i].reject)
            result[index].children['reject'].bpm.push(ztInfo[i].id)
        if (ztInfo[i].selected)
            result[index].children['selected'].bpm.push(ztInfo[i].id)
    }
    let zyInfo = await actHiProcinstRepo.getNewZyInfo(start, end)
    for (let i = 0; i < zyInfo.length; i++) {
        let tmp = JSON.parse(JSON.stringify(defaultTmp)), index
        if (zyInfo[i].director == null) {                    
            let dept = getRealDepartment(zyInfo[i].dept, zyInfo[i].nickname)
            if (dept == '企划部') zyInfo[i].director = zyInfo[i].nickname
        }
        if (params.infoType == 0) {
            if (resultMap[`1_${zyInfo[i].director}`] == undefined) {
                tmp.type = '自研推品'
                tmp.director = zyInfo[i].director
                tmp.warehousing_sku_num = 0
                tmp.shelf_sku_num = 0
                index = result.length
                result.push(tmp)
                resultMap[`1_${zyInfo[i].director}`] = index
            } else {
                index = resultMap[`1_${zyInfo[i].director}`]
            }
        } else {
            let dept = getRealDepartment(zyInfo[i].dept, zyInfo[i].nickname)
            let project = getRealProject(zyInfo[i].dept)
            if (params.project != undefined && project != params.project) continue
            if (resultMap[`${dept}_${project}_${zyInfo[i].director}`] == undefined) {
                tmp.division = dept
                tmp.project = project
                tmp.director = zyInfo[i].director
                tmp.warehousing_sku_num = 0
                tmp.shelf_sku_num = 0
                index = result.length
                result.push(tmp)
                resultMap[`${dept}_${project}_${zyInfo[i].director}`] = index
            } else {
                index = resultMap[`${dept}_${project}_${zyInfo[i].director}`]
            }
        }        
        if (zyInfo[i].info != null) {
            let content = new ObjectInputStream(zyInfo[i].info), skuids = ''
            content = content.readObject()
            content?.annotations.splice(0, 1)
            content = content?.annotations
            for (let j = 0; j < content?.length; j++) {
                for (let k = 0; k < content[j].annotations.length; k++) {
                    if (['Fxx1ma3pg5efdec', 'F1ujma2exiosbcc', 'Fssama252xmjbzc'].includes(content[j].annotations[k])) {
                        skuids = `${skuids}${content[j].annotations[k+1]}","`
                    }
                }
            }
            if (skuids?.length) skuids = skuids.substring(0, skuids.length - 3)
            let info1 = await purchaseRepo.getBySkuCode(skuids)
            let info2 = await goodsInfoRepo.get(skuids)
            let out_warehousing = 0, out_shelf = 0
            if (info1?.length && zyInfo[i].purchase_date != null) {
                for (let j = 0; j < info1.length; j++) {
                    result[index].warehousing_time += moment(info1[j].io_date).diff(moment(zyInfo[i].purchase_date), 'day')
                    result[index].warehousing_sku_num += 1
                    for (let k = 0; k < info2.length; k++) {
                        if (info1[j].sku_code == info2[k].sku_id) {
                            if (result[index].warehousing_time > info2[k].purchase_time) out_warehousing = 1
                            break
                        }
                    }
                }
            }
            if (out_warehousing) result[index].out_warehousing_num += 1
            let info3 = await goodsSkuRepo.getBySysSkuId(skuids)
            if (info3?.length) {
                result[index].shelf_num += 1
                for (let j = 0; j < info3.length; j++) {
                    result[index].shelf_sku_num += 1
                    for (let k = 0; k < info1.length; k++) {
                        if (info1[k].sku_code == info3[j].sku_id) {
                            let time = moment(info3[j].create_time).diff(moment(info1[k].io_date), 'day')
                            result[index].shelf_time += time
                            if (time > 1) out_shelf = 1
                            break
                        }
                    }
                    if (indexGoodsMap[`${index}_${info3[j].goods_id}`] == undefined) {
                        result[index].shelf_link_num += 1
                        indexGoodsMap[`${index}_${info3[j].goods_id}`] = true
                    }
                }
            }
            if (out_shelf) result[index].out_shelf_num += 1
        }
        result[index].create_num += 1
        result[index].running_num += zyInfo[i].running
        result[index].reject_num += zyInfo[i].reject
        result[index].selected_num += zyInfo[i].selected
        result[index].selected_time += (zyInfo[i].selected && zyInfo[i].selected_time) ? 
            zyInfo[i].selected_time : 0
        result[index].purchase_num += zyInfo[i].purchase_date ? 1:0
        result[index].purchase_time += zyInfo[i].purchase_time || 0
        result[index].out_purchase_num += zyInfo[i].purchase_time > 3 ? 1:0
        result[index].children['create'].bpm.push(zyInfo[i].id)
        if (zyInfo[i].running)
            result[index].children['running'].bpm.push(zyInfo[i].id)
        if (zyInfo[i].reject)
            result[index].children['reject'].bpm.push(zyInfo[i].id)
        if (zyInfo[i].selected)
            result[index].children['selected'].bpm.push(zyInfo[i].id)
    }
    let ipInfo = await newFormsRepo.getIpInfo(start, end)
    for (let i = 0; i < ipInfo.length; i++) {
        let tmp = JSON.parse(JSON.stringify(defaultTmp)), index
        let user = await userRepo.getUserWithDeptByDingdingUserId(ipInfo[i].creator)
        if (params.infoType == 0) {
            if (resultMap[`2_${ipInfo[i].director}___`] == undefined) {
                tmp.type = 'IP推品'
                tmp.director = ipInfo[i].director
                tmp.warehousing_sku_num = 0
                tmp.shelf_sku_num = 0
                index = result.length
                result.push(tmp)
                resultMap[`2_${ipInfo[i].director}___`] = index
            } else {
                index = resultMap[`1_${ipInfo[i].director}___`]
            }
        } else {
            let dept = getRealDepartment(user.dept_name, user.nickname)
            let project = getRealProject(user.dept_name)
            if (params.project != undefined && project != params.project) continue
            if (resultMap[`${dept}_${project}_${ipInfo[i].director}___`] == undefined) {
                tmp.division = dept
                tmp.project = project
                tmp.director = ipInfo[i].director
                tmp.warehousing_sku_num = 0
                tmp.shelf_sku_num = 0
                index = result.length
                result.push(tmp)
                resultMap[`${dept}_${project}_${ipInfo[i].director}___`] = index
            } else {
                index = resultMap[`${dept}_${project}_${ipInfo[i].director}___`]
            }
        }
        if (ipInfo[i].skuids != null) {
            let skuids = ipInfo[i].skuids
            let info1 = await purchaseRepo.getBySkuCode(skuids)
            let info2 = await goodsInfoRepo.get(skuids)
            let out_warehousing = 0, out_shelf = 0
            if (info1?.length && ipInfo[i].purchase_date != null) {
                for (let j = 0; j < info1.length; j++) {
                    result[index].warehousing_time += moment(info1[j].io_date).diff(moment(ipInfo[i].purchase_date), 'day')
                    result[index].warehousing_sku_num += 1
                    for (let k = 0; k < info2.length; k++) {
                        if (info1[j].sku_code == info2[k].sku_id) {
                            if (result[index].warehousing_time > info2[k].purchase_time) out_warehousing = 1
                            break
                        }
                    }
                }
            }
            if (out_warehousing) result[index].out_warehousing_num += 1
            let info3 = await goodsSkuRepo.getBySysSkuId(skuids)
            if (info3?.length) {
                result[index].shelf_num += 1
                for (let j = 0; j < info3.length; j++) {
                    result[index].shelf_sku_num += 1
                    for (let k = 0; k < info1.length; k++) {
                        if (info1[k].sku_code == info3[j].sku_id) {
                            let time = moment(info3[j].create_time).diff(moment(info1[k].io_date), 'day')
                            result[index].shelf_time += time
                            if (time > 1) out_shelf = 1
                            break
                        }
                    }
                    if (indexGoodsMap[`${index}_${info3[j].goods_id}`] == undefined) {
                        result[index].shelf_link_num += 1
                        indexGoodsMap[`${index}_${info3[j].goods_id}`] = true
                    }
                }
            }
            if (out_shelf) result[index].out_shelf_num += 1
        }
        result[index].create_num += 1
        result[index].running_num += ipInfo[i].running
        result[index].reject_num += ipInfo[i].reject
        result[index].selected_num += ipInfo[i].selected
        result[index].selected_time += (ipInfo[i].selected && ipInfo[i].selected_time) ? 
            ipInfo[i].selected_time : 0
        result[index].purchase_num += ipInfo[i].purchase_date ? 1:0
        result[index].purchase_time += ipInfo[i].purchase_time || 0
        result[index].out_purchase_num += ipInfo[i].purchase_time > 3 ? 1:0
        result[index].children['create'].yida.push(ipInfo[i].id)
        if (ipInfo[i].running)
            result[index].children['running'].yida.push(ipInfo[i].id)
        if (ipInfo[i].reject)
            result[index].children['reject'].yida.push(ipInfo[i].id)
        if (ipInfo[i].selected)
            result[index].children['selected'].yida.push(ipInfo[i].id)
    }
    ipInfo = await actHiProcinstRepo.getNewIpInfo(start, end)
    for (let i = 0; i < ipInfo.length; i++) {
        let tmp = JSON.parse(JSON.stringify(defaultTmp)), index
        if (ipInfo[i].director == null) {                    
            let dept = getRealDepartment(ipInfo[i].dept, ipInfo[i].nickname)
            if (dept == '企划部') ipInfo[i].director = ipInfo[i].nickname
        }
        if (params.infoType == 0) {
            if (resultMap[`2_${ipInfo[i].director}`] == undefined) {
                tmp.type = 'IP推品'
                tmp.director = ipInfo[i].director
                tmp.warehousing_sku_num = 0
                tmp.shelf_sku_num = 0
                index = result.length
                result.push(tmp)
                resultMap[`2_${ipInfo[i].director}`] = index
            } else {
                index = resultMap[`2_${ipInfo[i].director}`]
            }
        } else {
            let dept = getRealDepartment(ipInfo[i].dept, ipInfo[i].nickname)
            let project = getRealProject(ipInfo[i].dept)
            if (params.project != undefined && project != params.project) continue
            if (resultMap[`${dept}_${project}_${ipInfo[i].director}`] == undefined) {
                tmp.division = dept
                tmp.project = project
                tmp.director = ipInfo[i].director
                tmp.warehousing_sku_num = 0
                tmp.shelf_sku_num = 0
                index = result.length
                result.push(tmp)
                resultMap[`${dept}_${project}_${ipInfo[i].director}`] = index
            } else {
                index = resultMap[`${dept}_${project}_${ipInfo[i].director}`]
            }
        }
        if (ipInfo[i].info != null) {
            let content = new ObjectInputStream(ipInfo[i].info), skuids = ''
            content = content.readObject()
            content?.annotations.splice(0, 1)
            content = content?.annotations
            for (let j = 0; j < content?.length; j++) {
                for (let k = 0; k < content[j].annotations.length; k++) {
                    if (['Fxx1ma3pg5efdec', 'F1ujma2exiosbcc', 'Fssama252xmjbzc'].includes(content[j].annotations[k])) {
                        skuids = `${skuids}${content[j].annotations[k+1]}","`
                    }
                }
            }
            if (skuids?.length) skuids = skuids.substring(0, skuids.length - 3)
            let info1 = await purchaseRepo.getBySkuCode(skuids)
            let info2 = await goodsInfoRepo.get(skuids)
            let out_warehousing = 0, out_shelf = 0
            if (info1?.length && ipInfo[i].purchase_date != null) {
                for (let j = 0; j < info1.length; j++) {
                    result[index].warehousing_time += moment(info1[j].io_date).diff(moment(ipInfo[i].purchase_date), 'day')
                    result[index].warehousing_sku_num += 1
                    for (let k = 0; k < info2.length; k++) {
                        if (info1[j].sku_code == info2[k].sku_id) {
                            if (result[index].warehousing_time > info2[k].purchase_time) out_warehousing = 1
                            break
                        }
                    }
                }
            }
            if (out_warehousing) result[index].out_warehousing_num += 1
            let info3 = await goodsSkuRepo.getBySysSkuId(skuids)
            if (info3?.length) {
                result[index].shelf_num += 1
                for (let j = 0; j < info3.length; j++) {
                    result[index].shelf_sku_num += 1
                    for (let k = 0; k < info1.length; k++) {
                        if (info1[k].sku_code == info3[j].sku_id) {
                            let time = moment(info3[j].create_time).diff(moment(info1[k].io_date), 'day')
                            result[index].shelf_time += time
                            if (time > 1) out_shelf = 1
                            break
                        }
                    }
                    if (indexGoodsMap[`${index}_${info3[j].goods_id}`] == undefined) {
                        result[index].shelf_link_num += 1
                        indexGoodsMap[`${index}_${info3[j].goods_id}`] = true
                    }
                }
            }
            if (out_shelf) result[index].out_shelf_num += 1
        }
        result[index].create_num += 1
        result[index].running_num += ipInfo[i].running
        result[index].reject_num += ipInfo[i].reject
        result[index].selected_num += ipInfo[i].selected
        result[index].selected_time += (ipInfo[i].selected && ipInfo[i].selected_time != null) ? 
            ipInfo[i].selected_time : 0
        result[index].purchase_num += ipInfo[i].purchase_date ? 1:0
        result[index].purchase_time += ipInfo[i].purchase_time || 0
        result[index].out_purchase_num += ipInfo[i].purchase_time > 3 ? 1:0
        result[index].children['create'].bpm.push(ipInfo[i].id)
        if (ipInfo[i].running)
            result[index].children['running'].bpm.push(ipInfo[i].id)
        if (ipInfo[i].reject)
            result[index].children['reject'].bpm.push(ipInfo[i].id)
        if (ipInfo[i].selected)
            result[index].children['selected'].bpm.push(ipInfo[i].id)
    }
    let scInfo = await actHiProcinstRepo.getNewSctgInfo(start, end)
    for (let i = 0; i < scInfo.length; i++) {
        let tmp = JSON.parse(JSON.stringify(defaultTmp)), index
        if (params.infoType == 0) {
            if (resultMap[`0_${scInfo[i].nickname}`] == undefined) {
                tmp.type = '市场分析推品'
                tmp.director = scInfo[i].nickname
                tmp.warehousing_sku_num = 0
                tmp.shelf_sku_num = 0
                index = result.length
                result.push(tmp)
                resultMap[`0_${scInfo[i].nickname}`] = index
            } else {
                index = resultMap[`0_${scInfo[i].nickname}`]
            }
        } else {
            let dept = getRealDepartment(scInfo[i].dept, scInfo[i].nickname)
            let project = getRealProject(scInfo[i].dept)
            if (params.project != undefined && project != params.project) continue
            if (resultMap[`${dept}_${project}_${scInfo[i].nickname}`] == undefined) {
                tmp.division = dept
                tmp.project = project
                tmp.director = scInfo[i].nickname
                tmp.warehousing_sku_num = 0
                tmp.shelf_sku_num = 0
                index = result.length
                result.push(tmp)
                resultMap[`${dept}_${project}_${scInfo[i].nickname}`] = index
            } else {
                index = resultMap[`${dept}_${project}_${scInfo[i].nickname}`]
            }
        }
        if (scInfo[i].info != null) {
            let content = new ObjectInputStream(scInfo[i].info), skuids = ''
            content = content.readObject()
            content?.annotations.splice(0, 1)
            content = content?.annotations
            for (let j = 0; j < content?.length; j++) {
                for (let k = 0; k < content[j].annotations.length; k++) {
                    if (['Fxx1ma3pg5efdec', 'F1ujma2exiosbcc', 'Fssama252xmjbzc'].includes(content[j].annotations[k])) {
                        skuids = `${skuids}${content[j].annotations[k+1]}","`
                    }
                }
            }
            if (skuids?.length) skuids = skuids.substring(0, skuids.length - 3)
            let info1 = await purchaseRepo.getBySkuCode(skuids)
            let info2 = await goodsInfoRepo.get(skuids)
            let out_warehousing = 0, out_shelf = 0
            if (info1?.length && scInfo[i].purchase_date != null) {
                for (let j = 0; j < info1.length; j++) {
                    result[index].warehousing_time += moment(info1[j].io_date).diff(moment(scInfo[i].purchase_date), 'day')
                    result[index].warehousing_sku_num += 1
                    for (let k = 0; k < info2.length; k++) {
                        if (info1[j].sku_code == info2[k].sku_id) {
                            if (result[index].warehousing_time > info2[k].purchase_time) out_warehousing = 1
                            break
                        }
                    }
                }
            }
            if (out_warehousing) result[index].out_warehousing_num += 1
            let info3 = await goodsSkuRepo.getBySysSkuId(skuids)
            if (info3?.length) {
                result[index].shelf_num += 1
                for (let j = 0; j < info3.length; j++) {
                    result[index].shelf_sku_num += 1
                    for (let k = 0; k < info1.length; k++) {
                        if (info1[k].sku_code == info3[j].sku_id) {
                            let time = moment(info3[j].create_time).diff(moment(info1[k].io_date), 'day')
                            result[index].shelf_time += time
                            if (time > 1) out_shelf = 1
                            break
                        }
                    }
                    if (indexGoodsMap[`${index}_${info3[j].goods_id}`] == undefined) {
                        result[index].shelf_link_num += 1
                        indexGoodsMap[`${index}_${info3[j].goods_id}`] = true
                    }
                }
            }
            if (out_shelf) result[index].out_shelf_num += 1
        }
        result[index].create_num += 1
        result[index].running_num += scInfo[i].running
        result[index].reject_num += scInfo[i].reject
        result[index].selected_num += scInfo[i].selected
        result[index].selected_time += (scInfo[i].selected && scInfo[i].selected_time) ? 
            scInfo[i].selected_time : 0
        result[index].purchase_num += scInfo[i].purchase_date ? 1:0
        result[index].purchase_time += scInfo[i].purchase_time || 0
        result[index].out_purchase_num += scInfo[i].purchase_time > 3 ? 1:0
        result[index].children['create'].bpm.push(scInfo[i].id)
        if (scInfo[i].running)
            result[index].children['running'].bpm.push(scInfo[i].id)
        if (scInfo[i].reject)
            result[index].children['reject'].bpm.push(scInfo[i].id)
        if (scInfo[i].selected)
            result[index].children['selected'].bpm.push(scInfo[i].id)
    }
    for (let i = 0; i < result.length; i++) {
        result[i].selected_percent = parseFloat((result[i].selected_num / result[i].create_num * 100).toFixed(2))
        result[i].purchase_percent = parseFloat((result[i].purchase_num / result[i].create_num * 100).toFixed(2))
        if (result[i].selected_num > 0) {
            result[i].selected_time = parseFloat((result[i].selected_time / result[i].selected_num).toFixed(2))
            result[i].shelf_percent = parseFloat((result[i].shelf_num / result[i].selected_num * 100).toFixed(2))
        }
        if (result[i].purchase_num > 0)
            result[i].purchase_time = parseFloat((result[i].purchase_time / result[i].purchase_num).toFixed(2))
        if (result[i].warehousing_sku_num > 0)
            result[i].warehousing_time = parseFloat((result[i].warehousing_time / result[i].warehousing_sku_num).toFixed(2))
        if (result[i].shelf_sku_num > 0)
            result[i].shelf_time = parseFloat((result[i].shelf_time / result[i].shelf_sku_num).toFixed(2))
            
    }
    if (params.infoType == 1) {
        result.sort((a, b) => {
            if (a.division == b.division) return a.project > b.project
            else if (a.division == '事业一部') return -1
            else if (b.division == '事业一部') return 1
            else if (a.division == '事业二部') return -1
            else if (b.division == '事业二部') return 1
            else if (a.division == '事业三部') return -1
            else if (b.division == '事业三部') return 1
        })
    }
    return {columns, data: result}
}

developmentService.getProductDevelopInfoDetail = async (params) => {
    let result = [], columns = []
    let info = JSON.parse(params.params)
    if (params.infoType == 0) {
        columns = [
            { label: '开发人', field_id: 'director', visible: true },
            { label: '开发性质', field_id: 'type', visible: true },
            { label: '一级类目', field_id: 'first_category', visible: true },
            { label: '二级类目', field_id: 'second_category', visible: true },
            { label: '三级类目', field_id: 'third_category', visible: true },
            { label: '流程名称', field_id: 'title', visible: true },
            { label: '流程链接', field_id: 'link', visible: true },
            { label: '是否选中', field_id: 'is_selected', visible: true },
            { label: '是否采购', field_id: 'is_purchase', visible: true },
            { label: '是否入仓', field_id: 'is_warehousing', visible: true },
            { label: '是否上架', field_id: 'is_shelf', visible: true }
        ]
    } else {
        columns = [
            { label: '开发人', field_id: 'director', visible: true },
            { label: '事业部', field_id: 'division', visible: true },
            { label: '平台', field_id: 'project', visible: true },
            { label: '一级类目', field_id: 'first_category', visible: true },
            { label: '二级类目', field_id: 'second_category', visible: true },
            { label: '三级类目', field_id: 'third_category', visible: true },
            { label: '流程名称', field_id: 'title', visible: true },
            { label: '流程链接', field_id: 'link', visible: true },
            { label: '是否选中', field_id: 'is_selected', visible: true },
            { label: '是否采购', field_id: 'is_purchase', visible: true },
            { label: '是否入仓', field_id: 'is_warehousing', visible: true },
            { label: '是否上架', field_id: 'is_shelf', visible: true }
        ]
    }
    let defaultTmp = {}
    for (let i = 0; i < columns.length; i++) {
        defaultTmp[columns[i].field_id] = columns[i].field_id.indexOf('num') != -1 || 
            columns[i].field_id.indexOf('percent') != -1 || 
            columns[i].field_id.indexOf('time') != -1 ? 0 : null
    }
    for (let index = 0; index < info?.length; index++) {
        for (let i = 0; i < info[index]['children']['bpm'].length; i++) {
            let tmp = JSON.parse(JSON.stringify(defaultTmp))
            tmp.director = info[index].director
            tmp.type = info[index].type
            tmp.division = info[index].division
            tmp.project = info[index].project
            tmp.link = 'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=' + info[index]['children']['bpm'][i]
            let info1 = await actHiProcinstRepo.getNewDetail(info[index]['children']['bpm'][i])
            tmp.is_selected = '否'
            tmp.is_purchase = '否'
            tmp.is_warehousing = '否'
            tmp.is_shelf = '否'
            if (info1?.length) {
                tmp.title = info1[0].title
                tmp.is_selected = info1[0].is_selected > 0 ? '是' : info1[0].is_selected === 0 ? '进行中' : '否'
                tmp.is_purchase = info1[0].is_purchase ? '是' : '否'
                if (info1[0].info != null) {
                    let content = new ObjectInputStream(info1[0].info), skuids = ''
                    content = content.readObject()
                    content?.annotations.splice(0, 1)
                    content = content?.annotations
                    for (let j = 0; j < content?.length; j++) {
                        for (let k = 0; k < content[j].annotations.length; k++) {
                            if (['Fxx1ma3pg5efdec', 'F1ujma2exiosbcc', 'Fssama252xmjbzc'].includes(content[j].annotations[k])) {
                                skuids = `${skuids}${content[j].annotations[k+1]}","`
                            }
                        }
                    }
                    if (skuids?.length) skuids = skuids.substring(0, skuids.length - 3)
                    let info2 = await purchaseRepo.getBySkuCode(skuids)
                    if (info2?.length) tmp.is_warehousing = '是'
                    info2 = await goodsSkuRepo.getBySysSkuId(skuids)
                    if (info2?.length) tmp.is_shelf = '是'
                }
                if (info1[0].info1 != null) {
                    let content = new ObjectInputStream(info1[0].info1)
                    content = content.readObject()
                    content?.annotations.splice(0, 1)
                    content = content?.annotations
                    tmp.first_category = content[0]
                    tmp.second_category = content.length > 1 ? content[1] : ''
                    tmp.third_category = content.length > 2 ? content[2] : ''
                }
            }
            result.push(tmp)
        }
        for (let i = 0; i < info[index]['children']['yida'].length; i++) {
            let tmp = JSON.parse(JSON.stringify(defaultTmp))
            tmp.director = info[index].director
            tmp.type = info[index].type
            tmp.division = info[index].division
            tmp.project = info[index].project
            tmp.link = 'https://t8sk7d.aliwork.com/APP_BXS79QCC8MY5ZV0EZZ07/processDetail?procInsId=' + info[index]['children']['yida'][i]
            let info1 = await newFormsRepo.getInfoDetail(info[index]['children']['yida'][i])
            tmp.is_selected = '否'
            tmp.is_purchase = '否'
            tmp.is_warehousing = '否'
            tmp.is_shelf = '否'
            if (info1?.length) {
                tmp.title = info1[0].title
                tmp.is_selected = info1[0].is_selected > 0 ? '是' : info1[0].is_selected === 0 ? '进行中' : '否'
                tmp.is_purchase = info1[0].is_purchase ? '是' : '否'
                if (info1[0].skuids != null) {
                    let info2 = await purchaseRepo.getBySkuCode(info1[0].skuids)
                    if (info2?.length) tmp.is_warehousing = '是'
                    info2 = await goodsSkuRepo.getBySysSkuId(info1[0].skuids)
                    if (info2?.length) tmp.is_shelf = '是'
                }
            }
            if (info1[0].category != null) {
                let category = JSON.parse(info1[0].category)        
                tmp.first_category = category?.length ? category[0] : ''
                tmp.second_category = category?.length > 1 ? category[1] : ''
                tmp.third_category = category?.length > 2 ? category[2] : ''
            }
            result.push(tmp)
        }
    }
    return {columns, data: result}
}

developmentService.getProductDevelopSales = async (params) => {
    let start = moment(params.start).format('YYYY-MM-DD')
    let end = moment(params.end).format('YYYY-MM-DD') + ' 23:59:59'
    let columns = [], result = []
    if (params.salesType == 0) {
        columns = [
            { label: '开发性质', field_id: 'type', visible: (params.type == 'type' || !params.type) ? true:false },
            { label: '事业部', field_id: 'division', visible: (params.type == 'division' || !params.type) ? true:false },
            { label: '开发人', field_id: 'director', visible: (params.type == 'director' || !params.type) ? true:false },
            { label: '上架数量', field_id: 'shelf_num', visible: true },
            { label: '转正数量', field_id: 'positive_num', visible: true },
            { label: '动销数量', field_id: 'normal_num', visible: true },
            { label: '爆款数量', field_id: 'hot_num', visible: true },
            { label: 'GMV', field_id: 'sale_amount', visible: true },
            { label: '利润额(胜算)', field_id: 'profit', visible: true },
            { label: '利润率(胜算)', field_id: 'profit_percent', visible: true },
            { label: '利润率(牌价)', field_id: 'standard_profit_percent', visible: true, info: '牌价利润率=1-成本/牌价*100%，监控牌价是否合理;成本是成交记录的sku的成本累计，牌价也是以成交记录的牌价累计' },
            { label: '未转正数量', field_id: 'negative_num', visible: true },
            { label: '30天动销数量', field_id: 'month_normal_num', visible: true },
            { label: '30天动销率', field_id: 'month_normal_percent', visible: true, info: '30天动销数量/上架数量' },
            { label: '60天动销数量', field_id: 'two_months_normal_num', visible: true },
            { label: '60天动销率', field_id: 'two_months_normal_percent', visible: true, info: '60天动销数量/上架数量' },
            { label: '90天动销数量', field_id: 'three_months_normal_num', visible: true },
            { label: '90天动销率', field_id: 'three_months_normal_percent', visible: true, info: '90天动销数量/上架数量' },
            { label: '爆款率', field_id: 'hot_percent', visible: true, info: '爆款数量/上架数量' }
        ]
    } else if (params.salesType == 1) {
        columns = [
            { label: '事业部', field_id: 'division', visible: true },
            { label: 'GMV', field_id: 'sale_amount', visible: true },
            { label: '利润额(胜算)', field_id: 'profit', visible: true },
            { label: '利润率(胜算)', field_id: 'profit_percent', visible: true },
            { label: '利润率(牌价)', field_id: 'standard_profit_percent', visible: true, info: '牌价利润率=1-成本/牌价*100%，监控牌价是否合理;成本是成交记录的sku的成本累计，牌价也是以成交记录的牌价累计' },
            { label: '未转正数量', field_id: 'negative_num', visible: true },
            { label: '30天动销数量', field_id: 'month_normal_num', visible: true },
            { label: '30天动销率', field_id: 'month_normal_percent', visible: true, info: params.infoType == 0 ? '30天动销款式数量/上架款式数量' : '30天动销数量/上架数量' },
            { label: '60天动销数量', field_id: 'two_months_normal_num', visible: true },
            { label: '60天动销率', field_id: 'two_months_normal_percent', visible: true, info: params.infoType == 0 ? '60天动销款式数量/上架款式数量' : '60天动销数量/上架数量' },
            { label: '90天动销数量', field_id: 'three_months_normal_num', visible: true },
            { label: '90天动销率', field_id: 'three_months_normal_percent', visible: true, info: params.infoType == 0 ? '90天动销款式数量/上架款式数量' : '90天动销数量/上架数量' },
            { label: '爆款率', field_id: 'hot_percent', visible: true, info: params.infoType == 0 ? '爆款款式数量/上架款式数量' : '爆款数量/上架数量' }
        ]
    } else {
        columns = [
            { label: '事业部', field_id: 'division', visible: true },
            { label: '平台', field_id: 'project', visible: true },
            { label: '店铺', field_id: 'shop', visible: true },
            { label: '上架数量', field_id: 'shelf_num', visible: true },
            { label: '转正数量', field_id: 'positive_num', visible: true },
            { label: '动销数量', field_id: 'normal_num', visible: true },
            { label: '爆款数量', field_id: 'hot_num', visible: true },
            { label: 'GMV', field_id: 'sale_amount', visible: true },
            { label: '利润额(胜算)', field_id: 'profit', visible: true },
            { label: '利润率(胜算)', field_id: 'profit_percent', visible: true },
            { label: '利润率(牌价)', field_id: 'standard_profit_percent', visible: true, info: '牌价利润率=1-成本/牌价*100%，监控牌价是否合理;成本是成交记录的sku的成本累计，牌价也是以成交记录的牌价累计' },
            { label: '未转正数量', field_id: 'negative_num', visible: true },
            { label: '30天动销数量', field_id: 'month_normal_num', visible: true },
            { label: '30天动销率', field_id: 'month_normal_percent', visible: true, info: '30天动销数量/上架数量' },
            { label: '60天动销数量', field_id: 'two_months_normal_num', visible: true },
            { label: '60天动销率', field_id: 'two_months_normal_percent', visible: true, info: '60天动销数量/上架数量' },
            { label: '90天动销数量', field_id: 'three_months_normal_num', visible: true },
            { label: '90天动销率', field_id: 'three_months_normal_percent', visible: true, info: '90天动销数量/上架数量' },
            { label: '爆款率', field_id: 'hot_percent', visible: true, info: '爆款数量/上架数量' }
        ]
    }
    let defaultTmp = {}, skuMap = {}, saleMap = {}   
    for (let i = 0; i < columns.length; i++) {
        defaultTmp[columns[i].field_id] = columns[i].field_id.indexOf('num') != -1 || 
            columns[i].field_id.indexOf('percent') != -1 || 
            columns[i].field_id.indexOf('amount') != -1 || 
            columns[i].field_id.indexOf('profit') != -1 ? 0 : null
    }
    if (params.salesType == 0) {
        let begin = moment(start).subtract(90, 'day').format('YYYY-MM-DD')
        let skuids1 = await newFormsRepo.getSelectedInfo(begin, end)
        for (let i = 0; i < skuids1.length; i++) {
            skuMap[skuids1[i].sku_id] = skuids1[i].type
        }
        skuids1 = await actHiProcinstRepo.getSelectedInfo(begin, end)
        for (let i = 0; i < skuids1.length; i++) {
            let content = new ObjectInputStream(skuids1[i].info)
            content = content.readObject()
            content?.annotations.splice(0, 1)
            content = content?.annotations
            for (let j = 0; j < content.length; j++) {
                for (let k = 0; k < content[j].annotations.length; k++) {
                    if (['Fxx1ma3pg5efdec', 'F1ujma2exiosbcc', 'Fssama252xmjbzc'].includes(content[j].annotations[k])) {
                        skuMap[content[j].annotations[k+1]] = skuids1[i].type
                        break
                    }
                }
            }
        }
    }
    let saleInfo = await goodsSkuRepo.getSalesBySysSkuId(start, end, params.infoType == 1 ? 'goods_id' : 'spu')
    for (let i = 0; i < saleInfo.length; i++) {
        if (params.salesType == 0 && params.first_category?.length && saleInfo[i].first_category != params.first_category) continue 
        if (params.salesType == 0 && params.second_category?.length && saleInfo[i].second_category != params.second_category) continue 
        if (params.salesType == 0 && params.third_category?.length && saleInfo[i].third_category != params.third_category) continue 
        if (params.typeInfo && (skuMap[saleInfo[i].sku_id] == undefined || params.typeInfo != skuMap[saleInfo[i].sku_id])) continue
        if (params.salesType == 0 || params.infoType == 0) {
            if (saleInfo[i].spu in saleMap) saleMap[saleInfo[i].spu].push(i)
            else saleMap[saleInfo[i].spu] = [i]
        } else {
            if (saleInfo[i].goods_id in saleMap) saleMap[saleInfo[i].goods_id].push(i)
            else saleMap[saleInfo[i].goods_id] = [i]
        }
    }
    let resultMap = {}
    if (params.salesType == 0) {
        let goodsMap = {}, positiveMap = {}
        for (let i in saleMap) {
            let profit = 0, cost_amount = 0, price = 0, sale_amount = 0, index, skuids = '',
                is_positive = '否', is_normal = '否', is_hot = '否', real_positive_day = '', 
                tmpIndex = ''
            for (let j = 0; j < saleMap[i].length; j++) {
                let item = saleInfo[saleMap[i][j]]
                if (params.type == 'type') index = `${skuMap[item.sku_id]}`
                else if (params.type == 'division') index = `${item.division_name}`
                else if (params.type == 'director') index = `${item.director}`
                else index = `${skuMap[item.sku_id]}_${item.division_name}_${item.director}`
                if (resultMap[index] == undefined) {
                    let tmp = JSON.parse(JSON.stringify(defaultTmp))
                    resultMap[index] = result.length
                    tmp.type = skuMap[item.sku_id]
                    tmp.division = item.division_name
                    tmp.director = item.director
                    tmp.profit = parseFloat(item.profit)
                    tmp.sale_amount = parseFloat(item.sale_amount)
                    tmp['cost_amount'] = parseFloat(item.cost_amount)
                    tmp['price'] = 0
                    tmp['goods_num'] = 0
                    tmp['children'] = []
                    result.push(tmp)
                } else {
                    result[resultMap[index]].profit += parseFloat(item.profit)
                    result[resultMap[index]].sale_amount += parseFloat(item.sale_amount)
                    result[resultMap[index]].cost_amount += parseFloat(item.cost_amount)
                }
                profit += parseFloat(item.profit)
                cost_amount += parseFloat(item.cost_amount)
                price += parseFloat(item.price) * parseFloat(item.sale_qty)
                sale_amount += parseFloat(item.sale_amount)
                skuids = `${skuids}${item.sku_id}","`
                result[resultMap[index]].price += parseFloat(item.price) * parseInt(item.sale_qty)
                if (tmpIndex != index) {
                    if (tmpIndex !== '') {
                        if (goodsMap[`${i}_${resultMap[tmpIndex]}`] == undefined) {
                            result[resultMap[tmpIndex]].children.push({
                                spu: i,
                                sale_amount: sale_amount,
                                profit: profit,
                                cost_amount: cost_amount,
                                profit_percent: sale_amount > 0 ? (profit/sale_amount*100) : 0,
                                standard_profit_percent: price > 0 ? ((1-cost_amount/price)*100) : 0,
                                is_positive,
                                is_normal,
                                is_hot,
                                real_positive_day,
                                first_category: item.first_category,
                                second_category: item.second_category,
                                third_category: item.third_category
                            })
                            goodsMap[`${i}_${resultMap[tmpIndex]}`] = result[resultMap[tmpIndex]].children.length - 1
                        } else {
                            let child = result[resultMap[tmpIndex]].children[goodsMap[`${i}_${resultMap[tmpIndex]}`]]
                            child.sale_amount += sale_amount
                            child.profit += profit
                            profit = child.profit
                            child.profit_percent = child.sale_amount > 0 ? (child.profit/child.sale_amount*100) : 0
                            child.standard_profit_percent = child.price > 0 ? ((1-child.cost_amount/price)*100) : 0
                        }  
                        if (profit - 2000 > 0) {
                            if (positiveMap[resultMap[tmpIndex]] == undefined || positiveMap[resultMap[tmpIndex]][goodsMap[`${i}_${resultMap[tmpIndex]}`]] == undefined) {
                                result[resultMap[tmpIndex]].positive_num += 1
                                if (positiveMap[resultMap[tmpIndex]] == undefined) {
                                    positiveMap[resultMap[tmpIndex]] = {}
                                }
                                positiveMap[resultMap[tmpIndex]][goodsMap[`${i}_${resultMap[tmpIndex]}`]] = true
                            }
                            skuids = skuids.substring(0, skuids.length - 3)
                            let child = result[resultMap[tmpIndex]].children[goodsMap[`${i}_${resultMap[tmpIndex]}`]]
                            child.is_positive = '是'
                            let sales = await goodsSkuRepo.getSales(skuids, start, end)
                            const {start: realStart, end: realEnd} = await goodsSkuRepo.getDatesBySpu(i, start, end)
                            if (realEnd) real_positive_day = moment(realEnd).diff(moment(realStart), 'day') + 1
                            if (sales.length) {
                                if (parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 1500) {
                                    result[resultMap[tmpIndex]].hot_num += 1
                                    child.is_hot = '是'
                                } else if (sales[0].type == 1 && parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 400) {
                                    result[resultMap[tmpIndex]].month_normal_num += 1
                                    child.is_normal = '是'
                                } else if (sales[0].type == 2 && parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 400) {
                                    result[resultMap[tmpIndex]].two_months_normal_num += 1
                                    child.is_normal = '是'
                                } else if (sales[0].type == 3 && parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 400) {
                                    result[resultMap[tmpIndex]].three_months_normal_num += 1
                                    child.is_normal = '是'
                                }
                            }
                        } else {
                            result[resultMap[tmpIndex]].negative_num += 1
                        }
                        profit = 0
                        cost_amount = 0 
                        price = 0
                        sale_amount = 0
                        skuids = ''
                        is_positive = '否'
                        is_normal = '否'
                        is_hot = '否'
                        real_positive_day = ''
                    }
                    tmpIndex = JSON.parse(JSON.stringify(index))
                }
            }
            if (goodsMap[`${i}_${resultMap[tmpIndex]}`] == undefined) {
                result[resultMap[tmpIndex]].children.push({
                    spu: i,
                    sale_amount: sale_amount,
                    profit: profit,
                    cost_amount: cost_amount,
                    profit_percent: sale_amount > 0 ? (profit/sale_amount*100) : 0,
                    standard_profit_percent: price > 0 ? ((1-cost_amount/price)*100) : 0,
                    is_positive,
                    is_normal,
                    is_hot,
                    real_positive_day,
                    first_category: saleInfo[saleMap[i][saleMap[i].length-1]].first_category,
                    second_category: saleInfo[saleMap[i][saleMap[i].length-1]].second_category,
                    third_category: saleInfo[saleMap[i][saleMap[i].length-1]].third_category
                })
                goodsMap[`${i}_${resultMap[tmpIndex]}`] = result[resultMap[tmpIndex]].children.length - 1
            } else {
                let child = result[resultMap[tmpIndex]].children[goodsMap[`${i}_${resultMap[tmpIndex]}`]]
                child.sale_amount += sale_amount
                child.profit += profit
                profit = child.profit
                child.profit_percent = child.sale_amount > 0 ? (child.profit/child.sale_amount*100) : 0
                child.standard_profit_percent = child.price > 0 ? ((1-child.cost_amount/price)*100) : 0
            }
            if (profit - 2000 > 0) {
                if (positiveMap[resultMap[tmpIndex]] == undefined || positiveMap[resultMap[tmpIndex]][goodsMap[`${i}_${resultMap[tmpIndex]}`]] == undefined) {
                    result[resultMap[tmpIndex]].positive_num += 1
                    if (positiveMap[resultMap[tmpIndex]] == undefined) {
                        positiveMap[resultMap[tmpIndex]] = {}
                    }
                    positiveMap[resultMap[tmpIndex]][goodsMap[`${i}_${resultMap[tmpIndex]}`]] = true
                }
                skuids = skuids.substring(0, skuids.length - 3)
                let child = result[resultMap[tmpIndex]].children[goodsMap[`${i}_${resultMap[tmpIndex]}`]]
                child.is_positive = '是'
                let sales = await goodsSkuRepo.getSales(skuids, start, end)
                const {start: realStart, end: realEnd} = await goodsSkuRepo.getDatesBySpu(i, start, end)
                if (realEnd) real_positive_day = moment(realEnd).diff(moment(realStart), 'day') + 1
                if (sales.length) {
                    if (parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 1500) {
                        result[resultMap[tmpIndex]].hot_num += 1
                        child.is_hot = '是'
                    } else if (sales[0].type == 1 && parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 400) {
                        result[resultMap[tmpIndex]].month_normal_num += 1
                        child.is_normal = '是'
                    } else if (sales[0].type == 2 && parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 400) {
                        result[resultMap[tmpIndex]].two_months_normal_num += 1
                        child.is_normal = '是'
                    } else if (sales[0].type == 3 && parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 400) {
                        result[resultMap[tmpIndex]].three_months_normal_num += 1
                        child.is_normal = '是'
                    }
                }
            } else {
                result[resultMap[tmpIndex]].negative_num += 1
            }
            profit = 0
            cost_amount = 0 
            price = 0
            sale_amount = 0
            skuids = ''
            is_positive = '否'
            is_normal = '否'
            is_hot = '否'
            real_positive_day = ''
        }
    } else if (params.salesType == 1) {
        let goodsMap = {}, positiveMap = {}
        for (let i in saleMap) {
            let profit = 0, cost_amount = 0, price = 0, sale_amount = 0, index, skuids = '', tmpIndex = '',
                is_positive = '否', is_normal = '否', is_hot = '否', real_positive_day = '', predict_positive_day = ''
            for (let j = 0; j < saleMap[i].length; j++) {
                let item = saleInfo[saleMap[i][j]]
                index = item.division_name
                if (resultMap[index] == undefined) {
                    let tmp = JSON.parse(JSON.stringify(defaultTmp))
                    resultMap[index] = result.length
                    tmp.type = skuMap[item.sku_id]
                    tmp.division = item.division_name
                    tmp.director = item.director
                    tmp.profit = parseFloat(item.profit)
                    tmp.sale_amount = parseFloat(item.sale_amount)
                    tmp['cost_amount'] = parseFloat(item.cost_amount)
                    tmp['price'] = 0
                    tmp['children'] = []
                    result.push(tmp)
                } else {
                    result[resultMap[index]].profit += parseFloat(item.profit)
                    result[resultMap[index]].sale_amount += parseFloat(item.sale_amount)
                    result[resultMap[index]].cost_amount += parseFloat(item.cost_amount)
                }
                profit += parseFloat(item.profit)
                cost_amount += parseFloat(item.cost_amount)
                price += parseFloat(item.price) * parseFloat(item.sale_qty)
                sale_amount += parseFloat(item.sale_amount)
                skuids = `${skuids}${item.sku_id}","`
                result[resultMap[index]].price += parseFloat(item.price) * parseInt(item.sale_qty)
                if (tmpIndex != index) {
                    if (tmpIndex !== '') {                        
                        if (goodsMap[`${i}_${resultMap[tmpIndex]}`] == undefined) {
                            result[resultMap[tmpIndex]].children.push({
                                goods_id: i,
                                spu: i,
                                sale_amount: sale_amount,
                                profit: profit,
                                profit_percent: sale_amount > 0 ? (profit/sale_amount*100) : 0,
                                standard_profit_percent: price > 0 ? ((1-cost_amount/price)*100) : 0,
                                is_positive,
                                is_normal,
                                is_hot,
                                real_positive_day,
                                predict_positive_day,
                                first_category: item.first_category,
                                second_category: item.second_category,
                                third_category: item.third_category
                            })
                            goodsMap[`${i}_${resultMap[tmpIndex]}`] = result[resultMap[tmpIndex]].children.length - 1
                        } else {
                            let child = result[resultMap[tmpIndex]].children[goodsMap[`${i}_${resultMap[tmpIndex]}`]]
                            child.sale_amount += sale_amount
                            child.profit += profit
                            profit = child.profit
                            child.profit_percent = child.sale_amount > 0 ? (child.profit/child.sale_amount*100) : 0
                            child.standard_profit_percent = child.price > 0 ? ((1-child.cost_amount/price)*100) : 0
                        }
                        if (profit - 2000 > 0) {
                            if (positiveMap[resultMap[tmpIndex]] == undefined || positiveMap[resultMap[tmpIndex]][goodsMap[`${i}_${resultMap[tmpIndex]}`]] == undefined) {
                                result[resultMap[tmpIndex]].positive_num += 1
                                if (positiveMap[resultMap[tmpIndex]] == undefined) {
                                    positiveMap[resultMap[tmpIndex]] = {}
                                }
                                positiveMap[resultMap[tmpIndex]][goodsMap[`${i}_${resultMap[tmpIndex]}`]] = true
                            }
                            skuids = skuids.substring(0, skuids.length - 3)
                            let sales = [] 
                            let child = result[resultMap[tmpIndex]].children[goodsMap[`${i}_${resultMap[tmpIndex]}`]]
                            child.is_positive = '是'
                            if (params.infoType == 0) {
                                sales = await goodsSkuRepo.getSales(skuids, start, end)
                                const {start: realStart, end: realEnd} = await goodsSkuRepo.getDatesBySpu(i, start, end)
                                if (realEnd) real_positive_day = moment(realEnd).diff(moment(realStart), 'day') + 1
                            } else {
                                sales = await goodsSkuRepo.getSales(skuids, start, end, i)
                                const {start: realStart, end: realEnd} = await goodsSkuRepo.getDatesByGoodsId(i, start, end)
                                if (realEnd) real_positive_day = moment(realEnd).diff(moment(realStart), 'day') + 1
                            }
                            if (sales.length) {
                                if (parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 1500) {
                                    result[resultMap[tmpIndex]].hot_num += 1
                                    child.is_hot = '是'
                                } else if (sales[0].type == 1 && parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 400) {
                                    result[resultMap[tmpIndex]].month_normal_num += 1
                                    child.is_normal = '是'
                                } else if (sales[0].type == 2 && parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 400) {
                                    result[resultMap[tmpIndex]].two_months_normal_num += 1
                                    child.is_normal = '是'
                                } else if (sales[0].type == 3 && parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 400) {
                                    result[resultMap[tmpIndex]].three_months_normal_num += 1
                                    child.is_normal = '是'
                                }
                            }
                        } else {
                            result[resultMap[tmpIndex]].negative_num += 1
                        }
                        profit = 0
                        cost_amount = 0
                        price = 0
                        sale_amount = 0
                        skuids = ''
                        is_positive = '否'
                        is_normal = '否'
                        is_hot = '否'
                        real_positive_day = ''
                        predict_positive_day = ''
                    }
                    tmpIndex = JSON.parse(JSON.stringify(index))
                }
            }            
            if (goodsMap[`${i}_${resultMap[tmpIndex]}`] == undefined) {
                result[resultMap[tmpIndex]].children.push({
                    goods_id: i,
                    spu: i,
                    sale_amount: sale_amount,
                    profit: profit,
                    profit_percent: sale_amount > 0 ? (profit/sale_amount*100) : 0,
                    standard_profit_percent: price > 0 ? ((1-cost_amount/price)*100) : 0,
                    is_positive,
                    is_normal,
                    is_hot,
                    real_positive_day,
                    predict_positive_day,
                    first_category: saleInfo[saleMap[i][saleMap[i].length-1]].first_category,
                    second_category: saleInfo[saleMap[i][saleMap[i].length-1]].second_category,
                    third_category: saleInfo[saleMap[i][saleMap[i].length-1]].third_category
                })
                goodsMap[`${i}_${resultMap[tmpIndex]}`] = result[resultMap[tmpIndex]].children.length - 1
            } else {
                let child = result[resultMap[tmpIndex]].children[goodsMap[`${i}_${resultMap[tmpIndex]}`]]
                child.sale_amount += sale_amount
                child.profit += profit
                profit = child.profit
                child.profit_percent = child.sale_amount > 0 ? (child.profit/child.sale_amount*100) : 0
                child.standard_profit_percent = child.price > 0 ? ((1-child.cost_amount/price)*100) : 0
            }
            if (profit - 2000 > 0) {
                result[resultMap[tmpIndex]].positive_num += 1
                skuids = skuids.substring(0, skuids.length - 3)
                let sales = [] 
                let child = result[resultMap[tmpIndex]].children[goodsMap[`${i}_${resultMap[tmpIndex]}`]]
                child.is_positive = '是'
                if (params.infoType == 0) {
                    sales = await goodsSkuRepo.getSales(skuids, start, end)
                    const {start: realStart, end: realEnd} = await goodsSkuRepo.getDatesBySpu(i, start, end)
                    if (realEnd) real_positive_day = moment(realEnd).diff(moment(realStart), 'day') + 1
                } else {
                    sales = await goodsSkuRepo.getSales(skuids, start, end, i)
                    const {start: realStart, end: realEnd} = await goodsSkuRepo.getDatesByGoodsId(i, start, end)
                    if (realEnd) real_positive_day = moment(realEnd).diff(moment(realStart), 'day') + 1
                }
                if (sales.length) {
                    if (parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 1500) {
                        result[resultMap[tmpIndex]].hot_num += 1
                        child.is_hot = '是'
                    } else if (sales[0].type == 1 && parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 400) {
                        result[resultMap[tmpIndex]].month_normal_num += 1
                        child.is_normal = '是'
                    } else if (sales[0].type == 2 && parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 400) {
                        result[resultMap[tmpIndex]].two_months_normal_num += 1
                        child.is_normal = '是'
                    } else if (sales[0].type == 3 && parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 400) {
                        result[resultMap[tmpIndex]].three_months_normal_num += 1
                        child.is_normal = '是'
                    }
                }
            } else {
                result[resultMap[tmpIndex]].negative_num += 1
            }
            profit = 0
            cost_amount = 0 
            price = 0
            sale_amount = 0
            skuids = ''
            is_positive = '否'
            is_normal = '否'
            is_hot = '否'
            real_positive_day = ''
        }
    } else {
        let goodsMap = {}, positiveMap = {}
        for (let i in saleMap) {
            let profit = 0, cost_amount = 0, price = 0, sale_amount = 0, index, skuids = '',
                is_positive = '否', is_normal = '否', is_hot = '否', real_positive_day = '', 
                tmpIndex = ''
            for (let j = 0; j < saleMap[i].length; j++) {
                let item = saleInfo[saleMap[i][j]]
                index = `${skuMap[item.sku_id]}_${item.division_name}_${item.project_name}_${item.shop_name}`
                if (resultMap[index] == undefined) {
                    let tmp = JSON.parse(JSON.stringify(defaultTmp))
                    resultMap[index] = result.length
                    tmp.type = skuMap[item.sku_id]
                    tmp.division = item.division_name
                    tmp.project = item.project_name
                    tmp.shop = item.shop_name
                    tmp.profit = parseFloat(item.profit)
                    tmp.sale_amount = parseFloat(item.sale_amount)
                    tmp['cost_amount'] = parseFloat(item.cost_amount)
                    tmp['price'] = 0
                    tmp['goods_num'] = 0
                    tmp['children'] = []
                    result.push(tmp)
                } else {
                    result[resultMap[index]].profit += parseFloat(item.profit)
                    result[resultMap[index]].sale_amount += parseFloat(item.sale_amount)
                    result[resultMap[index]].cost_amount += parseFloat(item.cost_amount)
                }
                profit += parseFloat(item.profit)
                cost_amount += parseFloat(item.cost_amount)
                price += parseFloat(item.price) * parseFloat(item.sale_qty)
                sale_amount += parseFloat(item.sale_amount)
                skuids = `${skuids}${item.sku_id}","`
                result[resultMap[index]].price += parseFloat(item.price) * parseInt(item.sale_qty)
                if (tmpIndex != index) {
                    if (tmpIndex !== '') {                        
                        if (goodsMap[`${i}_${resultMap[tmpIndex]}`] == undefined) {
                            result[resultMap[tmpIndex]].children.push({
                                spu: i,
                                sale_amount: sale_amount,
                                profit: profit,
                                profit_percent: sale_amount > 0 ? (profit/sale_amount*100) : 0,
                                standard_profit_percent: price > 0 ? ((1-cost_amount/price)*100) : 0,
                                is_positive,
                                is_normal,
                                is_hot,
                                real_positive_day,
                                first_category: item.first_category,
                                second_category: item.second_category,
                                third_category: item.third_category
                            })
                            goodsMap[`${i}_${resultMap[tmpIndex]}`] = result[resultMap[tmpIndex]].children.length - 1
                        } else {
                            let child = result[resultMap[tmpIndex]].children[goodsMap[`${i}_${resultMap[tmpIndex]}`]]
                            child.sale_amount += sale_amount
                            child.profit += profit
                            profit = child.profit
                            child.profit_percent = child.sale_amount > 0 ? (child.profit/child.sale_amount*100) : 0
                            child.standard_profit_percent = child.price > 0 ? ((1-child.cost_amount/price)*100) : 0
                        }
                        if (profit - 2000 > 0) {
                            if (positiveMap[resultMap[tmpIndex]] == undefined || positiveMap[resultMap[tmpIndex]][goodsMap[`${i}_${resultMap[tmpIndex]}`]] == undefined) {
                                result[resultMap[tmpIndex]].positive_num += 1
                                if (positiveMap[resultMap[tmpIndex]] == undefined) {
                                    positiveMap[resultMap[tmpIndex]] = {}
                                }
                                positiveMap[resultMap[tmpIndex]][goodsMap[`${i}_${resultMap[tmpIndex]}`]] = true
                            }
                            skuids = skuids.substring(0, skuids.length - 3)
                            let child = result[resultMap[tmpIndex]].children[goodsMap[`${i}_${resultMap[tmpIndex]}`]]
                            child.is_positive = '是'
                            let sales = []                   
                            if (params.infoType == 0) {
                                sales = await goodsSkuRepo.getSales(skuids, start, end)
                                const {start: realStart, end: realEnd} = await goodsSkuRepo.getDatesBySpu(i, start, end)
                                if (realEnd) real_positive_day = moment(realEnd).diff(moment(realStart), 'day') + 1
                            } else {
                                sales = await goodsSkuRepo.getSales(skuids, start, end, i)
                                const {start: realStart, end: realEnd} = await goodsSkuRepo.getDatesByGoodsId(i, start, end)
                                if (realEnd) real_positive_day = moment(realEnd).diff(moment(realStart), 'day') + 1
                            }
                            if (sales.length) {
                                if (parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 1500) {
                                    result[resultMap[tmpIndex]].hot_num += 1
                                    child.is_hot = '是'
                                } else if (sales[0].type == 1 && parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 400) {
                                    result[resultMap[tmpIndex]].month_normal_num += 1
                                    child.is_normal = '是'
                                } else if (sales[0].type == 2 && parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 400) {
                                    result[resultMap[tmpIndex]].two_months_normal_num += 1
                                    child.is_normal = '是'
                                } else if (sales[0].type == 3 && parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 400) {
                                    result[resultMap[tmpIndex]].three_months_normal_num += 1
                                    child.is_normal = '是'
                                }
                            }
                        } else {
                            result[resultMap[tmpIndex]].negative_num += 1
                        }
                        profit = 0
                        cost_amount = 0 
                        price = 0
                        sale_amount = 0
                        skuids = ''
                        is_positive = '否'
                        is_normal = '否'
                        is_hot = '否'
                        real_positive_day = ''
                    }
                    tmpIndex = JSON.parse(JSON.stringify(index))
                }
            }
            if (goodsMap[`${i}_${resultMap[tmpIndex]}`] == undefined) {
                result[resultMap[tmpIndex]].children.push({
                    spu: i,
                    sale_amount: sale_amount,
                    profit: profit,
                    profit_percent: sale_amount > 0 ? (profit/sale_amount*100) : 0,
                    standard_profit_percent: price > 0 ? ((1-cost_amount/price)*100) : 0,
                    is_positive,
                    is_normal,
                    is_hot,
                    real_positive_day,
                    first_category: saleInfo[saleMap[i][saleMap[i].length-1]].first_category,
                    second_category: saleInfo[saleMap[i][saleMap[i].length-1]].second_category,
                    third_category: saleInfo[saleMap[i][saleMap[i].length-1]].third_category
                })
                goodsMap[`${i}_${resultMap[tmpIndex]}`] = result[resultMap[tmpIndex]].children.length - 1
            } else {
                let child = result[resultMap[tmpIndex]].children[goodsMap[`${i}_${resultMap[tmpIndex]}`]]
                child.sale_amount += sale_amount
                child.profit += profit
                profit = child.profit
                child.profit_percent = child.sale_amount > 0 ? (child.profit/child.sale_amount*100) : 0
                child.standard_profit_percent = child.price > 0 ? ((1-child.cost_amount/price)*100) : 0
            }
            if (profit - 2000 > 0) {
                if (positiveMap[resultMap[tmpIndex]] == undefined || positiveMap[resultMap[tmpIndex]][goodsMap[`${i}_${resultMap[tmpIndex]}`]] == undefined) {
                    result[resultMap[tmpIndex]].positive_num += 1
                    if (positiveMap[resultMap[tmpIndex]] == undefined) {
                        positiveMap[resultMap[tmpIndex]] = {}
                    }
                    positiveMap[resultMap[tmpIndex]][goodsMap[`${i}_${resultMap[tmpIndex]}`]] = true
                }
                skuids = skuids.substring(0, skuids.length - 3)
                let child = result[resultMap[tmpIndex]].children[goodsMap[`${i}_${resultMap[tmpIndex]}`]]
                child.is_positive = '是' 
                let sales = []         
                if (params.infoType == 0) {
                    sales = await goodsSkuRepo.getSales(skuids, start, end)
                    const {start: realStart, end: realEnd} = await goodsSkuRepo.getDatesBySpu(i, start, end)
                    if (realEnd) real_positive_day = moment(realEnd).diff(moment(realStart), 'day') + 1
                } else {
                    sales = await goodsSkuRepo.getSales(skuids, start, end, i)
                    const {start: realStart, end: realEnd} = await goodsSkuRepo.getDatesByGoodsId(i, start, end)
                    if (realEnd) real_positive_day = moment(realEnd).diff(moment(realStart), 'day') + 1
                }
                if (sales.length) {
                    if (parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 1500) {
                        result[resultMap[tmpIndex]].hot_num += 1
                        child.is_hot = '是'
                    } else if (sales[0].type == 1 && parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 400) {
                        result[resultMap[tmpIndex]].month_normal_num += 1
                        child.is_normal = '是'
                    } else if (sales[0].type == 2 && parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 400) {
                        result[resultMap[tmpIndex]].two_months_normal_num += 1
                        child.is_normal = '是'
                    } else if (sales[0].type == 3 && parseFloat(sales[0].sale_amount) / parseInt(sales[0].time) > 400) {
                        result[resultMap[tmpIndex]].three_months_normal_num += 1
                        child.is_normal = '是'
                    }
                }
            } else {
                result[resultMap[tmpIndex]].negative_num += 1
            }
            profit = 0
            cost_amount = 0 
            price = 0
            sale_amount = 0
            skuids = ''
            is_positive = '否'
            is_normal = '否'
            is_hot = '否'
            real_positive_day = ''
        }
    }
    for (let i = 0; i < result.length; i++) {
        result[i].profit_percent = result[i].sale_amount > 0 ? 
            (result[i].profit / result[i].sale_amount).toFixed(2) : 0
        result[i].standard_profit_percent = result[i].price > 0 ? 
            ((1-(result[i].cost_amount / result[i].price))*100).toFixed(2) : 0
        result[i].profit = result[i].profit.toFixed(2)
        result[i].sale_amount = result[i].sale_amount.toFixed(2)
        result[i].shelf_num = result[i].children.length
        for (let j = 0; j < result[i].children.length; j++) {
            result[i].children[j].sale_amount = result[i].children[j].sale_amount.toFixed(2)
            result[i].children[j].profit = result[i].children[j].profit.toFixed(2)
            result[i].children[j].profit_percent = result[i].children[j].profit_percent.toFixed(2)
            result[i].children[j].standard_profit_percent = result[i].children[j].standard_profit_percent.toFixed(2)            
        }
        if (result[i].shelf_num > 0) {
            result[i].month_normal_percent = (result[i].month_normal_num/result[i].shelf_num*100).toFixed(2)
            result[i].two_months_normal_percent = (result[i].two_months_normal_num/result[i].shelf_num*100).toFixed(2)
            result[i].three_months_normal_percent = (result[i].three_months_normal_num/result[i].shelf_num*100).toFixed(2)
        }
    }
    return {columns, data: result}
}

developmentService.getProductDevelopDirectorSales = async (params) => {
    let start = moment(params.start).format('YYYY-MM-DD'), data = []
    let end = moment(params.end).format('YYYY-MM-DD') + ' 23:59:59'
    let columns = [
        { label: '开发员', field_id: 'director', visible: true },
        { label: '推品数量', field_id: 'create_num', visible: true, info: 'BI发起流程数量' },
        { label: '推品上架数量', field_id: 'shelf_link_num', visible: true, info: '当前上架数量,推品时间不等于上架时间,以上架时间计算上架数量' },
        { label: '推品天猫上架链接数', field_id: 'tmall_link_num', visible: true, 
            info: params.infoType == 0 ? '统计时间内SPU上架的链接数量' : '统计时间内上架的链接数量(运营维护)' },
        { label: '推品京东上架链接数', field_id: 'jd_link_num', visible: true },
        { label: '推品拼多多上架链接数', field_id: 'pdd_link_num', visible: true },
        { label: '天猫销售金额(扣退)', field_id: 'tmall_sale_amount', visible: true, 
            info: params.infoType == 0 ? '链接中的推品的SPU所产生的销售（商品销售数据-商品销售数量(扣退)）平台店铺商品编码对应的新品SPU' : '新品链接产生的销售额(运营维护)' },
        { label: '京东销售金额(扣推)', field_id: 'jd_sale_amount', visible: true },
        { label: '拼多多销售金额(扣推)', field_id: 'pdd_sale_amount', visible: true },
        { label: '合计销售金额(扣退)', field_id: 'sale_amount', visible: true },
        { label: '天猫销售利润', field_id: 'tmall_profit', visible: true, 
            info: params.infoType == 0 ? '当前上架链接中的推品的SPU所产生的利润（胜算利润）' : '新品链接产生的利润额(运营维护)' },
        { label: '京东销售利润', field_id: 'jd_profit', visible: true },
        { label: '拼多多销售利润', field_id: 'pdd_profit', visible: true }
    ]
    let dataMap = {}, result
    let result1 = await actHiProcinstRepo.getCreateInfo(start, end)
    let result2 = await newFormsRepo.getCreateInfo(start, end)
    if (params.infoType == 0) {
        result = await goodsSkuRepo.getSalesBySysSkuId1(start, end, params.type)
    } else {
        result = await goodsSkuRepo.getSalesBySysSkuId2(start, end, params.type)
    }
    for (let i = 0; i < result.length; i++) {
        if (dataMap[result[i].director] == undefined) {
            dataMap[result[i].director] = data.length
            data.push({
                director: result[i].director,
                create_num: 0,
                shelf_link_num: 0,
                tmall_link_num: 0,
                jd_link_num: 0,
                pdd_link_num: 0,
                tmall_sale_amount: 0,
                jd_sale_amount: 0,
                pdd_sale_amount: 0,
                sale_amount: 0,
                tmall_profit: 0,
                jd_profit: 0,
                pdd_profit: 0
            })
        }
        if (result[i].project_name == '宝选天猫') {
            data[dataMap[result[i].director]].tmall_link_num += parseInt(result[i].link_num)
            data[dataMap[result[i].director]].tmall_sale_amount += parseFloat(result[i].sale_amount)
            data[dataMap[result[i].director]].tmall_profit += parseFloat(result[i].profit)
        } else if (result[i].project_name == '京东') {
            data[dataMap[result[i].director]].jd_link_num += parseInt(result[i].link_num)
            data[dataMap[result[i].director]].jd_sale_amount += parseFloat(result[i].sale_amount)
            data[dataMap[result[i].director]].jd_profit += parseFloat(result[i].profit)
        } else if (result[i].project_name == '拼多多') {
            data[dataMap[result[i].director]].pdd_link_num += parseInt(result[i].link_num)
            data[dataMap[result[i].director]].pdd_sale_amount += parseFloat(result[i].sale_amount)
            data[dataMap[result[i].director]].pdd_profit += parseFloat(result[i].profit)
        }
        data[dataMap[result[i].director]].shelf_link_num += parseInt(result[i].link_num)
        data[dataMap[result[i].director]].sale_amount += parseInt(result[i].sale_amount)
    }
    for (let i = 0; i < result1.length; i++) {
        if (dataMap[result1[i].director] != undefined) {
            data[dataMap[result1[i].director]].create_num += parseInt(result1[i].count)
        }
    }
    for (let i = 0; i < result2.length; i++) {
        if (dataMap[result2[i].director] != undefined) {
            data[dataMap[result2[i].director]].create_num += parseInt(result2[i].count)
        }
    }
    return {columns, data}
}

developmentService.getProductSales = async (params) => {
    let start = moment(params.start).format('YYYY-MM-DD')
    let end = moment(params.end).format('YYYY-MM-DD') + ' 23:59:59'
    let mStart = moment(params.start).subtract(1, 'month').format('YYYY-MM-DD')
    let mEnd = moment(params.end).subtract(1, 'month').format('YYYY-MM-DD') + ' 23:59:59'
    let yStart = moment(params.start).subtract(1, 'year').format('YYYY-MM-DD')
    let yEnd = moment(params.end).subtract(1, 'year').format('YYYY-MM-DD') + ' 23:59:59'
    let columns = [], data = [], dataMap = {}, priceMap = {}, defaultTmp = {}
    let result = await goodsSkuRepo.getProductSku(params)
    let sku_ids = []    
    let realStart = moment(params.start).subtract(3, 'month').format('YYYY-MM-DD') 
    if (params.infoType > 0) {
        let info = await actHiProcinstRepo.getInfoByDateAndType(params.infoType, realStart, end)
        for (let i = 0; i < info.length; i++) {
            if (info[i].info != null) {
                let content = new ObjectInputStream(info[i].info)
                content = content.readObject()
                content?.annotations.splice(0, 1)
                content = content?.annotations
                for (let j = 0; j < content?.length; j++) {
                    for (let k = 0; k < content[j].annotations.length; k++) {
                        if (['Fxx1ma3pg5efdec', 'F1ujma2exiosbcc', 'Fssama252xmjbzc'].includes(content[j].annotations[k])) {
                            sku_ids.push(content[j].annotations[k+1])
                        }
                    }
                }
            }
        }
        info = newFormsRepo.getInfoByDateAndType(params.infoType, realStart, end)
        for (let i = 0; i < info.length; i++) {
            sku_ids.push(info[i].sku_id)
        }
    }
    if (params.type == 0) {
        columns = [
            { label: '事业部', field_id: 'division', visible: true },
            { label: '平台', field_id: 'project', visible: true },
            { label: 'GMV', field_id: 'sale_amount', visible: true },
            { label: '毛利润', field_id: 'gross_profit', visible: true },
            { label: '利润额(胜算)', field_id: 'profit', visible: true },
            { label: '利润率(胜算)', field_id: 'profit_percent', visible: true },
            { label: '利润率(牌价)', field_id: 'standard_profit_percent', visible: true },
            { label: '新品GMV占比(%)', field_id: 'new_percent', visible: true },
            { label: '环比(%)', field_id: 'sale_amount_qoq', visible: true },
            { label: '同比(%)', field_id: 'sale_amount_yoy', visible: true },
        ]
        for (let i = 0; i < result.length; i++) {
            if (params.infoType > 0 && !sku_ids.includes(result[i].sku_id)) continue
            let index = `${result[i].division_name}_${result[i].project_name}`
            if (dataMap[index] == undefined) {
                dataMap[index] = {
                    skuids: '',
                    shops: '',
                    newSkuids: ''
                }
            }
            priceMap[result[i].sku_id] = parseFloat(result[i].price || 0)
            if (moment(result[i].create_time).add(90, 'day') > moment() && dataMap[index].newSkuids.indexOf(result[i].sku_id) == -1) {
                dataMap[index].newSkuids = `${dataMap[index].newSkuids}"${result[i].sku_id.replace('"', '\\"')}",`
            }
            if (dataMap[index].skuids.indexOf(result[i].sku_id) == -1)
                dataMap[index].skuids = `${dataMap[index].skuids}"${result[i].sku_id.replace('"', '\\"')}",`
            if (dataMap[index].shops.indexOf(result[i].shop_name) == -1)
                dataMap[index].shops = `${dataMap[index].shops}"${result[i].shop_name}",`
        }
    } else if (params.type == 1) {
        columns = [
            { label: '店铺', field_id: 'shop_name', visible: true },
            { label: 'GMV', field_id: 'sale_amount', visible: true },
            { label: '毛利润', field_id: 'gross_profit', visible: true },
            { label: '利润额(胜算)', field_id: 'profit', visible: true },
            { label: '利润率(胜算%)', field_id: 'profit_percent', visible: true },
            { label: '利润率(牌价%)', field_id: 'standard_profit_percent', visible: true },
            { label: '新品GMV占比(%)', field_id: 'new_percent', visible: true },
            { label: '环比(%)', field_id: 'sale_amount_qoq', visible: true },
            { label: '同比(%)', field_id: 'sale_amount_yoy', visible: true },
        ]        
        for (let i = 0; i < result.length; i++) {
            if (params.infoType > 0 && !sku_ids.includes(result[i].sku_id)) continue
            let index = `${result[i].shop_name}`
            if (dataMap[index] == undefined) {
                dataMap[index] = {
                    skuids: '',
                    shops: '',
                    newSkuids: ''
                }
            }
            priceMap[result[i].sku_id] = parseFloat(result[i].price || 0)
            if (moment(result[i].create_time).add(90, 'day') > moment() && dataMap[index].newSkuids.indexOf(result[i].sku_id) == -1) {
                dataMap[index].newSkuids = `${dataMap[index].newSkuids}"${result[i].sku_id.replace('"', '\\"')}",`
            }
            if (dataMap[index].skuids.indexOf(result[i].sku_id) == -1)
                dataMap[index].skuids = `${dataMap[index].skuids}"${result[i].sku_id.replace('"', '\\"')}",`
            if (dataMap[index].shops.indexOf(result[i].shop_name) == -1)
                dataMap[index].shops = `${dataMap[index].shops}"${result[i].shop_name}",`
        }
    } else {
        columns = [
            { label: '一级类目', field_id: 'first_category', visible: true },
            { label: '二级类目', field_id: 'second_category', visible: true },
            { label: '三级类目', field_id: 'third_category', visible: true },
            { label: 'SPU', field_id: 'spu', visible: true },
            { label: 'GMV', field_id: 'sale_amount', visible: true },
            { label: '毛利润', field_id: 'gross_profit', visible: true },
            { label: '利润额(胜算)', field_id: 'profit', visible: true },
            { label: '利润率(胜算%)', field_id: 'profit_percent', visible: true },
            { label: '利润率(牌价%)', field_id: 'standard_profit_percent', visible: true },
            { label: '环比(%)', field_id: 'sale_amount_qoq', visible: true },
            { label: '同比(%)', field_id: 'sale_amount_yoy', visible: true },
        ]
        for (let i = 0; i < result.length; i++) {
            if (params.infoType > 0 && !sku_ids.includes(result[i].sku_id)) continue
            let index = `${result[i].first_category}_${result[i].second_category}_${result[i].third_category}_${result[i].spu}`
            if (dataMap[index] == undefined) {
                dataMap[index] = {
                    skuids: '',
                    shops: '',
                    newSkuids: ''
                }
            }
            priceMap[result[i].sku_id] = parseFloat(result[i].price || 0)
            if (moment(result[i].create_time).add(90, 'day') > moment() && dataMap[index].newSkuids.indexOf(result[i].sku_id) == -1) {
                dataMap[index].newSkuids = `${dataMap[index].newSkuids}"${result[i].sku_id.replace('"', '\\"')}",`
            }
            if (dataMap[index].skuids.indexOf(result[i].sku_id) == -1)
                dataMap[index].skuids = `${dataMap[index].skuids}"${result[i].sku_id.replace('"', '\\"')}",`
            if (dataMap[index].shops.indexOf(result[i].shop_name) == -1)
                dataMap[index].shops = `${dataMap[index].shops}"${result[i].shop_name}",`
        }
    }
    for (let i = 0; i < columns.length; i++) {
        defaultTmp[columns[i].field_id] = 0
    }
    for (let index in dataMap) {
        if (index && dataMap[index].skuids.length) {
            let skuids = dataMap[index].skuids.substring(0, dataMap[index].skuids.length - 1)
            let shops = dataMap[index].shops.substring(0, dataMap[index].shops.length - 1)
            let result = await goodsSaleInfoRepo.getSalesBySkuAndShopAndDate(skuids, shops, start, end)
            let tmp = JSON.parse(JSON.stringify(defaultTmp))
            if (params.type == 0) {
                tmp.division = index.split('_')[0]
                tmp.project = index.split('_')[1]
            } else if (params.type == 1) {
                tmp.shop_name = index
            } else {
                tmp.first_category = index.split('_')[0]
                tmp.second_category = index.split('_')[1]
                tmp.third_category = index.split('_')[2]
                tmp.spu = index.split('_')[3]
            }
            if (result?.length) {
                tmp.sale_amount = parseFloat(result[0].sale_amount).toFixed(2)
                tmp.gross_profit = (parseFloat(result[0].sale_amount) - parseFloat(result[0].cost_amount)).toFixed(2)
                tmp.profit = parseFloat(result[0].profit).toFixed(2)
                tmp.profit_percent = parseFloat(result[0].sale_amount) > 0 ? 
                    (parseFloat(result[0].profit)/parseFloat(result[0].sale_amount)*100).toFixed(2) : '0.00'
                let result1 = await goodsSaleInfoRepo.getSalesBySkuAndShopAndDate(skuids, shops, mStart, mEnd)
                let result2 = await goodsSaleInfoRepo.getSalesBySkuAndShopAndDate(skuids, shops, yStart, yEnd)
                let result3 = await goodsSaleInfoRepo.getQtyBySkuAndShopAndDate(skuids, shops, start, end)
                if (parseFloat(result[0].cost_amount) > 0) {
                    let price = 0, cost_amount = 0
                    for (let i = 0; i < result3.length; i++) {
                        if (priceMap[result3[i].sku_code] != undefined) {
                            price += priceMap[result3[i].sku_code] * parseInt(result3[i].sale_qty)
                            cost_amount += parseInt(result3[i].cost_amount)
                        }
                    }
                    tmp.standard_profit_percent = ((1 - price/parseFloat(result[0].cost_amount))*100).toFixed(2)
                }
                if (dataMap[index].newSkuids.length && parseFloat(result[0].sale_amount) > 0) {
                    let newSkuids = dataMap[index].newSkuids.substring(0, dataMap[index].newSkuids.length - 1)
                    let result4 = await goodsSaleInfoRepo.getSalesBySkuAndShopAndDate(newSkuids, shops, start, end)
                    if (result4?.length) {
                        tmp['new_percent'] = (parseFloat(result4[0].sale_amount)/parseFloat(result[0].sale_amount)*100).toFixed(2)
                    }
                }
                if (result1?.length && parseFloat(result1[0].sale_amount) > 0) {
                    tmp.sale_amount_qoq = ((result[0].sale_amount-result1[0].sale_amount)/result1[0].sale_amount*100).toFixed(2)
                }
                if (result2?.length && parseFloat(result2[0].sale_amount) > 0) {
                    tmp.sale_amount_yoy = ((result[0].sale_amount-result2[0].sale_amount)/result2[0].sale_amount*100).toFixed(2)
                }
            }
            data.push(tmp)
        }
    }
    return {columns, data}
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

developmentService.getsputags = async(type) =>{
    let result = await goodsSalesRepo.getsputags(type)
    const sortOrder = {
        "高周转":1,
        "正常周转":2,
        "低周转":3,
        "滞销":4,
        "零动销":5
    }
    const sortedData = result.sort((a, b) => {
        const groupA = a.attribute
        const groupB = b.attribute
        return sortOrder[groupA] - sortOrder[groupB]
    })
    return sortedData
}

developmentService.getfirst = async(type) =>{
    let result = await goodsSalesRepo.getfirst(type)
    return result
}

developmentService.getfirstInfo = async(type,first,second,third) =>{
    console.log(third)
    let result = await goodsSalesRepo.getfirstInfo(type,first,second,third)
    return result
}

developmentService.getProcessInfo = async (params) => {
    let start = moment(params.start).format('YYYY-MM-DD')
    let end = moment(params.end).format('YYYY-MM-DD') + ' 23:59:59'
    let typeList = [], data, result = [], tmp = {}, defaultTmp = {}, info = [], resultMap = {}
    switch (params.type) {
        case '0':
            typeList = [
                'total', 'choose', 'reject', 'select', 
                'ip_review', 'ip_design', 'sample', 'preorder',
                'order', 'purchase_order', 'pre_vision', 'vision_running', 
                'vision_completed', 'plan_running', 'plan_completed'
            ]
            data = await processesRepo.getProcessNodeCount(typeList, start, end)
            for (let i = 0; i < typeList.length; i++) {
                tmp[typeList[i]] = 0
            }
            let dataMap = {}
            defaultTmp = JSON.parse(JSON.stringify(tmp))
            defaultTmp.division = '合计'
            for (let i = 0; i < data?.length; i++) {
                let index = `${data[i].division}_${data[i].develop_type}`
                if (dataMap[index] == undefined) {
                    dataMap[index] = result.length
                    tmp['id'] = result.length.toString()
                    tmp['parent_id'] = null
                    result.push(JSON.parse(JSON.stringify(tmp)))
                    result[dataMap[index]]['division'] = data[i].division
                    result[dataMap[index]]['develop_type'] = data[i].develop_type                 
                }
                result[dataMap[index]][data[i].type] += data[i].count
                defaultTmp[data[i].type] += data[i].count
            }
            defaultTmp['purchase'] = 0
            defaultTmp['warehouse'] = 0
            defaultTmp['shelfing'] = 0
            defaultTmp['shelf'] = 0
            for (let i = 0; i < result.length; i++) {
                result[i]['purchase'] = 0
                result[i]['warehouse'] = 0
                result[i]['shelfing'] = 0
                result[i]['shelf'] = 0
                resultMap[`${result[i]['division']}_${result[i]['develop_type']}`] = i
            }
            info = await processesRepo.getSelectedProcessSkuInfo(0, start, end)
            for (let i = 0; i < info.length; i++) {
                let index = resultMap[`${info[i]['division']}_${info[i]['develop_type']}`]
                let skuids = '', skuMap = {}, infoMap = {}, infoMap1 = {}, infoMap2 = {}, infoMap3 = {}
                if (info[i].info) {                    
                    let content = JSON.parse(info[i].info)
                    skuMap[info[i].id] = ''
                    for (let j = 0; j < content?.length; j++) {
                        let noneDigit = /^\D/
                        let first = noneDigit.test(content[j]['事业部一订货量']) ? 0:parseInt(content[j]['事业部一订货量'])
                        let second = noneDigit.test(content[j]['事业部二订货量']) ? 0:parseInt(content[j]['事业部二订货量'])
                        let third = noneDigit.test(content[j]['事业部三订货量']) ? 0:parseInt(content[j]['事业部三订货量'])
                        if (content[j]['商品编码'] && first + second + third > 0) {
                            skuids = `${skuids}${content[j]['商品编码']}","`
                            skuMap[content[j]['商品编码']] = info[i].id
                        }
                    }
                }
                if (skuids?.length) {
                    skuids = skuids.substring(0, skuids.length - 3)
                    let purchase = await purchaseRepo.getOrderingBySkuCode(skuids)
                    for (let j = 0; j < purchase.length; j++) {
                        if (!infoMap[skuMap[purchase[j].sku_id]]) {
                            result[index]['purchase'] += 1                            
                            defaultTmp['purchase'] += 1
                            infoMap[skuMap[purchase[j].sku_id]] = true
                        }
                    }
                    let warehouse = await purchaseRepo.getBySkuCode(skuids)
                    let skuids1 = ''
                    for (let j = 0; j < warehouse.length; j++) {
                        skuids1 = `${skuids1}${warehouse[j].sku_code}","`
                    }
                    let shelf = await goodsSkuRepo.getBySysSkuId(skuids)
                    for (let j = 0; j < shelf.length; j++) {
                        if (!infoMap2[skuMap[shelf[j].sku_code]]) {
                            result[index]['shelf'] += 1                       
                            defaultTmp['shelf'] += 1
                            infoMap2[skuMap[shelf[j].sku_code]] = true
                        }
                    }
                    if (skuids1?.length) {
                        skuids1 = skuids1.substring(0, skuids1.length - 3)
                        if (skuids1.length == skuids.length) {
                            result[index]['warehouse'] += 1                           
                            defaultTmp['warehouse'] += 1
                            let shelfing = await purchaseRepo.getShelfingBySkuCode(skuids1)
                            for (let j = 0; j < shelfing.length; j++) {
                                if (!infoMap3[skuMap[shelfing[j].sku_code]]) {
                                    result[index]['shelfing'] += 1                   
                                    defaultTmp['shelfing'] += 1
                                    infoMap3[skuMap[shelfing[j].sku_code]] = true
                                }
                            }
                        }
                    }
                }
            }            
            defaultTmp['id'] = result.length
            defaultTmp['parent_id'] = null
            result.push(defaultTmp)
            break
        case '1':
            typeList = [
                'choose', 'pre_vision', 'vision_running', 
                'vision_completed'
            ]
            data = await processesRepo.getProcessNodeCount(typeList, start, end)
            for (let i = 0; i < typeList.length; i++) {
                tmp[typeList[i]] = 0
            }
            tmp['id'] = result.length.toString()
            tmp['parent_id'] = null
            result.push(tmp)
            for (let i = 0; i < data.length; i++) {
                result[0][data[i].type] += data[i].count
            }
            break
        case '2':
            typeList = [
                'preorder', 'order', 'purchase_order'
            ]
            data = await processesRepo.getProcessNodeCount(typeList, start, end)
            for (let i = 0; i < typeList.length; i++) {
                tmp[typeList[i]] = 0
            }
            tmp['id'] = result.length.toString()
            tmp['parent_id'] = null
            result.push(tmp)
            for (let i = 0; i < data.length; i++) {
                result[0][data[i].type] += data[i].count
            }
            for (let i = 0; i < result.length; i++) {
                result[i]['purchase'] = 0
                result[i]['warehouse'] = 0
                result[i]['shelfing'] = 0
                result[i]['shelf'] = 0
                resultMap[`${result[i]['division']}_${result[i]['develop_type']}`] = i
            }
            info = await processesRepo.getSelectedProcessSkuInfo(0, start, end)
            for (let i = 0; i < info.length; i++) {
                let index = resultMap[`${info[i]['division']}_${info[i]['develop_type']}`]
                let skuids = '', skuMap = {}, infoMap = {}, infoMap1 = {}, infoMap2 = {}, infoMap3 = {}
                if (info[i].info) {
                    let content = JSON.parse(info[i].info)
                    skuMap[info[i].id] = ''
                    for (let j = 0; j < content?.length; j++) {
                        let noneDigit = /^\D/
                        let first = noneDigit.test(content[j]['事业部一订货量']) ? 0:parseInt(content[j]['事业部一订货量'])
                        let second = noneDigit.test(content[j]['事业部二订货量']) ? 0:parseInt(content[j]['事业部二订货量'])
                        let third = noneDigit.test(content[j]['事业部三订货量']) ? 0:parseInt(content[j]['事业部三订货量'])
                        if (content[j]['商品编码'] && first + second + third > 0) {
                            skuids = `${skuids}${content[j]['商品编码']}","`
                            skuMap[content[j]['商品编码']] = info[i].id
                        }
                    }
                }
                if (skuids?.length) {
                    skuids = skuids.substring(0, skuids.length - 3)
                    let purchase = await purchaseRepo.getOrderingBySkuCode(skuids)
                    for (let j = 0; j < purchase.length; j++) {
                        if (!infoMap[skuMap[purchase[j].sku_id]]) {
                            result[index]['purchase'] += 1                            
                            defaultTmp['purchase'] += 1
                            infoMap[skuMap[purchase[j].sku_id]] = true
                        }
                    }
                    let warehouse = await purchaseRepo.getBySkuCode(skuids)
                    let skuids1 = ''
                    for (let j = 0; j < warehouse.length; j++) {
                        skuids1 = `${skuids1}${warehouse[j].sku_code}","`
                    }
                    let shelf = await goodsSkuRepo.getBySysSkuId(skuids)
                    for (let j = 0; j < shelf.length; j++) {
                        if (!infoMap2[skuMap[shelf[j].sku_code]]) {
                            result[index]['shelf'] += 1                       
                            defaultTmp['shelf'] += 1
                            infoMap2[skuMap[shelf[j].sku_code]] = true
                        }
                    }
                    if (skuids1?.length) {
                        skuids1 = skuids1.substring(0, skuids1.length - 3)
                        if (skuids1.length == skuids.length) {
                            result[index]['warehouse'] += 1                           
                            defaultTmp['warehouse'] += 1
                            let shelfing = await purchaseRepo.getShelfingBySkuCode(skuids1)
                            for (let j = 0; j < shelfing.length; j++) {
                                if (!infoMap3[skuMap[shelfing[j].sku_code]]) {
                                    result[index]['shelfing'] += 1                   
                                    defaultTmp['shelfing'] += 1
                                    infoMap3[skuMap[shelfing[j].sku_code]] = true
                                }
                            }
                        }
                    }
                }
            }
            break
        case '3':
            typeList = [
                'total', 'choose', 'reject', 'select', 
                'ip_review', 'ip_design', 'sample', 'preorder',
                'order', 'purchase_order', 'pre_vision', 'vision_running', 
                'vision_completed', 'plan_running', 'plan_completed'
            ]
            data = await processesRepo.getProcessNodeCount(typeList, start, end)
            for (let i = 0; i < typeList.length; i++) {
                tmp[typeList[i]] = 0
            }
            tmp['ft'] = 0
            tmp['gys'] = 0
            tmp['zy'] = 0
            tmp['ip'] = 0
            tmp['scfx'] = 0
            defaultTmp['ft'] = 0
            defaultTmp['gys'] = 0
            defaultTmp['zy'] = 0
            defaultTmp['ip'] = 0
            defaultTmp['scfx'] = 0
            let infoType = 'developer', infoMap = {}
            defaultTmp = JSON.parse(JSON.stringify(tmp))
            defaultTmp.developer = '合计'
            for (let i = 0; i < data.length; i++) {
                if (infoMap[data[i][infoType]] != undefined) {
                    result[infoMap[data[i][infoType]]][data[i].type] += data[i].count
                } else {
                    infoMap[data[i][infoType]] = result.length
                    tmp['id'] = result.length.toString()                  
                    tmp['parent_id'] = null
                    result.push(JSON.parse(JSON.stringify(tmp)))
                    result[result.length-1][infoType] = data[i][infoType]
                    result[result.length-1][data[i].type] += data[i].count
                }
                defaultTmp[data[i].type] += data[i].count
                if (data[i].type == 'total')
                    switch (data[i].develop_type) {
                        case '反推推品':
                            result[infoMap[data[i][infoType]]]['ft'] += data[i].count
                            defaultTmp['ft'] += data[i].count
                            break
                        case '供应商推品':
                            result[infoMap[data[i][infoType]]]['gys'] += data[i].count
                            defaultTmp['gys'] += data[i].count
                            break
                        case '自研推品':
                            result[infoMap[data[i][infoType]]]['zy'] += data[i].count
                            defaultTmp['zy'] += data[i].count
                            break
                        case 'IP推品':
                            result[infoMap[data[i][infoType]]]['ip'] += data[i].count
                            defaultTmp['ip'] += data[i].count
                            break
                        default:                        
                            result[infoMap[data[i][infoType]]]['scfx'] += data[i].count
                            defaultTmp['scfx'] += data[i].count
                    }
            }
            defaultTmp['purchase'] = 0
            defaultTmp['warehouse'] = 0
            defaultTmp['shelfing'] = 0
            defaultTmp['shelf'] = 0
            for (let i = 0; i < result.length; i++) {
                result[i]['purchase'] = 0
                result[i]['warehouse'] = 0
                result[i]['shelfing'] = 0
                result[i]['shelf'] = 0
                resultMap[`${result[i]['division']}_${result[i]['develop_type']}`] = i
            }
            info = await processesRepo.getSelectedProcessSkuInfo(0, start, end)
            for (let i = 0; i < info.length; i++) {
                let index = resultMap[`${info[i]['division']}_${info[i]['develop_type']}`]
                let skuids = '', skuMap = {}, infoMap = {}, infoMap1 = {}, infoMap2 = {}, infoMap3 = {}
                if (info[i].info) {
                    let content = JSON.parse(info[i].info)
                    skuMap[info[i].id] = ''
                    for (let j = 0; j < content?.length; j++) {
                        let noneDigit = /^\D/
                        let first = noneDigit.test(content[j]['事业部一订货量']) ? 0:parseInt(content[j]['事业部一订货量'])
                        let second = noneDigit.test(content[j]['事业部二订货量']) ? 0:parseInt(content[j]['事业部二订货量'])
                        let third = noneDigit.test(content[j]['事业部三订货量']) ? 0:parseInt(content[j]['事业部三订货量'])
                        if (content[j]['商品编码'] && first + second + third > 0) {
                            skuids = `${skuids}${content[j]['商品编码']}","`
                            skuMap[content[j]['商品编码']] = info[i].id
                        }
                    }
                }
                if (skuids?.length) {
                    skuids = skuids.substring(0, skuids.length - 3)
                    let purchase = await purchaseRepo.getOrderingBySkuCode(skuids)
                    for (let j = 0; j < purchase.length; j++) {
                        if (!infoMap[skuMap[purchase[j].sku_id]]) {
                            result[index]['purchase'] += 1                            
                            defaultTmp['purchase'] += 1
                            infoMap[skuMap[purchase[j].sku_id]] = true
                        }
                    }
                    let warehouse = await purchaseRepo.getBySkuCode(skuids)
                    let skuids1 = ''
                    for (let j = 0; j < warehouse.length; j++) {
                        skuids1 = `${skuids1}${warehouse[j].sku_code}","`
                    }
                    let shelf = await goodsSkuRepo.getBySysSkuId(skuids)
                    for (let j = 0; j < shelf.length; j++) {
                        if (!infoMap2[skuMap[shelf[j].sku_code]]) {
                            result[index]['shelf'] += 1                       
                            defaultTmp['shelf'] += 1
                            infoMap2[skuMap[shelf[j].sku_code]] = true
                        }
                    }
                    if (skuids1?.length) {
                        skuids1 = skuids1.substring(0, skuids1.length - 3)
                        if (skuids1.length == skuids.length) {
                            result[index]['warehouse'] += 1                           
                            defaultTmp['warehouse'] += 1
                            let shelfing = await purchaseRepo.getShelfingBySkuCode(skuids1)
                            for (let j = 0; j < shelfing.length; j++) {
                                if (!infoMap3[skuMap[shelfing[j].sku_code]]) {
                                    result[index]['shelfing'] += 1                   
                                    defaultTmp['shelfing'] += 1
                                    infoMap3[skuMap[shelfing[j].sku_code]] = true
                                }
                            }
                        }
                    }
                }
            }
            defaultTmp['parent_id'] = null
            defaultTmp['id'] = result.length
            result.push(defaultTmp)
            break
        case '4':
            info = await processesRepo.getProcessSelectedCount(start, end, params.removeCoupang)
            defaultTmp = {select_division: '合计', first: 0, second: 0, third: 0, total: 0}
            result = [
                {id: '0', parent_id: null, select_division: '否', first: 0, second: 0, third: 0, total: 0},
                {id: '1', parent_id: null, select_division: '刘+陆', first: 0, second: 0, third: 0, total: 0},
                {id: '2', parent_id: null, select_division: '陆+王', first: 0, second: 0, third: 0, total: 0},
                {id: '3', parent_id: null, select_division: '刘+王', first: 0, second: 0, third: 0, total: 0},
                {id: '4', parent_id: null, select_division: '三个', first: 0, second: 0, third: 0, total: 0},
            ]
            let type = 0, first = 0, second = 0, third = 0
            for (let i = 0; i < info.length; i++) {
                if (i == 0) {
                    first = info[i].type == 1 ? 1:0
                    second = info[i].type == 2 ? 1:0
                    third = info[i].type == 3 ? 1:0
                } else if (i > 0 && (info[i-1].id != info[i].id)) {
                    result[type].first += parseInt(first)
                    result[type].second += parseInt(second)
                    result[type].third += parseInt(third)
                    result[type].total = (result[type].first + result[type].second + result[type].third) / 
                        (type == 4 ? 3 : (type == 0 ? 1:2))
                    first = info[i].type == 1 ? 1:0
                    second = info[i].type == 2 ? 1:0
                    third = info[i].type == 3 ? 1:0
                    type = 0
                } else if (i > 0 && (info[i-1].type != info[i].type && info[i-1].id == info[i].id)) {
                    first = info[i].type == 1 ? first + 1 : first
                    second = info[i].type == 2 ? second + 1 : second
                    third = info[i].type == 3 ? third + 1 : third
                    if (first && second && third) type = 4
                    else if (first && second) type = 1
                    else if (second && third) type = 2
                    else if (first && third) type = 3
                }
            }            
            result[type].first += parseInt(first)
            result[type].second += parseInt(second)
            result[type].third += parseInt(third)
            result[type].total = (result[type].first + result[type].second + result[type].third) / 
                (type == 4 ? 3 : (type == 0 ? 1:2))
            defaultTmp.first = result[0].first + result[1].first + result[2].first + result[3].first + result[4].first
            defaultTmp.second = result[0].second + result[1].second + result[2].second + result[3].second + result[4].second
            defaultTmp.third = result[0].third + result[1].third + result[2].third + result[3].third + result[4].third
            defaultTmp.total = result[0].total + result[1].total + result[2].total + result[3].total + result[4].total
            defaultTmp['id'] = '5'
            defaultTmp['parent_id'] = null
            result.push(defaultTmp)
            break
        default:
    }
    return result
}

developmentService.getProcessDetail = async (params) => {
    let result = [], type  
    let start = moment(params.start).format('YYYY-MM-DD')
    let end = moment(params.end).format('YYYY-MM-DD') + ' 23:59:59'
    if (params.selectType == 'select_division') {
        let info = await processesRepo.getProcessSelectedCount(start, end, params.removeCoupang)
        let ids = '', infoMap = [], infoType = 0
        for (let i = 0; i < info?.length; i++) {
            if (params.infoType)
                if (i > 0 && info[i].id != info[i-1].id) {
                    if ((params.infoType == '刘+陆' && infoType == 1) || 
                        (params.infoType == '陆+王' && infoType == 2) || 
                        (params.infoType == '刘+王' && infoType == 3) || 
                        (params.infoType == '三个' && infoType == 4)) 
                        ids = `${ids}${info[i-1].id}","` 
                    else if ((params.infoType == '否' && infoType == 0)) {
                        if ((params.type == 'first' && info[i-1].type == 1) || 
                            (params.type == 'second' && info[i-1].type == 2) || 
                            (params.type == 'third' && info[i-1].type == 3) || (params.type == 'total'))
                            ids = `${ids}${info[i-1].id}","` 
                    }             
                    infoType = 0
                    infoMap = [info[i].type]
                } else {
                    infoMap.push(info[i].type)
                    if (infoMap.includes(1) && infoMap.includes(2) && infoMap.includes(3)) {
                        infoType = 4
                    } else if (infoMap.includes(1) && infoMap.includes(2)) {
                        infoType = 1
                    } else if (infoMap.includes(2) && infoMap.includes(3)) {
                        infoType = 2
                    } else if (infoMap.includes(1) && infoMap.includes(3)) {
                        infoType = 3
                    }
                }
            else ids = `${ids}${info[i].id}","`
        }
        if (info?.length) {
            if ((params.infoType == '刘+陆' && infoType == 1) || 
                (params.infoType == '陆+王' && infoType == 2) || 
                (params.infoType == '刘+王' && infoType == 3) || 
                (params.infoType == '三个' && infoType == 4)) 
                ids = `${ids}${info[info.length - 1].id}","` 
            else if ((params.infoType == '否' && infoType == 0)) {
                if ((params.type == 'first' && info[info.length - 1].type == 1) || 
                    (params.type == 'second' && info[info.length - 1].type == 2) || 
                    (params.type == 'third' && info[info.length - 1].type == 3) || (params.type == 'total'))
                    ids = `${ids}${info[info.length - 1].id}","` 
            }
        }
        if (ids?.length) {
            ids = ids.substring(0, ids?.length - 3)
            result = await processesRepo.getProcessInfo(params.removeCoupang, start, end, 'choose', 'select_division', ids)
        }
        type = 0
    } else if (params.type == 'total') {
        if (params.selectType)
            result = await processesRepo.getProcessInfo(params.removeCoupang, start, end, params.type, params.selectType, params.infoType, params.selectType1, params.infoType1)
        else result = await processesRepo.getProcessInfo(params.removeCoupang, start, end)
        type = 0
    } else if (['choose', 'purchase', 'warehouse', 'shelfing', 'shelf', 'reject', 
        'select', 'ip_review', 'ip_design', 'sample', 'preorder', 'order', 
        'purchase_order', 'pre_vision'].includes(params.type)) {
        if (params.selectType) 
            result = await processesRepo.getProcessInfo(params.removeCoupang, start, end, params.type, params.selectType, params.infoType, params.selectType1, params.infoType1)
        else result = await processesRepo.getProcessInfo(params.removeCoupang, start, end, params.type)
        type = 0
    } else if (['vision_running', 'vision_completed'].includes(params.type)) {
        let info = await processesRepo.getSelectedProcessSkuInfo(params.removeCoupang, start, end, params.selectType, params.infoType, params.selectType1, params.infoType1)
        let ids = ''
        for (let i = 0; i < info.length; i++) {
            ids = `${ids}${info[i].id}","`
        }
        if (ids?.length) {
            ids = ids.substring(0, ids.length - 3)
            result = await processesRepo.getProcessInfo1(params.removeCoupang, params.type, ids)
        }
        type = 1
    } else if (['plan_running', 'plan_completed'].includes(params.type)) {
        let info = await processesRepo.getSelectedProcessSkuInfo(params.removeCoupang, start, end, params.selectType, params.infoType, params.selectType1, params.infoType1)
        let ids = ''
        for (let i = 0; i < info.length; i++) {
            ids = `${ids}${info[i].id}","`
        }
        if (ids?.length) {
            ids = ids.substring(0, ids.length - 3)
            result = await processesRepo.getProcessInfo2(params.removeCoupang, params.type, ids)
        }
        type = 2
    }
    if (type == 0) {
        for (let i = 0; i < result.length; i++) {
            if (['市场分析推品', 'IP推品', '自研推品'].includes(result[i].type)) {
                switch (result[i].node) {
                    case '分配设计执行人1': //立项到草图设计完成
                    case '上传设计草图1':
                    case '发起人审核设计草图1':
                    case '审核设计草图1':
                    case '立项审核分配开发执行人': 
                    case '开发判断是否需要自主设计并填写相关信息':
                    case '北京分配设计执行人':
                    case '杭州分配设计执行人':
                    case '北京上传设计草图':
                    case '杭州上传设计草图':
                    case '分配设计执行人':
                    case '上传设计草图':
                        result[i]['other_status'] = '立项到草图设计完成'
                        break
                    case '开发根据设计草图沟通工厂并更新产品信息1': //草图到定稿
                    case '发起人审核产品信息1':
                    case '审核产品信息1':
                    case '填写周期及上传定稿图1':
                    case '审核定稿图1':
                    case '发起人审核设计草图':
                    case '事业部1负责人审核草图':
                    case '事业部3负责人审核草图':
                    case '事业部2负责人审核草图':
                    case '审核设计草图':
                    case '事业部一负责人审核草图':
                    case '事业部二负责人审核草图':
                    case '事业部三负责人审核草图':
                    case '崔总审核产品信息':
                    case '填写周期及上传定稿图':
                    case '审核定稿图':
                        result[i]['other_status'] = '草图到定稿'
                        break
                    case '发起人审核产品信息':
                        // 自研 草图到定稿
                        if (result[i].type == '自研推品') result[i]['other_status'] = '草图到定稿'
                        // IP 定稿到设计监修
                        else result[i]['other_status'] = '定稿到设计监修'
                        break
                    case '发起人选择确认使用设计草图': //定稿到设计监修
                    case '开发根据设计草图更新产品信息':
                    case '确认报价':
                    case '事业部1负责人审核产品信息':
                    case '事业部3负责人审核产品信息':
                    case '事业部2负责人审核产品信息':
                    case '审核产品信息':
                    case '增加完整产品设计并提供监修文件':
                    case 'IP设计监修':
                    case '设计监修通过并上传链图云':
                        result[i]['other_status'] = '定稿到设计监修'
                        break
                    case '开发寄样2': //定稿到选中
                    case '杭州确认样品2':
                    case '发起人审核样品2':
                    case '审核样品2':
                    case '开发审核样品':
                    case '事业部1负责人审核样品':
                    case '事业部3负责人审核样品':
                    case '事业部2负责人审核样品':
                    case '设计审核样品':
                    case '确认样品':
                    case '开发寄样':
                    case '杭州确认样品':
                    case '发起人审核样品':
                    case '崔总审核样品':
                    case '建立聚水潭信息并填写商品编码':
                    case '产品厂图+白膜信息上传网盘在线链接':
                    case '事业部一是否订货':
                    case '事业部二是否订货':
                    case '事业部三是否订货':
                        result[i]['other_status'] = '定稿到选中'
                        break
                    case '开发工厂打样起始时间2': //工厂打样
                    case '工厂打样':
                    case '开发工厂打样起始时间':
                        result[i]['other_status'] = '工厂打样'
                        break
                    case '设计报样品IP监修': //样品监修
                        result[i]['other_status'] = '样品监修'
                        break
                    case '设计报大货设计监修': //大货监修
                        result[i]['other_status'] = '大货监修'
                        break
                    case '开始视觉并视觉监修': //视觉监修
                        result[i]['other_status'] = '视觉监修'
                        break
                }
            }
            result[i].link = 'http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=' + result[i].id
            switch (result[i].process_status) {
                case -1:
                    result[i].process_status = '未开始'
                    break
                case 1:
                    result[i].process_status = '审批中'
                    break
                case 2:
                    result[i].process_status = '审批通过'
                    break
                case 3:
                    result[i].process_status = '审批不通过'
                    break
                case 4:
                    result[i].process_status = '已取消'
                    break
            }
            if (result[i].due_start) {
                result[i].duration = moment().diff(moment(result[i].due_start), 'd')
            }
            if (result[i].end_time) {
                result[i].total_duration = moment(result[i].end_time).diff(moment(result[i].start_time), 'd')
            }
            if (result[i].image != null && result[i].image.indexOf('[') != -1) {
                let content = JSON.parse(result[i].image)
                result[i].image = content[0]
            }
            if (result[i].image?.length) result[i].image = result[i].image.replace(':9000/', ':9003/').replace('http:', 'https:').replace('//bpm.', '//minio.')
            if (result[i].info) {
                result[i]['pre_purchase_num'] = 0
                result[i]['first_purchase'] = '否'
                result[i]['second_purchase'] = '否'
                result[i]['third_purchase'] = '否'
                let content = JSON.parse(result[i].info), skuids = '', skuids1 = ''
                for (let j = 0; j < content?.length; j++) {
                    let noneDigit = /^\D/
                    if (!noneDigit.test(content[j]['事业部一订货量']) && parseInt(content[j]['事业部一订货量']) > 0) {
                        result[i]['first_purchase'] = '是'
                        result[i]['pre_purchase_num'] += parseInt(content[j]['事业部一订货量'])
                    }
                    if (!noneDigit.test(content[j]['事业部二订货量']) && parseInt(content[j]['事业部二订货量']) > 0) {
                        result[i]['second_purchase'] = '是'
                        result[i]['pre_purchase_num'] += parseInt(content[j]['事业部二订货量'])
                    }
                    if (!noneDigit.test(content[j]['事业部三订货量']) && parseInt(content[j]['事业部三订货量']) > 0) {
                        result[i]['third_purchase'] = '是'
                        result[i]['pre_purchase_num'] += parseInt(content[j]['事业部三订货量'])
                    }
                    if (content[j]['商品编码'] && result[i]['pre_purchase_num'] > 0) {
                        skuids = `${skuids}${content[j]['商品编码']}","`
                    }
                }
                if (skuids?.length) {
                    skuids = skuids.substring(0, skuids.length - 3)
                    result[i]['is_purchase'] = '否'
                    result[i]['is_warehouse'] = '否'
                    let purchase = await purchaseRepo.getOrderBySkuCode(skuids)
                    if (purchase?.length) result[i]['is_purchase'] = '是'                    
                    let warehouse = await purchaseRepo.getBySkuCode(skuids)
                    if (warehouse?.length) {
                        for (let j = 0; j < warehouse.length; j++) {
                            skuids1 = `${skuids1}${warehouse[j].sku_code}","`
                        }
                        if (skuids1?.length) {
                            skuids1 = skuids1.substring(0, skuids1.length - 3)
                            if (skuids1.length == skuids.length) result[i]['is_warehouse'] = '是'
                        }
                    }                    
                    result[i]['first_shelf'] = '否'
                    let shelf1 = await goodsSkuRepo.getBySysSkuId(skuids)
                    if (shelf1?.length) result[i]['first_shelf'] = '是'
                    result[i]['second_shelf'] = '否'
                    let shelf2 = await goodsSkuRepo.getBySysSkuId(skuids)
                    if (shelf2?.length) result[i]['second_shelf'] = '是'
                    result[i]['third_shelf'] = '否'
                    let shelf3 = await goodsSkuRepo.getBySysSkuId(skuids)
                    if (shelf3?.length) result[i]['third_shelf'] = '是'                    
                }
            }
            if (params.type == 'purchase' && result[i]['is_purchase'] != '是') {
                result.splice(i, 1)
                i--
                continue
            } else if (params.type == 'warehouse' && result[i]['is_warehouse'] != '是') {
                result.splice(i, 1)
                i--
                continue
            } else if (params.type == 'shelfing' && !(result[i]['is_warehouse'] == '是' && 
                ((result[i]['first_purchase'] == '是' && result[i]['first_shelf'] == '否') || 
                (result[i]['second_purchase'] == '是' && result[i]['second_shelf'] == '否') || 
                (result[i]['third_purchase'] == '是' && result[i]['third_shelf'] == '否'))
            )) {
                result.splice(i, 1)
                i--
                continue
            } else if (params.type == 'shelf' && ((result[i]['first_shelf'] != '是') && 
                (result[i]['second_shelf'] != '是') && (result[i]['third_shelf'] != '是'))) {
                result.splice(i, 1)
                i--
                continue
            }
            if (result[i].first_time && result[i].dept == '事业一部') {
                let info = await actHiProcinstRepo.getFirstSelect1(result[i].id)
                if (info?.length) {
                    let flag = 0
                    for (let j = 0; j < info.length; j++) {
                        if (['是', '选中'].includes(info[j]['val']) && 
                            !['F6c5mbuidfzfqjc', 'Fxfrma3j75fse7c'].includes(info[j]['k'])) {
                            flag = 1
                            break
                        }
                    }
                    if (flag) result[i]['first_select'] = '选中'
                    else result[i]['first_select'] = '未选中'
                }
            } else if (result[i].first_time) {
                let info = await actHiProcinstRepo.getFirstSelect(result[i].id)
                if (info?.length) {
                    let flag = 0
                    for (let j = 0; j < info.length; j++) {
                        if (['是', '选中'].includes(info[j]['val']) && 
                            !['F6c5mbuidfzfqjc'].includes(info[j]['k'])) {
                            flag = 1
                            break
                        }
                    }
                    if (flag) result[i]['first_select'] = '选中'
                    else result[i]['first_select'] = '未选中'
                }
            }
            if (result[i].second_time && result[i].dept == '事业二部') {
                let info = await actHiProcinstRepo.getSecondSelect1(result[i].id)
                if (info?.length) {
                    let flag = 0
                    for (let j = 0; j < info.length; j++) {
                        if (['是', '选中'].includes(info[j]['val']) && 
                            !['F64jmbuie9olqmc', 'Fxfrma3j75fse7c'].includes(info[j]['k'])) {
                            flag = 1
                            break
                        }
                    }
                    if (flag) result[i]['second_select'] = '选中'
                    else result[i]['second_select'] = '未选中'
                }
            } else if (result[i].second_time) {
                let info = await actHiProcinstRepo.getSecondSelect(result[i].id)
                if (info?.length) {
                    let flag = 0
                    for (let j = 0; j < info.length; j++) {
                        if (['是', '选中'].includes(info[j]['val']) && 
                            !['F64jmbuie9olqmc'].includes(info[j]['k'])) {
                            flag = 1
                            break
                        }
                    }
                    if (flag) result[i]['second_select'] = '选中'
                    else result[i]['second_select'] = '未选中'
                }
            }
            if (result[i].third_time && result[i].dept == '事业三部') {
                let info = await actHiProcinstRepo.getThirdSelect1(result[i].id)
                if (info?.length) {
                    let flag = 0
                    for (let j = 0; j < info.length; j++) {
                        if (['是', '选中'].includes(info[j]['val']) && 
                            !['Fxkxmbuiecz2qpc', 'Fxfrma3j75fse7c'].includes(info[j]['k'])) {
                            flag = 1
                            break
                        }
                    }
                    if (flag) result[i]['third_select'] = '选中'
                    else result[i]['third_select'] = '未选中'
                }
            } else if (result[i].third_time) {
                let info = await actHiProcinstRepo.getThirdSelect(result[i].id)
                if (info?.length) {
                    let flag = 0
                    for (let j = 0; j < info.length; j++) {
                        if (['是', '选中'].includes(info[j]['val']) && 
                            !['Fxkxmbuiecz2qpc'].includes(info[j]['k'])) {
                            flag = 1
                            break
                        }
                    }
                    if (flag) result[i]['third_select'] = '选中'
                    else result[i]['third_select'] = '未选中'
                }
            }
        }
    } else if (type == 1 || type == 2) {
        for (let i = 0; i < result.length; i++) {
            if (result[i].image != null && result[i].image.indexOf('[') != -1) {
                let content = JSON.parse(result[i].image)
                result[i].image = content[0]
            }
            if (result[i].node) {
                result[i]['duration'] = moment().diff(moment(result[i].due_start), 'd')
            }
            if (result[i].end_time) {
                result[i]['total_duration'] = moment(result[i].end_time).diff(moment(result[i].start_time), 'd')
            }
            if (result[i].image?.length) result[i].image = result[i].image.replace(':9000/', ':9003/').replace('http:', 'https:').replace('//bpm.', '//minio.')
        }
    }
    return result
}

developmentService.getProcessRunningTask = async (params) => {
    let result = [], resultMap = {}, tmp = {}, info = []
    let start = moment(params.start).format('YYYY-MM-DD')
    let end = moment(params.end).format('YYYY-MM-DD') + ' 23:59'
    let defaultTmp = {id: null, parent_id: null, num: 0, average_day: 0, max_day: 0, info: '', list: []}
    if (params.type == 0) {
        info = await actHiProcinstRepo.getRunning(start, end)
    } else {
        info = await actHiProcinstRepo.getOverDue(start, end)
    }
    if (info?.length) {
        let totalTmp = JSON.parse(JSON.stringify(defaultTmp))
        totalTmp.id = ''
        totalTmp.info = '合计'
        for (let i = 0; i < info.length; i++) {
            if (resultMap[info[i].dept] == undefined) {
                resultMap[info[i].dept] = { index: result.length.toString(), children: {} }
                tmp = JSON.parse(JSON.stringify(defaultTmp))
                tmp.id = result.length.toString()
                tmp.info = info[i].dept
                result.push(tmp)
            }            
            let dept_index = resultMap[info[i].dept].index
            if (resultMap[info[i].dept].children[info[i].operator] == undefined) {
                resultMap[info[i].dept].children[info[i].operator] = {
                    index: result.length.toString(),
                    children: {}
                }
                tmp = JSON.parse(JSON.stringify(defaultTmp))
                tmp.id = result.length.toString()
                tmp.parent_id = dept_index
                tmp.info = info[i].operator
                result.push(tmp)
            }
            let operator_index = resultMap[info[i].dept].children[info[i].operator].index
            if (resultMap[info[i].dept].children[info[i].operator].children[info[i].node] == undefined) {
                resultMap[info[i].dept].children[info[i].operator].children[info[i].node] = result.length.toString()
                tmp = JSON.parse(JSON.stringify(defaultTmp))
                tmp.id = result.length.toString()
                tmp.parent_id = operator_index
                tmp.info = info[i].node
                result.push(tmp)
            }
            let node_index = resultMap[info[i].dept].children[info[i].operator].children[info[i].node]
            result[dept_index].average_day = result[dept_index].num > 0 ? 
                ((result[dept_index].average_day * result[dept_index].num + info[i].due_date) / (result[dept_index].num + 1)).toFixed(2) : info[i].due_date
            result[dept_index].num += 1
            result[dept_index].max_day = result[dept_index].max_day < info[i].due_date ? 
                info[i].due_date : result[dept_index].max_day
            result[dept_index].list.push(info[i])
            result[operator_index].average_day = result[operator_index].num > 0 ? 
                ((result[operator_index].average_day * result[operator_index].num + info[i].due_date) / (result[operator_index].num + 1)).toFixed(2) : info[i].due_date
            result[operator_index].num += 1
            result[operator_index].max_day = result[operator_index].max_day < info[i].due_date ? 
                info[i].due_date : result[operator_index].max_day
            result[operator_index].list.push(info[i])
            result[node_index].average_day = result[node_index].num > 0 ? 
                ((result[node_index].average_day * result[node_index].num + info[i].due_date) / (result[node_index].num + 1)).toFixed(2) : info[i].due_date
            result[node_index].num += 1
            result[node_index].max_day = result[node_index].max_day < info[i].due_date ? 
                info[i].due_date : result[node_index].max_day
            result[node_index].list.push(info[i])
            totalTmp.average_day = ((totalTmp.average_day * totalTmp.num + info[i].due_date) / (totalTmp.num + 1)).toFixed(2)
            totalTmp.num += 1
            totalTmp.max_day = totalTmp.max_day < info[i].due_date ? info[i].due_date : totalTmp.max_day
        }
        totalTmp.id = result.length.toString()
        result.push(totalTmp)
    }
    return result
}

developmentService.getDevelopProcess = async (start, end) => {
    let info = await processesRepo.getDevelopProcess(start, end)
    let data1 = [], data2 = []
    for (let i = 0; i < info.length; i++) {
        let select1, select2, select3
        info[i].image = info[i].image ? (info[i].image.indexOf('[') != -1 ? JSON.parse(info[i].image)[0] : info[i].image) : null
        info[i]['link'] = `http://bpm.pakchoice.cn:8848/bpm/process-instance/detail?id=${info[i].process_id}`
        if (info[i].categories) {
            info[i].categories = JSON.parse(info[i].categories)
            info[i]['first_category'] = info[i].categories[0]
            info[i]['second_category'] = info[i].categories[1]
            info[i]['third_category'] = info[i].categories[2]
        }
        if (['事业一部', '事业二部', '事业三部'].includes(info[i].node_dept)) {
            info[i]['process_node'] = '运营节点中'
        } else if (info[i].node_dept == '企划部') {
            info[i]['process_node'] = '开发节点中'
        } else if (info[i].node_dept == '货品部') {
            info[i]['process_node'] = '货品节点中'
        } else if (info[i].node_dept == '采购部') {
            info[i]['process_node'] = '采购节点中'
        } else if (info[i].node_dept == '视觉部') {
            info[i]['process_node'] = '视觉节点中'
        } else if (info[i].process_status == '审批通过') {
            info[i]['process_node'] = '完成'
        }
        if (['已取消', '审批不通过'].includes(info[i].process_status)) {
            info[i]['process_node'] = '流程终止'
            info[i]['first_select'] = '流程终止'
            info[i]['second_select'] = '流程终止'
            info[i]['third_select'] = '流程终止'
            info[i]['first_time'] = ''
            info[i]['second_time'] = ''
            info[i]['third_time'] = ''
        } else {
            if (info[i].first_time && info[i].dept == '事业一部') {
                select1 = await processesRepo.getFirstDivisionSelection1(info[i].process_id)
                let flag = 0
                for (let j = 0; j < select1?.length; j++) {
                    if (['是', '选中'].includes(select1[j].content) && 
                        !['F6c5mbuidfzfqjc', 'Fxfrma3j75fse7c'].includes(select1[j].field)) {
                        flag = 1
                        break
                    }
                }
                if (select1?.length) {
                    if (flag) info[i]['first_select'] = '选中'
                    else info[i]['first_select'] = '未选中'
                } else {
                    info[i]['first_select'] = '流程中'
                    info[i]['first_time'] = ''
                }
            } else if (info[i].first_time) {
                select1 = await processesRepo.getFirstDivisionSelection(info[i].process_id)
                let flag = 0
                for (let j = 0; j < select1?.length; j++) {
                    if (['是', '选中'].includes(select1[j].content) && 
                        !['F6c5mbuidfzfqjc'].includes(select1[j].field)) {
                        flag = 1
                        break
                    }
                }
                if (select1?.length) {
                    if (flag) info[i]['first_select'] = '选中'
                    else info[i]['first_select'] = '未选中'
                } else {
                    info[i]['first_select'] = '流程中'
                    info[i]['first_time'] = ''
                }
            } else if (info[i].process_status == '审批通过') info[i]['first_select'] = '未选中'
            else {
                info[i]['first_select'] = '流程中'
                info[i]['first_time'] = ''
            }

            if (info[i].second_time && info[i].dept == '事业二部') {
                select2 = await processesRepo.getSecondDivisionSelection1(info[i].process_id)
                let flag = 0
                for (let j = 0; j < select2?.length; j++) {
                    if (['是', '选中'].includes(select2[j].content) && 
                        !['F64jmbuie9olqmc', 'Fxfrma3j75fse7c'].includes(select2[j].field)) {
                        flag = 1
                        break
                    }
                }
                if (select2?.length) {
                    if (flag) info[i]['second_select'] = '选中'
                    else info[i]['second_select'] = '未选中'
                } else {
                    info[i]['second_select'] = '流程中'
                    info[i]['second_time'] = ''
                }
            } else if (info[i].second_time) {
                select2 = await processesRepo.getSecondDivisionSelection(info[i].process_id)
                let flag = 0
                for (let j = 0; j < select2?.length; j++) {
                    if (['是', '选中'].includes(select2[j].content) && 
                        !['F64jmbuie9olqmc'].includes(select2[j].field)) {
                        flag = 1
                        break
                    }
                }
                if (select2?.length) {
                    if (flag) info[i]['second_select'] = '选中'
                    else info[i]['second_select'] = '未选中'
                } else {
                    info[i]['second_select'] = '流程中'
                    info[i]['second_time'] = ''
                }
            } else if (info[i].process_status == '审批通过') info[i]['second_select'] = '未选中'
            else {
                info[i]['second_select'] = '流程中'
                info[i]['second_time'] = ''
            }

            if (info[i].third_time && info[i].dept == '事业三部') {
                select3 = await processesRepo.getThirdDivisionSelection1(info[i].process_id)
                let flag = 0
                for (let j = 0; j < select3?.length; j++) {
                    if (['是', '选中'].includes(select3[j].content) && 
                        !['Fxkxmbuiecz2qpc', 'Fxfrma3j75fse7c'].includes(select3[j].field)) {
                        flag = 1
                        break
                    }
                }
                if (select3?.length) {
                    if (flag) info[i]['third_select'] = '选中'
                    else info[i]['third_select'] = '未选中'
                } else {
                    info[i]['third_select'] = '流程中'
                    info[i]['third_time'] = ''
                }
            } else if (info[i].third_time) {
                select3 = await processesRepo.getThirdDivisionSelection(info[i].process_id)
                let flag = 0
                for (let j = 0; j < select3?.length; j++) {
                    if (['是', '选中'].includes(select3[j].content) && 
                        !['Fxkxmbuiecz2qpc'].includes(select3[j].field)) {
                        flag = 1
                        break
                    }
                }
                if (select3?.length) {
                    if (flag) info[i]['third_select'] = '选中'
                    else info[i]['third_select'] = '未选中'
                } else {
                    info[i]['third_select'] = '流程中'
                    info[i]['third_time'] = ''
                }
            } else if (info[i].process_status == '审批通过') info[i]['third_select'] = '未选中'
            else {
                info[i]['third_select'] = '流程中'
                info[i]['third_time'] = ''
            }
        }
        data1.push({
            start_time: info[i].start_time,
            month: info[i].month,
            image: info[i].image,
            type: info[i].type,
            link: info[i].link,
            first_category: info[i].first_category,
            second_category: info[i].second_category,
            third_category: info[i].third_category,
            spu: info[i].spu,
            start: info[i].start,
            developer: info[i].developer,
            project: info[i].project,
            dept: info[i].dept,
            process_status: info[i].process_status,
            process_node: info[i].process_node,
            first_select: info[i].first_select,
            second_select: info[i].second_select,
            third_select: info[i].third_select,
            is_select: info[i].is_select,
            first_time: info[i].first_time,
            second_time: info[i].second_time,
            third_time: info[i].third_time,
            first_shelf_time: info[i].first_shelf_time,
            second_shelf_time: info[i].second_shelf_time,
            third_shelf_time: info[i].third_shelf_time,
            user: info[i].user,
            node: info[i].node,
            node_dept: info[i].node_dept,
            duration: info[i].duration,
            total_duration: info[i].total_duration,
        })        
        data2.push({
            start_time: info[i].start_time,
            image: info[i].image,
            type: info[i].type,
            link: info[i].link,
            first_category: info[i].first_category,
            second_category: info[i].second_category,
            third_category: info[i].third_category,
            spu: info[i].spu,
            start: info[i].start,
            developer: info[i].developer,
            project: info[i].project,
            dept: info[i].dept,
            process_status: info[i].process_status,
            process_node: info[i].process_node,
            division: '事业一部',
            is_select: info[i].first_select,
            select_time: info[i].first_time,
            shelf_time: info[i].first_shelf_time,
            user: info[i].user,
            node: info[i].node,
            node_dept: info[i].node_dept,
            duration: info[i].duration,
            total_duration: info[i].total_duration,
        })       
        data2.push({
            start_time: info[i].start_time,
            image: info[i].image,
            type: info[i].type,
            link: info[i].link,
            first_category: info[i].first_category,
            second_category: info[i].second_category,
            third_category: info[i].third_category,
            spu: info[i].spu,
            start: info[i].start,
            developer: info[i].developer,
            project: info[i].project,
            dept: info[i].dept,
            process_status: info[i].process_status,
            process_node: info[i].process_node,
            division: '事业二部',
            is_select: info[i].second_select,
            select_time: info[i].second_time,
            shelf_time: info[i].second_shelf_time,
            user: info[i].user,
            node: info[i].node,
            node_dept: info[i].node_dept,
            duration: info[i].duration,
            total_duration: info[i].total_duration,
        })       
        data2.push({
            start_time: info[i].start_time,
            image: info[i].image,
            type: info[i].type,
            link: info[i].link,
            first_category: info[i].first_category,
            second_category: info[i].second_category,
            third_category: info[i].third_category,
            spu: info[i].spu,
            start: info[i].start,
            developer: info[i].developer,
            project: info[i].project,
            dept: info[i].dept,
            process_status: info[i].process_status,
            process_node: info[i].process_node,
            division: '事业三部',
            is_select: info[i].third_select,
            select_time: info[i].third_time,
            shelf_time: info[i].third_shelf_time,
            user: info[i].user,
            node: info[i].node,
            node_dept: info[i].node_dept,
            duration: info[i].duration,
            total_duration: info[i].total_duration,
        })
    }
    return {data1, data2}
}

module.exports = developmentService