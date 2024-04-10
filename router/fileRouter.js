const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    const filename = req.params.filename;
    const file = path.join(__dirname, "./file", filename);
    res.download(file);
})

module.exports = router

