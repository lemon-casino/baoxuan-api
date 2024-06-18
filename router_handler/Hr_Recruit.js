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

        let {page, pageSize, quarters, department} = req.query;
//如果page  pageSize  quarters没有传递过来  默认为1  10
        page = page || 1;
        pageSize = pageSize || 20;


        await Hr_RecruitService.employeeManagement(parseInt(page), parseInt(pageSize), quarters, department, rest);

        return res.send(success(rest));
    } catch (error) {
        res.status(500).json({message: error.message});
    }

};


const showTalent = async (req, res, next) => {

    const createMonthObject = () => Array.from({length: 12}, (_, i) => ({
        total: 0,
        month: i + 1
    }));
    let rest = {
        //职级
        RankEcharts: [],
        //入职
        EmploymentEcharts: createMonthObject(),
        //员工列表
        AgeEcharts: [],
        //学历分布
        qualificationEcharts: []

    };
    try {

        await Hr_RecruitService.StatisticsEcharts(rest);

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
    showTalent
}