module.exports = {
  jwtSecretKey: 'have a lucky day!',
  jwtRefrechSecretKey: 'have a nick day!',
  secretKeyExpire: 60 * 60, // 设置token 的有效时间为1小时
  refreshSerectKeyExpire: 60 * 60 * 24 * 2, // 设置refreshToken的有效时间为2天
  port: 6379,
  url: '127.0.0.1',
  password: 'myredis123456',
  ddSuiteKey:""
}
