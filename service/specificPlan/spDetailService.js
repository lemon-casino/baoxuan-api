const specificPlanRepo = require("@/repository/specificPlan/specificPlanRepo")
const spDetailPicRepo = require("@/repository/specificPlan/spDetailPicRepo")

const spDetailPicService = {}

spDetailPicService.get = async (params) => {
    let result = []
    result = await spDetailPicRepo.get(params.plan_id)
    for (let i = 0; i < result.length; i++) {
        result[i].design_info = result[i].design_info ? JSON.parse(result[i].design_info) : null
    }
    return result
}

spDetailPicService.create = async (params) => {
    let vision = await spDetailPicRepo.get(params.plan_id)
    if (vision?.length) {
        await spDetailPicRepo.update([
            params.data[0],
            params.data[1],
            params.data[2],
            params.data[3],
            params.data[4],
            params.data[5],
            params.data[6] ? JSON.stringify(params.data[6]) : null, 
            params.plan_id
        ])
    } else {
        await spDetailPicRepo.create([
            params.plan_id, 
           params.data[0],
            params.data[1],
            params.data[2],
            params.data[3],
            params.data[4],
            params.data[5],
            params.data[6] ? JSON.stringify(params.data[6]) : null
        ])
    }
    await specificPlanRepo.updateDetailPicStyle(params.plan_id, params.style)
    return true
}

module.exports = spDetailPicService