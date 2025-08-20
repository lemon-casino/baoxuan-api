const analysisPlanGroupRepo = require('@/repository/analysisPlan/analysisPlanGroupRepo')
const analysisPlanRepo = require('@/repository/analysisPlan/analysisPlanRepo')
const rivalsKeywordsRepo = require('@/repository/analysisPlan/rivalsKeywordsRepo')
const rivalsRepo = require('@/repository/analysisPlan/rivalsRepo')
const rivalsSkuRepo = require('@/repository/analysisPlan/rivalsSkuRepo')
const analysisPlanService = {}

analysisPlanService.get = async (params, user_id) => {
    let result = [], offset = 0, limit = 0
    offset = (parseInt(params.page) - 1) * parseInt(params.pageSize)
    limit = parseInt(params.pageSize)
    result = await analysisPlanRepo.get(user_id, params.title, offset, limit)
    return result
}

analysisPlanService.create = async (params, user_id) => {
    let result = []
    let plan = await analysisPlanRepo.getByTitle(user_id, params.title)
    if (plan?.length) return false
    result = await analysisPlanRepo.create([params.title, user_id, params.remark])
    return result
}

analysisPlanService.update = async (params, user_id) => {
    let result = false
    let plan = await analysisPlanRepo.getByTitle(user_id, params.title)
    if (plan?.length && plan[0].id != params.id) return false
    result = await analysisPlanRepo.updateById(params.id, params.title, params.remark, params.status)
    return result
}

analysisPlanService.delete = async (params) => {
    let result = false
    let plan = await analysisPlanRepo.getById(params.id)
    if (plan?.length) {
        if (plan[0].status == 1) return false
        analysisPlanRepo.deleteRelations(params.id)
        rivalsKeywordsRepo.deleteByPlanId(params.id)
        rivalsSkuRepo.deleteByPlanId(params.id)
        rivalsRepo.deleteByPlanId(params.id)
        analysisPlanGroupRepo.deleteByPlanId(params.id)
        result = await analysisPlanRepo.deleteById(params.id)
    }
    return result
}

analysisPlanService.fileUpload = async (file) => {
    let result = null
    return result
}

module.exports = analysisPlanService