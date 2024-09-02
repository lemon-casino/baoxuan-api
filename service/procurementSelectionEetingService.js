const procurementSelectionEetingRepo = require("@/repository/procurementSelectionEetingRepo")


const Create = async (procurement) => {
    // 当数据不存在的时候 批量创建
    console.log(procurement)
    await procurementSelectionEetingRepo.bulkCreate(procurement);
}
const bulkUpdate = async (procurement) => {

    //循环procurement数组，根据processInstanceId更新数据
    for (let i = 0; i < procurement.length; i++) {
        await procurementSelectionEetingRepo.bulkUpdate(procurement[i]);
    }

}

const getExistProcessInstanceId= async (processInstanceId) => {
    return await procurementSelectionEetingRepo.getExistProcessInstanceId(processInstanceId);
}
const returnsTheQueryConditionInformation= async () => {
   const reds= await procurementSelectionEetingRepo.returnsTheQueryConditionInformation();
    return  reds[0];
}
const FilterEetingInformation = async (content) => {
	return await procurementSelectionEetingRepo.FilterEetingInformation(
        content
	)
}
const theTimeOfTheLatestDay = async (content) => {
    return await procurementSelectionEetingRepo.theTimeOfTheLatestDay()
}


const groupMemberInformation = async (content) => {
    //从redis 中 返回组员信息

}
module.exports = {
    Create,
    bulkUpdate,
    returnsTheQueryConditionInformation,
    FilterEetingInformation,
    theTimeOfTheLatestDay,
    groupMemberInformation,
    getExistProcessInstanceId
}