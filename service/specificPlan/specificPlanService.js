const spAnalysisRepo = require("@/repository/specificPlan/spAnalysisRepo")
const spDetailPicRepo = require("@/repository/specificPlan/spDetailPicRepo")
const spDirectPicRepo = require("@/repository/specificPlan/spDirectPicRepo")
const specificPlanRepo = require("@/repository/specificPlan/specificPlanRepo")
const spKeywordsRepo = require("@/repository/specificPlan/spKeywordsRepo")
const spMainPicRepo = require("@/repository/specificPlan/spMainPicRepo")
const spMainVideoRepo = require("@/repository/specificPlan/spMainVideoRepo")
const spSalesRepo = require("@/repository/specificPlan/spSalesRepo")
const spSkuRepo = require("@/repository/specificPlan/spSkuRpo")
const spVisionRepo = require("@/repository/specificPlan/spVisionRepo")

const specificPlanService = {}

specificPlanService.get = async (params, user_id) => {
    let data = [], offset = 0, limit = 0, total = 0
    offset = (parseInt(params.page) - 1) * parseInt(params.pageSize)
    limit = parseInt(params.pageSize)
    let count = await specificPlanRepo.getCount(user_id, params.title, params.id)
    if (count?.length && count[0].count) {
        total = count[0].count   
        data = await specificPlanRepo.get(user_id, params.title, params.id, offset, limit)
    }
    return {total, data}
}

specificPlanService.create = async (params, user_id) => {
    let result = []
    let plan = await specificPlanRepo.getByTitle(user_id, params.title)
    if (plan?.length) return false
    result = await specificPlanRepo.create([params.title, user_id, params.remark])
    return result
}

specificPlanService.update = async (params, user_id) => {
    let result = false
    let plan = await specificPlanRepo.getByTitle(user_id, params.title)
    if (plan?.length && plan[0].id != params.id) return false
    result = await specificPlanRepo.updateById(params.id, params.title, params.remark, params.status)
    return result
}

specificPlanService.delete = async (params) => {
    let result = false
    let plan = await analysisPlanRepo.getById(params.id)
    if (plan?.length) {
        if (plan[0].status == 1) return false
        await specificPlanRepo.deleteRelations(params.id)
        await spKeywordsRepo.deleteByPlanId(params.id)
        await spSkuRepo.deleteByPlanId(params.id)
        await spVisionRepo.deleteByPlanId(params.id)
        await spMainPicRepo.delete(params.id)
        await spDirectPicRepo.delete(params.id)
        await spDetailPicRepo.delete(params.id)
        await spMainVideoRepo.delete(params.id)
        await spAnalysisRepo.deleteByPlanId(params.id)
        await spAnalysisRepo.deleteProfitByPlanId(params.id)
        await spSalesRepo.deleteByPlanId(params.id)
        result = await specificPlanRepo.deleteById(params.id)
    }
    return result
}

module.exports = specificPlanService