const nConf = require("nconf")
nConf.env()

module.exports = {
    appKey: nConf.get("JST_APP_KEY"),
    appSecret: nConf.get("JST_APP_SECRET"),
    host: nConf.get("JST_HOST"),
}
