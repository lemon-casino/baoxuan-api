const rivalsRepo = require('@/repository/analysisPlan/rivalsRepo')
const rivalsSkusRepo = require('@/repository/analysisPlan/rivalsSkuRepo')
const rivalsSkuService = {}

rivalsSkuService.get = async (params) => {
    let result = []
    result = await rivalsSkusRepo.get(params.plan_id)
    return result
}

rivalsSkuService.create = async (params) => {
    let info = [], inserts = [], updates = []
    let sku_info = await rivalsSkusRepo.get(params.plan_id)
    for (let i = 0; i < sku_info.length; i++) {
        info.push([
            sku_info[i].goods_id,
            sku_info[i].sku,
            sku_info[i].picture,
            sku_info[i].price,
            sku_info[i].ratio,
            sku_info[i].cost_price,
            sku_info[i].express_fee,
            sku_info[i].bill_amount,  
            sku_info[i].profit,
            sku_info[i].profit_percent       
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
        params.data[i][10] = i
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
    //删除竞品SKU数据
    for (let i = 0; i < info.length; i++) {
        await rivalsSkusRepo.deleteByGoodsIdAndName(params.plan_id, info[i][0], info[i][1])
    }
    //新增竞品SKU数据
    let insertNames = {}
    for (let i = 0; i < inserts.length; i++) {
        if (!insertNames[inserts[i][0]]) insertNames[inserts[i][0]] = [inserts[i]]
        else insertNames[inserts[i][0]].push(inserts[i])
    }
    for (let index in insertNames) {
        let count = await rivalsRepo.getByPlanIdAndGoodsId(params.plan_id, index)
        let rival_id
        if (!count?.length) {
            rival_id = await rivalsRepo.create([
                params.plan_id, 
                null, 
                null, 
                insertNames[index][i][0], 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null, 
                null,
                0, 
                null, 
                null, 
                insertNames[index][i][10]
            ])            
        } else rival_id = count[0].id
        for (let i = 0; i < insertNames[index].length; i++) {
            let sku = await rivalsSkusRepo.getByName(params.plan_id, rival_id, insertNames[index][i][1])
            if (!sku?.length) await rivalsSkusRepo.create([
                params.plan_id, 
                rival_id, 
                insertNames[index][i][0], 
                insertNames[index][i][1], 
                insertNames[index][i][2], 
                insertNames[index][i][3], 
                insertNames[index][i][4], 
                insertNames[index][i][5], 
                insertNames[index][i][6], 
                insertNames[index][i][7], 
                insertNames[index][i][8], 
                insertNames[index][i][9], 
                null, 
                insertNames[index][i][10]])
        }
    }
    //更新竞品SKU数据
    let updateNames = {}
    for (let i = 0; i < updates.length; i++) {
        if (!updateNames[updates[i][0]]) updateNames[updates[i][0]] = [updates[i]]
        else updateNames[updates[i][0]].push(updates[i])
    }
    for (let index in updateNames) {
        for (let i = 0; i < updateNames[index].length; i++) {
            await rivalsSkusRepo.updateByGoodsIdAndName([
                updateNames[index][i][2], 
                updateNames[index][i][3], 
                updateNames[index][i][4], 
                updateNames[index][i][5], 
                updateNames[index][i][6], 
                updateNames[index][i][7], 
                updateNames[index][i][8], 
                updateNames[index][i][9],  
                updateNames[index][i][10], 
                params.plan_id,
                updateNames[index][i][0], 
                updateNames[index][i][1]])
        }
    }
    return true
}

module.exports = rivalsSkuService