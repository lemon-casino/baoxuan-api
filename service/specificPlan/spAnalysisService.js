const specificPlanRepo = require("@/repository/specificPlan/specificPlanRepo")
const spAnalysisRepo = require("@/repository/specificPlan/spAnalysisRepo")

const spAnalysisService = {}

spAnalysisService.get = async (params) => {
    let data = [], data1
    data = await spAnalysisRepo.get(params.plan_id)
    data1 = await spAnalysisRepo.getProfit(params.plan_id)
    return {data, data1}
}

spAnalysisService.create = async (params) => {
    let info = [], inserts = [], updates = []
    if (!params.volume_plan || !params.sales_target) return false
    let analysis = await spAnalysisRepo.get(params.plan_id)
    for (let i = 0; i < analysis.length; i++) {
        info.push([
            analysis[i].type,
            analysis[i].rivals_shop_name,
            analysis[i].rivals_name,
            analysis[i].volume_source,
            analysis[i].visitors,
            analysis[i].pay_visitors,
            analysis[i].pay_conversion,   
        ])
    }
    for (let i = 1; i < params.data.length; i++) {
        let flag = 1        
        if (!params.data[i][0] || (params.data[i][0] instanceof String  && params.data[i][0].trim().length == 0) || 
            !params.data[i][1] || (params.data[i][1] instanceof String  && params.data[i][1].trim().length == 0) || 
            !params.data[i][2] || (params.data[i][2] instanceof String  && params.data[i][2].trim().length == 0))
            return false
        for (let j = 0; j < params.data[i].length; j++) {
            if (params.data[i][j] instanceof String)
                params.data[i][j] = params.data[i][j].trim()
        }
        params.data[i][7] = i
        for (let j = 0; j < info.length; j++) {
            if (params.data[i][0] == info[j][0] && params.data[i][1] == info[j][1] && params.data[i][2] == info[j][2]) {
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
    for (let i = 0; i < info.length; i++) {
        await spAnalysisRepo.delete(
            params.plan_id, 
            info[i].type, 
            info[i].rivals_shop_name, 
            info[i].rivals_name)
    }
    for (let i = 0; i < inserts.length; i++) {
        await spAnalysisRepo.create([
            params.plan_id,
            inserts[i][0], 
            inserts[i][1], 
            inserts[i][2], 
            inserts[i][3], 
            inserts[i][4],
            inserts[i][5], 
            inserts[i][6], 
            inserts[i][7]])
    }
    for (let i = 0; i < updates.length; i++) {
        await spAnalysisRepo.update([
            updates[i][3],
            updates[i][4],
            updates[i][5], 
            updates[i][6], 
            updates[i][7],
            params.plan_id,
            updates[i][0], 
            updates[i][1], 
            updates[i][2]])
    }
    info = [], updates = [], inserts = []
    let profit = await spAnalysisRepo.getProfit(params.plan_id)
    for (let i = 0; i < profit.length; i++) {
        info.push([
            profit[i].sku,
            profit[i].price,
            profit[i].ratio,
            profit[i].cost_price, 
            profit[i].express_fee, 
            profit[i].bill_amount, 
            profit[i].profit, 
            profit[i].profit_percent, 
            profit[i].sku_cost_price, 
            profit[i].sku_sales, 
            profit[i].sku_promotion_amount, 
            profit[i].sku_profit, 
            profit[i].sku_gross_profit_percent,      
        ])
    }
    for (let i = 1; i < params.data1.length; i++) {
        let flag = 1        
        if (!params.data1[i][0] || (params.data1[i][0] instanceof String  && params.data1[i][0].trim().length == 0))
            return false
        for (let j = 0; j < params.data1[i].length; j++) {
            if (params.data1[i][j] instanceof String)
                params.data1[i][j] = params.data1[i][j].trim()
        }
        params.data1[i][13] = i
        for (let j = 0; j < info.length; j++) {
            if (params.data1[i][0] == info[j][0]) {
                updates.push(params.data1[i])
                info.splice(j, 1)
                flag = 0
                break
            }
        }
        if (flag) {
            inserts.push(params.data1[i])
        }
    }
    for (let i = 0; i < info.length; i++) {
        await spAnalysisRepo.deleteProfit(params.plan_id, info[i].sku)
    }
    for (let i = 0; i < inserts.length; i++) {
        await spAnalysisRepo.createProfit([
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
            inserts[i][13]])
    }
    for (let i = 0; i < updates.length; i++) {
        await spAnalysisRepo.update([
            updates[i][1], 
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
            updates[i][13],
            params.plan_id,
            updates[i][0]])
    }
    await specificPlanRepo.updateVolumePlanAndSalesTargetAndStyle(
        params.plan_id, 
        params.volume_plan, 
        params.sales_target, 
        params.style)
    return true
}

module.exports = spAnalysisService