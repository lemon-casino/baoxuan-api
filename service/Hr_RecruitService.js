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

const employeeManagement = async (page, pageSize, quarters, department, rank, mainBody, date, rest) => {


    try {


        // 员工档案 员工合同管路   本月新员工数量 本月离职员工数量
        rest.statistics = await Hr_RecruitmentDepartmentPositions.statistics();
        // 如果data为空   则返回空 如果不为空  则返回data new Date(date).toLocaleDateString();
        const formatDate = date => date ? new Date(date).toLocaleDateString() : '-';
        const employeeData = await Hr_RecruitmentDepartmentPositions.employeeManagement(parseInt(page), parseInt(pageSize), quarters, department, rank, mainBody, date);
        //  这些需要有变动的时候 再进行联动修改  abnormal, idling, approval
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
        rest.filterItems.push({
            title: '主体',
            key: 'mainBody',
            value: await Hr_RecruitmentDepartmentPositions.mainBody(),
        })

        rest.filterItems.push({
            title: '职级',
            key: 'rank',
            value: await Hr_RecruitmentDepartmentPositions.rank(),
        })


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
        // 部门分布
        departmentEcharts
        、*/
        rest.qualificationEcharts = await Hr_RecruitmentDepartmentPositions.qualificationEcharts();

        rest.RankEcharts = await Hr_RecruitmentDepartmentPositions.RankEcharts();
        rest.EmploymentEcharts = await Hr_RecruitmentDepartmentPositions.employmentEcharts();
        rest.EmploymentEcharts.forEach(item => {
            item.data = item.data.split(',');
        })

        const AgeEcharts = await Hr_RecruitmentDepartmentPositions.AgeEcharts();

        const groups = [
            {label: '19', min: -Infinity, max: 19, total: 0, data: []},
            {label: '20-29', min: 20, max: 29, total: 0, data: []},
            {label: '30-39', min: 30, max: 39, total: 0, data: []},
            {label: '40-49', min: 40, max: 49, total: 0, data: []},
            {label: '50-59', min: 50, max: 59, total: 0, data: []}
        ];
        AgeEcharts.forEach(item => {
            if (item.age !== null) {
                for (let group of groups) {
                    if (item.age >= group.min && item.age <= group.max) {
                        group.total += item.total;
                        group.data.push(item);
                        break;
                    }
                }
            }
        });
        rest.AgeEcharts = groups


        const departmentEcharts = await Hr_RecruitmentDepartmentPositions.departmentEcharts();
        // 定义需要统计的部门
        const targetSections = [
            '天猫部', '京东部', '拼多多部', '猫超部', '淘工厂部', '抖音/快手部', 'coupang部'
        ];
        // 过滤出目标部门的数据
        const filteredData = departmentEcharts.filter(item => targetSections.includes(item.section));

        const middlePlatform = [
            '数据中台部', '客服部', '采购部', '开发部门', '视觉部', '执行中台部', '管理中台', '总经办'
        ];
        const middlePlatformdData = departmentEcharts.filter(item => middlePlatform.includes(item.section));

        const rearEnd = [
            '财务部', '人力', '行政', '法务'
        ];
        const rearEnddData = departmentEcharts.filter(item => rearEnd.includes(item.section));

        //         计算总和生成最终的对象
        rest.departmentEcharts = [
            {
                section: '前端',
                total: filteredData.reduce((sum, item) => sum + item.total, 0),
                data: filteredData
            }, {
                section: '中台',
                total: middlePlatformdData.reduce((sum, item) => sum + item.total, 0),
                data: middlePlatformdData
            }
            , {
                section: '后端',
                total: rearEnddData.reduce((sum, item) => sum + item.total, 0),
                data: rearEnddData
            }
        ];
        return rest
    } catch (error) {
        return {message: error.message};
    }

};


const curriculumVitae = async (name, rest) => {

    try {
        const formatDate = date => date ? new Date(date).toLocaleDateString() : '-';
        const basicInformation = await Hr_RecruitmentDepartmentPositions.basicInformation(name)
        rest.basicInformation = {
            ...basicInformation,
            data: basicInformation.map(item => ({
                ...item,
                birthday: formatDate(item.birthday),
            }))
        }.data;
        return rest
    } catch (error) {
        return {message: error.message};
    }

};

// 公用 函数 作用是将数值转化为百分比占总得到百分比
function calculatePercentage(data, valueKey, nameKey) {
    // 计算总数
    const total = data.reduce((sum, item) => sum + item[valueKey], 0);

    // 计算每个类别的占比并添加百分比符号
    return data.map(item => ({
        [nameKey]: item[nameKey],
        [valueKey]: ((item[valueKey] / total) * 100).toFixed(2) + '%'
    }));
}

const curriculumVitaelikename = async (rest) => {

    try {
        let data = await Hr_RecruitmentDepartmentPositions.curriculumVitaelikename();
        // console.log()
        // let split = data.split(',');
        return data[0].name.split(',')
    } catch (error) {
        return {message: error.message};
    }

};

const employeeFiles = async (rest) => {
//        gender: {},
//         mainBody: {}
    try {
        rest.gender = calculatePercentage(await Hr_RecruitmentDepartmentPositions.gender(), 'value', 'name');
        rest.mainBody = calculatePercentage(await Hr_RecruitmentDepartmentPositions.mainBodyecharts(), 'value', 'name');
        rest.department = calculatePercentage(await Hr_RecruitmentDepartmentPositions.departmentdDistributed(), 'value', 'name');
        //入离职信息
        //
    } catch (error) {
        return {message: error.message};
    }

};


const entryAndResignation = async (rest) => {
    /*
    * // 每个月的在职情况
    annualEmployment: [],
        //月度入职
        departmentOnboarding: [], -
        // 月度离职
        departmentResignation: [],-
        //
        departmentEntryAndExitl:[] -
        // 对比: []
        joiningAndLeaving: [],
        //入离职环比
        entryAndExitRatio: []
    * */
    try {
        rest.departmentOnboarding = calculatePercentage(await Hr_RecruitmentDepartmentPositions.departmentOnboarding(), 'value', 'name');
        rest.departmentResignation = calculatePercentage(await Hr_RecruitmentDepartmentPositions.departmentResignation(), 'value', 'name');
        rest.joiningAndLeaving = await Hr_RecruitmentDepartmentPositions.joiningAndLeaving();
        rest.departmentEntryAndExit = await Hr_RecruitmentDepartmentPositions.departmentEntryAndExit();
        // rest.department = calculatePercentage(await Hr_RecruitmentDepartmentPositions.departmentdDistributed(), 'value', 'name');
        //入离职信息
        console.log("--------------------")

    } catch (error) {
        return {message: error.message};
    }

};


module.exports = {
    recruitmentDepartment,
    recruitmentTalent,
    progressMap,
    employeeManagement,
    StatisticsEcharts,
    curriculumVitae,
    curriculumVitaelikename,
    employeeFiles,
    entryAndResignation,
}