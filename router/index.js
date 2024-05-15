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
    "/task": require("./taskRouter"),
    "/user-logs":  require("./userLogRouter"),
    "/market-data": require("./marketDataRouter"),
    "/download/:filename": require("./fileRouter"),
    "/tima/video": require("./videoRouter"),
    "/tima/workload": require("./Tm_Workload"),
    // ��Ƹ����
    "/hr/recruit": require("./Hr_Recruit"),
    "/dept": require("./departmentRouter"),
    "/depts": require("./departmentRouter")

}