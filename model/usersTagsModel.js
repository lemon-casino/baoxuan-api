const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: null,
      field: "id"
    },
    tagCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "tag_code"
    },
    userId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "user_id"
    },
    isOut: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "is_out"
    },
    createTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "create_time"
    }
  };
  const options = {
    tableName: "users_tags",
    comment: "",
    indexes: []
  };
  const UsersTagsModel = sequelize.define("usersTagsModel", attributes, options);
  return UsersTagsModel;
};