const unifiedConfusedUserNames = [
    {
        username: "皓峰摄影",
        children: ["德化皓峰", "皓峰摄影", "黄建榉"]
    },
    {
        username: "秒峰摄影",
        children: ["秒峰摄影", "妙峰", "陈辉灿"]
    },
    {
        username: "周俊腾",
        children: ["周", "周俊腾"]
    },
    {
        username: "徐彩玉",
        children: ["语嫣", "徐彩玉"]
    },
    {
        username: "芬芬",
        children: ["芬芬", " 芬 芬"]
    },
    {
        username: "美丽满屋",
        children: ["美丽满屋", "广东美丽满屋"]
    }
]

const tagsFormItemKeywordsMapping = [
    {
        tagCode: "lArtEditorGroup",
        includeFormItemKws: ["大美编", "精修数量", "重点精修数量", "普通数量", "普通修图数量", "美编权重数据普通", "美编权重数据精修", "美编权重数据重点精修", "开版修图数量"],
        excludeFormItemKws: ["小美编", "中美编", "外包"]
    },
    {
        tagCode: "sArtEditorGroup",
        includeFormItemKws: ["小美编", "简单数量", "简单修图数量", "普通数量", "普通修图数量", "美编权重数据普通", "美编权重数据简单"],
        excludeFormItemKws: ["大美编", "中美编", "外包"]
    },
    {
        tagCode: "AIGroup",
        includeFormItemKws: ["AI"],
        excludeFormItemKws: ["非AI", "摄影", "摄像"]
    },
    {
        tagCode: "typeSettingGroup",
        includeFormItemKws: ["排版", "套版"],
        excludeFormItemKws: ["外包"]
    },
    {
        tagCode: "modelingGroup",
        includeFormItemKws: ["建模"],
        excludeFormItemKws: []
    },
    {
        tagCode: "clipGroup",
        includeFormItemKws: ["剪辑", "任务数量"],
        excludeFormItemKws: ["大美编", "小美编", "外包"]
    },
    {
        tagCode: "photographyGroup",
        includeFormItemKws: ["摄影数量", "拍摄图片数量", "摄影非AI数值", "摄像非AI", "摄影非AI", "视频"],
        excludeFormItemKws: ["产品使用视频与样品交接"]
    },
    {
        tagCode: "photographyAIGroup",
        includeFormItemKws: ["摄影AI数量", "摄像AI数量"],
        excludeFormItemKws: []
    }
]

const historyArtEditorTagsFormItemKeywordsMapping = [
    {
        tagCode: "lArtEditorGroup",
        includeFormItemKws: ["大美编", "精修数量", "重点精修数量", "普通数量", "普通修图数量", "美编权重数据普通", "美编权重数据精修", "美编权重数据重点精修", "开版修图数量"],
        excludeFormItemKws: ["小美编", "中美编", "外包"]
    },
    {
        tagCode: "sArtEditorGroup",
        includeFormItemKws: ["小美编", "简单数量", "简单修图数量", "普通数量", "普通修图数量", "美编权重数据普通", "美编权重数据简单"],
        excludeFormItemKws: ["大美编", "中美编", "外包"]
    }
]

const newArtEditorTagsFormItemKeywordsMapping = {
    // 运营美编修图流程
    // 视觉拍摄流程（拍摄、修图）
    formIds: [
        "FORM-D2D43EACD2564C94AC549E40B67A9EEDQFEZ",
        "FORM-955A09160AB34B4489E96B8929AFFA2AVE2R"
    ],
    tagsKWsMapping: [
        {
            tagCode: "insideArt",
            includeFormItemKws: [
                "图片数量", "视频数量", "AI数量", "修图数量", "AI样本数", "AI作图数", "精修数量", "普通数量",
                "套版数量", "开版数量", "开版修图数量"
            ],
            excludeFormItemKws: []
        }
    ]
}

// 下面的节点信息也是要统计的美编节点数据（前期起名不规范）
const confusedActivityNameForStatFormData = [
    "中美编自修", "中美编负责人", "套版美编负责人", "套版编负责人", "小美编负责人", "确认自修外修"
]

/**
 * 因为视觉流程调整，需要兼顾对老流程的统计：取消大小美编的区分
 *
 * @param formId
 * @returns {({tagCode: string, excludeFormItemKws: string[], includeFormItemKws: string[]}|{tagCode: string, excludeFormItemKws: string[], includeFormItemKws: string[]}|{tagCode: string, excludeFormItemKws: *[], includeFormItemKws: string[]}|{tagCode: string, excludeFormItemKws: string[], includeFormItemKws: string[]}|{tagCode: string, excludeFormItemKws: string[], includeFormItemKws: string[]})[]}
 */
const getCompletedTagsFormItemKeywordsMapping = (formId) => {

    const requiredNewArtEditorKWsMapping = newArtEditorTagsFormItemKeywordsMapping.formIds.includes(formId)
    if (requiredNewArtEditorKWsMapping) {
        const result = newArtEditorTagsFormItemKeywordsMapping.tagsKWsMapping.concat(tagsFormItemKeywordsMapping)
        return result
    }
    const result = historyArtEditorTagsFormItemKeywordsMapping.concat(tagsFormItemKeywordsMapping)
    return result
}

module.exports = {
    unifiedConfusedUserNames,
    confusedActivityNameForStatFormData,
    getCompletedTagsFormItemKeywordsMapping
}