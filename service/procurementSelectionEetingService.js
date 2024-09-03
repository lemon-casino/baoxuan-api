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
        .filter(item => item.pushProductLine !== '')
        .map(({ pushProductLine, count }) => ({
            name: pushProductLine,
            value: parseInt(count, 10),
        }))
        .sort((a, b) => b.value - a.value);

    popover.sum = popover.kind.reduce((acc, { value }) => acc + value, 0);
}

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
    whetherOrNotToChooseAnOperationSa: '1688样品',
};

function processData(data, target) {
    target.popover = data
        .map(item => {
            const key = Object.keys(item)[0];
            const name = keyNameMap[key];
            return name ? { name, sum: item[key] } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.sum - a.sum);

    target.sum = target.popover.reduce((acc, { sum }) => acc + sum, 0);
}

async function fillRejectionStatistics(reasons, direction) {
    const rejectionData = await procurementSelectionEetingRepo.forwardAndBackwardThrust(reasons, direction);

    const processedData = rejectionData
        .map(({ Reason, Count }) => ({
            name: Reason,
            sum: Number(Count),
        }))
        .sort((a, b) => b.sum - a.sum);

    const totalSum = processedData.reduce((acc, { sum }) => acc + sum, 0);

    return { popover: processedData, sum: totalSum };
}

async function typeStatistics(content) {
    const reds = {
        pushForward: [],
        pushBackward: [],
    };

    const numberOfPushesTemplate = {
        title: "推品数量",
        sum: 0,
        popover: [
            {
                name: "类目",
                sum: 0,
                kind: [],
            },
        ],
    };

    const pushData = async (direction) => {
        const categoryStats = await procurementSelectionEetingRepo.categoryStatistics(direction);
        const numberOfPushes = JSON.parse(JSON.stringify(numberOfPushesTemplate));
        updatePopover(numberOfPushes.popover[0], categoryStats);
        numberOfPushes.sum = numberOfPushes.popover.reduce((acc, curr) => acc + curr.sum, 0);
        return numberOfPushes;
    };

    reds.pushForward.push(await pushData(1));
    reds.pushBackward.push(await pushData(2));

    const selectionTemplate = {
        title: "选中数量",
        sum: 0,
        popover: [{ name: "", sum: 0 }],
    };

    const selectionData = async (direction) => {
        const selectedData = await procurementSelectionEetingRepo.whetherForwardPushAndReversePushIsSelected(direction);
        const selection = JSON.parse(JSON.stringify(selectionTemplate));
        processData(selectedData, selection);
        return selection;
    };

    reds.pushForward.push(await selectionData(1));
    reds.pushBackward.push(await selectionData(2));

    const forwardRejection = await fillRejectionStatistics(["款式问题", "毛利问题", "竞争问题", "起订问题", "定制问题"], 1);
    const backwardRejection = await fillRejectionStatistics(["款式问题", "毛利问题", "竞争问题", "起订问题", "定制问题"], 2);

    const rejectionStatisticsTemplate = {
        title: "拒绝数量",
        sum: 0,
        popover: [],
    };

    reds.pushForward.push({ ...rejectionStatisticsTemplate, ...forwardRejection });
    reds.pushBackward.push({ ...rejectionStatisticsTemplate, ...backwardRejection });

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