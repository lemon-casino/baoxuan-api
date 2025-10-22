const specificPlanRepo = require("@/repository/specificPlan/specificPlanRepo")
const spSkuRepo = require("@/repository/specificPlan/spSkuRpo")

const spSkuService = {}

spSkuService.get = async (params) => {
    let result = []
    result = await spSkuRepo.get(params.plan_id)
    return result
}

spSkuService.create = async (params) => {
    let info = [], inserts = [], updates = []
    let sku = await spSkuRepo.get(params.plan_id)
    for (let i = 0; i < sku.length; i++) {
        info.push([
            sku[i].rivals_shop_name,
            sku[i].rivals_sku,
            sku[i].rivals_picture,
            sku[i].rivals_price,
            sku[i].rivals_ratio,
            sku[i].rivals_cost_price,
            sku[i].rivals_express_fee,
            sku[i].rivals_bill_amount,
            sku[i].rivals_profit,
            sku[i].rivals_profit_percent,
            sku[i].sku,
            sku[i].picture,
            sku[i].cost_price,
            sku[i].sku_code,
            sku[i].price,
            sku[i].express_fee,
            sku[i].bill_amount,
            sku[i].profit,
            sku[i].profit_percent
        ])
    }
    for (let i = 1; i < params.data.length; i++) {
        let flag = 1        
        if (!params.data[i][0] || (params.data[i][0] instanceof String  && params.data[i][0].trim().length == 0) || 
            !params.data[i][1] || (params.data[i][1] instanceof String  && params.data[i][1].trim().length == 0) || 
            !params.data[i][2] || (params.data[i][2] instanceof String  && params.data[i][2].trim().length == 0) || 
            !params.data[i][3] || (params.data[i][3] instanceof String  && params.data[i][3].trim().length == 0) || 
            !params.data[i][4] || (params.data[i][4] instanceof String  && params.data[i][4].trim().length == 0) || 
            !params.data[i][13] || (params.data[i][13] instanceof String  && params.data[i][13].trim().length == 0))
            return false
        for (let j = 0; j < params.data[i].length; j++) {
            if (params.data[i][j] instanceof String)
                params.data[i][j] = params.data[i][j].trim()
        }
        params.data[i][19] = i
        for (let j = 0; j < info.length; j++) {
            if (params.data[i][0] == info[j][0] && params.data[i][1] == info[j][1] && params.data[i][10] == info[j][10]) {
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
    //删除sku
    for (let i = 0; i < info.length; i++) {
        await spSkuRepo.deleteByRivalsShopNameAndSku(
            params.plan_id, 
            info[i].rivals_shop_name, 
            info[i].rivals_sku, 
            info[i].sku)
    }
    //新增sku
    for (let i = 0; i < inserts.length; i++) {
        await spSkuRepo.create([
            params.plan_id, 
            inserts[i][0], 
            inserts[i][1], 
            inserts[i][2], 
            inserts[i][3], 
            inserts[i][4],
            inserts[i][5], 
            inserts[i][6], 
            inserts[i][7], 
            inserts[i][8], 
            inserts[i][9],
            inserts[i][10], 
            inserts[i][11], 
            inserts[i][12], 
            inserts[i][13], 
            inserts[i][14],
            inserts[i][15], 
            inserts[i][16], 
            inserts[i][17], 
            inserts[i][18], 
            inserts[i][19]])
    }
    //更新sku
    for (let i = 0; i < updates.length; i++) {
        await spSkuRepo.updateByRivalsShopNameAndSku([
            updates[i][2], 
            updates[i][3], 
            updates[i][4],
            updates[i][5], 
            updates[i][6], 
            updates[i][7], 
            updates[i][8], 
            updates[i][9], 
            updates[i][10],
            updates[i][11], 
            updates[i][12], 
            updates[i][14],
            updates[i][15], 
            updates[i][16], 
            updates[i][17], 
            updates[i][18], 
            updates[i][19],
            updates[i][0], 
            updates[i][1], 
            updates[i][13],
            params.plan_id])
    }
    await specificPlanRepo.updateSkuStyle(params.plan_id, params.style)
    return true
}

module.exports = spSkuService