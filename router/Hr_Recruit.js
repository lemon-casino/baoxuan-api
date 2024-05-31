const express = require('express');
const router = express.Router();
const Hr_RecruitmentDepartmentPositions = require('../repository/Hr_RecruitmentDepartmentPositions');
const {success} = require("../utils/biResponse");
const globalGetter = require("../global/getter")
const {flowStatusConst} = require("../const/flowConst")
const PERSONNEL_AUDITS = "FORM-027086325D5B4B24885D75A541FD633E7AMV"

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
router.get('/RecruitmentDepartmentPositions', async (req, res) => {

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

        return res.send(success(rest));
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});


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
};

// 进度图
router.get('/progressMap', async (req, res) => {
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
        let {timeRange} = req.query;
        const __ret = extracted(timeRange, startDate, endDate);
        startDate = __ret.startDate;
        endDate = __ret.endDate;

        // //根据时间来筛选数据
        rest.PoProgressMap = await Hr_RecruitmentDepartmentPositions.getPoProgressMap(startDate, endDate);
        rest.Head = await Hr_RecruitmentDepartmentPositions.getHead(startDate, endDate);
        //匹配时间
        await updateAttendanceData('getOnboarding', rest.Onboarding);
        await updateAttendanceData('getInvert', rest.Invert);
        await updateAttendanceData('getRecommend', rest.Recommend);
        return res.send(success(rest));
    } catch (error) {
        res.status(500).json({message: error.message});
    }

});

// 招聘人才动态 -RecruitmentTalentDynamic

router.get('/RecruitmentTalentDynamic', async (req, res) => {

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
        return res.send(success(rest));
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

module.exports = router;