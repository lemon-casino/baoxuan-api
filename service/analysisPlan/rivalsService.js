const analysisPlanGroupRepo = require('@/repository/analysisPlan/analysisPlanGroupRepo')
const rivalsKeywordsRepo = require('@/repository/analysisPlan/rivalsKeywordsRepo')
const rivalsRepo = require('@/repository/analysisPlan/rivalsRepo')
const rivalsSkuRepo = require('@/repository/analysisPlan/rivalsSkuRepo')
const rivalsService = {}

rivalsService.get = async (params) => {
    let result = []
    result = await rivalsRepo.get(params.plan_id)
    for (let i = 0; i < result.length; i++) {
        result[i].other_info = JSON.parse(result[i].other_info)
    }
    return result
}

rivalsService.create = async (params) => {
    let info = [], inserts = [], updates = []
    let rival_info = await rivalsRepo.get(params.plan_id)
    for (let i = 0; i < rival_info.length; i++) {
        info.push([
            rival_info[i].name,
            rival_info[i].goods_id,
            rival_info[i].category,
            rival_info[i].shop_name,
            rival_info[i].shop_type,
            rival_info[i].monthly_sales,
            rival_info[i].price,
            rival_info[i].picture,            
        ])
    }
    for (let i = 1; i < params.data.length; i++) {
        let flag = 1
        if (!params.data[i][0] || (params.data[i][0] instanceof String  && params.data[i][0].trim().length == 0) || 
            !params.data[i][1] || (params.data[i][1] instanceof String  && params.data[i][1].trim().length == 0) || 
            !params.data[i][2] || (params.data[i][2] instanceof String  && params.data[i][2].trim().length == 0) || 
            !params.data[i][3] || (params.data[i][3] instanceof String  && params.data[i][3].trim().length == 0) || 
            !params.data[i][4] || (params.data[i][4] instanceof String  && params.data[i][4].trim().length == 0))
            return false
        for (let j = 0; j < params.data[i].length; j++) {
            if (params.data[i][j] instanceof String)
                params.data[i][j] = params.data[i][j].trim()
        }
        params.data[i][params.data[i].length] = i
        for (let j = 0; j < info.length; j++) {            
            if (params.data[i][1] == info[j][1]) {
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
    //删除竞品数据
    for (let i = 0; i < info.length; i++) {
        await analysisPlanGroupRepo.deleteRivalByGoods(params.plan_id, info[i][1])
        await rivalsKeywordsRepo.deleteByGoodsId(params.plan_id, info[i][1])
        await rivalsSkuRepo.deleteByGoodsId(params.plan_id, info[i][1])
        await rivalsRepo.deleteByGoodsId(params.plan_id, info[i][1])
    }
    //新增竞品数据
    for (let i = 0; i < inserts.length; i++) {
        let rival = await rivalsRepo.getByPlanIdAndGoodsId(params.plan_id, inserts[i][1])
        let other_info = []
        for (let j = 8; j < inserts[i].length - 1; j++) {
            other_info.push({
                label: params.data[0][j],
                value: inserts[i][j],
                field: `field${j}`
            })
        }
        other_info = JSON.stringify(other_info)
        if (!rival?.length) await rivalsRepo.create([
            params.plan_id, 
            inserts[i][0], 
            null, 
            inserts[i][1],
            inserts[i][2],
            inserts[i][3],
            inserts[i][4],
            inserts[i][5],
            inserts[i][6],
            inserts[i][7],
            null, 
            null, 
            other_info, 
            0, 
            inserts[i][params.data[0].length], 
            null, 
            null])
    }
    //更新竞品信息
    for (let i = 0; i < updates.length; i++) {
        let other_info = []
        for (let j = 8; j < updates[i].length - 1; j++) {
            other_info.push({
                label: params.data[0][j],
                value: updates[i][j],
                field: `field${j}`
            })
        }
        other_info = JSON.stringify(other_info)
        await rivalsRepo.updateByPlanIdAndGoodsId1([
            updates[i][0], 
            updates[i][2], 
            updates[i][3], 
            updates[i][4], 
            updates[i][5], 
            updates[i][6], 
            updates[i][7],
            other_info,
            updates[i][params.data[0].length],
            params.plan_id,
            updates[i][1]])
    }
    return true
}

module.exports = rivalsService