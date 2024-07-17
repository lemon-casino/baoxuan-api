const supplierService = require('@/service/supplierService')
const biResponse = require("@/utils/biResponse")
const joiUtil = require("@/utils/joiUtil")
//查询供应商列表
const getPagingList = async (req, res, next) => {
    try {
        const {
            pageIndex,
            pageSize} = req.body
        //校验请求参数
        joiUtil.validate({
            pageIndex,pageSize
        })

        const queryData = {
            startDate:req.body.startDate,
            endDate:req.body.endDate,
            companyName:req.body.companyName,
            phone:req.body.phone,
            classification:req.body.classification,
            usersName:req.body.usersName,
            usersNames:req.body.usersNames,
        }
        const supplierDatas = await supplierService.getPagingList(parseInt(pageIndex), parseInt(pageSize),
            queryData)
        return res.send(biResponse.success(supplierDatas))
    } catch (e) {
        console.log(e)
        next(e)
    }
}

module.exports = {
    getPagingList
}