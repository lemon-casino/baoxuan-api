const Hr_RecruitmentDepartmentPositions = require('../repository/hrRecruitmentRepo');
const {success} = require("../utils/biResponse");
const globalGetter = require("../global/getter")
const {flowStatusConst} = require("../const/flowConst")
const PERSONNEL_AUDITS = "FORM-027086325D5B4B24885D75A541FD633E7AMV"

// 招聘数据看板 部门面试情况 岗位面试情况   -RecruitmentDepartmentPositions
const recruitmentDepartment = async (startDate, endDate, rest) => {

    try {

        // 这个是部门面试情况
        rest.department = await Hr_RecruitmentDepartmentPositions.getHrDepartment(startDate, endDate);
        // 这个是岗位面试情况
        rest.quarters = await Hr_RecruitmentDepartmentPositions.getHrQuarters(startDate, endDate);
        let xx = await Hr_RecruitmentDepartmentPositions.getMatching(startDate, endDate)
        rest.quarters.forEach(item => {
            const matchingItem = xx.find(item2 => item.keyword === item2.keyword);
            if (matchingItem) {
                item.matchingResumeVolume = matchingItem.numberResumes;
            } else {
                item.matchingResumeVolume = 0; // 如果没有匹配项，将匹配简历量设置为0
            }
        });

        const todayFlows = await globalGetter.getTodayFlows();
        const runningFlow = todayFlows.filter((flow) => flow.instanceStatus === flowStatusConst.RUNNING && flow.formUuid === PERSONNEL_AUDITS);
        //console.log(runningFlow)

        return rest
    } catch (error) {
        return {message: error.message};
    }
};


// 招聘渠道分析

// 招聘账号投入产出比

async function updateAttendanceData(sourceData, targetArray) {
    const data = await Hr_RecruitmentDepartmentPositions[sourceData]();
    data.forEach(item => {
        const targetItem = targetArray.find(target => item.month === target.month);
        if (targetItem) {
            targetItem.attendance = item.attendance;
        }
    });
}

// 进度图
const progressMap = async (startDate, endDate, rest) => {

    try {
        // //根据时间来筛选数据
        rest.PoProgressMap = await Hr_RecruitmentDepartmentPositions.getPoProgressMap(startDate, endDate);
        rest.Head = await Hr_RecruitmentDepartmentPositions.getHead(startDate, endDate);
        //匹配时间
        await updateAttendanceData('getOnboarding', rest.Onboarding);
        await updateAttendanceData('getInvert', rest.Invert);
        await updateAttendanceData('getRecommend', rest.Recommend);
        return rest
    } catch (error) {
        return {message: error.message};
    }

};

// 招聘人才动态 -RecruitmentTalentDynamic

const recruitmentTalent = async (startDate, endDate, rest) => {


    try {

        // 这个是岗位面试情况
        rest.quarters = await Hr_RecruitmentDepartmentPositions.getHrRecruitment(startDate, endDate);
        // let xx= await  Hr_RecruitmentDepartmentPositions.getMatching(startDate, endDate)
        // rest.quarters.forEach(item => {
        //     const matchingItem = xx.find(item2 => item.keyword === item2.keyword);
        //     if (matchingItem) {
        //         item.matchingResumeVolume = matchingItem.numberResumes;
        //     } else {
        //         item.matchingResumeVolume = 0; // 如果没有匹配项，将匹配简历量设置为0
        //     }
        // });
        return rest
    } catch (error) {
        return {message: error.message};
    }
};

const employeeManagement = async (page, pageSize, quarters, department, rest) => {


    try {


        // 如果data为空   则返回空 如果不为空  则返回data new Date(date).toLocaleDateString();
        const formatDate = date => date ? new Date(date).toLocaleDateString() : '';
        const employeeData = await Hr_RecruitmentDepartmentPositions.employeeManagement(parseInt(page), parseInt(pageSize), quarters, department);
        rest.employee = {
            ...employeeData,
            rows: employeeData.rows.map(item => ({
                ...item,
                birthday: formatDate(item.birthday),
                onBoardTime: formatDate(item.onBoardTime),
                startDateFirstContract: formatDate(item.startDateFirstContract),
                firstContractExpirationDate: formatDate(item.firstContractExpirationDate),
                currentContractStartingDate: formatDate(item.currentContractStartingDate),
                currentContractExpirationDate: formatDate(item.currentContractExpirationDate)
            }))
        };
        rest.filterItems.push({
            title: '岗位',
            key: 'quarters',
            value: await Hr_RecruitmentDepartmentPositions.quarters(),
        })
        rest.filterItems.push({
            title: '部门',
            key: 'department',
            value: await Hr_RecruitmentDepartmentPositions.department(),
        })
        rest.statistics = await Hr_RecruitmentDepartmentPositions.statistics();

        return rest
    } catch (error) {
        return {message: error.message};
    }

};
const StatisticsEcharts = async (rest) => {

    try {

        /* 职级
         RankEcharts: [],
        //入职
        EmploymentEcharts: [],
        //员工年龄列表
        AgeEcharts: [],
        //学历分布
        qualificationEcharts: []
        、*/
        rest.qualificationEcharts = await Hr_RecruitmentDepartmentPositions.qualificationEcharts();
        const data = await Hr_RecruitmentDepartmentPositions.employmentEcharts();
        rest.AgeEcharts = await Hr_RecruitmentDepartmentPositions.AgeEcharts();

        rest.EmploymentEcharts.forEach(item => {
            const targetItem = data.find(target => item.month === target.month);
            if (targetItem) {
                item.total = targetItem.total;
            }
        });
        return rest
    } catch (error) {
        return {message: error.message};
    }

};

module.exports = {
    recruitmentDepartment,
    recruitmentTalent,
    progressMap,
    employeeManagement,
    StatisticsEcharts
}