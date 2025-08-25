const specificPlanRepo = require("@/repository/specificPlan/specificPlanRepo")
const spMainPicRepo = require("@/repository/specificPlan/spMainPicRepo")

const spMainPicService = {}

spMainPicService.get = async (params) => {
    let result = []
    result = await spMainPicRepo.get(params.plan_id)
    for (let i = 0; i < result.length; i++) {
        result[i].design_info = result[i].design_info ? JSON.parse(result[i].design_info) : null
    }
    return result
}

spMainPicService.create = async (params) => {
    let pic = await spMainPicRepo.get(params.plan_id)
    if (pic?.length) {
        await spMainPicRepo.update([
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
        await spMainPicRepo.create([
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
    await specificPlanRepo.updateMainPicStyle(params.plan_id, params.style)
    return true
}

module.exports = spMainPicService