const Sequelize = require("sequelize")
const sequelize = require('../model/init');
const moment = require("moment");

const getdianshangOperationAttributeModel = require("../model/dianshangOperationAttributeModel");
const {QueryTypes, Op,col,fn} = require("sequelize");
const OperationAttributeModel = getdianshangOperationAttributeModel(sequelize)



const link_properties = async (skuId) => {
   const  causality=await  OperationAttributeModel.findOne(
        {
            attributes:['userDef1'],
            where:{
                skuId,
                platform:'自营',
                deptId:'902897720'
            },
            raw:true,
            loading: true
        }
    )
    return causality.userDef1===null?'':causality.userDef1;
}
module.exports = {

    link_properties
}