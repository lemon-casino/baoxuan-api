const {
  DataTypes
} = require('sequelize');
const  cloudStockpileDB= require('./dbConnections');
module.exports = () => {
  const attributes = {
    fileid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: true,
      comment: null,
      field: "fileid"
    },
    storage: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: "0",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "storage"
    },
    path: {
      type: DataTypes.STRING(4000),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "path"
    },
    pathHash: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: "",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "path_hash"
    },
    parent: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: "0",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "parent"
    },
    name: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "name"
    },
    mimetype: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: "0",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "mimetype"
    },
    mimepart: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: "0",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "mimepart"
    },
    size: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: "0",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "size"
    },
    mtime: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: "0",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "mtime"
    },
    storageMtime: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: "0",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "storage_mtime"
    },
    encrypted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: "0",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "encrypted"
    },
    unencryptedSize: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: "0",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "unencrypted_size"
    },
    etag: {
      type: DataTypes.STRING(40),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "etag"
    },
    permissions: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "permissions"
    },
    checksum: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "checksum"
    }
  };
  const options = {
    tableName: "oc_filecache",
    comment: "",
    indexes: [{
      name: "fs_storage_path_hash",
      unique: true,
      type: "BTREE",
      fields: ["storage", "path_hash"]
    }, {
      name: "fs_parent_name_hash",
      unique: false,
      type: "BTREE",
      fields: ["parent", "name"]
    }, {
      name: "fs_storage_mimetype",
      unique: false,
      type: "BTREE",
      fields: ["storage", "mimetype"]
    }, {
      name: "fs_storage_mimepart",
      unique: false,
      type: "BTREE",
      fields: ["storage", "mimepart"]
    }, {
      name: "fs_storage_size",
      unique: false,
      type: "BTREE",
      fields: ["storage", "size", "fileid"]
    }, {
      name: "fs_id_storage_size",
      unique: false,
      type: "BTREE",
      fields: ["fileid", "storage", "size"]
    }, {
      name: "fs_parent",
      unique: false,
      type: "BTREE",
      fields: ["parent"]
    }, {
      name: "fs_mtime",
      unique: false,
      type: "BTREE",
      fields: ["mtime"]
    }, {
      name: "fs_size",
      unique: false,
      type: "BTREE",
      fields: ["size"]
    }, {
      name: "fs_storage_path_prefix",
      unique: false,
      type: "BTREE",
      fields: ["storage", "path"]
    }]
  };
  return cloudStockpileDB.define("ocFilecacheModel", attributes, options);
};