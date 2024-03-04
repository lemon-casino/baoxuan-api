const FlowFormReviewModel = require("../model/flowformreview");

// 获取审核流模版
exports.getFlowFormReviewList = async (req, res) => {
  const { form_id } = req.query;
  const reslut = await FlowFormReviewModel.findOne({
    where: {
      form_id: form_id,
    },
  });
  if (reslut) {
    return res.send({
      code: 200,
      message: "请求成功",
      data: reslut.dataValues.form_review,
    });
  } else {
    return res.send({
        code: 1,
        message: "审核流不存在",
        data: [],
      });
  }
};

// 新增审核流模版
exports.saveFlowFormReview = async (req, res) => {
    console.log('req=========>', req)
    // await FlowFormReviewModel.upsert({
    //     form_id: item.formId,
    //     form_review: item.reviewProcess,
    //   });
};
