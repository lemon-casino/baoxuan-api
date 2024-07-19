const FlowFormModel = require("@/model/flowfrom");
const biResponse = require("@/utils/biResponse")
const flowFormService = require("@/service/flowFormService")
const taskService = require("@/service/taskService")

// 获取流程表单列表
const getFlowFormList = async (req, res) => {
    let queryData = {};
    if (req.query.status) {
        queryData.status = req.query.status;
    }

    // 影刀调用时，同步最新的表单信息
    if (req.query.from && req.query.from === "yingdao") {
        // 天鹏：281338354935548795
        // 健康：01576511383236229829
        // 涛哥：073105202321093148
        const creatorIds = ["073105202321093148", "01576511383236229829", "281338354935548795"]
        for (const creatorId of creatorIds) {
            await taskService.syncForm(creatorId)
        }
    }

    const menuTree = await FlowFormModel.getFlowFormList(queryData)
    return res.send(biResponse.success(menuTree || []));
}

// 更新流程表单数据
const updateFlowForm = (req, res) => {
    const {status, form_id} = req.body;
    if (!status) {
        return res.send(biResponse.serverError("更新失败"));
    }
    if (!form_id) {
        return res.send(biResponse.serverError("流程表单id不能为空"));
    }
    FlowFormModel.updateFlowForm({status, form_id}).then(function (menuTree) {
        return res.send(biResponse.success(true));
    })
}

const getAllFlowForms = async (req, res, next) => {
    try {
        const allForms = await flowFormService.getAllForms()
        return res.send(biResponse.success(allForms))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getFlowFormList,
    getAllFlowForms,
    updateFlowForm
}