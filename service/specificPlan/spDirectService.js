const specificPlanRepo = require("@/repository/specificPlan/specificPlanRepo")
const spDirectPicRepo = require("@/repository/specificPlan/spDirectPicRepo")

const spDirectPicService = {}

spDirectPicService.get = async (params) => {
    let result = []
    result = await spDirectPicRepo.get(params.plan_id)
    for (let i = 0; i < result.length; i++) {
        result[i].design_info = result[i].design_info ? JSON.parse(result[i].design_info) : null
    }
    return result
}

spDirectPicService.create = async (params) => {
    let vision = await spDirectPicRepo.get(params.plan_id)
    if (vision?.length) {
        await spDirectPicRepo.update([
            params.data[0],
            params.data[1],
            params.data[2],
            params.data[3],
            params.data[4],
            params.data[5],
            params.data[6],
            params.data[7] ? JSON.stringify(params.data[7]) : null, 
            params.plan_id
        ])
    } else {
        await spDirectPicRepo.create([
            params.plan_id, 
            params.data[0],
            params.data[1],
            params.data[2],
            params.data[3],
            params.data[4],
            params.data[5],
            params.data[6],
            params.data[7] ? JSON.stringify(params.data[7]) : null
        ])
    }
    await specificPlanRepo.updateDirectPicStyle(params.plan_id, params.style)
    return true
}

module.exports = spDirectPicService