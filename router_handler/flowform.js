const FlowFormModel = require("../model/flowfrom");

// 获取流程表单列表
exports.getFlowFormList = (req, res) => {
  let queryData = {};
  if (req.query.status) {
    queryData.status = req.query.status;
  }
  //获取流程列表
  FlowFormModel.getFlowFormList(queryData).then(function (menuTree) {
    return res.send({
      code: 200,
      message: "获取成功",
      data: menuTree || [],
    });
  });
};

// 更新流程表单数据
exports.updateFlowForm = (req, res) => {
  const { status, form_id } = req.body;
  if (!status) {
    return res.send({
      code: 1,
      message: "更新失败",
      data: null,
    });
  }
  if (!form_id) {
    return res.send({
      code: 1,
      message: "流程表单id不能为空",
      data: null,
    });
  }
  FlowFormModel.updateFlowForm({ status, form_id }).then(function (menuTree) {
    return res.send({
      code: 200,
      message: "更新成功",
      data: true,
    });
  });
};
