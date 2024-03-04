const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");
const ExcelJS = require("exceljs");
const path = require("path");
const fileName = "maofahuo";
const jsrow = 2;
const filePath = path.resolve(__dirname, `../file/excel/${fileName}.xlsx`);
// 单个excel汇总脚本处理
exports.getSummaryScript = async (req, res, next) => {
  console.time("Processing Time");
  // 读取整个Excel文件到内存中
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);

  // 将数据切分成多个块，并创建工作线程
  const rows = worksheet.getRows(2, worksheet.rowCount - 1); // 假设第一行是标题
  const chunkSize = Math.ceil(rows.length / 6);
  const promises = [];

  for (let i = 0; i < 4; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    const chunk = rows.slice(start, end);

    const worker = new Worker(path.join(__dirname, "../utils/worker.js"), {
      workerData: chunk.map((row) => ({
        id: row.getCell(1).value,
        value: parseFloat(row.getCell(jsrow).value),
      })),
    });
    promises.push(
      new Promise((resolve, reject) => {
        worker.on("message", resolve);
        worker.on("error", reject);
        worker.on("exit", (code) => {
          if (code !== 0)
            reject(new Error(`Worker stopped with exit code ${code}`));
        });
      })
    );
  }

  // 收集工作线程的结果并合并它们
  const results = await Promise.all(promises);

  let allResults = {};
  results.forEach((result) => {
    Object.keys(result).forEach((id) => {
      if (!allResults[id]) {
        allResults[id] = 0;
      }
      allResults[id] += result[id];
    });
  });

  // 创建新的 Excel 文件并写入结果
  const newWorkbook = new ExcelJS.Workbook();
  const newWorksheet = newWorkbook.addWorksheet("Summary");

  newWorksheet.columns = [
    { header: "Id", key: "id", width: 10 },
    { header: "Total", key: "total", width: 25 },
  ];

  Object.entries(allResults).forEach(([id, total]) => {
    newWorksheet.addRow({ id, total });
  });

  const outputFile = path.resolve(__dirname, `../file/excel/${fileName}1.xlsx`);
  await newWorkbook.xlsx.writeFile(outputFile);
  console.timeEnd("Processing Time");
  return res.send({
    code: 200,
    message: "获取成功",
  });
};

