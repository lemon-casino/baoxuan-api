const download = function (req, res) {
    console.log("req ================>", req);
    const filename = req.params.filename;
    const file = path.join(__dirname, "./file", filename);
    res.download(file);
}

module.exports = {
    download
}