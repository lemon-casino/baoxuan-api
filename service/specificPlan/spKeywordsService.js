const specificPlanRepo = require("@/repository/specificPlan/specificPlanRepo")
const spKeywordsRepo = require("@/repository/specificPlan/spKeywordsRepo")

const spKeywordsService = {}

spKeywordsService.get = async (params) => {
    let result = []
    result = await spKeywordsRepo.get(params.plan_id)
    return result
}

spKeywordsService.create = async (params) => {
    let info = [], inserts = [], updates = []
    if (!params.goods_name || !params.keywords) return false
    let keywords = await spKeywordsRepo.get(params.plan_id)
    for (let i = 0; i < keywords.length; i++) {
        info.push([
            keywords[i].rivals_shop_name,
            keywords[i].keywords,
            keywords[i].visitors,
            keywords[i].pay_visitors,      
        ])
    }
    for (let i = 1; i < params.data.length; i++) {
        let flag = 1        
        if (!params.data[i][0] || (params.data[i][0] instanceof String  && params.data[i][0].trim().length == 0) || 
            !params.data[i][1] || (params.data[i][1] instanceof String  && params.data[i][1].trim().length == 0))
            return false
        for (let j = 0; j < params.data[i].length; j++) {
            if (params.data[i][j] instanceof String)
                params.data[i][j] = params.data[i][j].trim()
        }
        params.data[i][4] = i
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
    //删除关键词
    for (let i = 0; i < info.length; i++) {
        await spKeywordsRepo.deleteByRivalsShopNameAndKeywords(
            params.plan_id, 
            info[i].rivals_shop_name, 
            info[i].keywords)
    }
    //新增关键词
    for (let i = 0; i < inserts.length; i++) {
        await spKeywordsRepo.create([
            params.plan_id,
            inserts[i][0], 
            inserts[i][1], 
            inserts[i][2], 
            inserts[i][3], 
            inserts[i][4]])
    }
    //更新关键词
    for (let i = 0; i < updates.length; i++) {
        await spKeywordsRepo.updateByRivalsShopNameAndKeywords( 
            params.plan_id,
            updates[i][0], 
            updates[i][1], 
            updates[i][2], 
            updates[i][3], 
            updates[i][4])
    }
    await specificPlanRepo.updateGoodsNameAndKeywordsAndStyle(
        params.plan_id, 
        params.goods_name, 
        params.keywords, 
        params.style)
    return true
}

module.exports = spKeywordsService