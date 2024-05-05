let env = process.env.NODE_ENV
if (!env) {
    env = "dev"
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
