// formFieldNameKWs：表单名关键词（用于表单数据根据表单名对照formFieldNameKWs确定要把该表单数据放入哪个类型中）
const visionUserFlowDataStatResultTemplate = [
    {nameCN: "简单", formFieldNameKWs: ["简单数量", "数据简单", "简单修图"], workload: 0, children: []},
    {nameCN: "普通", formFieldNameKWs: ["普通数量", "数据普通", "普通修图"], workload: 0, children: []},
    // 重点精修放在精修的前面，要不模糊筛选表单中重点精修的数据会被匹配到精修里面
    {nameCN: "重点精修", formFieldNameKWs: ["重点精修数量", "数据重点精修"], workload: 0, children: []},
    {nameCN: "精修", formFieldNameKWs: ["精修数量", "数据精修"], workload: 0, children: []},
    {nameCN: "视频", formFieldNameKWs: ["拍摄视频"], workload: 0, children: []},
    {nameCN: "AI修图", formFieldNameKWs: ["AI样本数", "AI作图数", "美编AI", "AI修图"], workload: 0, children: []},
    {nameCN: "剪辑", formFieldNameKWs: ["剪辑", "任务数量"], workload: 0, children: []},
    {nameCN: "建模", formFieldNameKWs: ["建模"], workload: 0, children: []},
    {nameCN: "排版", formFieldNameKWs: ["排版", "套版"], workload: 0, children: []},
    {nameCN: "摄影", formFieldNameKWs: ["摄影数量", "摄影非AI", "摄像非AI"], workload: 0, children: []},
    {nameCN: "摄影AI", formFieldNameKWs: ["摄影AI", "摄像AI", ""], workload: 0, children: []}
]

module.exports = {
    visionUserFlowDataStatResultTemplate
}