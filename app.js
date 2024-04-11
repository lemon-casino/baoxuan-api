const express = require("express");
require("express-async-errors")
const morgan = require('morgan');
const {errorMessages, errorCodes} = require("./const/errorConst")
const {logger, stream} = require("./utils/log")

require("./scripts/scheduledTask");
const serverConfig = require('./config/index').serverConfig
const app = express();

// 加载全局的基础信息： users、departments、 usersOfDepartments
const global = require("./global/index")
global.initial()
const cors = require("cors");
app.use(cors());

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
app.use(bodyParser.json());

// 开启静态资源的访问
app.use("/public/avatar", express.static("./public/avatar"));
// 导入配置文件
const tokenConfig = require("./config/index").tokenConfig;
const expressJWT = require("express-jwt");
app.use(
    expressJWT({secret: tokenConfig.jwtSecretKey}).unless({
        path: require("./const/unauthenticatedUrlConst"),
    })
);

const routerMap = require("./router/index")
for (const key of Object.keys(routerMap)) {
    app.use(key, routerMap[key]);
}

app.use((err, req, res, next) => {
    logger.error(err.message)
    if (err.name === "UnauthorizedError")
        return res.send({code: 401, message: errorMessages.unauthorized});
    if (err.code && err.message) {
        return res.send({code: err.code, message: err.message});
    }
    return res.send({code: errorCodes.commonError, message: errorMessages.common});
});

app.listen(serverConfig.port, function () {
    console.log(`Bi node本地启动地址 http://127.0.0.1:${serverConfig.port}`);
});
