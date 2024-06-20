const Hr_RecruitService = require('../service/Hr_RecruitService');
const {success} = require("../utils/biResponse");

function extracted(timeRange, startDate, endDate) {
    if (timeRange === undefined) {
        const currentDate = new Date();
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    } else {
        timeRange = JSON.parse(timeRange);
        startDate = timeRange[0];
        endDate = timeRange[1];
    }
    return {startDate, endDate};
}


// 招聘数据看板 部门面试情况 岗位面试情况   -RecruitmentDepartmentPositions
const recruitmentDepartment = async (req, res, next) => {
    let startDate;
    let endDate;
    const rest = {
        department: [],
        quarters: [],
    }
    try {
        let {timeRange} = req.query;
        // let {page, pageSize} = req.query;
        // //如果page  pageSize 没有传递过来  默认为1  10
        //  page = page || 1;
        //  pageSize = pageSize || 10;
        const __ret = extracted(timeRange, startDate, endDate);
        startDate = __ret.startDate;
        endDate = __ret.endDate;
        await Hr_RecruitService.recruitmentDepartment(startDate, endDate, rest);

        return res.send(success(rest));
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};


// 招聘渠道分析

// 招聘账号投入产出比


// 进度图
const progressMap = async (req, res, next) => {
    let startDate;
    let endDate;
    const createMonthObject = () => Array.from({length: 12}, (_, i) => ({
        attendance: 0,
        month: `${i + 1}`.padStart(2, '0')
    }));

    const rest = {
        PoProgressMap: [],
        Head: [],
        Onboarding: createMonthObject(),
        Invert: createMonthObject(),
        Recommend: createMonthObject()
    };
    try {
        // //根据时间来筛选数据
        await Hr_RecruitService.progressMap(startDate, endDate, rest);

        return res.send(success(rest));
    } catch (error) {
        res.status(500).json({message: error.message});
    }

};

// 招聘人才动态 -RecruitmentTalentDynamic

const recruitmentTalent = async (req, res, next) => {

    let startDate;
    let endDate;
    const rest = {
        quarters: [],
    }
    try {
        let {timeRange} = req.query;
        // let {page, pageSize} = req.query;
        // //如果page  pageSize 没有传递过来  默认为1  10
        //  page = page || 1;
        //  pageSize = pageSize || 10;
        const __ret = extracted(timeRange, startDate, endDate);
        startDate = __ret.startDate;
        endDate = __ret.endDate;

        // 这个是岗位面试情况
        await Hr_RecruitService.recruitmentTalent(startDate, endDate, rest);

        return res.send(success(rest));
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

//  招聘管理 看板数据信息


const employeeManagement = async (req, res, next) => {


    let rest = {
        //筛选项
        filterItems: [],
        //统计项
        statistics: [],
        //员工列表
        employee: [],

    };
    try {

        //  let {page, pageSize, quarters, department, rank, abnormal, idling, mainBody, approval} = req.query;
        let {page, pageSize, quarters, department, rank, mainBody, date} = req.query;
        page = page || 1;
        pageSize = pageSize || 20;

// abnormal, idling, mainBody, approval, rest
        await Hr_RecruitService.employeeManagement(parseInt(page), parseInt(pageSize), quarters, department, rank, mainBody, date, rest);

        return res.send(success(rest));
    } catch (error) {
        res.status(500).json({message: error.message});
    }

};


const showTalent = async (req, res, next) => {

    let rest = {
        //职级
        RankEcharts: [],
        //入职
        EmploymentEcharts: [],
        //员工列表
        AgeEcharts: [],
        //学历分布
        qualificationEcharts: [],
        departmentEcharts: []

    };
    try {

        await Hr_RecruitService.StatisticsEcharts(rest);

        return res.send(success(rest));
    } catch (error) {
        res.status(500).json({message: error.message});
    }

};

const curriculumVitae = async (req, res, next) => {

    const {name} = req.query
    let rest = {
        //基本资料
        basicInformation: {},
        //教育经历
        educationalExperience: [],
        //工作经历
        workExperience: [],
        //任职信息
        employmentInformation: {},
        //其他信息
        otherInformation: {}
    };
    try {

        await Hr_RecruitService.curriculumVitae(name, rest);

        return res.send(success(rest));
    } catch (error) {
        res.status(500).json({message: error.message});
    }

};


const curriculumVitaelikename = async (req, res, next) => {

    // const {name} = req.query

    try {
        // name
        let rest = await Hr_RecruitService.curriculumVitaelikename();

        return res.send(success(rest));
    } catch (error) {
        res.status(500).json({message: error.message});
    }

};
module.exports = {
    recruitmentDepartment,
    recruitmentTalent,
    progressMap,
    employeeManagement,
    showTalent,
    curriculumVitae,
    curriculumVitaelikename
}