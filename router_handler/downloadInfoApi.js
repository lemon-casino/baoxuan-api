const joiUtil = require("../utils/joiUtil")
const biResponse = require("../utils/biResponse")
const downloadInfoService = require('../service/downloadInfoService')
const fs = require('fs')

const getInfo = async (req, res, next) => {
    try {
        const result = await downloadInfoService.getInfo(req.user.id)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const exportFile = async (req, res, next) => {
    try {
        const {path} = req.query
        joiUtil.validate({
            path: {value: path, schema: joiUtil.commonJoiSchemas.strRequired},
        })
        const buffer = fs.readFileSync(path)
        res.setHeader('Content-Disposition', `attachment; filename="file.xlsx"`)
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')        
        return res.send(buffer)
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getInfo,
    exportFile
}