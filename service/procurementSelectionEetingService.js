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


function updatePopover(popover, data) {
    popover.kind = data
        .filter(item => item.pushProductLine !== '') // Filter out entries with empty pushProductLine
        .map(item => ({
            name: item.pushProductLine,
            value: parseInt(item.count, 10),
        }))  .sort((a, b) => b.value - a.value);
    popover.sum = popover.kind.reduce((acc, curr) => acc + curr.value, 0);
}


// 键名与中文名称的映射关系
const keyNameMap = {
    whetherTmallIsSelected: '天猫运营',
    whetherJDIsSelected: '京东运营',
    pinduoduoIsSelected: '拼多多运营',
    whetherTmallSupermarketIsSelected: '天猫超市运营',
    dewu_vipshopWillBeSelected: '淘工厂运营',
    tmall_verticalStore_XiaohongshuIsSelected: '天猫垂类店,小红书运营',
    whetherOrNotCoupangIsSelected: 'Coupang运营',
    douyin_kuaishouIsSelected: '抖音,快手运营',
    IsUnchecked_1688: '1688运营',
    whetherToChooseTheJDOperationSample: '京东样品',
    whetherTheTmallOperationSampleIsSelected: '天猫样品',
    whetherThePinduoduoOperationSampleIsSelected: '拼多多样品',
    tmall_supermarket_operationSampleIsNotSelected: '天猫超市样品',
    Tao_factor_operation_sample_whether_choose: '淘工厂样品',
    gains_vipshop_WhetherToChooseTheOperationSample: '得物,唯品会样品',
    tmallVerticalStore_littleRedBook: '天猫垂类店,小红书样品',
    coupang_OperationSample_IsSelected: 'Coupang样品',
    tikTok_whetherTheKuaishouOperationSampleIsSelected: '抖音,快手样品',
    whetherOrNotToChooseAnOperationSa: '1688样品'
};
// 用于处理数据的通用函数
function processData(data, target) {
    target.popover = data.map(item => {
        const key = Object.keys(item)[0]; // 获取当前对象的键
        const sum = item[key]; // 获取当前对象的值
        const name = keyNameMap[key]; // 从映射中获取中文名称

        return name ? { name, sum } : null; // 返回对象，如果没有名字则返回 null
    }).filter(Boolean) .sort((a, b) => b.sum - a.sum);// 过滤掉 null 的值

    // 计算总和
    target.sum = target.popover.reduce((acc, curr) => acc + curr.sum, 0);
}


// 处理数据并填充 rejectionStatistics 的通用函数
const fillRejectionStatistics = async (reasons, direction) => {
    const rejectionData = await procurementSelectionEetingRepo.forwardAndBackwardThrust(reasons, direction);

    const processedData = rejectionData.map(item => ({
        name: item.Reason,   // 将 Reason 映射为 name
        sum: Number(item.Count) // 将 Count 映射为 sum，并转换为数字类型
    })).sort((a, b) => b.sum - a.sum); // 根据 sum 字段进行降序排序

    const totalSum = processedData.reduce((acc, curr) => acc + curr.sum, 0);

    return { popover: processedData, sum: totalSum };
};

const typeStatistics = async (content) => {
   // 模板返回
    const reds={
        pushForward:[
        ],
        pushBackward:[

        ]
}


    //推品数量
    //

    const  numberOfPushes=        {
        title:"推品数量",
        sum: 0,
        popover:[
            {
                name: "类目",
                sum: 0,
                kind: [
                ],
            },
        ]
    }
    //拷贝一份numberOfPushes
    const numberOfPushesCopy = JSON.parse(JSON.stringify(numberOfPushes));


//正推的 类目
     const xz=await procurementSelectionEetingRepo.categoryStatistics(1)

    updatePopover(numberOfPushes.popover[0], xz);
     // 这里添加第二个popover  updatePopover(numberOfPushes.popover[0], xz);
    numberOfPushes.sum = numberOfPushes.popover.reduce((acc, curr) => acc + curr.sum, 0);
    reds.pushForward.push(numberOfPushes)


//反推的类目
    const xzl =await procurementSelectionEetingRepo.categoryStatistics(2)

    updatePopover(numberOfPushesCopy.popover[0], xzl);
    numberOfPushesCopy.sum = numberOfPushesCopy.popover.reduce((acc, curr) => acc + curr.sum, 0);
    reds.pushBackward.push(numberOfPushesCopy)





    //正推反推是否选中
    const  whetherOrNotToCheck= {
        title:"选中数量",
        sum: 0,
        popover:[
            {
                name: "",
                sum: 0,
            },
        ]
    }
    const whetherOrNotToCheckCopy = JSON.parse(JSON.stringify(whetherOrNotToCheck));



    const  iAmPushingToSelect=await procurementSelectionEetingRepo.whetherForwardPushAndReversePushIsSelected(1)
    processData(iAmPushingToSelect, whetherOrNotToCheckCopy);
    reds.pushForward.push(whetherOrNotToCheckCopy)

    const  reversePushSelected =await procurementSelectionEetingRepo.whetherForwardPushAndReversePushIsSelected(2)
    processData(reversePushSelected, whetherOrNotToCheck);
    reds.pushBackward.push(whetherOrNotToCheck)



    const rejectionStatistics = {
        title: "拒绝数量",
        sum: 0,
        popover: []
    };
// 正向推拒绝数量统计
    const forwardReasons = ["款式问题", "毛利问题", "竞争问题", "起订问题", "定制问题"];
    const forwardRejectionStatistics = await fillRejectionStatistics(forwardReasons, 1);

// 反向推拒绝数量统计
    const pushBackRejectionStatistics = await fillRejectionStatistics(forwardReasons, 2);

// 设置正向推拒绝统计结果
    const rejectionStatisticsCopy = {
        ...rejectionStatistics,
        popover: forwardRejectionStatistics.popover,
        sum: forwardRejectionStatistics.sum
    };
    reds.pushForward.push(rejectionStatisticsCopy)


// 设置反向推拒绝统计结果
    rejectionStatistics.popover = pushBackRejectionStatistics.popover;
    rejectionStatistics.sum = pushBackRejectionStatistics.sum;
    reds.pushBackward.push(rejectionStatistics)


   return reds;

}
module.exports = {
    Create,
    bulkUpdate,
    returnsTheQueryConditionInformation,
    FilterEetingInformation,
    theTimeOfTheLatestDay,
    groupMemberInformation,
    getExistProcessInstanceId,
    typeStatistics
}