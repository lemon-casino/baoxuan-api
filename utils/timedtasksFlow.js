const schedule = require("node-schedule");
const dd = require("../utils/dingding");
const fs = require
const redis = require("redis");

// // 创建一个redis客户端实例
// const client = redis.createClient();
// (async () => {
//   await client.connect();
// })();

// // 获取流程数据

// const getDepList = () => {
//     return new Promise((resolve, reject) => {
//       client.get("dep_List", function (err, reply) {
//         if (err) reject(err);
//         resolve(JSON.parse(reply));
//       });
//     });
//   };