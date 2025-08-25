const specificPlanRepo = require("@/repository/specificPlan/specificPlanRepo")
const spMainVideoRepo = require("@/repository/specificPlan/spMainVideoRepo")

const spMainVideoService = {}

spMainVideoService.get = async (params) => {
    let result = []
    result = await spMainVideoRepo.get(params.plan_id)
    for (let i = 0; i < result.length; i++) {
        result[i].design_info = result[i].design_info ? JSON.parse(result[i].design_info) : null
    }
    return result
}

spMainVideoService.create = async (params) => {
    let video = await spMainVideoRepo.get(params.plan_id)
    if (video?.length) {
        await spMainVideoRepo.update([
            params.data[0],
            params.data[1],
            params.data[2],
            params.data[3] ? JSON.stringify(params.data[3]) : null, 
            params.plan_id
        ])
    } else {
        await spMainVideoRepo.create([
            params.plan_id, 
            params.data[0],
            params.data[1],
            params.data[2],
            params.data[3] ? JSON.stringify(params.data[3]) : null
        ])
    }
    await specificPlanRepo.updateMainVideoStyle(params.plan_id, params.style)
    return true
}

module.exports = spMainVideoService