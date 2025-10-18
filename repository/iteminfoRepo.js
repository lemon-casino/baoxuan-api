const getAItemInfo = require("../model/ItemInfoModel");
const {QueryTypes, Op} = require("sequelize");
const sequelize = require("@/model/init");
const ItemInfoModel = getAItemInfo(sequelize)

// 更新 Cumulative 字段


module.exports = {}