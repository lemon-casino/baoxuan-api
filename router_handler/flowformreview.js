/*
 * @Author: 陈晓飞 481617494@qq.com
 * @Date: 2024-02-28 16:36:18
 * @LastEditors: 陈晓飞 481617494@qq.com
 * @LastEditTime: 2024-03-06 17:14:01
 * @FilePath: /Bi-serve/router_handler/flowformreview.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const FlowFormReviewModel = require("../model/flowformreview");
const biResponse = require("../utils/biResponse")

// 获取审核流模版
exports.getFlowFormReviewList = async (req, res) => {
    const {form_id} = req.query;
    const reslut = await FlowFormReviewModel.findOne({
        where: {
            form_id: form_id,
        },
    });
    if (reslut) {
        return res.send(biResponse.success(reslut.dataValues.form_review));
    } else {
        return res.send(biResponse.serverError("审核流不存在"));
    }
};

// 新增审核流模版
exports.saveFlowFormReview = async (req, res) => {
    console.log("req=========>", req);
    // await FlowFormReviewModel.upsert({
    //     form_id: item.formId,
    //     form_review: item.reviewProcess,
    //   });
};

// 修改审核流模版
exports.updateFlowFormReview = async (req, res) => {
    const {form_id, data} = req.body;
    await FlowFormReviewModel.updateFlowFormReview(form_id, data);
    return res.send(biResponse.success(true));
};
