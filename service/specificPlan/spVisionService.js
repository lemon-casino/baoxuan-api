const specificPlanRepo = require("@/repository/specificPlan/specificPlanRepo")
const spVisionRepo = require("@/repository/specificPlan/spVisionRepo")

const spVisionService = {}

spVisionService.get = async (params) => {
    let result = []
    result = await spVisionRepo.get(params.plan_id)
    for (let i = 0; i < result.length; i++) {
        result[i].mobile_pic = result[i].mobile_pic ? JSON.parse(result[i].mobile_pic) : null
        result[i].main_pic = result[i].main_pic ? JSON.parse(result[i].main_pic) : null
        result[i].detail_pic = result[i].detail_pic ? JSON.parse(result[i].detail_pic) : null
    }
    return result
}

spVisionService.create = async (params) => {
    let info = [], inserts = [], updates = []
    let vision = await spVisionRepo.get(params.plan_id)
    for (let i = 0; i < vision.length; i++) {
        info.push([
            vision[i].rivals_shop_name,
            vision[i].selling_point,
            vision[i].mobile_pic ? JSON.parse(vision[i].mobile_pic) : null,
            vision[i].main_pic ? JSON.parse(vision[i].main_pic) : null,
            vision[i].detail_pic ? JSON.parse(vision[i].detail_pic) : null
        ])
    }
    for (let i = 0; i < params.data.length; i++) {
        let flag = 1        
        if (!params.data[i][0] || (params.data[i][0] instanceof String  && params.data[i][0].trim().length == 0) || 
            !params.data[i][1] || (params.data[i][1] instanceof String  && params.data[i][1].trim().length == 0))
            return false
        for (let j = 0; j < params.data[i].length; j++) {
            if (params.data[i][j] instanceof String)
                params.data[i][j] = params.data[i][j].trim()
        }
        params.data[i][5] = i
        for (let j = 0; j < info.length; j++) {
            if (params.data[i][0] == info[j][0] && params.data[i][1] == info[j][1]) {
                updates.push(params.data[i])
                info.splice(j, 1)
                flag = 0
                break
            }
        }
        if (flag) {
            inserts.push(params.data[i])
        }
    }
    //删除视觉
    for (let i = 0; i < info.length; i++) {
        await spVisionRepo.deleteByRivalsShopName(
            params.plan_id, 
            info[i].rivals_shop_name)
    }
    //新增视觉
    for (let i = 0; i < inserts.length; i++) {
        await spVisionRepo.create([
            params.plan_id,
            inserts[i][0], 
            inserts[i][1],
            inserts[i][2] ? JSON.stringify(inserts[i][2]) : null, 
            inserts[i][3] ? JSON.stringify(inserts[i][3]) : null, 
            inserts[i][4] ? JSON.stringify(inserts[i][4]) : null,
            inserts[i][5]])
    }
    //更新视觉
    for (let i = 0; i < updates.length; i++) {
        await spVisionRepo.updateByRivalsShopName([
            updates[i][1],
            updates[i][2] ? JSON.stringify(updates[i][2]) : null, 
            updates[i][3] ? JSON.stringify(updates[i][3]) : null, 
            updates[i][4] ? JSON.stringify(updates[i][4]) : null,
            updates[i][5],
            updates[i][0], 
            params.plan_id])
    }
    await specificPlanRepo.updateVisionStyle(params.plan_id, params.style)
    return true
}

module.exports = spVisionService