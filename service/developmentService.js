const newFormsRepo = require('../repository/newFormsRepo')
const userRepo = require('../repository/userRepo')
const producerPlanRepo = require('../repository/producerPlanRepo')
const { statItem3, developmentType, developmentWorkType, developmentWorkProblem } = require('../const/newFormConst')
const moment = require('moment')
const developmentService = {}

developmentService.getDataStats = async (type, start, end, month) => {
    let result = []
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
    return result
}

developmentService.getFlows = async (start, end) => {
    let result = [], data = []
    data = await newFormsRepo.getDevelopmentType(start, end)
    if (data?.length) {
        for (let i = 0; i < data.length; i++) {
            if (i == 0 || (data[i].status != data[i-1].status && data[i].status < 3)) {
                let tmp = {
                    status: statItem3[data[i].status].name,
                    children: {}
                }
                tmp[developmentType[data[i].type]] = data[i].count
                result.push(tmp)
            } else if (data[i].status < 3) {
                result[result.length - 1][developmentType[data[i].type]] = data[i].count
            } else if (data[i].status == 3) {
                result[result.length - 1].children[developmentType[data[i].type]] = [{
                    selected: data[i].count
                }]
            } else {
                result[result.length - 1]
                    .children[developmentType[data[i].type]][0]['rejected'] = data[i].count
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
    let data = await newFormsRepo.getDevepmentWork(userNames, userIds, start, end)
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
            let tmp = {name: users[i].nickname}
            for (let item in developmentWorkProblem) {
                tmp[developmentWorkProblem[item]] = 0
            }
            userMap[users[i].nickname] = result.length
            result.push(tmp)
        }
    }
    if (userNames?.length) userNames = userNames.substring(0, userNames.length - 1)
    else return result
    userIds = userIds.substring(0, userIds.length - 1)
    let data = await newFormsRepo.getDevelopmentProblem(userNames, userIds, start, end)
    for (let i = 0; i < data.length; i++) {
        let name = data[i].name == '' ? userInfo[data[i].id] : data[i].name
        result[userMap[name]][developmentWorkProblem[data[i].type]] = parseInt(data[i].count)
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
    let userIds = '', userMap = {}, result = []
    for (let i = 0; i < users.length; i++) {
        if (users[i].nickname != '崔竹') {
            userIds = `${userIds}"${users[i].dingding_user_id}",`
            userMap[users[i].dingding_user_id] = users[i].nickname
        }
    }
    if (userIds?.length) userIds = userIds.substring(0, userIds.length - 1)
    else return result
    let plans = await producerPlanRepo.getByMonth(months)
    let data = await newFormsRepo.getPlanStats(userIds, months)
    for (let i = 0; i < plans.length; i++) {
        let tmp = JSON.parse(JSON.stringify(plans[i]))
        tmp['value'] = 0
        tmp['plan'] = `${tmp.plan_min}-${tmp.plan_max}`
        result.push(tmp)
        for (let j = 0; j < data.length; j++) {
            if (data[j].categories == plans[i].categories &&
                userMap[data[j].id] == plans[i].nickname &&
                data[j].month == plans[i].months
            ) {
                result[i].value = data[j].count
                data.splice(j, 1)
                break
            }
        }
    }
    for (let i = 0; i < data.length; i++) {
        result.push({
            nickname: userMap[data[i].id],
            categories: data[i].categories,
            months: data[i].month,
            plan: 0,
            value: data[i].count
        })
    }
    return result
}

module.exports = developmentService