// 导入 express 模块
const express = require("express");
const path = require("path");
const morgan = require('morgan');
const serverConfig = require('./config/index').serverConfig
// 创建 express 的服务器实例
const app = express();
if (process.env.NODE_ENV === "dev") {
    const swagger = require("./utils/swagger");
    swagger(app);
}
// 加载全局的基础信息： users、departments、 usersOfDepartments
const global = require("./global/index")
global.initial()

// 导入日志配置文件
const {logger, stream} = require("./utils/log"); // 引入log.js
// 导入钉钉机器人模块
// require("./config/ddbot");
// 导入 cors 中间件
const cors = require("cors");
// 将 cors 注册为全局中间件
app.use(cors());
// 导入验证规则中间件
const joi = require("joi");

const bodyParser = require("body-parser");
app.use(
    bodyParser.urlencoded({
        limit: '50mb',
        extended: true,
    })
);
app.use(express.json({limit: '50mb'}));
// 使用morgan记录访问日志
app.use(morgan("combined", {stream}));

// 全局错误处理器
app.use((err, req, res, next) => {
    logger.error("Unhandled error:", err);
    res.status(500).send("Something broke!");
});
app.use(bodyParser.json());
// 开启静态资源的访问
app.use("/public/avatar", express.static("./public/avatar"));
// 导入配置文件
const tokenConfig = require("./config/index").tokenConfig;

// 解析 token 的中间件
const expressJWT = require("express-jwt");
// 使用 .unless({ path: [/^\/api\//] }) 指定哪些接口不需要进行 Token 的身份认证
app.use(
    expressJWT({secret: tokenConfig.jwtSecretKey}).unless({
        path: [
            "/user/login",
            "/user/checkCode",
            "/user/refreshToken",
            "/user/addUser",
            "/user/script/summaryscript",
            "/util/getddUserList",
            "/util/getLiuChengList",
            "/util/getDpList",
            "/util/getDpInfo",
            "/user/flowpath/getliuchenglist",
            "/user/flowpath/getoaallprocess",
            "/user/flowpath/getyidaprocess",
            /^\/download\/.*/,
        ],
    })
);
require("./scripts/scheduledTask");
// 导入并注册用户路由模块
const userRouter = require("./router/user");
app.use("/user", userRouter);
// 导入并注册用户角色模块
const roleRouter = require("./router/role");
app.use("/user/role", roleRouter);
// 导入并注册用户菜单模块
const menuRouter = require("./router/menu");
app.use("/user/menu", menuRouter);
// 导入用户信息路由模块
const userinfoRouter = require("./router/userinfo");
app.use("/user/myInfo", userinfoRouter);
// 导入字典路由模块
const dictRouter = require("./router/dict");
app.use("/dict", dictRouter);
// 导入字典项路由模块
const dictItemRouter = require("./router/dict-items");
app.use("/dict/item", dictItemRouter);
// 导入脚本路由模块
const scriptRouter = require("./router/script");
app.use("/user/script", scriptRouter);
// 导入流程路由模块
const flowPathRouter = require("./router/flow");
app.use("/user/flowpath", flowPathRouter);
const flowRouter = require("./router/flowRouter")
app.use("/flow", flowRouter);
// 导入流程设置模块
const flowformRouter = require("./router/flowform");
app.use("/user/flowform", flowformRouter);
// 导入审核流模版模块
const flowformreviewRouter = require("./router/flow-form-review");
app.use("/user/flowformreview", flowformreviewRouter);


const formRouter = require("./router/formRouter")
app.use("/form", formRouter)


// 导入工具路由
const utilRouter = require("./router/util");
app.use("/util", utilRouter);
// 定义错误级别的中间件
app.use((err, req, res, next) => {
    // 数据验证失败
    if (err instanceof joi.ValidationError)
        return res.send({code: 1, message: err.message});
    // token解析失败
    if (err.name === "UnauthorizedError")
        return res.send({code: 401, message: "身份认证失败"});
    // 未知错误
    return res.send({code: 500, message: err.message});
});
// 下载文件
app.get("/download/:filename", function (req, res) {
    console.log("req ================>", req);
    const filename = req.params.filename;
    const file = path.join(__dirname, "./file", filename);
    res.download(file);
});
// 调用 app.listen 方法，指定端口号并启动web服务器
app.listen(serverConfig.port, function () {
    console.log(`Bi node本地启动地址 http://127.0.0.1:${serverConfig.port}`);
});
