const httpUtil = require("@/utils/httpUtil")
const bpmConst = require('../../const/bpmConst')
const defaultConst = require('../../const/development/defaultConst')
const credentialsReq = require('../dingDingReq/credentialsReq')
const fs = require('fs')
const FormData = require('form-data')
const commonReq = {}
commonReq.createProcessInstance = async (refreshToken, processDefinitionId, type, params) => {
    const url = `${bpmConst.host}${bpmConst.link.createProcessInstance}`
    let headers = bpmConst.headers
    const body = bpmConst.params.createProcessInstance
    body.refreshToken = refreshToken + ''
    body.processDefinitionId = processDefinitionId
    switch (type) {
        case defaultConst.SELF:
            for (let index in defaultConst.self_params) {
                body.variables[defaultConst.self_params[index]] = params[index]
            }
            break
        case defaultConst.IP:
            for (let index in defaultConst.ip_params) {
                body.variables[defaultConst.ip_params[index]] = params[index]
            }
            break
        case defaultConst.SUPPLIER:
            for (let index in defaultConst.supplier_params) {
                body.variables[defaultConst.supplier_params[index]] = params[index]
            }
            break
        case defaultConst.OPERATOR:
            for (let index in defaultConst.operator_params) {
                body.variables[defaultConst.operator_params[index]] = params[index]
            }
            break
        default:
            for (let index in defaultConst.project_params) {
                body.variables[defaultConst.project_params[index]] = params[index]
            }
    }
    let result = await httpUtil.post(url, body, headers)
    if (result?.code === 0) {
        return `${bpmConst.webHost}${bpmConst.webLink.instanceDetail}${result?.data}`
    }
    return false
}

commonReq.createJDProcess = async (refreshToken, processDefinitionId, variables,data) => {
    // console.log('开始发起流程')
    // console.log(variables)
    const url = `${bpmConst.webHost}${bpmConst.link.createProcessInstance}`
    let headers = {Authorization:'Bearer '+data,'Tenant-Id': 1}
    const body = bpmConst.params.createProcessInstance
    body.refreshToken = refreshToken
    body.processDefinitionId = processDefinitionId
    body.variables=variables
    console.log(url, body, headers)
    let result = await httpUtil.post(url, body, headers)
    // console.log(result)
    return false
}

commonReq.fileUpload = async (file) => {    
    let refresh_token = await credentialsReq.getBpmgAccessToken()
    const token = refresh_token.data.accessToken
    const url = `${bpmConst.webHost}${bpmConst.link.uploadFile}`
    const body = new FormData()
    body.append('file', fs.createReadStream(file.filepath), {
        filename: Math.random().toString(12).substr(2) + '-' + file.originalFilename
    })
    let headers = {
        Authorization:'Bearer ' + token, 
        'Tenant-Id': 1, 
        ...body.getHeaders()
    }
    let result = await httpUtil.post(url, body, headers)
    return result
}

module.exports = commonReq