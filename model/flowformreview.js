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
    // 然后,我们进行一些调用以将此事务作为参数传递:
    // 添加流程表单
    const flow_review = await FlowFormReviewModel.upsert(data);
    // 我们提交事务.
    t.commit();
    return flow.dataValues;
  } catch (e) {
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
module.exports = FlowFormReviewModel;
