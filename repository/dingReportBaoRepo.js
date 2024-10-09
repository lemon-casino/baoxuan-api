

const Sequelize = require("sequelize")
const sequelize = require('../model/init');
const {QueryTypes, Op,col,fn, literal} = require("sequelize");
const getdingDailyReport = require("../model/dingDailyReport")
const dingDailyReport = getdingDailyReport(sequelize)


//添加记录
async function     updateDingId(data) {
    //更新 updateDingId
    return dingDailyReport.update(data, {
        where: {
            code: data.code
        }
    });
}

async function findOrCreateDingId(data) {
    const where = {
        code: data.code
    };
    if (data.productAudits !== undefined) {
        where.productAudits = data.productAudits;
    }
    if (data.deferredDing !== undefined) {
        where.deferredDing = data.deferredDing;
    }

    const existingDing = await dingDailyReport.findOne({
        where,
        raw: true,
        logging:true
    });
    if (existingDing) {
        return {code:existingDing.code,carryOut:false};
    } else {
        // 创建新记录时不指定 id

        const newDing = await dingDailyReport.create({
            //忽略主键id
            code: data.code,
            productAudits: data.productAudits,
            deferredDing: data.deferredDing,
            DingId: data.DingId,
            formUuid:data.formUuid
        }, {
            attributes: {exclude: ["id" ]},
            raw: true // 返回纯对象而不是模型实例
        });

        return {code: newDing.dataValues.code,carryOut:true};
    }
}


module.exports = {
    updateDingId,
    findOrCreateDingId

}