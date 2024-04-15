const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    workingDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: "工作日",
      field: "working_date"
    }
  };
  const options = {
    tableName: "working_day",
    comment: "",
    indexes: []
  };
  const WorkingDayModel = sequelize.define("workingDayModel", attributes, options);
  return WorkingDayModel;
};