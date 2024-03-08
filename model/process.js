const Sequelize = require("sequelize");
const moment = require("moment");
const sequelize = require("./init");
const FlowForm = require("./flowfrom")

const ProcessModel = sequelize.define("process", {
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
});

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
        where: {id: {$eq: 1}},
        attributes: [
            "processInstanceId",
            "formUuid",
            "title",
            "approvedResult",
            "originator",
            "instanceStatus",
            "createTimeGMT",
            "modifiedTimeGMT",
            "overallprocessflow",
        ],
        include: [{
            model: FlowForm,
            as: "form",
            attributes: ["status"]
        }]
    });
    for (let item of flow) {
        list.push({
            processInstanceId: item.processInstanceId,
            formUuid: item.formUuid,
            formImportance: item["form.status"],
            title: item.title,
            approvedResult: item.approvedResult,
            originator: canParseJSON(item.originator),
            createTimeGMT: item.createTimeGMT,
            modifiedTimeGMT: item.modifiedTimeGMT,
            instanceStatus: item.instanceStatus,
            overallprocessflow: canParseJSON(item.overallprocessflow),
        });
    }
    return [];
};
module.exports = ProcessModel;
