const departmentService = require('../service/departmentService')
const biResponse = require("../utils/biResponse")
const joiUtil = require("../utils/joiUtil")

const getDeptUsers = async (req, res, next) => {
    try {
        const {deptId} = req.params
        joiUtil.validate({deptId: {value: deptId, schema: joiUtil.commonJoiSchemas.required}})
        const deptUsers = await departmentService.getUsersOfDepartment(deptId)
        return res.send(biResponse.success(deptUsers))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getDeptUsers
}