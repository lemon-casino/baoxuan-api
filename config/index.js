let env = process.env.NODE_ENV
if (!env) {
    env = "dev"
    // console.error("没有配置启动的环境参数：cross-env NODE_ENV=(dev|prod)")
    // return;
}
let configs = null
try {
    configs = require(`./${env}`)
} catch (e) {
    const fullPath = `${__dirname}/${env}.js`
    console.error(`文件不存在：${fullPath}`)
    return;
}

module.exports = configs
