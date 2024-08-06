const httpUtil = require("@/utils/httpUtil");

const getProcessVersions = async (processCode, cookies) => {
    return (await getPagingProcessVersions(1, 100, processCode, cookies))
}

const getPagingProcessVersions = async (page, pageSize, processCode, cookies) => {
    let processVersions = []
    const url = "https://t8sk7d.aliwork.com/alibaba/web/APP_BXS79QCC8MY5ZV0EZZ07/query/process/pageProcessVersion.json"
    const params = {
        processCode: processCode,
        appType: "APP_BXS79QCC8MY5ZV0EZZ07",
        status: "",
        pageIndex: page,
        pageSize: pageSize,
        orderByCreateTime: "desc"
    }
    
    const headers = {
        "cookie": cookies,
        "Referer": `https://t8sk7d.aliwork.com/dingtalk/web/APP_BXS79QCC8MY5ZV0EZZ07/design/newDesigner?processCode=${processCode}`
    }
    
    const result = await httpUtil.get(url, params, headers)
    
    const pagingData = result.content
    if ("data" in pagingData && "totalCount" in pagingData) {
        const {data, totalCount} = pagingData
        processVersions = processVersions.concat(data)
        
        const hasMore = totalCount > page * pageSize + data.length
        if (hasMore) {
            const currPageData = await getProcessVersions(page + 1, pageSize, processCode, cookies)
            processVersions = processVersions.concat(currPageData)
        }
    }
    return processVersions
}

module.exports = {
    getProcessVersions
}