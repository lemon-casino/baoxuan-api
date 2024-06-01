const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const tmall_link = require("../router_handler/tmall_link");

router.get("/table", tmall_link.get_user_table)
router.put("/table", tmall_link.put_user_table)
//排序功能
router.use(bodyParser.json());
router.post("/table/sort", tmall_link.sort_user_table)
router.put("/table/tmall", tmall_link.tmall_user_table)
module.exports = router;