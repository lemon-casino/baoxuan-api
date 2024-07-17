const supplierRepo = require("@/repository/supplierRepo")
const dateUtil = require("@/utils/dateUtil")
const {fn, Op} = require('sequelize');
const sequelize = require('@/model/init');

const getPagingList = async (pageIndex,pageSize,
                             queryData) => {

    const where = {}
    if(queryData.startDate){
        where.create_time= {$between:[dateUtil.convertToStr(queryData.startDate),dateUtil.convertToStr(queryData.endDate)]}
    }

    if(queryData.companyName){ where.company_name= { [Op.like]: `%${queryData.companyName}%`}; }
    if(queryData.phone){ where.phone= { [Op.like]: `%${queryData.phone}%`}; }
    if(queryData.classification){ where.classification= { [Op.like]: `%${queryData.classification}%`}; }
    if(queryData.usersNames != undefined && queryData.usersNames.length>0){ where.users_name= { [Op.in]: queryData.usersNames}; }

    const order = [["create_time", "asc"]]
    return supplierRepo.getPagingList(pageIndex,pageSize,where,order)
}

module.exports = {
    getPagingList
}