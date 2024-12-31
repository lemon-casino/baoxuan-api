const downloadInfoRepo = require('../repository/downloadInfoRepo')
const downloadInfoService = {}

downloadInfoService.insert = async (user_id, name, path, params) => {
    const result = await downloadInfoRepo.insert(user_id, name, path, JSON.stringify(params))
    return result
}

downloadInfoService.update = async (user_id, name, status) => {
    const result = await downloadInfoRepo.updateStatus(status, user_id, name)
    return result
}

downloadInfoService.getInfo = async (user_id) => {
    const result = await downloadInfoRepo.getInfo(user_id)
    return result
}

module.exports = downloadInfoService