module.exports = {
    "/user": require("./user"),
    "/user/role": require("./role"),
    "/user/menu":  require("./menu"),
    "/user/myInfo":  require("./userinfo"),
    "/dict":  require("./dict"),
    "/dict/item": require("./dict-items"),
    "/user/script": require("./script"),
    "/user/flowpath": require("./flow"),
    "/flow": require("./flowRouter"),
    "/user/flowform":  require("./flowform"),
    "/user/flowformreview": require("./flow-form-review"),
    "/util": require("./util"),
    "/form":  require("./formRouter"),
    "/single-item":  require("./singleItemRouter"),
    "/link-statistic": require("./linkStatisticRouter"),
    "/user-logs":  require("./userLogRouter"),
    "/download/:filename": require("./fileRouter")
}