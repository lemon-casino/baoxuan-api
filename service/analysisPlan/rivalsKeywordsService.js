const rivalsKeywordsRepo = require('@/repository/analysisPlan/rivalsKeywordsRepo')
const rivalsRepo = require('@/repository/analysisPlan/rivalsRepo')
const rivalsKeywordsService = {}

rivalsKeywordsService.get = async (params) => {
    let result = []
    result = await rivalsKeywordsRepo.get(params.plan_id)
    return result
}

rivalsKeywordsService.create = async (params) => {
    let info = [], inserts = [], updates = []
    let keywords_info = await rivalsKeywordsRepo.get(params.plan_id)
    for (let i = 0; i < keywords_info.length; i++) {
        info.push([
            keywords_info[i].name,
            keywords_info[i].link,
            keywords_info[i].goods_id,
            keywords_info[i].category,
            keywords_info[i].shop_name,
            keywords_info[i].shop_type,
            keywords_info[i].monthly_sales,
            keywords_info[i].price,
            keywords_info[i].picture,  
            keywords_info[i].keywords_trend_pic,
            keywords_info[i].customer_segmentation,
            keywords_info[i].keywords,
            keywords_info[i].visitors,   
            keywords_info[i].pay_visitors,          
        ])
    }
    for (let i = 1; i < params.data.length; i++) {
        let flag = 1        
        if (!params.data[i][2] || (params.data[i][2] instanceof String  && params.data[i][2].trim().length == 0) || 
            !params.data[i][11] || (params.data[i][11] instanceof String  && params.data[i][11].trim().length == 0))
            return false
        for (let j = 0; j < params.data[i].length; j++) {
            if (params.data[i][j] instanceof String)
                params.data[i][j] = params.data[i][j].trim()
        }
        params.data[i][14] = i
        for (let j = 0; j < info.length; j++) {
            if (params.data[i][2] == info[j][2] && params.data[i][11] == info[j][11]) {
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
    //删除竞品数据&关键词
    let deleteNames = {}
    for (let i = 0; i < info.length; i++) {
        if (!deleteNames[info[i][2]]) deleteNames[info[i][2]] = [info[i][11]]
        else deleteNames[info[i][2]].push(info[i][11])
    }
    for(let index in deleteNames) {
        let count = await rivalsKeywordsRepo.getCountByPlanIdAndGoodsId(params.plan_id, index)
        if (count?.length && count[0].count == deleteNames[index].length) {
            await rivalsKeywordsRepo.deleteByGoodsId(params.plan_id, index)
            await rivalsRepo.updateIsSpecific(params.plan_id, count[0].id)
        } else {
            for (let i = 0; i < deleteNames[index].length; i++) {
                await rivalsKeywordsRepo.deleteByKeywords(params.plan_id, count[0].id, deleteNames[index][i])
            }
        }
    }
    //新增竞品数据&关键词
    let insertNames = {}
    for (let i = 0; i < inserts.length; i++) {
        if (!insertNames[inserts[i][2]]) insertNames[inserts[i][2]] = [inserts[i]]
        else insertNames[inserts[i][2]].push(inserts[i])
    }
    for (let index in insertNames) {
        let count = await rivalsKeywordsRepo.getCountByPlanIdAndGoodsId(params.plan_id, index)
        let rival_id
        if (!count?.length) {
            rival_id = await rivalsRepo.create([
                params.plan_id, 
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
                insertNames[index][i][10], 
                null,
                0, 
                null, 
                insertNames[index][i][14], 
                null
            ])            
        } else rival_id = count[0].id
        for (let i = 0; i < insertNames[index].length; i++) {
            let keywords = await rivalsKeywordsRepo.getByPlanIdAndKeywords(params.plan_id, rival_id, insertNames[index][i][11])
            if (!keywords?.length) await rivalsKeywordsRepo.create([
                params.plan_id, 
                rival_id, 
                insertNames[index][i][11], 
                insertNames[index][i][12], 
                insertNames[index][i][13],                
                insertNames[index][i][14]])
        }
    }
    //更新竞品数据&关键词
    let updateNames = {}
    for (let i = 0; i < updates.length; i++) {
        if (!updateNames[updates[i][2]]) updateNames[updates[i][2]] = [updates[i]]
        else updateNames[updates[i][2]].push(updates[i])
    }
    for (let index in updateNames) {
        await rivalsRepo.updateByPlanIdAndGoodsId2([
            updateNames[index][i][0], 
            updateNames[index][i][1],             
            updateNames[index][i][3], 
            updateNames[index][i][4], 
            updateNames[index][i][5], 
            updateNames[index][i][6], 
            updateNames[index][i][7], 
            updateNames[index][i][8], 
            updateNames[index][i][9], 
            updateNames[index][i][10], 
            updateNames[index][i][14],
            params.plan_id, 
            updateNames[index][i][2]])
        for (let i = 0; i < updateNames[index].length; i++) {
            await rivalsKeywordsRepo.updateByPlanIdAndKeywords([
                updateNames[index][i][12], 
                updateNames[index][i][13], 
                updateNames[index][i][14], 
                params.plan_id,
                updateNames[index][i][11], 
                params.plan_id,
                updateNames[index][i][2]])
        }
    }
    return true
}

module.exports = rivalsKeywordsService