const Sequelize = require("sequelize");
const moment = require("moment");
const sequelize = require("./init");

const FlowFormReviewModel = sequelize.define("flowformsreview", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  form_id: {
    type: Sequelize.STRING(255),
  },
  modifiedTime: {
    type: Sequelize.STRING(255),
  },
  form_review: {
    type: Sequelize.JSON,
    defaultValue: 1,
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

// 添加流程审核流数据
FlowFormReviewModel.addFlowFormReview = async function (data) {
  // 首先,我们开始一个事务并将其保存到变量中
  const t = await sequelize.transaction();
  try {
    for (const item of data) {
      const depsend = {
        form_id: item.formId,
        modifiedTime: item.modifiedTime,
        form_review: item.reviewProcess,
      }
      let flow = await FlowFormReviewModel.findOne({
        where: { form_id: depsend.form_id },
      });
      // // 如果存在该记录
      if (flow) {
        // 如果 modifiedTime 字段不一致，更新 form_review 数据
        if (flow.modifiedTime != depsend.modifiedTime) {
          console.log(depsend)
          await FlowFormReviewModel.update(depsend, {
            where: { form_id: depsend.form_id }
          });
        }
        // 如果不存在该记录，则新增
      } else {
        flow = await FlowFormReviewModel.create(depsend);
      }
    }
    // 我们提交事务.
    t.commit();
    return true;
  } catch (e) {
    console.log(e)
    // 如果执行到达此行,则抛出错误.
    // 我们回滚事务.
    t.rollback();
    return e.message;
  }
};
// 查询流程审核流数据
FlowFormReviewModel.getFlowFormReviewList = async function (form_id) {
  const flow = await FlowFormReviewModel.findOne({
    where: {
      form_id,
    },
  });
  return flow.dataValues;
};
// 修改流程审核流数据
FlowFormReviewModel.updateFlowFormReview = async function (form_id, data) {
  const flow = await FlowFormReviewModel.update({
    form_review: data
  }, {
    where: {
      form_id,
    },
  });
  return flow;
};
module.exports = FlowFormReviewModel;
