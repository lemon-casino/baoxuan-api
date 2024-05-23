const FlowFormModel = require("../model/flowfrom");
const biResponse = require("../utils/biResponse")
const flowFormService = require("../service/flowFormService")

// 获取流程表单列表
exports.getFlowFormList = (req, res) => {
    let queryData = {};
    if (req.query.status) {
        queryData.status = req.query.status;
    }
    //获取流程列表
    FlowFormModel.getFlowFormList(queryData).then(function (menuTree) {
        return res.send(biResponse.success(menuTree || []));
    });
}

// 更新流程表单数据
exports.updateFlowForm = (req, res) => {
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

exports.getAllFlowForms = async (req, res, next) => {
    try {
        const allForms = await flowFormService.getAllForms()
        return res.send(biResponse.success(allForms))
    } catch (e) {
        next(e)
    }
}