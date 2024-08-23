const procurementSelectionEetingService = require('../service/procurementSelectionEetingService');


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

module.exports = {
    procurementSelection
}