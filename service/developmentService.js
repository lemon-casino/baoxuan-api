const newFormsRepo = require('../repository/newFormsRepo')
const userRepo = require('../repository/userRepo')
const producerPlanRepo = require('../repository/producerPlanRepo')
const userOperationRepo = require('../repository/operation/userOperationRepo')
const { redisKeys } = require('../const/redisConst')
const redisUtil = require("../utils/redisUtil")
const crypto = require('crypto')
const { developmentItem, developmentType, developmentWorkType, developmentWorkProblem } = require('../const/newFormConst')
const moment = require('moment')
const projectManagementRepo = require('@/repository/development/projectManagement')
const pmEditLogRepo = require('@/repository/development/pmEditLog')
const developmentService = {}
const { createProcess } =  require('./dingDingService')
const { productManageFlowUUid } = require("../const/operationConst")
const goodsCategoryRepo = require('@/repository/goodsCategoryRepo')

developmentService.getDataStats = async (type, start, end, month) => {
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
            result = await developmentService.getWorks(start, end)
            break
        case '3':
            result = await developmentService.getProblems(start, end)
            break
        case '4':
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

developmentService.getProjectData = async (limit, offset, params) => {
    const columns = [
        {field_id: 'exploit_director', label: '开发负责人', type: 'input', fixed: true},
        {field_id: 'status', label: '市场分析进度', type: 'select', fixed: true, select: [
            {key: 0, value: '进行中：立项前'},
            {key: 1, value: '已完成：成功立项'},
            {key: -1, value: '已终止：立项未通过'}
        ]},
        {field_id: 'first_category', label: '一级类目', info: '基于天猫类目1-4级', edit: true, required: true, fixed: true, type: 'input'},
        {field_id: 'second_category', label: '二级类目', info: '基于天猫类目1-4级', edit: true, required: true, fixed: true, type: 'input'},
        {field_id: 'third_category', label: '三级类目', info: '基于天猫类目1-4级', edit: true, fixed: true, type: 'input'},
        {field_id: 'type', label: '市场分析名称', info: '本次分析产品具体名称-基于产品特征或关键词', edit: true, fixed: true, required: true, type: 'input'},
        {field_id: 'goods_name', label: '立项产品名称', info: '名称不许重复', edit: true, required: true, fixed: true, type: 'input'},
        {field_id: 'seasons', label: '产品销售季节', info: '填写主力售卖时间', edit: true, required: true, type: 'select', select: [
            {key: '春季3月-5月', value: '春季3月-5月'},
            {key: '夏季6月-8月', value: '夏季6月-8月'},
            {key: '秋季9月-12月', value: '秋季9月-12月'},
            {key: '冬季12月-2月', value: '冬季12月-2月'},
            {key: '全年', value: '全年'}
        ]},
        {field_id: 'patent_belongs', label: '专利归属', edit: true, required: true, type: 'select', select: [
            {key: '工厂', value: '工厂'},
            {key: '公司', value: '公司'},
            {key: '无', value: '无'}
        ]},
        {field_id: 'patent_type', label: '专利-二级', edit: true, type: 'select', select: [
            {key: '实用新型', value: '实用新型'},
            {key: '著作权', value: '著作权'},
            {key: '发明专利', value: '发明专利'},
            {key: '外观专利', value: '外观专利'},
            {key: '无', value: '无'}
        ]},
        {field_id: 'related', label: '相关联的产品类型和节日', edit: true, type: 'select', select: [
            {key: '过年相关产品', value: '过年相关产品'},
            {key: '保存产品的相关产品', value: '保存产品的相关产品'},
            {key: '厨房产品，情人节', value: '厨房产品，情人节'},
            {key: '春季开学季', value: '春季开学季'},
            {key: '三八妇女节', value: '三八妇女节'},
            {key: '春游秋游相关产品', value: '春游秋游相关产品'},
            {key: '4月热切冷水杯', value: '4月热切冷水杯'},
            {key: '520节', value: '520节'},
            {key: '6.1儿童节', value: '6.1儿童节'},
            {key: '毕业季', value: '毕业季'},
            {key: '七夕产品', value: '七夕产品'},
            {key: '准备购买中秋国庆旅游装备', value: '准备购买中秋国庆旅游装备'},
            {key: '秋季开学产品', value: '秋季开学产品'},
            {key: '水具换季', value: '水具换季'},
            {key: '无', value: '无'},
            {key: '礼品', value: '礼品'},
            {key: '春夏泡茶类产品', value: '春夏泡茶类产品'}
        ]},
        {field_id: 'schedule_time', label: '预计市场分析过会时间', info: '预计过会时间', required: true, edit: true, type: 'date'},
        {field_id: 'analyse_link', label: '市场分析表', info: '分析过程中需要附上分析表，确认最终稿', edit: true, required: true, type: 'file'},
        {field_id: 'complete_time', label: '分析表过会且通过时间', type: 'date'},
        {field_id: 'sale_purpose', label: '产品销售目的', info: '存量=迭代，增量=填补空白，原来有就叫迭代', 
            edit: true, required: true, type: 'select', select: [
            {key: '迭代', value: '迭代'},
            {key: '填补空白', value: '填补空白'}
        ]},
        {field_id: 'exploitation_features', label: '产品开发性质', info: '仅换材料不叫自研', edit: true, required: true, 
            type: 'select', select: [
            {key: '通货', value: '通货'},
            {key: '供应商知识产权', value: '供应商知识产权'},
            {key: '自研', value: '自研'},
            {key: 'IP', value: 'IP'}
        ]},
        {field_id: 'core_reasons', label: '核心立项理由', edit: true, required: true, type: 'input'},
        {field_id: 'link', label: '流程链接', type: 'link'},
        {field_id: 'schedule_arrived_time', label: '预计开发周期（大货时间）', type: 'date'},
        {field_id: 'schedule_confirm_time', label: '预计样品确认时间', type: 'date'},
        {field_id: 'product_info', label: '提交产品信息', type: 'input'},
        {field_id: 'confirm_time', label: '实际样品到货时间', type: 'date'},
        {field_id: 'order_time', label: '实际订货时间', type: 'date'},
        {field_id: 'arrived_time', label: '实际大货到货时间', type: 'date'},
        {field_id: 'brief_product_line', label: '产品线简称', type: 'input'},
        {field_id: 'expected_monthly_sales', label: '预计月销量', type: 'table'},
        {field_id: 'goods_ids', label: '各平台上架完毕', type: 'table'},
        {field_id: 'product_img', label: '对应产品图片', edit: true, required: true, type: 'image'},
        {field_id: 'remark', label: '特殊备注/要求', 
            info: '工厂知识产权/独家/有特殊要求，工厂开发有知识产权不能是自研，自研不能工厂有知识产权，如果工厂一定要有知识产权，宝选必须是独家（有合同）', 
            edit: true, type: 'input'},
    ]
    if (params) {
        params = JSON.parse(params)
    } else {
        params = []
    }
    const {data, total} = await projectManagementRepo.get(limit, offset, params) 
    // let linkIds = ''
    // for (let i = 0; i < data.length; i++) {
    //     if (data[i].link) {
    //         let chunk = data[i].link.split('?')
    //         if (chunk?.length == 2) {
    //             chunk = chunk[1].split('&')
    //             for (let j = 0; j < chunk.length; j++) {
    //                 let info = chunk[j].split('=')
    //                 if (info?.length == 2 && ['procInsId', 'formInstId'].includes(info[0])) {
    //                     linkIds = `${linkIds}"${info[1]}",`
    //                     break
    //                 }
    //             }
    //         }
    //     }
    // }
    // if (linkIds?.length) linkIds = linkIds.substring(0, linkIds.length - 1)
    // console.log(linkIds)
    // const result = await newFormsRepo.getDevelopmentData(linkIds)
    return {data, columns, total}
}

developmentService.createProjectData = async (user_id, params) => {
    let goods = await projectManagementRepo.getByGoodsName(params.goods_name)
    if (goods?.length) return null
    const result = await projectManagementRepo.insert([
        user_id, 
        0, 
        params.first_category, 
        params.second_category,
        params.third_category,
        params.type,
        params.goods_name,
        params.seasons,
        params.patent_belongs,
        params.patent_type,
        params.related,
        params.schedule_time,
        params.analyse_link,
        params.sale_purpose,
        params.exploitation_features,
        params.core_reasons,
        params.product_img,
        params.remark
    ])
    if (result) {
        await pmEditLogRepo.insert([
            'insert',
            user_id,
            null,
            JSON.stringify({
                exploit_director: user_id, 
                status: 0, 
                first_category: params.first_category, 
                second_category: params.second_category,
                third_category: params.third_category,
                type: params.type,
                goods_name: params.goods_name,
                seasons: params.seasons,
                patent_belongs: params.patent_belongs,
                patent_type: params.patent_type,
                related: params.related,
                schedule_time: params.schedule_time,
                analyse_link: params.analyse_link,
                sale_purpose: params.sale_purpose,
                exploitation_features: params.exploitation_features,
                core_reasons: params.core_reasons,
                product_img: params.product_img,
                remark: params.remark
            })
        ])
    }
    return result
}

developmentService.updateProjectData = async (user_id, id, params) => {
    let goods = await projectManagementRepo.getById(id)
    if (!goods?.length) return null
    // if (goods[0].status != 0) false
    const result = await projectManagementRepo.update([
        params.first_category, 
        params.second_category,
        params.third_category,
        params.type,
        params.goods_name,
        params.seasons,
        params.patent_belongs,
        params.patent_type,
        params.related,
        params.schedule_time,
        params.analyse_link,
        params.sale_purpose,
        params.exploitation_features,
        params.core_reasons,
        params.product_img,
        params.remark,
        id
    ])
    if (result) await pmEditLogRepo.insert([
        'update',
        user_id,
        JSON.stringify(goods[0]),
        JSON.stringify({
            first_category: params.first_category, 
            second_category: params.second_category,
            third_category: params.third_category,
            type: params.type,
            goods_name: params.goods_name,
            seasons: params.seasons,
            patent_belongs: params.patent_belongs,
            patent_type: params.patent_type,
            related: params.related,
            schedule_time: params.schedule_time,
            analyse_link: params.analyse_link,
            sale_purpose: params.sale_purpose,
            exploitation_features: params.exploitation_features,
            core_reasons: params.core_reasons,
            product_img: params.product_img,
            remark: params.remark,
            id
        })
    ])
    return result
}

developmentService.updateProjectDataStatus = async (user_id, id, status, dingding_user_id) => {
    let goods = await projectManagementRepo.getById(id)
    if (!goods?.length) return null
    if (goods[0].status != 0 || status == 0) return false
    const result = await projectManagementRepo.updateStatus(id, status)
    if (result) {
        await pmEditLogRepo.insert([
            'update',
            user_id,
            JSON.stringify({id, status: goods[0].status}),
            JSON.stringify({id, status})
        ])
        let params = {}
        params['employeeField_m9s31pkf'] = [dingding_user_id]
        params['cascadeSelectField_m4mf17qn'] = [
            goods[0].first_category, 
            goods[0].second_category, 
            goods[0].third_category]
        params['textField_m9ju9pu8'] = goods[0].type
        params['textField_m9kpxfs8'] = goods[0].goods_name
        params['radioField_m9ju9pu9'] = [goods[0].seasons]
        params['radioField_m9ju9pua'] = [goods[0].patent_belongs]
        if (goods[0].patent_type)
            params['radioField_m9ju9pub'] = [goods[0].patent_type]
        if (goods[0].related)
            params['radioField_m9ju9puc'] = [goods[0].related]
        params['dateField_m9ju9pue'] = moment(goods[0].schedule_time).valueOf()
        params['textField_m9s6jnub'] = goods[0].analyse_link
        params['radioField_m9ju9puf'] = [goods[0].sale_purpose]
        params['radioField_m9kpxfs9'] = [goods[0].exploitation_features]
        params['textareaField_m9mdbbam'] = goods[0].core_reasons
        params['textField_m9s6jnud'] = goods[0].product_img
        if (params['textareaField_m9s6jnuc'])
            params['textareaField_m9s6jnuc'] = goods[0].remark
        // await createProcess(
        //     productManageFlowUUid,
        //     dingding_user_id,
        //     null,
        //     JSON.stringify(params)
        // )
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
                title: '利润', field_id: 'profit', type: 'number', 
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
                title: '利润', field_id: 'profit', type: 'number', 
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

module.exports = developmentService