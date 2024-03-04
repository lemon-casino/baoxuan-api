const Sequelize = require('sequelize')
// 建立连接
const sequelize = new Sequelize(
  // 以下内容根据自身修改
  'Bi_serve', // 数据库名
  'bqh', // 连接用户名
  'bqh2024^', // 密码
  {
    dialect: 'mysql', // 数据库类型
    host: 'rm-2zeomo30f6062u9r37o.mysql.rds.aliyuncs.com', // ip
    port: 3306, // 端口
    define: {
      timestamps: false // 不自动创建时间
    },
    timezone: '+08:00' // 东八时区
  }
)

module.exports = sequelize
