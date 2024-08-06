const httpUtil = require("./httpUtil")
const dingDingReqUtil = require("@/core/dingDingReq/dingDingReqUtil")

const loopGet = async (url, params, token, data) => {
    const {result} = await httpUtil.get(url, params, dingDingReqUtil.getDingTalkAccessTokenHeader(token))
    data = data.concat(result.data)
    if (result.totalCount > result.currentPage * params.pageSize) {
        params.pageNumber = params.pageNumber + 1
        return await loopGet(url, params, token, data)
    }
    return data
}
module.exports = {
    loopGet
}