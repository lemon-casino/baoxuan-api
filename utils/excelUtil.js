const XLSX = require("xlsx");

const createExcel = (data, fileName) => {
    const wb = XLSX.utils.book_new();
    data.forEach((item, index) => {
        const ws_name = `${item.title}_${index}`;
        const headers = item.approveData;
        const ws_data = [headers];
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        XLSX.utils.book_append_sheet(wb, ws, ws_name);
    });
    XLSX.writeFile(wb, fileName);
};

module.exports = {
    createExcel
}