const procurementSelectionEetingService = require('../service/procurementSelectionEetingService');

const biResponse = require("@/utils/biResponse");


const procurementSelection = async (procurement) => {

    try {
        // 将 procurement数组中的 processInstanceId 提取出来形成新的数组
        const processInstanceId = procurement.map(item => item.processInstanceId);
        const exist_processInstanceId= await procurementSelectionEetingService.getExistProcessInstanceId(processInstanceId);
        const existingIds = new Set(exist_processInstanceId.map(item => item.processInstanceId));
        const filteredProcurement = procurement.filter(item => !existingIds.has(item.processInstanceId));
        const exist_procurement = procurement.filter(item => existingIds.has(item.processInstanceId));
        await procurementSelectionEetingService.bulkUpdate(exist_procurement);
        await procurementSelectionEetingService.Create(filteredProcurement);


    } catch (error) {

    }

};

// 查询条件返回的内容

const returnsTheQueryConditionInformation = async (req, res, next) => {
    try {

        let reds={}
        reds = await procurementSelectionEetingService.returnsTheQueryConditionInformation()
        return res.send(biResponse.success(reds))
    } catch (e) {
        next(e)
    }
}

const ReturnFilterEetingInformation = async (req, res, next) => {
    try {



        let reds={}

        reds = await procurementSelectionEetingService.FilterEetingInformation(req.query)
        return res.send(biResponse.success(reds))
    } catch (e) {
        next(e)
    }
}
const theTimeOfTheLatestDay = async (req, res, next) => {
    try {



        let reds={}

        reds = await procurementSelectionEetingService.theTimeOfTheLatestDay()
        return res.send(biResponse.success(reds))
    } catch (e) {
        next(e)
    }
}
const groupMemberInformation = async (req, res, next) => {
    try {

        let reds={}

        reds = await procurementSelectionEetingService.groupMemberInformation()
        return res.send(biResponse.success(reds))
    } catch (e) {
        next(e)
    }
}


// 根据类型 处理
const  typeStatistics= async (req, res, next) => {
    try {

        const  {Type } =req.query
        let reds={}

        reds = await procurementSelectionEetingService.typeStatistics(Type)
        return res.send(biResponse.success(reds))

    }
    catch (e) {
        next(e)
    }
}



module.exports = {
    procurementSelection,
    returnsTheQueryConditionInformation,
    ReturnFilterEetingInformation,
    theTimeOfTheLatestDay,
    groupMemberInformation,
    typeStatistics
}