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

developmentService.getWorkData = async (start, end, limit, offset) => {
    let columns = [
        {field_id: 'exploit_director', label: '开发负责人', fixed: true},
        {field_id: 'status', label: '市场分析进度', fixed: true},
        {field_id: 'first_category', label: '一级类目', fixed: true},
        {field_id: 'second_category', label: '二级类目', fixed: true},
        {field_id: 'third_category', label: '三级类目', fixed: true},
        {field_id: 'type', label: '市场分析名称', fixed: true},
        {field_id: 'goods_name', label: '立项产品名称', fixed: true},
        {field_id: 'seasons', label: '产品销售季节'},
        {field_id: 'patent_belongs', label: '专利归属'},
        {field_id: 'patent_type', label: '专利-二级'},
        {field_id: 'related', label: '相关联的产品类型和节日'},
        {field_id: 'schedule_time', label: '预计市场分析过会时间'},
        {field_id: 'analyse_data', label: '市场分析表'},
        {field_id: 'complete_time', label: '分析表过会且通过时间'},
        {field_id: 'sale_purpose', label: '产品销售目的'},
        {field_id: 'exploitation_features', label: '产品开发性质'},
        {field_id: 'core_reasons', label: '核心立项理由'},
        {field_id: 'link', label: '流程链接'},
        {field_id: 'schedule_arrived_time', label: '预计开发周期（大货时间）'},
        {field_id: 'schedule_confirm_time', label: '预计样品确认时间'},
        {field_id: 'product_info', label: '提交产品信息'},
        {field_id: 'confirm_time', label: '实际样品到货时间'},
        {field_id: 'order_time', label: '实际订货时间'},
        {field_id: 'arrived_time', label: '实际大货到货时间'},
        {field_id: 'brief_product_line', label: '产品线简称'},
        {field_id: 'expected_monthly_sales', label: '预计月销量'},
        {field_id: 'goods_ids', label: '各平台上架完毕'},
        {field_id: 'product_img', label: '对应产品图片'},
        {field_id: 'remark', label: '特殊备注/要求'},
    ]
    let users = await userRepo.getUserByDeptName('产品开发部')
    let userNames = ''
    users = users.filter((item) => item['nickname'] != '崔竹')
    userNames = users.map((item) => item['nickname']).join('","')
    userNames = `${userNames}","孙旭东`
    const {result, total} = await newFormsRepo.getDevelopmentData(userNames, start, end, limit, offset)
    let data = []
    for (let i = 0; i < result.length; i++) {
        
    }
    return {data, columns, total}
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