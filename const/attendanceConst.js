// 数据来源
const sourceType = {
    ATM: "考勤机打卡（指纹/人脸打卡）",
    BEACON: "IBeacon",
    DING_ATM: "钉钉考勤机（考勤机蓝牙打卡）",
    USER: "用户打卡",
    BOSS: "老板改签",
    APPROVE: "审批系统",
    SYSTEM: "考勤系统",
    AUTO_CHECK: "自动打卡"
}

// 位置结果
const locationResult = {
    Normal: "范围内",
    Outside: "范围外",
    NotSigned: "未打卡"
}

// 打卡结果
const timeResult = {
    Normal: "正常",
    Early: "早退",
    Late: "迟到",
    SeriousLate: "严重迟到",
    Absenteeism: "旷工迟到",
    NotSigned: "未打卡"
}

// 考勤类型
const checkType = {
    OnDuty: "上班",
    OffDuty: "下班"
}

module.exports = {
    sourceType,
    locationResult,
    timeResult,
    checkType
}