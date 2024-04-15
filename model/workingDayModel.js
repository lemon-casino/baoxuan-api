const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: true,
      comment: null,
      field: "id"
    },
    workingDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
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