// 多线程
const { parentPort, workerData } = require('worker_threads');

const data = workerData;
const summary = {};
data.forEach(({ id, value }) => {
  if (!summary[id]) {
    summary[id] = 0;
  }
  summary[id] += value;
});

// 将结果发送回主线程
parentPort.postMessage(summary);




// // 单线程
// const { parentPort, workerData } = require("worker_threads");
// const ExcelJS = require("exceljs");

// // 工作线程
// (async () => {
//   const workbook = new ExcelJS.Workbook();
//   await workbook.xlsx.readFile(workerData.filePath);
//   const worksheet = workbook.getWorksheet(1);

//   const rows = worksheet.getRows(2, worksheet.rowCount - 1);
//   const summary = {};

//   rows.forEach((row) => {
//     const id = row.getCell(1).value;
//     const value = parseFloat(row.getCell(2).value);

//     if (!summary[id]) {
//       summary[id] = 0;
//     }
//     summary[id] += value;
//   });

//   // 将结果发送回主线程
//   parentPort.postMessage(summary);
// })();