// 单线程单个个excel汇总脚本处理
exports.getSummaryScriptds = async (req, res, next) => {
  console.time("总时长");
  const filePaths = [
    path.resolve(__dirname, "../file/excel/maofahuo1.xlsx"),
    path.resolve(__dirname, "../file/excel/maotuikuan1.xlsx"),
  ];

  const outputSame = path.resolve(__dirname, "../file/excel/output_same.xlsx");
  const outputDiff = path.resolve(__dirname, "../file/excel/output_diff.xlsx");
  const promises = filePaths.map((filePath, index) => {
    const worker = new Worker(path.join(__dirname, "../utils/worker.js"), {
      workerData: {
        filePath,
        index: index + 1,
      },
    });

    return new Promise((resolve, reject) => {
      worker.on("message", resolve);
      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  });

  // 收集工作线程的结果
  let results = await Promise.all(promises);

  // 比对结果并写入新的 Excel 文件
  let workbookSame = new ExcelJS.Workbook();
  let worksheetSame = workbookSame.addWorksheet("Same");
  worksheetSame.columns = [
    { header: "Id", key: "id", width: 10 },
    { header: "Total", key: "total", width: 25 },
  ];

  let workbookDiff = new ExcelJS.Workbook();
  let worksheetDiff = workbookDiff.addWorksheet("Diff");
  worksheetDiff.columns = [
    { header: "Id", key: "id", width: 10 },
    { header: "Total1", key: "total1", width: 25 },
    { header: "Total2", key: "total2", width: 25 },
  ];

  Object.keys(results[0]).forEach((id) => {
    const total1 = results[0][id];
    const total2 = results[1][id];

    if (total2 && total1 === total2) {
      worksheetSame.addRow({ id, total: total1 });
    }

    if (total2 && total1 !== total2) {
      worksheetDiff.addRow({ id, total1, total2 });
    }
  });

  await Promise.all([
    workbookSame.xlsx.writeFile(outputSame),
    workbookDiff.xlsx.writeFile(outputDiff),
  ]);
  console.timeEnd("总时长");
};

// 多线程多个excel汇总脚本处理
exports.getSummaryScripts = async (req, res, next) => {
  console.time("结束时间");
  const filePaths = [
    path.resolve(__dirname, "../file/excel/maofahuo1.xlsx"),
    path.resolve(__dirname, "../file/excel/maotuikuan1.xlsx"),
  ];

  const outputSame = path.resolve(__dirname, "../file/excel/output_same.xlsx");
  const outputDiff = path.resolve(__dirname, "../file/excel/output_diff.xlsx");

  const results = await Promise.all(
    filePaths.map(async (filePath) => {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1);

      // 将数据切分成多个块，并创建工作线程
      const rows = worksheet.getRows(2, worksheet.rowCount - 1);
      const chunkSize = Math.ceil(rows.length / 2); // 这里设定为10个线程
      const promises = [];

      for (let i = 0; i < 10; i++) {
        const start = i * chunkSize;
        const end = start + chunkSize;
        const chunk = rows.slice(start, end);

        const worker = new Worker(path.join(__dirname, "../utils/worker.js"), {
          workerData: {
            chunk: chunk.map((row) => ({
              id: row.getCell(1).value,
              value: parseFloat(row.getCell(2).value),
            })),
            index: i + 1,
          },
        });

        promises.push(
          new Promise((resolve, reject) => {
            worker.on("message", resolve);
            worker.on("error", reject);
            worker.on("exit", (code) => {
              if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
            });
          })
        );
      }

      // 收集工作线程的结果并合并它们
      const partialResults = await Promise.all(promises);

      let allResults = {};
      partialResults.forEach((result) => {
        Object.keys(result).forEach((id) => {
          if (!allResults[id]) {
            allResults[id] = 0;
          }
          allResults[id] += result[id];
        });
      });

      return allResults;
    })
  );

  // 比对结果并写入新的 Excel 文件
  let workbookSame = new ExcelJS.Workbook();
  let worksheetSame = workbookSame.addWorksheet("Same");
  worksheetSame.columns = [
    { header: "Id", key: "id", width: 10 },
    { header: "Total", key: "total", width: 25 },
  ];

  let workbookDiff = new ExcelJS.Workbook();
  let worksheetDiff = workbookDiff.addWorksheet("Diff");
  worksheetDiff.columns = [
    { header: "Id", key: "id", width: 10 },
    { header: "Total1", key: "total1", width: 25 },
    { header: "Total2", key: "total2", width: 25 },
  ];

  Object.keys(results[0]).forEach((id) => {
    const total1 = results[0][id];
    const total2 = results[1][id];

    if (total2 && total1 === total2) {
      worksheetSame.addRow({ id, total: total1 });
    }

    if (total2 && total1 !== total2) {
      worksheetDiff.addRow({ id, total1, total2 });
    }
  });

  await Promise.all([
    workbookSame.xlsx.writeFile(outputSame),
    workbookDiff.xlsx.writeFile(outputDiff),
  ]);
  console.timeEnd("结束时间");
};

// 人事考勤脚本处理
exports.getrs = async (req, res, next) => {
  const filePaths = path.resolve(__dirname, "../file/excel/kq.xlsx")
  console.log('filePaths=========>', filePaths)
};

// 获取所有脚本
exports.getListScript = (req, res, next) => {
  return res.send({
    code: 200,
    message: "获取成功",
  });
};

// excel脚本处理
exports.getExcelScript = (req, res, next) => {
  return res.send({
    code: 200,
    message: "获取成功",
  });
};
