const getDingTalkAccessTokenHeader = (token) => {
    return {"x-acs-dingtalk-access-token": token}
}

module.exports = {
    getDingTalkAccessTokenHeader
}