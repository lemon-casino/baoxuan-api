const specificPlanRepo = require("@/repository/specificPlan/specificPlanRepo")
const spSalesRepo = require("@/repository/specificPlan/spSalesRepo")

const spSalesPredictService = {}

spSalesPredictService.get = async (params) => {
    let result = []
    result = await spSalesRepo.get(params.plan_id)
    return result
}

spSalesPredictService.create = async (params) => {
    let info = [], inserts = [], updates = []
    let sales = await spSalesRepo.get(params.plan_id)
    for (let i = 0; i < sales.length; i++) {
        info.push([
            sales[i].day,
            sales[i].amount,
            sales[i].amount_param,
            sales[i].quantity,
            sales[i].quantity_param
        ])
    }
    for (let i = 0; i < params.data.length; i++) {
        let flag = 1  
        for (let j = 0; j < params.data[i].length; j++) {
            if (params.data[i][j] instanceof String)
                params.data[i][j] = params.data[i][j].trim()
        }
        for (let j = 0; j < info.length; j++) {
            if (params.data[i][0] == info[j][0]) {
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
    for (let i = 0; i < inserts.length; i++) {
        await spSalesRepo.create([
            params.plan_id, 
            inserts[i][0], 
            inserts[i][1], 
            inserts[i][2], 
            inserts[i][3], 
            inserts[i][4]])
    }
    for (let i = 0; i < updates.length; i++) {
        await spSalesRepo.updateByDay([            
            updates[i][1], 
            updates[i][2], 
            updates[i][3], 
            updates[i][4],
            params.plan_id, 
            updates[i][0]])
    }
    await specificPlanRepo.updateSalesStyle(params.plan_id, params.style)
    return true
}

module.exports = spSalesPredictService