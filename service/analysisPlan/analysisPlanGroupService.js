const analysisPlanGroupRepo = require('@/repository/analysisPlan/analysisPlanGroupRepo')
const rivalsRepo = require('@/repository/analysisPlan/rivalsRepo')
const analysisPlanGroupService = {}

analysisPlanGroupService.get = async (params) => {
    let result = []
    result = await analysisPlanGroupRepo.get(params.plan_id)
    return result
}

analysisPlanGroupService.create = async (params) => {
    let info = [], inserts = [], updates = []
    let group_info = await analysisPlanGroupRepo.get(params.plan_id)
    for (let i = 0; i < group_info.length; i++) {
        info.push([
            group_info[i].group_name,
            group_info[i].remark,
            group_info[i].name,
            group_info[i].goods_id,
            group_info[i].category,
            group_info[i].shop_name,
            group_info[i].shop_type,
            group_info[i].monthly_sales,
            group_info[i].price,
            group_info[i].picture,            
        ])
    }
    for (let i = 1; i < params.data.length; i++) {
        let flag = 1        
        if (!params.data[i][0] || (params.data[i][0] instanceof String  && params.data[i][0].trim().length == 0) || 
            !params.data[i][3] || (params.data[i][3] instanceof String  && params.data[i][3].trim().length == 0))
            return false
        for (let j = 0; j < params.data[i].length; j++) {
            if (params.data[i][j] instanceof String)
                params.data[i][j] = params.data[i][j].trim()
        }
        params.data[i][10] = i
        for (let j = 0; j < info.length; j++) {
            if (params.data[i][0] == info[j][0] && params.data[i][3] == info[j][3]) {
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
    //删除分组&关联的竞品数据
    let deleteNames = {}
    for (let i = 0; i < info.length; i++) {
        if (!deleteNames[info[i][0]]) deleteNames[info[i][0]] = [info[i][3]]
        else deleteNames[info[i][0]].push(info[i][3])
    }
    for(let index in deleteNames) {
        let count = await analysisPlanGroupRepo.getCountByPlanIdAndName(params.plan_id, index)
        if (count?.length && count[0].count == deleteNames[index].length) {
            await analysisPlanGroupRepo.deleteRivals(params.plan_id, count[0].id)
            await analysisPlanGroupRepo.deleteById(count[0].id)
        } else {
            for (let i = 0; i < deleteNames[index].length; i++) {
                await analysisPlanGroupRepo.deleteRivalByGoodsId(params.plan_id, count[0].id, deleteNames[index][i])
            }
        }
    }
    //新增分组&关联的竞品数据
    let insertNames = {}
    for (let i = 0; i < inserts.length; i++) {
        if (!insertNames[inserts[i][0]]) insertNames[inserts[i][0]] = [inserts[i]]
        else insertNames[inserts[i][0]].push(inserts[i])
    }
    for (let index in insertNames) {
        let count = await analysisPlanGroupRepo.getCountByPlanIdAndName(params.plan_id, index)
        let group_id
        if (!count?.length) {
            group_id = await analysisPlanGroupRepo.create([
                insertNames[index][0][0],
                insertNames[index][0][1],
                params.plan_id,
                insertNames[index][0][10]
            ])            
        } else group_id = count[0].id
        for (let i = 0; i < insertNames[index].length; i++) {
            let rival = await rivalsRepo.getByPlanIdAndGoodsId(params.plan_id, insertNames[index][i][3])
            let rival_id
            if (!rival?.length) rival_id = await rivalsRepo.create([
                params.plan_id, 
                insertNames[index][i][2] ? insertNames[index][i][2] : null, 
                null, 
                insertNames[index][i][3], 
                insertNames[index][i][4], 
                insertNames[index][i][5], 
                insertNames[index][i][6], 
                insertNames[index][i][7], 
                insertNames[index][i][8], 
                insertNames[index][i][9], 
                null, 
                null, 
                null, 
                0, 
                null, 
                null, 
                null])
            else rival_id = rival[0].id
            await analysisPlanGroupRepo.addRivals(params.plan_id, group_id, rival_id)
        }
    }
    //更新分组&关联的竞品信息
    let updateNames = {}
    for (let i = 0; i < updates.length; i++) {
        if (!updateNames[updates[i][0]]) updateNames[updates[i][0]] = [updates[i]]
        else updateNames[updates[i][0]].push(updates[i])
    }
    for (let index in updateNames) {
        await analysisPlanGroupRepo.updateByPlanIdAndName(
            params.plan_id, 
            index, 
            updateNames[index][0][1],
            updateNames[index][0][10])
        for (let i = 0; i < updateNames[index].length; i++) {
            await rivalsRepo.updateByPlanIdAndGoodsId([
                updateNames[index][i][2], 
                updateNames[index][i][4], 
                updateNames[index][i][5], 
                updateNames[index][i][6], 
                updateNames[index][i][7], 
                updateNames[index][i][8], 
                updateNames[index][i][9],
                params.plan_id,
                updateNames[index][i][3]])
        }
    }
    return true
}

module.exports = analysisPlanGroupService