const Sequelize = require("sequelize");
const moment = require("moment");
const sequelize = require("./init");
const FlowFormReview = require("./flowformreview")
const reviewUtil = require("../utils/reviewUtil")

const ProcessModel = sequelize.define("processes",
    {
        processInstanceId: {
            type: Sequelize.STRING(255),
        },
        processCode: {
            type: Sequelize.STRING(255),
        },
        formUuid: {
            type: Sequelize.STRING(255),
        },
        title: {
            type: Sequelize.STRING(255),
        },
        approvedResult: {
            type: Sequelize.STRING(255),
        },
        originator: {
            type: Sequelize.JSON,
        },

        instanceStatus: {
            type: Sequelize.STRING(255),
        },
        data: {
            type: Sequelize.JSON,
        },
        actionExecutor: {
            type: Sequelize.JSON,
        },
        overallprocessflow: {
            type: Sequelize.JSON,
        },
        version: {
            type: Sequelize.STRING(255),
        },
        createTimeGMT: {
            type: Sequelize.STRING(255),
        },
        modifiedTimeGMT: {
            type: Sequelize.STRING(255),
        },
        update_time: {
            type: Sequelize.DATE,
            get() {
                return this.getDataValue("update_time")
                    ? moment(this.getDataValue("update_time")).format("YYYY-MM-DD HH:mm:ss")
                    : null;
            },
        },
        create_time: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            get() {
                return moment(this.getDataValue("create_time")).format(
                    "YYYY-MM-DD HH:mm:ss"
                );
            },
        },
        review_id: {
            type: Sequelize.INTEGER
        }
    },
    {freezeTableName: true}
);


// 添加流程数据
ProcessModel.addProcess = async function (data) {
    //   首先,我们开始一个事务并将其保存到变量中
    const t = await sequelize.transaction();
    try {
        // 添加流程表单
        for (let item of data) {
            const {processInstanceId} = item;
            // 查询是否存在相同的 processInstanceId
            const existingInstance = await ProcessModel.findOne({
                where: {processInstanceId},
            });
            // 如果不存在，则创建新实例
            if (!existingInstance) {
                //  获取当前流程所对应form的最新的审核流
                let reviewId = "";
                const flowReviews = FlowFormReview.getFlowFormReviewList(item.formUuid)
                if (flowReviews && flowReviews.length) {
                    reviewId = flowReviews[0].id
                }

                // 获取指定form的最新的审核要求
                const reviewRequirements = await FlowFormReview.getFlowFormReviewList(item.formUuid)
                if (reviewRequirements && reviewRequirements.form_review) {
                    item = await reviewUtil.addCostToReviewOfFlow(item, reviewRequirements.form_review)
                    item.review_id = reviewRequirements.id
                } else {
                    console.warn(`form：${item.formUuid} 当前库中没有可用的审核模板`)
                }
                await ProcessModel.upsert({
                    createTimeGMT: item.createTimeGMT,
                    processInstanceId: item.processInstanceId,
                    approvedResult: item.approvedResult,
                    formUuid: item.formUuid,
                    data: JSON.stringify(item.data),
                    modifiedTimeGMT: item.modifiedTimeGMT,
                    processCode: item.processCode,
                    actionExecutor: JSON.stringify(item.actionExecutor),
                    originator: JSON.stringify(item.originator),
                    title: item.title,
                    instanceStatus: item.instanceStatus,
                    version: item.version,
                    overallprocessflow: JSON.stringify(item.overallprocessflow),
                    review_id: reviewId
                });
            }
        }
        // 我们提交事务.
        t.commit();
    } catch (e) {
        // 如果执行到达此行,则抛出错误.
        // 我们回滚事务.
        t.rollback();
        return e.message;
    }
};

function canParseJSON(jsonString) {
    try {
        return JSON.parse(jsonString); // 解析成功，返回true
    } catch (error) {
        return jsonString; // 解析失败，返回false
    }
}

// 查询全部流程数据
ProcessModel.getProcessList = async function (form_id) {
    const list = [];
    const flow = await ProcessModel.findAll({
        attributes: [
            "id",
            "processInstanceId",
            "formUuid",
            "title",
            "approvedResult",
            "originator",
            "instanceStatus",
            "createTimeGMT",
            "modifiedTimeGMT",
            "overallprocessflow",
        ]
    });
    for (let item of flow) {
        list.push({
            id: item.id,
            processInstanceId: item.processInstanceId,
            formUuid: item.formUuid,
            formImportance: item["formReviewService.js.status"],
            title: item.title,
            approvedResult: item.approvedResult,
            originator: canParseJSON(item.originator),
            createTimeGMT: item.createTimeGMT,
            modifiedTimeGMT: item.modifiedTimeGMT,
            instanceStatus: item.instanceStatus,
            overallprocessflow: canParseJSON(item.overallprocessflow),
        });
    }
    return list;
};

// 更新process
ProcessModel.updateProcess = async function (item) {
    const reflectRows = await ProcessModel.update({
        processInstanceId: item.processInstanceId,
        formUuid: item.formUuid,
        formImportance: item.formImportance,
        title: item.title,
        approvedResult: item.approvedResult,
        originator: item.originator,
        createTimeGMT: item.createTimeGMT,
        modifiedTimeGMT: item.modifiedTimeGMT,
        instanceStatus: item.instanceStatus,
        overallprocessflow: item.overallprocessflow,
        review_id: item.review_id
    }, {
        where: {
            id: item.id,
        }
    })
    return reflectRows;
}

module.exports = ProcessModel;
