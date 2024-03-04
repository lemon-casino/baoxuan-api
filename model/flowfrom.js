const Sequelize = require("sequelize");
const moment = require("moment");
const sequelize = require("./init");

// 定义表的模型
const tools = require("../utils/tools");

const FlowFormModel = sequelize.define("flowfrom", {
  flow_form_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  flow_form_name: {
    type: Sequelize.STRING(255),
  },
  status: {
    type: Sequelize.INTEGER,
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

// 添加流程表单
FlowFormModel.addFlowForm = async function (data) {
  // 首先,我们开始一个事务并将其保存到变量中
  const t = await sequelize.transaction();
  try {
    // 然后,我们进行一些调用以将此事务作为参数传递:
    // 添加流程表单
    const flow = await UsersModel.upsert(data);
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

//获取所有流程表单
FlowFormModel.getFlowFormList = async function (data) {
  const flow = await FlowFormModel.findAll({
    where: data,
  });
  return flow;
};

// 更新流程表单
FlowFormModel.updateFlowForm = async function (data) {
  const flow = await FlowFormModel.update(data, {
    where: {
      flow_form_id: data.form_id,
    },
  });
  return flow;
};

module.exports = FlowFormModel;
